import type { MapDefinition } from './types';

export const ch10SiyahChalMap: MapDefinition = {
  key: 'Ch10SiyahChal',
  title: 'Síyáh-Chál — the Black Pit',
  width: 16,
  height: 12,
  spawn: { x: 1, y: 6 },
  build: ({ width, height, paintRect, block }) => {
    paintRect(0, 0, width, height, 'stone');
    paintRect(1, 2, 14, 8, 'path');
    paintRect(5, 4, 6, 3, 'sand');

    for (let x = 1; x < width; x++) {
      if (x !== 8) block(x, 0);
      if (x !== 4 && x !== 5) block(x, 11);
    }
    for (let y = 0; y < height; y++) {
      if (y !== 6) block(0, y);
      if (y !== 5 && y !== 6) block(15, y);
    }
  },
  buildings: [
    { gridX: 6, gridY: 1, w: 4, h: 1, texture: 'ch10-low-arch' },
    { gridX: 12, gridY: 3, w: 2, h: 2, texture: 'ch10-stone-pillar' },
  ],
  decor: [
    { gridX: 3, gridY: 3, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 7, gridY: 8, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 11, gridY: 7, texture: 'ch10-chain-pillar', blocks: true },
    { gridX: 5, gridY: 7, texture: 'lamp', blocks: true },
    { gridX: 2, gridY: 9, texture: 'ch10-chain-coil', blocks: true },
    { gridX: 13, gridY: 8, texture: 'ch10-chain-coil', blocks: true },
  ],
  npcs: [
    { gridX: 8, gridY: 5, texture: 'ch10-light-shaft',
      prompt: 'Attend to the shaft of light  [E]',
      action: { kind: 'dialogue', id: 'ch10-vision' } },
    { gridX: 4, gridY: 6, texture: 'ch10-prisoner',
      prompt: 'Speak with the fellow prisoner  [E]',
      action: { kind: 'dialogue', id: 'ch10-prisoner' } },
    { gridX: 6, gridY: 8, texture: 'ch10-chain-post',
      prompt: 'Touch the heavy chain  [E]',
      action: { kind: 'dialogue', id: 'ch10-vision' } },
  ],
  exits: [
    { fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch10TehranStreet', targetSpawnX: 17, targetSpawnY: 6,
      label: '← Back toward the street above' },
  ],
};
