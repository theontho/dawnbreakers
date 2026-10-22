import { css, mix, rng, shade, type Ctx } from './canvasKit';

/**
 * Woodland vocabulary for free-standing props: elliptical foliage crowns
 * that mix several leaf colours (autumn woods are never one green), trunks,
 * fern fronds, lichen-spotted boulders and the soft contact shadows that
 * seat a prop on its cell.
 */

/** Soft elliptical shadow under a prop. */
export function contactShadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, alpha = 0.28): void {
  ctx.save();
  ctx.filter = 'blur(2px)';
  ctx.fillStyle = `rgba(10,6,3,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export interface CrownStyle {
  leaves: readonly number[];
  seed: number;
  /** Number of foliage masses. */
  masses?: number;
  /** Berry or fruit dots. */
  berries?: number;
}

/** A foliage crown filling an ellipse, each mass lit from the upper left. */
export function crown(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, style: CrownStyle): void {
  const rand = rng(style.seed);
  const pick = () => style.leaves[Math.floor(rand() * style.leaves.length)]!;
  const masses: Array<{ x: number; y: number; r: number; c: number }> = [];
  const count = style.masses ?? 11;
  const unit = Math.min(rx, ry);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 0.62;
    masses.push({ x: cx + Math.cos(a) * rx * d, y: cy + Math.sin(a) * ry * d, r: unit * (0.38 + rand() * 0.22), c: pick() });
  }
  masses.sort((a, b) => a.y - b.y);
  const deep = mix(style.leaves[0]!, 0x0a1408, 0.55);
  ctx.fillStyle = css(deep);
  for (const m of masses) {
    ctx.beginPath();
    ctx.arc(m.x + 1.5, m.y + 2, m.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const m of masses) {
    const g = ctx.createRadialGradient(m.x - m.r * 0.45, m.y - m.r * 0.5, m.r * 0.1, m.x, m.y, m.r);
    g.addColorStop(0, css(shade(m.c, 1.35)));
    g.addColorStop(0.6, css(m.c));
    g.addColorStop(1, css(shade(m.c, 0.68)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Leaf flecks break the outline and catch the light.
  for (let i = 0; i < (rx + ry) * 2.5; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 1.02;
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    const lit = (x - cx) / rx + (y - cy) / ry < -0.1;
    ctx.fillStyle = css(shade(pick(), lit ? 1.5 : 0.6), 0.85);
    ctx.fillRect(x, y, 1.6, 1.2);
  }
  if (style.berries !== undefined) {
    for (let i = 0; i < 7; i++) {
      const a = rand() * Math.PI * 2;
      const d = 0.3 + rand() * 0.6;
      ctx.fillStyle = css(style.berries);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,230,210,0.6)';
      ctx.fillRect(cx + Math.cos(a) * rx * d - 0.6, cy + Math.sin(a) * ry * d - 0.8, 0.8, 0.8);
    }
  }
}

/** A tapering trunk from the ground up to `topY`, with an optional pale bark. */
export function trunk(ctx: Ctx, x: number, ground: number, topY: number, width: number, bark: number, lean = 0): void {
  const g = ctx.createLinearGradient(x - width, 0, x + width, 0);
  g.addColorStop(0, css(shade(bark, 1.3)));
  g.addColorStop(0.45, css(bark));
  g.addColorStop(1, css(shade(bark, 0.5)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x - width * 0.75, ground);
  ctx.quadraticCurveTo(x - width * 0.45, ground - 3, x - width * 0.4 + lean, topY);
  ctx.lineTo(x + width * 0.4 + lean, topY);
  ctx.quadraticCurveTo(x + width * 0.45, ground - 3, x + width * 0.8, ground);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,4,0.5)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
}

/** A limb drawn as a tapering stroke. */
export function limb(ctx: Ctx, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, width: number, bark: number): void {
  ctx.strokeStyle = css(bark);
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(cx, cy, x1, y1);
  ctx.stroke();
}

/** One fern frond: a curved spine with paired leaflets shrinking to the tip. */
export function frond(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, bend: number, color: number): void {
  const mx = (x0 + x1) / 2 + bend;
  const my = (y0 + y1) / 2 - Math.abs(bend) * 0.6;
  const point = (t: number) => ({
    x: (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1,
    y: (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1,
  });
  ctx.strokeStyle = css(shade(color, 0.7));
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(mx, my, x1, y1);
  ctx.stroke();
  for (let t = 0.15; t < 0.98; t += 0.09) {
    const p = point(t);
    const q = point(Math.min(1, t + 0.02));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const len = 5.5 * (1 - t) + 1.2;
    for (const side of [-1, 1]) {
      const a = ang + side * 1.1;
      const lit = side < 0;
      ctx.strokeStyle = css(shade(color, lit ? 1.25 : 0.85));
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a) * len, p.y + Math.sin(a) * len);
      ctx.stroke();
    }
  }
}

/** Irregular boulder seated on the ground, lit from the upper left. */
export function boulder(ctx: Ctx, cx: number, ground: number, rx: number, h: number, color: number, seed: number): void {
  const rand = rng(seed);
  const pts: Array<{ x: number; y: number }> = [];
  const n = 9;
  for (let i = 0; i < n; i++) {
    const a = Math.PI + (i / (n - 1)) * Math.PI;
    const k = 0.82 + rand() * 0.22;
    pts.push({ x: cx + Math.cos(a) * rx * k, y: ground - rx * 0.18 + Math.sin(a) * h * k });
  }
  ctx.beginPath();
  ctx.moveTo(cx - rx, ground - rx * 0.18);
  for (const p of pts) ctx.lineTo(p.x, p.y);
  ctx.quadraticCurveTo(cx + rx * 0.7, ground + rx * 0.3, cx, ground + rx * 0.22);
  ctx.quadraticCurveTo(cx - rx * 0.8, ground + rx * 0.2, cx - rx, ground - rx * 0.18);
  ctx.closePath();
  const g = ctx.createLinearGradient(cx - rx, ground - h, cx + rx * 0.8, ground);
  g.addColorStop(0, css(shade(color, 1.35)));
  g.addColorStop(0.5, css(color));
  g.addColorStop(1, css(shade(color, 0.5)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  // Facets and pits.
  for (let i = 0; i < rx * 1.6; i++) {
    const x = cx - rx + rand() * rx * 2;
    const y = ground - h + rand() * (h + rx * 0.2);
    ctx.fillStyle = css(rand() < 0.5 ? shade(color, 0.7) : shade(color, 1.25), 0.4);
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.strokeStyle = css(shade(color, 0.6), 0.5);
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(cx - rx * 0.2, ground - h * 0.95);
  ctx.lineTo(cx + rx * 0.1, ground - h * 0.4);
  ctx.lineTo(cx + rx * 0.6, ground - h * 0.1);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,14,8,0.65)';
  ctx.lineWidth = 0.9;
  ctx.stroke();
}

/** Cushions of moss on whatever lies beneath, densest where it is lit. */
export function moss(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, seed: number, color = 0x4f7a3a): void {
  const rand = rng(seed);
  for (let i = 0; i < rx * ry * 0.5; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand());
    const x = cx + Math.cos(a) * rx * d;
    const y = cy + Math.sin(a) * ry * d;
    ctx.fillStyle = css(shade(color, 0.8 + rand() * 0.6), 0.9);
    ctx.fillRect(x, y, 1.5, 1.2);
  }
}
