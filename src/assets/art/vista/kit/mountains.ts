import { rng } from '../../canvasKit';
import { isAccent, rimStroke, tone, type DawnPass } from '../../dawnPass';

/**
 * Ranges of mountains and hills seen across a plain: a profile built from a
 * few peaks and some ragged noise, filled down to the plain, with snow on
 * the heights where the season or the altitude keeps it, and the crest
 * catching the sunrise.
 */

export interface Peak {
  /** Centre, as a fraction of the screen's width. */
  at: number;
  /** Height above the range's foot and half-width at the foot, in unscaled pixels. */
  h: number;
  w: number;
  /** Steepness of the flanks: 1 a rounded hill, 2 a sharp cone. */
  sharp?: number;
}

export interface RangeSpec {
  /** Screen y of the range's foot. */
  base: number;
  peaks: readonly Peak[];
  /** A low continuous ridge under the peaks, in unscaled pixels. */
  floor?: number;
  /** Ragged noise along the crest, in unscaled pixels. */
  rough?: number;
  color: number;
  depth: number;
  seed: number;
  /** Snow down to this many unscaled pixels below the highest point of each column's peak. */
  snow?: number;
  /** How much of the sunrise its crest catches. */
  rim?: number;
  /** Shading strokes down the slopes. */
  gullies?: boolean;
}

/** Screen y of the range's crest at x. */
export function rangeY(p: DawnPass, spec: RangeSpec, x: number): number {
  const { k, width } = p;
  let lift = (spec.floor ?? 0) * k;
  for (const peak of spec.peaks) {
    const u = Math.abs(x - peak.at * width) / (peak.w * k);
    if (u >= 1) continue;
    const sharp = peak.sharp ?? 1.3;
    lift = Math.max(lift, peak.h * k * (1 - u ** (2 / sharp)) ** sharp);
  }
  const rough = (spec.rough ?? 4) * k;
  const s = spec.seed;
  const noise = Math.sin(x * 0.031 + s) * 0.5 + Math.sin(x * 0.083 + s * 1.7) * 0.3 + Math.sin(x * 0.19 + s * 2.9) * 0.2;
  return spec.base - lift - noise * rough * Math.min(1, lift / (12 * k) + 0.3);
}

export function paintRange(p: DawnPass, spec: RangeSpec): Array<{ x: number; y: number }> {
  const { ctx, k } = p;
  const points: Array<{ x: number; y: number }> = [];
  for (let x = -8; x <= p.width + 8; x += 3) points.push({ x, y: rangeY(p, spec, x) });
  const trace = (): void => {
    ctx.beginPath();
    ctx.moveTo(-8, spec.base + 40 * k);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(p.width + 8, spec.base + 40 * k);
    ctx.closePath();
  };
  trace();
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const high = Math.min(...points.map(pt => pt.y));
    const g = ctx.createLinearGradient(0, high, 0, spec.base);
    g.addColorStop(0, tone(p, spec.color, 1, spec.depth));
    g.addColorStop(1, tone(p, spec.color, 0.86, spec.depth * 0.9));
    ctx.fillStyle = g;
  }
  ctx.fill();
  if (!isAccent(p)) {
    ctx.save();
    trace();
    ctx.clip();
    if (spec.snow !== undefined) snow(p, spec, points);
    if (spec.gullies !== false) gullies(p, spec, points);
    ctx.restore();
  }
  if (p.mode !== 'lamp') rimStroke(p, points, spec.rim ?? 0.7, spec.depth);
  return points;
}

/** Snow on each peak down to its snow line, ragged along the bottom. */
function snow(p: DawnPass, spec: RangeSpec, points: ReadonlyArray<{ x: number; y: number }>): void {
  const { ctx, k } = p;
  const depth = (spec.snow ?? 0) * k;
  ctx.fillStyle = tone(p, 0xf1f4f8, 1.08, spec.depth * 0.8);
  ctx.beginPath();
  for (const peak of spec.peaks) {
    const top = spec.base - peak.h * k;
    const line = top + depth;
    let open = false;
    const lower: Array<{ x: number; y: number }> = [];
    for (const pt of points) {
      if (Math.abs(pt.x - peak.at * p.width) > peak.w * k) continue;
      const ragged = line + Math.sin(pt.x * 0.21 + spec.seed) * 3 * k + Math.sin(pt.x * 0.057) * 5 * k;
      if (pt.y >= ragged) continue;
      if (!open) ctx.moveTo(pt.x, ragged);
      ctx.lineTo(pt.x, pt.y);
      lower.push({ x: pt.x, y: ragged });
      open = true;
    }
    for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i]!.x, lower[i]!.y);
    if (open) ctx.closePath();
  }
  ctx.fill();
}

/** Faint gullies and spurs running down the slopes, darker on the side away from the sun. */
function gullies(p: DawnPass, spec: RangeSpec, points: ReadonlyArray<{ x: number; y: number }>): void {
  const { ctx, k } = p;
  const rand = rng(spec.seed * 1000 + 7);
  ctx.lineWidth = Math.max(1, 1.2 * k);
  for (let i = 0; i < points.length; i += 4) {
    const pt = points[i]!;
    const height = spec.base - pt.y;
    if (height < 10 * k || rand() < 0.4) continue;
    const len = height * (0.3 + rand() * 0.5);
    const lean = (pt.x < p.sunX ? -1 : 1) * len * (0.2 + rand() * 0.3);
    ctx.strokeStyle = tone(p, spec.color, rand() < 0.6 ? 0.78 : 1.12, spec.depth);
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y + 2);
    ctx.quadraticCurveTo(pt.x + lean * 0.3, pt.y + len * 0.5, pt.x + lean, pt.y + len);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
