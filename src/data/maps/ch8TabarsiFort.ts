import type { DecorSpec, MapDefinition } from './types';

const palisade: DecorSpec[] = [];
// Top wall (with shrine gate gap at x=7,8)
for (let x = 3; x <= 12; x++) {
  if (x !== 7 && x !== 8) {
    palisade.push({ gridX: x, gridY: 2, texture: 'ch8-palisade', blocks: true });
  }
}
// Bottom wall (closed)
for (let x = 3; x <= 12; x++) {
  palisade.push({ gridX: x, gridY: 10, texture: 'ch8-palisade', blocks: true });
}
// Left wall (with truce gate at y=6)
for (let y = 3; y <= 9; y++) {
  if (y !== 6) palisade.push({ gridX: 3, gridY: y, texture: 'ch8-palisade', blocks: true });
}
// Right wall (closed)
for (let y = 3; y <= 9; y++) {
  palisade.push({ gridX: 13, gridY: y, texture: 'ch8-palisade', blocks: true });
}

export const ch8TabarsiFortMap: MapDefinition = {
  key: 'Ch8TabarsiFort',
  title: 'Fort Shaykh Ṭabarsí',
  width: 16,
  height: 12,
  spawn: { x: 1, y: 6 },
  build: ({ width, paintRect, paintPath, setTile, block }) => {
    paintRect(0, 5, width, 3, 'sand');
    paintRect(3, 3, 10, 7, 'stone');
    paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
    ]);
    setTile(1, 1, 'water'); block(1, 1);
    setTile(14, 10, 'water'); block(14, 10);
  },
  buildings: [
    { gridX: 6, gridY: 4, w: 3, h: 3, texture: 'ch8-shrine' },
  ],
  decor: [
    ...palisade,
    { gridX: 4, gridY: 5, texture: 'ch8-truce-flag' },
    { gridX: 1, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 14, gridY: 3, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 9, texture: 'tree', blocks: true },
  ],
  npcs: [
    { gridX: 5, gridY: 5, texture: 'npc-merchant',
      prompt: 'Meet the officer under truce  [E]',
      action: { kind: 'dialogue', id: 'ch8-truce' } },
    { gridX: 9, gridY: 6, texture: 'npc-mulla',
      prompt: 'Seek Quddús’s counsel  [E]',
      action: { kind: 'dialogue', id: 'ch8-quddus-counsel' } },
    { gridX: 10, gridY: 8, texture: 'npc-traveller',
      prompt: 'Speak with the wounded witness  [E]',
      action: { kind: 'dialogue', id: 'ch8-mulla-husayn' } },
  ],
  exits: [
    { fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch8ForestRoad', targetSpawnX: 16, targetSpawnY: 5,
      label: '← Back to the forest road' },
  ],
};
