import type { FlagState } from '../../dialogue/types';
import { NZ_FORT_DOOR } from './nayrizQuarter';
import { nzAfter, nzSiege, SIEGE_NEEDED, siegeRounds } from './nayrizPhases';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Inside the fort of Khájih above Chinár-Súkhtih, June 1850, at true scale:
 * an old court some 38 by 32 m within walls of rammed earth, round towers
 * at its back corners. Vaḥíd gave each companion a charge: a keeper of the
 * gate, a chronicler, a reader, and the rest. When the governor cut off the
 * water he had a cistern dug in the court.
 *
 * Layout (x runs east, y runs south): walls along y = 0 and x = 0, and the
 * cut-away south and east walls on y = 23 and x = 27; the gateway out at
 * x 13..14 on the south wall. Vaḥíd's place by the west wall x 3..7,
 * y 4..7; the old rooms x 10..14, y 1..4; the chronicler's board at
 * (17, 5); the cistern at (19, 12); the lean-to for the wounded x 2..3,
 * y 14..15; the gate x 12..16, y 19..22.
 */

const W = 28;
const H = 24;
const GATE_X = 13;

function walls(): DecorSpec[] {
  const w = 'town-wall';
  return [
    ...wallRun(w, 2, 0, 25, 0),
    ...wallRun(w, 0, 2, 0, H - 1),
    ...wallRun(w, 1, H - 1, W - 1, H - 1, { gaps: [[GATE_X, H - 1], [GATE_X + 1, H - 1]] }),
    ...wallRun(w, W - 1, 2, W - 1, H - 2),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // Vaḥíd's place in the shade of the west wall: carpets, bolsters, his sons' bedding.
  ...loose('ch7-carpet-madder', [[4, 5], [5, 5], [4, 6], [5, 6]]),
  ...block('ch7-bolster', [[4, 4], [5, 4]]),
  ...block('ch8-bedroll', [[2, 7], [2, 8]]),
  ...block('ch8-oil-lamp', [[3, 4]]),
  // The chronicler's board, the ladder to the wall walk, lamps of the court.
  ...block('writing-desk', [[17, 5]]),
  ...block('zanjan-ladder', [[21, 1]]),
  ...block('lamp', [[GATE_X - 1, H - 2], [GATE_X + 2, H - 2], [9, 9], [23, 9]]),
  // Stores against the east wall; empty water-jars waiting for the cistern.
  ...block('crates', [[25, 5], [25, 6]]),
  ...block('ch2-bundles', [[24, 4]]),
  ...block('ch9-water-jar', [[22, 13], [23, 13], [17, 13]]),
  // The wounded under the lean-to by the west wall.
  ...block('ch8-bedroll-dark', [[2, 17]]),
  ...block('ch8-wounded', [[4, 17]], nzSiege),
  // The companions' fires in the court.
  ...block('ch8-campfire', [[9, 15], [21, 18]], nzSiege),
  ...loose('rug', [[8, 16], [10, 16], [20, 17]]),
  ...block('ch8-cauldron', [[8, 14]], nzSiege),
  ...block('plane-tree', [[24, 2]]),
  // The companions: at prayer near Vaḥíd's place, their bundles and bedding along the walls.
  ...block('ch8-kneeling-companions', [[9, 6], [11, 11]], nzSiege),
  ...block('ch2-bundles', [[6, 20], [20, 21], [25, 16]]),
  ...block('ch8-bedroll', [[25, 13], [25, 14], [7, 21]]),
  ...block('ch8-stone-pile', [[21, 10]]),
  // After: muskets laid down in the court by those who went down unarmed.
  ...block('ch9-cloth-bundle', [[11, 17], [16, 16]], nzAfter),
];

export const nayrizFortMap: MapDefinition = {
  key: 'NayrizFort',
  title: 'The Fort of Khájih',
  width: W,
  height: H,
  spawn: { x: GATE_X, y: H - 3 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(GATE_X, 13, 2, H - 13, 'path');
    paintRect(3, 3, 6, 6, 'stone');
  },
  buildings: [
    { gridX: 0, gridY: 0, w: 2, h: 2, texture: 'nayriz-round-tower' },
    { gridX: 26, gridY: 0, w: 2, h: 2, texture: 'nayriz-round-tower' },
    { gridX: 10, gridY: 1, w: 5, h: 4, texture: 'town-house-small' },
    { gridX: 2, gridY: 14, w: 2, h: 2, texture: 'ch8-lean-to' },
    { gridX: 24, gridY: 20, w: 2, h: 2, texture: 'ch8-lean-to' },
  ],
  decor: [...walls(), ...props],
  npcs: [
    // The siege.
    { gridX: 6, gridY: 7, texture: 'ch4-vahid',
      prompt: 'Speak with Vaḥíd  [E]',
      dialogue: 'nz-vahid-oath',
      gate: { when: f => !!f.nzQuranArrived, lockedDialogue: 'nz-vahid-fort' },
      present: nzSiege },
    { gridX: 18, gridY: 6, texture: 'nayriz-chronicler',
      prompt: 'Speak with the Chronicler  [E]',
      dialogue: 'nz-chronicler',
      present: nzSiege },
    { gridX: 19, gridY: 11, texture: 'nayriz-cistern',
      prompt: 'Help at the cistern  [E]',
      dialogue: 'nz-cistern' },
    { gridX: 16, gridY: 20, texture: 'nayriz-gatekeeper',
      prompt: 'Speak with the Keeper of the Gate  [E]',
      dialogue: 'nz-gatekeeper',
      present: nzSiege },
    { gridX: 22, gridY: 16, texture: 'nayriz-boy',
      prompt: 'Speak with the Boy  [E]',
      dialogue: 'nz-boy-fort',
      present: nzSiege },
    { gridX: 11, gridY: 20, texture: 'nayriz-soldier',
      prompt: 'Speak with the Soldier under the White Cloth  [E]',
      dialogue: 'nz-soldier',
      present: f => nzSiege(f) && siegeRounds(f) >= SIEGE_NEEDED && !f.nzQuranArrived },

    // After: the letter, then the empty court.
    { gridX: 18, gridY: 6, texture: 'nayriz-chronicler',
      prompt: 'Speak with the Chronicler  [E]',
      dialogue: 'nz-chronicler-letter',
      present: f => nzAfter(f) && !f.nzLetterRead },
    { gridX: 6, gridY: 7, texture: 'ch8-rahl',
      prompt: 'Look at Vaḥíd\'s place  [E]',
      dialogue: 'nz-vahid-place',
      present: nzAfter },
  ],
  exits: [GATE_X, GATE_X + 1].map(fromX => ({
    fromX, fromY: H - 1, dx: 0, dy: 1,
    targetScene: 'NayrizQuarter', targetSpawnX: NZ_FORT_DOOR.x, targetSpawnY: NZ_FORT_DOOR.y + 1,
    label: '↓ Down to the quarter',
    requires: (f: FlagState) => !!f.nzLetterRead,
    lockedLabel: 'The gate is barred, and the trenches ring the fort',
  })),
  ambience: f => fortAmbience(f),
};

function fortAmbience(f: FlagState): MapAmbience {
  if (nzAfter(f)) {
    return {
      wash: { color: 0x8a7a70, alpha: 0.42 },
      particles: 'dust', music: 'sorrow', sound: ['wind'], vignette: 0.68,
    };
  }
  return {
    wash: { color: 0xb07850, alpha: 0.36 },
    lights: [
      { gridX: 9, gridY: 15, radius: 120, color: 0xff9a40, intensity: 0.45 },
      { gridX: 21, gridY: 18, radius: 120, color: 0xff9a40, intensity: 0.45 },
      { gridX: 3, gridY: 4, radius: 90, color: 0xffc070, intensity: 0.4 },
    ],
    particles: 'motes', music: 'siege', sound: ['crickets', 'fire'], vignette: 0.62,
  };
}
