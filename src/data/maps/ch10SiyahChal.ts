import { pitCompanyCount } from '../dialogues_ch/chapter10_siyah_chal';
import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The Síyáh-Chál, the Black Pit, at true scale: a disused reservoir three
 * flights below Ṭihrán, about 45 by 35 m under low vaults on squat piers.
 * The stair comes down at the north; the prisoners sit in two chained rows
 * facing each other across an aisle; in the far south-east a crack in the
 * vault lets a thread of light fall beside the pillar where Bahá'u'lláh is
 * chained. He is never on the map: only the light, the chain Qará-Guhar,
 * and the testimony of the men around Him.
 *
 * Layout (x runs east, y runs south):
 * - Walls: an arcade of low arches along y = 0, broken by the stair at
 *   x = 16 (the exit); the vault wall down x = 0. The south and east rims
 *   are the cut-away front of the vault.
 * - The landing at the stair's foot, y 1..3, the jailer at (17, 3); a row of
 *   piers on y 4..5.
 * - The first chained row on y = 8; the aisle y 9..13; the second row on
 *   y = 14, where the young prisoner, the old merchant and the fellow
 *   prisoner sit; a second row of piers on y 18..19.
 * - The south: men too weak to sit up, lying on straw; seep water in the
 *   south-west corner; the place of the light at x 24..27, y 19..21.
 */

const W = 32;
const H = 26;
const STAIR = 16;

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const WALLS: DecorSpec[] = [
  ...wallRun('ch10-low-arch', 1, 0, STAIR - 1, 0),
  ...wallRun('ch10-low-arch', STAIR + 1, 0, W - 1, 0),
  ...wallRun('ch10-vault-wall', 0, 0, 0, H - 1),
];

/** The two chained rows facing each other across the aisle, and their straw. */
const ROWS: DecorSpec[] = [
  ...block('ch10-prisoner', [[3, 8], [4, 8], [7, 8], [10, 8], [13, 8], [14, 8], [19, 8], [22, 8], [25, 8], [28, 8]]),
  ...block('ch10-chain-pillar', [[6, 8], [12, 8], [17, 8], [24, 8]]),
  ...block('ch10-prisoner', [[3, 14], [5, 14], [9, 14], [15, 14], [22, 14], [26, 14], [28, 14]]),
  ...block('ch10-chain-pillar', [[7, 14], [13, 14], [20, 14], [24, 14]]),
  ...loose('ch10-straw', [[4, 7], [9, 7], [14, 7], [20, 7], [26, 7], [6, 15], [11, 15], [17, 15], [23, 15], [27, 15]]),
  ...loose('ch10-chain-coil', [[8, 7], [21, 15]]),
];

/** The landing, the piers, the south of the pit and the place of the light. */
const PIT: DecorSpec[] = [
  // The jailer's lamp at the foot of the stair; coils of spare chain.
  ...block('lamp', [[STAIR - 1, 2]]),
  ...block('ch10-chain-coil', [[8, 2]]),
  ...block('ch10-chain-coil', [[21, 2]]),
  ...loose('ch10-straw', [[9, 3], [2, 3], [27, 3]]),
  ...block('ch10-prisoner', [[28, 2]]),
  // The south: men lying on straw, chain coiled by the wall.
  ...loose('ch10-straw', [[7, 22], [14, 22], [3, 19]]),
  ...block('ch10-prisoner', [[8, 22], [15, 22], [3, 18]]),
  ...block('ch10-chain-coil', [[2, 16], [17, 21]]),
  ...block('ch10-chain-pillar', [[9, 21]]),
  // The place by the far pillar, where the light falls.
  ...block('ch10-chain-pillar', [[27, 20]]),
  ...loose('ch10-straw', [[26, 21], [24, 21]]),
  ...block('ch10-chain-coil', [[29, 18]]),
];

export const ch10SiyahChalMap: MapDefinition = {
  key: 'Ch10SiyahChal',
  title: 'The Síyáh-Chál',
  width: W,
  height: H,
  interior: true,
  spawn: { x: STAIR, y: 1 },
  build: ({ paintRect, setTile, block: blockCell }) => {
    paintRect(0, 0, W, H, 'stone');
    // The worn landing at the foot of the stair.
    paintRect(STAIR, 0, 1, 4, 'path');
    // Damp sand silted along the old reservoir floor of the aisle.
    paintRect(2, 9, W - 4, 5, 'sand');
    // Seep water pooled in the low south-west corner.
    for (const [x, y] of [[1, 22], [2, 22], [1, 23], [2, 23], [3, 23]] as const) {
      setTile(x, y, 'water');
      blockCell(x, y);
    }
    // The rim: solid all round except the stair.
    for (let x = 0; x < W; x++) {
      if (x !== STAIR) blockCell(x, 0);
      blockCell(x, H - 1);
    }
    for (let y = 0; y < H; y++) {
      blockCell(0, y);
      blockCell(W - 1, y);
    }
  },
  buildings: [
    // Piers holding up the vault.
    ...[[5, 4], [11, 4], [21, 4], [26, 4], [5, 18], [12, 18], [20, 18]].map(([gridX, gridY]) => (
      { gridX: gridX!, gridY: gridY!, w: 2, h: 2, texture: 'ch10-stone-pillar' })),
  ],
  decor: [...WALLS, ...ROWS, ...PIT],
  npcs: [
    { gridX: STAIR + 1, gridY: 3, texture: 'ch10-jailer',
      prompt: 'Speak with the Jailer  [E]',
      dialogue: 'ch10-jailer-release',
      gate: { when: f => !!f.ch10WitnessedDawn, lockedDialogue: 'ch10-jailer' } },
    { gridX: 9, gridY: 8, texture: 'ch10-prisoner',
      prompt: 'Listen to the chained rows  [E]',
      dialogue: 'ch10-chant' },
    { gridX: 11, gridY: 14, texture: 'ch10-prisoner',
      prompt: 'Speak with the Fellow Prisoner  [E]',
      dialogue: 'ch10-prisoner' },
    { gridX: 17, gridY: 14, texture: 'ch10-young-prisoner',
      prompt: 'Speak with the young prisoner  [E]',
      dialogue: 'ch10-young-prisoner' },
    { gridX: 18, gridY: 14, texture: 'ch10-ruined-believer',
      prompt: 'Speak with the old merchant  [E]',
      dialogue: 'ch10-ruined-believer' },
    { gridX: 26, gridY: 19, texture: 'ch10-chain-post',
      prompt: 'Look at the heavy chain  [E]',
      dialogue: 'ch10-chain' },
    { gridX: 25, gridY: 20, texture: 'ch10-light-shaft',
      prompt: 'Keep watch where the light falls  [E]',
      dialogue: 'ch10-vision',
      gate: { when: f => pitCompanyCount(f) >= 3, lockedDialogue: 'ch10-vision-waiting' } },
  ],
  exits: [
    { fromX: STAIR, fromY: 0, dx: 0, dy: -1,
      targetScene: 'Ch10TehranStreet', targetSpawnX: 39, targetSpawnY: 43,
      label: '↑ Climb the stair into the light',
      requires: f => !!f.ch10Released,
      lockedLabel: 'The stair is barred above you' },
  ],
  ambience: {
    wash: { color: 0x2a2a30, alpha: 0.62 },
    particles: 'dust', music: 'prison',
    vignette: 0.85,
    lights: [
      { gridX: 25, gridY: 20, radius: 200, color: 0xcfd8f0, intensity: 0.85 },
      { gridX: STAIR, gridY: 0, radius: 120, color: 0xe8dcc0, intensity: 0.3 },
    ],
  },
};
