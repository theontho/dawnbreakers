import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The Vakíl Mosque of Shíráz on a Friday in 1845, at true scale. Entered
 * from the street on the west through a tiled portal; a great courtyard
 * with its pool and orange trees, ringed by arcades of haft-rang tile; and
 * on the north the prayer hall, a forest of spiral columns under brick
 * vaults (shown cut away), with the qibla iwan and its mihrab in the back
 * wall and beside it the marble pulpit of fourteen steps, where the Báb is
 * brought to speak. He is never on the map: the pulpit is the threshold
 * the player faces.
 *
 * Layout (x runs east, y runs south):
 * - Prayer hall: y 0..9, columns every third cell (x 3..36, y 3, 6, 9).
 *   Qibla iwan x 18..21 in the back wall; the pulpit x 22, y 1..3, its foot at (22, 3).
 * - Court: x 3..35, y 10..30, the pool x 15..23, y 17..23.
 * - Arcades: west x 0..2 (the portal x 0..2, y 16..21, open through rows 18..19),
 *   east x 36..38, south y 31..33.
 */

const W = 39;
const H = 34;

const QIBLA = { gridX: 18, gridY: 0, w: 4, h: 1 };
const PULPIT = { x: 22, y: 3 };
const PORTAL = { gridX: 0, gridY: 16, w: 3, h: 6 };
/** The rows of the portal the street passage runs through. */
const PASSAGE = [18, 19];
const POOL = { x: 15, y: 17, w: 9, h: 7 };

function arcades(): BuildingSpec[] {
  const piece = (gridX: number, gridY: number): BuildingSpec => ({ gridX, gridY, w: 3, h: 3, texture: 'ch4-prayer-arch' });
  const out: BuildingSpec[] = [];
  for (const y of [10, 13, 22, 25, 28]) out.push(piece(0, y));
  for (let y = 10; y <= 28; y += 3) out.push(piece(36, y));
  for (let x = 0; x <= 36; x += 3) out.push(piece(x, 31));
  return out;
}

const buildings: BuildingSpec[] = [
  { ...QIBLA, texture: 'ch4-qibla-iwan' },
  { gridX: POOL.x, gridY: POOL.y, w: POOL.w, h: POOL.h, texture: 'ch4-vakil-pool' },
  // Drawn over its passage; the map blocks the rest of its footprint.
  { ...PORTAL, texture: 'ch4-vakil-portal', blocks: false },
  ...arcades(),
];

/** The hall's walls: the qibla wall at the back either side of its iwan, the west wall, the east end cut away. */
function hallWalls(): DecorSpec[] {
  const w = 'ch4-vakil-wall';
  return [
    ...wallRun(w, 0, 0, QIBLA.gridX - 1, 0),
    ...wallRun(w, QIBLA.gridX + QIBLA.w, 0, W - 1, 0),
    ...wallRun(w, 0, 1, 0, 9),
    ...wallRun(w, W - 1, 1, W - 1, 9),
  ];
}

/** The spiral columns, every third cell; each carries its arches back to the west and north. */
function columns(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (const y of [3, 6, 9]) {
    for (let x = 3; x <= 36; x += 3) out.push({ gridX: x, gridY: y, texture: 'ch4-spiral-column', blocks: true });
  }
  return out;
}

/** The congregation in rows on its carpets, facing the qibla; an aisle kept open to the pulpit. */
function congregation(): DecorSpec[] {
  const rugs: Array<[number, number]> = [
    [5, 4], [8, 4], [11, 4], [14, 4], [26, 4], [29, 4], [32, 4],
    [5, 7], [8, 7], [11, 7], [14, 7], [17, 7], [26, 7], [29, 7], [32, 7], [35, 7],
  ];
  const crowd: Array<[number, number]> = [
    [7, 5], [10, 5], [13, 5], [16, 5], [27, 5], [30, 5], [33, 5],
    [8, 8], [12, 8], [16, 8], [28, 8], [32, 8],
  ];
  return [
    ...rugs.map(([gridX, gridY]): DecorSpec => ({ gridX, gridY, texture: 'rug' })),
    ...crowd.map(([gridX, gridY]): DecorSpec => ({ gridX, gridY, texture: 'crowd', blocks: true })),
    { gridX: 19, gridY: 8, texture: 'crowd-shadow' },
    { gridX: 25, gridY: 8, texture: 'crowd-shadow' },
  ];
}

