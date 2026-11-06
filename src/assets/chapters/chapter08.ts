import { footprintBox, paintTexture } from '../art/canvasKit';
import { standard } from '../art/banners';
import { drawShrine, SHRINE_DOME_PAD, SHRINE_WALL } from '../art/shrine';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';
import { CH08_AMUL_OBJECTS } from './chapter08Amul';
import { CH08_FOREST_TEXTURE_GENERATORS } from './chapter08Forest';
import { CH08_FORT_TEXTURE_GENERATORS } from './chapter08Fort';
import { CH08_SHRINE_OBJECTS, CH08_SHRINE_TEXTURE_GENERATORS } from './chapter08Shrine';

/**
 * Chapter 8: the Mázindarán forest road, Fort Shaykh Ṭabarsí, and the
 * interlude at Ámul (`chapter08Amul.ts`). The shrine,
 * palisade, and truce flag live here; forest props and siege props live in
 * their own modules.
 */

export const CH08_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH08_FOREST_TEXTURE_GENERATORS,
  ...CH08_FORT_TEXTURE_GENERATORS,
  ...CH08_SHRINE_TEXTURE_GENERATORS,
  // The shrine seen from the forest road, greened by the damp: the same building, half lost in the trees.
  'ch8-shrine-glimpse': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 6, def.footprint?.h ?? 6, SHRINE_WALL + SHRINE_DOME_PAD, 10);
    paintTexture(scene, def.texture, texW, texH, ctx => drawShrine(ctx, box, SHRINE_WALL, { wall: 0xa49a7a, plinth: 0x7a7468, dome: 0x9a9a82, seed: 61, overgrown: true }));
  },

  'ch8-shrine': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 6, def.footprint?.h ?? 6, SHRINE_WALL + SHRINE_DOME_PAD, 10);
    paintTexture(scene, def.texture, texW, texH, ctx => drawShrine(ctx, box, SHRINE_WALL, { wall: 0xcdbf98, plinth: 0x8a8578, dome: 0xb8b090, seed: 67, veranda: true }));
  },

  // A white cloth on a lance-pole about 3 m high.
  'ch8-truce-flag': (scene, def) => paintTexture(scene, def.texture, 72, 96, ctx => {
    standard(ctx, 22, 84, 72, { cloth: 0xe8dec1, w: 38, h: 26, waves: 2, finial: 'knob' });
  }),
};

