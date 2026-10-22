import { css, footprintBox, groundShadow, outlineBox, paintTexture, rng, shade, type IsoBox } from '../art/canvasKit';
import { chain, coilPath, sagPath, shackle } from '../art/cordage';
import { planks } from '../art/materials';
import { flatTop, walls } from '../art/ornaments';
import { drawLowArch, drawStonePillar, stonePost } from '../art/siyahChal';
import { contactShadow } from '../art/woodland';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 10, the Síyáh-Chál: a disused reservoir under Ṭihrán. Its arcade
 * and vault piers are drawn in `art/siyahChal.ts`; this file holds the
 * pillars to which the prisoners were chained, their straw, and the one
 * shaft of light from the stair.
 */

export const CH10_PRISON_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {

  'ch10-low-arch': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 4, def.footprint?.h ?? 1, 62, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawLowArch(ctx, box));
  },

  'ch10-stone-pillar': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 2, def.footprint?.h ?? 2, 95, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawStonePillar(ctx, box));
  },

  // A squat stone post with heavy chains drooping to the floor on both sides.
  'ch10-chain-pillar': (scene, def) => paintTexture(scene, def.texture, 56, 76, ctx => {
    const post: IsoBox = { x: 28, y: 70, w: 16, d: 16, h: 56 };
    groundShadow(ctx, post, 5, 0.3);
    stonePost(ctx, post, 71);
    const ringL = { x: 19, y: 30 };
    const ringR = { x: 37, y: 30 };
    shackle(ctx, ringL.x, ringL.y - 2, 2);
    shackle(ctx, ringR.x, ringR.y - 2, 2);
    chain(ctx, sagPath(ringL, { x: 4, y: 66 }, 4), 4.5);
    chain(ctx, sagPath(ringR, { x: 52, y: 64 }, 4), 4.5);
    chain(ctx, coilPath(8, 68, 6, 2.5, 1.2), 4);
  }),

  // An iron-banded timber post with two shackles on a short chain.
  'ch10-chain-post': (scene, def) => paintTexture(scene, def.texture, 50, 70, ctx => {
    const post: IsoBox = { x: 25, y: 66, w: 11, d: 11, h: 52 };
    groundShadow(ctx, post, 4, 0.3);
    walls(ctx, post, (c, w, h, light) => planks(c, w, h, { base: 0x3a2a1c, light, seed: 77 }, true, 4), {
      left: (c, w, _h, l) => {
        for (const v of [6, 30]) {
          c.fillStyle = css(shade(0x2a2a2a, l));
          c.fillRect(0, v, w, 3);
          c.fillStyle = css(shade(0x8a867d, l), 0.6);
          c.fillRect(w / 2, v + 1, 1, 1);
        }
      },
      right: (c, w, _h, l) => {
        for (const v of [6, 30]) {
          c.fillStyle = css(shade(0x2a2a2a, l));
          c.fillRect(0, v, w, 3);
        }
      },
    });
    flatTop(ctx, post, 0x3a2a1c);
    outlineBox(ctx, post, 0x0c0c0b);
    const ring = { x: 25, y: 34 };
    chain(ctx, sagPath(ring, { x: 12, y: 44 }, 2), 4);
    chain(ctx, sagPath(ring, { x: 38, y: 44 }, 2), 4);
    shackle(ctx, 12, 44, 4);
    shackle(ctx, 38, 44, 4);
  }),

  'ch10-chain-coil': (scene, def) => paintTexture(scene, def.texture, 52, 44, ctx => {
    contactShadow(ctx, 26, 30, 19, 6, 0.3);
    chain(ctx, coilPath(25, 31, 15, 6.5, 2.6, 0.25), 4.8);
    chain(ctx, sagPath({ x: 38, y: 33 }, { x: 49, y: 39 }, 1), 4.8);
    shackle(ctx, 49, 37, 3.2);
  }),

  // Straw spread on the stone floor for a bed.
  'ch10-straw': (scene, def) => paintTexture(scene, def.texture, 64, 36, ctx => {
    const rand = rng(97);
    const g = ctx.createRadialGradient(32, 22, 2, 32, 22, 28);
    g.addColorStop(0, 'rgba(120,104,66,0.9)');
    g.addColorStop(1, 'rgba(90,78,50,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(32, 22, 28, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 180; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand());
      const x = 32 + Math.cos(a) * 25 * d;
      const y = 22 + Math.sin(a) * 10 * d;
      const ang = (rand() - 0.5) * 1.6;
      const len = 3 + rand() * 6;
      ctx.strokeStyle = css(shade(0xb8a068, 0.6 + rand() * 0.6), 0.85);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len * 0.5);
      ctx.stroke();
    }
  }),

  // Light falling from the stair through the dark: kept translucent, since
  // the ambience also lays a light pool here.
  'ch10-light-shaft': (scene, def) => paintTexture(scene, def.texture, 64, 104, ctx => {
    for (const [top, bottom, alpha] of [[8, 28, 0.06], [6, 23, 0.08], [4, 17, 0.1]] as const) {
      const g = ctx.createLinearGradient(0, 0, 0, 98);
      g.addColorStop(0, `rgba(242,230,184,${alpha * 0.4})`);
      g.addColorStop(1, `rgba(242,230,184,${alpha})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(32 - top, 0);
      ctx.lineTo(32 + top, 0);
      ctx.lineTo(32 + bottom, 96);
      ctx.lineTo(32 - bottom, 96);
      ctx.closePath();
      ctx.fill();
    }
    const pool = ctx.createRadialGradient(32, 96, 1, 32, 96, 28);
    pool.addColorStop(0, 'rgba(242,230,184,0.32)');
    pool.addColorStop(1, 'rgba(242,230,184,0)');
    ctx.fillStyle = pool;
    ctx.save();
    ctx.translate(32, 96);
    ctx.scale(1, 0.36);
    ctx.translate(-32, -96);
    ctx.beginPath();
    ctx.arc(32, 96, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Dust turning in the light.
    const rand = rng(13);
    for (let i = 0; i < 26; i++) {
      const y = rand() * 92;
      const spread = 6 + (y / 96) * 18;
      ctx.fillStyle = `rgba(255,246,214,${0.25 + rand() * 0.35})`;
      ctx.fillRect(32 + (rand() - 0.5) * spread * 2, y, 1, 1);
    }
  }),
};
