import type { FlagState } from '../../dialogue/types';
import { NZ_MOSQUE_DOOR } from './nayrizQuarter';
import { nzArrival, nzGathering } from './nayrizPhases';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';

/**
 * Inside the masjid of Chinár-Súkhtih, Nayríz, 1850: a plain neighbourhood
 * prayer hall, about 20 by 17 m, drawn cut away. On the forenoon Vaḥíd
 * comes in from the road the hall is packed to the walls; in the nights
 * after, it is lamplit and half empty, and he sits writing by the pulpit.
 *
 * Layout: the qibla wall along y = 0 with its mihrab at x = 7, the pulpit at
 * (9, 3) with its stair behind; rows of the congregation at y 6 and 8,
 * and a shorter one by the door at y = 10, leaving an aisle down x 6..8;
 * the doorway out at (7, 11).
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

/** Prayer carpets the length of the hall; on the forenoon of the sermon, the congregation on them. */
function congregation(): DecorSpec[] {
  const out: DecorSpec[] = [];
  const rows: ReadonlyArray<readonly [number, readonly number[]]> = [
    [6, [2, 3, 4, 5, 9, 10, 11, 12]],
    [8, [2, 3, 4, 5, 9, 10, 11, 12]],
    [10, [3, 4, 10, 11]],
  ];
  for (const [y, xs] of rows) {
    for (const x of xs) {
      out.push({ gridX: x, gridY: y, texture: 'rug' });
      out.push({ gridX: x, gridY: y, texture: 'ch8-kneeling-companions', blocks: true, present: nzArrival });
    }
  }
  return out;
}

export const nayrizMosqueMap: MapDefinition = {
  key: 'NayrizMosque',
  title: 'The Masjid of Chinár-Súkhtih',
  width: W,
  height: H,
  spawn: { x: MIHRAB_X, y: H - 2 },
  interior: true,
  build: ({ paintRect, block }) => {
    paintRect(0, 0, W, H, 'floor');
    // The pulpit's stair climbs back from (9, 3) to the qibla wall.
    block(9, 1);
    block(9, 2);
  },
  buildings: [],
  decor: [
    ...hallWalls(),
    ...congregation(),
    { gridX: 9, gridY: 3, texture: 'ch4-pulpit', blocks: true },
    { gridX: 2, gridY: 1, texture: 'lamp', blocks: true },
    { gridX: 12, gridY: 1, texture: 'lamp', blocks: true },
    { gridX: 1, gridY: 4, texture: 'lamp', blocks: true },
    // Travellers' shoes and bundles by the door; on the nights after, the writing-board by the pulpit.
    { gridX: 1, gridY: 10, texture: 'ch2-bundles', blocks: true },
    { gridX: 12, gridY: 10, texture: 'ch9-water-jar', blocks: true },
    { gridX: 11, gridY: 3, texture: 'floor-writing-board', present: nzGathering },
  ],
  npcs: [
    { gridX: 8, gridY: 4, texture: 'ch4-vahid',
      prompt: 'Listen to Vaḥíd  [E]',
      dialogue: 'nz-vahid-sermon',
      present: nzArrival },
    { gridX: 10, gridY: 4, texture: 'ch4-vahid',
      prompt: 'Speak with Vaḥíd  [E]',
      dialogue: 'nz-vahid-letter',
      present: f => nzGathering(f) && !f.nzLetterDelivered },
  ],
  exits: [
    { fromX: MIHRAB_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'NayrizQuarter', targetSpawnX: NZ_MOSQUE_DOOR.x, targetSpawnY: NZ_MOSQUE_DOOR.y + 1,
      label: '↓ Out to the square' },
  ],
  ambience: f => mosqueAmbience(f),
};

function mosqueAmbience(f: FlagState): MapAmbience {
  if (nzArrival(f)) {
    return {
      wash: { color: 0xc89060, alpha: 0.26 },
      lights: [{ gridX: MIHRAB_X, gridY: 1, radius: 120, color: 0xffe0a0, intensity: 0.3 }],
      particles: 'motes', music: 'pilgrimage', sound: [], vignette: 0.55,
    };
  }
  return {
    wash: { color: 0x3a3450, alpha: 0.5 },
    lights: [
      { gridX: 10, gridY: 3, radius: 110, color: 0xffc070, intensity: 0.45 },
      { gridX: MIHRAB_X, gridY: 1, radius: 90, color: 0xffd090, intensity: 0.3 },
    ],
    particles: 'motes', music: 'night', sound: ['crickets'], vignette: 0.65,
  };
}
