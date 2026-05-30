import type { MapDefinition } from './types';

export const ch3ShipMap: MapDefinition = {
  key: 'Ch3Ship',
  title: 'Pilgrimage — Aboard Ship',
  width: 14,
  height: 9,
  spawn: { x: 3, y: 4 },
  build: ({ width, height, paintRect, block, unblock }) => {
    paintRect(0, 0, width, height, 'water');

    // Block the entire surface — water everywhere is impassable.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) block(x, y);
    }

    paintRect(2, 2, 9, 5, 'path');
    paintRect(4, 3, 5, 3, 'sand');
    paintRect(11, 4, 3, 1, 'path');

    // Re-open the deck and the gangway as walkable
    for (let y = 2; y <= 6; y++) {
      for (let x = 2; x <= 10; x++) unblock(x, y);
    }
    unblock(11, 4); unblock(12, 4); unblock(13, 4);
  },
  buildings: [
    // The ship is formed from walkable deck tiles and local decor textures.
  ],
  decor: [
    { gridX: 6, gridY: 3, texture: 'ch3-mast', blocks: true },
    { gridX: 3, gridY: 2, texture: 'ch3-ship-rail', blocks: true },
    { gridX: 4, gridY: 6, texture: 'ch3-ship-rail', blocks: true },
    { gridX: 8, gridY: 2, texture: 'ch3-ship-rail', blocks: true },
    { gridX: 9, gridY: 6, texture: 'ch3-ship-rail', blocks: true },
    { gridX: 3, gridY: 5, texture: 'crates', blocks: true },
    { gridX: 8, gridY: 5, texture: 'crates', blocks: true },
  ],
  npcs: [
    { gridX: 5, gridY: 4, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús  [E]',
      action: { kind: 'dialogue', id: 'ch3-quddus-ship' } },
    { gridX: 9, gridY: 5, texture: 'ch3-sailor',
      prompt: 'Ask the sailor about the crossing  [E]',
      action: { kind: 'dialogue', id: 'ch3-pilgrim-question' } },
    { gridX: 7, gridY: 6, texture: 'ch3-ship-pilgrim',
      prompt: 'Speak with a quiet pilgrim  [E]',
      action: { kind: 'dialogue', id: 'ch3-pilgrim-question' } },
  ],
  exits: [
    { fromX: 13, fromY: 4, dx: 1, dy: 0,
      targetScene: 'Ch3Mecca', targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Toward Mecca' },
  ],
};
