import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Mákú, winter 1847 to spring 1848, at true scale: the "Open Mountain".
 *
 * The castle sits high in the north-west under its overhanging crag, and
 * the rampart rings its snowy courtyard; the one gate opens south onto the
 * mountainside. A switchback track drops from the gate to the little town
 * at the mountain's foot, where the people of Mákú gather each morning to
 * look up at the walls. A cold stream runs down the east side; across its
 * bridge the Tabríz road leaves for Chihríq, and the Mashhad road comes in
 * from the north, the road Mullá Ḥusayn walked on foot.
 *
 * The Báb is never on the map. He is reached through the barred window of
 * the castle, the pages in His amanuensis's room, and what others say of Him.
 * That room is a mud-roofed lodging built against the castle's east wall;
 * Siyyid Ḥusayn writes there, indoors, as scribes did, seated on the floor.
 *
 * Districts (x runs east, y runs south):
 * - The fortress: rampart x 1..22, y 1..19; the castle x 3..11, y 2..8, its
 *   door at (7, 8); the amanuensis's room x 12..16, y 3..6, its door at
 *   (14, 6) (Ch6MakuChamber), stores beside it; the gate x 11..13,
 *   y 18..20, its passage down x = 12.
 * - Mountainside: switchbacks from the gate, along y 23..24, down x 27..28,
 *   back along y 27..28 and down x 6..7 to the town; the shepherd's fold
 *   at x 25..28, y 3..6.
 * - The town: houses either side of the street (y 36..37), the lane from
 *   the south where you arrive (x 14..15).
 * - The stream x 33..34, bridged on the street's rows; the east bank with
 *   the Mashhad road (x 39..40), the khan and its camels, and the Tabríz road
 *   out at (45, 36).
 */

const W = 46;
const H = 46;

/** The rampart ring, and its gate in the south wall. */
const FORT = { x0: 1, y0: 1, x1: 22, y1: 19 } as const;
const GATE = { x: 11, y: 18, passage: 12 } as const;
const CASTLE = { x: 3, y: 2, w: 9, h: 7 } as const;
/**
 * The amanuensis's lodging against the castle's east wall: the mountain
 * house's stone variant (`variant: 0`), whose door is centred on the third
 * cell of its front.
 */
const LODGING = { x: 12, y: 3, w: 5, h: 4, variant: 0 } as const;
export const AMANUENSIS_DOOR = { x: LODGING.x + 2, y: LODGING.y + LODGING.h - 1 } as const;
const STREET = 36;
const STREAM = 33;

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

/** Inside the walls: the guards' brazier, the stores and a lamp by the lodging, snow in the corners. */
const COURTYARD: DecorSpec[] = [
  ...blocking('ch6-brazier', [[4, 13]]),
  ...blocking('crates', [[18, 3], [18, 4]]),
  ...blocking('lamp', [[17, 3]]),
  ...loose('rug', [[14, 8], [8, 12]]),
  ...loose('ch6-snow-drift', [[2, 10], [3, 16], [9, 15], [14, 11], [20, 10], [18, 15], [20, 5], [6, 17]]),
];

/** The mountainside: rocks and pines between the switchbacks, the shepherd's fold. */
const MOUNTAINSIDE: DecorSpec[] = [
  ...blocking('ch6-brazier', [[10, 22]]),
  ...blocking('ch6-rock', [
    [2, 21], [0, 24], [4, 25], [9, 25], [15, 25], [20, 26], [24, 25], [30, 24], [31, 28],
    [17, 21], [23, 21], [29, 20], [25, 15], [30, 12], [24, 9], [31, 3], [27, 0],
  ]),
  ...blocking('ch6-pine', [
    [0, 22], [3, 23], [6, 25], [12, 26], [18, 25], [22, 26], [26, 22], [20, 21], [31, 25], [30, 30],
    [24, 18], [27, 16], [31, 17], [24, 12], [28, 10], [31, 8], [24, 2], [29, 1], [32, 14], [30, 21],
  ]),
  ...blocking('ch6-snow-shrub', [[8, 21], [16, 22], [11, 25], [26, 26], [29, 23], [2, 26], [26, 13], [29, 7]]),
  ...loose('ch6-snow-drift', [
    [5, 21], [14, 21], [21, 22], [7, 26], [17, 26], [24, 23], [29, 26], [26, 19], [29, 14], [25, 7], [31, 10],
  ]),
  ...wallRun('ch6-fold-wall', 25, 3, 25, 6),
  ...wallRun('ch6-fold-wall', 26, 6, 28, 6),
];

