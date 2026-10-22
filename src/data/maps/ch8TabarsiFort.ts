import type { DecorSpec, MapDefinition } from './types';
import { CellSet, MAZINDARAN_WOODS, scatterWoodland, sightlines, traceRoute, widen, type Cell } from './ch8MapTools';
import { wallRun } from './wallRuns';

/**
 * Fort Shaykh Ṭabarsí, October 1848 to May 1849, at true scale. A palisade
 * of stakes on an earth bank, about 34 m a side, rings the shrine; a
 * watchtower stands at each corner and a pair flanks the one gate in the
 * west wall; a flooded ditch rings the whole, crossed only by the causeway
 * to the gate. The royal army camps behind its earthworks to the east. The
 * map passes through three phases by flag: building (until
 * `ch8QuddusArrived`), winter (until `ch8MullaHusaynFell`), and hunger, when
 * the officer comes under a white flag.
 *
 * Districts (x runs east, y runs south):
 * - The palisade x 10..33, y 8..31; the gate at (10, 19..20) between towers.
 * - The ditch, two cells wide, x 6..37, y 4..35, open at the causeway.
 * - The shrine x 19..24, y 13..18, its door at (21, 18), the stone court
 *   round it x 16..27, y 11..22.
 * - The mason's corner by the north-west wall, the cook-fire and well by the
 *   south wall, the companions' lean-tos along it.
 * - The truce ground west of the causeway, x 1..5, y 15..24.
 * - The royal camp x 39..48 behind earthworks at x 38.
 */

const W = 50;
const H = 42;

const WALL = { x0: 10, y0: 8, x1: 33, y1: 31 } as const;
const GATE_Y = 19;
const MOAT = { x0: 6, y0: 4, x1: 37, y1: 35 } as const;
const SHRINE = { x: 19, y: 13 } as const;
const SHRINE_DOOR: Cell = [SHRINE.x + 2, SHRINE.y + 5];

/** Watchtowers (2 x 2): the four corners, and the pair either side of the gate. */
const TOWERS: Cell[] = [
  [WALL.x0 - 1, WALL.y0 - 1], [WALL.x1, WALL.y0 - 1], [WALL.x0 - 1, WALL.y1], [WALL.x1, WALL.y1],
  [WALL.x0 - 1, GATE_Y - 2], [WALL.x0 - 1, GATE_Y + 2],
];

const APPROACH = widen(traceRoute([[0, GATE_Y], [14, GATE_Y]]));
const INNER = widen(traceRoute([[14, GATE_Y], [14, 21], [SHRINE_DOOR[0], 21], [SHRINE_DOOR[0], SHRINE_DOOR[1] + 1]]));
const CAMP_TRACK = widen(traceRoute([[39, 19], [48, 19]]));

function onTower(x: number, y: number): boolean {
  return TOWERS.some(([tx, ty]) => x >= tx && x <= tx + 1 && y >= ty && y <= ty + 1);
}

/** The palisade ring, broken by the towers and the gate; each run joins the towers it meets. */
function palisade(): DecorSpec[] {
  const p = 'ch8-palisade';
  const ring = [
    ...wallRun(p, WALL.x0, WALL.y0, WALL.x1, WALL.y0),
    ...wallRun(p, WALL.x0, WALL.y1, WALL.x1, WALL.y1),
    ...wallRun(p, WALL.x0, WALL.y0 + 1, WALL.x0, WALL.y1 - 1, { gaps: [[WALL.x0, GATE_Y], [WALL.x0, GATE_Y + 1]] }),
    ...wallRun(p, WALL.x1, WALL.y0 + 1, WALL.x1, WALL.y1 - 1),
  ];
  return ring.filter(d => !onTower(d.gridX, d.gridY));
}

function moatCells(): Cell[] {
  const cells: Cell[] = [];
  for (let y: number = MOAT.y0; y <= MOAT.y1; y += 1) {
    for (let x: number = MOAT.x0; x <= MOAT.x1; x += 1) {
      const ring = x <= MOAT.x0 + 1 || x >= MOAT.x1 - 1 || y <= MOAT.y0 + 1 || y >= MOAT.y1 - 1;
      const causeway = x <= MOAT.x0 + 1 && (y === GATE_Y || y === GATE_Y + 1);
      if (ring && !causeway) cells.push([x, y]);
    }
  }
  return cells;
}

