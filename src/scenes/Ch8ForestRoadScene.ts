import { BaseMapScene } from './BaseMapScene';

export class Ch8ForestRoadScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 10;
  protected sceneTitle = 'Mazandaran Forest Road';

  constructor() { super('Ch8ForestRoad'); }

  create(): void {
    this.ensureTextures();
    super.create();
  }

  private ensureTextures(): void {
    if (!this.textures.exists('ch8-shrine-glimpse')) {
      const g = this.make.graphics({ x: 0, y: 0, add: false } as any);
      g.fillStyle(0x3b3426, 1);
      g.fillRect(28, 44, 40, 28);
      g.fillStyle(0x756342, 1);
      g.fillTriangle(24, 44, 48, 20, 72, 44);
      g.fillStyle(0xb9aa79, 0.9);
      g.fillCircle(48, 22, 10);
      g.fillStyle(0x1d2d24, 0.8);
      g.fillRect(0, 66, 96, 30);
      g.generateTexture('ch8-shrine-glimpse', 96, 96);
      g.destroy();
    }
  }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 5 };
  }

  protected buildMap(): void {
    this.paintRect(0, 6, this.mapWidth, 2, 'sand');
    this.paintPath([
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 6], [5, 6],
      [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5],
      [12, 5], [13, 5], [14, 5], [15, 5], [16, 5], [17, 5],
    ]);
    this.map[3][5] = 'water'; this.blockTile(5, 3);
    this.map[7][12] = 'water'; this.blockTile(12, 7);
    this.map[6][15] = 'water'; this.blockTile(15, 6);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 15, gridY: 1, w: 2, h: 2, texture: 'ch8-shrine-glimpse' });
    this.blockFootprint(15, 1, 2, 2);
  }

  protected placeDecor(): void {
    const trees: [number, number][] = [
      [0, 2], [1, 8], [2, 1], [3, 3], [4, 8], [6, 1], [7, 8],
      [9, 2], [10, 8], [12, 1], [13, 8], [15, 8], [16, 3], [17, 7],
    ];
    for (const [x, y] of trees) {
      this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });
    }
  }

  protected spawnNPCs(): void {
    this.addNPC(8, 4, 'npc-mulla',
      () => 'Hear of Mullá Ḥusayn  [E]',
      () => this.startSimpleDialogue('ch8-mulla-husayn'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 17, fromY: 5, dx: 1, dy: 0,
      targetScene: 'Ch8TabarsiFort',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Toward the shrine palisade',
    });
  }
}
