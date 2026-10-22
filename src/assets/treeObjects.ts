import { FOREST_SPECIES, forestTreeId, TREE_AGES, type ForestSpecies, type TreeAge } from './art/treeSpecies';
import type { MapObjectDefinition } from './mapAssetTypes';

/**
 * Trees at their real heights, by species and age: the Hyrcanian forest
 * (oak, beech, ironwood, alder; each young, mature and old) and the trees
 * of the villages (walnut, mulberry, orchard fruit, pollards). The town's
 * plane trees and cypresses are in `townObjects.ts`. Art in
 * `art/treeSpecies.ts`, `art/pollard.ts`; see docs/true-scale.md.
 */

const SPECIES_LABEL: Record<ForestSpecies, string> = { oak: 'Oak', beech: 'Beech', ironwood: 'Ironwood', alder: 'Alder' };
const SPECIES_COLOR: Record<ForestSpecies, number> = { oak: 0x274322, beech: 0x8a6a24, ironwood: 0x9a4a24, alder: 0x6f8a3c };
const AGE_LABEL: Record<TreeAge, string> = { young: 'Young ', mature: '', old: 'Old ' };

const tree = (id: string, label: string, color: number): MapObjectDefinition =>
  ({ id, label, texture: id, kind: 'prop', category: 'plants', color, blocks: true });

export const TREE_OBJECTS: MapObjectDefinition[] = [
  ...(Object.keys(FOREST_SPECIES) as ForestSpecies[]).flatMap(species => TREE_AGES.map(age =>
    tree(forestTreeId(species, age), `${AGE_LABEL[age]}${SPECIES_LABEL[species]}`, SPECIES_COLOR[species]))),
  tree('walnut', 'Walnut', 0x6a7a2e),
  tree('mulberry', 'Mulberry', 0x5f8a34),
  tree('fruit-tree', 'Fruit Tree', 0x4c7a34),
  tree('pollard', 'Pollard', 0x7a8a3a),
];
