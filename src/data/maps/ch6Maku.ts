import type { DecorSpec, MapDefinition } from './types';

/**
 * Mákú, winter 1847 to spring 1848: the "Open Mountain".
 *
 * The fortress sits high in the north-west corner of the map behind snowy
 * ramparts. A switchback track drops from its gate to the little town at the
 * mountain's foot, where the people of Mákú gather each morning to look up
 * at the walls. A cold stream runs down the east side; across its bridge the
 * Tabríz road leaves for Chihríq, and the Mashhad road comes in from the
 * north, the road Mullá Ḥusayn walked on foot.
 *
 * The Báb is never on the map. He is reached through the barred window of
 * the keep and the copyist's desk, and through what others say of Him.
 */

const W = 28;
const H = 28;

/** Fortress enclosure: rampart ring from (2,1) to (13,10), gate gap at (8,10). */
const FORT = { x0: 2, y0: 1, x1: 13, y1: 10, gateX: 8 };

function ramparts(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = FORT.x0; x <= FORT.x1; x += 1) {
    out.push({ gridX: x, gridY: FORT.y0, texture: 'ch6-rampart', blocks: true });
    if (x !== FORT.gateX) out.push({ gridX: x, gridY: FORT.y1, texture: 'ch6-rampart', blocks: true });
  }
  for (let y = FORT.y0 + 1; y < FORT.y1; y += 1) {
    out.push({ gridX: FORT.x0, gridY: y, texture: 'ch6-rampart', blocks: true });
    out.push({ gridX: FORT.x1, gridY: y, texture: 'ch6-rampart', blocks: true });
  }
  return out;
}

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

