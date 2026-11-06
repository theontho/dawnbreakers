import type { FlagState } from '../../dialogue/types';
import { bfForestDawn, bfForestNight, bfHalted, bfRiding } from './barfurushPhases';
import { CellSet, sightlines, traceRoute, widen, type Cell } from './ch8MapTools';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';
import { MAZINDARAN_WOODS, scatterWoodland } from './woodland';

/**
 * The forest of Mázindarán off the Shír-Gáh road, October 1848, at true
 * scale. Khusraw of Qádí-Kalá has led the companions off the open road
 * and in under the trees; the track runs east to a clearing, where his
 * horsemen fall on them long past noon, where Mullá Ḥusayn gets down to
 * pray, where Khusraw sits for his water-pipe and dies, and where the
 * companions keep the night by a fire. At dawn the shrine of Shaykh
 * Ṭabarsí is a maydán further on through the woods.
 *
 * Districts (x runs east, y runs south):
 * - The track, two cells wide: in from the west at (0, 20..21), east to
 *   x 14, north to y 12, and east into the clearing.
 * - The clearing, x 19..36, y 4..18: Mullá Ḥusayn's prayer-mat at
 *   (28, 9); Khusraw's log at (34, 6), his attendant at (33, 9); the
 *   companions' fire at (27, 15); the fallen laid at (20, 15).
 */

const W = 40;
const H = 30;
const inside = ([x, y]: Cell) => x >= 0 && y >= 0 && x < W && y < H;
const TRACK = widen(traceRoute([[0, 20], [14, 20], [14, 12], [22, 12]])).filter(inside);
const MAT = { x: 28, y: 9 } as const;
const KHUSRAW = { x: 34, y: 6 } as const;
const ATTENDANT = { x: 33, y: 9 } as const;
const JUVAYNI = { x: 24, y: 10 } as const;
const FALLEN = { x: 20, y: 15 } as const;
const FIRE = { x: 27, y: 15 } as const;
const RIDA = { x: 25, y: 16 } as const;
const DAWN = { x: 30, y: 16 } as const;
const ROADSIDE = { x: 10, y: 18 } as const;
const AHEAD = { x: 6, y: 23 } as const;

const PEOPLE: Cell[] = [
  [MAT.x, MAT.y], [KHUSRAW.x, KHUSRAW.y], [ATTENDANT.x, ATTENDANT.y], [JUVAYNI.x, JUVAYNI.y],
  [FALLEN.x, FALLEN.y], [RIDA.x, RIDA.y], [DAWN.x, DAWN.y], [ROADSIDE.x, ROADSIDE.y], [AHEAD.x, AHEAD.y],
];

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const HAND_DECOR: DecorSpec[] = [
  // The escort on the track, and then about Khusraw in the clearing.
  ...block('kulayn-rider', [[12, 17], [17, 11], [19, 10]], bfRiding),
  ...block('kulayn-rider', [[36, 8], [35, 4], [31, 5]], bfHalted),
  ...block('kulayn-horse', [[8, 17]], bfRiding),
  ...block('kulayn-horse', [[36, 6]], bfHalted),
  ...block('ch8-log', [[KHUSRAW.x - 1, KHUSRAW.y]], f => !f.bfSlept),
  // The companions' horses tethered at the clearing's edge, and Mullá Ḥusayn's prayer-mat.
  ...block('kulayn-horse-grey', [[23, 6], [30, 5]], f => !!f.bfAmbush),
  ...block('kulayn-horse', [[26, 5]], f => !!f.bfAmbush),
  ...loose('rug', [[MAT.x, MAT.y - 1]], f => !!f.bfAmbush),
  // The night: the fire, and the heap of what was taken back from the escort.
  ...block('ch8-campfire', [[FIRE.x, FIRE.y]], f => !!f.bfKhusrawDead),
  ...loose('ch8-bedroll', [[24, 14], [28, 17], [22, 17]], bfForestNight),
  ...block('bf-plunder', [[31, 13]], f => !!f.bfKhusrawDead),
  ...block('ch8-mossy-rock', [[33, 16], [21, 6]]),
  ...loose('ch8-fern', [[19, 8], [35, 13], [23, 18]]),
];

function forestDecor(): DecorSpec[] {
  const clear = new CellSet(TRACK);
  clear.addRect(19, 4, 18, 15);
  for (const item of HAND_DECOR) clear.add(item.gridX, item.gridY);
  clear.addWithNeighbours(PEOPLE);
  const verge = new CellSet();
  verge.addWithNeighbours(TRACK);
  return scatterWoodland({
    width: W,
    height: H,
    seed: 1264,
    palette: MAZINDARAN_WOODS,
    clear,
    verge,
    watched: [...PEOPLE, [FIRE.x, FIRE.y]],
    open: sightlines(TRACK.filter((_, i) => i % 5 === 0), 18, 2, W, H),
    treeDensity: 0.32,
    density: 0.16,
    coverDensity: 0.2,
  });
}

