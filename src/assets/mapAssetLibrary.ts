import Phaser from 'phaser';
import type { IsoPoint, TileKind } from '../scenes/BaseMapScene';
import { makeCharacterTexture, type CharacterTextureOptions } from '../scenes/characterTexture';

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

interface AssetIsoPrism {
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

const TILE_W = 64;
const TILE_H = 32;

export const TILE_OPTIONS: MapTileDefinition[] = [
  { kind: 'grass', label: 'Grass', color: 0x4a6b3a, edge: 0x33502a, texture: 'tile-grass', code: 'g' },
  { kind: 'path', label: 'Path', color: 0x9c8458, edge: 0x6d5b3b, texture: 'tile-path', code: 'p' },
  { kind: 'stone', label: 'Stone', color: 0x6b5a44, edge: 0x4a3d2e, texture: 'tile-stone', code: 's' },
  { kind: 'water', label: 'Water', color: 0x2c4a6b, edge: 0x1a3050, texture: 'tile-water', code: 'w' },
  { kind: 'sand', label: 'Sand', color: 0xb89968, edge: 0x856b42, texture: 'tile-sand', code: 'a' },
];

export const TILE_CODE = Object.fromEntries(TILE_OPTIONS.map(tile => [tile.kind, tile.code])) as Record<TileKind, string>;
export const CODE_TILE = Object.fromEntries(TILE_OPTIONS.map(tile => [tile.code, tile.kind])) as Record<string, TileKind>;

export const MAP_OBJECTS: MapObjectDefinition[] = [
  { id: 'house', label: 'House', texture: 'house', kind: 'structure', color: 0x8a5a2a, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'mosque', label: 'Mosque', texture: 'mosque', kind: 'structure', color: 0xd8c07a, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'market-stall', label: 'Market Stall', texture: 'stall', kind: 'structure', color: 0xc94f4f, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'gate', label: 'Gate', texture: 'gate', kind: 'structure', color: 0x8f8068, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'bridge', label: 'Bridge', texture: 'bridge', kind: 'structure', color: 0x7b6142, blocks: false, footprint: { w: 3, h: 1 }, isometric: true },
  { id: 'tree', label: 'Tree', texture: 'tree', kind: 'prop', color: 0x3f6f45, blocks: true },
  { id: 'cypress', label: 'Cypress', texture: 'cypress', kind: 'prop', color: 0x234c2f, blocks: true },
  { id: 'crates', label: 'Crates', texture: 'crates', kind: 'prop', color: 0x8a5a2a, blocks: true },
  { id: 'lamp', label: 'Lamp', texture: 'lamp', kind: 'prop', color: 0xd8a23a, blocks: true },
  { id: 'rug', label: 'Rug', texture: 'rug', kind: 'prop', color: 0x7a1f1f, blocks: false },
  { id: 'well', label: 'Well', texture: 'well', kind: 'prop', color: 0x8f8068, blocks: true },
  { id: 'closed-door', label: 'Closed Door', texture: 'closed-door', kind: 'prop', color: 0x5b3320, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'writing-desk', label: 'Writing Desk', texture: 'writing-desk', kind: 'prop', color: 0x8a5a2a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'crowd', label: 'Crowd', texture: 'crowd', kind: 'prop', color: 0x6b5a44, blocks: true },
  { id: 'crowd-shadow', label: 'Crowd Shadow', texture: 'crowd-shadow', kind: 'prop', color: 0x2a221e, blocks: false },
  { id: 'traveller', label: 'Traveller', texture: 'editor-char-traveller', kind: 'character', color: 0x4a3a2a, blocks: true, character: characterOptions(0x4a3a2a, 'sash', 'headscarf') },
  { id: 'merchant', label: 'Merchant', texture: 'editor-char-merchant', kind: 'character', color: 0x8a5a2a, blocks: true, character: characterOptions(0x8a5a2a, 'vest', 'cap') },
  { id: 'guard', label: 'Guard', texture: 'editor-char-guard', kind: 'character', color: 0x39404a, blocks: true, character: characterOptions(0x39404a, 'uniform', 'tallHat') },
  { id: 'pilgrim', label: 'Pilgrim', texture: 'editor-char-pilgrim', kind: 'character', color: 0xf2ead6, blocks: true, character: characterOptions(0x6b5a44, 'wrap', 'veil') },

  { id: 'ch1-birds', label: 'Birds', texture: 'ch1-birds', kind: 'prop', color: 0x1f1a14, blocks: false },
  { id: 'ch1-house-threshold', label: 'House Threshold', texture: 'ch1-house-threshold', kind: 'prop', color: 0xc9a55c, blocks: false },
  { id: 'ch1-planter', label: 'Planter', texture: 'ch1-planter', kind: 'prop', color: 0x4d7a3a, blocks: true },

  { id: 'ch2-caravanserai', label: 'Caravanserai', texture: 'ch2-caravanserai', kind: 'structure', color: 0xa87846, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch2-shrine', label: 'Road Shrine', texture: 'ch2-shrine', kind: 'structure', color: 0xd8c07a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch2-milestone', label: 'Milestone', texture: 'ch2-milestone', kind: 'prop', color: 0xb8aa82, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch2-dry-stream', label: 'Dry Stream', texture: 'ch2-dry-stream', kind: 'prop', color: 0x5d6f7a, blocks: false },
  { id: 'ch2-tamarisk', label: 'Tamarisk', texture: 'ch2-tamarisk', kind: 'prop', color: 0x6f8a45, blocks: true },

  { id: 'ch3-kaaba', label: 'Kaaba', texture: 'ch3-kaaba', kind: 'structure', color: 0x181512, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch3-pilgrim-cluster', label: 'Pilgrim Cluster', texture: 'ch3-pilgrim-cluster', kind: 'prop', color: 0x6b5a44, blocks: true },
  { id: 'ch3-courtyard-hush', label: 'Courtyard Hush', texture: 'ch3-courtyard-hush', kind: 'prop', color: 0xd8c07a, blocks: false },
  { id: 'ch3-mast', label: 'Ship Mast', texture: 'ch3-mast', kind: 'prop', color: 0x8a5a2a, blocks: true },
  { id: 'ch3-ship-rail', label: 'Ship Rail', texture: 'ch3-ship-rail', kind: 'prop', color: 0x6b5136, blocks: false },

  { id: 'ch4-pulpit', label: 'Pulpit', texture: 'ch4-pulpit', kind: 'prop', color: 0x8a5a2a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch4-prayer-arch', label: 'Prayer Arch', texture: 'ch4-prayer-arch', kind: 'prop', color: 0xd8c07a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },

  { id: 'ch5-bridge-span', label: 'Bridge Span', texture: 'ch5-bridge-span', kind: 'structure', color: 0x8a7552, blocks: false, footprint: { w: 5, h: 2 }, isometric: true },
  { id: 'ch5-market-awning', label: 'Market Awning', texture: 'ch5-market-awning', kind: 'structure', color: 0x315f68, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch5-river-reeds', label: 'River Reeds', texture: 'ch5-river-reeds', kind: 'prop', color: 0x637a3a, blocks: true },
  { id: 'ch5-palace-portico', label: 'Palace Portico', texture: 'ch5-palace-portico', kind: 'structure', color: 0xc8b174, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },

  { id: 'ch6-maku-fortress', label: 'Maku Fortress', texture: 'ch6-maku-fortress', kind: 'structure', color: 0x786f68, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch6-chihriq-fortress', label: 'Chihriq Fortress', texture: 'ch6-chihriq-fortress', kind: 'structure', color: 0x6b6f76, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch6-rock', label: 'Mountain Rock', texture: 'ch6-rock', kind: 'prop', color: 0x7c766f, blocks: true },
  { id: 'ch6-snow-shrub', label: 'Snow Shrub', texture: 'ch6-snow-shrub', kind: 'prop', color: 0xd9e3e8, blocks: true },
  { id: 'ch6-barred-marker', label: 'Barred Marker', texture: 'ch6-barred-marker', kind: 'prop', color: 0x3f4650, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },

  { id: 'ch7-tent-quddus', label: 'Quddus Tent', texture: 'ch7-tent-quddus', kind: 'structure', color: 0xe0d6b8, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch7-tent-reconciliation', label: 'Reconciliation Tent', texture: 'ch7-tent-reconciliation', kind: 'structure', color: 0xc8b174, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch7-garden-canopy', label: 'Garden Canopy', texture: 'ch7-garden-canopy', kind: 'structure', color: 0x8f6f45, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch7-rosebush', label: 'Rosebush', texture: 'ch7-rosebush', kind: 'prop', color: 0xb93a4d, blocks: true },

  { id: 'ch8-shrine-glimpse', label: 'Shrine Glimpse', texture: 'ch8-shrine-glimpse', kind: 'structure', color: 0xd8c07a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch8-palisade', label: 'Palisade', texture: 'ch8-palisade', kind: 'prop', color: 0x6b5136, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch8-shrine', label: 'Tabarsi Shrine', texture: 'ch8-shrine', kind: 'structure', color: 0xd8c07a, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch8-truce-flag', label: 'Truce Flag', texture: 'ch8-truce-flag', kind: 'prop', color: 0xf2ead6, blocks: true },

  { id: 'ch9-barrack-front', label: 'Barrack Front', texture: 'ch9-barrack-front', kind: 'structure', color: 0x8c7f6a, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch9-cloth-bundle', label: 'Cloth Bundle', texture: 'ch9-cloth-bundle', kind: 'prop', color: 0xd0c1a0, blocks: true },
  { id: 'ch9-rope-coils', label: 'Rope Coils', texture: 'ch9-rope-coils', kind: 'prop', color: 0xb88742, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-empty-space', label: 'Empty Space', texture: 'ch9-empty-space', kind: 'prop', color: 0x3f3a34, blocks: false },
  { id: 'ch9-roof-parapet', label: 'Roof Parapet', texture: 'ch9-roof-parapet', kind: 'structure', color: 0x6b6258, blocks: true, footprint: { w: 4, h: 1 }, isometric: true },
  { id: 'ch9-roof-north-wall', label: 'Roof North Wall', texture: 'ch9-roof-north-wall', kind: 'structure', color: 0x6b6258, blocks: true, footprint: { w: 14, h: 1 }, isometric: true },
  { id: 'ch9-roof-east-wall', label: 'Roof East Wall', texture: 'ch9-roof-east-wall', kind: 'structure', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 8 }, isometric: true },
  { id: 'ch9-roof-south-wall-left', label: 'Roof South Wall L', texture: 'ch9-roof-south-wall-left', kind: 'structure', color: 0x6b6258, blocks: true, footprint: { w: 5, h: 1 }, isometric: true },
  { id: 'ch9-roof-south-wall-right', label: 'Roof South Wall R', texture: 'ch9-roof-south-wall-right', kind: 'structure', color: 0x6b6258, blocks: true, footprint: { w: 7, h: 1 }, isometric: true },

  { id: 'ch10-street-house', label: 'Tehran House', texture: 'ch10-street-house', kind: 'structure', color: 0x8a5a2a, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch10-street-arch', label: 'Street Arch', texture: 'ch10-street-arch', kind: 'structure', color: 0x6b6258, blocks: true, footprint: { w: 2, h: 1 }, isometric: true },
  { id: 'ch10-low-arch', label: 'Low Arch', texture: 'ch10-low-arch', kind: 'structure', color: 0x6b6258, blocks: true, footprint: { w: 4, h: 1 }, isometric: true },
  { id: 'ch10-stone-pillar', label: 'Stone Pillar', texture: 'ch10-stone-pillar', kind: 'structure', color: 0x8f897c, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch10-chain-pillar', label: 'Chain Pillar', texture: 'ch10-chain-pillar', kind: 'prop', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-chain-post', label: 'Chain Post', texture: 'ch10-chain-post', kind: 'prop', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-chain-coil', label: 'Chain Coil', texture: 'ch10-chain-coil', kind: 'prop', color: 0x3f4650, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-light-shaft', label: 'Light Shaft', texture: 'ch10-light-shaft', kind: 'prop', color: 0xf3d98a, blocks: false },

  { id: 'npc-bab', label: 'The Bab', texture: 'npc-bab', kind: 'character', color: 0xf2ead6, blocks: true },
  { id: 'npc-traveller', label: 'Traveller', texture: 'npc-traveller', kind: 'character', color: 0x4a3a2a, blocks: true },
  { id: 'npc-merchant', label: 'Merchant', texture: 'npc-merchant', kind: 'character', color: 0x8a5a2a, blocks: true },
  { id: 'npc-mulla', label: 'Mulla', texture: 'npc-mulla', kind: 'character', color: 0x1a1a1a, blocks: true },
  { id: 'player', label: 'Player', texture: 'player', kind: 'character', color: 0x6a3a3a, blocks: true },
  { id: 'ch1-npc-water-carrier', label: 'Water-Carrier', texture: 'ch1-npc-water-carrier', kind: 'character', color: 0x2d5f73, blocks: true },
  { id: 'ch1-npc-guard', label: 'Gate Guard', texture: 'ch1-npc-guard', kind: 'character', color: 0x5a4630, blocks: true },
  { id: 'ch1-npc-calligrapher', label: 'Calligrapher', texture: 'ch1-npc-calligrapher', kind: 'character', color: 0x46345f, blocks: true },
  { id: 'ch1-npc-beggar', label: 'Mosque Orphan', texture: 'ch1-npc-beggar', kind: 'character', color: 0x6b5a44, blocks: true },
  { id: 'ch1-npc-servant', label: 'House Servant', texture: 'ch1-npc-servant', kind: 'character', color: 0x7a5a3a, blocks: true },
  { id: 'ch3-muhit', label: 'Muhit', texture: 'ch3-muhit', kind: 'character', color: 0x5a3a2a, blocks: true },
  { id: 'ch3-pilgrim', label: 'Pilgrim', texture: 'ch3-pilgrim', kind: 'character', color: 0xf2ead6, blocks: true },
  { id: 'ch3-quddus', label: 'Quddus', texture: 'ch3-quddus', kind: 'character', color: 0x5a3a2a, blocks: true },
  { id: 'ch3-sailor', label: 'Sailor', texture: 'ch3-sailor', kind: 'character', color: 0x2f4a5f, blocks: true },
  { id: 'ch3-ship-pilgrim', label: 'Ship Pilgrim', texture: 'ch3-ship-pilgrim', kind: 'character', color: 0x8f5a2f, blocks: true },
  { id: 'ch4-officer', label: 'Officer', texture: 'ch4-officer', kind: 'character', color: 0x39404a, blocks: true },
  { id: 'ch4-witness', label: 'Witness', texture: 'ch4-witness', kind: 'character', color: 0x6b5a44, blocks: true },
  { id: 'ch4-quddus', label: 'Quddus', texture: 'ch4-quddus', kind: 'character', color: 0x5a3a2a, blocks: true },
  { id: 'ch4-townsman', label: 'Townsman', texture: 'ch4-townsman', kind: 'character', color: 0x8a5a2a, blocks: true },
  { id: 'ch5-mutamid', label: 'Mutamid', texture: 'ch5-mutamid', kind: 'character', color: 0x5f4a72, blocks: true },
  { id: 'ch6-warden', label: 'Warden', texture: 'ch6-warden', kind: 'character', color: 0x39404a, blocks: true },
  { id: 'ch6-courier', label: 'Courier', texture: 'ch6-courier', kind: 'character', color: 0x8f5a2f, blocks: true },
  { id: 'ch6-mulla-husayn', label: 'Mulla Husayn', texture: 'ch6-mulla-husayn', kind: 'character', color: 0x2f4a5f, blocks: true },
  { id: 'ch7-npc-tahirih', label: 'Tahirih', texture: 'ch7-npc-tahirih', kind: 'character', color: 0x6f2236, blocks: true },
  { id: 'ch7-npc-quddus', label: 'Quddus', texture: 'ch7-npc-quddus', kind: 'character', color: 0x5a3a2a, blocks: true },
  { id: 'ch7-npc-believer', label: 'Believer', texture: 'ch7-npc-believer', kind: 'character', color: 0x7a5a3a, blocks: true },
  { id: 'ch8-mulla-husayn', label: 'Mulla Husayn', texture: 'ch8-mulla-husayn', kind: 'character', color: 0x2f4a5f, blocks: true },
  { id: 'ch9-witness', label: 'Witness', texture: 'ch9-witness', kind: 'character', color: 0x6b5a44, blocks: true },
  { id: 'ch9-soldier', label: 'Soldier', texture: 'ch9-soldier', kind: 'character', color: 0x39404a, blocks: true },
  { id: 'ch9-final-witness', label: 'Final Witness', texture: 'ch9-final-witness', kind: 'character', color: 0xf2ead6, blocks: true },
  { id: 'ch9-sam-khan', label: 'Sam Khan', texture: 'ch9-sam-khan', kind: 'character', color: 0x59606a, blocks: true },
  { id: 'ch10-guard', label: 'Tehran Guard', texture: 'ch10-guard', kind: 'character', color: 0x39404a, blocks: true },
  { id: 'ch10-prisoner', label: 'Prisoner', texture: 'ch10-prisoner', kind: 'character', color: 0x6b6258, blocks: true },
];

export const MAP_OBJECT_BY_ID: ReadonlyMap<MapObjectId, MapObjectDefinition> =
  new Map(MAP_OBJECTS.map(def => [def.id, def]));
export const MAP_SCENERY_OBJECTS = MAP_OBJECTS.filter(def => def.kind !== 'character');
export const MAP_CHARACTER_OBJECTS = MAP_OBJECTS.filter(def => def.kind === 'character');
export const MAP_ASSET_CATEGORIES: MapAssetCategory[] = ([
  {
    id: 'buildings',
    label: 'Buildings',
    description: 'Houses, city structures, tents, gates, and large architectural pieces.',
    objectIds: [
      'house',
      'market-stall',
      'gate',
      'ch2-caravanserai',
      'ch5-market-awning',
      'ch5-palace-portico',
      'ch7-tent-quddus',
      'ch7-tent-reconciliation',
      'ch7-garden-canopy',
      'ch9-barrack-front',
      'ch10-street-house',
      'ch10-street-arch',
    ],
  },
  {
    id: 'shrines',
    label: 'Shrines',
    description: 'Mosques, shrines, prayer spaces, and sacred architectural details.',
    objectIds: [
      'mosque',
      'ch2-shrine',
      'ch3-kaaba',
      'ch3-courtyard-hush',
      'ch4-pulpit',
      'ch4-prayer-arch',
      'ch8-shrine-glimpse',
      'ch8-shrine',
    ],
  },
  {
    id: 'bridges-water',
    label: 'Bridges & Water',
    description: 'Bridge spans, wells, river edges, reeds, and stream features.',
    objectIds: [
      'bridge',
      'well',
      'ch2-dry-stream',
      'ch5-bridge-span',
      'ch5-river-reeds',
    ],
  },
  {
    id: 'plants',
    label: 'Plants',
    description: 'Trees, cypress, shrubs, rosebushes, and planters.',
    objectIds: [
      'tree',
      'cypress',
      'ch1-planter',
      'ch2-tamarisk',
      'ch6-snow-shrub',
      'ch7-rosebush',
    ],
  },
  {
    id: 'furnishings',
    label: 'Furnishings',
    description: 'Interior and courtyard details such as rugs, doors, desks, thresholds, and ship pieces.',
    objectIds: [
      'rug',
      'closed-door',
      'writing-desk',
      'ch1-house-threshold',
      'ch2-milestone',
      'ch3-mast',
      'ch3-ship-rail',
    ],
  },
  {
    id: 'market-supplies',
    label: 'Market & Supplies',
    description: 'Crates, bundles, ropes, and other movable supply objects.',
    objectIds: [
      'crates',
      'ch9-cloth-bundle',
      'ch9-rope-coils',
    ],
  },
  {
    id: 'barriers-prison',
    label: 'Barriers & Prison',
    description: 'Fortress, palisade, roof, prison, chain, rock, and blocking assets.',
    objectIds: [
      'ch6-maku-fortress',
      'ch6-chihriq-fortress',
      'ch6-rock',
      'ch6-barred-marker',
      'ch8-palisade',
      'ch8-truce-flag',
      'ch9-roof-parapet',
      'ch9-roof-north-wall',
      'ch9-roof-east-wall',
      'ch9-roof-south-wall-left',
      'ch9-roof-south-wall-right',
      'ch10-low-arch',
      'ch10-stone-pillar',
      'ch10-chain-pillar',
      'ch10-chain-post',
      'ch10-chain-coil',
    ],
  },
  {
    id: 'lighting-effects',
    label: 'Lighting & Effects',
    description: 'Lamps, birds, light shafts, empty-space markers, and atmosphere.',
    objectIds: [
      'lamp',
      'ch1-birds',
      'ch9-empty-space',
      'ch10-light-shaft',
    ],
  },
  {
    id: 'people-crowds',
    label: 'People & Crowds',
    description: 'Crowd markers and group scene elements that are not individual characters.',
    objectIds: [
      'crowd',
      'crowd-shadow',
      'ch3-pilgrim-cluster',
    ],
  },
  {
    id: 'characters',
    label: 'Characters',
    description: 'All placeable player, NPC, and chapter character variants.',
    objectIds: idsWhere(def => def.kind === 'character'),
  },
] satisfies MapAssetCategory[]).filter(category => category.objectIds.length > 0);
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

export function ensureTileTextures(scene: Phaser.Scene): void {
  for (const tile of TILE_OPTIONS) {
    if (!scene.textures.exists(tile.texture)) makeIsoTile(scene, tile.texture, tile.color, tile.edge);
  }
}

export function ensureMapAssetTextures(scene: Phaser.Scene): void {
  for (const def of MAP_OBJECTS) ensureMapAssetTexture(scene, def);
}

export function ensureMapAssetTexture(scene: Phaser.Scene, def: MapObjectDefinition): void {
  if (scene.textures.exists(def.texture)) return;
  if (def.character || def.kind === 'character') {
    makeCharacterTexture(scene, def.texture, def.character ?? genericCharacterOptions(def));
    return;
  }
  if (def.kind === 'structure') {
    makeGenericIsoStructureTexture(scene, def);
    return;
  }
  makeGenericPropTexture(scene, def);
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

function idsWhere(predicate: (def: MapObjectDefinition) => boolean): MapObjectId[] {
  return MAP_OBJECTS.filter(predicate).map(def => def.id);
}

function genericCharacterOptions(def: MapObjectDefinition): CharacterTextureOptions {
  const styles = ['robe', 'cloak', 'vest', 'uniform', 'sash', 'wrap'] as const;
  const hats = ['none', 'turban', 'cap', 'veil', 'headscarf', 'hood', 'tallHat'] as const;
  const skin = [0xd9c79a, 0xe6c89a, 0xc8b48d, 0xb8916d];
  const hash = stringHash(def.id);
  return {
    body: def.color,
    skin: skin[hash % skin.length],
    clothing: {
      style: styles[hash % styles.length],
      secondary: lighten(def.color, 18),
      accent: 0xc9a55c,
    },
    hat: {
      style: hats[hash % hats.length],
      color: darken(def.color, 18),
    },
    hair: 0x2d1b10,
    shadow: true,
  };
}

function makeIsoTile(scene: Phaser.Scene, key: string, fill: number, edge: number): void {
  const g = scene.add.graphics();
  g.fillStyle(fill, 1);
  g.lineStyle(1, edge, 1);
  g.beginPath();
  g.moveTo(TILE_W / 2, 0);
  g.lineTo(TILE_W, TILE_H / 2);
  g.lineTo(TILE_W / 2, TILE_H);
  g.lineTo(0, TILE_H / 2);
  g.closePath();
  g.fillPath();
  g.strokePath();
  g.generateTexture(key, TILE_W, TILE_H);
  g.destroy();
}

function makeGenericIsoStructureTexture(scene: Phaser.Scene, def: MapObjectDefinition): void {
  const footprint = def.footprint ?? { w: 1, h: 1 };
  const wallH = Math.max(12, 20 + Math.min(Math.max(footprint.w, footprint.h), 5) * 8);
  const geo = isoPrism(footprint.w, footprint.h, wallH, 12);
  const label = def.label.toLowerCase();
  const g = scene.add.graphics();
  drawIsoPrism(g, geo, {
    right: darken(def.color, 24),
    left: darken(def.color, 10),
    top: lighten(def.color, 16),
  });

  if (label.includes('tent') || label.includes('canopy')) {
    g.fillStyle(0xf2ead6, 0.95);
    g.fillPoints([geo.leftR, geo.topR, geo.rightR, geo.bottomR], true);
    g.lineStyle(2, darken(def.color, 18), 0.85);
    g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
  } else if (label.includes('bridge')) {
    g.lineStyle(3, 0x3f2b1a, 1);
    g.lineBetween(geo.leftR.x + 8, geo.leftR.y - 8, geo.bottomR.x - 8, geo.bottomR.y - 8);
    g.lineBetween(geo.topR.x + 8, geo.topR.y - 8, geo.rightR.x - 8, geo.rightR.y - 8);
  } else if (label.includes('gate') || label.includes('arch')) {
    g.fillStyle(0x1a120a, 1);
    g.fillPoints(wallInset(geo.right, geo.bottom, 0.32, 0.68, Math.min(32, wallH - 4)), true);
  } else {
    g.fillStyle(0x2d1b10, 0.75);
    g.fillPoints(wallInset(geo.left, geo.bottom, 0.42, 0.64, Math.min(18, wallH - 8)), true);
    g.fillStyle(0xf3d98a, 0.9);
    g.fillPoints(wallInset(geo.right, geo.bottom, 0.28, 0.44, 10), true);
  }

  g.generateTexture(def.texture, geo.texW, geo.texH);
  g.destroy();
}

function makeGenericPropTexture(scene: Phaser.Scene, def: MapObjectDefinition): void {
  const g = scene.add.graphics();
  const label = def.label.toLowerCase();

  if (label.includes('crate') || label.includes('bundle')) {
    const geo = isoPrism(1, 1, 18, 4);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 16),
      left: darken(def.color, 30),
      top: lighten(def.color, 12),
    });
    g.lineStyle(1, 0x3d2414, 0.9);
    g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
    g.lineBetween(geo.leftR.x, geo.leftR.y, geo.rightR.x, geo.rightR.y);
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('well')) {
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(28, 42, 42, 12);
    g.fillStyle(def.color, 1);
    g.fillEllipse(28, 28, 46, 24);
    g.fillStyle(0x263447, 1);
    g.fillEllipse(28, 27, 30, 14);
    g.lineStyle(3, 0x4f463b, 1);
    g.strokeEllipse(28, 28, 46, 24);
    g.generateTexture(def.texture, 56, 48);
  } else if (label.includes('desk')) {
    const geo = isoPrism(1, 1, 12, 4);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 16),
      left: darken(def.color, 28),
      top: lighten(def.color, 10),
    });
    const paper = [
      { x: geo.topR.x, y: geo.topR.y + 9 },
      { x: geo.topR.x + 13, y: geo.topR.y + 15 },
      { x: geo.topR.x, y: geo.topR.y + 21 },
      { x: geo.topR.x - 13, y: geo.topR.y + 15 },
    ];
    g.fillStyle(0xe6d8b0, 1);
    g.fillPoints(paper, true);
    g.lineStyle(1, 0x1a1a1a, 0.75);
    g.strokePoints(paper, true);
    g.lineBetween(paper[3].x + 4, paper[3].y + 1, paper[1].x - 4, paper[1].y + 1);
    g.lineBetween(paper[3].x + 6, paper[3].y + 5, paper[1].x - 6, paper[1].y + 5);
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('lamp') || label.includes('light')) {
    g.fillStyle(0xf3d98a, label.includes('light') ? 0.35 : 1);
    g.fillEllipse(20, 16, label.includes('light') ? 30 : 14, label.includes('light') ? 46 : 18);
    g.lineStyle(3, 0x3a2a16, 1);
    g.lineBetween(20, 16, 20, 50);
    g.lineBetween(12, 50, 28, 50);
    g.generateTexture(def.texture, 40, 56);
  } else if (label.includes('tree') || label.includes('shrub') || label.includes('reeds') || label.includes('rose') || label.includes('tamarisk') || label.includes('cypress')) {
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(24, 48, 34, 8);
    g.fillStyle(0x5b3a24, 1);
    g.fillRect(20, 28, 8, 20);
    g.fillStyle(def.color, 1);
    g.fillEllipse(24, 24, 34, 34);
    g.fillStyle(0xf2ead6, label.includes('snow') ? 0.85 : 0.15);
    g.fillEllipse(18, 16, 18, 12);
    g.generateTexture(def.texture, 48, 54);
  } else if (label.includes('flag')) {
    g.lineStyle(3, 0x5b3a24, 1);
    g.lineBetween(12, 6, 12, 50);
    g.fillStyle(def.color, 1);
    g.fillTriangle(14, 8, 40, 18, 14, 28);
    g.lineStyle(1, 0x3a2a16, 1);
    g.strokeTriangle(14, 8, 40, 18, 14, 28);
    g.generateTexture(def.texture, 44, 54);
  } else if (label.includes('pillar') || label.includes('bars') || label.includes('barred') || label.includes('palisade')) {
    const geo = isoPrism(1, 1, 20, 4);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 14),
      left: darken(def.color, 28),
      top: lighten(def.color, 10),
    });
    g.lineStyle(3, 0x3f2b1a, 1);
    for (const [start, end] of [[geo.left, geo.bottom], [geo.right, geo.bottom]] as const) {
      g.lineBetween(start.x, start.y - 14, end.x, end.y - 14);
      g.lineBetween(start.x, start.y - 6, end.x, end.y - 6);
      for (const t of [0.18, 0.42, 0.66, 0.9]) {
        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;
        g.lineBetween(x, y + 2, x, y - 26);
      }
    }
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('chain') || label.includes('rope')) {
    const points = [{ x: 23, y: 8 }, { x: 46, y: 20 }, { x: 23, y: 32 }, { x: 0, y: 20 }];
    g.fillStyle(darken(def.color, 18), 0.24);
    g.fillPoints(points, true);
    g.lineStyle(4, def.color, 1);
    g.strokeEllipse(16, 20, 20, 10);
    g.strokeEllipse(30, 20, 20, 10);
    g.strokeEllipse(23, 28, 26, 10);
    g.generateTexture(def.texture, 46, 38);
  } else if (label.includes('arch') || label.includes('door')) {
    const geo = isoPrism(1, 1, label.includes('arch') ? 48 : 42, 12);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 8),
      left: darken(def.color, 22),
      top: lighten(def.color, 10),
      edge: 0x140d09,
    });
    const opening = wallInset(geo.right, geo.bottom, 0.18, 0.82, label.includes('arch') ? 38 : 34);
    g.fillStyle(0x1a120a, 1);
    g.fillPoints(opening, true);
    g.lineStyle(2, 0x140d09, 0.85);
    g.strokePoints(opening, true);
    if (label.includes('door')) {
      g.lineStyle(1, 0xc9a55c, 0.75);
      g.lineBetween(
        (opening[0].x + opening[1].x) / 2,
        (opening[0].y + opening[1].y) / 2,
        (opening[2].x + opening[3].x) / 2,
        (opening[2].y + opening[3].y) / 2,
      );
      g.fillStyle(0xc9a55c, 1);
      g.fillCircle(opening[1].x - 4, opening[1].y - 16, 2);
    }
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('stream') || label.includes('carpet') || label.includes('rug') || label.includes('space')) {
    const points = [{ x: 28, y: 4 }, { x: 56, y: 18 }, { x: 28, y: 32 }, { x: 0, y: 18 }];
    g.fillStyle(def.color, label.includes('space') ? 0.3 : 0.9);
    g.fillPoints(points, true);
    g.lineStyle(2, 0xf2d18a, 0.8);
    g.strokePoints(points, true);
    g.generateTexture(def.texture, 56, 36);
  } else if (label.includes('crowd') && label.includes('shadow')) {
    g.fillStyle(0x100d0b, 0.3);
    for (let i = 0; i < 7; i++) {
      const x = 8 + (i % 4) * 11;
      const y = 14 + Math.floor(i / 4) * 12;
      g.fillEllipse(x, y, 12, 7);
    }
    g.generateTexture(def.texture, 54, 34);
  } else if (label.includes('crowd')) {
    for (let i = 0; i < 7; i++) {
      const x = 8 + (i % 4) * 11;
      const y = 10 + Math.floor(i / 4) * 14;
      g.fillStyle([0x4a3a2a, 0x6f2236, 0x2f4a5f, 0x8a5a2a][i % 4], 1);
      g.fillCircle(x, y, 5);
      g.fillRect(x - 4, y + 5, 8, 12);
    }
    g.generateTexture(def.texture, 54, 42);
  } else {
    g.fillStyle(def.color, 1);
    g.fillPoints([{ x: 24, y: 4 }, { x: 48, y: 16 }, { x: 24, y: 30 }, { x: 0, y: 16 }], true);
    g.fillStyle(darken(def.color, 22), 1);
    g.fillPoints([{ x: 0, y: 16 }, { x: 24, y: 30 }, { x: 24, y: 46 }, { x: 0, y: 32 }], true);
    g.lineStyle(1, 0x2d1b10, 0.8);
    g.strokePoints([{ x: 24, y: 4 }, { x: 48, y: 16 }, { x: 24, y: 46 }, { x: 0, y: 32 }, { x: 0, y: 16 }], true);
    g.generateTexture(def.texture, 48, 48);
  }

  g.destroy();
}

