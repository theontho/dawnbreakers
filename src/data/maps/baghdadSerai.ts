import type { FlagState } from '../../dialogue/types';
import { BG_SERAI_GATE } from './baghdadQuay';
import { bgMorning, hallRounds } from './baghdadPhases';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';

/**
 * The hall of the governor's serai, Baghdád, January 1845: a long
 * audience room over the river, about 22 by 17 m, drawn cut away. Najíb
 * Páshá sits on his divan at the head; the Sunni divines of Baghdád on
 * the west side, the Shíʿí divines of Karbilá and Najaf on the east; the
 * prisoner stands between, in the middle of the carpets. The scribes'
 * desk is at the edge of it all, by the door, where the player kneels.
 *
 * Layout: walls along y = 0 and x = 0; the divan at (8, 2); the two
 * benches at x 3..4 and x 12..13, y 3..7; the prisoner's place at (8, 6);
 * the scribes' desk at (2, 10); the doorway out at (8, 12).
 */

const W = 16;
const H = 13;
const DOOR_X = 8;
export const BG_DESK = { x: 2, y: 10 } as const;

function hallWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'interior-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'interior-wall', blocks: true });
  return out;
}

function carpets(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let y = 2; y <= 8; y++) {
    for (let x = 2; x <= 14; x++) out.push({ gridX: x, gridY: y, texture: (x + y) % 2 ? 'ch7-carpet-madder' : 'ch7-carpet-indigo' });
  }
  return out;
}

const seated = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, present: bgMorning }));

const FURNISHED: DecorSpec[] = [
  // Bolsters along the west wall behind the Sunni bench.
  ...[3, 4, 5, 6, 7].map(y => ({ gridX: 1, gridY: y, texture: 'ch7-bolster-west', blocks: true })),
  // The two benches of divines, facing each other across the carpets.
  ...seated('bg-divines-sunni', [[3, 3], [3, 5], [3, 7]]),
  ...seated('bg-divines-shii', [[13, 3], [13, 5], [13, 7]]),
  { gridX: 8, gridY: 2, texture: 'bg-pasha-seated', blocks: true, present: bgMorning },
  // The prisoner's guards.
  { gridX: 7, gridY: 6, texture: 'bg-guard', blocks: true, present: bgMorning },
  { gridX: 9, gridY: 6, texture: 'bg-guard', blocks: true, present: bgMorning },
  // Lamps, braziers against the cold, the clerks' things.
  { gridX: 2, gridY: 1, texture: 'ch8-oil-lamp', blocks: true },
  { gridX: 14, gridY: 1, texture: 'ch8-oil-lamp', blocks: true },
  { gridX: 6, gridY: 10, texture: 'ch3-brazier', blocks: true },
  { gridX: 12, gridY: 10, texture: 'ch3-brazier', blocks: true },
  { gridX: 1, gridY: 11, texture: 'ch2-bundles', blocks: true },
  { gridX: 14, gridY: 11, texture: 'ch9-water-jar', blocks: true },
  // Once the court has risen, the desk is only a desk.
  { gridX: BG_DESK.x, gridY: BG_DESK.y, texture: 'writing-desk', blocks: true, present: f => !bgMorning(f) },
];

export const baghdadSeraiMap: MapDefinition = {
  key: 'BaghdadSerai',
  title: 'The Hall of the Serai',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'floor');
  },
  buildings: [],
  decor: [...hallWalls(), ...carpets(), ...FURNISHED],
  npcs: [
    // The scribes' desk: the player's place at the tribunal.
    { gridX: BG_DESK.x, gridY: BG_DESK.y, texture: 'writing-desk',
      prompt: 'Kneel at the scribes\' desk  [E]',
      dialogue: 'bg-tribunal',
      gate: { when: f => !!f.bgAtDesk && hallRounds(f) >= 1, lockedDialogue: 'bg-desk-wait' },
      present: bgMorning },
    { gridX: 3, gridY: 9, texture: 'bg-head-scribe',
      prompt: 'Speak with your Master  [E]',
      dialogue: 'bg-scribe',
      gate: { when: bgMorning, lockedDialogue: 'bg-scribe-after' } },
    { gridX: 5, gridY: 9, texture: 'bg-mufti-clerk',
      prompt: 'Speak with the Muftí\'s Clerk  [E]',
      dialogue: 'bg-clerk',
      present: bgMorning },
    { gridX: 11, gridY: 9, texture: 'bg-shii-student',
      prompt: 'Speak with the Student from Karbilá  [E]',
      dialogue: 'bg-student-hall',
      present: bgMorning },
    { gridX: 8, gridY: 6, texture: 'ch2-mulla-ali',
      prompt: 'Look at the prisoner  [E]',
      dialogue: 'bg-ali-hall',
      present: bgMorning },
    { gridX: 8, gridY: 2, texture: 'ch5-seat-of-honour',
      prompt: 'Look at the empty divan  [E]',
      dialogue: 'bg-divan',
      present: f => !bgMorning(f) },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'BaghdadQuay', targetSpawnX: BG_SERAI_GATE.x, targetSpawnY: BG_SERAI_GATE.y + 1,
      label: '↓ Down to the quay' },
  ],
  ambience: f => hallAmbience(f),
};

/** Winter daylight through the lattices, and the braziers; at evening, the hall empty and lamplit. */
function hallAmbience(f: FlagState): MapAmbience {
  if (bgMorning(f)) {
    return {
      wash: { color: 0xb89a78, alpha: 0.24 },
      lights: [
        { gridX: 6, gridY: 10, radius: 90, color: 0xff9a40, intensity: 0.3 },
        { gridX: 12, gridY: 10, radius: 90, color: 0xff9a40, intensity: 0.3 },
        { gridX: 8, gridY: 3, radius: 160, color: 0xfff0d0, intensity: 0.22 },
      ],
      particles: 'motes', music: 'court', sound: [], vignette: 0.55,
    };
  }
  return {
    wash: { color: 0x3a3450, alpha: 0.5 },
    lights: [{ gridX: 2, gridY: 9, radius: 110, color: 0xffc070, intensity: 0.45 }],
    particles: 'motes', music: 'sorrow', sound: [], vignette: 0.65,
  };
}
