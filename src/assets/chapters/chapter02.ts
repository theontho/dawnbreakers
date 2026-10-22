import { css, footprintBox, groundShadow, outlineBox, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { drawCaravanserai } from '../art/caravanserai';
import { cellCentredBox, ellipseShadow, pebble } from '../art/fieldKit';
import { brick, glazedTiles, plaster, stone } from '../art/materials';
import { archPath, band, clipped, dome, doorway, flatTop, latticeWindow, merlons, parapetRoof, walls } from '../art/ornaments';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';
import { CH02_TRAVEL_TEXTURE_GENERATORS } from './chapter02Travel';

/**
 * Chapter 2: the Qur'án Gate of Shíráz and the caravanserai beyond it,
 * where the Letters of the Living set out in every direction. Architecture
 * lives here; the travelling gear (camels, fire, bundles, rocks) lives in
 * `chapter02Travel.ts`.
 */

const TURQUOISE = 0x2e8c96;
const LAPIS = 0x24477a;
const CREAM = 0xe8d9a8;
const GATE_BRICK = 0xc8a070;

export const CH02_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH02_TRAVEL_TEXTURE_GENERATORS,

  'ch2-caravanserai': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 3, def.footprint?.h ?? 2, 60, 30);
    // Widened on both sides so the corner towers fit; the anchor stays centred.
    paintTexture(scene, def.texture, texW + 20, texH, ctx => {
      ctx.translate(10, 0);
      drawCaravanserai(ctx, box);
    });
  },

  /**
   * The Darvázih-i-Qur'án: a gate on the Iṣfahán road whose upper chamber
   * holds a Qur'án, so that every traveller leaving Shíráz passes beneath
   * the Book. Footprint 1x3; the road runs through the middle cell, so the
   * arch is cut into the x-facing (right) wall.
   */
  'ch2-quran-gate': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 1, def.footprint?.h ?? 3, 62, 50);
    paintTexture(scene, def.texture, texW, texH, ctx => drawQuranGate(ctx, box));
  },


  /**
   * A roadside imámzádih: a whitewashed cube under a turquoise dome, rags
   * tied to its window grille by travellers who stopped to pray.
   */
  'ch2-shrine': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 34, 36);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      const wall = 0xe0d6bc;
      groundShadow(ctx, box, 5);
      walls(ctx, box, (c, w, h, light) => plaster(c, w, h, { base: wall, light, seed: light === 1 ? 41 : 42 }), {
        left: (c, w, h, l) => {
          band(c, w, 4, 2.5, TURQUOISE, l);
          latticeWindow(c, w / 2 - 4, h * 0.36, 8, 10, { frame: 0x6a5a48, light: l, arched: true });
          // Votive rags knotted to the grille.
          for (const [dx, color] of [[-2.5, 0x2f7a3a], [0.5, 0xb83a2a], [3.5, 0xf2ead6]] as const) {
            c.fillStyle = css(shade(color, l));
            c.fillRect(w / 2 + dx, h * 0.36 + 9, 1.4, 5);
          }
        },
        right: (c, w, h, l) => {
          band(c, w, 4, 2.5, TURQUOISE, l);
          doorway(c, w / 2 - 6, h, 12, 21, { frame: 0x8a6440, door: 0x2f5f4a, light: l, seed: 43 });
        },
      });
      flatTop(ctx, box, shade(wall, 0.95));
      outlineBox(ctx, box);
      const centre = roofPoint(box, box.w / 2, box.d / 2);
      dome(ctx, centre.x, centre.y + 2, 11, { color: TURQUOISE, drum: 5, drumColor: wall, bulb: 1.15, ribs: true, finial: true });
    });
  },

  /** A carved stone milestone with a worn inscription, a little cairn at its foot. */
  'ch2-milestone': (scene, def) => {
    const texH = 54;
    paintTexture(scene, def.texture, 64, texH, ctx => {
      const plinth = cellCentredBox(texH, 16, 4);
      const post = cellCentredBox(texH, 9, 28);
      post.y -= 4;
      ellipseShadow(ctx, 35, texH - 14, 14, 5);
      walls(ctx, plinth, (c, w, h, light) => stone(c, w, h, { base: 0x8a7a60, light, seed: 91 }, 2.5));
      flatTop(ctx, plinth, 0x9a8a70);
      outlineBox(ctx, plinth);
      walls(ctx, post, (c, w, h, light) => {
        stone(c, w, h, { base: 0xa89878, light, seed: 92 }, 30);
        c.fillStyle = css(shade(0x5a4a38, light), 0.75);
        for (let y = 8; y < h - 6; y += 3) c.fillRect(1.5, y, w - 3 - ((y * 3) % 4), 0.8);
      });
      flatTop(ctx, post, 0xb0a080);
      outlineBox(ctx, post);
      // A rounded cap.
      const cap = roofPoint(post, post.w / 2, post.d / 2);
      ctx.fillStyle = css(0xb8a888);
      ctx.beginPath();
      ctx.ellipse(cap.x, cap.y, 6.5, 3.4, 0, Math.PI, 0);
      ctx.quadraticCurveTo(cap.x, cap.y - 7, cap.x - 6.5, cap.y);
      ctx.fill();
      ctx.strokeStyle = css(0x3a2a1a, 0.7);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      for (const [x, y, r, seed] of [[18, texH - 10, 3, 1], [22, texH - 8, 2.4, 2], [46, texH - 14, 2.8, 3]] as const) {
        pebble(ctx, x, y, r, r * 0.7, 0x8a7a64, seed);
      }
    });
  },
};

