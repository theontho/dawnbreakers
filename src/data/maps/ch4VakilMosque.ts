import type { MapDefinition } from './types';

/**
 * The Vakíl Mosque of Shíráz on a Friday in 1845. Entered from the street
 * on the west between lamps and cypresses; a great courtyard with its
 * pool and orange trees; arcades north and south; and in the prayer hall
 * the marble pulpit of fourteen steps, where the Báb is brought to speak.
 * He is never on the map: the pulpit is the threshold the player faces.
 */
export const ch4VakilMosqueMap: MapDefinition = {
  key: 'Ch4VakilMosque',
  title: 'The Vakíl Mosque',
  width: 26,
  height: 24,
  spawn: { x: 0, y: 11 },
  build: ({ paintRect, setTile, block }) => {
    paintRect(0, 0, 26, 24, 'sand');

    // Approach from the street, through the portal
    paintRect(0, 11, 5, 2, 'path');

    // The precinct: prayer hall to the north, courtyard below
    paintRect(5, 2, 20, 19, 'stone');

    // An aisle of paving up the hall to the pulpit
    paintRect(14, 3, 3, 5, 'path');

    // The great pool in the courtyard
    for (let y = 12; y <= 15; y++) {
      for (let x = 12; x <= 18; x++) {
        setTile(x, y, 'water');
        block(x, y);
      }
    }

    // Edge of the world: the street wall beyond the precinct
    for (let y = 0; y < 24; y++) {
      if (y < 9 || y > 14) block(0, y);
    }
  },
  buildings: [
    // North arcade of the prayer hall
    { gridX: 5, gridY: 0, w: 4, h: 2, texture: 'ch4-prayer-arch' },
    { gridX: 9, gridY: 0, w: 4, h: 2, texture: 'ch4-prayer-arch' },
    { gridX: 13, gridY: 0, w: 4, h: 2, texture: 'ch4-prayer-arch' },
    { gridX: 17, gridY: 0, w: 4, h: 2, texture: 'ch4-prayer-arch' },
    { gridX: 21, gridY: 0, w: 4, h: 2, texture: 'ch4-prayer-arch' },
    // South arcade across the courtyard
    { gridX: 6, gridY: 21, w: 4, h: 2, texture: 'ch4-prayer-arch' },
    { gridX: 11, gridY: 21, w: 4, h: 2, texture: 'ch4-prayer-arch' },
    { gridX: 16, gridY: 21, w: 4, h: 2, texture: 'ch4-prayer-arch' },
  ],
  decor: [
    // Hall pillars, lit
    { gridX: 7, gridY: 3, texture: 'lamp', blocks: true },
    { gridX: 11, gridY: 3, texture: 'lamp', blocks: true },
    { gridX: 19, gridY: 3, texture: 'lamp', blocks: true },
    { gridX: 23, gridY: 3, texture: 'lamp', blocks: true },
    { gridX: 7, gridY: 7, texture: 'lamp', blocks: true },
    { gridX: 23, gridY: 7, texture: 'lamp', blocks: true },
    // Prayer rugs before the pulpit, and the congregation in rows
    { gridX: 14, gridY: 4, texture: 'rug' },
    { gridX: 16, gridY: 4, texture: 'rug' },
    { gridX: 15, gridY: 6, texture: 'rug' },
    { gridX: 9, gridY: 4, texture: 'rug' },
    { gridX: 21, gridY: 4, texture: 'rug' },
    { gridX: 8, gridY: 5, texture: 'crowd', blocks: true },
    { gridX: 10, gridY: 5, texture: 'crowd', blocks: true },
    { gridX: 12, gridY: 6, texture: 'crowd', blocks: true },
    { gridX: 18, gridY: 6, texture: 'crowd', blocks: true },
    { gridX: 20, gridY: 5, texture: 'crowd', blocks: true },
    { gridX: 22, gridY: 5, texture: 'crowd', blocks: true },
    { gridX: 11, gridY: 7, texture: 'crowd-shadow' },
    { gridX: 19, gridY: 7, texture: 'crowd-shadow' },
    // Courtyard: orange trees at the corners, an ablution well
    { gridX: 7, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 23, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 7, gridY: 18, texture: 'tree', blocks: true },
    { gridX: 23, gridY: 18, texture: 'tree', blocks: true },
    { gridX: 10, gridY: 17, texture: 'well', blocks: true },
    { gridX: 20, gridY: 17, texture: 'well', blocks: true },
    // People spilling through the courtyard
    { gridX: 21, gridY: 13, texture: 'crowd', blocks: true },
    { gridX: 9, gridY: 14, texture: 'crowd', blocks: true },
    { gridX: 15, gridY: 18, texture: 'crowd', blocks: true },
    { gridX: 13, gridY: 10, texture: 'crowd-shadow' },
    { gridX: 17, gridY: 17, texture: 'crowd-shadow' },
    { gridX: 13, gridY: 17, texture: 'ch1-birds' },
    // Cypresses outside the precinct walls
    { gridX: 2, gridY: 3, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 7, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 2, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 25, gridY: 4, texture: 'cypress', blocks: true },
    { gridX: 25, gridY: 10, texture: 'cypress', blocks: true },
    { gridX: 25, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 25, gridY: 21, texture: 'cypress', blocks: true },
    // Lamps flanking the portal from the street
    { gridX: 4, gridY: 10, texture: 'lamp', blocks: true },
    { gridX: 4, gridY: 13, texture: 'lamp', blocks: true },
    { gridX: 3, gridY: 10, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 13, texture: 'cypress', blocks: true },
  ],
  npcs: [
    // The pulpit: the threshold of the Friday address
    { gridX: 15, gridY: 2, texture: 'ch4-pulpit',
      prompt: 'Stand before the marble pulpit  [E]',
      dialogue: 'ch4-vakil-pulpit',
      gate: {
        when: f => !!f.khalMet && !!f.quddusWitnessed && !!f.sadiqWitnessed,
        lockedDialogue: 'ch4-pulpit-waiting',
      } },
    { gridX: 13, gridY: 3, texture: 'ch4-imam-jumih',
      prompt: 'Speak with Shaykh Abú-Turáb, the Imám-Jumʿih  [E]',
      dialogue: 'ch4-imam-jumih' },
    { gridX: 17, gridY: 3, texture: 'ch4-officer',
      prompt: 'Hear the officer by the pulpit  [E]',
      dialogue: 'ch4-officer-mosque' },
    { gridX: 20, gridY: 9, texture: 'ch4-witness',
      prompt: 'Speak with the Mosque Witness  [E]',
      dialogue: 'ch4-mosque-witness' },
    { gridX: 9, gridY: 9, texture: 'npc-mulla',
      prompt: 'Speak with the Stern Mullá  [E]',
      dialogue: 'ch4-stern-mulla' },
    { gridX: 11, gridY: 18, texture: 'ch4-water-boy',
      prompt: 'Speak with the Water-Boy  [E]',
      dialogue: 'ch4-water-boy' },
  ],
  exits: [
    { fromX: 0, fromY: 11, dx: -1, dy: 0,
      targetScene: 'Ch4ShirazReturn', targetSpawnX: 29, targetSpawnY: 11,
      label: '← West along the street' },
  ],
  ambience: {
    particles: 'motes', music: 'court',
    lights: [
      { gridX: 15, gridY: 2, radius: 120, color: 0xfff0c0, intensity: 0.4 },
    ],
    vignette: 0.45,
  },
};
