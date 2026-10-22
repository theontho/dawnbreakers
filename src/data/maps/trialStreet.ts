import type { FlagState } from '../../dialogue/types';
import { streetWitnessCount } from '../dialogues_ch/trial_street';
import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Tabríz, summer 1848, at true scale: the square before the governor's
 * residence, where the Valí-ʿAhd keeps his court. The residence wall closes
 * the north side with its tiled gate in the middle; the crowd presses round
 * the gate until the examination is over. The road from the city gate
 * comes in from the west; the lane to the Shaykhu'l-Islám's house leaves
 * from the east. Shops and houses close the south side.
 *
 * Districts (x runs east, y runs south):
 * - The residence: its wall on y = 8, the gate at x 18..22, y 6..8, the
 *   door at (20, 8). Behind the wall, the roofs of the household.
 * - The square: x 0..40, y 9..25, the crowd round the gate at y 10..12.
 * - The road from the city gate: y 15..17 in from the west edge.
 * - The lane east: y 19..20 to the east edge (exit at (41, 19)).
 * - Shops and houses along the south, y 26..32.
 */

const W = 42;
const H = 34;
const GATE = { gridX: 18, gridY: 6, w: 5, h: 3 } as const;
export const RESIDENCE_DOOR = { x: 20, y: 8 } as const;
export const LANE_EXIT_Y = 19;

/** The crowd stays at the gate until the Prisoner has been taken away and days have passed. */
const crowded = (f: FlagState) => !f.trialBastinado;

const buildings: BuildingSpec[] = [
  { ...GATE, texture: 'trial-residence-gate' },
  // The household behind the wall: houses with no gateway of their own (a courtyard house is
  // its own street front and would stand pasted onto the residence wall), a yard before each.
  { gridX: 4, gridY: 1, w: 6, h: 5, texture: 'town-house', variant: 0 },
  { gridX: 31, gridY: 1, w: 6, h: 5, texture: 'town-house', variant: 1 },
  // Shops and houses on the south side
  { gridX: 2, gridY: 27, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 10, gridY: 27, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 20, gridY: 26, w: 6, h: 5, texture: 'town-house' },
  { gridX: 28, gridY: 27, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 34, gridY: 26, w: 6, h: 5, texture: 'town-house' },
  // A stall at the edge of the square
  { gridX: 6, gridY: 11, w: 2, h: 2, texture: 'market-stall' },
];

/** The residence wall either side of the gate, and the edges of the square. */
function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    ...wallRun(w, 0, 8, GATE.gridX - 1, 8),
    ...wallRun(w, GATE.gridX + GATE.w, 8, W - 1, 8),
    ...wallRun(w, W - 1, 9, W - 1, H - 1, { gaps: [[W - 1, LANE_EXIT_Y], [W - 1, LANE_EXIT_Y + 1]] }),
    ...wallRun(w, 0, H - 1, W - 2, H - 1),
    ...wallRun(w, 18, 27, 18, 31),
    ...wallRun(w, 33, 28, 33, 31),
  ];
}

/** The crowd at the gate, leaving a passage to the door the farráshes keep open. */
const CROWD: DecorSpec[] = [
  [14, 10], [15, 10], [16, 10], [17, 10], [24, 10], [25, 10], [26, 10],
  [13, 11], [15, 11], [17, 11], [23, 11], [25, 11], [27, 11],
  [14, 12], [16, 12], [24, 12], [26, 12], [11, 10], [29, 10],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd', blocks: true, present: crowded }));

const SHADOWS: DecorSpec[] = [
  [12, 13], [18, 13], [22, 13], [28, 12], [10, 16], [30, 17], [20, 21], [14, 23],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd-shadow', present: crowded }));

const props: DecorSpec[] = [
  // Inside the wall: trees over the household
  { gridX: 13, gridY: 3, texture: 'cypress', blocks: true },
  { gridX: 25, gridY: 3, texture: 'cypress', blocks: true },
  { gridX: 15, gridY: 5, texture: 'plane-tree', blocks: true },
  // Plane trees on the square, a well, the stall-keeper's goods
  { gridX: 3, gridY: 12, texture: 'plane-tree', blocks: true },
  { gridX: 36, gridY: 12, texture: 'plane-tree', blocks: true },
  { gridX: 30, gridY: 23, texture: 'plane-tree', blocks: true },
  { gridX: 11, gridY: 19, texture: 'well', blocks: true },
  { gridX: 5, gridY: 14, texture: 'crates', blocks: true },
  { gridX: 9, gridY: 11, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 19, gridY: 25, texture: 'ch9-water-jar', blocks: true },
  // The residence's own men at the gate
  { gridX: 18, gridY: 9, texture: 'ch9-farrash', blocks: true, present: crowded },
];

export const trialStreetMap: MapDefinition = {
  key: 'TrialStreet',
  title: 'Tabríz, before the Governor\'s Residence',
  width: W,
  height: H,
  spawn: { x: 1, y: 16 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(0, 9, W, 17, 'stone');
    // The road in from the city gate, the way to the residence door, the lane east
    paintRect(0, 15, 12, 3, 'path');
    paintRect(19, 9, 3, 7, 'path');
    paintRect(32, LANE_EXIT_Y, W - 32, 2, 'path');
  },
  buildings,
  decor: [...walls(), ...CROWD, ...SHADOWS, ...props],
  npcs: [
    { gridX: 9, gridY: 13, texture: 'trial-merchant',
      prompt: 'Speak with the Cloth Merchant  [E]',
      dialogue: 'trial-merchant' },
    { gridX: 33, gridY: 14, texture: 'trial-azim',
      prompt: 'Speak with ʿAẓím  [E]',
      dialogue: 'trial-azim' },
    { gridX: 22, gridY: 9, texture: 'trial-gate-farrash',
      prompt: 'Speak with the Gate Guard  [E]',
      dialogue: 'trial-gate-farrash',
      gate: { when: f => streetWitnessCount(f) >= 2, lockedDialogue: 'trial-gate-farrash-locked' } },
  ],
  doors: [
    { gridX: RESIDENCE_DOOR.x, gridY: RESIDENCE_DOOR.y, prompt: 'Enter the residence courtyard  [E]',
      targetScene: 'TrialCourt', targetSpawnX: 15, targetSpawnY: 25,
      requires: f => !!f.trialHired,
      lockedLabel: 'The gate is barred to the crowd' },
  ],
  exits: [
    { fromX: W - 1, fromY: LANE_EXIT_Y, dx: 1, dy: 0,
      targetScene: 'TrialLane', targetSpawnX: 1, targetSpawnY: 11,
      label: '→ The lane to the Shaykhu\'l-Islám\'s house',
      requires: f => !!f.trialToShaykh,
      lockedLabel: 'A quiet lane east, toward the citadel' },
  ],
  // Summer noon in Tabríz; days later, a softer afternoon over an emptied square.
  ambience: f => crowded(f)
    ? { wash: { color: 0xe8c088, alpha: 0.2 }, particles: 'dust', vignette: 0.5, music: 'city', sound: ['breeze'] }
    : { wash: { color: 0xd8a070, alpha: 0.22 }, particles: 'motes', vignette: 0.5, music: 'city', sound: ['birds'] },
};
