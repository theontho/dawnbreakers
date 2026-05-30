import { BaseMapScene } from './BaseMapScene';

export class Ch6ChihriqScene extends BaseMapScene {
  protected mapWidth = 17;
  protected mapHeight = 12;
  protected sceneTitle = 'Chihríq — the Grievous Mountain';

  constructor() { super('Ch6Chihriq'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(0, 0, 5, 3, 'sand');
    this.paintRect(10, 1, 5, 2, 'sand');
    this.paintRect(12, 8, 4, 3, 'sand');

    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6],
      [12, 6], [13, 6],
      [13, 7], [13, 8], [12, 8], [11, 8],
    ]);

    this.map[9][2] = 'water'; this.blockTile(2, 9);
    this.map[10][2] = 'water'; this.blockTile(2, 10);
    this.map[10][3] = 'water'; this.blockTile(3, 10);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 10, gridY: 3, w: 3, h: 3, texture: 'ch6-chihriq-fortress' });
    this.blockFootprint(10, 3, 3, 3);
  }

  protected placeDecor(): void {
    const rocks: [number, number][] = [
      [1, 2], [4, 1], [7, 2], [15, 2], [3, 8], [6, 9],
      [8, 10], [14, 10], [16, 7], [15, 5],
    ];
    for (const [x, y] of rocks) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-rock', blocks: true });
    }

    const stakes: [number, number][] = [
      [9, 4], [13, 4], [10, 7], [14, 6],
    ];
    for (const [x, y] of stakes) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch6-barred-marker', blocks: true });
    }
  }

  protected spawnNPCs(): void {
    this.addNPC(5, 6, 'ch6-mulla-husayn',
      () => 'Speak with Mullá Ḥusayn  [E]',
      () => this.startSimpleDialogue('ch6-mulla-husayn-visit'));

    this.addNPC(12, 7, 'writing-desk',
      () => 'Read at the writing desk  [E]',
      () => this.startSimpleDialogue('ch6-bayan'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch6Maku',
      targetSpawnX: 14, targetSpawnY: 6,
      label: '← Back toward Mákú',
    });
  }
}
