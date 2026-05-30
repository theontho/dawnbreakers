import Phaser from 'phaser';
import { gridToIsoScreen } from './isoGeometry';
import {
  TILE_H,
  TILE_W,
  type Building,
  type Decor,
  type Interactable,
  type MapExit,
  type TileKind,
} from './baseMapTypes';

export const WORLD_BACKDROP_COLOR = 0x0a0806;

interface BaseMapWorldState {
  mapWidth: number;
  mapHeight: number;
  originX: number;
  originY: number;
  map: TileKind[][];
  blocked: boolean[][];
  buildings: Building[];
  decor: Decor[];
  exits: MapExit[];
}

export function renderBaseMapWorld(
  scene: Phaser.Scene,
  state: BaseMapWorldState,
): Phaser.GameObjects.Image[] {
  drawWorldBackdrop(scene, state);
  const occludableSprites: Phaser.GameObjects.Image[] = [];

  for (let y = 0; y < state.mapHeight; y++) {
    for (let x = 0; x < state.mapWidth; x++) {
      const { sx, sy } = gridToIsoScreen(state.originX, state.originY, x, y);
      scene.add.image(sx, sy, 'tile-' + state.map[y]![x])
        .setOrigin(0.5, 0.5).setDepth(sy);
    }
  }

  for (const building of state.buildings) {
    const frontX = building.gridX + building.w - 1;
    const frontY = building.gridY + building.h - 1;
    const front = gridToIsoScreen(state.originX, state.originY, frontX, frontY);
    const sprite = scene.add.image(front.sx, front.sy + TILE_H / 2, building.texture)
      .setOrigin(0.5, 1)
      .setDepth(front.sy + 1);
    occludableSprites.push(sprite);
  }

  for (const item of state.decor) {
    const pos = gridToIsoScreen(state.originX, state.originY, item.gridX, item.gridY);
    const sprite = scene.add.image(pos.sx, pos.sy + TILE_H / 2, item.texture)
      .setOrigin(0.5, 1)
      .setDepth(pos.sy + 1);
    occludableSprites.push(sprite);
    if (item.blocks && inBounds(state, item.gridX, item.gridY)) state.blocked[item.gridY]![item.gridX] = true;
  }

  for (const exit of state.exits) {
    const pos = gridToIsoScreen(state.originX, state.originY, exit.fromX, exit.fromY);
    const glow = scene.add.ellipse(pos.sx, pos.sy, 40, 18, 0xc9a55c, 0.35)
      .setDepth(pos.sy + 0.5);
    scene.tweens.add({ targets: glow, alpha: 0.7, duration: 900, yoyo: true, repeat: -1 });
  }

  return occludableSprites;
}

export function getBaseMapWorldBounds(
  scene: Phaser.Scene,
  state: BaseMapWorldState,
  player: Phaser.GameObjects.Image,
  interactables: readonly Interactable[],
  width: number,
  height: number,
): Phaser.Geom.Rectangle {
  const tileBounds = getTileWorldBounds(state, width, height);
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  const includeBounds = (x: number, y: number, w: number, h: number): void => {
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + w);
    maxY = Math.max(maxY, y + h);
  };

  const includeTexture = (
    texture: string,
    x: number,
    y: number,
    originX: number,
    originY: number,
  ): void => {
    const frame = scene.textures.getFrame(texture);
    if (!frame) return;
    includeBounds(x - frame.width * originX, y - frame.height * originY, frame.width, frame.height);
  };

  includeBounds(tileBounds.x, tileBounds.y, tileBounds.width, tileBounds.height);

  for (const building of state.buildings) {
    const front = gridToIsoScreen(state.originX, state.originY, building.gridX + building.w - 1, building.gridY + building.h - 1);
    includeTexture(building.texture, front.sx, front.sy + TILE_H / 2, 0.5, 1);
  }

  for (const item of state.decor) {
    const pos = gridToIsoScreen(state.originX, state.originY, item.gridX, item.gridY);
    includeTexture(item.texture, pos.sx, pos.sy + TILE_H / 2, 0.5, 1);
  }

  for (const interactable of interactables) {
    if (interactable.sprite) {
      const bounds = interactable.sprite.getBounds();
      includeBounds(bounds.x, bounds.y, bounds.width, bounds.height);
    }
  }

  const playerBounds = player.getBounds();
  includeBounds(playerBounds.x, playerBounds.y, playerBounds.width, playerBounds.height);

  const padX = Math.max(width / 2, TILE_W * 2);
  const padY = Math.max(height / 2, TILE_H * 4);
  return new Phaser.Geom.Rectangle(
    minX - padX,
    minY - padY,
    maxX - minX + padX * 2,
    maxY - minY + padY * 2,
  );
}

function drawWorldBackdrop(scene: Phaser.Scene, state: BaseMapWorldState): void {
  const bounds = getTileWorldBounds(state, scene.scale.width, scene.scale.height);
  scene.add.rectangle(bounds.x, bounds.y, bounds.width, bounds.height, WORLD_BACKDROP_COLOR, 1)
    .setOrigin(0)
    .setDepth(-100000);
}

function getTileWorldBounds(state: BaseMapWorldState, width: number, height: number): Phaser.Geom.Rectangle {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < state.mapHeight; y++) {
    for (let x = 0; x < state.mapWidth; x++) {
      const pos = gridToIsoScreen(state.originX, state.originY, x, y);
      minX = Math.min(minX, pos.sx - TILE_W / 2);
      minY = Math.min(minY, pos.sy - TILE_H / 2);
      maxX = Math.max(maxX, pos.sx + TILE_W / 2);
      maxY = Math.max(maxY, pos.sy + TILE_H / 2);
    }
  }

  const padX = Math.max(width, TILE_W * 4);
  const padY = Math.max(height, TILE_H * 8);
  return new Phaser.Geom.Rectangle(
    minX - padX,
    minY - padY,
    maxX - minX + padX * 2,
    maxY - minY + padY * 2,
  );
}

function inBounds(state: BaseMapWorldState, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < state.mapWidth && y < state.mapHeight;
}
