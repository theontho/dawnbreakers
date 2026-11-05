import Phaser from 'phaser';
import { dawnPass, isAccent, tone, type DawnMode } from '../assets/art/dawnPass';
import { vistaScale, type Season, type Vista, type VistaFrame } from '../assets/art/vista/types';

export type TitleCity = {
  setLight: (amount: number) => void;
  /** Screen y of the top of the city at column x, read from the baked silhouette the first time it is asked. */
  skylineAt: (x: number) => number;
};

/**
 * The opening's place at dawn, baked once into four screen-sized canvas
 * textures (see `dawnPass`): the night silhouettes, the day colours fading in over them,
 * and two additive layers, the sunrise catching the edges and the lamps
 * that go out as it gets light. Each frame only changes three alphas;
 * re-tessellating the skyline every frame was once the title screen's
 * largest cost.
 */
export function addTitleCity(
  scene: Phaser.Scene,
  width: number,
  height: number,
  horizonY: number,
  vista: Vista,
  season: Season,
): TitleCity {
  const k = vistaScale(height);
  const frame = { width, height, horizonY, k, season };
  // The topmost painted pixel, so the baked layers can skip the open sky.
  const top = Math.max(0, Math.floor(horizonY - vista.reach * k));
  const bake = (mode: DawnMode): Phaser.GameObjects.Image => {
    const w = Math.ceil(width);
    const h = Math.ceil(height - top);
    const key = `${scene.scene.key}-dawn-city-${vista.id}-${mode}-${w}x${h}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (scene.textures.exists(key)) scene.textures.remove(key);
    });
    const texture = scene.textures.createCanvas(key, w, h);
    if (!texture) throw new Error(`Unable to create title city texture: ${key}`);
    const ctx = texture.getContext();
    ctx.translate(0, -top);
    paintBackstop(ctx, mode, frame, vista.land);
    vista.paint(ctx, mode, frame);
    texture.refresh();
    return scene.add.image(0, top, key).setOrigin(0);
  };
  const night = bake('night');
  const day = bake('day');
  const rim = bake('rim').setBlendMode(Phaser.BlendModes.ADD);
  const lamps = bake('lamp').setBlendMode(Phaser.BlendModes.ADD);

  const setLight = (amount: number) => {
    const light = Phaser.Math.Clamp(amount, 0, 1);
    // The colours come up a little behind the light, leaving the city backlit for a while.
    day.setAlpha(light ** 1.4);
    rim.setAlpha(smoothstep(0.02, 0.28, light) * (1 - 0.8 * smoothstep(0.5, 1, light)));
    lamps.setAlpha(1 - smoothstep(0.06, 0.5, light));
  };
  setLight(0);

  let profile: Float32Array | undefined;
  const skylineAt = (x: number) => {
    profile ??= silhouetteProfile(night.texture.getSourceImage() as HTMLCanvasElement, top);
    const column = profile[Math.floor(x)];
    return column ?? height;
  };

  return { setLight, skylineAt };
}

/**
 * Solid land from the horizon to the bottom of the screen, under everything
 * the vista paints: wherever its houses, palms or walls leave a gap below
 * the horizon, the land shows through rather than the sky, and the sun
 * cannot peek out from under a building.
 */
function paintBackstop(ctx: CanvasRenderingContext2D, mode: DawnMode, frame: VistaFrame, land: number): void {
  const p = dawnPass(mode, ctx, frame);
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, land, 0.95, 0.7);
  ctx.fillRect(0, Math.floor(frame.horizonY), frame.width, frame.height - Math.floor(frame.horizonY));
}

/** The first opaque row of each column of a baked layer, in screen pixels. */
function silhouetteProfile(canvas: HTMLCanvasElement, top: number): Float32Array {
  const { width, height } = canvas;
  const profile = new Float32Array(width).fill(top + height);
  const ctx = canvas.getContext('2d');
  if (!ctx || width === 0 || height === 0) return profile;
  const alpha = ctx.getImageData(0, 0, width, height).data;
  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) {
      if (alpha[(y * width + x) * 4 + 3]! > 96) {
        profile[x] = top + y;
        break;
      }
    }
  }
  return profile;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = Phaser.Math.Clamp((value - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

const CLOUD_TEXTURE = 'title-cloud';
const CLOUD_ORIGIN = { x: 96, y: 18 };

/** A soft three-lobed cloud, drawn once and reused as an image. */
export function addTitleCloud(
  scene: Phaser.Scene,
  x: number,
  y: number,
  scale: number,
  alpha: number,
): Phaser.GameObjects.Image {
  if (!scene.textures.exists(CLOUD_TEXTURE)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const { x: cx, y: cy } = CLOUD_ORIGIN;
    g.fillStyle(0xf5cf9f, 1);
    g.fillEllipse(cx - 48, cy + 8, 90, 26);
    g.fillEllipse(cx, cy, 126, 34);
    g.fillEllipse(cx + 58, cy + 10, 84, 24);
    g.generateTexture(CLOUD_TEXTURE, 200, 44);
    g.destroy();
  }
  return scene.add.image(x, y, CLOUD_TEXTURE)
    .setOrigin(CLOUD_ORIGIN.x / 200, CLOUD_ORIGIN.y / 44)
    .setScale(scale)
    .setAlpha(alpha);
}
