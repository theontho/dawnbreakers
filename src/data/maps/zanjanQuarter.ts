import type { FlagState } from '../../dialogue/types';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';
import { zjEnd, zjSummer, zjTruce, zjWinter } from './zanjanPhases';

/**
 * Zanján, 1850, at true scale: the quarter of Ḥujjat's companions, cut off
 * from the rest of the town by barricades of sacks, doors and carts thrown
 * across its lanes. North of it stands the fort of ʿAlí-Mardán Khán, where
 * the believers moved with their families; south and east, past a strip of
 * shelled houses, the royal army lies behind its earthworks with its guns.
 * The player comes in by night from the orchards to the west, with the
 * news from Tabríz.
 *
 * Districts (x runs east, y runs south):
 * - The fort's south wall on y = 8, x 6..32 (its gate x 17..20, y 6..8,
 *   the doorway at (19, 8)); its side walls on x = 6 and x = 32; garden
 *   walls continue the line west and east.
 * - The square before the gate, x 9..30, y 9..13; the mosque Ḥujjat's
 *   friends built for him, x 31..38, y 10..16.
 * - The lane south from the square, x 10..11, y 14..23, to the sally gap
 *   in the south barricade (10..11, 24), where Mír Ṣaláḥ stands sentinel
 *   until he lets the player in (the fort gate stays barred till then); the lane east, y 21..22, to the
 *   east barricade (x = 42), where Zaynab keeps watch.
 * - No man's land: the shelled houses, y 25..30 and x 43..47.
 * - The orchards in the south-west, x 0..27, y 31..41, where the player
 *   arrives at (1, 35).
 * - The royal lines behind their earthworks (y = 31 and x = 28), guns
 *   along the bank, tents beyond.
 */

const W = 48;
const H = 42;
export const ZJ_GATE_DOOR = { x: 19, y: 8 } as const;
const GAP: ReadonlyArray<readonly [number, number]> = [[10, 24], [11, 24]];
const EAST_X = 42;
const SOUTH_Y = 24;

const entered = (f: FlagState) => !!f.zjEnteredQuarter;

const buildings: BuildingSpec[] = [
  { gridX: 17, gridY: 6, w: 4, h: 3, texture: 'city-gate' },
  // Roofs inside the fort, seen over its wall.
  { gridX: 8, gridY: 1, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 24, gridY: 1, w: 6, h: 5, texture: 'town-house' },
  // The quarter.
  { gridX: 31, gridY: 10, w: 8, h: 7, texture: 'mosque-local' },
  { gridX: 1, gridY: 10, w: 6, h: 5, texture: 'town-house' },
  { gridX: 1, gridY: 17, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 14, gridY: 15, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 21, gridY: 15, w: 6, h: 5, texture: 'town-house' },
  // The shelled houses of no man's land.
  { gridX: 16, gridY: 26, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 33, gridY: 25, w: 5, h: 4, texture: 'town-house-small' },
  // The royal camp.
  { gridX: 33, gridY: 36, w: 3, h: 3, texture: 'ch8-army-tent' },
  { gridX: 39, gridY: 35, w: 3, h: 3, texture: 'ch8-army-tent' },
  { gridX: 44, gridY: 37, w: 3, h: 3, texture: 'ch8-army-tent' },
];

function walls(): DecorSpec[] {
  const fort = 'town-wall';
  const garden = 'compound-wall';
  return [
    ...wallRun(fort, 6, 8, 16, 8),
    ...wallRun(fort, 21, 8, 32, 8),
    ...wallRun(fort, 6, 0, 6, 7),
    ...wallRun(fort, 32, 0, 32, 7),
    ...wallRun(garden, 0, 8, 5, 8),
    ...wallRun(garden, 33, 8, 47, 8),
  ];
}