function isoPrism(widthCells: number, heightCells: number, wallH: number, topPad = 0): AssetIsoPrism {
  const leftExtent = widthCells * TILE_W / 2;
  const rightExtent = heightCells * TILE_W / 2;
  const halfW = Math.max(leftExtent, rightExtent);
  const baseH = (widthCells + heightCells) * TILE_H / 2;
  const texH = baseH + wallH + topPad;
  const bottom = { x: halfW, y: texH };
  const top = {
    x: halfW + (heightCells - widthCells) * TILE_W / 2,
    y: texH - baseH,
  };
  const right = {
    x: halfW + rightExtent,
    y: texH - heightCells * TILE_H / 2,
  };
  const left = {
    x: halfW - leftExtent,
    y: texH - widthCells * TILE_H / 2,
  };
  const raise = (p: IsoPoint) => ({ x: p.x, y: p.y - wallH });

  return {
    texW: halfW * 2,
    texH,
    top,
    right,
    bottom,
    left,
    topR: raise(top),
    rightR: raise(right),
    bottomR: raise(bottom),
    leftR: raise(left),
  };
}

function wallInset(start: IsoPoint, end: IsoPoint, from: number, to: number, height: number): IsoPoint[] {
  const along = (t: number) => ({
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  });
  const a = along(from);
  const b = along(to);

  return [a, b, { x: b.x, y: b.y - height }, { x: a.x, y: a.y - height }];
}

function drawIsoPrism(
  g: Phaser.GameObjects.Graphics,
  geo: AssetIsoPrism,
  colors: { right: number; left: number; top: number; edge?: number; alpha?: number },
): void {
  const edge = colors.edge ?? 0x2a1a0a;
  const alpha = colors.alpha ?? 1;

  g.lineStyle(2, edge, alpha);
  g.fillStyle(colors.right, 1);
  g.fillPoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);
  g.strokePoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);

  g.fillStyle(colors.left, 1);
  g.fillPoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);
  g.strokePoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);

  g.fillStyle(colors.top, 1);
  g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
  g.strokePoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
}

function stringHash(value: string): number {
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function lighten(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).lighten(amount).color;
}

function darken(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).darken(amount).color;
}
