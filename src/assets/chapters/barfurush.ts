import { drawCastHeap, drawCleftTree, drawPlunder, drawShroud } from '../art/barfurushProps';
import { paintTexture } from '../art/canvasKit';
import { paintMazandaranCottage, TOWN_COTTAGE } from '../art/mazandaranCottage';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Bárfurúsh, October 1848: the road across the rice plain, the
 * Sabzih-Maydán and its caravanserai, and the forest toward Shír-Gáh. The
 * town houses are the forest cottage of chapter 8 whitewashed and roofed
 * with fired tiles; the props are in `art/barfurushProps.ts`. Mullá Ḥusayn,
 * Riḍá and Furúghí are chapter 8's own figures.
 */

export const BARFURUSH_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'bf-town-house': (scene, def) => paintMazandaranCottage(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 4, TOWN_COTTAGE),
  'bf-cast-heap': (scene, def) => paintTexture(scene, def.texture, 64, 44, ctx => drawCastHeap(ctx, 64, 44)),
  'bf-cleft-tree': (scene, def) => paintTexture(scene, def.texture, 88, 72, ctx => drawCleftTree(ctx, 88, 72)),
  'bf-shroud': (scene, def) => paintTexture(scene, def.texture, 64, 44, ctx => drawShroud(ctx, 64, 44, 0x3a3428, 0xe8e2d0)),
  // A siyyid of Yazd, his green turban-cloth laid over his face.
  'bf-shroud-siyyid': (scene, def) => paintTexture(scene, def.texture, 64, 44, ctx => drawShroud(ctx, 64, 44, 0x2e3a44, 0x2f6b3a)),
  'bf-plunder': (scene, def) => paintTexture(scene, def.texture, 64, 44, ctx => drawPlunder(ctx, 64, 44)),
};

export const BARFURUSH_OBJECTS: MapObjectDefinition[] = [
  { id: 'bf-town-house', label: 'Small House', texture: 'bf-town-house', kind: 'structure', category: 'buildings', color: 0xd8ccb0, blocks: true, footprint: { w: 5, h: 4 }, isometric: true },
  { id: 'bf-cast-heap', label: 'Cloth Bundle', texture: 'bf-cast-heap', kind: 'prop', category: 'market-supplies', color: 0x7a2f26, blocks: true },
  { id: 'bf-cleft-tree', label: 'Stump', texture: 'bf-cleft-tree', kind: 'prop', category: 'plants', color: 0x5a4a38, blocks: true },
  { id: 'bf-shroud', label: 'Believer', texture: 'bf-shroud', kind: 'prop', category: 'shrines', color: 0x3a3428, blocks: true },
  { id: 'bf-shroud-siyyid', label: 'Believer', texture: 'bf-shroud-siyyid', kind: 'prop', category: 'shrines', color: 0x2e3a44, blocks: true },
  { id: 'bf-plunder', label: 'Cloth Bundle', texture: 'bf-plunder', kind: 'prop', category: 'market-supplies', color: 0x8a2a24, blocks: true },
  // People.
  { id: 'bf-abdul-majid', label: 'Companion', texture: 'bf-abdul-majid', kind: 'character', category: 'characters', color: 0x3f4a5a, blocks: true,
    character: { body: 0x3f4a5a, skin: 0xd8b88c, clothing: { style: 'cloak', secondary: 0x2a2e36, accent: 0x3aa0a8 }, hat: { style: 'turban', color: 0xe8e2d0, accent: 0x3f4a5a }, hair: 0x6a6a68, shadow: true } },
  { id: 'bf-townsman', label: 'Townsman', texture: 'bf-townsman', kind: 'character', category: 'characters', color: 0x5a4a34, blocks: true,
    character: { body: 0x5a4a34, skin: 0xc8a47a, clothing: { style: 'vest', secondary: 0x8a6a48, accent: 0x3a5a3a }, hat: { style: 'cap', color: 0x2a2018 }, hair: 0x1c140c, shadow: true } },
  { id: 'bf-youth', label: 'Muezzin', texture: 'bf-youth', kind: 'character', category: 'characters', color: 0x5a6a5a, blocks: true,
    character: { body: 0x5a6a5a, skin: 0xd6b88e, clothing: { style: 'sash', secondary: 0xc8bc9a, accent: 0x6a4a2a }, hat: { style: 'turban', color: 0xe6e0d0, accent: 0x5a6a5a }, hair: 0x2a1c12, shadow: true } },
  { id: 'bf-abbas-quli', label: 'Officer', texture: 'bf-abbas-quli', kind: 'character', category: 'characters', color: 0x4a2a2a, blocks: true,
    character: { body: 0x4a2a2a, skin: 0xd0b088, clothing: { style: 'robe', secondary: 0x2a1a1a, accent: 0xd8b04a }, hat: { style: 'tallHat', color: 0x1a1414, accent: 0xd8b04a }, hair: 0x1a120c, shadow: true } },
  { id: 'bf-mustafa-khan', label: 'Officer', texture: 'bf-mustafa-khan', kind: 'character', category: 'characters', color: 0x3a3a52, blocks: true,
    character: { body: 0x3a3a52, skin: 0xd6b890, clothing: { style: 'robe', secondary: 0x24243a, accent: 0xb8a070 }, hat: { style: 'tallHat', color: 0x1c1c22 }, hair: 0x8a8a84, shadow: true } },
  { id: 'bf-khusraw', label: 'Soldier', texture: 'bf-khusraw', kind: 'character', category: 'characters', color: 0x6a3a22, blocks: true,
    character: { body: 0x6a3a22, skin: 0xc49a6c, clothing: { style: 'cloak', secondary: 0x3a2214, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x2a2018, accent: 0xc9a55c }, hair: 0x140c08, shadow: true } },
  { id: 'bf-juvayni', label: 'Companion', texture: 'bf-juvayni', kind: 'character', category: 'characters', color: 0x4a4a3a, blocks: true,
    character: { body: 0x4a4a3a, skin: 0xd2b088, clothing: { style: 'sash', secondary: 0x2e2e24, accent: 0x9a3a2a }, hat: { style: 'turban', color: 0xd8cfb8, accent: 0x4a4a3a }, hair: 0x1c140c, shadow: true } },
  { id: 'bf-attendant', label: 'House Servant', texture: 'bf-attendant', kind: 'character', category: 'characters', color: 0x7a6a4a, blocks: true,
    character: { body: 0x7a6a4a, skin: 0xd6b48a, clothing: { style: 'apron', secondary: 0xb8a888, accent: 0x5a4a34 }, hat: { style: 'cap', color: 0x5a3a24 }, hair: 0x2a1c12, shadow: true } },
];
