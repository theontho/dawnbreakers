import { paintTexture } from '../art/canvasKit';
import { FIGURE_H, FIGURE_W } from '../art/figureKit';
import { paintHouseSet, TOWN_HOUSES } from '../art/town/townHouses';
import { drawChild, drawCradle, drawHandMill, drawTanur, drawWaterSkins, drawWoundedOnMattress } from '../art/zanjanHousehold';
import { drawBarricade, drawCartBarricade, drawFieldGun, drawLadder, drawRubble, drawShotBasket } from '../art/zanjanSiege';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Zanján, 1850 to 1851: the barricaded quarter of Ḥujjat's companions, the
 * fort of ʿAlí-Mardán Khán, and Ḥujjat's house. Town houses, walls, the fort
 * gate, tents and earthworks come from the shared town kit and chapter 8;
 * what is new is drawn in `art/zanjanSiege.ts` and `art/zanjanHousehold.ts`.
 */

export const ZANJAN_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'zanjan-barricade': (scene, def) => paintTexture(scene, def.texture, 64, 76, ctx => drawBarricade(ctx, 76)),
  'zanjan-barricade-cart': (scene, def) => paintTexture(scene, def.texture, 64, 84, ctx => drawCartBarricade(ctx, 84)),
  'zanjan-field-gun': (scene, def) => paintTexture(scene, def.texture, 64, 52, ctx => drawFieldGun(ctx)),
  'zanjan-rubble': (scene, def) => paintTexture(scene, def.texture, 64, 80, ctx => drawRubble(ctx, 80, 91)),
  'zanjan-shot-basket': (scene, def) => paintTexture(scene, def.texture, 48, 44, ctx => drawShotBasket(ctx)),
  'zanjan-ladder': (scene, def) => paintTexture(scene, def.texture, 64, 190, ctx => drawLadder(ctx, 190)),
  'zanjan-tanur': (scene, def) => paintTexture(scene, def.texture, 64, 76, ctx => drawTanur(ctx, 76)),
  'zanjan-hand-mill': (scene, def) => paintTexture(scene, def.texture, 64, 70, ctx => drawHandMill(ctx, 70)),
  'zanjan-water-skins': (scene, def) => paintTexture(scene, def.texture, 64, 56, ctx => drawWaterSkins(ctx, 56)),
  'zanjan-cradle': (scene, def) => paintTexture(scene, def.texture, 64, 60, ctx => drawCradle(ctx, 60)),
  'zanjan-hujjat-wounded': (scene, def) => paintTexture(scene, def.texture, 80, 64, ctx => drawWoundedOnMattress(ctx, 64)),
  'zanjan-mihr-ali': (scene, def) => paintTexture(scene, def.texture, FIGURE_W, FIGURE_H, ctx => drawChild(ctx, FIGURE_W, FIGURE_H)),
  // Ḥujjat's house: a gateway in the street wall, a little court, the house beyond. One fixed variant, so its door is known.
  'zanjan-hujjat-house': (scene, def) => paintHouseSet(scene, def.texture, def.footprint?.w ?? 6, def.footprint?.h ?? 5, [TOWN_HOUSES[2]!]),
};

