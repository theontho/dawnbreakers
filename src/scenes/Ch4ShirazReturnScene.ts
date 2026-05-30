import { BaseMapScene } from './BaseMapScene';

export class Ch4ShirazReturnScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 11;
  protected sceneTitle = 'Return to Shíráz';

  constructor() { super('Ch4ShirazReturn'); }

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
