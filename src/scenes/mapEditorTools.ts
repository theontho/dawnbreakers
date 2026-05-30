import { t } from '../i18n';
import type { EditorMap, EditorObjectDefinition, EditorObjectId, EditorTool, ObjectTool } from './mapEditorTypes';

export function editorObjectTool(id: EditorObjectId): ObjectTool {
  return `object:${id}`;
}

export function isEditorObjectTool(tool: EditorTool): tool is ObjectTool {
  return tool.startsWith('object:');
}

export function editorObjectIdFromTool(tool: ObjectTool): EditorObjectId {
  return tool.slice('object:'.length) as EditorObjectId;
}

export function editorObjectDefinitionForTool(
  tool: EditorTool,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): EditorObjectDefinition | undefined {
  if (!isEditorObjectTool(tool)) return undefined;
  return objectById.get(editorObjectIdFromTool(tool));
}

export function editorToolLabel(
  tool: EditorTool,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
): string {
  const objectDef = editorObjectDefinitionForTool(tool, objectById);
  if (objectDef) return t(objectDef.label);
  if (tool === 'block') return t('Block');
  if (tool === 'open') return t('Open');
  if (tool === 'erase-object') return t('Erase Object');
  return t(tool[0].toUpperCase() + tool.slice(1));
}

export function editorKindLabel(kind: EditorObjectDefinition['kind']): string {
  return t(kind[0].toUpperCase() + kind.slice(1));
}

export function editorStatusText(
  map: EditorMap,
  activeTool: EditorTool,
  objectById: ReadonlyMap<EditorObjectId, EditorObjectDefinition>,
  message?: string,
): string {
  const blockedCount = map.blocked.flat().filter(Boolean).length;
  const isoCount = map.objects.filter(obj => objectById.get(obj.id)?.isometric).length;
  const base = t('{width}x{height} | Tool: {tool} | Blocked: {blocked} | Objects: {objects} | Iso structures: {iso}', {
    width: map.width,
    height: map.height,
    tool: editorToolLabel(activeTool, objectById),
    blocked: blockedCount,
    objects: map.objects.length,
    iso: isoCount,
  });
  return message
    ? `${message}\n${base}`
    : `${base}\n${t('Iso lock: structures require diamond footprints and generated isometric sprites.')}`;
}

export function validateEditorObjectCatalog(objects: readonly EditorObjectDefinition[]): void {
  const invalid = objects.find(def =>
    (def.kind === 'structure' || def.isometric) && (!def.isometric || !def.footprint),
  );
  if (invalid) {
    throw new Error(`Map editor asset "${invalid.id}" must be isometric and declare a footprint.`);
  }
}
