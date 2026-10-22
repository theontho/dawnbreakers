import type { BuildingSpec, DecorSpec, MapDefinition, NpcSpec } from './types';
import { both, has, not } from './kulaynPhases';
import { wallRun } from './wallRuns';

/**
 * Káshán, the eve of Naw-Rúz 1847, at true scale: outside the gate of
 * ʿAṭṭár on the Iṣfahán road. The town wall closes the north with the gate
 * in the middle; the roofs and wind-catchers of the town show over it. The
 * road from Iṣfahán comes up from the south; the caravanserai where the
 * escort's horsemen lodge stands east of the road; an orchard in blossom
 * lies west of it. On the third morning the escort leaves by the track
 * that runs west round the walls, toward Qum and Ṭihrán.
 *
 * Districts (x runs east, y runs south):
 * - The town wall on y = 8; the gate at x 18..21, y 6..8, its door at
 *   (20, 8), leading to Ḥájí Mírzá Jání's house (`KulaynHouse`).
 * - The apron before the gate, x 15..25, y 9..13, where the merchant waits
 *   and the officers argue.
 * - The road from Iṣfahán, x 19..21, y 14..39; the player comes up it.
 * - The caravanserai, x 27..46, y 17..32, its horses at the west face.
 * - The track west round the walls, y 10..11, to the edge at (0, 10).
 * - The orchard, walled, x 2..14, y 16..30.
 */

const W = 48;
const H = 40;
const GATE = { gridX: 18, gridY: 6, w: 4, h: 3 } as const;
export const KASHAN_GATE_DOOR = { x: 20, y: 8 } as const;
export const KASHAN_TRACK_Y = 10;
const ROAD_X = 20;
const JANI = { x: 17, y: 11 } as const;
const BIG = { x: 23, y: 12 } as const;

const riders = has('kulaynRidersCame');
const morning = has('kulaynFarewell');
const dusk = not('kulaynFarewell');

const buildings: BuildingSpec[] = [
  { ...GATE, texture: 'city-gate' },
  // The town behind its wall.
  { gridX: 2, gridY: 2, w: 6, h: 5, texture: 'town-house' },
  { gridX: 10, gridY: 3, w: 5, h: 4, texture: 'town-house-small' },
  { gridX: 25, gridY: 2, w: 6, h: 5, texture: 'town-house' },
  { gridX: 34, gridY: 3, w: 5, h: 4, texture: 'town-house-small' },
  // Not the court-glimpse house: the town wall runs close before these, and its gateway is its own street front.
  { gridX: 40, gridY: 2, w: 6, h: 5, texture: 'town-house', variant: 0 },
  // The caravanserai by the gate.
  { gridX: 27, gridY: 17, w: 12, h: 16, texture: 'ch2-caravanserai' },
  { gridX: 39, gridY: 17, w: 8, h: 16, texture: 'ch2-caravanserai-east' },
];

function walls(): DecorSpec[] {
  const orchard: ReadonlyArray<readonly [number, number]> = [[14, 22], [14, 23]];
  return [
    ...wallRun('town-wall', 0, 8, GATE.gridX - 1, 8),
    ...wallRun('town-wall', GATE.gridX + GATE.w, 8, W - 1, 8),
    ...wallRun('ch7-garden-wall', 2, 16, 14, 16),
    ...wallRun('ch7-garden-wall', 2, 30, 14, 30),
    ...wallRun('ch7-garden-wall', 2, 17, 2, 29),
    ...wallRun('ch7-garden-wall', 14, 17, 14, 29, { gaps: orchard }),
  ];
}

const tree = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });

const ORCHARD: DecorSpec[] = [
  [4, 18], [7, 18], [10, 18], [5, 21], [8, 21], [11, 21], [4, 24], [7, 24], [10, 24], [5, 27], [8, 27], [11, 27],
].map(([x, y], i) => tree(x!, y!, i % 3 === 1 ? 'kulayn-apricot' : 'kulayn-almond'));

