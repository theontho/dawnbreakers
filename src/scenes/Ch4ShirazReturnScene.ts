import { BaseMapScene } from './BaseMapScene';
import { makeTextureGraphics } from './graphicsFactory';

export class Ch4ShirazReturnScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 11;
  protected sceneTitle = 'Return to Shíráz';

  constructor() { super('Ch4ShirazReturn'); }

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
    this.makePersonTexture('ch4-quddus', {
      body: 0xead9ad,
      skin: 0xe6c89a,
      clothing: { style: 'cloak', secondary: 0x2d2d2d, accent: 0xc9a55c },
      hat: { style: 'turban', color: 0xf2ead6, accent: 0x2d2d2d },
      shadow: true,
    });
    this.makePersonTexture('ch4-townsman', {
      body: 0x5b4936,
      skin: 0xd1b37c,
      clothing: { style: 'vest', secondary: 0x7a5a3a, accent: 0xd8c7a0 },
      hat: { style: 'cap', color: 0x7a5a3a },
      shadow: true,
    });
    this.makeClosedDoor();
    this.makeWatchLamp();
    this.makeCrowd();
  }

  private makeClosedDoor(): void {
    if (this.textures.exists('closed-door')) return;
    const geo = this.isoPrism(1, 1, 42, 12);
    const g = makeTextureGraphics(this);
    this.drawIsoPrism(g, geo, {
      right: 0x6f5636,
      left: 0x534029,
      top: 0x7c6240,
      edge: 0x140d09,
    });
    const door = this.wallInset(geo.right, geo.bottom, 0.18, 0.82, 34);
    g.fillStyle(0x2c1d14, 1);
    g.fillPoints(door, true);
    g.lineStyle(2, 0x140d09, 0.8);
    g.strokePoints(door, true);
    g.lineStyle(1, 0xc9a55c, 0.7);
    g.lineBetween((door[0].x + door[1].x) / 2, (door[0].y + door[1].y) / 2, (door[2].x + door[3].x) / 2, (door[2].y + door[3].y) / 2);
    g.fillStyle(0xc9a55c, 1);
    g.fillCircle(door[1].x - 4, door[1].y - 16, 2);
    g.generateTexture('closed-door', geo.texW, geo.texH);
    g.destroy();
  }

  private makeWatchLamp(): void {
    if (this.textures.exists('lamp')) return;
    const g = makeTextureGraphics(this);
    g.lineStyle(3, 0x2b1d12, 1);
    g.lineBetween(16, 6, 16, 42);
    g.fillStyle(0xc9a55c, 1);
    g.fillCircle(16, 16, 6);
    g.fillStyle(0xf3d98a, 0.65);
    g.fillEllipse(16, 18, 22, 18);
    g.generateTexture('lamp', 32, 46);
    g.destroy();
  }

  private makeCrowd(): void {
    if (this.textures.exists('crowd')) return;
    const g = makeTextureGraphics(this);
    const robes = [0x3f3328, 0x6a5030, 0x2f3b44, 0x574027];
    for (let i = 0; i < robes.length; i++) {
      const x = 8 + i * 10;
      g.fillStyle(robes[i], 1);
      g.fillRoundedRect(x - 4, 16, 8, 16, 2);
      g.fillStyle(0xd1b37c, 1);
      g.fillCircle(x, 11, 4);
    }
    g.generateTexture('crowd', 48, 34);
    g.destroy();
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 5 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(0, 4, this.mapWidth, 3, 'path');
    this.paintRect(3, 0, 2, this.mapHeight, 'stone');
    this.paintRect(11, 0, 2, this.mapHeight, 'stone');
    this.paintRect(0, 0, this.mapWidth, 1, 'stone');
    this.paintRect(0, 10, this.mapWidth, 1, 'stone');

    for (let x = 0; x < this.mapWidth; x++) {
      if (x !== 1 && x !== 14) {
        this.blockTile(x, 0);
        this.blockTile(x, 10);
      }
    }
  }

  protected placeBuildings(): void {
    const houses = [
      { gridX: 1, gridY: 1, w: 2, h: 2, texture: 'house' },
      { gridX: 5, gridY: 1, w: 2, h: 2, texture: 'house' },
      { gridX: 9, gridY: 1, w: 2, h: 2, texture: 'house' },
      { gridX: 13, gridY: 1, w: 2, h: 2, texture: 'house' },
      { gridX: 2, gridY: 8, w: 2, h: 2, texture: 'house' },
      { gridX: 6, gridY: 8, w: 2, h: 2, texture: 'house' },
      { gridX: 10, gridY: 8, w: 2, h: 2, texture: 'house' },
    ];
    for (const house of houses) {
      this.buildings.push(house);
      this.blockFootprint(house.gridX, house.gridY, house.w, house.h);
    }
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 4, gridY: 3, texture: 'closed-door', blocks: true },
      { gridX: 8, gridY: 3, texture: 'closed-door', blocks: true },
      { gridX: 13, gridY: 7, texture: 'closed-door', blocks: true },
      { gridX: 2, gridY: 4, texture: 'lamp', blocks: true },
      { gridX: 12, gridY: 6, texture: 'lamp', blocks: true },
      { gridX: 5, gridY: 7, texture: 'crowd', blocks: true },
      { gridX: 10, gridY: 7, texture: 'crowd', blocks: true },
      { gridX: 15, gridY: 4, texture: 'gate', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(6, 5, 'ch4-officer',
      () => 'Hear the officer of Ḥusayn Khán  [E]',
      () => this.startSimpleDialogue('ch4-officer-warning'));

    this.addNPC(9, 5, 'ch4-quddus',
      () => 'Stand with Quddús  [E]',
      () => this.startSimpleDialogue('ch4-quddus-witness'));

    this.addNPC(4, 6, 'ch4-townsman',
      () => 'Speak with a frightened townsman  [E]',
      () => this.startSimpleDialogue('ch4-quddus-witness'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 15, fromY: 5, dx: 1, dy: 0,
      targetScene: 'Ch4VakilMosque',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Toward the Vakíl Mosque',
    });
  }
}
