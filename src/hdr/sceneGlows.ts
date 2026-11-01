import Phaser from 'phaser';
import { HdrGlowLayer } from './hdrGlowLayer';
import { glowBounds, overlapFraction, smoothstep, type GlowSpec, type Occluder } from './glowMath';

/** The glow eases in over this long when it first shows. */
const FADE_IN_MS = 1000;
import { watchHdrGlow } from './hdrSupport';

/** A glow before the words and panels in front of it are taken into account. */
export type GlowBody = Omit<GlowSpec, 'fade' | 'occluders'> & { fade?: number };

/**
 * A scene's HDR sun and moon. Does nothing at all until the screen and the
 * browser are known to show HDR and the player has it on; follows the
 * scene's camera fades, and hides while the scene is paused, asleep or gone.
 */
export class SceneGlows {
  private layer: HdrGlowLayer | undefined;
  private readonly unwatch: () => void;
  private suspended = false;
  /** When the HDR layer appeared, so the glow fades in rather than switching on in a frame. */
  private shownAt = 0;

  constructor(private readonly scene: Phaser.Scene) {
    this.unwatch = watchHdrGlow(gpu => {
      this.layer?.destroy();
      this.layer = gpu && scene.game.canvas ? new HdrGlowLayer(gpu, scene.game.canvas) : undefined;
      this.shownAt = performance.now();
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
    const fadingIn = smoothstep(0, FADE_IN_MS, performance.now() - this.shownAt);
    const visible = (1 - fadeCover(this.scene.cameras.main.fadeEffect)) * fadingIn;
    this.layer.update(bodies.map(body => {
      const box = glowBounds(body);
      return {
        ...body,
        fade: (body.fade ?? 1) * visible,
        occluders: occluders.filter(occluder => overlapFraction(box, occluder) > 0),
      };
    }));
  }
}

/**
 * The words, buttons and filled panels of a scene that lie over `area`, as
 * occluders: text by its own drawing (letters, and the box behind them if
 * it has one), a rectangle as opaque as its fill. Objects that cover most
 * of the screen are washes over the whole scene, not in front of the sky,
 * and are left out.
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
      const opacity = occluderOpacity(object) * parentAlpha;
      if (opacity < 0.02) continue;
      const bounds = (object as Phaser.GameObjects.Text).getBounds();
      if (bounds.width * bounds.height > screen * 0.5) continue;
      const rect = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
      if (overlapFraction(area, rect) <= 0) continue;
      found.push(object instanceof Phaser.GameObjects.Text
        ? { ...rect, opacity, image: object.canvas, version: `${object.text}|${object.style.color}|${object.canvas.width}x${object.canvas.height}` }
        : { ...rect, opacity });
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

function occluderOpacity(object: Phaser.GameObjects.GameObject): number {
  if (object instanceof Phaser.GameObjects.Text) return object.visible ? object.alpha : 0;
  if (object instanceof Phaser.GameObjects.Rectangle) return object.visible && object.isFilled ? object.alpha * object.fillAlpha : 0;
  return 0;
}
