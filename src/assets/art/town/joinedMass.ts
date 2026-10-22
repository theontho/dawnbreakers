import { css, onRoof, roofPoint, shade, type Ctx, type IsoBox } from '../canvasKit';
import { earthRoof } from '../materials';
import { flatTop, LIGHT } from '../ornaments';
import { subBox } from '../structureParts';
import { PARAPET, PARAPET_T, townBlock, townMerlons, type BlockSpec } from './townKit';

/**
 * One building from several blocks. Painting each block whole leaves seams
 * where they meet: a dark outline down every joint and two parapet rims
 * butting along the roof. Here parts that share an edge at the same height
 * get one continuous roof (their parapets open into each other along the
 * shared edge), and outlines follow only the outer silhouette, so ranges,
 * corners and portals read as built together.
 *
 * Parts are rectangles in the parent box's ground axes (`p` along its left
 * wall toward the front, `q` along its right wall toward the back) with
 * their own height, painted back to front.
 */

export interface MassPart {
  p0: number;
  p1: number;
  q0: number;
  q1: number;
  h: number;
  spec: BlockSpec;
}

const EPS = 0.01;

/** Mask bits for the sides of a footprint that a neighbour continues (N, E, S, W on the map). */
export const SIDE_N = 1;
export const SIDE_E = 2;
export const SIDE_S = 4;
export const SIDE_W = 8;

/**
 * Phantom copies of `part` carried on past the sides of `box` that `mask`
 * says a like building continues (east is +p, south is -q, west is -p,
 * north is +q), for `joinedMass`'s `others`: the roof runs on and no
 * outline closes the end. Only sides the part reaches count.
 */
export function continuations(box: IsoBox, part: MassPart, mask: number, reach = 64): MassPart[] {
  const out: MassPart[] = [];
  if (mask & SIDE_E && part.p1 >= box.w - EPS) out.push({ ...part, p0: box.w, p1: box.w + reach });
  if (mask & SIDE_W && part.p0 <= EPS) out.push({ ...part, p0: -reach, p1: 0 });
  if (mask & SIDE_S && part.q0 <= EPS) out.push({ ...part, q0: -reach, q1: 0 });
  if (mask & SIDE_N && part.q1 >= box.d - EPS) out.push({ ...part, q0: box.d, q1: box.d + reach });
  return out;
}

/**
 * Paints `parts` back to front. `others` are parts of the same building
 * painted in another pass (say, behind a court drawn in between): they are
 * not painted here but still count for shared roofs and the silhouette.
 */
export function joinedMass(ctx: Ctx, parent: IsoBox, parts: readonly MassPart[], others: readonly MassPart[] = []): void {
  const all = [...parts, ...others];
  for (const part of paintOrder(parts)) {
    const box = subBox(parent, part.p0, part.p1, part.q0, part.q1, part.h);
    const roof = part.spec.roof ?? 'parapet';
    townBlock(ctx, box, { ...part.spec, roof: 'none', outline: false, merlons: false });
    if (roof === 'parapet') joinedParapet(ctx, box, part, all, part.spec);
    else if (roof === 'flat') flatTop(ctx, box, shade(part.spec.wall, 0.95));
    if (part.spec.merlons) townMerlons(ctx, box, part.spec.wall);
    silhouette(ctx, box, part, all);
  }
}

/**
 * Back to front: a part goes before any it stands wholly behind (beyond its
 * back-right side while they overlap along p, or beyond its back-left side
 * while they overlap along q), and before any smaller part set into it (a
 * portal through a range); otherwise by depth.
 */
function paintOrder(parts: readonly MassPart[]): MassPart[] {
  const depth = (m: MassPart) => (m.p0 + m.p1) - (m.q0 + m.q1);
  const area = (m: MassPart) => (m.p1 - m.p0) * (m.q1 - m.q0);
  const overlap = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 - EPS && b0 < a1 - EPS;
  const behind = (a: MassPart, b: MassPart) => {
    const p = overlap(a.p0, a.p1, b.p0, b.p1);
    const q = overlap(a.q0, a.q1, b.q0, b.q1);
    if (p && q) return area(a) > area(b);
    return (p && a.q0 >= b.q1 - EPS) || (q && a.p1 <= b.p0 + EPS);
  };
  const rest = [...parts].sort((a, b) => depth(a) - depth(b));
  const out: MassPart[] = [];
  while (rest.length > 0) {
    const i = Math.max(0, rest.findIndex(x => !rest.some(y => y !== x && behind(y, x))));
    out.push(rest.splice(i, 1)[0]!);
  }
  return out;
}

interface Opening {
  u0: number;
  u1: number;
  v0: number;
  v1: number;
  /** The neighbour is as tall, so its roof runs on (a taller one closes the opening with its wall). */
  level: boolean;
}

