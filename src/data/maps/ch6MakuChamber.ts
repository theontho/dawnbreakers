import { AMANUENSIS_DOOR } from './ch6Maku';
import type { DecorSpec, MapDefinition } from './types';

/**
 * Mákú, winter 1847 to 1848: the amanuensis's room, built against the east
 * wall of the castle, a wall's thickness from the chamber where the Báb is
 * held. That chamber is never shown or entered. Siyyid Ḥusayn of Yazd sits
 * here on a felt mat by a brazier and a lamp, his lap board on his knee,
 * taking down the Persian Bayán as it is dictated and copying the copies,
 * the finished quires wrapped in cloth for the saddlebags.
 *
 * At true scale the room is about 8.5 by 7 m, the size of the lodging seen
 * from the courtyard (`ch6-mountain-house`, 5 x 4 cells): limewashed mud
 * walls along the back (y 0) and the castle side (x 0), carpets on the
 * earth floor, the way out to the courtyard at the front.
 */

const W = 7;
const H = 6;
const DOOR_X = 3;
const LAMP = { x: 2, y: 1 } as const;
const BRAZIER = { x: 5, y: 3 } as const;
const PAGES = { x: 3, y: 2 } as const;
const AMANUENSIS = { x: 2, y: 3 } as const;

function roomWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'ch8-shrine-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'ch8-shrine-wall', blocks: true });
  return out;
}

const FURNISHED: ReadonlyArray<DecorSpec> = [
  // Saddle-cloths waiting for the quires to be sewn into them, the paper chest.
  { gridX: 1, gridY: 1, texture: 'ch2-bundles', blocks: true },
  { gridX: 6, gridY: 1, texture: 'ch3-sea-chest', blocks: true },
  { gridX: 5, gridY: 1, texture: 'ch7-bolster', blocks: true },
  { gridX: 1, gridY: 3, texture: 'ch7-bolster-west', blocks: true },
  { gridX: LAMP.x, gridY: LAMP.y, texture: 'ch8-oil-lamp', blocks: true },
  // The brazier that keeps the ink from freezing.
  { gridX: BRAZIER.x, gridY: BRAZIER.y, texture: 'ch3-brazier', blocks: true },
];

/** Carpets on every open cell, alternating, laid edge to edge over the earth floor. */
function carpets(): DecorSpec[] {
  const taken = new Set(FURNISHED.map(d => `${d.gridX},${d.gridY}`));
  [PAGES, AMANUENSIS].forEach(c => taken.add(`${c.x},${c.y}`));
  const out: DecorSpec[] = [];
  for (let y = 1; y < H; y++) {
    for (let x = 1; x < W; x++) {
      if (taken.has(`${x},${y}`)) continue;
      out.push({ gridX: x, gridY: y, texture: (x + y) % 2 ? 'ch7-carpet-indigo' : 'ch7-carpet-madder' });
    }
  }
  return out;
}

export const ch6MakuChamberMap: MapDefinition = {
  key: 'Ch6MakuChamber',
  title: 'Mákú, the Amanuensis\'s Room',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
  },
  buildings: [],
  decor: [...roomWalls(), ...carpets(), ...FURNISHED],
  npcs: [
    { gridX: PAGES.x, gridY: PAGES.y, texture: 'floor-writing-board',
      prompt: 'Read the fair copy on the copyist\'s mat  [E]',
      dialogue: 'ch6-bayan',
      gate: { when: f => !!f.ch6WardenSoftened && !!f.ch6MetAmanuensis, lockedDialogue: 'ch6-desk-closed' } },
    { gridX: AMANUENSIS.x, gridY: AMANUENSIS.y, texture: 'ch6-amanuensis',
      prompt: 'Speak with Siyyid Ḥusayn, the Amanuensis  [E]',
      dialogue: 'ch6-amanuensis' },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch6Maku', targetSpawnX: AMANUENSIS_DOOR.x, targetSpawnY: AMANUENSIS_DOOR.y + 1,
      label: '↓ Out to the courtyard' },
  ],
  ambience: {
    wash: { color: 0xb07850, alpha: 0.34 },
    lights: [
      { gridX: LAMP.x, gridY: LAMP.y, radius: 150, color: 0xffc070, intensity: 0.6 },
      { gridX: BRAZIER.x, gridY: BRAZIER.y, radius: 110, color: 0xff9a4a, intensity: 0.5 },
    ],
    particles: 'motes', music: 'mountain', sound: ['wind'],
    vignette: 0.5,
  },
};