/** The town: a well, the market, the courier's bales, people watching the walls. */
const TOWN: DecorSpec[] = [
  ...blocking('well', [[9, 35]]),
  ...blocking('crates', [[24, 38], [11, 39]]),
  ...blocking('ch9-cloth-bundle', [[25, 39]]),
  ...blocking('crowd', [[2, 28], [3, 27]]),
  ...blocking('lamp', [[5, 35], [16, 35], [28, 35], [13, 39]]),
  ...blocking('ch6-pine', [[0, 38], [16, 44], [23, 44], [31, 39], [5, 45], [31, 33]]),
  ...blocking('ch6-snow-shrub', [[14, 34], [22, 34], [30, 44], [6, 39], [22, 42]]),
  ...loose('ch6-snow-drift', [[3, 34], [19, 38], [27, 34], [8, 44], [22, 43], [29, 40], [15, 32]]),
  ...loose('rug', [[20, 38]]),
];

/** East bank: the Mashhad road, the milestone, the fields under snow. */
const EAST_BANK: DecorSpec[] = [
  ...loose('ch6-footbridge', [[STREAM, STREET], [STREAM + 1, STREET], [STREAM, STREET + 1], [STREAM + 1, STREET + 1]]),
  ...blocking('ch2-milestone', [[41, 33]]),
  ...blocking('ch6-pine', [[36, 1], [43, 3], [36, 8], [44, 10], [36, 15], [43, 17], [37, 22], [44, 25], [36, 28], [44, 31]]),
  ...blocking('ch6-rock', [[42, 6], [37, 12], [42, 14], [43, 21], [37, 25], [42, 28]]),
  ...blocking('ch2-camel', [[42, 40], [43, 42]]),
  ...blocking('crates', [[38, 44]]),
  ...loose('ch6-snow-drift', [[38, 4], [42, 9], [38, 18], [42, 23], [36, 33], [44, 39], [35, 44]]),
];

