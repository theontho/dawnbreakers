import { paintRug } from '../art/props';
import { paintBolster, paintTentPole } from '../art/tentInterior';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 7, inside Quddús's pavilion at Badasht: the tent pole and its
 * lantern, mattresses and bolsters along the walls, carpets laid edge to
 * edge, and the man of Bárfurúsh who keeps the tent. The printed lining is
 * a connected wall style in `art/wallStyles.ts`.
 */
export const CH07_TENT_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch7-tent-pole': (scene, def) => paintTentPole(scene, def.texture),
  'ch7-bolster': (scene, def) => paintBolster(scene, def.texture, 'north'),
  'ch7-bolster-west': (scene, def) => paintBolster(scene, def.texture, 'west', 0x6a2a3a),
  'ch7-carpet-indigo': (scene, def) => paintRug(scene, def.texture, 0x2f3f6a, 0x7f2a2a),
  'ch7-carpet-madder': (scene, def) => paintRug(scene, def.texture, 0x9a4a2a, 0x2a3a2a),
};

export const CH07_TENT_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch7-tent-wall', label: 'Tent Wall', texture: 'ch7-tent-wall', kind: 'prop', category: 'barriers-prison', color: 0xeedcae, blocks: true },
  { id: 'ch7-tent-pole', label: 'Tent Pole', texture: 'ch7-tent-pole', kind: 'prop', category: 'lighting-effects', color: 0x6a4428, blocks: true },
  { id: 'ch7-bolster', label: 'Bolster', texture: 'ch7-bolster', kind: 'prop', category: 'furnishings', color: 0x8a2f2a, blocks: true },
  { id: 'ch7-bolster-west', label: 'Bolster', texture: 'ch7-bolster-west', kind: 'prop', category: 'furnishings', color: 0x6a2a3a, blocks: true },
  { id: 'ch7-carpet-indigo', label: 'Rug', texture: 'ch7-carpet-indigo', kind: 'prop', category: 'furnishings', color: 0x2f3f6a, blocks: false },
  { id: 'ch7-carpet-madder', label: 'Rug', texture: 'ch7-carpet-madder', kind: 'prop', category: 'furnishings', color: 0x9a4a2a, blocks: false },
  { id: 'ch7-npc-barfurushi', label: 'Man of Bárfurúsh', texture: 'ch7-npc-barfurushi', kind: 'character', category: 'characters', color: 0x5a4a32, blocks: true,
    character: { body: 0x5a4a32, skin: 0xd6b88c, clothing: { style: 'sash', secondary: 0xd8c8a0, accent: 0x48613e }, hat: { style: 'cap', color: 0x3a2e22 }, hair: 0x2d1b10, shadow: true } },
];