/** The Qur'án Gate: brick, a tile-framed arch, blind niches, and the chamber of the Book above. */
function drawQuranGate(ctx: Ctx, box: IsoBox): void {
  groundShadow(ctx, box, 8);
  const niches = (c: Ctx, from: number, to: number, h: number, l: number) => {
    for (let u = from; u + 7 <= to; u += 11) {
      for (const [base, ht] of [[h - 8, 16], [h - 30, 12]] as const) {
        archPath(c, u, base, 7, ht);
        c.fillStyle = css(shade(0x6a4a2c, l), 0.8);
        c.fill();
      }
    }
  };
  walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: GATE_BRICK, light, seed: light === 1 ? 11 : 12 }), {
    left: (c, w, h, l) => {
      band(c, w, 6, 4, TURQUOISE, l);
      niches(c, 6, w - 4, h, l);
    },
    right: (c, w, h, l) => {
      band(c, w, 6, 4, TURQUOISE, l);
      const aw = 30;
      const ax = w / 2 - aw / 2;
      // The pīshṭāq frame: lapis tiles bordered in cream.
      c.save();
      c.beginPath();
      c.rect(ax - 7, 12, aw + 14, h - 12);
      c.clip();
      glazedTiles(c, w, h, { base: LAPIS, light: l, seed: 13 }, 5);
      c.restore();
      c.strokeStyle = css(shade(CREAM, l), 0.9);
      c.lineWidth = 1;
      c.strokeRect(ax - 6, 13, aw + 12, h - 13);
      archPath(c, ax - 2, h, aw + 4, h - 16);
      c.fillStyle = css(shade(CREAM, l));
      c.fill();
      archPath(c, ax, h, aw, h - 18);
      c.fillStyle = css(0x1c120a);
      c.fill();
      // The road beyond, lit, framed by the far mouth of the passage.
      archPath(c, ax + 6, h - 2, aw - 12, h - 30);
      const far = c.createLinearGradient(0, h - 32, 0, h);
      far.addColorStop(0, '#e8c890');
      far.addColorStop(1, '#b8945c');
      c.fillStyle = far;
      c.fill();
      c.fillStyle = css(0x9a8a70);
      c.fillRect(ax - 3, h - 2, aw + 6, 2);
      niches(c, 6, ax - 10, h, l);
      niches(c, ax + aw + 10, w - 4, h, l);
    },
  });
  parapetRoof(ctx, box, GATE_BRICK, { base: 0xa88560, light: 1, seed: 14 }, 3, 3);
  merlons(ctx, box, GATE_BRICK, 4, 4);
  outlineBox(ctx, box);

  // The chamber of the Book: a small domed room over the arch, lamplit.
  const cw = 22;
  const cd = 36;
  const foot = roofPoint(box, box.w / 2 + cw / 2, box.d / 2 - cd / 2);
  const chamber: IsoBox = { x: foot.x, y: foot.y + 3, w: cw, d: cd, h: 20 };
  walls(ctx, chamber, (c, w, h, light) => plaster(c, w, h, { base: 0xd8c6a0, light, seed: 15 }), {
    left: (c, w, h, l) => latticeWindow(c, w / 2 - 3, h * 0.3, 6, 8, { frame: 0x6a4a2c, light: l, arched: true }),
    right: (c, w, h, l) => {
      band(c, w, 2, 2, TURQUOISE, l);
      latticeWindow(c, w / 2 - 5, h * 0.3, 10, 10, { frame: 0x6a4a2c, light: l, arched: true, lit: true });
      clipped(c, w, h, () => {
        c.fillStyle = 'rgba(255,214,140,0.18)';
        c.beginPath();
        c.ellipse(w / 2, h * 0.5, 10, 8, 0, 0, Math.PI * 2);
        c.fill();
      });
    },
  });
  flatTop(ctx, chamber, 0xd8c6a0);
  outlineBox(ctx, chamber);
  const top = roofPoint(chamber, cw / 2, cd / 2);
  dome(ctx, top.x, top.y + 2, 10, { color: TURQUOISE, drum: 3, drumColor: 0xd8c6a0, bulb: 1.2, ribs: true, pattern: CREAM, finial: true });
}

