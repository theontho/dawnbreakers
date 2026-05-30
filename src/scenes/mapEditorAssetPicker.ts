import Phaser from 'phaser';
import type { MapAssetCategory } from '../assets/mapAssetLibrary';
import type { AssetPickerRow, EditorObjectDefinition, EditorObjectId } from './mapEditorTypes';

export function assetsForCategory(
  category: MapAssetCategory,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): EditorObjectDefinition[] {
  return category.objectIds
    .map(id => objectById.get(id))
    .filter((def): def is EditorObjectDefinition => def !== undefined);
}

export function assetPickerRows(
  categories: MapAssetCategory[],
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
  gridColumns: number,
): AssetPickerRow[] {
  const rows: AssetPickerRow[] = [];
  for (const category of categories) {
    const assets = assetsForCategory(category, objectById);
    if (assets.length === 0) continue;
    rows.push({ kind: 'header', category, count: assets.length });
    for (let i = 0; i < assets.length; i += gridColumns) {
      rows.push({ kind: 'assets', category, assets: assets.slice(i, i + gridColumns) });
    }
  }
  return rows;
}

export function assetPickerRowHeight(row: AssetPickerRow): number {
  return row.kind === 'header' ? 42 : 126;
}

export function totalAssetPickerContentHeight(rows: AssetPickerRow[]): number {
  return rows.reduce((sum, row) => sum + assetPickerRowHeight(row), 0);
}

export function clampedAssetPickerScrollY(scrollY: number, rows: AssetPickerRow[], contentH: number): number {
  return Phaser.Math.Clamp(scrollY, 0, Math.max(0, totalAssetPickerContentHeight(rows) - contentH));
}

export function assetPickerOffsetForAsset(rows: AssetPickerRow[], id: EditorObjectId): number {
  let offsetY = 0;
  for (const row of rows) {
    if (row.kind === 'assets' && row.assets.some(asset => asset.id === id)) return offsetY;
    offsetY += assetPickerRowHeight(row);
  }
  return 0;
}

export function firstAssetAfterScrollY(rows: AssetPickerRow[], scrollY: number): EditorObjectDefinition | undefined {
  let offsetY = 0;
  for (const row of rows) {
    offsetY += assetPickerRowHeight(row);
    if (offsetY < scrollY || row.kind !== 'assets') continue;
    return row.assets[0];
  }
  return undefined;
}

export function firstCategorizedAsset(
  categories: MapAssetCategory[],
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): EditorObjectDefinition | undefined {
  for (const category of categories) {
    const asset = assetsForCategory(category, objectById)[0];
    if (asset) return asset;
  }
  return undefined;
}

export function totalCategorizedAssets(
  categories: MapAssetCategory[],
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): number {
  return categories.reduce((sum, category) => sum + assetsForCategory(category, objectById).length, 0);
}
