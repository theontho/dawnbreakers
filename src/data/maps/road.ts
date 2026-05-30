import type { MapDefinition } from './types';

/** Chapter 2 — a dusty road north of Shíráz where conviction becomes movement. */
export const roadMap: MapDefinition = {
  key: 'Road',
  title: 'The Road North',
  width: 20,
  height: 10,
  spawn: { x: 1, y: 5 },
  build: ({ width, height, paintRect, paintPath, setTile }) => {
    paintRect(0, 0, width, height, 'sand');

    paintPath([
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
      [5, 4], [6, 4], [7, 4], [8, 5], [9, 5],
      [10, 5], [11, 5], [12, 4], [13, 4], [14, 4],
      [15, 5], [16, 5], [17, 5], [18, 4], [19, 4],
    ]);

    paintRect(4, 7, 9, 1, 'stone');
    paintRect(6, 8, 6, 1, 'stone');
    paintRect(3, 1, 5, 3, 'path');
    paintRect(14, 1, 5, 4, 'path');
    setTile(8, 2, 'grass');
    setTile(15, 8, 'grass');
  },
  buildings: [
    { gridX: 15, gridY: 1, w: 3, h: 2, texture: 'ch2-caravanserai' },
  ],
  decor: [
    { gridX: 5, gridY: 2, texture: 'ch2-shrine', blocks: true },
    { gridX: 10, gridY: 4, texture: 'ch2-milestone', blocks: true },
    { gridX: 18, gridY: 2, texture: 'well', blocks: true },
    // Dry stream stones (non-blocking)
    { gridX: 5, gridY: 7, texture: 'ch2-dry-stream' },
    { gridX: 7, gridY: 8, texture: 'ch2-dry-stream' },
    { gridX: 9, gridY: 7, texture: 'ch2-dry-stream' },
    { gridX: 11, gridY: 8, texture: 'ch2-dry-stream' },
    // Cypresses
    { gridX: 2, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 7, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 13, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 1, gridY: 8, texture: 'cypress', blocks: true },
    { gridX: 17, gridY: 8, texture: 'cypress', blocks: true },
    // Tamarisks
    { gridX: 3, gridY: 8, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 8, gridY: 2, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 12, gridY: 7, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 19, gridY: 7, texture: 'ch2-tamarisk', blocks: true },
  ],
  npcs: [
    { gridX: 12, gridY: 5, texture: 'npc-traveller',
      prompt: 'Speak with Another Seeker  [E]',
      action: { kind: 'dialogue', id: 'road-encounter' } },
    { gridX: 6, gridY: 3, texture: 'npc-mulla',
      prompt: 'Speak with the Wandering Dervish  [E]',
      action: { kind: 'dialogue', id: 'road-dervish' } },
    { gridX: 18, gridY: 5, texture: 'npc-merchant',
      prompt: 'Speak with the Muleteer  [E]',
      action: { kind: 'dialogue', id: 'road-muleteer' } },
  ],
  exits: [
    { fromX: 0, fromY: 5, dx: -1, dy: 0,
      targetScene: 'HouseQuarter', targetSpawnX: 6, targetSpawnY: 13,
      label: '← Back to Shíráz' },
  ],
};
