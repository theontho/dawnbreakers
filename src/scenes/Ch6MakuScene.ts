import { BaseMapScene } from './BaseMapScene';

export class Ch6MakuScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 11;
  protected sceneTitle = 'Mákú — Mountain Fortress';

  constructor() { super('Ch6Maku'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(0, 0, this.mapWidth, 2, 'sand');
    this.paintRect(2, 8, 6, 2, 'sand');
    this.paintRect(12, 2, 3, 3, 'sand');

    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [12, 6], [13, 6], [14, 6], [15, 6],
      [7, 5], [8, 5], [9, 5],
    ]);

    this.map[1][1] = 'water'; this.blockTile(1, 1);
    this.map[2][1] = 'water'; this.blockTile(1, 2);
    this.map[9][12] = 'water'; this.blockTile(12, 9);
    this.map[9][13] = 'water'; this.blockTile(13, 9);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 8, gridY: 2, w: 3, h: 3, texture: 'ch6-maku-fortress' });
    this.blockFootprint(8, 2, 3, 3);
  }

  protected placeDecor(): void {
    const rocks: [number, number][] = [
      [0, 3], [2, 2], [4, 1], [6, 3], [12, 1], [14, 4],
      [2, 9], [5, 9], [9, 9], [11, 8], [15, 9],
    ];
    for (const [x, y] of rocks) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-rock', blocks: true });
    }

    const shrubs: [number, number][] = [
      [3, 4], [5, 7], [13, 3], [7, 8], [14, 8],
    ];
    for (const [x, y] of shrubs) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-snow-shrub', blocks: true });
    }
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 6, 'ch6-warden',
      () => 'Speak with ʿAlí Khán  [E]',
      () => this.startSimpleDialogue('ch6-warden-softens'));

    this.addNPC(3, 7, 'ch6-courier',
      () => 'Speak with the Mountain Courier  [E]',
      () => this.startSimpleDialogue('ch6-prisoner-courier'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 15, fromY: 6, dx: 1, dy: 0,
      targetScene: 'Ch6Chihriq',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ The harsher road to Chihríq',
    });
  }
}
