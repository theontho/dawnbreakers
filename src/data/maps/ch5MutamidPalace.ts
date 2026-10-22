import type { MapDefinition } from './types';

/**
 * The Palace of the Sun (ʿImárat-i-Khurshíd), Iṣfahán, winter 1846 to
 * spring 1847. A four-fold garden quartered by paths and water channels
 * around a central pool. North: the portico where the Muʿtamid receives.
 * West: the court of the writing desk. East: the pavilion of the gathering
 * of divines, with its empty seat of honour. South-east: the inner
 * apartments where the Báb was hidden. He is never on the map.
 */
export const ch5MutamidPalaceMap: MapDefinition = {
  key: 'Ch5MutamidPalace',
  title: 'Iṣfahán, the Palace of the Sun',
  width: 28,
  height: 26,
  spawn: { x: 0, y: 13 },
  build: ({ paintRect, setTile, block }) => {
    paintRect(0, 0, 28, 26, 'grass');

    const water = (x: number, y: number): void => {
      setTile(x, y, 'water');
      block(x, y);
    };

    // The two great axes of the garden
    paintRect(0, 13, 28, 1, 'path');
    paintRect(14, 4, 1, 21, 'path');

    // Central pool with a paved ring around it
    paintRect(12, 11, 5, 5, 'stone');
    for (let y = 12; y <= 14; y++) for (let x = 13; x <= 15; x++) water(x, y);

    // Water channels running beside each axis, with crossings left open
    for (let x = 3; x <= 10; x++) {
      if (x === 7) continue;
      water(x, 12);
      water(x, 14);
    }
    for (let x = 18; x <= 25; x++) {
      if (x === 21) continue;
      water(x, 12);
      water(x, 14);
    }
    for (let y = 5; y <= 10; y++) {
      if (y === 8) continue;
      water(13, y);
      water(15, y);
    }
    for (let y = 16; y <= 23; y++) {
      if (y === 19) continue;
      water(13, y);
      water(15, y);
    }

    // Portico terrace
    paintRect(10, 4, 9, 1, 'stone');

    // West court of the writing desk
    paintRect(3, 4, 7, 6, 'stone');
    paintRect(7, 10, 1, 2, 'path');

    // East pavilion of the gathering
    paintRect(19, 4, 7, 6, 'stone');
    paintRect(21, 10, 1, 2, 'path');

    // Inner apartments yard, south-east
    paintRect(18, 17, 8, 6, 'stone');
    paintRect(21, 15, 1, 2, 'path');

    // Rose garden paths, south-west
    paintRect(4, 19, 7, 1, 'path');
    paintRect(7, 15, 1, 7, 'path');
  },
  buildings: [
    { gridX: 12, gridY: 1, w: 5, h: 3, texture: 'ch5-palace-portico' },
    { gridX: 22, gridY: 3, w: 3, h: 2, texture: 'ch7-garden-canopy' },
    { gridX: 21, gridY: 18, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    // Portico terrace
    { gridX: 10, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 18, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 11, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 17, gridY: 1, texture: 'cypress', blocks: true },
    // West court: a lamp at each corner, carpets
    { gridX: 3, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 9, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 5, gridY: 7, texture: 'rug' },
    { gridX: 4, gridY: 8, texture: 'crates', blocks: true },
    { gridX: 9, gridY: 9, texture: 'ch1-planter', blocks: true },
    // East pavilion: a ring of carpets before the empty seat
    { gridX: 19, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 25, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 20, gridY: 7, texture: 'rug' },
    { gridX: 22, gridY: 7, texture: 'rug' },
    { gridX: 24, gridY: 7, texture: 'rug' },
    { gridX: 23, gridY: 8, texture: 'rug' },
    { gridX: 25, gridY: 9, texture: 'ch1-planter', blocks: true },
    // Inner apartments: the Muʿtamid's own men, lamps
    { gridX: 19, gridY: 18, texture: 'lamp', blocks: true },
    { gridX: 24, gridY: 18, texture: 'lamp', blocks: true },
    { gridX: 24, gridY: 20, texture: 'ch4-officer', blocks: true },
    { gridX: 25, gridY: 22, texture: 'cypress', blocks: true },
    { gridX: 18, gridY: 22, texture: 'cypress', blocks: true },
    // Rose garden
    { gridX: 4, gridY: 17, texture: 'ch7-rosebush', blocks: true },
    { gridX: 9, gridY: 17, texture: 'ch7-rosebush', blocks: true },
    { gridX: 4, gridY: 21, texture: 'ch7-rosebush', blocks: true },
    { gridX: 9, gridY: 21, texture: 'ch7-rosebush', blocks: true },
    { gridX: 5, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 10, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 6, gridY: 23, texture: 'tree', blocks: true },
    { gridX: 2, gridY: 19, texture: 'tree', blocks: true },
    { gridX: 8, gridY: 20, texture: 'rug' },
    // Cypress rows along the garden walls
    { gridX: 1, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 1, gridY: 7, texture: 'cypress', blocks: true },
    { gridX: 1, gridY: 11, texture: 'cypress', blocks: true },
    { gridX: 1, gridY: 15, texture: 'cypress', blocks: true },
    { gridX: 1, gridY: 23, texture: 'cypress', blocks: true },
    { gridX: 26, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 26, gridY: 11, texture: 'cypress', blocks: true },
    { gridX: 26, gridY: 15, texture: 'cypress', blocks: true },
    { gridX: 11, gridY: 24, texture: 'cypress', blocks: true },
    { gridX: 17, gridY: 24, texture: 'cypress', blocks: true },
    { gridX: 11, gridY: 8, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 9, texture: 'tree', blocks: true },
    { gridX: 11, gridY: 18, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 16, texture: 'tree', blocks: true },
  ],
  npcs: [
    // The Muʿtamid, until his death
    { gridX: 16, gridY: 6, texture: 'ch5-mutamid',
      prompt: 'Speak with Manúchihr Khán  [E]',
      dialogue: 'ch5-mutamid',
      present: f => !f.mutamidDied },
    { gridX: 16, gridY: 6, texture: 'rug',
      prompt: 'Look at the Muʿtamid\'s empty place  [E]',
      dialogue: 'ch5-mutamid-empty',
      present: f => !!f.mutamidDied },
    // West court
    { gridX: 5, gridY: 6, texture: 'writing-desk',
      prompt: 'Read beside the writing desk  [E]',
      dialogue: 'ch5-treatise' },
    { gridX: 7, gridY: 6, texture: 'ch5-scribe',
      prompt: 'Speak with the Palace Scribe  [E]',
      dialogue: 'ch5-scribe' },
    // East pavilion
    { gridX: 22, gridY: 5, texture: 'ch5-seat-of-honour',
      prompt: 'Look at the empty seat of honour  [E]',
      dialogue: 'ch5-seat' },
    { gridX: 20, gridY: 8, texture: 'ch5-philosopher',
      prompt: 'Speak with Mírzá Ḥasan-i-Núrí  [E]',
      dialogue: 'ch5-philosopher' },
    // Inner apartments
    { gridX: 20, gridY: 20, texture: 'ch5-gurgin',
      prompt: 'Speak with Gurgín Khán  [E]',
      dialogue: 'ch5-gurgin',
      present: f => !!f.mutamidDied },
    { gridX: 22, gridY: 20, texture: 'closed-door',
      prompt: 'Stand at the door of the inner apartments  [E]',
      dialogue: 'ch5-chamber',
      gate: {
        when: f => !!f.mutamidDied && !!f.gurginMet,
        lockedDialogue: 'ch5-chamber-locked',
      } },
  ],
  exits: [
    { fromX: 0, fromY: 13, dx: -1, dy: 0,
      targetScene: 'Ch5IsfahanBridge', targetSpawnX: 29, targetSpawnY: 9,
      label: '← West along the river road' },
  ],
  ambience: {
    wash: { color: 0x46507a, alpha: 0.34 },
    particles: 'motes', music: 'court',
    vignette: 0.55,
  },
};
