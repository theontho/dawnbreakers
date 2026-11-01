import Phaser from 'phaser';
import { gridToIsoScreen } from './isoGeometry';
import { paintGround } from './groundPainter';
import type { WaterRegion } from './waterLayer';
import { TILE_H, TILE_W, type TileKind } from './baseMapTypes';

/**
 * The ground layer of a map, painted once per scene (see `groundPainter.ts`):
 * terrain that flows across cell boundaries instead of a grid of identical
 * diamonds. Large maps are painted in chunks no wider or taller than
 * `CHUNK` pixels, inside every GPU's texture limit. Textures are freed when
 * the scene shuts down.
 */

const SLAB_DEPTH = 18;
const CHUNK = 2048;

interface GroundState {
  mapWidth: number;
  mapHeight: number;
  originX: number;
  originY: number;
  map: TileKind[][];
  interior?: boolean;
  openSea?: boolean;
}

/** Paints the ground and returns where its water lies, for the moving water over it. */
export function renderMapGround(scene: Phaser.Scene, state: GroundState): WaterRegion[] {
  const bounds = groundBounds(state);
  const spec = {
    width: state.mapWidth,
    height: state.mapHeight,
    map: state.map,
    originX: state.originX - bounds.x,
    originY: state.originY - bounds.y,
    imageW: bounds.width,
    imageH: bounds.height,
    slab: SLAB_DEPTH,
    interior: state.interior,
    openSea: state.openSea,
  };
  const keys: string[] = [];
  const water: WaterRegion[] = [];
  for (let y = 0; y < bounds.height; y += CHUNK) {
    for (let x = 0; x < bounds.width; x += CHUNK) {
      const region = { x, y, w: Math.min(CHUNK, bounds.width - x), h: Math.min(CHUNK, bounds.height - y) };
      const key = `ground-${scene.scene.key}-${keys.length}`;
      if (scene.textures.exists(key)) scene.textures.remove(key);
      const painted = paintGround(spec, region);
      const texture = scene.textures.createCanvas(key, region.w, region.h)!;
      texture.context.putImageData(painted.image, 0, 0);
      texture.refresh();
      scene.add.image(bounds.x + x, bounds.y + y, key).setOrigin(0).setDepth(-1000);
      keys.push(key);
      if (painted.water && painted.waterBox) {
        const maskKey = `${key}-water`;
        if (scene.textures.exists(maskKey)) scene.textures.remove(maskKey);
        const mask = scene.textures.createCanvas(maskKey, region.w, region.h)!;
        mask.context.putImageData(painted.water, 0, 0);
        mask.refresh();
        keys.push(maskKey);
        water.push({ maskKey, x: bounds.x + x, y: bounds.y + y, box: painted.waterBox });
      }
    }
  }
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => keys.forEach(key => scene.textures.remove(key)));
  return water;
}

function groundBounds(state: GroundState): Phaser.Geom.Rectangle {
  const left = gridToIsoScreen(state.originX, state.originY, 0, state.mapHeight - 1).sx - TILE_W / 2;
  const right = gridToIsoScreen(state.originX, state.originY, state.mapWidth - 1, 0).sx + TILE_W / 2;
  const top = gridToIsoScreen(state.originX, state.originY, 0, 0).sy - TILE_H / 2;
  const bottom = gridToIsoScreen(state.originX, state.originY, state.mapWidth - 1, state.mapHeight - 1).sy
    + TILE_H / 2 + SLAB_DEPTH;
  return new Phaser.Geom.Rectangle(Math.floor(left), Math.floor(top), Math.ceil(right - left), Math.ceil(bottom - top));
}
