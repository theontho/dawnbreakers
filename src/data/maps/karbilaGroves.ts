import type { FlagState } from '../../dialogue/types';
import { krSpring, krSummer, krWinter, krWinterRounds, WINTER_NEEDED } from './karbilaPhases';
import { palms } from './karbilaPalms';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';

/**
 * Karbilá, 1851 to 1852: the palm groves on the Ḥusayniyyih canal at the
 * north-western edge of the town, where the pilgrim road from Baghdád comes
 * in. The player arrives on that road from Zanján in the summer of 1851.
 *
 * Layout (x runs east, y runs south):
 * - The pilgrim road: x 14..15 from the north edge down to the canal.
 * - The canal: y 11..12 across the map, bridged at x 14..15.
 * - South of the canal the road turns east at y 17..18 and leaves by the
 *   south-east edge (x = 29) into the town, toward the shrine.
 * - A gardener's house in the north-east grove; palms everywhere else.
 */

const W = 30;
const H = 26;
const ROAD_X = [14, 15] as const;
const CANAL_Y = [11, 12] as const;
const TOWN_Y = [17, 18] as const;
export const GROVES_TOWN_EDGE = { x: W - 2, y: TOWN_Y[0] } as const;

const WATER_SELLER = [12, 9] as const;
const CLASSMATE = [18, 14] as const;

/** Every cell the palms must not hide: the people, the road, the bridge and the way into town. */
const WATCHED: ReadonlyArray<readonly [number, number]> = [
  WATER_SELLER, CLASSMATE, [14, 2], [14, 11], [15, 12],
  ...TOWN_Y.map(y => [W - 1, y] as const), [22, 17], [8, 9],
];

/** The groves, row on row, on both banks; the planter's rows run a little crooked. */
function groveCells(): Array<readonly [number, number]> {
  const out: Array<readonly [number, number]> = [];
  for (let y = 1; y < H; y += 3) {
    for (let x = (y % 2) * 2; x < W; x += 3) {
      const onRoad = x >= 12 && x <= 17 && y <= 19;
      const onTownRoad = y >= 15 && y <= 20 && x >= 12;
      const onCanal = y >= 10 && y <= 13;
      const atHouse = x >= 20 && x <= 27 && y <= 7;
      if (!onRoad && !onTownRoad && !onCanal && !atHouse) out.push([x, y]);
    }
  }
  // Between the canal and the road into town, east of the bridge.
  out.push([20, 15], [23, 14], [26, 15], [28, 14], [21, 20], [25, 21]);
  return out;
}

const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));
const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));

const props: DecorSpec[] = [
  ...loose('ch6-footbridge', ROAD_X.flatMap(x => CANAL_Y.map(y => [x, y] as const))),
  ...block('ch5-river-reeds', [[3, 10], [9, 13], [20, 10], [25, 13], [28, 10]]),
  ...block('ch2-water-jars', [[11, 8]]),
  ...block('crates', [[24, 8]]),
  ...block('ch2-bundles', [[17, 13]]),
  ...block('lamp', [[16, 10]]),
];

const people = [
  // In summer, by the canal: one of the two who came down from Ṭihrán with Bahá'u'lláh.
  { gridX: CLASSMATE[0], gridY: CLASSMATE[1], texture: 'karbila-mazindarani',
    prompt: 'Speak with the Traveller from Mázindarán  [E]', dialogue: 'kr-mazindarani', present: krSummer },
  // The water-seller on the north bank by the bridge, through all three seasons.
  { gridX: WATER_SELLER[0], gridY: WATER_SELLER[1], texture: 'forerunners-water-seller',
    prompt: 'Speak with the Water-Seller  [E]', dialogue: 'kr-water-seller', present: krSummer },
  { gridX: WATER_SELLER[0], gridY: WATER_SELLER[1], texture: 'forerunners-water-seller',
    prompt: 'Speak with the Water-Seller  [E]', dialogue: 'kr-water-seller-winter', present: krWinter },
  { gridX: WATER_SELLER[0], gridY: WATER_SELLER[1], texture: 'forerunners-water-seller',
    prompt: 'Speak with the Water-Seller  [E]', dialogue: 'kr-water-seller-spring', present: krSpring },
  // The old classmate comes out to the canal from the winter on, and has news once the house has been watched.
  { gridX: CLASSMATE[0], gridY: CLASSMATE[1], texture: 'karbila-classmate',
    prompt: 'Speak with your Old Classmate  [E]', dialogue: 'kr-classmate-news', present: krWinter,
    gate: { when: (f: FlagState) => krWinterRounds(f) >= WINTER_NEEDED, lockedDialogue: 'kr-classmate-winter' } },
  { gridX: CLASSMATE[0], gridY: CLASSMATE[1], texture: 'karbila-classmate',
    prompt: 'Speak with your Old Classmate  [E]', dialogue: 'kr-classmate-spring', present: krSpring },
];

export const karbilaGrovesMap: MapDefinition = {
  key: 'KarbilaGroves',
  title: 'Karbilá: the Palm Groves on the Canal',
  width: W,
  height: H,
  spawn: { x: ROAD_X[0], y: 2 },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'grass');
    // The pilgrim road, the bank paths, the road into town.
    paintRect(ROAD_X[0], 0, 2, 19, 'path');
    paintRect(ROAD_X[0], TOWN_Y[0], W - ROAD_X[0], 2, 'path');
    paintRect(0, 9, W, 2, 'sand');
    paintRect(0, 13, W, 1, 'sand');
    paintRect(20, 2, 8, 6, 'sand');
    // The canal, open only at the bridge.
    paintRect(0, CANAL_Y[0], W, 2, 'water');
    for (let x = 0; x < W; x++) {
      if (ROAD_X.includes(x as 14 | 15)) continue;
      for (const y of CANAL_Y) blockCell(x, y);
    }
  },
  buildings: [
    { gridX: 21, gridY: 2, w: 5, h: 4, texture: 'town-house-small' },
  ],
  decor: [...palms(groveCells(), WATCHED), ...props],
  npcs: people,
  exits: TOWN_Y.map(y => ({
    fromX: W - 1, fromY: y, dx: 1, dy: 0,
    targetScene: 'KarbilaShrineCourt', targetSpawnX: 1, targetSpawnY: y + 1,
    label: '↘ Into the town, to the shrine',
  })),
  ambience: f => grovesAmbience(f),
};

/** A white summer noon; a grey winter morning on the water; the palms flowering in spring. */
function grovesAmbience(f: FlagState): MapAmbience {
  if (krSpring(f)) {
    return { wash: { color: 0xe8e4d0, alpha: 0.12 }, particles: 'motes', music: 'hope', sound: ['river', 'birds'], vignette: 0.45 };
  }
  if (krWinter(f)) {
    return { wash: { color: 0x8a90a0, alpha: 0.3 }, particles: 'leaves', music: 'dusk', sound: ['river', 'breeze'], vignette: 0.55 };
  }
  return { wash: { color: 0xf0c890, alpha: 0.18 }, particles: 'dust', music: 'pilgrimage', sound: ['river', 'birds'], vignette: 0.5 };
}
