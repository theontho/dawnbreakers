import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The Palace of the Sun (ʿImárat-i-Khurshíd), Iṣfahán, winter 1846 to
 * spring 1847, at true scale: a Qajar palace garden quartered by a long
 * pool and a cross walk. North: the columned tālār where the Muʿtamid
 * receives. North-west: the chancery court and the chancery house, whose
 * ground-floor reception room (Ch5ReceptionRoom) is where the treatise was
 * written at a gathering, on a lap board, and where it is copied. North-east:
 * the carpeted terrace by a pool where the divines gathered, its seat of
 * honour empty under a canopy. South-east: the walled inner apartments where
 * the Báb was hidden; He is never on the map. South-west: rose beds and
 * orange trees. The river road comes in through the west gate.
 *
 * Districts (x runs east, y runs south):
 * - The tālār: x 16..27, y 2..9, its forecourt y 10..12.
 * - The long pool: x 20..23, y 13..20 and 24..34, walks either side, cypress rows on x 17 and 26.
 * - The cross walk: y 21..23 from the west gate (exit at (0, 22)) to the east wall.
 * - Chancery court: x 2..14, y 8..19, the chancery house at x 3..8, y 3..7,
 *   its door into the reception room at (6, 7).
 * - Gathering terrace: x 30..41, y 10..19.
 * - Inner apartments: walls x 29..40, y 24..34, the carved door at (34, 34).
 * - Rose garden: x 2..15, y 25..37.
 */

const W = 44;
const H = 40;
const TALAR = { gridX: 16, gridY: 2, w: 12, h: 8 };
/** The carved door of the inner apartments, in the enclosure's south wall. */
const CHAMBER_DOOR = { x: 34, y: 34 };
/** The chancery house: the town house's two-storey variant (`variant: 0`), its door on the fourth cell of the front. */
const CHANCERY = { gridX: 3, gridY: 3, w: 6, h: 5, variant: 0 } as const;
export const RECEPTION_DOOR = { x: CHANCERY.gridX + 3, y: CHANCERY.gridY + CHANCERY.h - 1 } as const;
const AXIS = { y0: 21, y1: 23 } as const;
const POOL = { x0: 20, x1: 23 } as const;

const tree = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });

const buildings: BuildingSpec[] = [
  { ...TALAR, texture: 'ch5-palace-portico' },
  // The chancery, and the inner apartments within their walls
  { ...CHANCERY, texture: 'town-house' },
  { gridX: 31, gridY: 26, w: 8, h: 7, texture: 'town-house-large' },
  // The pool before the gathering terrace
  { gridX: 38, gridY: 16, w: 3, h: 3, texture: 'fountain-pool' },
];

/** The garden walls, the west gate, and the walls of the inner apartments. */
function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    ...wallRun(w, 0, 0, W - 1, 0),
    ...wallRun(w, 0, 1, 0, H - 1, { gaps: [[0, AXIS.y0], [0, AXIS.y0 + 1], [0, AXIS.y1]] }),
    ...wallRun(w, W - 1, 1, W - 1, H - 1),
    ...wallRun(w, 1, H - 1, W - 2, H - 1),
    // The inner apartments: high walls, one carved door
    ...wallRun(w, 29, 24, 40, 24),
    ...wallRun(w, 29, 25, 29, 34),
    ...wallRun(w, 40, 25, 40, 34),
    ...wallRun(w, 30, 34, 39, 34, { doors: [[CHAMBER_DOOR.x, CHAMBER_DOOR.y]] }),
  ];
}

/** Cypress avenues down the pool, plane trees over the courts, orange trees in the beds. */
function trees(): DecorSpec[] {
  const avenue = [14, 16, 18, 26, 28, 30, 32, 34].flatMap(y => [tree(17, y, 'cypress'), tree(26, y, 'cypress')]);
  return [
    ...avenue,
    // Either side of the tālār
    tree(14, 3, 'cypress'), tree(14, 7, 'plane-tree'), tree(29, 3, 'cypress'), tree(30, 7, 'plane-tree'),
    // The chancery court
    tree(11, 4, 'plane-tree'), tree(2, 15, 'orange-tree'), tree(12, 17, 'orange-tree'),
    // The gathering terrace
    tree(31, 11, 'cypress'), tree(41, 11, 'plane-tree'), tree(33, 19, 'orange-tree'),
    // The rose garden
    tree(3, 26, 'cypress'), tree(14, 26, 'cypress'), tree(3, 36, 'cypress'), tree(14, 36, 'cypress'),
    tree(6, 29, 'orange-tree'), tree(11, 29, 'orange-tree'), tree(6, 33, 'orange-tree'), tree(11, 33, 'orange-tree'),
    // Behind the inner apartments
    tree(30, 25, 'cypress'), tree(39, 25, 'cypress'),
  ];
}

/** Lamps on the forecourt, in the courts and at the carved door. */
function lamps(): DecorSpec[] {
  const cells: Array<[number, number]> = [
    [16, 11], [27, 11], [3, 9], [13, 9],
    [30, 13], [40, 14], [19, 22], [24, 22],
    [32, 35], [36, 35], [1, 20], [1, 24],
  ];
  return cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'lamp', blocks: true }));
}

