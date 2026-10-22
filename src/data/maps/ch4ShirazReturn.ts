import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Shíráz in 1845, at true scale: a city that has just heard something new
 * in its call to prayer. The Kázirún gate in the south wall, where the
 * Búshihr road comes in; the neighbourhood mosque where Mullá Ṣádiq sounded
 * the call, with a dyer's vats facing its minaret; the vaulted bazaar on the
 * north side of the square where Quddús and his companions are shown to the
 * city; the governor's seat and his posted decree; and, south of the main
 * street, the lane of the uncle's house where the Báb is later confined.
 * The main street runs east to the Vakíl Mosque.
 *
 * Districts (x runs east, y runs south):
 * - Main street: y 20..22 from the west wall to the east edge (exit at y 21).
 * - Neighbourhood mosque and its court: x 1..13, y 2..19; the minaret at (12, 8).
 * - Dyer's yard: x 15..20, y 9..19, the dyer's house behind.
 * - Bazaar: vaulted rows x 22..37, y 2..4, its street y 5..8 opening onto the square.
 * - The square: x 22..37, y 9..19.
 * - Governor's seat: x 40..49, y 2..19, his forecourt open to the street.
 * - Walled garden: x 1..14, y 24..37, a still pool among cypresses.
 * - Kázirún road: x 17..18 from the gate (x 16..19 in the south wall) to the street.
 * - The uncle's lane: x 27..29 south from the street to the cross lane, y 41..44,
 *   which runs along inside the south wall; the uncle's house at x 31..36 behind
 *   its street wall and door at (33, 40). Nothing tall stands south of it.
 * - South-east garden: x 39..52, y 24..39.
 */

const W = 54;
const H = 46;

/** The uncle's street door, facing the cross lane. */
const UNCLE_DOOR = { x: 33, y: 40 };

const buildings: BuildingSpec[] = [
  // The neighbourhood mosque, and the dyer's house and vats across from its minaret
  { gridX: 2, gridY: 2, w: 8, h: 7, texture: 'mosque-local' },
  { gridX: 15, gridY: 3, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 16, gridY: 13, w: 3, h: 2, texture: 'ch4-dye-vats' },
  // The bazaar: vaulted rows of shops, stalls down its street
  { gridX: 22, gridY: 2, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 30, gridY: 2, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 24, gridY: 6, w: 2, h: 2, texture: 'market-stall' },
  { gridX: 29, gridY: 6, w: 2, h: 2, texture: 'market-stall' },
  { gridX: 34, gridY: 6, w: 2, h: 2, texture: 'market-stall' },
  // The governor's seat
  { gridX: 41, gridY: 2, w: 8, h: 7, texture: 'town-house-large' },
  // The Kázirún gate in the south wall
  { gridX: 16, gridY: 43, w: 4, h: 3, texture: 'city-gate' },
  // The walled garden's pool
  { gridX: 6, gridY: 29, w: 3, h: 3, texture: 'fountain-pool' },
  // Houses south of the main street; the uncle's at the head of his lane
  { gridX: 20, gridY: 24, w: 6, h: 5, texture: 'town-house' },
  { gridX: 21, gridY: 29, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 20, gridY: 34, w: 6, h: 5, texture: 'town-house' },
  { gridX: 31, gridY: 25, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 31, gridY: 33, w: 6, h: 5, texture: 'town-house' },
  // Houses along the south wall behind the walled garden
  { gridX: 1, gridY: 39, w: 6, h: 5, texture: 'town-house' },
  { gridX: 8, gridY: 40, w: 5, h: 4, texture: 'town-house-small' },
];

/** The city wall on the west and south, joined to the Kázirún gate. */
function cityWall(): DecorSpec[] {
  return [
    ...wallRun('town-wall', 0, 0, 0, H - 1),
    ...wallRun('town-wall', 1, H - 1, 15, H - 1),
    ...wallRun('town-wall', 20, H - 1, W - 1, H - 1),
  ];
}

/** Garden and courtyard walls that turn the gaps between houses into lanes. */
function compoundWalls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    // Between the mosque court and the dyer's yard; the bazaar's flanks; the governor's forecourt
    ...wallRun(w, 14, 1, 14, 17),
    ...wallRun(w, 21, 1, 21, 11),
    ...wallRun(w, 39, 0, 39, 16),
    ...wallRun(w, 50, 0, 50, 16),
    // The east edge of the map, open where the main street runs on
    ...wallRun(w, W - 1, 0, W - 1, 19),
    ...wallRun(w, W - 1, 23, W - 1, H - 2),
    // The walled garden, its gateway off the main street
    ...wallRun(w, 1, 23, 14, 23, { gaps: [[6, 23], [7, 23]] }),
    ...wallRun(w, 15, 23, 15, 38),
    ...wallRun(w, 1, 38, 14, 38),
    // The uncle's street wall and door, and the court walls beside it
    ...wallRun(w, 30, 38, 30, 40),
    ...wallRun(w, 31, 40, 37, 40, { doors: [[UNCLE_DOOR.x, UNCLE_DOOR.y]] }),
    ...wallRun(w, 37, 38, 37, 39),
    // The south-east garden
    ...wallRun(w, 38, 23, 38, 40),
    ...wallRun(w, 39, 23, 52, 23),
    ...wallRun(w, 39, 40, 52, 40, { gaps: [[44, 40], [45, 40]] }),
  ];
}

