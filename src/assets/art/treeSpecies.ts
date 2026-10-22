import type { BroadleafStyle } from './broadleaf';

/**
 * Broadleaf trees by species and age, at their real heights (23 px to the
 * metre). The Hyrcanian forest of Mázindarán is oriental beech and
 * chestnut-leaved oak over Persian ironwood, with alders by the water; a
 * stand mixes saplings, trees in their prime and a few old giants, so each
 * species comes in three ages and each age in several variants. Age changes
 * the shape as well as the height: a young tree is slight, its crown narrow
 * and starting low; an old one stands on a tall clean bole under a broad
 * crown. About the villages grow the trees people keep: walnut, mulberry
 * and orchard fruit (pollards are in `pollard.ts`).
 */

export type TreeAge = 'young' | 'mature' | 'old';
export const TREE_AGES: readonly TreeAge[] = ['young', 'mature', 'old'];

interface Species {
  bark: number;
  leaves: readonly number[];
  /** Half the crown's width as a share of the height, for a tree in its prime. */
  spread: number;
  /** Where the crown begins, as a share of the mature proportion. */
  crownBase?: number;
  /** Bole width as a share of the height. */
  bole: number;
  pale?: boolean;
  /** Stems from one root (ironwood); saplings have one fewer. */
  stems?: number;
}

/** How each age shapes the crown: spread, where the crown begins, and bole, as factors. */
const AGE_SHAPE: Record<TreeAge, { spread: number; crownBase: number; bole: number }> = {
  young: { spread: 0.85, crownBase: 0.18, bole: 0.75 },
  mature: { spread: 1, crownBase: 0.32, bole: 1 },
  old: { spread: 1.2, crownBase: 0.42, bole: 1.15 },
};

/** Small differences of build between trees of one age, so no two variants share a silhouette. */
const BUILD = [1, 0.9, 1.08, 0.95];

function tree(sp: Species, age: TreeAge, height: number, seed: number, i: number): BroadleafStyle {
  const shape = AGE_SHAPE[age];
  return {
    height,
    spread: Math.round(height * sp.spread * shape.spread * BUILD[i % BUILD.length]!),
    crownBase: Math.round(height * shape.crownBase * (sp.crownBase ?? 1)),
    bole: Math.max(5, Math.round(height * sp.bole * shape.bole)),
    bark: sp.bark,
    leaves: sp.leaves,
    seed,
    pale: sp.pale,
    stems: sp.stems ? Math.max(2, sp.stems - (age === 'young' ? 1 : 0)) : undefined,
  };
}

function ages(sp: Species, seed: number, heights: Record<TreeAge, readonly number[]>): Record<TreeAge, BroadleafStyle[]> {
  return {
    young: heights.young.map((h, i) => tree(sp, 'young', h, seed + i * 7, i)),
    mature: heights.mature.map((h, i) => tree(sp, 'mature', h, seed + 100 + i * 7, i)),
    old: heights.old.map((h, i) => tree(sp, 'old', h, seed + 200 + i * 7, i)),
  };
}

const OAK: Species = {
  bark: 0x4a3a2a, spread: 0.235, bole: 0.046,
  leaves: [0x2f5a2a, 0x3b6331, 0x274322, 0x4a6a2c, 0x5f7a32, 0x8a7a34],
};
const BEECH: Species = {
  bark: 0x6a665c, spread: 0.23, bole: 0.044, pale: true,
  leaves: [0x8a6a24, 0xb08a34, 0x6a7a2c, 0xc49a3a, 0x4a6a2c],
};
const IRONWOOD: Species = {
  bark: 0x7a6e60, spread: 0.3, bole: 0.03, crownBase: 0.85, stems: 3,
  leaves: [0x9a3a1c, 0xb35a26, 0xc4762e, 0xd9a441, 0x7f3a1c, 0x6a5a2a],
};
const ALDER: Species = {
  bark: 0x9a958a, spread: 0.155, bole: 0.036, pale: true,
  leaves: [0x3f5e2a, 0x4c6a2e, 0x5c7c36, 0x6f8a3c, 0x87a04a],
};

