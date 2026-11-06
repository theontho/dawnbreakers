import type { FlagState } from '../../dialogue/types';
import { bfEvening, bfMorning, bfSquareDay } from './barfurushPhases';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Bárfurúsh, the Sabzih-Maydán, on a Friday in October 1848, at true scale.
 * The green-market square of a Mázindarán town: whitewashed houses under
 * fired-tile gables among the flat-roofed ones, orange trees in the yards,
 * the masjid where the Saʿídu'l-ʿUlamá preached the night before, his own
 * courtyard house with its gate shut, and on the north side the gateway of
 * the caravanserai where the companions are lodged. The cistern in the
 * middle has men with clubs sitting on it.
 *
 * Districts (x runs east, y runs south):
 * - The masjid, x 1..8, y 1..7, its portal on the square.
 * - The caravanserai: its gateway x 14..18, y 6..8 (door at (16, 8),
 *   SERAI_DOOR), its walls on y = 8 and x = 12 and 22, rooms behind.
 * - The Saʿídu'l-ʿUlamá's house, x 26..33, y 1..7, gate at (31, 7).
 * - The square, x 7..30, y 9..24: the cistern at (19, 15), the baker's
 *   house and oven on the west side.
 * - The road in from the plain, x 9..10, up from the south edge; the way
 *   out to Shír-Gáh, y 22..23, east to the edge.
 */

const W = 36;
const H = 32;
export const SERAI_DOOR = { x: 16, y: 8 } as const;
const CLERIC = { gridX: 26, gridY: 1, w: 8, h: 7 } as const;
const CLERIC_GATE = { x: CLERIC.gridX + 5, y: CLERIC.gridY + CLERIC.h - 1 } as const;

const buildings: BuildingSpec[] = [
  { gridX: 1, gridY: 1, w: 8, h: 7, texture: 'mosque-local' },
  // The caravanserai's gateway, and its rooms behind the wall.
  { gridX: 14, gridY: 6, w: 5, h: 3, texture: 'martyrs-serai-gate' },
  { gridX: 14, gridY: 0, w: 6, h: 5, texture: 'town-house' },
  { ...CLERIC, texture: 'town-house-large' },
  // Houses of the plain round the square, the baker's first.
  { gridX: 1, gridY: 12, w: 5, h: 4, texture: 'bf-town-house' },
  { gridX: 1, gridY: 19, w: 5, h: 4, texture: 'bf-town-house' },
  { gridX: 31, gridY: 16, w: 5, h: 4, texture: 'bf-town-house' },
  { gridX: 14, gridY: 26, w: 5, h: 4, texture: 'bf-town-house' },
  { gridX: 21, gridY: 26, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 1, gridY: 26, w: 5, h: 4, texture: 'town-house-small' },
  // Shuttered shops along the way out.
  ...[27, 30, 33].map(gridX => ({ gridX, gridY: 25, w: 2, h: 2, texture: 'ch10-shuttered-shop' })),
];