/** Placeable map objects owned by chapter 8. */
export const CH08_OBJECTS: MapObjectDefinition[] = [
  ...CH08_SHRINE_OBJECTS,
  ...CH08_AMUL_OBJECTS,
  { id: 'ch8-shrine-glimpse', label: 'Shrine Glimpse', texture: 'ch8-shrine-glimpse', kind: 'structure', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 6, h: 6 }, isometric: true },
  { id: 'ch8-palisade', label: 'Palisade', texture: 'ch8-palisade', kind: 'prop', category: 'barriers-prison', color: 0x6b5136, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch8-shrine', label: 'Tabarsi Shrine', texture: 'ch8-shrine', kind: 'structure', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 6, h: 6 }, isometric: true },
  { id: 'ch8-truce-flag', label: 'Truce Flag', texture: 'ch8-truce-flag', kind: 'prop', category: 'barriers-prison', color: 0xf2ead6, blocks: true },
  // Forest
  { id: 'ch8-woodcutter-house', label: 'Small House', texture: 'ch8-woodcutter-house', kind: 'structure', category: 'buildings', color: 0xb89a72, blocks: true, footprint: { w: 5, h: 4 }, isometric: true },
  { id: 'ch8-fern', label: 'Fern', texture: 'ch8-fern', kind: 'prop', category: 'plants', color: 0x557f3c, blocks: false },
  { id: 'ch8-undergrowth', label: 'Undergrowth', texture: 'ch8-undergrowth', kind: 'prop', category: 'plants', color: 0x2c4a2a, blocks: true },
  { id: 'ch8-log', label: 'Fallen Log', texture: 'ch8-log', kind: 'prop', category: 'plants', color: 0x5a3c22, blocks: true },
  { id: 'ch8-mossy-rock', label: 'Mossy Rock', texture: 'ch8-mossy-rock', kind: 'prop', category: 'barriers-prison', color: 0x6f6f68, blocks: true },
  { id: 'ch8-stump', label: 'Stump', texture: 'ch8-stump', kind: 'prop', category: 'plants', color: 0xc9a46e, blocks: true },
  { id: 'ch8-woodpile', label: 'Woodpile', texture: 'ch8-woodpile', kind: 'prop', category: 'market-supplies', color: 0x8a5a2a, blocks: true },
  { id: 'ch8-campfire', label: 'Campfire', texture: 'ch8-campfire', kind: 'prop', category: 'lighting-effects', color: 0xd0461c, blocks: true },
  // Fort and siege
  { id: 'ch8-black-standard', label: 'Black Standard', texture: 'ch8-black-standard', kind: 'prop', category: 'shrines', color: 0x1a1a1a, blocks: true },
  { id: 'ch8-watchtower', label: 'Watchtower', texture: 'ch8-watchtower', kind: 'structure', category: 'barriers-prison', color: 0x5b3d22, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch8-lean-to', label: 'Lean-to', texture: 'ch8-lean-to', kind: 'structure', category: 'buildings', color: 0x6b5136, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch8-cauldron', label: 'Cauldron', texture: 'ch8-cauldron', kind: 'prop', category: 'market-supplies', color: 0x2a2a2a, blocks: true },
  { id: 'ch8-grave', label: 'Grave', texture: 'ch8-grave', kind: 'prop', category: 'shrines', color: 0x6b4a2a, blocks: true },
  { id: 'ch8-earthwork', label: 'Earthwork', texture: 'ch8-earthwork', kind: 'prop', category: 'barriers-prison', color: 0x6b4a2a, blocks: true },
  { id: 'ch8-army-tent', label: 'Army Tent', texture: 'ch8-army-tent', kind: 'structure', category: 'buildings', color: 0xd8cba8, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
  { id: 'ch8-log-bridge', label: 'Bridge', texture: 'ch8-log-bridge', kind: 'structure', category: 'bridges-water', color: 0x8a6440, blocks: false, footprint: { w: 4, h: 2 }, isometric: true },
  { id: 'ch8-stone-pile', label: 'Stone Pile', texture: 'ch8-stone-pile', kind: 'prop', category: 'market-supplies', color: 0x8c8c82, blocks: true },
  // People
  { id: 'ch8-mulla-husayn', label: 'Mulla Husayn', texture: 'ch8-mulla-husayn', kind: 'character', category: 'characters', color: 0x2f4a5f, blocks: true,
    character: { body: 0x22211f, skin: 0xe2d1aa, clothing: { style: 'robe', secondary: 0xe8e5dc, accent: 0x6f6048 }, hat: { style: 'turban', color: 0x2f6b3a, accent: 0x22211f }, shadow: true } },
  { id: 'ch8-quddus', label: 'Quddus', texture: 'ch8-quddus', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0x506b45, skin: 0xe0c38a, clothing: { style: 'robe', secondary: 0x2f3b2f, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xe8e2cc, accent: 0x506b45 }, shadow: true } },
  { id: 'ch8-young-companion', label: 'Companion', texture: 'ch8-young-companion', kind: 'character', category: 'characters', color: 0x7a5a3a, blocks: true,
    character: { body: 0x7a5a3a, skin: 0xd9bf94, clothing: { style: 'sash', secondary: 0x9a7a52, accent: 0x2f6b3a }, hat: { style: 'cap', color: 0x3a2a1a }, hair: 0x2d1b10, shadow: true } },
  { id: 'ch8-mason', label: 'Companion', texture: 'ch8-mason', kind: 'character', category: 'characters', color: 0x6b5a44, blocks: true,
    character: { body: 0x6b5a44, skin: 0xc8a47a, clothing: { style: 'apron', secondary: 0xb8a888, accent: 0x5a4a34 }, hat: { style: 'turban', color: 0xd8cfb8, accent: 0x6b5a44 }, shadow: true } },
  { id: 'ch8-wounded', label: 'Believer', texture: 'ch8-wounded', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x4a3f36, skin: 0xd0b48a, clothing: { style: 'cloak', secondary: 0x2f2a26, accent: 0xd8cfb8 }, hat: { style: 'headscarf', color: 0xe8e2d0 }, shadow: true } },
  { id: 'ch8-woodcutter', label: 'Woodcutter', texture: 'ch8-woodcutter', kind: 'character', category: 'characters', color: 0x4f5a34, blocks: true,
    character: { body: 0x4f5a34, skin: 0xc49a6c, clothing: { style: 'vest', secondary: 0x6b4a2a, accent: 0xb8a070 }, hat: { style: 'cap', color: 0x2f2a20 }, hair: 0x1d1610, shadow: true } },
  { id: 'ch8-village-woman', label: 'Village Woman', texture: 'ch8-village-woman', kind: 'character', category: 'characters', color: 0x8a2f2a, blocks: true,
    character: { body: 0x8a2f2a, skin: 0xd6b48a, clothing: { style: 'wrap', secondary: 0x2f5a4a, accent: 0xd9a441 }, hat: { style: 'headscarf', color: 0xc9a55c }, shadow: true } },
  { id: 'ch8-officer', label: 'Officer', texture: 'ch8-officer', kind: 'character', category: 'characters', color: 0x2e3a5a, blocks: true,
    character: { body: 0x2e3a5a, skin: 0xd8c09a, clothing: { style: 'uniform', secondary: 0x1f2840, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x1a1a1a, accent: 0xc9a55c }, shadow: true } },
  // The day the rice was shared out: Nabíl's informants and the siyyid from Qum.
  { id: 'ch8-baqir', label: 'Companion', texture: 'ch8-baqir', kind: 'character', category: 'characters', color: 0x3a4a5a, blocks: true,
    character: { body: 0x3a4a5a, skin: 0xd8bc90, clothing: { style: 'robe', secondary: 0x2a3440, accent: 0xb8a070 }, hat: { style: 'turban', color: 0xe8e2cc, accent: 0x3a4a5a }, shadow: true } },
  { id: 'ch8-furughi', label: 'Companion', texture: 'ch8-furughi', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xd6b88e, clothing: { style: 'cloak', secondary: 0x3a3028, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xd8cfb8, accent: 0x5a4a3a }, shadow: true } },
  { id: 'ch8-siyyid-qum', label: 'Companion', texture: 'ch8-siyyid-qum', kind: 'character', category: 'characters', color: 0x2a2a30, blocks: true,
    character: { body: 0x2f3a44, skin: 0xdcc49c, clothing: { style: 'cloak', secondary: 0x1f262e, accent: 0x8a7a5a }, hat: { style: 'turban', color: 0x1a1a1a, accent: 0x2f3a44 }, shadow: true } },
  { id: 'ch8-conscript', label: 'Soldier', texture: 'ch8-conscript', kind: 'character', category: 'characters', color: 0x4c5360, blocks: true,
    character: { body: 0x5a5a4a, skin: 0xc8a47a, clothing: { style: 'uniform', secondary: 0x3f3f34, accent: 0x8a7a5a }, hat: { style: 'tallHat', color: 0x2a2a24 }, shadow: true } },
];
