import type Phaser from 'phaser';
import { css, paintTexture, rng, shade, type Ctx } from '../canvasKit';
import { ellipseShadow, foliageClump } from '../fieldKit';
import { paintCypress, type CypressStyle } from '../nature';

/**
 * Trees at their real heights for the true-scale town: the great chenar
 * (oriental plane) that shades every Persian square, the tall garden
 * cypress, and the bitter orange of the courtyards. Each is a one-cell prop
 * whose trunk stands on the cell centre (16 px above the texture's foot);
 * the crowns spread well past the cell, as real ones do.
 */

const FOOT = 16;

export interface CrownStyle {
  leaf: number;
  seed: number;
  /** Blossom or fruit dots. */
  fruit?: number;
}

/**
 * A broad rounded crown built from many leaf clumps, darker underneath and
 * toward the shaded right, with small gaps where sky and limbs show.
 */
export function crown(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, style: CrownStyle): void {
  const rand = rng(style.seed);
  const n = Math.round(10 + (rx * ry) / 260);
  const clumps = Array.from({ length: n }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 0.78;
    // Clumps stop growing on a great crown, so its leaf stays as fine as a small one's.
    return { x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, r: Math.min(rx, ry, 85) * (0.26 + rand() * 0.16) };
  }).sort((a, b) => a.y - b.y);
  // A dark mass first, so the gaps between clumps read as depth, not holes.
  ctx.fillStyle = css(shade(style.leaf, 0.5));
  ctx.beginPath();
  ctx.ellipse(cx + rx * 0.05, cy + ry * 0.1, rx * 0.55, ry * 0.52, 0, 0, Math.PI * 2);
  ctx.fill();
  clumps.forEach((k, i) => {
    // Clumps on the lower right sit in the crown's own shade.
    const shadeK = 1 - Math.max(0, (k.x - cx) / rx + (k.y - cy) / ry) * 0.18;
    foliageClump(ctx, k.x, k.y, k.r, {
      leaf: shade(style.leaf, shadeK),
      seed: style.seed + i * 7,
      masses: 6,
      squash: 0.8,
      bloom: style.fruit !== undefined && rand() < 0.7 ? style.fruit : undefined,
    });
  });
}

