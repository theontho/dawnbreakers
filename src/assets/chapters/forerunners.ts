import { paintTexture } from '../art/canvasKit';
import { drawDatePalm, drawFlock, drawShrineDome, palmSize, shrineDomeBox, SHRINE_DOME_CELLS, type PalmStyle } from '../art/karbila';
import { cellRangeBox, drawCellRange } from '../art/kufih';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * The Forerunners: Karbilá, the road to Kázimayn and the Masjid of Kúfih,
 * winter 1843 to 1844. Houses, walls, the old masjid and the court furniture
 * come from the shared town kit and earlier chapters; the date palms, the
 * flock and the gilded shrine seen over the roofs are drawn in
 * `art/karbila.ts`, named for reuse by any chapter set in the shrine cities.
 */

const PALMS: Record<'date-palm' | 'date-palm-tall' | 'date-palm-young', PalmStyle> = {
  // About 9 m, 12 m and 4 m to the crown.
  'date-palm': { height: 210, lean: 6, spread: 62, leaf: 0x5c7a3a, seed: 811 },
  'date-palm-tall': { height: 280, lean: -10, spread: 66, leaf: 0x56743a, seed: 823 },
  'date-palm-young': { height: 90, lean: 3, spread: 48, leaf: 0x648242, seed: 829 },
};

const palm = (s: PalmStyle): TextureGenerator => (scene, def) => {
  const { w, h } = palmSize(s);
  paintTexture(scene, def.texture, w, h, ctx => drawDatePalm(ctx, w, h, s));
};

export const FORERUNNERS_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'date-palm': palm(PALMS['date-palm']),
  'date-palm-tall': palm(PALMS['date-palm-tall']),
  'date-palm-young': palm(PALMS['date-palm-young']),
  'flock-sheep': (scene, def) => paintTexture(scene, def.texture, 64, 44, ctx => drawFlock(ctx, 64, 44, 841)),
  'kufih-cells': (scene, def) => {
    const { box, texW, texH } = cellRangeBox(def.footprint?.w ?? 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawCellRange(ctx, box, 851));
  },
  'karbila-shrine-dome': (scene, def) => {
    const { box, texW, texH } = shrineDomeBox();
    paintTexture(scene, def.texture, texW, texH, ctx => drawShrineDome(ctx, box));
  },
};

