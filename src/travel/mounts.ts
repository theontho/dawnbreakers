import type Phaser from 'phaser';

type G = Phaser.GameObjects.Graphics;

export type MountKind = 'mule' | 'horse' | 'camel';

/** Proportions of a mount, in standing-person heights. */
interface MountShape {
  length: number;
  depth: number;
  leg: number;
  neck: number;
  head: number;
  ears: number;
  hump: number;
  /** Fraction of a stride the legs swing through, in radians each way. */
  swing: number;
}

const SHAPES: Record<MountKind, MountShape> = {
  mule: { length: 0.78, depth: 0.3, leg: 0.42, neck: 0.32, head: 0.2, ears: 0.12, hump: 0, swing: 0.32 },
  horse: { length: 0.92, depth: 0.32, leg: 0.52, neck: 0.42, head: 0.22, ears: 0.06, hump: 0, swing: 0.36 },
  camel: { length: 1.05, depth: 0.3, leg: 0.8, neck: 0.62, head: 0.2, ears: 0.03, hump: 0.24, swing: 0.3 },
};

/** Where a rider sits or a load is tied, returned by `drawMount`. */
export interface Saddle {
  x: number;
  y: number;
}

export function mountWidth(kind: MountKind, figure: number): number {
  return SHAPES[kind].length * figure * 1.45;
}

/**
 * A mount walking to the right with its feet on `ground`, its legs in the
 * diagonal pairs of a walk. `phase` advances by 2π per stride; `bob` lifts
 * the body as it walks.
 */
export function drawMount(g: G, kind: MountKind, x: number, ground: number, f: number, phase: number, color: number): Saddle {
  const s = SHAPES[kind];
  const bob = Math.abs(Math.sin(phase)) * f * 0.012;
  const back = ground - s.leg * f - bob;
  const bodyY = back + s.depth * f * 0.45;
  const front = x + s.length * f * 0.38;
  const rear = x - s.length * f * 0.38;
  const legWidth = f * (kind === 'camel' ? 0.05 : 0.06);

  // Far legs a shade lighter than the near ones, so the gait reads.
  const far = lighten(color, 0.1);
  leg(g, front - f * 0.04, bodyY, ground, s, f, phase + Math.PI, legWidth, far, true);
  leg(g, rear - f * 0.04, bodyY, ground, s, f, phase, legWidth, far, false);

  g.fillStyle(color, 1);
  g.fillEllipse(x, bodyY, s.length * f, s.depth * f);
  if (s.hump > 0) g.fillEllipse(x - f * 0.02, back - s.hump * f * 0.2, s.length * f * 0.5, s.hump * f * 1.1);

  // Tail, swaying with the walk.
  g.lineStyle(f * 0.025, color, 1);
  const sway = Math.sin(phase * 0.5) * f * 0.03;
  g.lineBetween(rear - s.length * f * 0.1, bodyY - s.depth * f * 0.25, rear - s.length * f * 0.16 + sway, bodyY + s.depth * f * 0.7);

  // Neck and head: a camel's swoops low and up, the others rise straight.
  const nod = Math.sin(phase * 2) * f * 0.012;
  const neckBase = { x: front + f * 0.06, y: bodyY - s.depth * f * 0.2 };
  const headAt = kind === 'camel'
    ? { x: neckBase.x + s.neck * f * 0.62, y: neckBase.y - s.neck * f * 0.62 + nod }
    : { x: neckBase.x + s.neck * f * 0.45, y: neckBase.y - s.neck * f * 0.82 + nod };
  g.fillStyle(color, 1);
  if (kind === 'camel') {
    const dip = { x: neckBase.x + s.neck * f * 0.4, y: neckBase.y + f * 0.02 };
    g.lineStyle(f * 0.09, color, 1);
    g.lineBetween(neckBase.x, neckBase.y, dip.x, dip.y);
    g.lineBetween(dip.x, dip.y, headAt.x, headAt.y);
  } else {
    g.fillPoints([
      { x: neckBase.x - f * 0.1, y: neckBase.y + f * 0.05 },
      { x: headAt.x - f * 0.04, y: headAt.y - f * 0.04 },
      { x: headAt.x + f * 0.05, y: headAt.y + f * 0.04 },
      { x: neckBase.x + f * 0.08, y: neckBase.y + f * 0.1 },
    ], true);
  }
  g.fillEllipse(headAt.x + s.head * f * 0.3, headAt.y + s.head * f * 0.18, s.head * f, s.head * f * 0.42);
  g.lineStyle(f * 0.025, color, 1);
  g.lineBetween(headAt.x - f * 0.01, headAt.y - f * 0.02, headAt.x - f * 0.03, headAt.y - s.ears * f - f * 0.03);
  g.lineBetween(headAt.x + f * 0.02, headAt.y - f * 0.02, headAt.x + f * 0.02, headAt.y - s.ears * f - f * 0.02);

  leg(g, front, bodyY, ground, s, f, phase, legWidth, color, true);
  leg(g, rear, bodyY, ground, s, f, phase + Math.PI, legWidth, color, false);

  return { x: x - f * 0.02, y: back - (s.hump > 0 ? s.hump * f * 0.6 : 0) };
}

/** A leg from the body to the ground, bending at the knee as it swings forward. */
function leg(g: G, hipX: number, hipY: number, ground: number, s: MountShape, f: number, phase: number, width: number, color: number, foreleg: boolean): void {
  const swing = Math.sin(phase) * s.swing;
  const lift = Math.max(0, Math.cos(phase)) * f * 0.05;
  const length = ground - hipY;
  const footX = hipX + Math.sin(swing) * length;
  const footY = ground - lift;
  const bend = (foreleg ? 1 : -1) * lift * 0.9;
  const kneeX = (hipX + footX) / 2 + bend;
  const kneeY = hipY + (footY - hipY) * 0.5;
  g.lineStyle(width, color, 1);
  g.lineBetween(hipX, hipY, kneeX, kneeY);
  g.lineStyle(width * 0.75, color, 1);
  g.lineBetween(kneeX, kneeY, footX, footY);
}

function lighten(color: number, amount: number): number {
  const ch = (shift: number) => {
    const v = (color >> shift) & 255;
    return Math.min(255, Math.round(v + (255 - v) * amount * 0.25 + 6));
  };
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}
