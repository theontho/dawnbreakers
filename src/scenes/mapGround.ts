import Phaser from 'phaser';
import { gridToIsoScreen } from './isoGeometry';
import { paintGround } from './groundPainter';
import { TILE_H, TILE_W, type TileKind } from './baseMapTypes';

/**
 * The ground layer of a map, painted once per scene into a single canvas
 * texture (see `groundPainter.ts`): one draw call, and terrain that flows
 * across cell boundaries instead of a grid of identical diamonds. The
 * texture is freed when the scene shuts down.
 */

const SLAB_DEPTH = 18;

interface GroundState {
  mapWidth: number;
  mapHeight: number;
  originX: number;
  originY: number;
  map: TileKind[][];
}

export function renderMapGround(scene: Phaser.Scene, state: GroundState): Phaser.GameObjects.Image {
  const bounds = groundBounds(state);
  const key = `ground-${scene.scene.key}`;
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const texture = scene.textures.createCanvas(key, bounds.width, bounds.height)!;
  texture.context.putImageData(paintGround({
    width: state.mapWidth,
    height: state.mapHeight,
    map: state.map,
    originX: state.originX - bounds.x,
    originY: state.originY - bounds.y,
    imageW: bounds.width,
    imageH: bounds.height,
    slab: SLAB_DEPTH,
  }), 0, 0);
  texture.refresh();
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.textures.remove(key));
  return scene.add.image(bounds.x, bounds.y, key).setOrigin(0).setDepth(-1000);
}

function groundBounds(state: GroundState): Phaser.Geom.Rectangle {
  const left = gridToIsoScreen(state.originX, state.originY, 0, state.mapHeight - 1).sx - TILE_W / 2;
  const right = gridToIsoScreen(state.originX, state.originY, state.mapWidth - 1, 0).sx + TILE_W / 2;
  const top = gridToIsoScreen(state.originX, state.originY, 0, 0).sy - TILE_H / 2;
  const bottom = gridToIsoScreen(state.originX, state.originY, state.mapWidth - 1, state.mapHeight - 1).sy
    + TILE_H / 2 + SLAB_DEPTH;
  return new Phaser.Geom.Rectangle(Math.floor(left), Math.floor(top), Math.ceil(right - left), Math.ceil(bottom - top));
}
