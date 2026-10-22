import { RECEPTION_DOOR } from './ch5MutamidPalace';
import type { DecorSpec, MapDefinition } from './types';

/**
 * The Palace of the Sun, Iṣfahán, winter 1846 to 1847: the Muʿtamid's
 * reception room on the ground floor of the chancery house. Here, at a
 * gathering in the governor's residence, he asked for a proof of the
 * specific mission of Muḥammad, and the treatise was written on the spot,
 * on a lap board, in under two hours. Its writer is never on the map; the
 * room keeps the place, the copy, and the scribe who is still copying it.
 *
 * At true scale the room is about 10 by 7 m, the ground floor of the house
 * seen from the court (`town-house`, 6 x 5 cells): plastered walls along the
 * back (y 0) and the west side (x 0), bolsters round the walls for the
 * guests, carpets on the tiled floor, the doorway out to the court in front.
 */

const W = 8;
const H = 6;
const DOOR_X = 4;
const TREATISE = { x: 3, y: 2 } as const;
const SCRIBE = { x: 6, y: 3 } as const;
const LAMPS = [{ x: 1, y: 1 }, { x: 7, y: 1 }] as const;

function roomWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'interior-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'interior-wall', blocks: true });
  return out;
}

const FURNISHED: ReadonlyArray<DecorSpec> = [
  // Bolsters along the walls, where the governor and the learned sat.
  ...[2, 3, 4, 5, 6].map(x => ({ gridX: x, gridY: 1, texture: 'ch7-bolster', blocks: true })),
  ...[2, 3].map(y => ({ gridX: 1, gridY: y, texture: 'ch7-bolster-west', blocks: true })),
  ...LAMPS.map(l => ({ gridX: l.x, gridY: l.y, texture: 'ch8-oil-lamp', blocks: true })),
  // The scribe's own place, the copies under way; the ewer by the door.
  { gridX: SCRIBE.x - 1, gridY: SCRIBE.y, texture: 'floor-writing-board', blocks: true },
  { gridX: 7, gridY: 3, texture: 'ch2-bundles', blocks: true },
  { gridX: 1, gridY: 5, texture: 'ch5-ewer', blocks: true },
];

/** One great carpet's worth of rugs across the middle of the room. */
function carpets(): DecorSpec[] {
  const taken = new Set(FURNISHED.map(d => `${d.gridX},${d.gridY}`));
  [TREATISE, SCRIBE].forEach(c => taken.add(`${c.x},${c.y}`));
  const out: DecorSpec[] = [];
  for (let y = 2; y < H - 1; y++) {
    for (let x = 2; x < W - 1; x++) {
      if (taken.has(`${x},${y}`)) continue;
      out.push({ gridX: x, gridY: y, texture: (x + y) % 2 ? 'ch7-carpet-madder' : 'ch7-carpet-indigo' });
    }
  }
  return out;
}

export const ch5ReceptionRoomMap: MapDefinition = {
  key: 'Ch5ReceptionRoom',
  title: 'The Palace of the Sun, the Reception Room',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'floor');
  },
  buildings: [],
  decor: [...roomWalls(), ...carpets(), ...FURNISHED],
  npcs: [
    { gridX: TREATISE.x, gridY: TREATISE.y, texture: 'floor-writing-board',
      prompt: 'Read beside the writing board  [E]',
      dialogue: 'ch5-treatise' },
    { gridX: SCRIBE.x, gridY: SCRIBE.y, texture: 'ch5-scribe',
      prompt: 'Speak with the Palace Scribe  [E]',
      dialogue: 'ch5-scribe' },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch5MutamidPalace', targetSpawnX: RECEPTION_DOOR.x, targetSpawnY: RECEPTION_DOOR.y + 1,
      label: '↓ Out to the chancery court' },
  ],
  ambience: {
    wash: { color: 0xa07858, alpha: 0.24 },
    lights: [
      ...LAMPS.map(l => ({ gridX: l.x, gridY: l.y, radius: 150, color: 0xffc070, intensity: 0.5 })),
      { gridX: TREATISE.x, gridY: TREATISE.y, radius: 80, color: 0xffd090, intensity: 0.3 },
    ],
    particles: 'motes', music: 'court',
    vignette: 0.45,
  },
};
