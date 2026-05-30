import { BaseMapScene } from './BaseMapScene';

export class Ch5IsfahanBridgeScene extends BaseMapScene {
  protected mapWidth = 20;
  protected mapHeight = 12;
  protected sceneTitle = 'Iṣfahán — Bridge of Arrival';

  constructor() { super('Ch5IsfahanBridge'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 7 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');
    this.paintRect(12, 0, 8, 5, 'stone');
    this.paintRect(0, 8, 7, 4, 'grass');

    for (let x = 0; x < this.mapWidth; x++) {
      this.map[5][x] = 'water';
      this.map[6][x] = 'water';
      this.blockTile(x, 5);
      this.blockTile(x, 6);
    }

    this.paintRect(8, 5, 5, 2, 'stone');
    for (let x = 8; x <= 12; x++) {
      this.blocked[5][x] = false;
      this.blocked[6][x] = false;
    }

    this.paintPath([
      [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7],
      [8, 6], [9, 6], [10, 6], [11, 6], [12, 6],
      [12, 5], [12, 4], [13, 4], [14, 4], [15, 4], [16, 4], [17, 4],
      [18, 4], [19, 4], [19, 5],
    ]);
    this.blocked[5][19] = false;

    this.map[4][3] = 'water';
    this.blockTile(3, 4);
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 8, gridY: 5, w: 5, h: 2, texture: 'ch5-bridge-span' });

    this.buildings.push({ gridX: 15, gridY: 1, w: 1, h: 1, texture: 'gate' });
    this.blockFootprint(15, 1, 1, 1);

    this.buildings.push({ gridX: 3, gridY: 8, w: 1, h: 1, texture: 'ch5-market-awning' });
    this.blockFootprint(3, 8, 1, 1);
  }

  protected placeDecor(): void {
    const reeds: [number, number][] = [[2, 5], [6, 6], [14, 5], [17, 6], [4, 4]];
    for (const [x, y] of reeds) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch5-river-reeds', blocks: true });
    }

    const trees: [number, number][] = [[0, 10], [2, 10], [6, 10], [14, 2], [18, 2]];
    for (const [x, y] of trees) {
      this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });
    }

    this.decor.push({ gridX: 5, gridY: 8, texture: 'well', blocks: true });
  }

  protected spawnNPCs(): void {
    this.addNPC(6, 7, 'npc-merchant',
      () => 'Speak with a Market Visitor  [E]',
      () => this.startSimpleDialogue('ch5-arrival'));

    this.addNPC(13, 4, 'npc-mulla',
      () => 'Speak with the Learned Cleric  [E]',
      () => this.startSimpleDialogue('ch5-cleric-question'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 19, fromY: 5, dx: 1, dy: 0,
      targetScene: 'Ch5MutamidPalace',
      targetSpawnX: 1, targetSpawnY: 7,
      label: '→ Go to the Muʿtamid\'s palace',
    });
  }
}
