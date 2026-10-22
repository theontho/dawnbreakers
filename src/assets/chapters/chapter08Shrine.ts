import { paintBedroll, paintKneelingCompanions, paintOilLamp, paintRahl, paintTomb } from '../art/shrineInterior';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 8, inside the shrine of Shaykh Ṭabarsí: the tomb, its lamps and
 * Qur'án stand, the companions' bedrolls, the men who pray there through
 * the night, and the keeper of the shrine. The limewashed walls are
 * connected wall styles in `art/walls.ts`.
 */
export const CH08_SHRINE_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch8-tomb': (scene, def) => paintTomb(scene, def.texture),
  'ch8-rahl': (scene, def) => paintRahl(scene, def.texture),
  'ch8-oil-lamp': (scene, def) => paintOilLamp(scene, def.texture),
  'ch8-bedroll': (scene, def) => paintBedroll(scene, def.texture),
  'ch8-bedroll-dark': (scene, def) => paintBedroll(scene, def.texture, 0x8a7458, 0x3a4a4a),
  'ch8-kneeling-companions': (scene, def) => paintKneelingCompanions(scene, def.texture),
};

export const CH08_SHRINE_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch8-shrine-wall', label: 'Interior Wall', texture: 'ch8-shrine-wall', kind: 'prop', category: 'barriers-prison', color: 0xe0d9c6, blocks: true },
  { id: 'ch8-shrine-niche', label: 'Lamp Niche', texture: 'ch8-shrine-niche', kind: 'prop', category: 'shrines', color: 0xe0d9c6, blocks: true },
  { id: 'ch8-tomb', label: 'Tomb', texture: 'ch8-tomb', kind: 'prop', category: 'shrines', color: 0x6a7a5a, blocks: true },
  { id: 'ch8-rahl', label: 'Qur\'án Stand', texture: 'ch8-rahl', kind: 'prop', category: 'furnishings', color: 0x4a2e18, blocks: true },
  { id: 'ch8-oil-lamp', label: 'Oil Lamp', texture: 'ch8-oil-lamp', kind: 'prop', category: 'lighting-effects', color: 0xb8893a, blocks: true },
  { id: 'ch8-bedroll', label: 'Bedroll', texture: 'ch8-bedroll', kind: 'prop', category: 'market-supplies', color: 0x8a7a5a, blocks: true },
  { id: 'ch8-bedroll-dark', label: 'Bedroll', texture: 'ch8-bedroll-dark', kind: 'prop', category: 'market-supplies', color: 0x6a5a48, blocks: true },
  { id: 'ch8-kneeling-companions', label: 'Companions at Prayer', texture: 'ch8-kneeling-companions', kind: 'prop', category: 'people-crowds', color: 0x4a4036, blocks: true },
  { id: 'ch8-shrine-keeper', label: 'Keeper of the Shrine', texture: 'ch8-shrine-keeper', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xc8a47a, clothing: { style: 'cloak', secondary: 0x3a3028, accent: 0x8a7450 }, hat: { style: 'turban', color: 0xe0d8c4, accent: 0x5a4a3a }, hair: 0xd8d2c4, shadow: true } },
  { id: 'ch8-qazvini-elder', label: 'Old Man of Qazvín', texture: 'ch8-qazvini-elder', kind: 'character', category: 'characters', color: 0x4a4a52, blocks: true,
    character: { body: 0x4a4a52, skin: 0xd6bc94, clothing: { style: 'robe', secondary: 0x2f2f36, accent: 0xb8a888 }, hat: { style: 'headscarf', color: 0xd8d0bc }, hair: 0xe0dcd0, shadow: true } },
];