const blocking = (texture: string, cells: readonly Cell[]): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: readonly Cell[]): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const INSIDE_DECOR: DecorSpec[] = [
  // The mason's corner by the north-west wall.
  ...blocking('ch8-stone-pile', [[12, 10], [14, 10]]),
  ...blocking('crates', [[12, 13]]),
  // The shrine court.
  ...blocking('lamp', [[17, 12], [26, 12], [17, 20], [26, 20]]),
  ...loose('rug', [[19, 21], [23, 21], [24, 22]]),
  // Cook-fire, well and sleeping places by the south wall.
  ...blocking('ch8-cauldron', [[26, 27]]),
  ...blocking('ch8-woodpile', [[29, 26], [30, 26]]),
  ...blocking('well', [[13, 26]]),
  ...loose('rug', [[13, 28], [21, 27], [24, 26], [16, 26]]),
  ...blocking('crates', [[31, 11], [31, 12]]),
  ...blocking('ch9-cloth-bundle', [[31, 13]]),
  // Digging baskets on the berm.
  ...blocking('crates', [[8, 28]]),
];

const ROYAL_DECOR: DecorSpec[] = [
  ...[...range(6, 13), ...range(16, 23), ...range(26, 33)].map(y => ({ gridX: 38, gridY: y, texture: 'ch8-earthwork', blocks: true })),
  ...blocking('ch8-campfire', [[43, 14], [44, 24]]),
  ...blocking('crates', [[42, 18], [46, 21], [47, 22]]),
  ...blocking('ch9-cloth-bundle', [[41, 12], [45, 26]]),
  ...loose('rug', [[42, 15], [45, 23]]),
];

const ROYAL_TENTS = [[40, 5], [44, 8], [41, 27], [44, 31]].map(([gridX, gridY]) => ({ gridX: gridX!, gridY: gridY!, w: 3, h: 3, texture: 'ch8-army-tent' }));

const LEAN_TOS = [15, 18, 21, 28].map(x => ({ gridX: x, gridY: WALL.y1 - 2, w: 2, h: 2, texture: 'ch8-lean-to' }));

