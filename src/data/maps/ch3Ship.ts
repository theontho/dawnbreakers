import { isDeckCell, LADDER_SPRITE, LADDER_X, SHIP_SPRITES } from '../../assets/art/shipHullPlan';
import { animateShipWake } from '../../assets/art/shipWake';
import type { FlagState } from '../../dialogue/types';
import type { DecorSpec, MapDefinition } from './types';

/**
 * Chapter 3, autumn 1844: the pilgrim ship from Búshihr to Jidda, under a
 * bruised sky with weather coming, at true scale. A Gulf baghla some 36 m
 * from her square carved stern (west) to the long raked stem (east) and 11 m
 * in the beam. The stern deckhouse, with its lamplit door facing the waist, is
 * where the Báb keeps prayer and reveals verses through every storm; He is
 * never on deck. Midships: the main hatch, the galley brazier, the mainmast
 * under its reefed lateen sail. At the bow, pilgrims huddle out of the spray.
 * Once the storm is weathered the ship's boat comes alongside, and a gangway
 * in the near rail leads down a rope ladder to it for Jidda.
 *
 * The hull is curved, not built from grid cells: its lines are in
 * `shipHullPlan.ts`, which says which cells are deck, and it is painted as a
 * few large sprites (the hull and deck, then slices of the near bulwark that
 * people on deck pass behind).
 *
 * Layout (x runs to the bow, y across the deck toward the camera):
 * - Deck: rows y 6..10 from x 4 to the stem at x 28; rows 5 and 11 from x 5 to x 22.
 * - Deckhouse: x 5..10, y 6..9; its plank door on (9, 9), its lamplit door facing (11, 8).
 * - Waist: hatch x 14..15, y 7..8; galley at (13, 10); mainmast at (17, 8).
 * - Bow: pilgrims round x 21..24.
 * - The ladder: the gangway at (15, 11), down to the boat at (15, 14).
 */

const WIDTH = 32;
const HEIGHT = 18;
const LADDER_TOP_Y = 11;
/** The ship's boat rides at the foot of the ladder. */
const BOAT_Y = 14;
const CABIN = { gridX: 5, gridY: 6, w: 6, h: 4 };
/** The deck cell before the lamplit door, and the plank door on the deckhouse's side. */
const THRESHOLD = { x: CABIN.gridX + CABIN.w, y: 8 };
const PORT_DOOR = { x: 9, y: CABIN.gridY + CABIN.h - 1 };
/** The boat is lowered and the ladder rigged only after the storm. */
const boatAlongside = (f: FlagState): boolean => !!f.ch3StormWeathered;

/** The hull and the slices of its near bulwark, each sorting where it stands. */
const hull: DecorSpec[] = SHIP_SPRITES.map(s => ({ gridX: s.gridX, gridY: s.gridY, texture: s.texture, sortAt: s.sortAt }));

