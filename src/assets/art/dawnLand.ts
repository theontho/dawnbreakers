import { css, rng } from './canvasKit';
import type { DawnLayout } from './dawnLayout';
import { grain, isAccent, rimPath, sunReach, tone, toneColor, type DawnPass } from './dawnPass';
import { crown, cypress } from './dawnShapes';
import { paintRoad, type RoadPath } from './dawnRoad';

/**
 * The land outside the wall: walled gardens of cypress and orange at its
 * foot, a patchwork of wheat, barley, alfalfa and vines running toward the
 * horizon, a stream that holds the colour of the sky, the dusty road up to
 * the gate, and a bank of grass and pomegranate in the foreground.
 */

const CROPS = [0xcdb466, 0x9fa658, 0x6f9646, 0xa88a64, 0xc2a85e, 0x82923f] as const;
const ORCHARD = 0x557a3a;
const BANK = 0x6b6a3e;

export function paintLand(p: DawnPass, L: DawnLayout, road: RoadPath): void {
  ground(p, L);
  fields(p, L);
  gardens(p, L);
  stream(p, L);
  paintRoad(p, L, road, streamY);
  foreground(p, L, road);
}

/** 0 at the wall's foot, 1 at the bottom of the screen. */
export function nearness(L: DawnLayout, y: number): number {
  return Math.max(0, Math.min(1, (y - L.wallBase) / (L.height - L.wallBase)));
}

/** Horizontal scale of the ground plane at a screen row, 1 at the bottom edge. */
function spread(L: DawnLayout, y: number): number {
  return (y - L.horizonY) / (L.height - L.horizonY);
}

function ground(p: DawnPass, L: DawnLayout): void {
  const { ctx } = p;
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(0, L.wallBase, 0, L.height);
    g.addColorStop(0, tone(p, 0xb3a27a, 1, 0.2));
    g.addColorStop(1, tone(p, 0x8a7650, 0.9, 0));
    ctx.fillStyle = g;
  }
  ctx.fillRect(0, L.wallBase - 1, L.width, L.height - L.wallBase + 1);
}

