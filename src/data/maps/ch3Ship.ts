import type { DecorSpec, MapDefinition } from './types';

/**
 * Chapter 3, autumn 1844: the pilgrim ship from Búshihr to Jidda, under a
 * bruised sky with weather coming, at true scale. A Gulf baghla some 33 m
 * from her square carved stern (west) to the long stem (east) and 10 m in
 * the beam. The stern deckhouse, with its lamplit door facing the waist, is
 * where the Báb keeps prayer and reveals verses through every storm; He is
 * never on deck. Midships: the main hatch, the galley brazier, the mainmast
 * under its reefed lateen sail. At the bow, pilgrims huddle out of the spray.
 * A gap in the near rail leads down to the ship's boat for Jidda once the
 * storm is weathered.
 *
 * Layout (x runs to the bow, y across the deck toward the camera):
 * - Deck: rows y 5..11 from the stern at x 4 to x 22, tapering to the stem at x 27.
 * - Deckhouse: x 5..10, y 6..9; its plank door on (9, 9), its lamplit door facing (11, 8).
 * - Waist: hatch x 14..15, y 7..8; galley at (13, 10); mainmast at (17, 8).
 * - Bow: pilgrims round x 21..24.
 * - The ladder: the rail gap at (15, 11), down to the boat at (15, 14).
 */

const WIDTH = 32;
const HEIGHT = 15;

/** Deck rows per column: the hull is full to x 22, then fines away to the stem. */
function deckSpan(x: number): readonly [number, number] | null {
  if (x >= 4 && x <= 22) return [5, 11];
  if (x === 23 || x === 24) return [6, 10];
  if (x === 25 || x === 26) return [7, 9];
  if (x === 27) return [8, 8];
  return null;
}

function isDeck(x: number, y: number): boolean {
  const span = deckSpan(x);
  return !!span && y >= span[0] && y <= span[1];
}

/** The gap in the near rail where the ladder goes down to the boat. */
const LADDER_X = 15;
const LADDER_TOP_Y = 11;
const CABIN = { gridX: 5, gridY: 6, w: 6, h: 4 };
/** The deck cell before the lamplit door, and the plank door on the deckhouse's side. */
const THRESHOLD = { x: CABIN.gridX + CABIN.w, y: 8 };
const PORT_DOOR = { x: 9, y: CABIN.gridY + CABIN.h - 1 };

/** Bulwarks on every deck cell along the hull's edge; they join into one run. */
function hullRails(): DecorSpec[] {
  const rails: DecorSpec[] = [];
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (!isDeck(x, y) || (x === LADDER_X && y === LADDER_TOP_Y)) continue;
      const openNS = !isDeck(x, y - 1) || !isDeck(x, y + 1);
      const openEW = !isDeck(x - 1, y) || !isDeck(x + 1, y);
      if (!openNS && !openEW) continue;
      rails.push({ gridX: x, gridY: y, texture: 'ch3-ship-rail', blocks: true });
    }
  }
  return rails;
}

export const ch3ShipMap: MapDefinition = {
  key: 'Ch3Ship',
  title: 'Pilgrimage: Aboard Ship',
  width: WIDTH,
  height: HEIGHT,
  trueScale: true,
  spawn: { x: 13, y: 8 },
  build: ({ width, height, paintRect, setTile, block, unblock }) => {
    paintRect(0, 0, width, height, 'water');
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (isDeck(x, y)) setTile(x, y, 'wood');
        else block(x, y);
      }
    }
    // The ladder and the boat's thwarts below the rail gap.
    for (let y = LADDER_TOP_Y + 1; y < height; y++) {
      setTile(LADDER_X, y, 'wood');
      unblock(LADDER_X, y);
    }
  },
  buildings: [
    { ...CABIN, texture: 'ch3-cabin' },
    { gridX: 14, gridY: 7, w: 2, h: 2, texture: 'ch3-hatch' },
  ],
  decor: [
    ...hullRails(),
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
    // The ship's boat at the foot of the ladder.
    { gridX: LADDER_X, gridY: HEIGHT - 1, texture: 'ch3-skiff' },
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
    { gridX: 22, gridY: 8, texture: 'ch3-ship-pilgrim',
      prompt: 'Speak with the Widow from Lár  [E]',
      dialogue: 'ch3-widow' },
  ],
  doors: [
    // The plank door on the deckhouse's side, into the companions' cabin.
    { gridX: PORT_DOOR.x, gridY: PORT_DOOR.y, prompt: 'Go into the companions\' cabin  [E]',
      targetScene: 'Ch3ShipCabin', targetSpawnX: 4, targetSpawnY: 5 },
  ],
  exits: [
    { fromX: LADDER_X, fromY: HEIGHT - 1, dx: 0, dy: 1,
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
