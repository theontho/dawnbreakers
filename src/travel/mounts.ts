import { blob, joint, lighten, limb, turn, type G, type P } from './silhouette';

export type MountKind = 'mule' | 'horse' | 'camel';

/**
 * The beasts of the road in silhouette, walking to the right: a horse, a
 * mule (a smaller horse with long ears and a tufted tail) and a dromedary.
 * Each is drawn from a few outlines in standing-person heights, `f`: the
 * body, the neck and head nodding with the stride, a tail swinging, and
 * four legs on two bones each. A horse or mule walks its four feet down in
 * turn, near hind, near fore, far hind, far fore; a camel paces, both legs
 * of a side together. The far legs are a shade lighter, so the gait reads.
 */

interface Leg {
  /** Hip or shoulder, in f from the mount's centre and the ground. */
  hip: P;
  upper: number;
  lower: number;
  /** Width at the hip, at the joint, and down the lower bone. */
  widths: [number, number, number];
  /** A knee folds forward, a hock back. */
  bend: 1 | -1;
}

interface Build {
  body: P[];
  /** Neck and head, nodding about `nape`. */
  neck: P[];
  nape: P;
  ear: P[];
  fore: Leg;
  hind: Leg;
  /** How far a foot swings either side of under its hip, and how high it lifts. */
  stride: number;
  lift: number;
  /** A camel paces: each side's legs move together. */
  pace: boolean;
  /** Where a rider sits or a load is tied, and where the reins meet the mouth. */
  seat: P;
  bit: P;
  tail: (sway: number) => P[];
  /** Total length, for spacing the party. */
  span: number;
  /** A rider's saddle cloth, or the camel's saddle frame on its hump. */
  saddle: P[];
  callus?: boolean;
}

const pts = (list: ReadonlyArray<readonly [number, number]>): P[] => list.map(([x, y]) => ({ x, y }));

const HORSE: Build = {
  // Croup, back, withers; the chest, the girth, the belly, and the hindquarters rounding down to the stifle.
  body: pts([[-0.47, -0.8], [-0.38, -0.88], [-0.2, -0.84], [0.0, -0.83], [0.14, -0.88], [0.3, -0.82], [0.36, -0.68], [0.3, -0.56], [0.14, -0.5], [-0.1, -0.5], [-0.28, -0.53], [-0.38, -0.56], [-0.46, -0.64], [-0.5, -0.73]]),
  // The neck broad where it meets the chest, the crest arching up to the poll; the long head with its round cheek.
  neck: pts([[0.1, -0.86], [0.24, -0.97], [0.33, -1.09], [0.39, -1.17], [0.46, -1.16], [0.53, -1.07], [0.6, -0.98], [0.625, -0.935], [0.6, -0.905], [0.55, -0.905], [0.49, -0.95], [0.44, -1.0], [0.41, -0.97], [0.38, -0.84], [0.36, -0.7], [0.24, -0.66]]),
  nape: { x: 0.24, y: -0.78 },
  ear: pts([[0.38, -1.15], [0.37, -1.25], [0.43, -1.16]]),
  fore: { hip: { x: 0.22, y: -0.62 }, upper: 0.32, lower: 0.31, widths: [0.14, 0.07, 0.05], bend: 1 },
  hind: { hip: { x: -0.36, y: -0.64 }, upper: 0.36, lower: 0.33, widths: [0.18, 0.075, 0.05], bend: -1 },
  stride: 0.2,
  lift: 0.08,
  pace: false,
  seat: { x: 0.02, y: -0.86 },
  bit: { x: 0.6, y: -0.93 },
  tail: s => pts([[-0.46, -0.84], [-0.54, -0.8], [-0.6 + s * 0.4, -0.64], [-0.63 + s, -0.44], [-0.57 + s, -0.4], [-0.54 + s * 0.4, -0.62], [-0.48, -0.75]]),
  span: 1.3,
  saddle: pts([[-0.14, -0.85], [0.1, -0.87], [0.12, -0.72], [-0.15, -0.7]]),
};

const MULE: Build = {
  ...scale(HORSE, 0.86),
  ear: pts([[0.33, -1.0], [0.3, -1.18], [0.37, -1.01]]),
  tail: s => pts([[-0.4, -0.71], [-0.46, -0.66], [-0.5 + s * 0.4, -0.5], [-0.5 + s, -0.4], [-0.53 + s, -0.33], [-0.47 + s, -0.33], [-0.48 + s, -0.4], [-0.47 + s * 0.4, -0.5], [-0.41, -0.65]]),
  span: 1.12,
};

