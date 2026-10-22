import Phaser from 'phaser';
import type { CharacterTextureOptions } from '../scenes/characterTexture';
import type { TileKind } from '../scenes/baseMapTypes';
import { CHAPTER_OBJECTS } from './chapters';
import { TOWN_OBJECTS } from './townObjects';
import type { MapAssetCategory, MapAssetCategoryId, MapObjectDefinition, MapObjectId, MapTileDefinition } from './mapAssetTypes';

export const TILE_OPTIONS: MapTileDefinition[] = [
  { kind: 'grass', label: 'Grass', color: 0x4a6b3a, edge: 0x33502a, texture: 'tile-grass', code: 'g' },
  { kind: 'path', label: 'Path', color: 0x9c8458, edge: 0x6d5b3b, texture: 'tile-path', code: 'p' },
  { kind: 'stone', label: 'Stone', color: 0x6b5a44, edge: 0x4a3d2e, texture: 'tile-stone', code: 's' },
  { kind: 'water', label: 'Water', color: 0x2c4a6b, edge: 0x1a3050, texture: 'tile-water', code: 'w' },
  { kind: 'sand', label: 'Sand', color: 0xb89968, edge: 0x856b42, texture: 'tile-sand', code: 'a' },
  { kind: 'floor', label: 'Tiled Floor', color: 0xa66a4a, edge: 0x6e4430, texture: 'tile-floor', code: 'f' },
  { kind: 'wood', label: 'Wooden Floor', color: 0x7c5636, edge: 0x4e3420, texture: 'tile-wood', code: 'd' },
];

export const TILE_CODE = Object.fromEntries(TILE_OPTIONS.map(tile => [tile.kind, tile.code])) as Record<TileKind, string>;
export const CODE_TILE = Object.fromEntries(TILE_OPTIONS.map(tile => [tile.code, tile.kind])) as Record<string, TileKind>;

const BASE_OBJECTS: MapObjectDefinition[] = [
  { id: 'crates', label: 'Crates', texture: 'crates', kind: 'prop', category: 'market-supplies', color: 0x8a5a2a, blocks: true },
  { id: 'lamp', label: 'Lamp', texture: 'lamp', kind: 'prop', category: 'lighting-effects', color: 0xd8a23a, blocks: true },
  { id: 'rug', label: 'Rug', texture: 'rug', kind: 'prop', category: 'furnishings', color: 0x7a1f1f, blocks: false },
  { id: 'well', label: 'Well', texture: 'well', kind: 'prop', category: 'bridges-water', color: 0x8f8068, blocks: true },
  { id: 'interior-mihrab', label: 'Prayer Niche', texture: 'interior-mihrab', kind: 'prop', category: 'shrines', color: 0x24477a, blocks: true },
  { id: 'interior-wall', label: 'Interior Wall', texture: 'interior-wall', kind: 'prop', category: 'barriers-prison', color: 0xd6c9aa, blocks: true },
  { id: 'writing-desk', label: 'Writing Desk', texture: 'writing-desk', kind: 'prop', category: 'furnishings', color: 0x8a5a2a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'floor-writing-board', label: 'Writing Board', texture: 'floor-writing-board', kind: 'prop', category: 'furnishings', color: 0xb89a6a, blocks: true },
  { id: 'crowd', label: 'Crowd', texture: 'crowd', kind: 'prop', category: 'people-crowds', color: 0x6b5a44, blocks: true },
  { id: 'crowd-shadow', label: 'Crowd Shadow', texture: 'crowd-shadow', kind: 'prop', category: 'people-crowds', color: 0x2a221e, blocks: false },
  { id: 'traveller', label: 'Traveller', texture: 'editor-char-traveller', kind: 'character', category: 'characters', color: 0x4a3a2a, blocks: true, character: characterOptions(0x4a3a2a, 'sash', 'headscarf') },
  { id: 'merchant', label: 'Merchant', texture: 'editor-char-merchant', kind: 'character', category: 'characters', color: 0x8a5a2a, blocks: true, character: characterOptions(0x8a5a2a, 'vest', 'cap') },
  { id: 'guard', label: 'Guard', texture: 'editor-char-guard', kind: 'character', category: 'characters', color: 0x39404a, blocks: true, character: characterOptions(0x39404a, 'uniform', 'tallHat') },
  { id: 'pilgrim', label: 'Pilgrim', texture: 'editor-char-pilgrim', kind: 'character', category: 'characters', color: 0xf2ead6, blocks: true, character: characterOptions(0x6b5a44, 'wrap', 'veil') },
  { id: 'npc-traveller', label: 'Traveller', texture: 'npc-traveller', kind: 'character', category: 'characters', color: 0x4a3a2a, blocks: true,
    character: { body: 0x5a4a36, skin: 0xd6b88a, clothing: { style: 'sash', secondary: 0x8a6a42, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xcfc2a0, accent: 0x5a4a36 }, shadow: true } },
  { id: 'npc-merchant', label: 'Merchant', texture: 'npc-merchant', kind: 'character', category: 'characters', color: 0x8a5a2a, blocks: true,
    character: { body: 0x8a5a2a, skin: 0xdcbc8e, clothing: { style: 'vest', secondary: 0x4a5a3a, accent: 0xc9a55c }, hat: { style: 'cap', color: 0x3a2a1e }, shadow: true } },
  { id: 'npc-mulla', label: 'Mulla', texture: 'npc-mulla', kind: 'character', category: 'characters', color: 0x1a1a1a, blocks: true,
    character: { body: 0x4a4436, skin: 0xd9c29a, clothing: { style: 'cloak', secondary: 0x22201c, accent: 0x8a7450 }, hat: { style: 'turban', color: 0xece6d6, accent: 0x4a4436 }, hair: 0x3a3a36, shadow: true } },
  { id: 'player', label: 'Player', texture: 'player', kind: 'character', category: 'characters', color: 0x6a3a3a, blocks: true,
    character: { body: 0x6a3a3a, skin: 0xdcbf92, clothing: { style: 'cloak', secondary: 0x6b5a44, accent: 0xc9a55c }, hat: { style: 'cap', color: 0x2e2620 }, hair: 0x2a1a10, shadow: true } },
];

