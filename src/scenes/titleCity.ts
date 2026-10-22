import Phaser from 'phaser';
import { paintDawnCity } from '../assets/art/dawnCity';
import { dawnLayout } from '../assets/art/dawnLayout';
import type { DawnMode } from '../assets/art/dawnPass';

export type TitleCity = {
  setLight: (amount: number) => void;
};

/**
 * Shíráz at dawn, baked once into four screen-sized canvas textures (see
 * `dawnPass`): the night silhouettes, the day colours fading in over them,
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
): TitleCity {
  const layout = dawnLayout(width, height, horizonY);
  const bake = (mode: DawnMode): Phaser.GameObjects.Image => {
    const w = Math.ceil(width);
    const h = Math.ceil(height - layout.top);
    const key = `title-city-${mode}-${w}x${h}`;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (scene.textures.exists(key)) scene.textures.remove(key);
    });
    const texture = scene.textures.createCanvas(key, w, h);
    if (!texture) throw new Error(`Unable to create title city texture: ${key}`);
    const ctx = texture.getContext();
    ctx.translate(0, -layout.top);
    paintDawnCity(ctx, mode, layout);
    texture.refresh();
    return scene.add.image(0, layout.top, key).setOrigin(0);
  };
  bake('night');
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

  return { setLight };
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
