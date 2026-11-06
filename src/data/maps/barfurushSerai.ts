import type { FlagState } from '../../dialogue/types';
import { SERAI_DOOR } from './barfurushMaydan';
import { bfEvening, bfMorning, bfShutIn } from './barfurushPhases';
import type { DecorSpec, MapAmbience, MapDefinition, NpcSpec } from './types';

/**
 * The caravanserai on the Sabzih-Maydán of Bárfurúsh, drawn cut away like
 * the road serai of chapter 2: the arcade of lodging rooms along the two
 * back sides, a platform before them, and the court where the companions
 * have led in their horses. There is no pool, and no water: the town would
 * sell none. A ladder of poles leans against the back arcade for the roof.
 * At sunset three young men go up it, one after another, to give the call
 * to prayer, and are laid in the shade of the west arcade. In the evening
 * two Kháns of the town come in on foot with a Qur'án.
 *
 * Layout: arcade on y = 0 and x = 0; the ladder at (9, 1); Mullá Ḥusayn at
 * (12, 5); the three laid on the west platform at (1, 6), (1, 9), (1, 12);
 * the horses on the east side; the gate out at (10, 15).
 */

const W = 20;
const H = 16;
const GATE_X = 10;
const LADDER = { x: 9, y: 1 } as const;
const MH = { x: 12, y: 5 } as const;

function arcade(): DecorSpec[] {
  const lit = (f: FlagState) => !!f.bfThirdFell;
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) {
    const texture = x === 0 ? 'ch2-serai-window' : 'ch2-serai-bay';
    out.push({ gridX: x, gridY: 0, texture, blocks: true });
  }
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'ch2-serai-bay', blocks: true });
  // Lamps lit in the arcade after dark.
  out.push(...[[3, 1], [16, 1], [1, 4]].map(([gridX, gridY]) => ({ gridX: gridX!, gridY: gridY!, texture: 'lamp', blocks: true, present: lit })));
  return out;
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const COURT: DecorSpec[] = [
  // The companions' horses, kept when everything else was left on the road.
  ...block('kulayn-horse', [[17, 12], [18, 8]]),
  ...block('kulayn-horse-grey', [[15, 13], [18, 4]]),
  // Companions resting along the platform, and at prayer once the gates are shut.
  ...loose('ch8-bedroll', [[5, 1], [13, 1], [1, 3], [7, 2]]),
  ...block('ch8-kneeling-companions', [[6, 9], [8, 12]], f => !!f.bfGatesShut && !f.bfOathSworn),
  ...block('ch8-kneeling-companions', [[13, 2], [3, 13]], f => !f.bfOathSworn),
  ...block('crowd', [[16, 2], [2, 7]], f => !f.bfOathSworn),
  ...block('ch2-tea-travellers', [[15, 4]], bfEvening),
  // An empty trough by the horses.
  ...block('ch3-water-cask', [[16, 10]]),
];

/** The ladder: one story object, its tree changing with each who climbs. */
function ladder(): NpcSpec[] {
  const at = { gridX: LADDER.x, gridY: LADDER.y, texture: 'zanjan-ladder', prompt: 'Hold the ladder  [E]' };
  return [
    { ...at, prompt: 'Look at the ladder  [E]', dialogue: 'bf-ladder-before', present: f => !f.bfCallAsked },
    { ...at, dialogue: 'bf-ladder-first', present: f => !!f.bfCallAsked && !f.bfFirstFell },
    { ...at, dialogue: 'bf-ladder-second', present: f => !!f.bfFirstFell && !f.bfSecondFell },
    { ...at, dialogue: 'bf-ladder-third', present: f => !!f.bfSecondFell && !f.bfThirdFell },
    { ...at, prompt: 'Look at the ladder  [E]', dialogue: 'bf-ladder-after', present: f => !!f.bfThirdFell },
  ];
}

