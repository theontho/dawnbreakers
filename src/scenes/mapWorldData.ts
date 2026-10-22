import type Phaser from 'phaser';
import { variantTexture } from '../assets/art';
import type { MapDefinition } from '../data/maps/types';
import type { FlagState } from '../dialogue/types';
import { blockFootprintInto, emptyMap, inBounds, makeTileCanvas } from './baseMapTileCanvas';
import type { Building, Decor, MapExit, TileKind } from './baseMapTypes';
import type { RenderedWorld } from './baseMapWorld';
import { checkDoorVariants } from './mapDoors';
import { checkExitBearings } from './mapExitBearings';
import { widenExits } from './mapExits';
import { connectBuildings } from './mapJoins';
import { checkWallSeams } from './mapSeams';
import { connectWalls } from './mapWalls';

/** A map's ground, buildings and props as placed, before anything is drawn. */
export interface WorldData {
  map: TileKind[][];
  /** Blocking now: rebuilt from `staticBlocked` whenever the story moves. */
  blocked: boolean[][];
  /** Blocking from the ground, buildings and fixed props, before anything flag-dependent. */
  staticBlocked: boolean[][];
  buildings: Building[];
  decor: Decor[];
  exits: MapExit[];
}

/**
 * Lays out a map definition: paints its ground, places buildings and props
 * with their texture variants, joins walls and buildings, and widens exits.
 * In development it also runs the authoring checks (door variants, exit
 * bearings, wall seams), which throw on a map that breaks them.
 */
export function buildWorldData(scene: Phaser.Scene, definition: MapDefinition): WorldData {
  const { width, height } = definition;
  const { map, blocked } = emptyMap(width, height);
  definition.build(makeTileCanvas(width, height, map, blocked));

  if (import.meta.env.DEV) checkDoorVariants(definition.key, definition.buildings, definition.doors ?? []);
  if (import.meta.env.DEV) checkExitBearings(definition.key, definition.exits);
  const buildings: Building[] = [];
  for (const spec of definition.buildings) {
    buildings.push({ gridX: spec.gridX, gridY: spec.gridY, w: spec.w, h: spec.h, texture: variantTexture(spec.texture, spec.gridX, spec.gridY, spec.variant) });
    if (spec.blocks !== false) blockFootprintInto(blocked, width, height, spec.gridX, spec.gridY, spec.w, spec.h);
  }
  const decor: Decor[] = [];
  for (const spec of definition.decor) {
    const { variant, ...rest } = spec;
    decor.push({ ...rest, texture: variantTexture(spec.texture, spec.gridX, spec.gridY, variant) });
    if (spec.blocks && !spec.present && inBounds(width, height, spec.gridX, spec.gridY)) blocked[spec.gridY]![spec.gridX] = true;
  }
  // Doors and gates in walls are wall pieces; a block pasted into a wall fails in development.
  if (import.meta.env.DEV) checkWallSeams(definition);
  connectWalls(scene, buildings, decor, definition);
  connectBuildings(scene, buildings);
  const exits = widenExits(definition.exits, map, blocked);
  return { map, blocked, staticBlocked: blocked.map(row => row.slice()), buildings, decor, exits };
}

/**
 * Opens or closes passages and shows or hides flag-dependent props,
 * rebuilding blocking from the fixed grid: several props may share a cell (a
 * lit niche and its dark wall), so a cell is blocked if anything present on
 * it blocks. People are added on top by `npcs.refresh`, which must follow.
 */
export function refreshBlocking(
  world: Pick<WorldData, 'blocked' | 'staticBlocked'>,
  definition: MapDefinition,
  conditionalDecor: RenderedWorld['conditionalDecor'],
  flags: FlagState,
): void {
  world.staticBlocked.forEach((row, y) => row.forEach((b, x) => { world.blocked[y]![x] = b; }));
  for (const passage of definition.passages ?? []) {
    const open = passage.open(flags);
    for (const { x, y } of passage.cells) world.blocked[y]![x] = !open;
  }
  for (const { item, sprite } of conditionalDecor) {
    const here = item.present!(flags);
    sprite.setVisible(here);
    if (item.blocks && here) world.blocked[item.gridY]![item.gridX] = true;
  }
}
