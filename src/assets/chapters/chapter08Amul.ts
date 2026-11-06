import type { MapObjectDefinition } from '../mapAssetTypes';

/**
 * Chapter 8's interlude at Ámul, December 1848: the people of the town in
 * the masjid's court and the lanes round it. The masjid, the houses and the
 * walls come from the shared town kit.
 */
export const CH08_AMUL_OBJECTS: MapObjectDefinition[] = [
  // The interlude's witness: a youth who trims the masjid's lamps, in a soot-darkened apron over a quilted coat, a felt cap against the cold.
  { id: 'ch8-amul-witness', label: 'Player', texture: 'ch8-amul-witness', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xd0ac80, clothing: { style: 'apron', secondary: 0x3a3228, accent: 0xb89a6a }, hat: { style: 'cap', color: 0x6a3a2a }, hair: 0x1c120a, shadow: true } },
  // The old caretaker of the masjid, the youth's uncle.
  { id: 'ch8-amul-caretaker', label: 'Mosque Attendant', texture: 'ch8-amul-caretaker', kind: 'character', category: 'characters', color: 0x4a4038, blocks: true,
    character: { body: 0x4a4038, skin: 0xc8a47a, clothing: { style: 'cloak', secondary: 0x2f2a24, accent: 0x9a8a6a }, hat: { style: 'turban', color: 0xd8d0bc, accent: 0x4a4038 }, hair: 0xd8d2c4, shadow: true } },
  // The chief of the guards on the forest road, who brought the party in.
  { id: 'ch8-amul-guard', label: 'Guard', texture: 'ch8-amul-guard', kind: 'character', category: 'characters', color: 0x4a3a2a, blocks: true,
    character: { body: 0x4a3a2a, skin: 0xc49e72, clothing: { style: 'sash', secondary: 0x2f261c, accent: 0x8a2a22 }, hat: { style: 'tallHat', color: 0x2a2018 }, hair: 0x1c120a, shadow: true } },
  // An attendant of the acting governor.
  { id: 'ch8-amul-attendant', label: 'House Servant', texture: 'ch8-amul-attendant', kind: 'character', category: 'characters', color: 0x2f3a4a, blocks: true,
    character: { body: 0x2f3a4a, skin: 0xd0b088, clothing: { style: 'uniform', secondary: 0x222a36, accent: 0xb8944c }, hat: { style: 'cap', color: 0x1f1f1c }, shadow: true } },
  // A siyyid of the town in a black turban, who would have the prisoners killed.
  { id: 'ch8-amul-siyyid', label: 'Siyyid', texture: 'ch8-amul-siyyid', kind: 'character', category: 'characters', color: 0x2a2a30, blocks: true,
    character: { body: 0x3a3430, skin: 0xd4b48c, clothing: { style: 'cloak', secondary: 0x241f1c, accent: 0x5a2f6b }, hat: { style: 'turban', color: 0x1a1a1a, accent: 0x3a3430 }, hair: 0x2a1c12, shadow: true } },
  // A cloth-seller of the bázár, come to see the prisoners.
  { id: 'ch8-amul-townsman', label: 'Townsman', texture: 'ch8-amul-townsman', kind: 'character', category: 'characters', color: 0x6a5a3a, blocks: true,
    character: { body: 0x6a5a3a, skin: 0xcca47a, clothing: { style: 'robe', secondary: 0x4a3f2a, accent: 0x2f6b6a }, hat: { style: 'cap', color: 0x3a2a1c }, hair: 0x2a1c12, shadow: true } },
];
