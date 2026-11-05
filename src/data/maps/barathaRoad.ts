import type { FlagState } from '../../dialogue/types';
import { NORTH_ROAD } from './karbilaQuarter';
import type { DecorSpec, MapAmbience, MapDefinition } from './types';

/**
 * The Masjid of Baráthá, on the road north from Karbilá to Kázimayn, at
 * noon in the late autumn of 1843 (Nabíl, chapter II). An old masjid among
 * palms beside the road; in its shade Siyyid Káẓim rests with his
 * companions and their mules; on the pasture south-west of it an Arab
 * shepherd keeps his flock, and has been waiting there three days.
 *
 * Layout (x runs east, y runs south): the masjid x 7..14, y 2..8, its
 * portal on the forecourt at (11, 8); the forecourt y 9..12; the road
 * y 13..14 across the map, coming in from Karbilá at the south-east edge
 * (25, 14) and going on north-west toward Kázimayn; the pasture x 0..12,
 * y 15..21.
 */

const W = 26;
const H = 22;
/** Where the road from Karbilá comes in. */
export const KARBILA_ROAD = { x: 25, y: 14 } as const;

const resting = (f: FlagState) => !f.frForetold;

const block = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, blocks: true, ...(present ? { present } : {}) }));
const loose = (texture: string, cells: ReadonlyArray<readonly [number, number]>, present?: (f: FlagState) => boolean): DecorSpec[] =>
  cells.map(([gridX, gridY]) => ({ gridX, gridY, texture, ...(present ? { present } : {}) }));

const props: DecorSpec[] = [
  // Palms round the masjid and along the road.
  ...block('date-palm-tall', [[3, 2], [18, 2], [23, 8], [1, 10]]),
  ...block('date-palm', [[16, 5], [5, 6], [21, 4], [24, 19]]),
  ...block('date-palm-young', [[17, 8], [3, 9], [15, 20], [22, 16]]),
  ...block('well', [[16, 10]]),
  ...block('ch9-water-jar', [[15, 11]]),
  // The Siyyid's party: companions at rest in the shade, the mules by the well.
  ...block('ch8-kneeling-companions', [[12, 10]], resting),
  ...loose('rug', [[9, 10]], resting),
  ...block('kulayn-horse', [[18, 11], [19, 9]], resting),
  ...block('ch2-bundles', [[17, 12]], resting),
  // The open country toward the river: tamarisk, a milestone, a camel train's halt.
  ...block('ch2-tamarisk', [[20, 20], [24, 11], [17, 17], [11, 21]]),
  ...block('ch2-milestone', [[22, 12]]),
  ...block('ch2-rock', [[14, 18], [21, 15]]),
  ...block('ch2-camel', [[19, 21]]),
  // The flock on the pasture.
  ...block('flock-sheep', [[3, 16], [5, 18], [8, 17], [2, 19], [9, 20], [6, 21]]),
];

export const barathaRoadMap: MapDefinition = {
  key: 'BarathaRoad',
  title: 'The Masjid of Baráthá',
  width: W,
  height: H,
  spawn: { x: KARBILA_ROAD.x - 1, y: KARBILA_ROAD.y },
  build: ({ paintRect }) => {
    paintRect(0, 0, W, H, 'sand');
    paintRect(0, 15, 13, 7, 'grass');
    paintRect(0, 0, 6, 9, 'grass');
    paintRect(7, 9, 9, 4, 'stone');
    paintRect(0, 13, W, 2, 'path');
  },
  buildings: [
    { gridX: 7, gridY: 2, w: 8, h: 7, texture: 'mosque-local' },
  ],
  decor: props,
  npcs: [
    { gridX: 9, gridY: 11, texture: 'forerunners-kazim',
      prompt: 'Speak with Siyyid Káẓim  [E]',
      dialogue: 'fr-kazim-baratha',
      present: resting },
    { gridX: 13, gridY: 12, texture: 'forerunners-seeker',
      prompt: 'Speak with the Student from Khurásán  [E]',
      dialogue: 'fr-seeker-baratha',
      present: resting },
    { gridX: 7, gridY: 15, texture: 'forerunners-shepherd',
      prompt: 'Speak with the Shepherd  [E]',
      dialogue: 'fr-shepherd',
      present: resting },
  ],
  exits: [
    { fromX: KARBILA_ROAD.x, fromY: KARBILA_ROAD.y, dx: 1, dy: 0,
      targetScene: 'KarbilaQuarter', targetSpawnX: NORTH_ROAD.x + 1, targetSpawnY: NORTH_ROAD.y,
      label: '↓ The road south to Karbilá' },
  ],
  ambience: f => (resting(f) ? NOON : DUSK),
  // The ride home: the student from Khurásán walks the road beside you and talks.
  companion: { texture: 'forerunners-seeker', present: f => !resting(f) },
  remarks: [
    { id: 'smiled', gridX: 12, gridY: 13, radius: 3, requires: f => !resting(f), lines: [
      { speaker: 'A Student from Khurásán', text: 'He smiled. You saw him. I have never been so frightened in my life, and he smiled as if the shepherd had brought him a letter from home.' },
    ] },
    { id: 'ten', gridX: 18, gridY: 14, radius: 2, requires: f => !resting(f), lines: [
      { speaker: 'A Student from Khurásán', text: 'Ten of us heard the shepherd today, at least. If anyone ever asks what happened at Baráthá, there will be ten to say it.' },
      { speaker: 'Narrator', text: 'Years later, Nabíl will hear it from no fewer than ten who were there, and write it down.' },
    ] },
    { id: 'seek', gridX: 23, gridY: 14, radius: 2, requires: f => !resting(f), lines: [
      { speaker: 'A Student from Khurásán', text: 'Scatter and seek, he says. As if we would know Him if we met Him on this road. (He looks back at the palms.) Would you?' },
    ] },
  ],
};

/** Noon, the sun white on the pasture; and the evening of the ride home. */
const NOON: MapAmbience = {
  wash: { color: 0xf0e0b8, alpha: 0.14 },
  particles: 'dust', music: 'road', sound: ['breeze', 'birds'], vignette: 0.45,
};
const DUSK: MapAmbience = {
  wash: { color: 0xd08850, alpha: 0.34 },
  particles: 'motes', music: 'dusk', sound: ['breeze'], vignette: 0.62,
};
