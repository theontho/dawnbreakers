import { BaseMapScene } from './BaseMapScene';

export class Ch8TabarsiFortScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Fort Shaykh Ṭabarsí';

  constructor() { super('Ch8TabarsiFort'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  private ensureTextures(): void {
    if (!this.textures.exists('ch8-palisade')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
      g.fillStyle(0x4a321e, 1);
      for (let x = 4; x < 60; x += 10) {
        g.fillRect(x, 16, 7, 42);
        g.fillTriangle(x, 16, x + 3.5, 6, x + 7, 16);
      }
      g.lineStyle(4, 0x2b1c10, 1);
      g.lineBetween(2, 33, 62, 33);
      g.lineBetween(2, 48, 62, 48);
      g.generateTexture('ch8-palisade', 64, 64);
      g.destroy();
    }

    if (!this.textures.exists('ch8-shrine')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
      g.fillStyle(0x5b5140, 1);
      g.fillRect(34, 58, 92, 50);
      g.fillStyle(0x8d7a57, 1);
      g.fillTriangle(26, 58, 80, 24, 134, 58);
      g.fillStyle(0xb8aa78, 1);
      g.fillCircle(80, 28, 15);
      g.fillStyle(0x2c251c, 1);
      g.fillRect(72, 78, 16, 30);
      g.lineStyle(3, 0x2d261c, 1);
      g.strokeRect(34, 58, 92, 50);
      g.generateTexture('ch8-shrine', 160, 128);
      g.destroy();
    }

    if (!this.textures.exists('ch8-truce-flag')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
      g.lineStyle(4, 0x3b2a16, 1);
      g.lineBetween(22, 8, 22, 58);
      g.fillStyle(0xe8dec1, 1);
      g.fillTriangle(24, 10, 56, 20, 24, 30);
      g.generateTexture('ch8-truce-flag', 64, 64);
      g.destroy();
    }
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 5, this.mapWidth, 3, 'sand');
    this.paintRect(3, 3, 10, 7, 'stone');
    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
    ]);
    this.map[1][1] = 'water'; this.blockTile(1, 1);
    this.map[10][14] = 'water'; this.blockTile(14, 10);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 4, w: 3, h: 3, texture: 'ch8-shrine' });
    this.blockFootprint(6, 4, 3, 3);
  }

  protected placeDecor(): void {
    for (let x = 3; x <= 12; x++) {
      if (x !== 7 && x !== 8) this.decor.push({ gridX: x, gridY: 2, texture: 'ch8-palisade', blocks: true });
      this.decor.push({ gridX: x, gridY: 10, texture: 'ch8-palisade', blocks: true });
    }
    for (let y = 3; y <= 9; y++) {
      if (y !== 6) this.decor.push({ gridX: 3, gridY: y, texture: 'ch8-palisade', blocks: true });
      this.decor.push({ gridX: 13, gridY: y, texture: 'ch8-palisade', blocks: true });
    }
    this.decor.push({ gridX: 4, gridY: 5, texture: 'ch8-truce-flag' });
    this.decor.push({ gridX: 1, gridY: 2, texture: 'tree', blocks: true });
    this.decor.push({ gridX: 14, gridY: 3, texture: 'tree', blocks: true });
    this.decor.push({ gridX: 2, gridY: 9, texture: 'tree', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(5, 5, 'npc-merchant',
      () => 'Meet the officer under truce  [E]',
      () => this.startSimpleDialogue('ch8-truce'));
    this.addNPC(9, 6, 'npc-mulla',
      () => 'Seek Quddús’s counsel  [E]',
      () => this.startSimpleDialogue('ch8-quddus-counsel'));
    this.addNPC(10, 8, 'npc-traveller',
      () => 'Speak with the wounded witness  [E]',
      () => this.startSimpleDialogue('ch8-mulla-husayn'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch8ForestRoad',
      targetSpawnX: 16, targetSpawnY: 5,
      label: '← Back to the forest road',
    });
  }
}
