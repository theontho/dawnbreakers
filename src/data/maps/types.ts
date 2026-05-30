import type { Building, Decor, MapExit, TileKind } from '../../scenes/baseMapTypes';

/**
 * Data-driven map definition consumed by `MapScene`. One file per map under
 * `src/data/maps/<key>.ts` exports a `MapDefinition`; the registry in
 * `src/data/maps/index.ts` is the single source of truth that `main.ts`
 * iterates to register scenes.
 *
 * The `build` callback gets a thin `TileCanvas` so each chapter's tile
 * painting reads the same as the old `buildMap()` body, just on the canvas
 * instead of on a class. Buildings, decor, NPCs, and exits are pure data.
 */
export interface MapDefinition {
  /** Phaser scene key. */
  key: string;
  /** HUD title shown at the top of the screen. */
  title: string;
  /** Map size in grid cells. */
  width: number;
  height: number;
  /** Default spawn when entering the scene without explicit spawnX/spawnY. */
  spawn: { x: number; y: number };
  /** Tile painting. Map starts as all `grass`. */
  build: (canvas: TileCanvas) => void;
  buildings: BuildingSpec[];
  decor: DecorSpec[];
  npcs: NpcSpec[];
  exits: MapExit[];
}

/** A canvas the `build` callback paints onto. */
export interface TileCanvas {
  readonly width: number;
  readonly height: number;
  /** Direct read/write into the tile grid. Use sparingly; prefer `paintRect` etc. */
  readonly map: TileKind[][];
  /** Direct read/write into the block grid. Use sparingly; prefer `block`. */
  readonly blocked: boolean[][];
  paintRect(x: number, y: number, w: number, h: number, kind: TileKind): void;
  paintPath(cells: ReadonlyArray<readonly [number, number]>): void;
  setTile(x: number, y: number, kind: TileKind): void;
  block(x: number, y: number): void;
  unblock(x: number, y: number): void;
  inBounds(x: number, y: number): boolean;
}

/** A building footprint placed at a grid cell. */
export interface BuildingSpec extends Building {
  /** When true, mark every footprint cell as blocked. Defaults to true. */
  blocks?: boolean;
}

/** Decor: cosmetic prop on a single cell, optionally blocking. */
export type DecorSpec = Decor;

/** NPC interaction: dialogue tree id, or special chapter-1 Báb dialogue. */
export type NpcAction =
  | { kind: 'dialogue'; id: string }
  | { kind: 'bab' };

export interface NpcSpec {
  gridX: number;
  gridY: number;
  texture: string;
  /** Prompt shown when the player is adjacent. Should end with `[E]`. */
  prompt: string;
  action: NpcAction;
}
