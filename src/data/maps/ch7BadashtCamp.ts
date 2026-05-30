import type { MapDefinition } from './types';

/** Chapter 7 — the Conference of Badasht, held among three distinct camps. */
export const ch7BadashtCampMap: MapDefinition = {
  key: 'Ch7BadashtCamp',
  title: 'Badasht — Garden Encampment',
  width: 18,
  height: 13,
  spawn: { x: 8, y: 6 },
  build: ({ width, height, paintRect, paintPath }) => {
    paintRect(0, 0, width, height, 'sand');

    paintRect(1, 1, 5, 4, 'grass');
    paintRect(12, 1, 5, 4, 'grass');
    paintRect(5, 8, 8, 4, 'grass');
    paintRect(7, 5, 4, 3, 'stone');

    paintRect(2, 3, 3, 1, 'path');
    paintRect(13, 3, 3, 1, 'path');
    paintRect(7, 9, 4, 1, 'path');

    paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6],
      [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6],
      [4, 5], [5, 5], [6, 5], [11, 5], [12, 5], [13, 5],
      [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [9, 7], [9, 8], [9, 9], [9, 10],
    ]);
  },
  buildings: [
    { gridX: 1, gridY: 2, w: 3, h: 2, texture: 'ch7-tent-reconciliation' },
    { gridX: 14, gridY: 2, w: 3, h: 2, texture: 'ch7-tent-quddus' },
    { gridX: 7, gridY: 10, w: 3, h: 2, texture: 'ch7-garden-canopy' },
  ],
  decor: [
    // Trees
    { gridX: 0, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 1, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 5, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 5, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 5, texture: 'tree', blocks: true },
    { gridX: 4, gridY: 9, texture: 'tree', blocks: true },
    { gridX: 5, gridY: 11, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 9, texture: 'tree', blocks: true },
    { gridX: 13, gridY: 11, texture: 'tree', blocks: true },
    { gridX: 10, gridY: 12, texture: 'tree', blocks: true },
    // Camp details
    { gridX: 4, gridY: 3, texture: 'rug' },
    { gridX: 13, gridY: 3, texture: 'rug' },
    { gridX: 10, gridY: 9, texture: 'rug' },
    { gridX: 6, gridY: 8, texture: 'lamp' },
    { gridX: 11, gridY: 8, texture: 'lamp' },
    { gridX: 6, gridY: 11, texture: 'ch7-rosebush', blocks: true },
    { gridX: 11, gridY: 11, texture: 'ch7-rosebush', blocks: true },
    { gridX: 3, gridY: 1, texture: 'lamp' },
    { gridX: 15, gridY: 1, texture: 'lamp' },
  ],
  npcs: [
    { gridX: 8, gridY: 9, texture: 'ch7-npc-tahirih',
      prompt: 'Speak with Ṭáhirih  [E]',
      action: { kind: 'dialogue', id: 'ch7-unveiling' } },
    { gridX: 13, gridY: 5, texture: 'ch7-npc-quddus',
      prompt: 'Speak with Quddús  [E]',
      action: { kind: 'dialogue', id: 'ch7-quddus-tension' } },
    { gridX: 5, gridY: 5, texture: 'lamp',
      prompt: 'Listen at the central tent  [E]',
      action: { kind: 'dialogue', id: 'ch7-bahaullah-reconcile' } },
    { gridX: 9, gridY: 5, texture: 'ch7-npc-believer',
      prompt: 'Speak with a shaken believer  [E]',
      action: { kind: 'dialogue', id: 'ch7-shaken-believer' } },
  ],
  // The chapter selector and manager own inter-chapter travel for this scene.
  exits: [],
};
