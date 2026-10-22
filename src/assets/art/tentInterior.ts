import type Phaser from 'phaser';
import { css, groundPoint, paintTexture, polygon, shade, type Ctx } from './canvasKit';
import { cellCentredBox, ellipseShadow } from './fieldKit';
import { archPath } from './ornaments';
import { glow, post } from './structureParts';

/**
 * Inside a pavilion tent at Badasht, summer 1848, at true scale: walls
 * 2.4 m high lined with block-printed cotton (qalamkār) in arched panels,
 * lamplight coming through the cloth, mattresses and bolsters along the
 * walls, and the tent pole, 4.3 m to the ridge, with its lantern.
 */

const LINING = 0xeedcae;
const MADDER = 0x9a3a2a;
const INDIGO = 0x2f3f6a;
export const TENT_CLOTH = 0x48613e;
/** The lining's height inside: the eave of the pavilion seen from without (see pavilion.ts). */
export const TENT_WALL_H = 56;

/** The inner face of the tent wall: arched printed panels under a scalloped valance. */
export function tentLiningFace(ctx: Ctx, w: number, h: number, l: number): void {
  const lit = (c: number) => css(shade(c, l));
  // Lamplight soaks through the cotton, warmer toward the middle.
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, lit(shade(LINING, 0.82)));
  g.addColorStop(0.5, lit(LINING));
  g.addColorStop(1, lit(shade(LINING, 0.78)));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const top = 9;
  const hem = h - 6;
  for (let u = 0; u < w; u += 16) {
    // Seams between panels, and a printed arch in each.
    ctx.fillStyle = lit(shade(LINING, 0.72));
    ctx.fillRect(u, top, 0.8, hem - top);
    archPath(ctx, u + 3, hem - 2, 10, hem - top - 6);
    ctx.fillStyle = lit(MADDER);
    ctx.fill();
    archPath(ctx, u + 4.5, hem - 3, 7, hem - top - 9);
    ctx.fillStyle = lit(shade(LINING, 0.95));
    ctx.fill();
    // A cypress-and-flower sprig printed in indigo inside the arch.
    const cx = u + 8;
    ctx.fillStyle = lit(INDIGO);
    ctx.beginPath();
    ctx.moveTo(cx, hem - 22);
    ctx.quadraticCurveTo(cx + 2.4, hem - 12, cx, hem - 5);
    ctx.quadraticCurveTo(cx - 2.4, hem - 12, cx, hem - 22);
    ctx.fill();
    ctx.fillStyle = lit(MADDER);
    for (const dy of [hem - 16, hem - 10]) {
      ctx.fillRect(cx - 2.6, dy, 1.2, 1.2);
      ctx.fillRect(cx + 1.4, dy - 1, 1.2, 1.2);
    }
  }
  // The valance: outer cloth showing at the eave, scalloped, with a gold cord.
  ctx.fillStyle = lit(shade(TENT_CLOTH, 0.9));
  ctx.fillRect(0, 0, w, top - 2);
  for (let u = 0; u < w; u += 8) {
    ctx.beginPath();
    ctx.arc(u + 4, top - 2, 4, 0, Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = lit(0xc9a55c);
  ctx.fillRect(0, 2, w, 1);
  for (let u = 4; u < w; u += 8) ctx.fillRect(u - 0.6, top + 1.4, 1.2, 1.6);
  // The hem: a madder band with a row of white dots, pegged to the ground.
  ctx.fillStyle = lit(MADDER);
  ctx.fillRect(0, hem, w, h - hem);
  ctx.fillStyle = lit(LINING);
  for (let u = 2; u < w; u += 4) ctx.fillRect(u, hem + 2.5, 1, 1);
}

/** The tent's main pole, a brass finial lost in the shadow above, a lantern hung from its hook. */
export function paintTentPole(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 32, 112, ctx => {
    const cx = 16;
    const foot = 106;
    ellipseShadow(ctx, cx + 1, foot, 5, 2, 0.35);
    post(ctx, cx, foot, 100, 3.6, 0x6a4428);
    // Its foot wrapped in felt against the carpets.
    ctx.fillStyle = css(0x8a3a2a);
    ctx.fillRect(cx - 2.6, foot - 6, 5.2, 6);
    // The hook and the lantern: a pierced brass cage with a candle.
    const hookY = foot - 56;
    ctx.strokeStyle = css(0x3a2a1a);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 1.8, hookY);
    ctx.lineTo(cx + 7, hookY - 1);
    ctx.lineTo(cx + 7, hookY + 4);
    ctx.stroke();
    glow(ctx, cx + 7, hookY + 11, 18, 0xffc070, 0.55);
    const lx = cx + 7;
    const ly = hookY + 4;
    ctx.fillStyle = css(0xb8893a);
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(lx + 3.5, ly + 4);
    ctx.lineTo(lx - 3.5, ly + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(0xffe08a);
    ctx.fillRect(lx - 3.2, ly + 4, 6.4, 8);
    ctx.fillStyle = css(0x7a5a24);
    for (let x = lx - 3.2; x <= lx + 3.2; x += 2.1) ctx.fillRect(x, ly + 4, 0.7, 8);
    ctx.fillRect(lx - 3.8, ly + 12, 7.6, 1.6);
  });
}

