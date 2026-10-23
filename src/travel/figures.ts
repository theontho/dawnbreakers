import type Phaser from 'phaser';

type G = Phaser.GameObjects.Graphics;

export type Headwear = 'turban' | 'kulah' | 'veil';
export type Carrying = 'none' | 'staff' | 'lantern' | 'standard';

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
export interface Hand {
  x: number;
  y: number;
}

/**
 * A traveller on foot in a long qabá and ʿabá, walking to the right: legs
 * swinging under the hem, the cloak flaring behind, the free arm swinging
 * against the stride. Returns the forward hand.
 */
export function drawWalker(g: G, pose: WalkerPose): Hand {
  const { x, ground, f, phase, color } = pose;
  const bob = Math.abs(Math.sin(phase)) * f * 0.018;
  const hipY = ground - f * 0.47 - bob;
  const shoulderY = ground - f * 0.8 - bob;

  g.lineStyle(f * 0.065, color, 1);
  for (const side of [0, Math.PI]) {
    const swing = Math.sin(phase + side) * 0.42;
    const lift = Math.max(0, Math.cos(phase + side)) * f * 0.04;
    g.lineBetween(x, hipY, x + Math.sin(swing) * f * 0.47, ground - lift);
  }

  // The robe, its back hem lifting with each stride.
  const flare = Math.sin(phase * 2) * f * 0.02;
  g.fillStyle(color, 1);
  g.fillPoints([
    { x: x - f * 0.09, y: shoulderY },
    { x: x + f * 0.08, y: shoulderY },
    { x: x + f * 0.13, y: ground - f * 0.2 - bob },
    { x: x - f * 0.2 - flare, y: ground - f * 0.17 - bob },
  ], true);

  const headY = shoulderY - f * 0.1;
  g.fillCircle(x + f * 0.015, headY, f * 0.068);
  switch (pose.headwear) {
    case 'turban':
      g.fillEllipse(x + f * 0.005, headY - f * 0.05, f * 0.17, f * 0.08);
      break;
    case 'kulah':
      g.fillPoints([
        { x: x - f * 0.05, y: headY - f * 0.04 },
        { x: x + f * 0.07, y: headY - f * 0.04 },
        { x: x + f * 0.03, y: headY - f * 0.2 },
        { x: x - f * 0.03, y: headY - f * 0.19 },
      ], true);
      break;
    case 'veil':
      g.fillPoints([
        { x: x - f * 0.03, y: headY - f * 0.1 },
        { x: x + f * 0.08, y: headY - f * 0.02 },
        { x: x + f * 0.1, y: ground - f * 0.3 },
        { x: x - f * 0.22, y: ground - f * 0.22 },
      ], true);
      break;
  }

  const shoulderX = x + f * 0.01;
  const armSwing = -Math.sin(phase) * 0.35;
  g.lineStyle(f * 0.05, color, 1);
  switch (pose.carrying) {
    case 'staff': {
      const hand = { x: x + f * 0.17, y: ground - f * 0.55 - bob };
      g.lineBetween(shoulderX, shoulderY + f * 0.03, hand.x, hand.y);
      const plant = Math.sin(phase) * f * 0.08;
      g.lineStyle(f * 0.022, color, 1);
      g.lineBetween(hand.x + plant * 0.3, hand.y - f * 0.42, hand.x + f * 0.06 + plant, ground);
      return hand;
    }
    case 'lantern': {
      const sway = Math.sin(phase * 2 + 0.6) * f * 0.02;
      const hand = { x: x + f * 0.2, y: ground - f * 0.5 - bob };
      g.lineBetween(shoulderX, shoulderY + f * 0.03, hand.x, hand.y);
      g.lineStyle(Math.max(1, f * 0.008), color, 1);
      g.lineBetween(hand.x, hand.y, hand.x + sway, hand.y + f * 0.06);
      return { x: hand.x + sway, y: hand.y + f * 0.1 };
    }
    default: {
      const hand = { x: shoulderX + Math.sin(armSwing) * f * 0.32, y: shoulderY + Math.cos(armSwing) * f * 0.32 };
      g.lineBetween(shoulderX, shoulderY + f * 0.03, hand.x, hand.y);
      return hand;
    }
  }
}

/** A rider seated astride at `seat`, a leg hanging down the near flank. */
export function drawRider(g: G, seat: Hand, f: number, phase: number, color: number, carrying: Carrying, realMs: number): Hand {
  const sway = Math.sin(phase * 2) * f * 0.008;
  const hipY = seat.y - f * 0.02;
  const shoulderY = hipY - f * 0.32 + sway;
  g.fillStyle(color, 1);
  g.fillPoints([
    { x: seat.x - f * 0.12, y: hipY + f * 0.02 },
    { x: seat.x - f * 0.08, y: shoulderY },
    { x: seat.x + f * 0.07, y: shoulderY },
    { x: seat.x + f * 0.1, y: hipY + f * 0.02 },
  ], true);
  g.lineStyle(f * 0.06, color, 1);
  g.lineBetween(seat.x + f * 0.04, hipY, seat.x + f * 0.1, hipY + f * 0.2);
  g.lineBetween(seat.x + f * 0.1, hipY + f * 0.2, seat.x + f * 0.07, hipY + f * 0.36);
  const headY = shoulderY - f * 0.1;
  g.fillCircle(seat.x + f * 0.01, headY, f * 0.068);
  g.fillEllipse(seat.x, headY - f * 0.05, f * 0.17, f * 0.08);
  const hand = { x: seat.x + f * 0.16, y: hipY - f * 0.1 };
  g.lineStyle(f * 0.05, color, 1);
  g.lineBetween(seat.x, shoulderY + f * 0.03, hand.x, hand.y);
  if (carrying === 'standard') drawStandard(g, hand, f, color, realMs);
  return hand;
}

/** A tall pole with a black banner streaming back in the wind of the march. */
function drawStandard(g: G, hand: Hand, f: number, color: number, realMs: number): void {
  const top = { x: hand.x - f * 0.05, y: hand.y - f * 1.05 };
  g.lineStyle(f * 0.022, color, 1);
  g.lineBetween(hand.x + f * 0.01, hand.y + f * 0.12, top.x, top.y);
  const points: Hand[] = [];
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

/** Two bundles roped over a pack saddle. */
export function drawPack(g: G, seat: Hand, f: number, color: number): void {
  g.fillStyle(color, 1);
  g.fillEllipse(seat.x - f * 0.12, seat.y - f * 0.06, f * 0.26, f * 0.18);
  g.fillEllipse(seat.x + f * 0.1, seat.y - f * 0.05, f * 0.22, f * 0.16);
  g.fillEllipse(seat.x, seat.y - f * 0.17, f * 0.2, f * 0.12);
}

/** A covered kajávih: a curtained box under an arched hood, carried on a camel. */
export function drawLitter(g: G, seat: Hand, f: number, color: number): void {
  g.fillStyle(color, 1);
  g.fillRect(seat.x - f * 0.22, seat.y - f * 0.24, f * 0.44, f * 0.26);
  g.fillEllipse(seat.x, seat.y - f * 0.24, f * 0.5, f * 0.26);
  g.fillRect(seat.x - f * 0.01, seat.y - f * 0.42, f * 0.02, f * 0.06);
}
