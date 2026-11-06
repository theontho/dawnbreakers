import type { FlagState } from '../../dialogue/types';
import { bfDawn, bfTownComing } from './barfurushPhases';
import { traceRoute, widen, type Cell } from './ch8MapTools';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';

/**
 * The road across the rice plain of Mázindarán, a farsang south of
 * Bárfurúsh, at dawn in October 1848, at true scale. The companions of the
 * Black Standard have camped by the road where it comes down out of the
 * woods; north of them it runs straight across the flooded paddies toward
 * the town, past a lone old alder on its verge. There, when the town comes
 * out, the first of them fall.
 *
 * Districts (x runs east, y runs south):
 * - The road, two cells wide: in from the south at (15..16, 31), north to
 *   y 21, a jog east, then straight north along x 17..18 to the town (out
 *   at y = 0). Grass verges either side, x 13..14 and 19..21.
 * - The camp, x 2..12, y 21..30: the Standard, the horses, the fire.
 * - The heap of cast-down belongings by the road at (13, 22).
 * - Paddies west (x 1..12, y 1..19) and east (x 22..30, y 1..25), flooded
 *   between grass dikes every fourth row.
 * - The alder at (21, 10), where the stroke fell; the siyyid of Yazd is laid
 *   on the west verge at (15, 13).
 * - A farmhouse and its orchard south-east, x 22..30, y 27..31.
 */

const W = 32;
const H = 32;
const inside = ([x, y]: Cell) => x >= 0 && y >= 0 && x < W && y < H;
const ROAD = widen(traceRoute([[15, 31], [15, 21], [17, 21], [17, 0]])).filter(inside);
const TREE = { x: 21, y: 10 } as const;
const SIYYID = { x: 15, y: 13 } as const;

const isDike = (y: number) => y % 4 === 0;

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // The camp: the Standard planted by the fire, the horses, the bedrolls, men at the dawn prayer.
  ...block('ch8-black-standard', [[8, 22]]),
  ...block('ch8-campfire', [[7, 25]]),
  ...block('kulayn-horse', [[3, 23], [4, 28], [10, 29]]),
  ...block('kulayn-horse-grey', [[2, 26]]),
  ...loose('ch8-bedroll', [[5, 22], [9, 27], [4, 25]], bfDawn),
  ...block('ch8-kneeling-companions', [[11, 21]], f => !f.bfToldCastAway),
  // Trees along the dikes and by the farmhouse: pollards, mulberries, an orange tree in fruit.
  ...block('pollard', [[0, 20], [12, 0], [22, 0], [31, 8], [31, 16], [0, 8]]),
  ...block('mulberry', [[2, 31], [29, 27]]),
  ...block('orange-tree', [[22, 30], [30, 30]]),
  ...block('fruit-tree', [[27, 31]]),
  // The lone alder on the verge, and after the stroke, what is left of it.
  ...block('alder-mature', [[TREE.x, TREE.y]], bfDawn),
  ...block('bf-cleft-tree', [[TREE.x, TREE.y]], f => !!f.bfClash),
  // The town coming out across the fields: a crowd on the road and the dikes.
  ...block('crowd', [[17, 3], [18, 3], [17, 4], [18, 5], [16, 2], [19, 2], [19, 4], [20, 3], [15, 4], [16, 6]], bfTownComing),
  ...loose('crowd-shadow', [[18, 7], [20, 6], [14, 3], [21, 1]], bfTownComing),
  // After: what the crowd dropped as it ran.
  ...loose('ch8-stone-pile', [[18, 8], [16, 5]], f => !!f.bfClash),
];

function ambience(f: FlagState): MapAmbience {
  const fire = { gridX: 7, gridY: 25, radius: 120, color: 0xffa050, intensity: 0.4 };
  if (f.bfClash) {
    return { wash: { color: 0xa8a098, alpha: 0.3 }, particles: 'motes', music: 'sorrow', sound: ['wind', 'birds'], vignette: 0.6 };
  }
  if (bfTownComing(f)) {
    return { wash: { color: 0xb8a890, alpha: 0.28 }, particles: 'dust', music: 'siege', sound: ['wind'], vignette: 0.6, lights: [fire] };
  }
  return { wash: { color: 0xc8a088, alpha: 0.34 }, particles: 'motes', music: 'dusk', sound: ['birds', 'breeze'], vignette: 0.55, lights: [fire] };
}

