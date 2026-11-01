import type { FlagState } from '../../dialogue/types';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition } from './types';
import { bgDeparture, bgMorning, bgWinter, readyForSerai } from './baghdadPhases';

/**
 * Baghdád, January 1845, at true scale: the quay on the east bank of the
 * Tigris below the governor's serai, where the bridge of boats goes over to
 * Karkh and the guffas put in from the far shore.
 *
 * Districts (x runs east, y runs south; the river is to the south-west):
 * - Gardens of date palms behind the river houses, y 0..9, and the little
 *   mosque of the quarter, x 0..7, y 2..8.
 * - The river front, its fronts all on y = 15: the coffee-house x 2..6, a
 *   river house x 8..12, the serai x 16..25 (its gateway at (20, 15), its
 *   prison door at (24, 15)), a river house x 28..32. Lanes run back between
 *   them at x 7, x 13..15 and x 26..27.
 * - The quay, y 16..19, from the road north (the west edge) to the east
 *   edge; the bookseller's stall at (13..14, 16..17).
 * - The shingle, y 20..21, where the guffas are drawn up; the river, y 22..27.
 * - The bridge of boats, its deck x 10..11 from the shingle out across the
 *   water toward Karkh.
 */

const W = 36;
const H = 28;
export const BG_SERAI_GATE = { x: 20, y: 15 } as const;
export const BG_PRISON_DOOR = { x: 24, y: 15 } as const;
const RIVER_Y = 22;
const BRIDGE = { x0: 10, x1: 11 } as const;

const buildings: BuildingSpec[] = [
  { gridX: 0, gridY: 2, w: 8, h: 7, texture: 'mosque-local' },
  { gridX: 2, gridY: 12, w: 5, h: 4, texture: 'bg-coffee-house' },
  { gridX: 8, gridY: 12, w: 5, h: 4, texture: 'bg-river-house' },
  { gridX: 16, gridY: 10, w: 10, h: 6, texture: 'bg-serai' },
  { gridX: 28, gridY: 12, w: 5, h: 4, texture: 'bg-river-house' },
  { gridX: 13, gridY: 16, w: 2, h: 2, texture: 'market-stall' },
];

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // Date palms in the gardens behind the river front, and at the ends of the shingle.
  ...block('bg-date-palm', [[11, 2], [14, 7], [17, 3], [22, 1], [27, 6], [31, 2], [34, 8], [10, 9], [1, 21], [34, 21]]),
  ...block('bg-date-palm-young', [[15, 4], [25, 4], [29, 9], [33, 4], [9, 6]]),
  ...block('orange-tree', [[20, 6], [35, 1]]),
  // Reeds at the water's edge; guffas drawn up on the shingle and out on the river.
  ...block('ch5-river-reeds', [[3, 21], [8, 21], [21, 21], [26, 21], [32, 21]]),
  ...block('bg-guffa', [[6, 21], [28, 21], [23, 24], [31, 25], [16, 26]]),
  // The boats under the bridge.
  ...block('bg-pontoon', [[BRIDGE.x0 - 1, 23], [BRIDGE.x1 + 1, 25], [BRIDGE.x0 - 1, 26]]),
  // The quay: the coffee-house's water jars, crates for the boats, lamps at the serai gate.
  ...block('ch9-water-jar', [[7, 16], [12, 16]]),
  ...block('crates', [[27, 17], [33, 18]]),
  ...block('lamp', [[18, 16], [23, 16]]),
  // Townsfolk waiting along the quay to see the Persian brought up.
  ...block('crowd', [[26, 19], [30, 17]], bgMorning),
  // The Páshá's soldiers at the serai gate in the morning.
  ...block('bg-guard', [[19, 16], [21, 16]], bgMorning),
  ...block('bg-guard', [[25, 16]], bgWinter),
  // The morning he is led away: his escort and their mules at the head of the quay.
  ...block('bg-guard', [[3, 18], [5, 18], [6, 17]], bgDeparture),
  ...block('kulayn-horse', [[2, 19]], bgDeparture),
];

