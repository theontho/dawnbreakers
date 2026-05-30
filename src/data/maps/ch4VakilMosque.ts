import type { MapDefinition } from './types';

export const ch4VakilMosqueMap: MapDefinition = {
  key: 'Ch4VakilMosque',
  title: 'Vakíl Mosque',
  width: 16,
  height: 12,
  spawn: { x: 1, y: 6 },
  build: ({ width, height, paintRect, block }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(2, 2, 12, 8, 'stone');
    paintRect(0, 5, width, 3, 'path');
    paintRect(6, 1, 4, 9, 'stone');

    for (let x = 2; x <= 13; x++) {
      block(x, 1);
      block(x, 10);
    }
    for (let y = 2; y <= 9; y++) {
      block(1, y);
      block(14, y);
    }
  },
  buildings: [
    { gridX: 6, gridY: 2, w: 4, h: 2, texture: 'ch4-prayer-arch' },
  ],
  decor: [
    { gridX: 7, gridY: 4, texture: 'ch4-pulpit', blocks: true },
    { gridX: 5, gridY: 5, texture: 'crowd', blocks: true },
    { gridX: 10, gridY: 5, texture: 'crowd', blocks: true },
    { gridX: 4, gridY: 8, texture: 'crowd', blocks: true },
    { gridX: 11, gridY: 8, texture: 'crowd', blocks: true },
    { gridX: 2, gridY: 3, texture: 'well', blocks: true },
    { gridX: 13, gridY: 3, texture: 'tree', blocks: true },
  ],
  npcs: [
    { gridX: 8, gridY: 4, texture: 'crowd',
      prompt: 'Stand among the listening crowd  [E]',
      action: { kind: 'dialogue', id: 'ch4-house-arrest' } },
    { gridX: 8, gridY: 7, texture: 'ch4-witness',
      prompt: 'Ask the mosque witness  [E]',
      action: { kind: 'dialogue', id: 'ch4-house-arrest' } },
    { gridX: 5, gridY: 7, texture: 'ch4-officer',
      prompt: 'Hear the officer warning  [E]',
      action: { kind: 'dialogue', id: 'ch4-officer-warning' } },
  ],
  exits: [
    { fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch4ShirazReturn', targetSpawnX: 14, targetSpawnY: 5,
      label: '← Back to the tense streets' },
  ],
};
