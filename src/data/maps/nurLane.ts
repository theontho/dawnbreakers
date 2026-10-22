import type { BuildingSpec, DecorSpec, MapDefinition, NpcSpec } from './types';
import { both, has, laneRounds, not } from './nurPhases';
import { wallRun } from './wallRuns';

/**
 * Ṭihrán at dawn, summer 1844, at true scale: the lane before the house of
 * the family of the late Mírzá Buzurg of Núr, the Vazír. The house stands
 * behind its courtyard wall on the north side, one door in the wall; the
 * player walks here with the tutor and the scroll, and does not go in. What
 * passes within is told by the tutor when he comes out. A baker lights his
 * oven across the lane; the poor wait by the door, as they do every day.
 *
 * Districts (x runs east, y runs south):
 * - The lane: y 10..12, from the west edge (exit at (0, 11), back to the
 *   madrasa) east to the corner where the road north out of the city turns
 *   up past the last house, x 30..31, to the north edge (exit at (30, 0)).
 * - The house: walls x 9..23, y 0..8, the house at x 12..19, y 0..6, the
 *   door in the wall at (16, 8).
 * - The bakery south of the lane at x 4..9, y 14..17; houses either side.
 */

const W = 32;
const H = 22;
const LANE = 11;
/** The road north out of the city, from the lane's east end to the north edge. */
const ROAD_NORTH = { x: 30, w: 2 } as const;
const NUR_HOUSE_DOOR = { x: 16, y: 8 } as const;

const DOOR_CELL = { gridX: NUR_HOUSE_DOOR.x, gridY: NUR_HOUSE_DOOR.y, texture: 'ch4-uncle-door' } as const;

const tutorAtDawn = both(has('nurScrollGiven'), not('nurTutorWentIn'));
const tutorWithAnswer = both(has('nurTutorCameOut'), not('nurGiftCarried'));

const buildings: BuildingSpec[] = [
  { gridX: 12, gridY: 0, w: 8, h: 7, texture: 'town-house-large' },
  { gridX: 1, gridY: 3, w: 6, h: 5, texture: 'ch10-street-house' },
  { gridX: 25, gridY: 3, w: 5, h: 4, texture: 'town-house-small' },
  // South of the lane: the bakery's house and the neighbours.
  { gridX: 3, gridY: 15, w: 6, h: 5, texture: 'ch10-street-house' },
  { gridX: 13, gridY: 16, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 22, gridY: 15, w: 6, h: 5, texture: 'ch10-street-house' },
];

/** The courtyard wall of the house, the walls between the houses, the map's edges. */
function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    ...wallRun(w, 9, 8, 23, 8, [[NUR_HOUSE_DOOR.x, NUR_HOUSE_DOOR.y]]),
    ...wallRun(w, 9, 0, 9, 7),
    ...wallRun(w, 23, 0, 23, 7),
    ...wallRun(w, 9, 16, 12, 16),
    ...wallRun(w, 18, 16, 21, 16),
    ...wallRun(w, 28, 15, W - 2, 15),
    ...wallRun(w, 0, H - 1, W - 1, H - 1),
  ];
}

const props: DecorSpec[] = [
  // The baker's oven and his wood, at the lane's edge.
  { gridX: 7, gridY: 13, texture: 'zanjan-tanur', blocks: true },
  { gridX: 5, gridY: 13, texture: 'ch8-woodpile', blocks: true },
  { gridX: 10, gridY: 14, texture: 'ch9-water-jar', blocks: true },
  // The poor of the quarter, waiting by the door as on any morning.
  { gridX: 19, gridY: 9, texture: 'ch1-npc-beggar', blocks: true },
  { gridX: 21, gridY: 9, texture: 'crowd', blocks: true },
  // Lamps not yet put out, trees over the walls.
  { gridX: 10, gridY: 9, texture: 'lamp', blocks: true },
  { gridX: 26, gridY: 9, texture: 'lamp', blocks: true },
  { gridX: 2, gridY: 9, texture: 'plane-tree', blocks: true },
  { gridX: 11, gridY: 3, texture: 'cypress', blocks: true },
  { gridX: 21, gridY: 3, texture: 'cypress', blocks: true },
  { gridX: 29, gridY: 13, texture: 'crates', blocks: true },
];

const npcs: NpcSpec[] = [
  { ...DOOR_CELL, prompt: 'Stand before the door of the house of Mírzá Buzurg  [E]',
    dialogue: 'nur-house-door-before',
    present: not('nurTutorWentIn') },
  { ...DOOR_CELL, prompt: 'Wait at the door of the house of Mírzá Buzurg  [E]',
    dialogue: 'nur-house-door-wait',
    present: both(has('nurTutorWentIn'), not('nurTutorCameOut')),
    gate: { when: f => laneRounds(f) >= 2, lockedDialogue: 'nur-house-door-shut' } },
  { ...DOOR_CELL, prompt: 'Look at the door of the house of Mírzá Buzurg  [E]',
    dialogue: 'nur-house-door-after',
    present: has('nurTutorCameOut') },
  { gridX: 17, gridY: 9, texture: 'nur-musa',
    prompt: 'Speak with the Man at the Door  [E]',
    dialogue: 'nur-musa',
    present: tutorAtDawn },
  { gridX: 14, gridY: 10, texture: 'nur-tutor',
    prompt: 'Speak with the Tutor  [E]',
    dialogue: 'nur-tutor-dawn',
    present: tutorAtDawn },
  { gridX: 14, gridY: 10, texture: 'nur-tutor',
    prompt: 'Speak with the Tutor  [E]',
    dialogue: 'nur-tutor-answer',
    present: tutorWithAnswer },
  { gridX: 8, gridY: 12, texture: 'nur-baker',
    prompt: 'Speak with the Baker  [E]',
    dialogue: 'nur-baker' },
  { gridX: 20, gridY: 10, texture: 'nur-poor-man',
    prompt: 'Speak with the Old Man by the Door  [E]',
    dialogue: 'nur-poor-man' },
];

export const nurLaneMap: MapDefinition = {
  key: 'NurLane',
  title: 'Ṭihrán, a Lane at Dawn',
  width: W,
  height: H,
  spawn: { x: 1, y: LANE },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(0, LANE - 1, W, 3, 'path');
    paintRect(ROAD_NORTH.x, 0, ROAD_NORTH.w, LANE - 1, 'path');
    paintRect(14, 9, 5, 1, 'stone');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs,
  exits: [
    { fromX: 0, fromY: LANE, dx: -1, dy: 0,
      targetScene: 'NurMadrasa', targetSpawnX: 12, targetSpawnY: 16,
      label: '← Back to the madrasa' },
    { fromX: ROAD_NORTH.x, fromY: 0, dx: 0, dy: -1,
      targetScene: 'NurTakur', targetSpawnX: 19, targetSpawnY: 32,
      label: '↑ The road north over the mountains to Núr',
      requires: has('nurHusaynFarewell'),
      lockedLabel: 'The road north, out of the city' },
  ],
  // Dawn while the tutor is within; full morning once he has come out.
  ambience: f => f.nurTutorCameOut
    ? { wash: { color: 0xe8c088, alpha: 0.16 }, particles: 'motes', vignette: 0.5, music: 'city', sound: ['birds'] }
    : { wash: { color: 0xb88a9a, alpha: 0.34 }, particles: 'motes', vignette: 0.6, music: 'dusk', sound: ['birds'],
        lights: [{ gridX: 7, gridY: 13, radius: 120, color: 0xffa050, intensity: 0.4 }] },
};
