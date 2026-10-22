import type { DecorSpec, MapDefinition, NpcSpec } from './types';
import { CellSet, MAZINDARAN_WOODS, scatterWoodland, sightlines, traceRoute, widen, type Cell } from './ch8MapTools';
import { has, not, villageRounds } from './nurPhases';

/**
 * Tákur in the district of Núr, Mázindarán, autumn 1844, at true scale: a
 * village in a green fold of the hills, timber houses under steep gables,
 * oak and alder on the slopes, a stream down from the mountains. Above the
 * village stands the house of the late Vazír, Mírzá Buzurg, half of it
 * long since carried away by a flood; its owner has come home to Núr and
 * gone down again to His winter quarters. The player hears from the
 * villagers how the district received Him, sees the mujtahid's envoys ride
 * after Him, and hears what befell them.
 *
 * Districts (x runs east, y runs south):
 * - The house of the Vazír x 15..23, y 3..8, its forecourt y 9..12; the
 *   flood's footings x 24..28, y 3..8.
 * - The road up from the south, x 19..20, y 13..33 (exit at the south
 *   edge, back over the mountains to Ṭihrán).
 * - Village houses west (x 3..7, y 10..13 and y 19..22) and east of the road
 *   (x 24..28, y 18..21), a track over the stream to the east.
 * - The valley floor x 2..30, y 13..31: meadow, two fields (x 3..10 and
 *   x 23..29, y 26..31), a few old trees.
 * - The stream x 32..35, a log bridge at y 25.
 */

const W = 40;
const H = 34;
const MANSION = { gridX: 15, gridY: 3, w: 9, h: 6 } as const;
const HOUSE_STEP = { x: 18, y: 9 } as const;
const BRIDGE = { x: 32, y: 25 } as const;

const ROAD = widen(traceRoute([[19, 33], [19, 11]]));
const TRACKS: Cell[] = [
  ...traceRoute([[19, 15], [9, 15], [9, 14]]),
  ...traceRoute([[19, 24], [10, 24], [10, 23]]),
  ...traceRoute([[21, 23], [26, 23], [26, 22]]),
  ...traceRoute([[21, 26], [37, 26]]),
  ...traceRoute([[14, 11], [25, 11]]),
];
const PATHS: Cell[] = [...ROAD, ...TRACKS];
const streamX = (y: number) => (y < 12 ? 34 : y < 22 ? 33 : 32 + (y % 3 === 0 ? 1 : 0));

const blocking = (texture: string, cells: readonly Cell[]): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));

const HAND_DECOR: DecorSpec[] = [
  // What the flood left of the Vazír's other half.
  ...blocking('nur-flood-footings', [[24, 4], [25, 5], [24, 7], [26, 7], [27, 4]]),
  // The village: a bread oven, wood stacked for winter, jars at the doors.
  ...blocking('zanjan-tanur', [[10, 13]]),
  ...blocking('ch8-woodpile', [[2, 15], [29, 20], [3, 23]]),
  ...blocking('ch9-water-jar', [[12, 22], [23, 21]]),
  ...blocking('crates', [[25, 13]]),
  { gridX: 13, gridY: 10, texture: 'rug' },
  { gridX: 26, gridY: 11, texture: 'ch8-stump', blocks: true },
  // A few old trees left standing on the valley floor.
  ...blocking('ch8-alder', [[14, 19], [28, 15]]),
  ...blocking('ch8-oak', [[13, 29], [16, 28]]),
  ...blocking('ch8-mossy-rock', [[16, 23], [24, 30]]),
];

/** Villagers going up to the house when the news of the envoys spreads. */
const FLOCKING: DecorSpec[] = [[19, 29], [20, 27], [19, 21], [20, 17], [16, 12], [22, 12]]
  .map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd', blocks: true, present: has('nurHeardGroom') }));

const PEOPLE: Cell[] = [[8, 15], [13, 11], [18, 13], [21, 13], [24, 13], [HOUSE_STEP.x, HOUSE_STEP.y]];

function woods(): DecorSpec[] {
  const clear = new CellSet(PATHS);
  clear.addRect(MANSION.gridX - 2, MANSION.gridY - 1, MANSION.w + 15, MANSION.h + 5);
  clear.addRect(2, 9, 11, 7);
  clear.addRect(2, 18, 12, 7);
  clear.addRect(22, 17, 9, 6);
  clear.addRect(BRIDGE.x - 1, BRIDGE.y - 1, 6, 4);
  // The valley floor: meadow, the village's two fields, and the orchard trees by hand.
  clear.addRect(2, 13, 29, 19);
  for (let y = 0; y < H; y += 1) { clear.add(streamX(y), y); clear.add(streamX(y) + 1, y); }
  for (const item of HAND_DECOR) clear.add(item.gridX, item.gridY);
  for (const item of FLOCKING) clear.add(item.gridX, item.gridY);
  clear.addWithNeighbours(PEOPLE);
  const verge = new CellSet();
  verge.addWithNeighbours(PATHS);
  return scatterWoodland({
    width: W, height: H, seed: 1260, palette: MAZINDARAN_WOODS,
    // The tallest oaks stand 34 rows high on the screen: none of them in front of anyone.
    clear, verge, open: sightlines([...PEOPLE, [19, 6]], 34, 5, W, H),
    treeDensity: 0.32, spacing: 3, density: 0.12, coverDensity: 0.25,
  });
}

