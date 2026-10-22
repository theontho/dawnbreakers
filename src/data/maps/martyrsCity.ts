import type { FlagState } from '../../dialogue/types';
import { martyrsAfter, martyrsArrests, martyrsMorning, squareWitnesses } from './martyrsPhases';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Ṭihrán, February 1850, at true scale: a street of the city running east
 * into the Sabzih-Maydán, the green market square that adjoins the royal
 * palace. On the north side of the street stand the house of Maḥmúd
 * Khán-i-Kalántar behind its court wall, where fourteen believers are held,
 * and the street gate of a merchants' caravanserai. The palace portico
 * rises behind the citadel wall on the square's north side. The executions
 * are never shown: on the morning a column of the crowd closes the square
 * and the player stands at its edge; after, the square is nearly empty and
 * a stretch of paving by the palace wall has been swept.
 *
 * Districts (x runs east, y runs south):
 * - The street: y 22..24 from the west edge (spawn (3, 23)) to the square.
 * - The Kalántar's house: x 2..9, y 12..18, its court wall on y = 21 with
 *   the carved door at (6, 21) (KALANTAR_DOOR).
 * - The caravanserai: its gate x 14..18, y 19..21, the door at (16, 21)
 *   (SERAI_DOOR); its rooms behind, walls on x = 12 and x = 22.
 * - The palace: the portico at x 30..41, y 1..8, behind the citadel wall on
 *   x = 23 and y = 11.
 * - The square: x 23..48, y 12..35; shuttered shops along its south side
 *   (y 34..35); the swept stones by the palace wall at (35, 12).
 * - South of the street: houses and lanes, y 26..38.
 */

const W = 50;
const H = 40;
const STREET = 23;
export const KALANTAR_DOOR = { x: 6, y: 21 } as const;
export const SERAI_DOOR = { x: 16, y: 21 } as const;
const SWEPT = { x: 35, y: 12 } as const;
const SELLER = { x: 28, y: 27 } as const;

const buildings: BuildingSpec[] = [
  // The Kalántar's house, and the caravanserai's gate and rooms.
  { gridX: 2, gridY: 12, w: 8, h: 7, texture: 'town-house-large' },
  { gridX: 14, gridY: 19, w: 5, h: 3, texture: 'martyrs-serai-gate' },
  { gridX: 14, gridY: 12, w: 6, h: 5, texture: 'town-house' },
  // Houses north of the Kalántar's and the serai, against the citadel.
  { gridX: 2, gridY: 3, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 13, gridY: 3, w: 6, h: 4, texture: 'ch10-street-house' },
  // The palace behind the citadel wall.
  { gridX: 30, gridY: 1, w: 12, h: 8, texture: 'ch5-palace-portico' },
  // Shuttered shops along the square's south side.
  ...[26, 29, 32, 38, 41, 44].map(gridX => ({ gridX, gridY: 34, w: 2, h: 2, texture: 'ch10-shuttered-shop' })),
  { gridX: 35, gridY: 34, w: 2, h: 2, texture: 'ch5-market-awning' },
  // A green-seller's stall at the square's edge.
  { gridX: 44, gridY: 15, w: 2, h: 2, texture: 'market-stall' },
  // South of the street.
  { gridX: 1, gridY: 27, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 9, gridY: 27, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 16, gridY: 27, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 2, gridY: 33, w: 6, h: 4, texture: 'town-house' },
  { gridX: 11, gridY: 33, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 18, gridY: 33, w: 5, h: 4, texture: 'town-house-small' },
];

