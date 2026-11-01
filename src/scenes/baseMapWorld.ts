import Phaser from 'phaser';
import { MAP_OBJECTS } from '../assets/mapAssetLibrary';
import { sliceBuilding } from './buildingSlices';
import { gridToIsoScreen } from './isoGeometry';
import { renderMapGround } from './mapGround';
import { exitIsOpen } from './baseMapMovement';
import { placeExitMarks } from './exitMarks';
import { addWater, riverFlow, rollWithTheSea } from './waterLayer';
import { swayInTheWind } from './windSway';
import type { WaterSpec } from '../data/maps/types';
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
  interior?: boolean;
  water?: WaterSpec;
  blocked: boolean[][];
  buildings: Building[];
  decor: Decor[];
  exits: MapExit[];
}

export interface RenderedWorld {
  occludableSprites: Phaser.GameObjects.Image[];
  /** Decor whose presence depends on story flags, with its sprite. */
  conditionalDecor: Array<{ item: Decor; sprite: Phaser.GameObjects.Image }>;
}

export function renderBaseMapWorld(
  scene: Phaser.Scene,
  state: BaseMapWorldState,
): RenderedWorld {
  const conditionalDecor: RenderedWorld['conditionalDecor'] = [];
  drawWorldBackdrop(scene, state);
  const occludableSprites: Phaser.GameObjects.Image[] = [];

  const water = renderMapGround(scene, { ...state, openSea: state.water?.openSea });
  addWater(scene, water, {
    originX: state.originX,
    originY: state.originY,
    flow: state.water?.flow ?? riverFlow(state.map),
    openSea: state.water?.openSea,
  });
  if (state.water?.roll) rollWithTheSea(scene);

  for (const building of state.buildings) {
    const frontX = building.gridX + building.w - 1;
    const frontY = building.gridY + building.h - 1;
    const front = gridToIsoScreen(state.originX, state.originY, frontX, frontY);
    const whole = anchorAtFoot(scene.add.image(front.sx, front.sy + TILE_H / 2, building.texture, '__BASE'));
    const slices = sliceBuilding(scene, whole, building, { x: state.originX, y: state.originY });
    slices.forEach(slice => slice.setName(placedName(building)));
    occludableSprites.push(...slices);
  }

  const plants: Phaser.GameObjects.Image[] = [];
  for (const item of state.decor) {
    const pos = gridToIsoScreen(state.originX, state.originY, item.gridX, item.gridY);
    const nudge = naturalOffset(item.texture, item.gridX, item.gridY);
    const sprite = anchorAtFoot(scene.add.image(pos.sx + nudge.x, pos.sy + TILE_H / 2 + nudge.y, item.texture))
      .setDepth((item.sortAt ? gridToIsoScreen(state.originX, state.originY, item.sortAt.x, item.sortAt.y).sy : pos.sy + nudge.y) + 1);
    if (item.swing) swingFromTop(scene, sprite, item.swing);
    else if (PLANTS.has(item.texture.split('~')[0]!)) plants.push(sprite);
    sprite.setName(placedName(item));
    occludableSprites.push(sprite);
    if (item.present) conditionalDecor.push({ item, sprite });
  }

  if (!state.interior) swayInTheWind(scene, plants);
  return { occludableSprites, conditionalDecor };
}

/** What a world sprite shows and where it stands, e.g. `plane-tree 26,2`, for checks and debugging. */
function placedName(item: { texture: string; gridX: number; gridY: number }): string {
  return `${item.texture.split('~')[0]} ${item.gridX},${item.gridY}`;
}

/** Hangs a sprite from its footprint's front corner: the bottom edge, less any foot margin painted below it. */
function anchorAtFoot(sprite: Phaser.GameObjects.Image): Phaser.GameObjects.Image {
  const foot = (sprite.texture.customData as { foot?: number }).foot ?? 0;
  return sprite.setOrigin(0.5, 1 - foot / sprite.height);
}

/** Re-hangs a decor sprite from its top edge and rocks it gently, like a lamp on a chain. */
function swingFromTop(scene: Phaser.Scene, sprite: Phaser.GameObjects.Image, degrees: number): void {
  sprite.setOrigin(0.5, 0).setY(sprite.y - sprite.displayHeight);
  sprite.setAngle(-degrees);
  scene.tweens.add({
    targets: sprite,
    angle: degrees,
    duration: 2600,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut',
  });
}

/** Things that grow, which bend in the wind (not rocks or stumps). */
const PLANTS = new Set(
  MAP_OBJECTS.filter(def => def.category === 'plants' || /fern|reeds|shrub|tamarisk|palm/.test(def.id))
    .filter(def => !/rock|stump|boulder|log/.test(def.id))
    .map(def => def.texture),
);

const NATURAL = new Set(
  MAP_OBJECTS.filter(def => def.category === 'plants' || /rock|stump|boulder|fern|reeds|shrub|tamarisk/.test(def.id))
    .map(def => def.texture),
);

/**
 * Trees, shrubs and rocks stand a little off their cell's centre (fixed per
 * cell), so plantings read as grown rather than laid out on a grid. The
 * cell, and so walking and depth order, is unchanged.
 */
function naturalOffset(texture: string, gx: number, gy: number): { x: number; y: number } {
  if (!NATURAL.has(texture.split('~')[0]!)) return { x: 0, y: 0 };
  const h = Math.imul(gx * 73856093 ^ gy * 19349663, 0x9e3779b1) >>> 0;
  return { x: ((h & 0xff) / 255 - 0.5) * 18, y: (((h >>> 8) & 0xff) / 255 - 0.5) * 8 };
}

/**
 * Pulsing ground glow on each exit tile and a mark floating over each road
 * out; dimmed and still while the exit is closed, and hidden while its cell
 * cannot be reached (a passage not yet open).
 */
export function renderExitGlows(scene: Phaser.Scene, state: Pick<BaseMapWorldState, 'originX' | 'originY' | 'exits' | 'blocked'>): () => void {
  const glows = state.exits.map(exit => {
    const pos = gridToIsoScreen(state.originX, state.originY, exit.fromX, exit.fromY);
    const glow = scene.add.ellipse(pos.sx, pos.sy, 40, 18, 0xc9a55c, 0.35).setDepth(pos.sy + 0.5);
    const tween = scene.tweens.add({ targets: glow, alpha: 0.7, duration: 900, yoyo: true, repeat: -1 });
    return { exit, glow, tween };
  });
  const marks = placeExitMarks(scene, state.originX, state.originY, state.exits);
  const refresh = (): void => {
    for (const { exits, mark } of marks) {
      mark.setAlpha(exits.some(exitIsOpen) ? 1 : 0.35);
      mark.setVisible(exits.some(exit => !state.blocked[exit.fromY]![exit.fromX]));
    }
    for (const { exit, glow, tween } of glows) {
      const open = exitIsOpen(exit);
      glow.setFillStyle(open ? 0xc9a55c : 0x6b6258, open ? 0.35 : 0.2);
      glow.setVisible(!state.blocked[exit.fromY]![exit.fromX]);
      if (open) tween.resume();
      else tween.pause();
    }
  };
  refresh();
  return refresh;
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
