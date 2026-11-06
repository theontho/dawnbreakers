import type { FlagState } from '../../dialogue/types';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Ámul, the first days of Muḥarram 1265 (December 1848), at true scale: an
 * interlude in chapter 8, seen through the eyes of a youth who trims the
 * masjid's lamps (`ch8-amul-opening`). Bahá'u'lláh, riding to join the
 * defenders of Ṭabarsí, was taken by night at a lonely house on the road
 * and brought here at daybreak; He is never seen. The map passes through
 * three phases by flag: the morning in the masjid (until `ch8AmulRods`),
 * the night the wall is opened (until `ch8AmulWallOpened`), and the days
 * after, which end at the acting governor's gate and return to the fort.
 *
 * Districts (x runs east, y runs south):
 * - The masjid x 3..10, y 1..7, its door at (7, 7), where the mujtahid
 *   leads the prayer; its court x 2..14, y 8..15, the ablution pool at
 *   (9..11, 10..12), walled on the west, south and east, the gate an open
 *   doorway at (8, 16).
 * - The room off the court where the travellers were held, x 12..16,
 *   y 2..5; its back wall faces the alley x 17..18 that runs down to the
 *   street. The wall is opened at (16, 4).
 * - The street y 17..19 along the south of the map.
 * - The acting governor's house x 23..30, y 1..7, its gateway at (28, 7),
 *   a forecourt before it and a lane down to the street at x 27..28; a
 *   neighbour's house x 20..25, y 10..14.
 */

const W = 32;
const H = 21;
const HALL_DOOR = { x: 7, y: 7 } as const;
const COURT_GATE = { x: 8, y: 16 } as const;
const RESIDENCE_GATE = { x: 28, y: 7 } as const;
/** In the alley, at the back wall of the room where they were held. */
const BACK_WALL = { x: 17, y: 4 } as const;

/** The morning: the town crowds into the masjid. */
export const amulMorning = (f: FlagState): boolean => !f.ch8AmulRods;
/** The night after the rods: the travellers shut in the room off the court. */
export const amulNight = (f: FlagState): boolean => !!f.ch8AmulRods && !f.ch8AmulWallOpened;
/** The days after the wall was opened. */
export const amulAfter = (f: FlagState): boolean => !!f.ch8AmulWallOpened;

const buildings: BuildingSpec[] = [
  { gridX: 3, gridY: 1, w: 8, h: 7, texture: 'mosque-local' },
  { gridX: 12, gridY: 2, w: 5, h: 4, texture: 'town-house-small', variant: 0 },
  { gridX: 23, gridY: 1, w: 8, h: 7, texture: 'town-house-large' },
  { gridX: 9, gridY: 10, w: 3, h: 3, texture: 'fountain-pool' },
  // A neighbour's house across the alley, its back to the acting governor's garden.
  { gridX: 20, gridY: 10, w: 6, h: 5, texture: 'town-house', variant: 0 },
];

function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    // The masjid's court, from the room's corner round to the masjid's.
    ...wallRun(w, 1, 8, 1, 16),
    ...wallRun(w, 2, 16, 15, 16, { doors: [{ at: [COURT_GATE.x, COURT_GATE.y], open: true }] }),
    ...wallRun(w, 15, 6, 15, 15),
    // The acting governor's garden wall, turning back from his house's front corner.
    ...wallRun(w, 20, 7, 22, 7),
    ...wallRun(w, 20, 0, 20, 6),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // The court: lamps either side of the hall door, shoes and bundles by the wall.
  ...block('lamp', [[4, 8], [10, 8]]),
  ...block('ch2-bundles', [[2, 9]]),
  ...block('ch9-water-jar', [[14, 8], [13, 14]]),
  // The town come to see: the court full in the morning, the street at night.
  ...block('crowd', [[3, 12], [12, 9], [6, 14], [12, 13]], amulMorning),
  ...loose('crowd-shadow', [[4, 13], [11, 14]], amulMorning),
  ...block('crowd', [[15, 18], [3, 19]], amulMorning),
  ...block('crowd', [[6, 18]], amulNight),
  // The street: snow banked against the walls, a well, a lamp at the alley mouth.
  ...loose('ch10-snow-drift', [[0, 18], [21, 19], [31, 17], [19, 9], [26, 15]]),
  ...block('well', [[24, 16]]),
  ...block('lamp', [[19, 16], [26, 9]]),
  ...block('crates', [[30, 10]]),
  ...block('cypress', [[21, 2], [22, 4]]),
];

