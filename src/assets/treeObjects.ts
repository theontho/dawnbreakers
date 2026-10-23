import { FOREST_SPECIES, forestTreeId, TREE_AGES, type ForestSpecies, type TreeAge } from './art/treeSpecies';
import type { MapObjectDefinition } from './mapAssetTypes';

/**
 * Trees at their real heights, by species and age: the Hyrcanian forest
 * (oak, beech, ironwood, alder; each young, mature and old) and the trees
 * of the villages (walnut, mulberry, orchard fruit, apricot, pollards). The town's
 * plane trees and cypresses are in `townObjects.ts`. Art in
 * `art/treeSpecies.ts`, `art/pollard.ts`; see docs/true-scale.md.
 */

// Labels are written out whole (not built from "Young " + "Oak") so the
// localization lint finds each one and asks for its translations.
const FOREST_LABEL: Record<ForestSpecies, Record<TreeAge, { label: string }>> = {
  oak: { young: { label: 'Young Oak' }, mature: { label: 'Oak' }, old: { label: 'Old Oak' } },
  beech: { young: { label: 'Young Beech' }, mature: { label: 'Beech' }, old: { label: 'Old Beech' } },
  ironwood: { young: { label: 'Young Ironwood' }, mature: { label: 'Ironwood' }, old: { label: 'Old Ironwood' } },
  alder: { young: { label: 'Young Alder' }, mature: { label: 'Alder' }, old: { label: 'Old Alder' } },
};
const SPECIES_COLOR: Record<ForestSpecies, number> = { oak: 0x274322, beech: 0x8a6a24, ironwood: 0x9a4a24, alder: 0x6f8a3c };

const tree = ({ id, label, color }: { id: string; label: string; color: number }): MapObjectDefinition =>
  ({ id, label, texture: id, kind: 'prop', category: 'plants', color, blocks: true });

export const TREE_OBJECTS: MapObjectDefinition[] = [
  ...(Object.keys(FOREST_SPECIES) as ForestSpecies[]).flatMap(species => TREE_AGES.map(age =>
    tree({ id: forestTreeId(species, age), label: FOREST_LABEL[species][age].label, color: SPECIES_COLOR[species] }))),
  tree({ id: 'walnut', label: 'Walnut', color: 0x6a7a2e }),
  tree({ id: 'mulberry', label: 'Mulberry', color: 0x5f8a34 }),
  tree({ id: 'fruit-tree', label: 'Fruit Tree', color: 0x4c7a34 }),
  tree({ id: 'apricot-tree', label: 'Apricot Tree', color: 0x4c7c34 }),
  tree({ id: 'pollard', label: 'Pollard', color: 0x7a8a3a }),
];
