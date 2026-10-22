import { paintFloodFootings, paintTakurMansion } from '../art/takurMansion';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { paintCellLamp } from './nurProps';

/**
 * Ṭihrán and Núr, 1844: the madrasa of Mírzá Ṣáliḥ (its arcade of cells is
 * a connected wall, `nur-madrasa-*` in `art/wallStyles.ts`), the lamp by Mullá
 * Ḥusayn's door, the house of the late Vazír at Tákur and the footings of
 * the half of it the flood took, and the people who carry the story.
 * Bahá'u'lláh is never a sprite: His house is seen from the lane, His
 * mansion at Tákur stands empty while He is away.
 */

export const NUR_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'nur-takur-mansion': (scene, def) => paintTakurMansion(scene, def.texture, def.footprint?.w ?? 9, def.footprint?.h ?? 6),
  'nur-flood-footings': (scene, def) => paintFloodFootings(scene, def.texture),
  'nur-cell-lamp': (scene, def) => paintCellLamp(scene, def.texture),
};

const person = (id: string, label: string, color: number, character: MapObjectDefinition['character']): MapObjectDefinition =>
  ({ id, label, texture: id, kind: 'character', category: 'characters', color, blocks: true, character });

/** Placeable map objects owned by the Ṭihrán and Núr chapter. */
export const NUR_OBJECTS: MapObjectDefinition[] = [
  { id: 'nur-madrasa-cell', label: 'Madrasa', texture: 'nur-madrasa-cell', kind: 'prop', category: 'buildings', color: 0xc8a676, blocks: true },
  { id: 'nur-madrasa-cell-lit', label: 'Madrasa', texture: 'nur-madrasa-cell-lit', kind: 'prop', category: 'buildings', color: 0xc8a676, blocks: true },
  { id: 'nur-madrasa-blind', label: 'Madrasa', texture: 'nur-madrasa-blind', kind: 'prop', category: 'buildings', color: 0xc8a676, blocks: true },
  { id: 'nur-cell-lamp', label: 'Lamp', texture: 'nur-cell-lamp', kind: 'prop', category: 'furnishings', color: 0xd8a23a, blocks: true },
  { id: 'nur-takur-mansion', label: 'Courtyard House', texture: 'nur-takur-mansion', kind: 'structure', category: 'buildings', color: 0xd6c6a6, blocks: true, footprint: { w: 9, h: 6 }, isometric: true },
  { id: 'nur-flood-footings', label: 'Rubble', texture: 'nur-flood-footings', kind: 'prop', category: 'barriers-prison', color: 0x6e6a60, blocks: true },
  // Ṭihrán
  person('nur-haji', 'Mulla', 0x2a2a26, { body: 0x2a2a26, skin: 0xd8bc90, clothing: { style: 'cloak', secondary: 0x4a4030, accent: 0xe8dcc0 }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x4a4030 }, hair: 0xb0a898, shadow: true }),
  person('nur-tutor', 'Mulla', 0x4a5a3a, { body: 0x4a5a3a, skin: 0xd2b088, clothing: { style: 'robe', secondary: 0x33402a, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xe8e0cc, accent: 0x33402a }, hair: 0x2a1a10, shadow: true }),
  person('nur-porter', 'Townsman', 0x6a5a44, { body: 0x6a5a44, skin: 0xc49a6c, clothing: { style: 'apron', secondary: 0x4a3a2a, accent: 0xb8a070 }, hat: { style: 'cap', color: 0xd8cfb8 }, hair: 0x8a8070, shadow: true }),
  person('nur-musa', 'Witness', 0x2f3f52, { body: 0x2f3f52, skin: 0xdcc098, clothing: { style: 'sash', secondary: 0x1e2a38, accent: 0xd8c7a0 }, hat: { style: 'tallHat', color: 0x1a1a1e }, hair: 0x2a1a10, shadow: true }),
  person('nur-baker', 'Townsman', 0x7a6a50, { body: 0x7a6a50, skin: 0xc8a070, clothing: { style: 'apron', secondary: 0xd8cfb8, accent: 0x8a6a3a }, hat: { style: 'cap', color: 0xe8e0cc }, hair: 0x1c120a, shadow: true }),
  person('nur-poor-man', 'Townsman', 0x5a5244, { body: 0x5a5244, skin: 0xc09a70, clothing: { style: 'wrap', secondary: 0x3e382e, accent: 0x8a8070 }, hat: { style: 'cap', color: 0x6a6050 }, hair: 0xa8a29a, shadow: true }),
  // Núr
  person('nur-woman', 'Village Woman', 0x2f5a4a, { body: 0x2f5a4a, skin: 0xd6b48a, clothing: { style: 'wrap', secondary: 0x8a2f2a, accent: 0xd9a441 }, hat: { style: 'headscarf', color: 0xe8e2d0 }, shadow: true }),
  person('nur-elder', 'Townsman', 0x5a4030, { body: 0x5a4030, skin: 0xd0aa80, clothing: { style: 'sash', secondary: 0x3a5a3a, accent: 0xd8b04a }, hat: { style: 'cap', color: 0x2a2a2e }, hair: 0xc8c0b0, shadow: true }),
  person('nur-abbas', 'Mulla', 0x3a3428, { body: 0x3a3428, skin: 0xd6b88a, clothing: { style: 'cloak', secondary: 0x5a4a36, accent: 0xe8dcc0 }, hat: { style: 'turban', color: 0xf0e8d4, accent: 0x5a4a36 }, hair: 0x3a2a1c, shadow: true }),
  person('nur-abul-qasim', 'Mulla', 0x4a3a30, { body: 0x4a3a30, skin: 0xdcc098, clothing: { style: 'robe', secondary: 0x2e2a24, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xe8e0cc, accent: 0x2e2a24 }, hair: 0x5a4838, shadow: true }),
  person('nur-groom', 'Woodcutter', 0x4f5a34, { body: 0x5a4a30, skin: 0xc49a6c, clothing: { style: 'vest', secondary: 0x3a4a2a, accent: 0xb8a070 }, hat: { style: 'cap', color: 0x3a2a1a }, hair: 0x1d1610, shadow: true }),
];
