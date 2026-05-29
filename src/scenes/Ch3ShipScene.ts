import { BaseMapScene } from './BaseMapScene';

export class Ch3ShipScene extends BaseMapScene {
  protected mapWidth = 14;
  protected mapHeight = 9;
  protected sceneTitle = 'Pilgrimage — Aboard Ship';

  constructor() { super('Ch3Ship'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  private ensureTextures(): void {
    this.makePersonTexture('ch3-quddus', {
      body: 0x263d4f,
      skin: 0xe8d8b0,
      clothing: { style: 'robe', secondary: 0xf2ead6, accent: 0xc9a55c },
      hat: { style: 'turban', color: 0xf2ead6, accent: 0x263d4f },
      shadow: true,
    });
    this.makePersonTexture('ch3-sailor', {
      body: 0x5b3a24,
      skin: 0xd8bd8a,
      clothing: { style: 'vest', secondary: 0x2f5f73, accent: 0xd8c7a0 },
      hat: { style: 'cap', color: 0x3f5f73 },
      shadow: true,
    });
    this.makePersonTexture('ch3-ship-pilgrim', {
      body: 0x6b5a44,
      skin: 0xe2c997,
      clothing: { style: 'wrap', secondary: 0xf2ead6, accent: 0x9c8458 },
      hat: { style: 'headscarf', color: 0xf2ead6 },
      shadow: true,
    });
    this.makeMastTexture();
    this.makeCrateTexture();
    this.makeRailTexture();
  }

  private makeMastTexture(): void {
    if (this.textures.exists('ch3-mast')) return;

    const g = this.add.graphics();
    g.fillStyle(0x5c3a1f, 1);
    g.fillRect(29, 10, 6, 86);
    g.fillStyle(0xd8c7a0, 0.9);
    g.fillTriangle(35, 14, 35, 76, 59, 47);
    g.fillStyle(0xc7b48b, 0.9);
    g.fillTriangle(29, 20, 29, 78, 7, 50);
    g.lineStyle(1, 0x2a1a0c, 0.7);
    g.strokeRect(29, 10, 6, 86);
    g.lineBetween(7, 50, 59, 47);
    g.generateTexture('ch3-mast', 64, 104);
    g.destroy();
  }

  private makeCrateTexture(): void {
    if (this.textures.exists('ch3-crate')) return;

    const g = this.add.graphics();
    g.fillStyle(0x7a5130, 1);
    g.fillRect(4, 10, 28, 22);
    g.lineStyle(1, 0x2f1c0f, 0.8);
    g.strokeRect(4, 10, 28, 22);
    g.lineBetween(6, 13, 30, 29);
    g.lineBetween(30, 13, 6, 29);
    g.generateTexture('ch3-crate', 36, 36);
    g.destroy();
  }

  private makeRailTexture(): void {
    if (this.textures.exists('ch3-ship-rail')) return;

    const g = this.add.graphics();
    g.lineStyle(3, 0x4b2d18, 1);
    g.lineBetween(5, 24, 43, 24);
    g.lineStyle(2, 0x6a4325, 1);
    g.lineBetween(10, 8, 10, 28);
    g.lineBetween(23, 7, 23, 28);
    g.lineBetween(36, 8, 36, 28);
    g.generateTexture('ch3-ship-rail', 48, 32);
    g.destroy();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 3, y: 4 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'water');

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) this.blockTile(x, y);
    }

    this.paintRect(2, 2, 9, 5, 'path');
    this.paintRect(4, 3, 5, 3, 'sand');
    this.paintRect(11, 4, 3, 1, 'path');

    const walkable: [number, number][] = [];
    for (let y = 2; y <= 6; y++) {
      for (let x = 2; x <= 10; x++) walkable.push([x, y]);
    }
    walkable.push([11, 4], [12, 4], [13, 4]);
    for (const [x, y] of walkable) this.blocked[y][x] = false;
  }

  protected placeBuildings(): void {
    // The ship is formed from walkable deck tiles and local decor textures.
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 6, gridY: 3, texture: 'ch3-mast', blocks: true });
    this.decor.push({ gridX: 3, gridY: 2, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 4, gridY: 6, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 8, gridY: 2, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 9, gridY: 6, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 3, gridY: 5, texture: 'ch3-crate', blocks: true });
    this.decor.push({ gridX: 8, gridY: 5, texture: 'ch3-crate', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(5, 4, 'ch3-quddus',
      () => 'Speak with Quddús  [E]',
      () => this.startSimpleDialogue('ch3-quddus-ship'));
    this.addNPC(9, 5, 'ch3-sailor',
      () => 'Ask the sailor about the crossing  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
    this.addNPC(7, 6, 'ch3-ship-pilgrim',
      () => 'Speak with a quiet pilgrim  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 13, fromY: 4, dx: 1, dy: 0,
      targetScene: 'Ch3Mecca',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Toward Mecca',
    });
  }
}
