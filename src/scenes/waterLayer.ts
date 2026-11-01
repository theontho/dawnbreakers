import Phaser from 'phaser';
import { WATER_FRAGMENT } from './waterShader';

/**
 * Moving water. The ground under it is painted once, so the water is brought
 * to life by a shader drawn over it: ripples drifting with the current, glints
 * of light, and foam lapping at the banks. Where a map's water is open sea
 * (`openSea`), the ground leaves the water clear and the shader draws the
 * whole sea itself, under everything and out past the map to the screen's
 * edges, flowing past the ship.
 *
 * Rivers flow along their length; a pool or pond only ripples in place.
 */

/** A painted ground chunk's water: its mask texture and where it lies in the world. */
export interface WaterRegion {
  maskKey: string;
  /** World position of the mask's top-left pixel. */
  x: number;
  y: number;
  /** The part of the mask that holds water, in mask pixels. */
  box: { x: number; y: number; w: number; h: number };
}

export interface WaterOptions {
  /** World position of grid cell (0, 0)'s centre. */
  originX: number;
  originY: number;
  /** Grid cells a second the water moves; [0, 0] ripples in place. */
  flow: readonly [number, number];
  openSea?: boolean;
}

const SHADER_KEY = 'water-surface';
/** Over the ground, under everything standing on it. */
const OVER_GROUND_DEPTH = -999;
/** The open sea lies under the ground (-1000) and over the world's backdrop. */
const SEA_DEPTH = -1001;
/** The sea reaches this far past the view, so a rolling camera never shows its edge. */
const SEA_MARGIN = 0.25;

export function addWater(scene: Phaser.Scene, regions: readonly WaterRegion[], options: WaterOptions): void {
  if (scene.game.renderer.type !== Phaser.WEBGL) return;
  if (!scene.cache.shader.exists(SHADER_KEY)) {
    scene.cache.shader.add(SHADER_KEY, new Phaser.Display.BaseShader(SHADER_KEY, WATER_FRAGMENT, undefined, {
      uOrigin: { type: '2f', value: { x: 0, y: 0 } },
      uCorner: { type: '2f', value: { x: 0, y: 0 } },
      uMaskOffset: { type: '2f', value: { x: 0, y: 0 } },
      uMaskSize: { type: '2f', value: { x: 1, y: 1 } },
      uFlow: { type: '2f', value: { x: 0, y: 0 } },
      uOpenSea: { type: '1f', value: 0 },
    }));
  }
  const setCommon = (shader: Phaser.GameObjects.Shader, cornerX: number, cornerY: number) => {
    shader.setUniform('uOrigin.value.x', options.originX);
    shader.setUniform('uOrigin.value.y', options.originY);
    shader.setUniform('uCorner.value.x', cornerX);
    shader.setUniform('uCorner.value.y', cornerY);
    shader.setUniform('uFlow.value.x', options.flow[0]);
    shader.setUniform('uFlow.value.y', options.flow[1]);
  };

  if (options.openSea) {
    addOpenSea(scene, setCommon);
    return;
  }
  for (const region of regions) {
    const frame = scene.textures.getFrame(region.maskKey);
    // Clamped, not Phaser's default repeat, which a texture of any size cannot take
    // in WebGL 1; given without a size, which would make Phaser blank it.
    const shader = scene.add.shader(SHADER_KEY, region.x + region.box.x, region.y + region.box.y, region.box.w, region.box.h,
      [region.maskKey], { wrapS: 'clamp_to_edge', wrapT: 'clamp_to_edge' })
      .setOrigin(0)
      .setDepth(OVER_GROUND_DEPTH);
    setCommon(shader, shader.x, shader.y);
    shader.setUniform('uMaskOffset.value.x', region.box.x);
    shader.setUniform('uMaskOffset.value.y', region.box.y);
    shader.setUniform('uMaskSize.value.x', frame.width);
    shader.setUniform('uMaskSize.value.y', frame.height);
  }
}

/** The sea under the whole view, following the camera. */
function addOpenSea(scene: Phaser.Scene, setCommon: (shader: Phaser.GameObjects.Shader, x: number, y: number) => void): void {
  const camera = scene.cameras.main;
  const shader = scene.add.shader(SHADER_KEY, 0, 0, 2, 2).setOrigin(0).setDepth(SEA_DEPTH);
  setCommon(shader, 0, 0);
  shader.setUniform('uOpenSea.value', 1);
  const follow = () => {
    const view = camera.worldView;
    const w = Math.ceil(view.width * (1 + SEA_MARGIN * 2));
    const h = Math.ceil(view.height * (1 + SEA_MARGIN * 2));
    const x = Math.floor(view.x - view.width * SEA_MARGIN);
    const y = Math.floor(view.y - view.height * SEA_MARGIN);
    if (shader.width !== w || shader.height !== h) shader.setSize(w, h);
    shader.setPosition(x, y);
    shader.setUniform('uCorner.value.x', x);
    shader.setUniform('uCorner.value.y', y);
  };
  follow();
  scene.events.on(Phaser.Scenes.Events.POST_UPDATE, follow);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.POST_UPDATE, follow));
}

/**
 * Which way a map's water runs: along a river's length, the way its water
 * stretches farther, or still for water about as wide as it is long.
 */
export function riverFlow(map: readonly (readonly string[])[]): [number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  map.forEach((row, y) => row.forEach((kind, x) => {
    if (kind !== 'water') return;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }));
  if (maxX < minX) return [0, 0];
  const across = maxX - minX + 1;
  const down = maxY - minY + 1;
  const speed = 0.35;
  if (across > down * 1.6) return [speed, 0];
  if (down > across * 1.6) return [0, speed];
  return [0, 0];
}

/**
 * The slow roll and heave of a ship's deck: the view leans a fraction of a
 * degree one way and the other and rises and sinks a few pixels, on swells
 * of a few seconds that never quite repeat.
 */
export function rollWithTheSea(scene: Phaser.Scene): void {
  const camera = scene.cameras.main;
  const roll = () => {
    const t = scene.game.loop.time / 1000;
    camera.setRotation(Math.sin(t * 0.55) * 0.0055 + Math.sin(t * 0.21 + 1.3) * 0.003);
    camera.followOffset.y = Math.sin(t * 0.8 + 0.6) * 3 + Math.sin(t * 0.33) * 1.5;
  };
  scene.events.on(Phaser.Scenes.Events.PRE_UPDATE, roll);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.PRE_UPDATE, roll));
}
