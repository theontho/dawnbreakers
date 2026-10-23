import Phaser from 'phaser';

export const TILE_W = 64;
export const TILE_H = 32;

/** Ground kinds; `floor` (tiled or brick) and `wood` (boards, decks) are for interiors. */
export type TileKind = 'grass' | 'path' | 'stone' | 'water' | 'sand' | 'floor' | 'wood';

export interface IsoPoint {
  x: number;
  y: number;
}

export interface IsoPrism {
  texW: number;
  texH: number;
  top: IsoPoint;
  right: IsoPoint;
  bottom: IsoPoint;
  left: IsoPoint;
  topR: IsoPoint;
  rightR: IsoPoint;
  bottomR: IsoPoint;
  leftR: IsoPoint;
}

export interface Building {
  gridX: number;
  gridY: number;
  w: number;
  h: number;
  texture: string;
}

export interface Decor {
  gridX: number;
  gridY: number;
  texture: string;
  blocks?: boolean;
  /** When provided, the prop only stands on the map while this returns true. */
  present?: (flags: ExitFlags) => boolean;
  /**
   * Hangs from the top of its texture and swings this many degrees either
   * way (a lamp on a chain at sea).
   */
  swing?: number;
  /**
   * The grid point (fractions allowed) this sprite depth-sorts at, instead
   * of its own cell: a ship's hull sorts under all its deck, each slice of
   * a curved bulwark where that stretch of rail really stands.
   */
  sortAt?: IsoPoint;
}

export interface Interactable {
  gridX: number;
  gridY: number;
  prompt: string;
  /** Its sprite's texture; none for a story object the map's scenery draws (a door in a wall). */
  texture?: string;
  action: () => void;
  sprite?: Phaser.GameObjects.Image;
}

/** Story flags, as read by exit and NPC conditions. */
export type ExitFlags = Readonly<Record<string, boolean | number | string>>;

export interface MapExit {
  fromX: number;
  fromY: number;
  dx: number;
  dy: number;
  targetScene: string;
  targetSpawnX: number;
  targetSpawnY: number;
  label: string;
  /** When provided, the exit only opens while this returns true. */
  requires?: (flags: ExitFlags) => boolean;
  /** Shown instead of `label` while the exit is closed. */
  lockedLabel?: string;
}

export interface SceneSpawnData {
  spawnX?: number;
  spawnY?: number;
  /** Play the chapter's opening narration even if this save has seen it (starting from chapter select). */
  replayOpening?: boolean;
}
