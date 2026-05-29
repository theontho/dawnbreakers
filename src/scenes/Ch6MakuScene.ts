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
    this.makeCharacter('ch6-warden', 0x263241, 0xd8c7a0);
    this.makeCharacter('ch6-courier', 0x4b463f, 0xd6c09a);
  }

  private makeFortress(key: string, wall: number, dark: number, snow: number): void {
    if (this.textures.exists(key)) return;

    const w = 150;
    const h = 132;
    const g = this.add.graphics();

    g.fillStyle(0x252b31, 1);
    g.fillTriangle(w / 2, h, 8, h - 28, w - 8, h - 28);
    g.fillStyle(wall, 1);
    g.fillRect(26, 44, 98, 70);
    g.fillStyle(dark, 1);
    g.fillRect(36, 30, 22, 84);
    g.fillRect(92, 24, 24, 90);
    g.fillStyle(snow, 1);
    g.fillRect(23, 40, 104, 8);
    g.fillRect(34, 26, 26, 7);
    g.fillRect(90, 20, 28, 7);
    g.fillStyle(0x13181d, 1);
    g.fillRect(69, 76, 18, 38);
    g.fillRect(47, 58, 10, 16);
    g.fillRect(98, 54, 10, 16);
    g.lineStyle(2, 0x14181c, 1);
    g.strokeRect(26, 44, 98, 70);
    g.strokeRect(36, 30, 22, 84);
    g.strokeRect(92, 24, 24, 90);

    g.generateTexture(key, w, h);
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

  private makeCharacter(key: string, body: number, head: number): void {
    if (this.textures.exists(key)) return;

    const w = 24;
    const h = 40;
    const g = this.add.graphics();
    g.fillStyle(body, 1);
    g.fillRoundedRect(4, 16, 16, 22, 3);
    g.fillStyle(0xd8dce0, 0.55);
    g.fillRect(4, 16, 16, 5);
    g.fillStyle(head, 1);
    g.fillCircle(w / 2, 10, 7);
    g.lineStyle(1, 0x111111, 0.7);
    g.strokeRoundedRect(4, 16, 16, 22, 3);
    g.strokeCircle(w / 2, 10, 7);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
