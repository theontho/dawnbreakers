import { carpet } from '../../assets/carpetObjects';
import type { DecorSpec, MapDefinition } from './types';

/**
 * Inside Quddús's pavilion in the west garden at Badasht, summer 1848: a
 * cut-away tent drawn roomier inside (about 8.4 by 7 m) than the pavilion
 * seen from the garden (`ch7-tent-quddus`), so there is space to move.
 * Printed cotton lining along the back walls, mattresses and bolsters against them, carpets laid
 * edge to edge on the earth, the pole and its lantern in the middle. The
 * man of Bárfurúsh who keeps the tent is here, and Quddús's papers on his
 * writing board on the floor by the door, where he writes seated as scribes
 * did; Quddús himself is out in his garden.
 */

const W = 7;
const H = 6;
const DOOR_X = 3;
const POLE = { x: 3, y: 3 } as const;
const KEEPER = { x: 5, y: 3 } as const;
const DESK = { x: 1, y: 4 } as const;

function liningWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'ch7-tent-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'ch7-tent-wall', blocks: true });
  return out;
}

const FURNISHED: ReadonlyArray<DecorSpec> = [
  { gridX: POLE.x, gridY: POLE.y, texture: 'ch7-tent-pole', blocks: true },
  // Mattresses and bolsters along the walls, where guests sit.
  ...[3, 4].map(x => ({ gridX: x, gridY: 1, texture: 'ch7-bolster', blocks: true })),
  ...[2, 3].map(y => ({ gridX: 1, gridY: y, texture: 'ch7-bolster-west', blocks: true })),
  // His few belongings in the corner; coffee kept warm for whoever comes; the ewer by the door.
  { gridX: 1, gridY: 1, texture: 'ch2-bundles', blocks: true },
  { gridX: 6, gridY: 1, texture: 'ch3-brazier', blocks: true },
  { gridX: 5, gridY: 5, texture: 'ch5-ewer', blocks: true },
];

/** Two carpets over the whole floor, the furnishings set on them. */
function carpets(): DecorSpec[] {
  return [carpet(1, 1, 3, 5, 'indigo'), carpet(4, 1, 3, 5, 'madder')];
}

export const ch7QuddusTentMap: MapDefinition = {
  key: 'Ch7QuddusTent',
  title: 'Quddús\'s Tent',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 1 },
  interior: true,
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
    { gridX: DESK.x, gridY: DESK.y, texture: 'floor-writing-board',
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
