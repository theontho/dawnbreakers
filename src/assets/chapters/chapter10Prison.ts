import { css, footprintBox, groundShadow, outlineBox, paintTexture, rng, shade, type IsoBox } from '../art/canvasKit';
import { chain, coilPath, sagPath, shackle } from '../art/cordage';
import { planks } from '../art/materials';
import { flatTop, walls } from '../art/ornaments';
import { drawStonePillar, PILLAR_H, stonePost } from '../art/siyahChal';
import { contactShadow } from '../art/woodland';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 10, the Síyáh-Chál at true scale: a disused reservoir under
 * Ṭihrán. Its vault piers are drawn in `art/siyahChal.ts` (its arcade walls
 * are connected wall styles in walls.ts); this
 * file holds the pillars to which the prisoners were chained, their straw,
 * and the one shaft of light from a crack in the vault.
 */

export const CH10_PRISON_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {

  'ch10-stone-pillar': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 2, def.footprint?.h ?? 2, PILLAR_H, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawStonePillar(ctx, box));
  },

  // A slender stone pier (3.6 m) with heavy chains run through its rings at
  // the height of a seated man's neck, drooping to the floor on both sides.
  'ch10-chain-pillar': (scene, def) => paintTexture(scene, def.texture, 64, 104, ctx => {
    const post: IsoBox = { x: 32, y: 96, w: 18, d: 18, h: 84 };
    groundShadow(ctx, post, 5, 0.3);
    stonePost(ctx, post, 71);
    const ringL = { x: 22, y: 70 };
    const ringR = { x: 42, y: 70 };
    shackle(ctx, ringL.x, ringL.y - 2, 2.4);
    shackle(ctx, ringR.x, ringR.y - 2, 2.4);
    chain(ctx, sagPath(ringL, { x: 4, y: 94 }, 4), 4.5);
    chain(ctx, sagPath(ringR, { x: 60, y: 92 }, 4), 4.5);
    chain(ctx, coilPath(10, 96, 7, 2.8, 1.2), 4);
  }),

  // An iron-banded timber post with two shackles on a short chain.
  'ch10-chain-post': (scene, def) => paintTexture(scene, def.texture, 56, 84, ctx => {
    const post: IsoBox = { x: 28, y: 80, w: 13, d: 13, h: 64 };
    groundShadow(ctx, post, 4, 0.3);
    walls(ctx, post, (c, w, h, light) => planks(c, w, h, { base: 0x3a2a1c, light, seed: 77 }, true, 4), {
      left: (c, w, _h, l) => {
        for (const v of [8, 38]) {
          c.fillStyle = css(shade(0x2a2a2a, l));
          c.fillRect(0, v, w, 3);
          c.fillStyle = css(shade(0x8a867d, l), 0.6);
          c.fillRect(w / 2, v + 1, 1, 1);
        }
      },
      right: (c, w, _h, l) => {
        for (const v of [8, 38]) {
          c.fillStyle = css(shade(0x2a2a2a, l));
          c.fillRect(0, v, w, 3);
        }
      },
    });
    flatTop(ctx, post, 0x3a2a1c);
    outlineBox(ctx, post, 0x0c0c0b);
    const ring = { x: 28, y: 46 };
    chain(ctx, sagPath(ring, { x: 12, y: 58 }, 3), 4.5);
    chain(ctx, sagPath(ring, { x: 44, y: 58 }, 3), 4.5);
    shackle(ctx, 12, 58, 4.5);
    shackle(ctx, 44, 58, 4.5);
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

  // Light falling through a crack in the vault, 5 m overhead, to the floor:
  // kept translucent, since the ambience also lays a light pool here.
  'ch10-light-shaft': (scene, def) => paintTexture(scene, def.texture, 96, 176, ctx => {
    const cx = 48;
    const floor = 164;
    for (const [top, bottom, alpha] of [[9, 36, 0.12], [6, 28, 0.16], [4, 20, 0.22]] as const) {
      const g = ctx.createLinearGradient(0, 0, 0, floor);
      g.addColorStop(0, `rgba(242,230,184,${alpha * 0.4})`);
      g.addColorStop(1, `rgba(242,230,184,${alpha})`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(cx - top, 0);
      ctx.lineTo(cx + top, 0);
      ctx.lineTo(cx + bottom, floor);
      ctx.lineTo(cx - bottom, floor);
      ctx.closePath();
      ctx.fill();
    }
    const pool = ctx.createRadialGradient(cx, floor, 1, cx, floor, 38);
    pool.addColorStop(0, 'rgba(242,230,184,0.5)');
    pool.addColorStop(1, 'rgba(242,230,184,0)');
    ctx.fillStyle = pool;
    ctx.save();
    ctx.translate(cx, floor);
    ctx.scale(1, 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Dust turning in the light.
    const rand = rng(13);
    for (let i = 0; i < 40; i++) {
      const y = rand() * (floor - 4);
      const spread = 7 + (y / floor) * 26;
      ctx.fillStyle = `rgba(255,246,214,${0.25 + rand() * 0.35})`;
      ctx.fillRect(cx + (rand() - 0.5) * spread * 2, y, 1, 1);
    }
  }),
};
