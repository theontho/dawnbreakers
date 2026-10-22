import type { BuildingSpec, DecorSpec, MapDefinition } from './types';
import { KASHAN_GATE_DOOR } from './kulaynKashan';
import { both, has, not } from './kulaynPhases';
import { wallRun } from './wallRuns';

/**
 * The house of Ḥájí Mírzá Jání in Káshán, the night of Naw-Rúz 1847, at
 * true scale: a merchant's court open to the sky. Across the north side the
 * summer hall under its wind-catcher, the guest room's door in the tiled
 * iwan at its middle, lamplit and shut. Low ranges of rooms either side,
 * a pool in the middle under almond trees just in flower, the kitchen
 * corner to the east, the street door in the south wall. The player keeps
 * watch on the step; the door is never passed.
 *
 * Districts (x runs east, y runs south):
 * - The summer hall: x 8..16, y 1..4, its door at (12, 4) and the step
 *   before it at (12, 5) (HALL_STEP).
 * - The side ranges: x 1..5 and x 20..24, y 5..8.
 * - The pool: x 11..13, y 11..13; rugs spread for the guests either side.
 * - The kitchen corner: x 21..23, y 10..12.
 * - The street door: the gap in the south wall at x 12..13 (exit at (12, 23)).
 */

const W = 26;
const H = 24;
const HALL = { gridX: 8, gridY: 1, w: 9, h: 4 } as const;
const HALL_STEP = { x: 12, y: 5 } as const;
const DOOR_X = [12, 13] as const;

const night = not('kulaynFarewell');

const buildings: BuildingSpec[] = [
  { ...HALL, texture: 'kulayn-hall' },
  { gridX: 1, gridY: 5, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 20, gridY: 5, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 11, gridY: 11, w: 3, h: 3, texture: 'fountain-pool' },
];

function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    ...wallRun(w, 0, 0, W - 1, 0),
    ...wallRun(w, 0, 1, 0, H - 1),
    ...wallRun(w, W - 1, 1, W - 1, H - 1),
    ...wallRun(w, 1, H - 1, W - 2, H - 1, { gaps: DOOR_X.map(x => [x, H - 1] as const) }),
  ];
}

const tree = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });

const props: DecorSpec[] = [
  // Almond and apricot in flower round the pool, cypresses against the walls.
  tree(7, 10, 'kulayn-almond'), tree(18, 11, 'kulayn-apricot'), tree(7, 16, 'kulayn-apricot'), tree(17, 16, 'kulayn-almond'),
  tree(2, 13, 'cypress'), tree(23, 15, 'cypress'), tree(3, 20, 'cypress'), tree(22, 20, 'cypress'),
  // Rugs and bolsters where the guests sat; the kitchen corner.
  { gridX: 9, gridY: 13, texture: 'rug' },
  { gridX: 15, gridY: 13, texture: 'rug' },
  { gridX: 22, gridY: 11, texture: 'ch6-brazier', blocks: true },
  { gridX: 23, gridY: 10, texture: 'ch9-water-jar', blocks: true },
  { gridX: 21, gridY: 12, texture: 'crates', blocks: true },
  // Lamps along the walk and either side of the hall's step.
  { gridX: 10, gridY: 6, texture: 'lamp', blocks: true },
  { gridX: 14, gridY: 6, texture: 'lamp', blocks: true },
  { gridX: 10, gridY: 19, texture: 'lamp', blocks: true },
  { gridX: 15, gridY: 19, texture: 'lamp', blocks: true },
];

export const kulaynHouseMap: MapDefinition = {
  key: 'KulaynHouse',
  title: 'Káshán, the House of Ḥájí Mírzá Jání',
  width: W,
  height: H,
  spawn: { x: 13, y: 21 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'stone');
    // Flower beds round the pool, the walk from the street door to the hall.
    paintRect(5, 9, 5, 9, 'grass');
    paintRect(15, 9, 5, 9, 'grass');
    paintRect(11, 5, 3, 6, 'path');
    paintRect(11, 14, 3, H - 14, 'path');
  },
  buildings,
  decor: [...walls(), ...props],
  npcs: [
    { gridX: HALL_STEP.x, gridY: HALL_STEP.y, texture: 'kulayn-hall-threshold',
      prompt: 'Keep watch on the step of the guest room  [E]',
      dialogue: 'kulayn-hall-door',
      present: night,
      gate: { when: f => !!f.kulaynHeardHost && !!f.kulaynHeardBaqi, lockedDialogue: 'kulayn-hall-door-locked' } },
    { gridX: HALL_STEP.x, gridY: HALL_STEP.y, texture: 'kulayn-hall-threshold',
      prompt: 'Look in at the open door  [E]',
      dialogue: 'kulayn-hall-empty',
      present: has('kulaynFarewell') },
    { gridX: 16, gridY: 7, texture: 'kulayn-jani',
      prompt: 'Speak with Ḥájí Mírzá Jání  [E]',
      dialogue: 'kulayn-jani-house',
      present: night },
    { gridX: 10, gridY: 21, texture: 'kulayn-abdul-baqi',
      prompt: 'Speak with Siyyid ʿAbdu\'l-Báqí  [E]',
      dialogue: 'kulayn-abdul-baqi',
      present: both(night, not('kulaynHeardBaqi')) },
  ],
  exits: DOOR_X.map(x => ({
    fromX: x, fromY: H - 1, dx: 0, dy: 1,
    targetScene: 'KulaynKashan', targetSpawnX: KASHAN_GATE_DOOR.x, targetSpawnY: KASHAN_GATE_DOOR.y + 1,
    label: '↓ Out by the street door, to the gate of ʿAṭṭár',
  })),
  // Night, the hall's windows lit; on the third morning, cool early light.
  ambience: f => night(f)
    ? { wash: { color: 0x2a3560, alpha: 0.52 }, particles: 'motes', vignette: 0.65, music: 'night', sound: ['breeze'],
        lights: [
          { gridX: HALL_STEP.x, gridY: HALL_STEP.y, radius: 170, color: 0xffc070, intensity: 0.35 },
          { gridX: 9, gridY: 5, radius: 90, color: 0xffb860, intensity: 0.2 },
          { gridX: 15, gridY: 5, radius: 90, color: 0xffb860, intensity: 0.2 },
        ] }
    : { wash: { color: 0xe8d0b0, alpha: 0.16 }, particles: 'motes', vignette: 0.5, music: 'garden', sound: ['birds'] },
};
