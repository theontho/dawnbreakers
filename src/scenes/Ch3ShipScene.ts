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
    this.makePilgrimTexture('ch3-quddus', 0x263d4f, 0xe8d8b0);
    this.makePilgrimTexture('ch3-sailor', 0x5b3a24, 0xd8bd8a);
    this.makePilgrimTexture('ch3-pilgrim', 0x6b5a44, 0xe2c997);
    this.makeMastTexture();
    this.makeCrateTexture();
    this.makeRailTexture();
  }

  private makePilgrimTexture(key: string, robe: number, head: number): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(robe, 1);
    g.fillRoundedRect(5, 15, 14, 23, 3);
    g.fillStyle(head, 1);
    g.fillCircle(12, 9, 7);
    g.fillStyle(0xf2ead6, 0.9);
    g.fillRect(5, 13, 14, 5);
    g.lineStyle(1, 0x111111, 0.45);
    g.strokeRoundedRect(5, 15, 14, 23, 3);
    g.strokeCircle(12, 9, 7);
    g.generateTexture(key, 24, 40);
    g.destroy();
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
    this.addNPC(7, 6, 'ch3-pilgrim',
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
