import { chihriqWitnesses } from '../dialogues_ch/chapter06_chihriq';
import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Chihríq, spring and summer 1848, at true scale: the "Grievous Mountain".
 *
 * Harsher than Mákú. The castle clings to the crag in the north-east, the
 * rampart ringing its courtyard, its one gate facing south down the climb.
 * The track climbs to it along a ledge from the road below, which comes in
 * from Mákú at the west edge and runs on to a Kurdish hamlet; beyond the
 * hamlet a cold river is crossed at a ford of flat stones.
 *
 * The Báb is never on the map: the barred window of the castle is the
 * threshold where the chapter closes.
 *
 * Districts (x runs east, y runs south):
 * - The fortress: rampart x 22..43, y 1..18 (its east side on the map's
 *   edge, cut away); the castle x 32..39, y 2..9, its door at (35, 9); the
 *   amanuensis's corner x 23..27, y 3..7; the gate x 26..28, y 17..19, its
 *   passage down x = 27.
 * - The climb: down from the gate, west along the ledge (y 22..23), down
 *   x 14..15 to the road (y 26..27), which leaves west at (0, 27).
 * - The hamlet: x 9..41, y 28..37, its lane down x 26..27 to the ford.
 * - The river y 39..40, forded at x 26..27; fields beyond.
 */

const W = 44;
const H = 44;

/** The rampart ring, and its gate in the south wall. */
const FORT = { x0: 22, y0: 1, x1: W - 1, y1: 18 } as const;
const GATE = { x: 26, y: 17, passage: 27 } as const;
const CASTLE = { x: 32, y: 2, w: 8, h: 8 } as const;
const ROAD = 26;
const RIVER = 39;
const FORD = 26;

function ramparts(): DecorSpec[] {
  const r = 'ch6-rampart';
  return [
    ...wallRun(r, FORT.x0, FORT.y0, FORT.x1, FORT.y0),
    ...wallRun(r, FORT.x0, FORT.y0 + 1, FORT.x0, FORT.y1),
    ...wallRun(r, FORT.x1, FORT.y0 + 1, FORT.x1, FORT.y1),
    ...wallRun(r, FORT.x0 + 1, FORT.y1, GATE.x - 1, FORT.y1),
    ...wallRun(r, GATE.x + 3, FORT.y1, FORT.x1 - 1, FORT.y1),
  ];
}

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

/** Courtyard: the amanuensis's desk and lamp, a brazier, a narrow row of cells along the west wall. */
const COURTYARD: DecorSpec[] = [
  ...blocking('writing-desk', [[25, 4]]),
  ...blocking('lamp', [[23, 3]]),
  ...blocking('crates', [[27, 3]]),
  ...blocking('ch6-brazier', [[40, 13]]),
  ...blocking('ch6-barred-marker', [[23, 10], [23, 11], [23, 12]]),
  ...blocking('ch10-chain-post', [[34, 13]]),
  ...loose('ch6-snow-drift', [[30, 3], [24, 14], [31, 12], [41, 6], [37, 15], [29, 9]]),
  ...loose('rug', [[24, 7]]),
];

/** The crag: rocks crowd the climb, pines in the gullies. */
const CRAG: DecorSpec[] = [
  ...blocking('ch6-rock', [
    [0, 1], [3, 0], [6, 3], [1, 6], [9, 1], [12, 4], [4, 9], [8, 7], [14, 2], [17, 6], [11, 10],
    [0, 12], [3, 14], [7, 13], [15, 11], [19, 9], [13, 16], [18, 15], [1, 18], [6, 19], [10, 18],
    [16, 19], [20, 20], [22, 21], [29, 21], [32, 20], [36, 21], [40, 20], [9, 22], [4, 23], [12, 24],
    [18, 25], [24, 25], [31, 24], [38, 24],
  ]),
  ...blocking('ch6-pine', [
    [2, 3], [7, 0], [16, 1], [11, 7], [20, 4], [2, 10], [7, 10], [17, 12], [13, 20], [3, 20],
    [19, 17], [25, 21], [34, 23], [41, 22], [8, 24], [21, 25],
  ]),
  ...blocking('ch6-snow-shrub', [[5, 6], [14, 8], [9, 15], [20, 13], [1, 15], [11, 21], [17, 21], [30, 20], [36, 25], [2, 24]]),
  ...loose('ch6-snow-drift', [
    [0, 0], [10, 0], [5, 3], [15, 5], [9, 4], [3, 12], [12, 13], [18, 9], [6, 16], [15, 18], [21, 17],
    [7, 21], [19, 22], [33, 21], [39, 23], [27, 24],
  ]),
];

/** The hamlet: houses, the fold, a well, firewood, people of the mountain. */
const HAMLET: DecorSpec[] = [
  ...wallRun('ch6-fold-wall', 37, 29, 41, 29),
  ...wallRun('ch6-fold-wall', 41, 30, 41, 33),
  ...blocking('well', [[22, 35]]),
  ...blocking('crates', [[18, 34], [29, 33]]),
  ...blocking('ch9-cloth-bundle', [[23, 37]]),
  ...blocking('lamp', [[25, 30], [28, 35]]),
  ...blocking('ch6-snow-shrub', [[8, 34], [29, 37], [38, 36], [6, 29], [24, 28]]),
  ...blocking('ch6-rock', [[2, 29], [0, 32], [5, 33], [3, 36], [41, 36], [36, 28]]),
  ...blocking('ch6-pine', [[0, 35], [7, 37], [39, 37], [42, 27]]),
  ...loose('ch6-snow-drift', [[15, 28], [20, 37], [37, 38], [38, 31], [10, 33], [3, 31], [29, 28]]),
  ...loose('rug', [[19, 36]]),
];

