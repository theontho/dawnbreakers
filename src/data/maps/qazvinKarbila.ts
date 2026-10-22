import type { FlagState } from '../../dialogue/types';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';
import { KARBILA_NEEDED, karbilaRounds } from './qazvinPhases';

/**
 * Karbilá, the first of Muḥarram 1262 (the last days of December 1845): the
 * reception room of the late Siyyid Káẓim's house, where Qurratu'l-ʿAyn
 * teaches from behind a curtain, drawn cut away, about 25 by 17 m. The
 * curtain runs the width of the room; behind it the women's side, lit, with
 * her writing things; before it the men on carpets and bolsters, the place
 * where the player sits empty at the front. Outside, the city is in black
 * for the Imám Ḥusayn; inside, it is the Báb's birthday.
 *
 * Layout: walls along y = 0 and x = 0; the curtain on y = 4, x 1..17 (the
 * women's side y 1..3 is out of reach). The empty place before the curtain
 * at (9, 5); the doorway out to the street at (9, 12).
 */

const W = 18;
const H = 13;
const DOOR_X = 9;
const CURTAIN_Y = 4;
const PLACE = { x: 9, y: 5 } as const;

const left = (f: FlagState) => !!f.qzLeftKarbila;

function roomWalls(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 0; x < W; x++) out.push({ gridX: x, gridY: 0, texture: 'interior-wall', blocks: true });
  for (let y = 1; y < H; y++) out.push({ gridX: 0, gridY: y, texture: 'interior-wall', blocks: true });
  return out;
}

/** The curtain across the room, whole except where the empty place faces it. */
function curtain(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let x = 1; x < W; x++) out.push({ gridX: x, gridY: CURTAIN_Y, texture: 'ch7-curtain', blocks: true });
  return out;
}

function carpets(): DecorSpec[] {
  const out: DecorSpec[] = [];
  for (let y = 6; y <= 10; y++) {
    for (let x = 3; x <= 14; x++) out.push({ gridX: x, gridY: y, texture: (x + y) % 2 ? 'ch7-carpet-madder' : 'ch7-carpet-indigo' });
  }
  return out;
}

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));

const FURNISHED: DecorSpec[] = [
  // The women's side: lamps, her writing desk, the late Siyyid's books.
  ...block('ch8-oil-lamp', [[3, 2], [15, 2]]),
  ...block('writing-desk', [[9, 2]]),
  ...block('ch2-bundles', [[12, 1]]),
  // The men's side: bolsters along the west wall, listeners on the carpets.
  ...[6, 7, 8, 9, 10].map(y => ({ gridX: 1, gridY: y, texture: 'ch7-bolster-west', blocks: true })),
  ...block('ch8-kneeling-companions', [[6, 6], [12, 6], [7, 9]]),
  ...block('ch8-rahl', [[3, 11]]),
  ...block('floor-writing-board', [[15, 11]]),
  ...block('ch8-oil-lamp', [[1, 5], [16, 9], [1, 12]]),
  ...block('ch9-water-jar', [[2, 11]]),
];

export const qazvinKarbilaMap: MapDefinition = {
  key: 'QazvinKarbila',
  title: 'Karbilá: the House of Siyyid Káẓim',
  width: W,
  height: H,
  spawn: { x: DOOR_X, y: H - 2 },
  interior: true,
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'floor');
  },
  buildings: [],
  decor: [...roomWalls(), ...curtain(), ...carpets(), ...FURNISHED],
  npcs: [
    // The voice behind the curtain, reached through the empty place before it.
    { gridX: PLACE.x, gridY: PLACE.y, texture: 'rug',
      prompt: 'Take the empty place before the curtain  [E]',
      dialogue: 'qz-curtain',
      gate: { when: f => karbilaRounds(f) < KARBILA_NEEDED || !f.qzHeardCurtain, lockedDialogue: 'qz-karbila-close' } },
    { gridX: 4, gridY: 8, texture: 'qazvin-salih',
      prompt: 'Speak with Shaykh Ṣáliḥ  [E]',
      dialogue: 'qz-salih' },
    { gridX: 13, gridY: 9, texture: 'qazvin-disciple',
      prompt: 'Speak with the Troubled Disciple  [E]',
      dialogue: 'qz-doubter' },
    { gridX: 16, gridY: 6, texture: 'qazvin-mardiyyih-bright',
      prompt: 'Speak with the Woman in Bright Clothes  [E]',
      dialogue: 'qz-mardiyyih-karbila' },
  ],
  exits: [
    { fromX: DOOR_X, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'QazvinLane', targetSpawnX: 37, targetSpawnY: 15,
      label: '↓ The long road to Qazvín',
      requires: left,
      lockedLabel: 'Outside, Karbilá mourns in black' },
  ],
  ambience: () => karbilaAmbience(),
};

/** Lamplight through the curtain on a winter evening; outside, the drums of Muḥarram. */
function karbilaAmbience(): MapAmbience {
  return {
    wash: { color: 0x8a6448, alpha: 0.34 },
    lights: [
      { gridX: 9, gridY: 3, radius: 200, color: 0xffd890, intensity: 0.4 },
      { gridX: 3, gridY: 2, radius: 120, color: 0xffc070, intensity: 0.4 },
      { gridX: 15, gridY: 2, radius: 120, color: 0xffc070, intensity: 0.4 },
    ],
    particles: 'motes', music: 'night', sound: ['breeze'], vignette: 0.6,
  };
}
