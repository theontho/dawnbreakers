import { css, onRoof, roofPoint, shade, type Ctx, type IsoBox } from '../canvasKit';
import { earthRoof } from '../materials';
import { flatTop, LIGHT } from '../ornaments';
import { subBox } from '../structureParts';
import { PARAPET, PARAPET_T, townBlock, type BlockSpec } from './townKit';

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

/**
 * Paints `parts` back to front. `others` are parts of the same building
 * painted in another pass (say, behind a court drawn in between): they are
 * not painted here but still count for shared roofs and the silhouette.
 */
export function joinedMass(ctx: Ctx, parent: IsoBox, parts: readonly MassPart[], others: readonly MassPart[] = []): void {
  const all = [...parts, ...others];
  const depth = (m: MassPart) => (m.p0 + m.p1) - (m.q0 + m.q1);
  const order = [...parts].sort((a, b) => depth(a) - depth(b));
  for (const part of order) {
    const box = subBox(parent, part.p0, part.p1, part.q0, part.q1, part.h);
    const roof = part.spec.roof ?? 'parapet';
    townBlock(ctx, box, { ...part.spec, roof: 'none', outline: false });
    if (roof === 'parapet') joinedParapet(ctx, box, part, all, part.spec);
    else if (roof === 'flat') flatTop(ctx, box, shade(part.spec.wall, 0.95));
    silhouette(ctx, box, part, all);
  }
}

/** Shared stretches of `part`'s four edges with same-height neighbours, in its local roof space. */
function sharedEdges(part: MassPart, parts: readonly MassPart[]): Array<{ u0: number; u1: number; v0: number; v1: number }> {
  const out: Array<{ u0: number; u1: number; v0: number; v1: number }> = [];
  const w = part.p1 - part.p0;
  const d = part.q1 - part.q0;
  const t = PARAPET_T;
  for (const n of parts) {
    if (n === part || n.h !== part.h) continue;
    const pa = Math.max(part.p0, n.p0) - part.p0;
    const pb = Math.min(part.p1, n.p1) - part.p0;
    const qa = Math.max(part.q0, n.q0) - part.q0;
    const qb = Math.min(part.q1, n.q1) - part.q0;
    if (n.q1 === part.q0 && pb > pa) out.push({ u0: pa + t, u1: pb - t, v0: 0, v1: t });
    if (n.q0 === part.q1 && pb > pa) out.push({ u0: pa + t, u1: pb - t, v0: d - t, v1: d });
    if (n.p1 === part.p0 && qb > qa) out.push({ u0: 0, u1: t, v0: qa + t, v1: qb - t });
    if (n.p0 === part.p1 && qb > qa) out.push({ u0: w - t, u1: w, v0: qa + t, v1: qb - t });
  }
  return out;
}

/** A sunk roof whose parapet opens wherever a same-height neighbour continues it. */
function joinedParapet(ctx: Ctx, box: IsoBox, part: MassPart, parts: readonly MassPart[], spec: BlockSpec): void {
  const rim = shade(spec.wall, 0.97);
  const t = PARAPET_T;
  const openings = sharedEdges(part, parts);
  onRoof(ctx, box, (w, d) => {
    const hole = (): void => {
      ctx.beginPath();
      ctx.rect(t, t, w - t * 2, d - t * 2);
      for (const o of openings) ctx.rect(o.u0, o.v0, o.u1 - o.u0, o.v1 - o.v0);
    };
    ctx.fillStyle = css(shade(rim, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.save();
    hole();
    ctx.clip();
    ctx.fillStyle = css(shade(rim, 0.62));
    ctx.fillRect(0, 0, w, d);
    // Screen-down by the parapet's height is (+depth, -depth) in roof space.
    ctx.translate(PARAPET, -PARAPET);
    hole();
    ctx.clip();
    earthRoof(ctx, w, d, { base: shade(spec.wall, 0.8), light: 1.05, seed: spec.seed + 3 });
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
  // Uprights at the three visible corners, unless a neighbour carries the wall on.
  const drop = (p: number, q: number) => {
    const a = top(p, q);
    line(a, { x: a.x, y: a.y + h });
  };
  if (!inside(p0 - 1, q0 + 1, 0) && !inside(p0 + 1, q0 - 1, 0)) drop(p0, q0);
  if (!inside(p1 + 1, q0 + 1, 0) && !inside(p1 - 1, q0 - 1, 0)) drop(p1, q0);
  if (!inside(p1 + 1, q1 - 1, 0) && !inside(p1 - 1, q1 + 1, 0)) drop(p1, q1);
  ctx.stroke();
  ctx.restore();
}
