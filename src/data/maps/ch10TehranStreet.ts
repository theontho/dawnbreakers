import { streetTestimonyCount } from '../dialogues_ch/chapter10_street';
import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Ṭihrán, August 1852, at true scale: the prison quarter below the royal
 * citadel, days after the attempt on the Sháh's life. The road from
 * Shimírán comes in at the north (the road the prisoners were driven
 * down). Shuttered shops line the main street; the citadel's palace
 * portico stands behind its wall in the north-east; the stair to the
 * Síyáh-Chál opens off the square in the south-east. After the player's
 * release, the western end of the street leads to the gate where the road
 * to Baghdád begins.
 *
 * Districts (x runs east, y runs south):
 * - The Shimírán road: x 15..16 from the top edge down to the main street.
 * - A walled garden in the north-west, x 1..12, y 1..12, its pool long dry,
 *   its gateway onto the road at (12, 9..10).
 * - Houses between the road and the citadel, x 18..30, y 3..13; the shop
 *   row, every front shuttered, along the street at x 18..29, y 18..19.
 * - The main street: y 20..22 from the west edge (exit at y 21) to the square.
 * - The citadel: its wall on x = 34 and y = 17 (gateway at x 41..43), the
 *   palace portico at x 37..48, y 2..9, its forecourt in front.
 * - The square: x 30..50, y 18..38. The mouth of the prison is an arcade
 *   round a sunken court (y = 39, x = 32 and x = 47), broken at x 39..40 by
 *   the stair, which runs down to the south edge (exit at (39, 45)).
 * - South of the street: the lane x 8..9 runs under a sābāṭ (x 6..11,
 *   y 25..28) to the cross lane (y 34..35); the plundered house, x 0..5,
 *   y 28..31, stands behind its court and its courtyard wall (x = 7 and
 *   y = 33), the wall's door broken open at (4, 33).
 *   A second lane, x 28..29, joins the cross lane to the square.
 */

const W = 52;
const H = 46;
const STREET = 21;
const STAIR = 39;
const SABAT = { x: 6, y: 25 } as const;
const BROKEN_DOOR = { x: 4, y: 33 } as const;

const buildings: BuildingSpec[] = [
  // The garden house in the north-west.
  { gridX: 2, gridY: 2, w: 5, h: 4, texture: 'town-house-small' },
  // Houses between the Shimírán road and the citadel, and west of the road.
  { gridX: 18, gridY: 3, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 25, gridY: 4, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 18, gridY: 10, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 25, gridY: 10, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 4, gridY: 14, w: 6, h: 4, texture: 'ch10-street-house' },
  // The shop row, every front shuttered and barred; one awning left up.
  { gridX: 18, gridY: 18, w: 2, h: 2, texture: 'ch10-shuttered-shop' },
  { gridX: 20, gridY: 18, w: 2, h: 2, texture: 'ch10-shuttered-shop' },
  { gridX: 22, gridY: 18, w: 2, h: 2, texture: 'ch10-shuttered-shop' },
  { gridX: 24, gridY: 18, w: 2, h: 2, texture: 'ch5-market-awning' },
  { gridX: 26, gridY: 18, w: 2, h: 2, texture: 'ch10-shuttered-shop' },
  { gridX: 28, gridY: 18, w: 2, h: 2, texture: 'ch10-shuttered-shop' },
  // The royal citadel: the palace portico behind its wall.
  { gridX: 37, gridY: 2, w: 12, h: 8, texture: 'ch5-palace-portico' },
  // The sābāṭ over the lane: only its outer columns block (see build).
  { gridX: SABAT.x, gridY: SABAT.y, w: 6, h: 4, texture: 'ch10-street-arch', blocks: false },
  // Houses south of the street, and the plundered house.
  { gridX: 13, gridY: 25, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 20, gridY: 25, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 12, gridY: 30, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 20, gridY: 30, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 0, gridY: 28, w: 6, h: 4, texture: 'ch10-street-house' },
  // Along the cross lane, south.
  { gridX: 2, gridY: 37, w: 6, h: 4, texture: 'ch10-street-house' },
  { gridX: 10, gridY: 37, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 18, gridY: 37, w: 6, h: 5, texture: 'town-house' },
];

