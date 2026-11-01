import type { FlagState } from '../../dialogue/types';
import { fortiethDay } from './forerunnersPhases';
import { KUFIH_ROAD } from './karbilaQuarter';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The old masjid of Kúfih, late January to March 1844 (Nabíl, chapter II):
 * a great walled court open to the sky, where the Imám ʿAlí prayed and was
 * struck down. Along its north wall, ranges of retreat cells with wool
 * curtains; in the court, small domed stations, a well. Mullá Ḥusayn keeps
 * forty days of prayer and fasting in the third cell, his brother and
 * nephew beside him. The game never shows the sanctuary.
 *
 * Layout (x runs east, y runs south): the court wall on y = 4 and x = 0
 * (its gate at (0, 14), toward Karbilá, north-west), and on the cut-away
 * edges y = 25 and x = 29; palms beyond the north wall, y 0..3. The cell
 * ranges x 1..6, 8..13, 16..21, 23..28 on y 5..6; Mullá Ḥusayn's cell
 * opens at (10, 7), the player's at (18, 7).
 */

const W = 30;
const H = 26;
const GATE = { x: 0, y: 14 } as const;
const HUSAYN_CELL = { x: 10, y: 7 } as const;

const retreat = (f: FlagState) => !fortiethDay(f);

function walls(): DecorSpec[] {
  const court = 'town-wall';
  return [
    ...wallRun(court, 0, 4, W - 1, 4),
    ...wallRun(court, 0, 5, 0, H - 1, { doors: [{ at: [GATE.x, GATE.y], open: true }] }),
    ...wallRun(court, 1, H - 1, W - 1, H - 1),
    ...wallRun(court, W - 1, 5, W - 1, H - 2),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // The palms beyond the north wall.
  ...block('date-palm-tall', [[2, 1], [13, 0], [24, 2]]),
  ...block('date-palm', [[7, 2], [18, 1], [28, 0]]),
  // Lamps along the cells, a well in the court, the water-jars of the fasting.
  ...block('lamp', [[7, 8], [15, 8], [22, 8]]),
  ...block('well', [[15, 12]]),
  ...block('ch9-water-jar', [[12, 7], [20, 7], [16, 13]]),
  ...block('ch2-bundles', [[3, 7], [26, 7]]),
  { gridX: 13, gridY: 8, texture: 'rug' },
  // The other company of the Siyyid's students, keeping their own vigil at the far cells.
  ...block('ch8-kneeling-companions', [[24, 8], [27, 9]]),
  { gridX: 25, gridY: 9, texture: 'rug' },
  // Prayer mats left out in the court, and the keeper's bundle by the gate.
  { gridX: 9, gridY: 17, texture: 'rug' },
  { gridX: 17, gridY: 20, texture: 'rug' },
  ...block('ch2-bundles', [[1, 10]]),
];

export const kufihMosqueMap: MapDefinition = {
  key: 'KufihMosque',
  title: 'The Masjid of Kúfih',
  width: W,
  height: H,
  spawn: { x: GATE.x + 1, y: GATE.y },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'stone');
    paintRect(0, 0, W, 4, 'grass');
    for (let y = 0; y < 4; y++) for (let x = 0; x < W; x++) blockCell(x, y);
    // The worn way from the gate across the court to the cells.
    paintRect(1, 13, 14, 2, 'path');
    paintRect(8, 7, 14, 1, 'path');
  },
  buildings: [
    { gridX: 1, gridY: 5, w: 6, h: 2, texture: 'kufih-cells' },
    { gridX: 8, gridY: 5, w: 6, h: 2, texture: 'kufih-cells' },
    { gridX: 16, gridY: 5, w: 6, h: 2, texture: 'kufih-cells' },
    { gridX: 23, gridY: 5, w: 6, h: 2, texture: 'kufih-cells' },
    // The small domed stations of the court.
    { gridX: 20, gridY: 15, w: 2, h: 2, texture: 'ch9-brick-dome' },
    { gridX: 6, gridY: 19, w: 2, h: 2, texture: 'ch9-brick-dome' },
    { gridX: 23, gridY: 21, w: 2, h: 2, texture: 'ch9-brick-dome' },
  ],
  decor: [...walls(), ...props],
  npcs: [
    { gridX: 2, gridY: 12, texture: 'forerunners-keeper',
      prompt: 'Speak with the Keeper of the Masjid  [E]',
      dialogue: 'fr-kufih-keeper' },
    { gridX: 12, gridY: 9, texture: 'ch1-brother',
      prompt: 'Speak with Mullá Ḥusayn\'s Brother  [E]',
      dialogue: 'fr-kufih-brother' },
    { gridX: 14, gridY: 13, texture: 'forerunners-nephew',
      prompt: 'Speak with Mullá Ḥusayn\'s Nephew  [E]',
      dialogue: 'fr-kufih-nephew' },
    { gridX: 18, gridY: 7, texture: 'rug',
      prompt: 'Keep your vigil in your cell  [E]',
      dialogue: 'fr-own-cell' },
    { gridX: HUSAYN_CELL.x, gridY: HUSAYN_CELL.y, texture: 'ch8-oil-lamp',
      prompt: 'Listen at Mullá Ḥusayn\'s cell  [E]',
      dialogue: 'fr-husayn-cell',
      present: retreat },
    { gridX: HUSAYN_CELL.x, gridY: HUSAYN_CELL.y + 3, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'fr-husayn-fortieth',
      present: fortiethDay },
  ],
  exits: [
    { fromX: GATE.x, fromY: GATE.y, dx: -1, dy: 0,
      targetScene: 'KarbilaQuarter', targetSpawnX: KUFIH_ROAD.x - 1, targetSpawnY: KUFIH_ROAD.y,
      label: '↖ The road back to Karbilá' },
  ],
  ambience: f => kufihAmbience(f),
};

/** The long cold nights of the retreat, lamps at the cells; then the fortieth dawn. */
function kufihAmbience(f: FlagState): MapAmbience {
  const lamp = (gridX: number, gridY: number) => ({ gridX, gridY, radius: 120, color: 0xffc070, intensity: 0.45 });
  if (fortiethDay(f)) {
    return {
      wash: { color: 0xd8a070, alpha: 0.26 },
      lights: [{ gridX: 11, gridY: 10, radius: 180, color: 0xffe0b0, intensity: 0.3 }],
      particles: 'motes', music: 'hope', sound: ['birds', 'breeze'], vignette: 0.5,
    };
  }
  return {
    wash: { color: 0x2a3560, alpha: 0.52 },
    lights: [lamp(HUSAYN_CELL.x, HUSAYN_CELL.y), lamp(18, 7), lamp(3, 7)],
    particles: 'motes', music: 'night', sound: ['wind'], vignette: 0.68,
  };
}
