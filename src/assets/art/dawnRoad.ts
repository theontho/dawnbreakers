import { rng } from './canvasKit';
import type { DawnLayout } from './dawnLayout';
import { grain, isAccent, rimPath, tone, type DawnPass } from './dawnPass';
import { archPath } from './ornaments';

/**
 * The dusty road that winds out of the foreground, over a little brick
 * bridge across the stream, and up to the city gate.
 */

export interface RoadPath {
  /** Centre line from the bottom of the screen up to the gate, with the road's width there. */
  points: ReadonlyArray<{ x: number; y: number; w: number }>;
  bottomX: number;
  bottomWidth: number;
}

const DUST = 0xd2b98e;
const BRICK = 0xb07a50;

export function roadPath(L: DawnLayout): RoadPath {
  const { k } = L;
  const span = L.height - L.wallBase;
  const bottomX = L.width * 0.58;
  const bottomWidth = Math.max(80 * k, L.width * 0.15);
  const gateWidth = 26 * k;
  const p0 = { x: bottomX, y: L.height + 4 };
  const p1 = { x: L.width * 0.36, y: L.height - span * 0.5 };
  const p2 = { x: L.gateX + L.width * 0.2, y: L.wallBase + span * 0.32 };
  const p3 = { x: L.gateX, y: L.wallBase };
  const points: Array<{ x: number; y: number; w: number }> = [];
  for (let i = 0; i <= 64; i++) {
    const t = i / 64;
    const u = 1 - t;
    const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
    const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
    const n = Math.max(0, Math.min(1, (y - L.wallBase) / span));
    points.push({ x, y, w: gateWidth + (bottomWidth - gateWidth) * n ** 1.25 });
  }
  return { points, bottomX, bottomWidth };
}

export function paintRoad(p: DawnPass, L: DawnLayout, road: RoadPath, streamY: (L: DawnLayout, x: number) => number): void {
  const { ctx, k } = p;
  const pts = road.points;
  const edge = (side: number, inset = 0): Array<{ x: number; y: number }> => pts.map(pt => ({ x: pt.x + side * (pt.w / 2 - inset * pt.w), y: pt.y }));
  const trace = (inset: number): void => {
    const left = edge(-1, inset);
    const right = edge(1, inset);
    ctx.beginPath();
    left.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i]!.x, right[i]!.y);
    ctx.closePath();
  };
  // Trampled verge, then the pale dust of the road itself.
  trace(-0.08);
  ctx.fillStyle = tone(p, 0xa48f68, 0.95, 0.05);
  ctx.fill();
  trace(0);
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(0, L.wallBase, 0, L.height);
    g.addColorStop(0, tone(p, DUST, 1.04, 0.12));
    g.addColorStop(1, tone(p, DUST, 0.92, 0));
    ctx.fillStyle = g;
  }
  ctx.fill();
  if (!isAccent(p)) {
    ctx.save();
    trace(0);
    ctx.clip();
    grain(p, 0, L.wallBase, L.width, L.height - L.wallBase, DUST, 0.05, 0xd057, 1.2);
    // Cart ruts and the line worn by mules down the middle.
    ctx.lineWidth = 1.2 * k;
    for (const [inset, alpha] of [[0.2, 0.5], [0.8, 0.5], [0.5, 0.25]] as const) {
      ctx.strokeStyle = tone(p, DUST, 0.7, 0.05);
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      pts.forEach((pt, i) => {
        const x = pt.x - pt.w / 2 + pt.w * inset;
        if (i === 0) ctx.moveTo(x, pt.y);
        else ctx.lineTo(x, pt.y);
      });
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  // Dust on the road's crown catching the low sun.
  rimPath(p, L.gateX, () => {
    edge(1, 0.02).forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
  }, 0.25, 0.05);
  bridge(p, L, road, streamY);
}

/** Where the road crosses the stream: a humped brick bridge with one pointed arch. */
function bridge(p: DawnPass, L: DawnLayout, road: RoadPath, streamY: (L: DawnLayout, x: number) => number): void {
  const { ctx, k } = p;
  const pts = road.points;
  let at = -1;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!.y - streamY(L, pts[i - 1]!.x);
    const b = pts[i]!.y - streamY(L, pts[i]!.x);
    if (a > 0 && b <= 0) {
      at = i;
      break;
    }
  }
  if (at < 0) return;
  const c = pts[at]!;
  const n = Math.max(0, Math.min(1, (c.y - L.wallBase) / (L.height - L.wallBase)));
  const half = c.w / 2 + 4 * k;
  const faceH = (5 + 9 * n) * k;
  const top = c.y - faceH * 0.15;
  const hump = (2 + 3 * n) * k;
  const deck = (): void => {
    ctx.moveTo(c.x - half, top + faceH);
    ctx.lineTo(c.x - half, top);
    ctx.quadraticCurveTo(c.x, top - hump * 2, c.x + half, top);
    ctx.lineTo(c.x + half, top + faceH);
    ctx.closePath();
  };
  ctx.beginPath();
  deck();
  ctx.fillStyle = tone(p, BRICK, 0.9, 0.04);
  ctx.fill();
  if (!isAccent(p)) {
    ctx.save();
    ctx.beginPath();
    deck();
    ctx.clip();
    // Brick courses.
    const rand = rng(Math.round(c.x));
    ctx.fillStyle = tone(p, BRICK, 0.7, 0.04);
    for (let y = top - hump; y < top + faceH; y += 2.4 * k) {
      ctx.fillRect(c.x - half, y, half * 2, 0.6);
      for (let x = c.x - half + rand() * 4 * k; x < c.x + half; x += 5 * k) ctx.fillRect(x, y, 0.6, 2.4 * k);
    }
    ctx.restore();
  }
  const archW = half * 0.9;
  archPath(ctx, c.x - archW / 2, top + faceH, archW, faceH * 0.85);
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, 0x1a1a24, 1, 0.04);
  ctx.fill();
  rimPath(p, c.x, () => {
    ctx.moveTo(c.x - half, top);
    ctx.quadraticCurveTo(c.x, top - hump * 2, c.x + half, top);
  }, 0.8, 0.04);
}
