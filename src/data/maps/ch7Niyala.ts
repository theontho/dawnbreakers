import type { FlagState } from '../../dialogue/types';
import { NIYALA_TASKS, niyalaHelped } from '../dialogues_ch/chapter07_niyala';
import { CellSet, traceRoute, type Cell } from './ch8MapTools';
import type { DecorSpec, MapAmbience, MapDefinition, NpcSpec } from './types';
import { MAZINDARAN_WOODS, scatterWoodland, type WoodlandPalette } from './woodland';

/**
 * Niyálá, Mázindarán, summer 1848, at true scale: the camp at the foot of
 * the mountain below the village, at dawn (Nabíl, ch. XVI).
 *
 * Days out of Badasht the company pitched its tents here for the night. At
 * first light the people of Niyálá stoned the camp from the brow of the
 * hill and came down to plunder it. The player shelters behind the rocks by
 * the stream with a believer from Khurásán; when the valley is quiet they
 * bind the wounds of Mírzá ʿAbdu'lláh of Shíráz, gather what was left in
 * the grass, take back a saddlebag from a villager, and go to Ṭáhirih
 * before the company parts. Bahá'u'lláh is never on the map: the believers
 * and the narrator tell what He did.
 *
 * Districts (x runs east, y runs south; up the screen is up the hill):
 * - The village of Niyálá on the hilltop: x 1..12, y 1..10, three timber
 *   houses; its path winds down the slope at x 7 and x 10 to the camp.
 * - The slope: scree and woods between the village and the camp.
 * - The camp: x 13..26, y 12..21, two pavilions (Ṭáhirih's at x 20..23,
 *   y 12..14), a lean-to, the dead fire.
 * - The road, rows 22..23, from the south-east edge back to Badasht.
 * - The stream below the road, its rocks where the player shelters (x 8..11,
 *   y 19..21), alder and willow on the far bank.
 */

const W = 32;
const H = 30;
const ROAD_Y = [22, 23] as const;
const CAMP = { x: 13, y: 12, w: 14, h: 10 } as const;
const TAHIRIH_TENT = { gridX: 20, gridY: 12, w: 4, h: 3 } as const;
const COMPANIONS_TENT = { gridX: 14, gridY: 12, w: 4, h: 3 } as const;
const LEAN_TO = { gridX: 25, gridY: 13, w: 2, h: 2 } as const;
const HOUSES = [[1, 1], [8, 1], [1, 7]].map(([gridX, gridY]) => ({ gridX: gridX!, gridY: gridY!, w: 5, h: 4 }));
/** The stream's upper bank row at each x: it bends south as it runs east. */
const streamY = (x: number) => (x < 12 ? 25 : x < 22 ? 26 : 27);

const VILLAGE_PATH: Cell[] = traceRoute([[7, 5], [7, 11], [10, 11], [10, 17], [13, 17]]);
const ROAD: Cell[] = ROAD_Y.flatMap(y => Array.from({ length: W }, (_, x) => [x, y] as const));
const PATHS: Cell[] = [...VILLAGE_PATH, ...ROAD];

const sheltered = (f: FlagState) => !!f.ch7NiyalaSheltered;
const stoning = (f: FlagState) => !f.ch7NiyalaSheltered;

const at = (texture: string, cells: readonly Cell[], extra: Partial<DecorSpec> = {}): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...extra }));

const HAND_DECOR: DecorSpec[] = [
  // The rocks by the stream where the player shelters, on the hill side of him.
  ...at('ch6-rock', [[9, 20], [11, 20], [8, 21], [10, 19]]),
  // Scree on the slope, and the rock Ṭáhirih's odes blew against.
  ...at('ch2-rock', [[5, 14], [3, 18], [12, 8], [15, 6], [6, 19], [26, 15]]),
  // The camp: the dead fire, horses still tethered, a woodpile from the village.
  ...at('ch8-campfire', [[18, 17]]),
  ...at('kulayn-horse', [[25, 19], [21, 20]]),
  ...at('ch8-woodpile', [[6, 6]]),
  ...at('ch9-water-jar', [[13, 6]]),
];

