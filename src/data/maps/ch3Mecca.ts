import type { BuildingSpec, DecorSpec, MapDefinition } from './types';

/**
 * Chapter 3, Dhu'l-Ḥijjah 1260 (December 1844), late afternoon: the Sacred
 * Mosque at Mecca. Domed colonnades enclose a sanded court; at its heart the
 * paved ring of circumambulation around the Kaʿba, with the well of Zamzam
 * and the Station of Abraham beside it. The Jidda road enters from the west.
 *
 * The proclamation is reached at the "courtyard hush" by the Kaʿba's door;
 * the Báb is never a character on the map.
 */

const WIDTH = 30;
const HEIGHT = 26;
const WALL_W = 5;
const WALL_E = 28;
const WALL_N = 2;
const WALL_S = 23;
const GATE_Y = 13;

const CORNERS = new Set([`${WALL_W},${WALL_N}`, `${WALL_E},${WALL_N}`, `${WALL_W},${WALL_S}`, `${WALL_E},${WALL_S}`]);

/** Colonnade bays around the court, leaving the corners for minarets and a gap for the gate. */
function colonnade(): BuildingSpec[] {
  const cells: Array<[number, number]> = [];
  for (let x = WALL_W; x <= WALL_E; x++) cells.push([x, WALL_N], [x, WALL_S]);
  for (let y = WALL_N + 1; y < WALL_S; y++) {
    if (y !== GATE_Y) cells.push([WALL_W, y]);
    cells.push([WALL_E, y]);
  }
  return cells
    .filter(([x, y]) => !CORNERS.has(`${x},${y}`))
    .map(([gridX, gridY]) => ({ gridX, gridY, w: 1, h: 1, texture: 'ch3-arcade' }));
}

const HILLS: DecorSpec[] = [
  [8, 0], [14, 1], [20, 0], [26, 1], [29, 6], [29, 15], [29, 21], [10, 25], [17, 24], [24, 25], [0, 3], [1, 21], [3, 24],
].map(([gridX, gridY]) => ({ gridX: gridX!, gridY: gridY!, texture: 'ch2-rock', blocks: true }));

