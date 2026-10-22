import { chihriqWitnesses } from '../dialogues_ch/chapter06_chihriq';
import type { DecorSpec, MapDefinition } from './types';

/**
 * Chihríq, spring and summer 1848: the "Grievous Mountain".
 *
 * Harsher than Mákú. The fortress clings to a crag in the north-east, its
 * gate on the west wall. A steep track climbs to it from the Kurdish hamlet
 * below, where a cold river is crossed at a ford. The road from Mákú comes
 * in from the west edge.
 *
 * The Báb is never on the map: the barred window of the keep is the
 * threshold where the chapter closes.
 */

const W = 26;
const H = 26;

/** Fortress enclosure: rampart ring from (13,1) to (24,10), gate gap on the west wall at (13,6). */
const FORT = { x0: 13, y0: 1, x1: 24, y1: 10, gateY: 6 };

function ramparts(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = FORT.x0; x <= FORT.x1; x += 1) {
    out.push({ gridX: x, gridY: FORT.y0, texture: 'ch6-rampart', blocks: true });
    out.push({ gridX: x, gridY: FORT.y1, texture: 'ch6-rampart', blocks: true });
  }
  for (let y = FORT.y0 + 1; y < FORT.y1; y += 1) {
    if (y !== FORT.gateY) out.push({ gridX: FORT.x0, gridY: y, texture: 'ch6-rampart', blocks: true });
    out.push({ gridX: FORT.x1, gridY: y, texture: 'ch6-rampart', blocks: true });
  }
  return out;
}

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

