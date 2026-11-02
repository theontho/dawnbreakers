import type { FlagState } from '../../dialogue/types';
import { krSpring, krSummer, krWinter } from './karbilaPhases';
import { palms } from './karbilaPalms';
import type { BuildingSpec, DecorSpec, MapAmbience, MapDefinition, NpcSpec } from './types';

/**
 * Karbilá, 1851 to 1852: a lane in the quarter east of the shrine, and the
 * courtyard house at its head where Bahá'u'lláh stayed. He is never seen:
 * the house is its gateway (a plain wall and a door, as every house in the
 * lane), the lamp in its upper room on winter nights, and the people who
 * come and go at it.
 *
 * Layout (x runs east, y runs south):
 * - The house: x 8..15, y 0..6, its gateway at (13, 6) on the lane.
 * - The lane: x 11..12 from the south-west edge (y = 23) up to a little
 *   widening before the gateway, x 9..17, y 7..9.
 * - Neighbours' houses on both sides of the lane.
 */

const W = 24;
const H = 24;
const HOUSE = { gridX: 8, gridY: 0, w: 8, h: 7 } as const;
/** The courtyard house's gateway: the front door cell of `town-house-large`. */
export const HOUSE_DOOR = { x: HOUSE.gridX + 5, y: HOUSE.gridY + HOUSE.h - 1 } as const;
const LANE_X = [11, 12] as const;

const AQA_JAN = [12, 8] as const;
const NEIGHBOUR = [9, 12] as const;
const ULUVI = [11, 17] as const;
const ULUVI_WINTER = [10, 9] as const;

const buildings: BuildingSpec[] = [
  { ...HOUSE, texture: 'town-house-large' },
  // West of the lane.
  { gridX: 2, gridY: 8, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 3, gridY: 15, w: 6, h: 5, texture: 'town-house' },
  // East of the lane.
  { gridX: 17, gridY: 1, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 18, gridY: 11, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 18, gridY: 17, w: 6, h: 5, texture: 'town-house' },
];

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture }));

const WATCHED: ReadonlyArray<readonly [number, number]> = [
  AQA_JAN, NEIGHBOUR, ULUVI, ULUVI_WINTER, [HOUSE_DOOR.x, HOUSE_DOOR.y], [HOUSE_DOOR.x, HOUSE_DOOR.y + 1],
  ...LANE_X.map(x => [x, H - 1] as const),
];

const props: DecorSpec[] = [
  // Doorsteps and the things on them.
  ...block('ch9-water-jar', [[8, 12], [14, 15]]),
  ...block('ch2-water-jars', [[17, 7]]),
  ...block('crates', [[10, 20]]),
  ...loose('rug', [[8, 11]]),
  ...block('lamp', [[10, 7], [13, 22]]),
  // The broom and swept dust left on the step when the house is given up.
  ...loose('ch9-empty-space', [[14, 7]]).map(d => ({ ...d, present: krSpring })),
  // Palms over the garden walls behind the houses.
  ...palms([[1, 1], [6, 3], [22, 7], [1, 13], [22, 15], [1, 21], [21, 23], [7, 22]], WATCHED),
];

const npcs: NpcSpec[] = [
  // The gateway of the house: the art draws it; the interaction sits on its door cell.
  { gridX: HOUSE_DOOR.x, gridY: HOUSE_DOOR.y,
    prompt: 'The gate of the house  [E]', dialogue: 'kr-door-summer', present: krSummer },
  { gridX: HOUSE_DOOR.x, gridY: HOUSE_DOOR.y,
    prompt: 'The gate of the house  [E]', dialogue: 'kr-door-winter', present: krWinter },
  { gridX: HOUSE_DOOR.x, gridY: HOUSE_DOOR.y,
    prompt: 'The gate of the house  [E]', dialogue: 'kr-door-spring', present: krSpring },
  // Mírzá Áqá Ján on the step through the winter.
  { gridX: AQA_JAN[0], gridY: AQA_JAN[1], texture: 'karbila-aqa-jan',
    prompt: 'Speak with the Youth on the Step  [E]', dialogue: 'kr-aqa-jan', present: krWinter },
  // The neighbour across the lane.
  { gridX: NEIGHBOUR[0], gridY: NEIGHBOUR[1], texture: 'karbila-neighbour',
    prompt: 'Speak with the Neighbour  [E]', dialogue: 'kr-neighbour', present: f => !krSpring(f) },
  { gridX: NEIGHBOUR[0], gridY: NEIGHBOUR[1], texture: 'karbila-neighbour',
    prompt: 'Speak with the Neighbour  [E]', dialogue: 'kr-neighbour-spring', present: krSpring },
  // Siyyid ʿUlúv's follower: frightened in the lane in summer, carrying water for the house in winter.
  { gridX: ULUVI[0], gridY: ULUVI[1], texture: 'karbila-uluvi',
    prompt: 'Speak with the Man in the Tall Hat  [E]', dialogue: 'kr-uluvi', present: krSummer },
  { gridX: ULUVI_WINTER[0], gridY: ULUVI_WINTER[1], texture: 'karbila-uluvi-bare',
    prompt: 'Speak with the Water-Carrier  [E]', dialogue: 'kr-uluvi-winter', present: krWinter },
];

export const karbilaLaneMap: MapDefinition = {
  key: 'KarbilaLane',
  title: 'Karbilá: a Lane East of the Shrine',
  width: W,
  height: H,
  spawn: { x: LANE_X[0], y: H - 2 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(LANE_X[0], 7, 2, H - 7, 'path');
    paintRect(9, 7, 9, 3, 'path');
  },
  buildings,
  decor: props,
  npcs,
  exits: LANE_X.map(x => ({
    fromX: x, fromY: H - 1, dx: 0, dy: 1,
    targetScene: 'KarbilaShrineCourt', targetSpawnX: x + 19, targetSpawnY: 1,
    label: '↙ Back to the shrine square',
  })),
  ambience: f => laneAmbience(f),
};

/** A hot shuttered afternoon; winter nights with the lamp burning in the upper room; a quiet spring morning. */
function laneAmbience(f: FlagState): MapAmbience {
  if (krSpring(f)) {
    return { wash: { color: 0xd8dce4, alpha: 0.16 }, particles: 'motes', music: 'sorrow', sound: ['birds'], vignette: 0.5 };
  }
  if (krWinter(f)) {
    return {
      wash: { color: 0x2a3560, alpha: 0.55 },
      lights: [{ gridX: 12, gridY: 4, radius: 180, color: 0xffcf80, intensity: 0.55 }],
      particles: 'motes', music: 'night', sound: ['wind'], vignette: 0.65,
    };
  }
  return { wash: { color: 0xf0c890, alpha: 0.18 }, particles: 'dust', music: 'city', sound: ['breeze'], vignette: 0.5 };
}
