import type { MapDefinition } from './types';

export const ch8ForestRoadMap: MapDefinition = {
  key: 'Ch8ForestRoad',
  title: 'Mazandaran Forest Road',
  width: 18,
  height: 10,
  spawn: { x: 1, y: 5 },
  build: ({ width, paintRect, paintPath, setTile, block }) => {
    paintRect(0, 6, width, 2, 'sand');
    paintPath([
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 6], [5, 6],
      [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5],
      [12, 5], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5],
    ]);
    setTile(5, 3, 'water'); block(5, 3);
    setTile(12, 7, 'water'); block(12, 7);
    setTile(15, 6, 'water'); block(15, 6);
  },
  buildings: [
    { gridX: 15, gridY: 1, w: 2, h: 2, texture: 'ch8-shrine-glimpse' },
  ],
  decor: [
    { gridX: 0, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 1, gridY: 8, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 3, gridY: 3, texture: 'tree', blocks: true },
    { gridX: 4, gridY: 8, texture: 'tree', blocks: true },
    { gridX: 6, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 7, gridY: 8, texture: 'tree', blocks: true },
    { gridX: 9, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 10, gridY: 8, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 13, gridY: 8, texture: 'tree', blocks: true },
    { gridX: 15, gridY: 8, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 3, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 7, texture: 'tree', blocks: true },
  ],
  npcs: [
    { gridX: 8, gridY: 4, texture: 'npc-mulla',
      prompt: 'Hear of Mullá Ḥusayn  [E]',
      action: { kind: 'dialogue', id: 'ch8-mulla-husayn' } },
  ],
  exits: [
    { fromX: 17, fromY: 5, dx: 1, dy: 0,
      targetScene: 'Ch8TabarsiFort', targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Toward the shrine palisade' },
  ],
};
