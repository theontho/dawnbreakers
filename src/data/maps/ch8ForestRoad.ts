import type { DecorSpec, MapDefinition } from './types';
import { CellSet, MAZINDARAN_WOODS, scatterWoodland, traceRoute, type Cell } from './ch8MapTools';

/**
 * The Mázindarán forest road, autumn 1848. The road comes in from Bárfurúsh
 * in the west, crosses a stream by a log bridge, passes the companions'
 * resting camp under the Black Standard, and runs east to the shrine of
 * Shaykh Ṭabarsí. A woodcutter's clearing lies to the north; rice paddies
 * and a washing place to the south.
 */

const W = 32;
const H = 26;

const ROAD = traceRoute([
  [0, 14], [4, 14], [4, 12], [9, 12], [9, 13], [13, 13], [17, 13],
  [20, 13], [20, 11], [25, 11], [25, 9], [31, 9],
]);
const CLEARING_SPUR = traceRoute([[7, 11], [7, 7]]);
const STREAM_SPUR = traceRoute([[11, 14], [11, 21], [12, 21]]);
const DIKE = traceRoute([[9, 18], [9, 24]]);
const DIKE_LINK = traceRoute([[10, 21], [10, 21]]);
const PATHS: Cell[] = [...ROAD, ...CLEARING_SPUR, ...STREAM_SPUR, ...DIKE, ...DIKE_LINK];

/** Stream column for each row: it bends west below the bridge. */
function streamX(y: number): number {
  if (y <= 4) return 17;
  if (y <= 9) return 16;
  if (y <= 17) return 15;
  if (y <= 23) return 14;
  return 15;
}

const PADDY_ROWS = [19, 21, 23];

const HAND_DECOR: DecorSpec[] = [
  // Woodcutter's clearing
  { gridX: 7, gridY: 3, texture: 'ch8-woodpile', blocks: true },
  { gridX: 9, gridY: 4, texture: 'ch8-stump', blocks: true },
  { gridX: 11, gridY: 7, texture: 'ch8-stump', blocks: true },
  { gridX: 4, gridY: 7, texture: 'ch8-stump', blocks: true },
  { gridX: 11, gridY: 3, texture: 'ch8-log', blocks: true },
  { gridX: 3, gridY: 5, texture: 'crates', blocks: true },
  { gridX: 10, gridY: 5, texture: 'ch8-fern' },
  { gridX: 5, gridY: 8, texture: 'ch8-fern' },
  // The companions' resting camp
  { gridX: 21, gridY: 16, texture: 'ch8-campfire', blocks: true },
  { gridX: 19, gridY: 15, texture: 'rug' },
  { gridX: 23, gridY: 17, texture: 'rug' },
  { gridX: 21, gridY: 18, texture: 'rug' },
  { gridX: 25, gridY: 15, texture: 'crates', blocks: true },
  { gridX: 25, gridY: 16, texture: 'ch9-cloth-bundle', blocks: true },
  // Stream banks
  { gridX: 16, gridY: 7, texture: 'ch8-mossy-rock', blocks: true },
  { gridX: 13, gridY: 16, texture: 'ch8-mossy-rock', blocks: true },
  { gridX: 13, gridY: 23, texture: 'ch8-fern' },
  { gridX: 15, gridY: 20, texture: 'ch8-fern' },
  // Paddy edge
  { gridX: 1, gridY: 18, texture: 'ch8-fern' },
  { gridX: 8, gridY: 25, texture: 'ch8-fern' },
];

const HAND_BUILDINGS = [
  { gridX: 4, gridY: 3, w: 2, h: 2, texture: 'house' },
  { gridX: 24, gridY: 18, w: 1, h: 1, texture: 'ch8-lean-to' },
  { gridX: 27, gridY: 2, w: 2, h: 2, texture: 'ch8-shrine-glimpse' },
];

const PEOPLE: Cell[] = [[22, 12], [23, 14], [19, 17], [8, 6], [13, 21], [28, 10]];

