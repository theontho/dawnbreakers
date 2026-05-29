import { BaseMapScene } from './BaseMapScene';

export class Ch5MutamidPalaceScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 14;
  protected sceneTitle = 'Iṣfahán — the Muʿtamid\'s Sanctuary';

  constructor() { super('Ch5MutamidPalace'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 7 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(3, 4, 12, 7, 'stone');
    this.paintRect(5, 6, 7, 3, 'sand');
    this.paintPath([[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7]]);

    this.map[6][4] = 'water';
    this.map[7][4] = 'water';
    this.blockTile(4, 6);
    this.blockTile(4, 7);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 1, w: 5, h: 3, texture: 'ch5-palace-portico' });
    this.blockFootprint(6, 1, 5, 3);
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 8, gridY: 6, texture: 'ch5-courtyard-carpet' });

    const cypresses: [number, number][] = [[2, 4], [15, 4], [3, 11], [14, 11]];
    for (const [x, y] of cypresses) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch5-cypress', blocks: true });
    }

    this.decor.push({ gridX: 12, gridY: 5, texture: 'well', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 6, 'npc-merchant',
      () => 'Speak with Manúchihr Khán  [E]',
      () => this.startSimpleDialogue('ch5-mutamid'));

    this.addNPC(5, 6, 'npc-mulla',
      () => 'Speak with the Imám-Jumʿih  [E]',
      () => this.startSimpleDialogue('ch5-cleric-question'));

    this.addNPC(10, 7, 'ch5-writing-desk',
      () => 'Read beside the revealed treatise  [E]',
      () => this.startSimpleDialogue('ch5-treatise'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 7, dx: -1, dy: 0,
      targetScene: 'Ch5IsfahanBridge',
      targetSpawnX: 18, targetSpawnY: 5,
      label: '← Return to the bridge',
    });
  }

  private ensureTextures(): void {
    if (!this.textures.exists('ch5-palace-portico')) {
      const g = this.add.graphics();
      g.lineStyle(2, 0x2a1a0a, 1);
      g.fillStyle(0x9b7a4d, 1);
      g.fillRect(20, 70, 280, 72);
      g.fillStyle(0x6f5435, 1);
      g.fillRect(20, 132, 280, 26);
      g.fillStyle(0xc8b27a, 1);
      for (let x = 50; x <= 250; x += 50) {
        g.fillRect(x, 78, 14, 76);
        g.strokeRect(x, 78, 14, 76);
      }
      g.fillStyle(0x315f68, 1);
      g.fillTriangle(8, 72, 160, 18, 312, 72);
      g.fillStyle(0xc9a55c, 1);
      g.fillCircle(160, 28, 10);
      g.strokeTriangle(8, 72, 160, 18, 312, 72);
      g.fillStyle(0x2a1a0a, 1);
      g.fillRect(142, 104, 36, 54);
      g.generateTexture('ch5-palace-portico', 320, 168);
      g.destroy();
    }

    if (!this.textures.exists('ch5-courtyard-carpet')) {
      const g = this.add.graphics();
      g.lineStyle(1, 0x2a1a0a, 1);
      g.fillStyle(0x7a2636, 1);
      g.beginPath();
      g.moveTo(48, 0);
      g.lineTo(96, 24);
      g.lineTo(48, 48);
      g.lineTo(0, 24);
      g.closePath();
      g.fillPath();
      g.strokePath();
      g.lineStyle(2, 0xc9a55c, 1);
      g.strokeEllipse(48, 24, 54, 20);
      g.generateTexture('ch5-courtyard-carpet', 96, 48);
      g.destroy();
    }

    if (!this.textures.exists('ch5-writing-desk')) {
      const g = this.add.graphics();
      g.lineStyle(1, 0x2a1a0a, 1);
      g.fillStyle(0x5a3b22, 1);
      g.fillRect(8, 24, 52, 18);
      g.strokeRect(8, 24, 52, 18);
      g.fillStyle(0xe6d8b0, 1);
      g.fillRect(18, 14, 30, 15);
      g.strokeRect(18, 14, 30, 15);
      g.lineStyle(2, 0x1a1a1a, 1);
      g.lineBetween(25, 18, 43, 18);
      g.lineBetween(25, 23, 43, 23);
      g.generateTexture('ch5-writing-desk', 68, 46);
      g.destroy();
    }

    if (!this.textures.exists('ch5-cypress')) {
      const g = this.add.graphics();
      g.fillStyle(0x4a2e18, 1);
      g.fillRect(26, 58, 6, 20);
      g.fillStyle(0x23452f, 1);
      g.fillTriangle(29, 4, 10, 64, 48, 64);
      g.fillStyle(0x2f6040, 1);
      g.fillTriangle(29, 16, 15, 54, 43, 54);
      g.generateTexture('ch5-cypress', 58, 82);
      g.destroy();
    }
  }
}
