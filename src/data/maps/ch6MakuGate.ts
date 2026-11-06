import type { FlagState } from '../../dialogue/types';
import type { DecorSpec, MapAmbience, MapDefinition, NpcSpec } from './types';

/**
 * The river bridge below Mákú, Naw-Rúz 1848, at true scale. Nabíl (ch. XIII)
 * has ʿAlí Khán dream on the eve of the New Year that the Prophet was coming
 * to visit his Prisoner, and run out to the bridge a maydán from the town;
 * at sunrise he walked out alone, his three best horses led after him, and
 * met Mullá Ḥusayn coming on foot from Mashhad with Qambar-ʿAlí, who would
 * not mount: he had vowed to walk the whole way. Nine days later, on the
 * ninth morning after Naw-Rúz, Mullá Ḥusayn went back over the bridge on
 * foot, bidden to Mázindarán.
 *
 * The snow is going off the lower slopes; the river runs loud with it.
 * The road comes up from the town at the south-west, turns east and crosses
 * the river by the bridge, and runs on east toward Khuy.
 *
 * The Báb is never on the map; He is spoken of by those who come down from
 * the fortress.
 *
 * Phases (flags): before the dream is told, the Khán waits on the bridge
 * with his groom and horses; once `ch6HeardDream`, Mullá Ḥusayn and
 * Qambar-ʿAlí have crossed; once `ch6MetMullaHusayn`, they and the Khán have
 * gone up the mountain and the horses home; once `ch6NinthMorning`, the two
 * are back at the bridge, leaving, until `ch6HusaynCharge`.
 *
 * Districts (x runs east, y runs south):
 * - The road from the town: x 7..8, from the south-west edge (exit to Mákú
 *   at (7, 27)) up to the turn at y 12..13.
 * - The road east: y 12..13 from x 7 across the bridge (x 17..18) to the
 *   east edge.
 * - The river x 17..18, north to south; the mill on the east bank at
 *   x 20..24, y 2..5.
 * - The meadow south of the road: the groom and the horses, the old man by
 *   the road at (4, 20).
 */

const W = 30;
const H = 28;
const RIVER = 17;
const ROAD_X = 7;
const ROAD_Y = 12;

const has = (flag: string) => (f: FlagState) => !!f[flag];
const heard = has('ch6HeardDream');
const met = has('ch6MetMullaHusayn');
const ninth = has('ch6NinthMorning');
const leaving = (f: FlagState) => ninth(f) && !f.ch6HusaynCharge;

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

/** The mountain behind: rocks and pines along the north, blossom in the lee of the slope. */
const SLOPE: DecorSpec[] = [
  ...blocking('ch6-rock', [[1, 1], [5, 0], [9, 2], [13, 1], [26, 1], [28, 6], [0, 7]]),
  ...blocking('ch6-pine', [[0, 3], [3, 2], [7, 1], [11, 0], [15, 2], [27, 3], [29, 9], [0, 11], [1, 15], [0, 19]]),
  ...blocking('kulayn-apricot', [[4, 6], [10, 5]]),
  ...blocking('kulayn-almond', [[7, 8], [13, 7], [3, 10]]),
  ...loose('ch6-snow-drift', [[2, 5], [8, 4], [14, 4], [25, 7], [28, 11], [1, 22]]),
];

/** The river banks: reeds, and the bridge planks over the water. */
const RIVERSIDE: DecorSpec[] = [
  ...loose('ch6-footbridge', [[RIVER, ROAD_Y], [RIVER + 1, ROAD_Y], [RIVER, ROAD_Y + 1], [RIVER + 1, ROAD_Y + 1]]),
  ...blocking('ch5-river-reeds', [[16, 4], [19, 8], [16, 18], [19, 21], [16, 25]]),
];

/** The meadow and the east bank: snow shrubs, a flock out on the first grass, stones by the road. */
const MEADOW: DecorSpec[] = [
  ...blocking('ch6-snow-shrub', [[13, 19], [3, 25], [24, 18], [27, 24]]),
  ...blocking('ch6-rock', [[11, 24], [22, 25], [28, 16]]),
  ...blocking('flock-sheep', [[24, 21]]),
  ...blocking('ch2-milestone', [[9, 11]]),
  ...loose('ch6-snow-drift', [[12, 22], [5, 17], [21, 17], [26, 26]]),
  // The old man's New Year cloth, spread on the first dry grass.
  ...loose('rug', [[5, 21]]),
];

/** The Khán's three best horses, saddled, until they go home riderless. */
const HORSES: DecorSpec[] = [
  { gridX: 9, gridY: 16, texture: 'kulayn-horse', blocks: true, present: f => !met(f) },
  { gridX: 10, gridY: 15, texture: 'kulayn-horse-grey', blocks: true, present: f => !met(f) },
  { gridX: 11, gridY: 14, texture: 'kulayn-horse', blocks: true, present: f => !met(f) },
];

