import type { MapDefinition } from './types';

export const ch5IsfahanBridgeMap: MapDefinition = {
  key: 'Ch5IsfahanBridge',
  title: 'Iṣfahán — Bridge of Arrival',
  width: 20,
  height: 12,
  spawn: { x: 1, y: 7 },
  build: ({ width, paintRect, paintPath, setTile, block, unblock }) => {
    paintRect(0, 0, width, 12, 'sand');
    paintRect(12, 0, 8, 5, 'stone');
    paintRect(0, 8, 7, 4, 'grass');

    // The river runs east-west across rows 5–6
    for (let x = 0; x < width; x++) {
      setTile(x, 5, 'water');
      setTile(x, 6, 'water');
      block(x, 5);
      block(x, 6);
    }

    // Bridge span re-opens those tiles
    paintRect(8, 5, 5, 2, 'stone');
    for (let x = 8; x <= 12; x++) {
      unblock(x, 5);
      unblock(x, 6);
    }

    paintPath([
      [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7],
      [8, 6], [9, 6], [10, 6], [11, 6], [12, 6],
      [12, 5], [12, 4], [13, 4], [14, 4], [15, 4], [16, 4], [17, 4],
      [18, 4], [19, 4], [19, 5],
    ]);
    unblock(19, 5);

    // A small reflecting pool off-path
    setTile(3, 4, 'water');
    block(3, 4);
  },
  buildings: [
    { gridX: 8, gridY: 5, w: 5, h: 2, texture: 'ch5-bridge-span', blocks: false },
    { gridX: 15, gridY: 1, w: 1, h: 1, texture: 'gate' },
    { gridX: 3, gridY: 8, w: 1, h: 1, texture: 'ch5-market-awning' },
  ],
  decor: [
    { gridX: 2, gridY: 5, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 6, gridY: 6, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 14, gridY: 5, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 17, gridY: 6, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 4, gridY: 4, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 0, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 6, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 14, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 18, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 5, gridY: 8, texture: 'well', blocks: true },
  ],
  npcs: [
    { gridX: 6, gridY: 7, texture: 'npc-merchant',
      prompt: 'Speak with a Market Visitor  [E]',
      action: { kind: 'dialogue', id: 'ch5-arrival' } },
    { gridX: 13, gridY: 4, texture: 'npc-mulla',
      prompt: 'Speak with the Learned Cleric  [E]',
      action: { kind: 'dialogue', id: 'ch5-cleric-question' } },
  ],
  exits: [
    { fromX: 19, fromY: 5, dx: 1, dy: 0,
      targetScene: 'Ch5MutamidPalace', targetSpawnX: 1, targetSpawnY: 7,
      label: '→ Go to the Muʿtamid\'s palace' },
  ],
};
