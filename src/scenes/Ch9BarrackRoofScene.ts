import { BaseMapScene } from './BaseMapScene';

export class Ch9BarrackRoofScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 10;
  protected sceneTitle = 'Tabríz — the Barrack Roof';

  constructor() { super('Ch9BarrackRoof'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(0, 6, 4, 2, 'path');
    this.paintRect(9, 3, 4, 3, 'sand');

    for (let x = 2; x < this.mapWidth; x++) {
      this.blockTile(x, 0);
      if (x !== 7 && x !== 8) this.blockTile(x, 9);
    }
    for (let y = 1; y < this.mapHeight - 1; y++) {
      this.blockTile(15, y);
    }
  }

  protected placeBuildings(): void {
    this.buildings.push(
      { gridX: 2, gridY: 0, w: 14, h: 1, texture: 'ch9-roof-north-wall' },
      { gridX: 15, gridY: 1, w: 1, h: 8, texture: 'ch9-roof-east-wall' },
      { gridX: 2, gridY: 9, w: 5, h: 1, texture: 'ch9-roof-south-wall-left' },
      { gridX: 9, gridY: 9, w: 7, h: 1, texture: 'ch9-roof-south-wall-right' },
      { gridX: 5, gridY: 1, w: 4, h: 1, texture: 'ch9-roof-parapet' },
    );
    this.blockFootprint(5, 1, 4, 1);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 10, gridY: 4, texture: 'ch9-rope-coils', blocks: true },
      { gridX: 12, gridY: 4, texture: 'ch9-rope-coils', blocks: true },
      { gridX: 3, gridY: 2, texture: 'lamp', blocks: true },
      { gridX: 13, gridY: 7, texture: 'lamp', blocks: true },
      { gridX: 6, gridY: 8, texture: 'ch9-empty-space' },
      { gridX: 8, gridY: 8, texture: 'ch9-empty-space' },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 5, 'ch9-sam-khan',
      () => 'Speak with Sám Khán  [E]',
      () => this.startSimpleDialogue('ch9-sam-khan'));

    this.addNPC(5, 6, 'ch9-soldier',
      () => 'Speak with the waiting soldier  [E]',
      () => this.startSimpleDialogue('ch9-crowd-witness'));

    this.addNPC(11, 5, 'ch9-empty-space',
      () => 'Stand in solemn witness  [E]',
      () => this.startSimpleDialogue('ch9-final-witness'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch9TabrizSquare',
      targetSpawnX: 16, targetSpawnY: 7,
      label: '← Back to the square',
    });
  }
}
