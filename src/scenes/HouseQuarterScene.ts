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

  create(): void {
    this.ensureTextures();
    super.create();
  }

  private ensureTextures(): void {
    this.makePersonTexture('ch1-npc-servant', {
      body: 0x5f4a2d,
      skin: 0xe0c08a,
      clothing: { style: 'apron', secondary: 0xd8c7a0, accent: 0x8a6f4d },
      hat: { style: 'headscarf', color: 0xead8aa },
      shadow: true,
    });
    this.makePlanterTexture();
    this.makeLampTexture();
    this.makeRugTexture();
    this.makeThresholdTexture();
  }

  private makePlanterTexture(): void {
    const key = 'ch1-planter';
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(1, 1, 10, 16);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, {
      right: 0x8a5a2a,
      left: 0x5f3a20,
      top: 0x4f3424,
      edge: 0x2a1a0a,
    });
    g.fillStyle(0x3f7a4a, 0.35);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.fillStyle(0x3f7a4a, 1);
    g.fillCircle(geo.bottomR.x - 10, geo.bottomR.y - 15, 7);
    g.fillCircle(geo.bottomR.x, geo.bottomR.y - 20, 8);
    g.fillCircle(geo.bottomR.x + 9, geo.bottomR.y - 14, 6);
    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }

  private makeLampTexture(): void {
    const key = 'ch1-lamp';
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x3a2818, 1);
    g.fillRect(14, 12, 4, 34);
    g.fillRect(8, 12, 16, 3);
    g.fillStyle(0xc98b3a, 1);
    g.fillCircle(16, 10, 6);
    g.fillStyle(0xf0d890, 0.6);
    g.fillCircle(16, 10, 10);
    g.generateTexture(key, 32, 50);
    g.destroy();
  }

  private makeRugTexture(): void {
    const key = 'ch1-rug';
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x7f3030, 1);
    g.fillEllipse(26, 18, 44, 16);
    g.lineStyle(2, 0xc9a55c, 1);
    g.strokeEllipse(26, 18, 36, 10);
    g.generateTexture(key, 52, 28);
    g.destroy();
  }

  private makeThresholdTexture(): void {
    const key = 'ch1-house-threshold';
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(1, 1, 34, 12);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, {
      right: 0x6f4a24,
      left: 0x4f321b,
      top: 0x8c6230,
      edge: 0x1a0f08,
    });
    const door = this.wallInset(geo.right, geo.bottom, 0.36, 0.62, 24);
    g.fillStyle(0x26180f, 1);
    g.fillPoints(door, true);
    g.lineStyle(2, 0x1a0f08, 0.85);
    g.strokePoints(door, true);
    g.fillStyle(0xe5c36e, 0.7);
    g.fillCircle(door[1].x - 3, door[1].y - 10, 4);
    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }

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
    this.decor.push({ gridX: 5, gridY: 7, texture: 'ch1-rug' });
    this.decor.push({ gridX: 7, gridY: 7, texture: 'ch1-rug' });
    this.decor.push({ gridX: 3, gridY: 8, texture: 'ch1-lamp' });
    this.decor.push({ gridX: 9, gridY: 8, texture: 'ch1-lamp' });
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
