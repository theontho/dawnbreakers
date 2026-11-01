import type { FlagState } from '../../dialogue/types';
import { frMourning, frTeaching, husaynHome } from './forerunnersPhases';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Karbilá, winter 1843 to 1844, at true scale: a lane of brick houses near
 * the shrine of the Imám Ḥusayn, whose gilded dome and minarets stand over
 * the roofs to the north and are never entered. Siyyid Káẓim's house fronts
 * the lane on its north side. South of the lane, the water-seller's well
 * and the bookseller's stall; beyond them the palm groves on the canal. The
 * north road to Kázimayn and Baghdád leaves by the lane's west end; the road
 * to Kúfih and Najaf runs south-east through the palms.
 *
 * Districts (x runs east, y runs south):
 * - The town beyond, y 0..5, out of reach: the shrine at x 14..19, roofs.
 * - North of the lane, fronts on y = 12: houses; Siyyid Káẓim's courtyard
 *   house x 8..15, y 6..12, its gateway at (13, 12) (`KazimHouse`).
 * - The lane, y 13..15, the whole width; the north road off its west end
 *   at (0, 14).
 * - South of the lane, y 16..21: the well (4, 17), the stalls, a house.
 * - The road to Kúfih: down x 34..35 to the edge at (35, 22).
 * - The palm groves, y 22..29, with the canal on y 25..26.
 */

const W = 36;
const H = 30;
export const KAZIM_GATE = { x: 13, y: 12 } as const;
/** Where the north road comes into the lane, at its west end. */
export const NORTH_ROAD = { x: 0, y: 14 } as const;
/** Where the Kúfih road leaves the map, south-east through the palms. */
export const KUFIH_ROAD = { x: 35, y: 22 } as const;
const CANAL_Y = 25;

const joined = (f: FlagState) => !!f.frJoinedHusayn;
/** Between the shepherd at Baráthá and the copyist's news at the door. */
const homecoming = (f: FlagState) => !!f.frForetold && frTeaching(f);

const buildings: BuildingSpec[] = [
  // The town beyond the lane, seen over the roofs, and the shrine over all.
  { gridX: 14, gridY: 0, w: 6, h: 6, texture: 'karbila-shrine-dome' },
  { gridX: 2, gridY: 1, w: 5, h: 4, texture: 'town-house-small', variant: 0 },
  { gridX: 23, gridY: 1, w: 5, h: 4, texture: 'town-house-small', variant: 1 },
  { gridX: 29, gridY: 0, w: 6, h: 5, texture: 'town-house', variant: 0 },
  // North of the lane.
  { gridX: 1, gridY: 8, w: 6, h: 5, texture: 'town-house', variant: 1 },
  { gridX: 8, gridY: 6, w: 8, h: 7, texture: 'town-house-large', variant: 1 },
  { gridX: 17, gridY: 9, w: 5, h: 4, texture: 'town-house-small', variant: 0 },
  { gridX: 24, gridY: 8, w: 6, h: 5, texture: 'town-house', variant: 0 },
  { gridX: 31, gridY: 9, w: 5, h: 4, texture: 'town-house-small', variant: 1 },
  // South of the lane.
  { gridX: 18, gridY: 17, w: 2, h: 2, texture: 'market-stall' },
  { gridX: 23, gridY: 17, w: 2, h: 2, texture: 'market-stall' },
  { gridX: 27, gridY: 17, w: 6, h: 5, texture: 'town-house', variant: 1 },
];

