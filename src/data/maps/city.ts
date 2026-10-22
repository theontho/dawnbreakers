import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Shíráz at dusk, 22 May 1844, at true scale. The Kázirún gate in the
 * south-east with the road in and a square inside it, the vaulted bazaar
 * street running west from there, the great mosque and its fountain court to
 * the west, the Masjid-i-Ílkhání in the north where Mullá Ḥusayn's kin lodge,
 * and the road north to the Quiet Quarter. Lanes run between high house and
 * garden walls; the city wall closes the south and east.
 *
 * Districts (x runs east, y runs south):
 * - Road north: x 16..19 from the mosque to the top edge (exit at x 18).
 * - Ílkhání court: x 21..35, y 5..20, walled, gateway onto the back lane.
 * - Walled garden: x 37..54, y 0..20, trees over its walls.
 * - Back lane: y 22..24 behind the bazaar's north row.
 * - Bazaar street: x 20..46, y 28..34, arcades both sides, stalls down the middle.
 * - Great mosque: x 4..15, y 18..27, its court and pool to the south.
 * - Wall street: y 39..42, from the mosque court east to the gate square.
 * - Gate square: x 34..54, y 39..50, the gate in the south wall at x 44..47.
 */

const W = 56;
const H = 52;

const GREAT_MOSQUE = { gridX: 4, gridY: 18, w: 12, h: 10 };
const ILKHANI = { gridX: 24, gridY: 8, w: 8, h: 7 };
/** The Ílkhání's door, mid-way along its front (south-west) face. */
export const ILKHANI_DOOR = { x: 28, y: ILKHANI.gridY + ILKHANI.h - 1 };

const buildings: BuildingSpec[] = [
  // The great mosque and the Masjid-i-Ílkhání
  { ...GREAT_MOSQUE, texture: 'mosque-great' },
  { ...ILKHANI, texture: 'mosque-local' },
  // The Kázirún gate in the south wall, and the pool of the mosque court
  { gridX: 44, gridY: 49, w: 4, h: 3, texture: 'city-gate-large' },
  { gridX: 8, gridY: 32, w: 3, h: 3, texture: 'fountain-pool' },
  // The bazaar: vaulted rows on both sides of the street, stalls down its middle
  { gridX: 20, gridY: 25, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 28, gridY: 25, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 36, gridY: 25, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 20, gridY: 35, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 28, gridY: 35, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 36, gridY: 35, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 22, gridY: 30, w: 2, h: 2, texture: 'market-stall-large' },
  { gridX: 27, gridY: 30, w: 2, h: 2, texture: 'market-stall-large' },
  { gridX: 32, gridY: 30, w: 2, h: 2, texture: 'market-stall-large' },
  { gridX: 37, gridY: 30, w: 2, h: 2, texture: 'market-stall-large' },
  { gridX: 41, gridY: 30, w: 2, h: 2, texture: 'market-stall-large' },
  // Houses of the north-west quarter
  { gridX: 1, gridY: 0, w: 6, h: 5, texture: 'town-house' },
  { gridX: 9, gridY: 0, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 0, gridY: 8, w: 8, h: 7, texture: 'town-house-large' },
  { gridX: 10, gridY: 8, w: 5, h: 4, texture: 'town-house-small' },
  // Houses north of the Ílkhání, and the garden house
  { gridX: 21, gridY: 0, w: 6, h: 5, texture: 'town-house' },
  { gridX: 29, gridY: 0, w: 6, h: 5, texture: 'town-house' },
  { gridX: 45, gridY: 3, w: 8, h: 7, texture: 'town-house-large' },
  // Houses east of the bazaar, against the city wall
  { gridX: 48, gridY: 25, w: 6, h: 5, texture: 'town-house' },
  { gridX: 49, gridY: 32, w: 5, h: 4, texture: 'town-house-small' },
  // Houses along the south wall
  { gridX: 1, gridY: 43, w: 8, h: 7, texture: 'town-house-large' },
  { gridX: 11, gridY: 44, w: 6, h: 5, texture: 'town-house' },
  { gridX: 19, gridY: 44, w: 6, h: 5, texture: 'town-house' },
  { gridX: 27, gridY: 45, w: 5, h: 4, texture: 'town-house-small' },
];

/** The city wall along the south and east edges, joined to the gate. */
function cityWall(): DecorSpec[] {
  return [
    ...wallRun('town-wall', 0, H - 1, 43, H - 1),
    ...wallRun('town-wall', 48, H - 1, W - 1, H - 1),
    ...wallRun('town-wall', W - 1, 0, W - 1, H - 2),
  ];
}

