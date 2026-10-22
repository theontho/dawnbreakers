import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Tabríz, the evening of the examination, at true scale: the lane outside
 * the house of Mírzá ʿAlí-Aṣghar, the Shaykhu'l-Islám. His house fronts the
 * lane on the north side, a long plain wall and one gateway with a carved door.
 * The governor's bodyguard waits in the lane, having refused to beat the
 * Prisoner; a water-boy sits by a house front down the lane. What happens
 * within is never shown: it is told by those who stood outside.
 *
 * Districts (x runs east, y runs south):
 * - The lane: y 10..12 from the west edge (exit at (0, 11)) east.
 * - The Shaykhu'l-Islám's house: x 12..19, y 0..6, its own street front,
 *   the gateway at (17, 6); garden walls run back from its corners at x 9
 *   and x 23. A paved step before the gate, y 7..9.
 * - Neighbouring houses north (x 1..6, x 25..29) and south (y 15..19),
 *   a garden wall between them on y = 16.
 */

const W = 32;
const H = 22;
const LANE = 11;
/** The gateway on the house's street front (town-house-large's front door cell). */
const DOOR = { x: 17, y: 6 } as const;

const buildings: BuildingSpec[] = [
  { gridX: 12, gridY: 0, w: 8, h: 7, texture: 'town-house-large' },
  { gridX: 1, gridY: 3, w: 6, h: 5, texture: 'town-house' },
  { gridX: 25, gridY: 4, w: 5, h: 4, texture: 'town-house-small' },
  // South of the lane the houses stand back, leaving the view of the door open.
  { gridX: 1, gridY: 15, w: 6, h: 5, texture: 'town-house' },
  { gridX: 24, gridY: 15, w: 5, h: 4, texture: 'town-house-small' },
];

/** The Shaykhu'l-Islám's garden walls, the walls between the houses, the map's edges. */
function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    // The house is its own street wall: its garden walls turn back from its front corners.
    ...wallRun(w, 9, 6, 11, 6),
    ...wallRun(w, 9, 0, 9, 5),
    ...wallRun(w, 20, 6, 23, 6),
    ...wallRun(w, 23, 0, 23, 5),
    ...wallRun(w, 7, 16, 23, 16),
    ...wallRun(w, 29, 15, W - 1, 15),
    ...wallRun(w, W - 1, 9, W - 1, 13),
    ...wallRun(w, 0, H - 1, W - 1, H - 1),
  ];
}

const props: DecorSpec[] = [
  // The bodyguard's men, muskets grounded, either side of the door
  { gridX: 15, gridY: 7, texture: 'ch9-soldier', blocks: true },
  { gridX: 19, gridY: 7, texture: 'ch9-soldier', blocks: true },
  // Lamps lit along the lane at dusk
  { gridX: 10, gridY: 9, texture: 'lamp', blocks: true },
  { gridX: 26, gridY: 9, texture: 'lamp', blocks: true },
  // Life at the house fronts
  { gridX: 7, gridY: 14, texture: 'ch9-water-jar', blocks: true },
  { gridX: 27, gridY: 13, texture: 'crates', blocks: true },
  { gridX: 12, gridY: 15, texture: 'well', blocks: true },
  { gridX: 2, gridY: 9, texture: 'plane-tree', blocks: true },
  { gridX: 29, gridY: 10, texture: 'cypress', blocks: true },
];

export const trialLaneMap: MapDefinition = {
  key: 'TrialLane',
  title: 'Tabríz, the Lane of the Shaykhu\'l-Islám',
  width: W,
  height: H,
  spawn: { x: 1, y: LANE },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(0, LANE - 1, W, 3, 'path');
    // The paved step before the gateway, out to the lane.
    paintRect(16, 7, 3, 3, 'stone');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    { gridX: DOOR.x, gridY: DOOR.y,
      prompt: 'Stand before the door of the Shaykhu\'l-Islám  [E]',
      dialogue: 'trial-shaykh-door',
      gate: { when: f => !!f.trialHeardBodyguard && !!f.trialHeardHouseBoy, lockedDialogue: 'trial-shaykh-door-locked' } },
    { gridX: 19, gridY: 10, texture: 'trial-bodyguard',
      prompt: 'Speak with the Officer of the Bodyguard  [E]',
      dialogue: 'trial-bodyguard',
      present: f => !f.trialBastinado },
    { gridX: 6, gridY: 9, texture: 'trial-house-boy',
      prompt: 'Speak with the Water-Boy  [E]',
      dialogue: 'trial-house-boy' },
  ],
  exits: [
    { fromX: 0, fromY: LANE, dx: -1, dy: 0,
      targetScene: 'TrialStreet', targetSpawnX: 40, targetSpawnY: 19,
      label: '← Back to the square before the residence' },
  ],
  // Dusk on the evening of the examination.
  ambience: {
    wash: { color: 0xc07850, alpha: 0.3 },
    particles: 'motes', vignette: 0.65, music: 'sorrow',
    lights: [{ gridX: DOOR.x, gridY: DOOR.y + 1, radius: 120, color: 0xffb860, intensity: 0.2 }],
  },
};
