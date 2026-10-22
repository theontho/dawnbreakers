import type { DecorSpec, MapDefinition } from './types';

/**
 * Badasht, early summer 1848: the hamlet and the guests' camp.
 *
 * The road from Sháhrúd comes in from the west edge, past the village
 * houses and orchard, and crosses the stream on a plank bridge. East of the
 * stream the eighty-one guests have pitched their tents around a cookfire.
 * The steward who receives each guest stands where the lane turns north to
 * the three rented gardens (`Ch7BadashtCamp`).
 */

const W = 26;
const H = 24;

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

export const ch7BadashtHamletMap: MapDefinition = {
  key: 'Ch7BadashtHamlet',
  title: 'Badasht, the Hamlet',
  width: W,
  height: H,
  spawn: { x: 1, y: 12 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Summer meadow; the village yards and the camp ground are bare earth.
    paintRect(1, 2, 10, 7, 'sand');       // village yards
    paintRect(15, 8, 9, 7, 'sand');       // the guests' camp ground
    paintRect(2, 15, 9, 3, 'sand');       // the threshing floor

    // The stream, crossed by a plank bridge on the road.
    for (let y = 0; y < H; y += 1) {
      setTile(12, y, 'water');
      setTile(13, y, 'water');
      if (y !== 12) { block(12, y); block(13, y); }
    }

    // The road from Sháhrúd, over the stream, into the camp.
    paintPath([[0, 12], [1, 12], [2, 12], [3, 12], [4, 12], [5, 12], [6, 12], [7, 12], [8, 12], [9, 12],
      [10, 12], [11, 12], [14, 12], [15, 12], [16, 12], [17, 12], [18, 12], [19, 12], [20, 12]]);
    // North lane to the gardens.
    for (let y = 0; y < 12; y += 1) setTile(20, y, 'path');
    // Village lanes.
    paintPath([[5, 11], [5, 10], [5, 9], [5, 8], [5, 7], [5, 6], [4, 6], [3, 6], [6, 6], [7, 6], [8, 6], [9, 6]]);
    paintPath([[6, 13], [6, 14], [6, 15], [6, 16], [6, 17], [6, 18], [6, 19], [6, 20], [6, 21]]);
    // Camp paths between the tents.
    paintPath([[17, 13], [17, 14], [17, 15], [17, 16], [17, 17], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18], [22, 18]]);
  },
  buildings: [
    // The village of Badasht.
    { gridX: 2, gridY: 3, w: 2, h: 2, texture: 'house' },
    { gridX: 7, gridY: 3, w: 2, h: 2, texture: 'house' },
    { gridX: 2, gridY: 8, w: 2, h: 2, texture: 'house' },
    { gridX: 8, gridY: 8, w: 2, h: 2, texture: 'house' },
    { gridX: 8, gridY: 15, w: 2, h: 2, texture: 'house' },
    // The guests' tents east of the stream.
    { gridX: 19, gridY: 15, w: 3, h: 2, texture: 'ch7-tent-quddus' },
    { gridX: 15, gridY: 19, w: 3, h: 2, texture: 'ch7-tent-quddus' },
    { gridX: 20, gridY: 20, w: 3, h: 2, texture: 'ch7-tent-reconciliation' },
    { gridX: 22, gridY: 9, w: 3, h: 2, texture: 'ch7-tent-reconciliation' },
    { gridX: 15, gridY: 4, w: 3, h: 2, texture: 'ch7-tent-quddus' },
  ],
  decor: [
    // Poplars and willows along the stream.
    ...blocking('cypress', [[11, 1], [11, 5], [11, 9], [14, 2], [14, 7], [14, 16], [11, 15], [11, 19], [14, 22]]),
    ...blocking('ch5-river-reeds', [[11, 3], [14, 10], [11, 21], [14, 19], [11, 7]]),
    // The village: well, planters, a bread oven's woodpile, laundry, a sleeping dog's corner.
    ...blocking('well', [[4, 10]]),
    ...blocking('ch1-planter', [[4, 2], [9, 2], [1, 7]]),
    ...blocking('crates', [[10, 4], [1, 10]]),
    ...blocking('ch9-cloth-bundle', [[7, 9]]),
    ...loose('rug', [[7, 7], [3, 16]]),
    // The threshing floor and the orchard.
    ...blocking('ch9-rope-coils', [[2, 15]]),
    ...blocking('tree', [[2, 19], [4, 19], [8, 19], [2, 21], [4, 21], [8, 21], [3, 23], [7, 23], [9, 22], [1, 17]]),
    ...blocking('ch7-rosebush', [[10, 18], [10, 20]]),
    // Hedges and trees framing the meadow.
    ...blocking('tree', [[0, 0], [0, 4], [0, 15], [0, 22], [10, 0], [4, 0]]),
    // The guests' camp: cookfire, water jars, saddle bundles, lamps.
    ...blocking('ch7-cookfire', [[19, 9]]),
    ...blocking('crates', [[21, 8], [16, 9]]),
    ...blocking('ch9-cloth-bundle', [[15, 13], [23, 13], [18, 21]]),
    ...blocking('lamp', [[19, 13], [21, 2], [16, 17]]),
    ...loose('rug', [[18, 10], [20, 10], [22, 17], [16, 22]]),
    ...blocking('tree', [[24, 1], [25, 6], [24, 14], [25, 18], [24, 23], [18, 1], [22, 0], [16, 1]]),
    ...blocking('cypress', [[19, 1], [21, 0]]),
    ...blocking('ch7-rosebush', [[23, 6], [17, 7]]),
  ],
  npcs: [
    { gridX: 21, gridY: 3, texture: 'ch7-npc-steward',
      prompt: 'Speak with the Steward of the Gardens  [E]',
      dialogue: 'ch7-steward' },
    { gridX: 18, gridY: 9, texture: 'ch7-npc-cook',
      prompt: 'Speak with the Camp Cook  [E]',
      dialogue: 'ch7-cook' },
    { gridX: 16, gridY: 13, texture: 'ch7-npc-khurasani',
      prompt: 'Speak with the Believer from Khurásán  [E]',
      dialogue: 'ch7-khurasani' },
    { gridX: 5, gridY: 20, texture: 'ch7-npc-villager',
      prompt: 'Speak with the Gardener of Badasht  [E]',
      dialogue: 'ch7-villager' },
  ],
  exits: [
    { fromX: 20, fromY: 0, dx: 0, dy: -1,
      targetScene: 'Ch7BadashtCamp', targetSpawnX: 13, targetSpawnY: 24,
      label: '↑ The lane to the three gardens',
      requires: f => !!f.ch7Arrived,
      lockedLabel: 'The gardens: the steward receives each guest first' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.26 },
    lights: [
      { gridX: 19, gridY: 9, radius: 110, color: 0xffa050, intensity: 0.6 },
    ],
    particles: 'motes', music: 'garden',
    vignette: 0.45,
  },
};
