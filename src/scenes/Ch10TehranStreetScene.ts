import { BaseMapScene, TILE_H, TILE_W } from './BaseMapScene';

export class Ch10TehranStreetScene extends BaseMapScene {
  protected mapWidth = 19;
  protected mapHeight = 11;
  protected sceneTitle = 'Tihrán — Street of Accusation';

  constructor() { super('Ch10TehranStreet'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(2, 2, 15, 7, 'stone');

    for (let x = 0; x < this.mapWidth; x++) this.map[6][x] = 'path';
    for (let y = 2; y < 9; y++) this.map[y][4] = 'path';
    for (let y = 3; y < 9; y++) this.map[y][14] = 'path';

    this.paintRect(6, 3, 6, 1, 'path');
    this.paintRect(7, 8, 5, 1, 'path');
  }

  protected placeBuildings(): void {
    this.buildings.push(
      { gridX: 2, gridY: 1, w: 3, h: 2, texture: 'ch10-street-house' },
      { gridX: 11, gridY: 1, w: 4, h: 2, texture: 'ch10-street-arch' },
      { gridX: 6, gridY: 8, w: 3, h: 2, texture: 'ch10-closed-door' },
    );
    this.blockFootprint(2, 1, 3, 2);
    this.blockFootprint(11, 1, 4, 2);
    this.blockFootprint(6, 8, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 3, gridY: 4, texture: 'ch10-crowd-shadow' },
      { gridX: 5, gridY: 5, texture: 'ch10-crowd-shadow' },
      { gridX: 12, gridY: 5, texture: 'ch10-crowd-shadow' },
      { gridX: 15, gridY: 7, texture: 'ch10-crowd-shadow' },
      { gridX: 7, gridY: 4, texture: 'ch10-chain-coil', blocks: true },
      { gridX: 10, gridY: 7, texture: 'ch10-chain-coil', blocks: true },
      { gridX: 1, gridY: 3, texture: 'ch10-watch-lamp', blocks: true },
      { gridX: 17, gridY: 4, texture: 'ch10-watch-lamp', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(13, 6, 'ch10-guard',
      () => 'Speak with the guard  [E]',
      () => this.startSimpleDialogue('ch10-guard'));

    this.addNPC(9, 6, 'ch10-bahaullah',
      () => 'Walk beside Bahá\'u\'lláh  [E]',
      () => this.startSimpleDialogue('ch10-guard'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 18, fromY: 6, dx: 1, dy: 0,
      targetScene: 'Ch10SiyahChal',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Descend toward the Síyáh-Chál',
    });
  }

  private ensureTextures(): void {
    this.makeCharacter('ch10-guard', 0x39404a, 0xc8b48d);
    this.makeCharacter('ch10-bahaullah', 0x2f2922, 0xd6c3a0, 0xf0ead8);
    this.makeCrowdShadow('ch10-crowd-shadow');
    this.makeChainCoil('ch10-chain-coil');
    this.makeWatchLamp('ch10-watch-lamp');
    this.makeStreetHouse('ch10-street-house');
    this.makeStreetArch('ch10-street-arch');
    this.makeClosedDoor('ch10-closed-door');
  }

  private makeCharacter(key: string, body: number, head: number, robe?: number): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(robe ?? body, 1);
    g.fillRoundedRect(4, 16, 16, 22, 3);
    g.fillStyle(body, 1);
    g.fillRect(5, 18, 14, 8);
    g.fillStyle(head, 1);
    g.fillCircle(12, 10, 7);
    g.lineStyle(1, 0x111111, 0.55);
    g.strokeRoundedRect(4, 16, 16, 22, 3);
    g.strokeCircle(12, 10, 7);
    g.generateTexture(key, 24, 40);
    g.destroy();
  }

  private makeCrowdShadow(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x171615, 0.72);
    g.fillEllipse(17, 33, 14, 11);
    g.fillEllipse(32, 33, 14, 11);
    g.fillEllipse(24, 24, 18, 14);
    g.fillRect(12, 24, 26, 15);
    g.generateTexture(key, 50, 44);
    g.destroy();
  }

  private makeChainCoil(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.lineStyle(4, 0x343433, 1);
    g.strokeCircle(18, 25, 9);
    g.strokeCircle(31, 25, 9);
    g.lineBetween(10, 34, 42, 17);
    g.lineStyle(1, 0xa2a09a, 0.45);
    g.strokeCircle(18, 25, 9);
    g.strokeCircle(31, 25, 9);
    g.generateTexture(key, 52, 44);
    g.destroy();
  }

  private makeWatchLamp(key: string): void {
    if (this.textures.exists(key)) return;

    const g = this.add.graphics();
    g.fillStyle(0x2b241e, 1);
    g.fillRect(21, 18, 6, 42);
    g.fillRect(13, 16, 22, 5);
    g.fillStyle(0xad8a4e, 0.65);
    g.fillCircle(24, 13, 7);
    g.lineStyle(1, 0x0d0c0a, 0.8);
    g.strokeCircle(24, 13, 7);
    g.generateTexture(key, 48, 62);
    g.destroy();
  }

  private makeStreetHouse(key: string): void {
    if (this.textures.exists(key)) return;

    const w = TILE_W * 3;
    const h = TILE_H * 2 + 72;
    const g = this.add.graphics();
    g.fillStyle(0x6b5b49, 1);
    g.fillRect(18, 38, w - 36, 58);
    g.fillStyle(0x4b3f36, 1);
    g.fillRect(14, 28, w - 28, 16);
    g.fillStyle(0x2c241e, 1);
    g.fillRect(42, 58, 22, 38);
    g.fillRect(116, 58, 22, 38);
    g.lineStyle(2, 0x1a1512, 0.85);
    g.strokeRect(18, 38, w - 36, 58);
    g.strokeRect(14, 28, w - 28, 16);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeStreetArch(key: string): void {
    if (this.textures.exists(key)) return;

    const w = TILE_W * 4;
    const h = TILE_H * 2 + 86;
    const g = this.add.graphics();
    g.fillStyle(0x5b5048, 1);
    g.fillRect(22, 36, w - 44, 64);
    g.fillStyle(0x26221f, 1);
    g.fillRoundedRect(w / 2 - 24, 58, 48, 42, 18);
    g.fillStyle(0x463d36, 1);
    g.fillRect(14, 22, w - 28, 18);
    g.lineStyle(2, 0x171310, 0.85);
    g.strokeRect(22, 36, w - 44, 64);
    g.strokeRect(14, 22, w - 28, 18);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private makeClosedDoor(key: string): void {
    if (this.textures.exists(key)) return;

    const w = TILE_W * 3;
    const h = TILE_H * 2 + 70;
    const g = this.add.graphics();
    g.fillStyle(0x4b433c, 1);
    g.fillRect(24, 34, w - 48, 62);
    g.fillStyle(0x241f1b, 1);
    g.fillRect(w / 2 - 20, 54, 40, 42);
    g.lineStyle(2, 0x171310, 0.85);
    g.strokeRect(24, 34, w - 48, 62);
    g.lineBetween(w / 2, 54, w / 2, 96);
    g.generateTexture(key, w, h);
    g.destroy();
  }
}
