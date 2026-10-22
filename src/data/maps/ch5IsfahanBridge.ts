import type { MapDefinition } from './types';

/**
 * Iṣfahán by the Zāyandih-Rúd, autumn 1846. The Shíráz road comes up from
 * the south past a caravan market and a caravanserai to the great bridge.
 * North of the river: a cypress avenue, the Imám-Jumʿih's house where the
 * Báb was lodged, a madrasa, and the river road east to the Palace of the
 * Sun.
 */
export const ch5IsfahanBridgeMap: MapDefinition = {
  key: 'Ch5IsfahanBridge',
  title: 'Iṣfahán, by the River',
  width: 30,
  height: 24,
  spawn: { x: 14, y: 22 },
  build: ({ paintRect, setTile, block }) => {
    paintRect(0, 0, 30, 24, 'sand');

    // North bank gardens
    paintRect(0, 0, 30, 9, 'grass');

    // The river, and the bridge that spans it
    for (let x = 0; x < 30; x++) {
      for (const y of [11, 12]) {
        setTile(x, y, 'water');
        if (x < 12 || x > 16) block(x, y);
      }
    }
    paintRect(12, 11, 5, 2, 'stone');

    // The Shíráz road up to the bridge, and the avenue beyond it
    paintRect(14, 13, 1, 11, 'path');
    paintRect(14, 0, 1, 11, 'path');
    paintRect(12, 10, 5, 1, 'stone');
    paintRect(12, 13, 5, 1, 'stone');

    // River road along the north bank, east to the palace
    paintRect(0, 9, 30, 1, 'path');

    // The Imám-Jumʿih's house and court
    paintRect(3, 2, 8, 6, 'stone');
    paintRect(6, 8, 1, 1, 'path');

    // The madrasa court
    paintRect(18, 1, 9, 7, 'stone');
    paintRect(22, 8, 1, 1, 'path');

    // Caravan market on the south bank
    paintRect(3, 15, 9, 7, 'stone');
    paintRect(4, 18, 10, 1, 'path');

    // Caravanserai yard
    paintRect(18, 15, 8, 6, 'stone');
    paintRect(15, 18, 3, 1, 'path');
  },
  buildings: [
    { gridX: 12, gridY: 11, w: 5, h: 2, texture: 'ch5-bridge-span', blocks: false },
    { gridX: 5, gridY: 2, w: 2, h: 2, texture: 'house' },
    { gridX: 21, gridY: 2, w: 2, h: 2, texture: 'mosque' },
    { gridX: 5, gridY: 15, w: 1, h: 1, texture: 'ch5-market-awning' },
    { gridX: 9, gridY: 15, w: 1, h: 1, texture: 'ch5-market-awning' },
    { gridX: 4, gridY: 20, w: 1, h: 1, texture: 'stall' },
    { gridX: 10, gridY: 20, w: 1, h: 1, texture: 'stall' },
    { gridX: 20, gridY: 15, w: 3, h: 2, texture: 'ch2-caravanserai' },
  ],
  decor: [
    // Reeds along both banks, leaving the bridge approaches clear
    { gridX: 1, gridY: 10, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 4, gridY: 10, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 9, gridY: 10, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 20, gridY: 10, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 25, gridY: 10, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 2, gridY: 13, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 10, gridY: 13, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 21, gridY: 13, texture: 'ch5-river-reeds', blocks: true },
    { gridX: 27, gridY: 13, texture: 'ch5-river-reeds', blocks: true },
    // Plane trees on the river road
    { gridX: 7, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 23, gridY: 10, texture: 'tree', blocks: true },
    { gridX: 28, gridY: 10, texture: 'tree', blocks: true },
    // Lamps at the bridgeheads
    { gridX: 11, gridY: 10, texture: 'lamp', blocks: true },
    { gridX: 17, gridY: 10, texture: 'lamp', blocks: true },
    { gridX: 11, gridY: 13, texture: 'lamp', blocks: true },
    { gridX: 17, gridY: 13, texture: 'lamp', blocks: true },
    // The cypress avenue running north from the bridge
    { gridX: 13, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 15, gridY: 1, texture: 'cypress', blocks: true },
    { gridX: 13, gridY: 4, texture: 'cypress', blocks: true },
    { gridX: 15, gridY: 4, texture: 'cypress', blocks: true },
    { gridX: 13, gridY: 7, texture: 'cypress', blocks: true },
    { gridX: 15, gridY: 7, texture: 'cypress', blocks: true },
    // The Imám-Jumʿih's court
    { gridX: 3, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 10, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 3, gridY: 6, texture: 'ch1-planter', blocks: true },
    { gridX: 10, gridY: 6, texture: 'ch1-planter', blocks: true },
    { gridX: 8, gridY: 2, texture: 'lamp', blocks: true },
    { gridX: 5, gridY: 5, texture: 'rug' },
    { gridX: 8, gridY: 6, texture: 'rug' },
    // The madrasa court
    { gridX: 18, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 26, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 18, gridY: 4, texture: 'writing-desk', blocks: true },
    { gridX: 25, gridY: 4, texture: 'well', blocks: true },
    { gridX: 20, gridY: 7, texture: 'rug' },
    { gridX: 24, gridY: 7, texture: 'rug' },
    // The cloth-printer's washing on the south bank
    { gridX: 5, gridY: 14, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 8, gridY: 14, texture: 'ch9-cloth-bundle', blocks: true },
    // Caravan market
    { gridX: 7, gridY: 16, texture: 'crates', blocks: true },
    { gridX: 3, gridY: 17, texture: 'crates', blocks: true },
    { gridX: 11, gridY: 17, texture: 'ch9-rope-coils', blocks: true },
    { gridX: 7, gridY: 20, texture: 'rug' },
    { gridX: 6, gridY: 19, texture: 'crowd', blocks: true },
    // Caravanserai yard
    { gridX: 18, gridY: 16, texture: 'lamp', blocks: true },
    { gridX: 19, gridY: 19, texture: 'crates', blocks: true },
    { gridX: 24, gridY: 19, texture: 'ch9-cloth-bundle', blocks: true },
    { gridX: 23, gridY: 15, texture: 'well', blocks: true },
    { gridX: 21, gridY: 20, texture: 'crowd-shadow' },
    // Orchard and road trees in the south
    { gridX: 1, gridY: 16, texture: 'tree', blocks: true },
    { gridX: 1, gridY: 21, texture: 'tree', blocks: true },
    { gridX: 12, gridY: 22, texture: 'tree', blocks: true },
    { gridX: 16, gridY: 22, texture: 'tree', blocks: true },
    { gridX: 27, gridY: 16, texture: 'tree', blocks: true },
    { gridX: 28, gridY: 20, texture: 'tree', blocks: true },
    { gridX: 26, gridY: 22, texture: 'tree', blocks: true },
    { gridX: 13, gridY: 20, texture: 'ch2-milestone', blocks: true },
    // North edge gardens
    { gridX: 0, gridY: 1, texture: 'tree', blocks: true },
    { gridX: 1, gridY: 6, texture: 'tree', blocks: true },
    { gridX: 11, gridY: 4, texture: 'tree', blocks: true },
    { gridX: 17, gridY: 6, texture: 'tree', blocks: true },
    { gridX: 28, gridY: 2, texture: 'cypress', blocks: true },
    { gridX: 28, gridY: 6, texture: 'cypress', blocks: true },
    { gridX: 16, gridY: 3, texture: 'ch7-rosebush', blocks: true },
  ],
  npcs: [
    { gridX: 8, gridY: 18, texture: 'npc-merchant',
      prompt: 'Speak with a Market Visitor  [E]',
      dialogue: 'ch5-arrival' },
    { gridX: 6, gridY: 13, texture: 'ch5-cloth-printer',
      prompt: 'Speak with the Cloth-Printer  [E]',
      dialogue: 'ch5-cloth-printer' },
    { gridX: 8, gridY: 4, texture: 'ch5-imam-jumih',
      prompt: 'Speak with the Imám-Jumʿih  [E]',
      dialogue: 'ch5-imam-jumih' },
    { gridX: 6, gridY: 6, texture: 'ch5-ewer',
      prompt: 'Look at the silver ewer  [E]',
      dialogue: 'ch5-ewer' },
    { gridX: 19, gridY: 4, texture: 'ch5-student',
      prompt: 'Speak with the Theology Student  [E]',
      dialogue: 'ch5-student' },
    { gridX: 24, gridY: 6, texture: 'npc-mulla',
      prompt: 'Speak with the Learned Cleric  [E]',
      dialogue: 'ch5-cleric-question' },
  ],
  exits: [
    { fromX: 29, fromY: 9, dx: 1, dy: 0,
      targetScene: 'Ch5MutamidPalace', targetSpawnX: 0, targetSpawnY: 13,
      label: '→ East along the river to the Palace of the Sun' },
  ],
  ambience: {
    wash: { color: 0xd08850, alpha: 0.26 },
    particles: 'leaves', music: 'city',
    vignette: 0.5,
  },
};
