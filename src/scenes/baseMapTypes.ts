import Phaser from 'phaser';

export const TILE_W = 64;
export const TILE_H = 32;

export type TileKind = 'grass' | 'path' | 'stone' | 'water' | 'sand';

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
}

export interface Interactable {
  gridX: number;
  gridY: number;
  prompt: string;
  texture: string;
  action: () => void;
  sprite?: Phaser.GameObjects.Image;
}

export interface MapExit {
  fromX: number;
  fromY: number;
  dx: number;
  dy: number;
  targetScene: string;
  targetSpawnX: number;
  targetSpawnY: number;
  label: string;
}

export interface SceneSpawnData {
  spawnX?: number;
  spawnY?: number;
}
