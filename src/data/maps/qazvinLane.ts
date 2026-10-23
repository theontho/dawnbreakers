import type { FlagState } from '../../dialogue/types';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { qzDay, qzNight } from './qazvinPhases';
import { wallRun } from './wallRuns';

/**
 * Qazvín, 1847 to 1848, at true scale: a lane of the old town where the
 * house of Ḥájí Mullá Ṣáliḥ, Qurratu'l-ʿAyn's father, and the mosque where
 * her uncle Mullá Taqí led the dawn prayer both front the north side. West
 * along the lane the bakers' row; south of it the old town
 * wall, with a small postern that is barred by day, and beyond it the
 * orchards outside the walls, where on the night of the rescue Muḥammad-
 * Hádí waits with three horses. The player comes in at the west end of the
 * lane, off the Hamadán road, which reaches Qazvín from the south-west.
 *
 * Districts (x runs east, y runs south):
 * - North of the lane, y 5..12: houses; Mullá Ṣáliḥ's gateway at (22, 12),
 *   opening on his court (`QazvinHouse`); the mosque x 26..33, y 6..12, its
 *   portal on the lane at (30, 12).
 * - The lane: y 13..16, the whole width.
 * - South of the lane: the bakers' row x 8..15, y 18..20, and houses.
 * - The town wall on y = 27, its postern at (7, 27).
 * - The orchards outside the walls: y 28..33.
 */

const W = 40;
const H = 34;
export const SALIH_GATE = { x: 22, y: 12 } as const;
/** Where the Hamadán road comes into the lane, at its west end. */
export const HAMADAN_ROAD = { x: 1, y: 15 } as const;
const WALL_Y = 27;
const POSTERN_X = 7;

const ready = (f: FlagState) => !!f.qzHadiReady;

const buildings: BuildingSpec[] = [
  // North of the lane.
  { gridX: 2, gridY: 7, w: 6, h: 5, texture: 'town-house' },
  { gridX: 10, gridY: 8, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: SALIH_GATE.x - 4, gridY: SALIH_GATE.y - 4, w: 6, h: 5, texture: 'zanjan-hujjat-house' },
  // Mullá Taqí's mosque: its portal is its own street front, on the lane.
  { gridX: 26, gridY: 6, w: 8, h: 7, texture: 'mosque-local' },
  // South of the lane: the bakers' row and two houses.
  { gridX: 8, gridY: 18, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 24, gridY: 19, w: 6, h: 5, texture: 'town-house' },
  { gridX: 34, gridY: 19, w: 5, h: 4, texture: 'town-house-small' },
];

