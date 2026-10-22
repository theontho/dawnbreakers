import { css, footprintBox, groundShadow, outlineBox, paintTexture, rng, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { chain, coilPath, sagPath, shackle } from '../art/cordage';
import { brick, planks, stone } from '../art/materials';
import { archPath, flatTop, walls } from '../art/ornaments';
import { contactShadow } from '../art/woodland';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 10, the Síyáh-Chál: a disused reservoir under Ṭihrán, its vaults
 * of sooty brick and damp stone, the pillars to which the prisoners were
 * chained, their straw, and the one shaft of light from the stair.
 */

const SOOT_BRICK = 0x6a5a4c;
const DAMP_STONE = 0x5a5650;

/** Water stains, lime bloom and a dark tide line at the foot of a damp wall. */
function damp(c: Ctx, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < w / 14; i++) {
    const x = rand() * w;
    const top = h * (0.1 + rand() * 0.4);
    const g = c.createLinearGradient(0, top, 0, h);
    g.addColorStop(0, 'rgba(20,24,22,0)');
    g.addColorStop(1, 'rgba(20,24,22,0.45)');
    c.fillStyle = g;
    c.fillRect(x, top, 2 + rand() * 4, h - top);
  }
  c.fillStyle = 'rgba(230,228,215,0.18)';
  for (let i = 0; i < w / 3; i++) c.fillRect(rand() * w, h * 0.55 + rand() * h * 0.35, 1.2, 1);
  const tide = c.createLinearGradient(0, h - 14, 0, h);
  tide.addColorStop(0, 'rgba(30,38,34,0)');
  tide.addColorStop(1, 'rgba(30,38,34,0.55)');
  c.fillStyle = tide;
  c.fillRect(0, h - 14, w, 14);
}

/** Recessed arches: the reservoir's arcade, blind and black. */
function blindArches(c: Ctx, w: number, h: number, l: number, bays: number, height: number): void {
  for (let i = 0; i < bays; i++) {
    const bw = Math.min(26, (w / bays) * 0.7);
    const u = (w / bays) * (i + 0.5);
    archPath(c, u - bw / 2 - 2, h, bw + 4, height + 2);
    c.fillStyle = css(shade(SOOT_BRICK, l * 1.15));
    c.fill();
    archPath(c, u - bw / 2, h, bw, height);
    const g = c.createLinearGradient(0, h - height, 0, h);
    g.addColorStop(0, '#060504');
    g.addColorStop(1, '#1a1612');
    c.fillStyle = g;
    c.fill();
  }
}

/** A square post of damp stone at the cell's centre. */
function stonePost(ctx: Ctx, box: IsoBox, seed: number): void {
  walls(ctx, box, (c, w, h, light) => {
    stone(c, w, h, { base: DAMP_STONE, light, seed: seed + (light === 1 ? 0 : 1) }, 7);
    damp(c, w, h, seed);
  });
  flatTop(ctx, box, DAMP_STONE);
  outlineBox(ctx, box, 0x0c0c0b);
}

export const CH10_PRISON_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch10-vault-wall': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 1, def.footprint?.h ?? 4, 84, 8);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 6, 0.35);
      const face = (c: Ctx, w: number, h: number, light: number) => {
        brick(c, w, h, { base: SOOT_BRICK, light, seed: light === 1 ? 41 : 42 }, 4, 9);
        c.save();
        c.beginPath();
        c.rect(0, h - 22, w, 22);
        c.clip();
        stone(c, w, h, { base: DAMP_STONE, light, seed: 43 }, 7);
        c.restore();
      };
      walls(ctx, box, face, {
        left: (c, w, h) => damp(c, w, h, 44),
        right: (c, w, h, l) => {
          blindArches(c, w, h - 22, l, Math.round(w / 64), 36);
          damp(c, w, h, 45);
        },
      });
      flatTop(ctx, box, shade(SOOT_BRICK, 0.8));
      outlineBox(ctx, box, 0x0b0b0a);
    });
  },

  'ch10-low-arch': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 4, def.footprint?.h ?? 1, 46, 12);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 6, 0.32);
      walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: SOOT_BRICK, light, seed: light === 1 ? 51 : 52 }, 4, 9), {
        left: (c, w, h, l) => {
          blindArches(c, w, h, l, Math.round(w / 40), 28);
          damp(c, w, h, 53);
        },
        right: (c, w, h, l) => {
          blindArches(c, w, h, l, 1, 32);
          damp(c, w, h, 54);
        },
      });
      flatTop(ctx, box, shade(SOOT_BRICK, 0.85));
      outlineBox(ctx, box, 0x0b0b0a);
    });
  },

  // A massive vault pier: plinth, shaft of dressed stone, impost slab.
  'ch10-stone-pillar': (scene, def) => {
    const cw = def.footprint?.w ?? 2;
    const cd = def.footprint?.h ?? 2;
    const { box, texW, texH } = footprintBox(cw, cd, 76, 8);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 8, 0.35);
      const inset = 6;
      const plinth: IsoBox = { ...box, h: 9 };
      // Inset on every side and standing on the plinth.
      const shaft: IsoBox = { x: box.x, y: box.y - inset - plinth.h, w: box.w - inset * 2, d: box.d - inset * 2, h: box.h - 18 };
      const impost: IsoBox = { ...box, y: box.y - box.h + 9, h: 9 };
      stonePost(ctx, plinth, 61);
      stonePost(ctx, shaft, 63);
      stonePost(ctx, impost, 65);
    });
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
