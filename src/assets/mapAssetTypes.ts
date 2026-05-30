import type Phaser from 'phaser';
import type { TileKind } from '../scenes/baseMapTypes';
import type { CharacterTextureOptions } from '../scenes/characterTexture';

export type MapObjectKind = 'structure' | 'prop' | 'character';
export type MapObjectId = string;
export type MapAssetCategoryId =
  | 'buildings'
  | 'shrines'
  | 'bridges-water'
  | 'plants'
  | 'furnishings'
  | 'market-supplies'
  | 'barriers-prison'
  | 'lighting-effects'
  | 'people-crowds'
  | 'characters';

export interface MapTileDefinition {
  kind: TileKind;
  label: string;
  color: number;
  edge: number;
  texture: string;
  code: string;
}

export interface MapObjectFootprint {
  w: number;
  h: number;
}

export interface MapObjectDefinition {
  id: MapObjectId;
  label: string;
  texture: string;
  kind: MapObjectKind;
  color: number;
  blocks: boolean;
  footprint?: MapObjectFootprint;
  isometric?: true;
  character?: CharacterTextureOptions;
}

export interface MapAssetCategory {
  id: MapAssetCategoryId;
  label: string;
  description: string;
  objectIds: MapObjectId[];
}

export type TextureGenerator = (scene: Phaser.Scene, def: MapObjectDefinition) => void;
