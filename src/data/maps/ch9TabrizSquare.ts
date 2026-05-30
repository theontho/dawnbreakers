import type { MapDefinition } from './types';

export const ch9TabrizSquareMap: MapDefinition = {
  key: 'Ch9TabrizSquare',
  title: 'Tabríz — the Public Square',
  width: 18,
  height: 12,
  spawn: { x: 2, y: 7 },
  build: ({ width, height, paintRect, setTile }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(2, 2, 14, 8, 'stone');

    for (let x = 0; x < width; x++) setTile(x, 7, 'path');
    for (let y = 1; y < height; y++) setTile(9, y, 'path');

    paintRect(4, 4, 4, 2, 'stone');
    paintRect(11, 4, 3, 2, 'stone');
  },
  buildings: [
    { gridX: 12, gridY: 1, w: 3, h: 2, texture: 'ch9-barrack-front' },
  ],
  decor: [
    { gridX: 1, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 16, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 3, texture: 'lamp', blocks: true },
    { gridX: 15, gridY: 8, texture: 'lamp', blocks: true },
    { gridX: 5, gridY: 4, texture: 'crowd-shadow' },
    { gridX: 6, gridY: 5, texture: 'crowd-shadow' },
    { gridX: 12, gridY: 5, texture: 'crowd-shadow' },
    { gridX: 13, gridY: 6, texture: 'crowd-shadow' },
    { gridX: 4, gridY: 9, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 10, gridY: 10, texture: 'ch9-cloth-bundle', blocks: true },
  ],
  npcs: [
    { gridX: 7, gridY: 6, texture: 'ch9-witness',
      prompt: 'Speak with the crowd witness  [E]',
      action: { kind: 'dialogue', id: 'ch9-crowd-witness' } },
    { gridX: 14, gridY: 7, texture: 'ch9-soldier',
      prompt: 'Speak with a soldier  [E]',
      action: { kind: 'dialogue', id: 'ch9-crowd-witness' } },
    { gridX: 6, gridY: 9, texture: 'ch9-final-witness',
      prompt: 'Speak with the final witness  [E]',
      action: { kind: 'dialogue', id: 'ch9-final-witness' } },
  ],
  exits: [
    { fromX: 17, fromY: 7, dx: 1, dy: 0,
      targetScene: 'Ch9BarrackRoof', targetSpawnX: 1, targetSpawnY: 6,
      label: '→ The barrack stair' },
  ],
};
