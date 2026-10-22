import type { FlagState } from '../../dialogue/types';
import type { BuildingSpec, DecorSpec, MapDefinition, NpcSpec } from './types';
import { wallRun } from './wallRuns';

/**
 * The courtyard of the governor's residence in Tabríz, summer 1848, at
 * true scale. North: the columned hall (tālār) where the Valí-ʿAhd and
 * the divines examine the Báb. The examination is never staged: the
 * player waits at the foot of the hall steps with a coffee tray, by the
 * slippers the divines left there, and hears it from those who come out.
 * A pool and orange trees in the middle, the coffee-maker's hearth in the
 * east corner, the gate to the square in the south wall.
 *
 * Districts (x runs east, y runs south):
 * - The hall: x 9..20, y 2..9; its forecourt y 10..13, the slippers at the
 *   foot of the steps (STEPS).
 * - The pool: x 14..16, y 16..18, the walk down the middle x 13..17.
 * - The coffee hearth: x 24..27, y 10..13.
 * - The gate: the gap in the south wall at x 14..16 (exit at (15, 27)).
 */

const W = 30;
const H = 28;
const HALL = { gridX: 9, gridY: 2, w: 12, h: 8 } as const;
const STEPS = { x: 12, y: 10 } as const;
const PAGE = { x: 14, y: 12 } as const;
const GATE_X = 15;

const has = (flag: string) => (f: FlagState) => !!f[flag];
const not = (flag: string) => (f: FlagState) => !f[flag];
const both = (a: (f: FlagState) => boolean, b: (f: FlagState) => boolean) => (f: FlagState) => a(f) && b(f);

/** Before the Prisoner is taken across the city, the afternoon of the examination; afterwards, days later. */
const daysLater = has('trialBastinado');

const buildings: BuildingSpec[] = [
  { ...HALL, texture: 'ch5-palace-portico' },
  { gridX: 14, gridY: 16, w: 3, h: 3, texture: 'fountain-pool' },
];

function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    ...wallRun(w, 0, 0, W - 1, 0),
    ...wallRun(w, 0, 1, 0, H - 1),
    ...wallRun(w, W - 1, 1, W - 1, H - 1),
    ...wallRun(w, 1, H - 1, W - 2, H - 1, [[GATE_X - 1, H - 1], [GATE_X, H - 1], [GATE_X + 1, H - 1]]),
  ];
}

const tree = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });

const props: DecorSpec[] = [
  // Cypresses either side of the hall, plane trees in the south corners, orange trees round the pool
  tree(5, 4, 'cypress'), tree(24, 4, 'cypress'), tree(3, 21, 'plane-tree'), tree(26, 22, 'plane-tree'),
  tree(10, 16, 'orange-tree'), tree(20, 16, 'orange-tree'), tree(10, 21, 'orange-tree'), tree(20, 21, 'orange-tree'),
  // The coffee hearth: a brazier, a water jar, a carpet for the cups
  { gridX: 26, gridY: 10, texture: 'ch6-brazier', blocks: true },
  { gridX: 27, gridY: 12, texture: 'ch9-water-jar', blocks: true },
  { gridX: 24, gridY: 12, texture: 'rug' },
  // Lamps on the forecourt and at the gate
  { gridX: 8, gridY: 11, texture: 'lamp', blocks: true },
  { gridX: 21, gridY: 11, texture: 'lamp', blocks: true },
  { gridX: 13, gridY: 25, texture: 'lamp', blocks: true },
  { gridX: 17, gridY: 25, texture: 'lamp', blocks: true },
  // The household's farráshes keep the forecourt while the hall is sitting
  { gridX: 7, gridY: 13, texture: 'ch9-farrash', blocks: true, present: not('trialHeLeft') },
  { gridX: 22, gridY: 13, texture: 'ch9-farrash', blocks: true, present: not('trialHeLeft') },
  // Grooms and servants waiting in the shade
  { gridX: 4, gridY: 17, texture: 'crowd', blocks: true, present: not('trialBastinado') },
  { gridX: 25, gridY: 17, texture: 'crowd', blocks: true, present: not('trialBastinado') },
];

