import { squareWitnessCount } from '../dialogues_ch/chapter09_tabriz';
import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The barrack square of Tabríz, 9 July 1850, at true scale. The two-storey
 * barrack closes the north side and turns down the west: an arcaded range
 * with its gatehouse, and in front of it a low cell door, the pillar with
 * its nail, the next room's door. Sám Khán's regiment stands in file; the
 * crowd presses at the edges and watches from the barrack roof and the
 * houses round the square. The street from the city comes in from the
 * south-west; the stair to the rooftops leaves from the east.
 *
 * Before the hour (until `ch9WitnessedVolleys`) the square holds Anís, Sám
 * Khán, and his soldier. Afterwards it holds the severed ropes, the open
 * cell, and witnesses.
 *
 * Districts (x runs east, y runs south):
 * - The north range: x 6..39, y 2..6; its gatehouse x 26..31. The cell door,
 *   pillar and next door stand before it at (13, 7), (15, 7), (17, 7).
 * - The west wing: x 1..5, y 2..25, facing east across the square.
 * - The square: x 6..36, y 7..31.
 * - The street from the city: y 28..30 in from the west edge.
 * - Houses on the south side (y 32..38) with a lane south at x 19..21, and on
 *   the east side (x 37..42); the way to the roof stair at y 16..17.
 */

const W = 44;
const H = 40;
const CELL_DOOR = { x: 13, y: 7 };
const PILLAR = { x: 15, y: 7 };
const ROOF_EXIT_Y = 16;

const after = (f: Record<string, unknown>) => !!f.ch9WitnessedVolleys;

const buildings: BuildingSpec[] = [
  // The west wing, north to south; its corner run carries the north range's roof round.
  { gridX: 1, gridY: 2, w: 5, h: 8, texture: 'ch9-barrack-corner' },
  { gridX: 1, gridY: 10, w: 5, h: 8, texture: 'ch9-barrack-wing' },
  { gridX: 1, gridY: 18, w: 5, h: 8, texture: 'ch9-barrack-wing-end' },
  // The north range in runs, each ending at the cell door, the pillar or the next door.
  { gridX: 6, gridY: 2, w: 8, h: 5, texture: 'ch9-barrack-3' },
  { gridX: 14, gridY: 2, w: 2, h: 5, texture: 'ch9-barrack-2' },
  { gridX: 16, gridY: 2, w: 2, h: 5, texture: 'ch9-barrack-2' },
  { gridX: 18, gridY: 2, w: 8, h: 5, texture: 'ch9-barrack-3' },
  { gridX: 26, gridY: 2, w: 6, h: 5, texture: 'ch9-barrack-front' },
  { gridX: 32, gridY: 2, w: 8, h: 5, texture: 'ch9-barrack-end' },
  // Houses on the south side, their roofs full of watchers
  { gridX: 0, gridY: 33, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 7, gridY: 33, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 13, gridY: 33, w: 6, h: 5, texture: 'town-house' },
  { gridX: 22, gridY: 33, w: 6, h: 5, texture: 'town-house' },
  { gridX: 29, gridY: 32, w: 8, h: 7, texture: 'town-house-large' },
  // Houses on the east side, either side of the way to the roof stair
  { gridX: 37, gridY: 9, w: 6, h: 5, texture: 'town-house' },
  { gridX: 37, gridY: 19, w: 6, h: 5, texture: 'town-house' },
  { gridX: 38, gridY: 26, w: 5, h: 4, texture: 'town-house-small' },
];

/** Garden walls closing the gaps between the houses, open at the lane and the stair. */
function compoundWalls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    ...wallRun(w, 5, 33, 6, 33),
    ...wallRun(w, 12, 33, 12, 36),
    ...wallRun(w, 28, 33, 28, 37),
    ...wallRun(w, 0, H - 1, W - 2, H - 1, { gaps: [[19, H - 1], [20, H - 1], [21, H - 1]] }),
    ...wallRun(w, W - 1, 0, W - 1, H - 1, { gaps: [[W - 1, ROOF_EXIT_Y], [W - 1, ROOF_EXIT_Y + 1]] }),
    ...wallRun(w, 37, 14, 37, 15),
    ...wallRun(w, 37, 24, 37, 25),
  ];
}

const CROWD_EDGE: DecorSpec[] = [
  ...[8, 9, 11, 12, 14, 15, 17, 23, 24, 26, 27, 30, 31, 33, 34].map(x => ({ gridX: x, gridY: 31, texture: 'crowd', blocks: true })),
  ...[9, 10, 12, 13, 19, 20, 22, 23, 25, 26, 28].map(y => ({ gridX: 35, gridY: y, texture: 'crowd', blocks: true })),
  ...[13, 14, 16, 17, 19, 20].map(y => ({ gridX: 8, gridY: y, texture: 'crowd', blocks: true })),
];

