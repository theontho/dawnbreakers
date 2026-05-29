import { BaseMapScene } from './BaseMapScene';

export class Ch10SiyahChalScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Síyáh-Chál — the Black Pit';

  constructor() { super('Ch10SiyahChal'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(1, 2, 14, 8, 'path');
    this.paintRect(5, 4, 6, 3, 'sand');

    for (let x = 1; x < this.mapWidth; x++) {
      if (x !== 8) this.blockTile(x, 0);
      if (x !== 4 && x !== 5) this.blockTile(x, 11);
    }
    for (let y = 0; y < this.mapHeight; y++) {
      if (y !== 6) this.blockTile(0, y);
      if (y !== 5 && y !== 6) this.blockTile(15, y);
    }
  }

  protected placeBuildings(): void {
    this.buildings.push(
      { gridX: 6, gridY: 1, w: 4, h: 1, texture: 'ch10-low-arch' },
      { gridX: 12, gridY: 3, w: 2, h: 2, texture: 'ch10-stone-pillar' },
    );
    this.blockFootprint(6, 1, 4, 1);
    this.blockFootprint(12, 3, 2, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 3, gridY: 3, texture: 'ch10-chain-pillar', blocks: true },
      { gridX: 7, gridY: 8, texture: 'ch10-chain-pillar', blocks: true },
      { gridX: 11, gridY: 7, texture: 'ch10-chain-pillar', blocks: true },
      { gridX: 5, gridY: 7, texture: 'lamp', blocks: true },
      { gridX: 2, gridY: 9, texture: 'ch10-chain-coil', blocks: true },
      { gridX: 13, gridY: 8, texture: 'ch10-chain-coil', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(8, 5, 'ch10-light-shaft',
      () => 'Attend to the shaft of light  [E]',
      () => this.startSimpleDialogue('ch10-vision'));

    this.addNPC(4, 6, 'ch10-prisoner',
      () => 'Speak with the fellow prisoner  [E]',
      () => this.startSimpleDialogue('ch10-prisoner'));

    this.addNPC(6, 8, 'ch10-chain-post',
      () => 'Touch the heavy chain  [E]',
      () => this.startSimpleDialogue('ch10-vision'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch10TehranStreet',
      targetSpawnX: 17, targetSpawnY: 6,
      label: '← Back toward the street above',
    });
  }

  private ensureTextures(): void {
    this.makePersonTexture('ch10-prisoner', {
      body: 0x3a3836,
      skin: 0xbda982,
      clothing: { style: 'robe', secondary: 0x5b554e, accent: 0x8a867d },
      hat: { style: 'none' },
      hair: 0x1f1b18,
      shadow: true,
    });
    this.makeChainPillar('ch10-chain-pillar');
    this.makeChainPost('ch10-chain-post');
    this.makeChainCoil('ch10-chain-coil');
    this.makeDimLamp('lamp');
    this.makeLightShaft('ch10-light-shaft');
    this.makeLowArch('ch10-low-arch');
    this.makeStonePillar('ch10-stone-pillar');
  }


  private makeChainPillar(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x383838, 1);
    g.fillRoundedRect(18, 12, 20, 58, 4);
    g.lineStyle(4, 0x1f1f1f, 1);
    g.lineBetween(8, 34, 48, 22);
    g.lineBetween(8, 48, 48, 36);
    g.lineStyle(1, 0x8a867d, 0.4);
    g.strokeRoundedRect(18, 12, 20, 58, 4);
    g.generateTexture(key, 56, 76);
    g.destroy();
  }

  private makeChainPost(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x292929, 1);
    g.fillRoundedRect(16, 10, 18, 54, 4);
    g.lineStyle(4, 0x111111, 1);
    g.strokeCircle(13, 35, 8);
    g.strokeCircle(36, 35, 8);
    g.lineBetween(20, 35, 29, 35);
    g.lineStyle(1, 0x8a867d, 0.35);
    g.strokeRoundedRect(16, 10, 18, 54, 4);
    g.generateTexture(key, 50, 70);
    g.destroy();
  }

  private makeChainCoil(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.lineStyle(4, 0x202020, 1);
    g.strokeCircle(18, 25, 9);
    g.strokeCircle(31, 25, 9);
    g.lineBetween(10, 34, 42, 17);
    g.lineStyle(1, 0x8a867d, 0.38);
    g.strokeCircle(18, 25, 9);
    g.strokeCircle(31, 25, 9);
    g.generateTexture(key, 52, 44);
    g.destroy();
  }

  private makeDimLamp(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x151313, 1);
    g.fillRect(22, 18, 5, 36);
    g.fillRect(15, 16, 19, 5);
    g.fillStyle(0xc9a55c, 0.55);
    g.fillCircle(24, 13, 8);
    g.fillStyle(0xf1d48b, 0.28);
    g.fillCircle(24, 13, 16);
    g.generateTexture(key, 48, 58);
    g.destroy();
  }

  private makeLightShaft(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0xe7d8a6, 0.18);
    g.fillTriangle(32, 0, 8, 96, 56, 96);
    g.fillStyle(0xf2e6b8, 0.24);
    g.fillEllipse(32, 96, 48, 14);
    g.generateTexture(key, 64, 104);
    g.destroy();
  }

  private makeLowArch(key: string): void {
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(4, 1, 46, 12);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, {
      right: 0x302f2d,
      left: 0x242322,
      top: 0x393736,
      edge: 0x0b0b0a,
    });
    g.fillStyle(0x151413, 1);
    const arch = this.wallInset(geo.right, geo.bottom, 0.28, 0.62, 32);
    g.fillPoints(arch, true);
    g.lineStyle(2, 0x0b0b0a, 0.9);
    g.strokePoints(arch, true);
    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }

  private makeStonePillar(key: string): void {
    if (this.textures.exists(key)) return;

    const geo = this.isoPrism(2, 2, 76, 8);
    const g = this.add.graphics();
    this.drawIsoPrism(g, geo, {
      right: 0x363534,
      left: 0x242322,
      top: 0x444240,
      edge: 0x0c0c0b,
    });
    g.lineStyle(2, 0x242322, 0.8);
    g.lineBetween(geo.leftR.x + 6, geo.leftR.y + 12, geo.bottomR.x, geo.bottomR.y + 12);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 12, geo.rightR.x - 6, geo.rightR.y + 12);
    g.lineBetween(geo.left.x + 6, geo.left.y - 10, geo.bottom.x, geo.bottom.y - 10);
    g.lineBetween(geo.bottom.x, geo.bottom.y - 10, geo.right.x - 6, geo.right.y - 10);
    g.generateTexture(key, geo.texW, geo.texH);
    g.destroy();
  }
}
