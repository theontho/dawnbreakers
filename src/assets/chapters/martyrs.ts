import { paintSeraiGate } from '../art/tehranSerai';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { MARTYRS_PROP_GENERATORS } from './martyrsProps';

/**
 * The Seven Martyrs of Ṭihrán, February 1850, at true scale: the street
 * gate of a merchants' caravanserai (`art/tehranSerai.ts`), the
 * green-sellers' baskets and a sweet-seller's tray in the Sabzih-Maydán,
 * the swept stones by the palace wall (`martyrsProps.ts`), and the people
 * of those weeks. Houses, shops, the citadel wall and the palace portico
 * come from the town kit and chapters 5 and 10; the Báb's uncle wears the
 * look he had in Shíráz (`ch4-khal`). The executions are never shown.
 */

export const MARTYRS_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'martyrs-serai-gate': (scene, def) => paintSeraiGate(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 3),
  ...MARTYRS_PROP_GENERATORS,
};

/** Placeable map objects owned by the chapter. */
export const MARTYRS_OBJECTS: MapObjectDefinition[] = [
  { id: 'martyrs-serai-gate', label: 'Caravanserai Gate', texture: 'martyrs-serai-gate', kind: 'structure', category: 'buildings', color: 0xb08660, blocks: true, footprint: { w: 5, h: 3 }, isometric: true },
  { id: 'martyrs-greens-baskets', label: 'Baskets of Greens', texture: 'martyrs-greens-baskets', kind: 'prop', category: 'market-supplies', color: 0x3f6a2e, blocks: true },
  { id: 'martyrs-sweets-tray', label: 'Tray of Sweets', texture: 'martyrs-sweets-tray', kind: 'prop', category: 'market-supplies', color: 0xb0703a, blocks: true },
  { id: 'martyrs-swept-stones', label: 'Swept Stones', texture: 'martyrs-swept-stones', kind: 'prop', category: 'lighting-effects', color: 0x3a3c40, blocks: false },
  // The prisoners in the Kalántar's house.
  { id: 'martyrs-qurban', label: 'Dervish', texture: 'martyrs-qurban', kind: 'character', category: 'characters', color: 0xe8e2d4, blocks: true,
    character: { body: 0xe4ded0, skin: 0xd2b08a, clothing: { style: 'cloak', secondary: 0x6a5a44, accent: 0xb8a888 }, hat: { style: 'headscarf', color: 0xe8e2d4, accent: 0x5a4a3a }, hair: 0x9a948a, shadow: true } },
  { id: 'martyrs-ismail', label: 'Mulla', texture: 'martyrs-ismail', kind: 'character', category: 'characters', color: 0x4a4436, blocks: true,
    character: { body: 0x4a4436, skin: 0xd6b88a, clothing: { style: 'robe', secondary: 0x2e2a24, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xf0e8d4, accent: 0x6a6450 }, hair: 0xa8a29a, shadow: true } },
  { id: 'martyrs-maraghii', label: 'Prisoner', texture: 'martyrs-maraghii', kind: 'character', category: 'characters', color: 0x6a5a48, blocks: true,
    character: { body: 0x6a5a48, skin: 0xcaa47a, clothing: { style: 'wrap', secondary: 0x4a3e30, accent: 0x8a7a60 }, hat: { style: 'cap', color: 0x4a3a2a }, hair: 0x1c120a, shadow: true } },
  { id: 'martyrs-turshizi', label: 'Mulla', texture: 'martyrs-turshizi', kind: 'character', category: 'characters', color: 0x24221e, blocks: true,
    character: { body: 0x2a2620, skin: 0xd6b88c, clothing: { style: 'cloak', secondary: 0x4a4236, accent: 0xe8dcc0 }, hat: { style: 'turban', color: 0x1e1c1a, accent: 0x3a3630 }, hair: 0x3a3028, shadow: true } },
  { id: 'martyrs-kirmani', label: 'Merchant', texture: 'martyrs-kirmani', kind: 'character', category: 'characters', color: 0x5a4a6a, blocks: true,
    character: { body: 0x5a4a62, skin: 0xd0ac84, clothing: { style: 'sash', secondary: 0x3a3048, accent: 0xc8a860 }, hat: { style: 'cap', color: 0x26221e }, hair: 0x6a6058, shadow: true } },
  { id: 'martyrs-murtada', label: 'Merchant', texture: 'martyrs-murtada', kind: 'character', category: 'characters', color: 0x2f5a3a, blocks: true,
    character: { body: 0x6a5040, skin: 0xd4b08a, clothing: { style: 'sash', secondary: 0x4a3828, accent: 0xd8b860 }, hat: { style: 'turban', color: 0x2f5a3a, accent: 0x1e3a26 }, hair: 0x2a1a10, shadow: true } },
  // The city.
  { id: 'martyrs-merchant', label: 'Merchant', texture: 'martyrs-merchant', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0x5a3a2a, skin: 0xd2b088, clothing: { style: 'cloak', secondary: 0x8a6a4a, accent: 0xe0d0b0 }, hat: { style: 'turban', color: 0xe8dcc0, accent: 0x8a6a4a }, hair: 0x4a3a2a, shadow: true } },
  { id: 'martyrs-young-man', label: 'Townsman', texture: 'martyrs-young-man', kind: 'character', category: 'characters', color: 0x7a6a4a, blocks: true,
    character: { body: 0x7a6a4a, skin: 0xc49a6c, clothing: { style: 'cloak', secondary: 0x4e4434, accent: 0xa89878 }, hat: { style: 'cap', color: 0x8a6a40 }, hair: 0x1c120a, shadow: true } },
  { id: 'martyrs-headsman', label: 'Townsman', texture: 'martyrs-headsman', kind: 'character', category: 'characters', color: 0x8a2420, blocks: true,
    character: { body: 0x7a2420, skin: 0xc49a6c, clothing: { style: 'vest', secondary: 0x3a1a14, accent: 0x8a6a4a }, hat: { style: 'cap', color: 0x2a2420 }, hair: 0x1c120a, shadow: true } },
  { id: 'martyrs-sweet-seller', label: 'Townsman', texture: 'martyrs-sweet-seller', kind: 'character', category: 'characters', color: 0x7a6a5a, blocks: true,
    character: { body: 0x7a6a5a, skin: 0xc8a070, clothing: { style: 'apron', secondary: 0x4a5a5a, accent: 0xd8c7a0 }, hat: { style: 'turban', color: 0xd8cfb8, accent: 0x6a6050 }, hair: 0xb0aaa0, shadow: true } },
];