/** Garden and courtyard walls that turn the gaps between houses into lanes. */
function compoundWalls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    // The road north: house walls and garden walls on both sides
    ...wallRun(w, 15, 0, 15, 4),
    ...wallRun(w, 15, 8, 15, 17),
    ...wallRun(w, 2, 15, 2, 38),
    ...wallRun(w, 3, 17, 14, 17),
    ...wallRun(w, 20, 0, 20, 21, [[20, 16], [20, 17], [20, 18]]),
    // The Ílkhání court: its garden to the north, its gateway to the back lane
    ...wallRun(w, 21, 5, 35, 5),
    ...wallRun(w, 36, 0, 36, 21),
    ...wallRun(w, 21, 21, 35, 21, [[27, 21], [28, 21], [29, 21]]),
    // The walled garden in the north-east
    ...wallRun(w, 37, 21, 54, 21),
    // Behind the bazaar and around the houses by the east wall
    ...wallRun(w, 20, 38, 43, 38),
    ...wallRun(w, 47, 25, 47, 38),
    ...wallRun(w, 48, 38, 54, 38),
    ...wallRun(w, 48, 30, 54, 30),
    // The south houses' frontage on the wall street, and the square's west side
    ...wallRun(w, 0, 42, 0, 50),
    ...wallRun(w, 9, 43, 10, 43),
    ...wallRun(w, 17, 43, 18, 43),
    ...wallRun(w, 25, 43, 26, 43),
    ...wallRun(w, 32, 43, 33, 43),
    ...wallRun(w, 33, 44, 33, 50),
  ];
}

/** Trees: plane trees in the courts, cypress and orange trees in the walled gardens. */
function trees(): DecorSpec[] {
  const t = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });
  return [
    // The walled garden: an avenue of cypress, plane trees, orange trees by the pool house
    t(39, 2, 'cypress-tall'), t(41, 2, 'cypress-tall'), t(43, 2, 'cypress-tall'),
    t(39, 12, 'plane-tree'), t(44, 14, 'plane-tree'), t(50, 13, 'plane-tree'),
    t(39, 17, 'orange-tree'), t(42, 19, 'orange-tree'), t(47, 18, 'orange-tree'),
    t(51, 17, 'orange-tree'), t(53, 11, 'orange-tree'), t(41, 8, 'orange-tree'),
    // The Ílkhání's garden behind its north wall
    t(22, 6, 'orange-tree'), t(25, 6, 'cypress-tall'), t(31, 6, 'cypress-tall'), t(34, 6, 'orange-tree'),
    // Gardens behind the north-west houses and beside the great mosque
    t(8, 2, 'cypress-tall'), t(12, 14, 'plane-tree'), t(9, 15, 'orange-tree'),
    t(0, 18, 'cypress-tall'), t(1, 24, 'plane-tree'), t(0, 31, 'cypress-tall'), t(1, 36, 'orange-tree'),
    // The great mosque court
    t(3, 29, 'plane-tree'), t(4, 37, 'cypress-tall'), t(18, 37, 'plane-tree'),
    // The gate square and the back lane
    t(35, 40, 'plane-tree'), t(53, 40, 'plane-tree'), t(21, 23, 'cypress-tall'),
  ];
}

/** Lamps along the lanes, at the mosque steps, and at the gate. */
function lamps(): DecorSpec[] {
  const cells: Array<[number, number]> = [
    [16, 3], [19, 9], [16, 13], [19, 22], [8, 5],
    [25, 15], [31, 15], [28, 20],
    [30, 22], [42, 24],
    [7, 28], [13, 28], [17, 33],
    [25, 30], [35, 31], [44, 28],
    [12, 41], [24, 39], [31, 41],
    [43, 47], [48, 47], [43, 39],
  ];
  return cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'lamp', blocks: true }));
}

const props: DecorSpec[] = [
  // The mosque court: prayer rugs, a well, pigeons on the stones
  { gridX: 6, gridY: 30, texture: 'rug' },
  { gridX: 13, gridY: 31, texture: 'rug' },
  { gridX: 6, gridY: 36, texture: 'well', blocks: true },
  { gridX: 15, gridY: 34, texture: 'ch1-birds' },
  // The bazaar: goods between the stalls and at the arcade fronts
  { gridX: 24, gridY: 31, texture: 'crates', blocks: true },
  { gridX: 29, gridY: 30, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 34, gridY: 30, texture: 'crates', blocks: true },
  { gridX: 39, gridY: 31, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 22, gridY: 33, texture: 'rug' },
  { gridX: 31, gridY: 33, texture: 'rug' },
  { gridX: 30, gridY: 32, texture: 'ch3-pilgrim-cluster', blocks: true },
  { gridX: 36, gridY: 28, texture: 'crates', blocks: true },
  // The Ílkhání court
  { gridX: 33, gridY: 17, texture: 'rug' },
  { gridX: 22, gridY: 12, texture: 'crates', blocks: true },
  { gridX: 23, gridY: 18, texture: 'ch1-planter', blocks: true },
  { gridX: 33, gridY: 9, texture: 'ch1-planter', blocks: true },
  // Rose beds and planters at house doors
  { gridX: 5, gridY: 7, texture: 'ch7-rosebush', blocks: true },
  { gridX: 13, gridY: 42, texture: 'ch1-planter', blocks: true },
  { gridX: 22, gridY: 42, texture: 'ch7-rosebush', blocks: true },
  // The gate square: bales off the road, the milestone, the traveller's rug
  { gridX: 37, gridY: 47, texture: 'crates', blocks: true },
  { gridX: 38, gridY: 48, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 41, gridY: 49, texture: 'ch2-milestone', blocks: true },
  { gridX: 52, gridY: 42, texture: 'rug' },
  { gridX: 52, gridY: 44, texture: 'crates', blocks: true },
];

