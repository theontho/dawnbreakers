import type { DecorSpec, MapDefinition } from './types';
import { CellSet, MAZINDARAN_WOODS, scatterWoodland, sightlines, traceRoute, widen, type Cell } from './ch8MapTools';

/**
 * The Mázindarán forest road, autumn 1848, at true scale. The road comes in
 * from Bárfurúsh in the west, crosses a stream by a log bridge, passes the
 * companions' resting camp under the Black Standard, and runs east to the
 * shrine of Shaykh Ṭabarsí, whose dome shows through the trees to the
 * north-east. A woodcutter's clearing lies to the north-west; rice paddies
 * and a washing place by the stream to the south-west.
 *
 * Districts (x runs east, y runs south):
 * - The road, two cells wide: in at (0, 22..23), east along y 19..20, over
 *   the bridge (x 21..24), north up x 31..32, east along y 15..16, north up
 *   x 39..40 and out east at (47, 12..13).
 * - The stream x 20..25, bending west as it runs south.
 * - The woodcutter's clearing x 3..17, y 2..15: his cottage at x 6..10,
 *   y 4..7; a track down x 12..13 to the road.
 * - The companions' camp x 33..42, y 18..28, south of the road.
 * - The paddies x 2..14, y 27..37, the washing bank x 17..19, y 28..33.
 * - The shrine glimpsed at x 40..45, y 1..6.
 */

const W = 48;
const H = 40;

const ROAD = widen(traceRoute([
  [0, 22], [8, 22], [8, 19], [30, 19], [31, 19], [31, 15], [39, 15], [39, 12], [47, 12],
]));
const CLEARING_TRACK = widen(traceRoute([[12, 19], [12, 12]]));
const STREAM_SPUR = traceRoute([[16, 21], [16, 31], [18, 31]]);
const DIKE = traceRoute([[9, 24], [9, 38]]);
const PATHS: Cell[] = [...ROAD, ...CLEARING_TRACK, ...STREAM_SPUR, ...DIKE];

/** The stream's west column for each row: two cells wide, it bends west below the bridge. */
function streamX(y: number): number {
  if (y <= 8) return 25;
  if (y <= 15) return 24;
  if (y <= 24) return 22;
  if (y <= 32) return 20;
  return 21;
}
const BRIDGE = { x: 21, y: 19 } as const;
const PADDY_ROWS = [28, 31, 34, 37];

const blocking = (texture: string, cells: readonly Cell[]): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: readonly Cell[]): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const HAND_DECOR: DecorSpec[] = [
  // The woodcutter's clearing: his stack, the stumps of his trade, the logs waiting.
  ...blocking('ch8-woodpile', [[11, 5], [12, 5]]),
  ...blocking('ch8-stump', [[15, 4], [5, 11], [15, 9], [9, 13]]),
  ...blocking('ch8-log', [[14, 6], [4, 9]]),
  ...blocking('crates', [[5, 8]]),
  ...loose('ch8-fern', [[16, 7], [3, 13], [10, 10], [16, 13]]),
  // The companions' resting camp.
  ...blocking('ch8-campfire', [[36, 24]]),
  ...loose('rug', [[34, 23], [38, 25], [36, 26], [34, 25]]),
  ...blocking('crates', [[41, 21]]),
  ...blocking('ch9-cloth-bundle', [[41, 22]]),
  // Stream banks.
  ...blocking('ch8-mossy-rock', [[26, 8], [19, 25]]),
  ...loose('ch8-fern', [[19, 34], [23, 28], [26, 12]]),
  // Paddy edge.
  ...loose('ch8-fern', [[1, 27], [15, 36]]),
];

const PEOPLE: Cell[] = [[34, 21], [37, 21], [32, 25], [12, 9], [18, 30], [43, 15]];

/** Where no tall tree may stand: in front of the people and places, and in front of the road itself. */
function roadView(watched: readonly Cell[]): CellSet {
  const open = sightlines(watched, 24, 5, W, H);
  const along = sightlines(ROAD.filter((_, i) => i % 6 === 0), 20, 2, W, H);
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) if (along.has(x, y)) open.add(x, y);
  return open;
}

function forestDecor(): DecorSpec[] {
  const clear = new CellSet(PATHS);
  clear.addRect(3, 2, 15, 14); // woodcutter's clearing
  clear.addRect(33, 18, 10, 11); // camp
  clear.addRect(39, 0, 8, 8); // shrine glimpse
  clear.addRect(1, 26, 15, 13); // paddies and dikes
  clear.addRect(17, 28, 3, 6); // washing bank
  clear.addRect(BRIDGE.x - 1, BRIDGE.y - 1, 6, 4);
  for (let y = 0; y < H; y += 1) { clear.add(streamX(y), y); clear.add(streamX(y) + 1, y); }
  for (const item of HAND_DECOR) clear.add(item.gridX, item.gridY);
  clear.addWithNeighbours(PEOPLE);
  const verge = new CellSet();
  verge.addWithNeighbours(ROAD);
  // Keep the crowns off the people, the bridge, the camp and the shrine's dome.
  const watched: Cell[] = [...PEOPLE, [22, 19], [36, 24], [8, 6], [43, 4], [46, 12]];
  return scatterWoodland({
    width: W,
    height: H,
    seed: 1848,
    palette: MAZINDARAN_WOODS,
    clear,
    verge,
    open: roadView(watched),
    treeDensity: 0.3,
    spacing: 3,
    density: 0.16,
    coverDensity: 0.2,
  });
}

