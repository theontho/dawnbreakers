import { BaseMapScene } from './BaseMapScene';

export class Ch9TabrizSquareScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 12;
  protected sceneTitle = 'Tabríz — the Public Square';

  constructor() { super('Ch9TabrizSquare'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 2, y: 7 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(2, 2, 14, 8, 'stone');

    for (let x = 0; x < this.mapWidth; x++) this.map[7][x] = 'path';
    for (let y = 1; y < this.mapHeight; y++) this.map[y][9] = 'path';

    this.paintRect(4, 4, 4, 2, 'stone');
    this.paintRect(11, 4, 3, 2, 'stone');
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 12, gridY: 1, w: 3, h: 2, texture: 'ch9-barrack-front' });
    this.blockFootprint(12, 1, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 1, gridY: 2, texture: 'cypress', blocks: true },
      { gridX: 16, gridY: 2, texture: 'cypress', blocks: true },
      { gridX: 3, gridY: 3, texture: 'lamp', blocks: true },
      { gridX: 15, gridY: 8, texture: 'lamp', blocks: true },
      { gridX: 5, gridY: 4, texture: 'crowd-shadow' },
      { gridX: 6, gridY: 5, texture: 'crowd-shadow' },
      { gridX: 12, gridY: 5, texture: 'crowd-shadow' },
      { gridX: 13, gridY: 6, texture: 'crowd-shadow' },
      { gridX: 4, gridY: 9, texture: 'ch9-cloth-bundle', blocks: true },
      { gridX: 10, gridY: 10, texture: 'ch9-cloth-bundle', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 6, 'ch9-witness',
      () => 'Speak with the crowd witness  [E]',
      () => this.startSimpleDialogue('ch9-crowd-witness'));

    this.addNPC(14, 7, 'ch9-soldier',
      () => 'Speak with a soldier  [E]',
      () => this.startSimpleDialogue('ch9-crowd-witness'));

    this.addNPC(6, 9, 'ch9-final-witness',
      () => 'Speak with the final witness  [E]',
      () => this.startSimpleDialogue('ch9-final-witness'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 17, fromY: 7, dx: 1, dy: 0,
      targetScene: 'Ch9BarrackRoof',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ The barrack stair',
    });
  }
}
