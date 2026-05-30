import type {
  MapAssetCategory,
  MapObjectDefinition,
  MapObjectFootprint,
  MapObjectId,
  MapObjectKind,
} from '../assets/mapAssetLibrary';
import type { TileKind } from './baseMapTypes';

export type EditorObjectKind = MapObjectKind;
export type EditorObjectId = MapObjectId;
export type ObjectTool = `object:${EditorObjectId}`;
export type EditorTool = TileKind | 'block' | 'open' | 'erase-object' | ObjectTool;
export type ObjectFootprint = MapObjectFootprint;
export type EditorObjectDefinition = MapObjectDefinition;

export interface EditorPlacedObject {
  id: EditorObjectId;
  x: number;
  y: number;
}

export interface EditorMap {
  width: number;
  height: number;
  tiles: TileKind[][];
  blocked: boolean[][];
  objects: EditorPlacedObject[];
}

export interface StoredEditorObject extends EditorPlacedObject {
  texture?: string;
  kind?: EditorObjectKind;
  blocks?: boolean;
  footprint?: ObjectFootprint;
  isometric?: true;
}

export interface StoredEditorMap {
  width: number;
  height: number;
  tiles: string[];
  blocked: string[];
  objects?: StoredEditorObject[];
}

export interface EditorLayout {
  mode: 'side' | 'bottom';
  panelX: number;
  panelY: number;
  panelW: number;
  panelH: number;
  mapX: number;
  mapY: number;
  mapW: number;
  mapH: number;
}

export interface AssetPickerGeometry {
  overlayX: number;
  overlayY: number;
  overlayW: number;
  overlayH: number;
  gridX: number;
  gridY: number;
  gridW: number;
  contentH: number;
  previewX: number;
  previewY: number;
  previewW: number;
  previewH: number;
  gridCellW: number;
  gridCellH: number;
  gridGap: number;
  gridColumns: number;
}

export interface EditorSceneData {
  from?: string;
}

export type AssetPickerRow =
  | { kind: 'header'; category: MapAssetCategory; count: number }
  | { kind: 'assets'; category: MapAssetCategory; assets: EditorObjectDefinition[] };

export type SpecialToolIcon = 'block' | 'open' | 'erase';

export const STORAGE_KEY = 'dawnbreakers.mapEditor.v1';
export const PANEL_W = 300;
export const EDITOR_TOP_BAR_H = 72;
export const MIN_W = 6;
export const MAX_W = 30;
export const MIN_H = 6;
export const MAX_H = 20;
export const ASSET_PICKER_WHEEL_SCALE = 0.65;
export const ASSET_PICKER_MAX_WHEEL_DELTA = 90;
export const PALETTE_BUTTON_GAP = 6;
