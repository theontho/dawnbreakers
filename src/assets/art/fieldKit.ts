import { css, rng, shade, type Ctx, type IsoBox } from './canvasKit';

/**
 * Small helpers for free-standing props (camels, rocks, casks, shrubs):
 * soft shadows, rounded masses lit from the upper left, foliage clumps and
 * twisted rope. Architecture uses the iso box kit; these are for the things
 * that are not boxes.
 */

/** Soft elliptical contact shadow. */
export function ellipseShadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, alpha = 0.26): void {
  ctx.save();
  ctx.filter = 'blur(2px)';
  ctx.fillStyle = `rgba(10,6,3,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A radial gradient for a rounded mass of `color` centred near (cx, cy), lit from the upper left. */
export function litGradient(ctx: Ctx, cx: number, cy: number, r: number, color: number, contrast = 1): CanvasGradient {
  const g = ctx.createRadialGradient(cx - r * 0.45, cy - r * 0.5, r * 0.08, cx, cy, r * 1.25);
  g.addColorStop(0, css(shade(color, 1 + 0.38 * contrast)));
  g.addColorStop(0.5, css(color));
  g.addColorStop(1, css(shade(color, 1 - 0.48 * contrast)));
  return g;
}

/** A horizontal gradient for upright cylinders and robes: lit left, shaded right. */
export function sideGradient(ctx: Ctx, x0: number, x1: number, color: number): CanvasGradient {
  const g = ctx.createLinearGradient(x0, 0, x1, 0);
  g.addColorStop(0, css(shade(color, 1.12)));
  g.addColorStop(0.35, css(shade(color, 1.2)));
  g.addColorStop(1, css(shade(color, 0.58)));
  return g;
}

/** An iso box of `size` x `size` standing at the centre of a one-cell texture `texH` high. */
export function cellCentredBox(texH: number, size: number, h: number, depth = size): IsoBox {
  return { x: 32 + (size - depth) / 2, y: texH - 16 + (size + depth) / 4, w: size, d: depth, h };
}

export interface ClumpStyle {
  leaf: number;
  seed: number;
  /** Blossom dots: rose, pomegranate flower, tamarisk plume. */
  bloom?: number;
  /** Number of leaf masses. */
  masses?: number;
  /** Vertical squash of the clump. */
  squash?: number;
}

/** A clump of foliage masses with a dark underside and sunlit tops. */
export function foliageClump(ctx: Ctx, cx: number, cy: number, r: number, style: ClumpStyle): void {
  const rand = rng(style.seed);
  const squash = style.squash ?? 0.75;
  const blobs = Array.from({ length: style.masses ?? 7 }, () => {
    const a = rand() * Math.PI * 2;
    const d = rand() * r * 0.6;
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d * squash, r: r * (0.38 + rand() * 0.22) };
  }).sort((a, b) => a.y - b.y);
  for (const b of blobs) {
    ctx.fillStyle = css(shade(style.leaf, 0.5));
    ctx.beginPath();
    ctx.arc(b.x + 1.2, b.y + 1.6, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const b of blobs) {
    ctx.fillStyle = litGradient(ctx, b.x, b.y, b.r, style.leaf);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < r * 4; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * r;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d * squash;
    const lit = x - cx + (y - cy) < 0;
    ctx.fillStyle = css(shade(style.leaf, lit ? 1.5 : 0.6), 0.8);
    ctx.fillRect(x, y, 1.4, 1.1);
  }
  if (style.bloom !== undefined) {
    for (let i = 0; i < Math.max(4, r * 0.7); i++) {
      const a = rand() * Math.PI * 2;
      const d = r * (0.2 + rand() * 0.7);
      const x = cx + Math.cos(a) * d;
      const y = cy + Math.sin(a) * d * squash;
      ctx.fillStyle = css(shade(style.bloom, 0.75));
      ctx.beginPath();
      ctx.arc(x + 0.4, y + 0.4, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(style.bloom);
      ctx.beginPath();
      ctx.arc(x, y, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Twisted rope along a polyline: a dark core with lit diagonal strands. */
export function rope(ctx: Ctx, points: ReadonlyArray<{ x: number; y: number }>, color: number, width = 2.4): void {
  const path = (): void => {
    ctx.beginPath();
    points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  };
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.strokeStyle = css(shade(color, 0.55));
  ctx.lineWidth = width + 1;
  path();
  ctx.stroke();
  ctx.strokeStyle = css(color);
  ctx.lineWidth = width;
  path();
  ctx.stroke();
  ctx.setLineDash([1, 2]);
  ctx.strokeStyle = css(shade(color, 1.35), 0.9);
  ctx.lineWidth = width * 0.45;
  path();
  ctx.stroke();
  ctx.restore();
}

/** An irregular stone or pebble, faceted and lit from the upper left. */
export function pebble(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: number, seed: number): void {
  const rand = rng(seed);
  const pts = Array.from({ length: 7 }, (_, i) => {
    const a = (i / 7) * Math.PI * 2;
    const k = 0.82 + rand() * 0.3;
    return { x: x + Math.cos(a) * rx * k, y: y + Math.sin(a) * ry * k };
  });
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, x, y, Math.max(rx, ry), color);
  ctx.fill();
  ctx.strokeStyle = css(shade(color, 0.45), 0.8);
  ctx.lineWidth = 0.7;
  ctx.stroke();
}
