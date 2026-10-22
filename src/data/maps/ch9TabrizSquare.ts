import { squareWitnessCount } from '../dialogues_ch/chapter09_tabriz';
import type { DecorSpec, MapDefinition } from './types';

/**
 * The barrack square of Tabríz, 9 July 1850. The long barrack closes the
 * north side: a low cell door, the pillar with its nail, the next room's
 * door. Sám Khán's regiment stands in file; the crowd presses at the edges
 * and on the houses around. The street from the city comes in from the
 * south-west; a stair to the rooftops leaves from the east.
 *
 * Before the hour (until `ch9WitnessedVolleys`) the square holds Anís, Sám
 * Khán, and his soldier. Afterwards it holds the severed ropes, the open
 * cell, and witnesses.
 */

const after = (f: Record<string, unknown>) => !!f.ch9WitnessedVolleys;

const CROWD_EDGE: DecorSpec[] = [
  ...[4, 5, 7, 8, 12, 13, 15, 16, 18, 19].map(x => ({ gridX: x, gridY: 18, texture: 'crowd', blocks: true })),
  ...[5, 6, 8, 9, 14, 15, 17].map(y => ({ gridX: 21, gridY: y, texture: 'crowd', blocks: true })),
  ...[10, 11, 13].map(y => ({ gridX: 2, gridY: y, texture: 'crowd', blocks: true })),
];

