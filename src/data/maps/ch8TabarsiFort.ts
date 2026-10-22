import type { DecorSpec, MapDefinition } from './types';
import { CellSet, MAZINDARAN_WOODS, scatterWoodland, traceRoute, type Cell } from './ch8MapTools';

/**
 * Fort Shaykh Ṭabarsí, October 1848 to May 1849. A timber-and-stone wall
 * with four watchtowers rings the shrine; a flooded ditch rings the wall; a
 * single causeway crosses to the west gate. The royal army camps behind
 * earthworks to the east. The map passes through three phases by flag:
 * building (until `ch8QuddusArrived`), winter (until `ch8MullaHusaynFell`),
 * and hunger, when the officer comes under a white flag.
 */

const W = 30;
const H = 28;

// Wall rectangle (inclusive) and the gate gap on its west side.
const WALL = { x0: 8, y0: 6, x1: 21, y1: 19 };
const GATE: Cell = [8, 13];
const TOWERS: Cell[] = [[8, 6], [21, 6], [8, 19], [21, 19]];
// Ditch ring, one cell outside the berm.
const MOAT = { x0: 6, y0: 4, x1: 23, y1: 21 };

const APPROACH = traceRoute([[0, 13], [11, 13]]);
const INNER = traceRoute([[11, 13], [11, 12], [17, 12], [17, 15]]);
const CAMP_TRACK = traceRoute([[25, 13], [29, 13]]);

function isTower(x: number, y: number): boolean {
  return TOWERS.some(([tx, ty]) => tx === x && ty === y);
}

function palisade(): DecorSpec[] {
  const out: DecorSpec[] = [];
  const add = (x: number, y: number) => {
    if (isTower(x, y) || (x === GATE[0] && y === GATE[1])) return;
    out.push({ gridX: x, gridY: y, texture: 'ch8-palisade', blocks: true });
  };
  for (let x = WALL.x0; x <= WALL.x1; x += 1) { add(x, WALL.y0); add(x, WALL.y1); }
  for (let y = WALL.y0 + 1; y < WALL.y1; y += 1) { add(WALL.x0, y); add(WALL.x1, y); }
  return out;
}

function moatCells(): Cell[] {
  const cells: Cell[] = [];
  for (let x = MOAT.x0; x <= MOAT.x1; x += 1) { cells.push([x, MOAT.y0], [x, MOAT.y1]); }
  for (let y = MOAT.y0 + 1; y < MOAT.y1; y += 1) {
    if (y !== GATE[1]) cells.push([MOAT.x0, y]);
    cells.push([MOAT.x1, y]);
  }
  return cells;
}

const INSIDE_DECOR: DecorSpec[] = [
  // Mason's corner by the west wall
  { gridX: 9, gridY: 8, texture: 'ch8-stone-pile', blocks: true },
  { gridX: 9, gridY: 10, texture: 'crates', blocks: true },
  // Shrine court
  { gridX: 12, gridY: 8, texture: 'lamp', blocks: true },
  { gridX: 17, gridY: 11, texture: 'lamp', blocks: true },
  { gridX: 13, gridY: 12, texture: 'rug' },
  { gridX: 15, gridY: 12, texture: 'rug' },
  // Cook-fire, well and sleeping places
  { gridX: 17, gridY: 16, texture: 'ch8-cauldron', blocks: true },
  { gridX: 19, gridY: 15, texture: 'ch8-woodpile', blocks: true },
  { gridX: 11, gridY: 16, texture: 'well', blocks: true },
  { gridX: 11, gridY: 17, texture: 'rug' },
  { gridX: 15, gridY: 17, texture: 'rug' },
  { gridX: 19, gridY: 17, texture: 'rug' },
  { gridX: 20, gridY: 9, texture: 'crates', blocks: true },
  { gridX: 20, gridY: 10, texture: 'ch9-cloth-bundle', blocks: true },
  // Digging baskets on the berm
  { gridX: 7, gridY: 18, texture: 'crates', blocks: true },
];

