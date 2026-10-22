import { css, footprintBox, groundShadow, outlineBox, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { plaster, stone } from '../art/materials';
import { archPath, band, dome, doorway, parapetRoof, walls } from '../art/ornaments';
import { standard } from '../art/banners';
import { moss } from '../art/woodland';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';
import { CH08_FOREST_TEXTURE_GENERATORS } from './chapter08Forest';
import { CH08_FORT_TEXTURE_GENERATORS } from './chapter08Fort';

/**
 * Chapter 8: the Mázindarán forest road and Fort Shaykh Ṭabarsí. The shrine,
 * palisade, and truce flag live here; forest props and siege props live in
 * their own modules.
 */

interface ShrinePalette {
  wall: number;
  plinth: number;
  dome: number;
  seed: number;
  /** Damp and moss of a building half lost in the woods. */
  overgrown?: boolean;
}

/** The tomb of Shaykh Ṭabarsí: a limewashed cube on a stone plinth under a low dome. */
function drawShrine(ctx: Ctx, box: IsoBox, pal: ShrinePalette): void {
  groundShadow(ctx, box, 8);
  walls(ctx, box, (c, w, h, light) => plaster(c, w, h, { base: pal.wall, light, seed: pal.seed + (light === 1 ? 0 : 7) }), {
    left: (c, w, h, l) => {
      band(c, w, 5, 3, shade(pal.plinth, 0.95), l);
      const doorW = Math.min(18, w * 0.26);
      doorway(c, w / 2 - doorW / 2, h, doorW, h * 0.58, { frame: pal.plinth, door: 0x4a3018, light: l, seed: pal.seed });
      for (const u of [w * 0.18, w * 0.82]) {
        archPath(c, u - 5, h * 0.72, 10, h * 0.38);
        c.fillStyle = css(shade(pal.wall, l * 0.62));
        c.fill();
      }
    },
    right: (c, w, h, l) => {
      band(c, w, 5, 3, shade(pal.plinth, 0.95), l);
      for (let i = 1; i <= 2; i++) {
        archPath(c, (w / 3) * i - 5, h * 0.72, 10, h * 0.38);
        c.fillStyle = css(shade(pal.wall, l * 0.6));
        c.fill();
      }
    },
  });
  const plinth: IsoBox = { ...box, h: 7 };
  walls(ctx, plinth, (c, w, h, light) => stone(c, w, h, { base: pal.plinth, light, seed: pal.seed + 3 }, 3.5));
  if (pal.overgrown) {
    moss(ctx, box.x - box.w * 0.6, box.y - box.w * 0.3 - 4, 14, 4, pal.seed);
    moss(ctx, box.x + box.d * 0.5, box.y - box.d * 0.25 - 4, 12, 4, pal.seed + 1, 0x3f6a32);
  }
  parapetRoof(ctx, box, shade(pal.wall, 0.95), { base: shade(pal.wall, 0.75), light: 1, seed: pal.seed + 5 }, 4, 4);
  outlineBox(ctx, box);
  const centre = roofPoint(box, box.w / 2, box.d / 2);
  dome(ctx, centre.x, centre.y + 4, Math.min(box.w, box.d) * 0.3, { color: pal.dome, drum: 7, drumColor: pal.wall, bulb: 1.05, ribs: true, finial: true });
}

export const CH08_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH08_FOREST_TEXTURE_GENERATORS,
  ...CH08_FORT_TEXTURE_GENERATORS,
  // The shrine seen from the forest road, greened by the damp.
  'ch8-shrine-glimpse': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 2, def.footprint?.h ?? 2, 44, 44);
    paintTexture(scene, def.texture, texW, texH, ctx => drawShrine(ctx, box, { wall: 0xa49a7a, plinth: 0x7a7468, dome: 0x9a9a82, seed: 61, overgrown: true }));
  },

  'ch8-shrine': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 3, def.footprint?.h ?? 3, 56, 56);
    paintTexture(scene, def.texture, texW, texH, ctx => drawShrine(ctx, box, { wall: 0xcdbf98, plinth: 0x8a8578, dome: 0xb8b090, seed: 67 }));
  },


  'ch8-truce-flag': (scene, def) => paintTexture(scene, def.texture, 64, 64, ctx => {
    standard(ctx, 24, 59, 50, { cloth: 0xe8dec1, w: 32, h: 18, waves: 2, finial: 'knob' });
  }),
};

