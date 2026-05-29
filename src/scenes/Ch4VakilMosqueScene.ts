import { BaseMapScene } from './BaseMapScene';

export class Ch4VakilMosqueScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Vakíl Mosque';

  constructor() { super('Ch4VakilMosque'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  private ensureTextures(): void {
    this.makePersonTexture('ch4-officer', {
      body: 0x31424a,
      skin: 0xd9c79a,
      clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c },
      hat: { style: 'tallHat', color: 0x6f2222 },
      shadow: true,
    });
    this.makePersonTexture('ch4-witness', {
      body: 0x5b4936,
      skin: 0xd1b37c,
      clothing: { style: 'robe', secondary: 0x7a5a3a, accent: 0xd8c7a0 },
      hat: { style: 'turban', color: 0xd8c7a0, accent: 0x7a5a3a },
      shadow: true,
    });
    this.makePulpit();
    this.makePrayerArch();
    this.makeCrowd();
  }

  private makePulpit(): void {
    if (this.textures.exists('ch4-pulpit')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
    g.fillStyle(0x7b5d39, 1);
    g.fillRect(20, 22, 22, 42);
    g.fillStyle(0x4a3320, 1);
    g.fillRect(16, 54, 30, 10);
    g.lineStyle(2, 0x2b1d12, 1);
    g.strokeRect(20, 22, 22, 42);
    g.lineBetween(20, 34, 42, 28);
    g.lineBetween(20, 46, 42, 40);
    g.fillStyle(0xc9a55c, 1);
    g.fillTriangle(31, 8, 47, 24, 15, 24);
    g.generateTexture('ch4-pulpit', 64, 68);
    g.destroy();
  }

  private makePrayerArch(): void {
    if (this.textures.exists('ch4-prayer-arch')) return;
    const geo = this.isoPrism(4, 2, 58, 18);
    const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
    this.drawIsoPrism(g, geo, {
      right: 0xb89968,
      left: 0x8f7049,
      top: 0xd0b47a,
      edge: 0x4a3320,
    });
    g.lineStyle(1, 0xc9a55c, 0.7);
    g.lineBetween(geo.leftR.x + 10, geo.leftR.y + 14, geo.bottomR.x, geo.bottomR.y + 14);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 14, geo.rightR.x - 10, geo.rightR.y + 14);
    g.lineStyle(2, 0x4a3320, 1);
    g.fillStyle(0x2a2118, 1);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.33, 0.58, 42), true);
    g.strokePoints(this.wallInset(geo.right, geo.bottom, 0.33, 0.58, 42), true);
    g.generateTexture('ch4-prayer-arch', geo.texW, geo.texH);
    g.destroy();
  }

  private makeCrowd(): void {
    if (this.textures.exists('ch4-crowd')) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
    const robes = [0x3f3328, 0x6a5030, 0x2f3b44, 0x574027];
    for (let i = 0; i < robes.length; i++) {
      const x = 8 + i * 10;
      g.fillStyle(robes[i], 1);
      g.fillRoundedRect(x - 4, 16, 8, 16, 2);
      g.fillStyle(0xd1b37c, 1);
      g.fillCircle(x, 11, 4);
    }
    g.generateTexture('ch4-crowd', 48, 34);
    g.destroy();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(2, 2, 12, 8, 'stone');
    this.paintRect(0, 5, this.mapWidth, 3, 'path');
    this.paintRect(6, 1, 4, 9, 'stone');

    for (let x = 2; x <= 13; x++) {
      this.blockTile(x, 1);
      this.blockTile(x, 10);
    }
    for (let y = 2; y <= 9; y++) {
      this.blockTile(1, y);
      this.blockTile(14, y);
    }
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 2, w: 4, h: 2, texture: 'ch4-prayer-arch' });
    this.blockFootprint(6, 2, 4, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 7, gridY: 4, texture: 'ch4-pulpit', blocks: true },
      { gridX: 5, gridY: 5, texture: 'ch4-crowd', blocks: true },
      { gridX: 10, gridY: 5, texture: 'ch4-crowd', blocks: true },
      { gridX: 4, gridY: 8, texture: 'ch4-crowd', blocks: true },
      { gridX: 11, gridY: 8, texture: 'ch4-crowd', blocks: true },
      { gridX: 2, gridY: 3, texture: 'well', blocks: true },
      { gridX: 13, gridY: 3, texture: 'tree', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(8, 4, 'ch4-crowd',
      () => 'Stand among the listening crowd  [E]',
      () => this.startSimpleDialogue('ch4-house-arrest'));

    this.addNPC(8, 7, 'ch4-witness',
      () => 'Ask the mosque witness  [E]',
      () => this.startSimpleDialogue('ch4-house-arrest'));

    this.addNPC(5, 7, 'ch4-officer',
      () => 'Hear the officer warning  [E]',
      () => this.startSimpleDialogue('ch4-officer-warning'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch4ShirazReturn',
      targetSpawnX: 14, targetSpawnY: 5,
      label: '← Back to the tense streets',
    });
  }
}
