import { BaseMapScene } from './BaseMapScene';

export class Ch3MeccaScene extends BaseMapScene {
  protected mapWidth = 16;
  protected mapHeight = 12;
  protected sceneTitle = 'Mecca — the Sacred Courtyard';

  constructor() { super('Ch3Mecca'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(1, 1, 14, 10, 'stone');
    this.paintRect(2, 2, 12, 8, 'path');
    this.paintRect(5, 4, 5, 3, 'stone');

    this.paintPath([
      [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
      [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
    ]);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 4, w: 3, h: 2, texture: 'ch3-kaaba' });
    this.blockFootprint(6, 4, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 3, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 12, gridY: 3, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 4, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true });
    this.decor.push({ gridX: 11, gridY: 9, texture: 'ch3-pilgrim-cluster', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(9, 6, 'ch3-courtyard-hush',
      () => 'Stand where the proclamation is heard  [E]',
      () => this.startSimpleDialogue('ch3-proclamation'));
    this.addNPC(5, 7, 'ch3-muhit',
      () => 'Speak with Mírzá Muḥíṭ-i-Kirmání  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
    this.addNPC(12, 6, 'ch3-pilgrim',
      () => 'Ask a pilgrim quietly  [E]',
      () => this.startSimpleDialogue('ch3-pilgrim-question'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 6, dx: -1, dy: 0,
      targetScene: 'Ch3Ship',
      targetSpawnX: 12, targetSpawnY: 4,
      label: '← Back toward the ship',
    });
  }
}
