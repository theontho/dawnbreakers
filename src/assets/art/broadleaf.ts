import type Phaser from 'phaser';
import { css, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { contactShadow, crown, moss } from './woodland';

/**
 * The broadleaf tree painter, shared by the Hyrcanian forest of Mázindarán
 * and the village trees about its houses (species and ages in
 * `treeSpecies.ts`). One painter serves a sapling and a 25 m oak alike:
 * the style sets the height, the crown's spread and where it begins, the
 * bole, and the bark. Each is a one-cell prop whose trunk stands on the
 * cell centre (16 px above the texture's foot); the crowns spread far past
 * the cell, as real ones do.
 */

const FOOT = 16;

export interface BroadleafStyle {
  /** Total height in px (23 px to the metre). */
  height: number;
  /** Half the crown's width. */
  spread: number;
  /** Where the crown begins, in px above the ground. */
  crownBase: number;
  /** Width of the bole at the root flare. */
  bole: number;
  bark: number;
  leaves: readonly number[];
  seed: number;
  /** Several stems from one root, as the ironwood grows. */
  stems?: number;
  /** Pale lenticels and lichen on a smooth bark. */
  pale?: boolean;
  /** Fruit hanging in the crown (orchard trees). */
  fruit?: number;
}

export function paintBroadleaf(scene: Phaser.Scene, key: string, s: BroadleafStyle): void {
  const w = Math.ceil(s.spread * 2 + 28);
  const h = s.height + FOOT + 6;
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const ground = h - FOOT;
    const rand = rng(s.seed);
    contactShadow(ctx, cx + s.spread * 0.18, ground + 2, s.spread * 0.62, s.spread * 0.22, 0.24);
    const crownTop = ground - s.height;
    const crownBottom = ground - s.crownBase;
    const cy = (crownTop + crownBottom) / 2 + (crownBottom - crownTop) * 0.06;
    const ry = (crownBottom - crownTop) / 2;
    if (s.stems) {
      for (let i = 0; i < s.stems; i++) {
        const t = s.stems === 1 ? 0 : i / (s.stems - 1) - 0.5;
        stem(ctx, cx + t * s.bole * 0.9, ground, cx + t * s.spread * 0.7, cy + ry * 0.2, s.bole, s.bole * 0.4, s.bark, s.seed + i);
      }
    } else {
      rootFlare(ctx, cx, ground, s.bole, s.bark);
      stem(ctx, cx, ground, cx + (rand() - 0.5) * 6, cy, s.bole, s.bole * 0.45, s.bark, s.seed);
      // Great limbs climbing into the crown; a sapling has only a few slight ones.
      const limbs = s.bole < 12 ? [-0.5, 0.45] : [-0.6, -0.2, 0.25, 0.65];
      for (const t of limbs) {
        const from = crownBottom + Math.min(10 + rand() * 20, s.crownBase * 0.4);
        stem(ctx, cx + t * 4, from, cx + t * s.spread * 0.75, cy - ry * (0.1 + rand() * 0.3), s.bole * 0.38, s.bole * 0.14, s.bark, s.seed + Math.round(t * 10));
      }
    }
    if (s.pale) lenticels(ctx, cx, ground, crownBottom, s.bole, s.seed);
    else moss(ctx, cx - s.bole * 0.2, ground - Math.min(18, s.bole), s.bole * 0.3, Math.min(14, s.bole * 0.6), s.seed, 0x4a6d32);
    canopy(ctx, cx, cy, s.spread, ry, s);
    if (s.fruit !== undefined) fruit(ctx, cx, cy, s.spread, ry, s.fruit, s.seed);
  });
}

/** Fruit at the crown's edge, catching the light. */
function fruit(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: number, seed: number): void {
  const rand = rng(seed + 31);
  const r = Math.max(1.4, Math.min(2.2, rx * 0.045));
  for (let i = 0; i < Math.round(rx * 0.45); i++) {
    const a = rand() * Math.PI * 2;
    const d = 0.25 + rand() * 0.45;
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    ctx.fillStyle = css(shade(color, 0.65));
    ctx.beginPath();
    ctx.arc(x + 0.6, y + 0.6, r + 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(color);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,200,0.75)';
    ctx.fillRect(x - r * 0.5, y - r * 0.5, 0.9, 0.9);
  }
}

