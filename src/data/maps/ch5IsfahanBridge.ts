import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Iṣfahán by the Zāyandih-Rúd, autumn 1846, at true scale. The Shíráz road
 * comes up from the south between a caravanserai and the caravan market to
 * the Sí-o-Se-Pol, whose roadway crosses the low autumn river between its
 * arcaded galleries; the cloth-printers wash their prints on the shingle
 * below the market. North of the river: the river road, the Imám-Jumʿih's
 * house to the west, where the Báb was lodged, the Chahár-Bágh avenue
 * running north from the bridge with its water channel and plane trees, the
 * madrasa on the avenue, and the river road east to the Palace of the Sun.
 *
 * Districts (x runs east, y runs south):
 * - The Imám-Jumʿih's house and porch court: x 1..12, y 0..12, gateway (6..7, 12).
 * - Garden: x 13..22, y 0..11. The avenue: x 24..32 north from the bridge, channel x 28.
 * - Madrasa and its court: x 34..45, y 0..12, gateway (39..40, 12). A house east of it.
 * - River road: y 13..15, from the west edge to the east edge (exit at (55, 14)).
 * - Shingle: y 16..17 north, y 38..39 south. The river: y 18..37, gravel bars in it.
 * - The bridge: deck x 24..33, y 18..37; roadway x 25..31 between the west gallery
 *   (x 24) and the east gallery and river arches (spans at x 32..36).
 * - South bank: the square at the bridge foot (x 20..36, y 40..44), the Shíráz road
 *   (x 27..29) south to the edge, the caravanserai west of it (x 2..21, y 42..57),
 *   the market east of it (x 31..47, y 45..56), houses at the east edge.
 */

const W = 56;
const H = 60;
const RIVER = { y0: 18, y1: 37 } as const;
/** The bridge deck: the west gallery on x0, the roadway, the east gallery on x1 - 1..x1. */
const BRIDGE = { x0: 24, x1: 33 } as const;
const ROAD = { x0: BRIDGE.x0 + 1, x1: BRIDGE.x1 - 2 } as const;
const SPAN = { w: 5, h: 10 } as const;

const tree = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });
const reeds = (cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'ch5-river-reeds', blocks: true }));

const buildings: BuildingSpec[] = [
  // The bridge's east flank in two spans; the west gallery is a wall run.
  { gridX: BRIDGE.x1 - 1, gridY: RIVER.y0, ...SPAN, texture: 'ch5-bridge-span' },
  { gridX: BRIDGE.x1 - 1, gridY: RIVER.y0 + SPAN.h, ...SPAN, texture: 'ch5-bridge-span' },
  // North bank: the Imám-Jumʿih's house, the madrasa, a house east of it
  { gridX: 3, gridY: 1, w: 8, h: 7, texture: 'town-house-large' },
  { gridX: 36, gridY: 1, w: 8, h: 7, texture: 'mosque-local' },
  { gridX: 48, gridY: 2, w: 6, h: 5, texture: 'town-house' },
  // South bank: the caravanserai (west part with its portal, east part)
  { gridX: 2, gridY: 42, w: 12, h: 16, texture: 'ch2-caravanserai' },
  { gridX: 14, gridY: 42, w: 8, h: 16, texture: 'ch2-caravanserai-east' },
  // The caravan market: printers' booths and stalls in rows
  { gridX: 42, gridY: 41, w: 2, h: 2, texture: 'ch5-market-awning' },
  { gridX: 33, gridY: 46, w: 2, h: 2, texture: 'ch5-market-awning' },
  { gridX: 38, gridY: 46, w: 2, h: 2, texture: 'market-stall' },
  { gridX: 43, gridY: 46, w: 2, h: 2, texture: 'ch5-market-awning' },
  { gridX: 33, gridY: 52, w: 2, h: 2, texture: 'market-stall' },
  { gridX: 38, gridY: 52, w: 2, h: 2, texture: 'ch5-market-awning' },
  { gridX: 43, gridY: 52, w: 2, h: 2, texture: 'market-stall' },
  // Houses at the market's east end
  { gridX: 48, gridY: 43, w: 6, h: 5, texture: 'town-house' },
  { gridX: 49, gridY: 51, w: 5, h: 4, texture: 'town-house-small' },
];

