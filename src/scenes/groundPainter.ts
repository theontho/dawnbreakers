import type { TileKind } from './baseMapTypes';

/**
 * Paints a map's ground pixel by pixel, so terrain reads as land rather
 * than a checkerboard of tiles: boundaries between grass, path, sand and
 * water wander (domain-warped noise) and are softened where they meet,
 * grass and earth vary in broad patches, stone is laid as staggered paving,
 * and water darkens away from its banks. The diorama's cut edge is painted
 * here too, as earth strata (or water) below the south rims.
 */

export interface GroundSpec {
  width: number;
  height: number;
  map: TileKind[][];
  /** Screen position of cell (0,0)'s centre relative to the image's top-left. */
  originX: number;
  originY: number;
  imageW: number;
  imageH: number;
  slab: number;
  /** Indoors: the slab's cut edge is masonry, not earth. */
  interior?: boolean;
}

type Rgb = [number, number, number];

const GRASS: Rgb = [74, 107, 58];
const GRASS_DRY: Rgb = [110, 118, 62];
const EARTH: Rgb = [156, 132, 88];
const SAND: Rgb = [184, 153, 104];
const STONE: Rgb = [112, 96, 74];
const WATER_DEEP: Rgb = [26, 52, 82];
const WATER_SHALLOW: Rgb = [52, 92, 112];
const SIDE_EARTH: Rgb = [84, 62, 40];
const SIDE_WATER: Rgb = [29, 53, 80];
const SIDE_MASONRY: Rgb = [150, 124, 92];
const TERRACOTTA: Rgb = [166, 106, 74];
const BOARDS: Rgb = [124, 86, 54];

/** Built floors keep straight edges; only natural ground wanders. */
const BUILT: ReadonlySet<TileKind> = new Set(['floor', 'wood', 'stone']);

/**
 * Low-frequency noise sampled every few pixels and interpolated: the warp
 * and the broad colour patches are smooth, so this costs nothing visible
 * and makes painting several times faster.
 */
class CoarseField {
  private readonly cols: number;
  private readonly values: Float32Array;

  constructor(spec: GroundSpec, fn: (fx: number, fy: number) => number) {
    this.cols = Math.ceil(spec.imageW / STEP) + 2;
    const rows = Math.ceil(spec.imageH / STEP) + 2;
    this.values = new Float32Array(this.cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const [fx, fy] = toGrid(spec, c * STEP, r * STEP);
        this.values[r * this.cols + c] = fn(fx, fy);
      }
    }
  }

  at(px: number, py: number): number {
    const x = px / STEP;
    const y = py / STEP;
    const c = Math.floor(x);
    const r = Math.floor(y);
    const tx = x - c;
    const ty = y - r;
    const i = r * this.cols + c;
    const v = this.values;
    const top = v[i]! + (v[i + 1]! - v[i]!) * tx;
    const bottom = v[i + this.cols]! + (v[i + this.cols + 1]! - v[i + this.cols]!) * tx;
    return top + (bottom - top) * ty;
  }
}

const STEP = 4;

function toGrid(spec: GroundSpec, px: number, py: number): [number, number] {
  const dx = (px - spec.originX) / 32;
  const dy = (py - spec.originY) / 16;
  return [(dx + dy) / 2 + 0.5, (dy - dx) / 2 + 0.5];
}

interface Fields {
  wx: CoarseField;
  wy: CoarseField;
  broad: CoarseField;
  mottle: CoarseField;
}

export function paintGround(spec: GroundSpec): ImageData {
  const { width: W, height: H, map, imageW, imageH } = spec;
  const img = new ImageData(imageW, imageH);
  const fields: Fields = {
    wx: new CoarseField(spec, (fx, fy) => (fbm(fx * 1.3, fy * 1.3, 11) - 0.5) * 0.7),
    wy: new CoarseField(spec, (fx, fy) => (fbm(fx * 1.3 + 40, fy * 1.3 - 17, 23) - 0.5) * 0.7),
    broad: new CoarseField(spec, (fx, fy) => fbm(fx * 0.35, fy * 0.35, 3)),
    mottle: new CoarseField(spec, (fx, fy) => fbm(fx * 3, fy * 3, 5)),
  };
  const data = img.data;
  const kindAt = (x: number, y: number): TileKind | undefined =>
    x >= 0 && y >= 0 && x < W && y < H ? map[y]![x] : undefined;

  for (let py = 0; py < imageH; py++) {
    for (let px = 0; px < imageW; px++) {
      // Continuous grid coordinates with cell (x, y) spanning [x, x+1).
      const dx = (px - spec.originX) / 32;
      const dy = (py - spec.originY) / 16;
      const fx = (dx + dy) / 2 + 0.5;
      const fy = (dy - dx) / 2 + 0.5;
      const o = (py * imageW + px) * 4;
      if (fx < 0 || fy < 0 || fx >= W || fy >= H) {
        const side = slabSide(W, H, spec, px, py, kindAt);
        if (side) {
          data[o] = side[0];
          data[o + 1] = side[1];
          data[o + 2] = side[2];
          data[o + 3] = 255;
        }
        continue;
      }
      const c = groundColour(fx, fy, kindAt, fields, px, py);
      data[o] = c[0];
      data[o + 1] = c[1];
      data[o + 2] = c[2];
      data[o + 3] = 255;
    }
  }
  return img;
}