const npcs: NpcSpec[] = [
  { gridX: 8, gridY: 15, texture: 'nur-woman',
    prompt: 'Speak with the Village Woman  [E]',
    dialogue: 'nur-woman' },
  { gridX: 13, gridY: 11, texture: 'nur-elder',
    prompt: 'Speak with the Village Elder  [E]',
    dialogue: 'nur-elder',
    gate: { when: not('nurHeardGroom'), lockedDialogue: 'nur-elder-saadat' } },
  { gridX: 18, gridY: 13, texture: 'nur-abbas',
    prompt: 'Speak with Mullá ʿAbbás  [E]',
    dialogue: 'nur-envoys',
    present: f => villageRounds(f) >= 2 && !f.nurEnvoysSent },
  { gridX: 21, gridY: 13, texture: 'nur-abul-qasim',
    prompt: 'Speak with Mírzá Abu\'l-Qásim  [E]',
    dialogue: 'nur-abul-qasim',
    present: f => villageRounds(f) >= 2 && !f.nurEnvoysSent },
  { gridX: 24, gridY: 13, texture: 'nur-groom',
    prompt: 'Speak with the Groom  [E]',
    dialogue: 'nur-groom',
    present: has('nurEnvoysSent') },
  { gridX: HOUSE_STEP.x, gridY: HOUSE_STEP.y, texture: 'ch2-swept-threshold',
    prompt: 'Stand at the door of the Vazír\'s house  [E]',
    dialogue: 'nur-house-takur',
    gate: { when: has('nurHeardGroom'), lockedDialogue: 'nur-house-takur-shut' } },
];

export const nurTakurMap: MapDefinition = {
  key: 'NurTakur',
  title: 'Núr, the Village of Tákur',
  width: W,
  height: H,
  spawn: { x: 19, y: H - 2 },
  build: ({ paintRect, paintPath, setTile, block, unblock }) => {
    // Trodden ground before the house and the village doors.
    paintRect(14, 9, 12, 4, 'sand');
    paintRect(4, 13, 7, 2, 'sand');
    // Two fields turned for the winter sowing.
    paintRect(3, 26, 8, 5, 'sand');
    paintRect(23, 27, 7, 4, 'sand');
    for (let y = 0; y < H; y += 1) {
      for (const x of [streamX(y), streamX(y) + 1]) { setTile(x, y, 'water'); block(x, y); }
    }
    paintPath(PATHS.filter(([x, y]) => x !== streamX(y) && x !== streamX(y) + 1));
    for (let dy = 0; dy < 2; dy += 1) for (let dx = 0; dx < 4; dx += 1) unblock(BRIDGE.x + dx, BRIDGE.y + dy);
  },
  buildings: [
    { ...MANSION, texture: 'nur-takur-mansion' },
    { gridX: 3, gridY: 10, w: 5, h: 4, texture: 'ch8-woodcutter-house' },
    { gridX: 4, gridY: 19, w: 5, h: 4, texture: 'ch8-woodcutter-house' },
    { gridX: 24, gridY: 18, w: 5, h: 4, texture: 'ch8-woodcutter-house' },
    { gridX: BRIDGE.x, gridY: BRIDGE.y, w: 4, h: 2, texture: 'ch8-log-bridge', blocks: false },
  ],
  decor: [...woods(), ...HAND_DECOR, ...FLOCKING],
  npcs,
  exits: [19, 20].map(fromX => ({
    fromX, fromY: H - 1, dx: 0, dy: 1,
    targetScene: 'NurLane', targetSpawnX: fromX + 11, targetSpawnY: 1,
    label: '↓ Back over the mountains to Ṭihrán',
  })),
  // Autumn rain in the hills; when the district wakes to the news, the rain lifts.
  ambience: f => f.nurHeardGroom
    ? { wash: { color: 0xc8b088, alpha: 0.22 }, particles: 'leaves', vignette: 0.55, music: 'hope', sound: ['river', 'birds'] }
    : { wash: { color: 0x7a8c88, alpha: 0.3 }, particles: 'rain', vignette: 0.6, music: 'forest', sound: ['rain', 'river'] },
};
