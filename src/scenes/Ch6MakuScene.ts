import { BaseMapScene } from './BaseMapScene';

export class Ch6MakuScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 11;
  protected sceneTitle = 'Mákú — Mountain Fortress';

  constructor() { super('Ch6Maku'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(0, 0, this.mapWidth, 2, 'sand');
    this.paintRect(2, 8, 6, 2, 'sand');
    this.paintRect(12, 2, 3, 3, 'sand');

    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [12, 6], [13, 6], [14, 6], [15, 6],
      [7, 5], [8, 5], [9, 5],
    ]);

    this.map[1][1] = 'water'; this.blockTile(1, 1);
    this.map[2][1] = 'water'; this.blockTile(1, 2);
    this.map[9][12] = 'water'; this.blockTile(12, 9);
    this.map[9][13] = 'water'; this.blockTile(13, 9);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 8, gridY: 2, w: 3, h: 3, texture: 'ch6-maku-fortress' });
    this.blockFootprint(8, 2, 3, 3);
  }

  protected placeDecor(): void {
    const rocks: [number, number][] = [
      [0, 3], [2, 2], [4, 1], [6, 3], [12, 1], [14, 4],
      [2, 9], [5, 9], [9, 9], [11, 8], [15, 9],
    ];
    for (const [x, y] of rocks) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-rock', blocks: true });
    }

    const shrubs: [number, number][] = [
      [3, 4], [5, 7], [13, 3], [7, 8], [14, 8],
    ];
    for (const [x, y] of shrubs) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-snow-shrub', blocks: true });
    }
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 6, 'ch6-warden',
      () => 'Speak with ʿAlí Khán  [E]',
      () => this.startSimpleDialogue('ch6-warden-softens'));

    this.addNPC(3, 7, 'ch6-courier',
      () => 'Speak with the Mountain Courier  [E]',
      () => this.startSimpleDialogue('ch6-prisoner-courier'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 15, fromY: 6, dx: 1, dy: 0,
      targetScene: 'Ch6Chihriq',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ The harsher road to Chihríq',
    });
  }

  private ensureTextures(): void {
    this.makeFortress('ch6-maku-fortress', 0x5d6870, 0x2d3740, 0x9fb0bc);
    this.makeRock('ch6-rock', 0x5b6268, 0x343b42);
    this.makeSnowShrub('ch6-snow-shrub');
    this.makePersonTexture('ch6-warden', {
      body: 0x263241,
      skin: 0xd8c7a0,
      clothing: { style: 'cloak', secondary: 0xd8dce0, accent: 0x87919a },
      hat: { style: 'tallHat', color: 0x1f252d },
      shadow: true,
    });
    this.makePersonTexture('ch6-courier', {
      body: 0x4b463f,
      skin: 0xd6c09a,
      clothing: { style: 'sash', secondary: 0xb88a3b, accent: 0xe8d8b0 },
      hat: { style: 'cap', color: 0x5f4a2d },
      shadow: true,
    });
  }

  private makeFortress(key: string, wall: number, dark: number, snow: number): void {
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(3, 3, 78, 24);
    const g = this.add.graphics();

    this.drawIsoPrism(g, geo, {
      right: wall,
      left: dark,
      top: 0x2d3740,
      edge: 0x14181c,
    });
    g.lineStyle(2, 0x14181c, 1);
    g.fillStyle(snow, 1);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.lineBetween(geo.leftR.x + 8, geo.leftR.y + 5, geo.bottomR.x, geo.bottomR.y + 5);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 5, geo.rightR.x - 8, geo.rightR.y + 5);
    g.fillStyle(dark, 1);
    g.fillPoints(this.wallInset(geo.left, geo.bottom, 0.12, 0.3, 88), true);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.68, 0.88, 92), true);
    g.strokePoints(this.wallInset(geo.left, geo.bottom, 0.12, 0.3, 88), true);
    g.strokePoints(this.wallInset(geo.right, geo.bottom, 0.68, 0.88, 92), true);
    g.fillStyle(0x13181d, 1);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.42, 0.56, 36), true);
    g.fillPoints(this.wallInset(geo.left, geo.bottom, 0.44, 0.54, 16), true);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.22, 0.32, 16), true);

    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }

  private makeRock(key: string, fill: number, edge: number): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(fill, 1);
    g.fillTriangle(6, 34, 18, 8, 31, 34);
    g.fillTriangle(17, 34, 31, 13, 43, 34);
    g.fillStyle(0x9ba9b3, 0.65);
    g.fillEllipse(24, 30, 35, 10);
    g.lineStyle(1, edge, 1);
    g.strokeTriangle(6, 34, 18, 8, 31, 34);
    g.strokeTriangle(17, 34, 31, 13, 43, 34);
    g.generateTexture(key, 48, 38);
    g.destroy();
  }

  private makeSnowShrub(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.lineStyle(2, 0x3d3328, 1);
    g.lineBetween(24, 34, 16, 18);
    g.lineBetween(24, 34, 25, 14);
    g.lineBetween(24, 34, 34, 20);
    g.fillStyle(0xb8c5cd, 0.9);
    g.fillEllipse(24, 34, 34, 11);
    g.generateTexture(key, 48, 40);
    g.destroy();
  }

}
