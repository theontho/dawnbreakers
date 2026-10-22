import type { BuildingSpec, DecorSpec, MapDefinition } from './types';

/**
 * Chapter 3, Dhu'l-Ḥijjah 1260 (December 1844), late afternoon: the Sacred
 * Mosque at Mecca, at true scale. Domed colonnades enclose a sanded court
 * some 38 m across, a minaret at each corner; at its heart the paved ring
 * of circumambulation around the Kaʿba (about 11 x 13 m, 13 m high), with
 * the well of Zamzam and the Station of Abraham before its door. The Jidda
 * road enters through the west colonnade.
 *
 * The proclamation is reached at the "courtyard hush" by the Kaʿba's door;
 * the Báb is never a character on the map.
 *
 * Layout (x runs east, y runs south):
 * - Colonnade: 3 x 3 domed bays round x 5..37, y 2..34; minarets at the corners.
 * - Gate: the gap in the west colonnade at y 17..19; the road runs out west.
 * - Court: x 8..34, y 5..31. The ring: x 12..29, y 9..27.
 * - Kaʿba: x 17..24, y 14..22, its door facing east onto (25, 20).
 */

const WIDTH = 41;
const HEIGHT = 38;
const BAY = 3;
const RING = { x0: 5, y0: 2, x1: 37, y1: 34 };
const GATE_Y = 18;
const KAABA = { gridX: 17, gridY: 14, w: 8, h: 9 };
const HUSH = { x: KAABA.gridX + KAABA.w, y: 20 };

/** Colonnade bays round the court, a minaret at each corner and the gate left open in the west side. */
function colonnade(): BuildingSpec[] {
  const out: BuildingSpec[] = [];
  const bay = (gridX: number, gridY: number, texture = 'ch3-arcade'): void => {
    out.push({ gridX, gridY, w: BAY, h: BAY, texture });
  };
  const xEast = RING.x1 - BAY + 1;
  const ySouth = RING.y1 - BAY + 1;
  for (const [x, y] of [[RING.x0, RING.y0], [xEast, RING.y0], [RING.x0, ySouth], [xEast, ySouth]] as const) {
    bay(x, y, 'ch3-minaret');
  }
  for (let x = RING.x0 + BAY; x < xEast; x += BAY) {
    bay(x, RING.y0);
    bay(x, ySouth);
  }
  for (let y = RING.y0 + BAY; y < ySouth; y += BAY) {
    if (GATE_Y < y || GATE_Y >= y + BAY) bay(RING.x0, y);
    bay(xEast, y);
  }
  return out;
}

const HILLS: DecorSpec[] = [
  [3, 0], [12, 0], [19, 1], [27, 0], [34, 1], [39, 3], [40, 11], [39, 19], [40, 27], [39, 33],
  [8, 37], [16, 36], [25, 37], [33, 36], [0, 2], [1, 8], [0, 28], [2, 33], [1, 36],
].map(([gridX, gridY]) => ({ gridX: gridX!, gridY: gridY!, texture: 'ch2-rock', blocks: true }));

/** Lamps on their posts round the ring of circumambulation. */
function ringLamps(): DecorSpec[] {
  const cells: Array<[number, number]> = [
    [12, 9], [18, 9], [24, 9], [29, 9], [29, 15], [29, 25], [12, 27], [18, 27], [24, 27], [29, 27], [12, 15], [12, 21],
  ];
  return cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'lamp', blocks: true }));
}

