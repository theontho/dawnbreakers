import Phaser from 'phaser';
import { BaseMapScene } from './BaseMapScene';

/** Chapter 7 — the Conference of Badasht, held among three distinct camps. */
export class Ch7BadashtCampScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 13;
  protected sceneTitle = 'Badasht — Garden Encampment';

  constructor() { super('Ch7BadashtCamp'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 8, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');

    this.paintRect(1, 1, 5, 4, 'grass');
    this.paintRect(12, 1, 5, 4, 'grass');
    this.paintRect(5, 8, 8, 4, 'grass');
    this.paintRect(7, 5, 4, 3, 'stone');

    this.paintRect(2, 3, 3, 1, 'path');
    this.paintRect(13, 3, 3, 1, 'path');
    this.paintRect(7, 9, 4, 1, 'path');

    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6],
      [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6],
      [4, 5], [5, 5], [6, 5], [11, 5], [12, 5], [13, 5],
      [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [9, 7], [9, 8], [9, 9], [9, 10],
    ]);
  }

  protected placeBuildings(): void {
    this.buildings.push(
      { gridX: 1, gridY: 2, w: 3, h: 2, texture: 'ch7-tent-reconciliation' },
      { gridX: 14, gridY: 2, w: 3, h: 2, texture: 'ch7-tent-quddus' },
      { gridX: 7, gridY: 10, w: 3, h: 2, texture: 'ch7-garden-canopy' },
    );

    this.blockFootprint(1, 2, 3, 2);
    this.blockFootprint(14, 2, 3, 2);
    this.blockFootprint(7, 10, 3, 2);
  }

  protected placeDecor(): void {
    const trees: [number, number][] = [
      [0, 1], [1, 0], [5, 1], [0, 4], [5, 4],
      [12, 0], [16, 0], [17, 2], [12, 4], [17, 5],
      [4, 9], [5, 11], [12, 9], [13, 11], [10, 12],
    ];
    for (const [x, y] of trees) this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });

    this.decor.push(
      { gridX: 4, gridY: 3, texture: 'ch7-carpet' },
      { gridX: 13, gridY: 3, texture: 'ch7-carpet' },
      { gridX: 10, gridY: 9, texture: 'ch7-carpet' },
      { gridX: 6, gridY: 8, texture: 'ch7-lamp' },
      { gridX: 11, gridY: 8, texture: 'ch7-lamp' },
      { gridX: 6, gridY: 11, texture: 'ch7-rosebush', blocks: true },
      { gridX: 11, gridY: 11, texture: 'ch7-rosebush', blocks: true },
      { gridX: 3, gridY: 1, texture: 'ch7-lamp' },
      { gridX: 15, gridY: 1, texture: 'ch7-lamp' },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(8, 9, 'ch7-npc-tahirih',
      () => 'Speak with Ṭáhirih  [E]',
      () => this.startSimpleDialogue('ch7-unveiling'));

    this.addNPC(13, 5, 'ch7-npc-quddus',
      () => 'Speak with Quddús  [E]',
      () => this.startSimpleDialogue('ch7-quddus-tension'));

    this.addNPC(5, 5, 'ch7-lamp',
      () => 'Listen at the central tent  [E]',
      () => this.startSimpleDialogue('ch7-bahaullah-reconcile'));

    this.addNPC(9, 5, 'ch7-npc-believer',
      () => 'Speak with a shaken believer  [E]',
      () => this.startSimpleDialogue('ch7-shaken-believer'));
  }

  protected setupExits(): void {
    // The chapter selector and manager own inter-chapter travel for this scene.
  }

  private ensureTextures(): void {
    this.makeTent('ch7-tent-reconciliation', 0x3f4f70, 0xd8b56a);
    this.makeTent('ch7-tent-quddus', 0x48613e, 0xc9a55c);
    this.makeCanopy();
    this.makeCarpet();
    this.makeLamp();
    this.makeRosebush();
    this.makePersonTexture('ch7-npc-tahirih', {
      body: 0xf0d9a4,
      skin: 0xd8b98a,
      clothing: { style: 'cloak', secondary: 0x6f3b5c, accent: 0xf7ecd0 },
      hat: { style: 'veil', color: 0xf7ecd0, accent: 0x6f3b5c },
      shadow: true,
    });
    this.makePersonTexture('ch7-npc-quddus', {
      body: 0x506b45,
      skin: 0xe0c38a,
      clothing: { style: 'robe', secondary: 0x2f3b2f, accent: 0xc9a55c },
      hat: { style: 'turban', color: 0xe0c38a, accent: 0x506b45 },
      shadow: true,
    });
    this.makePersonTexture('ch7-npc-believer', {
      body: 0x8a6f4d,
      skin: 0xd6c0a0,
      clothing: { style: 'sash', secondary: 0x5b4632, accent: 0xd6c0a0 },
      hat: { style: 'headscarf', color: 0xd6c0a0 },
      shadow: true,
    });
  }

  private makeTent(key: string, cloth: number, trim: number): void {
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(3, 2, 0, 58);
    const peak = { x: geo.bottom.x, y: geo.top.y - 48 };
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.2);
    g.fillPoints([geo.top, geo.right, geo.bottom, geo.left], true);
    g.fillStyle(cloth, 1);
    g.fillPoints([geo.left, peak, geo.bottom], true);
    g.fillStyle(Phaser.Display.Color.IntegerToColor(cloth).darken(18).color, 1);
    g.fillPoints([geo.right, peak, geo.bottom], true);
    g.fillStyle(0xead8aa, 1);
    g.fillPoints([geo.bottom, peak, {
      x: geo.bottom.x + (geo.right.x - geo.bottom.x) * 0.28,
      y: geo.bottom.y + (geo.right.y - geo.bottom.y) * 0.28,
    }], true);
    g.fillStyle(0x241d1c, 0.65);
    g.fillPoints([geo.bottom, {
      x: geo.bottom.x - 12,
      y: geo.bottom.y - 30,
    }, {
      x: geo.bottom.x + 12,
      y: geo.bottom.y - 30,
    }], true);
    g.lineStyle(3, trim, 1);
    g.strokePoints([geo.left, peak, geo.right, geo.bottom], true);
    g.lineBetween(peak.x, peak.y, geo.bottom.x, geo.bottom.y);
    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }

  private makeCanopy(): void {
    const key = 'ch7-garden-canopy';
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(3, 2, 0, 60);
    const peak = { x: geo.bottom.x, y: geo.top.y - 34 };
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillPoints([geo.top, geo.right, geo.bottom, geo.left], true);
    g.lineStyle(4, 0x7b5a37, 1);
    g.lineBetween(geo.left.x + 10, geo.left.y - 2, geo.left.x + 10, geo.left.y + 46);
    g.lineBetween(geo.right.x - 10, geo.right.y - 2, geo.right.x - 10, geo.right.y + 46);
    g.fillStyle(0x8d3f42, 1);
    g.fillPoints([geo.left, peak, geo.bottom], true);
    g.fillStyle(0x6f3134, 1);
    g.fillPoints([geo.right, peak, geo.bottom], true);
    g.fillStyle(0xc9a55c, 1);
    g.lineStyle(3, 0xc9a55c, 1);
    g.lineBetween(geo.left.x, geo.left.y, peak.x, peak.y);
    g.lineBetween(peak.x, peak.y, geo.right.x, geo.right.y);
    g.fillStyle(0x4f6f46, 1);
    g.fillPoints([
      { x: geo.bottom.x - 26, y: geo.bottom.y - 18 },
      { x: geo.bottom.x + 18, y: geo.bottom.y - 8 },
      { x: geo.bottom.x + 4, y: geo.bottom.y },
      { x: geo.bottom.x - 38, y: geo.bottom.y - 9 },
    ], true);
    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }

  private makeCarpet(): void {
    const key = 'ch7-carpet';
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x7e2e2e, 1);
    g.fillPoints([
      { x: 32, y: 8 },
      { x: 60, y: 22 },
      { x: 32, y: 36 },
      { x: 4, y: 22 },
    ], true);
    g.lineStyle(2, 0xd8b56a, 1);
    g.strokePoints([
      { x: 32, y: 8 },
      { x: 60, y: 22 },
      { x: 32, y: 36 },
      { x: 4, y: 22 },
    ], true);
    g.strokeEllipse(32, 22, 30, 12);
    g.generateTexture(key, 64, 40);
    g.destroy();
  }

  private makeLamp(): void {
    const key = 'ch7-lamp';
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.lineStyle(3, 0x4b3928, 1);
    g.lineBetween(16, 16, 16, 44);
    g.fillStyle(0xf3d98a, 0.8);
    g.fillCircle(16, 14, 8);
    g.lineStyle(2, 0xc9a55c, 1);
    g.strokeCircle(16, 14, 9);
    g.generateTexture(key, 32, 48);
    g.destroy();
  }

  private makeRosebush(): void {
    const key = 'ch7-rosebush';
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x3d6a3c, 1);
    g.fillCircle(18, 22, 13);
    g.fillCircle(30, 20, 12);
    g.fillCircle(24, 12, 11);
    g.fillStyle(0xc55c71, 1);
    g.fillCircle(18, 14, 3);
    g.fillCircle(30, 16, 3);
    g.fillCircle(24, 25, 3);
    g.generateTexture(key, 48, 40);
    g.destroy();
  }

}
