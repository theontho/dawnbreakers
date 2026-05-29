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
    this.makeCharacter('ch4-officer', 0x31424a, 0xd9c79a, 0x6f2222);
    this.makeCharacter('ch4-witness', 0x5b4936, 0xd1b37c, 0x7a5a3a);
    this.makePulpit();
    this.makePrayerArch();
    this.makeCrowd();
  }

  private makeCharacter(key: string, body: number, head: number, turban: number): void {
    if (this.textures.exists(key)) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
    g.fillStyle(turban, 1);
    g.fillEllipse(12, 7, 18, 8);
    g.fillStyle(head, 1);
    g.fillCircle(12, 11, 7);
    g.fillStyle(body, 1);
    g.fillRoundedRect(4, 17, 16, 21, 3);
    g.lineStyle(1, 0x000000, 0.55);
    g.strokeEllipse(12, 7, 18, 8);
    g.strokeCircle(12, 11, 7);
    g.strokeRoundedRect(4, 17, 16, 21, 3);
    g.generateTexture(key, 24, 40);
    g.destroy();
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
    const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
    g.fillStyle(0xb89968, 1);
    g.fillRect(8, 24, 80, 66);
    g.fillStyle(0x5d4a34, 1);
    g.fillRoundedRect(26, 38, 44, 50, 20);
    g.fillStyle(0x2a2118, 1);
    g.fillRoundedRect(34, 48, 28, 40, 14);
    g.lineStyle(2, 0x4a3320, 1);
    g.strokeRect(8, 24, 80, 66);
    g.lineStyle(1, 0xc9a55c, 0.7);
    g.lineBetween(14, 34, 82, 34);
    g.lineBetween(14, 82, 82, 82);
    g.generateTexture('ch4-prayer-arch', 96, 94);
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
