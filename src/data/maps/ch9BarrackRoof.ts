import type { DecorSpec, MapDefinition } from './types';

/**
 * The flat roofs of the houses around the barrack square, noon on 9 July
 * 1850. Three roofs, divided by low parapets, packed with watchers. The
 * north parapet overlooks the square; a mat at its foot is where the
 * player keeps watch. The stair down to the square is on the west edge.
 */

const after = (f: Record<string, unknown>) => !!f.ch9WitnessedVolleys;

const EXIT_Y = 9;

function parapetLine(x: number, gaps: readonly number[]): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let y = 1; y <= 16; y += 1) {
    if (!gaps.includes(y)) out.push({ gridX: x, gridY: y, texture: 'ch9-parapet-low', blocks: true });
  }
  return out;
}

// Watchers pressed against the north parapet, leaving room at the mat.
const RAIL_CROWD: DecorSpec[] = [1, 2, 4, 5, 6, 9, 10, 14, 15, 17, 18, 20, 21, 22]
  .map(x => ({ gridX: x, gridY: 1, texture: 'crowd', blocks: true }));

const ROOF_CROWD: DecorSpec[] = [
  [3, 8], [6, 12], [10, 7], [13, 14], [18, 8], [21, 15], [11, 11],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd', blocks: true }));

const SHADOWS: DecorSpec[] = [
  [2, 4], [6, 3], [11, 4], [14, 9], [19, 3], [20, 12], [4, 14], [9, 15],
].map(([x, y]) => ({ gridX: x!, gridY: y!, texture: 'crowd-shadow' }));

export const ch9BarrackRoofMap: MapDefinition = {
  key: 'Ch9BarrackRoof',
  title: 'Tabríz, the Rooftops',
  width: 24,
  height: 18,
  spawn: { x: 1, y: EXIT_Y },
  build: ({ width, height, paintRect, paintPath }) => {
    paintRect(0, 0, width, height, 'sand');
    paintRect(9, 1, 7, 16, 'stone');
    paintRect(17, 1, 6, 16, 'sand');
    paintPath([[0, EXIT_Y], [1, EXIT_Y], [2, EXIT_Y]]);
  },
  buildings: [
    { gridX: 0, gridY: 0, w: 24, h: 1, texture: 'ch9-roof-wall-north' },
    { gridX: 23, gridY: 1, w: 1, h: 16, texture: 'ch9-roof-wall-east' },
    { gridX: 0, gridY: 17, w: 24, h: 1, texture: 'ch9-roof-wall-south' },
  ],
  decor: [
    // West edge parapet with the stair landing open
    ...[1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16]
      .map(y => ({ gridX: 0, gridY: y, texture: 'ch9-parapet-low', blocks: true })),
    ...parapetLine(8, [4, 12]),
    ...parapetLine(16, [6, 13]),
    ...RAIL_CROWD,
    ...ROOF_CROWD,
    ...SHADOWS,
    { gridX: 3, gridY: 13, texture: 'ch9-brick-dome', blocks: true },
    { gridX: 12, gridY: 6, texture: 'ch9-brick-dome', blocks: true },
    { gridX: 20, gridY: 5, texture: 'ch9-brick-dome', blocks: true },
    { gridX: 19, gridY: 14, texture: 'ch9-brick-dome', blocks: true },
    { gridX: 5, gridY: 10, texture: 'ch9-washing-line', blocks: true },
    { gridX: 14, gridY: 12, texture: 'ch9-washing-line', blocks: true },
    { gridX: 3, gridY: 5, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 6, gridY: 15, texture: 'ch9-water-jar', blocks: true },
    { gridX: 21, gridY: 10, texture: 'ch9-water-jar', blocks: true },
    { gridX: 10, gridY: 15, texture: 'rug' },
    { gridX: 18, gridY: 11, texture: 'rug' },
  ],
  npcs: [
    { gridX: 12, gridY: 1, texture: 'rug',
      prompt: 'Look down into the barrack square  [E]',
      dialogue: 'ch9-vantage-after',
      gate: { when: after, lockedDialogue: 'ch9-vantage' } },
    { gridX: 4, gridY: 5, texture: 'ch9-widow',
      prompt: 'Speak with the Baker\'s Widow  [E]',
      dialogue: 'ch9-widow-after',
      gate: { when: after, lockedDialogue: 'ch9-widow' } },
    { gridX: 14, gridY: 4, texture: 'ch9-student',
      prompt: 'Speak with the Madrasa Student  [E]',
      dialogue: 'ch9-student-after',
      gate: { when: after, lockedDialogue: 'ch9-student' } },
    { gridX: 19, gridY: 10, texture: 'ch9-witness',
      prompt: 'Speak with the Witness in the Crowd  [E]',
      dialogue: 'ch9-crowd-witness-after',
      gate: { when: after, lockedDialogue: 'ch9-crowd-witness' } },
  ],
  exits: [
    { fromX: 0, fromY: EXIT_Y, dx: -1, dy: 0,
      targetScene: 'Ch9TabrizSquare', targetSpawnX: 26, targetSpawnY: 12,
      label: '← Down the stair to the square' },
  ],
  ambience: {
    wash: { color: 0xc8a070, alpha: 0.3 },
    particles: 'dust', music: 'sorrow',
    vignette: 0.65,
  },
};