const PEOPLE: NpcSpec[] = [
  { gridX: 16, gridY: 11, texture: 'ch6-warden',
    prompt: 'Speak with ʿAlí Khán  [E]',
    dialogue: 'ch6-gate-khan-refused',
    present: f => !met(f),
    gate: { when: heard, lockedDialogue: 'ch6-gate-khan' } },
  { gridX: 11, gridY: 16, texture: 'ch6-groom',
    prompt: 'Speak with the Khán\'s Groom  [E]',
    dialogue: 'ch6-gate-groom',
    present: f => !met(f) },
  { gridX: 11, gridY: 16, texture: 'ch6-groom',
    prompt: 'Speak with the Khán\'s Groom  [E]',
    dialogue: 'ch6-gate-groom-ninth',
    present: met,
    gate: { when: ninth, lockedDialogue: 'ch6-gate-groom-days' } },
  { gridX: 4, gridY: 20, texture: 'ch6-maku-elder',
    prompt: 'Speak with the Old Man of Mákú  [E]',
    dialogue: 'ch6-gate-elder' },
  // Just over the bridge, the morning they come.
  { gridX: 15, gridY: 14, texture: 'ch6-mulla-husayn',
    prompt: 'Speak with Mullá Ḥusayn  [E]',
    dialogue: 'ch6-gate-husayn-arrival',
    present: f => heard(f) && !met(f) },
  { gridX: 20, gridY: 11, texture: 'ch6-qambar-ali',
    prompt: 'Speak with Qambar-ʿAlí  [E]',
    dialogue: 'ch6-gate-qambar',
    present: f => heard(f) && !met(f) },
  // Back over the bridge, the ninth morning after.
  { gridX: 19, gridY: 14, texture: 'ch6-mulla-husayn',
    prompt: 'Speak with Mullá Ḥusayn  [E]',
    dialogue: 'ch6-gate-husayn-farewell',
    present: leaving },
  { gridX: 22, gridY: 11, texture: 'ch6-qambar-ali',
    prompt: 'Speak with Qambar-ʿAlí  [E]',
    dialogue: 'ch6-gate-qambar-ninth',
    present: leaving },
];

const ambience = (f: FlagState): MapAmbience => ({
  wash: ninth(f) ? { color: 0xe8c8a0, alpha: 0.18 } : { color: 0xe0a880, alpha: 0.28 },
  lights: [{ gridX: RIVER, gridY: ROAD_Y, radius: 160, color: 0xffd8a0, intensity: 0.35 }],
  particles: 'motes',
  music: ninth(f) ? 'road' : 'hope',
  sound: ['river', 'birds', 'breeze'],
  vignette: 0.4,
});

export const ch6MakuGateMap: MapDefinition = {
  key: 'Ch6MakuGate',
  title: 'Mákú, the River Bridge at Naw-Rúz',
  width: W,
  height: H,
  spawn: { x: ROAD_X, y: H - 2 },
  water: { flow: [0, 0.8] },
  build: ({ paintRect, setTile, block }) => {
    paintRect(0, 0, W, H, 'grass');
    paintRect(20, 2, 5, 4, 'sand');          // the mill yard
    paintRect(ROAD_X, ROAD_Y, 2, H - ROAD_Y, 'path');
    paintRect(ROAD_X, ROAD_Y, W - ROAD_X, 2, 'path');
    for (let y = 0; y < H; y += 1) {
      for (const x of [RIVER, RIVER + 1]) {
        setTile(x, y, 'water');
        if (y !== ROAD_Y && y !== ROAD_Y + 1) block(x, y);
      }
    }
  },
  buildings: [
    // A mill on the east bank, its race off the river.
    { gridX: 20, gridY: 2, w: 5, h: 4, variant: 0, texture: 'ch6-mountain-house' },
  ],
  decor: [...SLOPE, ...RIVERSIDE, ...MEADOW, ...HORSES],
  npcs: PEOPLE,
  remarks: [
    { id: 'ch6-gate-sunrise', gridX: ROAD_X, gridY: H - 3, radius: 2, requires: f => !heard(f),
      lines: [{ speaker: 'Narrator', text: 'Naw-Rúz at Mákú. The snow is going off the lower slopes, and the river under the bridge runs loud and full with it.' }] },
  ],
  exits: [
    { fromX: ROAD_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch6Maku', targetSpawnX: 39, targetSpawnY: 1,
      label: '↓ Back to the town of Mákú' },
  ],
  ambience,
};
