import { readyToPart } from '../dialogues_ch/chapter02_road';
import type { DecorSpec, MapDefinition } from './types';

/**
 * Chapter 2, dawn in summer 1844. The Qur'án Gate of Shíráz and the country
 * just beyond it: a caravanserai where the Letters of the Living load their
 * mules, the Iṣfahán road climbing north into the pass, a roadside shrine,
 * a dry stream bed, and a garden corner near the poet's tomb.
 *
 * The west edge (0, 16) leads back through the city to the Quiet Quarter.
 */

/** Mud-brick city wall along x = 3, broken by the gate at y 15..17. */
const CITY_WALL_ROWS = [...Array.from({ length: 15 }, (_, y) => y), 18, 19, 20, 21, 22, 23];

const PASS_ROCKS: DecorSpec[] = [
  [11, 1], [12, 4], [10, 6], [18, 1], [19, 7], [12, 0], [17, 9], [9, 3], [20, 0], [11, 8],
].map(([gridX, gridY]) => ({ gridX: gridX!, gridY: gridY!, texture: 'ch2-rock', blocks: true }));

export const roadMap: MapDefinition = {
  key: 'Road',
  title: 'Beyond the Qur\'án Gate',
  width: 30,
  height: 24,
  spawn: { x: 1, y: 16 },
  build: ({ width, height, paintRect, paintPath, block }) => {
    paintRect(0, 0, width, height, 'sand');

    // Inside the walls: a city lane and gardens.
    paintRect(0, 0, 3, 13, 'grass');
    paintRect(0, 13, 3, 7, 'stone');
    paintRect(0, 20, 3, 4, 'grass');

    // Gate forecourt and caravanserai yard.
    paintRect(4, 13, 6, 7, 'stone');
    paintRect(14, 13, 8, 5, 'stone');

    // The Iṣfahán road: east from the gate, then north into the pass.
    paintPath([
      [0, 16], [1, 16], [2, 16], [3, 16], [4, 16], [5, 16], [6, 16], [7, 16],
      [8, 16], [9, 16], [10, 16], [11, 16], [12, 16], [13, 16],
      [13, 15], [13, 14], [13, 13], [13, 12], [13, 11], [13, 10], [13, 9],
      [14, 9], [14, 8], [14, 7], [15, 7], [15, 6], [15, 5], [15, 4],
      [16, 4], [16, 3], [16, 2], [16, 1], [16, 0],
    ]);
    // Track to the roadside shrine.
    paintPath([[17, 4], [18, 4], [19, 4], [20, 4], [21, 4]]);

    // The poet's garden corner, with a water channel.
    paintRect(22, 15, 8, 9, 'grass');
    paintRect(25, 16, 1, 7, 'water');
    for (let y = 16; y <= 22; y++) block(25, y);
    paintPath([[22, 16], [23, 17], [23, 18], [23, 19], [24, 19]]);

    // Gate pillars either side of the arch.
    block(3, 15);
    block(3, 17);
  },
  buildings: [
    { gridX: 3, gridY: 15, w: 1, h: 3, texture: 'ch2-quran-gate', blocks: false },
    ...CITY_WALL_ROWS.map(y => ({ gridX: 3, gridY: y, w: 1, h: 1, texture: 'ch2-city-wall' })),
    { gridX: 16, gridY: 11, w: 3, h: 2, texture: 'ch2-caravanserai' },
    { gridX: 22, gridY: 3, w: 1, h: 1, texture: 'ch2-shrine' },
    { gridX: 0, gridY: 9, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    // Inside the walls
    { gridX: 1, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 5, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 7, texture: 'cypress', blocks: true },
    { gridX: 0, gridY: 21, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 23, texture: 'cypress', blocks: true },
    { gridX: 2, gridY: 14, texture: 'lamp', blocks: true },
    { gridX: 1, gridY: 19, texture: 'crates', blocks: true },

    // Gate forecourt: Mullá ʿAlí's loads for ʿIráq
    { gridX: 6, gridY: 13, texture: 'ch2-camel', blocks: true },
    { gridX: 7, gridY: 14, texture: 'ch2-bundles', blocks: true },
    { gridX: 4, gridY: 14, texture: 'lamp', blocks: true },
    { gridX: 8, gridY: 19, texture: 'cypress', blocks: true },
    { gridX: 5, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 9, gridY: 13, texture: 'cypress', blocks: true },
    { gridX: 6, gridY: 18, texture: 'well', blocks: true },

    // Caravanserai yard
    { gridX: 19, gridY: 14, texture: 'ch2-camel', blocks: true },
    { gridX: 21, gridY: 17, texture: 'ch2-camel', blocks: true },
    { gridX: 17, gridY: 16, texture: 'ch2-campfire', blocks: true },
    { gridX: 16, gridY: 16, texture: 'rug' },
    { gridX: 21, gridY: 13, texture: 'well', blocks: true },
    { gridX: 17, gridY: 14, texture: 'ch2-bundles', blocks: true },
    { gridX: 14, gridY: 17, texture: 'ch2-bundles', blocks: true },
    { gridX: 19, gridY: 17, texture: 'crates', blocks: true },
    { gridX: 15, gridY: 12, texture: 'crates', blocks: true },
    { gridX: 14, gridY: 13, texture: 'lamp', blocks: true },

    // The pass and the milestone
    ...PASS_ROCKS,
    { gridX: 12, gridY: 9, texture: 'ch2-milestone', blocks: true },
    { gridX: 14, gridY: 3, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 17, gridY: 6, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 11, gridY: 11, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 9, gridY: 9, texture: 'ch2-rock', blocks: true },

    // Roadside shrine
    { gridX: 23, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 23, gridY: 5, texture: 'cypress', blocks: true },
    { gridX: 20, gridY: 3, texture: 'rug' },

    // Dry stream bed running down from the hills
    { gridX: 28, gridY: 7, texture: 'ch2-dry-stream' },
    { gridX: 26, gridY: 8, texture: 'ch2-dry-stream' },
    { gridX: 24, gridY: 9, texture: 'ch2-dry-stream' },
    { gridX: 22, gridY: 10, texture: 'ch2-dry-stream' },
    { gridX: 27, gridY: 5, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 25, gridY: 11, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 21, gridY: 8, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 28, gridY: 11, texture: 'ch2-rock', blocks: true },
    { gridX: 26, gridY: 2, texture: 'ch2-rock', blocks: true },

    // South of the road: scrub
    { gridX: 11, gridY: 19, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 14, gridY: 21, texture: 'ch2-rock', blocks: true },
    { gridX: 18, gridY: 20, texture: 'ch2-tamarisk', blocks: true },
    { gridX: 9, gridY: 22, texture: 'ch2-dry-stream' },
    { gridX: 12, gridY: 22, texture: 'ch2-dry-stream' },

    // The poet's garden
    { gridX: 23, gridY: 15, texture: 'cypress', blocks: true },
    { gridX: 28, gridY: 15, texture: 'cypress', blocks: true },
    { gridX: 23, gridY: 22, texture: 'cypress', blocks: true },
    { gridX: 28, gridY: 22, texture: 'cypress', blocks: true },
    { gridX: 29, gridY: 18, texture: 'cypress', blocks: true },
    { gridX: 27, gridY: 19, texture: 'tree', blocks: true },
    { gridX: 22, gridY: 20, texture: 'tree', blocks: true },
    { gridX: 24, gridY: 20, texture: 'rug' },
    { gridX: 24, gridY: 17, texture: 'lamp', blocks: true },
  ],
  npcs: [
    // Mullá Ḥusayn in the caravanserai yard until the parting is ready.
    { gridX: 15, gridY: 15, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch2-husayn-waiting',
      gate: { when: f => !!f.ch2HeardCharge, lockedDialogue: 'ch2-husayn-charge' },
      present: f => !readyToPart(f) },
    // ...and at the milestone, where the road climbs north.
    { gridX: 14, gridY: 10, texture: 'ch1-mulla-husayn',
      prompt: 'Say farewell to Mullá Ḥusayn  [E]',
      dialogue: 'ch2-husayn-parting',
      present: readyToPart },
    // A seeker coming down from the pass, once the charge has been given.
    { gridX: 16, gridY: 6, texture: 'ch2-seeker',
      prompt: 'Speak with the Seeker on the Road  [E]',
      dialogue: 'road-encounter',
      present: f => !!f.ch2HeardCharge && !f.ch2SeekerAnswered },
    // Mullá ʿAlí by the gate; he leaves for ʿIráq once farewelled.
    { gridX: 6, gridY: 14, texture: 'ch2-mulla-ali',
      prompt: 'Speak with Mullá ʿAlíy-i-Basṭámí  [E]',
      dialogue: 'ch2-mulla-ali',
      present: f => !f.ch2AliFarewell },
    { gridX: 4, gridY: 18, texture: 'ch2-gate-warden',
      prompt: 'Speak with the Keeper of the Gate  [E]',
      dialogue: 'ch2-gate-warden' },
    { gridX: 15, gridY: 13, texture: 'ch2-serai-keeper',
      prompt: 'Speak with the Caravanserai Keeper  [E]',
      dialogue: 'ch2-serai-keeper' },
    { gridX: 20, gridY: 14, texture: 'ch2-muleteer',
      prompt: 'Speak with the Muleteer  [E]',
      dialogue: 'road-muleteer' },
    { gridX: 20, gridY: 17, texture: 'ch2-mubarak',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch2-mubarak' },
    { gridX: 21, gridY: 5, texture: 'ch2-dervish',
      prompt: 'Speak with the Wandering Dervish  [E]',
      dialogue: 'road-dervish' },
    { gridX: 24, gridY: 19, texture: 'ch2-fal-reader',
      prompt: 'Speak with the Fál-Reader  [E]',
      dialogue: 'ch2-fal-reader' },
  ],
  exits: [
    { fromX: 0, fromY: 16, dx: -1, dy: 0,
      targetScene: 'HouseQuarter', targetSpawnX: 18, targetSpawnY: 9,
      label: '← Back through the city to the Quiet Quarter' },
  ],
  ambience: {
    wash: { color: 0xd89a78, alpha: 0.24 },
    lights: [
      { gridX: 17, gridY: 16, radius: 110, color: 0xffa050, intensity: 0.6 },
      { gridX: 3, gridY: 16, radius: 70, color: 0xf0d890, intensity: 0.35 },
    ],
    particles: 'dust', music: 'road',
    vignette: 0.5,
  },
};
