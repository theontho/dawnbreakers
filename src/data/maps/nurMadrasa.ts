import type { DecorSpec, MapDefinition, NpcSpec } from './types';
import { both, has, madrasaMorning, madrasaNight, madrasaRounds, not } from './nurPhases';

/**
 * Ṭihrán, summer 1844, at true scale: the court of the madrasa of Mírzá
 * Ṣáliḥ, called the madrasa of Pá-Minár, "the foot of the minaret". A
 * cut-away of the court: two storeys of students' cells run along the two
 * back sides, a raised platform before them, a pool and plane trees in the
 * middle, the gate to the lane on the south.
 *
 * Districts (x runs east, y runs south):
 * - The north arcade, y = 0: the cell of Ḥájí Mírzá Muḥammad, the Shaykhí
 *   teacher, at x = 7 (lit); the tutor's cell adjoins it to the east.
 * - The west arcade, x = 0: Mullá Ḥusayn's cell at y = 11, dark until he
 *   comes in an hour after sunset; his lamp on the platform at (1, 11).
 * - The minaret in the north-west corner, (1, 1).
 * - The pool x 10..12, y 7..9; plane trees about it.
 * - The gate: the exit at (12, 17) to the lane.
 */

const W = 22;
const H = 18;
const GATE_X = 12;
const HUSAYN_CELL = { x: 0, y: 11 } as const;
const HAJI_CELL_X = 7;

const husaynIn = has('nurHusaynBack');
const husaynGone = has('nurHusaynFarewell');

/** The two arcades; Mullá Ḥusayn's cell is lit while he is in it. */
function arcade(): DecorSpec[] {
  const out: DecorSpec[] = [];
  const blind = new Set([3, 15]);
  for (let x = 0; x < W; x++) {
    const texture = x === HAJI_CELL_X ? 'nur-madrasa-cell-lit' : blind.has(x) ? 'nur-madrasa-blind' : 'nur-madrasa-cell';
    out.push({ gridX: x, gridY: 0, texture, blocks: true });
  }
  for (let y = 1; y < H; y++) {
    if (y === HUSAYN_CELL.y) {
      out.push({ gridX: 0, gridY: y, texture: 'nur-madrasa-cell-lit', blocks: true, present: both(husaynIn, not('nurHusaynFarewell')) });
      out.push({ gridX: 0, gridY: y, texture: 'nur-madrasa-cell', blocks: true, present: f => !husaynIn(f) || husaynGone(f) });
    } else out.push({ gridX: 0, gridY: y, texture: y === 6 ? 'nur-madrasa-blind' : 'nur-madrasa-cell', blocks: true });
  }
  return out;
}

const tree = (gridX: number, gridY: number): DecorSpec => ({ gridX, gridY, texture: 'plane-tree', blocks: true });

const props: DecorSpec[] = [
  { gridX: 1, gridY: 1, texture: 'ch4-minaret', blocks: true },
  tree(6, 6), tree(16, 12),
  { gridX: 16, gridY: 6, texture: 'cypress', blocks: true },
  { gridX: 6, gridY: 12, texture: 'cypress', blocks: true },
  // Lamps along the platforms.
  { gridX: 4, gridY: 1, texture: 'lamp', blocks: true },
  { gridX: 13, gridY: 1, texture: 'lamp', blocks: true },
  { gridX: 1, gridY: 15, texture: 'lamp', blocks: true },
  // Students' things on the platform: rugs, bundles, a water jar.
  { gridX: HAJI_CELL_X, gridY: 1, texture: 'rug' },
  { gridX: 11, gridY: 1, texture: 'ch2-bundles', blocks: true },
  { gridX: 18, gridY: 1, texture: 'floor-writing-board', blocks: true },
  { gridX: 1, gridY: 4, texture: 'ch2-water-jars', blocks: true },
  { gridX: 1, gridY: 8, texture: 'ch2-bundles', blocks: true },
  // Students reading late in the court, gone to their cells by night.
  { gridX: 19, gridY: 9, texture: 'ch2-tea-travellers', blocks: true, present: f => !madrasaNight(f) },
  { gridX: 15, gridY: 15, texture: 'crates', blocks: true },
];