const props: DecorSpec[] = [
  // Over the wall: cypress and plane in the town's gardens.
  tree(16, 4, 'cypress'), tree(32, 4, 'plane-tree'), tree(9, 1, 'cypress'),
  // Lamps lit at the gate for the festival.
  { gridX: 17, gridY: 9, texture: 'lamp', blocks: true },
  { gridX: 23, gridY: 9, texture: 'lamp', blocks: true },
  // By the road: a well, a plane tree, the merchant's own servant's lantern.
  { gridX: 16, gridY: 19, texture: 'well', blocks: true },
  tree(24, 26, 'plane-tree'), tree(17, 34, 'kulayn-almond'), tree(24, 36, 'kulayn-apricot'),
  { gridX: 26, gridY: 14, texture: 'ch9-water-jar', blocks: true },
  // The escort's horses at the caravanserai's west face, the riders by them.
  { gridX: 25, gridY: 18, texture: 'kulayn-horse', blocks: true, present: riders },
  { gridX: 25, gridY: 20, texture: 'kulayn-horse-grey', blocks: true, present: riders },
  { gridX: 25, gridY: 22, texture: 'kulayn-horse', blocks: true, present: riders },
  { gridX: 25, gridY: 24, texture: 'kulayn-horse-grey', blocks: true, present: riders },
  { gridX: 23, gridY: 19, texture: 'kulayn-rider', blocks: true, present: riders },
  { gridX: 23, gridY: 23, texture: 'kulayn-rider', blocks: true, present: riders },
  { gridX: 23, gridY: 15, texture: 'ch2-bundles', blocks: true, present: riders },
  // The second officer, until he stalks off to the caravanserai.
  { gridX: 25, gridY: 12, texture: 'kulayn-colleague', blocks: true, present: both(riders, not('kulaynLeave')) },
  { gridX: 25, gridY: 12, texture: 'kulayn-colleague', blocks: true, present: morning },
];

const npcs: NpcSpec[] = [
  { gridX: JANI.x, gridY: JANI.y, texture: 'kulayn-jani',
    prompt: 'Speak with Ḥájí Mírzá Jání  [E]',
    dialogue: 'kulayn-jani-gate',
    present: not('kulaynRidersCame') },
  { gridX: JANI.x, gridY: JANI.y, texture: 'kulayn-jani',
    prompt: 'Speak with Ḥájí Mírzá Jání  [E]',
    dialogue: 'kulayn-jani-invite',
    present: both(riders, not('kulaynInvited')),
    gate: { when: has('kulaynLeave'), lockedDialogue: 'kulayn-jani-waiting' } },
  { gridX: JANI.x, gridY: JANI.y, texture: 'kulayn-jani',
    prompt: 'Speak with Ḥájí Mírzá Jání  [E]',
    dialogue: 'kulayn-jani-farewell',
    present: morning },
  { gridX: BIG.x, gridY: BIG.y, texture: 'kulayn-muhammad-big',
    prompt: 'Speak with Muḥammad Big  [E]',
    dialogue: 'kulayn-big-gate',
    present: both(riders, not('kulaynLeave')) },
  { gridX: BIG.x, gridY: BIG.y, texture: 'kulayn-muhammad-big',
    prompt: 'Speak with Muḥammad Big  [E]',
    dialogue: 'kulayn-big-gate-after',
    present: both(has('kulaynLeave'), dusk) },
  { gridX: BIG.x, gridY: BIG.y, texture: 'kulayn-muhammad-big',
    prompt: 'Speak with Muḥammad Big  [E]',
    dialogue: 'kulayn-big-morning',
    present: morning },
];

export const kulaynKashanMap: MapDefinition = {
  key: 'KulaynKashan',
  title: 'Káshán, the Gate of ʿAṭṭár',
  width: W,
  height: H,
  spawn: { x: ROAD_X, y: 37 },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(0, 0, W, 8, 'stone');
    paintRect(3, 17, 11, 13, 'grass');
    // The gate apron, the Iṣfahán road, the track round the walls.
    paintRect(15, 9, 11, 5, 'stone');
    paintRect(ROAD_X - 1, 14, 3, H - 14, 'path');
    paintRect(0, KASHAN_TRACK_Y, 15, 2, 'path');
    paintRect(22, 14, 4, 12, 'path');
  },
  buildings,
  decor: [...walls(), ...ORCHARD, ...props],
  npcs,
  doors: [
    { gridX: KASHAN_GATE_DOOR.x, gridY: KASHAN_GATE_DOOR.y,
      prompt: 'Go in to the house of Ḥájí Mírzá Jání  [E]',
      targetScene: 'KulaynHouse', targetSpawnX: 13, targetSpawnY: 21,
      requires: has('kulaynInvited'),
      lockedLabel: 'The gate of ʿAṭṭár, into Káshán' },
  ],
  exits: [
    { fromX: 0, fromY: KASHAN_TRACK_Y, dx: -1, dy: 0,
      targetScene: 'KulaynCamp', targetSpawnX: 20, targetSpawnY: 37,
      label: '← Ride north with the escort, round the walls',
      requires: has('kulaynRideNorth'),
      lockedLabel: 'The track round the walls, toward Qum' },
  ],
  // Dusk on the eve of Naw-Rúz; on the third morning, clear spring light.
  ambience: f => morning(f)
    ? { wash: { color: 0xf0d8b0, alpha: 0.14 }, particles: 'motes', vignette: 0.45, music: 'road', sound: ['birds', 'breeze'] }
    : { wash: { color: 0xc07850, alpha: 0.32 }, particles: 'motes', vignette: 0.6, music: 'dusk', sound: ['breeze'],
        lights: [{ gridX: KASHAN_GATE_DOOR.x, gridY: KASHAN_GATE_DOOR.y + 1, radius: 140, color: 0xffb860, intensity: 0.22 }] },
};
