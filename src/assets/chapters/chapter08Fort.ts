import { baseCorners, css, footprintBox, groundPoint, groundShadow, mix, outlineBox, paintTexture, polygon, rng, shade, topCorners, type Ctx, type IsoBox } from '../art/canvasKit';
import { stone } from '../art/materials';
import { flatTop, LIGHT, walls } from '../art/ornaments';
import { standard } from '../art/banners';
import { logCourses, roundLog } from '../art/timber';
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
  'ch8-black-standard': (scene, def) => paintTexture(scene, def.texture, 48, 116, ctx => {
    standard(ctx, 16, 112, 100, { cloth: 0x161616, w: 28, h: 42, waves: 2, forked: true, finial: 'spear' });
  }),

  // Log tower on a stone footing, with a thatched lookout.
  'ch8-watchtower': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 76, 30);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 6);
      const body: IsoBox = { ...box, h: 56 };
      walls(ctx, body, (c, w, h, light) => logCourses(c, w, h, light, light === 1 ? 3 : 4, 5.5), {
        left: (c, w, h) => {
          c.fillStyle = css(0x120a05);
          c.fillRect(w / 2 - 1.5, h * 0.28, 3, 9);
        },
        right: (c, w, h) => {
          c.fillStyle = css(0x120a05);
          c.fillRect(w / 2 - 5, h - 18, 10, 18);
          c.fillStyle = css(0x3a2616);
          c.fillRect(w / 2 - 6, h - 19, 12, 1.5);
        },
      });
      const footing: IsoBox = { ...box, h: 9 };
      walls(ctx, footing, (c, w, h, light) => stone(c, w, h, { base: 0x8a8578, light, seed: 13 }, 4.5));
      outlineBox(ctx, body);
      flatTop(ctx, body, 0x6b4a2c);
      lookout(ctx, { ...box, y: box.y - body.h, h: 20 });
    });
  },

  // Boughs laid over a ridge pole: high at the back, open at the side.
  'ch8-lean-to': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 0, 36);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, { ...box, h: 0 }, 6, 0.24);
      const { w, d } = box;
      const high = 30;
      const low = 4;
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
      ctx.ellipse(roll.x, roll.y, 7, 3.5, 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(0xd8c8a0, 0.8);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      for (const p of [0, w * 0.5]) {
        const a = lift(box, p, 0, 0);
        const b = lift(box, p, 0, high - (high - low) * (p / w));
        ctx.strokeStyle = css(0x4a3220);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      // Roof of boughs and bracken, sloping toward the viewer.
      const r = (p: number, q: number) => lift(box, p, q, high - (high - low) * (p / w));
      const roof = [r(-2, -3), r(w + 3, -3), r(w + 3, d + 2), r(-2, d + 2)];
      polygon(ctx, roof);
      ctx.fillStyle = css(0x4a3a24);
      ctx.fill();
      ctx.save();
      polygon(ctx, roof);
      ctx.clip();
      const rand = rng(29);
      for (let i = 0; i < 90; i++) {
        const p = rand() * (w + 4) - 3;
        const q = rand() * (d + 4) - 3;
        const a = r(p, q);
        const b = r(p + 6 + rand() * 8, q + (rand() - 0.5) * 4);
        ctx.strokeStyle = css(shade(0x6b5136, 0.7 + rand() * 0.6));
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      for (let i = 0; i < 160; i++) {
        const p = rand() * w;
        const pt = r(p, rand() * d);
        const leaf = [0x3f6a32, 0x557f3c, 0x8a7a3a, 0x9a5a2a][Math.floor(rand() * 4)]!;
        ctx.fillStyle = css(shade(leaf, 0.75 + (1 - p / w) * 0.5), 0.95);
        ctx.fillRect(pt.x, pt.y, 2.2, 1.4);
      }
      ctx.restore();
      ctx.strokeStyle = 'rgba(20,10,4,0.75)';
      ctx.lineWidth = 1;
      polygon(ctx, roof);
      ctx.stroke();
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

  // The royal army's bank of rammed earth, stakes pointed at the fort.
  'ch8-earthwork': (scene, def) => {
    const box: IsoBox = { x: 32, y: 56, w: 32, d: 32, h: 0 };
    paintTexture(scene, def.texture, 64, 56, ctx => {
      const e = (p: number, q: number, z: number) => lift(box, p, q, z);
      const crest = 14;
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
      for (let i = 0; i < 70; i++) {
        const pt = e(5 + rand() * 22, rand() * 32, rand() * crest * 0.9);
        ctx.fillStyle = css(rand() < 0.5 ? shade(earth, 1.35) : shade(earth, 0.5), 0.55);
        ctx.fillRect(pt.x, pt.y, 1.2, 1);
      }
      for (let q = 2; q < 32; q += 4) {
        const base = e(14, q, crest - 2);
        const tip = e(4, q + 0.5, crest + (q % 8 < 4 ? 6 : 4));
        roundLog(ctx, base, tip, 1.1, { ends: 'none', bark: 0x5a3c22, seed: q });
        ctx.fillStyle = css(0xc9a46e);
        ctx.fillRect(tip.x - 1, tip.y - 0.5, 1.4, 1.1);
      }
    });
  },

  // A round Qajar army tent of canvas with a painted valance.
  'ch8-army-tent': (scene, def) => {
    const { box, texW, texH } = footprintBox(2, 2, 0, 68);
    paintTexture(scene, def.texture, texW, texH, ctx => armyTent(ctx, box));
  },

  'ch8-log-bridge': (scene, def) => {
    const { box, texW, texH } = footprintBox(3, 1, 6, 14);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 5, 0.25);
      const { w, d, h } = box;
      for (const q of [5, d - 5]) {
        roundLog(ctx, lift(box, -2, q, 2.5), lift(box, w + 2, q, 2.5), 3, { ends: 'b', seed: q, bark: 0x4a3220 });
      }
      for (let p = 2; p < w; p += 5.4) {
        roundLog(ctx, lift(box, p, -1, h - 2.6), lift(box, p, d + 1, h - 2.6), 2.7, { ends: 'a', seed: Math.round(p), bark: 0x6b4a2c });
      }
      // Hand rail on the downstream side.
      const posts = [6, w / 2, w - 6].map(p => [lift(box, p, d - 1, h), lift(box, p, d - 1, h + 12)] as const);
      ctx.strokeStyle = css(0x3d2816);
      ctx.lineWidth = 2.4;
      for (const [a, b] of posts) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      roundLog(ctx, lift(box, 2, d - 1, h + 11), lift(box, w - 2, d - 1, h + 11), 1.6, { ends: 'none', seed: 9 });
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

/** Corner posts, rails and a pyramidal thatch roof over a tower's top. */
function lookout(ctx: Ctx, top: IsoBox): void {
  const bases = baseCorners(top);
  const tops = topCorners(top);
  const post = (i: number) => {
    ctx.strokeStyle = css(0x3d2816);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bases[i]!.x, bases[i]!.y);
    ctx.lineTo(tops[i]!.x, tops[i]!.y);
    ctx.stroke();
  };
  const rail = (i: number, j: number) => {
    ctx.strokeStyle = css(0x5a3c22);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bases[i]!.x, bases[i]!.y - 9);
    ctx.lineTo(bases[j]!.x, bases[j]!.y - 9);
    ctx.stroke();
  };
  // Corners: 0 front, 1 right, 2 back, 3 left. Back first, front last.
  // The far walls of the gallery lie in the roof's shadow.
  for (const [i, j] of [[3, 2], [2, 1]] as const) {
    polygon(ctx, [bases[i]!, bases[j]!, tops[j]!, tops[i]!]);
    ctx.fillStyle = css(0x24170c);
    ctx.fill();
  }
  post(2);
  rail(3, 2);
  rail(2, 1);
  post(3);
  post(1);
  rail(3, 0);
  rail(0, 1);
  post(0);
  // Roof.
  const corners = [tops[3]!, tops[0]!, tops[1]!, tops[2]!];
  const mx = corners.reduce((s, p) => s + p.x, 0) / 4;
  const my = corners.reduce((s, p) => s + p.y, 0) / 4;
  const eave = corners.map(p => ({ x: mx + (p.x - mx) * 1.18, y: my + (p.y - my) * 1.18 }));
  const apex = { x: mx, y: my - 20 };
  const [el, ef, er] = eave;
  for (const [a, c, light] of [[el!, ef!, LIGHT.left], [ef!, er!, LIGHT.right]] as const) {
    polygon(ctx, [a, c, apex]);
    ctx.fillStyle = css(shade(0x9a8050, light));
    ctx.fill();
    ctx.save();
    polygon(ctx, [a, c, apex]);
    ctx.clip();
    ctx.strokeStyle = css(shade(0x6a5430, light), 0.7);
    ctx.lineWidth = 0.7;
    for (let t = 0; t <= 1; t += 0.06) {
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(a.x + (c.x - a.x) * t, a.y + (c.y - a.y) * t);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(20,10,4,0.8)';
  ctx.lineWidth = 1;
  polygon(ctx, [el!, ef!, er!, apex]);
  ctx.stroke();
}

function armyTent(ctx: Ctx, box: IsoBox): void {
  const centre = groundPoint(box, box.w / 2, box.d / 2);
  const cx = centre.x;
  const cy = centre.y;
  const rx = box.w * 0.72;
  const ry = rx / 2;
  const wallH = 12;
  const apexY = cy - wallH - 54;
  const canvas = 0xd8cba8;
  ctx.fillStyle = 'rgba(10,6,3,0.25)';
  ctx.beginPath();
  ctx.ellipse(cx + 6, cy + 2, rx + 6, ry + 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const lit = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
  lit.addColorStop(0, css(shade(canvas, 1.08)));
  lit.addColorStop(0.4, css(canvas));
  lit.addColorStop(1, css(shade(canvas, 0.58)));
  // Wall drum.
  ctx.fillStyle = lit;
  ctx.beginPath();
  ctx.moveTo(cx - rx, cy - wallH);
  ctx.lineTo(cx - rx, cy);
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rx, cy - wallH);
  ctx.closePath();
  ctx.fill();
  // Cone.
  ctx.beginPath();
  ctx.moveTo(cx - rx - 2, cy - wallH);
  ctx.lineTo(cx, apexY);
  ctx.lineTo(cx + rx + 2, cy - wallH);
  ctx.ellipse(cx, cy - wallH, rx + 2, ry + 1, 0, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = css(shade(canvas, 0.7), 0.6);
  ctx.lineWidth = 0.7;
  for (let t = 0.08; t < 1; t += 0.1) {
    const a = Math.PI * t;
    ctx.beginPath();
    ctx.moveTo(cx, apexY);
    ctx.lineTo(cx + Math.cos(a) * (rx + 2), cy - wallH + Math.sin(a) * (ry + 1));
    ctx.stroke();
  }
  ctx.restore();
  // Valance: red and blue scallops along the eave.
  for (let i = 0; i < 16; i++) {
    const a0 = Math.PI * (i / 16);
    const a1 = Math.PI * ((i + 1) / 16);
    const p0 = { x: cx + Math.cos(a0) * (rx + 2), y: cy - wallH + Math.sin(a0) * (ry + 1) };
    const p1 = { x: cx + Math.cos(a1) * (rx + 2), y: cy - wallH + Math.sin(a1) * (ry + 1) };
    // Angles run from the shaded right (i = 0) round to the sunlit left.
    ctx.fillStyle = css(shade(i % 2 ? 0x2e4a7a : 0x9c2a2a, 0.65 + 0.45 * (i / 16)));
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.quadraticCurveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2 + 6, p0.x, p0.y);
    ctx.fill();
  }
  // Door flap tied back on the sunlit side.
  const da = Math.PI * 0.68;
  const dx = cx + Math.cos(da) * rx;
  const dy = cy + Math.sin(da) * ry;
  ctx.fillStyle = css(0x1c120a);
  ctx.beginPath();
  ctx.moveTo(dx - 7, dy);
  ctx.lineTo(dx + 1, dy - 34);
  ctx.lineTo(dx + 8, dy + 1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(mix(canvas, 0x8a7a5a, 0.4));
  ctx.beginPath();
  ctx.moveTo(dx + 8, dy + 1);
  ctx.lineTo(dx + 1, dy - 34);
  ctx.lineTo(dx + 13, dy - 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,28,14,0.7)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(cx - rx - 2, cy - wallH);
  ctx.lineTo(cx, apexY);
  ctx.lineTo(cx + rx + 2, cy - wallH);
  ctx.moveTo(cx - rx, cy - wallH);
  ctx.lineTo(cx - rx, cy);
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0, true);
  ctx.lineTo(cx + rx, cy - wallH);
  ctx.stroke();
  // Guy ropes and pegs.
  ctx.strokeStyle = 'rgba(200,184,140,0.85)';
  ctx.lineWidth = 0.6;
  for (const a of [0.05, 0.35, 0.92]) {
    const from = { x: cx + Math.cos(Math.PI * a) * rx * 0.75, y: cy - wallH - 12 + Math.sin(Math.PI * a) * ry * 0.75 };
    const to = { x: cx + Math.cos(Math.PI * a) * (rx + 12), y: cy + 4 + Math.sin(Math.PI * a) * (ry + 6) };
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.fillStyle = css(0x4a3220);
    ctx.fillRect(to.x - 1, to.y - 3, 2, 3);
  }
  // Pole cap and pennant.
  ctx.strokeStyle = css(0x4a3220);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, apexY + 2);
  ctx.lineTo(cx, apexY - 12);
  ctx.stroke();
  ctx.fillStyle = css(0x9c2a2a);
  ctx.beginPath();
  ctx.moveTo(cx + 1, apexY - 12);
  ctx.quadraticCurveTo(cx + 8, apexY - 12, cx + 13, apexY - 8);
  ctx.lineTo(cx + 1, apexY - 6);
  ctx.closePath();
  ctx.fill();
}

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
