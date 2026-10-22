import type Phaser from 'phaser';
import { css, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { contactShadow, crown, moss } from './woodland';

/**
 * The Hyrcanian forest of Mázindarán at its real height (chapter 8). The
 * chestnut-leaved oaks stand 20 m and more on tall clean boles, so under
 * them the forest is open and dim; the Persian ironwood spreads lower on
 * several grey stems and burns red and gold in autumn; the alders by the
 * water are pale and narrow. Each is a one-cell prop whose trunk stands on
 * the cell centre (16 px above the texture's foot); the crowns spread far
 * past the cell, as real ones do.
 */

const FOOT = 16;

export interface ForestTreeStyle {
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
}

const OAK_LEAVES = [0x2f5a2a, 0x3b6331, 0x274322, 0x4a6a2c, 0x5f7a32, 0x8a7a34];
const BEECH_LEAVES = [0x8a6a24, 0xb08a34, 0x6a7a2c, 0xc49a3a, 0x4a6a2c];
const IRONWOOD_LEAVES = [0x9a3a1c, 0xb35a26, 0xc4762e, 0xd9a441, 0x7f3a1c, 0x6a5a2a];
const ALDER_LEAVES = [0x3f5e2a, 0x4c6a2e, 0x5c7c36, 0x6f8a3c, 0x87a04a];

/** Chestnut-leaved oaks of 21 to 24 m, one of them turning; a beech gone copper among them. */
export const OAK_VARIANTS: readonly ForestTreeStyle[] = [
  { height: 520, spread: 128, crownBase: 210, bole: 26, bark: 0x4a3a2a, leaves: OAK_LEAVES, seed: 811 },
  { height: 480, spread: 118, crownBase: 190, bole: 24, bark: 0x51402c, leaves: OAK_LEAVES, seed: 823 },
  { height: 550, spread: 136, crownBase: 230, bole: 28, bark: 0x6a665c, leaves: BEECH_LEAVES, seed: 829, pale: true },
];

/** Persian ironwood of 16 to 18 m: low, wide, on several stems. */
export const IRONWOOD_VARIANTS: readonly ForestTreeStyle[] = [
  { height: 400, spread: 120, crownBase: 120, bole: 12, bark: 0x7a6e60, leaves: IRONWOOD_LEAVES, seed: 841, stems: 3 },
  { height: 370, spread: 108, crownBase: 104, bole: 11, bark: 0x857868, leaves: IRONWOOD_LEAVES, seed: 853, stems: 4 },
];

/** Caucasian alders of 15 to 17 m along the streams: a tall narrow crown on a pale bole. */
export const ALDER_VARIANTS: readonly ForestTreeStyle[] = [
  { height: 390, spread: 62, crownBase: 150, bole: 14, bark: 0x9a958a, leaves: ALDER_LEAVES, seed: 861, pale: true },
  { height: 350, spread: 56, crownBase: 130, bole: 13, bark: 0x928d82, leaves: ALDER_LEAVES, seed: 877, pale: true },
];

export function paintForestTree(scene: Phaser.Scene, key: string, s: ForestTreeStyle): void {
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
      // Great limbs climbing into the crown.
      for (const t of [-0.6, -0.2, 0.25, 0.65]) {
        const from = crownBottom + 10 + rand() * 20;
        stem(ctx, cx + t * 4, from, cx + t * s.spread * 0.75, cy - ry * (0.1 + rand() * 0.3), s.bole * 0.38, s.bole * 0.14, s.bark, s.seed + Math.round(t * 10));
      }
    }
    if (s.pale) lenticels(ctx, cx, ground, crownBottom, s.bole, s.seed);
    else moss(ctx, cx - s.bole * 0.2, ground - 18, s.bole * 0.3, 14, s.seed, 0x4a6d32);
    canopy(ctx, cx, cy, s.spread, ry, s);
  });
}

/** A crown built from many small crowns, so leaf texture stays fine on a tree 20 m high. */
function canopy(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, s: ForestTreeStyle): void {
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
  ctx.fillStyle = css(shade(bark, 0.75));
  ctx.beginPath();
  ctx.moveTo(x - w * 1.1, ground + 2);
  ctx.quadraticCurveTo(x - w * 0.5, ground - 4, x - w * 0.45, ground - 18);
  ctx.lineTo(x + w * 0.45, ground - 18);
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
