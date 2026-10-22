import type { DecorSpec, MapDefinition } from './types';

/**
 * Inside Quddús's pavilion in the west garden at Badasht, summer 1848. A
 * cut-away tent: printed cotton lining along the back walls, mattresses and
 * bolsters against them, carpets laid edge to edge on the earth, the pole
 * and its lantern in the middle. The man of Bárfurúsh who keeps the tent is
 * here, and Quddús's papers on a low desk; Quddús himself is out in his
 * garden.
 */

const W = 9;
const H = 8;
const DOOR_X = 4;

function liningWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'ch7-tent-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'ch7-tent-wall', blocks: true });
  return out;
}

const FURNISHED: ReadonlyArray<DecorSpec> = [
  { gridX: DOOR_X, gridY: 3, texture: 'ch7-tent-pole', blocks: true },
  // Mattresses and bolsters along the walls, where guests sit.
  ...[2, 3, 4, 5].map(x => ({ gridX: x, gridY: 1, texture: 'ch7-bolster', blocks: true })),
  ...[3, 4, 5].map(y => ({ gridX: 1, gridY: y, texture: 'ch7-bolster-west', blocks: true })),
  // The ewer and basin by the door of the lining, his few belongings, water.
  { gridX: 1, gridY: 1, texture: 'ch5-ewer', blocks: true },
  { gridX: 7, gridY: 1, texture: 'ch2-bundles', blocks: true },
  { gridX: 8, gridY: 1, texture: 'ch9-water-jar', blocks: true },
  // Coffee kept warm for whoever comes.
  { gridX: 8, gridY: 4, texture: 'ch3-brazier', blocks: true },
];

/** Carpets on every open cell, alternating, so the floor reads as overlapping rugs. */
function carpets(): DecorSpec[] {
  const taken = new Set(FURNISHED.map(d => `${d.gridX},${d.gridY}`));
  ['2,4', '6,4'].forEach(k => taken.add(k)); // the desk and the keeper of the tent
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
  spawn: { x: DOOR_X, y: 6 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
  },
  buildings: [],
  decor: [...liningWalls(), ...carpets(), ...FURNISHED],
  npcs: [
    { gridX: 6, gridY: 4, texture: 'ch7-npc-barfurushi',
      prompt: 'Speak with the Man of Bárfurúsh  [E]',
      dialogue: 'ch7-tent-keeper-after',
      gate: { when: f => !!f.ch7WitnessedUnveiling, lockedDialogue: 'ch7-tent-keeper' } },
    { gridX: 2, gridY: 4, texture: 'writing-desk',
      prompt: 'Look at the papers on the low desk  [E]',
      dialogue: 'ch7-quddus-papers' },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch7BadashtCamp', targetSpawnX: 4, targetSpawnY: 15,
      label: '↓ Out to Quddús\'s garden' },
  ],
  ambience: {
    wash: { color: 0xc89060, alpha: 0.3 },
    lights: [
      { gridX: DOOR_X, gridY: 3, radius: 130, color: 0xffc070, intensity: 0.55 },
      { gridX: 2, gridY: 4, radius: 60, color: 0xffd090, intensity: 0.3 },
    ],
    particles: 'motes', music: 'garden', sound: ['crickets'],
    vignette: 0.6,
  },
};
