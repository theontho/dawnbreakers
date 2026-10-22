import { paintBarredMarker, paintFootbridge, paintFortressGate } from '../art/fortressProps';
import { CHIHRIQ_FORTRESS, MAKU_FORTRESS, paintFortress } from '../art/mountainFortress';
import { paintBrazier, paintPine, paintRock, paintSnowDrift, paintSnowShrub, PINE_VARIANTS, ROCK_VARIANTS } from '../art/mountain';
import { paintMountainHouses } from '../art/mountainHouse';
import { variantKey } from '../art/canvasKit';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';

/**
 * Chapter 6: the mountain prisons of Mákú and Chihríq, at true scale. Adds
 * the two castles, the rampart that rings them and its gate, the village
 * houses of the mountains, the shared mountain rocks, pines, snow shrubs
 * and drifts, the guards' brazier, and the barred window.
 */
const footprint = (def: Parameters<TextureGenerator>[1]): [number, number] => [def.footprint?.w ?? 1, def.footprint?.h ?? 1];

export const CH06_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch6-maku-fortress': (scene, def) => paintFortress(scene, def.texture, ...footprint(def), MAKU_FORTRESS),
  'ch6-chihriq-fortress': (scene, def) => paintFortress(scene, def.texture, ...footprint(def), CHIHRIQ_FORTRESS),
  'ch6-fortress-gate': (scene, def) => paintFortressGate(scene, def.texture, ...footprint(def)),
  'ch6-mountain-house': (scene, def) => paintMountainHouses(scene, def.texture, ...footprint(def)),
  'ch6-rock': (scene, def) => ROCK_VARIANTS.forEach((s, i) => paintRock(scene, variantKey(def.texture, i), s)),
  'ch6-snow-shrub': (scene, def) => paintSnowShrub(scene, def.texture),
  'ch6-barred-marker': (scene, def) => paintBarredMarker(scene, def.texture),
  'ch6-snow-drift': (scene, def) => paintSnowDrift(scene, def.texture),
  'ch6-pine': (scene, def) => PINE_VARIANTS.forEach((s, i) => paintPine(scene, variantKey(def.texture, i), s)),
  'ch6-brazier': (scene, def) => paintBrazier(scene, def.texture),
  'ch6-footbridge': (scene, def) => paintFootbridge(scene, def.texture),
};

