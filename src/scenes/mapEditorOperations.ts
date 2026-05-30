import Phaser from 'phaser';
import { t } from '../i18n';
import { createEmptyEditorMap } from './mapEditorStorage';
import { footprintCells, footprintInBounds, objectTouchesCell } from './mapEditorGeometry';
import {
  MAX_H,
  MAX_W,
  MIN_H,
  MIN_W,
  type EditorMap,
  type EditorObjectDefinition,
  type EditorObjectId,
  type EditorTool,
} from './mapEditorTypes';
import { editorObjectIdFromTool, isEditorObjectTool } from './mapEditorTools';

export interface EditorToolResult {
  changed: boolean;
  message?: string;
}

export function applyEditorTool(
  map: EditorMap,
  activeTool: EditorTool,
  x: number,
  y: number,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): EditorToolResult {
  if (activeTool === 'block') {
    if (map.blocked[y]![x]) return { changed: false };
    map.blocked[y]![x] = true;
    return { changed: true };
  }
  if (activeTool === 'open') {
    if (!map.blocked[y]![x]) return { changed: false };
    map.blocked[y]![x] = false;
    return { changed: true };
  }
  if (activeTool === 'erase-object') {
    return { changed: eraseEditorObjectAt(map, objectById, x, y) };
  }
  if (isEditorObjectTool(activeTool)) {
    return placeEditorObject(map, objectById, editorObjectIdFromTool(activeTool), x, y);
  }
  if (map.tiles[y]![x] === activeTool) return { changed: false };
  map.tiles[y]![x] = activeTool;
  return { changed: true };
}

export function resizeEditorMap(
  map: EditorMap,
  width: number,
  height: number,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): EditorMap | undefined {
  const nextW = Phaser.Math.Clamp(width, MIN_W, MAX_W);
  const nextH = Phaser.Math.Clamp(height, MIN_H, MAX_H);
  if (nextW === map.width && nextH === map.height) return undefined;

  const next = createEmptyEditorMap(nextW, nextH, 'grass');
  for (let y = 0; y < Math.min(nextH, map.height); y++) {
    for (let x = 0; x < Math.min(nextW, map.width); x++) {
      next.tiles[y]![x] = map.tiles[y]![x]!;
      next.blocked[y]![x] = map.blocked[y]![x]!;
    }
  }
  next.objects = map.objects.filter(obj => {
    const def = objectById.get(obj.id);
    return def !== undefined && footprintInBounds(obj.x, obj.y, def.footprint, nextW, nextH);
  });
  return next;
}

function placeEditorObject(
  map: EditorMap,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
  id: EditorObjectId,
  x: number,
  y: number,
): EditorToolResult {
  const def = objectById.get(id);
  if (!def) {
    return { changed: false, message: t('Unknown object: {id}', { id }) };
  }
  if ((def.kind === 'structure' || def.isometric) && (!def.isometric || !def.footprint)) {
    return { changed: false, message: t('Asset rejected: iso-locked assets must use an isometric footprint.') };
  }
  if (!footprintInBounds(x, y, def.footprint, map.width, map.height)) {
    return { changed: false, message: t('{label} does not fit on the map.', { label: t(def.label) }) };
  }

  const cells = footprintCells(x, y, def.footprint);
  map.objects = map.objects.filter(obj =>
    !cells.some(cell => objectTouchesCell(obj, cell.x, cell.y, objectById.get(obj.id)?.footprint)),
  );
  map.objects.push({ id, x, y });
  return { changed: true };
}

function eraseEditorObjectAt(
  map: EditorMap,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
  x: number,
  y: number,
): boolean {
  for (let index = map.objects.length - 1; index >= 0; index--) {
    const obj = map.objects[index]!;
    if (!objectTouchesCell(obj, x, y, objectById.get(obj.id)?.footprint)) continue;
    map.objects.splice(index, 1);
    return true;
  }
  return false;
}