/** Placeable map objects owned by chapter 8. */
export const CH08_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch8-shrine-glimpse', label: 'Shrine Glimpse', texture: 'ch8-shrine-glimpse', kind: 'structure', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch8-palisade', label: 'Palisade', texture: 'ch8-palisade', kind: 'prop', category: 'barriers-prison', color: 0x6b5136, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch8-shrine', label: 'Tabarsi Shrine', texture: 'ch8-shrine', kind: 'structure', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
  { id: 'ch8-truce-flag', label: 'Truce Flag', texture: 'ch8-truce-flag', kind: 'prop', category: 'barriers-prison', color: 0xf2ead6, blocks: true },
  // Forest
  { id: 'ch8-oak', label: 'Oak', texture: 'ch8-oak', kind: 'prop', category: 'plants', color: 0x274322, blocks: true },
  { id: 'ch8-ironwood', label: 'Ironwood', texture: 'ch8-ironwood', kind: 'prop', category: 'plants', color: 0x9a4a24, blocks: true },
  { id: 'ch8-alder', label: 'Alder', texture: 'ch8-alder', kind: 'prop', category: 'plants', color: 0x6f8a3c, blocks: true },
  { id: 'ch8-fern', label: 'Fern', texture: 'ch8-fern', kind: 'prop', category: 'plants', color: 0x557f3c, blocks: false },
  { id: 'ch8-undergrowth', label: 'Undergrowth', texture: 'ch8-undergrowth', kind: 'prop', category: 'plants', color: 0x2c4a2a, blocks: true },
  { id: 'ch8-log', label: 'Fallen Log', texture: 'ch8-log', kind: 'prop', category: 'plants', color: 0x5a3c22, blocks: true },
  { id: 'ch8-mossy-rock', label: 'Mossy Rock', texture: 'ch8-mossy-rock', kind: 'prop', category: 'barriers-prison', color: 0x6f6f68, blocks: true },
  { id: 'ch8-stump', label: 'Stump', texture: 'ch8-stump', kind: 'prop', category: 'plants', color: 0xc9a46e, blocks: true },
  { id: 'ch8-woodpile', label: 'Woodpile', texture: 'ch8-woodpile', kind: 'prop', category: 'market-supplies', color: 0x8a5a2a, blocks: true },
  { id: 'ch8-campfire', label: 'Campfire', texture: 'ch8-campfire', kind: 'prop', category: 'lighting-effects', color: 0xd0461c, blocks: true },
  // Fort and siege
  { id: 'ch8-black-standard', label: 'Black Standard', texture: 'ch8-black-standard', kind: 'prop', category: 'shrines', color: 0x1a1a1a, blocks: true },
  { id: 'ch8-watchtower', label: 'Watchtower', texture: 'ch8-watchtower', kind: 'structure', category: 'barriers-prison', color: 0x5b3d22, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch8-lean-to', label: 'Lean-to', texture: 'ch8-lean-to', kind: 'structure', category: 'buildings', color: 0x6b5136, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch8-cauldron', label: 'Cauldron', texture: 'ch8-cauldron', kind: 'prop', category: 'market-supplies', color: 0x2a2a2a, blocks: true },
  { id: 'ch8-grave', label: 'Grave', texture: 'ch8-grave', kind: 'prop', category: 'shrines', color: 0x6b4a2a, blocks: true },
  { id: 'ch8-earthwork', label: 'Earthwork', texture: 'ch8-earthwork', kind: 'prop', category: 'barriers-prison', color: 0x6b4a2a, blocks: true },
  { id: 'ch8-army-tent', label: 'Army Tent', texture: 'ch8-army-tent', kind: 'structure', category: 'buildings', color: 0xd8cba8, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch8-log-bridge', label: 'Bridge', texture: 'ch8-log-bridge', kind: 'structure', category: 'bridges-water', color: 0x8a6440, blocks: false, footprint: { w: 3, h: 1 }, isometric: true },
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
  { id: 'ch8-conscript', label: 'Soldier', texture: 'ch8-conscript', kind: 'character', category: 'characters', color: 0x4c5360, blocks: true,
    character: { body: 0x5a5a4a, skin: 0xc8a47a, clothing: { style: 'uniform', secondary: 0x3f3f34, accent: 0x8a7a5a }, hat: { style: 'tallHat', color: 0x2a2a24 }, shadow: true } },
];
