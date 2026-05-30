import type { MapDefinition } from './types';

/**
 * The Quiet Quarter: a residential lane in north Shíráz.
 * The Báb's house stands at its centre, with a small garden and a well.
 * Walk south off (6, 13) to return to the city.
 */
export const houseQuarterMap: MapDefinition = {
  key: 'HouseQuarter',
  title: 'Shíráz — the Quiet Quarter',
  width: 14,
  height: 14,
  spawn: { x: 6, y: 13 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Stone forecourt of the Báb's house
    paintRect(4, 4, 5, 4, 'stone');

    // Lane running south from the courtyard to the city
    paintPath([
      [6, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13],
    ]);
    paintPath([[5, 8], [7, 8], [8, 8], [9, 8]]);

    // A garden plot east of the lane
    paintRect(9, 9, 3, 3, 'grass');

    // A small reflecting pool in the courtyard
    setTile(7, 5, 'water'); block(7, 5);
  },
  buildings: [
    // The Báb's house — 2×2 at (5, 4) (the front-most tile is (6, 5))
    { gridX: 5, gridY: 4, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    // Trees flanking the courtyard
    { gridX: 3, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 3, gridY: 6, texture: 'tree', blocks: true },
    { gridX: 9, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 9, gridY: 6, texture: 'tree', blocks: true },
    { gridX: 1, gridY: 9, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 12, texture: 'tree', blocks: true },
    { gridX: 11, gridY: 9, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 11, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 7, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 13, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 6, texture: 'tree', blocks: true },
    { gridX: 13, gridY: 5, texture: 'tree', blocks: true },
    // A neighbourhood well by the lane
    { gridX: 4, gridY: 10, texture: 'well', blocks: true },
    // Quiet household details (non-blocking)
    { gridX: 4, gridY: 7, texture: 'ch1-planter' },
    { gridX: 8, gridY: 7, texture: 'ch1-planter' },
    { gridX: 9, gridY: 10, texture: 'ch1-planter' },
    { gridX: 5, gridY: 7, texture: 'rug' },
    { gridX: 7, gridY: 7, texture: 'rug' },
    { gridX: 3, gridY: 8, texture: 'lamp' },
    { gridX: 9, gridY: 8, texture: 'lamp' },
  ],
  npcs: [
    // The lamplit threshold gates the decisive meeting without placing the Báb as a map NPC.
    { gridX: 6, gridY: 7, texture: 'ch1-house-threshold',
      prompt: 'Knock at the lamplit threshold  [E]',
      action: { kind: 'bab' } },
    // A quiet neighbour — small backstory, also counts as a rumour
    { gridX: 3, gridY: 9, texture: 'npc-merchant',
      prompt: 'Speak with the Quiet Neighbour  [E]',
      action: { kind: 'dialogue', id: 'rumour-neighbour' } },
    // A household servant — keeps watch over the evening threshold
    { gridX: 8, gridY: 8, texture: 'ch1-npc-servant',
      prompt: 'Speak with the Household Servant  [E]',
      action: { kind: 'dialogue', id: 'rumour-servant' } },
  ],
  exits: [
    // Walk south off (6, 13) → back to the city, entering near its north gate
    { fromX: 6, fromY: 13, dx: 0, dy: 1,
      targetScene: 'City', targetSpawnX: 8, targetSpawnY: 0,
      label: '↓ Walk back to the city' },
  ],
};
