import type { FlagState } from '../../dialogue/types';
import { SALIH_GATE } from './qazvinLane';
import { QAZVIN_NEEDED, qazvinRounds, qzDay, qzNight } from './qazvinPhases';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The house of Ḥájí Mullá Ṣáliḥ in Qazvín, 1847 to 1848, at true scale: the
 * outer court (birúní), some 33 by 15 m, where the old mujtahid receives
 * his visitors by the pool, and the wall of the inner court (andarún)
 * across its north side. Behind that wall his daughter Qurratu'l-ʿAyn is
 * confined after her uncle's murder, let out of her room only to make her
 * ablutions; the player never passes the door, only speaks through it.
 *
 * Layout (x runs east, y runs south): the outer walls round the edges, the
 * gate to the lane at x 12..13 on y = 21; the andarún wall on y = 9 with
 * its closed door at (16, 9); the women's houses behind it, y 1..8, out of
 * reach. The guest room x 1..6, y 12..16; the pool x 11..13, y 13..15.
 */

const W = 26;
const H = 22;
const GATE_X = 12;
const INNER_Y = 9;
const INNER_DOOR = { x: 16, y: INNER_Y } as const;

function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    ...wallRun(w, 0, 0, W - 1, 0),
    ...wallRun(w, 0, 1, 0, H - 1),
    ...wallRun(w, W - 1, 1, W - 1, H - 2),
    ...wallRun(w, 1, H - 1, W - 2, H - 1, { gaps: [[GATE_X, H - 1], [GATE_X + 1, H - 1]] }),
    ...wallRun(w, 1, INNER_Y, W - 2, INNER_Y, { doors: [[INNER_DOOR.x, INNER_DOOR.y]] }),
  ];
}

const buildings: BuildingSpec[] = [
  // The inner court: the women's rooms, over the wall.
  { gridX: 3, gridY: 3, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 17, gridY: 2, w: 6, h: 5, texture: 'town-house' },
  // The guest room off the outer court.
  { gridX: 1, gridY: 12, w: 6, h: 5, texture: 'town-house' },
  { gridX: 11, gridY: 13, w: 3, h: 3, texture: 'fountain-pool' },
];

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));

/** Qazvín's winters are too hard for the orange: its courts grow the pomegranate (variant 2 of `fruit-tree`). */
const pomegranates = (cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'fruit-tree', variant: 2, blocks: true }));

const props: DecorSpec[] = [
  // Over the inner wall: a cypress and a pomegranate in her court.
  ...pomegranates([[10, 6]]),
  ...block('cypress', [[13, 4]]),
  // The outer court: pomegranates round the pool, a plane in the corner.
  ...pomegranates([[9, 12], [16, 13], [9, 17], [16, 17]]),
  ...block('plane-tree', [[3, 19]]),
  ...block('lamp', [[15, 10], [18, 10], [GATE_X - 1, H - 2], [GATE_X + 2, H - 2]]),
  ...block('ch1-planter', [[8, 10], [23, 10]]),
  ...block('ch9-water-jar', [[7, 18]]),
  ...block('ch5-ewer', [[14, 17]]),
  { gridX: 12, gridY: 17, texture: 'rug' },
  { gridX: 20, gridY: 15, texture: 'rug' },
  ...block('ch7-bolster', [[20, 14]]),
];

export const qazvinHouseMap: MapDefinition = {
  key: 'QazvinHouse',
  title: 'The House of Mullá Ṣáliḥ',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: H - 3 },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'stone');
    paintRect(1, 1, W - 2, INNER_Y - 1, 'grass');
    for (let y = 1; y < INNER_Y; y++) for (let x = 1; x < W - 1; x++) blockCell(x, y);
    paintRect(GATE_X, 16, 2, H - 16, 'path');
    paintRect(INNER_DOOR.x, INNER_Y + 1, 1, 3, 'path');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    { gridX: INNER_DOOR.x, gridY: INNER_DOOR.y,
      prompt: 'Speak at the closed door  [E]',
      dialogue: 'qz-door',
      present: qzDay },
    { gridX: INNER_DOOR.x, gridY: INNER_DOOR.y,
      prompt: 'Look at the closed door  [E]',
      dialogue: 'qz-door-night',
      present: qzNight },
    { gridX: 13, gridY: 17, texture: 'qazvin-mulla-salih',
      prompt: 'Speak with Mullá Ṣáliḥ  [E]',
      dialogue: 'qz-father',
      present: qzDay },
    { gridX: 13, gridY: 17, texture: 'qazvin-mulla-salih',
      prompt: 'Speak with Mullá Ṣáliḥ  [E]',
      dialogue: 'qz-father-night',
      present: qzNight },
    { gridX: 19, gridY: 12, texture: 'qazvin-mardiyyih',
      prompt: 'Speak with Marḍíyyih  [E]',
      dialogue: 'qz-mardiyyih',
      gate: { when: f => qazvinRounds(f) >= QAZVIN_NEEDED, lockedDialogue: 'qz-mardiyyih-wait' },
      present: qzDay },
    { gridX: 19, gridY: 12, texture: 'qazvin-mardiyyih',
      prompt: 'Speak with Marḍíyyih  [E]',
      dialogue: 'qz-mardiyyih-night',
      present: qzNight },
  ],
  exits: [GATE_X, GATE_X + 1].map(fromX => ({
    fromX, fromY: H - 1, dx: 0, dy: 1,
    targetScene: 'QazvinLane', targetSpawnX: SALIH_GATE.x, targetSpawnY: SALIH_GATE.y + 1,
    label: '↓ Out to the lane',
  })),
  ambience: f => houseAmbience(f),
};

function houseAmbience(f: FlagState): MapAmbience {
  if (qzNight(f)) {
    return {
      wash: { color: 0x2a3560, alpha: 0.58 },
      lights: [{ gridX: 19, gridY: 4, radius: 150, color: 0xffc070, intensity: 0.4 }],
      particles: 'motes', music: 'night', sound: ['crickets'], vignette: 0.7,
    };
  }
  return { wash: { color: 0x8a8070, alpha: 0.3 }, particles: 'leaves', music: 'sorrow', sound: ['birds'], vignette: 0.55 };
}
