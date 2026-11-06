import type Phaser from 'phaser';

/**
 * Drawing helpers for the travellers on the road: smooth outlines through a
 * few control points, tapered limbs, and two-bone legs that bend the way
 * a knee or a hock does. Everything is in screen pixels.
 */

export type G = Phaser.GameObjects.Graphics;

export interface P {
  x: number;
  y: number;
}

/** A closed outline through `points`, rounded by a Catmull-Rom spline. */
export function smoothClosed(points: readonly P[], samples = 4): P[] {
  const n = points.length;
  const out: P[] = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;
    for (let s = 0; s < samples; s++) out.push(catmull(p0, p1, p2, p3, s / samples));
  }
  return out;
}

/** An open line through `points`, rounded the same way. */
export function smoothOpen(points: readonly P[], samples = 4): P[] {
  const n = points.length;
  const out: P[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(n - 1, i + 2)]!;
    for (let s = 0; s < samples; s++) out.push(catmull(p0, p1, p2, p3, s / samples));
  }
  out.push(points[n - 1]!);
  return out;
}

function catmull(p0: P, p1: P, p2: P, p3: P, t: number): P {
  const t2 = t * t;
  const t3 = t2 * t;
  const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

/** Fills the smooth closed shape through `points`. */
export function blob(g: G, points: readonly P[], color: number, samples = 4): void {
  g.fillStyle(color, 1);
  g.fillPoints(smoothClosed(points, samples), true);
}

/** A limb from `a` to `b`, `wa` wide at `a` and `wb` at `b`, rounded at both ends. */
export function limb(g: G, a: P, b: P, wa: number, wb: number, color: number): void {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  g.fillStyle(color, 1);
  g.fillPoints([
    { x: a.x + nx * wa / 2, y: a.y + ny * wa / 2 },
    { x: b.x + nx * wb / 2, y: b.y + ny * wb / 2 },
    { x: b.x - nx * wb / 2, y: b.y - ny * wb / 2 },
    { x: a.x - nx * wa / 2, y: a.y - ny * wa / 2 },
  ], true);
  g.fillCircle(a.x, a.y, wa / 2);
  g.fillCircle(b.x, b.y, wb / 2);
}

/**
 * The joint of a two-bone limb from `hip` to `foot`, with bones `upper` and
 * `lower` long, bulging to the right of the line when `bend` is 1 (a
 * knee, as one walks to the right) and to the left when it is -1 (a hock).
 */
export function joint(hip: P, foot: P, upper: number, lower: number, bend: 1 | -1): P {
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  const d = Math.min(Math.hypot(dx, dy), upper + lower - 0.001);
  const a = (upper * upper - lower * lower + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, upper * upper - a * a));
  const ux = dx / (Math.hypot(dx, dy) || 1);
  const uy = dy / (Math.hypot(dx, dy) || 1);
  // Downward-pointing limb: "right of the line" is toward +x.
  return { x: hip.x + ux * a + uy * h * bend, y: hip.y + uy * a - ux * h * bend };
}

/** `points` turned by `angle` radians about `about`. */
export function turn(points: readonly P[], about: P, angle: number): P[] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return points.map(p => ({ x: about.x + (p.x - about.x) * c - (p.y - about.y) * s, y: about.y + (p.x - about.x) * s + (p.y - about.y) * c }));
}

/** A shade of `color` lifted toward the sky behind it, for the far side of a figure. */
export function lighten(color: number, amount: number): number {
  const ch = (shift: number) => {
    const v = (color >> shift) & 255;
    return Math.min(255, Math.round(v + (255 - v) * amount * 0.25 + 3));
  };
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