function court(): DecorSpec[] {
  const t = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });
  return [
    // Orange trees at the corners of the pool, plane trees shading the arcades
    t(13, 15, 'orange-tree'), t(25, 15, 'orange-tree'), t(13, 25, 'orange-tree'), t(25, 25, 'orange-tree'),
    t(6, 12, 'plane-tree'), t(32, 12, 'plane-tree'), t(6, 27, 'plane-tree'), t(31, 27, 'plane-tree'),
    // Ablution wells, lamps at the portal and the hall's edge
    t(9, 21, 'well'), t(29, 21, 'well'),
    t(4, 15, 'lamp'), t(4, 22, 'lamp'), t(20, 10, 'lamp'), t(26, 10, 'lamp'),
    // People spilling through the court
    t(21, 13, 'crowd'), t(10, 16, 'crowd'), t(18, 27, 'crowd'), t(28, 18, 'crowd'),
    { gridX: 14, gridY: 12, texture: 'crowd-shadow' },
    { gridX: 24, gridY: 27, texture: 'crowd-shadow' },
    { gridX: 16, gridY: 26, texture: 'ch1-birds' },
    { gridX: 30, gridY: 24, texture: 'rug' },
  ];
}

export const ch4VakilMosqueMap: MapDefinition = {
  key: 'Ch4VakilMosque',
  title: 'The Vakíl Mosque',
  width: W,
  height: H,
  trueScale: true,
  spawn: { x: 3, y: 18 },
  build: ({ paintRect, block }) => {
    paintRect(0, 0, W, H, 'stone');
    // The prayer hall's tiled floor, and the portal's passage
    paintRect(1, 1, W - 2, 9, 'floor');
    paintRect(0, PASSAGE[0]!, 4, PASSAGE.length, 'path');
    // The portal stands over its passage: block the rest of its footprint.
    for (let y = PORTAL.gridY; y < PORTAL.gridY + PORTAL.h; y++) {
      if (PASSAGE.includes(y)) continue;
      for (let x = PORTAL.gridX; x < PORTAL.gridX + PORTAL.w; x++) block(x, y);
    }
    // The pulpit runs back from its foot to the qibla wall.
    block(PULPIT.x, PULPIT.y - 1);
    block(PULPIT.x, PULPIT.y - 2);
  },
  buildings,
  decor: [...hallWalls(), ...columns(), ...congregation(), ...court()],
  npcs: [
    // The pulpit: the threshold of the Friday address
    { gridX: PULPIT.x, gridY: PULPIT.y, texture: 'ch4-pulpit',
      prompt: 'Stand before the marble pulpit  [E]',
      dialogue: 'ch4-vakil-pulpit',
      gate: {
        when: f => !!f.khalMet && !!f.quddusWitnessed && !!f.sadiqWitnessed,
        lockedDialogue: 'ch4-pulpit-waiting',
      } },
    { gridX: 20, gridY: 4, texture: 'ch4-imam-jumih',
      prompt: 'Speak with Shaykh Abú-Turáb, the Imám-Jumʿih  [E]',
      dialogue: 'ch4-imam-jumih' },
    { gridX: 24, gridY: 4, texture: 'ch4-officer',
      prompt: 'Hear the officer by the pulpit  [E]',
      dialogue: 'ch4-officer-mosque' },
    { gridX: 26, gridY: 13, texture: 'ch4-witness',
      prompt: 'Speak with the Mosque Witness  [E]',
      dialogue: 'ch4-mosque-witness' },
    { gridX: 8, gridY: 12, texture: 'npc-mulla',
      prompt: 'Speak with the Stern Mullá  [E]',
      dialogue: 'ch4-stern-mulla' },
    { gridX: 10, gridY: 24, texture: 'ch4-water-boy',
      prompt: 'Speak with the Water-Boy  [E]',
      dialogue: 'ch4-water-boy' },
  ],
  exits: [
    { fromX: 0, fromY: PASSAGE[0]!, dx: -1, dy: 0,
      targetScene: 'Ch4ShirazReturn', targetSpawnX: 52, targetSpawnY: 21,
      label: '← West along the street' },
  ],
  ambience: {
    particles: 'motes', music: 'court',
    lights: [
      { gridX: 21, gridY: 2, radius: 160, color: 0xfff0c0, intensity: 0.4 },
      { gridX: 3, gridY: 18, radius: 140, color: 0xffc070, intensity: 0.25 },
    ],
    vignette: 0.45,
  },
};
