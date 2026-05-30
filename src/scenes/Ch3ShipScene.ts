import { BaseMapScene } from './BaseMapScene';

export class Ch3ShipScene extends BaseMapScene {
  protected mapWidth = 14;
  protected mapHeight = 9;
  protected sceneTitle = 'Pilgrimage — Aboard Ship';

  constructor() { super('Ch3Ship'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 3, y: 4 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'water');

    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) this.blockTile(x, y);
    }

    this.paintRect(2, 2, 9, 5, 'path');
    this.paintRect(4, 3, 5, 3, 'sand');
    this.paintRect(11, 4, 3, 1, 'path');

    const walkable: [number, number][] = [];
    for (let y = 2; y <= 6; y++) {
      for (let x = 2; x <= 10; x++) walkable.push([x, y]);
    }
    walkable.push([11, 4], [12, 4], [13, 4]);
    for (const [x, y] of walkable) this.blocked[y][x] = false;
  }

  protected placeBuildings(): void {
    // The ship is formed from walkable deck tiles and local decor textures.
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 6, gridY: 3, texture: 'ch3-mast', blocks: true });
    this.decor.push({ gridX: 3, gridY: 2, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 4, gridY: 6, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 8, gridY: 2, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 9, gridY: 6, texture: 'ch3-ship-rail', blocks: true });
    this.decor.push({ gridX: 3, gridY: 5, texture: 'crates', blocks: true });
    this.decor.push({ gridX: 8, gridY: 5, texture: 'crates', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(5, 4, 'ch3-quddus',
      () => 'Speak with Quddús  [E]',
      () => this.startSimpleDialogue('ch3-quddus-ship'));
    this.addNPC(9, 5, 'ch3-sailor',
      () => 'Ask the sailor about the crossing  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
    this.addNPC(7, 6, 'ch3-ship-pilgrim',
      () => 'Speak with a quiet pilgrim  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 13, fromY: 4, dx: 1, dy: 0,
      targetScene: 'Ch3Mecca',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Toward Mecca',
    });
  }
}
