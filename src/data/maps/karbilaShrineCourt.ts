import type { FlagState } from '../../dialogue/types';
import { arafihReady, krSpring, krSummer, krWinter } from './karbilaPhases';
import { palms } from './karbilaPalms';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition, NpcSpec } from './types';

/**
 * Karbilá, 1851 to 1852: the square before the gate of the shrine of the
 * Imám Ḥusayn. The shrine fills the north of the map; its gate, a tiled
 * pīshṭāq with a gilded crest, opens on the square at (16, 9), and the game
 * goes no further in than that threshold. Shaykh Ḥasan-i-Zunúzí keeps his
 * place by the gate; an old servant sweeps its step.
 *
 * Layout (x runs east, y runs south):
 * - The shrine: x 10..21, y 0..9, its gate at (16, 9).
 * - The square: x 6..29, y 10..21, paved.
 * - The road from the palm groves comes in at the north-west edge (x = 0),
 *   y 18..19; the lane to the house where Bahá'u'lláh stayed leaves by the
 *   north-east edge (y = 0), x 30..31.
 * - The bazaar row on the west, houses round the rest.
 */

const W = 34;
const H = 30;
export const SHRINE_GATE = { x: 16, y: 9 } as const;
const GROVES_Y = [18, 19] as const;
const LANE_X = [30, 31] as const;

const HASAN = [14, 11] as const;
const SERVANT = [18, 11] as const;
const TURBAH = [23, 14] as const;
const CLASSMATE = [10, 16] as const;

const buildings: BuildingSpec[] = [
  { gridX: 10, gridY: 0, w: 12, h: 10, texture: 'karbila-shrine' },
  // The bazaar comes up to the square from the west; a pilgrims' lodging-house and homes round the rest.
  { gridX: 0, gridY: 10, w: 8, h: 3, texture: 'bazaar-row' },
  { gridX: 23, gridY: 1, w: 6, h: 5, texture: 'town-house' },
  { gridX: 1, gridY: 22, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 13, gridY: 24, w: 6, h: 5, texture: 'town-house' },
  { gridX: 22, gridY: 23, w: 8, h: 7, texture: 'town-house-large' },
  // Stalls in the square.
  { gridX: 3, gridY: 15, w: 2, h: 2, texture: 'market-stall' },
  { gridX: 26, gridY: 17, w: 2, h: 2, texture: 'market-stall' },
];

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const WATCHED: ReadonlyArray<readonly [number, number]> = [
  HASAN, SERVANT, TURBAH, CLASSMATE, [SHRINE_GATE.x, SHRINE_GATE.y],
  ...GROVES_Y.map(y => [0, y] as const), ...LANE_X.map(x => [x, 0] as const),
];

const props: DecorSpec[] = [
  // Lamps either side of the gate, and at the corners of the square.
  ...block('lamp', [[13, 10], [20, 10], [8, 21], [29, 14]]),
  // The turbah-seller's cloth; water for pilgrims by the gate.
  ...block('karbila-turbah-cloth', [[22, 14]]),
  ...block('ch2-water-jars', [[21, 11], [11, 11]]),
  // Pilgrims resting, pilgrims in groups, pigeons everywhere underfoot.
  ...block('ch3-pilgrim-cluster', [[8, 13], [25, 11], [19, 19]]),
  ...block('ch2-tea-travellers', [[12, 20], [27, 21]]),
  ...loose('karbila-pigeons', [[15, 14], [18, 16], [12, 18], [21, 18], [16, 20], [24, 15]]),
  ...loose('rug', [[13, 12]]),
  // A few palms over the house walls on the edges.
  ...palms([[33, 5], [33, 14], [31, 20], [0, 27], [8, 28], [33, 26], [1, 6]], WATCHED),
];

