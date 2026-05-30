import { BaseMapScene } from './BaseMapScene';

export class Ch10TehranStreetScene extends BaseMapScene {
  protected mapWidth = 19;
  protected mapHeight = 11;
  protected sceneTitle = 'Tihrán — Street of Accusation';

  constructor() { super('Ch10TehranStreet'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(2, 2, 15, 7, 'stone');

    for (let x = 0; x < this.mapWidth; x++) this.map[6][x] = 'path';
    for (let y = 2; y < 9; y++) this.map[y][4] = 'path';
    for (let y = 3; y < 9; y++) this.map[y][14] = 'path';

    this.paintRect(6, 3, 6, 1, 'path');
    this.paintRect(7, 8, 5, 1, 'path');
  }

  protected placeBuildings(): void {
    this.buildings.push(
      { gridX: 2, gridY: 1, w: 3, h: 2, texture: 'ch10-street-house' },
      { gridX: 11, gridY: 1, w: 4, h: 2, texture: 'ch10-street-arch' },
      { gridX: 6, gridY: 8, w: 3, h: 2, texture: 'closed-door' },
    );
    this.blockFootprint(2, 1, 3, 2);
    this.blockFootprint(11, 1, 4, 2);
    this.blockFootprint(6, 8, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push(
      { gridX: 3, gridY: 4, texture: 'crowd-shadow' },
      { gridX: 5, gridY: 5, texture: 'crowd-shadow' },
      { gridX: 12, gridY: 5, texture: 'crowd-shadow' },
      { gridX: 15, gridY: 7, texture: 'crowd-shadow' },
      { gridX: 7, gridY: 4, texture: 'ch10-chain-coil', blocks: true },
      { gridX: 10, gridY: 7, texture: 'ch10-chain-coil', blocks: true },
      { gridX: 1, gridY: 3, texture: 'lamp', blocks: true },
      { gridX: 17, gridY: 4, texture: 'lamp', blocks: true },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(13, 6, 'ch10-guard',
      () => 'Speak with the guard  [E]',
      () => this.startSimpleDialogue('ch10-guard'));

    this.addNPC(9, 6, 'crowd-shadow',
      () => 'Listen to hostile whispers  [E]',
      () => this.startSimpleDialogue('ch10-guard'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 18, fromY: 6, dx: 1, dy: 0,
      targetScene: 'Ch10SiyahChal',
      targetSpawnX: 1, targetSpawnY: 6,
      label: '→ Descend toward the Síyáh-Chál',
    });
  }
}
