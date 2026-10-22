import type Phaser from 'phaser';
import { TILE_H, TILE_W, type Building } from './baseMapTypes';

/**
 * Draws a building as vertical slices, each sorted by the front of the
 * footprint in its own screen column.
 *
 * One depth cannot sort a wide building: a tree a row in front of its west
 * end has a lower depth than the building's front corner far to the east, so
 * the whole building would be drawn over it. Each slice is half a tile wide
 * (one screen column of the grid's diagonal) and takes the depth halfway
 * between the frontmost footprint cells of the two grid columns it spans, so
 * anything a row in front of the building in that column is drawn over it
 * and anything a row behind is drawn under it. Slices are frames of the
 * building's own texture, so they cost no extra texture memory.
 */

const SLICE = TILE_W / 2;

/**
 * Splits `whole` (already placed and anchored at the building's front
 * corner) into slices and destroys it. A one-cell building keeps its single
 * sprite.
 */
export function sliceBuilding(
  scene: Phaser.Scene,
  whole: Phaser.GameObjects.Image,
  building: Building,
  origin: { x: number; y: number },
): Phaser.GameObjects.Image[] {
  const x1 = building.gridX + building.w - 1;
  const y1 = building.gridY + building.h - 1;
  const depthOfSum = (sum: number) => origin.y + sum * (TILE_H / 2) + 1;
  if (building.w === 1 && building.h === 1) return [whole.setDepth(depthOfSum(x1 + y1))];

  // Grid column k = gx - gy; the frontmost footprint cell in it has the largest gx.
  const kMin = building.gridX - y1;
  const kMax = x1 - building.gridY;
  const frontSum = (k: number) => {
    const col = Math.max(kMin, Math.min(kMax, k));
    const gx = Math.min(x1, y1 + col);
    return 2 * gx - col;
  };

  const frame = whole.frame;
  const left = whole.x - whole.displayWidth * whole.originX;
  const right = left + frame.width;
  const slices: Phaser.GameObjects.Image[] = [];
  for (let x = left; x < right - 0.5;) {
    // The slice between grid columns k and k + 1 (their centres are SLICE apart).
    const k = Math.floor((x - origin.x) / SLICE + 1e-6);
    const end = Math.min(right, origin.x + (k + 1) * SLICE);
    const u0 = Math.round(x - left);
    const u1 = Math.round(end - left);
    if (u1 > u0) {
      const name = `${frame.name}|slice:${u0}-${u1}`;
      if (!whole.texture.has(name)) {
        const first = whole.texture.firstFrame;
        whole.texture.add(name, frame.sourceIndex, frame.cutX + u0, frame.cutY, u1 - u0, frame.cutHeight);
        // Phaser makes the first added frame the texture's default; keep the whole image as the default.
        whole.texture.firstFrame = first;
      }
      slices.push(scene.add.image(left + u0, whole.y, whole.texture.key, name)
        .setOrigin(0, whole.originY)
        .setDepth(depthOfSum((frontSum(k) + frontSum(k + 1)) / 2)));
    }
    x = end;
  }
  whole.destroy();
  return slices;
}
