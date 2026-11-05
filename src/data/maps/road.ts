import { readyToPart } from '../dialogues_ch/chapter02_road';
import type { DecorSpec, MapDefinition } from './types';
import { wallRun } from './wallRuns';

/**
 * Chapter 2, dawn in summer 1844, at true scale. The Qur'án Gate of Shíráz
 * and the country just beyond it: the caravanserai where the Letters of the
 * Living load their mules, the Iṣfahán road running east from the gate and
 * then climbing north into the pass, a roadside shrine above the road, a
 * dry stream bed, and a garden corner near the poet's tomb.
 *
 * Districts (x runs east, y runs south):
 * - Inside the walls: x 0..4; the city wall on x = 5, the gate at x 4..6,
 *   y 19..25, its passage on rows 21..23. The west edge (0, 22) leads back
 *   through the city to the Quiet Quarter.
 * - Gate forecourt: x 7..14, y 15..29.
 * - The caravanserai: x 16..35, y 2..17, its gate at (26, 17) onto the yard
 *   (x 14..40, y 18..28), which the road crosses on rows 21..23.
 * - The road north: x 43..45 from the yard to the top edge, the milestone
 *   at its foot; the shrine east of it at x 50..52, y 4..6.
 * - The poet's garden: x 47..57, y 30..43, a water channel down x = 52.
 */

const W = 60;
const H = 48;
const GATE = { x: 4, y: 19, w: 3, h: 7, road: 22 } as const;
const SERAI = { x: 16, y: 2 } as const;
/** The caravanserai's gate, on the front row of its west part (see art/caravanserai.ts). */
const SERAI_DOOR = { x: SERAI.x + 10, y: SERAI.y + 15 } as const;

const rock = (gridX: number, gridY: number): DecorSpec => ({ gridX, gridY, texture: 'ch2-rock', blocks: true });
const scrub = (gridX: number, gridY: number): DecorSpec => ({ gridX, gridY, texture: 'ch2-tamarisk', blocks: true });
const tree = (gridX: number, gridY: number, texture: string): DecorSpec => ({ gridX, gridY, texture, blocks: true });
const stream = (gridX: number, gridY: number): DecorSpec => ({ gridX, gridY, texture: 'ch2-dry-stream' });

/** The city wall, broken by the gate. */
const CITY_WALL: DecorSpec[] = [
  ...wallRun('town-wall', 5, 0, 5, GATE.y - 1),
  ...wallRun('town-wall', 5, GATE.y + GATE.h, 5, H - 1),
];

const INSIDE_THE_WALLS: DecorSpec[] = [
  tree(1, 3, 'plane-tree'), tree(3, 9, 'cypress'), tree(1, 15, 'cypress'),
  tree(2, 29, 'plane-tree'), tree(3, 36, 'cypress'), tree(1, 42, 'orange-tree'),
  { gridX: 3, gridY: 20, texture: 'lamp', blocks: true },
  { gridX: 1, gridY: 25, texture: 'crates', blocks: true },
];

/** Mullá ʿAlí's loads for ʿIráq, the gate's well and its cypresses. */
const FORECOURT: DecorSpec[] = [
  { gridX: 11, gridY: 16, texture: 'ch2-camel', blocks: true },
  { gridX: 12, gridY: 18, texture: 'ch2-bundles', blocks: true },
  { gridX: 7, gridY: 20, texture: 'lamp', blocks: true },
  { gridX: 7, gridY: 24, texture: 'lamp', blocks: true },
  { gridX: 10, gridY: 27, texture: 'well', blocks: true },
  tree(8, 15, 'cypress'), tree(13, 28, 'cypress'), tree(8, 29, 'cypress'),
];

const YARD: DecorSpec[] = [
  { gridX: 33, gridY: 19, texture: 'ch2-camel', blocks: true },
  { gridX: 36, gridY: 25, texture: 'ch2-camel', blocks: true },
  { gridX: 33, gridY: 26, texture: 'ch2-camel', blocks: true },
  { gridX: 27, gridY: 25, texture: 'ch2-campfire', blocks: true },
  { gridX: 26, gridY: 26, texture: 'rug' },
  { gridX: 38, gridY: 19, texture: 'well', blocks: true },
  { gridX: 21, gridY: 19, texture: 'ch2-bundles', blocks: true },
  { gridX: 35, gridY: 20, texture: 'ch2-bundles', blocks: true },
  { gridX: 17, gridY: 25, texture: 'ch2-bundles', blocks: true },
  { gridX: 31, gridY: 25, texture: 'crates', blocks: true },
  { gridX: 15, gridY: 19, texture: 'crates', blocks: true },
  { gridX: 25, gridY: 19, texture: 'lamp', blocks: true },
  { gridX: 28, gridY: 19, texture: 'lamp', blocks: true },
];