/** Shared stretches of `part`'s four edges with neighbours at least as tall, in its local roof space. */
function sharedEdges(part: MassPart, parts: readonly MassPart[]): Opening[] {
  const out: Opening[] = [];
  const w = part.p1 - part.p0;
  const d = part.q1 - part.q0;
  const t = PARAPET_T;
  for (const n of parts) {
    if (n === part || n.h < part.h) continue;
    const level = n.h === part.h;
    const pa = Math.max(part.p0, n.p0) - part.p0;
    const pb = Math.min(part.p1, n.p1) - part.p0;
    const qa = Math.max(part.q0, n.q0) - part.q0;
    const qb = Math.min(part.q1, n.q1) - part.q0;
    if (n.q1 === part.q0 && pb > pa) out.push({ u0: pa + t, u1: pb - t, v0: 0, v1: t, level });
    if (n.q0 === part.q1 && pb > pa) out.push({ u0: pa + t, u1: pb - t, v0: d - t, v1: d, level });
    if (n.p1 === part.p0 && qb > qa) out.push({ u0: 0, u1: t, v0: qa + t, v1: qb - t, level });
    if (n.p0 === part.p1 && qb > qa) out.push({ u0: w - t, u1: w, v0: qa + t, v1: qb - t, level });
  }
  return out;
}

/** A sunk roof whose parapet opens wherever a neighbour as tall continues it (or a taller one closes it). */
function joinedParapet(ctx: Ctx, box: IsoBox, part: MassPart, parts: readonly MassPart[], spec: BlockSpec): void {
  const rim = shade(spec.wall, 0.97);
  const t = PARAPET_T;
  const openings = sharedEdges(part, parts);
  onRoof(ctx, box, (w, d) => {
    // `floor` is the hole seen through the parapet's drop: there the roof floor
    // runs on past the back edges where a level neighbour continues it.
    const hole = (floor: boolean): void => {
      ctx.beginPath();
      ctx.rect(t, t, w - t * 2, d - t * 2);
      for (const o of openings) {
        const u0 = floor && o.level && o.u0 === 0 ? -PARAPET : o.u0;
        const v1 = floor && o.level && o.v1 === d ? d + PARAPET : o.v1;
        ctx.rect(u0, o.v0, o.u1 - u0, v1 - o.v0);
      }
    };
    ctx.fillStyle = css(shade(rim, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.save();
    hole(false);
    ctx.clip();
    ctx.fillStyle = css(shade(rim, 0.62));
    ctx.fillRect(0, 0, w, d);
    // Screen-down by the parapet's height is (+depth, -depth) in roof space.
    ctx.translate(PARAPET, -PARAPET);
    hole(true);
    ctx.clip();
    ctx.translate(-PARAPET, 0);
    earthRoof(ctx, w + PARAPET, d + PARAPET, { base: shade(spec.wall, 0.8), light: 1.05, seed: spec.seed + 3 });
    ctx.restore();
  });
}

/** Outline only edges on the outer silhouette of the whole building. */
function silhouette(ctx: Ctx, box: IsoBox, part: MassPart, parts: readonly MassPart[]): void {
  // Is ground point (p, q) inside another part at least `h` tall?
  const inside = (p: number, q: number, h: number) =>
    parts.some(n => n !== part && n.h >= h && p > n.p0 - EPS && p < n.p1 + EPS && q > n.q0 - EPS && q < n.q1 + EPS);
  const { p0, p1, q0, q1, h } = part;
  const top = (p: number, q: number) => {
    const pt = roofPoint(box, p - p0, q - q0);
    return { x: pt.x, y: pt.y };
  };
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  };
  ctx.save();
  ctx.strokeStyle = 'rgba(28,18,10,0.85)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  const step = 8;
  // Top edges, in short runs so a partly shared edge keeps its outer stretch.
  const edgeRuns = (a: [number, number], b: [number, number], outward: [number, number]) => {
    const n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let i = 0; i < n; i++) {
      const s = (i + 0.5) / n;
      const p = a[0] + (b[0] - a[0]) * s + outward[0];
      const q = a[1] + (b[1] - a[1]) * s + outward[1];
      if (inside(p, q, h)) continue;
      const pa = a[0] + (b[0] - a[0]) * (i / n);
      const qa = a[1] + (b[1] - a[1]) * (i / n);
      const pb = a[0] + (b[0] - a[0]) * ((i + 1) / n);
      const qb = a[1] + (b[1] - a[1]) * ((i + 1) / n);
      line(top(pa, qa), top(pb, qb));
    }
  };
  edgeRuns([p0, q0], [p1, q0], [0, -1]);
  edgeRuns([p1, q0], [p1, q1], [1, 0]);
  edgeRuns([p0, q1], [p1, q1], [0, 1]);
  edgeRuns([p0, q0], [p0, q1], [-1, 0]);
  // Uprights at the three visible corners, down to whatever neighbour carries
  // the wall on or stands before the corner (all the way when none does).
  const heightAt = (p: number, q: number) =>
    parts.reduce((m, n) => (n !== part && p > n.p0 - EPS && p < n.p1 + EPS && q > n.q0 - EPS && q < n.q1 + EPS ? Math.max(m, n.h) : m), 0);
  const drop = (p: number, q: number, a: [number, number], b: [number, number]) => {
    const below = Math.max(heightAt(p + a[0], q + a[1]), heightAt(p + b[0], q + b[1]));
    if (below >= h) return;
    const pt = top(p, q);
    line(pt, { x: pt.x, y: pt.y + h - below });
  };
  drop(p0, q0, [-1, 1], [1, -1]);
  drop(p1, q0, [1, 1], [-1, -1]);
  drop(p1, q1, [1, -1], [-1, 1]);
  ctx.stroke();
  ctx.restore();
}
