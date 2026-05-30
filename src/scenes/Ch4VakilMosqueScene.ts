import { BaseMapScene } from './BaseMapScene';

export class Ch4VakilMosqueScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Vakíl Mosque';

  constructor() { super('Ch4VakilMosque'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(2, 2, 12, 8, 'stone');
    this.paintRect(0, 5, this.mapWidth, 3, 'path');
    this.paintRect(6, 1, 4, 9, 'stone');

    for (let x = 2; x <= 13; x++) {
      this.blockTile(x, 1);
      this.blockTile(x, 10);
    }
    for (let y = 2; y <= 9; y++) {
      this.blockTile(1, y);
      this.blockTile(14, y);
    }
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 2, w: 4, h: 2, texture: 'ch4-prayer-arch' });
    this.blockFootprint(6, 2, 4, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 7, gridY: 4, texture: 'ch4-pulpit', blocks: true },
      { gridX: 5, gridY: 5, texture: 'crowd', blocks: true },
      { gridX: 10, gridY: 5, texture: 'crowd', blocks: true },
      { gridX: 4, gridY: 8, texture: 'crowd', blocks: true },
      { gridX: 11, gridY: 8, texture: 'crowd', blocks: true },
      { gridX: 2, gridY: 3, texture: 'well', blocks: true },
      { gridX: 13, gridY: 3, texture: 'tree', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(8, 4, 'crowd',
      () => 'Stand among the listening crowd  [E]',
      () => this.startSimpleDialogue('ch4-house-arrest'));

    this.addNPC(8, 7, 'ch4-witness',
      () => 'Ask the mosque witness  [E]',
      () => this.startSimpleDialogue('ch4-house-arrest'));

    this.addNPC(5, 7, 'ch4-officer',
      () => 'Hear the officer warning  [E]',
      () => this.startSimpleDialogue('ch4-officer-warning'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch4ShirazReturn',
      targetSpawnX: 14, targetSpawnY: 5,
      label: '← Back to the tense streets',
    });
  }
}
