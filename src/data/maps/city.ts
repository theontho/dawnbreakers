import type { MapDefinition } from './types';

/**
 * The lower city of Shíráz: gate, bazaar, mosque, fountain.
 * North edge exits to the Quiet Quarter where the Báb's house stands.
 */
export const cityMap: MapDefinition = {
  key: 'City',
  title: 'Shíráz — the City',
  width: 18,
  height: 14,
  spawn: { x: 16, y: 12 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Mosque court (stone)
    paintRect(5, 5, 5, 3, 'stone');
    // Bazaar plaza (sand)
    paintRect(10, 9, 7, 4, 'sand');
    // Gate forecourt (sand)
    paintRect(12, 13, 4, 1, 'sand');
    // Small bookbinder's mat off the bazaar
    paintRect(14, 8, 2, 1, 'sand');

    // Main thoroughfare: north entry → mosque side → bazaar → gate row
    paintPath([
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4],
      [8, 5], [8, 6], [8, 7], [8, 8],
      [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
      [13, 9], [13, 10], [13, 11], [13, 12],
    ]);
    paintPath([[4, 6], [4, 7], [5, 8], [6, 8], [7, 8]]);

    // Fountain west of the mosque
    setTile(3, 6, 'water'); block(3, 6);
    setTile(3, 7, 'water'); block(3, 7);
    // sand rim around the fountain
    setTile(3, 5, 'sand'); setTile(3, 8, 'sand');
    setTile(2, 6, 'sand'); setTile(2, 7, 'sand');
    setTile(4, 6, 'sand'); setTile(4, 7, 'sand');
  },
  buildings: [
    // Mosque (2×2)
    { gridX: 6, gridY: 5, w: 2, h: 2, texture: 'mosque' },
    // Bazaar stalls
    { gridX: 11, gridY: 10, w: 1, h: 1, texture: 'stall' },
    { gridX: 15, gridY: 10, w: 1, h: 1, texture: 'stall' },
    { gridX: 11, gridY: 12, w: 1, h: 1, texture: 'stall' },
    // City gate at south-east
    { gridX: 14, gridY: 13, w: 1, h: 1, texture: 'gate' },
  ],
  decor: [
    // Trees scattered around the periphery
    { gridX: 0, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 1, gridY: 5, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 12, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 6, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 9, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 13, texture: 'tree', blocks: true },
    { gridX: 4, gridY: 12, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 13, texture: 'tree', blocks: true },
    // A well outside the mosque court
    { gridX: 10, gridY: 5, texture: 'well', blocks: true },
    // Market and evening details (non-blocking)
    { gridX: 10, gridY: 9, texture: 'crates' },
    { gridX: 16, gridY: 11, texture: 'crates' },
    { gridX: 12, gridY: 9, texture: 'rug' },
    { gridX: 14, gridY: 11, texture: 'rug' },
    { gridX: 9, gridY: 4, texture: 'lamp' },
    { gridX: 12, gridY: 13, texture: 'lamp' },
    { gridX: 4, gridY: 5, texture: 'ch1-birds' },
  ],
  npcs: [
    // The Weary Traveller — beside the gate
    { gridX: 15, gridY: 12, texture: 'npc-traveller',
      prompt: 'Speak with the Weary Traveller  [E]',
      action: { kind: 'dialogue', id: 'rumour-traveller' } },
    // The Cloth Merchant — among the stalls
    { gridX: 12, gridY: 10, texture: 'npc-merchant',
      prompt: 'Speak with the Cloth Merchant  [E]',
      action: { kind: 'dialogue', id: 'rumour-merchant' } },
    // The Stern Mullá — at the foot of the mosque
    { gridX: 7, gridY: 7, texture: 'npc-mulla',
      prompt: 'Speak with the Stern Mullá  [E]',
      action: { kind: 'dialogue', id: 'rumour-mulla' } },
    // The Water-Carrier — near the fountain
    { gridX: 4, gridY: 7, texture: 'ch1-npc-water-carrier',
      prompt: 'Speak with the Water-Carrier  [E]',
      action: { kind: 'dialogue', id: 'rumour-water-carrier' } },
    // The Gate Guard — watching late arrivals
    { gridX: 15, gridY: 13, texture: 'ch1-npc-guard',
      prompt: 'Speak with the Gate Guard  [E]',
      action: { kind: 'dialogue', id: 'rumour-gate-guard' } },
    // The Calligrapher — beside the bazaar cloths
    { gridX: 14, gridY: 9, texture: 'ch1-npc-calligrapher',
      prompt: 'Speak with the Calligrapher  [E]',
      action: { kind: 'dialogue', id: 'rumour-calligrapher' } },
    // The Mosque Orphan — near the mosque steps
    { gridX: 5, gridY: 8, texture: 'ch1-npc-beggar',
      prompt: 'Speak with the Mosque Orphan  [E]',
      action: { kind: 'dialogue', id: 'rumour-orphan' } },
  ],
  exits: [
    // Walk north off the path tile at (8, 0) → enter the Quiet Quarter
    { fromX: 8, fromY: 0, dx: 0, dy: -1,
      targetScene: 'HouseQuarter', targetSpawnX: 6, targetSpawnY: 13,
      label: '↑ Walk to the Quiet Quarter' },
  ],
};