/** The camp before the plunder: baggage stacked by the tents. */
const BAGGAGE: DecorSpec[] = [
  ...at('ch9-cloth-bundle', [[16, 16], [19, 15], [23, 16]], { present: stoning }),
  ...at('ch2-bundles', [[14, 18], [22, 18]], { present: stoning }),
  ...at('crates', [[24, 17]], { present: stoning }),
];

/** The camp after: thrown stones everywhere, a bedroll dropped, a horse gone down to drink. */
const AFTERMATH: DecorSpec[] = [
  ...at('ch8-stone-pile', [[15, 16], [19, 19], [24, 18], [12, 21], [27, 22]], { present: sheltered, blocks: false }),
  ...at('ch8-bedroll', [[13, 15], [23, 20]], { present: sheltered }),
  ...at('kulayn-horse', [[28, 26]], { present: sheltered }),
];

/** The people of Niyálá on the brow of the hill, throwing. */
const VILLAGERS: DecorSpec[] = at('crowd', [[9, 7], [13, 4], [5, 12]], { present: stoning });

const npcs: NpcSpec[] = [
  { gridX: 10, gridY: 21, texture: 'ch7-npc-khurasani',
    prompt: 'Speak with the Believer from Khurásán  [E]',
    dialogue: 'ch7-niyala-khurasani-after',
    gate: { when: sheltered, lockedDialogue: 'ch7-niyala-shelter' } },
  { gridX: 16, gridY: 19, texture: 'ch7-npc-abdullah',
    prompt: 'Speak with Mírzá ʿAbdu\'lláh  [E]',
    dialogue: 'ch7-niyala-abdullah-after',
    gate: { when: f => !!f.ch7BoundWounds, lockedDialogue: 'ch7-niyala-abdullah' },
    present: sheltered },
  { gridX: 22, gridY: 16, texture: 'ch7-npc-tahirih',
    prompt: 'Speak with Ṭáhirih  [E]',
    dialogue: 'ch7-niyala-tahirih',
    gate: { when: f => niyalaHelped(f) >= NIYALA_TASKS, lockedDialogue: 'ch7-niyala-tahirih-wait' },
    present: sheltered },
  { gridX: 14, gridY: 20, texture: 'ch7-split-ledger',
    prompt: 'Pick up the ledger  [E]',
    dialogue: 'ch7-niyala-ledger',
    present: f => sheltered(f) && !f.ch7GatheredLedger },
  { gridX: 25, gridY: 16, texture: 'ch7-strewn-odes',
    prompt: 'Gather the scattered pages  [E]',
    dialogue: 'ch7-niyala-odes',
    present: f => sheltered(f) && !f.ch7GatheredOdes },
  { gridX: 9, gridY: 15, texture: 'ch7-npc-niyala-villager',
    prompt: 'Speak with the Villager of Niyálá  [E]',
    dialogue: 'ch7-niyala-villager',
    present: f => sheltered(f) && !f.ch7NiyalaVillager },
];

/** High summer: oak and alder in full green leaf (the beech and ironwood are painted turning, for autumn). */
const SUMMER_WOODS: WoodlandPalette = { ...MAZINDARAN_WOODS, trees: [['oak', 5], ['alder', 3]] };

const EXITS: Cell[] = ROAD_Y.map(y => [W - 1, y] as const);

function woods(): DecorSpec[] {
  const clear = new CellSet(PATHS);
  clear.addRect(CAMP.x, CAMP.y, CAMP.w, CAMP.h);
  clear.addRect(0, 0, 14, 12);
  // The grassy bank from the road down to the water and a step beyond it.
  for (let x = 0; x < W; x += 1) for (let y = ROAD_Y[0]; y <= streamY(x) + 2; y += 1) clear.add(x, y);
  for (const item of [...HAND_DECOR, ...BAGGAGE, ...AFTERMATH, ...VILLAGERS]) clear.add(item.gridX, item.gridY);
  clear.addWithNeighbours(npcs.map(n => [n.gridX, n.gridY] as const));
  const verge = new CellSet();
  verge.addWithNeighbours(PATHS);
  const village = new CellSet();
  for (const h of HOUSES) village.addRect(h.gridX, h.gridY, h.w, h.h);
  return scatterWoodland({
    width: W, height: H, seed: 1848, palette: SUMMER_WOODS,
    clear, verge, watched: [...npcs.map(n => [n.gridX, n.gridY] as const), ...EXITS],
    village: { near: village, within: 3 },
    treeDensity: 0.22, density: 0.1, coverDensity: 0.25,
  });
}

