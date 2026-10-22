import type { DecorSpec, MapDefinition } from './types';

/**
 * Inside the stern deckhouse of the pilgrim ship: the companions' cabin,
 * entered by the plank door on the port side. Bedding rolls, a sea chest,
 * a lamp that swings with the swell, Quddús's writing things. A curtain
 * across the partition in the back wall closes off the inner room where
 * the Báb keeps prayer; it is a threshold, never opened. Quddús is on deck
 * until the storm has passed, then here at his fair copy.
 */

const W = 10;
const H = 8;
const CURTAIN_X = 6;
const LAMP = { x: 5, y: 3 };

function cabinWalls(): DecorSpec[] {
  const back: Record<number, string> = { 2: 'ch3-cabin-port', [CURTAIN_X]: 'ch3-cabin-curtain', 8: 'ch3-cabin-pegs' };
  const side: Record<number, string> = { 3: 'ch3-cabin-port', 6: 'ch3-cabin-pegs' };
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: back[x] ?? 'ch3-cabin-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: side[y] ?? 'ch3-cabin-wall', blocks: true });
  return out;
}

export const ch3ShipCabinMap: MapDefinition = {
  key: 'Ch3ShipCabin',
  title: 'Pilgrimage: The Companions\' Cabin',
  width: W,
  height: H,
  spawn: { x: 5, y: 6 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'wood');
  },
  buildings: [],
  decor: [
    ...cabinWalls(),
    // Mubárak's bedding against the partition; the companions' along the side.
    { gridX: CURTAIN_X + 1, gridY: 1, texture: 'ch3-bedding-roll', blocks: true },
    { gridX: 1, gridY: 2, texture: 'ch3-bedding-roll', blocks: true },
    { gridX: 1, gridY: 4, texture: 'ch3-bedding-roll', blocks: true },
    // Stores for a long voyage.
    { gridX: 1, gridY: 6, texture: 'ch3-sea-chest', blocks: true },
    { gridX: 9, gridY: 1, texture: 'ch3-water-cask', blocks: true },
    { gridX: 9, gridY: 3, texture: 'crates', blocks: true },
    { gridX: 8, gridY: 6, texture: 'ch3-rope-coil' },
    // Quddús's corner under the lamp.
    { gridX: 4, gridY: 4, texture: 'rug' },
    { gridX: LAMP.x, gridY: LAMP.y, texture: 'ch3-hanging-lamp', blocks: true, swing: 7 },
  ],
  npcs: [
    // The curtained partition: a threshold, never a character.
    { gridX: CURTAIN_X, gridY: 1, texture: 'ch3-curtain-threshold',
      prompt: 'Stand before the curtain  [E]',
      dialogue: 'ch3-cabin-curtain' },
    { gridX: 3, gridY: 4, texture: 'ch3-cabin-pages',
      prompt: 'Look at Quddús\'s writing things  [E]',
      dialogue: 'ch3-cabin-pages' },
    { gridX: 4, gridY: 3, texture: 'ch3-quddus',
      prompt: 'Speak with Quddús  [E]',
      dialogue: 'ch3-quddus-cabin',
      present: f => !!f.ch3StormWeathered },
    { gridX: 2, gridY: 6, texture: 'ch3-ship-boy',
      prompt: 'Speak with the Ship\'s Boy  [E]',
      dialogue: 'ch3-ship-boy-after',
      gate: { when: f => !!f.ch3StormWeathered, lockedDialogue: 'ch3-ship-boy' } },
  ],
  exits: [
    { fromX: 5, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'Ch3Ship', targetSpawnX: 4, targetSpawnY: 9,
      label: '↓ Back out on deck' },
  ],
  ambience: f => ({
    wash: f.ch3StormWeathered ? { color: 0xd0a070, alpha: 0.22 } : { color: 0xb07850, alpha: 0.32 },
    particles: 'motes', music: 'sea', sound: ['sea'],
    vignette: 0.5,
    lights: [
      { gridX: LAMP.x, gridY: LAMP.y, radius: 150, color: 0xffc070, intensity: 0.65 },
      { gridX: CURTAIN_X, gridY: 1, radius: 80, color: 0xffd090, intensity: 0.45 },
    ],
  }),
};
