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
    this.buildings.push(
      { gridX: 2, gridY: 0, w: 14, h: 1, texture: 'ch9-roof-north-wall' },
      { gridX: 15, gridY: 1, w: 1, h: 8, texture: 'ch9-roof-east-wall' },
      { gridX: 2, gridY: 9, w: 5, h: 1, texture: 'ch9-roof-south-wall-left' },
      { gridX: 9, gridY: 9, w: 7, h: 1, texture: 'ch9-roof-south-wall-right' },
      { gridX: 5, gridY: 1, w: 4, h: 1, texture: 'ch9-roof-parapet' },
    );
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

    this.addNPC(11, 5, 'ch9-empty-space',
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
    this.makePersonTexture('ch9-sam-khan', {
      body: 0x59606a,
      skin: 0xd8c6a0,
      clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c },
      hat: { style: 'tallHat', color: 0x3b4048, accent: 0xc9a55c },
      shadow: true,
    });
    this.makePersonTexture('ch9-soldier', {
      body: 0x4c5360,
      skin: 0xd6c09a,
      clothing: { style: 'uniform', secondary: 0x2e3742, accent: 0xc9a55c },
      hat: { style: 'tallHat', color: 0x2e3742 },
      shadow: true,
    });
    this.makeLamp('ch9-lamp');
    this.makeRopes('ch9-rope-coils');
    this.makeEmptySpace('ch9-empty-space');
    this.makeRoofParapet('ch9-roof-parapet', 4, 1, 30);
    this.makeRoofParapet('ch9-roof-north-wall', 14, 1, 24);
    this.makeRoofParapet('ch9-roof-east-wall', 1, 8, 24);
    this.makeRoofParapet('ch9-roof-south-wall-left', 5, 1, 24);
    this.makeRoofParapet('ch9-roof-south-wall-right', 7, 1, 24);
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

  private makeRopes(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.lineStyle(3, 0xbca06d, 1);
    g.strokeEllipse(19, 25, 22, 10);
    g.strokeEllipse(32, 27, 20, 9);
    g.lineBetween(10, 34, 42, 18);
    g.lineBetween(14, 29, 44, 24);
    g.lineStyle(1, 0x5a4630, 0.8);
    g.strokeEllipse(19, 25, 22, 10);
    g.strokeEllipse(32, 27, 20, 9);
    g.generateTexture(key, 52, 44);
    g.destroy();
  }

  private makeEmptySpace(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x1b1714, 0.28);
    g.fillPoints([
      { x: 32, y: 10 },
      { x: 58, y: 22 },
      { x: 32, y: 34 },
      { x: 6, y: 22 },
    ], true);
    g.lineStyle(1, 0x2b2622, 0.45);
    g.strokePoints([
      { x: 32, y: 10 },
      { x: 58, y: 22 },
      { x: 32, y: 34 },
      { x: 6, y: 22 },
    ], true);
    g.lineBetween(14, 22, 50, 22);
    g.lineBetween(32, 12, 32, 32);
    g.generateTexture(key, 64, 40);
    g.destroy();
  }

  private makeRoofParapet(key: string, widthCells: number, heightCells: number, wallH: number): void {
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(widthCells, heightCells, wallH, 8);
    const g = this.add.graphics();
    g.lineStyle(2, 0x1f1a16, 0.85);

    g.fillStyle(0x5e574d, 1);
    g.fillPoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);
    g.strokePoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);

    g.fillStyle(0x484139, 1);
    g.fillPoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);

    g.fillStyle(0x403a33, 1);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.lineStyle(1, 0x2d2823, 0.7);
    g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
    g.lineBetween(geo.leftR.x, geo.leftR.y, geo.rightR.x, geo.rightR.y);

    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }
}