export const ch3ShipMap: MapDefinition = {
  key: 'Ch3Ship',
  title: 'Pilgrimage: Aboard Ship',
  width: WIDTH,
  height: HEIGHT,
  spawn: { x: 13, y: 8 },
  // Open sea out to the horizon, streaming past from the bow (east) to the stern.
  water: { openSea: true, flow: [-0.9, 0.05], roll: true },
  // The wake streaming astern and the bow wave, moving with her way.
  animate: animateShipWake,
  build: ({ width, height, paintRect, block }) => {
    paintRect(0, 0, width, height, 'water');
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!isDeckCell(x, y)) block(x, y);
      }
    }
  },
  buildings: [
    { ...CABIN, texture: 'ch3-cabin' },
    { gridX: 14, gridY: 7, w: 2, h: 2, texture: 'ch3-hatch' },
  ],
  decor: [
    ...hull,
    // The mainmast, its yard reaching aft over the deckhouse.
    { gridX: 17, gridY: 8, texture: 'ch3-mast', blocks: true },
    // Rope flaked down by the hatch and at the foot of the mast.
    { gridX: 13, gridY: 9, texture: 'ch3-rope-coil' },
    { gridX: 18, gridY: 7, texture: 'ch3-rope-coil' },
    { gridX: 20, gridY: 10, texture: 'ch3-rope-coil' },
    // Water casks lashed along the far rail, and one in the lee of the deckhouse.
    { gridX: 13, gridY: 6, texture: 'ch3-water-cask', blocks: true },
    { gridX: 5, gridY: 10, texture: 'ch3-water-cask', blocks: true },
    // The galley: brazier and stores.
    { gridX: 13, gridY: 10, texture: 'ch3-brazier', blocks: true },
    { gridX: 14, gridY: 10, texture: 'crates', blocks: true },
    // Cargo forward of the mast.
    { gridX: 19, gridY: 6, texture: 'crates', blocks: true },
    { gridX: 20, gridY: 6, texture: 'ch2-bundles', blocks: true },
    { gridX: 16, gridY: 6, texture: 'crates', blocks: true },
    // Pilgrims sheltering at the bow.
    { gridX: 23, gridY: 7, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 23, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 21, gridY: 9, texture: 'rug' },
    { gridX: 7, gridY: 10, texture: 'rug' },
    // After the storm: the ship's boat at the foot of the ladder.
    { gridX: LADDER_X, gridY: BOAT_Y, texture: 'ch3-skiff', present: boatAlongside },
    { gridX: LADDER_SPRITE.gridX, gridY: LADDER_SPRITE.gridY, texture: LADDER_SPRITE.texture, sortAt: LADDER_SPRITE.sortAt,
      present: boatAlongside },
  ],
  npcs: [
    // The lamplit cabin door: a threshold, never a character.
    { gridX: THRESHOLD.x, gridY: THRESHOLD.y, texture: 'ch3-cabin-threshold',
      prompt: 'Keep watch by the lamplit cabin door  [E]',
      dialogue: 'ch3-cabin-storm',
      gate: { when: f => !!f.ch3MetQuddus, lockedDialogue: 'ch3-cabin-quiet' } },
    { gridX: THRESHOLD.x, gridY: 6, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch3-quddus-ship',
      // After the storm he goes below to make a fair copy (see ch3ShipCabin).
      present: f => !f.ch3StormWeathered },
    { gridX: 12, gridY: 6, texture: 'ch3-water-cask',
      prompt: 'Examine the water cask  [E]',
      dialogue: 'ch3-water-cask' },
    { gridX: 12, gridY: 10, texture: 'ch2-mubarak',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch3-mubarak-galley' },
    { gridX: 17, gridY: 10, texture: 'ch3-captain',
      prompt: 'Speak with the Captain  [E]',
      dialogue: 'ch3-captain' },
    { gridX: 19, gridY: 8, texture: 'ch3-sailor',
      prompt: 'Speak with the Sailor  [E]',
      dialogue: 'ch3-sailor' },
    { gridX: 18, gridY: 6, texture: 'ch3-abul-hasan',
      prompt: 'Speak with Ḥájí Abu\'l-Ḥasan  [E]',
      dialogue: 'ch3-abul-hasan' },
    { gridX: 21, gridY: 7, texture: 'ch3-ship-pilgrim',
      prompt: 'Speak with the Widow from Lár  [E]',
      dialogue: 'ch3-widow' },
  ],
  doors: [
    // The plank door on the deckhouse's side, into the companions' cabin.
    { gridX: PORT_DOOR.x, gridY: PORT_DOOR.y, prompt: 'Go into the companions\' cabin  [E]',
      targetScene: 'Ch3ShipCabin', targetSpawnX: 4, targetSpawnY: 5 },
  ],
  // The ladder and the boat's thwarts below the gangway, once the boat is alongside.
  passages: [
    { cells: Array.from({ length: BOAT_Y - LADDER_TOP_Y }, (_, i) => ({ x: LADDER_X, y: LADDER_TOP_Y + 1 + i })),
      open: boatAlongside },
  ],
  exits: [
    { fromX: LADDER_X, fromY: BOAT_Y, dx: 0, dy: 1,
      targetScene: 'Ch3Mecca', targetSpawnX: 1, targetSpawnY: 18,
      label: '↓ Go ashore at Jidda and on to Mecca',
      requires: f => !!f.ch3StormWeathered,
      lockedLabel: 'The coast is still far off. The sea is not finished with you yet.' },
  ],
  ambience: {
    wash: { color: 0x34405a, alpha: 0.42 },
    lights: [
      { gridX: THRESHOLD.x, gridY: THRESHOLD.y, radius: 150, color: 0xffc070, intensity: 0.7 },
      { gridX: 13, gridY: 10, radius: 110, color: 0xff9040, intensity: 0.55 },
    ],
    particles: 'spray', music: 'sea',
    vignette: 0.6,
  },
};
