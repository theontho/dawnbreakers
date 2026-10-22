import type Phaser from 'phaser';
import { baseCorners, css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, polygon, roofPoint, rng, shade, type IsoBox } from './canvasKit';
import { litGradient } from './fieldKit';
import { planks } from './materials';
import { flatTop, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * A bazaar stall: a waist-high plank counter of goods under a striped
 * awning raised on poles high enough for the seller to stand beneath.
 */

const POST_H = 50;

export function paintStall(scene: Phaser.Scene, key: string, cloth: number, stripe: number, goods: readonly number[], seed: number): void {
  const { box, texW, texH } = footprintBox(1, 1, POST_H, 18);
  paintTexture(scene, key, texW, texH, ctx => {
    const rand = rng(seed);
    groundShadow(ctx, box, 4, 0.2);
    // Counter: a plank box set in from the front edges, about hip height.
    const counter = subBox(box, 0, box.w - 5, 5, box.d, 17);
    walls(ctx, counter, (c, w, h, light) => planks(c, w, h, { base: 0x7a5232, light, seed }, false, 4));
    flatTop(ctx, counter, 0x8a6240);
    outlineBox(ctx, counter);
    // Goods: heaped spice and grain in round trays, and a few pots.
    for (let i = 0; i < 5; i++) {
      const pt = roofPoint(counter, 5 + rand() * (counter.w - 10), 5 + rand() * (counter.d - 10));
      const color = goods[i % goods.length]!;
      ctx.fillStyle = css(shade(color, 0.6));
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, 4.2, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = litGradient(ctx, pt.x, pt.y - 2, 4, color, 0.8);
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y - 0.5, 3.6, 2, 0, Math.PI, 0);
      ctx.quadraticCurveTo(pt.x, pt.y - 6, pt.x - 3.6, pt.y - 0.5);
      ctx.fill();
    }
    // A sack slumped against the counter.
    const sack = groundPoint(box, box.w - 2, 18);
    ctx.fillStyle = litGradient(ctx, sack.x, sack.y - 5, 5, 0xc8b088, 0.7);
    ctx.beginPath();
    ctx.moveTo(sack.x - 4, sack.y);
    ctx.quadraticCurveTo(sack.x - 5, sack.y - 9, sack.x - 1, sack.y - 10);
    ctx.quadraticCurveTo(sack.x + 4, sack.y - 9, sack.x + 4, sack.y);
    ctx.closePath();
    ctx.fill();
    // Poles at the three visible corners.
    const [front, right, , left] = baseCorners(box);
    for (const c of [left!, right!, front!]) {
      ctx.fillStyle = css(0x4a2e18);
      ctx.fillRect(c.x - 1, c.y - POST_H, 2, POST_H);
      ctx.fillStyle = css(0x7a5232);
      ctx.fillRect(c.x - 1, c.y - POST_H, 0.8, POST_H);
    }
    awning(ctx, { x: box.x, y: box.y - POST_H, w: box.w + 4, d: box.d + 4, h: 0 }, cloth, stripe);
  });
}

/** Sloping cloth awning, higher at the back, striped front to back with a scalloped valance. */
function awning(ctx: CanvasRenderingContext2D, a: IsoBox, cloth: number, stripe: number): void {
  const lift = 9;
  const stripeW = a.w / 6;
  for (let i = 0; i < 6; i++) {
    const p = roofPoint(a, i * stripeW, 0);
    const q = roofPoint(a, (i + 1) * stripeW, 0);
    const r = roofPoint(a, (i + 1) * stripeW, a.d);
    const s = roofPoint(a, i * stripeW, a.d);
    const color = i % 2 ? stripe : cloth;
    polygon(ctx, [p, q, { x: r.x, y: r.y - lift }, { x: s.x, y: s.y - lift }]);
    ctx.fillStyle = css(shade(color, 1.05));
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(q.x, q.y);
    ctx.quadraticCurveTo((p.x + q.x) / 2, (p.y + q.y) / 2 + 6, p.x, p.y);
    ctx.fillStyle = css(shade(color, 0.8));
    ctx.fill();
  }
  const f0 = roofPoint(a, 0, 0);
  const f1 = roofPoint(a, a.w, 0);
  const b1 = roofPoint(a, a.w, a.d);
  const b0 = roofPoint(a, 0, a.d);
  ctx.strokeStyle = 'rgba(30,15,5,0.6)';
  ctx.lineWidth = 0.8;
  polygon(ctx, [f0, f1, { x: b1.x, y: b1.y - lift }, { x: b0.x, y: b0.y - lift }]);
  ctx.stroke();
}