const props: DecorSpec[] = [
  // The chancery court: carpets, a planter, bundles of paper
  { gridX: 6, gridY: 12, texture: 'rug' },
  { gridX: 4, gridY: 11, texture: 'crates', blocks: true },
  { gridX: 10, gridY: 14, texture: 'ch1-planter', blocks: true },
  // The gathering terrace: carpets in a ring before the empty seat
  { gridX: 33, gridY: 13, texture: 'rug' },
  { gridX: 37, gridY: 13, texture: 'rug' },
  { gridX: 34, gridY: 15, texture: 'rug' },
  { gridX: 36, gridY: 15, texture: 'rug' },
  { gridX: 39, gridY: 12, texture: 'ch1-planter', blocks: true },
  // The Muʿtamid's own men at the inner apartments
  { gridX: 37, gridY: 36, texture: 'ch4-officer', blocks: true },
  // Rose beds
  { gridX: 5, gridY: 27, texture: 'ch7-rosebush', blocks: true },
  { gridX: 12, gridY: 27, texture: 'ch7-rosebush', blocks: true },
  { gridX: 5, gridY: 35, texture: 'ch7-rosebush', blocks: true },
  { gridX: 12, gridY: 35, texture: 'ch7-rosebush', blocks: true },
  { gridX: 8, gridY: 26, texture: 'ch7-rosebush', blocks: true },
  { gridX: 9, gridY: 36, texture: 'ch7-rosebush', blocks: true },
  { gridX: 9, gridY: 31, texture: 'rug' },
];

export const ch5MutamidPalaceMap: MapDefinition = {
  key: 'Ch5MutamidPalace',
  title: 'Iṣfahán, the Palace of the Sun',
  width: W,
  height: H,
  spawn: { x: 1, y: 22 },
  build: ({ paintRect, block }) => {
    paintRect(0, 0, W, H, 'grass');
    // The forecourt of the tālār, and the walks down the pool
    paintRect(14, 10, 16, 3, 'stone');
    paintRect(18, 13, 8, 24, 'stone');
    // The long pool, broken by the cross walk
    for (const [y0, y1] of [[13, AXIS.y0 - 1], [AXIS.y1 + 1, 34]] as const) {
      paintRect(POOL.x0, y0, POOL.x1 - POOL.x0 + 1, y1 - y0 + 1, 'water');
      for (let y = y0; y <= y1; y++) for (let x = POOL.x0; x <= POOL.x1; x++) block(x, y);
    }
    // The cross walk from the west gate
    paintRect(0, AXIS.y0, W, AXIS.y1 - AXIS.y0 + 1, 'path');
    // The chancery court and the gathering terrace
    paintRect(2, 8, 13, 12, 'stone');
    paintRect(30, 10, 12, 10, 'stone');
    // Before the inner apartments, and the rose garden's paths
    paintRect(29, 35, 12, 3, 'stone');
    paintRect(8, 24, 2, 14, 'path');
    paintRect(2, 30, 14, 2, 'path');
  },
  buildings,
  decor: [...walls(), ...trees(), ...lamps(), ...props],
  npcs: [
    // The Muʿtamid before his tālār, until his death
    { gridX: 21, gridY: 11, texture: 'ch5-mutamid',
      prompt: 'Speak with Manúchihr Khán  [E]',
      dialogue: 'ch5-mutamid',
      present: f => !f.mutamidDied },
    { gridX: 21, gridY: 11, texture: 'rug',
      prompt: 'Look at the Muʿtamid\'s empty place  [E]',
      dialogue: 'ch5-mutamid-empty',
      present: f => !!f.mutamidDied },
    // The gathering terrace
    { gridX: 35, gridY: 12, texture: 'ch5-seat-of-honour',
      prompt: 'Look at the empty seat of honour  [E]',
      dialogue: 'ch5-seat' },
    { gridX: 32, gridY: 15, texture: 'ch5-philosopher',
      prompt: 'Speak with Mírzá Ḥasan-i-Núrí  [E]',
      dialogue: 'ch5-philosopher' },
    // The inner apartments
    { gridX: 31, gridY: 36, texture: 'ch5-gurgin',
      prompt: 'Speak with Gurgín Khán  [E]',
      dialogue: 'ch5-gurgin',
      present: f => !!f.mutamidDied },
    { gridX: CHAMBER_DOOR.x, gridY: CHAMBER_DOOR.y,
      prompt: 'Stand at the door of the inner apartments  [E]',
      dialogue: 'ch5-chamber',
      gate: {
        when: f => !!f.mutamidDied && !!f.gurginMet,
        lockedDialogue: 'ch5-chamber-locked',
      } },
  ],
  doors: [
    // The reception room, where the treatise was written and is copied.
    { gridX: RECEPTION_DOOR.x, gridY: RECEPTION_DOOR.y, prompt: 'Enter the reception room  [E]',
      targetScene: 'Ch5ReceptionRoom', targetSpawnX: 4, targetSpawnY: 4 },
  ],
  exits: [
    { fromX: 0, fromY: 22, dx: -1, dy: 0,
      targetScene: 'Ch5IsfahanBridge', targetSpawnX: 54, targetSpawnY: 14,
      label: '← West along the river road' },
  ],
  ambience: {
    wash: { color: 0x46507a, alpha: 0.34 },
    particles: 'motes', music: 'court',
    vignette: 0.55,
    lights: [
      { gridX: 21, gridY: 11, radius: 200, color: 0xffc070, intensity: 0.22 },
      { gridX: 35, gridY: 13, radius: 160, color: 0xffc070, intensity: 0.24 },
      { gridX: CHAMBER_DOOR.x, gridY: CHAMBER_DOOR.y + 1, radius: 140, color: 0xffb860, intensity: 0.28 },
    ],
  },
};
