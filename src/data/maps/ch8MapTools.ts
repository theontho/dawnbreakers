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

export interface WoodlandPalette {
  /** Blocking textures, weighted. */
  solid: ReadonlyArray<readonly [string, number]>;
  /** Non-blocking ground cover, weighted. */
  cover: ReadonlyArray<readonly [string, number]>;
}

export const MAZINDARAN_WOODS: WoodlandPalette = {
  solid: [
    ['ch8-oak', 30], ['ch8-ironwood', 20], ['ch8-alder', 14], ['tree', 10],
    ['ch8-undergrowth', 16], ['ch8-log', 4], ['ch8-mossy-rock', 4],
  ],
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
  /** Cells kept free of trees but allowed ferns (path verges). */
  verge: CellSet;
  /** Chance a free cell gets a blocking plant. */
  density: number;
  /** Chance a verge or leftover cell gets ground cover. */
  coverDensity: number;
  /** Optional per-cell override of density (for thinning toward clearings). */
  densityAt?: (x: number, y: number) => number;
}

/** Scatter woodland across the free cells of a map. */
export function scatterWoodland(opts: WoodlandOptions): DecorSpec[] {
  const rand = seededRandom(opts.seed);
  const decor: DecorSpec[] = [];
  for (let y = 0; y < opts.height; y += 1) {
    for (let x = 0; x < opts.width; x += 1) {
      if (opts.clear.has(x, y)) continue;
      const roll = rand();
      if (!opts.verge.has(x, y) && roll < (opts.densityAt?.(x, y) ?? opts.density)) {
        decor.push({ gridX: x, gridY: y, texture: pick(rand, opts.palette.solid), blocks: true });
      } else if (rand() < opts.coverDensity) {
        decor.push({ gridX: x, gridY: y, texture: pick(rand, opts.palette.cover) });
      }
    }
  }
  return decor;
}