/** The pass: boulders and tamarisk either side of the climbing road, the milestone at its foot. */
const PASS: DecorSpec[] = [
  rock(38, 1), rock(40, 4), rock(39, 9), rock(41, 13), rock(47, 1), rock(48, 11), rock(42, 0), rock(37, 15),
  scrub(40, 7), scrub(47, 6), scrub(38, 12), scrub(41, 16), scrub(48, 15),
  { gridX: 42, gridY: 18, texture: 'ch2-milestone', blocks: true },
];

/** The roadside shrine and the track up to it. */
const SHRINE: DecorSpec[] = [
  tree(49, 3, 'cypress'), tree(54, 4, 'cypress'),
  { gridX: 52, gridY: 8, texture: 'rug' },
];

/** The dry stream bed running down from the hills, and scrub south of the road. */
const COUNTRY: DecorSpec[] = [
  stream(58, 6), stream(56, 9), stream(54, 12), stream(52, 15), stream(50, 18),
  scrub(57, 3), scrub(55, 16), scrub(53, 21), rock(57, 13), rock(55, 1),
  scrub(18, 33), rock(24, 36), scrub(31, 32), scrub(38, 37), rock(14, 40), scrub(27, 42), rock(42, 33),
  stream(16, 38), stream(20, 40), stream(24, 41), stream(29, 39), stream(34, 41),
];

/** The poet's garden: cypresses along the channel, a rug in the shade. */
const GARDEN: DecorSpec[] = [
  tree(48, 31, 'cypress'), tree(56, 31, 'cypress'), tree(48, 42, 'cypress'), tree(56, 42, 'cypress'),
  tree(50, 36, 'orange-tree'), tree(55, 37, 'plane-tree'), tree(57, 35, 'cypress'),
  { gridX: 49, gridY: 34, texture: 'rug' },
  { gridX: 50, gridY: 33, texture: 'lamp', blocks: true },
];