function walls(): DecorSpec[] {
  return [
    // The postern: a stout door by day; at night it stands open.
    ...wallRun('town-wall', 0, WALL_Y, W - 1, WALL_Y, { doors: [{ at: [POSTERN_X, WALL_Y], open: qzNight }] }),
    // Garden walls between the houses.
    ...wallRun('compound-wall', 8, 9, 9, 9),
    ...wallRun('compound-wall', 15, 10, 17, 10),
    ...wallRun('compound-wall', 24, 9, 25, 9),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // Trees over the garden walls, north.
  ...block('plane-tree', [[0, 3], [16, 4], [38, 4]]),
  ...block('cypress', [[9, 3], [24, 4], [32, 3]]),
  // The lane: lamps, a well, the bakers' oven and their wood.
  ...block('lamp', [[17, 13], [28, 13], [32, 13], [5, 16], [21, 17]]),
  ...block('well', [[3, 18]]),
  ...block('zanjan-tanur', [[17, 18]]),
  ...block('crates', [[19, 19], [6, 19]]),
  ...block('ch9-water-jar', [[33, 16]]),
  ...loose('rug', [[18, 17]]),
  // By day, knots of townsmen talking low outside the mosque.
  ...loose('crowd-shadow', [[25, 14], [33, 15], [31, 16]], qzDay),
  // The orchards outside the wall.
  ...block('fruit-tree', [[2, 28], [12, 28], [15, 31], [11, 32], [1, 33]]),
  ...block('plane-tree', [[18, 29], [24, 31], [32, 29]]),
  ...block('cypress', [[0, 30], [21, 28], [28, 32], [36, 30]]),
  // Three horses waiting under the trees on the night of the rescue.
  ...block('kulayn-horse-grey', [[4, 29]], qzNight),
  ...block('kulayn-horse', [[3, 31]], qzNight),
  ...block('kulayn-horse', [[5, 32]], qzNight),
];

export const qazvinLaneMap: MapDefinition = {
  key: 'QazvinLane',
  title: 'Qazvín: the Lane of Mullá Ṣáliḥ',
  width: W,
  height: H,
  spawn: HAMADAN_ROAD,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(0, 0, W, 6, 'grass');
    paintRect(0, 13, W, 4, 'stone');
    paintRect(SALIH_GATE.x - 1, 12, 3, 1, 'stone');
    paintRect(16, 17, 6, 3, 'path');
    paintRect(POSTERN_X - 1, 17, 3, WALL_Y - 17, 'path');
    paintRect(0, WALL_Y + 1, W, H - WALL_Y - 1, 'grass');
    paintRect(POSTERN_X - 1, WALL_Y + 1, 4, 5, 'path');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    // By day.
    { gridX: 18, gridY: 17, texture: 'qazvin-baker',
      prompt: 'Speak with the Baker  [E]',
      dialogue: 'qz-baker',
      present: qzDay },
    { gridX: 29, gridY: 14, texture: 'qazvin-farrash',
      prompt: 'Speak with the Farrásh  [E]',
      dialogue: 'qz-farrash',
      present: qzDay },
    // The night of the rescue.
    { gridX: 29, gridY: 14, texture: 'qazvin-farrash',
      prompt: 'Look at the Farrásh  [E]',
      dialogue: 'qz-farrash-night',
      present: qzNight },
    { gridX: SALIH_GATE.x - 2, gridY: 13, texture: 'qazvin-khatun-jan',
      prompt: 'Speak with the Beggar Woman  [E]',
      dialogue: 'qz-khatun-jan',
      present: f => qzNight(f) && !ready(f) },
    { gridX: 9, gridY: 29, texture: 'qazvin-hadi',
      prompt: 'Speak with the Man with the Horses  [E]',
      dialogue: 'qz-hadi',
      gate: { when: f => !!f.qzMetKhatun, lockedDialogue: 'qz-hadi-wary' },
      present: f => qzNight(f) && !ready(f) },
    { gridX: 9, gridY: 29, texture: 'qazvin-hadi',
      prompt: 'Speak with Muḥammad-Hádí  [E]',
      dialogue: 'qz-hadi-ready',
      present: ready },
    { gridX: 7, gridY: 30, texture: 'qazvin-qurratul-ayn',
      prompt: 'Speak with the Veiled Woman  [E]',
      dialogue: 'qz-flight',
      present: ready },
    { gridX: 8, gridY: 32, texture: 'qazvin-khatun-jan',
      prompt: 'Speak with Khátún-Ján  [E]',
      dialogue: 'qz-khatun-jan-after',
      present: ready },
  ],
  doors: [
    { gridX: SALIH_GATE.x, gridY: SALIH_GATE.y, prompt: 'Enter Mullá Ṣáliḥ\'s court  [E]',
      targetScene: 'QazvinHouse', targetSpawnX: 12, targetSpawnY: 19,
      requires: qzDay, lockedLabel: 'The gate is barred for the night' },
  ],
  exits: [],
  ambience: f => laneAmbience(f),
};

/** A grey autumn day with leaves in the lane; then a dark night, lamps at the gate and the mosque. */
function laneAmbience(f: FlagState): MapAmbience {
  if (qzNight(f)) {
    return {
      wash: { color: 0x2a3560, alpha: 0.6 },
      lights: [{ gridX: 8, gridY: 30, radius: 120, color: 0xc8d4e8, intensity: 0.25 }],
      particles: 'fireflies', music: 'night', sound: ['crickets'], vignette: 0.72,
    };
  }
  return {
    wash: { color: 0x8a8070, alpha: 0.32 },
    particles: 'leaves', music: 'sorrow', sound: ['breeze'], vignette: 0.55,
  };
}
