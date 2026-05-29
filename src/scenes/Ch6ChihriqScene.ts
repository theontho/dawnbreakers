import { BaseMapScene } from './BaseMapScene';

export class Ch6ChihriqScene extends BaseMapScene {
  protected mapWidth = 17;
  protected mapHeight = 12;
  protected sceneTitle = 'Chihríq — the Grievous Mountain';

  constructor() { super('Ch6Chihriq'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(0, 0, 5, 3, 'sand');
    this.paintRect(10, 1, 5, 2, 'sand');
    this.paintRect(12, 8, 4, 3, 'sand');

    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [12, 6], [13, 6],
      [13, 7], [13, 8], [12, 8], [11, 8],
    ]);

    this.map[9][2] = 'water'; this.blockTile(2, 9);
    this.map[10][2] = 'water'; this.blockTile(2, 10);
    this.map[10][3] = 'water'; this.blockTile(3, 10);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 10, gridY: 3, w: 3, h: 3, texture: 'ch6-chihriq-fortress' });
    this.blockFootprint(10, 3, 3, 3);
  }

  protected placeDecor(): void {
    const rocks: [number, number][] = [
      [1, 2], [4, 1], [7, 2], [15, 2], [3, 8], [6, 9],
      [8, 10], [14, 10], [16, 7], [15, 5],
    ];
    for (const [x, y] of rocks) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-rock', blocks: true });
    }

    const stakes: [number, number][] = [
      [9, 4], [13, 4], [10, 7], [14, 6],
    ];
    for (const [x, y] of stakes) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-barred-marker', blocks: true });
    }
  }

  protected spawnNPCs(): void {
    this.addNPC(5, 6, 'ch6-mulla-husayn',
      () => 'Speak with Mullá Ḥusayn  [E]',
      () => this.startSimpleDialogue('ch6-mulla-husayn-visit'));

    this.addNPC(12, 7, 'ch6-writing-desk',
      () => 'Read at the writing desk  [E]',
      () => this.startSimpleDialogue('ch6-bayan'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch6Maku',
      targetSpawnX: 14, targetSpawnY: 6,
      label: '← Back toward Mákú',
    });
  }

  private ensureTextures(): void {
    this.makeFortress('ch6-chihriq-fortress', 0x4b525b, 0x1f252d, 0xaebbc4);
    this.makeRock('ch6-rock', 0x565d65, 0x2f353d);
    this.makeBarredMarker('ch6-barred-marker');
    this.makeCharacter('ch6-mulla-husayn', 0x22211f, 0xe2d1aa);
    this.makeWritingDesk('ch6-writing-desk');
  }

  private makeFortress(key: string, wall: number, dark: number, snow: number): void {
    if (this.textures.exists(key)) return;

    const w = 160;
    const h = 140;
    const g = this.add.graphics();

    g.fillStyle(0x20252b, 1);
    g.fillTriangle(w / 2, h, 10, h - 24, w - 10, h - 24);
    g.fillStyle(wall, 1);
    g.fillRect(26, 48, 108, 70);
    g.fillStyle(dark, 1);
    g.fillRect(32, 34, 26, 84);
    g.fillRect(103, 28, 28, 90);
    g.fillStyle(snow, 1);
    g.fillRect(24, 44, 112, 7);
    g.fillRect(30, 30, 30, 7);
    g.fillRect(101, 24, 32, 7);
    g.fillStyle(0x101418, 1);
    g.fillRect(72, 76, 20, 42);
    g.fillRect(45, 57, 12, 17);
    g.fillRect(108, 55, 12, 18);
    g.lineStyle(2, 0xb9c4cc, 0.85);
    g.lineBetween(48, 57, 48, 74);
    g.lineBetween(53, 57, 53, 74);
    g.lineBetween(111, 55, 111, 73);
    g.lineBetween(116, 55, 116, 73);
    g.lineStyle(2, 0x11161c, 1);
    g.strokeRect(26, 48, 108, 70);
    g.strokeRect(32, 34, 26, 84);
    g.strokeRect(103, 28, 28, 90);

    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeRock(key: string, fill: number, edge: number): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.fillTriangle(6, 34, 18, 8, 31, 34);
    g.fillTriangle(17, 34, 31, 13, 43, 34);
    g.fillStyle(0xa7b2bb, 0.6);
    g.fillEllipse(24, 30, 35, 10);
    g.lineStyle(1, edge, 1);
    g.strokeTriangle(6, 34, 18, 8, 31, 34);
    g.strokeTriangle(17, 34, 31, 13, 43, 34);
    g.generateTexture(key, 48, 38);
    g.destroy();
  }

  private makeBarredMarker(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x2a3038, 1);
    g.fillRect(14, 12, 20, 34);
    g.fillStyle(0x12161b, 1);
    g.fillRect(17, 17, 14, 18);
    g.lineStyle(2, 0xb9c4cc, 1);
    g.lineBetween(20, 17, 20, 35);
    g.lineBetween(25, 17, 25, 35);
    g.lineStyle(1, 0x101418, 1);
    g.strokeRect(14, 12, 20, 34);
    g.generateTexture(key, 48, 52);
    g.destroy();
  }

  private makeWritingDesk(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x463424, 1);
    g.fillEllipse(28, 32, 46, 18);
    g.fillStyle(0xd8cfb7, 1);
    g.fillRect(17, 21, 22, 13);
    g.lineStyle(1, 0x2a1a0f, 1);
    g.strokeEllipse(28, 32, 46, 18);
    g.strokeRect(17, 21, 22, 13);
    g.lineStyle(1, 0x6f6048, 1);
    g.lineBetween(21, 25, 35, 25);
    g.lineBetween(21, 29, 35, 29);
    g.generateTexture(key, 56, 44);
    g.destroy();
  }

  private makeCharacter(key: string, body: number, head: number): void {
    if (this.textures.exists(key)) return;

    const w = 24;
    const h = 40;
    const g = this.add.graphics();
    g.fillStyle(body, 1);
    g.fillRoundedRect(4, 16, 16, 22, 3);
    g.fillStyle(0xe8e5dc, 0.8);
    g.fillRect(4, 16, 16, 6);
    g.fillStyle(head, 1);
    g.fillCircle(w / 2, 10, 7);
    g.lineStyle(1, 0x111111, 0.7);
    g.strokeRoundedRect(4, 16, 16, 22, 3);
    g.strokeCircle(w / 2, 10, 7);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
