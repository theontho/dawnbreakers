import { rumourCount } from '../dialogues_ch/chapter01_shiraz';
import type { MapDefinition } from './types';

/**
 * The Quiet Quarter at night: a residential lane in north Shíráz. The Báb's
 * house stands at the head of the lane behind a small stone court. He is
 * never on the map; the player keeps vigil at the lamplit threshold.
 * South returns to the city; east is the road north, opened at dawn.
 */
export const houseQuarterMap: MapDefinition = {
  key: 'HouseQuarter',
  title: 'Shíráz: the Quiet Quarter',
  width: 20,
  height: 18,
  spawn: { x: 9, y: 16 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Stone court before the house
    paintRect(6, 4, 7, 5, 'stone');
    // A reflecting pool in the court
    setTile(11, 5, 'water'); block(11, 5);
    setTile(11, 6, 'water'); block(11, 6);

    // The lane from the city up to the court, and the cross-lane
    paintPath([[9, 17], [9, 16], [9, 15], [9, 14], [9, 13], [9, 12], [9, 11], [9, 10], [9, 9]]);
    paintPath([
      [2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [7, 9], [8, 9],
      [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [19, 9],
    ]);
    // Narrow alleys between the neighbours' houses
    paintPath([[4, 10], [4, 11], [4, 12], [4, 13]]);
    paintPath([[15, 10], [15, 11], [15, 12], [15, 13]]);

    // Kitchen gardens behind the houses
    paintRect(1, 1, 4, 3, 'grass');
    paintRect(15, 1, 4, 3, 'grass');
    paintRect(11, 13, 3, 3, 'path');
  },
  buildings: [
    // The Báb's house; its front cell is (9, 6)
    { gridX: 8, gridY: 5, w: 2, h: 2, texture: 'house' },
    // Neighbours along the lane
    { gridX: 3, gridY: 5, w: 2, h: 2, texture: 'house' },
    { gridX: 15, gridY: 5, w: 2, h: 2, texture: 'house' },
    { gridX: 1, gridY: 11, w: 2, h: 2, texture: 'house' },
    { gridX: 6, gridY: 12, w: 2, h: 2, texture: 'house' },
    { gridX: 17, gridY: 11, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    // The court: lamps flanking the door, planters, rugs set out for guests
    { gridX: 8, gridY: 7, texture: 'lamp', blocks: true },
    { gridX: 10, gridY: 7, texture: 'lamp', blocks: true },
    { gridX: 6, gridY: 5, texture: 'ch1-planter', blocks: true },
    { gridX: 12, gridY: 4, texture: 'ch1-planter', blocks: true },
    { gridX: 6, gridY: 7, texture: 'ch7-rosebush', blocks: true },
    { gridX: 12, gridY: 8, texture: 'ch7-rosebush', blocks: true },
    { gridX: 7, gridY: 4, texture: 'rug' },
    // Cypresses and fruit trees in the gardens
    { gridX: 1, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 18, gridY: 2, texture: 'tree', blocks: true },
    { gridX: 13, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 6, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 0, gridY: 7, texture: 'tree', blocks: true },
    { gridX: 19, gridY: 6, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 15, texture: 'tree', blocks: true },
    { gridX: 3, gridY: 16, texture: 'cypress', blocks: true },
    { gridX: 16, gridY: 16, texture: 'tree', blocks: true },
    { gridX: 19, gridY: 14, texture: 'cypress', blocks: true },
    // The neighbourhood well and a sleeping cart of crates
    { gridX: 12, gridY: 14, texture: 'well', blocks: true },
    { gridX: 13, gridY: 15, texture: 'crates', blocks: true },
    { gridX: 2, gridY: 9, texture: 'ch1-planter', blocks: true },
    // Lamps along the lanes
    { gridX: 8, gridY: 12, texture: 'lamp', blocks: true },
    { gridX: 16, gridY: 10, texture: 'lamp', blocks: true },
    { gridX: 5, gridY: 10, texture: 'lamp', blocks: true },
    { gridX: 10, gridY: 15, texture: 'lamp', blocks: true },
  ],
  npcs: [
    // The lamplit threshold: the player keeps vigil outside. The Báb is never on the map.
    { gridX: 9, gridY: 7, texture: 'ch1-house-threshold',
      prompt: 'Keep vigil at the lamplit threshold  [E]',
      dialogue: 'ch1-threshold-vigil',
      gate: {
        when: f => !!f.metMullaHusayn && rumourCount(f) >= 2,
        lockedDialogue: 'ch1-threshold-closed',
      } },
    // Mullá Ḥusayn waits in the lane until he is received
    { gridX: 10, gridY: 10, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch1-mulla-husayn-lane',
      present: f => !!f.metMullaHusayn && !f.vigilKept },
    { gridX: 3, gridY: 10, texture: 'npc-merchant',
      prompt: 'Speak with the Quiet Neighbour  [E]',
      dialogue: 'rumour-neighbour' },
    { gridX: 11, gridY: 8, texture: 'ch1-npc-servant',
      prompt: 'Speak with Mubárak, the Household Servant  [E]',
      dialogue: 'rumour-servant' },
    { gridX: 16, gridY: 8, texture: 'ch1-watchman',
      prompt: 'Speak with the Night Watchman  [E]',
      dialogue: 'ch1-watchman' },
  ],
  exits: [
    { fromX: 9, fromY: 17, dx: 0, dy: 1,
      targetScene: 'City', targetSpawnX: 18, targetSpawnY: 1,
      label: '↓ Walk back to the city' },
    { fromX: 19, fromY: 9, dx: 1, dy: 0,
      targetScene: 'Road', targetSpawnX: 1, targetSpawnY: 16,
      label: '→ Take the road north',
      requires: f => !!f.shirazComplete,
      lockedLabel: 'The road north can wait until dawn' },
  ],
  ambience: {
    wash: { color: 0x34407a, alpha: 0.58 },
    particles: 'fireflies', music: 'night',
    vignette: 0.7,
    lights: [
      { gridX: 9, gridY: 6, radius: 110, color: 0xffd080, intensity: 0.5 },
    ],
  },
};
