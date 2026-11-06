import type { Saddle } from './mounts';
import { blob, joint, lighten, limb, type G, type P } from './silhouette';

export type Headwear = 'turban' | 'kulah' | 'veil';
export type Carrying = 'none' | 'staff' | 'lantern' | 'standard';

/**
 * The people of the road in silhouette, walking or riding to the right:
 * a long qabá to the ankles under an ʿabá thrown over the shoulders and
 * flaring behind, shoes peeping under the hem, a bearded face in profile
 * under a wound turban or a tall lambskin kuláh, or a woman wrapped in her
 * chádur. Sizes are in standing-person heights, `f`; the far arm and leg
 * are a shade lighter than the near ones.
 */

export interface WalkerPose {
  x: number;
  ground: number;
  /** A standing person's height in pixels. */
  f: number;
  /** Advances by 2π per pair of steps. */
  phase: number;
  color: number;
  headwear: Headwear;
  carrying: Carrying;
  realMs: number;
}

/** Where a lantern hangs, so the caller can set its glow. */
export type Hand = P;

/** A traveller on foot. Returns the forward hand. */
export function drawWalker(g: G, pose: WalkerPose): Hand {
  const { x, ground, f, phase, color } = pose;
  const bob = Math.abs(Math.sin(phase)) * f * 0.018;
  const at = (px: number, py: number): P => ({ x: x + px * f, y: ground + py * f - bob });
  const far = lighten(color, 0.07);
  const veiled = pose.headwear === 'veil';

  drawArm(g, at(-0.01, -0.77), f, -Math.sin(phase) * 0.3, far);
  // Legs on two bones, the knee folding forward as each foot swings through.
  for (const side of [Math.PI, 0]) {
    const s = phase + side;
    const hip = at(0, -0.47);
    const foot = { x: hip.x + Math.sin(s) * f * 0.2, y: ground - Math.max(0, Math.cos(s)) * f * 0.05 };
    const knee = joint(hip, foot, f * 0.25, f * 0.245, 1);
    const shade = side === 0 ? color : far;
    limb(g, hip, knee, f * 0.075, f * 0.055, shade);
    limb(g, knee, foot, f * 0.05, f * 0.038, shade);
    // A pointed shoe.
    g.fillStyle(shade, 1);
    g.fillPoints([{ x: foot.x - f * 0.03, y: foot.y }, { x: foot.x + f * 0.075, y: foot.y }, { x: foot.x + f * 0.02, y: foot.y - f * 0.035 }, { x: foot.x - f * 0.025, y: foot.y - f * 0.03 }], true);
  }

  // The hem swings with the near leg and the cloak flares behind.
  const swing = Math.sin(phase) * 0.03;
  const flare = (0.5 + 0.5 * Math.sin(phase * 2)) * 0.03;
  blob(g, [at(0.06, -0.8), at(0.1, -0.69), at(0.09, -0.52), at(0.13 + swing, -0.09), at(0.02, -0.075), at(-0.12 - flare, -0.09), at(-0.1, -0.5), at(-0.08, -0.78)], lighten(color, 0.05));
  if (veiled) {
    // The chádur, from the crown of the head to the ankles, held closed in front.
    blob(g, [at(0.02, -0.995), at(0.075, -0.95), at(0.095, -0.86), at(0.105, -0.6), at(0.145 + swing, -0.085), at(0, -0.07), at(-0.17 - flare * 1.4, -0.085), at(-0.13, -0.6), at(-0.075, -0.92)], color);
  } else {
    // The ʿabá over the shoulders, open at the front.
    blob(g, [at(0.05, -0.83), at(-0.05, -0.845), at(-0.12, -0.75), at(-0.16 - flare * 1.3, -0.32), at(-0.185 - flare * 1.6, -0.14), at(-0.06, -0.155), at(0, -0.4), at(0.045, -0.62)], color);
  }
  drawHead(g, at(0.02, -0.89), f, color, pose.headwear);

  const shoulder = at(0, -0.77);
  switch (pose.carrying) {
    case 'staff': {
      const hand = at(0.17, -0.55);
      drawArmTo(g, shoulder, hand, f, color);
      const plant = Math.sin(phase) * f * 0.08;
      g.lineStyle(f * 0.022, color, 1);
      g.lineBetween(hand.x + plant * 0.3, hand.y - f * 0.42, hand.x + f * 0.06 + plant, ground);
      return hand;
    }
    case 'lantern': {
      const sway = Math.sin(phase * 2 + 0.6) * f * 0.02;
      const hand = at(0.2, -0.5);
      drawArmTo(g, shoulder, hand, f, color);
      g.lineStyle(Math.max(1, f * 0.008), color, 1);
      g.lineBetween(hand.x, hand.y, hand.x + sway, hand.y + f * 0.06);
      // The lantern's cage, a pierced brass cylinder with a domed cap.
      g.fillStyle(color, 1);
      g.fillRect(hand.x + sway - f * 0.028, hand.y + f * 0.06, f * 0.056, f * 0.08);
      g.fillTriangle(hand.x + sway - f * 0.034, hand.y + f * 0.062, hand.x + sway + f * 0.034, hand.y + f * 0.062, hand.x + sway, hand.y + f * 0.035);
      return { x: hand.x + sway, y: hand.y + f * 0.1 };
    }
    default:
      return drawArm(g, shoulder, f, Math.sin(phase) * 0.3, color);
  }
}

