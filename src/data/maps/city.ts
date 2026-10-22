import type { MapDefinition } from './types';

/**
 * Shíráz at dusk, 22 May 1844. The Kázirún gate in the south-east, the
 * bazaar under its awnings, the great mosque and its fountain to the west,
 * the Masjid-i-Ílkhání where Mullá Ḥusayn's kin lodge in the north, and the
 * road north to the Quiet Quarter.
 */
export const cityMap: MapDefinition = {
  key: 'City',
  title: 'Shíráz: the City at Dusk',
  width: 26,
  height: 22,
  spawn: { x: 20, y: 19 },
  build: ({ paintRect, paintPath, setTile, block }) => {
    // Gate forecourt and the road in from the Kázirún gate
    paintRect(17, 18, 5, 4, 'sand');
    paintPath([
      [19, 17], [19, 16], [19, 15], [19, 14],
      [18, 14], [17, 14], [16, 14], [15, 14], [14, 14], [13, 14], [12, 14],
    ]);

    // The bazaar: a sand plaza between stall rows
    paintRect(14, 8, 9, 6, 'sand');
    paintPath([[15, 11], [16, 11], [17, 11], [18, 11], [19, 11], [20, 11], [21, 11]]);

    // The great mosque court and its fountain
    paintRect(3, 9, 7, 7, 'stone');
    paintRect(2, 13, 3, 3, 'sand');
    setTile(3, 14, 'water'); block(3, 14);
    setTile(3, 13, 'water'); block(3, 13);
    setTile(2, 14, 'water'); block(2, 14);

    // Masjid-i-Ílkhání court in the north-east
    paintRect(15, 2, 6, 5, 'stone');

    // Main thoroughfare north to the Quiet Quarter
    paintPath([
      [12, 0], [12, 1], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6], [12, 7],
      [12, 8], [12, 9], [12, 10], [12, 11], [12, 12], [12, 13],
    ]);
    // Lanes: to the mosque, to the Ílkhání, and along the bazaar's north side
    paintPath([[11, 12], [10, 12], [9, 12]]);
    paintPath([[13, 4], [14, 4]]);
    paintPath([[13, 7], [14, 7], [15, 7], [16, 7], [17, 7], [18, 7], [19, 7], [20, 7]]);

    // Garden beds of the northern houses
    paintRect(1, 2, 7, 5, 'grass');
    paintPath([[4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7]]);
  },
  buildings: [
    // The great mosque and the Masjid-i-Ílkhání
    { gridX: 5, gridY: 10, w: 2, h: 2, texture: 'mosque' },
    { gridX: 17, gridY: 3, w: 2, h: 2, texture: 'mosque' },
    // City gate
    { gridX: 21, gridY: 21, w: 1, h: 1, texture: 'gate' },
    // Bazaar stalls and awnings
    { gridX: 15, gridY: 9, w: 1, h: 1, texture: 'stall' },
    { gridX: 17, gridY: 9, w: 1, h: 1, texture: 'ch5-market-awning' },
    { gridX: 19, gridY: 9, w: 1, h: 1, texture: 'stall' },
    { gridX: 21, gridY: 9, w: 1, h: 1, texture: 'ch5-market-awning' },
    { gridX: 15, gridY: 13, w: 1, h: 1, texture: 'ch5-market-awning' },
    { gridX: 18, gridY: 13, w: 1, h: 1, texture: 'stall' },
    { gridX: 21, gridY: 13, w: 1, h: 1, texture: 'stall' },
    // Houses along the edges of the city
    { gridX: 1, gridY: 17, w: 2, h: 2, texture: 'house' },
    { gridX: 5, gridY: 18, w: 2, h: 2, texture: 'house' },
    { gridX: 9, gridY: 17, w: 2, h: 2, texture: 'house' },
    { gridX: 23, gridY: 5, w: 2, h: 2, texture: 'house' },
    { gridX: 23, gridY: 14, w: 2, h: 2, texture: 'house' },
    { gridX: 8, gridY: 2, w: 2, h: 2, texture: 'house' },
  ],
  decor: [
    // Cypress garden of the northern houses
    { gridX: 1, gridY: 3, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 3, texture: 'cypress', blocks: true },
    { gridX: 5, gridY: 3, texture: 'cypress', blocks: true },
    { gridX: 2, gridY: 5, texture: 'ch7-rosebush', blocks: true },
    { gridX: 4, gridY: 5, texture: 'ch1-planter', blocks: true },
    { gridX: 6, gridY: 5, texture: 'ch7-rosebush', blocks: true },
    { gridX: 7, gridY: 3, texture: 'cypress', blocks: true },
    // Trees around the edges
    { gridX: 0, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 3, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 6, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 0, texture: 'tree', blocks: true },
    { gridX: 20, gridY: 0, texture: 'cypress', blocks: true },
    { gridX: 24, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 25, gridY: 9, texture: 'tree', blocks: true },
    { gridX: 25, gridY: 12, texture: 'cypress', blocks: true },
    { gridX: 24, gridY: 18, texture: 'tree', blocks: true },
    { gridX: 0, gridY: 21, texture: 'tree', blocks: true },
    { gridX: 3, gridY: 21, texture: 'cypress', blocks: true },
    { gridX: 12, gridY: 20, texture: 'tree', blocks: true },
    { gridX: 15, gridY: 20, texture: 'cypress', blocks: true },
    { gridX: 0, gridY: 13, texture: 'tree', blocks: true },
    { gridX: 9, gridY: 14, texture: 'cypress', blocks: true },
    { gridX: 9, gridY: 9, texture: 'cypress', blocks: true },
    // The mosque court: wells, prayer rugs, a lamp at the steps
    { gridX: 8, gridY: 10, texture: 'well', blocks: true },
    { gridX: 4, gridY: 12, texture: 'rug' },
    { gridX: 7, gridY: 14, texture: 'rug' },
    { gridX: 9, gridY: 11, texture: 'lamp', blocks: true },
    { gridX: 4, gridY: 9, texture: 'ch1-birds' },
    // The Ílkhání court
    { gridX: 15, gridY: 2, texture: 'lamp', blocks: true },
    { gridX: 20, gridY: 5, texture: 'rug' },
    { gridX: 16, gridY: 6, texture: 'crates', blocks: true },
    // Bazaar goods and evening lamps
    { gridX: 16, gridY: 9, texture: 'crates', blocks: true },
    { gridX: 20, gridY: 9, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 22, gridY: 10, texture: 'crates', blocks: true },
    { gridX: 16, gridY: 12, texture: 'rug' },
    { gridX: 19, gridY: 12, texture: 'rug' },
    { gridX: 22, gridY: 12, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 14, gridY: 10, texture: 'lamp', blocks: true },
    { gridX: 22, gridY: 8, texture: 'lamp', blocks: true },
    { gridX: 14, gridY: 13, texture: 'lamp', blocks: true },
    { gridX: 17, gridY: 12, texture: 'ch3-pilgrim-cluster', blocks: true },
    // Gate forecourt
    { gridX: 17, gridY: 18, texture: 'crates', blocks: true },
    { gridX: 22, gridY: 19, texture: 'lamp', blocks: true },
    { gridX: 20, gridY: 21, texture: 'lamp', blocks: true },
    { gridX: 17, gridY: 21, texture: 'ch2-milestone', blocks: true },
    // Lamps along the road north
    { gridX: 11, gridY: 9, texture: 'lamp', blocks: true },
    { gridX: 13, gridY: 3, texture: 'lamp', blocks: true },
  ],
  npcs: [
    // Mullá Ḥusayn, the player's travelling companion; after this he goes ahead to the Quiet Quarter
    { gridX: 18, gridY: 19, texture: 'ch1-mulla-husayn',
      prompt: 'Speak with Mullá Ḥusayn  [E]',
      dialogue: 'ch1-mulla-husayn-gate',
      present: f => !f.metMullaHusayn },
    { gridX: 21, gridY: 17, texture: 'npc-traveller',
      prompt: 'Speak with the Weary Traveller  [E]',
      dialogue: 'rumour-traveller' },
    { gridX: 20, gridY: 20, texture: 'ch1-npc-guard',
      prompt: 'Speak with the Gate Guard  [E]',
      dialogue: 'rumour-gate-guard' },
    { gridX: 16, gridY: 10, texture: 'npc-merchant',
      prompt: 'Speak with the Cloth Merchant  [E]',
      dialogue: 'rumour-merchant' },
    { gridX: 20, gridY: 10, texture: 'ch1-npc-calligrapher',
      prompt: 'Speak with the Calligrapher  [E]',
      dialogue: 'rumour-calligrapher' },
    { gridX: 7, gridY: 12, texture: 'npc-mulla',
      prompt: 'Speak with the Stern Mullá  [E]',
      dialogue: 'rumour-mulla' },
    { gridX: 5, gridY: 13, texture: 'ch1-npc-beggar',
      prompt: 'Speak with the Mosque Orphan  [E]',
      dialogue: 'rumour-orphan' },
    { gridX: 4, gridY: 14, texture: 'ch1-npc-water-carrier',
      prompt: 'Speak with the Water-Carrier  [E]',
      dialogue: 'rumour-water-carrier' },
    { gridX: 18, gridY: 6, texture: 'ch1-brother',
      prompt: 'Speak with Mullá Ḥusayn\'s Brother  [E]',
      dialogue: 'ch1-brother' },
  ],
  exits: [
    { fromX: 12, fromY: 0, dx: 0, dy: -1,
      targetScene: 'HouseQuarter', targetSpawnX: 9, targetSpawnY: 16,
      label: '↑ Walk to the Quiet Quarter' },
  ],
  ambience: {
    wash: { color: 0xd89060, alpha: 0.32 },
    particles: 'motes', music: 'dusk',
    lights: [
      { gridX: 5, gridY: 10, radius: 120, color: 0xffc070, intensity: 0.25 },
    ],
  },
};
