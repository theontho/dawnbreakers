import type { MapObjectDefinition } from '../mapAssetTypes';

/**
 * The Solace of the Eyes: Karbilá in Muḥarram 1845, and Qazvín in 1847 to
 * 1848. The curtain, the bolsters, the courtyard house, the closed door and
 * the town are all reused from earlier chapters; what is new is the people.
 * The horses waiting beyond the walls on the night of the rescue are the
 * saddled horses of the Káshán chapter (`kulayn-horse`, `art/kulaynProps.ts`).
 */

export const QAZVIN_OBJECTS: MapObjectDefinition[] = [
  // Karbilá.
  { id: 'qazvin-salih', label: 'Companion', texture: 'qazvin-salih', kind: 'character', category: 'characters', color: 0x5a4a32, blocks: true,
    character: { body: 0x5a4a32, skin: 0xc49c70, clothing: { style: 'cloak', secondary: 0x2a2620, accent: 0xd8c8a0 }, hat: { style: 'turban', color: 0xe8e0cc, accent: 0x8a6a3a }, hair: 0x1a120a, shadow: true } },
  { id: 'qazvin-disciple', label: 'Mulla', texture: 'qazvin-disciple', kind: 'character', category: 'characters', color: 0x3a3a44, blocks: true,
    character: { body: 0x3a3a44, skin: 0xd6b88c, clothing: { style: 'robe', secondary: 0x24242a, accent: 0xb8a888 }, hat: { style: 'turban', color: 0xf0e8d4, accent: 0x3a3a44 }, hair: 0x2a1c12, shadow: true } },
  // Marḍíyyih in bright clothes for the first of Muḥarram, and in Qazvín in sober ones.
  { id: 'qazvin-mardiyyih-bright', label: 'Woman of the House', texture: 'qazvin-mardiyyih-bright', kind: 'character', category: 'characters', color: 0xb8462a, blocks: true,
    character: { body: 0xb8462a, skin: 0xe2c6a0, clothing: { style: 'wrap', secondary: 0xd89a2a, accent: 0x2a7a6a }, hat: { style: 'headscarf', color: 0xe8c860 }, shadow: true } },
  { id: 'qazvin-mardiyyih', label: 'Woman of the House', texture: 'qazvin-mardiyyih', kind: 'character', category: 'characters', color: 0x4a3a4a, blocks: true,
    character: { body: 0x4a3a4a, skin: 0xe2c6a0, clothing: { style: 'wrap', secondary: 0x2e2430, accent: 0x9a7a5a }, hat: { style: 'headscarf', color: 0x6a5a6a }, shadow: true } },
  // Qazvín.
  { id: 'qazvin-mulla-salih', label: 'Mulla', texture: 'qazvin-mulla-salih', kind: 'character', category: 'characters', color: 0x2e2a24, blocks: true,
    character: { body: 0x2e2a24, skin: 0xd8bc94, clothing: { style: 'cloak', secondary: 0x4a4236, accent: 0xe8e0cc }, hat: { style: 'turban', color: 0xf4eedc, accent: 0x6a6252 }, hair: 0xc8c4bc, shadow: true } },
  { id: 'qazvin-baker', label: 'Townsman', texture: 'qazvin-baker', kind: 'character', category: 'characters', color: 0x8a7a5a, blocks: true,
    character: { body: 0x8a7a5a, skin: 0xc8a074, clothing: { style: 'apron', secondary: 0x5a4a34, accent: 0xe8dcc0 }, hat: { style: 'cap', color: 0xe8dcc0 }, hair: 0x1c120a, shadow: true } },
  { id: 'qazvin-farrash', label: 'Officer', texture: 'qazvin-farrash', kind: 'character', category: 'characters', color: 0x6a2a24, blocks: true,
    character: { body: 0x6a2a24, skin: 0xc8a47c, clothing: { style: 'vest', secondary: 0x3a1a16, accent: 0xb8944c }, hat: { style: 'tallHat', color: 0x1a1a1a }, hair: 0x1d1610, shadow: true } },
  { id: 'qazvin-khatun-jan', label: 'Village Woman', texture: 'qazvin-khatun-jan', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xd0ac80, clothing: { style: 'wrap', secondary: 0x3e3226, accent: 0x7a6a50 }, hat: { style: 'veil', color: 0x4a3e32 }, shadow: true } },
  { id: 'qazvin-hadi', label: 'Traveller', texture: 'qazvin-hadi', kind: 'character', category: 'characters', color: 0x3a3428, blocks: true,
    character: { body: 0x3a3428, skin: 0xd0b088, clothing: { style: 'sash', secondary: 0x5a4a34, accent: 0x8a2a22 }, hat: { style: 'turban', color: 0x2a2620, accent: 0x5a4a34 }, hair: 0x1c120a, shadow: true } },
  { id: 'qazvin-qurratul-ayn', label: 'Tahirih', texture: 'qazvin-qurratul-ayn', kind: 'character', category: 'characters', color: 0x1e1c24, blocks: true,
    character: { body: 0x2a2630, skin: 0xd8b98a, clothing: { style: 'cloak', secondary: 0x1e1c24, accent: 0x6f3b5c }, hat: { style: 'veil', color: 0x1e1c24, accent: 0x6f3b5c }, shadow: true } },
];
