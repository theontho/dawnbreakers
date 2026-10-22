import { rumourCount } from '../dialogues_ch/chapter01_shiraz';
import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * The Quiet Quarter at night, 22 May 1844, at true scale: a residential
 * quarter in north Shíráz. A lane comes up from the city in the south to a
 * small paved square; on its north side the Báb's house stands behind its
 * court wall, its lamplit entrance facing the square. He is never on the
 * map; the player keeps vigil at the threshold. A cross-lane runs east to
 * west below the square; east it runs on through the city to the Qur'án
 * Gate, where the road north begins (`Road`), opened at dawn.
 *
 * Districts (x runs east, y runs south):
 * - The Báb's house: court wall x 11..23, y 2..12, the house at the back
 *   (x 14..19, y 2..6), the entrance at (17, 12).
 * - The square before it: x 12..23, y 13..18.
 * - Cross-lane: y 19..21 across the map; the way to the Qur'án Gate leaves
 *   east at (35, 20).
 * - Lane to the city: x 16..18, y 22..33, with the neighbourhood well at y 28..30.
 * - Neighbours' houses and walled gardens fill the corners; the orchard in
 *   the south-east is kept low so the watchman on the cross-lane stays in view.
 *   The two south houses west and east of the lane are their own street
 *   fronts, their gateways on the back lane along the south edge.
 */

const W = 36;
const H = 34;
/** The Báb's door, in the court wall's south side. */
const THRESHOLD = { x: 17, y: 12 } as const;

/** Court and garden walls; the south and east edges are cut away to frame the scene. */
function walls(): DecorSpec[] {
  const w = 'compound-wall';
  return [
    // The Báb's court
    ...wallRun(w, 11, 2, 11, 12),
    ...wallRun(w, 23, 2, 23, 12),
    ...wallRun(w, 12, 12, 22, 12, { gaps: [[THRESHOLD.x, THRESHOLD.y]] }),
    ...wallRun(w, 12, 2, 13, 2),
    ...wallRun(w, 20, 2, 22, 2),
    // The north-west garden and the west house's yard
    ...wallRun(w, 0, 8, 9, 8),
    ...wallRun(w, 9, 9, 9, 16),
    ...wallRun(w, 0, 17, 8, 17),
    // The north-east garden, behind the watchman's beat
    ...wallRun(w, 25, 9, 25, 18),
    ...wallRun(w, 26, 18, 34, 18),
    // Between the south houses; the courtyard houses front the back lane along the south edge themselves
    ...wallRun(w, 13, 23, 13, 27),
    // A walled orchard behind the watchman's corner, low enough to see him over
    ...wallRun(w, 28, 23, 34, 23),
    ...wallRun(w, 28, 24, 28, 28),
    ...wallRun(w, 28, 29, 34, 29),
    // The edges
    ...wallRun(w, 0, H - 1, 15, H - 1),
    ...wallRun(w, 19, H - 1, W - 1, H - 1),
    ...wallRun(w, W - 1, 0, W - 1, 18),
    ...wallRun(w, W - 1, 22, W - 1, H - 2),
  ];
}

/** Gardens: cypress and plane trees over the walls, and the orange trees of the Báb's court. */
function trees(): DecorSpec[] {
  const t = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });
  return [
    t(13, 8, 'orange-tree'), t(21, 9, 'orange-tree'),
    t(1, 1, 'cypress'), t(8, 2, 'cypress'), t(3, 9, 'plane-tree'), t(1, 14, 'cypress'),
    t(27, 10, 'plane-tree'), t(31, 13, 'cypress'), t(33, 10, 'cypress'), t(28, 15, 'orange-tree'), t(33, 2, 'cypress'),
    t(30, 25, 'orange-tree'), t(33, 26, 'orange-tree'), t(31, 28, 'orange-tree'),
    t(2, 32, 'cypress'), t(10, 32, 'orange-tree'), t(23, 31, 'plane-tree'), t(30, 32, 'cypress'), t(33, 31, 'orange-tree'),
  ];
}

/** Lamps at the door and along the lanes. */
function lamps(): DecorSpec[] {
  const cells: Array<[number, number]> = [
    [THRESHOLD.x - 1, THRESHOLD.y + 1], [THRESHOLD.x + 1, THRESHOLD.y + 1],
    [12, 18], [23, 18], [6, 19], [27, 21], [33, 19], [19, 24], [15, 30],
  ];
  return cells.map(([gridX, gridY]) => ({ gridX, gridY, texture: 'lamp', blocks: true }));
}