type KindAt = (x: number, y: number) => TileKind | undefined;

function groundColour(fx: number, fy: number, kindAt: KindAt, fields: Fields, px: number, py: number): Rgb {
  // Wandering boundaries: sample the terrain through a smooth warp.
  const built = BUILT.has(kindAt(Math.floor(fx), Math.floor(fy)) ?? 'grass');
  const wx = built ? 0 : fields.wx.at(px, py);
  const wy = built ? 0 : fields.wy.at(px, py);
  const broad = fields.broad.at(px, py);
  const mottle = fields.mottle.at(px, py);
  const sample = (ox: number, oy: number): TileKind =>
    kindAt(Math.floor(fx + wx + ox), Math.floor(fy + wy + oy)) ?? kindAt(Math.floor(fx), Math.floor(fy)) ?? 'grass';
  const kind = sample(0, 0);
  let colour = surface(kind, fx, fy, kindAt, broad, mottle);
  // Soften the seam where two terrains meet.
  const k1 = sample(0.06, 0.03);
  const k2 = sample(-0.03, 0.06);
  if (k1 !== kind || k2 !== kind) {
    const other = k1 !== kind ? k1 : k2;
    colour = mix(colour, surface(other, fx, fy, kindAt, broad, mottle), 0.35);
    // A darker lip where grass overhangs a path or a bank drops to water.
    if (other === 'grass' || other === 'water' || kind === 'water') colour = scale(colour, 0.86);
  }
  return colour;
}

function surface(kind: TileKind, fx: number, fy: number, kindAt: KindAt, broad: number, mottle: number): Rgb {
  const fine = hash2(Math.floor(fx * 40), Math.floor(fy * 40), 7);
  switch (kind) {
    case 'grass': {
      let c = mix(GRASS, GRASS_DRY, smooth(0.45, 0.8, broad));
      c = scale(c, 0.86 + fine * 0.22 + (mottle - 0.5) * 0.16);
      // The odd flower.
      if (fine > 0.995) c = [226, 206, 118];
      return c;
    }
    case 'path': {
      let c = scale(EARTH, 0.9 + broad * 0.18 + (fine - 0.5) * 0.12);
      const pebble = hash2(Math.floor(fx * 14), Math.floor(fy * 14), 31);
      if (pebble > 0.93) c = scale(c, pebble > 0.965 ? 1.18 : 0.8);
      return c;
    }
    case 'sand': {
      const ripple = Math.sin((fx * 0.8 + fy * 1.4) * 9 + mottle * 6) * 0.04;
      return scale(SAND, 0.93 + broad * 0.12 + ripple + (fine - 0.5) * 0.08);
    }
    case 'stone': {
      // Staggered paving slabs, two per cell each way.
      const sx = fx * 2;
      const row = Math.floor(fy * 2);
      const sxs = sx + (row % 2) * 0.5;
      const u = sxs - Math.floor(sxs);
      const v = fy * 2 - row;
      const slabShade = 0.86 + hash2(Math.floor(sxs), row, 41) * 0.24;
      let c = scale(STONE, slabShade + (fine - 0.5) * 0.08 + broad * 0.06);
      if (u < 0.05 || v < 0.06) c = scale(c, 0.68);
      else if (u < 0.1 || v < 0.12) c = scale(c, 1.1);
      return c;
    }
    case 'floor': {
      // Square fired-clay tiles, two per cell each way, in a running grid.
      const tx = Math.floor(fx * 2);
      const ty = Math.floor(fy * 2);
      const u = fx * 2 - tx;
      const v = fy * 2 - ty;
      let c = scale(TERRACOTTA, 0.88 + hash2(tx, ty, 53) * 0.2 + (fine - 0.5) * 0.06);
      if ((tx + ty) % 7 === 0) c = mix(c, [46, 140, 150], 0.55);
      if (u < 0.06 || v < 0.06) c = scale(c, 0.62);
      else if (u < 0.12 || v < 0.12) c = scale(c, 1.08);
      return c;
    }
    case 'wood': {
      // Boards running along the x axis, staggered end joints, a little grain.
      const row = Math.floor(fy * 4);
      const along = fx + hash2(row, 0, 61) * 3;
      const board = Math.floor(along / 1.5);
      const v = fy * 4 - row;
      const u = along / 1.5 - board;
      let c = scale(BOARDS, 0.86 + hash2(board, row, 67) * 0.22);
      c = scale(c, 1 + Math.sin(along * 40 + row) * 0.03 + (fine - 0.5) * 0.05);
      if (v < 0.08 || u < 0.015) c = scale(c, 0.6);
      return c;
    }
    case 'water': {
      const near = shoreFactor(fx, fy, kindAt);
      let c = mix(WATER_DEEP, WATER_SHALLOW, near);
      const wave = Math.sin(fx * 7 + fy * 3 + mottle * 5);
      if (wave > 0.93) c = mix(c, [150, 190, 210], 0.35);
      if (near > 0.85) c = mix(c, [200, 214, 210], (near - 0.85) * 2.5);
      return c;
    }
  }
}

