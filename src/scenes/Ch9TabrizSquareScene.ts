import { BaseMapScene } from './BaseMapScene';

export class Ch9TabrizSquareScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 12;
  protected sceneTitle = 'Tabríz — the Public Square';

  constructor() { super('Ch9TabrizSquare'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 2, y: 7 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(2, 2, 14, 8, 'stone');

    for (let x = 0; x < this.mapWidth; x++) this.map[7][x] = 'path';
    for (let y = 1; y < this.mapHeight; y++) this.map[y][9] = 'path';

    this.paintRect(4, 4, 4, 2, 'stone');
    this.paintRect(11, 4, 3, 2, 'stone');
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 12, gridY: 1, w: 3, h: 2, texture: 'ch9-barrack-front' });
    this.blockFootprint(12, 1, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 1, gridY: 2, texture: 'cypress', blocks: true },
      { gridX: 16, gridY: 2, texture: 'cypress', blocks: true },
      { gridX: 3, gridY: 3, texture: 'lamp', blocks: true },
      { gridX: 15, gridY: 8, texture: 'lamp', blocks: true },
      { gridX: 5, gridY: 4, texture: 'crowd-shadow' },
      { gridX: 6, gridY: 5, texture: 'crowd-shadow' },
      { gridX: 12, gridY: 5, texture: 'crowd-shadow' },
      { gridX: 13, gridY: 6, texture: 'crowd-shadow' },
      { gridX: 4, gridY: 9, texture: 'ch9-cloth-bundle', blocks: true },
      { gridX: 10, gridY: 10, texture: 'ch9-cloth-bundle', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 6, 'ch9-witness',
      () => 'Speak with the crowd witness  [E]',
      () => this.startSimpleDialogue('ch9-crowd-witness'));

    this.addNPC(14, 7, 'ch9-soldier',
      () => 'Speak with a soldier  [E]',
      () => this.startSimpleDialogue('ch9-crowd-witness'));

    this.addNPC(6, 9, 'ch9-final-witness',
      () => 'Speak with the final witness  [E]',
      () => this.startSimpleDialogue('ch9-final-witness'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 17, fromY: 7, dx: 1, dy: 0,
      targetScene: 'Ch9BarrackRoof',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ The barrack stair',
    });
  }

  private ensureTextures(): void {
    this.makePersonTexture('ch9-witness', {
      body: 0x4b3b34,
      skin: 0xd8c6a0,
      clothing: { style: 'vest', secondary: 0x7a5a3a, accent: 0xd8c7a0 },
      hat: { style: 'cap', color: 0x7a5a3a },
      shadow: true,
    });
    this.makePersonTexture('ch9-soldier', {
      body: 0x4c5360,
      skin: 0xd6c09a,
      clothing: { style: 'uniform', secondary: 0x2e3742, accent: 0xc9a55c },
      hat: { style: 'tallHat', color: 0x2e3742 },
      shadow: true,
    });
    this.makePersonTexture('ch9-final-witness', {
      body: 0x2f2b2a,
      skin: 0xcdbb94,
      clothing: { style: 'cloak', secondary: 0x1f1b1a, accent: 0x8a7450 },
      hat: { style: 'hood', color: 0x1f1b1a },
      shadow: true,
    });
    this.makeCypress('cypress');
    this.makeLamp('lamp');
    this.makeCrowdShadow('crowd-shadow');
    this.makeBundle('ch9-cloth-bundle');
    this.makeBarrackFront('ch9-barrack-front');
  }


  private makeCypress(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x253b2b, 1);
    g.fillTriangle(28, 8, 10, 68, 46, 68);
    g.fillTriangle(28, 0, 14, 45, 42, 45);
    g.fillStyle(0x3a2518, 1);
    g.fillRect(24, 64, 8, 14);
    g.lineStyle(1, 0x0f1510, 0.7);
    g.strokeTriangle(28, 8, 10, 68, 46, 68);
    g.generateTexture(key, 56, 80);
    g.destroy();
  }

  private makeLamp(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x1d1712, 0.25);
    g.fillEllipse(24, 57, 26, 10);
    g.fillStyle(0x5b4128, 1);
    g.fillPoints([
      { x: 24, y: 50 },
      { x: 34, y: 55 },
      { x: 24, y: 60 },
      { x: 14, y: 55 },
    ], true);
    g.fillStyle(0x3a2a1b, 1);
    g.fillRect(21, 16, 6, 42);
    g.fillPoints([
      { x: 12, y: 15 },
      { x: 24, y: 10 },
      { x: 36, y: 15 },
      { x: 24, y: 20 },
    ], true);
    g.fillStyle(0xc9a55c, 0.8);
    g.fillCircle(24, 12, 7);
    g.lineStyle(1, 0x1a120a, 0.8);
    g.strokeCircle(24, 12, 7);
    g.generateTexture(key, 48, 60);
    g.destroy();
  }

  private makeCrowdShadow(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x1d1a18, 0.72);
    g.fillEllipse(18, 34, 14, 12);
    g.fillEllipse(32, 32, 14, 12);
    g.fillEllipse(25, 24, 18, 14);
    g.fillRect(12, 24, 26, 16);
    g.generateTexture(key, 50, 44);
    g.destroy();
  }

  private makeBundle(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x1d1712, 0.25);
    g.fillEllipse(26, 38, 38, 12);
    g.fillStyle(0x4d3a31, 1);
    g.fillPoints([
      { x: 8, y: 27 },
      { x: 26, y: 36 },
      { x: 44, y: 27 },
      { x: 44, y: 35 },
      { x: 26, y: 44 },
      { x: 8, y: 35 },
    ], true);
    g.fillStyle(0x7b604e, 1);
    g.fillPoints([
      { x: 26, y: 14 },
      { x: 48, y: 27 },
      { x: 26, y: 39 },
      { x: 4, y: 27 },
    ], true);
    g.lineStyle(1, 0x2b211b, 0.8);
    g.strokePoints([
      { x: 26, y: 14 },
      { x: 48, y: 27 },
      { x: 26, y: 39 },
      { x: 4, y: 27 },
    ], true);
    g.lineBetween(8, 27, 44, 27);
    g.lineBetween(18, 20, 36, 34);
    g.generateTexture(key, 52, 46);
    g.destroy();
  }

  private makeBarrackFront(key: string): void {
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(3, 2, 76, 18);
    const g = this.add.graphics();
    g.lineStyle(2, 0x1d1712, 0.85);

    g.fillStyle(0x766a5a, 1);
    g.fillPoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);
    g.strokePoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);

    g.fillStyle(0x5b5045, 1);
    g.fillPoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);

    g.fillStyle(0x4f473d, 1);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.lineStyle(1, 0x2a241f, 0.7);
    g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
    g.lineBetween(geo.leftR.x, geo.leftR.y, geo.rightR.x, geo.rightR.y);

    g.lineStyle(1, 0x1d1712, 0.9);
    g.fillStyle(0x2b2622, 1);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.35, 0.5, 42), true);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.68, 0.82, 30), true);
    g.fillStyle(0x24201d, 1);
    g.fillPoints(this.wallInset(geo.left, geo.bottom, 0.2, 0.34, 28), true);
    g.strokePoints(this.wallInset(geo.right, geo.bottom, 0.35, 0.5, 42), true);
    g.strokePoints(this.wallInset(geo.right, geo.bottom, 0.68, 0.82, 30), true);
    g.strokePoints(this.wallInset(geo.left, geo.bottom, 0.2, 0.34, 28), true);

    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }
}