const SHADOWS: DecorSpec[] = [
  [5, 9], [8, 11], [11, 15], [14, 16], [19, 14], [9, 16], [4, 12], [19, 5],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd-shadow' }));

// Sám Khán's regiment, drawn up facing the pillar.
// Sám Khán's file stands in the square until his regiment marches out after the first volley.
const FILE: DecorSpec[] = [7, 8, 10, 11].map(y => ({
  gridX: 16, gridY: y, texture: 'ch9-soldier', blocks: true, present: f => !f.firstVolleyFailed,
}));

export const ch9TabrizSquareMap: MapDefinition = {
  key: 'Ch9TabrizSquare',
  title: 'Tabríz, the Barrack Square',
  width: 28,
  height: 24,
  spawn: { x: 1, y: 19 },
  build: ({ width, height, paintRect, paintPath, block }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(3, 4, 19, 14, 'stone');
    // Packed earth before the barrack where the order is carried out
    paintRect(6, 4, 7, 2, 'sand');
    // Street from the city, and the way to the rooftop stair
    paintPath([[0, 19], [1, 19], [2, 19], [3, 19], [3, 18], [3, 17]]);
    paintPath([[22, 12], [23, 12], [24, 12], [25, 12], [26, 12], [27, 12]]);
    paintPath([[10, 18], [10, 19], [10, 20], [10, 21], [10, 22], [10, 23]]);
    // Keep the cell door and the pillar apart: the wall between them is solid.
    block(8, 4);
  },
  buildings: [
    // The barrack in runs of rooms, each ending at a door or the pillar.
    { gridX: 5, gridY: 1, w: 3, h: 3, texture: 'ch9-barrack-3' },
    { gridX: 8, gridY: 1, w: 2, h: 3, texture: 'ch9-barrack-2' },
    { gridX: 10, gridY: 1, w: 2, h: 3, texture: 'ch9-barrack-2' },
    { gridX: 12, gridY: 1, w: 3, h: 3, texture: 'ch9-barrack-3' },
    { gridX: 16, gridY: 2, w: 3, h: 2, texture: 'ch9-barrack-front' },
    // Houses whose roofs hold the watchers
    { gridX: 0, gridY: 3, w: 2, h: 2, texture: 'house' },
    { gridX: 0, gridY: 7, w: 2, h: 2, texture: 'house' },
    { gridX: 4, gridY: 20, w: 2, h: 2, texture: 'house' },
    { gridX: 7, gridY: 20, w: 2, h: 2, texture: 'house' },
    { gridX: 13, gridY: 20, w: 2, h: 2, texture: 'house' },
    { gridX: 17, gridY: 20, w: 2, h: 2, texture: 'house' },
    { gridX: 23, gridY: 3, w: 2, h: 2, texture: 'house' },
    { gridX: 23, gridY: 7, w: 2, h: 2, texture: 'house' },
    { gridX: 23, gridY: 15, w: 2, h: 2, texture: 'house' },
    { gridX: 23, gridY: 19, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    // The next room's door beside the pillar
    { gridX: 11, gridY: 4, texture: 'ch9-cell-door', blocks: true },
    { gridX: 4, gridY: 4, texture: 'ch9-soldier', blocks: true },
    ...FILE,
    ...CROWD_EDGE,
    ...SHADOWS,
    { gridX: 5, gridY: 14, texture: 'well', blocks: true },
    { gridX: 4, gridY: 15, texture: 'ch9-water-jar', blocks: true },
    { gridX: 20, gridY: 3, texture: 'ch9-rope-coils', blocks: true },
    { gridX: 19, gridY: 4, texture: 'crates', blocks: true },
    { gridX: 2, gridY: 16, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 20, gridY: 17, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 2, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 22, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 2, gridY: 21, texture: 'cypress', blocks: true },
    { gridX: 26, gridY: 9, texture: 'cypress', blocks: true },
    { gridX: 26, gridY: 15, texture: 'cypress', blocks: true },
    { gridX: 20, gridY: 22, texture: 'cypress', blocks: true },
    { gridX: 12, gridY: 22, texture: 'ch9-water-jar', blocks: true },
  ],
  npcs: [
    // Threshold objects: the cell door and the pillar, before and after.
    { gridX: 7, gridY: 4, texture: 'ch9-cell-door',
      prompt: 'Stand before the cell door  [E]',
      dialogue: 'ch9-cell-door',
      present: f => !after(f) },
    { gridX: 7, gridY: 4, texture: 'ch9-open-door',
      prompt: 'Look into the open cell  [E]',
      dialogue: 'ch9-open-cell',
      present: after },
    { gridX: 9, gridY: 4, texture: 'ch9-pillar-ropes',
      prompt: 'Look at the pillar and the nail  [E]',
      dialogue: 'ch9-pillar',
      present: f => !after(f) },
    { gridX: 9, gridY: 4, texture: 'ch9-severed-ropes',
      prompt: 'Stand before the empty wall  [E]',
      dialogue: 'ch9-severed-ropes',
      present: after },

    // Before the hour
    { gridX: 6, gridY: 14, texture: 'ch9-water-seller',
      prompt: 'Speak with the Water-Seller  [E]',
      dialogue: 'ch9-water-seller-after',
      gate: { when: after, lockedDialogue: 'ch9-water-seller' } },
    { gridX: 6, gridY: 6, texture: 'ch9-farrash',
      prompt: 'Speak with the Farrásh-Báshí  [E]',
      dialogue: 'ch9-farrash-after',
      gate: { when: after, lockedDialogue: 'ch9-farrash' } },
    { gridX: 10, gridY: 6, texture: 'ch9-anis',
      prompt: 'Speak with Anís  [E]',
      dialogue: 'ch9-anis',
      present: f => !f.firstVolleyFailed },
    { gridX: 18, gridY: 9, texture: 'ch9-sam-khan',
      prompt: 'Speak with Sám Khán  [E]',
      dialogue: 'ch9-sam-khan',
      present: f => !f.firstVolleyFailed },
    { gridX: 18, gridY: 12, texture: 'ch9-soldier',
      prompt: 'Speak with the Armenian Soldier  [E]',
      dialogue: 'ch9-soldier',
      present: f => !f.firstVolleyFailed },

    // After
    { gridX: 8, gridY: 7, texture: 'ch9-amanuensis',
      prompt: 'Speak with Siyyid Ḥusayn  [E]',
      dialogue: 'ch9-amanuensis',
      present: after },
    { gridX: 13, gridY: 13, texture: 'ch9-coppersmith',
      prompt: 'Speak with the Old Coppersmith  [E]',
      dialogue: 'ch9-coppersmith',
      present: after },
  ],
  exits: [
    { fromX: 27, fromY: 12, dx: 1, dy: 0,
      targetScene: 'Ch9BarrackRoof', targetSpawnX: 1, targetSpawnY: 9,
      label: '→ Climb the stair to the rooftops',
      requires: f => !!f.samKhanPlea && squareWitnessCount(f) >= 2,
      lockedLabel: 'Hear the square and find Sám Khán before climbing' },
  ],
  // After the second volley a dust gale darkens the city, as Nabíl records.
  ambience: f => after(f)
    ? { wash: { color: 0x7a6650, alpha: 0.55 }, particles: 'dust', vignette: 0.75, music: 'sorrow', sound: ['wind'] }
    : { wash: { color: 0xe8c088, alpha: 0.22 }, particles: 'dust', vignette: 0.5, music: 'siege' },
};