function forestDecor(): DecorSpec[] {
  const clear = new CellSet(PATHS);
  clear.addRect(3, 2, 10, 8); // woodcutter's clearing
  clear.addRect(18, 12, 8, 8); // camp
  clear.addRect(26, 1, 4, 4); // shrine glimpse
  clear.addRect(1, 18, 8, 8); // paddies and dikes
  clear.addRect(12, 19, 2, 5); // washing bank
  for (let y = 0; y < H; y += 1) clear.add(streamX(y), y);
  for (const item of HAND_DECOR) clear.add(item.gridX, item.gridY);
  clear.addWithNeighbours(PEOPLE);
  const verge = new CellSet();
  verge.addWithNeighbours(ROAD);
  return scatterWoodland({
    width: W,
    height: H,
    seed: 1848,
    palette: MAZINDARAN_WOODS,
    clear,
    verge,
    density: 0.5,
    coverDensity: 0.22,
    densityAt: (x, y) => (x === 0 || y === 0 || x === W - 1 || y === H - 1 ? 0.8 : 0.5),
  });
}

export const ch8ForestRoadMap: MapDefinition = {
  key: 'Ch8ForestRoad',
  title: 'The Forest of Mázindarán',
  width: W,
  height: H,
  spawn: { x: 1, y: 14 },
  build: ({ paintRect, paintPath, setTile, block, unblock }) => {
    // Trampled clearings
    paintRect(3, 2, 10, 8, 'grass');
    paintRect(5, 5, 5, 3, 'sand');
    paintRect(18, 13, 8, 6, 'sand');
    paintRect(19, 14, 5, 4, 'grass');

    // Rice paddies, flooded between grass dikes
    for (const y of PADDY_ROWS) {
      for (let x = 2; x <= 8; x += 1) { setTile(x, y, 'water'); block(x, y); }
    }

    // The stream, with sandy banks at the washing place
    for (let y = 0; y < H; y += 1) {
      const x = streamX(y);
      setTile(x, y, 'water');
      block(x, y);
    }
    paintRect(13, 19, 1, 5, 'sand');
    setTile(16, 6, 'sand'); setTile(14, 11, 'sand'); setTile(16, 15, 'sand');

    paintPath(PATHS);
    // Log bridge over the stream on the road
    unblock(15, 13);
  },
  buildings: [
    ...HAND_BUILDINGS,
    { gridX: 14, gridY: 13, w: 3, h: 1, texture: 'ch8-log-bridge', blocks: false },
  ],
  decor: [...forestDecor(), ...HAND_DECOR],
  npcs: [
    { gridX: 22, gridY: 12, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch8-mh-forest',
      present: f => !f.ch8JoinedColumn },
    { gridX: 23, gridY: 14, texture: 'ch8-black-standard',
      prompt: 'Stand beneath the Black Standard  [E]',
      dialogue: 'ch8-standard-forest',
      present: f => !f.ch8JoinedColumn },
    { gridX: 19, gridY: 17, texture: 'ch8-young-companion',
      prompt: 'Speak with the Young Companion  [E]',
      dialogue: 'ch8-youth-forest',
      // He lingers at the camp until met; then he is found digging at the fort.
      present: f => !f.ch8MetYoungCompanion && !f.ch8QuddusArrived },
    { gridX: 8, gridY: 6, texture: 'ch8-woodcutter',
      prompt: 'Speak with the Woodcutter  [E]',
      dialogue: 'ch8-woodcutter-siege',
      gate: { when: f => !!f.ch8MullaHusaynFell, lockedDialogue: 'ch8-woodcutter' } },
    { gridX: 13, gridY: 21, texture: 'ch8-village-woman',
      prompt: 'Speak with the Village Woman  [E]',
      dialogue: 'ch8-village-woman' },
    { gridX: 28, gridY: 10, texture: 'ch8-conscript',
      prompt: 'Speak with the Conscript  [E]',
      dialogue: 'ch8-conscript',
      present: f => !!f.ch8MullaHusaynFell },
  ],
  exits: [
    { fromX: 31, fromY: 9, dx: 1, dy: 0,
      targetScene: 'Ch8TabarsiFort', targetSpawnX: 1, targetSpawnY: 13,
      label: '→ On to the shrine of Shaykh Ṭabarsí',
      requires: f => !!f.ch8JoinedColumn,
      lockedLabel: 'Find Mullá Ḥusayn at the camp before going on' },
  ],
  ambience: {
    wash: { color: 0x90a89a, alpha: 0.34 },
    lights: [
      { gridX: 21, gridY: 16, radius: 120, color: 0xffa040, intensity: 0.6 },
    ],
    particles: 'leaves', music: 'forest',
    vignette: 0.6,
  },
};
