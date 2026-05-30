import { BaseMapScene } from './BaseMapScene';

export class Ch8TabarsiFortScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Fort Shaykh Ṭabarsí';

  constructor() { super('Ch8TabarsiFort'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 5, this.mapWidth, 3, 'sand');
    this.paintRect(3, 3, 10, 7, 'stone');
    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
    ]);
    this.map[1][1] = 'water'; this.blockTile(1, 1);
    this.map[10][14] = 'water'; this.blockTile(14, 10);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 4, w: 3, h: 3, texture: 'ch8-shrine' });
    this.blockFootprint(6, 4, 3, 3);
  }

  protected placeDecor(): void {
    for (let x = 3; x <= 12; x++) {
      if (x !== 7 && x !== 8) this.decor.push({ gridX: x, gridY: 2, texture: 'ch8-palisade', blocks: true });
      this.decor.push({ gridX: x, gridY: 10, texture: 'ch8-palisade', blocks: true });
    }
    for (let y = 3; y <= 9; y++) {
      if (y !== 6) this.decor.push({ gridX: 3, gridY: y, texture: 'ch8-palisade', blocks: true });
      this.decor.push({ gridX: 13, gridY: y, texture: 'ch8-palisade', blocks: true });
    }
    this.decor.push({ gridX: 4, gridY: 5, texture: 'ch8-truce-flag' });
    this.decor.push({ gridX: 1, gridY: 2, texture: 'tree', blocks: true });
    this.decor.push({ gridX: 14, gridY: 3, texture: 'tree', blocks: true });
    this.decor.push({ gridX: 2, gridY: 9, texture: 'tree', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(5, 5, 'npc-merchant',
      () => 'Meet the officer under truce  [E]',
      () => this.startSimpleDialogue('ch8-truce'));
    this.addNPC(9, 6, 'npc-mulla',
      () => 'Seek Quddús’s counsel  [E]',
      () => this.startSimpleDialogue('ch8-quddus-counsel'));
    this.addNPC(10, 8, 'npc-traveller',
      () => 'Speak with the wounded witness  [E]',
      () => this.startSimpleDialogue('ch8-mulla-husayn'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch8ForestRoad',
      targetSpawnX: 16, targetSpawnY: 5,
      label: '← Back to the forest road',
    });
  }
}
