import { carpet } from '../../assets/carpetObjects';
import type { FlagState } from '../../dialogue/types';
import { frMourning, frTeaching } from './forerunnersPhases';
import { KAZIM_GATE } from './karbilaQuarter';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';

/**
 * Karbilá, winter 1843 to 1844: the teaching room of Siyyid Káẓim's house,
 * drawn cut away, about 25 by 17 m (the same room where, two years later,
 * Qurratu'l-ʿAyn teaches from behind a curtain: see `qazvinKarbila.ts`). His
 * place is at the head of the room under the lamp, his books stacked by it;
 * his students sit on carpets before him. After his death the place stays
 * empty, and fewer students sit before it.
 *
 * Layout: walls along y = 0 and x = 0; the high window over his place; his
 * place at (9, 3); the doorway out to the lane at (9, 12).
 */

const W = 18;
const H = 13;
const DOOR_X = 9;
const PLACE = { x: 9, y: 3 } as const;

function roomWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'interior-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'interior-wall', blocks: true });
  return out;
}

/** Three long carpets laid side by side where the students sit. */
function carpets(): DecorSpec[] {
  return [carpet(3, 5, 4, 6, 'madder'), carpet(7, 5, 4, 6, 'indigo'), carpet(11, 5, 4, 6, 'madder')];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));

const FURNISHED: DecorSpec[] = [
  // His place: the cushion, his books, the lamp over it, the Qur'án stand.
  { gridX: PLACE.x, gridY: PLACE.y - 1, texture: 'rug' },
  ...block('ch8-oil-lamp', [[8, 1], [10, 1]]),
  ...block('ch2-bundles', [[11, 2]]),
  ...block('ch8-rahl', [[7, 2]]),
  // Shelves of books and the copyists' corner along the west wall.
  ...[3, 4, 5].map(y => ({ gridX: 1, gridY: y, texture: 'ch7-bolster-west', blocks: true })),
  ...block('writing-desk', [[2, 2]]),
  ...block('floor-writing-board', [[15, 11]]),
  ...block('ch8-oil-lamp', [[16, 4], [1, 12]]),
  ...block('ch9-water-jar', [[2, 11]]),
  ...[6, 7, 8, 9, 10].map(y => ({ gridX: 1, gridY: y, texture: 'ch7-bolster-west', blocks: true })),
  // The circle of students: full in his lifetime, thinner after.
  ...block('ch8-kneeling-companions', [[5, 6], [12, 6], [7, 9], [11, 9]], frTeaching),
  ...block('ch8-kneeling-companions', [[12, 7]], frMourning),
  // The young man from Khurásán's bundle, tied for the road.
  ...block('ch2-bundles', [[5, 10]], frMourning),
];

export const kazimHouseMap: MapDefinition = {
  key: 'KazimHouse',
  title: 'Karbilá: the House of Siyyid Káẓim',
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
    // His lifetime.
    { gridX: PLACE.x, gridY: PLACE.y, texture: 'forerunners-kazim',
      prompt: 'Take your place before Siyyid Káẓim  [E]',
      dialogue: 'fr-kazim-after',
      gate: { when: f => !!f.frHeardLesson, lockedDialogue: 'fr-kazim-lesson' },
      present: frTeaching },
    { gridX: 3, gridY: 4, texture: 'forerunners-copyist',
      prompt: 'Speak with the Copyist  [E]',
      dialogue: 'fr-copyist',
      present: frTeaching },
    { gridX: 14, gridY: 8, texture: 'forerunners-elder',
      prompt: 'Speak with the Elder Student  [E]',
      dialogue: 'fr-elder',
      present: frTeaching },

    // After his death.
    { gridX: PLACE.x, gridY: PLACE.y, texture: 'rug',
      prompt: 'Look at his empty place  [E]',
      dialogue: 'fr-empty-place',
      present: frMourning },
    { gridX: 7, gridY: 4, texture: 'forerunners-copyist',
      prompt: 'Sit with the Copyist  [E]',
      dialogue: 'fr-empty-place',
      present: frMourning },
    { gridX: 14, gridY: 8, texture: 'forerunners-elder',
      prompt: 'Speak with the Elder Student  [E]',
      dialogue: 'fr-elder-mourning',
      present: frMourning },
    { gridX: 6, gridY: 10, texture: 'forerunners-seeker',
      prompt: 'Speak with the Student from Khurásán  [E]',
      dialogue: 'fr-seeker-mourning',
      present: f => frMourning(f) && !f.frHeardSeeker },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'KarbilaQuarter', targetSpawnX: KAZIM_GATE.x, targetSpawnY: KAZIM_GATE.y + 1,
      label: '↓ Out to the lane' },
  ],
  ambience: f => houseAmbience(f),
};

/** Lamplight and a low winter sun through the high window; colder after. */
function houseAmbience(f: FlagState): MapAmbience {
  const lamp = (gridX: number, gridY: number) => ({ gridX, gridY, radius: 130, color: 0xffc070, intensity: 0.42 });
  const ray = { gridX: PLACE.x, gridY: PLACE.y + 1, radius: 110, color: 0xfff0c8, intensity: 0.38 };
  if (frMourning(f)) {
    return {
      wash: { color: 0x6a6070, alpha: 0.4 },
      lights: [lamp(8, 1), ray],
      particles: 'motes', music: 'sorrow', sound: ['wind'], vignette: 0.66,
    };
  }
  return {
    wash: { color: 0x8a6a50, alpha: 0.28 },
    lights: [lamp(8, 1), lamp(10, 1), lamp(16, 4), ray],
    particles: 'motes', music: 'dusk', sound: ['breeze'], vignette: 0.58,
  };
}