const ROYAL_DECOR: DecorSpec[] = [
  { gridX: 24, gridY: 7, texture: 'ch8-earthwork', blocks: true },
  { gridX: 24, gridY: 8, texture: 'ch8-earthwork', blocks: true },
  { gridX: 24, gridY: 11, texture: 'ch8-earthwork', blocks: true },
  { gridX: 24, gridY: 15, texture: 'ch8-earthwork', blocks: true },
  { gridX: 24, gridY: 18, texture: 'ch8-earthwork', blocks: true },
  { gridX: 24, gridY: 19, texture: 'ch8-earthwork', blocks: true },
  { gridX: 27, gridY: 9, texture: 'ch8-campfire', blocks: true },
  { gridX: 28, gridY: 16, texture: 'ch8-campfire', blocks: true },
  { gridX: 26, gridY: 12, texture: 'crates', blocks: true },
];

const ROYAL_TENTS = [
  { gridX: 25, gridY: 5, w: 2, h: 2, texture: 'ch8-army-tent' },
  { gridX: 27, gridY: 6, w: 2, h: 2, texture: 'ch8-army-tent' },
  { gridX: 26, gridY: 17, w: 2, h: 2, texture: 'ch8-army-tent' },
  { gridX: 25, gridY: 20, w: 2, h: 2, texture: 'ch8-army-tent' },
];

const LEAN_TOS = [10, 12, 14, 18].map(x => ({ gridX: x, gridY: 18, w: 1, h: 1, texture: 'ch8-lean-to' }));

const PEOPLE: Cell[] = [[4, 12], [3, 10], [7, 16]];

function woods(): DecorSpec[] {
  const clear = new CellSet([...APPROACH, ...CAMP_TRACK]);
  clear.addRect(MOAT.x0, MOAT.y0, MOAT.x1 - MOAT.x0 + 1, MOAT.y1 - MOAT.y0 + 1);
  clear.addRect(24, 4, 6, 20); // royal camp
  clear.addRect(2, 10, 4, 7); // causeway approach and truce ground
  clear.addWithNeighbours(PEOPLE);
  const verge = new CellSet();
  verge.addWithNeighbours(APPROACH);
  return scatterWoodland({
    width: W,
    height: H,
    seed: 1849,
    palette: MAZINDARAN_WOODS,
    clear,
    verge,
    density: 0.55,
    coverDensity: 0.18,
  });
}

