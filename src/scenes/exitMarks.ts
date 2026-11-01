import Phaser from 'phaser';
import { makeTextureGraphics } from './graphicsFactory';
import { gridToIsoScreen } from './isoGeometry';
import { TILE_H, TILE_W, type MapExit } from './baseMapTypes';

/**
 * A mark floating over each way out of a map, like the arch over a door: a
 * small golden badge with an arrow pointing the way the road leaves, nudging
 * that way. One per road, over its middle, however wide the exit is.
 */

const BADGE = 'fx-exit-badge';
const ARROW = 'fx-exit-arrow';
/** Level with the door marks: above the scenery, below ghosts and the HUD. */
const MARK_DEPTH = 8990;
/** Height above the exit's cell, clear of a person standing on it. */
const MARK_LIFT = 46;

export interface ExitMark {
  /** The exits of this road. */
  exits: readonly MapExit[];
  mark: Phaser.GameObjects.Container;
}

export function placeExitMarks(scene: Phaser.Scene, originX: number, originY: number, exits: readonly MapExit[]): ExitMark[] {
  ensureTextures(scene);
  return roads(exits).map(road => {
    const cells = road.map(exit => gridToIsoScreen(originX, originY, exit.fromX, exit.fromY));
    const x = cells.reduce((sum, c) => sum + c.sx, 0) / cells.length;
    const y = cells.reduce((sum, c) => sum + c.sy, 0) / cells.length + TILE_H / 2 - MARK_LIFT;
    const { dx, dy } = road[0]!;
    // The step's direction on screen, from the iso grid's two axes.
    const angle = Math.atan2((dx + dy) * TILE_H / 2, (dx - dy) * TILE_W / 2);
    const arrow = scene.add.image(0, -11, ARROW).setRotation(angle);
    const mark = scene.add.container(x, y, [scene.add.image(0, 0, BADGE).setOrigin(0.5, 1), arrow]).setDepth(MARK_DEPTH);
    scene.tweens.add({ targets: mark, y: y - 3, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    scene.tweens.add({
      targets: arrow,
      x: Math.cos(angle) * 2,
      y: -11 + Math.sin(angle) * 2,
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return { exits: road, mark };
  });
}

/** Exits grouped into roads: the same way to the same place, cell beside cell. */
function roads(exits: readonly MapExit[]): MapExit[][] {
  const groups: MapExit[][] = [];
  for (const exit of exits) {
    const joined = groups.filter(group => group.some(other => sameRoad(exit, other)));
    const merged = [exit, ...joined.flat()];
    for (const group of joined) groups.splice(groups.indexOf(group), 1);
    groups.push(merged);
  }
  return groups;
}

function sameRoad(a: MapExit, b: MapExit): boolean {
  return a.targetScene === b.targetScene && a.dx === b.dx && a.dy === b.dy
    && Math.abs(a.fromX - b.fromX) + Math.abs(a.fromY - b.fromY) === 1;
}

function ensureTextures(scene: Phaser.Scene): void {
  if (!scene.textures.exists(BADGE)) {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x1a120a, 0.9);
    g.fillRoundedRect(1, 1, 20, 20, 6);
    g.lineStyle(1.5, 0xf3d98a, 1);
    g.strokeRoundedRect(1, 1, 20, 20, 6);
    g.generateTexture(BADGE, 22, 22);
    g.destroy();
  }
  if (!scene.textures.exists(ARROW)) {
    // Pointing right; turned to the road's way.
    const g = makeTextureGraphics(scene);
    g.fillStyle(0xf3d98a, 1);
    g.fillTriangle(13, 6, 6, 1, 6, 11);
    g.fillRect(1, 4.5, 6, 3);
    g.generateTexture(ARROW, 14, 12);
    g.destroy();
  }
}