const npcs: NpcSpec[] = [
  // Shaykh Ḥasan by the gate, through every season.
  { gridX: HASAN[0], gridY: HASAN[1], texture: 'karbila-hasan',
    prompt: 'Speak with the Man by the Gate  [E]', dialogue: 'kr-hasan',
    present: f => krSummer(f) && !f.krMetHasan },
  { gridX: HASAN[0], gridY: HASAN[1], texture: 'karbila-hasan',
    prompt: 'Speak with Shaykh Ḥasan  [E]', dialogue: 'kr-hasan-arafih',
    present: f => krSummer(f) && !!f.krMetHasan,
    gate: { when: arafihReady, lockedDialogue: 'kr-hasan-waiting' } },
  { gridX: HASAN[0], gridY: HASAN[1], texture: 'karbila-hasan',
    prompt: 'Speak with Shaykh Ḥasan  [E]', dialogue: 'kr-hasan-winter', present: krWinter },
  { gridX: HASAN[0], gridY: HASAN[1], texture: 'karbila-hasan',
    prompt: 'Speak with Shaykh Ḥasan  [E]', dialogue: 'kr-hasan-spring', present: krSpring,
    gate: { when: f => !!f.krHouseEmpty, lockedDialogue: 'kr-hasan-spring-wait' } },
  // The gate itself: the art draws it; the player may go in to pray, never seen within.
  { gridX: SHRINE_GATE.x, gridY: SHRINE_GATE.y,
    prompt: 'The gate of the shrine  [E]', dialogue: 'kr-shrine-gate',
    present: f => !f.krVisitedGrave },
  { gridX: SHRINE_GATE.x, gridY: SHRINE_GATE.y,
    prompt: 'The gate of the shrine  [E]', dialogue: 'kr-shrine-gate-again',
    present: f => !!f.krVisitedGrave },
  { gridX: SERVANT[0], gridY: SERVANT[1], texture: 'karbila-servant',
    prompt: 'Speak with the Keeper of the Shrine  [E]', dialogue: 'kr-servant' },
  { gridX: TURBAH[0], gridY: TURBAH[1], texture: 'karbila-turbah-seller',
    prompt: 'Speak with the Turbah-Seller  [E]', dialogue: 'kr-turbah' },
  { gridX: CLASSMATE[0], gridY: CLASSMATE[1], texture: 'karbila-classmate',
    prompt: 'Speak with the Man in the Fine Cloak  [E]', dialogue: 'kr-classmate',
    present: krSummer },
];

export const karbilaShrineCourtMap: MapDefinition = {
  key: 'KarbilaShrineCourt',
  title: 'Karbilá: before the Shrine of the Imám Ḥusayn',
  width: W,
  height: H,
  spawn: { x: 1, y: GROVES_Y[0] },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(6, 10, 24, 12, 'stone');
    paintRect(0, GROVES_Y[0], 8, 2, 'path');
    paintRect(LANE_X[0], 0, 2, 13, 'path');
    paintRect(28, 11, 4, 2, 'path');
    paintRect(8, 22, 14, 2, 'path');
  },
  buildings,
  decor: props,
  npcs,
  exits: [
    ...GROVES_Y.map(y => ({
      fromX: 0, fromY: y, dx: -1, dy: 0,
      targetScene: 'KarbilaGroves', targetSpawnX: 28, targetSpawnY: y - 1,
      label: '↖ The palm groves and the canal',
    })),
    ...LANE_X.map(x => ({
      fromX: x, fromY: 0, dx: 0, dy: -1,
      targetScene: 'KarbilaLane', targetSpawnX: x - 19, targetSpawnY: 22,
      label: '↗ The lane east of the shrine',
    })),
  ],
  ambience: f => courtAmbience(f),
};

/** Summer glare off the paving; the gold at evening on the day of ʿArafih and after; a soft spring morning. */
function courtAmbience(f: FlagState): MapAmbience {
  const gate = { gridX: SHRINE_GATE.x, gridY: SHRINE_GATE.y + 1, radius: 160, color: 0xffd890, intensity: 0.35 };
  if (krSpring(f)) {
    return { wash: { color: 0xe8e0d0, alpha: 0.12 }, particles: 'motes', music: 'hope', sound: ['birds', 'breeze'], vignette: 0.45 };
  }
  if (krWinter(f)) {
    return { wash: { color: 0xd08850, alpha: 0.3 }, lights: [gate], particles: 'motes', music: 'pilgrimage', sound: ['breeze'], vignette: 0.55 };
  }
  return { wash: { color: 0xf0c890, alpha: 0.16 }, particles: 'dust', music: 'pilgrimage', sound: ['birds', 'breeze'], vignette: 0.5 };
}