export const baghdadQuayMap: MapDefinition = {
  key: 'BaghdadQuay',
  title: 'Baghdád: the Quay below the Serai',
  width: W,
  height: H,
  spawn: { x: 15, y: 20 },
  build: ({ paintRect, block: blockCell, setTile }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(8, 0, 28, 10, 'grass');
    paintRect(0, 9, 8, 3, 'path');
    paintRect(7, 9, 1, 7, 'path');
    paintRect(13, 10, 3, 6, 'path');
    paintRect(26, 10, 2, 6, 'path');
    paintRect(0, 16, W, 4, 'stone');
    paintRect(0, RIVER_Y, W, H - RIVER_Y, 'water');
    for (let y = RIVER_Y; y < H; y++) for (let x = 0; x < W; x++) blockCell(x, y);
    // The bridge of boats.
    for (let y = 20; y < H; y++) {
      for (let x = BRIDGE.x0; x <= BRIDGE.x1; x++) {
        setTile(x, y, 'wood');
      }
    }
  },
  buildings,
  decor: props,
  npcs: [
    // Things to look at.
    { gridX: 6, gridY: 21, texture: 'bg-guffa', prompt: 'Look at the guffa  [E]', dialogue: 'bg-guffa' },
    { gridX: BRIDGE.x1 + 1, gridY: 22, texture: 'bg-pontoon', prompt: 'Look at the bridge of boats  [E]', dialogue: 'bg-bridge' },

    // The morning of the tribunal.
    { gridX: 18, gridY: 20, texture: 'bg-boatman', prompt: 'Speak with your Father  [E]', dialogue: 'bg-father', present: bgMorning },
    { gridX: 13, gridY: 18, texture: 'bg-bookseller', prompt: 'Speak with the Bookseller  [E]', dialogue: 'bg-bookseller', present: bgMorning },
    { gridX: 4, gridY: 17, texture: 'bg-shirazi-merchant', prompt: 'Speak with the Merchant of Shíráz  [E]', dialogue: 'bg-merchant', present: bgMorning },
    { gridX: 2, gridY: 16, texture: 'bg-coffee-keeper', prompt: 'Speak with the Coffee-Seller  [E]', dialogue: 'bg-coffee', present: bgMorning },

    // The evening after.
    { gridX: 23, gridY: 18, texture: 'bg-shii-student', prompt: 'Speak with the Student from Karbilá  [E]', dialogue: 'bg-student-bread', present: bgWinter },
    { gridX: 18, gridY: 20, texture: 'bg-boatman', prompt: 'Speak with your Father  [E]', dialogue: 'bg-father-winter', present: bgWinter },
    { gridX: 13, gridY: 18, texture: 'bg-bookseller', prompt: 'Speak with the Bookseller  [E]', dialogue: 'bg-bookseller-winter', present: bgWinter },
    { gridX: 2, gridY: 16, texture: 'bg-coffee-keeper', prompt: 'Speak with the Coffee-Seller  [E]', dialogue: 'bg-coffee-winter', present: bgWinter },

    // The morning he is led away.
    { gridX: 4, gridY: 18, texture: 'ch2-mulla-ali', prompt: 'Go to Mullá ʿAlíy-i-Basṭámí  [E]', dialogue: 'bg-ali-departure', present: bgDeparture },
    { gridX: 18, gridY: 20, texture: 'bg-boatman', prompt: 'Speak with your Father  [E]', dialogue: 'bg-father-dawn', present: bgDeparture },
  ],
  doors: [
    { gridX: BG_SERAI_GATE.x, gridY: BG_SERAI_GATE.y, prompt: 'Go up into the serai  [E]',
      targetScene: 'BaghdadSerai', targetSpawnX: 8, targetSpawnY: 11,
      requires: f => !bgMorning(f) || readyForSerai(f),
      lockedLabel: 'The court sits at the third hour. Buy the ink, and hear the quay.' },
    { gridX: BG_PRISON_DOOR.x, gridY: BG_PRISON_DOOR.y, prompt: 'Go down to the prison  [E]',
      targetScene: 'BaghdadPrison', targetSpawnX: 6, targetSpawnY: 8,
      requires: f => bgWinter(f) && !!f.bgCarryingBread,
      lockedLabel: 'The prison door is barred' },
  ],
  exits: [],
  ambience: f => quayAmbience(f),
};

/** A cold mist on the river at morning; lamplit dusk after the verdict; grey first light the day he goes. */
function quayAmbience(f: FlagState): MapAmbience {
  if (bgDeparture(f)) {
    return {
      wash: { color: 0xb8a8b8, alpha: 0.3 },
      lights: [{ gridX: 0, gridY: 17, radius: 220, color: 0xffc8a0, intensity: 0.25 }],
      particles: 'motes', music: 'sorrow', sound: ['river', 'birds'], vignette: 0.6,
    };
  }
  if (bgWinter(f)) {
    return {
      wash: { color: 0x4a4068, alpha: 0.48 },
      lights: [
        { gridX: 4, gridY: 15, radius: 140, color: 0xffb860, intensity: 0.4 },
        { gridX: BG_PRISON_DOOR.x, gridY: 16, radius: 90, color: 0xffa850, intensity: 0.3 },
      ],
      particles: 'motes', music: 'night', sound: ['river'], vignette: 0.65,
    };
  }
  return { wash: { color: 0xc8d0d8, alpha: 0.2 }, particles: 'motes', music: 'city', sound: ['river', 'birds'], vignette: 0.45 };
}
