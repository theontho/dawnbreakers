import { css, outlineBox, paintTexture, roofPoint, shade } from '../art/canvasKit';
import { paintCaravanseraiEast, paintCaravanseraiWest, SERAI } from '../art/caravanserai';
import { cellCentredBox, ellipseShadow, pebble } from '../art/fieldKit';
import { stone } from '../art/materials';
import { flatTop, walls } from '../art/ornaments';
import { paintQuranGate } from '../art/quranGate';
import { paintRoadShrine } from '../art/roadShrine';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';
import { CH02_SERAI_OBJECTS, CH02_SERAI_TEXTURE_GENERATORS } from './chapter02Serai';
import { CH02_TRAVEL_TEXTURE_GENERATORS } from './chapter02Travel';

/**
 * Chapter 2: the Qur'án Gate of Shíráz and the caravanserai beyond it,
 * where the Letters of the Living set out in every direction. Architecture
 * lives here; the travelling gear (camels, fire, bundles, rocks) lives in
 * `chapter02Travel.ts`.
 */

export const CH02_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH02_TRAVEL_TEXTURE_GENERATORS,
  ...CH02_SERAI_TEXTURE_GENERATORS,

  'ch2-caravanserai': (scene, def) => paintCaravanseraiWest(scene, def.texture),
  'ch2-caravanserai-east': (scene, def) => paintCaravanseraiEast(scene, def.texture),
  'ch2-quran-gate': (scene, def) => paintQuranGate(scene, def.texture, def.footprint?.w ?? 3, def.footprint?.h ?? 7),
  'ch2-shrine': (scene, def) => paintRoadShrine(scene, def.texture, def.footprint?.w ?? 3, def.footprint?.h ?? 3),

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

/** Placeable map objects owned by chapter 2. */
export const CH02_OBJECTS: MapObjectDefinition[] = [
  ...CH02_SERAI_OBJECTS,
  // The caravanserai is 20 x 16 and painted in two parts (see art/caravanserai.ts): place the east part
  // at gridX + 12, same gridY.
  { id: 'ch2-caravanserai', label: 'Caravanserai', texture: 'ch2-caravanserai', kind: 'structure', category: 'buildings', color: 0xa87846, blocks: true, footprint: { w: SERAI.westW, h: SERAI.d }, isometric: true },
  { id: 'ch2-caravanserai-east', label: 'Caravanserai', texture: 'ch2-caravanserai-east', kind: 'structure', category: 'buildings', color: 0xa87846, blocks: true, footprint: { w: SERAI.w - SERAI.westW, h: SERAI.d }, isometric: true },
  { id: 'ch2-quran-gate', label: 'Gate', texture: 'ch2-quran-gate', kind: 'structure', category: 'buildings', color: 0xc9a26a, blocks: true, footprint: { w: 3, h: 7 }, isometric: true },
  { id: 'ch2-shrine', label: 'Road Shrine', texture: 'ch2-shrine', kind: 'structure', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
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
