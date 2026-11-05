import { paintKarbilaShrine } from '../art/karbilaShrine';
import { paintPigeons, paintTurbahCloth } from '../art/karbilaProps';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Karbilá, 1851 to 1852: the square before the shrine of the Imám Ḥusayn,
 * the lane of the house where Bahá'u'lláh stayed, and the palm groves on
 * the Ḥusayniyyih canal. Houses, walls, stalls and the footbridge come from
 * the town kit and earlier chapters; the shrine is drawn in
 * `art/karbilaShrine.ts`, the pigeons and the turbah-seller's cloth in
 * `art/karbilaProps.ts`. The date palms and the water-seller are The
 * Forerunners' (`chapters/forerunners.ts`): the same groves, the same man,
 * eight years on.
 */

export const KARBILA_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'karbila-shrine': (scene, def) => paintKarbilaShrine(scene, def.texture, def.footprint?.w ?? 12, def.footprint?.h ?? 10),
  'karbila-pigeons': (scene, def) => paintPigeons(scene, def.texture),
  'karbila-turbah-cloth': (scene, def) => paintTurbahCloth(scene, def.texture),
};

export const KARBILA_OBJECTS: MapObjectDefinition[] = [
  { id: 'karbila-shrine', label: 'Shrines', texture: 'karbila-shrine', kind: 'structure', category: 'shrines', color: 0xd8a63a, blocks: true, footprint: { w: 12, h: 10 }, isometric: true },
  { id: 'karbila-pigeons', label: 'Birds', texture: 'karbila-pigeons', kind: 'prop', category: 'lighting-effects', color: 0x8a8e96, blocks: false },
  { id: 'karbila-turbah-cloth', label: 'Market Stall', texture: 'karbila-turbah-cloth', kind: 'prop', category: 'market-supplies', color: 0x2f4a5c, blocks: true },
  // People.
  { id: 'karbila-hasan', label: 'Scribe', texture: 'karbila-hasan', kind: 'character', category: 'characters', color: 0x4a4a3a, blocks: true,
    character: { body: 0x4a4a3a, skin: 0xd2b088, clothing: { style: 'robe', secondary: 0x2a2a22, accent: 0xc8b890 }, hat: { style: 'turban', color: 0xece4d0, accent: 0x4a4a3a }, hair: 0x8a8070, shadow: true } },
  { id: 'karbila-servant', label: 'Keeper of the Shrine', texture: 'karbila-servant', kind: 'character', category: 'characters', color: 0x2f5a3a, blocks: true,
    character: { body: 0x2f5a3a, skin: 0xc8a47a, clothing: { style: 'robe', secondary: 0x1f3a26, accent: 0xd8b860 }, hat: { style: 'turban', color: 0xe8e0c8, accent: 0x2f5a3a }, hair: 0xd8d4c8, shadow: true } },
  { id: 'karbila-turbah-seller', label: 'Merchant', texture: 'karbila-turbah-seller', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0x5a3a2a, skin: 0xc09a6e, clothing: { style: 'vest', secondary: 0x8a6a48, accent: 0x2f4a5c }, hat: { style: 'cap', color: 0x3a2a1c }, hair: 0x2a1c12, shadow: true } },
  { id: 'karbila-classmate', label: 'Mulla', texture: 'karbila-classmate', kind: 'character', category: 'characters', color: 0x3a3a48, blocks: true,
    character: { body: 0x3a3a48, skin: 0xd6b48c, clothing: { style: 'cloak', secondary: 0x24242e, accent: 0xb8a070 }, hat: { style: 'turban', color: 0xf0ebe0, accent: 0x3a3a48 }, hair: 0x2a1c12, shadow: true } },
  { id: 'karbila-aqa-jan', label: 'Traveller', texture: 'karbila-aqa-jan', kind: 'character', category: 'characters', color: 0x6a4a2a, blocks: true,
    character: { body: 0x6a4a2a, skin: 0xdcbc94, clothing: { style: 'sash', secondary: 0x8a6a48, accent: 0x3a5a6a }, hat: { style: 'cap', color: 0x2a3a4a }, hair: 0x1a120a, shadow: true } },
  // Mírzá Muḥammad of Mázindarán, in a northern travelling coat.
  { id: 'karbila-mazindarani', label: 'Traveller', texture: 'karbila-mazindarani', kind: 'character', category: 'characters', color: 0x3a4a3a, blocks: true,
    character: { body: 0x3a4a3a, skin: 0xd0ac80, clothing: { style: 'cloak', secondary: 0x5a4a32, accent: 0x8a7a50 }, hat: { style: 'cap', color: 0x2a2a22 }, hair: 0x2a1c12, shadow: true } },
  { id: 'karbila-uluvi', label: 'Dervish', texture: 'karbila-uluvi', kind: 'character', category: 'characters', color: 0x7a6a4a, blocks: true,
    character: { body: 0x7a6a4a, skin: 0xc8a47a, clothing: { style: 'cloak', secondary: 0x5a4a32, accent: 0x9a3a2a }, hat: { style: 'tallHat', color: 0xd8ccb0 }, hair: 0x3a2a1a, shadow: true } },
  // The same follower in winter, the tall hat given up.
  { id: 'karbila-uluvi-bare', label: 'Water-Carrier', texture: 'karbila-uluvi-bare', kind: 'character', category: 'characters', color: 0x7a6a4a, blocks: true,
    character: { body: 0x7a6a4a, skin: 0xc8a47a, clothing: { style: 'apron', secondary: 0x5a4a32, accent: 0x9a3a2a }, hat: { style: 'cap', color: 0x5a4a32 }, hair: 0x3a2a1a, shadow: true } },
  { id: 'karbila-neighbour', label: 'Woman of the Quarter', texture: 'karbila-neighbour', kind: 'character', category: 'characters', color: 0x1f1f24, blocks: true,
    character: { body: 0x1f1f24, skin: 0xd8b48a, clothing: { style: 'wrap', secondary: 0x14141a, accent: 0x6a5a48 }, hat: { style: 'veil', color: 0x1f1f24 }, shadow: true } },
];