export const ch8ForestRoadMap: MapDefinition = {
  key: 'Ch8ForestRoad',
  title: 'The Forest of Mázindarán',
  width: W,
  height: H,
  spawn: { x: 1, y: 22 },
  build: ({ paintRect, paintPath, setTile, block, unblock }) => {
    // Trampled clearings.
    paintRect(3, 2, 15, 14, 'grass');
    paintRect(6, 8, 9, 5, 'sand');
    paintRect(33, 19, 10, 9, 'sand');
    paintRect(34, 21, 6, 6, 'grass');

    // Rice paddies, flooded between grass dikes.
    for (const y of PADDY_ROWS) {
      for (let x = 2; x <= 14; x += 1) {
        if (x === 9) continue;
        setTile(x, y, 'water'); block(x, y);
        setTile(x, y + 1, 'water'); block(x, y + 1);
      }
    }

    // The stream, with sandy banks at the washing place.
    for (let y = 0; y < H; y += 1) {
      for (const x of [streamX(y), streamX(y) + 1]) { setTile(x, y, 'water'); block(x, y); }
    }
    paintRect(17, 28, 3, 6, 'sand');
    setTile(26, 7, 'sand'); setTile(26, 13, 'sand'); setTile(24, 22, 'sand');

    // The road stops at the banks; the bridge carries it over the water.
    paintPath(PATHS.filter(([x, y]) => x !== streamX(y) && x !== streamX(y) + 1));
    for (let dy = 0; dy < 2; dy += 1) for (let dx = 0; dx < 4; dx += 1) unblock(BRIDGE.x + dx, BRIDGE.y + dy);
  },
  buildings: [
    { gridX: 6, gridY: 4, w: 5, h: 4, texture: 'ch8-woodcutter-house' },
    { gridX: 39, gridY: 25, w: 2, h: 2, texture: 'ch8-lean-to' },
    { gridX: 40, gridY: 1, w: 6, h: 6, texture: 'ch8-shrine-glimpse' },
    { gridX: BRIDGE.x, gridY: BRIDGE.y, w: 4, h: 2, texture: 'ch8-log-bridge', blocks: false },
  ],
  decor: [...forestDecor(), ...HAND_DECOR],
  npcs: [
    { gridX: 34, gridY: 21, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch8-mh-forest',
      present: f => !f.ch8JoinedColumn },
    { gridX: 37, gridY: 21, texture: 'ch8-black-standard',
      prompt: 'Stand beneath the Black Standard  [E]',
      dialogue: 'ch8-standard-forest',
      present: f => !f.ch8JoinedColumn },
    { gridX: 32, gridY: 25, texture: 'ch8-young-companion',
      prompt: 'Speak with the Young Companion  [E]',
      dialogue: 'ch8-youth-forest',
      // He lingers at the camp until met; then he is found digging at the fort.
      present: f => !f.ch8MetYoungCompanion && !f.ch8QuddusArrived },
    { gridX: 12, gridY: 9, texture: 'ch8-woodcutter',
      prompt: 'Speak with the Woodcutter  [E]',
      dialogue: 'ch8-woodcutter-siege',
      gate: { when: f => !!f.ch8MullaHusaynFell, lockedDialogue: 'ch8-woodcutter' } },
    { gridX: 18, gridY: 30, texture: 'ch8-village-woman',
      prompt: 'Speak with the Village Woman  [E]',
      dialogue: 'ch8-village-woman' },
    { gridX: 43, gridY: 15, texture: 'ch8-conscript',
      prompt: 'Speak with the Conscript  [E]',
      dialogue: 'ch8-conscript',
      present: f => !!f.ch8MullaHusaynFell },
  ],
  exits: [12, 13].map(fromY => ({
    fromX: W - 1, fromY, dx: 1, dy: 0,
    targetScene: 'Ch8TabarsiFort', targetSpawnX: 1, targetSpawnY: 19,
    label: '→ On to the shrine of Shaykh Ṭabarsí',
    requires: f => !!f.ch8JoinedColumn,
    lockedLabel: 'Find Mullá Ḥusayn at the camp before going on',
  })),
  ambience: {
    wash: { color: 0x90a89a, alpha: 0.34 },
    lights: [
      { gridX: 36, gridY: 24, radius: 160, color: 0xffa040, intensity: 0.6 },
    ],
    particles: 'leaves', music: 'forest',
    vignette: 0.6,
  },
};
