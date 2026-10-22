import { TREE_SIZES } from '../../assets/art/treeArt';
import { forestTreeId, type ForestSpecies, type TreeAge } from '../../assets/art/treeSpecies';
import { CellSet, seededRandom, type Cell } from './ch8MapTools';
import type { DecorSpec } from './types';

/**
 * Woodland scattered over the free cells of a map, graded as real woods
 * are: young trees at the edges, where the light falls on paths, clearings
 * and fields; trees in their prime a little further in; the old giants in
 * the depths, with now and then one kept near the open as a landmark. About
 * houses and fields grow the village's own trees (orchard, mulberry,
 * walnut, pollards). No crown is let stand in front of a watched cell, and
 * how far "in front" reaches depends on the tree's own height.
 */

type Weighted<T extends string> = ReadonlyArray<readonly [T, number]>;

export interface WoodlandPalette {
  /** Forest species, weighted; each is grown at the age its depth in the woods gives it. */
  trees: Weighted<ForestSpecies>;
  /** Trees of the village clearings, weighted (textures). */
  village: Weighted<string>;
  /** Low blocking cover (thickets, logs, rocks), weighted. */
  solid: Weighted<string>;
  /** Non-blocking ground cover, weighted. */
  cover: Weighted<string>;
}

export const MAZINDARAN_WOODS: WoodlandPalette = {
  trees: [['beech', 4], ['oak', 4], ['ironwood', 3], ['alder', 2]],
  village: [['fruit-tree', 3], ['pollard', 3], ['mulberry', 2], ['walnut', 1]],
  solid: [['ch8-undergrowth', 6], ['ch8-log', 2], ['ch8-mossy-rock', 2]],
  cover: [['ch8-fern', 1]],
};

/**
 * The chance of each age by depth: steps from the nearest open cell (path,
 * clearing, field, verge). Read from the first row whose depth is reached.
 */
const AGE_BY_DEPTH: ReadonlyArray<readonly [number, Record<TreeAge, number>]> = [
  [6, { young: 0.1, mature: 0.4, old: 0.5 }],
  [4, { young: 0.25, mature: 0.5, old: 0.25 }],
  [2, { young: 0.45, mature: 0.45, old: 0.1 }],
  [0, { young: 0.8, mature: 0.2, old: 0 }],
];
const YOUNGER: Record<TreeAge, TreeAge | undefined> = { old: 'mature', mature: 'young', young: undefined };

export interface WoodlandOptions {
  width: number;
  height: number;
  seed: number;
  palette: WoodlandPalette;
  /** Cells that must stay empty (paths, clearings, people, exits). */
  clear: CellSet;
  /** Cells kept free of trees and thickets but allowed ferns (path verges). */
  verge: CellSet;
  /** People, doors and landmarks: no tree stands where its crown would cover one. */
  watched: readonly Cell[];
  /** Further cells where no tree may stand. */
  open?: CellSet;
  /** Houses and fields: cells within `within` steps of `near` grow the village's trees. */
  village?: { near: CellSet; within: number };
  /** Chance a free cell gets a tree, if none stands too close. */
  treeDensity: number;
  /** Chance a free cell gets low blocking cover. */
  density: number;
  /** Chance a verge or leftover cell gets ground cover. */
  coverDensity: number;
}

function pick<T extends string>(rand: () => number, table: Weighted<T>): T {
  const total = table.reduce((sum, [, w]) => sum + w, 0);
  let r = rand() * total;
  for (const [texture, weight] of table) {
    r -= weight;
    if (r <= 0) return texture;
  }
  return table[table.length - 1]![0];
}

/** Steps (counting diagonals as one) from each cell to the nearest of `sources`. */
function depthFrom(sources: (x: number, y: number) => boolean, w: number, h: number): Int32Array {
  const depth = new Int32Array(w * h).fill(-1);
  let frontier: number[] = [];
  for (let y = 0; y < h; y += 1) for (let x = 0; x < w; x += 1) {
    if (sources(x, y)) { depth[y * w + x] = 0; frontier.push(y * w + x); }
  }
  for (let d = 1; frontier.length > 0; d += 1) {
    const next: number[] = [];
    for (const i of frontier) {
      const x = i % w;
      const y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= w || ny >= h || depth[ny * w + nx] !== -1) continue;
        depth[ny * w + nx] = d;
        next.push(ny * w + nx);
      }
    }
    frontier = next;
  }
  return depth;
}