/** The barricades: the south line broken only at the sally gap, the east line whole. */
function barricades(): DecorSpec[] {
  const out: DecorSpec[] = [];
  const piece = (x: number, y: number) => ((x * 7 + y * 3) % 5 === 0 ? 'zanjan-barricade-cart' : 'zanjan-barricade');
  for (let x = 0; x <= EAST_X; x++) {
    if (GAP.some(([gx, gy]) => gx === x && gy === SOUTH_Y)) continue;
    out.push({ gridX: x, gridY: SOUTH_Y, texture: piece(x, SOUTH_Y), blocks: true });
  }
  for (let y = 9; y < SOUTH_Y; y++) out.push({ gridX: EAST_X, gridY: y, texture: piece(EAST_X, y), blocks: true });
  return out;
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const props: DecorSpec[] = [
  // Gardens beyond the walls, north-west and north-east.
  ...block('plane-tree', [[2, 3], [38, 2], [44, 5]]),
  ...block('cypress', [[4, 6], [35, 5], [46, 2]]),
  // The square: lamps at the gate and the mosque, a well, the women's water-skins.
  ...block('lamp', [[16, 10], [21, 10], [30, 13], [9, 13]]),
  ...block('well', [[25, 11]]),
  ...block('zanjan-water-skins', [[26, 12]]),
  ...block('zanjan-shot-basket', [[13, 11]]),
  // Behind the barricades: sacks for repairs, a brazier for the sentinels.
  ...block('crates', [[7, 22], [19, 23], [30, 23], [40, 11]]),
  ...block('ch6-brazier', [[13, 22], [39, 20]]),
  ...block('ch9-cloth-bundle', [[24, 23], [36, 19]]),
  ...loose('rug', [[15, 21], [37, 21]]),
  ...block('lamp', [[8, 23], [40, 15]]),
  // No man's land: rubble of the shelled houses, burnt beams, a dead tree.
  ...block('zanjan-rubble', [[14, 27], [22, 28], [27, 26], [30, 29], [39, 27], [44, 12], [45, 20], [6, 27]]),
  ...loose('crowd-shadow', [[25, 29]]),
  // The orchards, west and south-west.
  ...block('fruit-tree', [[2, 28], [6, 31], [3, 39], [9, 38], [14, 40], [19, 37], [23, 40]]),
  ...block('plane-tree', [[1, 31], [13, 33], [25, 34]]),
  ...block('cypress', [[0, 40], [17, 33], [26, 38]]),
  // The royal lines: earthworks, guns along the bank, fires and stores behind.
  ...[...range(28, 47)].map(x => ({ gridX: x, gridY: 31, texture: 'ch8-earthwork', blocks: true })),
  ...[...range(32, 41)].map(y => ({ gridX: 28, gridY: y, texture: 'ch8-earthwork', blocks: true })),
  ...block('zanjan-field-gun', [[31, 32], [36, 32], [42, 32], [46, 33]]),
  ...block('ch8-campfire', [[37, 39], [31, 39]]),
  ...block('crates', [[43, 34], [34, 34]]),
  ...block('ch9-cloth-bundle', [[46, 35]]),
];

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

export const zanjanQuarterMap: MapDefinition = {
  key: 'ZanjanQuarter',
  title: 'Zanján: the Barricaded Quarter',
  width: W,
  height: H,
  spawn: { x: 1, y: 35 },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'sand');
    // Gardens beyond the quarter's walls, and the orchards.
    paintRect(0, 0, 6, 8, 'grass');
    paintRect(33, 0, 15, 8, 'grass');
    paintRect(0, 31, 28, 11, 'grass');
    // The fort's court is out of reach behind its wall.
    for (let y = 0; y < 8; y++) for (let x = 7; x < 32; x++) blockCell(x, y);
    paintRect(7, 0, 25, 8, 'stone');
    // The square before the gate, the lanes, the way in from the orchards.
    paintRect(9, 9, 22, 5, 'stone');
    paintRect(10, 14, 2, 10, 'path');
    paintRect(10, 21, 31, 2, 'path');
    paintRect(10, 25, 2, 10, 'path');
    paintRect(0, 34, 12, 2, 'path');
  },
  buildings,
  decor: [...walls(), ...barricades(), ...props],
  npcs: [
    // Summer: the way in.
    { gridX: 3, gridY: 34, texture: 'zanjan-siyyid-hasan',
      prompt: 'Speak with Siyyid Ḥasan  [E]',
      dialogue: 'zj-hasan',
      present: f => zjSummer(f) && !entered(f) },
    { gridX: 12, gridY: 26, texture: 'zanjan-mir-salah',
      prompt: 'Speak with the Sentinel  [E]',
      dialogue: 'zj-mir-salah-gate',
      gate: { when: f => !!f.zjMetHasan, lockedDialogue: 'zj-mir-salah-halt' },
      present: f => !entered(f) },

    // Inside the barricades, through summer, truce and winter.
    { gridX: 12, gridY: 20, texture: 'zanjan-mir-salah',
      prompt: 'Speak with Mír Ṣaláḥ  [E]',
      dialogue: 'zj-mir-salah',
      present: f => entered(f) && zjSummer(f) },
    { gridX: 12, gridY: 20, texture: 'zanjan-mir-salah',
      prompt: 'Speak with Mír Ṣaláḥ  [E]',
      dialogue: 'zj-mir-salah-truce',
      present: zjTruce },
    { gridX: 12, gridY: 20, texture: 'zanjan-mir-salah',
      prompt: 'Speak with Mír Ṣaláḥ  [E]',
      dialogue: 'zj-mir-salah-winter',
      present: f => zjWinter(f) || zjEnd(f) },

    // Zaynab at the east barricade; after she falls, a lamp where she stood.
    { gridX: 40, gridY: 18, texture: 'zanjan-zaynab',
      prompt: 'Speak with the Youth at the Barricade  [E]',
      dialogue: 'zj-zaynab',
      present: f => entered(f) && zjSummer(f) },
    { gridX: 40, gridY: 18, texture: 'lamp',
      prompt: 'Look at the lamp at the barricade  [E]',
      dialogue: 'zj-zaynab-place',
      present: f => !zjSummer(f) },

    // The truce: a soldier of the ʿIráqí regiment out among the ruins.
    { gridX: 24, gridY: 30, texture: 'zanjan-soldier',
      prompt: 'Speak with the Soldier  [E]',
      dialogue: 'zj-soldier',
      present: zjTruce },
  ],
  doors: [
    { gridX: ZJ_GATE_DOOR.x, gridY: ZJ_GATE_DOOR.y, prompt: 'Enter the fort of ʿAlí-Mardán Khán  [E]',
      targetScene: 'ZanjanFort', targetSpawnX: 14, targetSpawnY: 23,
      requires: entered, lockedLabel: 'The fort gate is barred to strangers' },
  ],
  exits: [],
  ambience: f => quarterAmbience(f),
};

