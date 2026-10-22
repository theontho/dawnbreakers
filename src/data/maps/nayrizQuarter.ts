import type { FlagState } from '../../dialogue/types';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';
import { ARRIVAL_NEEDED, arrivalRounds, nzAfter, nzArrival, nzGathering } from './nayrizPhases';

/**
 * Nayríz, Fárs, May and June 1850, at true scale: the quarter of
 * Chinár-Súkhtih on the edge of the town, where Vaḥíd's wife's people
 * lived, and the old fort of Khájih on the rise above it.
 *
 * Districts (x runs east, y runs south):
 * - The road in from Iṣṭahbánát along the lane y 19..20 from the west edge,
 *   where the player arrives at (1, 19).
 * - The masjid of Chinár-Súkhtih x 8..15, y 5..11, its door at (12, 11);
 *   the little square before it x 7..24, y 12..18, with the burnt plane
 *   tree that names the quarter at (16, 16).
 * - Vaḥíd's house x 18..23, y 5..9, behind its street wall on y = 11, the
 *   door at (21, 11).
 * - Mullá ʿAbdu'l-Ḥusayn's house x 1..5, y 12..15; the boy's mother's house
 *   x 25..29, y 13..16.
 * - The lane south to the Bázár quarter, x 17..18, y 21..39, where the
 *   governor's house stands off the map.
 * - The fort of Khájih on the rise, its south wall on y = 11, x 30..44;
 *   round towers at its corners; its gate x 35..38, y 9..11, the doorway
 *   at (37, 11); the path up to it x 36..37, y 12..18.
 */

const W = 48;
const H = 40;
export const NZ_MOSQUE_DOOR = { x: 12, y: 11 } as const;
export const NZ_FORT_DOOR = { x: 37, y: 11 } as const;
const VAHID_DOOR = { x: 21, y: 11 } as const;

const buildings: BuildingSpec[] = [
  { gridX: 8, gridY: 5, w: 8, h: 7, texture: 'mosque-local' },
  { gridX: 18, gridY: 5, w: 6, h: 5, texture: 'town-house' },
  { gridX: 1, gridY: 12, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 25, gridY: 13, w: 5, h: 4, texture: 'town-house-small' },
  // South of the lane, toward the Bázár quarter.
  { gridX: 2, gridY: 23, w: 6, h: 5, texture: 'town-house' },
  { gridX: 10, gridY: 24, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 21, gridY: 23, w: 6, h: 5, texture: 'town-house' },
  { gridX: 29, gridY: 24, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 4, gridY: 31, w: 6, h: 5, texture: 'town-house' },
  { gridX: 22, gridY: 31, w: 8, h: 7, texture: 'town-house-large' },
  // The fort of Khájih: its gate, its corner towers, the old quarters inside.
  { gridX: 35, gridY: 9, w: 4, h: 3, texture: 'city-gate' },
  { gridX: 29, gridY: 10, w: 2, h: 2, texture: 'nayriz-round-tower' },
  { gridX: 43, gridY: 10, w: 2, h: 2, texture: 'nayriz-round-tower' },
  { gridX: 32, gridY: 2, w: 5, h: 4, texture: 'town-house-small' },
];

