import Phaser from 'phaser';
import { HdrGlowLayer } from './hdrGlowLayer';
import { coreBounds, glowBounds, occlusionFade, overlapFraction, pickHoles, type GlowSpec, type Occluder } from './glowMath';
import { watchHdrGlow } from './hdrSupport';

/** A glow before the words and panels in front of it are taken into account. */
export type GlowBody = Omit<GlowSpec, 'fade' | 'coreFade' | 'holes'> & { fade?: number };

/**
 * A scene's HDR sun and moon. Does nothing at all until the screen and the
 * browser are known to show HDR and the player has it on; follows the
 * scene's camera fades, and hides while the scene is paused, asleep or gone.
 */
export class SceneGlows {
  private layer: HdrGlowLayer | undefined;
  private readonly unwatch: () => void;
  private suspended = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.unwatch = watchHdrGlow(gpu => {
      this.layer?.destroy();
      this.layer = gpu && scene.game.canvas ? new HdrGlowLayer(gpu, scene.game.canvas) : undefined;
    });
    const hide = () => {
      this.suspended = true;
      this.layer?.update([]);
    };
    const show = () => {
      this.suspended = false;
    };
    const events = scene.events;
    events.on(Phaser.Scenes.Events.PAUSE, hide);
    events.on(Phaser.Scenes.Events.SLEEP, hide);
    events.on(Phaser.Scenes.Events.RESUME, show);
    events.on(Phaser.Scenes.Events.WAKE, show);
    events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      events.off(Phaser.Scenes.Events.PAUSE, hide);
      events.off(Phaser.Scenes.Events.SLEEP, hide);
      events.off(Phaser.Scenes.Events.RESUME, show);
      events.off(Phaser.Scenes.Events.WAKE, show);
      this.unwatch();
      this.layer?.destroy();
      this.layer = undefined;
    });
  }

  /** True while there is an HDR layer to draw into; scenes can skip the work otherwise. */
  get active(): boolean {
    return this.layer !== undefined && !this.suspended;
  }

  /** Shows these bodies this frame, dimmed by what stands in front of them. */
  update(bodies: readonly GlowBody[], occluders: readonly Occluder[]): void {
    if (!this.layer || this.suspended) return;
    const visible = 1 - fadeCover(this.scene.cameras.main.fadeEffect);
    this.layer.update(bodies.map(body => {
      return {
        ...body,
        fade: (body.fade ?? 1) * visible,
        coreFade: occlusionFade(coreBounds(body), occluders),
        holes: pickHoles(glowBounds(body), occluders),
      };
    }));
  }
}

/**
 * The words, buttons and filled panels of a scene that lie over `area`, as
 * occluders: text is opaque (solid when it has a box behind it), a
 * rectangle as opaque as its fill. Objects that cover most of the screen are
 * washes over the whole scene, not in front of the sky, and are left out.
 */
export function sceneOccluders(scene: Phaser.Scene, area: { x: number; y: number; width: number; height: number }): Occluder[] {
  const found: Occluder[] = [];
  const screen = scene.scale.width * scene.scale.height;
  const visit = (objects: readonly Phaser.GameObjects.GameObject[], parentAlpha: number) => {
    for (const object of objects) {
      if (object instanceof Phaser.GameObjects.Container) {
        if (object.visible && object.alpha > 0) visit(object.list, parentAlpha * object.alpha);
        continue;
      }
      const kind = occluderKind(object);
      const opacity = kind.opacity * parentAlpha;
      if (opacity < 0.02) continue;
      const bounds = (object as Phaser.GameObjects.Text).getBounds();
      if (bounds.width * bounds.height > screen * 0.5) continue;
      const rect = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
      if (overlapFraction(area, rect) > 0) found.push({ ...rect, opacity, solid: kind.solid });
    }
  };
  visit(scene.children.list, 1);
  return found;
}

/** How much of the view a camera fade covers, as Phaser's own `Fade` works it out. */
function fadeCover(fade: Phaser.Cameras.Scene2D.Effects.Fade): number {
  if (fade.isRunning) return fade.direction ? fade.progress : 1 - fade.progress;
  return fade.isComplete && fade.direction ? 1 : 0;
}

function occluderKind(object: Phaser.GameObjects.GameObject): { opacity: number; solid: boolean } {
  if (object instanceof Phaser.GameObjects.Text) {
    const boxed = Boolean(object.style.backgroundColor);
    return { opacity: object.visible ? object.alpha : 0, solid: boxed };
  }
  if (object instanceof Phaser.GameObjects.Rectangle) {
    return { opacity: object.visible && object.isFilled ? object.alpha * object.fillAlpha : 0, solid: true };
  }
  return { opacity: 0, solid: false };
}
