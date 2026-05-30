import type { MapDefinition } from './types';

export const ch6ChihriqMap: MapDefinition = {
  key: 'Ch6Chihriq',
  title: 'Chihríq — the Grievous Mountain',
  width: 17,
  height: 12,
  spawn: { x: 1, y: 6 },
  build: ({ width, height, paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, width, height, 'stone');
    paintRect(0, 0, 5, 3, 'sand');
    paintRect(10, 1, 5, 2, 'sand');
    paintRect(12, 8, 4, 3, 'sand');

    paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [12, 6], [13, 6],
      [13, 7], [13, 8], [12, 8], [11, 8],
    ]);

    setTile(2, 9, 'water'); block(2, 9);
    setTile(2, 10, 'water'); block(2, 10);
    setTile(3, 10, 'water'); block(3, 10);
  },
  buildings: [
    { gridX: 10, gridY: 3, w: 3, h: 3, texture: 'ch6-chihriq-fortress' },
  ],
  decor: [
    { gridX: 1, gridY: 2, texture: 'ch6-rock', blocks: true },
    { gridX: 4, gridY: 1, texture: 'ch6-rock', blocks: true },
    { gridX: 7, gridY: 2, texture: 'ch6-rock', blocks: true },
    { gridX: 15, gridY: 2, texture: 'ch6-rock', blocks: true },
    { gridX: 3, gridY: 8, texture: 'ch6-rock', blocks: true },
    { gridX: 6, gridY: 9, texture: 'ch6-rock', blocks: true },
    { gridX: 8, gridY: 10, texture: 'ch6-rock', blocks: true },
    { gridX: 14, gridY: 10, texture: 'ch6-rock', blocks: true },
    { gridX: 16, gridY: 7, texture: 'ch6-rock', blocks: true },
    { gridX: 15, gridY: 5, texture: 'ch6-rock', blocks: true },
    { gridX: 9, gridY: 4, texture: 'ch6-barred-marker', blocks: true },
    { gridX: 13, gridY: 4, texture: 'ch6-barred-marker', blocks: true },
    { gridX: 10, gridY: 7, texture: 'ch6-barred-marker', blocks: true },
    { gridX: 14, gridY: 6, texture: 'ch6-barred-marker', blocks: true },
  ],
  npcs: [
    { gridX: 5, gridY: 6, texture: 'ch6-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      action: { kind: 'dialogue', id: 'ch6-mulla-husayn-visit' } },
    { gridX: 12, gridY: 7, texture: 'writing-desk',
      prompt: 'Read at the writing desk  [E]',
      action: { kind: 'dialogue', id: 'ch6-bayan' } },
  ],
  exits: [
    { fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch6Maku', targetSpawnX: 14, targetSpawnY: 6,
      label: '← Back toward Mákú' },
  ],
};
