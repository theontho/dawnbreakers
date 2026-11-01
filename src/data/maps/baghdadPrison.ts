import { BG_PRISON_DOOR } from './baghdadQuay';
import { bgWinter } from './baghdadPhases';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The prison under the serai, Baghdád, winter 1845: a vaulted room below
 * the level of the quay, about 17 by 14 m, drawn cut away, its niches
 * opening off the back wall. Debtors and thieves sleep on straw; the jailer
 * keeps a brazier by the steps; Mullá ʿAlí has the niche at the back by the
 * grating, where a little of the river's light comes down.
 *
 * Layout: low arches along y = 0, the vault wall down x = 0; Mullá ʿAlí at
 * (4, 3); a debtor at (9, 3); the jailer at (8, 6) by his brazier; the steps
 * up to the quay at (6, 9).
 */

const W = 12;
const H = 10;
const STEPS_X = 6;

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const DECOR: DecorSpec[] = [
  ...wallRun('ch10-low-arch', 1, 0, W - 1, 0),
  ...wallRun('ch10-vault-wall', 0, 0, 0, H - 1),
  // Straw in the niches, a sleeping debtor, chains coiled by the wall.
  ...loose('ch10-straw', [[4, 2], [3, 3], [9, 2], [10, 4], [2, 6], [1, 2], [7, 2]]),
  ...block('ch10-prisoner', [[11, 2], [1, 6], [7, 1]]),
  ...block('ch10-chain-coil', [[6, 1], [1, 8]]),
  ...loose('ch10-light-shaft', [[5, 2]]),
  // The jailer's corner by the steps.
  ...block('ch3-brazier', [[9, 6]]),
  ...block('lamp', [[STEPS_X - 2, 8]]),
  ...block('ch9-water-jar', [[10, 8]]),
  ...block('ch2-bundles', [[11, 6]]),
];

export const baghdadPrisonMap: MapDefinition = {
  key: 'BaghdadPrison',
  title: 'The Prison under the Serai',
  width: W,
  height: H,
  spawn: { x: STEPS_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'stone');
    paintRect(1, 1, W - 2, 4, 'sand');
  },
  buildings: [],
  decor: DECOR,
  npcs: [
    { gridX: 8, gridY: 6, texture: 'bg-jailer',
      prompt: 'Speak with the Jailer  [E]',
      dialogue: 'bg-jailer',
      gate: { when: f => !f.bgJailerLetIn, lockedDialogue: 'bg-jailer-after' } },
    { gridX: 4, gridY: 3, texture: 'ch2-mulla-ali',
      prompt: 'Sit with Mullá ʿAlíy-i-Basṭámí  [E]',
      dialogue: 'bg-ali-prison',
      gate: { when: f => !!f.bgJailerLetIn, lockedDialogue: 'bg-ali-barred' },
      present: bgWinter },
    { gridX: 9, gridY: 3, texture: 'bg-prisoner',
      prompt: 'Speak with the Prisoner  [E]',
      dialogue: 'bg-prisoner' },
  ],
  exits: [
    { fromX: STEPS_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'BaghdadQuay', targetSpawnX: BG_PRISON_DOOR.x, targetSpawnY: BG_PRISON_DOOR.y + 1,
      label: '↓ Up the steps to the quay' },
  ],
  ambience: (): MapAmbience => ({
    wash: { color: 0x3a3640, alpha: 0.42 },
    lights: [
      { gridX: 9, gridY: 6, radius: 150, color: 0xff9a40, intensity: 0.5 },
      { gridX: 4, gridY: 8, radius: 110, color: 0xffb860, intensity: 0.35 },
      { gridX: 5, gridY: 2, radius: 120, color: 0xc8d4e8, intensity: 0.35 },
    ],
    particles: 'motes', music: 'prison', sound: ['river'], vignette: 0.7,
  }),
};