export const ch8TabarsiFortMap: MapDefinition = {
  key: 'Ch8TabarsiFort',
  title: 'Fort Shaykh Ṭabarsí',
  width: W,
  height: H,
  spawn: { x: 1, y: 13 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Trampled earth inside the walls and on the berm, stone in the shrine court
    paintRect(MOAT.x0, MOAT.y0, MOAT.x1 - MOAT.x0 + 1, MOAT.y1 - MOAT.y0 + 1, 'sand');
    paintRect(WALL.x0 + 1, WALL.y0 + 1, WALL.x1 - WALL.x0 - 1, WALL.y1 - WALL.y0 - 1, 'sand');
    paintRect(11, 7, 8, 6, 'stone');
    // Royal camp ground
    paintRect(24, 4, 6, 20, 'sand');
    paintRect(2, 10, 4, 7, 'grass');

    for (const [x, y] of moatCells()) { setTile(x, y, 'water'); block(x, y); }
    paintPath([...APPROACH, ...INNER, ...CAMP_TRACK]);
  },
  buildings: [
    { gridX: 13, gridY: 8, w: 3, h: 3, texture: 'ch8-shrine' },
    ...TOWERS.map(([x, y]) => ({ gridX: x, gridY: y, w: 1, h: 1, texture: 'ch8-watchtower' })),
    ...LEAN_TOS,
    ...ROYAL_TENTS,
  ],
  decor: [...woods(), ...palisade(), ...INSIDE_DECOR, ...ROYAL_DECOR],
  npcs: [
    // The shrine and the Standard stand through every season.
    { gridX: 14, gridY: 11, texture: 'rug',
      prompt: 'Rest your hand on the shrine door  [E]',
      dialogue: 'ch8-shrine' },
    { gridX: 17, gridY: 8, texture: 'ch8-black-standard',
      prompt: 'Look up at the Black Standard  [E]',
      dialogue: 'ch8-standard-fort' },

    // Autumn: building the walls, awaiting Quddús.
    { gridX: 10, gridY: 12, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch8-mh-awaiting',
      gate: { when: f => !!f.ch8HelpedBuild, lockedDialogue: 'ch8-mh-walls' },
      present: f => !f.ch8QuddusArrived },
    { gridX: 10, gridY: 9, texture: 'ch8-mason',
      prompt: 'Speak with the Companion at the Wall  [E]',
      dialogue: 'ch8-mason',
      present: f => !f.ch8MullaHusaynFell },
    { gridX: 7, gridY: 16, texture: 'ch8-young-companion',
      prompt: 'Speak with Riḍá at the ditch  [E]',
      dialogue: 'ch8-youth-digging',
      present: f => !!f.ch8MetYoungCompanion && !f.ch8QuddusArrived },

    // Winter: Quddús within, Mullá Ḥusayn's last evening.
    { gridX: 10, gridY: 12, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch8-mh-last',
      gate: { when: f => !!f.ch8QuddusCounsel, lockedDialogue: 'ch8-mh-winter' },
      present: f => !!f.ch8QuddusArrived && !f.ch8MullaHusaynFell },
    { gridX: 12, gridY: 10, texture: 'ch8-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch8-quddus-counsel',
      present: f => !!f.ch8QuddusArrived && !f.ch8MullaHusaynFell },
    { gridX: 20, gridY: 7, texture: 'ch8-young-companion',
      prompt: 'Speak with Riḍá on watch  [E]',
      dialogue: 'ch8-youth-watch',
      present: f => !!f.ch8QuddusArrived && !f.ch8MullaHusaynFell },

    // Spring: hunger, the grave, the white flag.
    { gridX: 16, gridY: 10, texture: 'ch8-grave',
      prompt: 'Kneel at the fresh grave  [E]',
      dialogue: 'ch8-grave',
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 12, gridY: 10, texture: 'ch8-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch8-quddus-oath',
      gate: { when: f => !!f.ch8TruceOffered, lockedDialogue: 'ch8-quddus-hunger' },
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 13, gridY: 17, texture: 'ch8-wounded',
      prompt: 'Speak with the Wounded Believer  [E]',
      dialogue: 'ch8-wounded',
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 16, gridY: 16, texture: 'ch8-young-companion',
      prompt: 'Sit with Riḍá at the cauldron  [E]',
      dialogue: 'ch8-youth-hunger',
      present: f => !!f.ch8MullaHusaynFell },
    { gridX: 4, gridY: 12, texture: 'ch8-officer',
      prompt: 'Meet the officer under the white flag  [E]',
      dialogue: 'ch8-truce',
      present: f => !!f.ch8SharedHunger && !f.ch8TruceOffered },
    { gridX: 3, gridY: 10, texture: 'ch8-truce-flag',
      prompt: 'Look at the white flag  [E]',
      dialogue: 'ch8-truce-flag',
      present: f => !!f.ch8SharedHunger },
  ],
  exits: [
    { fromX: 0, fromY: 13, dx: -1, dy: 0,
      targetScene: 'Ch8ForestRoad', targetSpawnX: 30, targetSpawnY: 9,
      label: '← Back along the forest road' },
  ],
  ambience: {
    wash: { color: 0x5c6a80, alpha: 0.42 },
    lights: [
      { gridX: 17, gridY: 16, radius: 110, color: 0xff9a40, intensity: 0.6 },
      { gridX: 27, gridY: 9, radius: 100, color: 0xff8a30, intensity: 0.5 },
      { gridX: 28, gridY: 16, radius: 100, color: 0xff8a30, intensity: 0.5 },
      { gridX: 14, gridY: 11, radius: 90, color: 0xffe0a0, intensity: 0.35 },
    ],
    particles: 'rain', music: 'siege',
    vignette: 0.6,
  },
};