/** The three laid on the west platform, each after he falls. */
function fallen(): NpcSpec[] {
  return [
    { gridX: 1, gridY: 6, flag: 'bfFirstFell', dialogue: 'bf-fallen-first' },
    { gridX: 1, gridY: 9, flag: 'bfSecondFell', dialogue: 'bf-fallen-second' },
    { gridX: 1, gridY: 12, flag: 'bfThirdFell', dialogue: 'bf-fallen-third' },
  ].map(({ gridX, gridY, flag, dialogue }) => ({
    gridX, gridY, texture: 'bf-shroud', dialogue,
    prompt: 'Sit by the one who climbed  [E]',
    present: (f: FlagState) => !!f[flag],
  }));
}

function ambience(f: FlagState): MapAmbience {
  const lamps = [
    { gridX: 3, gridY: 1, radius: 100, color: 0xffb060, intensity: 0.4 },
    { gridX: 1, gridY: 9, radius: 120, color: 0xffb060, intensity: 0.32 },
    { gridX: 15, gridY: 4, radius: 110, color: 0xffa050, intensity: 0.4 },
  ];
  if (bfMorning(f)) {
    return { wash: { color: 0xb8c0d0, alpha: 0.3 }, particles: 'motes', music: 'road', sound: ['birds'], vignette: 0.6 };
  }
  if (bfEvening(f)) {
    return { wash: { color: 0x2a3560, alpha: 0.52 }, lights: lamps, music: 'sorrow', sound: ['crickets'], vignette: 0.7 };
  }
  if (bfShutIn(f)) {
    return { wash: { color: 0xc07848, alpha: 0.4 }, particles: 'motes', music: 'siege', sound: ['wind'], vignette: 0.66 };
  }
  return { wash: { color: 0xd8b090, alpha: 0.22 }, particles: 'dust', music: 'city', sound: ['wind'], vignette: 0.55 };
}

export const barfurushSeraiMap: MapDefinition = {
  key: 'BarfurushSerai',
  title: 'The Caravanserai of the Sabzih-Maydán',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    // The raised platform before the rooms.
    paintRect(1, 1, W - 1, 1, 'stone');
    paintRect(1, 1, 1, H - 1, 'stone');
    // The trodden way in from the gate.
    paintRect(GATE_X - 1, 10, 3, H - 10, 'path');
  },
  buildings: [],
  decor: [...arcade(), ...COURT],
  npcs: [
    ...ladder(),
    ...fallen(),
    // Mullá Ḥusayn in the court: at sunset, then in the evening with his guests.
    { gridX: MH.x, gridY: MH.y, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-waiting',
      gate: { when: f => !!f.bfCallAsked, lockedDialogue: 'bf-mh-call' },
      present: bfShutIn },
    { gridX: MH.x, gridY: MH.y, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-evening',
      present: bfEvening },
    { gridX: 5, gridY: 4, texture: 'bf-youth',
      prompt: 'Speak with the Youth by the Wall  [E]',
      dialogue: 'bf-youth-ready',
      gate: { when: f => !!f.bfCallAsked, lockedDialogue: 'bf-youth' },
      present: f => !f.bfFirstFell },
    { gridX: 4, gridY: 9, texture: 'ch8-young-companion',
      prompt: 'Speak with Riḍá  [E]',
      dialogue: 'bf-rida-night',
      gate: { when: f => !!f.bfThirdFell, lockedDialogue: 'bf-rida-serai' },
      present: f => !f.bfOathSworn },
    // The notables, come on foot with a Qur'án.
    { gridX: 14, gridY: 9, texture: 'bf-abbas-quli',
      prompt: 'Speak with ʿAbbás-Qulí Khán  [E]',
      dialogue: 'bf-abbas-quli',
      present: bfEvening },
    { gridX: 16, gridY: 6, texture: 'bf-mustafa-khan',
      prompt: 'Speak with Ḥájí Muṣṭafá Khán  [E]',
      dialogue: 'bf-mustafa-khan',
      present: bfEvening },
  ],
  exits: [
    { fromX: GATE_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'BarfurushMaydan', targetSpawnX: SERAI_DOOR.x, targetSpawnY: SERAI_DOOR.y + 1,
      label: '↓ Out through the gate to the square',
      requires: f => !bfShutIn(f),
      lockedLabel: 'The gates are shut and barred' },
  ],
  ambience,
};
