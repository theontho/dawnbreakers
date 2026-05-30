import { BaseMapScene } from './BaseMapScene';

/**
 * The Quiet Quarter: a residential lane in north Shíráz.
 * The Báb's house stands at its centre, with a small garden and a well.
 * Walk south off (6, 13) to return to the city.
 */
export class HouseQuarterScene extends BaseMapScene {
  protected mapWidth = 14;
  protected mapHeight = 14;
  protected sceneTitle = 'Shíráz — the Quiet Quarter';

  constructor() { super('HouseQuarter'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 6, y: 13 };
  }

  protected buildMap(): void {
    // Stone forecourt of the Báb's house
    this.paintRect(4, 4, 5, 4, 'stone');

    // Lane running south from the courtyard to the city
    this.paintPath([
      [6, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13],
    ]);
    this.paintPath([[5, 8], [7, 8], [8, 8], [9, 8]]);

    // A garden plot east of the lane
    this.paintRect(9, 9, 3, 3, 'grass');

    // A small reflecting pool in the courtyard
    this.map[5][7] = 'water'; this.blockTile(7, 5);
  }

  protected placeBuildings(): void {
    // The Báb's house — 2×2 at (5, 4) (the front-most tile is (6, 5))
    this.buildings.push({ gridX: 5, gridY: 4, w: 2, h: 2, texture: 'house' });
    this.blockFootprint(5, 4, 2, 2);
  }

  protected placeDecor(): void {
    // Trees flanking the courtyard
    const trees: [number, number][] = [
      [3, 4], [3, 6], [9, 4], [9, 6],
      [1, 9], [2, 12], [11, 9], [12, 11], [12, 7],
      [0, 1], [13, 1], [0, 6], [13, 5],
    ];
    for (const [x, y] of trees) {
      this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });
    }
    // A neighbourhood well by the lane
    this.decor.push({ gridX: 4, gridY: 10, texture: 'well', blocks: true });

    // Quiet household details (non-blocking)
    this.decor.push({ gridX: 4, gridY: 7, texture: 'ch1-planter' });
    this.decor.push({ gridX: 8, gridY: 7, texture: 'ch1-planter' });
    this.decor.push({ gridX: 9, gridY: 10, texture: 'ch1-planter' });
    this.decor.push({ gridX: 5, gridY: 7, texture: 'rug' });
    this.decor.push({ gridX: 7, gridY: 7, texture: 'rug' });
    this.decor.push({ gridX: 3, gridY: 8, texture: 'lamp' });
    this.decor.push({ gridX: 9, gridY: 8, texture: 'lamp' });
  }

  protected spawnNPCs(): void {
    // The lamplit threshold gates the decisive meeting without placing the Báb as a map NPC.
    this.addNPC(6, 7, 'ch1-house-threshold',
      () => 'Knock at the lamplit threshold  [E]',
      () => this.startBabDialogue());

    // A quiet neighbour — small backstory, also counts as a rumour
    this.addNPC(3, 9, 'npc-merchant',
      () => 'Speak with the Quiet Neighbour  [E]',
      () => this.startSimpleDialogue('rumour-neighbour'));

    // A household servant — keeps watch over the evening threshold
    this.addNPC(8, 8, 'ch1-npc-servant',
      () => 'Speak with the Household Servant  [E]',
      () => this.startSimpleDialogue('rumour-servant'));
  }

  protected setupExits(): void {
    // Walk south off (6, 13) → back to the city, entering near its north gate
    this.exits.push({
      fromX: 6, fromY: 13, dx: 0, dy: 1,
      targetScene: 'City',
      targetSpawnX: 8, targetSpawnY: 0,
      label: '↓ Walk back to the city',
    });
  }
}