/** A summer night of smoke; a grey truce; winter snow; and at the end, fires in the quarter. */
function quarterAmbience(f: FlagState): MapAmbience {
  const fires = [
    { gridX: 37, gridY: 39, radius: 160, color: 0xff8a30, intensity: 0.5 },
    { gridX: 31, gridY: 39, radius: 140, color: 0xff8a30, intensity: 0.45 },
    { gridX: 13, gridY: 22, radius: 110, color: 0xff9a40, intensity: 0.45 },
    { gridX: 39, gridY: 20, radius: 110, color: 0xff9a40, intensity: 0.45 },
  ];
  if (zjEnd(f)) {
    return {
      wash: { color: 0x3a2a30, alpha: 0.6 },
      lights: [...fires, { gridX: 22, gridY: 28, radius: 220, color: 0xff6a20, intensity: 0.4 }],
      particles: 'embers', music: 'sorrow', sound: ['wind', 'fire'], vignette: 0.75,
    };
  }
  if (zjWinter(f)) {
    return {
      wash: { color: 0x4a5470, alpha: 0.55 },
      lights: fires, particles: 'snow', music: 'siege', sound: ['wind'], vignette: 0.7,
    };
  }
  if (zjTruce(f)) {
    return {
      wash: { color: 0x8a8070, alpha: 0.4 },
      particles: 'dust', music: 'sorrow', sound: ['breeze'], vignette: 0.55,
    };
  }
  return {
    wash: { color: 0x2a3560, alpha: 0.55 },
    lights: fires, particles: 'embers', music: 'siege', sound: ['crickets', 'fire'], vignette: 0.65,
  };
}
