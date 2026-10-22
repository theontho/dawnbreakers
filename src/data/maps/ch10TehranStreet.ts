import { streetTestimonyCount } from '../dialogues_ch/chapter10_street';
import type { MapDefinition } from './types';

/**
 * Ṭihrán, August 1852: the prison quarter below the royal citadel, days
 * after the attempt on the Sháh's life. The road from Shimírán comes in at
 * the north (the road the prisoners were driven down). Shuttered shops line
 * the main street; the citadel's portico looms in the north-east; the
 * stair to the Síyáh-Chál opens off the square in the south-east. After
 * the player's release, the western end of the street leads to the gate
 * where the road to Baghdád begins.
 */
export const ch10TehranStreetMap: MapDefinition = {
  key: 'Ch10TehranStreet',
  title: 'Ṭihrán: the Prison Quarter',
  width: 28,
  height: 22,
  spawn: { x: 9, y: 1 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    paintRect(0, 0, 28, 22, 'sand');

    // A walled garden in the north-west, its pool long dry.
    paintRect(1, 1, 6, 6, 'grass');
    setTile(5, 3, 'water'); block(5, 3);

    // The royal citadel's forecourt in the north-east.
    paintRect(17, 1, 10, 6, 'stone');

    // The square before the prison stair.
    paintRect(17, 9, 10, 8, 'stone');

    // The road down from Shimírán.
    paintPath([
      [9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9], [9, 10],
    ]);
    // The main street, two cells wide, west edge to the square.
    paintRect(0, 11, 18, 2, 'path');
    // A lane south to the plundered house.
    paintPath([[5, 13], [5, 14], [5, 15], [5, 16]]);
    // A lane north into the citadel forecourt.
    paintPath([[18, 7], [18, 8]]);
    // The prison stair, cut down through the square to the pit.
    paintPath([[22, 17], [22, 18], [22, 19], [22, 20], [22, 21]]);
  },
  buildings: [
    // The garden house in the north-west.
    { gridX: 2, gridY: 1, w: 2, h: 2, texture: 'house' },
    // Houses north of the street, behind the shop row.
    { gridX: 10, gridY: 5, w: 3, h: 2, texture: 'ch10-street-house' },
    { gridX: 13, gridY: 5, w: 3, h: 2, texture: 'ch10-street-house' },
    { gridX: 5, gridY: 8, w: 3, h: 2, texture: 'ch10-street-house' },
    // The shop row, every front shuttered and barred.
    { gridX: 10, gridY: 9, w: 1, h: 1, texture: 'ch10-shuttered-shop' },
    { gridX: 11, gridY: 9, w: 1, h: 1, texture: 'ch10-shuttered-shop' },
    { gridX: 12, gridY: 9, w: 1, h: 1, texture: 'ch5-market-awning' },
    { gridX: 14, gridY: 9, w: 1, h: 1, texture: 'ch10-shuttered-shop' },
    { gridX: 15, gridY: 9, w: 1, h: 1, texture: 'ch10-shuttered-shop' },
    // The royal citadel: a palace portico behind a mud-brick wall.
    { gridX: 20, gridY: 2, w: 3, h: 2, texture: 'ch5-palace-portico' },
    ...Array.from({ length: 3 }, (_, i) => ({ gridX: 17, gridY: 1 + i, w: 1, h: 1, texture: 'ch10-city-wall' })),
    { gridX: 24, gridY: 1, w: 4, h: 2, texture: 'ch10-street-arch' },
    // Houses south of the street.
    { gridX: 1, gridY: 14, w: 3, h: 2, texture: 'ch10-street-house' },
    { gridX: 6, gridY: 15, w: 2, h: 2, texture: 'house' },
    { gridX: 9, gridY: 14, w: 4, h: 2, texture: 'ch10-street-arch' },
    { gridX: 13, gridY: 14, w: 2, h: 2, texture: 'house' },
    { gridX: 1, gridY: 18, w: 3, h: 2, texture: 'ch10-street-house' },
    { gridX: 9, gridY: 18, w: 3, h: 2, texture: 'ch10-street-house' },
    { gridX: 13, gridY: 18, w: 2, h: 2, texture: 'house' },
    // The mouth of the prison: low walls either side of the sunken stair.
    { gridX: 18, gridY: 18, w: 4, h: 1, texture: 'ch10-low-arch' },
    { gridX: 23, gridY: 18, w: 4, h: 1, texture: 'ch10-low-arch' },
  ],
  decor: [
    // The garden: cypress, a well, a planter gone to seed.
    { gridX: 1, gridY: 4, texture: 'cypress', blocks: true },
    { gridX: 1, gridY: 6, texture: 'cypress', blocks: true },
    { gridX: 6, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 4, gridY: 5, texture: 'ch7-rosebush', blocks: true },
    { gridX: 6, gridY: 5, texture: 'ch1-planter', blocks: true },
    { gridX: 3, gridY: 4, texture: 'rug' },
    // Trees along the Shimírán road.
    { gridX: 8, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 10, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 8, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 14, gridY: 2, texture: 'cypress', blocks: true },
    // The water-seller's well beside the street.
    { gridX: 6, gridY: 10, texture: 'well', blocks: true },
    // Shop row: goods left out in haste.
    { gridX: 13, gridY: 9, texture: 'crates', blocks: true },
    { gridX: 16, gridY: 9, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 10, gridY: 10, texture: 'rug' },
    { gridX: 11, gridY: 8, texture: 'lamp', blocks: true },
    // Crowds gathering and scattering on the street.
    { gridX: 13, gridY: 12, texture: 'crowd-shadow' },
    { gridX: 16, gridY: 12, texture: 'crowd-shadow' },
    { gridX: 3, gridY: 12, texture: 'crowd-shadow' },
    { gridX: 20, gridY: 13, texture: 'crowd-shadow' },
    // The plundered house: its goods strewn in the lane.
    { gridX: 4, gridY: 16, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 6, gridY: 13, texture: 'crates', blocks: true },
    // The citadel forecourt: sentries and a lamp at the wall.
    { gridX: 19, gridY: 5, texture: 'ch9-soldier', blocks: true },
    { gridX: 23, gridY: 5, texture: 'ch9-soldier', blocks: true },
    { gridX: 18, gridY: 4, texture: 'lamp', blocks: true },
    { gridX: 25, gridY: 4, texture: 'cypress', blocks: true },
    { gridX: 26, gridY: 6, texture: 'cypress', blocks: true },
    // The square: a patrol, a barred vent over the pit, coiled chain.
    { gridX: 18, gridY: 10, texture: 'ch9-soldier', blocks: true },
    { gridX: 26, gridY: 12, texture: 'ch9-soldier', blocks: true },
    { gridX: 25, gridY: 15, texture: 'ch6-barred-marker', blocks: true },
    { gridX: 26, gridY: 16, texture: 'ch10-chain-coil', blocks: true },
    { gridX: 19, gridY: 15, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 24, gridY: 10, texture: 'lamp', blocks: true },
    // The stair: lamps at its mouth, rubble either side.
    { gridX: 21, gridY: 19, texture: 'lamp', blocks: true },
    { gridX: 23, gridY: 19, texture: 'lamp', blocks: true },
    { gridX: 20, gridY: 20, texture: 'ch6-rock', blocks: true },
    { gridX: 24, gridY: 20, texture: 'ch6-rock', blocks: true },
    { gridX: 19, gridY: 19, texture: 'ch6-rock', blocks: true },
    { gridX: 25, gridY: 19, texture: 'ch10-chain-coil', blocks: true },
    { gridX: 26, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 21, gridY: 17, texture: 'ch10-chain-pillar', blocks: true },
    // Southern edge of the quarter.
    { gridX: 0, gridY: 20, texture: 'tree', blocks: true },
    { gridX: 6, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 16, gridY: 20, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 17, texture: 'tree', blocks: true },
    { gridX: 27, gridY: 20, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 8, texture: 'tree', blocks: true },
  ],
  npcs: [
    { gridX: 13, gridY: 10, texture: 'ch10-shopkeeper',
      prompt: 'Speak with the Shopkeeper  [E]',
      dialogue: 'ch10-shopkeeper-winter',
      gate: { when: f => !!f.ch10Released, lockedDialogue: 'ch10-shopkeeper' } },
    { gridX: 7, gridY: 10, texture: 'ch10-water-seller',
      prompt: 'Speak with the Water-Seller  [E]',
      dialogue: 'ch10-water-seller' },
    { gridX: 14, gridY: 12, texture: 'crowd-shadow',
      prompt: 'Listen to the whispering crowd  [E]',
      dialogue: 'ch10-whispers',
      present: f => !f.ch10Released },
    { gridX: 5, gridY: 17, texture: 'closed-door',
      prompt: 'Look at the broken door  [E]',
      dialogue: 'ch10-plundered-house' },
    { gridX: 19, gridY: 16, texture: 'ch10-waiting-sister',
      prompt: 'Speak with the waiting woman  [E]',
      dialogue: 'ch10-waiting-sister',
      present: f => !f.ch10Released },
    { gridX: 23, gridY: 16, texture: 'ch10-guard',
      prompt: 'Speak with the guard at the stair  [E]',
      dialogue: 'ch10-guard',
      gate: { when: f => streetTestimonyCount(f) >= 2, lockedDialogue: 'ch10-guard-turnaway' },
      present: f => !f.ch10Arrested },
  ],
  exits: [
    { fromX: 22, fromY: 21, dx: 0, dy: 1,
      targetScene: 'Ch10SiyahChal', targetSpawnX: 11, targetSpawnY: 1,
      label: '↓ Down the stair into the Síyáh-Chál',
      requires: f => !!f.ch10Arrested && !f.ch10Released,
      lockedLabel: 'The prison stair is barred' },
    { fromX: 0, fromY: 11, dx: -1, dy: 0,
      targetScene: 'Ch10ExileRoad', targetSpawnX: 24, targetSpawnY: 10,
      label: '← To the western gate',
      requires: f => !!f.ch10Released,
      lockedLabel: 'The western gate can wait' },
  ],
  ambience: {
    wash: { color: 0xc88a58, alpha: 0.3 },
    particles: 'dust', music: 'night',
    vignette: 0.6,
    lights: [
      { gridX: 22, gridY: 18, radius: 110, color: 0x8090b0, intensity: 0.25 },
    ],
  },
};