export const ch3MeccaMap: MapDefinition = {
  key: 'Ch3Mecca',
  title: 'Mecca: the Sacred Mosque',
  width: WIDTH,
  height: HEIGHT,
  spawn: { x: 1, y: GATE_Y },
  build: ({ width, height, paintRect, paintPath }) => {
    paintRect(0, 0, width, height, 'sand');
    // Gravel court inside the colonnades.
    paintRect(RING.x0 + BAY, RING.y0 + BAY, 27, 27, 'path');
    // Paved ring of circumambulation around the Kaʿba.
    paintRect(12, 9, 18, 19, 'stone');
    // Paved walks from the gate and from the other colonnades to the ring.
    paintRect(RING.x0, GATE_Y - 1, 7, 3, 'stone');
    paintRect(20, 5, 2, 4, 'stone');
    paintRect(20, 28, 2, 4, 'stone');
    paintRect(30, 17, 5, 2, 'stone');
    // The Jidda road arriving from the west.
    paintPath([[0, GATE_Y], [1, GATE_Y], [2, GATE_Y], [3, GATE_Y], [4, GATE_Y]]);
    paintPath([[2, 17], [2, 16], [2, 15], [3, 19], [3, 20], [3, 21]]);
  },
  buildings: [
    ...colonnade(),
    { ...KAABA, texture: 'ch3-kaaba' },
    // The Station of Abraham before the door.
    { gridX: 27, gridY: 16, w: 2, h: 2, texture: 'ch3-maqam' },
  ],
  decor: [
    // The hills of Mecca beyond the walls
    ...HILLS,
    // Outside the gate: camels from the Jidda road, lamps at the arch
    { gridX: 2, gridY: 13, texture: 'ch2-camel', blocks: true },
    { gridX: 3, gridY: 23, texture: 'ch2-camel', blocks: true },
    { gridX: 1, gridY: 22, texture: 'ch2-bundles', blocks: true },
    { gridX: 4, gridY: 16, texture: 'lamp', blocks: true },
    { gridX: 4, gridY: 20, texture: 'lamp', blocks: true },
    ...ringLamps(),
    // Zamzam, east of the House
    { gridX: 29, gridY: 22, texture: 'well', blocks: true },
    // Pilgrims circling the House
    { gridX: 15, gridY: 12, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 20, gridY: 12, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 15, gridY: 20, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 18, gridY: 24, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 23, gridY: 25, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 26, gridY: 23, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 26, gridY: 13, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 14, gridY: 16, texture: 'crowd-shadow' },
    { gridX: 21, gridY: 25, texture: 'crowd-shadow' },
    { gridX: 24, gridY: 12, texture: 'crowd-shadow' },
    // Pilgrims resting in the court before the colonnades
    { gridX: 10, gridY: 7, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 31, gridY: 7, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 31, gridY: 29, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 9, gridY: 29, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 8, gridY: 13, texture: 'rug' },
    { gridX: 11, gridY: 29, texture: 'rug' },
    { gridX: 32, gridY: 11, texture: 'rug' },
    { gridX: 30, gridY: 30, texture: 'rug' },
    // Muḥíṭ's students before the north colonnade
    { gridX: 20, gridY: 6, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 24, gridY: 6, texture: 'ch3-pilgrim-cluster', blocks: true },
  ],
  npcs: [
    // Where the proclamation is heard, by the Kaʿba's door.
    { gridX: HUSH.x, gridY: HUSH.y, texture: 'ch3-courtyard-hush',
      prompt: 'Stand near the door of the House  [E]',
      dialogue: 'ch3-proclamation',
      gate: { when: f => !!f.ch3QuddusMecca, lockedDialogue: 'ch3-hush-waiting' } },
    // Quddús resting before the west colonnade, then waiting by the gate.
    { gridX: 8, gridY: 14, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch3-quddus-mecca',
      present: f => !f.ch3MuhitChallenge },
    { gridX: 9, gridY: 16, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús by the gate  [E]',
      dialogue: 'ch3-medina-road',
      present: f => !!f.ch3MuhitChallenge },
    { gridX: 10, gridY: 25, texture: 'ch2-mubarak',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch3-mubarak-mecca' },
    { gridX: 28, gridY: 22, texture: 'ch3-water-seller',
      prompt: 'Speak with the Zamzam Water-Seller  [E]',
      dialogue: 'ch3-zamzam-seller' },
    { gridX: 34, gridY: 24, texture: 'ch3-pilgrim',
      prompt: 'Speak with the Pilgrim from Lucknow  [E]',
      dialogue: 'ch3-pilgrim-question' },
    // Mírzá Muḥíṭ-i-Kirmání among his students; he leaves after the challenge.
    { gridX: 22, gridY: 7, texture: 'ch3-muhit',
      prompt: 'Speak with Mírzá Muḥíṭ-i-Kirmání  [E]',
      dialogue: 'ch3-muhit',
      gate: { when: f => !!f.ch3HeardProclamation, lockedDialogue: 'ch3-muhit-aloof' },
      present: f => !f.ch3MuhitChallenge },
  ],
  exits: [
    { fromX: 0, fromY: GATE_Y, dx: -1, dy: 0,
      targetScene: 'Ch3Ship', targetSpawnX: 15, targetSpawnY: 13,
      label: '← Back down the Jidda road to the ship' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.26 },
    lights: [
      { gridX: HUSH.x, gridY: HUSH.y, radius: 170, color: 0xf3d98a, intensity: 0.5 },
    ],
    particles: 'motes', music: 'pilgrimage',
    vignette: 0.5,
  },
};