function fields(p: DawnPass, L: DawnLayout): void {
  const { ctx, k } = p;
  const rand = rng(0xf1e1d);
  const rows = 6;
  const span = L.height - L.wallBase;
  for (let i = 0; i < rows; i++) {
    const y0 = L.wallBase + span * (i / rows) ** 1.6;
    const y1 = L.wallBase + span * ((i + 1) / rows) ** 1.6;
    const s0 = spread(L, y0);
    const s1 = spread(L, y1);
    for (let X = -L.width * 1.6 - rand() * L.width * 0.2; X < L.width * 2.6;) {
      const wide = L.width * (0.14 + rand() * 0.22);
      const crop = CROPS[Math.floor(rand() * CROPS.length)]!;
      const kind = rand();
      const corners = [
        { x: p.sunX + (X - p.sunX) * s0, y: y0 },
        { x: p.sunX + (X + wide - p.sunX) * s0, y: y0 },
        { x: p.sunX + (X + wide - p.sunX) * s1, y: y1 },
        { x: p.sunX + (X - p.sunX) * s1, y: y1 },
      ];
      X += wide;
      if (corners[1]!.x < -4 || corners[0]!.x > L.width + 4) continue;
      if (corners[2]!.x < -4 || corners[3]!.x > L.width + 4) continue;
      const depth = 0.18 * (1 - nearness(L, y0));
      const trace = (): void => {
        ctx.beginPath();
        corners.forEach((c, j) => (j === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y)));
        ctx.closePath();
      };
      trace();
      ctx.fillStyle = tone(p, crop, 1, depth);
      ctx.fill();
      if (isAccent(p)) continue;
      ctx.save();
      trace();
      ctx.clip();
      const left = Math.min(corners[0]!.x, corners[3]!.x);
      const right = Math.max(corners[1]!.x, corners[2]!.x);
      grain(p, left, y0, right - left, y1 - y0, crop, depth, Math.round(X * 7 + y0), 1.1);
      // Furrows running to the horizon.
      ctx.strokeStyle = tone(p, crop, 0.78, depth);
      ctx.globalAlpha = 0.45;
      ctx.lineWidth = Math.max(0.6, 1.2 * s1);
      const step = (kind < 0.25 ? 9 : 5) * k;
      ctx.beginPath();
      for (let u = X - wide; u < X; u += step) {
        ctx.moveTo(p.sunX + (u - p.sunX) * s1, y1);
        ctx.lineTo(p.sunX + (u - p.sunX) * s0, y0);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (kind < 0.25) orchardRows(p, L, X - wide, X, y0, y1, Math.round(X + y0));
      ctx.restore();
      // A raised earth bank between plots.
      ctx.strokeStyle = tone(p, 0xc0a47c, 1.08, depth);
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = Math.max(0.8, 1.6 * s1);
      trace();
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

/** Rows of fruit trees or vines standing in a field, shrinking toward the wall. */
function orchardRows(p: DawnPass, L: DawnLayout, X0: number, X1: number, y0: number, y1: number, seed: number): void {
  const { ctx, k } = p;
  const rand = rng(seed);
  for (let y = y1; y > y0; y -= (2.5 + 11 * nearness(L, y)) * k) {
    const s = spread(L, y);
    const near = nearness(L, y);
    const depth = 0.15 * (1 - near);
    const trees: Array<{ x: number; r: number; shade: number }> = [];
    for (let u = X0 + 6 * k; u < X1; u += 15 * k) {
      const x = p.sunX + (u - p.sunX) * s + (rand() - 0.5) * 2 * k * s;
      trees.push({ x, r: (0.7 + 3.4 * near) * k * (0.8 + rand() * 0.4), shade: rand() < 0.5 ? 0 : 1 });
    }
    // Each row in a handful of fills: shadows, two leaf shades, highlights.
    const fill = (style: string, alpha: number, shape: (t: { x: number; r: number }) => void, only?: number): void => {
      ctx.fillStyle = style;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      trees.forEach(t => {
        if (only !== undefined && t.shade !== only) return;
        shape(t);
      });
      ctx.fill();
    };
    fill(tone(p, 0x3a3020, 0.7, depth), 0.45, t => {
      ctx.moveTo(t.x + t.r * 1.4, y);
      ctx.ellipse(t.x + t.r * 0.3, y, t.r * 1.1, t.r * 0.35, 0, 0, Math.PI * 2);
    });
    for (const shade of [0, 1]) {
      fill(tone(p, ORCHARD, 0.82 + shade * 0.18, depth), 1, t => {
        ctx.moveTo(t.x + t.r, y - t.r * 0.8);
        ctx.ellipse(t.x, y - t.r * 0.8, t.r, t.r * 0.85, 0, 0, Math.PI * 2);
      }, shade);
    }
    fill(tone(p, ORCHARD, 1.25, depth), 1, t => {
      ctx.moveTo(t.x + t.r * 0.2, y - t.r * 1.15);
      ctx.ellipse(t.x - t.r * 0.25, y - t.r * 1.15, t.r * 0.45, t.r * 0.35, 0, 0, Math.PI * 2);
    });
    ctx.globalAlpha = 1;
  }
}

/** Walled gardens along the foot of the city wall. */
function gardens(p: DawnPass, L: DawnLayout): void {
  const { ctx, k } = p;
  const rand = rng(0x6a2de7);
  const line = L.wallBase + 12 * k;
  for (let x = -10 * k; x < L.width + 10 * k;) {
    const w = (60 + rand() * 90) * k;
    const nearGate = Math.abs(x + w / 2 - L.gateX) < w / 2 + 34 * k;
    if (!nearGate) {
      // Trees behind the garden wall: orange and pomegranate, with a few
      // cypresses standing up out of them, or now and then a cypress avenue.
      const avenue = rand() < 0.22;
      for (let u = x + 6 * k; u < x + w - 6 * k; u += (avenue ? 10 : 9 + rand() * 9) * k) {
        if (avenue || rand() < 0.16) {
          cypress(p, { x: u, base: line - 1 * k, h: (avenue ? 30 : 22 + rand() * 20) * k, w: 8 * k, depth: 0.06, lean: (rand() - 0.5) * 2 * k, rim: 0.3 });
        } else if (rand() < 0.85) {
          crown(p, { x: u, base: line, r: (5 + rand() * 4) * k, color: rand() < 0.5 ? 0x3f6e38 : ORCHARD, depth: 0.06, seed: Math.round(u * 5), trunk: 3 * k, rim: 0.2 });
        }
      }
      ctx.fillStyle = tone(p, 0xb38e64, 0.92, 0.04);
      ctx.fillRect(x, line - 4 * k, w - 4 * k, 5 * k);
      rimPath(p, x + w / 2, () => {
        ctx.moveTo(x, line - 4 * k);
        ctx.lineTo(x + w - 4 * k, line - 4 * k);
      }, 0.2, 0.04);
    }
    x += w;
  }
}

/** Centre line of the stream at a screen x. */
export function streamY(L: DawnLayout, x: number): number {
  const span = L.height - L.wallBase;
  const u = x / L.width;
  return L.wallBase + span * (0.44 + 0.13 * Math.sin(u * Math.PI * 2.3 + 0.9) + 0.05 * Math.sin(u * Math.PI * 5.1) - 0.1 * u);
}

function streamWidth(L: DawnLayout, x: number, k: number): number {
  return (3 + 12 * nearness(L, streamY(L, x)) ** 1.2) * k;
}

/** A stream across the fields, holding the colour of the sky above it. */
function stream(p: DawnPass, L: DawnLayout): void {
  const { ctx, k } = p;
  const upper: Array<{ x: number; y: number }> = [];
  const lower: Array<{ x: number; y: number }> = [];
  for (let x = -10; x <= L.width + 10; x += 5) {
    const y = streamY(L, x);
    const w = streamWidth(L, x, k);
    upper.push({ x, y: y - w * 0.5 });
    lower.push({ x, y: y + w * 0.5 });
  }
  const trace = (grow: number): void => {
    ctx.beginPath();
    upper.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y - grow) : ctx.lineTo(pt.x, pt.y - grow)));
    for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i]!.x, lower[i]!.y + grow);
    ctx.closePath();
  };
  // Reed-grown banks.
  trace(2.2 * k);
  ctx.fillStyle = tone(p, 0x5f6236, 0.85, 0.08);
  ctx.fill();
  trace(0);
  if (isAccent(p)) ctx.fillStyle = '#000';
  else if (p.mode === 'day') ctx.fillStyle = css(0x9fcbe6);
  else ctx.fillStyle = css(0x232848);
  ctx.fill();
  const rand = rng(0x5e7);
  ctx.save();
  trace(0);
  ctx.clip();
  for (let i = 0; i < L.width / 6; i++) {
    const x = rand() * L.width;
    const y = streamY(L, x) + (rand() - 0.5) * streamWidth(L, x, k) * 0.8;
    const len = (2 + rand() * 6) * k * (0.4 + nearness(L, y));
    if (p.mode === 'rim') {
      // The sun's path glittering on the water.
      const near = Math.max(0, 1 - Math.abs(x - p.sunX) / (L.width * 0.16 + 40 * k));
      if (near <= 0) continue;
      ctx.fillStyle = css(0xffc77a, Math.min(1, near * 1.2 * sunReach(p, x)));
      ctx.fillRect(x - len, y, len * 2, 1.2 * k);
    } else if (p.mode !== 'lamp') {
      ctx.fillStyle = p.mode === 'day' ? 'rgba(255,255,255,0.55)' : 'rgba(150,160,220,0.25)';
      ctx.fillRect(x - len / 2, y, len, 0.9 * k);
    }
  }
  ctx.restore();
}

