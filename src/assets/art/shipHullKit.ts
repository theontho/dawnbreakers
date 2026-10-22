import { css, shade, type Ctx } from './canvasKit';
import { deckRing, hullRing, SHIP, toScreen, type HullPoint, type Pt } from './shipHullPlan';

/**
 * Shared drawing for the baghla's hull: rings at any height, faces lit by
 * which way they turn, and strips of planking that follow the curve of the
 * ship rather than the grid.
 */

export const TEAK = 0x6e4426;
export const DARK_TEAK = 0x3a2414;
export const CAP = 0x9a7048;
export const CHUNAM = 0xcfc6ac;

export const DECK = deckRing();
export const RING_LEN = DECK.length;

/** Ring point `i` at height `h` (pixels above the deck; negative below it). */
export function hullAt(i: number, h: number): Pt {
  const u = Math.max(0, -h / SHIP.freeboard);
  const p = ringCache(u)[i]!;
  return toScreen(p.x, p.y, h);
}

const rings = new Map<number, Pt[]>();
function ringCache(u: number): Pt[] {
  const key = Math.round(u * 400) / 400;
  let ring = rings.get(key);
  if (!ring) {
    ring = hullRing(key);
    rings.set(key, ring);
  }
  return ring;
}

/** The point `in` cells inboard of deck-ring point `p`. */
export function inboard(p: HullPoint, by: number): { fx: number; fy: number } {
  return { fx: p.fx - p.nx * by, fy: p.fy - p.ny * by };
}

/** Light on a face turned toward normal (nx, ny): sunlit toward +fy (the left walls), shaded toward +fx. */
export function faceLight(nx: number, ny: number): number {
  return Math.max(0.42, Math.min(1.12, 0.78 + 0.3 * ny - 0.16 * nx));
}

export function fillQuad(ctx: Ctx, pts: readonly Pt[], color: string): void {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  // A hairline of the same colour closes the antialiasing seams between neighbouring faces.
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

export function polyline(ctx: Ctx, pts: readonly Pt[], color: string, width: number): void {
  if (pts.length < 2) return;
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

/** Contiguous runs of ring indices passing `keep`, in ring order, each run with its neighbours closed up. */
export function runs(keep: (p: HullPoint, i: number) => boolean): number[][] {
  const out: number[][] = [];
  let cur: number[] = [];
  // Start where a run cannot straddle the ring's seam: at a point that is not kept.
  const start = DECK.findIndex((p, i) => !keep(p, i));
  for (let k = 0; k < RING_LEN; k++) {
    const i = (start + 1 + k) % RING_LEN;
    if (keep(DECK[i]!, i)) cur.push(i);
    else if (cur.length) {
      out.push(cur);
      cur = [];
    }
  }
  if (cur.length) out.push(cur);
  return out;
}

/**
 * A band of the outer hull from height `top` down to `bottom` along a run of
 * ring indices, segment by segment, nearest last; `tone(i)` colours each.
 */
export function outerBand(ctx: Ctx, run: readonly number[], top: (i: number) => number, bottom: (i: number) => number,
  tone: (i: number) => number): void {
  const segs = run.slice(0, -1).map((i, k) => [i, run[k + 1]!] as const);
  segs.sort((a, b) => DECK[a[0]]!.fx + DECK[a[0]]!.fy - (DECK[b[0]]!.fx + DECK[b[0]]!.fy));
  for (const [a, b] of segs) {
    const p = DECK[a]!;
    const color = shade(tone(a), faceLight(p.nx, p.ny));
    fillQuad(ctx, [hullAt(a, top(a)), hullAt(b, top(b)), hullAt(b, bottom(b)), hullAt(a, bottom(a))], css(color));
  }
}

/** A line along the hull at height `h(i)` over a run. */
export function lineAlong(run: readonly number[], h: (i: number) => number): Pt[] {
  return run.map(i => hullAt(i, h(i)));
}

/** Deterministic noise per ring index, for plank tones. */
export function grain(i: number, seed: number): number {
  const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return v - Math.floor(v);
}
