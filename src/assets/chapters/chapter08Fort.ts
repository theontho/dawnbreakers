import { css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, polygon, rng, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { stone } from '../art/materials';
import { flatTop, LIGHT, walls } from '../art/ornaments';
import { standard } from '../art/banners';
import { drawRoundTent } from '../art/roundTent';
import { paintWatchtower } from '../art/watchtower';
import { roundLog } from '../art/timber';
import { boulder, contactShadow } from '../art/woodland';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { flame } from './chapter08Forest';

/**
 * Chapter 8 siege props: the Black Standard raised from Khurásán, the
 * timber watchtowers and lean-tos of the companions, the cauldron of the
 * hungry months, a fresh grave, and the royal camp's tents and earthworks.
 */

/** A point `z` pixels above the ground at (p, q) in `box` axes. */
const lift = (box: IsoBox, p: number, q: number, z: number) => {
  const g = groundPoint(box, p, q);
  return { x: g.x, y: g.y - z };
};

export const CH08_FORT_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  // The Black Standard on a lance-pole some 6 m high, its cloth longer than a man.
  'ch8-black-standard': (scene, def) => paintTexture(scene, def.texture, 72, 176, ctx => {
    standard(ctx, 22, 160, 138, { cloth: 0x161616, w: 44, h: 64, waves: 2, forked: true, finial: 'spear' });
  }),

  'ch8-watchtower': (scene, def) => paintWatchtower(scene, def.texture),

  // Boughs laid over a ridge pole: high at the back, open at the side.
  'ch8-lean-to': (scene, def) => {
    // Two cells of boughs: high enough at the back for a man to sit up under.
    const { box, texW, texH } = footprintBox(2, 2, 0, 70);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, { ...box, h: 0 }, 8, 0.24);
      const { w, d } = box;
      const high = 62;
      const low = 14;
      // The open end: shadowed interior with a bedroll.
      polygon(ctx, [lift(box, 0, 0, 0), lift(box, w, 0, 0), lift(box, w, 0, low), lift(box, 0, 0, high)]);
      const inside = ctx.createLinearGradient(box.x - w, 0, box.x, 0);
      inside.addColorStop(0, '#120a05');
      inside.addColorStop(1, '#2a1a0e');
      ctx.fillStyle = inside;
      ctx.fill();
      const roll = lift(box, w * 0.45, 4, 4);
      ctx.fillStyle = css(0x8a3a2a);
      ctx.beginPath();
      ctx.ellipse(roll.x, roll.y, 18, 6, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(0xd8c8a0, 0.8);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      for (const p of [0, w * 0.5]) {
        const a = lift(box, p, 0, 0);
        const b = lift(box, p, 0, high - (high - low) * (p / w));
        ctx.strokeStyle = css(0x4a3220);
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // Roof of boughs and bracken, sloping toward the viewer.
      const r = (p: number, q: number) => lift(box, p, q, high - (high - low) * (p / w));
      const roof = [r(-3, -5), r(w + 5, -5), r(w + 5, d + 3), r(-3, d + 3)];
      polygon(ctx, roof);
      ctx.fillStyle = css(0x4a3a24);
      ctx.fill();
      ctx.save();
      polygon(ctx, roof);
      ctx.clip();
      const rand = rng(29);
      for (let i = 0; i < 260; i++) {
        const p = rand() * (w + 4) - 3;
        const q = rand() * (d + 4) - 3;
        const a = r(p, q);
        const b = r(p + 10 + rand() * 14, q + (rand() - 0.5) * 6);
        ctx.strokeStyle = css(shade(0x6b5136, 0.7 + rand() * 0.6));
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let i = 0; i < 620; i++) {
        const p = rand() * w;
        const pt = r(p, rand() * d);
        const leaf = [0x3f6a32, 0x557f3c, 0x8a7a3a, 0x9a5a2a][Math.floor(rand() * 4)]!;
        ctx.fillStyle = css(shade(leaf, 0.75 + (1 - p / w) * 0.5), 0.95);
        ctx.fillRect(pt.x, pt.y, 3, 1.8);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(20,10,4,0.75)';
      ctx.lineWidth = 1;
      polygon(ctx, roof);
      ctx.stroke();
      // A clay pot and a few sticks of kindling by the open end.
      const pot = lift(box, w * 0.2, -6, 0);
      contactShadow(ctx, pot.x + 1, pot.y, 6, 2.4, 0.3);
      ctx.fillStyle = css(0x8a5030);
      ctx.beginPath();
      ctx.ellipse(pot.x, pot.y - 5, 5.5, 5.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0x3a2010);
      ctx.fillRect(pot.x - 3, pot.y - 11, 6, 2);
      for (let i = 0; i < 3; i++) roundLog(ctx, lift(box, w * 0.55 + i * 3, -9, 1.2), lift(box, w * 0.55 + i * 3 + 16, -4, 1.2), 1.3, { ends: 'b', seed: 40 + i });
    });
  },

  // An iron cauldron over a low fire: little in it but water and hide.
  'ch8-cauldron': (scene, def) => paintTexture(scene, def.texture, 48, 46, ctx => {
    contactShadow(ctx, 25, 39, 18, 5);
    flame(ctx, 18, 41, 4, 12);
    flame(ctx, 30, 41, 4, 11);
    const body = ctx.createRadialGradient(18, 26, 2, 24, 30, 16);
    body.addColorStop(0, '#5a5a58');
    body.addColorStop(0.5, '#2a2a28');
    body.addColorStop(1, '#0e0e0d');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(10, 23);
    ctx.bezierCurveTo(9, 34, 15, 38, 24, 38);
    ctx.bezierCurveTo(33, 38, 39, 34, 38, 23);
    ctx.closePath();
    ctx.fill();
    for (const [x, y] of [[12, 38], [36, 38], [24, 41]] as const) boulder(ctx, x, y + 2, 4, 3.5, 0x6f6a62, x);
    ctx.fillStyle = css(0x3a3a38);
    ctx.beginPath();
    ctx.ellipse(24, 23, 14.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x5a4a34);
    ctx.beginPath();
    ctx.ellipse(24, 23.5, 11.5, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,210,0.25)';
    ctx.fillRect(16, 22.5, 6, 1);
    ctx.strokeStyle = css(0x7a7a76);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(24, 23, 14.5, 5, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
    steam(ctx, 22, 18);
  }),

  // A fresh grave ringed with stones, a plain marker and a small oil lamp.
  'ch8-grave': (scene, def) => paintTexture(scene, def.texture, 56, 40, ctx => {
    contactShadow(ctx, 29, 28, 24, 8, 0.2);
    const mound = ctx.createLinearGradient(14, 16, 40, 34);
    mound.addColorStop(0, '#8a6a44');
    mound.addColorStop(0.5, '#6b4a2a');
    mound.addColorStop(1, '#3f2a18');
    ctx.fillStyle = mound;
    ctx.beginPath();
    ctx.ellipse(28, 25, 19, 8.5, -0.42, 0, Math.PI * 2);
    ctx.fill();
    const rand = rng(77);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = css(rand() < 0.5 ? 0x9a7a52 : 0x3a2616, 0.6);
      ctx.fillRect(14 + rand() * 28, 19 + rand() * 12, 1, 1);
    }
    const marker: IsoBox = { x: 40, y: 18, w: 3, d: 8, h: 12 };
    walls(ctx, marker, (c, w, h, light) => stone(c, w, h, { base: 0x9a958a, light, seed: 4 }, 4));
    flatTop(ctx, marker, 0x9a958a);
    outlineBox(ctx, marker);
    const tilt = -0.42;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
      const ex = Math.cos(a) * 23;
      const ey = Math.sin(a) * 10;
      const x = 28 + ex * Math.cos(tilt) - ey * Math.sin(tilt);
      const y = 25 + ex * Math.sin(tilt) + ey * Math.cos(tilt);
      boulder(ctx, x, y + 2, 2.6, 2.2, 0xd8d2c0, Math.round(a * 10));
    }
    // Clay lamp at the foot of the grave.
    ctx.fillStyle = css(0x9a5a30);
    ctx.beginPath();
    ctx.ellipse(16, 30, 3, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();
    flame(ctx, 16, 29, 1.2, 4);
  }),

  // The royal army's bank of rammed earth, chest high, stakes pointed at the fort.
  'ch8-earthwork': (scene, def) => {
    const box: IsoBox = { x: 32, y: 76, w: 32, d: 32, h: 0 };
    paintTexture(scene, def.texture, 64, 76, ctx => {
      const e = (p: number, q: number, z: number) => lift(box, p, q, z);
      const crest = 32;
      const earth = 0x6b4a2a;
      contactShadow(ctx, 36, 42, 22, 9, 0.18);
      const face = (pts: Array<{ x: number; y: number }>, color: number) => {
        polygon(ctx, pts);
        ctx.fillStyle = css(color);
        ctx.fill();
        ctx.strokeStyle = css(shade(color, 0.6), 0.6);
        ctx.lineWidth = 0.6;
        ctx.stroke();
      };
      face([e(12, 0, crest), e(3, 0, 0), e(3, 32, 0), e(12, 32, crest)], shade(earth, 0.55));
      face([e(12, 0, crest), e(21, 0, crest), e(21, 32, crest), e(12, 32, crest)], shade(earth, LIGHT.roof));
      face([e(21, 0, crest), e(29, 0, 0), e(29, 32, 0), e(21, 32, crest)], shade(earth, LIGHT.right));
      face([e(3, 0, 0), e(29, 0, 0), e(21, 0, crest), e(12, 0, crest)], shade(earth, LIGHT.left * 0.92));
      // Clods and spade marks.
      const rand = rng(51);
      for (let i = 0; i < 140; i++) {
        const pt = e(5 + rand() * 22, rand() * 32, rand() * crest * 0.9);
        ctx.fillStyle = css(rand() < 0.5 ? shade(earth, 1.35) : shade(earth, 0.5), 0.55);
        ctx.fillRect(pt.x, pt.y, 1.2, 1);
      }
      for (let q = 2; q < 32; q += 4) {
        const base = e(14, q, crest - 2);
        const tip = e(-2, q + 0.5, crest + (q % 8 < 4 ? 12 : 8));
        roundLog(ctx, base, tip, 1.7, { ends: 'none', bark: 0x5a3c22, seed: q });
        ctx.fillStyle = css(0xc9a46e);
        ctx.fillRect(tip.x - 1, tip.y - 0.5, 1.4, 1.1);
      }
    });
  },

  // A round Qajar army tent of canvas with a painted valance: 4 m across, its pole 4.3 m.
  'ch8-army-tent': (scene, def) => {
    const { box, texW, texH } = footprintBox(3, 3, 100, 20);
    paintTexture(scene, def.texture, texW + 24, texH + 6, ctx => {
      ctx.translate(12, 0);
      drawRoundTent(ctx, box, { apex: 100, wall: 36 });
    });
  },

  'ch8-log-bridge': (scene, def) => {
    // 5.6 m of split logs on two stringers, 2.8 m wide, a hand rail a metre high.
    const { box, texW, texH } = footprintBox(4, 2, 8, 30);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 5, 0.25);
      const { w, d, h } = box;
      for (const q of [5, d - 5]) {
        roundLog(ctx, lift(box, -3, q, 3.5), lift(box, w + 3, q, 3.5), 4.5, { ends: 'b', seed: q, bark: 0x4a3220 });
      }
      for (let p = 2; p < w; p += 7) {
        roundLog(ctx, lift(box, p, -2, h - 3.5), lift(box, p, d + 2, h - 3.5), 3.5, { ends: 'a', seed: Math.round(p), bark: 0x6b4a2c });
      }
      // Hand rail on the downstream side.
      const posts = [6, w * 0.35, w * 0.65, w - 6].map(p => [lift(box, p, d - 2, h), lift(box, p, d - 2, h + 24)] as const);
      ctx.strokeStyle = css(0x3d2816);
      ctx.lineWidth = 3.4;
      for (const [a, b] of posts) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      roundLog(ctx, lift(box, 2, d - 2, h + 23), lift(box, w - 2, d - 2, h + 23), 2.2, { ends: 'none', seed: 9 });
    });
  },

  // Fieldstones gathered for the wall.
  'ch8-stone-pile': (scene, def) => paintTexture(scene, def.texture, 48, 38, ctx => {
    contactShadow(ctx, 25, 31, 20, 6, 0.22);
    const stones: ReadonlyArray<readonly [number, number, number, number, number]> = [
      [24, 20, 7, 7, 0xa4a49a], [16, 25, 7, 6, 0x9a9a90], [31, 25, 7, 6, 0x7f7f76],
      [10, 31, 7, 6, 0x7a7a70], [23, 33, 9, 7, 0x8c8c82], [37, 31, 7, 6, 0x6f6f68],
    ];
    stones.forEach(([x, y, rx, h, c], i) => boulder(ctx, x, y, rx, h, c, 40 + i));
  }),
};

/** Thin wisps rising from a pot. */
function steam(ctx: Ctx, x: number, y: number): void {
  ctx.strokeStyle = 'rgba(232,226,208,0.35)';
  ctx.lineWidth = 2.2;
  for (const [dx, h] of [[0, 14], [6, 10]] as const) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.bezierCurveTo(x + dx - 4, y - h * 0.4, x + dx + 4, y - h * 0.6, x + dx, y - h);
    ctx.stroke();
  }
}