/** The page and the steps tell the hall's story in turn; each phase is its own entry. */
const hallPhases: NpcSpec[] = [
  { gridX: STEPS.x, gridY: STEPS.y, texture: 'trial-slippers',
    prompt: 'Wait at the foot of the hall steps  [E]',
    dialogue: 'trial-hall-arrival',
    present: not('trialBroughtIn'),
    gate: { when: has('trialPageBriefed'), lockedDialogue: 'trial-hall-closed' } },
  { gridX: STEPS.x, gridY: STEPS.y, texture: 'trial-slippers',
    prompt: 'Listen at the foot of the hall steps  [E]',
    dialogue: 'trial-hall-departure',
    present: both(has('trialBroughtIn'), not('trialHeLeft')),
    gate: { when: has('trialHeardQuestions'), lockedDialogue: 'trial-hall-listen' } },
  { gridX: STEPS.x, gridY: STEPS.y, texture: 'trial-slippers',
    prompt: 'Look up at the hall  [E]',
    dialogue: 'trial-hall-empty',
    present: has('trialHeLeft'),
    gate: { when: has('trialHeardCormick'), lockedDialogue: 'trial-hall-shut' } },

  { gridX: PAGE.x, gridY: PAGE.y, texture: 'trial-page',
    prompt: 'Speak with the Valí-ʿAhd\'s Page  [E]',
    dialogue: 'trial-page-declaration',
    present: not('trialHeLeft'),
    gate: { when: has('trialBroughtIn'), lockedDialogue: 'trial-page-before' } },
  { gridX: PAGE.x, gridY: PAGE.y, texture: 'trial-page',
    prompt: 'Speak with the Valí-ʿAhd\'s Page  [E]',
    dialogue: 'trial-page-after',
    present: both(has('trialHeLeft'), not('trialBastinado')) },
];

export const trialCourtMap: MapDefinition = {
  key: 'TrialCourt',
  title: 'Tabríz, the Residence Courtyard',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: 25 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'grass');
    // The forecourt of the hall, the walk to the gate, the hearth
    paintRect(5, 10, 20, 4, 'stone');
    paintRect(13, 14, 5, H - 14, 'stone');
    paintRect(23, 9, 6, 5, 'path');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    ...hallPhases,
    { gridX: 17, gridY: 12, texture: 'trial-secretary',
      prompt: 'Speak with the Secretary  [E]',
      dialogue: 'trial-secretary',
      present: both(has('trialHeardDeclaration'), not('trialBastinado')) },
    { gridX: 10, gridY: 13, texture: 'trial-mamaqani',
      prompt: 'Speak with Mullá Muḥammad of Mamaqán  [E]',
      dialogue: 'trial-mamaqani',
      present: both(has('trialHeLeft'), not('trialBastinado')) },
    { gridX: 25, gridY: 11, texture: 'trial-coffee-maker',
      prompt: 'Speak with the Coffee-Maker  [E]',
      dialogue: 'trial-coffee-maker' },
    { gridX: 22, gridY: 19, texture: 'trial-cormick',
      prompt: 'Speak with Dr Cormick  [E]',
      dialogue: 'trial-cormick',
      present: daysLater },
  ],
  exits: [
    { fromX: GATE_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'TrialStreet', targetSpawnX: 20, targetSpawnY: 10,
      label: '↓ Out through the gate to the square' },
  ],
  ambience: f => daysLater(f)
    ? { wash: { color: 0xd08850, alpha: 0.26 }, particles: 'motes', vignette: 0.55, music: 'court', sound: ['birds'],
        lights: [{ gridX: STEPS.x + 2, gridY: STEPS.y - 1, radius: 180, color: 0xffc070, intensity: 0.22 }] }
    : { wash: { color: 0xe8c088, alpha: 0.18 }, particles: 'motes', vignette: 0.5, music: 'court', sound: ['breeze'] },
};
