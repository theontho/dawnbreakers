import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The flat roofs on the south side of the barrack square, noon on 9 July
 * 1850, at true scale. Three roofs, divided by chest-high brick parapets
 * and packed with watchers; brick domes over the rooms below, washing
 * lines, bread cooling on the parapet. The north parapet overlooks the
 * square and the barrack across it; a mat at its foot is where the player
 * keeps watch. The stair down to the square is on the west edge.
 *
 * Districts (x runs east, y runs south):
 * - West roof: x 1..11, the stair landing at (0, 14).
 * - Middle roof: x 13..23, the vantage mat at (17, 1) on the north parapet.
 * - East roof: x 25..34.
 * Dividers at x 12 and 24 open in two places each.
 */

const W = 36;
const H = 28;
const EXIT_Y = 14;
const VANTAGE = { x: 17, y: 1 };

const after = (f: Record<string, unknown>) => !!f.ch9WitnessedVolleys;

/** The parapets: round the edge, open at the stair landing, and the two dividers. */
function parapets(): DecorSpec[] {
  const p = 'ch9-parapet-low';
  return [
    ...wallRun(p, 0, 0, W - 1, 0),
    ...wallRun(p, 0, 1, 0, H - 1, [[0, EXIT_Y]]),
    ...wallRun(p, W - 1, 1, W - 1, H - 1),
    ...wallRun(p, 1, H - 1, W - 2, H - 1),
    ...wallRun(p, 12, 1, 12, H - 2, [[12, 5], [12, 6], [12, 19], [12, 20]]),
    ...wallRun(p, 24, 1, 24, H - 2, [[24, 8], [24, 9], [24, 21], [24, 22]]),
  ];
}

// Watchers pressed against the north parapet, leaving room at the mat.
const RAIL_CROWD: DecorSpec[] = [1, 2, 4, 5, 7, 8, 10, 14, 15, 19, 20, 22, 26, 27, 29, 31, 33, 34]
  .map(x => ({ gridX: x, gridY: 1, texture: 'crowd', blocks: true }));

const ROOF_CROWD: DecorSpec[] = [
  [5, 12], [9, 18], [16, 10], [20, 23], [28, 12], [32, 20], [18, 16], [3, 24],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd', blocks: true }));

const SHADOWS: DecorSpec[] = [
  [3, 4], [9, 3], [15, 5], [21, 13], [30, 4], [27, 20], [6, 20], [14, 22],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd-shadow' }));

/** Brick domes over the rooms below, 2 x 2 cells each. */
const domes: BuildingSpec[] = [
  [4, 20], [19, 6], [29, 7], [28, 22],
].map(([x, y]) => ({ gridX: x!, gridY: y!, w: 2, h: 2, texture: 'ch9-brick-dome' }));

const props: DecorSpec[] = [
  { gridX: 7, gridY: 15, texture: 'ch9-washing-line', blocks: true },
  { gridX: 21, gridY: 19, texture: 'ch9-washing-line', blocks: true },
  { gridX: 4, gridY: 6, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 9, gridY: 24, texture: 'ch9-water-jar', blocks: true },
  { gridX: 32, gridY: 15, texture: 'ch9-water-jar', blocks: true },
  { gridX: 15, gridY: 24, texture: 'rug' },
  { gridX: 27, gridY: 16, texture: 'rug' },
];

export const ch9BarrackRoofMap: MapDefinition = {
  key: 'Ch9BarrackRoof',
  title: 'Tabríz, the Rooftops',
  width: W,
  height: H,
  spawn: { x: 1, y: EXIT_Y },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(13, 1, 11, H - 2, 'stone');
    paintRect(0, EXIT_Y, 3, 1, 'path');
  },
  buildings: domes,
  decor: [...parapets(), ...RAIL_CROWD, ...ROOF_CROWD, ...SHADOWS, ...props],
  npcs: [
    { gridX: VANTAGE.x, gridY: VANTAGE.y, texture: 'rug',
      prompt: 'Look down into the barrack square  [E]',
      dialogue: 'ch9-vantage-after',
      gate: { when: after, lockedDialogue: 'ch9-vantage' } },
    { gridX: 5, gridY: 6, texture: 'ch9-widow',
      prompt: 'Speak with the Baker\'s Widow  [E]',
      dialogue: 'ch9-widow-after',
      gate: { when: after, lockedDialogue: 'ch9-widow' } },
    { gridX: 20, gridY: 4, texture: 'ch9-student',
      prompt: 'Speak with the Madrasa Student  [E]',
      dialogue: 'ch9-student-after',
      gate: { when: after, lockedDialogue: 'ch9-student' } },
    { gridX: 29, gridY: 15, texture: 'ch9-witness',
      prompt: 'Speak with the Witness in the Crowd  [E]',
      dialogue: 'ch9-crowd-witness-after',
      gate: { when: after, lockedDialogue: 'ch9-crowd-witness' } },
  ],
  exits: [
    { fromX: 0, fromY: EXIT_Y, dx: -1, dy: 0,
      targetScene: 'Ch9TabrizSquare', targetSpawnX: 42, targetSpawnY: 16,
      label: '← Down the stair to the square' },
  ],
  ambience: {
    wash: { color: 0xc8a070, alpha: 0.3 },
    particles: 'dust', music: 'sorrow',
    vignette: 0.65,
  },
};
