import { paintTexture } from '../art/canvasKit';
import { figure } from '../art/crowds';
import { FIGURE_H, FIGURE_W } from '../art/figureKit';
import { drawCistern, paintBurntPlane, paintRoundTower } from '../art/nayriz';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Nayríz, May and June 1850: the quarter of Chinár-Súkhtih, its masjid, and
 * the old fort of Khájih. Houses, walls, the mosque and the fort gate come
 * from the shared town kit; Vaḥíd keeps the look he had in Shíráz
 * (`ch4-vahid`). New here: the burnt plane tree, the fort's round towers,
 * the cistern, and the people of the quarter.
 */

export const NAYRIZ_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'nayriz-burnt-plane': (scene, def) => paintBurntPlane(scene, def.texture),
  'nayriz-round-tower': (scene, def) => paintRoundTower(scene, def.texture),
  'nayriz-cistern': (scene, def) => paintTexture(scene, def.texture, 64, 80, ctx => drawCistern(ctx, 80)),
  // A boy of the quarter, drawn at a boy's height against the 40 px adult.
  'nayriz-boy': (scene, def) => paintTexture(scene, def.texture, FIGURE_W, FIGURE_H, ctx =>
    figure(ctx, FIGURE_W / 2, FIGURE_H - 2, { robe: 0x7a5a3a, trim: 0x2f5a6a, head: 'kolah', headColor: 0x3a2a1c, skin: 0xcfa678, height: 29 })),
};

export const NAYRIZ_OBJECTS: MapObjectDefinition[] = [
  { id: 'nayriz-burnt-plane', label: 'Burnt Plane Tree', texture: 'nayriz-burnt-plane', kind: 'prop', category: 'plants', color: 0x4a4030, blocks: true },
  { id: 'nayriz-round-tower', label: 'Tower', texture: 'nayriz-round-tower', kind: 'structure', category: 'barriers-prison', color: 0xa88660, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'nayriz-cistern', label: 'Cistern', texture: 'nayriz-cistern', kind: 'prop', category: 'bridges-water', color: 0x6a5038, blocks: true },
  // People.
  { id: 'nayriz-elder', label: 'Mulla', texture: 'nayriz-elder', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xcfae86, clothing: { style: 'robe', secondary: 0x8a7a62, accent: 0xe8e0cc }, hat: { style: 'turban', color: 0xf2ece0, accent: 0x8a7a62 }, hair: 0xe8e4dc, shadow: true } },
  { id: 'nayriz-woman', label: 'Woman of the Quarter', texture: 'nayriz-woman', kind: 'character', category: 'characters', color: 0x3a2a3a, blocks: true,
    character: { body: 0x3a2a3a, skin: 0xd4b08a, clothing: { style: 'wrap', secondary: 0x241a24, accent: 0xb8865a }, hat: { style: 'headscarf', color: 0x5a3a5a }, shadow: true } },
  { id: 'nayriz-chronicler', label: 'Scribe', texture: 'nayriz-chronicler', kind: 'character', category: 'characters', color: 0x3a3a2a, blocks: true,
    character: { body: 0x3a3a2a, skin: 0xd8b88c, clothing: { style: 'robe', secondary: 0x6a6450, accent: 0xc9b07a }, hat: { style: 'turban', color: 0xe0d8c4, accent: 0x6a6450 }, hair: 0x2a1c12, shadow: true } },
  { id: 'nayriz-gatekeeper', label: 'Companion', texture: 'nayriz-gatekeeper', kind: 'character', category: 'characters', color: 0x5a4430, blocks: true,
    character: { body: 0x5a4430, skin: 0xc49e72, clothing: { style: 'sash', secondary: 0x7a6448, accent: 0x6a2a22 }, hat: { style: 'cap', color: 0x2a2018 }, hair: 0x1c120a, shadow: true } },
  { id: 'nayriz-soldier', label: 'Soldier', texture: 'nayriz-soldier', kind: 'character', category: 'characters', color: 0x3a3a4a, blocks: true,
    character: { body: 0x3a3a4a, skin: 0xc8a47a, clothing: { style: 'uniform', secondary: 0x2a2a36, accent: 0xb8944c }, hat: { style: 'tallHat', color: 0x1f1f1c }, shadow: true } },
  // The chapter's witness: a youth of Chinár-Súkhtih in a madder-red vest and a felt cap, with only a first moustache.
  { id: 'nayriz-witness', label: 'Player', texture: 'nayriz-witness', kind: 'character', category: 'characters', color: 0x8a3a2a, blocks: true,
    character: { body: 0x8a3a2a, skin: 0xcca47a, clothing: { style: 'vest', secondary: 0x5a4a36, accent: 0xd8c8a0 }, hat: { style: 'cap', color: 0x4a3a28 }, hair: 0x1c120a, beard: 'moustache', shadow: true } },
  { id: 'nayriz-boy', label: 'Child', texture: 'nayriz-boy', kind: 'character', category: 'characters', color: 0x7a5a3a, blocks: true },
];
