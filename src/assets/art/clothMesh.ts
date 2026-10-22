import { css, shade, type Ctx, type IsoBox } from './canvasKit';
import { liftedPoint, type Pt } from './structureParts';

/**
 * Curved cloth for tents and awnings. A surface is a function from (u, v)
 * in [0, 1] to a point in a box's ground axes plus height; it is cut into
 * small quads, each lit from its own normal, so canvas sags between poles,
 * billows between guy ropes and darkens in its troughs.
 */

export interface WorldPt {
  p: number;
  q: number;
  z: number;
}

export type Surface3 = (u: number, v: number) => WorldPt;

export interface MeshStyle {
  /** Base colour of the quad at (u, v), before lighting. */
  color: (u: number, v: number) => number;
  /** Quads along u and v. */
  nu: number;
  nv: number;
  /** Sort quads back to front, for surfaces that turn away from the viewer. */
  sort?: boolean;
}

export const lerp3 = (a: WorldPt, b: WorldPt, t: number): WorldPt => ({
  p: a.p + (b.p - a.p) * t,
  q: a.q + (b.q - a.q) * t,
  z: a.z + (b.z - a.z) * t,
});

export const toScreen = (box: IsoBox, w: WorldPt): Pt => liftedPoint(box, w.p, w.q, w.z);

/**
 * Brightness of a surface with unit normal `n`, matched to the kit's
 * light: a sunlit left wall is 1, a shaded right wall 0.7, a roof 1.12.
 */
export function lightOf(np: number, nq: number, nz: number): number {
  return 0.78 - 0.22 * nq - 0.08 * np + 0.34 * nz;
}

/** Paints a curved surface as lit quads. */
export function clothMesh(ctx: Ctx, box: IsoBox, f: Surface3, style: MeshStyle): void {
  const { nu, nv } = style;
  const grid: WorldPt[][] = [];
  for (let i = 0; i <= nu; i++) {
    const row: WorldPt[] = [];
    for (let j = 0; j <= nv; j++) row.push(f(i / nu, j / nv));
    grid.push(row);
  }
  const quads: Array<{ pts: WorldPt[]; u: number; v: number; depth: number }> = [];
  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      const pts = [grid[i]![j]!, grid[i + 1]![j]!, grid[i + 1]![j + 1]!, grid[i]![j + 1]!];
      const depth = pts.reduce((s, w) => s + w.p - w.q, 0);
      quads.push({ pts, u: (i + 0.5) / nu, v: (j + 0.5) / nv, depth });
    }
  }
  if (style.sort) quads.sort((a, b) => a.depth - b.depth);
  ctx.save();
  ctx.lineWidth = 0.7;
  ctx.lineJoin = 'round';
  for (const { pts, u, v } of quads) {
    const [a, b, , d] = pts as [WorldPt, WorldPt, WorldPt, WorldPt];
    // Normal from the two edges leaving corner a; use the diagonal when one collapses (a cone's apex).
    const e1 = sub(b, a).len > 1e-3 ? sub(b, a) : sub(pts[2]!, d);
    const e2 = sub(d, a).len > 1e-3 ? sub(d, a) : sub(pts[2]!, b);
    let np = e1.q * e2.z - e1.z * e2.q;
    let nq = e1.z * e2.p - e1.p * e2.z;
    let nz = e1.p * e2.q - e1.q * e2.p;
    const len = Math.hypot(np, nq, nz) || 1;
    np /= len;
    nq /= len;
    nz /= len;
    // Face the viewer, who looks along (+p, -q, +z).
    if (np - nq + nz * 1.2 < 0) {
      np = -np;
      nq = -nq;
      nz = -nz;
    }
    const c = css(shade(style.color(u, v), lightOf(np, nq, nz)));
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.beginPath();
    pts.forEach((w, k) => {
      const s = toScreen(box, w);
      if (k === 0) ctx.moveTo(s.x, s.y);
      else ctx.lineTo(s.x, s.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function sub(a: WorldPt, b: WorldPt): WorldPt & { len: number } {
  const p = a.p - b.p;
  const q = a.q - b.q;
  const z = a.z - b.z;
  return { p, q, z, len: Math.hypot(p, q, z) };
}

/** Strokes a polyline through world points. */
export function worldLine(ctx: Ctx, box: IsoBox, pts: readonly WorldPt[]): void {
  ctx.beginPath();
  pts.forEach((w, i) => {
    const s = toScreen(box, w);
    if (i === 0) ctx.moveTo(s.x, s.y);
    else ctx.lineTo(s.x, s.y);
  });
  ctx.stroke();
}

/** A scalloped valance hanging `drop` pixels below a run of eave points, one scallop per segment. */
export function valance(ctx: Ctx, box: IsoBox, eave: readonly WorldPt[], drop: number, color: number, tassel: number): void {
  for (let i = 0; i < eave.length - 1; i++) {
    const a = toScreen(box, eave[i]!);
    const b = toScreen(box, eave[i + 1]!);
    ctx.fillStyle = css(color);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - 0.5);
    ctx.lineTo(b.x, b.y - 0.5);
    ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + drop * 2, a.x, a.y - 0.5);
    ctx.fill();
    ctx.fillStyle = css(tassel);
    ctx.fillRect((a.x + b.x) / 2 - 0.5, (a.y + b.y) / 2 + drop - 0.5, 1, 2.2);
  }
}
