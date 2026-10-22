import { css, mix, rng, shade, type Ctx } from './canvasKit';

/**
 * The title screen's view of Shíráz is painted four times from one layout:
 *
 * - `night`: deep silhouettes, faint sky-glow on the edges, windows dark;
 * - `day`: the same city in full colour, hazed with distance;
 * - `rim`: black everywhere except the edges that catch the rising sun;
 * - `lamp`: black everywhere except the lamplit windows and their halos.
 *
 * The rim and lamp layers are drawn with additive blending, so their black
 * shapes add nothing and only hide what stands behind them. Each painter
 * asks the pass for colours and accents instead of branching on the mode,
 * so the four layers always line up exactly.
 */

export type DawnMode = 'night' | 'day' | 'rim' | 'lamp';

export interface DawnPass {
  mode: DawnMode;
  ctx: Ctx;
  width: number;
  height: number;
  /** Where the sun rises; edges facing it catch the light. */
  sunX: number;
  /** Size scale for the current screen; 1 at 800 pixels tall. */
  k: number;
}

const NIGHT_INK = 0x0b0a14;
const NIGHT_HAZE = 0x221f3a;
const DAY_HAZE = 0xcdd8e0;
const RIM = 0xffb867;

export function dawnPass(mode: DawnMode, ctx: Ctx, view: { width: number; height: number; k: number }): DawnPass {
  return { mode, ctx, width: view.width, height: view.height, sunX: view.width / 2, k: view.k };
}

/** True for the additive layers, where every surface is painted black. */
export function isAccent(p: DawnPass): boolean {
  return p.mode === 'rim' || p.mode === 'lamp';
}

/**
 * Colour of a surface whose daylight colour is `day`, seen on a face of
 * brightness `light`, at aerial `depth` (0 near, 1 on the far hills).
 */
export function tone(p: DawnPass, day: number, light: number, depth: number): string {
  return css(toneColor(p, day, light, depth));
}

export function toneColor(p: DawnPass, day: number, light: number, depth: number): number {
  if (isAccent(p)) return 0x000000;
  if (p.mode === 'day') return mix(shade(day, light), DAY_HAZE, Math.min(0.85, depth ** 1.3 * 0.8));
  const night = shade(mix(NIGHT_INK, day, 0.11), 1 + (light - 1) * 0.6);
  return mix(night, NIGHT_HAZE, Math.min(0.9, depth * 0.78));
}

/** How strongly the sun reaches a point: brightest near the sunrise, fading to the sides. */
export function sunReach(p: DawnPass, x: number): number {
  const off = Math.abs(x - p.sunX) / (p.width * 0.45 + 220);
  return Math.max(0.1, 1 - off) ** 2;
}

/** +1 when the side of an element facing the sun is its right edge, -1 for its left. */
export function sunSide(p: DawnPass, cx: number): 1 | -1 {
  return cx < p.sunX ? 1 : -1;
}

/**
 * A lit edge: warm in the rim layer, a pale glint by day and a faint cool
 * sky-glow at night. `trace` builds the path to stroke; `x` is where the
 * edge stands, for how much of the sun reaches it.
 */
export function rimPath(p: DawnPass, x: number, trace: () => void, strength = 1, depth = 0): void {
  if (p.mode === 'lamp') return;
  const ctx = p.ctx;
  const reach = sunReach(p, x) * strength;
  ctx.save();
  if (p.mode === 'rim') {
    ctx.strokeStyle = css(mix(RIM, 0xffe2b0, depth * 0.6), Math.min(1, 0.95 * reach));
    ctx.lineWidth = 1.6 * p.k;
  } else if (p.mode === 'day') {
    ctx.strokeStyle = css(0xfff4dc, 0.14 * reach);
    ctx.lineWidth = p.k;
  } else {
    ctx.strokeStyle = css(0x6a68a8, 0.18 * strength * (1 - depth * 0.5));
    ctx.lineWidth = 1;
  }
  ctx.beginPath();
  trace();
  ctx.stroke();
  ctx.restore();
}

/**
 * `rimPath` along a polyline, in short runs so a long roof line brightens
 * toward the sunrise and fades away from it.
 */
export function rimStroke(p: DawnPass, points: ReadonlyArray<{ x: number; y: number }>, strength = 1, depth = 0): void {
  for (let start = 0; start < points.length - 1;) {
    let end = start + 1;
    while (end < points.length - 1 && Math.abs(points[end]!.x - points[start]!.x) < 36) end++;
    const run = points.slice(start, end + 1);
    const x = (run[0]!.x + run[run.length - 1]!.x) / 2;
    rimPath(p, x, () => run.forEach((pt, i) => (i === 0 ? p.ctx.moveTo(pt.x, pt.y) : p.ctx.lineTo(pt.x, pt.y))), strength, depth);
    start = end;
  }
}

