import { BaseMapScene } from './BaseMapScene';

export class Ch5MutamidPalaceScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 14;
  protected sceneTitle = 'Iṣfahán — the Muʿtamid\'s Sanctuary';

  constructor() { super('Ch5MutamidPalace'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 7 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(3, 4, 12, 7, 'stone');
    this.paintRect(5, 6, 7, 3, 'sand');
    this.paintPath([[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7]]);

    this.map[6][4] = 'water';
    this.map[7][4] = 'water';
    this.blockTile(4, 6);
    this.blockTile(4, 7);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 6, gridY: 1, w: 5, h: 3, texture: 'ch5-palace-portico' });
    this.blockFootprint(6, 1, 5, 3);
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 8, gridY: 6, texture: 'rug' });

    const cypresses: [number, number][] = [[2, 4], [15, 4], [3, 11], [14, 11]];
    for (const [x, y] of cypresses) {
      this.decor.push({ gridX: x, gridY: y, texture: 'cypress', blocks: true });
    }

    this.decor.push({ gridX: 12, gridY: 5, texture: 'well', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(7, 6, 'npc-merchant',
      () => 'Speak with Manúchihr Khán  [E]',
      () => this.startSimpleDialogue('ch5-mutamid'));

    this.addNPC(5, 6, 'npc-mulla',
      () => 'Speak with the Imám-Jumʿih  [E]',
      () => this.startSimpleDialogue('ch5-cleric-question'));

    this.addNPC(10, 7, 'writing-desk',
      () => 'Read beside the revealed treatise  [E]',
      () => this.startSimpleDialogue('ch5-treatise'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 7, dx: -1, dy: 0,
      targetScene: 'Ch5IsfahanBridge',
      targetSpawnX: 18, targetSpawnY: 5,
      label: '← Return to the bridge',
    });
  }
}
