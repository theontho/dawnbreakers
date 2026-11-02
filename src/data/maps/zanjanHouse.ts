import type { FlagState } from '../../dialogue/types';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';
import { ZJ_HOUSE_DOOR } from './zanjanFort';
import { zjEnd } from './zanjanPhases';

/**
 * Ḥujjat's house in the fort of ʿAlí-Mardán Khán, 1850: the upper room
 * over the little court, about 14 by 10 m, drawn cut away. Bolsters along
 * the walls for the companions who come to him, carpets, the cradle of his
 * infant son Hádí by the brazier where his wife Khadíjih sits. At the end,
 * after the cannon-ball, the east end of the room lies open to the sky,
 * and Ḥujjat lies wounded on his mattress by the west wall.
 *
 * Layout: walls along y = 0 and x = 0; the doorway down to the court at
 * (5, 7). The cradle at (7, 2), the brazier at (6, 2); the broken end
 * x 8..9, y 1..3; Ḥujjat's mattress at (2, 4).
 */

const W = 10;
const H = 8;
const DOOR_X = 5;
const CRADLE = { x: 7, y: 2 } as const;

const notEnd = (f: FlagState) => !zjEnd(f);

function roomWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) {
    const broken = x >= 8;
    out.push({ gridX: x, gridY: 0, texture: 'interior-wall', blocks: true, ...(broken ? { present: notEnd } : {}) });
    if (broken) out.push({ gridX: x, gridY: 0, texture: 'zanjan-rubble', blocks: true, present: zjEnd });
  }
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'interior-wall', blocks: true });
  return out;
}

const FURNISHED: DecorSpec[] = [
  ...[2, 3, 4, 5].map(x => ({ gridX: x, gridY: 1, texture: 'ch7-bolster', blocks: true })),
  { gridX: 1, gridY: 2, texture: 'ch7-bolster-west', blocks: true },
  { gridX: 1, gridY: 1, texture: 'ch8-oil-lamp', blocks: true },
  { gridX: 9, gridY: 6, texture: 'ch8-oil-lamp', blocks: true },
  { gridX: 6, gridY: 2, texture: 'ch3-brazier', blocks: true, present: notEnd },
  { gridX: 1, gridY: 6, texture: 'ch5-ewer', blocks: true },
  { gridX: 8, gridY: 5, texture: 'ch2-bundles', blocks: true },
  // The end: fallen brick where the east wall stood, a cold shaft of daylight, the brazier overturned.
  { gridX: 8, gridY: 1, texture: 'zanjan-rubble', blocks: true, present: zjEnd },
  { gridX: 9, gridY: 2, texture: 'zanjan-rubble', blocks: true, present: zjEnd },
  { gridX: 8, gridY: 3, texture: 'ch10-light-shaft', present: zjEnd },
];

function carpets(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let y = 2; y < 6; y++) {
    for (let x = 2; x < 7; x++) {
      if (x === 6 && y === 2) continue;
      out.push({ gridX: x, gridY: y, texture: (x + y) % 2 ? 'ch7-carpet-madder' : 'ch7-carpet-indigo' });
    }
  }
  return out;
}

export const zanjanHouseMap: MapDefinition = {
  key: 'ZanjanHouse',
  title: 'Ḥujjat\'s House',
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
    { gridX: 6, gridY: 3, texture: 'zanjan-khadijih',
      prompt: 'Speak with Khadíjih  [E]',
      dialogue: 'zj-khadijih',
      present: notEnd },
    { gridX: CRADLE.x, gridY: CRADLE.y, texture: 'zanjan-cradle',
      prompt: 'Look at the cradle  [E]',
      dialogue: 'zj-cradle',
      present: notEnd },
    // The end.
    { gridX: CRADLE.x, gridY: CRADLE.y, texture: 'zanjan-cradle',
      prompt: 'Look at the empty cradle  [E]',
      dialogue: 'zj-broken-room',
      present: zjEnd },
    { gridX: 2, gridY: 4, texture: 'zanjan-hujjat-wounded',
      prompt: 'Sit beside Ḥujjat  [E]',
      dialogue: 'zj-hujjat-last',
      gate: { when: f => !!f.zjSawBrokenRoom, lockedDialogue: 'zj-hujjat-resting' },
      present: zjEnd },
    { gridX: 5, gridY: 5, texture: 'zanjan-umm-ashraf',
      prompt: 'Speak with Umm-i-Ashraf  [E]',
      dialogue: 'zj-umm-ashraf-end',
      present: zjEnd },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'ZanjanFort', targetSpawnX: ZJ_HOUSE_DOOR.x, targetSpawnY: ZJ_HOUSE_DOOR.y + 1,
      label: '↓ Down to the court' },
  ],
  ambience: f => houseAmbience(f),
};

function houseAmbience(f: FlagState): MapAmbience {
  const lamp = (gridX: number, gridY: number) => ({ gridX, gridY, radius: 130, color: 0xffc070, intensity: 0.45 });
  if (zjEnd(f)) {
    return {
      wash: { color: 0x3a3c48, alpha: 0.5 },
      lights: [lamp(1, 1), { gridX: 8, gridY: 3, radius: 120, color: 0xc8d4e8, intensity: 0.35 }],
      particles: 'snow', music: 'sorrow', sound: ['wind'], vignette: 0.72,
    };
  }
  return {
    wash: { color: 0x8a6a50, alpha: 0.32 },
    lights: [lamp(1, 1), lamp(9, 6), { gridX: 6, gridY: 2, radius: 90, color: 0xff9a40, intensity: 0.45 }],
    particles: 'motes', music: 'night', sound: ['crickets'], vignette: 0.62,
  };
}
