import { BaseMapScene } from './BaseMapScene';

export class Ch3MeccaScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Mecca — the Sacred Courtyard';

  constructor() { super('Ch3Mecca'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  private ensureTextures(): void {
    this.makeKaabaTexture();
    this.makePilgrimTexture('ch3-muhit', 0x2a2520, 0xdfc28f, false);
    this.makePilgrimTexture('ch3-pilgrim', 0x6b5a44, 0xe2c997, false);
    this.makePilgrimClusterTexture();
    this.makeCourtyardHushTexture();
  }

  private makePilgrimTexture(key: string, robe: number, head: number, veil: boolean): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(robe, 1);
    g.fillRoundedRect(5, 15, 14, 23, 3);
    g.fillStyle(head, 1);
    g.fillCircle(12, 9, 7);
    if (veil) {
      g.fillStyle(0xf7f0dc, 0.85);
      g.fillRect(4, 8, 16, 12);
    }
    g.lineStyle(1, 0x111111, 0.4);
    g.strokeRoundedRect(5, 15, 14, 23, 3);
    g.strokeCircle(12, 9, 7);
    g.generateTexture(key, 24, 40);
    g.destroy();
  }

  private makePilgrimClusterTexture(): void {
    if (this.textures.exists('ch3-pilgrim-cluster')) return;

    const g = this.add.graphics();
    const figures = [
      { x: 10, robe: 0xd8d0bd },
      { x: 25, robe: 0xb8aa8d },
      { x: 39, robe: 0xe4dccb },
    ];
    for (const figure of figures) {
      g.fillStyle(figure.robe, 0.9);
      g.fillRoundedRect(figure.x - 5, 18, 10, 18, 3);
      g.fillStyle(0xd8bd8a, 0.9);
      g.fillCircle(figure.x, 12, 5);
    }
    g.generateTexture('ch3-pilgrim-cluster', 50, 40);
    g.destroy();
  }

  private makeCourtyardHushTexture(): void {
    if (this.textures.exists('ch3-courtyard-hush')) return;

    const g = this.add.graphics();
    g.fillStyle(0xf7f0dc, 0.22);
    g.fillEllipse(32, 30, 56, 18);
    g.lineStyle(2, 0xc9a55c, 0.65);
    g.strokeEllipse(32, 30, 46, 12);
    g.lineStyle(1, 0xf7f0dc, 0.5);
    g.lineBetween(32, 6, 32, 28);
    g.lineBetween(22, 12, 30, 28);
    g.lineBetween(42, 12, 34, 28);
    g.generateTexture('ch3-courtyard-hush', 64, 42);
    g.destroy();
  }

  private makeKaabaTexture(): void {
    if (this.textures.exists('ch3-kaaba')) return;

    const g = this.add.graphics();
    const top = { x: 48, y: 18 };
    const right = { x: 88, y: 38 };
    const bottom = { x: 48, y: 58 };
    const left = { x: 8, y: 38 };
    const lift = 48;
    const topR = { x: top.x, y: top.y - lift };
    const rightR = { x: right.x, y: right.y - lift };
    const bottomR = { x: bottom.x, y: bottom.y - lift };
    const leftR = { x: left.x, y: left.y - lift };

    g.fillStyle(0x151515, 1);
    g.fillPoints([right, bottom, bottomR, rightR], true);
    g.fillStyle(0x0b0b0b, 1);
    g.fillPoints([left, bottom, bottomR, leftR], true);
    g.fillStyle(0x202020, 1);
    g.fillPoints([topR, rightR, bottomR, leftR], true);
    g.lineStyle(1, 0x000000, 0.8);
    g.strokePoints([right, bottom, bottomR, rightR], true);
    g.strokePoints([left, bottom, bottomR, leftR], true);
    g.strokePoints([topR, rightR, bottomR, leftR], true);
    g.lineStyle(3, 0xc9a55c, 0.9);
    g.lineBetween(leftR.x + 4, leftR.y + 17, rightR.x - 4, rightR.y + 17);
    g.generateTexture('ch3-kaaba', 96, 72);
    g.destroy();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(1, 1, 14, 10, 'stone');
    this.paintRect(2, 2, 12, 8, 'path');
    this.paintRect(5, 4, 5, 3, 'stone');

    this.paintPath([
      [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
    ]);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 4, w: 3, h: 2, texture: 'ch3-kaaba' });
    this.blockFootprint(6, 4, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 3, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 12, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 4, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 11, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(9, 6, 'ch3-courtyard-hush',
      () => 'Stand where the proclamation is heard  [E]',
      () => this.startSimpleDialogue('ch3-proclamation'));
    this.addNPC(5, 7, 'ch3-muhit',
      () => 'Speak with Mírzá Muḥíṭ-i-Kirmání  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
    this.addNPC(12, 6, 'ch3-pilgrim',
      () => 'Ask a pilgrim quietly  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch3Ship',
      targetSpawnX: 12, targetSpawnY: 4,
      label: '← Back toward the ship',
    });
  }
}