/** 0 in open water, rising to 1 at the bank. */
function shoreFactor(fx: number, fy: number, kindAt: KindAt): number {
  let best = 1;
  for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
    const k = kindAt(Math.floor(fx) + ox, Math.floor(fy) + oy);
    if (k !== undefined && k !== 'water') {
      const d = ox === 1 ? 1 - (fx % 1) : ox === -1 ? fx % 1 : oy === 1 ? 1 - (fy % 1) : fy % 1;
      best = Math.min(best, d);
    }
  }
  return Math.max(0, 1 - best * 2.2);
}

/** The cut faces of the slab below the south-west and south-east rims. */
function slabSide(
  W: number,
  H: number,
  spec: GroundSpec,
  px: number,
  py: number,
  kindAt: KindAt,
): Rgb | undefined {
  const rel = (px - spec.originX) / 32;
  // The rim point straight above this pixel, on the south-west edge (fy = H)
  // or the south-east edge (fx = W).
  const swFx = rel + H;
  const seFy = W - rel;
  let depth: number;
  let cell: TileKind | undefined;
  let light = 1;
  if (swFx >= 0 && swFx < W) {
    depth = py - (spec.originY + (rel + 2 * (H - 0.5)) * 16);
    cell = kindAt(Math.floor(swFx), H - 1);
  } else if (seFy >= 0 && seFy < H) {
    depth = py - (spec.originY + (2 * (W - 0.5) - rel) * 16);
    cell = kindAt(W - 1, Math.floor(seFy));
    light = 0.78;
  } else {
    return undefined;
  }
  if (depth < 0 || depth > spec.slab) return undefined;
  const t = depth / spec.slab;
  if (cell === 'water') return scale(SIDE_WATER, light * (1 - t * 0.35));
  if (spec.interior) {
    // Masonry: courses of dressed stone under a dark plinth line.
    const course = Math.floor(depth / 6);
    const joint = depth % 6 < 0.9 || (px + course * 9) % 18 < 0.9;
    return scale(SIDE_MASONRY, light * (joint ? 0.7 : 1.05 - t * 0.3));
  }
  const strata = Math.sin(depth * 0.9 + fbm(px * 0.05, depth * 0.2, 13) * 4) * 0.06;
  return scale(SIDE_EARTH, light * (1.15 - t * 0.45 + strata));
}

// Noise ---------------------------------------------------------------------

function hash2(x: number, y: number, seed: number): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function vnoise(x: number, y: number, seed: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const tx = x - xi;
  const ty = y - yi;
  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

function fbm(x: number, y: number, seed: number): number {
  return vnoise(x, y, seed) * 0.57 + vnoise(x * 2.1, y * 2.1, seed + 1) * 0.29 + vnoise(x * 4.3, y * 4.3, seed + 2) * 0.14;
}

function smooth(a: number, b: number, t: number): number {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function scale(c: Rgb, f: number): Rgb {
  return [Math.min(255, c[0] * f), Math.min(255, c[1] * f), Math.min(255, c[2] * f)];
}
