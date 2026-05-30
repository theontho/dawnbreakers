import type { MapDefinition } from './types';

export const ch6MakuMap: MapDefinition = {
  key: 'Ch6Maku',
  title: 'Mákú — Mountain Fortress',
  width: 16,
  height: 11,
  spawn: { x: 1, y: 6 },
  build: ({ width, height, paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, width, height, 'stone');
    paintRect(0, 0, width, 2, 'sand');
    paintRect(2, 8, 6, 2, 'sand');
    paintRect(12, 2, 3, 3, 'sand');

    paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [12, 6], [13, 6], [14, 6], [15, 6],
      [7, 5], [8, 5], [9, 5],
    ]);

    setTile(1, 1, 'water'); block(1, 1);
    setTile(1, 2, 'water'); block(1, 2);
    setTile(12, 9, 'water'); block(12, 9);
    setTile(13, 9, 'water'); block(13, 9);
  },
  buildings: [
    { gridX: 8, gridY: 2, w: 3, h: 3, texture: 'ch6-maku-fortress' },
  ],
  decor: [
    { gridX: 0, gridY: 3, texture: 'ch6-rock', blocks: true },
    { gridX: 2, gridY: 2, texture: 'ch6-rock', blocks: true },
    { gridX: 4, gridY: 1, texture: 'ch6-rock', blocks: true },
    { gridX: 6, gridY: 3, texture: 'ch6-rock', blocks: true },
    { gridX: 12, gridY: 1, texture: 'ch6-rock', blocks: true },
    { gridX: 14, gridY: 4, texture: 'ch6-rock', blocks: true },
    { gridX: 2, gridY: 9, texture: 'ch6-rock', blocks: true },
    { gridX: 5, gridY: 9, texture: 'ch6-rock', blocks: true },
    { gridX: 9, gridY: 9, texture: 'ch6-rock', blocks: true },
    { gridX: 11, gridY: 8, texture: 'ch6-rock', blocks: true },
    { gridX: 15, gridY: 9, texture: 'ch6-rock', blocks: true },
    { gridX: 3, gridY: 4, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 5, gridY: 7, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 13, gridY: 3, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 7, gridY: 8, texture: 'ch6-snow-shrub', blocks: true },
    { gridX: 14, gridY: 8, texture: 'ch6-snow-shrub', blocks: true },
  ],
  npcs: [
    { gridX: 7, gridY: 6, texture: 'ch6-warden',
      prompt: 'Speak with ʿAlí Khán  [E]',
      action: { kind: 'dialogue', id: 'ch6-warden-softens' } },
    { gridX: 3, gridY: 7, texture: 'ch6-courier',
      prompt: 'Speak with the Mountain Courier  [E]',
      action: { kind: 'dialogue', id: 'ch6-prisoner-courier' } },
  ],
  exits: [
    { fromX: 15, fromY: 6, dx: 1, dy: 0,
      targetScene: 'Ch6Chihriq', targetSpawnX: 1, targetSpawnY: 6,
      label: '→ The harsher road to Chihríq' },
  ],
};
