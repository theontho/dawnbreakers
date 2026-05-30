import type { MapDefinition } from './types';

export const ch3MeccaMap: MapDefinition = {
  key: 'Ch3Mecca',
  title: 'Mecca — the Sacred Courtyard',
  width: 16,
  height: 12,
  spawn: { x: 1, y: 6 },
  build: ({ width, height, paintRect, paintPath }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(1, 1, 14, 10, 'stone');
    paintRect(2, 2, 12, 8, 'path');
    paintRect(5, 4, 5, 3, 'stone');

    paintPath([
      [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
    ]);
  },
  buildings: [
    { gridX: 6, gridY: 4, w: 3, h: 2, texture: 'ch3-kaaba' },
  ],
  decor: [
    { gridX: 3, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 12, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 4, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 11, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true },
  ],
  npcs: [
    { gridX: 9, gridY: 6, texture: 'ch3-courtyard-hush',
      prompt: 'Stand where the proclamation is heard  [E]',
      action: { kind: 'dialogue', id: 'ch3-proclamation' } },
    { gridX: 5, gridY: 7, texture: 'ch3-muhit',
      prompt: 'Speak with Mírzá Muḥíṭ-i-Kirmání  [E]',
      action: { kind: 'dialogue', id: 'ch3-pilgrim-question' } },
    { gridX: 12, gridY: 6, texture: 'ch3-pilgrim',
      prompt: 'Ask a pilgrim quietly  [E]',
      action: { kind: 'dialogue', id: 'ch3-pilgrim-question' } },
  ],
  exits: [
    { fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch3Ship', targetSpawnX: 12, targetSpawnY: 4,
      label: '← Back toward the ship' },
  ],
};