export const ch3MeccaMap: MapDefinition = {
  key: 'Ch3Mecca',
  title: 'Mecca: the Sacred Mosque',
  width: WIDTH,
  height: HEIGHT,
  spawn: { x: 1, y: GATE_Y },
  build: ({ width, height, paintRect, paintPath }) => {
    paintRect(0, 0, width, height, 'sand');
    // Gravel court inside the colonnades.
    paintRect(WALL_W, WALL_N, WALL_E - WALL_W + 1, WALL_S - WALL_N + 1, 'path');
    // Paved ring of circumambulation around the Kaʿba.
    paintRect(12, 8, 10, 10, 'stone');
    // Paved walks from the gate and from the other colonnades to the ring.
    paintRect(WALL_W, GATE_Y, 7, 1, 'stone');
    paintRect(16, WALL_N + 1, 2, 5, 'stone');
    paintRect(16, 18, 2, 5, 'stone');
    paintRect(22, 12, 6, 2, 'stone');
    // The Jidda road arriving from the west.
    paintPath([[0, GATE_Y], [1, GATE_Y], [2, GATE_Y], [3, GATE_Y], [4, GATE_Y]]);
    paintPath([[2, 12], [2, 11], [2, 10], [3, 15], [3, 16]]);
  },
  buildings: [
    ...colonnade(),
    { gridX: 16, gridY: 12, w: 2, h: 2, texture: 'ch3-kaaba' },
  ],
  decor: [
    // Minarets at the corners of the colonnade
    { gridX: WALL_W, gridY: WALL_N, texture: 'ch3-minaret', blocks: true },
    { gridX: WALL_E, gridY: WALL_N, texture: 'ch3-minaret', blocks: true },
    { gridX: WALL_W, gridY: WALL_S, texture: 'ch3-minaret', blocks: true },
    { gridX: WALL_E, gridY: WALL_S, texture: 'ch3-minaret', blocks: true },
    // The hills of Mecca beyond the walls
    ...HILLS,
    // Outside the gate: camels from the Jidda road, lamps at the arch
    { gridX: 2, gridY: 9, texture: 'ch2-camel', blocks: true },
    { gridX: 3, gridY: 17, texture: 'ch2-camel', blocks: true },
    { gridX: 1, gridY: 16, texture: 'ch2-bundles', blocks: true },
    { gridX: 4, gridY: 12, texture: 'lamp', blocks: true },
    { gridX: 4, gridY: 14, texture: 'lamp', blocks: true },
    // Lamps around the ring of circumambulation
    { gridX: 12, gridY: 8, texture: 'lamp', blocks: true },
    { gridX: 21, gridY: 8, texture: 'lamp', blocks: true },
    { gridX: 12, gridY: 17, texture: 'lamp', blocks: true },
    { gridX: 21, gridY: 17, texture: 'lamp', blocks: true },
    { gridX: 15, gridY: 8, texture: 'lamp', blocks: true },
    { gridX: 18, gridY: 17, texture: 'lamp', blocks: true },
    // Zamzam and the Station of Abraham
    { gridX: 20, gridY: 10, texture: 'well', blocks: true },
    { gridX: 20, gridY: 13, texture: 'ch3-maqam', blocks: true },
    // Pilgrims circling the House
    { gridX: 14, gridY: 10, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 14, gridY: 15, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 18, gridY: 15, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 17, gridY: 10, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 13, gridY: 12, texture: 'crowd-shadow' },
    { gridX: 19, gridY: 16, texture: 'crowd-shadow' },
    // Pilgrims resting in the court and under the colonnades
    { gridX: 9, gridY: 6, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 24, gridY: 20, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 25, gridY: 6, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 9, gridY: 19, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 7, gridY: 9, texture: 'rug' },
    { gridX: 8, gridY: 17, texture: 'rug' },
    { gridX: 26, gridY: 9, texture: 'rug' },
    { gridX: 23, gridY: 17, texture: 'rug' },
    // Muḥíṭ's students under the north colonnade
    { gridX: 19, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 22, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true },
  ],
  npcs: [
    // Where the proclamation is heard, by the Kaʿba's door.
    { gridX: 18, gridY: 12, texture: 'ch3-courtyard-hush',
      prompt: 'Stand near the door of the House  [E]',
      dialogue: 'ch3-proclamation',
      gate: { when: f => !!f.ch3QuddusMecca, lockedDialogue: 'ch3-hush-waiting' } },
    // Quddús resting under the west colonnade, then waiting by the gate.
    { gridX: 7, gridY: 8, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch3-quddus-mecca',
      present: f => !f.ch3MuhitChallenge },
    { gridX: 6, gridY: 12, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús by the gate  [E]',
      dialogue: 'ch3-medina-road',
      present: f => !!f.ch3MuhitChallenge },
    { gridX: 8, gridY: 18, texture: 'ch2-mubarak',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch3-mubarak-mecca' },
    { gridX: 21, gridY: 10, texture: 'ch3-water-seller',
      prompt: 'Speak with the Zamzam Water-Seller  [E]',
      dialogue: 'ch3-zamzam-seller' },
    { gridX: 24, gridY: 17, texture: 'ch3-pilgrim',
      prompt: 'Speak with the Pilgrim from Lucknow  [E]',
      dialogue: 'ch3-pilgrim-question' },
    // Mírzá Muḥíṭ-i-Kirmání among his students; he leaves after the challenge.
    { gridX: 20, gridY: 4, texture: 'ch3-muhit',
      prompt: 'Speak with Mírzá Muḥíṭ-i-Kirmání  [E]',
      dialogue: 'ch3-muhit',
      gate: { when: f => !!f.ch3HeardProclamation, lockedDialogue: 'ch3-muhit-aloof' },
      present: f => !f.ch3MuhitChallenge },
  ],
  exits: [
    { fromX: 0, fromY: GATE_Y, dx: -1, dy: 0,
      targetScene: 'Ch3Ship', targetSpawnX: 14, targetSpawnY: 12,
      label: '← Back down the Jidda road to the ship' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.26 },
    lights: [
      { gridX: 18, gridY: 12, radius: 120, color: 0xf3d98a, intensity: 0.5 },
    ],
    particles: 'motes', music: 'pilgrimage',
    vignette: 0.5,
  },
};
