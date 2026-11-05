import { gardensVisited } from '../dialogues_ch/chapter07_gardens';
import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Badasht, summer 1848, at true scale: the three gardens.
 *
 * Bahá'u'lláh rented three gardens for the conference: one for Quddús
 * (west), one for Ṭáhirih (east), one for Himself (north, astride the
 * stream). The meadow between them is where the eighty-one guests walk and
 * argue. The lane from the hamlet (`Ch7BadashtHamlet`) comes in at the south.
 *
 * Bahá'u'lláh is never on the map. His garden holds a lamplit tent whose
 * threshold the player may approach; His actions are told by the Narrator
 * and carried by a messenger. The tent is never entered.
 *
 * Districts (x runs east, y runs south):
 * - The stream: x 21..22, north to south, bridged at y 8 in the Host's
 *   garden and at y 24..25 on the cross-walk.
 * - The Host's garden: walls x 6..36, y 1..13, its gate at (18..19, 13).
 *   The assembly's paved court west of the stream (x 9..17, y 4..10); the
 *   blue tent east of it (x 27..31, y 3..6), its door at (29, 6).
 * - Quddús's garden: walls x 1..14, y 17..31, gate (14, 24..25). His
 *   pavilion at x 4..7, y 19..21 (door (6, 21)); the old pool south of it.
 * - Ṭáhirih's garden: walls x 27..40, y 17..31, gate (27, 24..25). The
 *   canopy at x 33..36, y 20..22 and the curtain before it at (34, 23).
 * - The meadow: between the gardens, the lane x 18..19 south to the
 *   hamlet at (18, 37); the keeper of names by the lane at y 33.
 */

const W = 42;
const H = 38;
const STREAM_X = [21, 22] as const;
const LANE_X = 18;
const CROSS_Y = [24, 25] as const;
const HOST_TENT = { x: 27, y: 3 } as const;
/** Quddús's pavilion; its door is on the front row of the middle cell (see art/pavilion.ts). */
const QUDDUS_TENT = { x: 4, y: 19 } as const;
const QUDDUS_DOOR = { x: QUDDUS_TENT.x + 2, y: QUDDUS_TENT.y + 2 } as const;

interface Walled { x0: number; y0: number; x1: number; y1: number; gates: ReadonlyArray<readonly [number, number]> }

const HOST: Walled = { x0: 6, y0: 1, x1: 36, y1: 13, gates: [[LANE_X, 13], [LANE_X + 1, 13]] };
const QUDDUS: Walled = { x0: 1, y0: 17, x1: 14, y1: 31, gates: CROSS_Y.map(y => [14, y] as const) };
const TAHIRIH: Walled = { x0: 27, y0: 17, x1: 40, y1: 31, gates: CROSS_Y.map(y => [27, y] as const) };

/** A garden's mud-brick wall, open at its gates and where the stream runs through. */
function gardenWall(g: Walled): DecorSpec[] {
  const gaps = [...g.gates, ...STREAM_X.flatMap(x => [[x, g.y0], [x, g.y1]] as const)];
  const w = 'ch7-garden-wall';
  return [
    ...wallRun(w, g.x0, g.y0, g.x1, g.y0, { gaps }),
    ...wallRun(w, g.x0, g.y1, g.x1, g.y1, { gaps }),
    ...wallRun(w, g.x0, g.y0 + 1, g.x0, g.y1 - 1, { gaps }),
    ...wallRun(w, g.x1, g.y0 + 1, g.x1, g.y1 - 1, { gaps }),
  ];
}

const blocking = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

/** Pomegranates in flower, the walled gardens' fruit trees (variant 2 of `fruit-tree`). */
const pomegranates = (cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'fruit-tree', variant: 2, blocks: true }));

/** The Host's garden: cypress along the water, lamps, the assembly's carpets, roses. */
const HOST_GARDEN: DecorSpec[] = [
  ...blocking('cypress', [[20, 3], [23, 3], [20, 11], [23, 11], [7, 2], [35, 2]]),
  ...blocking('plane-tree', [[8, 11], [26, 11]]),
  ...blocking('ch7-rosebush', [[8, 5], [8, 8], [12, 11], [16, 11], [25, 10], [33, 8], [33, 4], [25, 3]]),
  ...blocking('lamp', [[9, 3], [17, 3], [26, 7], [32, 7]]),
  ...blocking('crowd', [[10, 6], [16, 6]]),
  ...loose('rug', [[11, 5], [12, 5], [14, 5], [15, 5], [11, 9], [15, 9], [28, 8], [30, 8]]),
];