/** Every placeable object: shared base pieces first, then each chapter's own set. */
export const MAP_OBJECTS: MapObjectDefinition[] = [...BASE_OBJECTS, ...TOWN_OBJECTS, ...CHAPTER_OBJECTS];

export const MAP_OBJECT_BY_ID: ReadonlyMap<MapObjectId, MapObjectDefinition> =
  new Map(MAP_OBJECTS.map(def => [def.id, def]));
export const MAP_SCENERY_OBJECTS = MAP_OBJECTS.filter(def => def.kind !== 'character');
export const MAP_CHARACTER_OBJECTS = MAP_OBJECTS.filter(def => def.kind === 'character');
const CATEGORY_META: ReadonlyArray<Omit<MapAssetCategory, 'objectIds'>> = [
  { id: 'buildings', label: 'Buildings', description: 'Houses, city structures, tents, gates, and large architectural pieces.' },
  { id: 'shrines', label: 'Shrines', description: 'Mosques, shrines, prayer spaces, and sacred architectural details.' },
  { id: 'bridges-water', label: 'Bridges & Water', description: 'Bridge spans, wells, river edges, reeds, and stream features.' },
  { id: 'plants', label: 'Plants', description: 'Trees, cypress, shrubs, rosebushes, and planters.' },
  { id: 'furnishings', label: 'Furnishings', description: 'Interior and courtyard details such as rugs, doors, desks, thresholds, and ship pieces.' },
  { id: 'market-supplies', label: 'Market & Supplies', description: 'Crates, bundles, ropes, and other movable supply objects.' },
  { id: 'barriers-prison', label: 'Barriers & Prison', description: 'Fortress, palisade, roof, prison, chain, rock, and blocking assets.' },
  { id: 'lighting-effects', label: 'Lighting & Effects', description: 'Lamps, birds, light shafts, empty-space markers, and atmosphere.' },
  { id: 'people-crowds', label: 'People & Crowds', description: 'Crowd markers and group scene elements that are not individual characters.' },
  { id: 'characters', label: 'Characters', description: 'All placeable player, NPC, and chapter character variants.' },
];

export const MAP_ASSET_CATEGORIES: MapAssetCategory[] = CATEGORY_META
  .map(meta => ({ ...meta, objectIds: MAP_OBJECTS.filter(def => def.category === meta.id).map(def => def.id) }))
  .filter(category => category.objectIds.length > 0);
export const MAP_ASSET_CATEGORY_BY_ID: ReadonlyMap<MapAssetCategoryId, MapAssetCategory> =
  new Map(MAP_ASSET_CATEGORIES.map(category => [category.id, category]));

export function getMapObjectDefinition(id: MapObjectId): MapObjectDefinition {
  const def = MAP_OBJECT_BY_ID.get(id);
  if (!def) throw new Error(`Unknown map asset "${id}". Add it to mapAssetLibrary.ts before placing it.`);
  return def;
}

export function getMapObjectsForCategory(id: MapAssetCategoryId): MapObjectDefinition[] {
  const category = MAP_ASSET_CATEGORY_BY_ID.get(id);
  if (!category) return [];
  return category.objectIds
    .map(objectId => MAP_OBJECT_BY_ID.get(objectId))
    .filter((def): def is MapObjectDefinition => def !== undefined);
}

function characterOptions(
  body: number,
  style: NonNullable<CharacterTextureOptions['clothing']>['style'],
  hat: NonNullable<CharacterTextureOptions['hat']>['style'],
): CharacterTextureOptions {
  return {
    body,
    skin: 0xd9c79a,
    clothing: { style, secondary: lighten(body, 18), accent: 0xc9a55c },
    hat: { style: hat, color: darken(body, 18) },
    hair: 0x2d1b10,
    shadow: true,
  };
}

function lighten(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).lighten(amount).color;
}

function darken(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).darken(amount).color;
}