export const FORERUNNERS_OBJECTS: MapObjectDefinition[] = [
  { id: 'date-palm', label: 'Date Palm', texture: 'date-palm', kind: 'prop', category: 'plants', color: 0x5c7a3a, blocks: true },
  { id: 'date-palm-tall', label: 'Tall Date Palm', texture: 'date-palm-tall', kind: 'prop', category: 'plants', color: 0x56743a, blocks: true },
  { id: 'date-palm-young', label: 'Young Date Palm', texture: 'date-palm-young', kind: 'prop', category: 'plants', color: 0x648242, blocks: true },
  { id: 'flock-sheep', label: 'Flock of Sheep', texture: 'flock-sheep', kind: 'prop', category: 'people-crowds', color: 0xd8ccb4, blocks: true },
  { id: 'karbila-shrine-dome', label: 'Shrine Dome', texture: 'karbila-shrine-dome', kind: 'structure', category: 'shrines', color: 0xd9a636, blocks: true,
    footprint: { w: SHRINE_DOME_CELLS, h: SHRINE_DOME_CELLS }, isometric: true },
  { id: 'kufih-cells', label: 'Retreat Cells', texture: 'kufih-cells', kind: 'structure', category: 'shrines', color: 0xc8a878, blocks: true,
    footprint: { w: 6, h: 2 }, isometric: true },
  // People.
  { id: 'forerunners-kazim', label: 'Mulla', texture: 'forerunners-kazim', kind: 'character', category: 'characters', color: 0x3a3026, blocks: true,
    character: { body: 0x3a3026, skin: 0xd8b88c, clothing: { style: 'cloak', secondary: 0xd8cfb8, accent: 0x8a7450 }, hat: { style: 'turban', color: 0x1c1c1e, accent: 0x3a3026 }, hair: 0x8a8476, shadow: true } },
  { id: 'forerunners-copyist', label: 'Calligrapher', texture: 'forerunners-copyist', kind: 'character', category: 'characters', color: 0x5a5040, blocks: true,
    character: { body: 0x5a5040, skin: 0xd2b088, clothing: { style: 'robe', secondary: 0xe0d6be, accent: 0x6f5636 }, hat: { style: 'turban', color: 0xece6d6, accent: 0x5a5040 }, hair: 0xc8c2b4, shadow: true } },
  { id: 'forerunners-elder', label: 'Student', texture: 'forerunners-elder', kind: 'character', category: 'characters', color: 0x34404a, blocks: true,
    character: { body: 0x34404a, skin: 0xdcc096, clothing: { style: 'robe', secondary: 0xc8bea6, accent: 0x5a4a34 }, hat: { style: 'turban', color: 0xe8e2d2, accent: 0x34404a }, hair: 0x4a3a2a, shadow: true } },
  { id: 'forerunners-seeker', label: 'Student', texture: 'forerunners-seeker', kind: 'character', category: 'characters', color: 0x5a4430, blocks: true,
    character: { body: 0x5a4430, skin: 0xe0c49a, clothing: { style: 'cloak', secondary: 0x3a2e22, accent: 0xb8a070 }, hat: { style: 'turban', color: 0xf0ebe0, accent: 0x5a4430 }, hair: 0x2a1c12, beard: 'moustache', shadow: true } },
  { id: 'forerunners-shepherd', label: 'Shepherd', texture: 'forerunners-shepherd', kind: 'character', category: 'characters', color: 0x6a5236, blocks: true,
    character: { body: 0x6a5236, skin: 0xb88c62, clothing: { style: 'wrap', secondary: 0x4a3a28, accent: 0xd8cfb8 }, hat: { style: 'headscarf', color: 0xe6dcc6, accent: 0x9a3a2a }, hair: 0x1c140c, shadow: true } },
  { id: 'forerunners-water-seller', label: 'Water-Carrier', texture: 'forerunners-water-seller', kind: 'character', category: 'characters', color: 0x2f4a52, blocks: true,
    character: { body: 0x2f4a52, skin: 0xc29a6c, clothing: { style: 'apron', secondary: 0xd8c7a0, accent: 0x6a4a2a }, hat: { style: 'headscarf', color: 0xd8d0bc }, shadow: true } },
  { id: 'forerunners-bookseller', label: 'Merchant', texture: 'forerunners-bookseller', kind: 'character', category: 'characters', color: 0x4a3a50, blocks: true,
    character: { body: 0x4a3a50, skin: 0xd6b48a, clothing: { style: 'vest', secondary: 0xe0d4b8, accent: 0x6f5636 }, hat: { style: 'cap', color: 0x3a2e3e }, hair: 0x6a6258, shadow: true } },
  { id: 'forerunners-keeper', label: 'Mosque Attendant', texture: 'forerunners-keeper', kind: 'character', category: 'characters', color: 0x5a4a38, blocks: true,
    character: { body: 0x5a4a38, skin: 0xb48a60, clothing: { style: 'wrap', secondary: 0xd8cfb8, accent: 0x5a4a38 }, hat: { style: 'headscarf', color: 0xf0ebe0, accent: 0x2a2a2a }, hair: 0xb0aaa0, shadow: true } },
  { id: 'forerunners-nephew', label: 'Traveller', texture: 'forerunners-nephew', kind: 'character', category: 'characters', color: 0x4a4a3a, blocks: true,
    character: { body: 0x4a4a3a, skin: 0xe2c89c, clothing: { style: 'robe', secondary: 0xd0c6aa, accent: 0x6f5636 }, hat: { style: 'turban', color: 0xe8e2d2, accent: 0x4a4a3a }, hair: 0x2a1c12, beard: 'none', shadow: true } },
];