const npcs: NpcSpec[] = [
  { gridX: 13, gridY: 15, texture: 'nur-porter',
    prompt: 'Speak with the Porter  [E]',
    dialogue: 'nur-porter' },
  { gridX: HAJI_CELL_X, gridY: 2, texture: 'nur-haji',
    prompt: 'Speak with Ḥájí Mírzá Muḥammad  [E]',
    dialogue: 'nur-haji',
    present: f => !madrasaNight(f) && !f.nurHusaynFarewell,
    gate: { when: not('nurGiftCarried'), lockedDialogue: 'nur-haji-morning' } },
  { gridX: HAJI_CELL_X + 2, gridY: 2, texture: 'nur-tutor',
    prompt: 'Speak with the Tutor  [E]',
    dialogue: 'nur-tutor',
    present: not('nurScrollGiven'),
    gate: { when: not('nurHusaynBack'), lockedDialogue: 'nur-tutor-waiting' } },
  // The lamp keeps his place until he comes in.
  { gridX: 1, gridY: HUSAYN_CELL.y, texture: 'nur-cell-lamp',
    prompt: 'Sit by the lamp at Mullá Ḥusayn\'s door  [E]',
    dialogue: 'nur-cell-wait',
    present: not('nurHusaynBack'),
    gate: { when: f => madrasaRounds(f) >= 2, lockedDialogue: 'nur-cell-shut' } },
  { gridX: 3, gridY: HUSAYN_CELL.y - 1, texture: 'ch1-mulla-husayn',
    prompt: 'Speak with Mullá Ḥusayn  [E]',
    dialogue: 'nur-husayn-night',
    present: both(husaynIn, not('nurGiftCarried')),
    gate: { when: not('nurScrollGiven'), lockedDialogue: 'nur-husayn-dawn' } },
  { gridX: 3, gridY: HUSAYN_CELL.y - 1, texture: 'ch1-mulla-husayn',
    prompt: 'Speak with Mullá Ḥusayn  [E]',
    dialogue: 'nur-husayn-gift',
    present: both(madrasaMorning, not('nurHusaynFarewell')) },
  { gridX: 4, gridY: HUSAYN_CELL.y + 2, texture: 'nur-tutor',
    prompt: 'Speak with the Tutor  [E]',
    dialogue: 'nur-tutor-morning',
    present: both(madrasaMorning, not('nurHusaynFarewell')) },
  // The swept cell, once he has gone to Khurásán.
  { gridX: 1, gridY: HUSAYN_CELL.y, texture: 'ch2-swept-threshold',
    prompt: 'Look into the empty cell  [E]',
    dialogue: 'nur-cell-swept',
    present: husaynGone },
];

export const nurMadrasaMap: MapDefinition = {
  key: 'NurMadrasa',
  title: 'Ṭihrán, the Madrasa of Mírzá Ṣáliḥ',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'stone');
    // Beds of earth under the plane trees, and the walk from the gate.
    paintRect(4, 4, 5, 5, 'grass');
    paintRect(14, 4, 5, 5, 'grass');
    paintRect(4, 10, 5, 5, 'grass');
    paintRect(14, 10, 5, 5, 'grass');
    paintRect(GATE_X - 1, 13, 3, H - 13, 'path');
  },
  buildings: [
    { gridX: 10, gridY: 7, w: 3, h: 3, texture: 'fountain-pool' },
  ],
  decor: [...arcade(), ...props],
  npcs,
  exits: [
    { fromX: GATE_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'NurLane', targetSpawnX: 1, targetSpawnY: 11,
      label: '↓ Out by the gate into the lanes',
      requires: has('nurScrollGiven'),
      lockedLabel: 'Stay: the night is not over in the madrasa' },
  ],
  // Dusk when the player comes in; night while the lamp burns; morning when the answer comes.
  ambience: f => madrasaNight(f)
    ? { wash: { color: 0x2a3560, alpha: 0.5 }, particles: 'fireflies', vignette: 0.7, music: 'night', sound: ['crickets'],
        lights: [
          { gridX: 2, gridY: HUSAYN_CELL.y, radius: 170, color: 0xffb860, intensity: 0.7 },
          { gridX: HAJI_CELL_X, gridY: 1, radius: 110, color: 0xffc070, intensity: 0.35 },
        ] }
    : madrasaMorning(f)
      ? { wash: { color: 0xe8c088, alpha: 0.16 }, particles: 'motes', vignette: 0.5, music: 'hope', sound: ['birds'] }
      : { wash: { color: 0xd08850, alpha: 0.32 }, particles: 'motes', vignette: 0.6, music: 'dusk', sound: ['birds'],
          lights: [{ gridX: HAJI_CELL_X, gridY: 1, radius: 110, color: 0xffc070, intensity: 0.3 }] },
};
