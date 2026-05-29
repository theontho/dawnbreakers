import { BaseMapScene } from './BaseMapScene';

/**
 * Chapter 2 stub — a quiet road north of Shíráz where the newly-dispersed
 * Letters of the Living encounter fellow seekers.
 */
export class RoadScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 8;
  protected sceneTitle = 'The Road North';

  constructor() { super('Road'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 1, y: 4 };
  }

  protected buildMap(): void {
    // The road itself
    for (let x = 0; x < this.mapWidth; x++) this.map[4][x] = 'path';
    // A wayside patch of sand
    this.paintRect(8, 5, 3, 1, 'sand');
    // A small pool fed by a spring
    this.map[3][6] = 'water'; this.blockTile(6, 3);
  }

  protected placeBuildings(): void {
    // No buildings on the road — wilderness
  }

  protected placeDecor(): void {
    const trees: [number, number][] = [
      [2, 1], [4, 2], [7, 1], [11, 2], [13, 1], [15, 2],
      [1, 6], [3, 7], [9, 7], [12, 6], [16, 7], [5, 7],
      [16, 1], [0, 7], [17, 5],
    ];
    for (const [x, y] of trees) {
      this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });
    }
    // A traveller's well at the wayside
    this.decor.push({ gridX: 9, gridY: 5, texture: 'well', blocks: true });
  }

  protected spawnNPCs(): void {
    // Another seeker — meets the player mid-road
    this.addNPC(10, 4, 'npc-traveller',
      () => 'Speak with Another Seeker  [E]',
      () => this.startSimpleDialogue('road-encounter'));
  }

  protected setupExits(): void {
    // Walking west off the road tile (0,4) returns to the city's north quarter
    this.exits.push({
      fromX: 0, fromY: 4, dx: -1, dy: 0,
      targetScene: 'HouseQuarter',
      targetSpawnX: 6, targetSpawnY: 13,
      label: '← Back to Shíráz',
    });
  }
}
