import type { MapDefinition } from './types';

export const ch9BarrackRoofMap: MapDefinition = {
  key: 'Ch9BarrackRoof',
  title: 'Tabríz — the Barrack Roof',
  width: 16,
  height: 10,
  spawn: { x: 1, y: 6 },
  build: ({ width, height, paintRect, block }) => {
    paintRect(0, 0, width, height, 'stone');
    paintRect(0, 6, 4, 2, 'path');
    paintRect(9, 3, 4, 3, 'sand');

    for (let x = 2; x < width; x++) {
      block(x, 0);
      if (x !== 7 && x !== 8) block(x, 9);
    }
    for (let y = 1; y < height - 1; y++) {
      block(15, y);
    }
  },
  buildings: [
    { gridX: 2, gridY: 0, w: 14, h: 1, texture: 'ch9-roof-north-wall', blocks: false },
    { gridX: 15, gridY: 1, w: 1, h: 8, texture: 'ch9-roof-east-wall', blocks: false },
    { gridX: 2, gridY: 9, w: 5, h: 1, texture: 'ch9-roof-south-wall-left', blocks: false },
    { gridX: 9, gridY: 9, w: 7, h: 1, texture: 'ch9-roof-south-wall-right', blocks: false },
    { gridX: 5, gridY: 1, w: 4, h: 1, texture: 'ch9-roof-parapet' },
  ],
  decor: [
    { gridX: 10, gridY: 4, texture: 'ch9-rope-coils', blocks: true },
    { gridX: 12, gridY: 4, texture: 'ch9-rope-coils', blocks: true },
    { gridX: 3, gridY: 2, texture: 'lamp', blocks: true },
    { gridX: 13, gridY: 7, texture: 'lamp', blocks: true },
    { gridX: 6, gridY: 8, texture: 'ch9-empty-space' },
    { gridX: 8, gridY: 8, texture: 'ch9-empty-space' },
  ],
  npcs: [
    { gridX: 7, gridY: 5, texture: 'ch9-sam-khan',
      prompt: 'Speak with Sám Khán  [E]',
      action: { kind: 'dialogue', id: 'ch9-sam-khan' } },
    { gridX: 5, gridY: 6, texture: 'ch9-soldier',
      prompt: 'Speak with the waiting soldier  [E]',
      action: { kind: 'dialogue', id: 'ch9-crowd-witness' } },
    { gridX: 11, gridY: 5, texture: 'ch9-empty-space',
      prompt: 'Stand in solemn witness  [E]',
      action: { kind: 'dialogue', id: 'ch9-final-witness' } },
  ],
  exits: [
    { fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch9TabrizSquare', targetSpawnX: 16, targetSpawnY: 7,
      label: '← Back to the square' },
  ],
};