/**
 * Whether a tree here would cover a watched cell. Each step of x + y is
 * 16 px down the screen and each step of x - y 32 px across. A tree drawn
 * in front (larger x + y) covers a person 40 px tall with its crown when
 * the crown reaches down past their head, or else with its bole alone when
 * it stands straight in front.
 */
function hides(texture: string, x: number, y: number, watched: readonly Cell[]): boolean {
  const size = TREE_SIZES[texture];
  if (!size) throw new Error(`No tree size for ${texture}`);
  const reach = Math.ceil(size.height / 16);
  const across = Math.ceil((size.spread + 10) / 32);
  return watched.some(([wx, wy]) => {
    const s = (x + y) - (wx + wy);
    if (s <= 0 || s > reach) return false;
    const d = Math.abs((x - y) - (wx - wy));
    return s * 16 > size.crownBase - 40 ? d <= across : d === 0;
  });
}

/** Steps a tree of this size keeps from its neighbours: saplings crowd, giants stand apart. */
const spacingOf = (texture: string) => (TREE_SIZES[texture]!.spread > 140 ? 3 : 2);

/** Scatter woodland across the free cells of a map: graded trees, thickets, ferns. */
export function scatterWoodland(opts: WoodlandOptions): DecorSpec[] {
  const { width: w, height: h, palette } = opts;
  const rand = seededRandom(opts.seed);
  const depth = depthFrom((x, y) => opts.clear.has(x, y) || opts.verge.has(x, y), w, h);
  const nearVillage = opts.village
    ? depthFrom((x, y) => opts.village!.near.has(x, y), w, h)
    : undefined;
  const decor: DecorSpec[] = [];
  const trunks: Array<{ x: number; y: number; spacing: number }> = [];
  const crowded = (x: number, y: number, spacing: number) =>
    trunks.some(t => Math.max(Math.abs(t.x - x), Math.abs(t.y - y)) < Math.max(spacing, t.spacing));

  const fits = (texture: string, x: number, y: number) =>
    !hides(texture, x, y, opts.watched) && !crowded(x, y, spacingOf(texture));

  // Which tree each seeded cell would grow: a village tree near the houses, else a species at its depth's age.
  type Seedling = { x: number; y: number; village?: string; species?: ForestSpecies; age?: TreeAge };
  const seedlings: Seedling[] = [];
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (opts.clear.has(x, y) || opts.verge.has(x, y) || opts.open?.has(x, y) || rand() >= opts.treeDensity) continue;
      const v = nearVillage?.[y * w + x];
      if (v !== undefined && v >= 0 && v <= opts.village!.within) {
        seedlings.push({ x, y, village: pick(rand, palette.village) });
        continue;
      }
      const d = depth[y * w + x]!;
      const odds = AGE_BY_DEPTH.find(([min]) => d < 0 || d >= min)![1];
      const species = pick(rand, palette.trees);
      seedlings.push({ x, y, species, age: pick<TreeAge>(rand, [['young', odds.young], ['mature', odds.mature], ['old', odds.old]]) });
    }
  }

  // The old trees take their ground first and the young fill between them, as in a real wood.
  const RANK: Record<TreeAge, number> = { old: 0, mature: 1, young: 2 };
  seedlings.sort((a, b) => (a.age ? RANK[a.age] : 1) - (b.age ? RANK[b.age] : 1));
  const grown = new CellSet();
  for (const sd of seedlings) {
    let texture: string | undefined;
    if (sd.village) {
      texture = fits(sd.village, sd.x, sd.y) ? sd.village : undefined;
    } else {
      let age: TreeAge | undefined = sd.age;
      // A tree that would stand in front of someone, or too near a neighbour, grows younger, or not at all.
      while (age && !fits(forestTreeId(sd.species!, age), sd.x, sd.y)) age = YOUNGER[age];
      texture = age && forestTreeId(sd.species!, age);
    }
    if (!texture) continue;
    trunks.push({ x: sd.x, y: sd.y, spacing: spacingOf(texture) });
    grown.add(sd.x, sd.y);
    decor.push({ gridX: sd.x, gridY: sd.y, texture, blocks: true });
  }

  // Thickets, logs and stones between the trees; ferns on the verges.
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (opts.clear.has(x, y) || grown.has(x, y)) continue;
      if (!opts.verge.has(x, y) && rand() < opts.density) {
        decor.push({ gridX: x, gridY: y, texture: pick(rand, palette.solid), blocks: true });
      } else if (rand() < opts.coverDensity) {
        decor.push({ gridX: x, gridY: y, texture: pick(rand, palette.cover) });
      }
    }
  }
  return decor;
}