/** The garden wall, the plundered house's court wall, the citadel wall and the mouth of the prison. */
function walls(): DecorSpec[] {
  const c = 'compound-wall';
  const citadel = 'ch10-city-wall';
  return [
    ...wallRun(c, 1, 1, 12, 1),
    ...wallRun(c, 1, 2, 1, 12),
    ...wallRun(c, 12, 2, 12, 12, { gaps: [[12, 9], [12, 10]] }),
    ...wallRun(c, 2, 12, 11, 12),
    ...wallRun(c, 7, 29, 7, 32),
    ...wallRun(c, 0, 33, 7, 33, { doors: [{ at: [BROKEN_DOOR.x, BROKEN_DOOR.y], open: true }] }),
    ...wallRun(citadel, 34, 0, 34, 17),
    ...wallRun(citadel, 35, 17, 51, 17, { gaps: [[41, 17], [42, 17], [43, 17]] }),
    ...wallRun(citadel, 51, 0, 51, 16),
    // The sunken court at the prison's mouth: an arcade round three sides, open to the stair.
    ...wallRun('ch10-low-arch', 32, 39, STAIR - 1, 39),
    ...wallRun('ch10-low-arch', STAIR + 2, 39, 47, 39),
    ...wallRun('ch10-low-arch', 32, 40, 32, 43),
    ...wallRun('ch10-low-arch', 47, 40, 47, 43),
  ];
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const props: DecorSpec[] = [
  // Before the plundered house's open door: the leaf torn off its pivot, the split bar.
  ...loose('ch10-door-wreckage', [[BROKEN_DOOR.x - 1, BROKEN_DOOR.y + 1]]),
  // The garden: cypress and fruit trees, roses and a planter gone to seed, a rug.
  ...block('cypress', [[2, 8], [2, 11], [10, 3]]),
  ...block('fruit-tree', [[5, 9], [10, 11]]),
  ...block('ch7-rosebush', [[7, 7]]),
  ...block('ch1-planter', [[10, 7]]),
  ...loose('rug', [[4, 7]]),
  // Plane trees along the Shimírán road.
  ...block('plane-tree', [[14, 2], [17, 1]]),
  ...block('cypress', [[14, 16]]),
  ...block('cypress', [[14, 8], [24, 8]]),
  // The water-seller's well beside the street.
  ...block('well', [[8, 19]]),
  // The shop row: goods left out in haste.
  ...block('crates', [[30, 19], [17, 19]]),
  ...block('ch9-cloth-bundle', [[22, 24]]),
  ...loose('rug', [[19, 20]]),
  ...block('lamp', [[17, 18], [30, 18], [12, 19]]),
  // Crowds gathering and scattering on the street.
  ...loose('crowd-shadow', [[24, 22], [29, 21], [6, 21], [33, 25]]),
  // The citadel: cypresses either side of the portico, lamps in the forecourt, sentries at its gateway.
  ...block('cypress', [[35, 3], [35, 8], [50, 3], [50, 8]]),
  ...block('lamp', [[37, 13], [48, 13], [40, 18], [44, 18]]),
  ...block('ch9-soldier', [[39, 18], [45, 18], [42, 12]]),
  // The square: a patrol, a barred vent over the pit, coiled chain, a bundle dropped in the flight.
  ...block('ch9-soldier', [[31, 24], [48, 28]]),
  ...block('ch6-barred-marker', [[44, 32]]),
  ...block('ch10-chain-coil', [[46, 33]]),
  ...block('ch9-cloth-bundle', [[33, 32]]),
  // Onlookers kept back from the prison stair.
  ...block('crowd', [[35, 35], [44, 36]]),
  ...loose('crowd-shadow', [[40, 31], [37, 37]]),
  ...block('lamp', [[37, 25], [45, 25]]),
  ...block('plane-tree', [[49, 21], [31, 36]]),
  // The stair: lamps at its mouth, rubble and chain either side.
  ...block('lamp', [[STAIR - 2, 40], [STAIR + 3, 40]]),
  ...block('ch6-rock', [[33, 42], [46, 42], [35, 44]]),
  ...block('ch10-chain-coil', [[44, 41]]),
  ...block('ch10-chain-pillar', [[STAIR + 2, 43]]),
  // The plundered house: its goods strewn in the cross lane.
  ...block('ch9-cloth-bundle', [[2, 35]]),
  ...block('crates', [[6, 35]]),
  ...loose('rug', [[11, 35]]),
  // The southern edge of the quarter.
  ...block('plane-tree', [[26, 39], [12, 43]]),
  ...block('cypress', [[0, 43], [28, 43]]),
];

export const ch10TehranStreetMap: MapDefinition = {
  key: 'Ch10TehranStreet',
  title: 'Ṭihrán: the Prison Quarter',
  width: W,
  height: H,
  spawn: { x: 15, y: 1 },
  build: ({ paintRect, block: blockCell }) => {
    paintRect(0, 0, W, H, 'sand');
    // The walled garden; its dry pool a stone basin of silt.
    paintRect(2, 2, 10, 10, 'grass');
    paintRect(6, 8, 3, 3, 'stone');
    paintRect(7, 9, 1, 1, 'sand');
    blockCell(7, 9);
    // The citadel forecourt and the square before the prison.
    paintRect(35, 10, 16, 7, 'stone');
    paintRect(30, 18, 21, 21, 'stone');
    // The road down from Shimírán, the main street, the lanes.
    paintRect(15, 0, 2, STREET - 1, 'path');
    paintRect(0, STREET - 1, 30, 3, 'path');
    paintRect(8, 23, 2, 11, 'path');
    paintRect(2, 34, 28, 2, 'path');
    paintRect(28, 23, 2, 11, 'path');
    paintRect(41, 17, 3, 1, 'path');
    // The prison stair, cut down from the square to the pit.
    paintRect(STAIR, 37, 2, H - 37, 'path');
    // The sābāṭ's piers either side of the lane under it.
    for (let y = SABAT.y; y < SABAT.y + 4; y++) {
      for (const x of [SABAT.x, SABAT.x + 1, SABAT.x + 4, SABAT.x + 5]) blockCell(x, y);
    }
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    { gridX: 25, gridY: 20, texture: 'ch10-shopkeeper',
      prompt: 'Speak with the Shopkeeper  [E]',
      dialogue: 'ch10-shopkeeper-winter',
      gate: { when: f => !!f.ch10Released, lockedDialogue: 'ch10-shopkeeper' } },
    { gridX: 9, gridY: 19, texture: 'ch10-water-seller',
      prompt: 'Speak with the Water-Seller  [E]',
      dialogue: 'ch10-water-seller' },
    { gridX: 27, gridY: 21, texture: 'crowd-shadow',
      prompt: 'Listen to the whispering crowd  [E]',
      dialogue: 'ch10-whispers',
      present: f => !f.ch10Released },
    { gridX: BROKEN_DOOR.x, gridY: BROKEN_DOOR.y,
      prompt: 'Look at the broken door  [E]',
      dialogue: 'ch10-plundered-house' },
    { gridX: 35, gridY: 41, texture: 'ch10-waiting-sister',
      prompt: 'Speak with the waiting woman  [E]',
      dialogue: 'ch10-waiting-sister',
      present: f => !f.ch10Released },
    { gridX: STAIR + 1, gridY: 41, texture: 'ch10-guard',
      prompt: 'Speak with the guard at the stair  [E]',
      dialogue: 'ch10-guard',
      gate: { when: f => streetTestimonyCount(f) >= 2, lockedDialogue: 'ch10-guard-turnaway' },
      present: f => !f.ch10Arrested },
  ],
  exits: [
    { fromX: STAIR, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch10SiyahChal', targetSpawnX: 16, targetSpawnY: 1,
      label: '↓ Down the stair into the Síyáh-Chál',
      requires: f => !!f.ch10Arrested && !f.ch10Released,
      lockedLabel: 'The prison stair is barred' },
    { fromX: 0, fromY: STREET, dx: -1, dy: 0,
      targetScene: 'Ch10ExileRoad', targetSpawnX: 47, targetSpawnY: 18,
      label: '← To the western gate',
      requires: f => !!f.ch10Released,
      lockedLabel: 'The western gate can wait' },
  ],
  ambience: {
    wash: { color: 0xc88a58, alpha: 0.3 },
    particles: 'dust', music: 'night',
    vignette: 0.6,
    lights: [
      { gridX: STAIR, gridY: 41, radius: 150, color: 0x8090b0, intensity: 0.25 },
    ],
  },
};
