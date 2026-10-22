import { ILKHANI_DOOR } from './city';
import type { DecorSpec, MapDefinition } from './types';

/**
 * Inside the Masjid-i-Ílkhání: the prayer hall at lamp-lighting, where
 * Mullá Ḥusayn's brother and nephew wait for him. A cut-away room: the
 * qibla wall with its mihrab along the back, the west wall down the left,
 * the doorway back to the court in front.
 */

const W = 14;
const H = 12;
const MIHRAB_X = 7;

function hallWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) {
    out.push({ gridX: x, gridY: 0, texture: x === MIHRAB_X ? 'interior-mihrab' : 'interior-wall', blocks: true });
  }
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'interior-wall', blocks: true });
  return out;
}

/** Rows of prayer carpets facing the qibla. */
function prayerRows(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (const y of [5, 7, 9]) {
    for (let x = 3; x <= 11; x += 2) out.push({ gridX: x, gridY: y, texture: 'rug', blocks: false });
  }
  return out;
}

export const ch1IlkhaniMosqueMap: MapDefinition = {
  key: 'Ch1IlkhaniMosque',
  title: 'The Masjid-i-Ílkhání',
  width: W,
  height: H,
  spawn: { x: 7, y: 10 },
  interior: true,
  build: ({ paintRect, block }) => {
    paintRect(0, 0, W, H, 'floor');
    // The minbar's stair climbs back from (9, 3) to the qibla wall.
    block(9, 1);
    block(9, 2);
  },
  buildings: [],
  decor: [
    ...hallWalls(),
    ...prayerRows(),
    // The minbar beside the mihrab, lamps along the walls.
    { gridX: 9, gridY: 3, texture: 'ch4-pulpit', blocks: true },
    { gridX: 2, gridY: 1, texture: 'lamp', blocks: true },
    { gridX: 12, gridY: 1, texture: 'lamp', blocks: true },
    { gridX: 1, gridY: 6, texture: 'lamp', blocks: true },
    // The travellers' corner by the west wall.
    { gridX: 1, gridY: 9, texture: 'ch2-bundles', blocks: true },
    { gridX: 2, gridY: 10, texture: 'rug', blocks: false },
    // A student's place on the floor: felt mat, lap board, pen case and inkwell.
    { gridX: 12, gridY: 9, texture: 'floor-writing-board', blocks: true },
  ],
  npcs: [
    { gridX: 2, gridY: 9, texture: 'ch1-sleeping-nephew',
      prompt: 'Look at the sleeping traveller  [E]',
      dialogue: 'ch1-ilkhani-nephew' },
    { gridX: 3, gridY: 10, texture: 'ch1-brother',
      prompt: 'Speak with Mullá Ḥusayn\'s Brother  [E]',
      dialogue: 'ch1-brother' },
    { gridX: 11, gridY: 2, texture: 'ch1-ilkhani-attendant',
      prompt: 'Speak with the Mosque Attendant  [E]',
      dialogue: 'ch1-ilkhani-attendant' },
    { gridX: 12, gridY: 8, texture: 'ch1-ilkhani-student',
      prompt: 'Speak with the Student  [E]',
      dialogue: 'ch1-ilkhani-student' },
  ],
  exits: [
    { fromX: 7, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'City', targetSpawnX: ILKHANI_DOOR.x, targetSpawnY: ILKHANI_DOOR.y + 1,
      label: '↓ Out to the mosque court' },
  ],
  ambience: {
    wash: { color: 0xc08050, alpha: 0.38 },
    particles: 'motes', music: 'night', sound: [],
    vignette: 0.6,
    lights: [
      { gridX: MIHRAB_X, gridY: 1, radius: 110, color: 0xffd090, intensity: 0.35 },
      { gridX: 2, gridY: 9, radius: 90, color: 0xffb860, intensity: 0.3 },
    ],
  },
};
