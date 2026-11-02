import { KALANTAR_DOOR } from './martyrsCity';
import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The house of Maḥmúd Khán-i-Kalántar in Ṭihrán, February 1850: the long
 * ground-floor room, about 22 by 15 m, drawn cut away, where fourteen
 * believers are held after the arrests. Straw on the tiles, a brazier the
 * guards keep for themselves by the door, a lamp in each back corner. A
 * narrow door in the back wall opens on the stair to the upper floor, where
 * Ṭáhirih is held. The seven who will not recant sit among the seven who
 * will; the player brings bread and sits with them.
 *
 * Layout: walls along y = 0 and x = 0; the stair door at (12, 0), its guard
 * on the bottom step at (12, 1); the way
 * out to the street at (7, 11). The uncle at (4, 2), Mírzá Qurbán-ʿAlí at
 * his prayers at (8, 1), Ḥájí Mullá Ismáʿíl at (2, 6) beside the young man
 * of Marágha, Siyyid Ḥusayn and Ḥájí Muḥammad-Taqí together at (11, 4) and
 * (12, 5), Siyyid Murtaḍá by the door at (10, 9).
 */

const W = 16;
const H = 12;
const DOOR_X = 7;
const STAIR_X = 12;

/** The back walls, and in the north one the door to the stair, left a finger's width ajar. */
function roomWalls(): DecorSpec[] {
  return [
    ...wallRun('interior-wall', 0, 0, W - 1, 0, { doors: [[STAIR_X, 0]] }),
    ...wallRun('interior-wall', 0, 1, 0, H - 1),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const FURNISHED: DecorSpec[] = [
  // Straw for beds along the walls and in the middle of the floor.
  ...loose('ch10-straw', [[3, 3], [6, 2], [2, 9], [9, 3], [13, 7], [5, 6], [8, 7], [14, 3]]),
  // The young man of Marágha, who will not speak, beside his friend.
  ...block('martyrs-maraghii', [[2, 7]]),
  // The seven who will recant, keeping apart.
  ...block('ch10-prisoner', [[6, 4], [14, 2], [14, 9], [5, 9], [9, 6]]),
  // The guard by the door, the guards' brazier, lamps in the back corners, a chain on its staple.
  ...block('ch10-jailer', [[9, 10]]),
  ...block('ch6-brazier', [[12, 10]]),
  ...block('ch8-oil-lamp', [[1, 1], [15, 1]]),
  ...block('ch10-chain-coil', [[1, 10]]),
  ...block('ch5-ewer', [[3, 1]]),
];

export const martyrsHouseMap: MapDefinition = {
  key: 'MartyrsHouse',
  title: 'The House of the Kalántar',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'floor');
  },
  buildings: [],
  decor: [...roomWalls(), ...FURNISHED],
  npcs: [
    { gridX: 4, gridY: 2, texture: 'ch4-khal',
      prompt: 'Sit with the Báb\'s uncle  [E]',
      dialogue: 'martyrs-khal' },
    { gridX: 8, gridY: 1, texture: 'martyrs-qurban',
      prompt: 'Speak with Mírzá Qurbán-ʿAlí  [E]',
      dialogue: 'martyrs-qurban' },
    { gridX: 2, gridY: 5, texture: 'martyrs-ismail',
      prompt: 'Sit with the two by the wall  [E]',
      dialogue: 'martyrs-ismail' },
    { gridX: 11, gridY: 4, texture: 'martyrs-turshizi',
      prompt: 'Look at the mujtahid  [E]',
      dialogue: 'martyrs-turshizi' },
    { gridX: 13, gridY: 4, texture: 'martyrs-kirmani',
      prompt: 'Look at the merchant of Kirmán  [E]',
      dialogue: 'martyrs-kirmani' },
    { gridX: 10, gridY: 9, texture: 'martyrs-murtada',
      prompt: 'Sit with the siyyid by the door  [E]',
      dialogue: 'martyrs-murtada' },
    { gridX: STAIR_X, gridY: 1, texture: 'ch10-jailer',
      prompt: 'Look at the door to the stair  [E]',
      dialogue: 'martyrs-upper-door' },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'MartyrsCity', targetSpawnX: KALANTAR_DOOR.x, targetSpawnY: KALANTAR_DOOR.y + 1,
      label: '↓ Out to the street' },
  ],
  ambience: {
    wash: { color: 0x4a4a58, alpha: 0.4 },
    lights: [
      { gridX: 1, gridY: 1, radius: 130, color: 0xffc070, intensity: 0.4 },
      { gridX: 15, gridY: 1, radius: 130, color: 0xffc070, intensity: 0.4 },
      { gridX: 12, gridY: 10, radius: 100, color: 0xff9a40, intensity: 0.4 },
    ],
    particles: 'motes', music: 'prison', sound: ['wind'], vignette: 0.7,
  },
};

