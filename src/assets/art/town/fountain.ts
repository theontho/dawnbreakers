import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, onRoof, outlineBox, paintTexture, rng, roofPoint, shade, type Ctx, type IsoBox } from '../canvasKit';
import { stone } from '../materials';
import { cylinder, walls } from '../ornaments';
import { subBox } from '../structureParts';

/**
 * The hawz: a stone pool with a low moulded rim, its water holding the
 * evening sky. The great one stands in a square; a smaller one sits in the
 * middle of every courtyard.
 */

const RIM = 0xb8ab90;

/** Still water in roof space: sky colour, deeper toward the near rim, with ripples and glints. */
function water(ctx: Ctx, w: number, d: number, seed: number): void {
  const rand = rng(seed);
  const g = ctx.createLinearGradient(0, d, w, 0);
  g.addColorStop(0, '#a8c8d8');
  g.addColorStop(0.45, '#5a8cab');
  g.addColorStop(1, '#2a5470');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, d);
  // The warm dusk caught near the far rim.
  const warm = ctx.createLinearGradient(0, d, 0, d * 0.6);
  warm.addColorStop(0, 'rgba(255,200,140,0.35)');
  warm.addColorStop(1, 'rgba(255,200,140,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(0, 0, w, d);
  ctx.strokeStyle = 'rgba(235,245,250,0.45)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < (w * d) / 160; i++) {
    const x = rand() * w;
    const y = rand() * d;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3 + rand() * 6, y);
    ctx.stroke();
  }
}

/**
 * A pool between p0..p1, q0..q1 of `parent`: a rim `rimT` thick and `rimH`
 * high, the water `drop` px below its top. Returns the water's box.
 */
export function hawz(ctx: Ctx, parent: IsoBox, p0: number, p1: number, q0: number, q1: number, rimH: number, rimT: number, seed: number, drop = 4): IsoBox {
  const outer = subBox(parent, p0, p1, q0, q1, rimH);
  groundShadow(ctx, outer, 6, 0.22);
  walls(ctx, outer, (c, w, h, light) => stone(c, w, h, { base: RIM, light, seed }, Math.max(4, h / 2)), {
    left: (c, w, _h, l) => moulding(c, w, l),
    right: (c, w, _h, l) => moulding(c, w, l),
  });
  onRoof(ctx, outer, (w, d) => {
    ctx.fillStyle = css(shade(RIM, 1.14));
    ctx.fillRect(0, 0, w, d);
    ctx.beginPath();
    ctx.rect(rimT, rimT, w - rimT * 2, d - rimT * 2);
    ctx.save();
    ctx.clip();
    // The inner faces of the far rims, then the water dropped below the rim.
    ctx.fillStyle = css(shade(RIM, 0.62));
    ctx.fillRect(0, 0, w, d);
    ctx.translate(drop, -drop);
    ctx.beginPath();
    ctx.rect(rimT, rimT, w - rimT * 2, d - rimT * 2);
    ctx.clip();
    water(ctx, w, d, seed);
    ctx.restore();
    ctx.strokeStyle = css(shade(RIM, 1.35), 0.6);
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, d - 1);
    ctx.strokeRect(rimT - 0.5, rimT - 0.5, w - rimT * 2 + 1, d - rimT * 2 + 1);
  });
  outlineBox(ctx, outer);
  return subBox(parent, p0 + rimT, p1 - rimT, q0 + rimT, q1 - rimT, 0, rimH - drop);
}

function moulding(c: Ctx, w: number, l: number): void {
  c.fillStyle = css(shade(RIM, l * 1.2));
  c.fillRect(0, 0, w, 2);
  c.fillStyle = 'rgba(20,12,6,0.3)';
  c.fillRect(0, 2, w, 1);
}

/** A jet rising from a small stone basin at the pool's centre, falling back in arcs. */
function jet(ctx: Ctx, pool: IsoBox): void {
  const at = roofPoint(pool, pool.w / 2, pool.d / 2);
  cylinder(ctx, at.x, at.y + 2, 6, 10, RIM, true);
  ctx.fillStyle = css(0x5a8cab);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y - 8, 4.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  const top = at.y - 34;
  ctx.strokeStyle = 'rgba(230,242,250,0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(at.x, at.y - 9);
  ctx.lineTo(at.x, top);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(230,242,250,0.6)';
  for (const dx of [-12, -7, 7, 12]) {
    ctx.beginPath();
    ctx.moveTo(at.x, top + 1);
    ctx.quadraticCurveTo(at.x + dx * 0.7, top - 4, at.x + dx, at.y - 4 + Math.abs(dx) * 0.2);
    ctx.stroke();
  }
  // Rings where the drops fall.
  ctx.strokeStyle = 'rgba(235,245,250,0.5)';
  for (const r of [10, 15]) {
    ctx.beginPath();
    ctx.ellipse(at.x, at.y - 1, r, r * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

/** The square's pool: 3 x 3 cells, a broad rim to sit on, a jet at its heart. */
export function paintFountainPool(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 14, 30);
  paintTexture(scene, key, texW, texH, ctx => {
    const pool = hawz(ctx, box, 4, box.w - 4, 4, box.d - 4, 13, 10, 611);
    jet(ctx, pool);
  });
}
