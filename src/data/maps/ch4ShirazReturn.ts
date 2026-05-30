import type { MapDefinition } from './types';

export const ch4ShirazReturnMap: MapDefinition = {
  key: 'Ch4ShirazReturn',
  title: 'Return to Shíráz',
  width: 16,
  height: 11,
  spawn: { x: 1, y: 5 },
  build: ({ width, height, paintRect, block }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(0, 4, width, 3, 'path');
    paintRect(3, 0, 2, height, 'stone');
    paintRect(11, 0, 2, height, 'stone');
    paintRect(0, 0, width, 1, 'stone');
    paintRect(0, 10, width, 1, 'stone');

    for (let x = 0; x < width; x++) {
      if (x !== 1 && x !== 14) {
        block(x, 0);
        block(x, 10);
      }
    }
  },
  buildings: [
    { gridX: 1, gridY: 1, w: 2, h: 2, texture: 'house' },
    { gridX: 5, gridY: 1, w: 2, h: 2, texture: 'house' },
    { gridX: 9, gridY: 1, w: 2, h: 2, texture: 'house' },
    { gridX: 13, gridY: 1, w: 2, h: 2, texture: 'house' },
    { gridX: 2, gridY: 8, w: 2, h: 2, texture: 'house' },
    { gridX: 6, gridY: 8, w: 2, h: 2, texture: 'house' },
    { gridX: 10, gridY: 8, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    { gridX: 4, gridY: 3, texture: 'closed-door', blocks: true },
    { gridX: 8, gridY: 3, texture: 'closed-door', blocks: true },
    { gridX: 13, gridY: 7, texture: 'closed-door', blocks: true },
    { gridX: 2, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 12, gridY: 6, texture: 'lamp', blocks: true },
    { gridX: 5, gridY: 7, texture: 'crowd', blocks: true },
    { gridX: 10, gridY: 7, texture: 'crowd', blocks: true },
    { gridX: 15, gridY: 4, texture: 'gate', blocks: true },
  ],
  npcs: [
    { gridX: 6, gridY: 5, texture: 'ch4-officer',
      prompt: 'Hear the officer of Ḥusayn Khán  [E]',
      action: { kind: 'dialogue', id: 'ch4-officer-warning' } },
    { gridX: 9, gridY: 5, texture: 'ch4-quddus',
      prompt: 'Stand with Quddús  [E]',
      action: { kind: 'dialogue', id: 'ch4-quddus-witness' } },
    { gridX: 4, gridY: 6, texture: 'ch4-townsman',
      prompt: 'Speak with a frightened townsman  [E]',
      action: { kind: 'dialogue', id: 'ch4-quddus-witness' } },
  ],
  exits: [
    { fromX: 15, fromY: 5, dx: 1, dy: 0,
      targetScene: 'Ch4VakilMosque', targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Toward the Vakíl Mosque' },
  ],
};
