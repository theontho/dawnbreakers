import { BaseMapScene } from './BaseMapScene';

export class Ch3MeccaScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Mecca — the Sacred Courtyard';

  constructor() { super('Ch3Mecca'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  private ensureTextures(): void {
    this.makeKaabaTexture();
    this.makePersonTexture('ch3-muhit', {
      body: 0x2a2520,
      skin: 0xdfc28f,
      clothing: { style: 'robe', secondary: 0xf2ead6, accent: 0xc9a55c },
      hat: { style: 'turban', color: 0xf2ead6, accent: 0x2a2520 },
      shadow: true,
    });
    this.makePersonTexture('ch3-pilgrim', {
      body: 0x6b5a44,
      skin: 0xe2c997,
      clothing: { style: 'wrap', secondary: 0xf7f0dc, accent: 0x9c8458 },
      hat: { style: 'veil', color: 0xf7f0dc },
      shadow: true,
    });
    this.makePilgrimClusterTexture();
    this.makeCourtyardHushTexture();
  }

  private makePilgrimClusterTexture(): void {
    if (this.textures.exists('ch3-pilgrim-cluster')) return;

    const g = this.add.graphics();
    const figures = [
      { x: 10, robe: 0xd8d0bd, hat: 0xf7f0dc },
      { x: 25, robe: 0xb8aa8d, hat: 0x8a7450 },
      { x: 39, robe: 0xe4dccb, hat: 0xf2ead6 },
    ];
    for (const figure of figures) {
      g.fillStyle(figure.robe, 0.9);
      g.fillRoundedRect(figure.x - 5, 18, 10, 18, 3);
      g.fillStyle(0xd8bd8a, 0.9);
      g.fillCircle(figure.x, 12, 5);
      g.fillStyle(figure.hat, 0.9);
      g.fillEllipse(figure.x, 8, 13, 5);
    }
    g.generateTexture('ch3-pilgrim-cluster', 50, 40);
    g.destroy();
  }

  private makeCourtyardHushTexture(): void {
    if (this.textures.exists('ch3-courtyard-hush')) return;

    const g = this.add.graphics();
    g.fillStyle(0xf7f0dc, 0.22);
    g.fillEllipse(32, 30, 56, 18);
    g.lineStyle(2, 0xc9a55c, 0.65);
    g.strokeEllipse(32, 30, 46, 12);
    g.lineStyle(1, 0xf7f0dc, 0.5);
    g.lineBetween(32, 6, 32, 28);
    g.lineBetween(22, 12, 30, 28);
    g.lineBetween(42, 12, 34, 28);
    g.generateTexture('ch3-courtyard-hush', 64, 42);
    g.destroy();
  }

  private makeKaabaTexture(): void {
    if (this.textures.exists('ch3-kaaba')) return;

    const geo = this.isoPrism(3, 2, 56, 10);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, {
      right: 0x151515,
      left: 0x0b0b0b,
      top: 0x202020,
      edge: 0x000000,
    });
    g.lineStyle(3, 0xc9a55c, 0.9);
    g.lineBetween(geo.leftR.x + 6, geo.leftR.y + 18, geo.bottomR.x, geo.bottomR.y + 18);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 18, geo.rightR.x - 6, geo.rightR.y + 18);
    g.generateTexture('ch3-kaaba', geo.texW, geo.texH);
    g.destroy();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(1, 1, 14, 10, 'stone');
    this.paintRect(2, 2, 12, 8, 'path');
    this.paintRect(5, 4, 5, 3, 'stone');

    this.paintPath([
      [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
    ]);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 4, w: 3, h: 2, texture: 'ch3-kaaba' });
    this.blockFootprint(6, 4, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 3, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 12, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 4, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 11, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(9, 6, 'ch3-courtyard-hush',
      () => 'Stand where the proclamation is heard  [E]',
      () => this.startSimpleDialogue('ch3-proclamation'));
    this.addNPC(5, 7, 'ch3-muhit',
      () => 'Speak with Mírzá Muḥíṭ-i-Kirmání  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
    this.addNPC(12, 6, 'ch3-pilgrim',
      () => 'Ask a pilgrim quietly  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch3Ship',
      targetSpawnX: 12, targetSpawnY: 4,
      label: '← Back toward the ship',
    });
  }
}