/** A limb from (x0, y0) to (x1, y1) tapering from `w0` to `w1`, lit on its left. */
function limb(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, bark: number, bend = 0): void {
  const mx = (x0 + x1) / 2 + bend;
  const my = (y0 + y1) / 2;
  const nx = (y1 - y0) / Math.hypot(x1 - x0, y1 - y0);
  const ny = -(x1 - x0) / Math.hypot(x1 - x0, y1 - y0);
  ctx.beginPath();
  ctx.moveTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2);
  ctx.quadraticCurveTo(mx - nx * (w0 + w1) / 4, my - ny * (w0 + w1) / 4, x1 - nx * w1 / 2, y1 - ny * w1 / 2);
  ctx.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2);
  ctx.quadraticCurveTo(mx + nx * (w0 + w1) / 4, my + ny * (w0 + w1) / 4, x0 + nx * w0 / 2, y0 + ny * w0 / 2);
  ctx.closePath();
  const g = ctx.createLinearGradient(Math.min(x0, x1) - w0, 0, Math.max(x0, x1) + w0, 0);
  g.addColorStop(0, css(shade(bark, 1.25)));
  g.addColorStop(0.5, css(bark));
  g.addColorStop(1, css(shade(bark, 0.55)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,20,10,0.5)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

/** The flaking camouflage bark of a plane: cream and olive patches over grey. */
function planeBark(ctx: Ctx, x: number, top: number, w: number, base: number, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < (w * (base - top)) / 40; i++) {
    const px = x - w / 2 + rand() * w;
    const py = top + rand() * (base - top);
    const lit = px < x;
    ctx.fillStyle = rand() < 0.5 ? css(lit ? 0xe8dcc0 : 0xa89a80, 0.55) : css(lit ? 0x8a8a60 : 0x5a5a40, 0.45);
    ctx.beginPath();
    ctx.ellipse(px, py, 1.5 + rand() * 2.5, 1 + rand() * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

export interface PlaneStyle {
  /** Total height of the tree in px. */
  height: number;
  spread: number;
  /** Trunk width at the foot. */
  trunk: number;
  leaf: number;
  seed: number;
  /**
   * An old tree: the trunk forks low into great limbs that each carry their
   * own mass of leaves, with sky and limbs showing between them, instead of
   * one dome.
   */
  old?: boolean;
}

/** The chenar: a massive pale trunk forking into great limbs under a broad dome of leaves. */
export function paintPlaneTree(scene: Phaser.Scene, key: string, s: PlaneStyle): void {
  const w = Math.ceil(s.spread * 2 + 20);
  const h = s.height + FOOT + 6;
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const ground = h - FOOT;
    const bark = 0x948a70;
    ellipseShadow(ctx, cx + s.spread * 0.2, ground + 2, s.spread * 0.85, s.spread * 0.32, 0.3);
    if (s.old) {
      paintOldPlane(ctx, cx, ground, s, bark);
      return;
    }
    // Root flare and trunk.
    const fork = ground - s.height * 0.3;
    ctx.fillStyle = css(shade(bark, 0.8));
    ctx.beginPath();
    ctx.ellipse(cx, ground, s.trunk * 0.6, s.trunk * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    limb(ctx, cx, ground + 2, cx + 2, fork, s.trunk, s.trunk * 0.67, bark, -2);
    planeBark(ctx, cx + 1, fork, s.trunk * 0.73, ground, s.seed);
    const crownY = ground - s.height * 0.64;
    const rand = rng(s.seed + 3);
    const limbs = [-0.75, -0.3, 0.2, 0.7].map(t => ({ t, lift: 0.75 + rand() * 0.25 }));
    for (const { t, lift } of limbs) {
      limb(ctx, cx + t * s.trunk * 0.2, fork + 4, cx + t * s.spread * 0.62, crownY + s.height * 0.08 * (1 - lift), s.trunk * 0.43, s.trunk * 0.17, bark, t * 10);
    }
    crown(ctx, cx, crownY, s.spread, s.height * 0.36, { leaf: s.leaf, seed: s.seed });
  });
}

/**
 * An old chenar: a short trunk 3 m through, a fork at a fifth of its height,
 * and great limbs leaning out to four separate masses of leaf. The two high
 * masses are drawn first, then the limbs over them, then the two low side
 * masses, so the limbs show in the gap between the low masses and beneath
 * the high ones.
 */
function paintOldPlane(ctx: Ctx, cx: number, ground: number, s: PlaneStyle, bark: number): void {
  const H = s.height;
  const rand = rng(s.seed + 5);
  const jitter = (n: number) => (rand() - 0.5) * n;
  const fork = ground - H * 0.2;
  ctx.fillStyle = css(shade(bark, 0.8));
  ctx.beginPath();
  ctx.ellipse(cx, ground, s.trunk * 0.7, s.trunk * 0.24, 0, 0, Math.PI * 2);
  ctx.fill();
  limb(ctx, cx, ground + 2, cx + 3, fork, s.trunk * 1.05, s.trunk * 0.8, bark, -3);
  planeBark(ctx, cx + 1, fork, s.trunk * 0.85, ground, s.seed);
  const lobes = [
    { t: -0.22, y: 0.76, rx: 0.44, ry: 0.19, high: true },
    { t: 0.28, y: 0.72, rx: 0.4, ry: 0.18, high: true },
    { t: -0.56, y: 0.52, rx: 0.4, ry: 0.17, high: false },
    { t: 0.56, y: 0.55, rx: 0.38, ry: 0.16, high: false },
  ].map((l, i) => ({
    ...l,
    x: cx + (l.t + jitter(0.08)) * s.spread,
    cy: ground - (l.y + jitter(0.03)) * H,
    seed: s.seed + i * 13,
  }));
  const leafy = (l: typeof lobes[number]) =>
    crown(ctx, l.x, l.cy, l.rx * s.spread, l.ry * H, { leaf: s.leaf, seed: l.seed });
  lobes.filter(l => l.high).forEach(leafy);
  for (const l of lobes) {
    // Each great limb leaves the fork, bows outward, and ends inside its mass of leaf.
    const endY = l.cy + l.ry * H * (l.high ? 0.35 : 0.2);
    // Pulled in at the middle, so the limbs rise steeply and then lean out, as a vase.
    limb(ctx, cx + (l.x - cx) * 0.08, fork + 6, l.x, endY, s.trunk * 0.5, s.trunk * 0.14, bark, -(l.x - cx) * 0.16);
    // A lesser branch off it, tapering away into the leaves toward the mass's outer edge.
    const midX = cx + (l.x - cx) * 0.6;
    const midY = fork + (endY - fork) * 0.6;
    limb(ctx, midX, midY, l.x + (l.x - cx) * 0.35, l.cy + l.ry * H * 0.25, s.trunk * 0.08, 1.5, bark, -(l.x - cx) * 0.06);
  }
  lobes.filter(l => !l.high).forEach(leafy);
}

export interface OrangeStyle {
  height: number;
  leaf: number;
  seed: number;
  fruit: number;
  /** A whitewashed trunk, as courtyard trees are kept. */
  limewash?: boolean;
}

/** The bitter orange (nāranj) of Shíráz's courtyards: a dense round head on a short trunk. */
export function paintOrangeTree(scene: Phaser.Scene, key: string, s: OrangeStyle): void {
  const r = s.height * 0.36;
  const w = Math.ceil(r * 2 + 24);
  const h = s.height + FOOT + 6;
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const ground = h - FOOT;
    ellipseShadow(ctx, cx + r * 0.25, ground + 1, r * 0.95, r * 0.36, 0.3);
    // A raised round bed of earth with a brick rim.
    ctx.fillStyle = css(0x6a4a2c);
    ctx.beginPath();
    ctx.ellipse(cx, ground, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0xa86a42);
    ctx.lineWidth = 2;
    ctx.stroke();
    const top = ground - s.height * 0.38;
    limb(ctx, cx, ground, cx + 1, top, 7, 5, 0x5e4a36, -1);
    if (s.limewash) {
      ctx.fillStyle = 'rgba(240,236,222,0.85)';
      ctx.fillRect(cx - 3.2, ground - 18, 6.6, 17);
    }
    crown(ctx, cx, ground - s.height + r, r, r * 0.92, { leaf: s.leaf, seed: s.seed, fruit: s.fruit });
    // Ripe fruit hanging at the crown's edge, catching the light.
    const rand = rng(s.seed + 11);
    for (let i = 0; i < 16; i++) {
      const a = rand() * Math.PI * 2;
      const d = r * (0.45 + rand() * 0.45);
      const fx = cx + Math.cos(a) * d;
      const fy = ground - s.height + r + Math.sin(a) * d * 0.9;
      ctx.fillStyle = css(shade(s.fruit, 0.7));
      ctx.beginPath();
      ctx.arc(fx + 0.6, fy + 0.6, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(s.fruit);
      ctx.beginPath();
      ctx.arc(fx, fy, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.8)';
      ctx.fillRect(fx - 1, fy - 1, 0.9, 0.9);
    }
  });
}

/** Street and garden planes from a young tree of 9 m to one of 16 m in its prime. */
export const PLANE_VARIANTS: readonly PlaneStyle[] = [
  { height: 255, spread: 108, trunk: 30, leaf: 0x4f7a3a, seed: 101 },
  { height: 205, spread: 86, trunk: 22, leaf: 0x5a7f3c, seed: 117 },
  { height: 310, spread: 130, trunk: 38, leaf: 0x46703a, seed: 131 },
  { height: 360, spread: 150, trunk: 44, leaf: 0x4a743a, seed: 139 },
];

/** The old chenar of a village spring or a town square, 24 to 25 m, its trunk 3 m through. */
export const OLD_PLANE_VARIANTS: readonly PlaneStyle[] = [
  { height: 560, spread: 230, trunk: 66, leaf: 0x46703a, seed: 151, old: true },
  { height: 575, spread: 245, trunk: 72, leaf: 0x4f7a3a, seed: 163, old: true },
];

/** Garden cypresses from a young one of 6.5 m to an old one of 16.5 m. */
export const TALL_CYPRESS_VARIANTS: readonly CypressStyle[] = [
  { height: 205, width: 34, leaf: 0x24553a, seed: 204 },
  { height: 150, width: 26, leaf: 0x2a5e3c, seed: 208, lean: 3 },
  { height: 260, width: 40, leaf: 0x1f4c33, seed: 215, lean: -3 },
  { height: 320, width: 46, leaf: 0x24553a, seed: 221, lean: 2 },
  { height: 380, width: 52, leaf: 0x1f4c33, seed: 229 },
];

export const ORANGE_VARIANTS: readonly OrangeStyle[] = [
  { height: 90, leaf: 0x3a6e34, seed: 301, fruit: 0xf08a1a, limewash: true },
  { height: 82, leaf: 0x42763a, seed: 307, fruit: 0xe8781a },
];

/** The tall cypress is the garden cypress at its real height, its trunk on the cell centre. */
export function paintTallCypress(scene: Phaser.Scene, key: string, s: CypressStyle): void {
  paintCypress(scene, key, { ...s, foot: FOOT });
}
