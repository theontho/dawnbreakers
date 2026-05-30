import { BaseMapScene } from './BaseMapScene';

export class Ch10SiyahChalScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Síyáh-Chál — the Black Pit';

  constructor() { super('Ch10SiyahChal'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'stone');
    this.paintRect(1, 2, 14, 8, 'path');
    this.paintRect(5, 4, 6, 3, 'sand');

    for (let x = 1; x < this.mapWidth; x++) {
      if (x !== 8) this.blockTile(x, 0);
      if (x !== 4 && x !== 5) this.blockTile(x, 11);
    }
    for (let y = 0; y < this.mapHeight; y++) {
      if (y !== 6) this.blockTile(0, y);
      if (y !== 5 && y !== 6) this.blockTile(15, y);
    }
  }

  protected placeBuildings(): void {
    this.buildings.push(
      { gridX: 6, gridY: 1, w: 4, h: 1, texture: 'ch10-low-arch' },
      { gridX: 12, gridY: 3, w: 2, h: 2, texture: 'ch10-stone-pillar' },
    );
    this.blockFootprint(6, 1, 4, 1);
    this.blockFootprint(12, 3, 2, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 3, gridY: 3, texture: 'ch10-chain-pillar', blocks: true },
      { gridX: 7, gridY: 8, texture: 'ch10-chain-pillar', blocks: true },
      { gridX: 11, gridY: 7, texture: 'ch10-chain-pillar', blocks: true },
      { gridX: 5, gridY: 7, texture: 'lamp', blocks: true },
      { gridX: 2, gridY: 9, texture: 'ch10-chain-coil', blocks: true },
      { gridX: 13, gridY: 8, texture: 'ch10-chain-coil', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(8, 5, 'ch10-light-shaft',
      () => 'Attend to the shaft of light  [E]',
      () => this.startSimpleDialogue('ch10-vision'));

    this.addNPC(4, 6, 'ch10-prisoner',
      () => 'Speak with the fellow prisoner  [E]',
      () => this.startSimpleDialogue('ch10-prisoner'));

    this.addNPC(6, 8, 'ch10-chain-post',
      () => 'Touch the heavy chain  [E]',
      () => this.startSimpleDialogue('ch10-vision'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch10TehranStreet',
      targetSpawnX: 17, targetSpawnY: 6,
      label: '← Back toward the street above',
    });
  }
}
