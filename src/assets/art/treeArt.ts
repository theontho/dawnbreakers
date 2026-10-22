import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { paintBroadleaf, type BroadleafStyle } from './broadleaf';
import { variantKey } from './canvasKit';
import { paintPollard, POLLARD_VARIANTS } from './pollard';
import { FOREST_SPECIES, forestTreeId, TREE_AGES, VILLAGE_BROADLEAVES, type ForestSpecies } from './treeSpecies';

/**
 * Generators, variant counts and sizes for the forest and village trees
 * (`src/assets/treeObjects.ts`). Every texture has several variants
 * (`texture~N`), picked per cell.
 */

const BROADLEAVES: Record<string, readonly BroadleafStyle[]> = {
  ...Object.fromEntries((Object.keys(FOREST_SPECIES) as ForestSpecies[])
    .flatMap(species => TREE_AGES.map(age => [forestTreeId(species, age), FOREST_SPECIES[species][age]]))),
  ...VILLAGE_BROADLEAVES,
};

export const TREE_TEXTURE_VARIANTS: Readonly<Record<string, number>> = {
  ...Object.fromEntries(Object.entries(BROADLEAVES).map(([id, styles]) => [id, styles.length])),
  pollard: POLLARD_VARIANTS.length,
};

export const TREE_ART_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...Object.fromEntries(Object.entries(BROADLEAVES).map(([id, styles]) => [
    id, ((scene, def) => styles.forEach((s, i) => paintBroadleaf(scene, variantKey(def.texture, i), s))) as TextureGenerator,
  ])),
  pollard: (scene, def) => POLLARD_VARIANTS.forEach((s, i) => paintPollard(scene, variantKey(def.texture, i), s)),
};

export interface TreeSize {
  /** Height of the tallest variant. */
  height: number;
  /** Crown half-width of the widest variant. */
  spread: number;
  /** Lowest crown base: below it a tree is only its bole. */
  crownBase: number;
}

/** The outer size of each tree's variants (px): how far in front of a person a tree of that kind may not stand. */
export const TREE_SIZES: Readonly<Record<string, TreeSize>> = {
  ...Object.fromEntries(Object.entries(BROADLEAVES).map(([id, styles]) => [id, {
    height: Math.max(...styles.map(s => s.height)),
    spread: Math.max(...styles.map(s => s.spread)),
    crownBase: Math.min(...styles.map(s => s.crownBase)),
  }])),
  pollard: {
    height: Math.max(...POLLARD_VARIANTS.map(s => s.height)),
    spread: Math.max(...POLLARD_VARIANTS.map(s => (s.height - s.head) * 0.55 + s.bole)),
    crownBase: Math.min(...POLLARD_VARIANTS.map(s => s.head)),
  },
};