function walls(): DecorSpec[] {
  const fort = 'town-wall';
  const court = 'compound-wall';
  return [
    // The fort.
    ...wallRun(fort, 31, 11, 34, 11),
    ...wallRun(fort, 39, 11, 42, 11),
    ...wallRun(fort, 30, 0, 30, 9),
    ...wallRun(fort, 44, 0, 44, 9),
    // Vaḥíd's street wall, and the garden walls of the quarter.
    ...wallRun(court, 17, 11, 24, 11, { doors: [[VAHID_DOOR.x, VAHID_DOOR.y]] }),
    ...wallRun(court, 17, 5, 17, 10),
    ...wallRun(court, 24, 5, 24, 10),
    ...wallRun(court, 0, 22, 15, 22),
    ...wallRun(court, 20, 22, 34, 22),
    ...wallRun(court, 16, 23, 16, 38),
    ...wallRun(court, 19, 23, 19, 38),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // Gardens north-west of the masjid, and orchards on the slopes.
  ...block('plane-tree', [[3, 3], [26, 3]]),
  ...block('cypress', [[6, 2], [1, 8], [27, 9]]),
  ...block('orange-tree', [[2, 6], [5, 9], [36, 27], [42, 24], [45, 30]]),
  ...block('plane-tree', [[40, 33], [12, 37]]),
  ...block('cypress', [[33, 34], [46, 20], [1, 37]]),
  // The rise below the fort: stones and scrub.
  ...block('ch2-rock', [[33, 15], [41, 14], [45, 16], [40, 18]]),
  ...block('ch2-tamarisk', [[31, 17], [43, 13]]),
  // The square: a well, the water-jars, a bench of bundles, lamps.
  ...block('well', [[20, 14]]),
  ...block('ch9-water-jar', [[24, 17], [6, 17]]),
  ...block('lamp', [[11, 12], [14, 12], [22, 12], [7, 18]]),
  ...loose('rug', [[3, 17]]),
  // The arrival: the quarter pressing toward the masjid door.
  ...block('crowd', [[9, 14], [15, 13], [13, 15]], nzArrival),
  ...loose('crowd-shadow', [[10, 16]], nzArrival),
  // The lane toward the Bázár quarter, and lamps on the roofs at night.
  ...block('crates', [[20, 21], [15, 21]]),
  ...block('lamp', [[17, 28], [18, 34]]),
];

const elderPresentWounded = (f: FlagState) => nzGathering(f);

export const nayrizQuarterMap: MapDefinition = {
  key: 'NayrizQuarter',
  title: 'Nayríz: the Quarter of Chinár-Súkhtih',
  width: W,
  height: H,
  spawn: { x: 1, y: 19 },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(0, 0, 8, 11, 'grass');
    paintRect(25, 0, 5, 12, 'grass');
    paintRect(32, 23, 16, 17, 'grass');
    paintRect(0, 36, 16, 4, 'grass');
    // The fort's court is out of reach behind its wall.
    for (let y = 0; y < 11; y++) for (let x = 31; x < 44; x++) blockCell(x, y);
    paintRect(31, 0, 13, 11, 'stone');
    // The square, the lane in from the west, the lane south, the path up to the fort.
    paintRect(7, 12, 18, 7, 'stone');
    paintRect(0, 19, 38, 2, 'path');
    paintRect(17, 21, 2, 19, 'path');
    paintRect(36, 12, 2, 7, 'path');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    // The burnt plane tree that names the quarter.
    { gridX: 16, gridY: 16, texture: 'nayriz-burnt-plane',
      prompt: 'Look at the burnt plane tree  [E]',
      dialogue: 'nz-plane' },

    // The arrival.
    { gridX: 4, gridY: 18, texture: 'nayriz-boy',
      prompt: 'Speak with the Boy  [E]',
      dialogue: 'nz-boy-arrival',
      present: nzArrival },
    { gridX: 27, gridY: 17, texture: 'nayriz-woman',
      prompt: 'Speak with the Woman at the Door  [E]',
      dialogue: 'nz-woman-arrival',
      present: nzArrival },
    { gridX: 10, gridY: 13, texture: 'nayriz-elder',
      prompt: 'Speak with the Old Mullá  [E]',
      dialogue: 'nz-elder-arrival',
      present: nzArrival },

    // The gathering: a night of muskets on the roofs.
    { gridX: 3, gridY: 17, texture: 'ch8-wounded',
      prompt: 'Speak with Mullá ʿAbdu\'l-Ḥusayn  [E]',
      dialogue: 'nz-elder-letter',
      gate: { when: f => !!f.nzCarryingLetter, lockedDialogue: 'nz-elder-wounded' },
      present: elderPresentWounded },
    { gridX: 27, gridY: 17, texture: 'nayriz-woman',
      prompt: 'Speak with the Woman at the Door  [E]',
      dialogue: 'nz-woman-night',
      present: nzGathering },
    { gridX: 15, gridY: 17, texture: 'nayriz-boy',
      prompt: 'Speak with the Boy  [E]',
      dialogue: 'nz-boy-night',
      present: nzGathering },
    { gridX: 35, gridY: 15, texture: 'ch4-vahid',
      prompt: 'Speak with Vaḥíd  [E]',
      dialogue: 'nz-vahid-dawn',
      present: f => nzGathering(f) && !!f.nzLetterDelivered },

    // After: the quarter at dusk.
    { gridX: 34, gridY: 17, texture: 'nayriz-boy',
      prompt: 'Speak with the Boy  [E]',
      dialogue: 'nz-boy-ambush',
      present: f => nzAfter(f) && !!f.nzLetterRead },
    { gridX: 27, gridY: 17, texture: 'nayriz-woman',
      prompt: 'Speak with the Boy\'s Mother  [E]',
      dialogue: 'nz-woman-end',
      gate: { when: f => !!f.nzHeardAmbush, lockedDialogue: 'nz-woman-wait' },
      present: f => nzAfter(f) && !!f.nzLetterRead },
    { gridX: VAHID_DOOR.x, gridY: VAHID_DOOR.y,
      prompt: 'Stand at Vaḥíd\'s door  [E]',
      dialogue: 'nz-close',
      gate: { when: f => !!f.nzHeardEnd, lockedDialogue: 'nz-vahid-door-shut' } },
  ],
  doors: [
    { gridX: NZ_MOSQUE_DOOR.x, gridY: NZ_MOSQUE_DOOR.y, prompt: 'Enter the masjid of Chinár-Súkhtih  [E]',
      targetScene: 'NayrizMosque', targetSpawnX: 7, targetSpawnY: 10,
      requires: f => !nzArrival(f) || arrivalRounds(f) >= ARRIVAL_NEEDED,
      lockedLabel: 'The masjid is packed to its doors' },
    { gridX: NZ_FORT_DOOR.x, gridY: NZ_FORT_DOOR.y, prompt: 'Go up into the fort of Khájih  [E]',
      targetScene: 'NayrizFort', targetSpawnX: 13, targetSpawnY: 21,
      requires: f => !!f.nzToFort, lockedLabel: 'The old fort stands empty on its rise' },
  ],
  exits: [],
  ambience: f => quarterAmbience(f),
};

/** A bright forenoon; a night of muskets on the roofs; a smoky dusk at the end. */
function quarterAmbience(f: FlagState): MapAmbience {
  if (nzAfter(f)) {
    return {
      wash: { color: 0xb07050, alpha: 0.42 },
      lights: [{ gridX: 37, gridY: 6, radius: 200, color: 0xff7a30, intensity: 0.3 }],
      particles: 'dust', music: 'sorrow', sound: ['wind'], vignette: 0.7,
    };
  }
  if (nzArrival(f)) {
    return { wash: { color: 0xf0d8a8, alpha: 0.14 }, particles: 'dust', music: 'city', sound: ['birds', 'breeze'], vignette: 0.45 };
  }
  return {
    wash: { color: 0x2a3560, alpha: 0.56 },
    lights: [
      { gridX: 17, gridY: 36, radius: 180, color: 0xff9a40, intensity: 0.35 },
      { gridX: 3, gridY: 17, radius: 90, color: 0xffb860, intensity: 0.35 },
    ],
    particles: 'motes', music: 'night', sound: ['crickets'], vignette: 0.65,
  };
}