const CAMEL: Build = {
  // A single tall hump, the long back sloping to the tail, the deep chest on its pad, the hind thigh high and lean.
  body: pts([[-0.5, -0.98], [-0.42, -1.06], [-0.26, -1.14], [-0.14, -1.3], [-0.04, -1.38], [0.08, -1.3], [0.18, -1.12], [0.28, -1.06], [0.36, -0.94], [0.36, -0.82], [0.26, -0.72], [0.02, -0.71], [-0.24, -0.74], [-0.4, -0.8], [-0.52, -0.9]]),
  // The neck thick at its root, running forward and down, then up to the small head with its drooping lip.
  neck: pts([[0.2, -1.08], [0.36, -1.02], [0.5, -0.99], [0.6, -1.05], [0.66, -1.18], [0.7, -1.3], [0.76, -1.34], [0.86, -1.31], [0.93, -1.26], [0.945, -1.21], [0.9, -1.18], [0.8, -1.2], [0.72, -1.17], [0.66, -1.05], [0.6, -0.9], [0.48, -0.82], [0.34, -0.8]]),
  nape: { x: 0.32, y: -0.92 },
  ear: pts([[0.7, -1.31], [0.69, -1.38], [0.73, -1.32]]),
  fore: { hip: { x: 0.24, y: -0.8 }, upper: 0.42, lower: 0.42, widths: [0.13, 0.06, 0.042], bend: 1 },
  hind: { hip: { x: -0.38, y: -0.84 }, upper: 0.45, lower: 0.44, widths: [0.16, 0.06, 0.042], bend: -1 },
  stride: 0.24,
  lift: 0.07,
  pace: true,
  seat: { x: -0.05, y: -1.34 },
  bit: { x: 0.92, y: -1.2 },
  tail: s => pts([[-0.5, -0.99], [-0.55, -0.95], [-0.56 + s * 0.5, -0.78], [-0.57 + s, -0.68], [-0.53 + s, -0.68], [-0.53 + s * 0.5, -0.8], [-0.5, -0.94]]),
  span: 1.55,
  saddle: pts([[-0.22, -1.24], [-0.05, -1.4], [0.12, -1.24], [0.08, -1.14], [-0.18, -1.14]]),
  callus: true,
};

const BUILDS: Record<MountKind, Build> = { horse: HORSE, mule: MULE, camel: CAMEL };

/** Where a rider sits or a load is tied, and the mount's mouth, for the reins. */
export interface Saddle {
  x: number;
  y: number;
  bit: P;
}

export function mountWidth(kind: MountKind, figure: number): number {
  return BUILDS[kind].span * figure;
}

/**
 * A mount walking to the right with its feet on `ground`. `phase` advances
 * by 2π per stride; the body rises a little over each planted foot.
 */
export function drawMount(g: G, kind: MountKind, x: number, ground: number, f: number, phase: number, color: number, saddled: boolean): Saddle {
  const b = BUILDS[kind];
  const bob = Math.abs(Math.sin(phase)) * f * 0.012;
  const at = (p: P): P => ({ x: x + p.x * f, y: ground + p.y * f - bob });
  const far = lighten(color, 0.07);
  // Near hind leads, then near fore a quarter stride on (or with it, pacing), then the far pair half a stride on.
  const foreLag = b.pace ? 0 : Math.PI / 2;
  drawLeg(g, b.fore, x, ground, f, bob, phase + Math.PI + foreLag, b, far);
  drawLeg(g, b.hind, x, ground, f, bob, phase + Math.PI, b, far);

  const sway = Math.sin(phase * 0.5) * 0.03;
  blob(g, b.tail(sway).map(at), color);
  blob(g, b.body.map(at), color);
  const nod = Math.sin(phase * 2) * 0.035;
  const nape = at(b.nape);
  blob(g, turn(b.neck.map(at), nape, nod), color);
  blob(g, turn(b.ear.map(at), nape, nod), color, 2);
  if (saddled) blob(g, b.saddle.map(at), lighten(color, 0.1), 2);

  drawLeg(g, b.fore, x, ground, f, bob, phase + foreLag, b, color);
  drawLeg(g, b.hind, x, ground, f, bob, phase, b, color);
  const seat = at(b.seat);
  return { x: seat.x, y: seat.y, bit: turn([at(b.bit)], nape, nod)[0]! };
}

/** One leg: its foot swinging forward and lifting, then planted and sliding back under the body. */
function drawLeg(g: G, leg: Leg, x: number, ground: number, f: number, bob: number, phase: number, b: Build, color: number): void {
  const hip = { x: x + leg.hip.x * f, y: ground + leg.hip.y * f - bob };
  const lift = Math.max(0, Math.cos(phase)) * b.lift * f;
  const foot = { x: hip.x + Math.sin(phase) * b.stride * f, y: ground - lift };
  const knee = joint(hip, foot, leg.upper * f, leg.lower * f, leg.bend);
  const [wHip, wJoint, wLower] = leg.widths.map(w => w * f) as [number, number, number];
  limb(g, hip, knee, wHip, wJoint, color);
  limb(g, knee, foot, wLower, wLower * 0.85, color);
  g.fillStyle(color, 1);
  if (b.callus) {
    // A camel's knee pads, and its broad soft feet.
    g.fillCircle(knee.x, knee.y, wJoint * 0.62);
    g.fillEllipse(foot.x + f * 0.015, foot.y - f * 0.012, f * 0.09, f * 0.035);
  } else {
    // The fetlock and hoof.
    g.fillPoints([
      { x: foot.x - wLower * 0.5, y: foot.y - f * 0.045 },
      { x: foot.x + wLower * 0.6, y: foot.y - f * 0.04 },
      { x: foot.x + wLower * 1.1, y: foot.y },
      { x: foot.x - wLower * 0.6, y: foot.y },
    ], true);
  }
}

/** A build shrunk toward the ground by `s`, for the mule. */
function scale(b: Build, s: number): Build {
  const sp = (p: P): P => ({ x: p.x * s, y: p.y * s });
  const sl = (leg: Leg): Leg => ({ ...leg, hip: sp(leg.hip), upper: leg.upper * s, lower: leg.lower * s, widths: leg.widths.map(w => w * Math.sqrt(s)) as [number, number, number] });
  return {
    ...b,
    body: b.body.map(sp),
    neck: b.neck.map(sp),
    nape: sp(b.nape),
    ear: b.ear.map(sp),
    fore: sl(b.fore),
    hind: sl(b.hind),
    stride: b.stride * s,
    lift: b.lift * s,
    seat: sp(b.seat),
    bit: sp(b.bit),
    saddle: b.saddle.map(sp),
    tail: sway => b.tail(sway).map(sp),
  };
}