export const cityMap: MapDefinition = {
  key: 'City',
  title: 'Shíráz: the City at Dusk',
  width: W,
  height: H,
  trueScale: true,
  spawn: { x: 45, y: 46 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'path');
    // Walled gardens
    paintRect(37, 0, 18, 21, 'grass');
    paintRect(21, 6, 15, 2, 'grass');
    paintRect(8, 13, 7, 4, 'grass');
    paintRect(0, 15, 2, 27, 'grass');
    // Courts of the two mosques
    paintRect(3, 28, 17, 11, 'stone');
    paintRect(21, 8, 15, 13, 'stone');
    // The bazaar street and the gate square, the road in from the gate
    paintRect(20, 28, 27, 7, 'sand');
    paintRect(34, 39, 21, 12, 'sand');
    paintRect(44, 35, 3, 4, 'sand');
    paintRect(45, 39, 2, 10, 'path');
  },
  buildings,
  decor: [...cityWall(), ...compoundWalls(), ...trees(), ...lamps(), ...props],
  npcs: [
    // Mullá Ḥusayn, the player's travelling companion; after this he goes ahead to the Quiet Quarter
    { gridX: 42, gridY: 45, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch1-mulla-husayn-gate',
      present: f => !f.metMullaHusayn },
    { gridX: 51, gridY: 43, texture: 'npc-traveller',
      prompt: 'Speak with the Weary Traveller  [E]',
      dialogue: 'rumour-traveller' },
    { gridX: 49, gridY: 46, texture: 'ch1-npc-guard',
      prompt: 'Speak with the Gate Guard  [E]',
      dialogue: 'rumour-gate-guard' },
    { gridX: 23, gridY: 32, texture: 'npc-merchant',
      prompt: 'Speak with the Cloth Merchant  [E]',
      dialogue: 'rumour-merchant' },
    { gridX: 38, gridY: 32, texture: 'ch1-npc-calligrapher',
      prompt: 'Speak with the Calligrapher  [E]',
      dialogue: 'rumour-calligrapher' },
    { gridX: 10, gridY: 29, texture: 'npc-mulla',
      prompt: 'Speak with the Stern Mullá  [E]',
      dialogue: 'rumour-mulla' },
    { gridX: 14, gridY: 28, texture: 'ch1-npc-beggar',
      prompt: 'Speak with the Mosque Orphan  [E]',
      dialogue: 'rumour-orphan' },
    { gridX: 11, gridY: 33, texture: 'ch1-npc-water-carrier',
      prompt: 'Speak with the Water-Carrier  [E]',
      dialogue: 'rumour-water-carrier' },
  ],
  doors: [
    // The Masjid-i-Ílkhání, where Mullá Ḥusayn's brother and nephew wait.
    { gridX: ILKHANI_DOOR.x, gridY: ILKHANI_DOOR.y, prompt: 'Enter the Masjid-i-Ílkhání  [E]',
      targetScene: 'Ch1IlkhaniMosque', targetSpawnX: 7, targetSpawnY: 10 },
  ],
  exits: [
    { fromX: 18, fromY: 0, dx: 0, dy: -1,
      targetScene: 'HouseQuarter', targetSpawnX: 9, targetSpawnY: 16,
      label: '↑ Walk to the Quiet Quarter' },
  ],
  ambience: {
    wash: { color: 0xd89060, alpha: 0.32 },
    particles: 'motes', music: 'dusk',
    lights: [
      { gridX: 10, gridY: 28, radius: 220, color: 0xffc070, intensity: 0.28 },
      { gridX: 28, gridY: 16, radius: 180, color: 0xffc070, intensity: 0.3 },
      { gridX: 45, gridY: 46, radius: 220, color: 0xffb860, intensity: 0.28 },
    ],
  },
};