/** Quddús's garden: his pavilion, the old pool, roses and cypress. */
const QUDDUS_GARDEN: DecorSpec[] = [
  ...blocking('cypress', [[2, 18], [13, 18], [2, 30]]),
  ...pomegranates([[10, 19], [11, 28]]),
  ...blocking('ch7-rosebush', [[3, 23], [12, 22], [9, 29], [3, 26], [8, 22], [13, 30]]),
  ...blocking('lamp', [[3, 22], [9, 23]]),
  ...loose('rug', [[8, 25], [8, 26], [10, 26]]),
];

/** Ṭáhirih's garden: the canopy where she teaches, the best roses, a pool. */
const TAHIRIH_GARDEN: DecorSpec[] = [
  ...blocking('cypress', [[28, 18], [28, 30], [39, 24]]),
  // A younger cypress in the north-east corner, so the Host's tent shows over the wall behind it.
  { gridX: 39, gridY: 18, texture: 'cypress', variant: 2, blocks: true },
  ...pomegranates([[30, 20], [31, 29]]),
  ...blocking('ch7-rosebush', [[29, 22], [32, 23], [37, 23], [38, 21], [29, 27], [34, 29], [38, 27], [31, 26], [39, 30]]),
  ...blocking('lamp', [[38, 25]]),
  ...loose('rug', [[33, 25], [35, 25]]),
];

/** The meadow: orchard trees, reeds by the water, the names-keeper's desk, saddle bundles. */
const MEADOW: DecorSpec[] = [
  ...blocking('plane-tree-old', [[2, 0], [39, 0]]),
  ...blocking('plane-tree', [[3, 35]]),
  ...blocking('apricot-tree', [[1, 14], [11, 15], [16, 15], [25, 15], [30, 15], [40, 14], [7, 34], [11, 36], [29, 35], [34, 36], [38, 34]]),
  ...blocking('cypress', [[16, 21], [16, 28], [24, 21], [24, 28]]),
  ...blocking('ch5-river-reeds', [[23, 17], [20, 30], [23, 34], [20, 19]]),
  ...blocking('floor-writing-board', [[15, 33]]),
  ...blocking('lamp', [[17, 30], [20, 26], [23, 23], [17, 35]]),
  ...blocking('ch9-cloth-bundle', [[26, 34], [27, 33]]),
  ...loose('rug', [[16, 34], [25, 35]]),
];