export const ch6MakuMap: MapDefinition = {
  key: 'Ch6Maku',
  title: 'Mákú, the Open Mountain',
  width: W,
  height: H,
  spawn: { x: 8, y: 26 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Bare mountain everywhere; the town and the courtyard are trodden earth and flagstone.
    paintRect(0, 0, W, H, 'stone');
    paintRect(FORT.x0 + 1, FORT.y0 + 1, FORT.x1 - FORT.x0 - 1, FORT.y1 - FORT.y0 - 1, 'stone');
    paintRect(9, 2, 4, 4, 'sand');        // the copyist's corner of the courtyard
    paintRect(0, 18, 18, 10, 'sand');     // the town at the mountain's foot
    paintRect(21, 22, 7, 6, 'sand');      // the east bank fields under snow
    paintRect(16, 2, 3, 3, 'sand');       // a shepherd's fold above the stream

    // The cold stream running down from the heights.
    for (let y = 0; y < H; y += 1) {
      setTile(19, y, 'water');
      setTile(20, y, 'water');
      if (y !== 21) { block(19, y); block(20, y); }
    }

    // Inside the walls: gate to the keep, and to the copyist's corner.
    paintPath([[8, 10], [8, 9], [8, 8], [8, 7], [8, 6], [8, 5], [9, 5], [10, 5]]);
    // Switchbacks down the mountain.
    paintPath([[8, 11], [8, 12], [8, 13]]);
    paintPath([[9, 13], [10, 13], [11, 13], [12, 13], [13, 13], [14, 13], [15, 13]]);
    paintPath([[15, 14], [15, 15], [15, 16], [15, 17]]);
    paintPath([[14, 17], [13, 17], [12, 17], [11, 17], [10, 17], [9, 17], [8, 17], [7, 17], [6, 17]]);
    paintPath([[6, 18], [6, 19], [6, 20], [6, 21]]);
    // Through the town, over the bridge, and out on the Tabríz road.
    paintPath([[4, 21], [5, 21], [7, 21], [8, 21], [9, 21], [10, 21], [11, 21], [12, 21], [13, 21],
      [14, 21], [15, 21], [16, 21], [17, 21], [21, 21], [22, 21], [23, 21], [24, 21], [25, 21], [26, 21], [27, 21]]);
    // The lane from the south where you arrive.
    paintPath([[8, 27], [8, 26], [8, 25], [8, 24], [8, 23], [8, 22]]);
    // The Mashhad road comes down the east bank from the north.
    for (let y = 0; y <= 20; y += 1) setTile(24, y, 'path');
  },
  buildings: [
    { gridX: 4, gridY: 2, w: 3, h: 3, texture: 'ch6-maku-fortress' },
    // The town of Mákú.
    { gridX: 1, gridY: 19, w: 2, h: 2, texture: 'house' },
    { gridX: 1, gridY: 23, w: 2, h: 2, texture: 'house' },
    { gridX: 4, gridY: 25, w: 2, h: 2, texture: 'house' },
    { gridX: 11, gridY: 24, w: 2, h: 2, texture: 'house' },
    { gridX: 14, gridY: 18, w: 2, h: 2, texture: 'house' },
    { gridX: 13, gridY: 23, w: 1, h: 1, texture: 'stall' },
    // A caravanserai on the east bank, where the Tabríz road begins.
    { gridX: 24, gridY: 23, w: 3, h: 2, texture: 'ch2-caravanserai' },
  ],
  decor: [
    ...ramparts(),
    // The plank bridge over the stream (walkable).
    ...loose('ch6-footbridge', [[19, 21], [20, 21]]),
    // In the courtyard: the guards' brazier, the copyist's chests and lamp.
    ...blocking('ch6-brazier', [[4, 8]]),
    ...blocking('crates', [[12, 2]]),
    ...blocking('lamp', [[12, 4]]),
    ...loose('rug', [[10, 3], [10, 8]]),
    ...loose('ch6-snow-drift', [[3, 2], [3, 6], [11, 8], [7, 8], [12, 7]]),
    // Outside the gate: the warden's brazier.
    ...blocking('ch6-brazier', [[10, 11]]),

    // Mountainside: rocks and pines shaping the switchbacks.
    ...blocking('ch6-rock', [
      [0, 2], [1, 5], [0, 9], [1, 12], [3, 14], [0, 15], [10, 12], [12, 11], [14, 11],
      [16, 9], [17, 6], [15, 6], [17, 12], [11, 15], [13, 15], [9, 15], [17, 15], [16, 0], [14, 0],
    ]),
    ...blocking('ch6-pine', [
      [1, 0], [0, 7], [1, 10], [2, 12], [4, 12], [6, 13], [5, 15], [14, 2], [15, 4], [17, 1],
      [16, 11], [12, 15], [10, 15], [16, 14], [18, 16],
    ]),
    ...blocking('ch6-snow-shrub', [[6, 11], [11, 11], [3, 13], [14, 15], [8, 15], [17, 18], [18, 13]]),
    ...loose('ch6-snow-drift', [
      [0, 0], [2, 11], [5, 12], [13, 12], [16, 12], [7, 14], [12, 14], [14, 14], [16, 16],
      [10, 16], [3, 16], [18, 3], [16, 7], [18, 10], [0, 13], [15, 1],
    ]),
    // The shepherd's fold above the stream.
    ...blocking('ch8-palisade', [[16, 2], [16, 3], [16, 4]]),

    // The town: a well, the market, the courier's bales, people watching the walls.
    ...blocking('well', [[10, 20]]),
    ...blocking('crates', [[16, 22], [12, 22]]),
    ...blocking('ch9-cloth-bundle', [[16, 20]]),
    ...blocking('crowd', [[3, 17], [4, 16]]),
    ...blocking('lamp', [[7, 20], [13, 20]]),
    ...blocking('ch6-pine', [[0, 17], [0, 26], [3, 27], [15, 26], [17, 24], [10, 27]]),
    ...blocking('ch6-snow-shrub', [[3, 21], [9, 24], [14, 25], [6, 24]]),
    ...loose('ch6-snow-drift', [[0, 22], [3, 25], [7, 26], [13, 27], [16, 25], [10, 18], [12, 19]]),
    ...loose('rug', [[11, 22]]),

    // East bank: the Mashhad road, the milestone, the fields.
    ...blocking('ch2-milestone', [[25, 18]]),
    ...blocking('ch6-pine', [[22, 1], [26, 2], [22, 6], [27, 8], [22, 11], [26, 13], [22, 15], [27, 17], [21, 25], [27, 27]]),
    ...blocking('ch6-rock', [[26, 5], [21, 9], [25, 10], [27, 14], [21, 18]]),
    ...loose('ch6-snow-drift', [[23, 3], [25, 7], [23, 12], [25, 15], [22, 23], [23, 26], [26, 26], [22, 19]]),
  ],
  npcs: [
    // Inside the walls.
    { gridX: 7, gridY: 3, texture: 'ch6-barred-marker',
      prompt: 'Stand beneath the barred window  [E]',
      dialogue: 'ch6-maku-window' },
    { gridX: 11, gridY: 3, texture: 'writing-desk',
      prompt: 'Read the pages on the copyist\'s desk  [E]',
      dialogue: 'ch6-bayan',
      gate: { when: f => !!f.ch6WardenSoftened && !!f.ch6MetAmanuensis, lockedDialogue: 'ch6-desk-closed' } },
    { gridX: 11, gridY: 5, texture: 'ch6-amanuensis',
      prompt: 'Speak with Siyyid Ḥusayn, the Amanuensis  [E]',
      dialogue: 'ch6-amanuensis' },
    { gridX: 5, gridY: 8, texture: 'ch6-fortress-guard',
      prompt: 'Speak with the Fortress Guard  [E]',
      dialogue: 'ch6-fortress-guard' },
    // At the gate.
    { gridX: 9, gridY: 11, texture: 'ch6-warden',
      prompt: 'Speak with ʿAlí Khán  [E]',
      dialogue: 'ch6-warden-softens' },
    // The town.
    { gridX: 5, gridY: 18, texture: 'ch6-maku-woman',
      prompt: 'Speak with the Woman of Mákú  [E]',
      dialogue: 'ch6-maku-woman' },
    { gridX: 15, gridY: 22, texture: 'ch6-courier',
      prompt: 'Speak with the Mountain Courier  [E]',
      dialogue: 'ch6-courier-transfer',
      gate: { when: f => !!f.ch6ReadBayan && !!f.ch6MetMullaHusayn, lockedDialogue: 'ch6-courier-letters' } },
    // East bank, where the Mashhad road comes in.
    { gridX: 23, gridY: 19, texture: 'ch6-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch6-mulla-husayn-visit' },
  ],
  exits: [
    { fromX: 27, fromY: 21, dx: 1, dy: 0,
      targetScene: 'Ch6Chihriq', targetSpawnX: 1, targetSpawnY: 15,
      label: '→ The road to Chihríq',
      requires: f => !!f.ch6TransferOrdered,
      lockedLabel: 'The Tabríz road: no reason yet to leave Mákú' },
  ],
  ambience: {
    wash: { color: 0x6a7a96, alpha: 0.42 },
    lights: [
      { gridX: 4, gridY: 8, radius: 90, color: 0xff9a4a, intensity: 0.6 },
      { gridX: 10, gridY: 11, radius: 90, color: 0xff9a4a, intensity: 0.6 },
    ],
    particles: 'snow', music: 'mountain',
    vignette: 0.6,
  },
};
