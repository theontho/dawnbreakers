import type { DecorSpec, MapDefinition } from './types';

/**
 * Chapter 3, autumn 1844: the pilgrim ship from Búshihr to Jidda, under a
 * bruised sky with weather coming. The stern cabin, with its lamplit door,
 * is where the Báb keeps prayer and reveals verses through every storm; He
 * is never on deck. Midships: masts, the hold hatch, the galley brazier.
 * At the bow, pilgrims huddle out of the spray. A ladder in the starboard
 * rail leads down to the ship's boat for Jidda once the storm is weathered.
 */

const WIDTH = 28;
const HEIGHT = 14;

/** Deck rows per column: the hull tapers toward the bow (east). */
function deckSpan(x: number): readonly [number, number] | null {
  if (x >= 2 && x <= 19) return [3, 11];
  if (x === 20 || x === 21) return [4, 10];
  if (x === 22 || x === 23) return [5, 9];
  if (x === 24) return [6, 8];
  if (x === 25) return [7, 7];
  return null;
}

function isDeck(x: number, y: number): boolean {
  const span = deckSpan(x);
  return !!span && y >= span[0] && y <= span[1];
}

/** The gap in the starboard rail where the ladder goes down to the boat. */
const LADDER_X = 14;
const LADDER_TOP_Y = 11;

/** Rails on every deck cell along the hull's edge; they join into one run. */
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
  spawn: { x: 9, y: 7 },
  build: ({ width, height, paintRect, setTile, block, unblock }) => {
    paintRect(0, 0, width, height, 'water');
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (isDeck(x, y)) setTile(x, y, 'path');
        else block(x, y);
      }
    }
    // Raised stern deck around the cabin, and the planked hatch-way.
    paintRect(3, 4, 5, 7, 'stone');
    paintRect(13, 6, 3, 3, 'sand');
    // The ladder down to the ship's boat.
    for (const y of [12, 13]) {
      setTile(LADDER_X, y, 'path');
      unblock(LADDER_X, y);
    }
  },
  buildings: [
    { gridX: 3, gridY: 5, w: 3, h: 4, texture: 'ch3-cabin' },
  ],
  decor: [
    ...hullRails(),
    // Masts
    { gridX: 12, gridY: 7, texture: 'ch3-mast', blocks: true },
    { gridX: 19, gridY: 7, texture: 'ch3-mast', blocks: true },
    // Hold hatch and rope
    { gridX: 14, gridY: 7, texture: 'ch3-hatch', blocks: true },
    { gridX: 13, gridY: 8, texture: 'ch3-rope-coil' },
    { gridX: 17, gridY: 5, texture: 'ch3-rope-coil' },
    { gridX: 18, gridY: 9, texture: 'ch3-rope-coil' },
    // Water casks along the stern rail
    { gridX: 9, gridY: 4, texture: 'ch3-water-cask', blocks: true },
    { gridX: 3, gridY: 10, texture: 'ch3-water-cask', blocks: true },
    // Galley
    { gridX: 10, gridY: 9, texture: 'ch3-brazier', blocks: true },
    { gridX: 9, gridY: 10, texture: 'crates', blocks: true },
    // Cargo
    { gridX: 17, gridY: 9, texture: 'crates', blocks: true },
    { gridX: 17, gridY: 10, texture: 'ch2-bundles', blocks: true },
    { gridX: 16, gridY: 4, texture: 'crates', blocks: true },
    // Pilgrims sheltering at the bow
    { gridX: 22, gridY: 6, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 22, gridY: 8, texture: 'ch3-pilgrim-cluster', blocks: true },
    { gridX: 20, gridY: 8, texture: 'rug' },
    { gridX: 7, gridY: 9, texture: 'rug' },
    // The ship's boat at the foot of the ladder
    { gridX: LADDER_X, gridY: 13, texture: 'ch3-skiff' },
  ],
  npcs: [
    // The lamplit cabin door: a threshold, never a character.
    { gridX: 6, gridY: 7, texture: 'ch3-cabin-threshold',
      prompt: 'Keep watch by the lamplit cabin door  [E]',
      dialogue: 'ch3-cabin-storm',
      gate: { when: f => !!f.ch3MetQuddus, lockedDialogue: 'ch3-cabin-quiet' } },
    { gridX: 6, gridY: 5, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch3-quddus-ship',
      // After the storm he goes below to make a fair copy (see ch3ShipCabin).
      present: f => !f.ch3StormWeathered },
    { gridX: 8, gridY: 4, texture: 'ch3-water-cask',
      prompt: 'Examine the water cask  [E]',
      dialogue: 'ch3-water-cask' },
    { gridX: 11, gridY: 9, texture: 'ch2-mubarak',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch3-mubarak-galley' },
    { gridX: 12, gridY: 4, texture: 'ch3-captain',
      prompt: 'Speak with the Captain  [E]',
      dialogue: 'ch3-captain' },
    { gridX: 18, gridY: 5, texture: 'ch3-sailor',
      prompt: 'Speak with the Sailor  [E]',
      dialogue: 'ch3-sailor' },
    { gridX: 16, gridY: 9, texture: 'ch3-abul-hasan',
      prompt: 'Speak with Ḥájí Abu\'l-Ḥasan  [E]',
      dialogue: 'ch3-abul-hasan' },
    { gridX: 21, gridY: 7, texture: 'ch3-ship-pilgrim',
      prompt: 'Speak with the Widow from Lár  [E]',
      dialogue: 'ch3-widow' },
  ],
  doors: [
    // The plank door on the port side, into the companions' cabin.
    { gridX: 4, gridY: 8, prompt: 'Go into the companions\' cabin  [E]',
      targetScene: 'Ch3ShipCabin', targetSpawnX: 5, targetSpawnY: 6 },
  ],
  exits: [
    { fromX: LADDER_X, fromY: 13, dx: 0, dy: 1,
      targetScene: 'Ch3Mecca', targetSpawnX: 1, targetSpawnY: 13,
      label: '↓ Go ashore at Jidda and on to Mecca',
      requires: f => !!f.ch3StormWeathered,
      lockedLabel: 'The coast is still far off. The sea is not finished with you yet.' },
  ],
  ambience: {
    wash: { color: 0x34405a, alpha: 0.42 },
    lights: [
      { gridX: 6, gridY: 7, radius: 110, color: 0xffc070, intensity: 0.7 },
      { gridX: 10, gridY: 9, radius: 80, color: 0xff9040, intensity: 0.55 },
    ],
    particles: 'spray', music: 'sea',
    vignette: 0.6,
  },
};