function walls(): DecorSpec[] {
  const c = 'compound-wall';
  return [
    ...wallRun(c, 12, 8, 13, 8),
    ...wallRun(c, 19, 8, 22, 8),
    ...wallRun(c, 12, 0, 12, 7),
    ...wallRun(c, 22, 0, 22, 7),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const pleading = (f: FlagState) => !f.bfHeardAddress;

const props: DecorSpec[] = [
  // Trees: a plane between the masjid and the serai, orange trees in the yards.
  ...block('plane-tree', [[10, 3]]),
  ...block('orange-tree', [[24, 4], [6, 17], [7, 24], [35, 21], [26, 30]]),
  ...block('cypress', [[0, 10], [35, 9]]),
  // The square: the cistern, the baker's oven, lamps at the serai gate and the masjid.
  ...block('well', [[19, 15]]),
  ...block('zanjan-tanur', [[7, 13]]),
  ...block('lamp', [[13, 10], [20, 10], [8, 9], [29, 9]]),
  ...block('ch2-water-jars', [[11, 13]]),
  ...block('martyrs-greens-baskets', [[24, 23], [12, 24]], f => !f.bfGatesShut || bfMorning(f)),
  // By day: the men on the cistern, and the town pressing round the Saʿídu'l-ʿUlamá's gate.
  ...block('crowd', [[18, 14], [20, 14]], bfSquareDay),
  ...block('crowd', [[25, 10], [26, 13], [24, 12], [27, 15], [28, 12]], pleading),
  ...loose('crowd-shadow', [[22, 11], [29, 14], [23, 15]], pleading),
  ...loose('crowd-shadow', [[25, 18], [15, 20]], f => !!f.bfHeardAddress && bfSquareDay(f)),
  // The morning: Khusraw's horsemen and their horses, ʿAbbás-Qulí Khán at his stirrup.
  ...block('kulayn-horse', [[26, 19]], bfMorning),
  ...block('kulayn-horse-grey', [[22, 19], [29, 18]], bfMorning),
  ...block('kulayn-rider', [[28, 20], [23, 21], [30, 19], [27, 17]], bfMorning),
  ...block('bf-abbas-quli', [[24, 19]], f => bfMorning(f) && !f.bfMetKhusraw),
];

function ambience(f: FlagState): MapAmbience {
  const lamps = [
    { gridX: 13, gridY: 10, radius: 110, color: 0xffb060, intensity: 0.4 },
    { gridX: 20, gridY: 10, radius: 110, color: 0xffb060, intensity: 0.4 },
  ];
  if (bfMorning(f)) {
    return { wash: { color: 0xb8c0c8, alpha: 0.28 }, particles: 'motes', music: 'road', sound: ['birds', 'breeze'], vignette: 0.55 };
  }
  if (bfEvening(f)) {
    return { wash: { color: 0x2a3560, alpha: 0.5 }, lights: lamps, particles: 'fireflies', music: 'sorrow', sound: ['crickets'], vignette: 0.7 };
  }
  if (f.bfGatesShut) {
    return { wash: { color: 0xc07848, alpha: 0.38 }, music: 'siege', sound: ['wind'], vignette: 0.65 };
  }
  if (f.bfHeardAddress) {
    return { wash: { color: 0xd09858, alpha: 0.26 }, particles: 'dust', music: 'dusk', sound: ['wind'], vignette: 0.58 };
  }
  return { wash: { color: 0xc8b8a0, alpha: 0.2 }, particles: 'dust', music: 'siege', sound: ['wind'], vignette: 0.6 };
}

export const barfurushMaydanMap: MapDefinition = {
  key: 'BarfurushMaydan',
  title: 'Bárfurúsh, the Sabzih-Maydán',
  width: W,
  height: H,
  spawn: { x: 9, y: 30 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    // The serai's court and rooms behind its wall, out of reach.
    paintRect(13, 0, 9, 8, 'stone');
    // The square, and the lanes in and out.
    paintRect(7, 9, 24, 16, 'stone');
    paintRect(9, 25, 2, 7, 'path');
    paintRect(29, 22, 7, 2, 'path');
    // Yards and gardens.
    paintRect(0, 9, 7, 3, 'grass');
    paintRect(23, 0, 3, 8, 'grass');
    paintRect(32, 16, 4, 6, 'grass');
    paintRect(19, 30, 17, 2, 'grass');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    // Mullá Ḥusayn at the Saʿídu'l-ʿUlamá's shut gate, then at the serai with his errands.
    { gridX: CLERIC_GATE.x, gridY: CLERIC_GATE.y + 3, texture: 'ch8-mulla-husayn',
      prompt: 'Go to Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-house',
      present: pleading },
    { gridX: 14, gridY: 11, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-report',
      gate: { when: f => !!f.bfAskedBread && !!f.bfAskedWater, lockedDialogue: 'bf-mh-errand' },
      present: f => !!f.bfHeardAddress && bfSquareDay(f) },
    { gridX: CLERIC_GATE.x, gridY: CLERIC_GATE.y,
      prompt: 'Look at the Saʿídu\'l-ʿUlamá\'s gate  [E]',
      dialogue: 'bf-cleric-gate' },

    // The people of the square.
    { gridX: 7, gridY: 15, texture: 'ch4-baker',
      prompt: 'Speak with the Baker  [E]',
      dialogue: 'bf-baker',
      gate: { when: f => !!f.bfHeardAddress, lockedDialogue: 'bf-baker-shut' },
      present: bfSquareDay },
    { gridX: 21, gridY: 17, texture: 'ch10-water-seller',
      prompt: 'Speak with the Water-Carrier  [E]',
      dialogue: 'bf-water',
      gate: { when: f => !!f.bfHeardAddress, lockedDialogue: 'bf-water-early' },
      present: bfSquareDay },
    { gridX: 11, gridY: 21, texture: 'bf-townsman',
      prompt: 'Speak with the Townsman  [E]',
      dialogue: 'bf-townsman',
      present: bfSquareDay },
    { gridX: 11, gridY: 21, texture: 'bf-townsman',
      prompt: 'Speak with the Townsman  [E]',
      dialogue: 'bf-townsman-evening',
      present: bfEvening },

    // The morning: the escort.
    { gridX: 25, gridY: 21, texture: 'bf-khusraw',
      prompt: 'Go to the head of the escort  [E]',
      dialogue: 'bf-khusraw-square',
      present: bfMorning },
  ],
  doors: [
    { gridX: SERAI_DOOR.x, gridY: SERAI_DOOR.y, prompt: 'Enter the caravanserai  [E]',
      targetScene: 'BarfurushSerai', targetSpawnX: 10, targetSpawnY: 14,
      requires: f => !!f.bfHeardAddress,
      lockedLabel: 'Stay with Mullá Ḥusayn first' },
  ],
  exits: [
    ...[9, 10].map(fromX => ({
      fromX, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'BarfurushRoad', targetSpawnX: 17, targetSpawnY: 1,
      label: '↓ Back down the road across the rice fields',
    })),
    ...[22, 23].map(fromY => ({
      fromX: W - 1, fromY, dx: 1, dy: 0,
      targetScene: 'BarfurushForest', targetSpawnX: 1, targetSpawnY: 20,
      label: '↘ Out of the town behind the escort, toward Shír-Gáh',
      requires: (f: FlagState) => !!f.bfMetKhusraw,
      lockedLabel: 'The road south-east to Shír-Gáh: not yet',
    })),
  ],
  ambience,
};