function walls(): DecorSpec[] {
  const garden = 'compound-wall';
  return [
    ...wallRun(garden, 0, 12, 0, 12),
    ...wallRun(garden, 7, 12, 7, 12),
    ...wallRun(garden, 16, 12, 16, 12),
    ...wallRun(garden, 22, 12, 23, 12),
    ...wallRun(garden, 30, 12, 30, 12),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // Palms over the roofs of the town beyond.
  ...block('date-palm-tall', [[0, 2], [21, 4], [35, 6]]),
  ...block('date-palm', [[8, 3], [27, 6]]),
  // The lane: the well and its jars, lamps at the gateways, the stalls' goods.
  ...block('well', [[4, 17]]),
  ...block('ch9-water-jar', [[3, 16], [8, 17]]),
  ...block('lamp', [[12, 16], [17, 13], [30, 13]]),
  ...block('ch2-bundles', [[20, 18]]),
  ...block('crates', [[25, 18], [26, 17], [14, 18]]),
  ...loose('rug', [[21, 17]]),
  ...block('date-palm-young', [[12, 20], [15, 20], [2, 20]]),
  // The canal and its groves: young palms on the near bank, the old grove beyond the water.
  ...block('date-palm-young', [[3, 23], [8, 22], [12, 23], [16, 24], [20, 22], [24, 23], [27, 23], [28, 24], [5, 24], [19, 24]]),
  ...block('date-palm', [[6, 28], [17, 28], [24, 27], [31, 28], [3, 29], [14, 29]]),
  ...block('date-palm-tall', [[1, 27], [9, 27], [12, 27], [21, 28], [29, 27], [35, 28]]),
  ...block('date-palm-young', [[9, 29], [27, 29], [19, 29]]),
  // In the mourning: knots of people outside his gate, and the mules for Kúfih.
  ...loose('crowd-shadow', [[10, 14], [16, 15], [21, 14]], frMourning),
  ...block('kulayn-horse', [[32, 23]], joined),
];

export const karbilaQuarterMap: MapDefinition = {
  key: 'KarbilaQuarter',
  title: 'Karbilá: the Lane of Siyyid Káẓim',
  width: W,
  height: H,
  spawn: { x: 4, y: 14 },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'sand');
    // The town beyond is out of reach.
    for (let y = 0; y < 12; y++) for (let x = 0; x < W; x++) blockCell(x, y);
    paintRect(0, 0, W, 12, 'stone');
    // The lane, the little square by the well, the road to Kúfih.
    paintRect(0, 13, W, 3, 'stone');
    paintRect(2, 16, 9, 3, 'path');
    paintRect(34, 16, 2, 7, 'path');
    // The groves on the canal, which is not to be crossed.
    paintRect(0, 22, W, H - 22, 'grass');
    paintRect(30, 22, 6, 2, 'path');
    paintRect(0, CANAL_Y, W, 2, 'water');
    for (let x = 0; x < W; x++) for (let y = CANAL_Y; y < H; y++) blockCell(x, y);
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    // Before the death.
    { gridX: 6, gridY: 16, texture: 'forerunners-water-seller',
      prompt: 'Speak with the Water-Seller  [E]',
      dialogue: 'fr-water-seller',
      present: frTeaching },
    { gridX: 20, gridY: 16, texture: 'forerunners-bookseller',
      prompt: 'Speak with the Bookseller  [E]',
      dialogue: 'fr-bookseller',
      present: frTeaching },
    { gridX: 11, gridY: 14, texture: 'forerunners-seeker',
      prompt: 'Speak with the Student from Khurásán  [E]',
      dialogue: 'fr-seeker',
      present: f => frTeaching(f) && !f.frHeardLesson },
    { gridX: KAZIM_GATE.x - 1, gridY: KAZIM_GATE.y + 1, texture: 'forerunners-copyist',
      prompt: 'Speak with the Copyist  [E]',
      dialogue: 'fr-copyist-door',
      present: homecoming },

    // The mourning.
    { gridX: 6, gridY: 16, texture: 'forerunners-water-seller',
      prompt: 'Speak with the Water-Seller  [E]',
      dialogue: 'fr-water-seller-mourning',
      present: frMourning },
    { gridX: 20, gridY: 16, texture: 'forerunners-bookseller',
      prompt: 'Speak with the Bookseller  [E]',
      dialogue: 'fr-bookseller-mourning',
      present: frMourning },
    { gridX: 2, gridY: 14, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'fr-husayn-again',
      gate: { when: f => !!f.frHusaynReturned, lockedDialogue: 'fr-husayn-return' },
      present: f => frMourning(f) && husaynHome(f) && !joined(f) },
    { gridX: 33, gridY: 19, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'fr-husayn-road',
      present: joined },
    { gridX: 33, gridY: 22, texture: 'ch1-brother',
      prompt: 'Speak with Mullá Ḥusayn\'s Brother  [E]',
      dialogue: 'fr-brother-road',
      present: joined },
  ],
  doors: [
    { gridX: KAZIM_GATE.x, gridY: KAZIM_GATE.y, prompt: 'Enter the house of Siyyid Káẓim  [E]',
      targetScene: 'KazimHouse', targetSpawnX: 9, targetSpawnY: 11,
      requires: f => !homecoming(f), lockedLabel: 'Someone is waiting in the gateway' },
  ],
  exits: [
    { fromX: NORTH_ROAD.x, fromY: NORTH_ROAD.y, dx: -1, dy: 0,
      targetScene: 'BarathaRoad', targetSpawnX: 24, targetSpawnY: 14,
      label: '↖ The road north to Kázimayn',
      requires: f => !!f.frHeardLesson && !f.frForetold,
      lockedLabel: 'The road north to Kázimayn and Baghdád' },
    { fromX: KUFIH_ROAD.x, fromY: KUFIH_ROAD.y, dx: 1, dy: 0,
      targetScene: 'KufihMosque', targetSpawnX: 1, targetSpawnY: 14,
      label: '↘ The road south-east to Kúfih',
      requires: joined,
      lockedLabel: 'The road south-east to Kúfih and Najaf' },
  ],
  ambience: f => quarterAmbience(f),
};

/** A clear winter morning; a dusk homecoming; the grey of the mourning month. */
function quarterAmbience(f: FlagState): MapAmbience {
  if (frMourning(f)) {
    return {
      wash: { color: 0x6a6878, alpha: 0.38 },
      particles: 'dust', music: joined(f) ? 'road' : 'sorrow', sound: ['wind'], vignette: 0.62,
    };
  }
  if (homecoming(f)) {
    return {
      wash: { color: 0xd08850, alpha: 0.32 },
      lights: [{ gridX: 12, gridY: 16, radius: 120, color: 0xffb060, intensity: 0.4 }],
      particles: 'motes', music: 'dusk', sound: ['breeze'], vignette: 0.6,
    };
  }
  return {
    wash: { color: 0xe0c8a0, alpha: 0.16 },
    particles: 'motes', music: 'city', sound: ['birds', 'breeze'], vignette: 0.5,
  };
}