const props: DecorSpec[] = [
  // The square: planters and rose beds, rugs set out for guests
  { gridX: 12, gridY: 14, texture: 'ch1-planter', blocks: true },
  { gridX: 22, gridY: 14, texture: 'ch1-planter', blocks: true },
  { gridX: 13, gridY: 17, texture: 'ch7-rosebush', blocks: true },
  { gridX: 22, gridY: 17, texture: 'ch7-rosebush', blocks: true },
  { gridX: 14, gridY: 14, texture: 'rug' },
  // The neighbourhood well, and a cart's load of crates left for the morning
  { gridX: 14, gridY: 29, texture: 'well', blocks: true },
  { gridX: 20, gridY: 28, texture: 'crates', blocks: true },
  { gridX: 2, gridY: 19, texture: 'ch1-planter', blocks: true },
  { gridX: 31, gridY: 21, texture: 'crates', blocks: true },
];

export const houseQuarterMap: MapDefinition = {
  key: 'HouseQuarter',
  title: 'Shíráz: the Quiet Quarter',
  width: W,
  height: H,
  spawn: { x: 17, y: H - 2 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'path');
    // Gardens behind the walls
    paintRect(0, 0, 11, 8, 'grass');
    paintRect(24, 8, 11, 10, 'grass');
    paintRect(0, 32, 16, 1, 'grass');
    paintRect(19, 30, 16, 3, 'grass');
    paintRect(29, 24, 6, 5, 'grass');
    // The Báb's court, its square, and the little square by the well
    paintRect(12, 3, 11, 9, 'stone');
    paintRect(12, 13, 12, 6, 'stone');
    paintRect(13, 28, 8, 3, 'stone');
    // A small pool in the court
    paintRect(16, 9, 2, 1, 'water');
  },
  buildings: [
    // The Báb's house, at the back of its court
    { gridX: 14, gridY: 2, w: 6, h: 5, texture: 'town-house' },
    // Neighbours
    { gridX: 3, gridY: 3, w: 5, h: 4, texture: 'town-house-small' },
    { gridX: 26, gridY: 2, w: 6, h: 5, texture: 'town-house' },
    { gridX: 2, gridY: 10, w: 6, h: 5, texture: 'town-house' },
    { gridX: 4, gridY: 23, w: 8, h: 7, texture: 'town-house-large' },
    { gridX: 21, gridY: 23, w: 6, h: 5, texture: 'town-house' },
  ],
  decor: [...walls(), ...trees(), ...lamps(), ...props],
  npcs: [
    // The lamplit threshold: the player keeps vigil outside. The Báb is never on the map.
    { gridX: THRESHOLD.x, gridY: THRESHOLD.y, texture: 'ch1-house-threshold',
      prompt: 'Keep vigil at the lamplit threshold  [E]',
      dialogue: 'ch1-threshold-vigil',
      gate: {
        when: f => !!f.metMullaHusayn && rumourCount(f) >= 2,
        lockedDialogue: 'ch1-threshold-closed',
      } },
    // Mullá Ḥusayn waits in the square until he is received
    { gridX: 20, gridY: 17, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch1-mulla-husayn-lane',
      present: f => !!f.metMullaHusayn && !f.vigilKept },
    { gridX: 8, gridY: 19, texture: 'npc-merchant',
      prompt: 'Speak with the Quiet Neighbour  [E]',
      dialogue: 'rumour-neighbour' },
    { gridX: 19, gridY: 14, texture: 'ch1-npc-servant',
      prompt: 'Speak with Mubárak, the Household Servant  [E]',
      dialogue: 'rumour-servant' },
    { gridX: 29, gridY: 20, texture: 'ch1-watchman',
      prompt: 'Speak with the Night Watchman  [E]',
      dialogue: 'ch1-watchman' },
  ],
  exits: [
    { fromX: 17, fromY: H - 1, dx: 0, dy: 1,
      targetScene: 'City', targetSpawnX: 18, targetSpawnY: 1,
      label: '↓ Walk back to the city' },
    { fromX: W - 1, fromY: 20, dx: 1, dy: 0,
      targetScene: 'Road', targetSpawnX: 1, targetSpawnY: 22,
      label: '→ East through the city to the Qur\'án Gate',
      requires: f => !!f.shirazComplete,
      lockedLabel: 'The Qur\'án Gate can wait until dawn' },
  ],
  ambience: {
    wash: { color: 0x34407a, alpha: 0.58 },
    particles: 'fireflies', music: 'night',
    vignette: 0.7,
    lights: [
      { gridX: THRESHOLD.x, gridY: THRESHOLD.y + 1, radius: 150, color: 0xffd080, intensity: 0.5 },
      { gridX: 17, gridY: 6, radius: 120, color: 0xffc070, intensity: 0.25 },
    ],
  },
};