export const roadMap: MapDefinition = {
  key: 'Road',
  title: 'Beyond the Qur\'án Gate',
  width: W,
  height: H,
  spawn: { x: 1, y: GATE.road },
  build: ({ paintRect, block }) => {
    paintRect(0, 0, W, H, 'sand');
    // Inside the walls: gardens, and the lane to the gate.
    paintRect(0, 0, 5, H, 'grass');
    paintRect(0, GATE.road - 2, 5, 5, 'stone');
    // The gate forecourt and the caravanserai yard.
    paintRect(7, 15, 8, 15, 'stone');
    paintRect(14, 18, 27, 11, 'stone');
    // The Iṣfahán road: east from the gate, then north into the pass.
    paintRect(4, GATE.road - 1, 41, 3, 'path');
    paintRect(43, 0, 3, GATE.road + 2, 'path');
    // The track to the shrine and the path down to the garden.
    paintRect(46, 7, 6, 2, 'path');
    paintRect(44, 24, 2, 8, 'path');
    paintRect(46, 30, 2, 2, 'path');
    // The poet's garden, with its water channel.
    paintRect(47, 30, 11, 14, 'grass');
    paintRect(52, 31, 1, 12, 'water');
    for (let y = 31; y < 43; y++) block(52, y);
    // The gate's piers either side of its passage.
    for (let x = GATE.x; x < GATE.x + GATE.w; x++) {
      for (const y of [GATE.y, GATE.y + 1, GATE.y + GATE.h - 2, GATE.y + GATE.h - 1]) block(x, y);
    }
  },
  buildings: [
    { gridX: GATE.x, gridY: GATE.y, w: GATE.w, h: GATE.h, texture: 'ch2-quran-gate', blocks: false },
    // The caravanserai, painted in two parts (west with the gate, east).
    { gridX: SERAI.x, gridY: SERAI.y, w: 12, h: 16, texture: 'ch2-caravanserai' },
    { gridX: SERAI.x + 12, gridY: SERAI.y, w: 8, h: 16, texture: 'ch2-caravanserai-east' },
    { gridX: 50, gridY: 4, w: 3, h: 3, texture: 'ch2-shrine' },
  ],
  decor: [...CITY_WALL, ...INSIDE_THE_WALLS, ...FORECOURT, ...YARD, ...PASS, ...SHRINE, ...COUNTRY, ...GARDEN],
  npcs: [
    // Mullá Ḥusayn in the caravanserai yard until the parting is ready.
    { gridX: 23, gridY: 20, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch2-husayn-waiting',
      gate: { when: f => !!f.ch2HeardCharge, lockedDialogue: 'ch2-husayn-charge' },
      present: f => !readyToPart(f) },
    // ...and at the milestone, where the road climbs north.
    { gridX: 42, gridY: 20, texture: 'ch1-mulla-husayn',
      prompt: 'Say farewell to Mullá Ḥusayn  [E]',
      dialogue: 'ch2-husayn-parting',
      present: readyToPart },
    // A seeker coming down from the pass, once the charge has been given.
    { gridX: 44, gridY: 9, texture: 'ch2-seeker',
      prompt: 'Speak with the Seeker on the Road  [E]',
      dialogue: 'road-encounter',
      present: f => !!f.ch2HeardCharge && !f.ch2SeekerAnswered },
    // Mullá ʿAlí by the gate; he leaves for ʿIráq once farewelled.
    { gridX: 10, gridY: 18, texture: 'ch2-mulla-ali',
      prompt: 'Speak with Mullá ʿAlíy-i-Basṭámí  [E]',
      dialogue: 'ch2-mulla-ali',
      present: f => !f.ch2AliFarewell },
    { gridX: 8, gridY: 25, texture: 'ch2-gate-warden',
      prompt: 'Speak with the Keeper of the Gate  [E]',
      dialogue: 'ch2-gate-warden' },
    { gridX: 24, gridY: 19, texture: 'ch2-serai-keeper',
      prompt: 'Speak with the Caravanserai Keeper  [E]',
      dialogue: 'ch2-serai-keeper' },
    { gridX: 34, gridY: 20, texture: 'ch2-muleteer',
      prompt: 'Speak with the Muleteer  [E]',
      dialogue: 'road-muleteer' },
    { gridX: 29, gridY: 26, texture: 'ch2-mubarak',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch2-mubarak' },
    { gridX: 51, gridY: 8, texture: 'ch2-dervish',
      prompt: 'Speak with the Wandering Dervish  [E]',
      dialogue: 'road-dervish' },
    { gridX: 50, gridY: 35, texture: 'ch2-fal-reader',
      prompt: 'Speak with the Fál-Reader  [E]',
      dialogue: 'ch2-fal-reader' },
  ],
  doors: [
    // The tiled portal of the caravanserai, into its court.
    { gridX: SERAI_DOOR.x, gridY: SERAI_DOOR.y, prompt: 'Enter the caravanserai  [E]',
      targetScene: 'Ch2Caravanserai', targetSpawnX: 10, targetSpawnY: 13 },
  ],
  exits: [
    { fromX: 0, fromY: GATE.road, dx: -1, dy: 0,
      targetScene: 'HouseQuarter', targetSpawnX: 33, targetSpawnY: 20,
      label: '← Back through the city to the Quiet Quarter' },
  ],
  // Asides as you pass: the gate's Qur'án, the poet's garden, the top of the pass.
  remarks: [
    { id: 'gate', gridX: GATE.x + 2, gridY: GATE.road, radius: 2, lines: [
      { speaker: 'Narrator', text: 'You pass under the arch of the gate. In a little room above it a great Qur\'án is kept, so that everyone who leaves Shíráz goes out beneath the Word of God.' },
    ] },
    { id: 'poet', gridX: 52, gridY: 36, radius: 4, lines: [
      { speaker: 'Narrator', text: 'Down among the cypresses the poet Ḥáfiẓ has lain under his stone these four hundred and fifty years. Half of Shíráz still opens his book to ask it what to do.' },
    ] },
    { id: 'pass', gridX: 44, gridY: 3, radius: 3, requires: f => !!f.ch2HeardCharge, lines: [
      { speaker: 'Narrator', text: 'From here the road climbs into the pass toward Iṣfahán. Behind you the city lies in its gardens, small enough to cover with your hand.' },
    ] },
  ],
  ambience: {
    wash: { color: 0xd89a78, alpha: 0.24 },
    lights: [
      { gridX: 27, gridY: 25, radius: 160, color: 0xffa050, intensity: 0.55 },
      { gridX: 6, gridY: GATE.road, radius: 110, color: 0xf0d890, intensity: 0.35 },
    ],
    particles: 'dust', music: 'road',
    vignette: 0.5,
  },
};
