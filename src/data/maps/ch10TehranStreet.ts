import type { MapDefinition } from './types';

export const ch10TehranStreetMap: MapDefinition = {
  key: 'Ch10TehranStreet',
  title: 'Tihrán — Street of Accusation',
  width: 19,
  height: 11,
  spawn: { x: 1, y: 6 },
  build: ({ width, height, paintRect, setTile }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(2, 2, 15, 7, 'stone');

    for (let x = 0; x < width; x++) setTile(x, 6, 'path');
    for (let y = 2; y < 9; y++) setTile(4, y, 'path');
    for (let y = 3; y < 9; y++) setTile(14, y, 'path');

    paintRect(6, 3, 6, 1, 'path');
    paintRect(7, 8, 5, 1, 'path');
  },
  buildings: [
    { gridX: 2, gridY: 1, w: 3, h: 2, texture: 'ch10-street-house' },
    { gridX: 11, gridY: 1, w: 4, h: 2, texture: 'ch10-street-arch' },
    { gridX: 6, gridY: 8, w: 3, h: 2, texture: 'closed-door' },
  ],
  decor: [
    { gridX: 3, gridY: 4, texture: 'crowd-shadow' },
    { gridX: 5, gridY: 5, texture: 'crowd-shadow' },
    { gridX: 12, gridY: 5, texture: 'crowd-shadow' },
    { gridX: 15, gridY: 7, texture: 'crowd-shadow' },
    { gridX: 7, gridY: 4, texture: 'ch10-chain-coil', blocks: true },
    { gridX: 10, gridY: 7, texture: 'ch10-chain-coil', blocks: true },
    { gridX: 1, gridY: 3, texture: 'lamp', blocks: true },
    { gridX: 17, gridY: 4, texture: 'lamp', blocks: true },
  ],
  npcs: [
    { gridX: 13, gridY: 6, texture: 'ch10-guard',
      prompt: 'Speak with the guard  [E]',
      action: { kind: 'dialogue', id: 'ch10-guard' } },
    { gridX: 9, gridY: 6, texture: 'crowd-shadow',
      prompt: 'Listen to hostile whispers  [E]',
      action: { kind: 'dialogue', id: 'ch10-guard' } },
  ],
  exits: [
    { fromX: 18, fromY: 6, dx: 1, dy: 0,
      targetScene: 'Ch10SiyahChal', targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Descend toward the Síyáh-Chál' },
  ],
};