/** A crown built from many small crowns, so leaf texture stays fine on a tree 20 m high. */
function canopy(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, s: BroadleafStyle): void {
  const rand = rng(s.seed + 5);
  const unit = Math.min(22, rx * 0.34);
  const count = Math.round((rx * ry) / (unit * unit) * 1.6);
  const clumps = Array.from({ length: count }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.pow(rand(), 0.6) * 0.86;
    // The crown is fuller above and ragged below.
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d * (Math.sin(a) > 0 ? 0.92 : 1);
    return { x, y, r: unit * (0.75 + rand() * 0.5) };
  }).sort((a, b) => a.y - b.y);
  // The crown's shaded depths first, so gaps between clumps read as depth, not holes.
  ctx.fillStyle = css(shade(s.leaves[0]!, 0.38));
  for (const k of clumps) {
    ctx.beginPath();
    ctx.arc(k.x + 3, k.y + 5, k.r * 1.05, 0, Math.PI * 2);
    ctx.fill();
  }
  clumps.forEach((k, i) => {
    // Clumps on the lower right sit in the crown's own shade.
    const lit = 1.05 - Math.max(0, (k.x - cx) / rx * 0.6 + (k.y - cy) / ry * 0.8) * 0.32;
    crown(ctx, k.x, k.y, k.r, k.r * 0.82, {
      leaves: s.leaves.map(c => shade(c, lit)),
      seed: s.seed + i * 13,
      masses: 6,
    });
  });
}

function rootFlare(ctx: Ctx, x: number, ground: number, w: number, bark: number): void {
  const rise = Math.min(18, w * 0.9);
  ctx.fillStyle = css(shade(bark, 0.75));
  ctx.beginPath();
  ctx.moveTo(x - w * 1.1, ground + 2);
  ctx.quadraticCurveTo(x - w * 0.5, ground - 4, x - w * 0.45, ground - rise);
  ctx.lineTo(x + w * 0.45, ground - rise);
  ctx.quadraticCurveTo(x + w * 0.5, ground - 4, x + w * 1.15, ground + 2);
  ctx.closePath();
  ctx.fill();
}

/** A tapering bole or limb from (x0, y0) to (x1, y1), lit on its left. */
function stem(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bark: number, seed: number): void {
  const rand = rng(seed);
  const bend = (rand() - 0.5) * 10;
  const mx = (x0 + x1) / 2 + bend;
  const my = (y0 + y1) / 2;
  const len = Math.hypot(x1 - x0, y1 - y0);
  const nx = (y1 - y0) / len;
  const ny = -(x1 - x0) / len;
  ctx.beginPath();
  ctx.moveTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  ctx.quadraticCurveTo(mx - nx * (w0 + w1) / 4, my - ny * (w0 + w1) / 4, x1 - nx * w1 / 2, y1 - ny * w1 / 2);
  ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  ctx.quadraticCurveTo(mx + nx * (w0 + w1) / 4, my + ny * (w0 + w1) / 4, x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(Math.min(x0, x1) - w0 / 2, 0, Math.max(x0, x1) + w0 / 2, 0);
  g.addColorStop(0, css(shade(bark, 1.3)));
  g.addColorStop(0.45, css(bark));
  g.addColorStop(1, css(shade(bark, 0.5)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,12,6,0.5)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Furrows in the bark.
  ctx.strokeStyle = css(shade(bark, 0.55), 0.5);
  ctx.lineWidth = 0.7;
  for (let i = 0; i < len / 9; i++) {
    const t = rand();
    const px = x0 + (x1 - x0) * t + bend * Math.sin(Math.PI * t);
    const py = y0 + (y1 - y0) * t;
    const half = (w0 + (w1 - w0) * t) / 2;
    const off = (rand() - 0.5) * half * 1.4;
    ctx.beginPath();
    ctx.moveTo(px + off, py);
    ctx.lineTo(px + off + (rand() - 0.5) * 2, py - 4 - rand() * 6);
    ctx.stroke();
  }
}

/** Pale bark: dark lenticel dashes and grey-green lichen. */
function lenticels(ctx: Ctx, x: number, ground: number, top: number, w: number, seed: number): void {
  const rand = rng(seed + 9);
  for (let y = ground - 20; y > top; y -= 7 + rand() * 6) {
    ctx.fillStyle = 'rgba(40,36,30,0.55)';
    ctx.fillRect(x - w * 0.3 + rand() * w * 0.5, y, 3 + rand() * 3, 1);
    if (rand() < 0.3) {
      ctx.fillStyle = 'rgba(150,170,130,0.5)';
      ctx.fillRect(x - w * 0.35 + rand() * w * 0.3, y + 2, 3, 3);
    }
  }
}
