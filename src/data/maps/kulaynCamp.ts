import type { FlagState } from '../../dialogue/types';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition, NpcSpec } from './types';
import { KASHAN_TRACK_Y } from './kulaynKashan';
import { both, companionTales, COMPANION_TALES, has, letterDue, not } from './kulaynPhases';
import { wallRun } from './wallRuns';

/**
 * Kulayn, spring 1847, at true scale: the village of the Grand Vizier, half
 * a day south-west of Ṭihrán, where his own tent was pitched for the Báb on
 * the slope of a hill among orchards and meadows, by streams. The tent
 * stands up the slope with the escort's tent and picket line beside it and
 * the companions' small tent within call; the stream runs down the east
 * side, the village and the shrine of Shaykh-i-Kulayní beyond it; walled
 * orchards in blossom fill the south-west. The road from Káshán comes in
 * at the south.
 *
 * Districts (x runs east, y runs south):
 * - The hillside: rocks along y 0..3; the Vizier's tent at x 18..22,
 *   y 5..8, its door at (20, 8) and the kilim before it at (20, 9) (KILIM).
 * - The escort: its army tent x 10..12, y 4..6, the campfire, the picket
 *   line of horses at y 12, x 24..28; Muḥammad Big at (23, 14).
 * - The companions' tent: x 4..7, y 10..12; Mullá ʿAbdu'l-Karím before it.
 * - The stream: x 31..32 from north to south, a footbridge at y 20.
 * - The village beyond: houses x 34..43, the shrine x 37..39, y 2..4.
 * - The orchards: walled, x 2..16, y 18..32, open on the east at y 24..25.
 * - The road from Káshán: x 19..21, y 10..39 (exit at (20, 39)).
 */

const W = 44;
const H = 40;
const TENT = { gridX: 18, gridY: 5, w: 5, h: 4 } as const;
const KILIM = { x: 20, y: 9 } as const;
const BIG = { x: 23, y: 14 } as const;
const STREAM_X = [31, 32] as const;
const BRIDGE_Y = 20;
const ROAD_X = 20;

const arrived = has('kulaynCampArrived');
const ordered = has('kulaynOrder');
const talesHeard = (f: FlagState) => companionTales(f) >= COMPANION_TALES.length;

const buildings: BuildingSpec[] = [
  { ...TENT, texture: 'kulayn-vizier-tent' },
  { gridX: 10, gridY: 4, w: 3, h: 3, texture: 'ch8-army-tent' },
  { gridX: 4, gridY: 10, w: 4, h: 3, texture: 'ch7-tent-quddus' },
  // The village across the stream, and the shrine of Shaykh-i-Kulayní.
  { gridX: 37, gridY: 2, w: 3, h: 3, texture: 'ch2-shrine' },
  { gridX: 34, gridY: 8, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 38, gridY: 14, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 34, gridY: 22, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 37, gridY: 30, w: 5, h: 4, texture: 'town-house-small' },
];

function walls(): DecorSpec[] {
  const w = 'ch7-garden-wall';
  const gate: ReadonlyArray<readonly [number, number]> = [[16, 24], [16, 25]];
  return [
    ...wallRun(w, 2, 18, 16, 18),
    ...wallRun(w, 2, 32, 16, 32),
    ...wallRun(w, 2, 19, 2, 31),
    ...wallRun(w, 16, 19, 16, 31, { gaps: gate }),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));

const HILL = block('ch2-rock', [[2, 1], [6, 0], [9, 2], [14, 1], [17, 2], [24, 1], [27, 3], [29, 0], [1, 5]]);

const ORCHARD: DecorSpec[] = [
  [4, 20], [7, 20], [10, 20], [13, 20], [5, 23], [8, 23], [11, 23], [4, 26], [7, 26], [10, 26], [13, 27], [5, 29], [8, 29], [11, 30],
  // Trees outside the walls, along the road and the stream.
  [24, 22], [27, 25], [24, 28], [27, 31], [25, 35], [29, 16], [16, 15], [14, 36], [6, 35],
].map(([x, y], i) => ({ gridX: x!, gridY: y!, texture: i % 3 === 1 ? 'kulayn-apricot' : 'kulayn-almond', blocks: true }));

const props: DecorSpec[] = [
  // The escort's picket line, its fire and gear.
  ...block('kulayn-horse', [[24, 12], [28, 12]]),
  ...block('kulayn-horse-grey', [[26, 12]]),
  { gridX: 14, gridY: 8, texture: 'ch2-campfire', blocks: true },
  { gridX: 12, gridY: 9, texture: 'ch2-bundles', blocks: true },
  { gridX: 15, gridY: 10, texture: 'kulayn-rider', blocks: true },
  { gridX: 17, gridY: 9, texture: 'kulayn-rider', blocks: true, present: not('kulaynOrder') },
  // A courier's lathered horse, once the order has come.
  { gridX: 22, gridY: 12, texture: 'kulayn-horse-grey', blocks: true, present: ordered },
  // Village life: plane trees, a well, the footbridge.
  { gridX: 41, gridY: 9, texture: 'plane-tree', blocks: true },
  { gridX: 36, gridY: 18, texture: 'well', blocks: true },
  { gridX: 41, gridY: 25, texture: 'cypress', blocks: true },
  ...STREAM_X.map(x => ({ gridX: x, gridY: BRIDGE_Y, texture: 'ch6-footbridge' })),
];