/**
 * The forest's species by age (px; 23 px to the metre):
 * oak and beech 8 to 12 m young, 15 to 19 m in their prime, 21 to 25 m old;
 * ironwood 5 to 7, 8 to 10, 11 to 13 m; alder 6 to 9, 11 to 14, 16 to 20 m.
 */
export const FOREST_SPECIES = {
  oak: ages(OAK, 811, { young: [190, 230, 270], mature: [350, 390, 430], old: [490, 535, 575] }),
  beech: ages(BEECH, 829, { young: [200, 245, 275], mature: [360, 400, 435], old: [500, 545, 580] }),
  ironwood: ages(IRONWOOD, 841, { young: [120, 140, 160], mature: [190, 210, 230], old: [255, 280, 300] }),
  alder: ages(ALDER, 861, { young: [140, 170, 205], mature: [255, 290, 320], old: [370, 410, 455] }),
} as const satisfies Record<string, Record<TreeAge, BroadleafStyle[]>>;

export type ForestSpecies = keyof typeof FOREST_SPECIES;

/** The texture of one species at one age: `oak-young`, `beech-old`... */
export const forestTreeId = (species: ForestSpecies, age: TreeAge): string => `${species}-${age}`;

/**
 * The village trees. Walnuts of 10 to 18 m spread broad over the lanes on
 * smooth grey bark; mulberries of 5 to 8 m, stout and round, kept for the
 * silkworms and the fruit; and the orchard of apple, quince and
 * pomegranate, 3 to 6 m, in fruit; and the apricot of the summer orchards
 * of Khurásán, ripe in June.
 */
export const VILLAGE_BROADLEAVES: Record<'walnut' | 'mulberry' | 'fruit-tree' | 'apricot-tree', readonly BroadleafStyle[]> = {
  walnut: [230, 300, 360, 410].map((height, i) => ({
    height, spread: Math.round(height * [0.42, 0.4, 0.44, 0.41][i]!), crownBase: Math.round(height * 0.26),
    bole: Math.round(height * 0.05), bark: 0x8c867a, pale: true, seed: 901 + i * 7,
    leaves: [0x4f6a2a, 0x6a7a2e, 0x8a8a36, 0xb09a3c, 0x5a7030],
  })),
  mulberry: [120, 150, 180].map((height, i) => ({
    height, spread: Math.round(height * [0.46, 0.42, 0.45][i]!), crownBase: Math.round(height * 0.3),
    bole: Math.round(height * 0.07), bark: 0x6e5a40, seed: 931 + i * 7,
    leaves: [0x4a7a2e, 0x5f8a34, 0x7a9a3a, 0xc8b040, 0x3f6a2a],
  })),
  'fruit-tree': [
    // Apple, quince, a pomegranate on several stems, and a young apple.
    { height: 128, spread: 50, crownBase: 40, bole: 8, bark: 0x5e4a36, seed: 951, fruit: 0xb8322a,
      leaves: [0x3f6a2e, 0x4c7a34, 0x5a8a3a, 0x6a8a3c] },
    { height: 104, spread: 44, crownBase: 30, bole: 7, bark: 0x5a4632, seed: 957, fruit: 0xd8b832,
      leaves: [0x5a7a32, 0x6a8a3a, 0x8a9a40, 0xa89a3c] },
    { height: 84, spread: 34, crownBase: 22, bole: 4, bark: 0x6a5642, seed: 963, fruit: 0xc0302a, stems: 3,
      leaves: [0x3a5e2a, 0x4a6e2e, 0x5a7a34, 0x9a8a2e] },
    { height: 90, spread: 34, crownBase: 30, bole: 6, bark: 0x5e4a36, seed: 969, fruit: 0xa8402a,
      leaves: [0x46702e, 0x547e36, 0x648a3a] },
  ],
  'apricot-tree': [130, 110, 95].map((height, i) => ({
    height, spread: Math.round(height * [0.42, 0.45, 0.4][i]!), crownBase: Math.round(height * 0.3),
    bole: Math.round(height * 0.07), bark: 0x5a3e2c, seed: 981 + i * 7, fruit: 0xe8902a,
    leaves: [0x3f6e2e, 0x4c7c34, 0x5a8a3a, 0x356228],
  })),
};
