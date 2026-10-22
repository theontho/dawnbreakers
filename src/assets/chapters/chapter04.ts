import { footprintBox, paintTexture } from '../art/canvasKit';
import { hawz } from '../art/town/fountain';
import { DECREE_TEX, drawDecreeBoard, drawDyeVats, drawMinaret, drawUncleDoor, MINARET_TEX, UNCLE_DOOR_TEX } from '../art/shirazStreet';
import { drawMinbar, paintPrayerArcade } from '../art/vakil';
import { drawHallColumn, drawQiblaIwan, HALL_COLUMN_TEX, paintVakilPortal } from '../art/vakilHall';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';

/**
 * Chapter 4: return to Shíráz, 1845 to 1846, at true scale. The Vakíl
 * Mosque (its arcades, columned hall, iwans and marble minbar), the
 * governor's posted decree, a dyer's vats under the neighbourhood minaret,
 * the uncle's street door, and the people of a frightened city.
 */

const footprint = (def: Parameters<TextureGenerator>[1]): [number, number] => [def.footprint?.w ?? 1, def.footprint?.h ?? 1];

export const CH04_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  /** The marble minbar: its foot on the placed (front) cell, its seat two cells back against the qibla wall. */
  'ch4-pulpit': (scene, def) => {
    const { box, texW, texH } = footprintBox(...footprint(def), 104, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawMinbar(ctx, box));
  },
  /** A 3 x 3 piece of the Vakíl court arcade; pieces join along either axis. */
  'ch4-prayer-arch': (scene, def) => paintPrayerArcade(scene, def.texture, ...footprint(def)),
  /** A spiral column of the prayer hall with its arches back to the west and north. Place every third cell. */
  'ch4-spiral-column': (scene, def) => paintTexture(scene, def.texture, HALL_COLUMN_TEX.w, HALL_COLUMN_TEX.h, drawHallColumn),
  'ch4-qibla-iwan': (scene, def) => {
    const { box, texW, texH } = footprintBox(...footprint(def), 240, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawQiblaIwan(ctx, box));
  },
  'ch4-vakil-portal': (scene, def) => paintVakilPortal(scene, def.texture, ...footprint(def)),
  /** The great pool of the court: a broad stone rim to sit on, the water still. */
  'ch4-vakil-pool': (scene, def) => {
    const { box, texW, texH } = footprintBox(...footprint(def), 14, 8);
    paintTexture(scene, def.texture, texW, texH, ctx => hawz(ctx, box, 6, box.w - 6, 6, box.d - 6, 12, 12, 1401));
  },
  'ch4-decree-board': (scene, def) => paintTexture(scene, def.texture, DECREE_TEX.w, DECREE_TEX.h, drawDecreeBoard),
  'ch4-dye-vats': (scene, def) => {
    const { box, texW, texH } = footprintBox(...footprint(def), 92, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawDyeVats(ctx, box));
  },
  'ch4-minaret': (scene, def) => paintTexture(scene, def.texture, MINARET_TEX.w, MINARET_TEX.h, drawMinaret),
  'ch4-uncle-door': (scene, def) => paintTexture(scene, def.texture, UNCLE_DOOR_TEX.w, UNCLE_DOOR_TEX.h, drawUncleDoor),
};

