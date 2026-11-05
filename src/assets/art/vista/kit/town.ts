import { rng } from '../../canvasKit';
import { isAccent, tone, type DawnPass } from '../../dawnPass';
import { block, dome, minaret, type Parapet } from '../../dawnShapes';
import { windcatcher } from '../../dawnSkyline';

/**
 * Rows of houses for a town seen from outside: flat-roofed blocks in the
 * place's own brick or plaster, with what its roofs carry (wind-catchers in
 * the desert towns, small domes, the projecting wooden balconies of
 * Baghdád), and the tall landmarks that stand out of them.
 */

export const MUD = [0xc8a47a, 0xbf9a6c, 0xd8c2a0, 0xb08660, 0xc9ab84, 0xa98560, 0xd0b48e] as const;
export const BRICK = [0xb98a5c, 0xa87a50, 0xc09468, 0x9e7048, 0xb48258] as const;
export const PLASTER = [0xe0d4bc, 0xd6c8ac, 0xcfc0a2, 0xe6dcc6, 0xc8b898] as const;
export const STONE = [0x9a8a78, 0x8c7e70, 0xa49482, 0x887868] as const;
export const TURQUOISE = 0x2f9ea4;
export const LAPIS = 0x2a5ea8;
export const GOLD = 0xd8b050;

export interface TownRowSpec {
  x0: number;
  x1: number;
  /** Ground line the houses stand on. */
  base: number;
  /** Range of roof heights above the base, in unscaled pixels. */
  heights: [number, number];
  /** Range of house widths, in unscaled pixels. */
  widths?: [number, number];
  palette: readonly number[];
  depth: number;
  seed: number;
  parapets?: readonly Parapet[];
  /** Chances, per house, of a wind-catcher, a small dome, or a wooden balcony. */
  windcatchers?: number;
  domes?: number;
  balconies?: number;
  windows?: number;
  lit?: number;
  /** Leave a gap where this returns false. */
  keep?: (x: number, w: number) => boolean;
}

export function townRow(p: DawnPass, s: TownRowSpec): void {
  const { k } = p;
  const rand = rng(s.seed);
  const parapets = s.parapets ?? ['plain', 'plain', 'plain', 'kungura', 'stepped'];
  const [w0, w1] = s.widths ?? [24, 54];
  for (let x = s.x0; x < s.x1;) {
    const w = (w0 + rand() * (w1 - w0)) * k;
    const top = s.base - (s.heights[0] + rand() * (s.heights[1] - s.heights[0])) * k;
    const color = s.palette[Math.floor(rand() * s.palette.length)]!;
    const parapet = parapets[Math.floor(rand() * parapets.length)]!;
    const extra = rand();
    const seed = Math.round(x * 31 + top);
    if (!s.keep || s.keep(x, w)) {
      if (extra < (s.windcatchers ?? 0)) windcatcher(p, x + w * (0.25 + rand() * 0.4), top, color, s.depth);
      block(p, { x, top, w, base: s.base, color, depth: s.depth, seed, parapet, windows: s.windows ?? 1 + Math.floor(rand() * 3), lit: s.lit ?? 0.3, light: 0.8 + rand() * 0.25 });
      if (extra > 1 - (s.domes ?? 0)) dome(p, { cx: x + w / 2, base: top - 2 * k, r: Math.min(w * 0.3, 10 * k), color, depth: s.depth, bulb: 0.85 });
      if (rand() < (s.balconies ?? 0)) balcony(p, x + w * 0.2, top + (s.base - top) * 0.25, w * 0.6, s.depth);
    }
    x += w - 2 * k;
  }
}

/** A shanashíl: a projecting upper room of wooden lattice, as on the houses along the Tigris. */
export function balcony(p: DawnPass, x: number, y: number, w: number, depth: number): void {
  const { ctx, k } = p;
  const h = Math.min(14 * k, w * 0.5);
  ctx.fillStyle = tone(p, 0x6a4a30, 0.9, depth);
  ctx.fillRect(x, y, w, h);
  if (isAccent(p)) return;
  ctx.strokeStyle = tone(p, 0x3a2818, 1, depth);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let u = x + 2 * k; u < x + w; u += 3 * k) {
    ctx.moveTo(u, y + 2 * k);
    ctx.lineTo(u, y + h - 1);
  }
  ctx.stroke();
}

/** A row of shallow brick domes over a covered bazaar. */
export function bazaarRoof(p: DawnPass, x0: number, x1: number, base: number, r: number, color: number, depth: number): void {
  for (let x = x0; x < x1; x += r * 2) dome(p, { cx: x, base, r, color, depth, bulb: 0.75 });
}

export interface MosqueSpec {
  cx: number;
  base: number;
  /** Radius of the great dome, in pixels. */
  r: number;
  dome: number;
  body: number;
  depth: number;
  tiled?: boolean;
  /** Drum height under the dome, as a fraction of its radius. */
  drum?: number;
  bulb?: number;
  /** Minarets either side, as distances from the centre in dome radii, and their height in radii. */
  minarets?: { at: readonly number[]; h: number; color: number; bands?: number };
  seed: number;
}

/** A great mosque or shrine: a body, a dome on its drum, and minarets beside it. */
export function mosque(p: DawnPass, m: MosqueSpec): void {
  const { k } = p;
  const roof = m.base - m.r * 0.9;
  if (m.minarets) {
    for (const at of m.minarets.at) {
      minaret(p, { cx: m.cx + at * m.r, base: roof + 4 * k, h: m.minarets.h * m.r, r: Math.max(2.2 * k, m.r * 0.11), color: m.minarets.color, depth: m.depth, bands: m.minarets.bands });
    }
  }
  block(p, { x: m.cx - m.r * 1.6, top: roof, w: m.r * 3.2, base: m.base, color: m.body, depth: m.depth, seed: m.seed, parapet: 'kungura', windows: 4, lit: 0.5 });
  dome(p, { cx: m.cx, base: roof - 2 * k, r: m.r, color: m.dome, depth: m.depth, drum: m.r * (m.drum ?? 0.45), bulb: m.bulb ?? 1.2, tiled: m.tiled, finial: true });
}