export const ch8AmulMap: MapDefinition = {
  key: 'Ch8Amul',
  title: 'Ámul: the Masjid and the Street',
  width: W,
  height: H,
  spawn: { x: 8, y: 13 },
  player: 'ch8-amul-witness',
  opening: 'ch8-amul-opening',
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(2, 8, 13, 8, 'stone');
    paintRect(0, 17, W, 3, 'path');
    paintRect(17, 0, 2, 17, 'path');
    paintRect(COURT_GATE.x, COURT_GATE.y, 1, 1, 'stone');
    paintRect(23, 8, 8, 2, 'stone');
    paintRect(27, 10, 2, 7, 'path');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    // The prayer hall's door: shut to the youth until there is work and news.
    { gridX: HALL_DOOR.x, gridY: HALL_DOOR.y,
      prompt: 'Stand at the door of the prayer hall  [E]',
      dialogue: 'ch8-amul-hall',
      gate: { when: f => !!f.ch8AmulCarpets && !!f.ch8AmulGuardHeard, lockedDialogue: 'ch8-amul-hall-shut' },
      present: amulMorning },
    { gridX: 5, gridY: 11, texture: 'ch8-amul-caretaker',
      prompt: 'Speak with your uncle, the caretaker  [E]',
      dialogue: 'ch8-amul-caretaker-morning',
      present: amulMorning },
    { gridX: 10, gridY: 18, texture: 'ch8-amul-guard',
      prompt: 'Speak with the Chief of the Guards  [E]',
      dialogue: 'ch8-amul-guard',
      present: amulMorning },
    { gridX: 2, gridY: 18, texture: 'ch8-amul-townsman',
      prompt: 'Speak with the Cloth-Seller  [E]',
      dialogue: 'ch8-amul-townsman',
      present: amulMorning },

    // The night.
    { gridX: 5, gridY: 11, texture: 'ch8-amul-caretaker',
      prompt: 'Speak with your uncle, the caretaker  [E]',
      dialogue: 'ch8-amul-caretaker-night',
      present: amulNight },
    { gridX: 12, gridY: 18, texture: 'ch8-amul-siyyid',
      prompt: 'Speak with the Siyyid at the gate  [E]',
      dialogue: 'ch8-amul-siyyid',
      present: amulNight },
    { gridX: BACK_WALL.x, gridY: BACK_WALL.y, texture: 'ch8-amul-attendant',
      prompt: 'Speak with the acting governor\'s man  [E]',
      dialogue: 'ch8-amul-wall',
      gate: { when: f => !!f.ch8AmulLamp, lockedDialogue: 'ch8-amul-attendant-wait' },
      present: amulNight },

    // The days after: the wall mended, the gate.
    { gridX: BACK_WALL.x, gridY: BACK_WALL.y, texture: 'ch8-amul-caretaker',
      prompt: 'Speak with your uncle at the mended wall  [E]',
      dialogue: 'ch8-amul-caretaker-after',
      present: amulAfter },
    { gridX: RESIDENCE_GATE.x, gridY: RESIDENCE_GATE.y,
      prompt: 'Stand at the acting governor\'s gate  [E]',
      dialogue: 'ch8-amul-close',
      gate: { when: amulAfter, lockedDialogue: 'ch8-amul-residence-shut' } },
  ],
  exits: [],
  ambience: f => amulAmbience(f),
};

/** A grey snowy morning; a night of snow with one lantern in the alley; a pale clear day. */
function amulAmbience(f: FlagState): MapAmbience {
  if (amulNight(f)) {
    return {
      wash: { color: 0x2a3560, alpha: 0.58 },
      lights: [
        { gridX: BACK_WALL.x, gridY: BACK_WALL.y + 1, radius: 110, color: 0xffb860, intensity: 0.4 },
        { gridX: RESIDENCE_GATE.x, gridY: RESIDENCE_GATE.y + 1, radius: 90, color: 0xffc070, intensity: 0.3 },
      ],
      particles: 'snow', music: 'night', sound: ['wind'], vignette: 0.68,
    };
  }
  if (amulAfter(f)) {
    return { wash: { color: 0xc8c0d0, alpha: 0.22 }, particles: 'motes', music: 'hope', sound: ['breeze'], vignette: 0.5 };
  }
  return {
    wash: { color: 0xa8b0c0, alpha: 0.26 },
    lights: [{ gridX: HALL_DOOR.x, gridY: HALL_DOOR.y + 1, radius: 110, color: 0xffd090, intensity: 0.3 }],
    particles: 'snow', music: 'sorrow', sound: ['wind'], vignette: 0.6,
  };
}