/** Grass bank, stones and pomegranate bushes at the bottom corners, parted by the road. */
function foreground(p: DawnPass, L: DawnLayout, road: RoadPath): void {
  const { ctx, k } = p;
  const rand = rng(0xb0a7);
  const lift = Math.min(L.height * 0.1, 70 * k);
  const edge = (x: number): number => {
    const gap = Math.abs(x - road.bottomX) - road.bottomWidth * 0.55;
    const t = Math.max(0, gap / (L.width * 0.5));
    return L.height - 6 * k - lift * Math.min(1, t) ** 0.7 + Math.sin(x * 0.05) * 2 * k;
  };
  const points: Array<{ x: number; y: number }> = [];
  for (let x = -4; x <= L.width + 4; x += 4) points.push({ x, y: edge(x) });
  ctx.beginPath();
  ctx.moveTo(-4, L.height + 2);
  points.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.lineTo(L.width + 4, L.height + 2);
  ctx.closePath();
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(0, L.height - lift, 0, L.height);
    g.addColorStop(0, tone(p, BANK, 0.8, 0));
    g.addColorStop(1, tone(p, BANK, 0.55, 0));
    ctx.fillStyle = g;
  }
  ctx.fill();
  if (!isAccent(p)) {
    ctx.save();
    ctx.clip();
    grain(p, 0, L.height - lift - 4, L.width, lift + 4, BANK, 0, 0x6b, 1.4);
    ctx.restore();
  }
  stones(p, edge, 9, 18, rand);
  grass(p, points, rand);
  for (const [x, r] of [[L.width * 0.03, 26], [L.width * 0.97, 22]] as const) {
    pomegranate(p, x, edge(x) + 14 * k, r * k, Math.round(x));
  }
}

