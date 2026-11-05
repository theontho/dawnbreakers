import { css, rng } from '../../canvasKit';
import { grain, isAccent, rimPath, sunReach, tone, type DawnPass } from '../../dawnPass';
import { stones } from '../../dawnLand';
import { crown } from '../../dawnShapes';

/**
 * The ground in front of a vista: the open plain, sand, snow, a river that
 * holds the sky and the sun's path, a track running toward the town, and a
 * bank in the foreground to stand on.
 */

/** 0 at `from`, 1 at the bottom of the screen. */
export function nearAt(p: DawnPass, from: number, y: number): number {
  return Math.max(0, Math.min(1, (y - from) / (p.height - from)));
}

/** The plain from `from` to the bottom of the screen, `far` at the back and `near` at the front. */
export function plain(p: DawnPass, from: number, far: number, near: number, seed = 0x91a1): void {
  const { ctx } = p;
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(0, from, 0, p.height);
    g.addColorStop(0, tone(p, far, 1, 0.25));
    g.addColorStop(1, tone(p, near, 0.9, 0));
    ctx.fillStyle = g;
  }
  ctx.fillRect(-2, from - 1, p.width + 4, p.height - from + 2);
  if (!isAccent(p)) grain(p, 0, from, p.width, p.height - from, near, 0.1, seed, 0.8);
}