/** The grey before sunrise while the stones fall; the low sun on the wreck of the camp after. */
function ambience(f: FlagState): MapAmbience {
  if (sheltered(f)) {
    return { wash: { color: 0xf0b888, alpha: 0.16 }, particles: 'motes', vignette: 0.4, music: 'sorrow', sound: ['river', 'birds'] };
  }
  return { wash: { color: 0x8890b8, alpha: 0.38 }, particles: 'dust', vignette: 0.6, music: 'siege', sound: ['river', 'wind'] };
}

export const ch7NiyalaMap: MapDefinition = {
  key: 'Ch7Niyala',
  title: 'Niyálá, the Camp below the Village',
  width: W,
  height: H,
  spawn: { x: W - 2, y: ROAD_Y[0] },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Trodden ground: the village yards on the hilltop and the camp at its foot.
    paintRect(1, 1, 13, 11, 'sand');
    paintRect(CAMP.x, CAMP.y, CAMP.w, CAMP.h, 'sand');
    // Scree where the slope breaks below the village.
    paintRect(11, 3, 4, 3, 'stone');
    paintRect(2, 13, 5, 3, 'stone');
    paintRect(12, 8, 3, 2, 'stone');
    paintPath(PATHS);
    for (let x = 0; x < W; x += 1) {
      for (const y of [streamY(x), streamY(x) + 1]) { setTile(x, y, 'water'); block(x, y); }
    }
  },
  buildings: [
    ...HOUSES.map(h => ({ ...h, texture: 'ch8-woodcutter-house' })),
    { ...TAHIRIH_TENT, texture: 'ch7-tent-quddus' },
    { ...COMPANIONS_TENT, texture: 'ch7-tent-quddus' },
    { ...LEAN_TO, texture: 'ch8-lean-to' },
  ],
  decor: [...woods(), ...HAND_DECOR, ...BAGGAGE, ...AFTERMATH, ...VILLAGERS],
  npcs,
  exits: EXITS.map(([fromX, fromY]) => ({
    fromX, fromY, dx: 1, dy: 0,
    targetScene: 'Ch7BadashtCamp', targetSpawnX: 1, targetSpawnY: 14,
    label: '↘ Back along the road to Badasht',
  })),
  remarks: [
    { id: 'niyala-dawn', gridX: W - 2, gridY: ROAD_Y[0], radius: 4,
      requires: stoning,
      effect: { set: { ch7NiyalaArrived: true } },
      lines: [
        { speaker: 'Narrator', text: 'Days out of Badasht, the company camped for the night at the foot of a mountain below the village of Niyálá. At first light you went down to the stream to water the horses.' },
        { speaker: 'Narrator', text: 'Then a stone comes down out of the grey and cracks on the road beside you. Then another.' },
        { speaker: 'A Believer from Khurásán', text: 'Down here! Behind the rocks by the water!' },
      ] },
    { id: 'niyala-odes', gridX: 20, gridY: 21, requires: sheltered,
      lines: [
        { speaker: 'Narrator', text: 'All the way from Badasht the friends chanted Ṭáhirih\'s odes behind her howdah, and the valleys gave the verses back. This morning the valley gives back only the stream.' },
      ] },
    { id: 'niyala-stones', gridX: 13, gridY: 17, requires: sheltered,
      lines: [
        { speaker: 'Narrator', text: 'Stones lie everywhere among the tents, grey and round from the stream bed, and the grass is torn where the horses fought their tethers.' },
      ] },
  ],
  ambience,
};