/** Trees at their real heights: cypress and orange in the gardens, plane trees over the lanes. */
function trees(): DecorSpec[] {
  const t = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });
  return [
    // The mosque court and behind the mosque
    t(1, 10, 'cypress'), t(11, 3, 'plane-tree'), t(13, 6, 'cypress'), t(11, 17, 'plane-tree'),
    // Behind the bazaar and the dyer's house
    t(23, 0, 'plane-tree'), t(33, 0, 'plane-tree'), t(19, 1, 'cypress'),
    // The governor's forecourt and beyond
    t(40, 10, 'cypress'), t(49, 10, 'cypress'), t(52, 4, 'plane-tree'), t(52, 13, 'cypress'),
    // The walled garden
    t(2, 25, 'cypress'), t(13, 25, 'cypress'), t(2, 36, 'cypress'), t(13, 36, 'cypress'),
    t(4, 27, 'orange-tree'), t(10, 27, 'orange-tree'), t(4, 33, 'orange-tree'), t(10, 33, 'orange-tree'),
    t(12, 30, 'plane-tree'),
    // The uncle's lane and the south-east garden
    t(26, 33, 'cypress'),
    t(41, 25, 'plane-tree'), t(48, 27, 'plane-tree'), t(51, 25, 'cypress'), t(51, 31, 'cypress'),
    t(40, 31, 'orange-tree'), t(44, 29, 'orange-tree'), t(42, 36, 'orange-tree'), t(49, 35, 'orange-tree'),
  ];
}

/** Lamps along the street, at the mosque, the square, the governor's gate and the uncle's lane. */
function lamps(): DecorSpec[] {
  const cells: Array<[number, number]> = [
    [4, 12], [10, 12], [13, 19],
    [23, 9], [36, 9], [22, 19],
    [40, 17], [49, 17],
    [16, 24], [19, 38], [29, 40],
    [43, 42], [51, 19], [31, 19],
  ];
  return cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'lamp', blocks: true }));
}

const props: DecorSpec[] = [
  // The minaret from which the new call was sounded
  { gridX: 12, gridY: 8, texture: 'ch4-minaret', blocks: true },
  // The mosque court: an ablution well, planters, a rug
  { gridX: 3, gridY: 15, texture: 'well', blocks: true },
  { gridX: 9, gridY: 11, texture: 'ch1-planter', blocks: true },
  { gridX: 7, gridY: 14, texture: 'rug' },
  // The dyer's yard: cloth bundles and crates
  { gridX: 19, gridY: 12, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 15, gridY: 16, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 20, gridY: 17, texture: 'crates', blocks: true },
  // Bazaar goods
  { gridX: 27, gridY: 7, texture: 'crates', blocks: true },
  { gridX: 32, gridY: 6, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 26, gridY: 5, texture: 'rug' },
  { gridX: 37, gridY: 7, texture: 'crates', blocks: true },
  // The crowd in the square, kept back from the prisoners
  { gridX: 24, gridY: 11, texture: 'crowd', blocks: true },
  { gridX: 34, gridY: 11, texture: 'crowd', blocks: true },
  { gridX: 24, gridY: 16, texture: 'crowd', blocks: true },
  { gridX: 34, gridY: 16, texture: 'crowd', blocks: true },
  { gridX: 28, gridY: 16, texture: 'crowd-shadow' },
  { gridX: 31, gridY: 15, texture: 'crowd-shadow' },
  // The governor's gate: sentries either side
  { gridX: 42, gridY: 11, texture: 'ch4-officer', blocks: true },
  { gridX: 47, gridY: 11, texture: 'ch4-officer', blocks: true },
  // The Búshihr road at the gate: the milestone, bales off the road
  { gridX: 16, gridY: 40, texture: 'ch2-milestone', blocks: true },
  { gridX: 15, gridY: 41, texture: 'crates', blocks: true },
  { gridX: 14, gridY: 42, texture: 'ch9-cloth-bundle', blocks: true },
  // The walled garden: roses by the pool, a planter, a rug in the shade
  { gridX: 5, gridY: 34, texture: 'ch7-rosebush', blocks: true },
  { gridX: 9, gridY: 34, texture: 'ch7-rosebush', blocks: true },
  { gridX: 6, gridY: 25, texture: 'ch1-planter', blocks: true },
  { gridX: 10, gridY: 30, texture: 'rug' },
  // The uncle's lane: a planter by the door, a rug where the watcher sits
  { gridX: 32, gridY: 41, texture: 'ch1-planter', blocks: true },
  { gridX: 37, gridY: 43, texture: 'rug' },
  // The south-east garden
  { gridX: 46, gridY: 30, texture: 'well', blocks: true },
  { gridX: 42, gridY: 31, texture: 'ch7-rosebush', blocks: true },
];

