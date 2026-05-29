import { BaseMapScene } from './BaseMapScene';

/**
 * Chapter 2 — a dusty road north of Shíráz where conviction becomes movement.
 */
export class RoadScene extends BaseMapScene {
  protected mapWidth = 20;
  protected mapHeight = 10;
  protected sceneTitle = 'The Road North';

  constructor() { super('Road'); }

  create(): void {
    this.ensureRoadTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 5 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');

    this.paintPath([
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
      [5, 4], [6, 4], [7, 4], [8, 5], [9, 5],
      [10, 5], [11, 5], [12, 4], [13, 4], [14, 4],
      [15, 5], [16, 5], [17, 5], [18, 4], [19, 4],
    ]);

    this.paintRect(4, 7, 9, 1, 'stone');
    this.paintRect(6, 8, 6, 1, 'stone');
    this.paintRect(3, 1, 5, 3, 'path');
    this.paintRect(14, 1, 5, 4, 'path');
    this.map[2][8] = 'grass';
    this.map[8][15] = 'grass';
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 15, gridY: 1, w: 3, h: 2, texture: 'ch2-caravanserai' });
    this.blockFootprint(15, 1, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 5, gridY: 2, texture: 'ch2-shrine', blocks: true });
    this.decor.push({ gridX: 10, gridY: 4, texture: 'ch2-milestone', blocks: true });
    this.decor.push({ gridX: 18, gridY: 2, texture: 'well', blocks: true });

    const dryStream: [number, number][] = [[5, 7], [7, 8], [9, 7], [11, 8]];
    for (const [x, y] of dryStream) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch2-dry-stream' });
    }

    const cypresses: [number, number][] = [[2, 2], [7, 1], [13, 2], [1, 8], [17, 8]];
    for (const [x, y] of cypresses) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch2-cypress', blocks: true });
    }

    const tamarisks: [number, number][] = [[3, 8], [8, 2], [12, 7], [19, 7]];
    for (const [x, y] of tamarisks) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch2-tamarisk', blocks: true });
    }
  }

  protected spawnNPCs(): void {
    this.addNPC(12, 5, 'npc-traveller',
      () => 'Speak with Another Seeker  [E]',
      () => this.startSimpleDialogue('road-encounter'));

    this.addNPC(6, 3, 'npc-mulla',
      () => 'Speak with the Wandering Dervish  [E]',
      () => this.startSimpleDialogue('road-dervish'));

    this.addNPC(18, 5, 'npc-merchant',
      () => 'Speak with the Muleteer  [E]',
      () => this.startSimpleDialogue('road-muleteer'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 5, dx: -1, dy: 0,
      targetScene: 'HouseQuarter',
      targetSpawnX: 6, targetSpawnY: 13,
      label: '← Back to Shíráz',
    });
  }

  private ensureRoadTextures(): void {
    if (!this.textures.exists('ch2-caravanserai')) this.makeCaravanseraiTexture();
    if (!this.textures.exists('ch2-shrine')) this.makeShrineTexture();
    if (!this.textures.exists('ch2-milestone')) this.makeMilestoneTexture();
    if (!this.textures.exists('ch2-dry-stream')) this.makeDryStreamTexture();
    if (!this.textures.exists('ch2-cypress')) this.makeCypressTexture();
    if (!this.textures.exists('ch2-tamarisk')) this.makeTamariskTexture();
  }

  private makeCaravanseraiTexture(): void {
    const geo = this.isoPrism(3, 2, 66, 20);
    const g = this.add.graphics();

    this.drawIsoPrism(g, geo, {
      right: 0xb88b55,
      left: 0x8b653a,
      top: 0xcaa36a,
      edge: 0x2a1a0a,
    });
    g.lineStyle(1, 0x2a1a0a, 0.9);
    g.fillStyle(0x5b3820, 1);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.39, 0.57, 34), true);
    g.strokePoints(this.wallInset(geo.right, geo.bottom, 0.39, 0.57, 34), true);
    g.fillStyle(0x6b4824, 1);
    g.fillPoints(this.wallInset(geo.left, geo.bottom, 0.08, 0.22, 58), true);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.78, 0.94, 58), true);
    g.strokePoints(this.wallInset(geo.left, geo.bottom, 0.08, 0.22, 58), true);
    g.strokePoints(this.wallInset(geo.right, geo.bottom, 0.78, 0.94, 58), true);
    g.fillStyle(0xd8bf7a, 1);
    g.fillCircle(geo.leftR.x + 18, geo.leftR.y - 6, 5);
    g.fillCircle(geo.rightR.x - 18, geo.rightR.y - 6, 5);
    g.generateTexture('ch2-caravanserai', geo.texW, geo.texH);
    g.destroy();
  }

  private makeShrineTexture(): void {
    const geo = this.isoPrism(1, 1, 36, 18);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, {
      right: 0xd0b47a,
      left: 0xa98c5c,
      top: 0x8b6a3a,
      edge: 0x2a1a0a,
    });
    const cx = geo.bottomR.x;
    const cy = (geo.topR.y + geo.bottomR.y) / 2;
    g.lineStyle(1, 0x2a1a0a, 0.9);
    g.fillStyle(0x4a7a82, 1);
    g.fillEllipse(cx, cy - 18, 36, 24);
    g.strokeEllipse(cx, cy - 18, 36, 24);
    g.fillStyle(0x5a3a24, 1);
    g.fillPoints(this.wallInset(geo.right, geo.bottom, 0.42, 0.58, 20), true);
    g.fillStyle(0xc9a55c, 1);
    g.fillRect(cx - 1, cy - 46, 2, 13);
    g.fillCircle(cx, cy - 48, 3);
    g.generateTexture('ch2-shrine', geo.texW, geo.texH);
    g.destroy();
  }

  private makeMilestoneTexture(): void {
    const w = 34;
    const h = 48;
    const g = this.add.graphics();
    g.lineStyle(1, 0x2a1a0a, 0.9);
    g.fillStyle(0x7a6a4a, 1);
    g.fillRoundedRect(8, 8, 18, 34, 4);
    g.strokeRoundedRect(8, 8, 18, 34, 4);
    g.fillStyle(0xb89968, 1);
    g.fillRect(8, 26, 18, 5);
    g.lineStyle(1, 0x3a2a1a, 0.8);
    g.beginPath();
    g.moveTo(13, 14);
    g.lineTo(22, 20);
    g.moveTo(11, 34);
    g.lineTo(24, 34);
    g.strokePath();
    g.generateTexture('ch2-milestone', w, h);
    g.destroy();
  }

  private makeDryStreamTexture(): void {
    const w = 72;
    const h = 28;
    const g = this.add.graphics();
    g.fillStyle(0x5c503d, 0.55);
    g.fillEllipse(w / 2, h - 9, 62, 16);
    g.fillStyle(0x8a7a5a, 1);
    g.fillCircle(18, 16, 5);
    g.fillCircle(36, 12, 4);
    g.fillCircle(51, 17, 6);
    g.fillStyle(0xb89968, 1);
    g.fillEllipse(34, 19, 32, 6);
    g.generateTexture('ch2-dry-stream', w, h);
    g.destroy();
  }

  private makeCypressTexture(): void {
    const w = 44;
    const h = 88;
    const g = this.add.graphics();
    g.fillStyle(0x4a2e18, 1);
    g.fillRect(w / 2 - 3, h - 30, 6, 24);
    g.fillStyle(0x1f5632, 1);
    g.fillEllipse(w / 2, h - 48, 20, 68);
    g.fillStyle(0x2e7040, 1);
    g.fillEllipse(w / 2 - 4, h - 55, 10, 42);
    g.lineStyle(1, 0x17351f, 0.8);
    g.strokeEllipse(w / 2, h - 48, 20, 68);
    g.generateTexture('ch2-cypress', w, h);
    g.destroy();
  }

  private makeTamariskTexture(): void {
    const w = 50;
    const h = 68;
    const g = this.add.graphics();
    g.lineStyle(2, 0x4a2e18, 1);
    g.beginPath();
    g.moveTo(w / 2, h - 7);
    g.lineTo(w / 2 - 4, h - 30);
    g.moveTo(w / 2, h - 13);
    g.lineTo(w / 2 + 11, h - 34);
    g.moveTo(w / 2 - 2, h - 21);
    g.lineTo(w / 2 - 16, h - 38);
    g.strokePath();
    g.fillStyle(0x6f8a58, 1);
    g.fillCircle(w / 2 - 14, h - 39, 11);
    g.fillCircle(w / 2 + 13, h - 35, 12);
    g.fillCircle(w / 2 - 1, h - 48, 13);
    g.fillStyle(0x8ba36b, 0.9);
    g.fillCircle(w / 2 + 3, h - 43, 7);
    g.generateTexture('ch2-tamarisk', w, h);
    g.destroy();
  }
}