function walls(): DecorSpec[] {
  const c = 'compound-wall';
  const citadel = 'ch10-city-wall-snow';
  return [
    // The Kalántar's court: front wall with the carved door, sides, back.
    ...wallRun(c, 1, 21, 11, 21, [[KALANTAR_DOOR.x, KALANTAR_DOOR.y]]),
    ...wallRun(c, 1, 11, 1, 20),
    ...wallRun(c, 11, 11, 11, 20),
    ...wallRun(c, 2, 11, 10, 11),
    // The caravanserai's street wall either side of its gate, and its sides.
    ...wallRun(c, 12, 21, 13, 21),
    ...wallRun(c, 19, 21, 22, 21),
    ...wallRun(c, 12, 11, 12, 20),
    ...wallRun(c, 22, 11, 22, 20),
    ...wallRun(c, 13, 11, 21, 11),
    // The citadel: west side and the wall along the square.
    ...wallRun(citadel, 23, 0, 23, 11),
    ...wallRun(citadel, 24, 11, W - 1, 11),
    // The southern edge, cut away.
    ...wallRun(c, 0, H - 1, W - 1, H - 1),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const notMorning = (f: FlagState) => !martyrsMorning(f);

const props: DecorSpec[] = [
  // The Kalántar's door, carved and barred, and his man beside it.
  ...block('ch4-uncle-door', [[KALANTAR_DOOR.x, KALANTAR_DOOR.y]]),
  ...block('ch10-jailer', [[4, 22]], martyrsArrests),
  // Trees over the courts, snow lying in the lee of the walls.
  ...block('cypress', [[3, 20], [9, 20]]),
  ...block('plane-tree', [[20, 18], [26, 3]]),
  ...block('cypress', [[25, 8], [44, 8], [46, 3]]),
  ...loose('ch10-snow-drift', [[2, 25], [12, 25], [24, 12], [47, 12], [22, 25], [44, 32]]),
  // The street: a well, a water jar, lamps at the doors.
  ...block('well', [[10, 25]]),
  ...block('ch9-water-jar', [[19, 25]]),
  ...block('lamp', [[5, 20], [13, 20], [8, 25]]),
  // The palace's sentries at the citadel wall, all days.
  ...block('ch9-soldier', [[30, 12], [41, 12]]),
  // The green market: baskets, a stall, a plane tree, the sweet-seller's tray.
  ...block('martyrs-greens-baskets', [[29, 25], [31, 26], [36, 30], [42, 27]]),
  ...block('martyrs-sweets-tray', [[SELLER.x - 1, SELLER.y]], notMorning),
  ...block('plane-tree', [[25, 31], [46, 22]]),
  ...block('lamp', [[33, 13], [38, 13]]),
  // Before: the market going about its business.
  ...loose('crowd-shadow', [[30, 20], [35, 24], [43, 19], [27, 16], [38, 28]], martyrsArrests),
  // The morning: a wall of people across the square's mouth, the crowd beyond, soldiers holding a ring.
  ...block('crowd', [
    [27, 12], [27, 13], [27, 14], [27, 15], [27, 16], [27, 17], [27, 18], [27, 19], [27, 20], [27, 21],
    [27, 22], [27, 23], [27, 24], [27, 25], [27, 26], [27, 27], [27, 28], [27, 29], [27, 30], [27, 31],
    [27, 32], [27, 33],
    [28, 13], [28, 15], [28, 18], [28, 20], [28, 22], [28, 24], [28, 26], [28, 29], [28, 31], [28, 33],
    [29, 12], [29, 16], [29, 19], [29, 23], [29, 30], [30, 13], [30, 21], [30, 27], [31, 15], [31, 23],
    [29, 14], [30, 17], [29, 21], [30, 24], [29, 28], [31, 31], [33, 15], [34, 27], [41, 15], [43, 18],
    [44, 23], [42, 28], [38, 31], [45, 30], [33, 31],
  ], martyrsMorning),
  ...loose('crowd-shadow', [[31, 19], [32, 23], [40, 26], [44, 26], [35, 17], [24, 26]], martyrsMorning),
  ...block('ch9-soldier', [[34, 19], [38, 19], [33, 22], [39, 22], [35, 25], [37, 25]], martyrsMorning),
  // After: the swept stones, the headsman's bundle, a few people going home.
  ...block('ch2-bundles', [[30, 14]], martyrsAfter),
  ...loose('crowd-shadow', [[42, 30], [26, 33]], martyrsAfter),
];

function ambience(f: FlagState): MapAmbience {
  if (martyrsAfter(f)) {
    return { wash: { color: 0xb07050, alpha: 0.34 }, particles: 'motes', vignette: 0.62, music: 'sorrow', sound: ['wind'],
      lights: [{ gridX: SWEPT.x, gridY: SWEPT.y + 1, radius: 150, color: 0xffc080, intensity: 0.18 }] };
  }
  if (martyrsMorning(f)) {
    return { wash: { color: 0x7a84a0, alpha: 0.38 }, vignette: 0.66, music: 'sorrow', sound: ['wind'] };
  }
  return { wash: { color: 0xc0c4d0, alpha: 0.18 }, particles: 'dust', vignette: 0.5, music: 'city', sound: ['wind'] };
}

export const martyrsCityMap: MapDefinition = {
  key: 'MartyrsCity',
  title: 'Ṭihrán, by the Sabzih-Maydán',
  width: W,
  height: H,
  spawn: { x: 3, y: STREET },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    // The palace forecourt behind the citadel wall, and the square.
    paintRect(24, 9, W - 24, 2, 'stone');
    paintRect(23, 12, W - 23, 24, 'stone');
    // The Kalántar's court and the serai's threshold.
    paintRect(2, 19, 9, 2, 'stone');
    // The street into the square, and the lanes south.
    paintRect(0, STREET - 1, 24, 3, 'path');
    paintRect(7, 25, 2, 13, 'path');
    paintRect(14, 25, 2, 13, 'path');
    paintRect(0, 31, 23, 2, 'path');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    { gridX: SELLER.x, gridY: SELLER.y, texture: 'martyrs-sweet-seller',
      prompt: 'Speak with the Sweet-Seller  [E]',
      dialogue: 'martyrs-sweet-seller-before',
      present: martyrsArrests },
    { gridX: SELLER.x, gridY: SELLER.y, texture: 'martyrs-sweet-seller',
      prompt: 'Speak with the Sweet-Seller  [E]',
      dialogue: 'martyrs-sweet-seller',
      present: martyrsAfter },
    { gridX: 25, gridY: STREET, texture: 'crowd',
      prompt: 'Stand at the edge of the crowd  [E]',
      dialogue: 'martyrs-crowd-edge',
      present: martyrsMorning },
    { gridX: 31, gridY: 13, texture: 'martyrs-headsman',
      prompt: 'Speak with the Headsman  [E]',
      dialogue: 'martyrs-headsman',
      present: martyrsAfter },
    { gridX: SWEPT.x, gridY: SWEPT.y, texture: 'martyrs-swept-stones',
      prompt: 'Stand by the swept stones  [E]',
      dialogue: 'martyrs-swept-stones',
      gate: { when: f => squareWitnesses(f) >= 2, lockedDialogue: 'martyrs-swept-stones-locked' },
      present: martyrsAfter },
  ],
  doors: [
    { gridX: KALANTAR_DOOR.x, gridY: KALANTAR_DOOR.y, prompt: 'Go in to the prisoners  [E]',
      targetScene: 'MartyrsHouse', targetSpawnX: 7, targetSpawnY: 10,
      requires: f => !!f.martyrsMerchantAsked && martyrsArrests(f),
      lockedLabel: 'The Kalántar\'s door is barred and guarded' },
    { gridX: SERAI_DOOR.x, gridY: SERAI_DOOR.y, prompt: 'Enter the caravanserai  [E]',
      targetScene: 'MartyrsSerai', targetSpawnX: 11, targetSpawnY: 14,
      requires: martyrsArrests,
      lockedLabel: 'The caravanserai gate is shut' },
  ],
  exits: [],
  ambience,
};
