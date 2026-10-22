import type { DecorSpec, MapDefinition } from './types';

/**
 * Badasht, early summer 1848, at true scale: the hamlet and the guests' camp.
 *
 * The road from Sháhrúd comes in from the west edge, past the village
 * houses, and crosses the stream on a plank bridge. East of the stream the
 * eighty-one guests have pitched their tents around a cookfire. The steward
 * who receives each guest stands where the lane turns north to the three
 * rented gardens (`Ch7BadashtCamp`). South of the village are the threshing
 * floor and the orchard, where the gardener minds his melons under the
 * apricot trees.
 *
 * Districts (x runs east, y runs south):
 * - The road: rows 17..18 from the west edge (0, 18) to the lane, bridged
 *   over the stream at x 19..20.
 * - The village: x 1..17, y 1..15, five mud-brick houses round a lane
 *   (x 8..9) and a cross-lane (y 7), the well where the lane meets the road.
 * - The threshing floor: x 2..9, y 21..25; the orchard: x 1..17, y 27..35.
 * - The stream: x 19..20, north to south, poplars along its banks.
 * - The camp: x 22..39, y 8..32, five pavilions round the cookfire at
 *   (29, 15); the lane to the gardens runs north at x 31..32 to (31, 0).
 */

const W = 40;
const H = 36;
const STREAM_X = [19, 20] as const;
const ROAD_Y = [17, 18] as const;
const VILLAGE_LANE_X = 8;
const GARDEN_LANE_X = 31;
const FIRE = { x: 29, y: 15 } as const;

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

/** The village: its well, planters, a bread oven's woodpile, laundry and rugs airing. */
const VILLAGE: DecorSpec[] = [
  ...blocking('well', [[10, 15]]),
  ...blocking('ch1-planter', [[7, 2], [16, 8], [1, 13]]),
  ...blocking('crates', [[16, 4], [7, 12]]),
  ...blocking('ch9-cloth-bundle', [[10, 8], [1, 6]]),
  ...loose('rug', [[11, 7], [4, 7], [12, 15]]),
  ...blocking('plane-tree', [[0, 0], [16, 1], [0, 15]]),
  ...blocking('orange-tree', [[1, 8], [17, 14]]),
];

/** The threshing floor and the orchard south of the road. */
const FIELDS: DecorSpec[] = [
  ...blocking('ch9-rope-coils', [[3, 22]]),
  ...blocking('ch9-cloth-bundle', [[6, 24]]),
  ...loose('rug', [[5, 23], [6, 23]]),
  ...blocking('orange-tree', [
    [2, 28], [5, 28], [11, 28], [14, 28], [3, 31], [6, 31], [12, 31], [15, 31],
    [2, 34], [5, 34], [11, 34], [14, 34], [17, 33],
  ]),
  ...blocking('ch7-rosebush', [[17, 27], [17, 30], [10, 26]]),
  ...blocking('plane-tree', [[0, 20], [1, 26]]),
];

/** Poplars and reeds along both banks of the stream. */
const STREAM_BANKS: DecorSpec[] = [
  ...blocking('cypress-tall', [[18, 2], [18, 9], [21, 4], [21, 12], [18, 23], [21, 22], [18, 32], [21, 30]]),
  ...blocking('ch5-river-reeds', [[18, 5], [21, 8], [18, 27], [21, 26], [18, 14], [21, 34]]),
];

/** The guests' camp: cookfire, water jars, saddle bundles, lamps, and the lane's trees. */
const CAMP: DecorSpec[] = [
  ...blocking('ch7-cookfire', [[FIRE.x, FIRE.y]]),
  ...blocking('crates', [[36, 15], [23, 14]]),
  ...blocking('ch9-cloth-bundle', [[24, 19], [37, 19], [32, 25]]),
  ...blocking('lamp', [[30, 19], [33, 6], [27, 20], [32, 27]]),
  ...loose('rug', [[30, 14], [28, 16], [30, 16], [36, 20], [26, 27]]),
  ...blocking('ch7-rosebush', [[33, 3], [28, 7], [34, 14]]),
  ...blocking('plane-tree', [[26, 2], [37, 3], [24, 30]]),
  ...blocking('cypress-tall', [[29, 1], [34, 1]]),
  ...blocking('orange-tree', [[38, 16], [38, 30], [36, 33], [27, 33], [23, 1]]),
];

