import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The western gate of Ṭihrán at dawn, January 1853, at true scale. The
 * exiles' caravan for Baghdád left before first light; only its tracks
 * remain in the snow. The city wall runs north to south with the gate in
 * its middle; outside, the road runs west past the caravanserai where the
 * mules were hired and a milestone, toward the mountains.
 *
 * Districts (x runs east, y runs south):
 * - Inside the walls: x 39..49, paved, a few houses; the way back into the
 *   city at the east edge (49, 18).
 * - The city wall on x = 37; the gate at x 36..38, y 17..20, its passage on
 *   the road's rows 18..19. The gate guard stands inside it at (40, 17).
 * - The road west: y 18..19 from the gate to the west edge, the milestone
 *   and the last look down the road at its far end (2, 18).
 * - The caravanserai: x 6..25, y 0..15, its gate onto the yard (y 16..17).
 * - The snowfields south of the road, a frozen pond at x 4..8, y 27..31;
 *   Zahrá and Riḍá stand where the road leaves the gate.
 */

const W = 50;
const H = 38;
const ROAD = 18;
const GATE = { x: 36, y: ROAD - 1 } as const;
const SERAI = { x: 6, y: 0 } as const;

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

/** The city wall, north and south of the gate, which it runs into. */
const CITY_WALL: DecorSpec[] = [
  ...wallRun('ch10-city-wall-snow', GATE.x + 1, 0, GATE.x + 1, GATE.y - 1),
  ...wallRun('ch10-city-wall-snow', GATE.x + 1, GATE.y + 4, GATE.x + 1, H - 1),
];

const INSIDE: DecorSpec[] = [
  // Lamps either side of the gate, still lit at dawn.
  ...block('lamp', [[39, 16], [39, 21]]),
  ...block('cypress', [[47, 8], [47, 28], [40, 34]]),
  ...block('crates', [[40, 14]]),
  ...loose('ch10-snow-drift', [[40, 8], [44, 15], [39, 27], [45, 22], [48, 34]]),
];

/** The caravanserai yard: loads left behind, ropes, a lamp at its gate. */
const YARD: DecorSpec[] = [
  ...block('crates', [[9, 16], [10, 16]]),
  ...block('ch9-rope-coils', [[23, 16]]),
  ...block('ch9-cloth-bundle', [[8, 17]]),
  ...block('lamp', [[14, 16], [18, 16]]),
];

/** The fields under snow outside the wall, scrub, and the first rocks of the western hills. */
const FIELDS: DecorSpec[] = [
  // The tracks of the exiles' caravan, heading west.
  ...loose('ch10-snow-tracks', [[34, 18], [30, 19], [26, 18], [22, 19], [18, 18], [14, 19], [10, 18], [6, 19]]),
  ...loose('ch10-snow-drift', [
    [1, 3], [3, 8], [2, 13], [28, 2], [32, 6], [29, 11], [34, 13], [27, 15],
    [12, 22], [18, 24], [24, 23], [33, 25], [2, 24], [10, 27], [15, 30], [21, 28],
    [27, 31], [34, 30], [4, 34], [11, 35], [19, 34], [30, 35], [24, 36],
  ]),
  ...block('ch2-milestone', [[3, 17]]),
  ...block('ch6-rock', [[0, 1], [2, 5], [0, 10], [31, 1], [35, 9], [1, 33], [13, 33], [26, 34], [34, 35]]),
  ...block('ch6-snow-shrub', [[3, 11], [29, 4], [33, 2], [30, 14], [8, 23], [16, 26], [23, 31], [31, 28], [6, 35], [17, 36]]),
  ...block('ch2-tamarisk', [[27, 8], [20, 22], [10, 32], [35, 22]]),
  ...block('cypress', [[26, 21], [3, 21]]),
];

/** Old snow drifted thinly over the open fields outside the wall, clear of the road, the yard and the pond. */
function scatteredDrifts(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < GATE.x; x++) {
      const inSerai = x >= SERAI.x - 1 && x <= SERAI.x + 20 && y <= 17;
      const onRoad = y >= ROAD - 1 && y <= ROAD + 2;
      const inPond = x >= 3 && x <= 9 && y >= 26 && y <= 32;
      if (!inSerai && !onRoad && !inPond && (x * 7 + y * 13) % 9 === 0) out.push({ gridX: x, gridY: y, texture: 'ch10-snow-drift' });
    }
  }
  return out;
}