/** Fields beyond the river. */
const FIELDS: DecorSpec[] = [
  ...blocking('ch6-pine', [[3, 42], [11, 41], [19, 43], [33, 42], [40, 41]]),
  ...loose('ch6-snow-drift', [[7, 42], [15, 41], [22, 42], [30, 41], [37, 43]]),
  ...blocking('ch2-tamarisk', [[24, 43], [29, 42]]),
];

export const ch6ChihriqMap: MapDefinition = {
  key: 'Ch6Chihriq',
  title: 'Chihríq, the Grievous Mountain',
  width: W,
  height: H,
  spawn: { x: 1, y: ROAD + 1 },
  build: ({ paintRect, setTile, block }) => {
    paintRect(0, 0, W, H, 'stone');
    paintRect(23, 3, 5, 5, 'sand');           // the amanuensis's corner
    paintRect(8, 28, 34, 10, 'sand');         // the Kurdish hamlet
    paintRect(38, 30, 3, 4, 'sand');          // the fold
    paintRect(0, RIVER + 2, W, H - RIVER - 2, 'sand'); // fields beyond the river
    // Inside the walls: from the gate to the castle door, and to the amanuensis.
    paintRect(GATE.passage, 11, 1, GATE.y + 3 - 11, 'path');
    paintRect(GATE.passage, 10, 9, 2, 'path');
    paintRect(25, 8, 3, 3, 'path');
    // The climb: down from the gate, west along the ledge, down to the road.
    paintRect(GATE.passage, 20, 2, 2, 'path');
    paintRect(14, 22, 15, 2, 'path');
    paintRect(14, 24, 2, 2, 'path');
    // The road from Mákú, on to the hamlet.
    paintRect(0, ROAD, 36, 2, 'path');
    // Down through the hamlet to the ford, and on across the fields.
    paintRect(FORD, ROAD + 2, 2, H - ROAD - 2, 'path');
    // The river below the hamlet, crossed at a ford of flat stones.
    for (let x = 0; x < W; x += 1) {
      for (const y of [RIVER, RIVER + 1]) {
        if (x === FORD || x === FORD + 1) {
          setTile(x, y, 'stone');
          continue;
        }
        setTile(x, y, 'water');
        block(x, y);
      }
    }
    // The gate's towers either side of its passage.
    for (let y = GATE.y; y < GATE.y + 3; y += 1) {
      block(GATE.x, y);
      block(GATE.x + 2, y);
    }
  },
  buildings: [
    { gridX: CASTLE.x, gridY: CASTLE.y, w: CASTLE.w, h: CASTLE.h, texture: 'ch6-chihriq-fortress' },
    { gridX: GATE.x, gridY: GATE.y, w: 3, h: 3, texture: 'ch6-fortress-gate', blocks: false },
    // The hamlet.
    { gridX: 9, gridY: 29, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 17, gridY: 29, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 30, gridY: 30, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 13, gridY: 34, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 32, gridY: 35, w: 5, h: 4, texture: 'ch6-mountain-house' },
  ],
  decor: [...ramparts(), ...COURTYARD, ...CRAG, ...HAMLET, ...FIELDS],
  npcs: [
    // The road and the climb.
    { gridX: 6, gridY: 25, texture: 'ch6-dervish',
      prompt: 'Speak with the Dervish from India  [E]',
      dialogue: 'ch6-dervish' },
    { gridX: 19, gridY: 21, texture: 'ch6-dayyan',
      prompt: 'Speak with Mírzá Asadu\'lláh of Khuy  [E]',
      dialogue: 'ch6-dayyan' },
    { gridX: 24, gridY: 21, texture: 'ch6-yahya-khan',
      prompt: 'Speak with Yaḥyá Khán  [E]',
      dialogue: 'ch6-yahya-khan' },
    // Within the walls.
    { gridX: 25, gridY: 6, texture: 'ch6-amanuensis',
      prompt: 'Speak with Siyyid Ḥusayn, the Amanuensis  [E]',
      dialogue: 'ch6-amanuensis-chihriq' },
    { gridX: 38, gridY: 10, texture: 'ch6-barred-marker',
      prompt: 'Keep watch beneath the barred window  [E]',
      dialogue: 'ch6-chihriq-window',
      gate: { when: f => !!f.ch6MetYahyaKhan && chihriqWitnesses(f) >= 2, lockedDialogue: 'ch6-chihriq-window-closed' } },
    // The hamlet.
    { gridX: 38, gridY: 32, texture: 'ch6-kurdish-shepherd',
      prompt: 'Speak with the Kurdish Shepherd  [E]',
      dialogue: 'ch6-kurdish-shepherd' },
    { gridX: 24, gridY: 33, texture: 'ch6-courier',
      prompt: 'Speak with the Mountain Courier  [E]',
      dialogue: 'ch6-courier-badasht' },
  ],
  exits: [
    { fromX: 0, fromY: ROAD + 1, dx: -1, dy: 0,
      targetScene: 'Ch6Maku', targetSpawnX: 44, targetSpawnY: 36,
      label: '← Back toward Mákú' },
  ],
  ambience: {
    wash: { color: 0x4a5270, alpha: 0.55 },
    lights: [
      { gridX: 40, gridY: 13, radius: 140, color: 0xff9a4a, intensity: 0.6 },
      { gridX: 38, gridY: 10, radius: 110, color: 0xf3d79a, intensity: 0.35 },
    ],
    particles: 'snow', music: 'sorrow',
    vignette: 0.7,
  },
};
