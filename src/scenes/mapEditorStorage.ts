import { CODE_TILE, TILE_CODE } from '../assets/mapAssetLibrary';
import type { TileKind } from './baseMapTypes';
import { footprintInBounds } from './mapEditorGeometry';
import {
  MAX_H,
  MAX_W,
  MIN_H,
  MIN_W,
  type EditorMap,
  type EditorObjectDefinition,
  type EditorObjectId,
  type StoredEditorMap,
} from './mapEditorTypes';

export function saveEditorMap(
  storage: Storage,
  key: string,
  map: EditorMap,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): void {
  storage.setItem(key, JSON.stringify(encodeEditorMap(map, objectById)));
}

export function loadEditorMap(
  storage: Storage,
  key: string,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): EditorMap | undefined {
  const raw = storage.getItem(key);
  if (!raw) return undefined;
  const parsed = JSON.parse(raw) as unknown;
  if (!isStoredEditorMap(parsed, objectById)) return undefined;
  return decodeEditorMap(parsed, objectById);
}

export function encodeEditorMap(
  map: EditorMap,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): StoredEditorMap {
  return {
    width: map.width,
    height: map.height,
    tiles: map.tiles.map(row => row.map(tile => TILE_CODE[tile]).join('')),
    blocked: map.blocked.map(row => row.map(blocked => blocked ? '#' : '.').join('')),
    objects: map.objects.map(obj => {
      const def = objectById.get(obj.id);
      return {
        ...obj,
        texture: def?.texture,
        kind: def?.kind,
        blocks: def?.blocks,
        footprint: def?.footprint,
        isometric: def?.isometric,
      };
    }),
  };
}

export function decodeEditorMap(
  stored: StoredEditorMap,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): EditorMap {
  const decoded = createEmptyEditorMap(stored.width, stored.height, 'grass');
  for (let y = 0; y < stored.height; y++) {
    for (let x = 0; x < stored.width; x++) {
      decoded.tiles[y]![x] = CODE_TILE[stored.tiles[y]![x]!]!;
      decoded.blocked[y]![x] = stored.blocked[y]![x] === '#';
    }
  }
  decoded.objects = (stored.objects ?? [])
    .filter(obj => objectById.has(obj.id))
    .map(obj => ({ id: obj.id, x: obj.x, y: obj.y }));
  return decoded;
}

export function isStoredEditorMap(
  value: unknown,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): value is StoredEditorMap {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (!Number.isInteger(record.width) || !Number.isInteger(record.height)) return false;
  if (!Array.isArray(record.tiles) || !Array.isArray(record.blocked)) return false;

  const width = record.width as number;
  const height = record.height as number;
  if (width < MIN_W || width > MAX_W || height < MIN_H || height > MAX_H) return false;
  if (record.tiles.length !== height || record.blocked.length !== height) return false;

  const validTiles = record.tiles.every(row =>
    typeof row === 'string' &&
    row.length === width &&
    [...row].every(code => CODE_TILE[code] !== undefined),
  );
  const validBlocked = record.blocked.every(row =>
    typeof row === 'string' &&
    row.length === width &&
    [...row].every(code => code === '#' || code === '.'),
  );
  if (!validTiles || !validBlocked) return false;

  if (record.objects === undefined) return true;
  if (!Array.isArray(record.objects)) return false;
  return record.objects.every(obj => {
    if (!obj || typeof obj !== 'object') return false;
    const candidate = obj as Record<string, unknown>;
    if (typeof candidate.id !== 'string' || !objectById.has(candidate.id as EditorObjectId)) return false;
    if (!Number.isInteger(candidate.x) || !Number.isInteger(candidate.y)) return false;
    const def = objectById.get(candidate.id as EditorObjectId);
    return def !== undefined && footprintInBounds(
      candidate.x as number,
      candidate.y as number,
      def.footprint,
      width,
      height,
    );
  });
}

export function createDefaultEditorMap(width: number, height: number): EditorMap {
  const map = createEmptyEditorMap(width, height, 'grass');
  const midY = Math.floor(height / 2);
  const midX = Math.floor(width / 2);
  for (let x = 0; x < width; x++) map.tiles[midY]![x] = 'path';
  for (let y = 0; y < height; y++) map.tiles[y]![midX] = 'path';
  for (let x = 0; x < width; x++) {
    map.tiles[0]![x] = 'sand';
    map.tiles[height - 1]![x] = 'sand';
  }
  for (let y = 0; y < height; y++) {
    map.tiles[y]![0] = 'sand';
    map.tiles[y]![width - 1] = 'sand';
  }
  map.objects.push({ id: 'town-house-small', x: 3, y: 3 });
  map.objects.push({ id: 'cypress', x: width - 4, y: 3 });
  map.objects.push({ id: 'traveller', x: midX + 2, y: midY });
  return map;
}

export function createEmptyEditorMap(width: number, height: number, fill: TileKind): EditorMap {
  const tiles: TileKind[][] = [];
  const blocked: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    tiles.push(Array.from({ length: width }, () => fill));
    blocked.push(Array.from({ length: width }, () => false));
  }
  return { width, height, tiles, blocked, objects: [] };
}
