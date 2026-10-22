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
}

export interface Interactable {
  gridX: number;
  gridY: number;
  prompt: string;
  texture: string;
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
}