export const ch7BadashtHamletMap: MapDefinition = {
  key: 'Ch7BadashtHamlet',
  title: 'Badasht, the Hamlet',
  width: W,
  height: H,
  trueScale: true,
  spawn: { x: 1, y: 18 },
  build: ({ paintRect, setTile, block }) => {
    // Summer meadow; the village yards, the threshing floor and the camp ground are bare earth.
    paintRect(1, 1, 17, 15, 'sand');
    paintRect(2, 21, 8, 5, 'sand');
    paintRect(22, 8, 17, 22, 'sand');

    // The stream, crossed by a plank bridge on the road.
    for (let y = 0; y < H; y += 1) {
      for (const x of STREAM_X) {
        setTile(x, y, 'water');
        if (!(ROAD_Y as readonly number[]).includes(y)) block(x, y);
      }
    }

    // The road from Sháhrúd, over the stream, into the camp.
    for (let x = 0; x <= GARDEN_LANE_X + 1; x += 1) {
      for (const y of ROAD_Y) if (!(STREAM_X as readonly number[]).includes(x)) setTile(x, y, 'path');
    }
    // North lane to the gardens.
    for (let y = 0; y < ROAD_Y[0]; y += 1) { setTile(GARDEN_LANE_X, y, 'path'); setTile(GARDEN_LANE_X + 1, y, 'path'); }
    // Village lanes, and the track south to the threshing floor and orchard.
    for (let y = 1; y < ROAD_Y[0]; y += 1) { setTile(VILLAGE_LANE_X, y, 'path'); setTile(VILLAGE_LANE_X + 1, y, 'path'); }
    for (let x = 1; x < 18; x += 1) setTile(x, 7, 'path');
    for (let y = ROAD_Y[1] + 1; y < 34; y += 1) setTile(VILLAGE_LANE_X, y, 'path');
    // Camp paths between the tents.
    for (let y = ROAD_Y[1] + 1; y < 28; y += 1) setTile(29, y, 'path');
    for (let x = 24; x < 34; x += 1) setTile(x, 26, 'path');
    for (let y = 13; y < ROAD_Y[0]; y += 1) setTile(26, y, 'path');
  },
  buildings: [
    // The village of Badasht.
    { gridX: 2, gridY: 2, w: 5, h: 4, texture: 'town-house-small' },
    { gridX: 10, gridY: 2, w: 5, h: 4, texture: 'town-house-small' },
    { gridX: 2, gridY: 9, w: 5, h: 4, texture: 'town-house-small' },
    { gridX: 11, gridY: 10, w: 5, h: 4, texture: 'town-house-small' },
    { gridX: 11, gridY: 21, w: 5, h: 4, texture: 'town-house-small' },
    // The guests' pavilions east of the stream.
    { gridX: 24, gridY: 10, w: 4, h: 3, texture: 'ch7-tent-quddus' },
    { gridX: 34, gridY: 8, w: 5, h: 4, texture: 'ch7-tent-reconciliation' },
    { gridX: 24, gridY: 22, w: 4, h: 3, texture: 'ch7-tent-quddus' },
    { gridX: 33, gridY: 21, w: 5, h: 4, texture: 'ch7-tent-reconciliation' },
    { gridX: 28, gridY: 28, w: 4, h: 3, texture: 'ch7-tent-quddus' },
  ],
  decor: [...VILLAGE, ...FIELDS, ...STREAM_BANKS, ...CAMP, ...loose('ch6-footbridge', ROAD_Y.flatMap(y => STREAM_X.map(x => [x, y] as const)))],
  npcs: [
    { gridX: GARDEN_LANE_X - 1, gridY: 4, texture: 'ch7-npc-steward',
      prompt: 'Speak with the Steward of the Gardens  [E]',
      dialogue: 'ch7-steward' },
    { gridX: FIRE.x - 1, gridY: FIRE.y, texture: 'ch7-npc-cook',
      prompt: 'Speak with the Camp Cook  [E]',
      dialogue: 'ch7-cook' },
    { gridX: 25, gridY: 20, texture: 'ch7-npc-khurasani',
      prompt: 'Speak with the Believer from Khurásán  [E]',
      dialogue: 'ch7-khurasani' },
    { gridX: 9, gridY: 30, texture: 'ch7-npc-villager',
      prompt: 'Speak with the Gardener of Badasht  [E]',
      dialogue: 'ch7-villager' },
  ],
  exits: [
    { fromX: GARDEN_LANE_X, fromY: 0, dx: 0, dy: -1,
      targetScene: 'Ch7BadashtCamp', targetSpawnX: 18, targetSpawnY: 36,
      label: '↑ The lane to the three gardens',
      requires: f => !!f.ch7Arrived,
      lockedLabel: 'The gardens: the steward receives each guest first' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.26 },
    lights: [
      { gridX: FIRE.x, gridY: FIRE.y, radius: 150, color: 0xffa050, intensity: 0.6 },
    ],
    particles: 'motes', music: 'garden',
    vignette: 0.45,
  },
};
