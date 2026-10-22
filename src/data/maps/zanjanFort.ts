import type { FlagState } from '../../dialogue/types';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';
import { ZJ_GATE_DOOR } from './zanjanQuarter';
import { SUMMER_NEEDED, summerRounds, WINTER_NEEDED, winterRounds, zjEnd, zjSummer, zjTruce, zjWinter } from './zanjanPhases';

/**
 * Inside the fort of ʿAlí-Mardán Khán, Zanján, 1850, at true scale: a court
 * some 40 by 35 m within walls of rammed earth 6.5 m high, crowded with the
 * families who came in with Ḥujjat. His house stands in the north-west
 * corner behind its own gateway; an ablution pool before it; the women's
 * ovens, hand-mills and water-skins along the east side; lean-tos for the
 * wounded along the west wall; a ladder up to the wall walk, where Muḥsin
 * gives the call to prayer and the night watch cries the names of God.
 *
 * Layout (x runs east, y runs south): walls along y = 0 and x = 0, and the
 * cut-away south and east walls on y = 25 and x = 29; the gateway out at
 * x 14..15 on the south wall. Ḥujjat's house x 3..8, y 3..7, its door at
 * (7, 7); the pool x 12..14, y 10..12; the ladder at (20, 1); the women's
 * corner x 22..27, y 4..12.
 */

const W = 30;
const H = 26;
const GATE_X = 14;
export const ZJ_HOUSE_DOOR = { x: 7, y: 7 } as const;