/** A rider seated astride at `seat`, the near leg down the flank, the reins in hand. */
export function drawRider(g: G, seat: Saddle, f: number, phase: number, color: number, carrying: Carrying, realMs: number): Hand {
  const sway = Math.sin(phase * 2) * 0.008;
  const at = (px: number, py: number): P => ({ x: seat.x + (px + sway * (py < -0.1 ? 1 : 0)) * f, y: seat.y + py * f });
  const far = lighten(color, 0.07);
  drawArmTo(g, at(-0.01, -0.27), at(0.13, -0.1), f, far);
  // The cloak streaming back, the torso upright, the skirt of the qabá over the thigh.
  blob(g, [at(0.04, -0.33), at(-0.08, -0.32), at(-0.15, -0.12), at(-0.18, 0.08), at(-0.04, 0.03)], color);
  blob(g, [at(-0.075, 0), at(-0.065, -0.3), at(0.055, -0.31), at(0.09, -0.16), at(0.085, 0)], lighten(color, 0.05));
  // The near leg in a shade lighter than the beast, so it reads against the flank it hangs down.
  const clothes = lighten(color, 0.08);
  const knee = at(0.15, 0.16);
  const ankle = at(0.1, 0.4);
  limb(g, at(0, 0), knee, f * 0.085, f * 0.06, clothes);
  limb(g, knee, ankle, f * 0.05, f * 0.04, clothes);
  g.fillStyle(clothes, 1);
  g.fillPoints([{ x: ankle.x - f * 0.02, y: ankle.y + f * 0.01 }, { x: ankle.x + f * 0.07, y: ankle.y + f * 0.012 }, { x: ankle.x + f * 0.02, y: ankle.y - f * 0.025 }], true);
  blob(g, [at(-0.11, -0.02), at(0.12, -0.03), at(0.2, 0.18), at(0.04, 0.24), at(-0.08, 0.16)], clothes, 3);
  drawHead(g, at(0.01, -0.39), f, color, 'turban');
  if (carrying === 'standard') {
    const hand = at(0.14, -0.14);
    drawArmTo(g, at(0, -0.27), hand, f, color);
    drawStandard(g, hand, f, color, realMs);
    return hand;
  }
  const hand = at(0.17, -0.1);
  drawArmTo(g, at(0, -0.27), hand, f, color);
  // The reins, slack in a shallow curve down to the bit.
  g.lineStyle(Math.max(1, f * 0.008), color, 1);
  const mid = { x: (hand.x + seat.bit.x) / 2, y: Math.max(hand.y, seat.bit.y) + f * 0.05 };
  g.beginPath();
  g.moveTo(hand.x, hand.y);
  g.lineTo(mid.x, mid.y);
  g.lineTo(seat.bit.x, seat.bit.y);
  g.strokePath();
  return hand;
}

/** A head in profile: the nose, a beard unless veiled, and what is worn on it. */
function drawHead(g: G, c: P, f: number, color: number, headwear: Headwear): void {
  const at = (px: number, py: number): P => ({ x: c.x + px * f, y: c.y + py * f });
  limb(g, at(-0.02, 0.09), at(0, 0.03), f * 0.05, f * 0.045, color);
  g.fillStyle(color, 1);
  g.fillCircle(c.x, c.y, f * 0.058);
  g.fillTriangle(c.x + f * 0.045, c.y - f * 0.015, c.x + f * 0.072, c.y + f * 0.012, c.x + f * 0.045, c.y + f * 0.025);
  if (headwear === 'veil') return;
  blob(g, [at(0.05, 0.02), at(0.055, 0.06), at(0.02, 0.1), at(-0.02, 0.06)], color, 3);
  if (headwear === 'turban') {
    blob(g, [at(-0.065, -0.005), at(-0.075, -0.05), at(-0.035, -0.095), at(0.025, -0.105), at(0.07, -0.07), at(0.065, -0.02), at(0, -0.02)], color, 3);
    // The folds of the cloth, catching a little light.
    g.lineStyle(Math.max(1, f * 0.007), lighten(color, 0.14), 1);
    g.lineBetween(c.x - f * 0.06, c.y - f * 0.03, c.x + f * 0.055, c.y - f * 0.06);
    g.lineBetween(c.x - f * 0.05, c.y - f * 0.065, c.x + f * 0.035, c.y - f * 0.09);
  } else {
    blob(g, [at(-0.058, -0.025), at(0.062, -0.03), at(0.055, -0.18), at(-0.04, -0.19)], color, 2);
  }
}