/** Stones half sunk in the grass below a bank's edge, `spread` unscaled pixels deep. */
export function stones(p: DawnPass, edge: (x: number) => number, count: number, spread: number, rand: () => number): void {
  const { ctx, k } = p;
  for (let i = 0; i < count; i++) {
    const x = rand() * p.width;
    const y = edge(x) + (4 + rand() * spread) * k;
    if (y > p.height) continue;
    const r = (2 + rand() * 4) * k;
    ctx.fillStyle = tone(p, 0x8a8070, 0.8, 0);
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.4, r, 0, Math.PI, 0);
    ctx.fill();
    rimPath(p, x, () => ctx.ellipse(x, y, r * 1.4, r, 0, Math.PI * 1.15, Math.PI * 1.85), 0.5);
  }
}

interface Blade {
  x: number;
  y: number;
  h: number;
  bend: number;
}

/** Blades along the bank's edge, stroked in a few shades and lit at the tips. */
function grass(p: DawnPass, edge: ReadonlyArray<{ x: number; y: number }>, rand: () => number): void {
  const { ctx, k } = p;
  const shades: Blade[][] = [[], [], []];
  const tips: Blade[] = [];
  for (const pt of edge) {
    for (let j = 0; j < 3; j++) {
      const blade = { x: pt.x + rand() * 4, y: pt.y, h: (3 + rand() * 7) * k, bend: (rand() - 0.5) * 4 * k };
      shades[Math.floor(rand() * shades.length)]!.push(blade);
      if (rand() < 0.3) tips.push(blade);
    }
  }
  ctx.lineWidth = 1;
  shades.forEach((blades, i) => {
    ctx.strokeStyle = tone(p, BANK, 0.7 + i * 0.2, 0);
    ctx.beginPath();
    for (const b of blades) {
      ctx.moveTo(b.x, b.y + 2);
      ctx.quadraticCurveTo(b.x, b.y - b.h * 0.5, b.x + b.bend, b.y - b.h);
    }
    ctx.stroke();
  });
  for (let i = 0; i < tips.length; i += 10) {
    const run = tips.slice(i, i + 10);
    rimPath(p, run[0]!.x, () => run.forEach(b => {
      ctx.moveTo(b.x + b.bend * 0.5, b.y - b.h * 0.6);
      ctx.quadraticCurveTo(b.x + b.bend * 0.8, b.y - b.h * 0.8, b.x + b.bend, b.y - b.h);
    }), 0.35);
  }
}

/** A pomegranate bush in May, many-stemmed, its leaves dark and its flowers scarlet. */
function pomegranate(p: DawnPass, x: number, base: number, r: number, seed: number): void {
  const { ctx, k } = p;
  const clumps = [[-0.7, 0.75, 0.12], [0.65, 0.7, 0.1], [0, 1, 0.25]] as const;
  for (const [dx, scale, trunk] of clumps) {
    crown(p, { x: x + dx * r, base, r: r * scale, color: 0x3e5e30, depth: 0, seed: seed + Math.round(dx * 10), trunk: r * trunk, rim: 0.35 });
  }
  if (isAccent(p)) return;
  const rand = rng(seed + 1);
  const flower = toneColor(p, 0xd8402a, 1, 0);
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * r * 1.1;
    ctx.fillStyle = css(flower, 0.9);
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * d * 1.3, base - r * 1.2 + Math.sin(a) * d * 0.6, 1.5 * k, 0, Math.PI * 2);
    ctx.fill();
  }
}