export const ch6ChihriqMap: MapDefinition = {
  key: 'Ch6Chihriq',
  title: 'Chihríq, the Grievous Mountain',
  width: W,
  height: H,
  spawn: { x: 1, y: 15 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, W, H, 'stone');
    paintRect(14, 2, 10, 8, 'stone');
    paintRect(15, 2, 3, 3, 'sand');      // the amanuensis's corner
    paintRect(7, 15, 15, 6, 'sand');     // the Kurdish hamlet
    paintRect(0, 23, W, 3, 'sand');      // fields beyond the river

    // The river below the hamlet, crossed at a ford of flat stones.
    for (let x = 0; x < W; x += 1) {
      for (const y of [21, 22]) {
        if (x === 12) { setTile(x, y, 'stone'); continue; }
        setTile(x, y, 'water');
        block(x, y);
      }
    }

    // The road from Mákú, along to the hamlet.
    paintPath([[0, 15], [1, 15], [2, 15], [3, 15], [4, 15], [5, 15], [6, 15], [7, 15], [8, 15],
      [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14, 15]]);
    // Down through the hamlet to the ford.
    paintPath([[12, 16], [12, 17], [12, 18], [12, 19], [12, 20], [12, 23], [12, 24], [12, 25]]);
    paintPath([[13, 18], [14, 18], [15, 18], [16, 18], [17, 18]]);
    // The climb: up from the road, along the ledge, to the west gate.
    paintPath([[5, 14], [5, 13], [5, 12], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11],
      [10, 10], [10, 9], [10, 8], [10, 7], [10, 6], [11, 6], [12, 6], [13, 6]]);
    // Inside the walls.
    paintPath([[14, 6], [15, 6], [16, 6], [17, 6], [18, 6], [16, 5]]);
  },
  buildings: [
    { gridX: 19, gridY: 3, w: 3, h: 3, texture: 'ch6-chihriq-fortress' },
    // The hamlet.
    { gridX: 8, gridY: 17, w: 2, h: 2, texture: 'house' },
    { gridX: 15, gridY: 16, w: 2, h: 2, texture: 'house' },
    { gridX: 18, gridY: 18, w: 2, h: 2, texture: 'house' },
    { gridX: 6, gridY: 19, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    ...ramparts(),
    // Courtyard: the amanuensis's desk and lamp, a brazier, a narrow cell row.
    ...blocking('writing-desk', [[16, 3]]),
    ...blocking('lamp', [[15, 2]]),
    ...blocking('crates', [[17, 2]]),
    ...blocking('ch6-brazier', [[22, 8]]),
    ...blocking('ch6-barred-marker', [[23, 2], [23, 3], [16, 9], [17, 9]]),
    ...blocking('ch10-chain-post', [[20, 8]]),
    ...loose('ch6-snow-drift', [[14, 2], [14, 9], [19, 8], [23, 6], [21, 7]]),
    ...loose('rug', [[15, 4]]),

    // The crag: rocks crowd the climb.
    ...blocking('ch6-rock', [
      [0, 1], [2, 0], [4, 2], [1, 4], [6, 1], [8, 3], [3, 6], [7, 5], [9, 1], [11, 2], [11, 4],
      [0, 8], [2, 9], [4, 9], [7, 8], [8, 9], [12, 8], [11, 12], [9, 13], [1, 12], [3, 11],
      [12, 11], [14, 12], [16, 11], [19, 12], [22, 11], [25, 12], [24, 14], [6, 13], [0, 13],
    ]),
    ...blocking('ch6-pine', [[2, 3], [6, 4], [12, 1], [1, 10], [8, 6], [7, 13], [18, 13], [23, 13], [25, 16]]),
    ...blocking('ch6-snow-shrub', [[9, 7], [3, 13], [13, 13], [21, 14], [11, 9]]),
    ...loose('ch6-snow-drift', [
      [0, 0], [5, 0], [10, 0], [3, 2], [9, 4], [5, 7], [1, 7], [6, 9], [12, 10], [8, 12],
      [15, 13], [20, 12], [17, 14], [2, 13], [24, 11],
    ]),

    // The hamlet: folds, a well, firewood, people of the mountain.
    ...blocking('ch8-palisade', [[20, 15], [21, 15], [22, 15], [23, 15], [23, 16], [23, 17]]),
    ...blocking('well', [[14, 19]]),
    ...blocking('crates', [[10, 16], [17, 20]]),
    ...blocking('ch9-cloth-bundle', [[13, 20]]),
    ...blocking('lamp', [[11, 18], [14, 16]]),
    ...blocking('ch6-snow-shrub', [[20, 19], [9, 20], [5, 17], [22, 18]]),
    ...loose('ch6-snow-drift', [[21, 17], [7, 16], [17, 15], [20, 20], [3, 17], [0, 19]]),
    ...loose('rug', [[4, 14]]),
    ...blocking('ch6-rock', [[2, 18], [0, 17], [4, 20], [24, 19], [25, 20]]),

    // Fields beyond the river.
    ...blocking('ch6-pine', [[2, 24], [7, 23], [17, 24], [22, 23], [25, 25]]),
    ...loose('ch6-snow-drift', [[4, 25], [9, 24], [15, 23], [20, 25], [24, 24]]),
    ...blocking('ch2-tamarisk', [[10, 25], [14, 24]]),
  ],
  npcs: [
    // The road and the climb.
    { gridX: 3, gridY: 14, texture: 'ch6-dervish',
      prompt: 'Speak with the Dervish from India  [E]',
      dialogue: 'ch6-dervish' },
    { gridX: 11, gridY: 10, texture: 'ch6-dayyan',
      prompt: 'Speak with Mírzá Asadu\'lláh of Khuy  [E]',
      dialogue: 'ch6-dayyan' },
    { gridX: 12, gridY: 5, texture: 'ch6-yahya-khan',
      prompt: 'Speak with Yaḥyá Khán  [E]',
      dialogue: 'ch6-yahya-khan' },
    // Within the walls.
    { gridX: 16, gridY: 4, texture: 'ch6-amanuensis',
      prompt: 'Speak with Siyyid Ḥusayn, the Amanuensis  [E]',
      dialogue: 'ch6-amanuensis-chihriq' },
    { gridX: 18, gridY: 5, texture: 'ch6-barred-marker',
      prompt: 'Keep watch beneath the barred window  [E]',
      dialogue: 'ch6-chihriq-window',
      gate: { when: f => !!f.ch6MetYahyaKhan && chihriqWitnesses(f) >= 2, lockedDialogue: 'ch6-chihriq-window-closed' } },
    // The hamlet.
    { gridX: 16, gridY: 19, texture: 'ch6-kurdish-shepherd',
      prompt: 'Speak with the Kurdish Shepherd  [E]',
      dialogue: 'ch6-kurdish-shepherd' },
    { gridX: 11, gridY: 19, texture: 'ch6-courier',
      prompt: 'Speak with the Mountain Courier  [E]',
      dialogue: 'ch6-courier-badasht' },
  ],
  exits: [
    { fromX: 0, fromY: 15, dx: -1, dy: 0,
      targetScene: 'Ch6Maku', targetSpawnX: 26, targetSpawnY: 21,
      label: '← Back toward Mákú' },
  ],
  ambience: {
    wash: { color: 0x4a5270, alpha: 0.55 },
    lights: [
      { gridX: 22, gridY: 8, radius: 90, color: 0xff9a4a, intensity: 0.6 },
      { gridX: 18, gridY: 5, radius: 70, color: 0xf3d79a, intensity: 0.35 },
    ],
    particles: 'snow', music: 'sorrow',
    vignette: 0.7,
  },
};