export const ZANJAN_OBJECTS: MapObjectDefinition[] = [
  { id: 'zanjan-barricade', label: 'Barricade', texture: 'zanjan-barricade', kind: 'prop', category: 'barriers-prison', color: 0xa08a62, blocks: true },
  { id: 'zanjan-barricade-cart', label: 'Barricade', texture: 'zanjan-barricade-cart', kind: 'prop', category: 'barriers-prison', color: 0x7a5434, blocks: true },
  { id: 'zanjan-field-gun', label: 'Field Gun', texture: 'zanjan-field-gun', kind: 'prop', category: 'barriers-prison', color: 0x8a6a34, blocks: true },
  { id: 'zanjan-rubble', label: 'Rubble', texture: 'zanjan-rubble', kind: 'prop', category: 'barriers-prison', color: 0xa88660, blocks: true },
  { id: 'zanjan-shot-basket', label: 'Basket of Shot', texture: 'zanjan-shot-basket', kind: 'prop', category: 'market-supplies', color: 0x3a3a38, blocks: true },
  { id: 'zanjan-ladder', label: 'Ladder', texture: 'zanjan-ladder', kind: 'prop', category: 'barriers-prison', color: 0x6a4a2c, blocks: true },
  { id: 'zanjan-tanur', label: 'Bread Oven', texture: 'zanjan-tanur', kind: 'prop', category: 'market-supplies', color: 0xb08a5e, blocks: true },
  { id: 'zanjan-hand-mill', label: 'Hand-Mill', texture: 'zanjan-hand-mill', kind: 'prop', category: 'market-supplies', color: 0x8a8a82, blocks: true },
  { id: 'zanjan-water-skins', label: 'Water-Skins', texture: 'zanjan-water-skins', kind: 'prop', category: 'market-supplies', color: 0x5a3a22, blocks: true },
  { id: 'zanjan-cradle', label: 'Cradle', texture: 'zanjan-cradle', kind: 'prop', category: 'furnishings', color: 0x8a5a2a, blocks: true },
  { id: 'zanjan-hujjat-wounded', label: 'Ḥujjat', texture: 'zanjan-hujjat-wounded', kind: 'prop', category: 'people-crowds', color: 0x3a4a5a, blocks: true },
  { id: 'zanjan-hujjat-house', label: 'Courtyard House', texture: 'zanjan-hujjat-house', kind: 'structure', category: 'buildings', color: 0xd6c3a0, blocks: true, footprint: { w: 6, h: 5 }, isometric: true },
  // People.
  { id: 'zanjan-hujjat', label: 'Ḥujjat', texture: 'zanjan-hujjat', kind: 'character', category: 'characters', color: 0x2f3440, blocks: true,
    character: { body: 0x2f3440, skin: 0xd8b88c, clothing: { style: 'robe', secondary: 0xd8d0bc, accent: 0x8a7450 }, hat: { style: 'turban', color: 0xf0ebe0, accent: 0x2f3440 }, hair: 0x1c140c, shadow: true } },
  { id: 'zanjan-siyyid-hasan', label: 'Companion', texture: 'zanjan-siyyid-hasan', kind: 'character', category: 'characters', color: 0x4a4038, blocks: true,
    character: { body: 0x4a4038, skin: 0xd6b890, clothing: { style: 'cloak', secondary: 0x2a2622, accent: 0xb8a070 }, hat: { style: 'turban', color: 0x1f1f22, accent: 0x4a4038 }, hair: 0x2a1c12, shadow: true } },
  { id: 'zanjan-mir-salah', label: 'Companion', texture: 'zanjan-mir-salah', kind: 'character', category: 'characters', color: 0x5a4a34, blocks: true,
    character: { body: 0x5a4a34, skin: 0xc8a47a, clothing: { style: 'sash', secondary: 0x8a7458, accent: 0x2f5a3a }, hat: { style: 'turban', color: 0x2f5a3a, accent: 0x1f3a26 }, hair: 0x1c120a, shadow: true } },
  { id: 'zanjan-zaynab', label: 'Companion', texture: 'zanjan-zaynab', kind: 'character', category: 'characters', color: 0x6a5a40, blocks: true,
    character: { body: 0x6a5a40, skin: 0xd8b48a, clothing: { style: 'vest', secondary: 0x8a6a48, accent: 0x9a3a2a }, hat: { style: 'none' }, hair: 0x1a100a, shadow: true } },
  { id: 'zanjan-muhsin', label: 'Muezzin', texture: 'zanjan-muhsin', kind: 'character', category: 'characters', color: 0x3a4a4a, blocks: true,
    character: { body: 0x3a4a4a, skin: 0xcfae80, clothing: { style: 'robe', secondary: 0x8a8a7a, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xe6e0d0, accent: 0x3a4a4a }, hair: 0x2a1c12, shadow: true } },
  { id: 'zanjan-khadijih', label: 'Woman of the House', texture: 'zanjan-khadijih', kind: 'character', category: 'characters', color: 0x6a2a3a, blocks: true,
    character: { body: 0x6a2a3a, skin: 0xe0c49c, clothing: { style: 'wrap', secondary: 0x3a1a24, accent: 0xd9a441 }, hat: { style: 'headscarf', color: 0x9a7a5a }, shadow: true } },
  { id: 'zanjan-umm-ashraf', label: 'Village Woman', texture: 'zanjan-umm-ashraf', kind: 'character', category: 'characters', color: 0x2f4a5a, blocks: true,
    character: { body: 0x2f4a5a, skin: 0xd2ae84, clothing: { style: 'wrap', secondary: 0x1f3440, accent: 0xc9a55c }, hat: { style: 'headscarf', color: 0x8a3a2a }, shadow: true } },
  { id: 'zanjan-soldier', label: 'Soldier', texture: 'zanjan-soldier', kind: 'character', category: 'characters', color: 0x3a4a5a, blocks: true,
    character: { body: 0x3a4a5a, skin: 0xc8a47a, clothing: { style: 'uniform', secondary: 0x2a3440, accent: 0xb8944c }, hat: { style: 'tallHat', color: 0x1f1f1c }, shadow: true } },
  { id: 'zanjan-mihr-ali', label: 'Child', texture: 'zanjan-mihr-ali', kind: 'character', category: 'characters', color: 0x6a5a3a, blocks: true },
];
