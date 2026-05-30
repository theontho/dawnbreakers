import { BaseMapScene } from './BaseMapScene';

/**
 * Chapter 2 — a dusty road north of Shíráz where conviction becomes movement.
 */
export class RoadScene extends BaseMapScene {
  protected mapWidth = 20;
  protected mapHeight = 10;
  protected sceneTitle = 'The Road North';

  constructor() { super('Road'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 5 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');

    this.paintPath([
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 5],
      [5, 4], [6, 4], [7, 4], [8, 5], [9, 5],
      [10, 5], [11, 5], [12, 4], [13, 4], [14, 4],
      [15, 5], [16, 5], [17, 5], [18, 4], [19, 4],
    ]);

    this.paintRect(4, 7, 9, 1, 'stone');
    this.paintRect(6, 8, 6, 1, 'stone');
    this.paintRect(3, 1, 5, 3, 'path');
    this.paintRect(14, 1, 5, 4, 'path');
    this.map[2][8] = 'grass';
    this.map[8][15] = 'grass';
  }

  protected placeBuildings(): void {
    this.buildings.push({ gridX: 15, gridY: 1, w: 3, h: 2, texture: 'ch2-caravanserai' });
    this.blockFootprint(15, 1, 3, 2);
  }

  protected placeDecor(): void {
    this.decor.push({ gridX: 5, gridY: 2, texture: 'ch2-shrine', blocks: true });
    this.decor.push({ gridX: 10, gridY: 4, texture: 'ch2-milestone', blocks: true });
    this.decor.push({ gridX: 18, gridY: 2, texture: 'well', blocks: true });

    const dryStream: [number, number][] = [[5, 7], [7, 8], [9, 7], [11, 8]];
    for (const [x, y] of dryStream) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch2-dry-stream' });
    }

    const cypresses: [number, number][] = [[2, 2], [7, 1], [13, 2], [1, 8], [17, 8]];
    for (const [x, y] of cypresses) {
      this.decor.push({ gridX: x, gridY: y, texture: 'cypress', blocks: true });
    }

    const tamarisks: [number, number][] = [[3, 8], [8, 2], [12, 7], [19, 7]];
    for (const [x, y] of tamarisks) {
      this.decor.push({ gridX: x, gridY: y, texture: 'ch2-tamarisk', blocks: true });
    }
  }

  protected spawnNPCs(): void {
    this.addNPC(12, 5, 'npc-traveller',
      () => 'Speak with Another Seeker  [E]',
      () => this.startSimpleDialogue('road-encounter'));

    this.addNPC(6, 3, 'npc-mulla',
      () => 'Speak with the Wandering Dervish  [E]',
      () => this.startSimpleDialogue('road-dervish'));

    this.addNPC(18, 5, 'npc-merchant',
      () => 'Speak with the Muleteer  [E]',
      () => this.startSimpleDialogue('road-muleteer'));
  }

  protected setupExits(): void {
    this.exits.push({
      fromX: 0, fromY: 5, dx: -1, dy: 0,
      targetScene: 'HouseQuarter',
      targetSpawnX: 6, targetSpawnY: 13,
      label: '← Back to Shíráz',
    });
  }
}
