import type { MapDefinition } from './types';

/**
 * Shíráz in 1845, a city that has just heard something new in its call to
 * prayer. West gate and the Búshihr road; the neighbourhood mosque where
 * Mullá Ṣádiq sounded the call, with a dyer's vats facing its minaret; the
 * bazaar lane; the square where Quddús and his companions are shown to the
 * city; the governor's seat and his posted decree; and, to the south, the
 * lane of the uncle's house where the Báb is later confined.
 * The main street runs east to the Vakíl Mosque.
 */
export const ch4ShirazReturnMap: MapDefinition = {
  key: 'Ch4ShirazReturn',
  title: 'Shíráz, the Streets in 1845',
  width: 30,
  height: 24,
  spawn: { x: 1, y: 11 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, 30, 24, 'sand');

    // Main street, west gate to the Vakíl Mosque road
    paintRect(0, 11, 30, 2, 'path');

    // Neighbourhood mosque court, and the lane down to the street
    paintRect(2, 2, 9, 7, 'stone');
    paintPath([[6, 5], [6, 6], [6, 7], [6, 8], [6, 9], [6, 10]]);

    // Bazaar lane running north from the square
    paintRect(17, 0, 1, 8, 'path');

    // The square where the prisoners are shown to the city
    paintRect(14, 8, 7, 3, 'stone');
    paintRect(14, 13, 7, 2, 'stone');

    // Governor's forecourt and the way up from the street
    paintRect(22, 4, 7, 6, 'stone');
    paintPath([[25, 10]]);

    // South lane to the uncle's house, and the cross lane before it
    paintRect(17, 15, 1, 8, 'path');
    paintRect(12, 21, 14, 1, 'path');
    paintRect(16, 19, 6, 2, 'stone');

    // A walled garden in the south-west with a still pool
    paintRect(0, 15, 10, 9, 'grass');
    paintPath([[5, 13], [5, 14], [5, 15], [5, 16], [6, 16], [7, 16], [7, 17], [7, 18], [7, 19], [6, 19], [5, 19], [4, 19], [3, 19], [3, 18], [3, 17], [3, 16], [4, 16]]);
    for (const [x, y] of [[4, 17], [5, 17], [4, 18], [5, 18], [6, 17], [6, 18]] as const) {
      setTile(x, y, 'water');
      block(x, y);
    }

    // A quieter garden corner in the south-east
    paintRect(26, 15, 4, 9, 'grass');
  },
  buildings: [
    // West city gate flanking the street
    { gridX: 1, gridY: 9, w: 1, h: 1, texture: 'gate' },
    { gridX: 1, gridY: 14, w: 1, h: 1, texture: 'gate' },
    // The neighbourhood mosque where the new call was sounded
    { gridX: 5, gridY: 3, w: 2, h: 2, texture: 'mosque' },
    // Bazaar stalls
    { gridX: 15, gridY: 1, w: 1, h: 1, texture: 'stall' },
    { gridX: 19, gridY: 1, w: 1, h: 1, texture: 'stall' },
    { gridX: 15, gridY: 4, w: 1, h: 1, texture: 'ch5-market-awning' },
    { gridX: 19, gridY: 4, w: 1, h: 1, texture: 'stall' },
    // The dyer's shop facing the minaret
    { gridX: 12, gridY: 5, w: 1, h: 1, texture: 'stall' },
    // The governor's seat
    { gridX: 24, gridY: 1, w: 3, h: 2, texture: 'ch9-barrack-front' },
    // Houses of the north side of the street
    { gridX: 2, gridY: 9, w: 2, h: 2, texture: 'house' },
    { gridX: 11, gridY: 1, w: 2, h: 2, texture: 'house' },
    // Houses of the south quarter, the uncle's at the end of the lane
    { gridX: 18, gridY: 17, w: 2, h: 2, texture: 'house' },
    { gridX: 12, gridY: 16, w: 2, h: 2, texture: 'house' },
    { gridX: 22, gridY: 15, w: 2, h: 2, texture: 'house' },
    { gridX: 23, gridY: 19, w: 2, h: 2, texture: 'house' },
    { gridX: 10, gridY: 19, w: 2, h: 2, texture: 'house' },
    { gridX: 13, gridY: 22, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    // Mosque court: lamps, an ablution well, cypresses at the corners
    { gridX: 4, gridY: 6, texture: 'lamp', blocks: true },
    { gridX: 8, gridY: 6, texture: 'lamp', blocks: true },
    { gridX: 9, gridY: 3, texture: 'well', blocks: true },
    { gridX: 2, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 2, gridY: 7, texture: 'cypress', blocks: true },
    { gridX: 10, gridY: 7, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 4, texture: 'ch1-planter', blocks: true },
    { gridX: 7, gridY: 7, texture: 'rug' },
    // The dyer's vats and drying cloth
    { gridX: 12, gridY: 7, texture: 'ch4-dye-vats', blocks: true },
    { gridX: 13, gridY: 6, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 11, gridY: 9, texture: 'crates', blocks: true },
    // Bazaar goods
    { gridX: 16, gridY: 2, texture: 'rug' },
    { gridX: 18, gridY: 3, texture: 'crates', blocks: true },
    { gridX: 15, gridY: 6, texture: 'crates', blocks: true },
    { gridX: 18, gridY: 6, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 16, gridY: 0, texture: 'lamp', blocks: true },
    // The crowd in the square, kept back from the prisoners
    { gridX: 14, gridY: 8, texture: 'crowd', blocks: true },
    { gridX: 20, gridY: 8, texture: 'crowd', blocks: true },
    { gridX: 14, gridY: 14, texture: 'crowd', blocks: true },
    { gridX: 20, gridY: 14, texture: 'crowd', blocks: true },
    { gridX: 16, gridY: 14, texture: 'crowd-shadow' },
    { gridX: 18, gridY: 13, texture: 'crowd-shadow' },
    // The governor's gate: sentries, lamps, cypresses, the decree
    { gridX: 23, gridY: 4, texture: 'ch4-officer', blocks: true },
    { gridX: 27, gridY: 4, texture: 'ch4-officer', blocks: true },
    { gridX: 22, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 28, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 22, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 28, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 22, gridY: 9, texture: 'cypress', blocks: true },
    { gridX: 28, gridY: 9, texture: 'cypress', blocks: true },
    // Shut doors: a city keeping indoors
    { gridX: 13, gridY: 3, texture: 'closed-door', blocks: true },
    { gridX: 11, gridY: 21, texture: 'closed-door', blocks: true },
    // Milestone for the Búshihr road at the west gate
    { gridX: 0, gridY: 13, texture: 'ch2-milestone', blocks: true },
    // The south-west garden
    { gridX: 2, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 8, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 2, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 8, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 1, gridY: 22, texture: 'tree', blocks: true },
    { gridX: 6, gridY: 22, texture: 'tree', blocks: true },
    { gridX: 9, gridY: 23, texture: 'tree', blocks: true },
    { gridX: 4, gridY: 20, texture: 'ch7-rosebush', blocks: true },
    { gridX: 6, gridY: 20, texture: 'ch7-rosebush', blocks: true },
    { gridX: 4, gridY: 15, texture: 'ch1-planter', blocks: true },
    { gridX: 7, gridY: 15, texture: 'rug' },
    // The uncle's lane: a lamp for the watcher, a planter by the door
    { gridX: 15, gridY: 18, texture: 'lamp', blocks: true },
    { gridX: 21, gridY: 18, texture: 'ch1-planter', blocks: true },
    { gridX: 16, gridY: 20, texture: 'rug' },
    // South-east garden corner
    { gridX: 27, gridY: 17, texture: 'well', blocks: true },
    { gridX: 26, gridY: 15, texture: 'tree', blocks: true },
    { gridX: 29, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 29, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 27, gridY: 22, texture: 'tree', blocks: true },
    { gridX: 26, gridY: 19, texture: 'lamp', blocks: true },
    // Street edge trees
    { gridX: 0, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 5, texture: 'tree', blocks: true },
    { gridX: 20, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 29, gridY: 13, texture: 'tree', blocks: true },
  ],
  npcs: [
    // The square: Quddús and Mullá Ṣádiq until they are put out of the city
    { gridX: 15, gridY: 9, texture: 'ch4-quddus',
      prompt: 'Stand with Quddús  [E]',
      dialogue: 'ch4-quddus-witness',
      present: f => !f.vakilAddressHeard },
    { gridX: 17, gridY: 9, texture: 'ch4-officer',
      prompt: 'Hear the officer of Ḥusayn Khán  [E]',
      dialogue: 'ch4-officer-warning' },
    { gridX: 19, gridY: 9, texture: 'ch4-mulla-sadiq',
      prompt: 'Sit with Mullá Ṣádiq  [E]',
      dialogue: 'ch4-mulla-sadiq',
      present: f => !f.vakilAddressHeard },
    // The dyer, by his vats facing the minaret
    { gridX: 12, gridY: 9, texture: 'ch4-townsman',
      prompt: 'Speak with the Dyer  [E]',
      dialogue: 'ch4-dyer' },
    // The baker at the mouth of the bazaar
    { gridX: 16, gridY: 6, texture: 'ch4-baker',
      prompt: 'Speak with the Baker  [E]',
      dialogue: 'ch4-baker' },
    // The uncle at the governor's gate, having just stood surety
    { gridX: 25, gridY: 7, texture: 'ch4-khal',
      prompt: 'Speak with Ḥájí Mírzá Siyyid ʿAlí  [E]',
      dialogue: 'ch4-khal',
      present: f => !f.vakilAddressHeard },
    { gridX: 27, gridY: 6, texture: 'ch4-decree-board',
      prompt: 'Read the governor\'s decree  [E]',
      dialogue: 'ch4-decree' },
    // The uncle's lane
    { gridX: 20, gridY: 19, texture: 'ch1-npc-servant',
      prompt: 'Speak with Mubárak  [E]',
      dialogue: 'ch4-mubarak' },
    { gridX: 21, gridY: 20, texture: 'ch4-khal',
      prompt: 'Speak with Ḥájí Mírzá Siyyid ʿAlí  [E]',
      dialogue: 'ch4-khal-home',
      present: f => !!f.vakilAddressHeard },
    { gridX: 15, gridY: 19, texture: 'ch4-vahid',
      prompt: 'Speak with Vaḥíd  [E]',
      dialogue: 'ch4-vahid',
      present: f => !!f.vakilAddressHeard },
    // The uncle's door: the Báb is confined within and never seen
    { gridX: 19, gridY: 19, texture: 'closed-door',
      prompt: 'Keep watch at the uncle\'s door  [E]',
      dialogue: 'ch4-uncle-door',
      gate: {
        when: f => !!f.vakilAddressHeard && !!f.vahidTestimony,
        lockedDialogue: 'ch4-uncle-door-locked',
      } },
  ],
  exits: [
    { fromX: 29, fromY: 11, dx: 1, dy: 0,
      targetScene: 'Ch4VakilMosque', targetSpawnX: 0, targetSpawnY: 11,
      label: '→ East to the Vakíl Mosque' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.22 },
    particles: 'dust', music: 'city',
    vignette: 0.5,
  },
};