/** Light washing across a sun-facing side face or wall strip, brightest at the top. */
export function rimFace(p: DawnPass, x: number, y: number, w: number, h: number, strength = 1): void {
  if (p.mode !== 'rim' && p.mode !== 'day') return;
  const ctx = p.ctx;
  const reach = sunReach(p, x + w / 2) * strength;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const color = p.mode === 'rim' ? RIM : 0xfff0d0;
  const alpha = p.mode === 'rim' ? 0.55 * reach : 0.18 * reach;
  g.addColorStop(0, css(color, alpha));
  g.addColorStop(1, css(color, alpha * 0.25));
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

export interface WindowSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  lit: boolean;
  arched?: boolean;
  depth: number;
}

/** A small window or lattice opening: dark recess by day, and a lamp behind it at night. */
export function windowOpening(p: DawnPass, win: WindowSpec): void {
  const { ctx } = p;
  const shape = (): void => {
    ctx.beginPath();
    if (win.arched) {
      const spring = win.y + win.w * 0.55;
      ctx.moveTo(win.x, win.y + win.h);
      ctx.lineTo(win.x, spring);
      ctx.quadraticCurveTo(win.x, win.y, win.x + win.w / 2, win.y - win.w * 0.15);
      ctx.quadraticCurveTo(win.x + win.w, win.y, win.x + win.w, spring);
      ctx.lineTo(win.x + win.w, win.y + win.h);
      ctx.closePath();
    } else {
      ctx.rect(win.x, win.y, win.w, win.h);
    }
  };
  if (p.mode === 'lamp') {
    if (!win.lit) return;
    const cx = win.x + win.w / 2;
    const cy = win.y + win.h / 2;
    const fade = 1 - win.depth * 0.45;
    const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(win.w, win.h) * 2.6);
    halo.addColorStop(0, css(0xff9a40, 0.32 * fade));
    halo.addColorStop(1, css(0xff9a40, 0));
    ctx.fillStyle = halo;
    ctx.fillRect(cx - win.w * 3, cy - win.h * 3, win.w * 6, win.h * 6);
    shape();
    const glow = ctx.createLinearGradient(0, win.y, 0, win.y + win.h);
    glow.addColorStop(0, css(0xffd890, fade));
    glow.addColorStop(1, css(0xd8762c, fade));
    ctx.fillStyle = glow;
    ctx.fill();
    // The wooden lattice in front of the lamp.
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, win.y);
    ctx.lineTo(cx, win.y + win.h);
    ctx.moveTo(win.x, win.y + win.h * 0.55);
    ctx.lineTo(win.x + win.w, win.y + win.h * 0.55);
    ctx.stroke();
    return;
  }
  if (p.mode === 'rim') return;
  shape();
  ctx.fillStyle = tone(p, 0x2a1d14, 1, win.depth);
  ctx.fill();
}

/** Fine mottling inside the current clip: plaster, dust, stubble. */
export function grain(p: DawnPass, x: number, y: number, w: number, h: number, base: number, depth: number, seed: number, density = 1): void {
  if (isAccent(p)) return;
  const { ctx } = p;
  const left = Math.max(x, 0);
  const width = Math.min(x + w, p.width) - left;
  if (width <= 0 || h <= 0) return;
  const rand = rng(seed);
  const count = Math.floor((width * h) / 44 * density);
  ctx.save();
  ctx.globalAlpha = p.mode === 'day' ? 0.22 : 0.18;
  // One path per shade: thousands of single fills would dominate the bake.
  for (const light of [0.72, 1.22]) {
    ctx.fillStyle = tone(p, base, light, depth);
    ctx.beginPath();
    for (let i = 0; i < count; i++) ctx.rect(left + Math.floor(rand() * width), y + Math.floor(rand() * h), 1 + Math.round(rand()), 1);
    ctx.fill();
  }
  ctx.restore();
}

/** Vertical gradient for a surface that darkens toward its foot. */
export function faceGradient(p: DawnPass, y0: number, y1: number, day: number, light: number, depth: number): CanvasGradient | string {
  if (isAccent(p)) return '#000';
  const g = p.ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, tone(p, day, light * 1.04, depth));
  g.addColorStop(1, tone(p, day, light * 0.84, depth));
  return g;
}