export const ch10ExileRoadMap: MapDefinition = {
  key: 'Ch10ExileRoad',
  title: 'The Road West, at Dawn',
  width: W,
  height: H,
  spawn: { x: 47, y: ROAD },
  build: ({ paintRect, setTile, block: blockCell }) => {
    paintRect(0, 0, W, H, 'sand');
    // Inside the walls: the paved street up to the gate.
    paintRect(GATE.x + 3, 0, W - GATE.x - 3, H, 'stone');
    // The road west through the gate, and the caravanserai yard beside it.
    paintRect(0, ROAD, W, 2, 'path');
    paintRect(SERAI.x + 2, 16, 18, 2, 'stone');
    // A frozen pond in the south-west hollow.
    paintRect(4, 27, 5, 4, 'water');
    setTile(6, 31, 'water');
    for (let y = 27; y < 31; y++) for (let x = 4; x < 9; x++) blockCell(x, y);
    blockCell(6, 31);
    // The gate's towers either side of its passage.
    for (let x = GATE.x; x < GATE.x + 3; x++) {
      blockCell(x, GATE.y);
      blockCell(x, GATE.y + 3);
    }
  },
  buildings: [
    { gridX: GATE.x, gridY: GATE.y, w: 3, h: 4, texture: 'ch10-west-gate', blocks: false },
    // Houses inside the gate.
    { gridX: 41, gridY: 3, w: 6, h: 4, texture: 'ch10-street-house' },
    { gridX: 42, gridY: 9, w: 5, h: 4, texture: 'town-house-small' },
    { gridX: 41, gridY: 24, w: 6, h: 4, texture: 'ch10-street-house' },
    { gridX: 42, gridY: 30, w: 5, h: 4, texture: 'town-house-small' },
    // The caravanserai where the mules were hired, painted in two parts.
    { gridX: SERAI.x, gridY: SERAI.y, w: 12, h: 16, texture: 'ch2-caravanserai' },
    { gridX: SERAI.x + 12, gridY: SERAI.y, w: 8, h: 16, texture: 'ch2-caravanserai-east' },
  ],
  decor: [...CITY_WALL, ...INSIDE, ...YARD, ...scatteredDrifts(), ...FIELDS],
  npcs: [
    { gridX: GATE.x + 4, gridY: GATE.y, texture: 'ch10-guard',
      prompt: 'Speak with the guard at the gate  [E]',
      dialogue: 'ch10-gate-guard' },
    { gridX: 17, gridY: 17, texture: 'ch10-muleteer',
      prompt: 'Speak with the Muleteer  [E]',
      dialogue: 'ch10-muleteer' },
    { gridX: 30, gridY: 21, texture: 'ch10-waiting-sister',
      prompt: 'Speak with Zahrá  [E]',
      dialogue: 'ch10-sister-road' },
    { gridX: 31, gridY: 21, texture: 'ch10-young-prisoner',
      prompt: 'Speak with Riḍá  [E]',
      dialogue: 'ch10-rida-road' },
    { gridX: 2, gridY: ROAD, texture: 'ch10-snow-tracks',
      prompt: 'Look down the road west  [E]',
      dialogue: 'ch10-final',
      gate: { when: f => !!f.ch10HeardDeparture, lockedDialogue: 'ch10-final-waiting' } },
  ],
  exits: [
    { fromX: W - 1, fromY: ROAD, dx: 1, dy: 0,
      targetScene: 'Ch10TehranStreet', targetSpawnX: 1, targetSpawnY: 21,
      label: '→ Back into the city' },
  ],
  ambience: {
    wash: { color: 0xe0a888, alpha: 0.3 },
    particles: 'snow', music: 'hope',
    vignette: 0.5,
    lights: [
      { gridX: 44, gridY: 8, radius: 320, color: 0xffc890, intensity: 0.5 },
      { gridX: GATE.x + 1, gridY: ROAD, radius: 180, color: 0xffd8a0, intensity: 0.4 },
    ],
  },
};