export const ch4ShirazReturnMap: MapDefinition = {
  key: 'Ch4ShirazReturn',
  title: 'Shíráz, the Streets in 1845',
  width: W,
  height: H,
  spawn: { x: 17, y: 40 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'path');
    // The mosque court, the square and the governor's forecourt
    paintRect(1, 9, 13, 11, 'stone');
    paintRect(22, 9, 16, 11, 'stone');
    paintRect(40, 9, 10, 11, 'stone');
    // The dyer's yard, the bazaar street, the Kázirún road
    paintRect(15, 8, 6, 12, 'sand');
    paintRect(22, 5, 16, 4, 'sand');
    paintRect(17, 23, 2, 20, 'sand');
    // The gardens
    paintRect(1, 24, 14, 14, 'grass');
    paintRect(39, 24, 14, 16, 'grass');
    paintRect(5, 28, 5, 5, 'path');
  },
  buildings,
  decor: [...cityWall(), ...compoundWalls(), ...trees(), ...lamps(), ...props],
  npcs: [
    // The square: Quddús and Mullá Ṣádiq until they are put out of the city
    { gridX: 27, gridY: 13, texture: 'ch4-quddus',
      prompt: 'Stand with Quddús  [E]',
      dialogue: 'ch4-quddus-witness',
      present: f => !f.vakilAddressHeard },
    { gridX: 29, gridY: 13, texture: 'ch4-officer',
      prompt: 'Hear the officer of Ḥusayn Khán  [E]',
      dialogue: 'ch4-officer-warning' },
    { gridX: 31, gridY: 13, texture: 'ch4-mulla-sadiq',
      prompt: 'Sit with Mullá Ṣádiq  [E]',
      dialogue: 'ch4-mulla-sadiq',
      present: f => !f.vakilAddressHeard },
    // The dyer, by his vats facing the minaret
    { gridX: 17, gridY: 17, texture: 'ch4-townsman',
      prompt: 'Speak with the Dyer  [E]',
      dialogue: 'ch4-dyer' },
    // The baker at the mouth of the bazaar
    { gridX: 26, gridY: 9, texture: 'ch4-baker',
      prompt: 'Speak with the Baker  [E]',
      dialogue: 'ch4-baker' },
    // The uncle at the governor's gate, having just stood surety
    { gridX: 44, gridY: 14, texture: 'ch4-khal',
      prompt: 'Speak with Ḥájí Mírzá Siyyid ʿAlí  [E]',
      dialogue: 'ch4-khal',
      present: f => !f.vakilAddressHeard },
    { gridX: 47, gridY: 15, texture: 'ch4-decree-board',
      prompt: 'Read the governor\'s decree  [E]',
      dialogue: 'ch4-decree' },
    // The uncle's lane
    { gridX: 35, gridY: 41, texture: 'ch1-npc-servant',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch4-mubarak' },
    { gridX: 36, gridY: 42, texture: 'ch4-khal',
      prompt: 'Speak with Ḥájí Mírzá Siyyid ʿAlí  [E]',
      dialogue: 'ch4-khal-home',
      present: f => !!f.vakilAddressHeard },
    { gridX: 30, gridY: 42, texture: 'ch4-vahid',
      prompt: 'Speak with Vaḥíd  [E]',
      dialogue: 'ch4-vahid',
      present: f => !!f.vakilAddressHeard },
    // The uncle's door: the Báb is confined within and never seen
    { gridX: UNCLE_DOOR.x, gridY: UNCLE_DOOR.y,
      prompt: 'Keep watch at the uncle\'s door  [E]',
      dialogue: 'ch4-uncle-door',
      gate: {
        when: f => !!f.vakilAddressHeard && !!f.vahidTestimony,
        lockedDialogue: 'ch4-uncle-door-locked',
      } },
  ],
  exits: [
    { fromX: W - 1, fromY: 21, dx: 1, dy: 0,
      targetScene: 'Ch4VakilMosque', targetSpawnX: 3, targetSpawnY: 18,
      label: '→ East to the Vakíl Mosque' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.22 },
    particles: 'dust', music: 'city',
    vignette: 0.5,
    lights: [
      { gridX: 29, gridY: 13, radius: 200, color: 0xffc070, intensity: 0.22 },
      { gridX: 33, gridY: 41, radius: 160, color: 0xffc070, intensity: 0.24 },
    ],
  },
};