/** Placeable map objects owned by chapter 6. */
export const CH06_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch6-maku-fortress', label: 'Maku Fortress', texture: 'ch6-maku-fortress', kind: 'structure', category: 'barriers-prison', color: 0x786f68, blocks: true, footprint: { w: 9, h: 7 }, isometric: true },
  { id: 'ch6-chihriq-fortress', label: 'Chihriq Fortress', texture: 'ch6-chihriq-fortress', kind: 'structure', category: 'barriers-prison', color: 0x6b6f76, blocks: true, footprint: { w: 8, h: 8 }, isometric: true },
  { id: 'ch6-fortress-gate', label: 'Gate', texture: 'ch6-fortress-gate', kind: 'structure', category: 'barriers-prison', color: 0x6a737a, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
  { id: 'ch6-mountain-house', label: 'Small House', texture: 'ch6-mountain-house', kind: 'structure', category: 'buildings', color: 0x9a8064, blocks: true, footprint: { w: 5, h: 4 }, isometric: true },
  { id: 'ch6-rock', label: 'Mountain Rock', texture: 'ch6-rock', kind: 'prop', category: 'barriers-prison', color: 0x7c766f, blocks: true },
  { id: 'ch6-snow-shrub', label: 'Snow Shrub', texture: 'ch6-snow-shrub', kind: 'prop', category: 'plants', color: 0xd9e3e8, blocks: true },
  { id: 'ch6-barred-marker', label: 'Barred Marker', texture: 'ch6-barred-marker', kind: 'prop', category: 'barriers-prison', color: 0x3f4650, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch6-fold-wall', label: 'Garden Wall', texture: 'ch6-fold-wall', kind: 'prop', category: 'barriers-prison', color: 0x7c766c, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch6-rampart', label: 'Fortress Wall', texture: 'ch6-rampart', kind: 'prop', category: 'barriers-prison', color: 0x6a737a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch6-footbridge', label: 'Bridge', texture: 'ch6-footbridge', kind: 'prop', category: 'bridges-water', color: 0x8a6a44, blocks: false, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch6-snow-drift', label: 'Snow Drift', texture: 'ch6-snow-drift', kind: 'prop', category: 'lighting-effects', color: 0xdfe7ec, blocks: false },
  { id: 'ch6-pine', label: 'Mountain Pine', texture: 'ch6-pine', kind: 'prop', category: 'plants', color: 0x1f3b31, blocks: true },
  { id: 'ch6-brazier', label: 'Brazier', texture: 'ch6-brazier', kind: 'prop', category: 'lighting-effects', color: 0xd0602a, blocks: true },
  { id: 'ch6-warden', label: 'Warden', texture: 'ch6-warden', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x263241, skin: 0xd8c7a0, clothing: { style: 'cloak', secondary: 0xd8dce0, accent: 0x87919a }, hat: { style: 'tallHat', color: 0x1f252d }, shadow: true } },
  { id: 'ch6-courier', label: 'Courier', texture: 'ch6-courier', kind: 'character', category: 'characters', color: 0x8f5a2f, blocks: true,
    character: { body: 0x4b463f, skin: 0xd6c09a, clothing: { style: 'sash', secondary: 0xb88a3b, accent: 0xe8d8b0 }, hat: { style: 'cap', color: 0x5f4a2d }, shadow: true } },
  { id: 'ch6-mulla-husayn', label: 'Mulla Husayn', texture: 'ch6-mulla-husayn', kind: 'character', category: 'characters', color: 0x2f4a5f, blocks: true,
    character: { body: 0x22211f, skin: 0xe2d1aa, clothing: { style: 'robe', secondary: 0xe8e5dc, accent: 0x6f6048 }, hat: { style: 'turban', color: 0xe8e5dc, accent: 0x22211f }, shadow: true } },
  { id: 'ch6-fortress-guard', label: 'Guard', texture: 'ch6-fortress-guard', kind: 'character', category: 'characters', color: 0x4a4038, blocks: true,
    character: { body: 0x4a4038, skin: 0xd8bf94, clothing: { style: 'uniform', secondary: 0x6b5a44, accent: 0xa89a7a }, hat: { style: 'cap', color: 0x3a3029 }, shadow: true } },
  { id: 'ch6-amanuensis', label: 'Calligrapher', texture: 'ch6-amanuensis', kind: 'character', category: 'characters', color: 0x2f3a4a, blocks: true,
    character: { body: 0x2f3a4a, skin: 0xe2cfa6, clothing: { style: 'robe', secondary: 0xe0dccf, accent: 0x7a6a50 }, hat: { style: 'turban', color: 0x2f5a3a, accent: 0xe0dccf }, shadow: true } },
  { id: 'ch6-maku-woman', label: 'Pilgrim', texture: 'ch6-maku-woman', kind: 'character', category: 'characters', color: 0x7a3a3a, blocks: true,
    character: { body: 0x7a3a3a, skin: 0xd9bb8e, clothing: { style: 'wrap', secondary: 0x3a4a5a, accent: 0xc9a55c }, hat: { style: 'headscarf', color: 0x8a4a3a }, shadow: true } },
  { id: 'ch6-yahya-khan', label: 'Warden', texture: 'ch6-yahya-khan', kind: 'character', category: 'characters', color: 0x5a2f2a, blocks: true,
    character: { body: 0x5a2f2a, skin: 0xd2b58a, clothing: { style: 'sash', secondary: 0x2a2420, accent: 0xc9a55c }, hat: { style: 'turban', color: 0x8a2f2a, accent: 0x2a2420 }, shadow: true } },
  { id: 'ch6-dayyan', label: 'Witness', texture: 'ch6-dayyan', kind: 'character', category: 'characters', color: 0x3f3a5a, blocks: true,
    character: { body: 0x3f3a5a, skin: 0xe0c9a0, clothing: { style: 'cloak', secondary: 0x2a2838, accent: 0xb8a878 }, hat: { style: 'tallHat', color: 0x22202c }, shadow: true } },
  { id: 'ch6-dervish', label: 'Pilgrim', texture: 'ch6-dervish', kind: 'character', category: 'characters', color: 0x9a7a4a, blocks: true,
    character: { body: 0x9a7a4a, skin: 0xb8885a, clothing: { style: 'wrap', secondary: 0xd8c8a0, accent: 0x5a4a32 }, hat: { style: 'tallHat', color: 0xe0d0a8 }, shadow: true } },
  { id: 'ch6-kurdish-shepherd', label: 'Traveller', texture: 'ch6-kurdish-shepherd', kind: 'character', category: 'characters', color: 0x5a4a32, blocks: true,
    character: { body: 0x5a4a32, skin: 0xcfae80, clothing: { style: 'vest', secondary: 0x8a3a2a, accent: 0xe8d8b0 }, hat: { style: 'turban', color: 0x8a6a3a, accent: 0x3a2a1a }, shadow: true } },
];
