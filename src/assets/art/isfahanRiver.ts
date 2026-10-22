import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, mix, outlineBox, paintTexture, polygon, rng, roofPoint, shade, type Ctx } from './canvasKit';
import { planks } from './materials';
import { flatTop, LIGHT, walls } from './ornaments';
import { post, subBox } from './structureParts';

/**
 * The Zāyandih-Rūd at Iṣfahán, at true scale (a person is 40 px, 1.75 m):
 * reeds at the water's edge standing as high as a man and more, and a
 * cloth-printer's booth in the bazaar. The bridge is in `isfahanBridge.ts`.
 */

const RIVER = 0x2c4a6b;

/** Reeds and bulrushes, 1.5 to 2.5 m tall, standing in a shallow pool at the river's edge. */
export function paintRiverReeds(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 72, 80, ctx => {
    const rand = rng(77);
    const cx = 36;
    const base = 70;
    const pool = ctx.createRadialGradient(cx - 5, base - 2, 2, cx, base, 30);
    pool.addColorStop(0, css(shade(RIVER, 1.35), 0.9));
    pool.addColorStop(1, css(RIVER, 0));
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.ellipse(cx, base, 30, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,225,240,0.4)';
    ctx.lineWidth = 0.7;
    for (const r of [11, 19, 26]) {
      ctx.beginPath();
      ctx.ellipse(cx + 2, base + 1, r, r * 0.28, 0, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
    // Back stalks are darker; front stalks catch the light on the left.
    const stalks = Array.from({ length: 34 }, () => ({
      x: cx - 19 + rand() * 38,
      h: 34 + rand() * 24,
      bend: (rand() - 0.4) * 12,
      depth: rand(),
    })).sort((a, b) => a.depth - b.depth);
    for (const s of stalks) {
      const y = base - 2 + s.depth * 5;
      const lit = s.x < cx;
      ctx.strokeStyle = css(shade(mix(0x516b38, 0x7a8a3a, rand()), (lit ? 1.15 : 0.8) * (0.7 + s.depth * 0.4)));
      ctx.lineWidth = 1.2 + rand() * 0.7;
      ctx.beginPath();
      ctx.moveTo(s.x, y);
      ctx.quadraticCurveTo(s.x + s.bend * 0.2, y - s.h * 0.6, s.x + s.bend, y - s.h);
      ctx.stroke();
      if (rand() < 0.3) {
        // Bulrush head.
        const hx = s.x + s.bend * 0.75;
        const hy = y - s.h * 0.78;
        ctx.fillStyle = css(shade(0x7a5228, lit ? 1.1 : 0.8));
        ctx.beginPath();
        ctx.ellipse(hx, hy, 1.8, 5, s.bend * 0.02, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,220,170,0.35)';
        ctx.fillRect(hx - 1, hy - 4, 0.8, 5);
      }
    }
    // A few long blades arching over.
    ctx.strokeStyle = css(0x6f8a44, 0.9);
    ctx.lineWidth = 1;
    for (const [x, dir] of [[26, -1], [44, 1], [36, 1], [30, -1]] as const) {
      ctx.beginPath();
      ctx.moveTo(x, base);
      ctx.quadraticCurveTo(x + dir * 6, base - 36, x + dir * 18, base - 26);
      ctx.stroke();
    }
  });
}

/**
 * A cloth-printer's booth: a peaked canvas roof on four posts, its eave a
 * little above a man's head (2.3 m), over a hip-high counter stacked with
 * bolts of block-printed cotton (qalamkār).
 */
export function paintMarketAwning(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const eave = 54;
  const rise = 30;
  const { box, texW, texH } = footprintBox(cellsW, cellsD, eave, rise + 8);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 6, 0.22);
    const cloth = 0x315f68;
    const wood = 0x5b3f24;
    const corner = (p: number, q: number) => roofPoint(box, p, q);
    // The back post stands behind everything else.
    const backPost = corner(4, box.d - 4);
    post(ctx, backPost.x, backPost.y + box.h, box.h, 3.5, wood);
    // The counter across the front, 0.9 m high, with a length of print hung over it.
    const counter = subBox(box, 8, box.w - 8, 10, box.d * 0.5, 20);
    walls(ctx, counter, (c, w, h, light) => planks(c, w, h, { base: 0x7a5232, light, seed: 61 }, false, 4), {
      left: (c, w, h, l) => drapedPrint(c, w, h, l),
    });
    flatTop(ctx, counter, 0x8a6240);
    outlineBox(ctx, counter);
    const bolts = [0x9a2e22, 0x24406e, 0xd8c7a0, 0x8e5a2a, 0x3a6a4a, 0x9a2e22];
    bolts.forEach((color, i) => {
      const at = roofPoint(counter, 6 + i * ((counter.w - 12) / bolts.length), 6 + (i % 2) * 10);
      ctx.fillStyle = css(color);
      ctx.fillRect(at.x - 6, at.y - 7, 12, 5);
      ctx.fillStyle = css(shade(color, 1.3));
      ctx.fillRect(at.x - 6, at.y - 7, 12, 1);
      ctx.fillStyle = css(shade(color, 0.6));
      ctx.beginPath();
      ctx.ellipse(at.x + 6, at.y - 4.5, 1.4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // The printer's wooden blocks and a dye tray at the counter's end.
    const tray = roofPoint(counter, counter.w - 8, counter.d - 8);
    ctx.fillStyle = css(0x24406e);
    ctx.fillRect(tray.x - 5, tray.y - 3, 10, 3);
    ctx.fillStyle = css(0x6a4a2c);
    ctx.fillRect(tray.x - 9, tray.y - 6, 4, 3);
    for (const [p, q] of [[4, 4], [box.w - 4, 4], [box.w - 4, box.d - 4]] as const) {
      const top = corner(p, q);
      post(ctx, top.x, top.y + box.h, box.h, 3.5, wood);
    }
    // Pyramid roof: the two faces toward the viewer.
    const apex = roofPoint(box, box.w / 2, box.d / 2);
    apex.y -= rise;
    const left = corner(0, 0);
    const front = corner(box.w, 0);
    const right = corner(box.w, box.d);
    const face = (a: { x: number; y: number }, b: { x: number; y: number }, light: number, seed: number) => {
      polygon(ctx, [a, b, apex]);
      ctx.fillStyle = css(shade(cloth, light));
      ctx.fill();
      ctx.save();
      ctx.clip();
      const rand = rng(seed);
      ctx.strokeStyle = css(shade(0xe8dcc0, light), 0.75);
      ctx.lineWidth = 1.6;
      for (let t = 0.17; t < 1; t += 0.22) {
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        ctx.lineTo(apex.x, apex.y);
        ctx.stroke();
      }
      ctx.strokeStyle = css(0x000000, 0.12);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) {
        const t = rand();
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        ctx.lineTo(apex.x + (rand() - 0.5) * 4, apex.y + 4);
        ctx.stroke();
      }
      ctx.restore();
      // Scalloped valance hanging from the eave.
      const n = 7;
      for (let i = 0; i < n; i++) {
        const x0 = a.x + ((b.x - a.x) * i) / n;
        const y0 = a.y + ((b.y - a.y) * i) / n;
        const x1 = a.x + ((b.x - a.x) * (i + 1)) / n;
        const y1 = a.y + ((b.y - a.y) * (i + 1)) / n;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 8, x0, y0);
        ctx.fillStyle = css(shade(0x9a2e22, light));
        ctx.fill();
      }
    };
    face(left, front, LIGHT.left * 1.08, 62);
    face(front, right, LIGHT.right, 63);
    ctx.strokeStyle = 'rgba(30,15,5,0.7)';
    ctx.lineWidth = 0.9;
    polygon(ctx, [left, front, right, apex]);
    ctx.stroke();
    ctx.strokeStyle = css(0xc9a55c);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(apex.x, apex.y);
    ctx.stroke();
    ctx.fillStyle = css(0xe0c070);
    ctx.beginPath();
    ctx.arc(apex.x, apex.y - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** A length of block-printed cotton hung over the counter front. */
function drapedPrint(ctx: Ctx, w: number, h: number, light: number): void {
  const x = w * 0.2;
  const cw = w * 0.6;
  ctx.fillStyle = css(shade(0xe8d8b4, light));
  ctx.fillRect(x, 0, cw, h - 1);
  ctx.fillStyle = css(shade(0x9a2e22, light), 0.85);
  for (let v = 2; v < h - 2; v += 4) {
    for (let u = x + 2 + ((v / 4) % 2) * 2; u < x + cw - 1; u += 4) {
      ctx.beginPath();
      ctx.arc(u, v, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = css(shade(0x24406e, light));
  ctx.fillRect(x, h - 3, cw, 1.5);
}
