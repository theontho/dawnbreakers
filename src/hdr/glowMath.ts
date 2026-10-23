/**
 * The arithmetic behind the HDR glow on the sun and moon, kept free of the
 * browser and of Phaser so it can be checked on its own: how bright a core
 * is in extended sRGB, how far its light reaches, what stands in front of
 * it, and the uniforms the shader reads.
 */

/** A sun or moon to light past SDR white, in game pixels. */
export interface GlowSpec {
  /** Centre and radius of the disc as the scene draws it. */
  x: number;
  y: number;
  radius: number;
  /** The disc's own colour, 0xRRGGBB in sRGB. */
  color: number;
  /** How many times brighter than SDR white the core's light is; 1 adds nothing. */
  gain: number;
  /** Strength of the soft light around the disc, 0 to 1. */
  bloom: number;
  /** Fraction of the disc that is lit (1 for the sun) and the bearing of its lit limb, in radians. */
  lit: number;
  sunward: number;
  /** Screen y of the top of whatever stands in front of the sky at column x: the land, the city, the party. */
  skyline: (x: number) => number;
  /** How much of the whole glow shows, 0 to 1: a camera fade, a fading disc, a shade over the sky. */
  fade: number;
  /** How much of the core still shows while a word or button passes over it, 0 to 1. */
  coreFade: number;
  /** The buttons and panels over the glow, which it is cut out of (at most `MAX_HOLES`). */
  holes: readonly Occluder[];
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Something drawn over the sky: a button or panel, opaque or translucent,
 * that the glow is cut out of, or bare words, which the bloom may wash over
 * as glare does but which the core lets go of.
 */
export interface Occluder extends Rect {
  opacity: number;
  /** True for a filled shape, false for bare words with no box behind them. */
  solid: boolean;
}

/** The bright core fades out between these fractions of the radius, leaving the drawn limb in SDR. */
export const CORE_INNER = 0.55;
export const CORE_OUTER = 0.96;
/** The bloom reaches this many radii from the centre. */
export const BLOOM_REACH = 2.6;
/** At most this many words and panels are cut out of one glow; the largest over it win. */
export const MAX_HOLES = 8;
/** Floats in one glow's uniform block: four vec4s, a rectangle per hole, and the holes' opacities. */
export const GLOW_UNIFORM_FLOATS = 16 + MAX_HOLES * 4 + MAX_HOLES;

/** The square the glow's canvas covers, in game pixels. */
export function glowBounds(spec: Pick<GlowSpec, 'x' | 'y' | 'radius'>): Rect {
  const half = spec.radius * BLOOM_REACH + 2;
  return { x: spec.x - half, y: spec.y - half, width: half * 2, height: half * 2 };
}

/** The square round the bright core alone. */
export function coreBounds(spec: Pick<GlowSpec, 'x' | 'y' | 'radius'>): Rect {
  const half = spec.radius * CORE_OUTER;
  return { x: spec.x - half, y: spec.y - half, width: half * 2, height: half * 2 };
}

/** The fraction of `area` that `rect` covers. */
export function overlapFraction(area: Rect, rect: Rect): number {
  const w = Math.min(area.x + area.width, rect.x + rect.width) - Math.max(area.x, rect.x);
  const h = Math.min(area.y + area.height, rect.y + rect.height) - Math.max(area.y, rect.y);
  if (w <= 0 || h <= 0) return 0;
  return (w * h) / Math.max(1e-6, area.width * area.height);
}

/**
 * How much of the core still shows with these things in front of it. The
 * glow is cut out of buttons and panels as well, but a core cut into
 * rectangles would read as a window in the sun, so as anything comes over
 * the core its light goes altogether, and a translucent panel dims it as
 * much as it dims the disc underneath.
 */
export function occlusionFade(area: Rect, occluders: readonly Occluder[]): number {
  let fade = 1;
  for (const occluder of occluders) {
    const covered = smoothstep(0, 0.25, overlapFraction(area, occluder));
    fade *= 1 - clamp01(occluder.opacity) * covered;
  }
  return fade;
}

/** The solid occluders over `area` that matter most to it, largest overlap first. */
export function pickHoles(area: Rect, occluders: readonly Occluder[]): Occluder[] {
  return occluders
    .filter(occluder => occluder.solid)
    .map(occluder => ({ occluder, weight: overlapFraction(area, occluder) * occluder.opacity }))
    .filter(entry => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_HOLES)
    .map(entry => entry.occluder);
}

/** sRGB colour, linear light times `gain`, encoded back with the extended sRGB curve that HDR canvases read. */
export function hdrColor(color: number, gain: number): [number, number, number] {
  return [
    encodeExtendedSrgb(decodeSrgb(((color >> 16) & 0xff) / 255) * gain),
    encodeExtendedSrgb(decodeSrgb(((color >> 8) & 0xff) / 255) * gain),
    encodeExtendedSrgb(decodeSrgb((color & 0xff) / 255) * gain),
  ];
}

export function decodeSrgb(value: number): number {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** The sRGB curve carried on past 1, as `extended` tone mapping expects. */
export function encodeExtendedSrgb(linear: number): number {
  const magnitude = Math.abs(linear);
  const encoded = magnitude <= 0.0031308 ? magnitude * 12.92 : 1.055 * magnitude ** (1 / 2.4) - 0.055;
  return Math.sign(linear) * encoded;
}

/** True when the glow would add nothing to what the scene already draws. */
export function glowIsDark(spec: GlowSpec): boolean {
  const core = (spec.gain - 1) * spec.fade * spec.coreFade;
  const bloom = (spec.gain - 1) * spec.fade * spec.bloom;
  if (spec.radius <= 0 || (core < 0.01 && bloom < 0.01)) return true;
  // Hidden only when the land is above the glow's top in every column; sampled across its width.
  const reach = spec.radius * BLOOM_REACH;
  let lowestGround = -Infinity;
  for (let i = 0; i <= 8; i += 1) lowestGround = Math.max(lowestGround, spec.skyline(spec.x - reach + (reach * i) / 4));
  return spec.y - reach >= lowestGround;
}

/**
 * The skyline under a glow's canvas, one value per device pixel column, in
 * the canvas's own device pixels, for the shader to cut the glow along.
 */
export function sampleSkyline(spec: Pick<GlowSpec, 'skyline'>, origin: { x: number; y: number }, pixelRatio: number, out: Float32Array<ArrayBuffer>): Float32Array<ArrayBuffer> {
  for (let column = 0; column < out.length; column += 1) {
    out[column] = (spec.skyline(origin.x + (column + 0.5) / pixelRatio) - origin.y) * pixelRatio;
  }
  return out;
}

/**
 * The uniform block for one glow, in the device pixels of its own canvas,
 * whose top left corner sits at `origin` (game pixels).
 *
 *   core:   HDR colour, core opacity
 *   disc:   centre x, centre y, radius, feather of the phase edge
 *   phase:  lit fraction, cos and sin of the lit limb's bearing, unused
 *   bloom:  additive bloom colour, unused
 *   holes:  MAX_HOLES rectangles as left, top, right, bottom
 *   cover:  their opacities, four to a vec4 (0 for an unused slot)
 */
export function packGlowUniforms(spec: GlowSpec, origin: { x: number; y: number }, pixelRatio: number, out: Float32Array<ArrayBuffer> = new Float32Array(GLOW_UNIFORM_FLOATS)): Float32Array<ArrayBuffer> {
  const fade = clamp01(spec.fade);
  const [r, g, b] = hdrColor(spec.color, spec.gain);
  // The bloom adds light over the sky, so it carries only what lies past SDR white;
  // it eases off as words cross the disc, so they keep the contrast they have in SDR.
  const coreFade = clamp01(spec.coreFade);
  const extra = Math.max(0, spec.gain - 1) * 0.22 * clamp01(spec.bloom) * fade * (0.3 + 0.7 * coreFade);
  const [br, bg, bb] = hdrColor(spec.color, extra);
  const radius = spec.radius * pixelRatio;
  out.fill(0);
  out.set([
    r, g, b, fade * coreFade,
    (spec.x - origin.x) * pixelRatio, (spec.y - origin.y) * pixelRatio, radius, Math.max(1, radius * 0.06),
    clamp01(spec.lit), Math.cos(spec.sunward), Math.sin(spec.sunward), 0,
    br, bg, bb, 0,
  ]);
  spec.holes.slice(0, MAX_HOLES).forEach((hole, i) => {
    out.set([
      (hole.x - origin.x) * pixelRatio,
      (hole.y - origin.y) * pixelRatio,
      (hole.x + hole.width - origin.x) * pixelRatio,
      (hole.y + hole.height - origin.y) * pixelRatio,
    ], 16 + i * 4);
    out[16 + MAX_HOLES * 4 + i] = clamp01(hole.opacity);
  });
  return out;
}

export function smoothstep(edge0: number, edge1: number, value: number): number {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
