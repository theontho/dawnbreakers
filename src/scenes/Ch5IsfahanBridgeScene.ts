import { BaseMapScene } from './BaseMapScene';

export class Ch5IsfahanBridgeScene extends BaseMapScene {
  protected mapWidth = 20;
  protected mapHeight = 12;
  protected sceneTitle = 'Iṣfahán — Bridge of Arrival';

  constructor() { super('Ch5IsfahanBridge'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 7 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(12, 0, 8, 5, 'stone');
    this.paintRect(0, 8, 7, 4, 'grass');

    for (let x = 0; x < this.mapWidth; x++) {
      this.map[5][x] = 'water';
      this.map[6][x] = 'water';
      this.blockTile(x, 5);
      this.blockTile(x, 6);
    }

    this.paintRect(8, 5, 5, 2, 'stone');
    for (let x = 8; x <= 12; x++) {
      this.blocked[5][x] = false;
      this.blocked[6][x] = false;
    }

    this.paintPath([
      [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7],
      [8, 6], [9, 6], [10, 6], [11, 6], [12, 6],
      [12, 5], [12, 4], [13, 4], [14, 4], [15, 4], [16, 4], [17, 4],
      [18, 4], [19, 4], [19, 5],
    ]);

    this.map[4][3] = 'water';
    this.blockTile(3, 4);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 8, gridY: 5, w: 5, h: 2, texture: 'ch5-bridge-span' });

    this.buildings.push({ gridX: 15, gridY: 1, w: 1, h: 1, texture: 'gate' });
    this.blockFootprint(15, 1, 1, 1);

    this.buildings.push({ gridX: 3, gridY: 8, w: 1, h: 1, texture: 'ch5-market-awning' });
    this.blockFootprint(3, 8, 1, 1);
  }

  protected placeDecor(): void {
    const reeds: [number, number][] = [[2, 5], [6, 6], [14, 5], [17, 6], [4, 4]];
    for (const [x, y] of reeds) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch5-river-reeds', blocks: true });
    }

    const trees: [number, number][] = [[0, 10], [2, 10], [6, 10], [14, 2], [18, 2]];
    for (const [x, y] of trees) {
      this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });
    }

    this.decor.push({ gridX: 5, gridY: 8, texture: 'well', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(6, 7, 'npc-merchant',
      () => 'Speak with a Market Visitor  [E]',
      () => this.startSimpleDialogue('ch5-arrival'));

    this.addNPC(13, 4, 'npc-mulla',
      () => 'Speak with the Learned Cleric  [E]',
      () => this.startSimpleDialogue('ch5-cleric-question'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 19, fromY: 5, dx: 1, dy: 0,
      targetScene: 'Ch5MutamidPalace',
      targetSpawnX: 1, targetSpawnY: 7,
      label: '→ Go to the Muʿtamid\'s palace',
    });
  }

  private ensureTextures(): void {
    if (!this.textures.exists('ch5-bridge-span')) {
      const geo = this.isoPrism(5, 2, 18, 16);
      const g = this.add.graphics();
      this.drawIsoPrism(g, geo, {
        right: 0x8a7552,
        left: 0x5e4b36,
        top: 0xb9a16e,
        edge: 0x3e2c1c,
      });
      g.lineStyle(3, 0xd0bb82, 1);
      g.lineBetween(geo.leftR.x + 8, geo.leftR.y - 8, geo.bottomR.x, geo.bottomR.y - 8);
      g.lineBetween(geo.bottomR.x, geo.bottomR.y - 8, geo.rightR.x - 8, geo.rightR.y - 8);
      g.lineStyle(2, 0x3e2c1c, 1);
      for (let t = 0.15; t <= 0.85; t += 0.175) {
        const x = geo.leftR.x + (geo.bottomR.x - geo.leftR.x) * t;
        const y = geo.leftR.y + (geo.bottomR.y - geo.leftR.y) * t;
        g.lineBetween(x, y - 14, x, y + 3);
      }
      for (let t = 0.18; t <= 0.82; t += 0.16) {
        const x = geo.right.x + (geo.bottom.x - geo.right.x) * t;
        const y = geo.right.y + (geo.bottom.y - geo.right.y) * t;
        g.strokeEllipse(x, y - 5, 24, 12);
      }
      g.generateTexture('ch5-bridge-span', geo.texW, geo.texH);
      g.destroy();
    }

    if (!this.textures.exists('ch5-market-awning')) {
      const geo = this.isoPrism(1, 1, 24, 22);
      const g = this.add.graphics();
      this.drawIsoPrism(g, geo, {
        right: 0x73512e,
        left: 0x5b3f24,
        top: 0x315f68,
        edge: 0x2a1a0a,
      });
      const peak = { x: geo.bottomR.x, y: geo.topR.y - 20 };
      g.fillStyle(0x315f68, 1);
      g.fillPoints([geo.leftR, peak, geo.bottomR], true);
      g.fillStyle(0x2a5159, 1);
      g.fillPoints([geo.bottomR, peak, geo.rightR], true);
      g.lineStyle(1, 0x2a1a0a, 1);
      g.strokePoints([geo.leftR, peak, geo.rightR, geo.bottomR], true);
      g.lineStyle(2, 0xc9a55c, 1);
      g.lineBetween(geo.bottomR.x, geo.bottomR.y, peak.x, peak.y);
      g.generateTexture('ch5-market-awning', geo.texW, geo.texH);
      g.destroy();
    }

    if (!this.textures.exists('ch5-river-reeds')) {
      const g = this.add.graphics();
      g.fillStyle(0x2c4a6b, 0.8);
      g.fillEllipse(24, 38, 42, 14);
      g.lineStyle(2, 0x516b38, 1);
      for (let x = 10; x <= 38; x += 7) {
        g.lineBetween(x, 38, x + 3, 14);
      }
      g.fillStyle(0x8b6a3a, 1);
      g.fillEllipse(18, 18, 5, 10);
      g.fillEllipse(33, 20, 5, 10);
      g.generateTexture('ch5-river-reeds', 48, 44);
      g.destroy();
    }
  }
}
