import { paintGardenCanopy, paintTent, QUDDUS_TENT, RECONCILIATION_TENT } from '../art/badasht';
import { paintCookfire, paintCurtain, paintGardenWall, paintRosebush } from '../art/badashtProps';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';

/**
 * Chapter 7: the Conference of Badasht. Adds the encampment tents, the
 * garden canopy, mud-brick garden walls, the curtain behind which Ṭáhirih
 * first speaks, a cookfire for eighty-one guests, and the rosebush. Carpet,
 * lamp, and standard tree fall through to the shared base art.
 */
export const CH07_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch7-tent-reconciliation': (scene, def) => paintTent(scene, def.texture, def.footprint?.w ?? 3, def.footprint?.h ?? 2, RECONCILIATION_TENT),
  'ch7-tent-quddus': (scene, def) => paintTent(scene, def.texture, def.footprint?.w ?? 3, def.footprint?.h ?? 2, QUDDUS_TENT),
  'ch7-garden-canopy': (scene, def) => paintGardenCanopy(scene, def.texture, def.footprint?.w ?? 3, def.footprint?.h ?? 2),
  'ch7-rosebush': (scene, def) => paintRosebush(scene, def.texture),
  'ch7-garden-wall': (scene, def) => paintGardenWall(scene, def.texture),
  'ch7-curtain': (scene, def) => paintCurtain(scene, def.texture),
  'ch7-cookfire': (scene, def) => paintCookfire(scene, def.texture),
};

/** Placeable map objects owned by chapter 7. */
export const CH07_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch7-tent-quddus', label: 'Quddus Tent', texture: 'ch7-tent-quddus', kind: 'structure', category: 'buildings', color: 0xe0d6b8, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch7-tent-reconciliation', label: 'Reconciliation Tent', texture: 'ch7-tent-reconciliation', kind: 'structure', category: 'buildings', color: 0xc8b174, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch7-garden-canopy', label: 'Garden Canopy', texture: 'ch7-garden-canopy', kind: 'structure', category: 'buildings', color: 0x8f6f45, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch7-rosebush', label: 'Rosebush', texture: 'ch7-rosebush', kind: 'prop', category: 'plants', color: 0xb93a4d, blocks: true },
  { id: 'ch7-npc-tahirih', label: 'Tahirih', texture: 'ch7-npc-tahirih', kind: 'character', category: 'characters', color: 0x6f2236, blocks: true,
    character: { body: 0xf0d9a4, skin: 0xd8b98a, clothing: { style: 'cloak', secondary: 0x6f3b5c, accent: 0xf7ecd0 }, hat: { style: 'veil', color: 0xf7ecd0, accent: 0x6f3b5c }, shadow: true } },
  { id: 'ch7-npc-quddus', label: 'Quddus', texture: 'ch7-npc-quddus', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0x506b45, skin: 0xe0c38a, clothing: { style: 'robe', secondary: 0x2f3b2f, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xe0c38a, accent: 0x506b45 }, shadow: true } },
  { id: 'ch7-npc-believer', label: 'Believer', texture: 'ch7-npc-believer', kind: 'character', category: 'characters', color: 0x7a5a3a, blocks: true,
    character: { body: 0x8a6f4d, skin: 0xd6c0a0, clothing: { style: 'sash', secondary: 0x5b4632, accent: 0xd6c0a0 }, hat: { style: 'headscarf', color: 0xd6c0a0 }, shadow: true } },
  { id: 'ch7-garden-wall', label: 'Garden Wall', texture: 'ch7-garden-wall', kind: 'prop', category: 'barriers-prison', color: 0xb08a5a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch7-curtain', label: 'Curtain', texture: 'ch7-curtain', kind: 'prop', category: 'furnishings', color: 0x6f3b5c, blocks: true },
  { id: 'ch7-cookfire', label: 'Cookfire', texture: 'ch7-cookfire', kind: 'prop', category: 'lighting-effects', color: 0xe07a2a, blocks: true },
  { id: 'ch7-npc-steward', label: 'House Servant', texture: 'ch7-npc-steward', kind: 'character', category: 'characters', color: 0x3f4f70, blocks: true,
    character: { body: 0x3f4f70, skin: 0xdcc296, clothing: { style: 'robe', secondary: 0xe8dcc0, accent: 0xd8b56a }, hat: { style: 'turban', color: 0xe8dcc0, accent: 0x3f4f70 }, shadow: true } },
  { id: 'ch7-npc-villager', label: 'Townsman', texture: 'ch7-npc-villager', kind: 'character', category: 'characters', color: 0x6a5a3a, blocks: true,
    character: { body: 0x6a5a3a, skin: 0xc9a072, clothing: { style: 'apron', secondary: 0xd8c8a0, accent: 0x4a6a3a }, hat: { style: 'cap', color: 0x4a3a2a }, shadow: true } },
  { id: 'ch7-npc-cook', label: 'Water-Carrier', texture: 'ch7-npc-cook', kind: 'character', category: 'characters', color: 0x8a4a2a, blocks: true,
    character: { body: 0x8a4a2a, skin: 0xd6b48a, clothing: { style: 'apron', secondary: 0xe8e0cc, accent: 0x5a3a22 }, hat: { style: 'headscarf', color: 0xc8b088 }, shadow: true } },
  { id: 'ch7-npc-khurasani', label: 'Believer', texture: 'ch7-npc-khurasani', kind: 'character', category: 'characters', color: 0x2f3f2f, blocks: true,
    character: { body: 0x2f3f2f, skin: 0xd8bc90, clothing: { style: 'cloak', secondary: 0x5a4a32, accent: 0xb89a5a }, hat: { style: 'turban', color: 0x2f2f2f, accent: 0xb89a5a }, shadow: true } },
  { id: 'ch7-npc-leaver', label: 'Traveller', texture: 'ch7-npc-leaver', kind: 'character', category: 'characters', color: 0x5a4a5a, blocks: true,
    character: { body: 0x5a4a5a, skin: 0xdcc49c, clothing: { style: 'sash', secondary: 0x3a3238, accent: 0x9a8a6a }, hat: { style: 'turban', color: 0xe0d8c8, accent: 0x5a4a5a }, shadow: true } },
  { id: 'ch7-npc-messenger', label: 'Believer', texture: 'ch7-npc-messenger', kind: 'character', category: 'characters', color: 0x3f4f70, blocks: true,
    character: { body: 0x4a5a3a, skin: 0xe0c49a, clothing: { style: 'robe', secondary: 0xd8b56a, accent: 0x3f4f70 }, hat: { style: 'turban', color: 0xf0e6cc, accent: 0x4a5a3a }, shadow: true } },
];
