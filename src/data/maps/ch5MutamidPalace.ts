import type { MapDefinition } from './types';

export const ch5MutamidPalaceMap: MapDefinition = {
  key: 'Ch5MutamidPalace',
  title: 'Iṣfahán — the Muʿtamid\'s Sanctuary',
  width: 18,
  height: 14,
  spawn: { x: 1, y: 7 },
  build: ({ width, height, paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(3, 4, 12, 7, 'stone');
    paintRect(5, 6, 7, 3, 'sand');
    paintPath([[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7]]);

    setTile(4, 6, 'water');
    setTile(4, 7, 'water');
    block(4, 6);
    block(4, 7);
  },
  buildings: [
    { gridX: 6, gridY: 1, w: 5, h: 3, texture: 'ch5-palace-portico' },
  ],
  decor: [
    { gridX: 8, gridY: 6, texture: 'rug' },
    { gridX: 2, gridY: 4, texture: 'cypress', blocks: true },
    { gridX: 15, gridY: 4, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 11, texture: 'cypress', blocks: true },
    { gridX: 14, gridY: 11, texture: 'cypress', blocks: true },
    { gridX: 12, gridY: 5, texture: 'well', blocks: true },
  ],
  npcs: [
    { gridX: 7, gridY: 6, texture: 'npc-merchant',
      prompt: 'Speak with Manúchihr Khán  [E]',
      action: { kind: 'dialogue', id: 'ch5-mutamid' } },
    { gridX: 5, gridY: 6, texture: 'npc-mulla',
      prompt: 'Speak with the Imám-Jumʿih  [E]',
      action: { kind: 'dialogue', id: 'ch5-cleric-question' } },
    { gridX: 10, gridY: 7, texture: 'writing-desk',
      prompt: 'Read beside the revealed treatise  [E]',
      action: { kind: 'dialogue', id: 'ch5-treatise' } },
  ],
  exits: [
    { fromX: 0, fromY: 7, dx: -1, dy: 0,
      targetScene: 'Ch5IsfahanBridge', targetSpawnX: 18, targetSpawnY: 5,
      label: '← Return to the bridge' },
  ],
};