function range(a: number, b: number): number[] {
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

const OUTSIDE_PEOPLE: Cell[] = [[4, 19], [3, 16], [5, 24]];

function woods(): DecorSpec[] {
  const clear = new CellSet([...APPROACH, ...CAMP_TRACK]);
  clear.addRect(MOAT.x0, MOAT.y0, MOAT.x1 - MOAT.x0 + 1, MOAT.y1 - MOAT.y0 + 1);
  clear.addRect(38, 2, 12, 36); // royal camp
  clear.addRect(1, 14, 5, 12); // the truce ground
  clear.addWithNeighbours(OUTSIDE_PEOPLE);
  const verge = new CellSet();
  verge.addWithNeighbours(APPROACH);
  // Trees in front of the fort would hide it: keep the woods behind it and to the sides.
  const watched: Cell[] = [...OUTSIDE_PEOPLE, [21, 19], [WALL.x1, WALL.y1], [WALL.x0, WALL.y1], [WALL.x1, WALL.y0], [42, 20], [3, 22]];
  const open = sightlines(watched, 26, 6, W, H);
  open.addRect(0, MOAT.y1 - 2, W, H); // south of the fort and the camp only thickets: crowns there would bury them
  return scatterWoodland({
    width: W,
    height: H,
    seed: 1849,
    palette: MAZINDARAN_WOODS,
    clear,
    verge,
    open,
    treeDensity: 0.3,
    spacing: 3,
    density: 0.18,
    coverDensity: 0.18,
  });
}

export const ch8TabarsiFortMap: MapDefinition = {
  key: 'Ch8TabarsiFort',
  title: 'Fort Shaykh Ṭabarsí',
  width: W,
  height: H,
  spawn: { x: 1, y: GATE_Y },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Trampled earth inside the walls and on the berm, stone in the shrine court.
    paintRect(MOAT.x0, MOAT.y0, MOAT.x1 - MOAT.x0 + 1, MOAT.y1 - MOAT.y0 + 1, 'sand');
    paintRect(16, 11, 12, 12, 'stone');
    // The royal camp's ground, and the grass of the truce ground.
    paintRect(39, 2, 11, 36, 'sand');
    paintRect(1, 14, 5, 12, 'grass');

    for (const [x, y] of moatCells()) { setTile(x, y, 'water'); block(x, y); }
    paintPath([...APPROACH, ...INNER, ...CAMP_TRACK]);
  },
  buildings: [
    { gridX: SHRINE.x, gridY: SHRINE.y, w: 6, h: 6, texture: 'ch8-shrine' },
    ...TOWERS.map(([x, y]) => ({ gridX: x, gridY: y, w: 2, h: 2, texture: 'ch8-watchtower' })),
    ...LEAN_TOS,
    ...ROYAL_TENTS,
  ],
  decor: [...woods(), ...palisade(), ...INSIDE_DECOR, ...ROYAL_DECOR],
  npcs: [
    // The Standard stands through every season.
    { gridX: 27, gridY: 15, texture: 'ch8-black-standard',
      prompt: 'Look up at the Black Standard  [E]',
      dialogue: 'ch8-standard-fort' },

    // Autumn: building the walls, awaiting Quddús.
    { gridX: 15, gridY: 18, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch8-mh-awaiting',
      gate: { when: f => !!f.ch8HelpedBuild, lockedDialogue: 'ch8-mh-walls' },
      present: f => !f.ch8QuddusArrived },
    { gridX: 13, gridY: 12, texture: 'ch8-mason',
      prompt: 'Speak with the Companion at the Wall  [E]',
      dialogue: 'ch8-mason',
      present: f => !f.ch8MullaHusaynFell },
    // On the ditch's outer bank: the berm inside it is behind the palisade from where we look.
    { gridX: 5, gridY: 24, texture: 'ch8-young-companion',
      prompt: 'Speak with Riḍá at the ditch  [E]',
      dialogue: 'ch8-youth-digging',
      present: f => !!f.ch8MetYoungCompanion && !f.ch8QuddusArrived },

    // Winter: Quddús within, Mullá Ḥusayn's last evening.
    { gridX: 15, gridY: 18, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch8-mh-last',
      gate: { when: f => !!f.ch8QuddusCounsel, lockedDialogue: 'ch8-mh-winter' },
      present: f => !!f.ch8QuddusArrived && !f.ch8MullaHusaynFell },
    { gridX: 18, gridY: 20, texture: 'ch8-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch8-quddus-counsel',
      present: f => !!f.ch8QuddusArrived && !f.ch8MullaHusaynFell },
    { gridX: 29, gridY: 9, texture: 'ch8-young-companion',
      prompt: 'Speak with Riḍá on watch  [E]',
      dialogue: 'ch8-youth-watch',
      present: f => !!f.ch8QuddusArrived && !f.ch8MullaHusaynFell },

    // Spring: hunger, the grave, the white flag.
    { gridX: 25, gridY: 21, texture: 'ch8-grave',
      prompt: 'Kneel at the fresh grave  [E]',
      dialogue: 'ch8-grave',
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 18, gridY: 20, texture: 'ch8-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch8-quddus-oath',
      gate: { when: f => !!f.ch8TruceOffered, lockedDialogue: 'ch8-quddus-hunger' },
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 19, gridY: 26, texture: 'ch8-wounded',
      prompt: 'Speak with the Wounded Believer  [E]',
      dialogue: 'ch8-wounded',
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 25, gridY: 27, texture: 'ch8-young-companion',
      prompt: 'Sit with Riḍá at the cauldron  [E]',
      dialogue: 'ch8-youth-hunger',
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 4, gridY: 19, texture: 'ch8-officer',
      prompt: 'Meet the officer under the white flag  [E]',
      dialogue: 'ch8-truce',
      present: f => !!f.ch8SharedHunger && !f.ch8TruceOffered },
    { gridX: 3, gridY: 16, texture: 'ch8-truce-flag',
      prompt: 'Look at the white flag  [E]',
      dialogue: 'ch8-truce-flag',
      present: f => !!f.ch8SharedHunger },
  ],
  doors: [
    // The shrine itself: the tomb, the lamps, the men who keep watch inside.
    { gridX: SHRINE_DOOR[0], gridY: SHRINE_DOOR[1], prompt: 'Enter the shrine  [E]',
      targetScene: 'Ch8TabarsiShrine', targetSpawnX: 4, targetSpawnY: 7 },
  ],
  exits: [GATE_Y, GATE_Y + 1].map(fromY => ({
    fromX: 0, fromY, dx: -1, dy: 0,
    targetScene: 'Ch8ForestRoad', targetSpawnX: 46, targetSpawnY: 12,
    label: '← Back along the forest road',
  })),
  ambience: {
    wash: { color: 0x5c6a80, alpha: 0.42 },
    lights: [
      { gridX: 26, gridY: 27, radius: 150, color: 0xff9a40, intensity: 0.6 },
      { gridX: 43, gridY: 14, radius: 140, color: 0xff8a30, intensity: 0.5 },
      { gridX: 44, gridY: 24, radius: 140, color: 0xff8a30, intensity: 0.5 },
      { gridX: SHRINE_DOOR[0], gridY: SHRINE_DOOR[1] + 1, radius: 120, color: 0xffe0a0, intensity: 0.35 },
    ],
    particles: 'rain', music: 'siege',
    vignette: 0.6,
  },
};
