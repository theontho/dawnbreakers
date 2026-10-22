import type { DecorSpec, MapDefinition } from './types';

/**
 * Inside Quddús's pavilion in the west garden at Badasht, summer 1848, at
 * true scale: a cut-away tent 5.6 by 4.2 m, the size of the pavilion seen
 * from the garden (`ch7-tent-quddus`, 4 x 3 cells). Printed cotton lining
 * along the back walls, mattresses and bolsters against them, carpets laid
 * edge to edge on the earth, the pole and its lantern in the middle. The
 * man of Bárfurúsh who keeps the tent is here, and Quddús's papers on a low
 * desk by the door; Quddús himself is out in his garden.
 */

const W = 5;
const H = 4;
const DOOR_X = 2;
const POLE = { x: 2, y: 2 } as const;
const KEEPER = { x: 4, y: 2 } as const;
const DESK = { x: 1, y: 3 } as const;

function liningWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'ch7-tent-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'ch7-tent-wall', blocks: true });
  return out;
}

const FURNISHED: ReadonlyArray<DecorSpec> = [
  { gridX: POLE.x, gridY: POLE.y, texture: 'ch7-tent-pole', blocks: true },
  // Mattresses and bolsters along the walls, where guests sit.
  ...[2, 3].map(x => ({ gridX: x, gridY: 1, texture: 'ch7-bolster', blocks: true })),
  { gridX: 1, gridY: 2, texture: 'ch7-bolster-west', blocks: true },
  // His few belongings in the corner; coffee kept warm for whoever comes; the ewer by the door.
  { gridX: 1, gridY: 1, texture: 'ch2-bundles', blocks: true },
  { gridX: 4, gridY: 1, texture: 'ch3-brazier', blocks: true },
  { gridX: 4, gridY: 3, texture: 'ch5-ewer', blocks: true },
];

/** Carpets on every open cell, alternating, so the floor reads as overlapping rugs. */
function carpets(): DecorSpec[] {
  const taken = new Set(FURNISHED.map(d => `${d.gridX},${d.gridY}`));
  [DESK, KEEPER].forEach(c => taken.add(`${c.x},${c.y}`));
  const out: DecorSpec[] = [];
  for (let y = 1; y < H; y++) {
    for (let x = 1; x < W; x++) {
      if (taken.has(`${x},${y}`)) continue;
      out.push({ gridX: x, gridY: y, texture: (x + y) % 2 ? 'ch7-carpet-indigo' : 'ch7-carpet-madder' });
    }
  }
  return out;
}

export const ch7QuddusTentMap: MapDefinition = {
  key: 'Ch7QuddusTent',
  title: 'Quddús\'s Tent',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 1 },
  interior: true,
  trueScale: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
  },
  buildings: [],
  decor: [...liningWalls(), ...carpets(), ...FURNISHED],
  npcs: [
    { gridX: KEEPER.x, gridY: KEEPER.y, texture: 'ch7-npc-barfurushi',
      prompt: 'Speak with the Man of Bárfurúsh  [E]',
      dialogue: 'ch7-tent-keeper-after',
      gate: { when: f => !!f.ch7WitnessedUnveiling, lockedDialogue: 'ch7-tent-keeper' } },
    { gridX: DESK.x, gridY: DESK.y, texture: 'writing-desk',
      prompt: 'Look at the papers on the low desk  [E]',
      dialogue: 'ch7-quddus-papers' },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch7BadashtCamp', targetSpawnX: 6, targetSpawnY: 22,
      label: '↓ Out to Quddús\'s garden' },
  ],
  ambience: {
    wash: { color: 0xc89060, alpha: 0.22 },
    lights: [
      { gridX: POLE.x, gridY: POLE.y, radius: 130, color: 0xffc070, intensity: 0.55 },
      { gridX: DESK.x, gridY: DESK.y, radius: 60, color: 0xffd090, intensity: 0.3 },
    ],
    particles: 'motes', music: 'garden', sound: ['crickets'],
    vignette: 0.4,
  },
};