export const ch6MakuMap: MapDefinition = {
  key: 'Ch6Maku',
  title: 'Mákú, the Open Mountain',
  width: W,
  height: H,
  spawn: { x: 14, y: 44 },
  build: ({ paintRect, setTile, block }) => {
    // Bare mountain everywhere; the town is trodden earth, the courtyard flagstone.
    paintRect(0, 0, W, H, 'stone');
    paintRect(0, 29, STREAM, H - 29, 'sand');
    paintRect(STREAM + 2, 38, W - STREAM - 2, H - 38, 'sand');
    paintRect(13, 3, 6, 6, 'sand');        // round the amanuensis's lodging
    paintRect(25, 3, 3, 3, 'sand');        // the shepherd's fold
    // Inside the walls: from the gate to the castle door, and to the amanuensis's door.
    paintRect(GATE.passage, 9, 1, GATE.y + 3 - 9, 'path');
    paintRect(7, 9, 6, 2, 'path');
    paintRect(GATE.passage, 7, 3, 2, 'path');
    // Switchbacks down the mountain, two cells wide.
    paintRect(GATE.passage, 21, 2, 3, 'path');
    paintRect(GATE.passage, 23, 17, 2, 'path');
    paintRect(27, 25, 2, 2, 'path');
    paintRect(6, 27, 23, 2, 'path');
    paintRect(6, 29, 2, STREET - 29, 'path');
    // The street through the town and over the bridge, and out on the Tabríz road.
    paintRect(0, STREET, W, 2, 'path');
    // The lane from the south where you arrive.
    paintRect(14, STREET + 2, 2, H - STREET - 2, 'path');
    // The Mashhad road comes down the east bank from the north.
    paintRect(39, 0, 2, STREET, 'path');
    // The cold stream running down from the heights.
    for (let y = 0; y < H; y += 1) {
      for (const x of [STREAM, STREAM + 1]) {
        setTile(x, y, 'water');
        if (y !== STREET && y !== STREET + 1) block(x, y);
      }
    }
    // The gate's towers either side of its passage.
    for (let y = GATE.y; y < GATE.y + 3; y += 1) {
      block(GATE.x, y);
      block(GATE.x + 2, y);
    }
  },
  buildings: [
    { gridX: CASTLE.x, gridY: CASTLE.y, w: CASTLE.w, h: CASTLE.h, texture: 'ch6-maku-fortress' },
    { gridX: LODGING.x, gridY: LODGING.y, w: LODGING.w, h: LODGING.h, variant: LODGING.variant, texture: 'ch6-mountain-house' },
    { gridX: GATE.x, gridY: GATE.y, w: 3, h: 3, texture: 'ch6-fortress-gate', blocks: false },
    // The town of Mákú.
    { gridX: 0, gridY: 30, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 9, gridY: 30, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 17, gridY: 29, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 23, gridY: 30, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 1, gridY: 40, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 8, gridY: 40, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 16, gridY: 40, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 25, gridY: 41, w: 5, h: 4, texture: 'ch6-mountain-house' },
    { gridX: 22, gridY: 39, w: 2, h: 2, texture: 'market-stall' },
    // A khan on the east bank, where the Tabríz road begins.
    { gridX: 37, gridY: 39, w: 5, h: 4, texture: 'ch6-mountain-house' },
  ],
  decor: [...ramparts(), ...COURTYARD, ...MOUNTAINSIDE, ...TOWN, ...EAST_BANK],
  npcs: [
    // Inside the walls.
    { gridX: 10, gridY: 9, texture: 'ch6-barred-marker',
      prompt: 'Stand beneath the barred window  [E]',
      dialogue: 'ch6-maku-window' },
    { gridX: 3, gridY: 12, texture: 'ch6-fortress-guard',
      prompt: 'Speak with the Fortress Guard  [E]',
      dialogue: 'ch6-fortress-guard' },
    // At the gate.
    { gridX: 14, gridY: 22, texture: 'ch6-warden',
      prompt: 'Speak with ʿAlí Khán  [E]',
      dialogue: 'ch6-warden-softens' },
    // The town.
    { gridX: 4, gridY: 29, texture: 'ch6-maku-woman',
      prompt: 'Speak with the Woman of Mákú  [E]',
      dialogue: 'ch6-maku-woman' },
    { gridX: 23, gridY: 37, texture: 'ch6-courier',
      prompt: 'Speak with the Mountain Courier  [E]',
      dialogue: 'ch6-courier-transfer',
      gate: { when: f => !!f.ch6ReadBayan && !!f.ch6MetMullaHusayn, lockedDialogue: 'ch6-courier-letters' } },
    // East bank, where the Mashhad road comes in.
    { gridX: 38, gridY: 32, texture: 'ch6-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch6-mulla-husayn-visit' },
  ],
  doors: [
    // Siyyid Ḥusayn's room, where the pages are written and kept.
    { gridX: AMANUENSIS_DOOR.x, gridY: AMANUENSIS_DOOR.y, prompt: 'Go into the amanuensis\'s room  [E]',
      targetScene: 'Ch6MakuChamber', targetSpawnX: 3, targetSpawnY: 4 },
  ],
  exits: [
    { fromX: W - 1, fromY: STREET, dx: 1, dy: 0,
      targetScene: 'Ch6Chihriq', targetSpawnX: 1, targetSpawnY: 27,
      label: '→ The road to Chihríq',
      requires: f => !!f.ch6TransferOrdered,
      lockedLabel: 'The Tabríz road: no reason yet to leave Mákú' },
  ],
  ambience: {
    wash: { color: 0x6a7a96, alpha: 0.42 },
    lights: [
      { gridX: 4, gridY: 13, radius: 140, color: 0xff9a4a, intensity: 0.6 },
      { gridX: 10, gridY: 22, radius: 140, color: 0xff9a4a, intensity: 0.6 },
      { gridX: 10, gridY: 10, radius: 90, color: 0xf3d79a, intensity: 0.3 },
    ],
    particles: 'snow', music: 'mountain',
    vignette: 0.6,
  },
};