const tentPhases: NpcSpec[] = [
  { gridX: KILIM.x, gridY: KILIM.y, texture: 'kulayn-tent-threshold',
    prompt: 'Stand by the red tent  [E]',
    dialogue: 'kulayn-tent-quiet',
    present: not('kulaynLetterBrought') },
  { gridX: KILIM.x, gridY: KILIM.y, texture: 'kulayn-tent-threshold',
    prompt: 'Walk with Mullá Mihdí to the tent  [E]',
    dialogue: 'kulayn-tent-letter',
    present: both(has('kulaynLetterBrought'), not('kulaynLetter')) },
  { gridX: KILIM.x, gridY: KILIM.y, texture: 'kulayn-tent-threshold',
    prompt: 'Stand by the red tent  [E]',
    dialogue: 'kulayn-tent-glad',
    present: both(has('kulaynLetter'), not('kulaynOrder')) },
  { gridX: KILIM.x, gridY: KILIM.y, texture: 'kulayn-tent-threshold',
    prompt: 'Stand by the tent at first light  [E]',
    dialogue: 'kulayn-tent-struck',
    present: ordered },
];

const people: NpcSpec[] = [
  { gridX: BIG.x, gridY: BIG.y, texture: 'kulayn-muhammad-big',
    prompt: 'Speak with Muḥammad Big  [E]',
    dialogue: 'kulayn-big-arrival',
    present: not('kulaynCampArrived') },
  { gridX: BIG.x, gridY: BIG.y, texture: 'kulayn-muhammad-big',
    prompt: 'Speak with Muḥammad Big  [E]',
    dialogue: 'kulayn-big-order',
    present: both(arrived, not('kulaynOrder')),
    gate: { when: talesHeard, lockedDialogue: 'kulayn-big-waiting' } },
  { gridX: BIG.x, gridY: BIG.y, texture: 'kulayn-muhammad-big',
    prompt: 'Speak with Muḥammad Big  [E]',
    dialogue: 'kulayn-big-dawn',
    present: ordered },
  { gridX: 29, gridY: 19, texture: 'kulayn-villager',
    prompt: 'Speak with the Woman of Kulayn  [E]',
    dialogue: 'kulayn-villager',
    present: arrived },
  { gridX: 9, gridY: 13, texture: 'kulayn-abdul-karim',
    prompt: 'Speak with Mullá ʿAbdu\'l-Karím  [E]',
    dialogue: 'kulayn-abdul-karim-moonlit',
    present: arrived,
    gate: { when: has('kulaynLetter'), lockedDialogue: 'kulayn-abdul-karim' } },
  { gridX: ROAD_X + 1, gridY: 18, texture: 'kulayn-kandi',
    prompt: 'Speak with the Rider from Ṭihrán  [E]',
    dialogue: 'kulayn-kandi',
    present: f => letterDue(f) && !f.kulaynLetterBrought },
  { gridX: 7, gridY: 14, texture: 'kulayn-kandi',
    prompt: 'Speak with Mullá Mihdíy-i-Kandí  [E]',
    dialogue: 'kulayn-kandi-after',
    present: has('kulaynLetter') },
];

/** Spring days on the hillside; golden after the letter; the grey before dawn when the tent is struck. */
function ambience(f: FlagState): MapAmbience {
  if (f.kulaynOrder) {
    return { wash: { color: 0x8a90b0, alpha: 0.3 }, particles: 'leaves', vignette: 0.55, music: 'road', sound: ['river', 'breeze'] };
  }
  if (f.kulaynLetter) {
    return { wash: { color: 0xf0c890, alpha: 0.2 }, particles: 'motes', vignette: 0.5, music: 'hope', sound: ['river', 'birds'] };
  }
  return { wash: { color: 0xe8e0d0, alpha: 0.12 }, particles: 'leaves', vignette: 0.45, music: 'garden', sound: ['river', 'birds'] };
}

export const kulaynCampMap: MapDefinition = {
  key: 'KulaynCamp',
  title: 'Kulayn, the Grand Vizier\'s Village',
  width: W,
  height: H,
  spawn: { x: ROAD_X, y: 37 },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'grass');
    // The bare slope of the hill, the road up to the tent, the camp's trodden ground.
    paintRect(0, 0, 31, 4, 'sand');
    paintRect(ROAD_X - 1, 10, 3, H - 10, 'path');
    paintRect(9, 7, 20, 4, 'path');
    paintRect(33, 0, W - 33, H, 'sand');
    paintRect(33, 19, 9, 2, 'path');
    // The stream, crossed by a footbridge.
    paintRect(STREAM_X[0], 0, 2, H, 'water');
    for (const x of STREAM_X) {
      for (let y = 0; y < H; y++) if (y !== BRIDGE_Y) blockCell(x, y);
    }
  },
  buildings,
  decor: [...walls(), ...HILL, ...ORCHARD, ...props],
  npcs: [...tentPhases, ...people],
  exits: [
    { fromX: ROAD_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'KulaynKashan', targetSpawnX: 1, targetSpawnY: KASHAN_TRACK_Y,
      label: '↓ The road back toward Káshán' },
  ],
  ambience,
};