function ambience(f: FlagState): MapAmbience {
  const fire = { gridX: FIRE.x, gridY: FIRE.y, radius: 170, color: 0xffa040, intensity: 0.62 };
  if (bfForestDawn(f)) {
    return { wash: { color: 0xb0b8c8, alpha: 0.32 }, particles: 'motes', music: 'hope', sound: ['birds', 'breeze'], vignette: 0.55 };
  }
  if (bfForestNight(f)) {
    return { wash: { color: 0x2a3560, alpha: 0.58 }, lights: [fire], particles: 'fireflies', music: 'night', sound: ['crickets', 'fire'], vignette: 0.72 };
  }
  if (bfHalted(f)) {
    return { wash: { color: 0x8a7a60, alpha: 0.42 }, particles: 'leaves', music: 'siege', sound: ['wind'], vignette: 0.68 };
  }
  return { wash: { color: 0x90a89a, alpha: 0.34 }, particles: 'leaves', music: 'forest', sound: ['wind', 'birds'], vignette: 0.6 };
}

export const barfurushForestMap: MapDefinition = {
  key: 'BarfurushForest',
  title: 'The Forest beyond Bárfurúsh',
  width: W,
  height: H,
  spawn: { x: 1, y: 20 },
  build: ({ paintRect, paintPath }) => {
    paintRect(19, 4, 18, 15, 'grass');
    paintRect(24, 13, 7, 5, 'sand');
    paintPath(TRACK);
  },
  buildings: [],
  decor: [...forestDecor(), ...HAND_DECOR],
  npcs: [
    // Riding: Khusraw at the edge of the wood, Mullá Ḥusayn ahead.
    { gridX: ROADSIDE.x, gridY: ROADSIDE.y, texture: 'bf-khusraw',
      prompt: 'Speak with Khusraw  [E]',
      dialogue: 'bf-khusraw-forest',
      present: bfRiding },
    { gridX: AHEAD.x, gridY: AHEAD.y, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-ride',
      present: bfRiding },

    // The halt: the prayer-mat, Khusraw on his log, his attendant, Mírzá Muḥammad-Taqí watching.
    { gridX: MAT.x, gridY: MAT.y, texture: 'ch8-mulla-husayn',
      prompt: 'Go to Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-halt',
      present: f => bfHalted(f) && !f.bfSawPrayer },
    { gridX: MAT.x, gridY: MAT.y, texture: 'ch8-mulla-husayn',
      prompt: 'Watch Mullá Ḥusayn at his prayer  [E]',
      dialogue: 'bf-mh-praying',
      present: f => bfHalted(f) && !!f.bfSawPrayer },
    { gridX: KHUSRAW.x, gridY: KHUSRAW.y, texture: 'bf-khusraw',
      prompt: 'Look at Khusraw  [E]',
      dialogue: 'bf-khusraw-waiting',
      present: bfHalted },
    { gridX: JUVAYNI.x, gridY: JUVAYNI.y, texture: 'bf-juvayni',
      prompt: 'Speak with Mírzá Muḥammad-Taqí  [E]',
      dialogue: 'bf-juvayni',
      gate: { when: f => !!f.bfSawPrayer, lockedDialogue: 'bf-juvayni-early' },
      present: bfHalted },
    { gridX: ATTENDANT.x, gridY: ATTENDANT.y, texture: 'bf-attendant',
      prompt: 'Speak with Khusraw\'s Attendant  [E]',
      dialogue: 'bf-attendant-spared',
      gate: { when: f => !!f.bfKhusrawDead, lockedDialogue: 'bf-attendant-kindling' },
      present: f => !!f.bfAmbush && !f.bfAttendantSent },
    { gridX: FALLEN.x, gridY: FALLEN.y, texture: 'bf-shroud',
      prompt: 'Kneel by the fallen  [E]',
      dialogue: 'bf-fallen-forest',
      present: f => !!f.bfAmbush },

    // The night and the dawn.
    { gridX: MAT.x, gridY: MAT.y, texture: 'ch8-mulla-husayn',
      prompt: 'Look at Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-night',
      present: bfForestNight },
    { gridX: RIDA.x, gridY: RIDA.y, texture: 'ch8-young-companion',
      prompt: 'Sit with Riḍá by the fire  [E]',
      dialogue: 'bf-rida-fire',
      gate: { when: f => !!f.bfAttendantSent, lockedDialogue: 'bf-rida-fire-early' },
      present: bfForestNight },
    { gridX: DAWN.x, gridY: DAWN.y, texture: 'ch8-mulla-husayn',
      prompt: 'Go with Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-karbila',
      present: bfForestDawn },
  ],
  companion: { texture: 'ch8-young-companion', present: bfRiding },
  remarks: [
    { id: 'bf-turn', gridX: 12, gridY: 20, radius: 3, requires: bfRiding,
      lines: [
        { speaker: 'A Young Companion', text: 'Shír-Gáh lies south, out across the open fields. Why are we turning in under the trees?' },
        { speaker: 'Narrator', text: 'Ahead, at the edge of the wood, Khusraw has reined in to wait for you.' },
      ] },
    { id: 'bf-clearing-night', gridX: FIRE.x, gridY: FIRE.y, radius: 4, requires: bfForestNight,
      lines: [
        { speaker: 'Narrator', text: 'The companions say the night prayer by the light of the fire, those who are left, standing in rows among the trees.' },
      ] },
  ],
  exits: [20, 21].map(fromY => ({
    fromX: 0, fromY, dx: -1, dy: 0,
    targetScene: 'BarfurushMaydan', targetSpawnX: 34, targetSpawnY: 22,
    label: '← Back to Bárfurúsh',
    requires: bfRiding,
    lockedLabel: 'There is no going back to Bárfurúsh now',
  })),
  ambience,
};
