import type { DecorSpec } from './types';

/**
 * Small layout helpers for the chapter 8 maps: a seeded RNG so scattered
 * forest is identical on every load, a route tracer for winding paths, and
 * a woodland scatter that leaves paths, clearings, and people untouched.
 */

export type Cell = readonly [number, number];

export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rasterise a route through waypoints, stepping along x then y between each pair. */
export function traceRoute(waypoints: readonly Cell[]): Cell[] {
  const cells: Cell[] = [];
  const push = (x: number, y: number) => {
    const last = cells[cells.length - 1];
    if (!last || last[0] !== x || last[1] !== y) cells.push([x, y]);
  };
  for (let i = 0; i < waypoints.length; i += 1) {
    const [tx, ty] = waypoints[i]!;
    if (i === 0) { push(tx, ty); continue; }
    let [x, y] = cells[cells.length - 1]!;
    while (x !== tx) { x += Math.sign(tx - x); push(x, y); }
    while (y !== ty) { y += Math.sign(ty - y); push(x, y); }
  }
  return cells;
}

export class CellSet {
  private readonly keys = new Set<string>();

  constructor(cells: Iterable<Cell> = []) {
    for (const cell of cells) this.add(cell[0], cell[1]);
  }

  add(x: number, y: number): void { this.keys.add(`${x},${y}`); }

  addRect(x: number, y: number, w: number, h: number): void {
    for (let dy = 0; dy < h; dy += 1) for (let dx = 0; dx < w; dx += 1) this.add(x + dx, y + dy);
  }

  /** Add each cell together with its four neighbours. */
  addWithNeighbours(cells: Iterable<Cell>): void {
    for (const [x, y] of cells) {
      this.add(x, y); this.add(x + 1, y); this.add(x - 1, y); this.add(x, y + 1); this.add(x, y - 1);
    }
  }

  has(x: number, y: number): boolean { return this.keys.has(`${x},${y}`); }
}

/** Widen a one-cell route into a lane two cells wide (each cell and its east and south neighbours). */
export function widen(cells: readonly Cell[]): Cell[] {
  const set = new CellSet();
  const out: Cell[] = [];
  for (const [x, y] of cells) {
    for (const c of [[x, y], [x + 1, y], [x, y + 1], [x + 1, y + 1]] as const) {
      if (!set.has(c[0], c[1])) { set.add(c[0], c[1]); out.push(c); }
    }
  }
  return out;
}

/**
 * Cells where a tall tree would stand between the camera and one of
 * `watched`: in front of it on screen (larger x + y, up to `reach` steps)
 * and within `width` steps across. Trees are kept out of these so people,
 * doors and bridges are not lost under a 20 m crown.
 */
export function sightlines(watched: Iterable<Cell>, reach: number, width: number, w: number, h: number): CellSet {
  const out = new CellSet();
  for (const [px, py] of watched) {
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const s = (x + y) - (px + py);
        const d = (x - y) - (px - py);
        if (s > 0 && s <= reach && Math.abs(d) <= width) out.add(x, y);
      }
    }
  }
  return out;
}

export interface WoodlandPalette {
  /** Tall trees, weighted: spaced apart, never on sightlines. */
  trees: ReadonlyArray<readonly [string, number]>;
  /** Low blocking cover (thickets, logs, rocks), weighted. */
  solid: ReadonlyArray<readonly [string, number]>;
  /** Non-blocking ground cover, weighted. */
  cover: ReadonlyArray<readonly [string, number]>;
}

export const MAZINDARAN_WOODS: WoodlandPalette = {
  trees: [['ch8-oak', 5], ['ch8-ironwood', 3], ['ch8-alder', 2]],
  solid: [['ch8-undergrowth', 6], ['ch8-log', 2], ['ch8-mossy-rock', 2]],
  cover: [['ch8-fern', 1]],
};

function pick(rand: () => number, table: ReadonlyArray<readonly [string, number]>): string {
  const total = table.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [texture, weight] of table) {
    r -= weight;
    if (r <= 0) return texture;
  }
  return table[table.length - 1]![0];
}

export interface WoodlandOptions {
  width: number;
  height: number;
  seed: number;
  palette: WoodlandPalette;
  /** Cells that must stay empty (paths, clearings, people, exits). */
  clear: CellSet;
  /** Cells kept free of trees and thickets but allowed ferns (path verges). */
  verge: CellSet;
  /** Cells where no tall tree may stand (see `sightlines`). */
  open: CellSet;
  /** Chance a free cell gets a tall tree, if none stands within `spacing`. */
  treeDensity: number;
  /** Minimum steps between tall trees. */
  spacing: number;
  /** Chance a free cell gets low blocking cover. */
  density: number;
  /** Chance a verge or leftover cell gets ground cover. */
  coverDensity: number;
}

/** Scatter woodland across the free cells of a map: spaced tall trees, thickets, ferns. */
export function scatterWoodland(opts: WoodlandOptions): DecorSpec[] {
  const rand = seededRandom(opts.seed);
  const decor: DecorSpec[] = [];
  const trunks: Cell[] = [];
  const crowded = (x: number, y: number) =>
    trunks.some(([tx, ty]) => Math.max(Math.abs(tx - x), Math.abs(ty - y)) < opts.spacing);
  for (let y = 0; y < opts.height; y += 1) {
    for (let x = 0; x < opts.width; x += 1) {
      if (opts.clear.has(x, y)) continue;
      const free = !opts.verge.has(x, y);
      if (free && !opts.open.has(x, y) && rand() < opts.treeDensity && !crowded(x, y)) {
        trunks.push([x, y]);
        decor.push({ gridX: x, gridY: y, texture: pick(rand, opts.palette.trees), blocks: true });
      } else if (free && rand() < opts.density) {
        decor.push({ gridX: x, gridY: y, texture: pick(rand, opts.palette.solid), blocks: true });
      } else if (rand() < opts.coverDensity) {
        decor.push({ gridX: x, gridY: y, texture: pick(rand, opts.palette.cover) });
      }
    }
  }
  return decor;
}