function walls(): DecorSpec[] {
  const w = 'town-wall';
  return [
    ...wallRun(w, 0, 0, W - 1, 0),
    ...wallRun(w, 0, 1, 0, H - 1),
    ...wallRun(w, 1, H - 1, W - 1, H - 1, { gaps: [[GATE_X, H - 1], [GATE_X + 1, H - 1]] }),
    ...wallRun(w, W - 1, 1, W - 1, H - 2),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const notEnd = (f: FlagState) => !zjEnd(f);

const props: DecorSpec[] = [
  // The wall walk's ladder, and the lamps of the court.
  ...block('zanjan-ladder', [[20, 1]]),
  ...block('lamp', [[10, 8], [17, 9], [GATE_X - 1, H - 2], [GATE_X + 2, H - 2], [21, 14]]),
  // The women's corner: ovens, the hand-mill, water-skins, the shot they gather.
  ...block('zanjan-tanur', [[23, 4], [26, 4]]),
  ...block('zanjan-hand-mill', [[23, 8]], notEnd),
  ...block('zanjan-water-skins', [[27, 8], [27, 11]]),
  ...block('zanjan-shot-basket', [[22, 12], [18, 18]]),
  ...block('ch9-washing-line', [[25, 13]]),
  ...loose('rug', [[24, 6], [24, 10]]),
  // The wounded under lean-tos by the west wall.
  ...block('ch8-bedroll', [[2, 14], [2, 17]]),
  ...block('ch8-bedroll-dark', [[2, 15]]),
  ...block('ch8-wounded', [[4, 16]], notEnd),
  // Families camped across the court.
  ...block('ch2-bundles', [[9, 19], [19, 22], [26, 19]]),
  ...block('ch9-water-jar', [[10, 19], [27, 18]]),
  ...loose('rug', [[8, 21], [21, 20], [25, 20]]),
  ...block('ch6-brazier', [[22, 17]]),
  ...block('well', [[6, 21]]),
  ...block('plane-tree', [[18, 4]]),
  // The end: the house struck, its gateway half fallen.
  ...block('zanjan-rubble', [[9, 6], [9, 4], [5, 8]], zjEnd),
];

const LEAN_TOS = [{ gridX: 1, gridY: 11, w: 2, h: 2, texture: 'ch8-lean-to' }];

export const zanjanFortMap: MapDefinition = {
  key: 'ZanjanFort',
  title: 'The Fort of ʿAlí-Mardán Khán',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: H - 3 },
  build: ({ paintRect, setTile, block: blockCell }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(1, 1, 11, 8, 'stone');
    paintRect(GATE_X, 13, 2, H - 13, 'path');
    // The ablution pool: open water, its rim of stone.
    paintRect(11, 9, 5, 5, 'stone');
    for (let y = 10; y <= 12; y++) {
      for (let x = 12; x <= 14; x++) { setTile(x, y, 'water'); blockCell(x, y); }
    }
  },
  buildings: [
    { gridX: 3, gridY: 3, w: 6, h: 5, texture: 'zanjan-hujjat-house' },
    ...LEAN_TOS,
  ],
  decor: [...walls(), ...props],
  npcs: [
    // Summer: Ḥujjat by his gateway, Siyyid Ḥasan beside him.
    { gridX: 10, gridY: 10, texture: 'zanjan-hujjat',
      prompt: 'Speak with Ḥujjat  [E]',
      dialogue: 'zj-hujjat-summer',
      gate: { when: f => !!f.zjNewsTold, lockedDialogue: 'zj-hujjat-news' },
      present: f => zjSummer(f) && (!f.zjNewsTold || summerRounds(f) < SUMMER_NEEDED) },
    { gridX: 10, gridY: 10, texture: 'zanjan-hujjat',
      prompt: 'Speak with Ḥujjat  [E]',
      dialogue: 'zj-hujjat-quran',
      present: f => zjSummer(f) && !!f.zjNewsTold && summerRounds(f) >= SUMMER_NEEDED },
    { gridX: 8, gridY: 11, texture: 'zanjan-siyyid-hasan',
      prompt: 'Speak with Siyyid Ḥasan  [E]',
      dialogue: 'zj-hasan-after',
      gate: { when: f => !!f.zjNewsTold, lockedDialogue: 'zj-hasan-fort' },
      present: zjSummer },

    // Muḥsin at the foot of the ladder; in winter, his prayer rug.
    { gridX: 20, gridY: 3, texture: 'zanjan-muhsin',
      prompt: 'Speak with Muḥsin the Muezzin  [E]',
      dialogue: 'zj-muhsin',
      present: f => zjSummer(f) || zjTruce(f) },
    { gridX: 20, gridY: 3, texture: 'rug',
      prompt: 'Look at the prayer rug below the wall  [E]',
      dialogue: 'zj-muhsin-place',
      present: f => zjWinter(f) || zjEnd(f) },

    // The woman at the ovens: Umm-i-Ashraf, as she will be called.
    { gridX: 25, gridY: 7, texture: 'zanjan-umm-ashraf',
      prompt: 'Speak with the Woman at the Ovens  [E]',
      dialogue: 'zj-woman-ovens',
      present: f => zjSummer(f) || zjTruce(f) },
    { gridX: 25, gridY: 7, texture: 'zanjan-umm-ashraf',
      prompt: 'Speak with Umm-i-Ashraf  [E]',
      dialogue: 'zj-umm-ashraf',
      present: zjWinter },

    // Mihr-ʿAlí, a boy of the quarter.
    { gridX: 20, gridY: 12, texture: 'zanjan-mihr-ali',
      prompt: 'Speak with Mihr-ʿAlí  [E]',
      dialogue: 'zj-mihr-ali',
      present: zjSummer },
    { gridX: 13, gridY: 21, texture: 'zanjan-mihr-ali',
      prompt: 'Speak with Mihr-ʿAlí  [E]',
      dialogue: 'zj-mihr-ali-return',
      present: f => zjTruce(f) && !!f.zjMetSoldier },
    { gridX: 20, gridY: 12, texture: 'zanjan-mihr-ali',
      prompt: 'Speak with Mihr-ʿAlí  [E]',
      dialogue: 'zj-mihr-ali-winter',
      present: zjWinter },

    // The truce: Ḥujjat waits inside the gate for the children.
    { gridX: 17, gridY: 21, texture: 'zanjan-hujjat',
      prompt: 'Speak with Ḥujjat  [E]',
      dialogue: 'zj-hujjat-waiting',
      present: zjTruce },

    // Winter: Ḥujjat at the pool.
    { gridX: 16, gridY: 11, texture: 'zanjan-hujjat',
      prompt: 'Speak with Ḥujjat  [E]',
      dialogue: 'zj-hujjat-ablution',
      gate: { when: f => winterRounds(f) >= WINTER_NEEDED, lockedDialogue: 'zj-hujjat-winter' },
      present: zjWinter },
  ],
  doors: [
    { gridX: ZJ_HOUSE_DOOR.x, gridY: ZJ_HOUSE_DOOR.y, prompt: 'Enter Ḥujjat\'s house  [E]',
      targetScene: 'ZanjanHouse', targetSpawnX: 5, targetSpawnY: 6 },
  ],
  exits: [GATE_X, GATE_X + 1].map(fromX => ({
    fromX, fromY: H - 1, dx: 0, dy: 1,
    targetScene: 'ZanjanQuarter', targetSpawnX: ZJ_GATE_DOOR.x, targetSpawnY: ZJ_GATE_DOOR.y + 1,
    label: '↓ Out to the quarter',
  })),
  ambience: f => fortAmbience(f),
};

function fortAmbience(f: FlagState): MapAmbience {
  const ovens = [
    { gridX: 23, gridY: 4, radius: 120, color: 0xff9a40, intensity: 0.5 },
    { gridX: 26, gridY: 4, radius: 120, color: 0xff9a40, intensity: 0.5 },
    { gridX: 22, gridY: 17, radius: 100, color: 0xff9a40, intensity: 0.4 },
  ];
  if (zjEnd(f)) {
    return {
      wash: { color: 0x34303a, alpha: 0.62 },
      lights: [{ gridX: 8, gridY: 6, radius: 180, color: 0xff6a20, intensity: 0.35 }, ovens[2]!],
      particles: 'embers', music: 'sorrow', sound: ['wind'], vignette: 0.75,
    };
  }
  if (zjWinter(f)) {
    return { wash: { color: 0x4a5470, alpha: 0.52 }, lights: ovens, particles: 'snow', music: 'siege', sound: ['wind'], vignette: 0.68 };
  }
  if (zjTruce(f)) {
    return { wash: { color: 0x8a8070, alpha: 0.38 }, lights: ovens, particles: 'dust', music: 'sorrow', sound: ['breeze'], vignette: 0.55 };
  }
  return { wash: { color: 0x2a3560, alpha: 0.52 }, lights: ovens, particles: 'motes', music: 'night', sound: ['crickets'], vignette: 0.62 };
}