/** Which wall a mattress and bolster lie against: the back-right wall (north) or the back-left (west). */
export type BolsterSide = 'north' | 'west';

/** A floor mattress (dushak) along the wall with a long bolster (pushtī) to lean on. */
export function paintBolster(scene: Phaser.Scene, key: string, side: BolsterSide, cover = 0x8a2f2a): void {
  paintTexture(scene, key, 64, 44, ctx => {
    const box = cellCentredBox(44, 32, 0, 32);
    const g = (p: number, q: number, z = 0) => {
      const pt = groundPoint(box, p, q);
      return { x: pt.x, y: pt.y - z };
    };
    // q runs from the front-left edge to the back (north) edge; p from the west edge forward.
    const n = side === 'north';
    const [p0, p1, q0, q1] = n ? [1, 31, 15, 31] : [1, 17, 1, 31];
    const slab = (z: number) => [g(p0, q0, z), g(p1, q0, z), g(p1, q1, z), g(p0, q1, z)];
    polygon(ctx, [g(p0, q0), g(p1, q0), g(p1, q0, 3), g(p0, q0, 3)]);
    ctx.fillStyle = css(shade(cover, 0.7));
    ctx.fill();
    polygon(ctx, [g(p1, q0), g(p1, q1), g(p1, q1, 3), g(p1, q0, 3)]);
    ctx.fillStyle = css(shade(cover, 0.55));
    ctx.fill();
    polygon(ctx, slab(3));
    ctx.fillStyle = css(cover);
    ctx.fill();
    ctx.strokeStyle = css(0xd8b870, 0.7);
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // The bolster along the back edge: a fat roll of striped cloth with embroidered ends.
    const a = n ? g(p0 + 3, q1 - 4, 7) : g(p0 + 4, q1 - 3, 7);
    const b = n ? g(p1 - 3, q1 - 4, 7) : g(p0 + 4, q0 + 3, 7);
    ctx.lineCap = 'round';
    ctx.strokeStyle = css(shade(INDIGO, 0.8));
    ctx.lineWidth = 9;
    line(ctx, a, b);
    ctx.strokeStyle = css(shade(INDIGO, 1.25));
    ctx.lineWidth = 4;
    line(ctx, { x: a.x, y: a.y - 1.8 }, { x: b.x, y: b.y - 1.8 });
    ctx.strokeStyle = css(0xd8b870, 0.75);
    ctx.lineWidth = 0.8;
    line(ctx, { x: a.x, y: a.y - 3.6 }, { x: b.x, y: b.y - 3.6 });
    for (const end of [a, b]) {
      ctx.fillStyle = css(MADDER);
      ctx.beginPath();
      ctx.ellipse(end.x, end.y, 2.6, 4.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0xd8b870);
      ctx.fillRect(end.x - 0.7, end.y - 0.7, 1.4, 1.4);
    }
  });
}

function line(ctx: Ctx, a: { x: number; y: number }, b: { x: number; y: number }): void {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}