/** Court and garden walls on the north bank; the bridge's west gallery. */
function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    // The Imám-Jumʿih's court
    ...wallRun(w, 1, 0, 1, 11),
    ...wallRun(w, 12, 0, 12, 11),
    ...wallRun(w, 1, 12, 12, 12, [[6, 12], [7, 12]]),
    // The garden's wall on the road
    ...wallRun(w, 13, 12, 22, 12, [[17, 12], [18, 12]]),
    // The madrasa court
    ...wallRun(w, 34, 0, 34, 11),
    ...wallRun(w, 45, 0, 45, 11),
    ...wallRun(w, 34, 12, 45, 12, [[39, 12], [40, 12]]),
    // The house beyond, and the map's east edge
    ...wallRun(w, 46, 12, W - 2, 12),
    ...wallRun(w, W - 1, 0, W - 1, 12),
    // The bridge's west gallery
    ...wallRun('ch5-bridge-gallery', BRIDGE.x0, RIVER.y0, BRIDGE.x0, RIVER.y1),
  ];
}

/** Plane trees down the avenue and along the river, cypress and orange in the gardens and courts. */
function trees(): DecorSpec[] {
  return [
    // The Chahár-Bágh: plane trees either side of its walks
    ...[1, 4, 7, 10].flatMap(y => [tree(BRIDGE.x0, y, 'plane-tree'), tree(BRIDGE.x1 - 1, y, 'plane-tree')]),
    // The Imám-Jumʿih's court and the garden
    tree(2, 9, 'cypress'), tree(11, 9, 'orange-tree'), tree(2, 0, 'cypress'),
    tree(14, 2, 'cypress'), tree(17, 4, 'orange-tree'), tree(20, 2, 'cypress'),
    tree(15, 8, 'orange-tree'), tree(20, 9, 'orange-tree'), tree(18, 7, 'plane-tree'),
    // The madrasa court and the east house's garden
    tree(35, 9, 'plane-tree'), tree(44, 8, 'cypress'), tree(47, 9, 'orange-tree'),
    tree(51, 9, 'orange-tree'), tree(54, 8, 'cypress'),
    // The river road's shingle, and the south bank
    tree(3, 17, 'plane-tree'), tree(48, 17, 'plane-tree'), tree(19, 16, 'cypress'),
    tree(24, 47, 'plane-tree'), tree(23, 54, 'plane-tree'),
    tree(47, 39, 'plane-tree'), tree(52, 40, 'cypress'),
  ];
}

/** Reeds along both edges of the water and on the gravel bars. */
function riverbank(): DecorSpec[] {
  return [
    ...reeds([[2, 18], [7, 18], [14, 18], [21, 18], [39, 18], [45, 18], [50, 18], [54, 18]]),
    ...reeds([[1, 37], [8, 37], [13, 37], [19, 37], [39, 37], [44, 37], [50, 37], [53, 37]]),
    ...reeds([[6, 26], [11, 27], [43, 23], [49, 24]]),
  ];
}

/** Lamps at the bridgeheads, the gateways and the market. */
function lamps(): DecorSpec[] {
  const cells: Array<[number, number]> = [
    [BRIDGE.x0, 16], [BRIDGE.x1, 16], [BRIDGE.x0, 39], [BRIDGE.x1, 39],
    [5, 12], [8, 12], [38, 12], [41, 12],
    [10, 8], [43, 10], [26, 44], [30, 44], [36, 50], [41, 50],
  ];
  return cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'lamp', blocks: true }));
}

const props: DecorSpec[] = [
  // The Imám-Jumʿih's porch court
  { gridX: 4, gridY: 10, texture: 'rug' },
  { gridX: 9, gridY: 10, texture: 'rug' },
  { gridX: 3, gridY: 11, texture: 'ch1-planter', blocks: true },
  { gridX: 11, gridY: 11, texture: 'ch1-planter', blocks: true },
  // The garden
  { gridX: 16, gridY: 6, texture: 'ch7-rosebush', blocks: true },
  { gridX: 19, gridY: 5, texture: 'ch7-rosebush', blocks: true },
  // The madrasa court: a desk where the students copy, the well, carpets
  { gridX: 37, gridY: 10, texture: 'writing-desk', blocks: true },
  { gridX: 44, gridY: 11, texture: 'well', blocks: true },
  { gridX: 38, gridY: 11, texture: 'rug' },
  { gridX: 41, gridY: 9, texture: 'rug' },
  // The cloth-printers' washing on the south shingle
  { gridX: 38, gridY: 39, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 42, gridY: 39, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 41, gridY: 38, texture: 'rug' },
  { gridX: 45, gridY: 40, texture: 'crates', blocks: true },
  // The caravan market
  { gridX: 36, gridY: 47, texture: 'crates', blocks: true },
  { gridX: 41, gridY: 47, texture: 'ch9-rope-coils', blocks: true },
  { gridX: 36, gridY: 53, texture: 'ch9-cloth-bundle', blocks: true },
  { gridX: 41, gridY: 54, texture: 'crates', blocks: true },
  { gridX: 35, gridY: 50, texture: 'rug' },
  { gridX: 39, gridY: 50, texture: 'crowd', blocks: true },
  { gridX: 44, gridY: 50, texture: 'crowd-shadow' },
  // The caravanserai's camels and loads by the road
  { gridX: 23, gridY: 50, texture: 'ch2-camel', blocks: true },
  { gridX: 23, gridY: 45, texture: 'ch2-bundles', blocks: true },
  { gridX: 24, gridY: 57, texture: 'ch2-bundles', blocks: true },
  { gridX: 15, gridY: 58, texture: 'crates', blocks: true },
  { gridX: 26, gridY: 52, texture: 'ch2-milestone', blocks: true },
];