/** A sleeved arm hanging from `shoulder`, swung `swing` radians forward. Returns the hand. */
function drawArm(g: G, shoulder: P, f: number, swing: number, color: number): Hand {
  const hand = { x: shoulder.x + Math.sin(swing) * f * 0.31, y: shoulder.y + Math.cos(swing) * f * 0.31 };
  return drawArmTo(g, shoulder, hand, f, color);
}

/** An arm from `shoulder` to `hand`, the elbow bending back. */
function drawArmTo(g: G, shoulder: P, hand: P, f: number, color: number): Hand {
  const elbow = joint(shoulder, hand, f * 0.17, f * 0.165, -1);
  limb(g, shoulder, elbow, f * 0.065, f * 0.05, color);
  limb(g, elbow, hand, f * 0.052, f * 0.04, color);
  g.fillStyle(color, 1);
  g.fillCircle(hand.x, hand.y, f * 0.024);
  return hand;
}

/** A tall pole with a black banner streaming back in the wind of the march. */
function drawStandard(g: G, hand: Hand, f: number, color: number, realMs: number): void {
  const top = { x: hand.x - f * 0.05, y: hand.y - f * 1.05 };
  g.lineStyle(f * 0.022, color, 1);
  g.lineBetween(hand.x + f * 0.01, hand.y + f * 0.12, top.x, top.y);
  g.fillStyle(color, 1);
  g.fillCircle(top.x, top.y - f * 0.015, f * 0.018);
  const points: P[] = [];
  const length = f * 0.55;
  const depth = f * 0.32;
  for (let i = 0; i <= 10; i += 1) {
    const t = i / 10;
    points.push({ x: top.x - length * t, y: top.y + f * 0.02 + Math.sin(realMs * 0.006 - t * 5) * f * 0.03 * t });
  }
  for (let i = 10; i >= 0; i -= 1) {
    const t = i / 10;
    points.push({ x: top.x - length * t, y: top.y + depth + Math.sin(realMs * 0.006 - t * 5 + 0.4) * f * 0.035 * t - t * f * 0.04 });
  }
  g.fillStyle(0x020203, 1);
  g.fillPoints(points, true);
}

/** Bundles roped over a pack saddle, the ropes a shade paler. */
export function drawPack(g: G, seat: Saddle, f: number, color: number): void {
  const at = (px: number, py: number): P => ({ x: seat.x + px * f, y: seat.y + py * f });
  blob(g, [at(-0.26, 0.02), at(-0.24, -0.14), at(-0.04, -0.15), at(-0.02, 0.08), at(-0.2, 0.12)], color, 3);
  blob(g, [at(0.0, 0.06), at(0.0, -0.13), at(0.2, -0.12), at(0.21, 0.04), at(0.1, 0.1)], color, 3);
  blob(g, [at(-0.15, -0.13), at(-0.12, -0.25), at(0.08, -0.26), at(0.12, -0.13)], color, 3);
  g.lineStyle(Math.max(1, f * 0.01), lighten(color, 0.14), 1);
  g.lineBetween(seat.x - f * 0.14, seat.y - f * 0.15, seat.x - f * 0.14, seat.y + f * 0.1);
  g.lineBetween(seat.x + f * 0.1, seat.y - f * 0.13, seat.x + f * 0.1, seat.y + f * 0.07);
  g.lineBetween(seat.x - f * 0.12, seat.y - f * 0.2, seat.x + f * 0.1, seat.y - f * 0.2);
}

/** A covered kajávih on a camel: a curtained box under an arched hood, fringed along its foot. */
export function drawLitter(g: G, seat: Saddle, f: number, color: number): void {
  const at = (px: number, py: number): P => ({ x: seat.x + px * f, y: seat.y + py * f });
  blob(g, [at(-0.25, 0.04), at(0.25, 0.04), at(0.26, -0.2), at(0.17, -0.34), at(0, -0.4), at(-0.17, -0.34), at(-0.26, -0.2)], color, 3);
  g.fillStyle(color, 1);
  g.fillRect(seat.x - f * 0.012, seat.y - f * 0.47, f * 0.024, f * 0.08);
  g.fillCircle(seat.x, seat.y - f * 0.48, f * 0.02);
  g.lineStyle(Math.max(1, f * 0.008), lighten(color, 0.14), 1);
  for (const u of [-0.12, 0, 0.12]) g.lineBetween(seat.x + u * f, seat.y - f * 0.3, seat.x + u * f, seat.y + f * 0.02);
  for (let u = -0.24; u <= 0.24; u += 0.04) g.fillCircle(seat.x + u * f, seat.y + f * 0.06, f * 0.012);
}