/** Placeable map objects owned by chapter 4. */
export const CH04_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch4-pulpit', label: 'Pulpit', texture: 'ch4-pulpit', kind: 'prop', category: 'shrines', color: 0xd0d4c2, blocks: true, footprint: { w: 1, h: 3 }, isometric: true },
  { id: 'ch4-prayer-arch', label: 'Prayer Arch', texture: 'ch4-prayer-arch', kind: 'structure', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
  { id: 'ch4-spiral-column', label: 'Pillar', texture: 'ch4-spiral-column', kind: 'prop', category: 'shrines', color: 0xc8c2a8, blocks: true },
  { id: 'ch4-qibla-iwan', label: 'Prayer Niche', texture: 'ch4-qibla-iwan', kind: 'structure', category: 'shrines', color: 0x2e8c96, blocks: true, footprint: { w: 4, h: 1 }, isometric: true },
  { id: 'ch4-vakil-portal', label: 'Gate', texture: 'ch4-vakil-portal', kind: 'structure', category: 'shrines', color: 0x2e8c96, blocks: true, footprint: { w: 3, h: 6 }, isometric: true },
  { id: 'ch4-vakil-pool', label: 'Pool', texture: 'ch4-vakil-pool', kind: 'structure', category: 'bridges-water', color: 0x2c4a6b, blocks: true, footprint: { w: 9, h: 7 }, isometric: true },
  { id: 'ch4-vakil-wall', label: 'Courtyard Wall', texture: 'ch4-vakil-wall', kind: 'prop', category: 'barriers-prison', color: 0xc8a070, blocks: true },
  { id: 'ch4-minaret', label: 'Minaret', texture: 'ch4-minaret', kind: 'prop', category: 'shrines', color: 0xbf9466, blocks: true },
  { id: 'ch4-uncle-door', label: 'Closed Door', texture: 'ch4-uncle-door', kind: 'prop', category: 'furnishings', color: 0x4a2c18, blocks: true },
  { id: 'ch4-officer', label: 'Officer', texture: 'ch4-officer', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x31424a, skin: 0xd9c79a, clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x6f2222 }, shadow: true } },
  { id: 'ch4-witness', label: 'Witness', texture: 'ch4-witness', kind: 'character', category: 'characters', color: 0x6b5a44, blocks: true,
    character: { body: 0x5b4936, skin: 0xd1b37c, clothing: { style: 'robe', secondary: 0x7a5a3a, accent: 0xd8c7a0 }, hat: { style: 'turban', color: 0xd8c7a0, accent: 0x7a5a3a }, shadow: true } },
  { id: 'ch4-quddus', label: 'Quddus', texture: 'ch4-quddus', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0xead9ad, skin: 0xe6c89a, clothing: { style: 'cloak', secondary: 0x2d2d2d, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x2d2d2d }, shadow: true } },
  { id: 'ch4-townsman', label: 'Townsman', texture: 'ch4-townsman', kind: 'character', category: 'characters', color: 0x8a5a2a, blocks: true,
    character: { body: 0x5b4936, skin: 0xd1b37c, clothing: { style: 'vest', secondary: 0x7a5a3a, accent: 0xd8c7a0 }, hat: { style: 'cap', color: 0x7a5a3a }, shadow: true } },
  { id: 'ch4-decree-board', label: 'Decree Board', texture: 'ch4-decree-board', kind: 'prop', category: 'furnishings', color: 0x7b5d39, blocks: true },
  { id: 'ch4-dye-vats', label: 'Dye Vats', texture: 'ch4-dye-vats', kind: 'structure', category: 'market-supplies', color: 0x24406e, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch4-mulla-sadiq', label: 'Mulla', texture: 'ch4-mulla-sadiq', kind: 'character', category: 'characters', color: 0x3d3a34, blocks: true,
    character: { body: 0x3d3a34, skin: 0xd8b98a, clothing: { style: 'robe', secondary: 0x5a5448, accent: 0xb8a27a }, hat: { style: 'turban', color: 0xeae2cc, accent: 0x5a5448 }, hair: 0xd8d2c4, shadow: true } },
  { id: 'ch4-khal', label: 'Merchant', texture: 'ch4-khal', kind: 'character', category: 'characters', color: 0x2f3a2e, blocks: true,
    character: { body: 0x2f3a2e, skin: 0xd9bf8e, clothing: { style: 'cloak', secondary: 0x5a4a32, accent: 0xc9a55c }, hat: { style: 'turban', color: 0x2a5a32, accent: 0x1c2a1c }, hair: 0x3a2a1c, shadow: true } },
  { id: 'ch4-vahid', label: 'Mulla', texture: 'ch4-vahid', kind: 'character', category: 'characters', color: 0x2a2a3a, blocks: true,
    character: { body: 0x2a2a3a, skin: 0xe0c69a, clothing: { style: 'cloak', secondary: 0x6b5a3a, accent: 0xe8d9b0 }, hat: { style: 'turban', color: 0x1a1a1a, accent: 0xc9a55c }, hair: 0x1c140c, shadow: true } },
  { id: 'ch4-imam-jumih', label: 'Mulla', texture: 'ch4-imam-jumih', kind: 'character', category: 'characters', color: 0x4a3f33, blocks: true,
    character: { body: 0x4a3f33, skin: 0xd5b585, clothing: { style: 'robe', secondary: 0x8a7a5a, accent: 0xf0e6cc }, hat: { style: 'turban', color: 0xf4eedc, accent: 0x8a7a5a }, hair: 0xbcb6a8, shadow: true } },
  { id: 'ch4-baker', label: 'Townsman', texture: 'ch4-baker', kind: 'character', category: 'characters', color: 0x9a8a6a, blocks: true,
    character: { body: 0x8a7a5a, skin: 0xc8a477, clothing: { style: 'apron', secondary: 0xe8dcc0, accent: 0x6b4a2a }, hat: { style: 'cap', color: 0xe8dcc0 }, hair: 0x2d1b10, shadow: true } },
  { id: 'ch4-water-boy', label: 'Water-Carrier', texture: 'ch4-water-boy', kind: 'character', category: 'characters', color: 0x5a6a7a, blocks: true,
    character: { body: 0x5a6a7a, skin: 0xc49a6c, clothing: { style: 'sash', secondary: 0x8a6a4a, accent: 0xd8c7a0 }, hat: { style: 'none' }, hair: 0x1c120a, shadow: true } },
];
