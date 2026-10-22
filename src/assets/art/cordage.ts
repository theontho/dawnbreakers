import { css, shade, type Ctx } from './canvasKit';

/**
 * Rope and iron chain. Both follow a path of screen points; rope is a
 * twisted strand, chain alternates links seen face-on and edge-on so it
 * reads as heavy forged iron even at a few pixels across.
 */

export interface Pt {
  x: number;
  y: number;
}

const ROPE = 0xc8ac78;
const IRON = 0x3a3a3c;

/** Points along a quadratic curve from `a` to `b` sagging by `sag` pixels. */
export function sagPath(a: Pt, b: Pt, sag: number, steps = 16): Pt[] {
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2 + sag * 2;
  const out: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    out.push({
      x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * cx + t * t * b.x,
      y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * cy + t * t * b.y,
    });
  }
  return out;
}

/** An elliptical spiral of `turns` loops, outermost first, for coils. */
export function coilPath(cx: number, cy: number, rx: number, ry: number, turns: number, inner = 0.35): Pt[] {
  const out: Pt[] = [];
  const steps = Math.round(turns * 28);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const k = 1 - (1 - inner) * t;
    out.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k - t * ry * 0.6 });
  }
  return out;
}

/** A twisted rope along `path`. */
export function rope(ctx: Ctx, path: readonly Pt[], width = 2.4, color = ROPE): void {
  if (path.length < 2) return;
  const trace = () => {
    ctx.beginPath();
    path.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  };
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = css(shade(color, 0.45));
  ctx.lineWidth = width + 1;
  trace();
  ctx.stroke();
  ctx.strokeStyle = css(color);
  ctx.lineWidth = width;
  trace();
  ctx.stroke();
  // The lay of the strands: short diagonal ticks along the rope.
  ctx.strokeStyle = css(shade(color, 0.6), 0.9);
  ctx.lineWidth = 0.6;
  let carry = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const ux = (b.x - a.x) / (len || 1);
    const uy = (b.y - a.y) / (len || 1);
    let s = carry;
    for (; s < len; s += 2.2) {
      const x = a.x + ux * s;
      const y = a.y + uy * s;
      const h = width * 0.5;
      ctx.beginPath();
      ctx.moveTo(x - uy * h - ux * 0.8, y + ux * h - uy * 0.8);
      ctx.lineTo(x + uy * h + ux * 0.8, y - ux * h + uy * 0.8);
      ctx.stroke();
    }
    carry = s - len;
  }
}

/** Forged chain along `path`, links of length `link`. */
export function chain(ctx: Ctx, path: readonly Pt[], link = 5, color = IRON): void {
  let flip = false;
  let carry = 0;
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1]!;
    const b = path[i]!;
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    let s = carry;
    for (; s < len; s += link * 0.78) {
      chainLink(ctx, a.x + Math.cos(angle) * s, a.y + Math.sin(angle) * s, angle, link, flip, color);
      flip = !flip;
    }
    carry = s - len;
  }
}

function chainLink(ctx: Ctx, x: number, y: number, angle: number, link: number, faceOn: boolean, color: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  const rw = link * 0.55;
  const rh = faceOn ? link * 0.36 : link * 0.12;
  ctx.lineWidth = Math.max(1.1, link * 0.24);
  ctx.strokeStyle = css(shade(color, 0.5));
  ctx.beginPath();
  ctx.ellipse(0, 0.5, rw, Math.max(rh, 0.4), 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = css(color);
  ctx.beginPath();
  ctx.ellipse(0, 0, rw, Math.max(rh, 0.4), 0, 0, Math.PI * 2);
  ctx.stroke();
  // Worn bright where the links rub.
  ctx.strokeStyle = css(shade(color, 2.4), 0.7);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(0, 0, rw, Math.max(rh, 0.4), 0, Math.PI * 1.1, Math.PI * 1.6);
  ctx.stroke();
  ctx.restore();
}

/** An iron ring or shackle hanging from a point. */
export function shackle(ctx: Ctx, x: number, y: number, r: number, color = IRON): void {
  ctx.lineWidth = Math.max(1.4, r * 0.35);
  ctx.strokeStyle = css(shade(color, 0.5));
  ctx.beginPath();
  ctx.ellipse(x + 0.5, y + r + 0.5, r * 0.8, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = css(color);
  ctx.beginPath();
  ctx.ellipse(x, y + r, r * 0.8, r, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = css(shade(color, 2.2), 0.7);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(x, y + r, r * 0.8, r, 0, Math.PI * 0.9, Math.PI * 1.4);
  ctx.stroke();
}