export const barfurushRoadMap: MapDefinition = {
  key: 'BarfurushRoad',
  title: 'The Road to Bárfurúsh',
  width: W,
  height: H,
  spawn: { x: 15, y: 29 },
  build: ({ paintRect, paintPath, setTile, block: blockCell }) => {
    // Paddies, flooded between grass dikes, with a cross-dike in each field.
    for (let y = 1; y < H; y++) {
      if (isDike(y)) continue;
      for (let x = 1; x <= 12; x++) {
        if (y > 19 || x === 6) continue;
        setTile(x, y, 'water'); blockCell(x, y);
      }
      for (let x = 22; x <= 30; x++) {
        if (y > 25 || x === 26) continue;
        setTile(x, y, 'water'); blockCell(x, y);
      }
    }
    // The camp's trampled ground, and the farmhouse yard.
    paintRect(2, 21, 11, 10, 'grass');
    paintRect(5, 23, 5, 5, 'sand');
    paintRect(22, 27, 9, 5, 'grass');
    paintRect(24, 31, 3, 1, 'sand');
    paintPath(ROAD);
  },
  buildings: [
    { gridX: 23, gridY: 27, w: 5, h: 4, texture: 'bf-town-house' },
  ],
  decor: props,
  npcs: [
    // Dawn in the camp.
    { gridX: 10, gridY: 24, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-dawn',
      present: f => !f.bfToldCastAway },
    { gridX: 10, gridY: 24, texture: 'ch8-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'bf-mh-go',
      gate: { when: f => !!f.bfCastAway, lockedDialogue: 'bf-mh-wait' },
      present: f => !!f.bfToldCastAway && bfDawn(f) },
    { gridX: 13, gridY: 22, texture: 'bf-cast-heap',
      prompt: 'Look at the heap by the road  [E]',
      dialogue: 'bf-heap',
      gate: { when: f => !f.bfCastAway, lockedDialogue: 'bf-heap-after' },
      present: f => !!f.bfToldCastAway },
    { gridX: 12, gridY: 27, texture: 'bf-abdul-majid',
      prompt: 'Speak with Ḥájí ʿAbdu\'l-Majíd  [E]',
      dialogue: 'bf-majid',
      gate: { when: f => !!f.bfToldCastAway, lockedDialogue: 'bf-majid-early' },
      present: bfDawn },
    { gridX: 7, gridY: 27, texture: 'ch8-young-companion',
      prompt: 'Speak with Riḍá  [E]',
      dialogue: 'bf-rida-dawn',
      present: bfDawn },

    // After the stroke.
    { gridX: SIYYID.x, gridY: SIYYID.y, texture: 'bf-shroud-siyyid',
      prompt: 'Kneel by the siyyid of Yazd  [E]',
      dialogue: 'bf-siyyid',
      present: f => !!f.bfClash },
    { gridX: 19, gridY: 9, texture: 'ch8-furughi',
      prompt: 'Speak with Mírzá Muḥammad-i-Furúghí  [E]',
      dialogue: 'bf-furughi',
      present: f => !!f.bfClash },
    { gridX: 13, gridY: 16, texture: 'ch8-young-companion',
      prompt: 'Speak with Riḍá  [E]',
      dialogue: 'bf-rida-after',
      present: f => !!f.bfClash },
  ],
  exits: [17, 18].map(fromX => ({
    fromX, fromY: 0, dx: 0, dy: -1,
    targetScene: 'BarfurushMaydan', targetSpawnX: 9, targetSpawnY: 30,
    label: '↑ On into Bárfurúsh, after Mullá Ḥusayn',
    requires: (f: FlagState) => !!f.bfMournedYazdi,
    lockedLabel: 'Not yet: stay with the companions',
  })),
  ambience,
};