export const ch7BadashtCampMap: MapDefinition = {
  key: 'Ch7BadashtCamp',
  title: 'Badasht, the Three Gardens',
  width: W,
  height: H,
  spawn: { x: LANE_X, y: H - 2 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // The paved court in the Host's garden where the friends assemble.
    paintRect(9, 4, 9, 7, 'stone');
    // Gravel walks: the Host's garden from its gate, over the stream, to the tent.
    for (let y = 8; y < 13; y += 1) { setTile(LANE_X, y, 'path'); setTile(LANE_X + 1, y, 'path'); }
    for (let x = 18; x < 30; x += 1) setTile(x, 8, 'path');
    paintPath([[29, 7]]);
    // Quddús's garden: from its gate to his door and round the pool.
    for (let x = 6; x < 14; x += 1) for (const y of CROSS_Y) setTile(x, y, 'path');
    for (let y = 22; y < 24; y += 1) setTile(QUDDUS_DOOR.x, y, 'path');
    // Ṭáhirih's garden: from its gate to the curtain.
    for (let x = 28; x < 37; x += 1) for (const y of CROSS_Y) setTile(x, y, 'path');
    paintPath([[34, 23]]);
    // The meadow: the lane north from the hamlet and the cross-walk between the side gardens.
    paintRect(11, 32, 18, 6, 'sand');
    for (let y = 14; y < H; y += 1) { setTile(LANE_X, y, 'path'); setTile(LANE_X + 1, y, 'path'); }
    for (let x = 15; x < 27; x += 1) for (const y of CROSS_Y) setTile(x, y, 'path');

    // The stream runs north to south through the Host's garden and the meadow; footbridges cross it.
    for (let y = 0; y < H; y += 1) {
      for (const x of STREAM_X) {
        setTile(x, y, 'water');
        if (y !== 8 && !(CROSS_Y as readonly number[]).includes(y)) block(x, y);
      }
    }
  },
  buildings: [
    { gridX: QUDDUS_TENT.x, gridY: QUDDUS_TENT.y, w: 4, h: 3, texture: 'ch7-tent-quddus' },
    { gridX: 33, gridY: 20, w: 4, h: 3, texture: 'ch7-garden-canopy' },
    { gridX: HOST_TENT.x, gridY: HOST_TENT.y, w: 5, h: 4, texture: 'ch7-tent-reconciliation' },
    // The old pool in Quddús's garden, and Ṭáhirih's.
    { gridX: 4, gridY: 26, w: 3, h: 3, texture: 'fountain-pool' },
    { gridX: 35, gridY: 26, w: 3, h: 3, texture: 'fountain-pool' },
  ],
  decor: [
    ...gardenWall(HOST),
    ...gardenWall(QUDDUS),
    ...gardenWall(TAHIRIH),
    ...loose('ch6-footbridge', [[21, 8], [22, 8], ...CROSS_Y.flatMap(y => STREAM_X.map(x => [x, y] as const))]),
    ...HOST_GARDEN,
    ...QUDDUS_GARDEN,
    ...TAHIRIH_GARDEN,
    ...MEADOW,
  ],
  npcs: [
    // The Host's garden: the threshold of the blue tent, a step out from its door so the tent leaves it in view.
    { gridX: HOST_TENT.x + 2, gridY: HOST_TENT.y + 5, texture: 'lamp',
      prompt: 'Approach the lamplit tent  [E]',
      dialogue: 'ch7-host-tent' },
    { gridX: 13, gridY: 7, texture: 'crowd',
      prompt: 'Join the assembly in the garden  [E]',
      dialogue: 'ch7-assembly',
      gate: { when: f => gardensVisited(f) >= 3, lockedDialogue: 'ch7-assembly-waiting' },
      present: f => !f.ch7WitnessedUnveiling },
    { gridX: 14, gridY: 8, texture: 'ch7-npc-tahirih',
      prompt: 'Speak with Ṭáhirih  [E]',
      dialogue: 'ch7-unveiling',
      present: f => !!f.ch7WitnessedUnveiling },
    { gridX: 32, gridY: 9, texture: 'ch7-npc-messenger',
      prompt: 'Speak with the Messenger at the Tent  [E]',
      dialogue: 'ch7-bahaullah-reconcile',
      gate: { when: f => !!f.ch7HeardTahirih && !!f.ch7QuddusAfter, lockedDialogue: 'ch7-messenger-wait' },
      present: f => !!f.ch7WitnessedUnveiling },
    // Quddús's garden.
    { gridX: 9, gridY: 25, texture: 'ch7-npc-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch7-quddus-tension',
      gate: { when: f => !!f.ch7WitnessedUnveiling, lockedDialogue: 'ch7-quddus-garden' } },
    // Ṭáhirih's garden: before the proclamation she speaks from behind a curtain.
    { gridX: 34, gridY: 23, texture: 'ch7-curtain',
      prompt: 'Listen at the curtain  [E]',
      dialogue: 'ch7-tahirih-curtain',
      present: f => !f.ch7WitnessedUnveiling },
    // The meadow.
    { gridX: 16, gridY: 33, texture: 'ch1-npc-calligrapher',
      prompt: 'Speak with the Keeper of Names  [E]',
      dialogue: 'ch7-names' },
    { gridX: 17, gridY: 19, texture: 'ch7-npc-believer',
      prompt: 'Speak with a shaken believer  [E]',
      dialogue: 'ch7-shaken-believer',
      present: f => !!f.ch7WitnessedUnveiling },
    { gridX: 25, gridY: 33, texture: 'ch7-npc-leaver',
      prompt: 'Speak with the Departing Believer  [E]',
      dialogue: 'ch7-leaver',
      present: f => !!f.ch7WitnessedUnveiling },
  ],
  doors: [
    // Quddús's pavilion; the Host's tent is never entered.
    { gridX: QUDDUS_DOOR.x, gridY: QUDDUS_DOOR.y, prompt: 'Enter Quddús\'s tent  [E]',
      targetScene: 'Ch7QuddusTent', targetSpawnX: 3, targetSpawnY: 5 },
  ],
  exits: [
    { fromX: LANE_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch7BadashtHamlet', targetSpawnX: 31, targetSpawnY: 1,
      label: '↓ Back to the hamlet and the camp' },
  ],
  ambience: {
    wash: { color: 0x2a3560, alpha: 0.5 },
    lights: [
      { gridX: HOST_TENT.x + 2, gridY: HOST_TENT.y + 4, radius: 160, color: 0xffc070, intensity: 0.75 },
      { gridX: 34, gridY: 22, radius: 110, color: 0xf0c0a0, intensity: 0.45 },
      { gridX: 13, gridY: 7, radius: 150, color: 0xffb860, intensity: 0.45 },
    ],
    particles: 'fireflies', music: 'night',
    vignette: 0.55,
  },
};
