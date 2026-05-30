import { BaseMapScene } from './BaseMapScene';

/** Chapter 7 — the Conference of Badasht, held among three distinct camps. */
export class Ch7BadashtCampScene extends BaseMapScene {
  protected mapWidth = 18;
  protected mapHeight = 13;
  protected sceneTitle = 'Badasht — Garden Encampment';

  constructor() { super('Ch7BadashtCamp'); }

  protected getDefaultSpawn(): { x: number; y: number } {
    return { x: 8, y: 6 };
  }

  protected buildMap(): void {
    this.paintRect(0, 0, this.mapWidth, this.mapHeight, 'sand');

    this.paintRect(1, 1, 5, 4, 'grass');
    this.paintRect(12, 1, 5, 4, 'grass');
    this.paintRect(5, 8, 8, 4, 'grass');
    this.paintRect(7, 5, 4, 3, 'stone');

    this.paintRect(2, 3, 3, 1, 'path');
    this.paintRect(13, 3, 3, 1, 'path');
    this.paintRect(7, 9, 4, 1, 'path');

    this.paintPath([
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6],
      [10, 6], [11, 6], [12, 6], [13, 6], [14, 6], [15, 6], [16, 6], [17, 6],
      [4, 5], [5, 5], [6, 5], [11, 5], [12, 5], [13, 5],
      [8, 7], [8, 8], [8, 9], [8, 10], [8, 11], [9, 7], [9, 8], [9, 9], [9, 10],
    ]);
  }

  protected placeBuildings(): void {
    this.buildings.push(
      { gridX: 1, gridY: 2, w: 3, h: 2, texture: 'ch7-tent-reconciliation' },
      { gridX: 14, gridY: 2, w: 3, h: 2, texture: 'ch7-tent-quddus' },
      { gridX: 7, gridY: 10, w: 3, h: 2, texture: 'ch7-garden-canopy' },
    );

    this.blockFootprint(1, 2, 3, 2);
    this.blockFootprint(14, 2, 3, 2);
    this.blockFootprint(7, 10, 3, 2);
  }

  protected placeDecor(): void {
    const trees: [number, number][] = [
      [0, 1], [1, 0], [5, 1], [0, 4], [5, 4],
      [12, 0], [16, 0], [17, 2], [12, 4], [17, 5],
      [4, 9], [5, 11], [12, 9], [13, 11], [10, 12],
    ];
    for (const [x, y] of trees) this.decor.push({ gridX: x, gridY: y, texture: 'tree', blocks: true });

    this.decor.push(
      { gridX: 4, gridY: 3, texture: 'rug' },
      { gridX: 13, gridY: 3, texture: 'rug' },
      { gridX: 10, gridY: 9, texture: 'rug' },
      { gridX: 6, gridY: 8, texture: 'lamp' },
      { gridX: 11, gridY: 8, texture: 'lamp' },
      { gridX: 6, gridY: 11, texture: 'ch7-rosebush', blocks: true },
      { gridX: 11, gridY: 11, texture: 'ch7-rosebush', blocks: true },
      { gridX: 3, gridY: 1, texture: 'lamp' },
      { gridX: 15, gridY: 1, texture: 'lamp' },
    );
  }

  protected spawnNPCs(): void {
    this.addNPC(8, 9, 'ch7-npc-tahirih',
      () => 'Speak with Ṭáhirih  [E]',
      () => this.startSimpleDialogue('ch7-unveiling'));

    this.addNPC(13, 5, 'ch7-npc-quddus',
      () => 'Speak with Quddús  [E]',
      () => this.startSimpleDialogue('ch7-quddus-tension'));

    this.addNPC(5, 5, 'lamp',
      () => 'Listen at the central tent  [E]',
      () => this.startSimpleDialogue('ch7-bahaullah-reconcile'));

    this.addNPC(9, 5, 'ch7-npc-believer',
      () => 'Speak with a shaken believer  [E]',
      () => this.startSimpleDialogue('ch7-shaken-believer'));
  }

  protected setupExits(): void {
    // The chapter selector and manager own inter-chapter travel for this scene.
  }
}
