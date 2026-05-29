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

    const geo = this.isoPrism(3, 3, 86, 26);
    const g = this.add.graphics();

    this.drawIsoPrism(g, geo, {
      right: wall,
      left: dark,
      top: 0x1f252d,
      edge: 0x11161c,
    });
    g.lineStyle(2, 0x11161c, 1);
    g.fillStyle(snow, 1);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.lineBetween(geo.leftR.x + 8, geo.leftR.y + 6, geo.bottomR.x, geo.bottomR.y + 6);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 6, geo.rightR.x - 8, geo.rightR.y + 6);
    g.fillStyle(dark, 1);
    g.fillPoints(this.wallInset(geo.left, geo.bottom, 0.1, 0.28, 94), true);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.66, 0.88, 98), true);
    g.strokePoints(this.wallInset(geo.left, geo.bottom, 0.1, 0.28, 94), true);
    g.strokePoints(this.wallInset(geo.right, geo.bottom, 0.66, 0.88, 98), true);
    g.fillStyle(0x101418, 1);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.42, 0.56, 40), true);
    g.fillPoints(this.wallInset(geo.left, geo.bottom, 0.43, 0.53, 18), true);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.2, 0.3, 18), true);
    g.lineStyle(2, 0xb9c4cc, 0.85);
    const leftBars = this.wallInset(geo.left, geo.bottom, 0.43, 0.53, 18);
    g.lineBetween(leftBars[0].x + 3, leftBars[0].y, leftBars[3].x + 3, leftBars[3].y);
    g.lineBetween(leftBars[1].x - 3, leftBars[1].y, leftBars[2].x - 3, leftBars[2].y);

    g.generateTexture(key, geo.texW, geo.texH);
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

    const geo = this.isoPrism(1, 1, 34, 8);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, {
      right: 0x2a3038,
      left: 0x1d232a,
      top: 0x3a414a,
      edge: 0x101418,
    });
    const opening = this.wallInset(geo.right, geo.bottom, 0.28, 0.62, 22);
    g.fillStyle(0x12161b, 1);
    g.fillPoints(opening, true);
    g.lineStyle(2, 0xb9c4cc, 1);
    g.lineBetween(opening[0].x + 4, opening[0].y - 1, opening[3].x + 4, opening[3].y + 1);
    g.lineBetween(opening[1].x - 4, opening[1].y - 1, opening[2].x - 4, opening[2].y + 1);
    g.lineStyle(1, 0x101418, 1);
    g.strokePoints(opening, true);
    g.generateTexture(key, geo.texW, geo.texH);
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