/** Placeable map objects owned by chapter 2. */
export const CH02_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch2-caravanserai', label: 'Caravanserai', texture: 'ch2-caravanserai', kind: 'structure', category: 'buildings', color: 0xa87846, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch2-quran-gate', label: 'Gate', texture: 'ch2-quran-gate', kind: 'structure', category: 'buildings', color: 0xc9a26a, blocks: true, footprint: { w: 1, h: 3 }, isometric: true },
  { id: 'ch2-city-wall', label: 'City Wall', texture: 'ch2-city-wall', kind: 'structure', category: 'barriers-prison', color: 0xb08a5a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch2-shrine', label: 'Road Shrine', texture: 'ch2-shrine', kind: 'structure', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch2-milestone', label: 'Milestone', texture: 'ch2-milestone', kind: 'prop', category: 'furnishings', color: 0xb8aa82, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch2-dry-stream', label: 'Dry Stream', texture: 'ch2-dry-stream', kind: 'prop', category: 'bridges-water', color: 0x5d6f7a, blocks: false },
  { id: 'ch2-tamarisk', label: 'Tamarisk', texture: 'ch2-tamarisk', kind: 'prop', category: 'plants', color: 0x6f8a45, blocks: true },
  { id: 'ch2-camel', label: 'Camel', texture: 'ch2-camel', kind: 'prop', category: 'market-supplies', color: 0xb08850, blocks: true },
  { id: 'ch2-campfire', label: 'Campfire', texture: 'ch2-campfire', kind: 'prop', category: 'lighting-effects', color: 0xe08a3a, blocks: true },
  { id: 'ch2-bundles', label: 'Cloth Bundle', texture: 'ch2-bundles', kind: 'prop', category: 'market-supplies', color: 0x8a3a2a, blocks: true },
  { id: 'ch2-rock', label: 'Mountain Rock', texture: 'ch2-rock', kind: 'prop', category: 'barriers-prison', color: 0x7a6a58, blocks: true },
  { id: 'ch2-mulla-ali', label: 'Mulla', texture: 'ch2-mulla-ali', kind: 'character', category: 'characters', color: 0x3a4a38, blocks: true,
    character: { body: 0x3a4a38, skin: 0xd9c08e, clothing: { style: 'robe', secondary: 0xd8cfb8, accent: 0x8a7450 }, hat: { style: 'turban', color: 0xeae4d4, accent: 0x3a4a38 }, shadow: true } },
  { id: 'ch2-gate-warden', label: 'Gate Guard', texture: 'ch2-gate-warden', kind: 'character', category: 'characters', color: 0x5a4630, blocks: true,
    character: { body: 0x4a3c2c, skin: 0xcfae7c, clothing: { style: 'cloak', secondary: 0x6a563c, accent: 0xc9a55c }, hat: { style: 'cap', color: 0x2f2a22 }, shadow: true } },
  { id: 'ch2-serai-keeper', label: 'Townsman', texture: 'ch2-serai-keeper', kind: 'character', category: 'characters', color: 0x7a5030, blocks: true,
    character: { body: 0x7a5030, skin: 0xd6b483, clothing: { style: 'apron', secondary: 0xd8c7a0, accent: 0x5b3a24 }, hat: { style: 'cap', color: 0x5b3a24 }, shadow: true } },
  { id: 'ch2-fal-reader', label: 'Calligrapher', texture: 'ch2-fal-reader', kind: 'character', category: 'characters', color: 0x6a6a5a, blocks: true,
    character: { body: 0x5f6052, skin: 0xd9c49a, clothing: { style: 'robe', secondary: 0xbab49c, accent: 0x9c8458 }, hat: { style: 'turban', color: 0x9a8a6a, accent: 0x5f6052 }, shadow: true } },
  { id: 'ch2-seeker', label: 'Traveller', texture: 'ch2-seeker', kind: 'character', category: 'characters', color: 0x7a6a50, blocks: true,
    character: { body: 0x6f6048, skin: 0xd4b688, clothing: { style: 'sash', secondary: 0xb8a684, accent: 0x3f6a6a }, hat: { style: 'headscarf', color: 0xcbbd98 }, shadow: true } },
  { id: 'ch2-dervish', label: 'Pilgrim', texture: 'ch2-dervish', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xc8a676, clothing: { style: 'cloak', secondary: 0x7a6248, accent: 0xa89060 }, hat: { style: 'tallHat', color: 0xd8c7a0 }, shadow: true } },
  { id: 'ch2-muleteer', label: 'Merchant', texture: 'ch2-muleteer', kind: 'character', category: 'characters', color: 0x5b3a24, blocks: true,
    character: { body: 0x5b3a24, skin: 0xc49e6c, clothing: { style: 'vest', secondary: 0x8a6a42, accent: 0xb84a3a }, hat: { style: 'headscarf', color: 0x9a7a52 }, shadow: true } },
  { id: 'ch2-mubarak', label: 'House Servant', texture: 'ch2-mubarak', kind: 'character', category: 'characters', color: 0x3f4a5a, blocks: true,
    character: { body: 0x3f4a5a, skin: 0x6b4a32, clothing: { style: 'robe', secondary: 0xd8cfb8, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x3f4a5a }, shadow: true } },
];
