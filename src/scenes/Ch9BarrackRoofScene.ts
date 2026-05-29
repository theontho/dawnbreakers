import { BaseMapScene } from './BaseMapScene';

export class Ch9BarrackRoofScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 10;
  protected sceneTitle = 'Tabríz — the Barrack Roof';

  constructor() { super('Ch9BarrackRoof'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(0, 6, 4, 2, 'path');
    this.paintRect(9, 3, 4, 3, 'sand');

    for (let x = 2; x < this.mapWidth; x++) {
      this.blockTile(x, 0);
      if (x !== 7 && x !== 8) this.blockTile(x, 9);
    }
    for (let y = 1; y < this.mapHeight - 1; y++) {
      this.blockTile(15, y);
    }
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 5, gridY: 1, w: 4, h: 1, texture: 'ch9-roof-parapet' });
    this.blockFootprint(5, 1, 4, 1);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 10, gridY: 4, texture: 'ch9-rope-coils', blocks: true },
      { gridX: 12, gridY: 4, texture: 'ch9-rope-coils', blocks: true },
      { gridX: 3, gridY: 2, texture: 'ch9-lamp', blocks: true },
      { gridX: 13, gridY: 7, texture: 'ch9-lamp', blocks: true },
      { gridX: 6, gridY: 8, texture: 'ch9-empty-space' },
      { gridX: 8, gridY: 8, texture: 'ch9-empty-space' },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 5, 'ch9-sam-khan',
      () => 'Speak with Sám Khán  [E]',
      () => this.startSimpleDialogue('ch9-sam-khan'));

    this.addNPC(5, 6, 'ch9-soldier',
      () => 'Speak with the waiting soldier  [E]',
      () => this.startSimpleDialogue('ch9-crowd-witness'));

    this.addNPC(11, 5, 'ch9-bab-anis',
      () => 'Stand in solemn witness  [E]',
      () => this.startSimpleDialogue('ch9-final-witness'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch9TabrizSquare',
      targetSpawnX: 16, targetSpawnY: 7,
      label: '← Back to the square',
    });
  }

  private ensureTextures(): void {
    this.makeCharacter('ch9-sam-khan', 0x59606a, 0xd8c6a0);
    this.makeCharacter('ch9-soldier', 0x4c5360, 0xd6c09a);
    this.makePairedFigures('ch9-bab-anis');
    this.makeLamp('ch9-lamp');
    this.makeRopes('ch9-rope-coils');
    this.makeEmptySpace('ch9-empty-space');
    this.makeRoofParapet('ch9-roof-parapet');
  }

  private makeCharacter(key: string, body: number, head: number): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(body, 1);
    g.fillRoundedRect(4, 16, 16, 22, 3);
    g.fillStyle(head, 1);
    g.fillCircle(12, 10, 7);
    g.lineStyle(1, 0x111111, 0.55);
    g.strokeRoundedRect(4, 16, 16, 22, 3);
    g.strokeCircle(12, 10, 7);
    g.generateTexture(key, 24, 40);
    g.destroy();
  }

  private makePairedFigures(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0xefe3c5, 1);
    g.fillRoundedRect(6, 18, 13, 24, 3);
    g.fillRoundedRect(25, 19, 13, 23, 3);
    g.fillStyle(0xd8c6a0, 1);
    g.fillCircle(12, 11, 6);
    g.fillCircle(31, 12, 6);
    g.lineStyle(1, 0x2a2118, 0.45);
    g.strokeRoundedRect(6, 18, 13, 24, 3);
    g.strokeRoundedRect(25, 19, 13, 23, 3);
    g.generateTexture(key, 44, 46);
    g.destroy();
  }

  private makeLamp(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x3a2a1b, 1);
    g.fillRect(21, 16, 6, 42);
    g.fillRect(13, 14, 22, 5);
    g.fillStyle(0xc9a55c, 0.8);
    g.fillCircle(24, 12, 7);
    g.lineStyle(1, 0x1a120a, 0.8);
    g.strokeCircle(24, 12, 7);
    g.generateTexture(key, 48, 60);
    g.destroy();
  }

  private makeRopes(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.lineStyle(3, 0xbca06d, 1);
    g.strokeCircle(20, 24, 10);
    g.strokeCircle(30, 26, 9);
    g.lineBetween(10, 34, 42, 18);
    g.lineStyle(1, 0x5a4630, 0.8);
    g.strokeCircle(20, 24, 10);
    g.strokeCircle(30, 26, 9);
    g.generateTexture(key, 52, 44);
    g.destroy();
  }

  private makeEmptySpace(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.lineStyle(1, 0x2b2622, 0.35);
    g.strokeEllipse(32, 22, 44, 14);
    g.generateTexture(key, 64, 40);
    g.destroy();
  }

  private makeRoofParapet(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x5e574d, 1);
    g.fillRect(10, 24, 172, 30);
    g.fillStyle(0x403a33, 1);
    g.fillRect(4, 12, 184, 18);
    g.lineStyle(2, 0x1f1a16, 0.85);
    g.strokeRect(10, 24, 172, 30);
    g.strokeRect(4, 12, 184, 18);
    g.generateTexture(key, 192, 64);
    g.destroy();
  }
}
