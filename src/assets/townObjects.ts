import type { MapObjectDefinition } from './mapAssetTypes';

/**
 * True-scale town buildings (the scale pilot, starting with Shíráz). One cell
 * runs about 1.4 m along a wall and a person stands 40 px (1.75 m), so a
 * storey is about 80 px and a door about 23 x 48 px. Footprints here are the
 * contract between the art and the maps: the art fills exactly this many
 * cells, anchored at the bottom vertex of the front cell like every building.
 */
export const TOWN_OBJECTS: MapObjectDefinition[] = [
  // Houses face the lane with high plain walls; family life is turned inward.
  { id: 'town-house-small', label: 'Small House', texture: 'town-house-small', kind: 'structure', category: 'buildings', color: 0xb88d5c, blocks: true, footprint: { w: 5, h: 4 }, isometric: true },
  { id: 'town-house', label: 'Town House', texture: 'town-house', kind: 'structure', category: 'buildings', color: 0xc39a7a, blocks: true, footprint: { w: 6, h: 5 }, isometric: true },
  { id: 'town-house-large', label: 'Courtyard House', texture: 'town-house-large', kind: 'structure', category: 'buildings', color: 0xd6cbb0, blocks: true, footprint: { w: 8, h: 7 }, isometric: true },
  // Mosques: a congregational mosque round its court, and a smaller one.
  { id: 'mosque-great', label: 'Great Mosque', texture: 'mosque-great', kind: 'structure', category: 'shrines', color: 0xc8a26e, blocks: true, footprint: { w: 12, h: 10 }, isometric: true },
  { id: 'mosque-local', label: 'Mosque', texture: 'mosque-local', kind: 'structure', category: 'shrines', color: 0xc8a26e, blocks: true, footprint: { w: 8, h: 7 }, isometric: true },
  // The bazaar: vaulted rows of shops, and open stalls in its squares.
  { id: 'bazaar-row', label: 'Bazaar Row', texture: 'bazaar-row', kind: 'structure', category: 'buildings', color: 0xb08a5a, blocks: true, footprint: { w: 8, h: 3 }, isometric: true },
  { id: 'market-stall', label: 'Market Stall', texture: 'market-stall', kind: 'structure', category: 'buildings', color: 0xc94f4f, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  // The city's defences: the gate between two towers, and the wall (one cell at a time; it joins).
  { id: 'city-gate', label: 'City Gate', texture: 'city-gate', kind: 'structure', category: 'buildings', color: 0xa08868, blocks: true, footprint: { w: 4, h: 3 }, isometric: true },
  { id: 'town-wall', label: 'Town Wall', texture: 'town-wall', kind: 'prop', category: 'barriers-prison', color: 0xa88660, blocks: true },
  { id: 'compound-wall', label: 'Courtyard Wall', texture: 'compound-wall', kind: 'prop', category: 'barriers-prison', color: 0xb88d5c, blocks: true },
  // Water and trees at their real heights.
  { id: 'fountain-pool', label: 'Pool', texture: 'fountain-pool', kind: 'structure', category: 'bridges-water', color: 0x2c4a6b, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
  { id: 'plane-tree', label: 'Plane Tree', texture: 'plane-tree', kind: 'prop', category: 'plants', color: 0x46743f, blocks: true },
  { id: 'cypress', label: 'Tall Cypress', texture: 'cypress', kind: 'prop', category: 'plants', color: 0x24553a, blocks: true },
  { id: 'orange-tree', label: 'Orange Tree', texture: 'orange-tree', kind: 'prop', category: 'plants', color: 0x3f7a3a, blocks: true },
];