export const ch5IsfahanBridgeMap: MapDefinition = {
  key: 'Ch5IsfahanBridge',
  title: 'Iṣfahán, by the River',
  width: W,
  height: H,
  spawn: { x: 28, y: 56 },
  build: ({ paintRect, block }) => {
    paintRect(0, 0, W, H, 'sand');
    // North bank: gardens and courts
    paintRect(0, 0, W, 12, 'grass');
    paintRect(2, 8, 10, 4, 'stone');
    paintRect(35, 8, 10, 4, 'stone');
    // The avenue: paved walks either side of its channel
    paintRect(ROAD.x0, 0, ROAD.x1 - ROAD.x0 + 1, 13, 'stone');
    paintRect(28, 0, 1, 12, 'water');
    for (let y = 0; y < 12; y++) block(28, y);
    // The river road, and the lanes off it
    paintRect(0, 13, W, 3, 'path');
    paintRect(6, 12, 2, 1, 'path');
    paintRect(39, 12, 2, 1, 'path');
    // The river, its gravel bars, and the roadway across the bridge
    paintRect(0, RIVER.y0, W, RIVER.y1 - RIVER.y0 + 1, 'water');
    paintRect(5, 26, 8, 2, 'sand');
    paintRect(42, 23, 9, 2, 'sand');
    for (let y = RIVER.y0; y <= RIVER.y1; y++) {
      for (let x = 0; x < W; x++) if (x < ROAD.x0 || x > ROAD.x1) block(x, y);
    }
    paintRect(ROAD.x0, 16, ROAD.x1 - ROAD.x0 + 1, 24, 'stone');
    // South bank: the square at the bridge foot, the Shíráz road, the market floor
    paintRect(20, 40, 17, 5, 'stone');
    paintRect(27, 45, 3, H - 45, 'path');
    paintRect(32, 45, 15, 12, 'stone');
    paintRect(37, 40, 10, 3, 'path');
  },
  buildings,
  decor: [...walls(), ...trees(), ...riverbank(), ...lamps(), ...props],
  npcs: [
    { gridX: 31, gridY: 50, texture: 'npc-merchant',
      prompt: 'Speak with a Market Visitor  [E]',
      dialogue: 'ch5-arrival' },
    { gridX: 40, gridY: 39, texture: 'ch5-cloth-printer',
      prompt: 'Speak with the Cloth-Printer  [E]',
      dialogue: 'ch5-cloth-printer' },
    { gridX: 8, gridY: 9, texture: 'ch5-imam-jumih',
      prompt: 'Speak with the Imám-Jumʿih  [E]',
      dialogue: 'ch5-imam-jumih' },
    { gridX: 5, gridY: 9, texture: 'ch5-ewer',
      prompt: 'Look at the silver ewer  [E]',
      dialogue: 'ch5-ewer' },
    { gridX: 38, gridY: 9, texture: 'ch5-student',
      prompt: 'Speak with the Theology Student  [E]',
      dialogue: 'ch5-student' },
    { gridX: 42, gridY: 10, texture: 'npc-mulla',
      prompt: 'Speak with the Learned Cleric  [E]',
      dialogue: 'ch5-cleric-question' },
  ],
  exits: [
    { fromX: W - 1, fromY: 14, dx: 1, dy: 0,
      targetScene: 'Ch5MutamidPalace', targetSpawnX: 1, targetSpawnY: 22,
      label: '→ East along the river to the Palace of the Sun' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.26 },
    particles: 'leaves', music: 'city',
    vignette: 0.5,
    lights: [
      { gridX: 28, gridY: 17, radius: 200, color: 0xffc070, intensity: 0.2 },
      { gridX: 7, gridY: 10, radius: 160, color: 0xffc070, intensity: 0.24 },
    ],
  },
};