/** Long low dunes and wind ripples across sand, their crests catching the low sun. */
export function dunes(p: DawnPass, from: number, color: number, seed: number): void {
  const { ctx, k } = p;
  const rand = rng(seed);
  for (let i = 0; i < 7; i++) {
    const y = from + (p.height - from) * ((i + 0.6) / 7) ** 1.5;
    const near = nearAt(p, from, y);
    const amp = (2 + 10 * near) * k;
    const phase = rand() * 10;
    const crest: Array<{ x: number; y: number }> = [];
    for (let x = -8; x <= p.width + 8; x += 6) crest.push({ x, y: y - amp * (0.5 + 0.5 * Math.sin(x * (0.006 + 0.004 * (1 - near)) + phase)) });
    ctx.beginPath();
    crest.forEach((pt, j) => (j === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.lineTo(p.width + 8, y + amp * 2);
    ctx.lineTo(-8, y + amp * 2);
    ctx.closePath();
    if (isAccent(p)) ctx.fillStyle = '#000';
    else {
      const g = ctx.createLinearGradient(0, y - amp, 0, y + amp * 2);
      g.addColorStop(0, tone(p, color, 1.08, 0.2 * (1 - near)));
      g.addColorStop(1, tone(p, color, 0.82, 0.2 * (1 - near)));
      ctx.fillStyle = g;
    }
    ctx.fill();
    rimPath(p, p.sunX, () => crest.forEach((pt, j) => (j === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y))), 0.35 + near * 0.3, 0.1);
  }
}

/** Snow lying over the plain in soft drifts. */
export function snowCover(p: DawnPass, from: number, seed: number): void {
  const { ctx, k } = p;
  plain(p, from, 0xe4e8ee, 0xd8dee6, seed);
  if (isAccent(p)) return;
  const rand = rng(seed);
  for (let i = 0; i < 26; i++) {
    const y = from + (p.height - from) * rand() ** 1.4;
    const near = nearAt(p, from, y);
    const x = rand() * p.width;
    const w = (30 + rand() * 120) * k * (0.3 + near);
    ctx.fillStyle = tone(p, 0xc4ccd8, 1, 0.1);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(x, y, w, (1 + 3 * near) * k, 0, 0, Math.PI);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** Scattered bushes of camel-thorn and tamarisk over open ground. */
export function scrub(p: DawnPass, from: number, count: number, color: number, seed: number): void {
  const { k } = p;
  const rand = rng(seed);
  for (let i = 0; i < count; i++) {
    const y = from + (p.height - from) * rand() ** 1.3;
    const near = nearAt(p, from, y);
    crown(p, { x: rand() * p.width, base: y, r: (1.5 + 6 * near) * k, color, depth: 0.15 * (1 - near), seed: seed + i, trunk: 0.5 * k, rim: 0.3 });
  }
}

export interface RiverSpec {
  /** Far and near banks, as screen y across the middle of the view. */
  far: number;
  near: number;
  seed: number;
  /** How far the banks wander, in unscaled pixels. */
  wander?: number;
}

/** A broad river across the view, holding the colour of the sky and the sun's path on the water. */
export function river(p: DawnPass, r: RiverSpec): { farAt: (x: number) => number; nearAt: (x: number) => number } {
  const { ctx, k } = p;
  const wander = (r.wander ?? 4) * k;
  const farAt = (x: number) => r.far + Math.sin(x * 0.004 + r.seed) * wander;
  const nearBank = (x: number) => r.near + Math.sin(x * 0.003 + r.seed * 2) * wander * 2;
  const trace = (): void => {
    ctx.beginPath();
    ctx.moveTo(-8, farAt(-8));
    for (let x = 0; x <= p.width + 8; x += 8) ctx.lineTo(x, farAt(x));
    for (let x = p.width + 8; x >= -8; x -= 8) ctx.lineTo(x, nearBank(x));
    ctx.closePath();
  };
  trace();
  if (isAccent(p)) ctx.fillStyle = '#000';
  else if (p.mode === 'day') {
    const g = ctx.createLinearGradient(0, r.far, 0, r.near);
    g.addColorStop(0, css(0xb8d8ea));
    g.addColorStop(1, css(0x6a9ab8));
    ctx.fillStyle = g;
  } else {
    const g = ctx.createLinearGradient(0, r.far, 0, r.near);
    g.addColorStop(0, css(0x2c3058));
    g.addColorStop(1, css(0x161a34));
    ctx.fillStyle = g;
  }
  ctx.fill();
  const rand = rng(r.seed);
  ctx.save();
  trace();
  ctx.clip();
  const span = r.near - r.far;
  for (let i = 0; i < p.width / 3; i++) {
    const y = r.far + span * rand() ** 1.3;
    const near = (y - r.far) / span;
    const x = rand() * p.width;
    const len = (3 + rand() * 10) * k * (0.3 + near);
    if (p.mode === 'rim') {
      // The sun's path on the water, narrow at the far bank and widening toward us.
      const half = p.width * (0.03 + 0.08 * near) + 20 * k;
      const on = Math.max(0, 1 - Math.abs(x - p.sunX) / half);
      if (on <= 0) continue;
      ctx.fillStyle = css(0xffc77a, Math.min(1, on * 1.3 * sunReach(p, x)));
      ctx.fillRect(x - len, y, len * 2, (0.8 + near) * k);
    } else if (p.mode !== 'lamp') {
      ctx.fillStyle = p.mode === 'day' ? 'rgba(255,255,255,0.45)' : 'rgba(150,160,220,0.2)';
      ctx.fillRect(x - len / 2, y, len, 0.9 * k);
    }
  }
  ctx.restore();
  return { farAt, nearAt: nearBank };
}

/** A track of trodden earth from the bottom of the screen toward `to`, narrowing with distance. */
export function track(p: DawnPass, fromX: number, to: { x: number; y: number }, color: number, width: number): void {
  const { ctx, k } = p;
  const bottom = p.height + 4;
  const mid = { x: (fromX + to.x) / 2 + (to.x - fromX) * 0.4, y: (bottom + to.y) / 2 };
  const edge = (side: -1 | 1) => {
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24;
      const x = (1 - t) ** 2 * fromX + 2 * (1 - t) * t * mid.x + t * t * to.x;
      const y = (1 - t) ** 2 * bottom + 2 * (1 - t) * t * mid.y + t * t * to.y;
      const w = (width * (1 - t) ** 1.4 + 3) * k;
      pts.push({ x: x + side * w / 2, y });
    }
    return pts;
  };
  const left = edge(-1);
  const right = edge(1).reverse();
  ctx.beginPath();
  [...left, ...right].forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  ctx.closePath();
  ctx.fillStyle = tone(p, color, 1, 0.05);
  ctx.fill();
}

export interface BankSpec {
  color: number;
  /** Height of the bank at the screen's edges, in unscaled pixels. */
  lift: number;
  seed: number;
  /** A gap in the middle where a track or the water runs through, as a fraction of the width. */
  gap?: { at: number; width: number };
  stones?: number;
}

/** A bank of rough ground across the bottom corners, its edge fringed with grass. */
export function bank(p: DawnPass, b: BankSpec): (x: number) => number {
  const { ctx, k } = p;
  const lift = b.lift * k;
  const edge = (x: number): number => {
    const off = b.gap ? Math.max(0, Math.abs(x - b.gap.at * p.width) - b.gap.width * p.width * 0.5) / (p.width * 0.5) : 1;
    return p.height - 4 * k - lift * Math.min(1, off) ** 0.7 + Math.sin(x * 0.05 + b.seed) * 2 * k;
  };
  const points: Array<{ x: number; y: number }> = [];
  for (let x = -4; x <= p.width + 4; x += 4) points.push({ x, y: edge(x) });
  ctx.beginPath();
  ctx.moveTo(-4, p.height + 2);
  points.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.lineTo(p.width + 4, p.height + 2);
  ctx.closePath();
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(0, p.height - lift, 0, p.height);
    g.addColorStop(0, tone(p, b.color, 0.8, 0));
    g.addColorStop(1, tone(p, b.color, 0.55, 0));
    ctx.fillStyle = g;
  }
  ctx.fill();
  const rand = rng(b.seed);
  stones(p, edge, b.stones ?? 7, 16, rand);
  // A fringe of grass along the edge, lit at the tips.
  ctx.lineWidth = 1;
  for (const light of [0.7, 0.95, 1.2]) {
    ctx.strokeStyle = tone(p, b.color, light, 0);
    ctx.beginPath();
    for (const pt of points) {
      if (rand() < 0.35) continue;
      const h = (3 + rand() * 6) * k;
      const bend = (rand() - 0.5) * 4 * k;
      ctx.moveTo(pt.x, pt.y + 2);
      ctx.quadraticCurveTo(pt.x, pt.y - h * 0.5, pt.x + bend, pt.y - h);
    }
    ctx.stroke();
  }
  rimPath(p, p.sunX, () => points.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y))), 0.25);
  return edge;
}
