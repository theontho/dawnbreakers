import { BaseMapScene } from './BaseMapScene';

/**
 * The lower city of Shíráz: gate, bazaar, mosque, fountain.
 * North edge exits to the Quiet Quarter where the Báb's house stands.
 */
export class CityScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 14;
  protected sceneTitle = 'Shíráz — the City';

  constructor() { super('City'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 16, y: 12 };
  }

  protected buildMap(): void {
    // Mosque court (stone)
    this.paintRect(5, 5, 5, 3, 'stone');
    // Bazaar plaza (sand)
    this.paintRect(10, 9, 7, 4, 'sand');
    // Gate forecourt (sand)
    this.paintRect(12, 13, 4, 1, 'sand');
    // Small bookbinder's mat off the bazaar
    this.paintRect(14, 8, 2, 1, 'sand');

    // Main thoroughfare: north entry → mosque side → bazaar → gate row
    this.paintPath([
      [8, 0], [8, 1], [8, 2], [8, 3], [8, 4],
      [8, 5], [8, 6], [8, 7], [8, 8],
      [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
      [13, 9], [13, 10], [13, 11], [13, 12],
    ]);
    this.paintPath([[4, 6], [4, 7], [5, 8], [6, 8], [7, 8]]);

    // Fountain west of the mosque
    this.map[6][3] = 'water'; this.blockTile(3, 6);
    this.map[7][3] = 'water'; this.blockTile(3, 7);
    // sand rim around the fountain
    this.map[5][3] = 'sand'; this.map[8][3] = 'sand';
    this.map[6][2] = 'sand'; this.map[7][2] = 'sand';
    this.map[6][4] = 'sand'; this.map[7][4] = 'sand';
  }

  protected placeBuildings(): void {
    // Mosque (2×2)
    this.buildings.push({ gridX: 6, gridY: 5, w: 2, h: 2, texture: 'mosque' });
    this.blockFootprint(6, 5, 2, 2);

    // Bazaar stalls
    this.buildings.push({ gridX: 11, gridY: 10, w: 1, h: 1, texture: 'stall' });
    this.buildings.push({ gridX: 15, gridY: 10, w: 1, h: 1, texture: 'stall' });
    this.buildings.push({ gridX: 11, gridY: 12, w: 1, h: 1, texture: 'stall' });
    this.blockFootprint(11, 10, 1, 1);
    this.blockFootprint(15, 10, 1, 1);
    this.blockFootprint(11, 12, 1, 1);

    // City gate at south-east
    this.buildings.push({ gridX: 14, gridY: 13, w: 1, h: 1, texture: 'gate' });
    this.blockFootprint(14, 13, 1, 1);
  }

  protected placeDecor(): void {
    // Trees scattered around the periphery
    const trees: [number, number][] = [
      [0, 2], [1, 5], [0, 10], [2, 12],
      [16, 1], [17, 4], [16, 6], [17, 9],
      [0, 13], [4, 12], [16, 13],
    ];
    for (const [x, y] of trees) {
      this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });
    }

    // A well outside the mosque court
    this.decor.push({ gridX: 10, gridY: 5, texture: 'well', blocks: true });

    // Market and evening details (non-blocking)
    this.decor.push({ gridX: 10, gridY: 9, texture: 'crates' });
    this.decor.push({ gridX: 16, gridY: 11, texture: 'crates' });
    this.decor.push({ gridX: 12, gridY: 9, texture: 'rug' });
    this.decor.push({ gridX: 14, gridY: 11, texture: 'rug' });
    this.decor.push({ gridX: 9, gridY: 4, texture: 'lamp' });
    this.decor.push({ gridX: 12, gridY: 13, texture: 'lamp' });
    this.decor.push({ gridX: 4, gridY: 5, texture: 'ch1-birds' });
  }

  protected spawnNPCs(): void {
    // The Weary Traveller — beside the gate
    this.addNPC(15, 12, 'npc-traveller',
      () => 'Speak with the Weary Traveller  [E]',
      () => this.startSimpleDialogue('rumour-traveller'));

    // The Cloth Merchant — among the stalls
    this.addNPC(12, 10, 'npc-merchant',
      () => 'Speak with the Cloth Merchant  [E]',
      () => this.startSimpleDialogue('rumour-merchant'));

    // The Stern Mullá — at the foot of the mosque
    this.addNPC(7, 7, 'npc-mulla',
      () => 'Speak with the Stern Mullá  [E]',
      () => this.startSimpleDialogue('rumour-mulla'));

    // The Water-Carrier — near the fountain
    this.addNPC(4, 7, 'ch1-npc-water-carrier',
      () => 'Speak with the Water-Carrier  [E]',
      () => this.startSimpleDialogue('rumour-water-carrier'));

    // The Gate Guard — watching late arrivals
    this.addNPC(15, 13, 'ch1-npc-guard',
      () => 'Speak with the Gate Guard  [E]',
      () => this.startSimpleDialogue('rumour-gate-guard'));

    // The Calligrapher — beside the bazaar cloths
    this.addNPC(14, 9, 'ch1-npc-calligrapher',
      () => 'Speak with the Calligrapher  [E]',
      () => this.startSimpleDialogue('rumour-calligrapher'));

    // The Mosque Orphan — near the mosque steps
    this.addNPC(5, 8, 'ch1-npc-beggar',
      () => 'Speak with the Mosque Orphan  [E]',
      () => this.startSimpleDialogue('rumour-orphan'));
  }

  protected setupExits(): void {
    // Walk north off the path tile at (8, 0) → enter the Quiet Quarter
    this.exits.push({
      fromX: 8, fromY: 0, dx: 0, dy: -1,
      targetScene: 'HouseQuarter',
      targetSpawnX: 6, targetSpawnY: 13,
      label: '↑ Walk to the Quiet Quarter',
    });
  }
}