const SHADOWS: DecorSpec[] = [
  [10, 13], [14, 16], [20, 22], [25, 27], [30, 24], [16, 28], [11, 19], [31, 11], [22, 12],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd-shadow' }));

// Sám Khán's regiment, drawn up facing the pillar, until it marches out after the first volley.
const FILE: DecorSpec[] = [25, 27].flatMap(x => [13, 14, 16, 17].map(y => ({
  gridX: x, gridY: y, texture: 'ch9-soldier', blocks: true, present: (f: Record<string, unknown>) => !f.firstVolleyFailed,
})));

const props: DecorSpec[] = [
  // The next room's door beside the pillar, and the guard at the cell
  { gridX: 17, gridY: 7, texture: 'ch9-cell-door', blocks: true },
  { gridX: 12, gridY: 9, texture: 'ch9-soldier', blocks: true },
  // The water-seller's well and jar by the street in
  { gridX: 9, gridY: 25, texture: 'well', blocks: true },
  { gridX: 8, gridY: 26, texture: 'ch9-water-jar', blocks: true },
  // Before the gatehouse: rope and stores
  { gridX: 33, gridY: 9, texture: 'ch9-rope-coils', blocks: true },
  { gridX: 31, gridY: 9, texture: 'crates', blocks: true },
  // Bundles the crowd set down
  { gridX: 12, gridY: 28, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 32, gridY: 28, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 3, gridY: 30, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 20, gridY: 30, texture: 'ch9-water-jar', blocks: true },
  // Trees: plane trees by the street and the stair, cypress in the corners
  { gridX: 4, gridY: 28, texture: 'plane-tree', blocks: true },
  { gridX: 41, gridY: 7, texture: 'plane-tree', blocks: true },
  { gridX: 41, gridY: 3, texture: 'cypress', blocks: true },
  { gridX: 40, gridY: 30, texture: 'cypress', blocks: true },
  { gridX: 41, gridY: 18, texture: 'cypress', blocks: true },
];

export const ch9TabrizSquareMap: MapDefinition = {
  key: 'Ch9TabrizSquare',
  title: 'Tabríz, the Barrack Square',
  width: W,
  height: H,
  spawn: { x: 1, y: 29 },
  build: ({ paintRect, block }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(6, 7, 31, 25, 'stone');
    // Packed earth before the barrack where the order is carried out
    paintRect(9, 7, 12, 3, 'sand');
    // The street from the city, the lane south, and the way to the rooftop stair
    paintRect(0, 28, 7, 3, 'path');
    paintRect(19, 32, 3, H - 32, 'path');
    paintRect(36, ROOF_EXIT_Y, W - 36, 2, 'path');
    // Keep the cell door and the pillar apart: the wall between them is solid.
    block(CELL_DOOR.x + 1, CELL_DOOR.y);
  },
  buildings,
  decor: [...compoundWalls(), ...CROWD_EDGE, ...SHADOWS, ...FILE, ...props],
  npcs: [
    // Threshold objects: the cell door and the pillar, before and after.
    { gridX: CELL_DOOR.x, gridY: CELL_DOOR.y, texture: 'ch9-cell-door',
      prompt: 'Stand before the cell door  [E]',
      dialogue: 'ch9-cell-door',
      present: f => !after(f) },
    { gridX: CELL_DOOR.x, gridY: CELL_DOOR.y, texture: 'ch9-open-door',
      prompt: 'Look into the open cell  [E]',
      dialogue: 'ch9-open-cell',
      present: after },
    { gridX: PILLAR.x, gridY: PILLAR.y, texture: 'ch9-pillar-ropes',
      prompt: 'Look at the pillar and the nail  [E]',
      dialogue: 'ch9-pillar',
      present: f => !after(f) },
    { gridX: PILLAR.x, gridY: PILLAR.y, texture: 'ch9-severed-ropes',
      prompt: 'Stand before the empty wall  [E]',
      dialogue: 'ch9-severed-ropes',
      present: after },

    // Before the hour
    { gridX: 10, gridY: 24, texture: 'ch9-water-seller',
      prompt: 'Speak with the Water-Seller  [E]',
      dialogue: 'ch9-water-seller-after',
      gate: { when: after, lockedDialogue: 'ch9-water-seller' } },
    { gridX: 11, gridY: 11, texture: 'ch9-farrash',
      prompt: 'Speak with the Farrásh-Báshí  [E]',
      dialogue: 'ch9-farrash-after',
      gate: { when: after, lockedDialogue: 'ch9-farrash' } },
    { gridX: 16, gridY: 11, texture: 'ch9-anis',
      prompt: 'Speak with Anís  [E]',
      dialogue: 'ch9-anis',
      present: f => !f.firstVolleyFailed },
    { gridX: 29, gridY: 15, texture: 'ch9-sam-khan',
      prompt: 'Speak with Sám Khán  [E]',
      dialogue: 'ch9-sam-khan',
      present: f => !f.firstVolleyFailed },
    { gridX: 29, gridY: 18, texture: 'ch9-soldier',
      prompt: 'Speak with the Armenian Soldier  [E]',
      dialogue: 'ch9-soldier',
      present: f => !f.firstVolleyFailed },

    // After
    { gridX: 13, gridY: 13, texture: 'ch9-amanuensis',
      prompt: 'Speak with Siyyid Ḥusayn  [E]',
      dialogue: 'ch9-amanuensis',
      present: after },
    { gridX: 21, gridY: 22, texture: 'ch9-coppersmith',
      prompt: 'Speak with the Old Coppersmith  [E]',
      dialogue: 'ch9-coppersmith',
      present: after },
  ],
  exits: [
    { fromX: W - 1, fromY: ROOF_EXIT_Y, dx: 1, dy: 0,
      targetScene: 'Ch9BarrackRoof', targetSpawnX: 1, targetSpawnY: 14,
      label: '→ Climb the stair to the rooftops',
      requires: f => !!f.samKhanPlea && squareWitnessCount(f) >= 2,
      lockedLabel: 'Hear the square and find Sám Khán before climbing' },
  ],
  // After the second volley a dust gale darkens the city, as Nabíl records.
  ambience: f => after(f)
    ? { wash: { color: 0x7a6650, alpha: 0.55 }, particles: 'dust', vignette: 0.75, music: 'sorrow', sound: ['wind'] }
    : { wash: { color: 0xe8c088, alpha: 0.22 }, particles: 'dust', vignette: 0.5, music: 'siege' },
};
