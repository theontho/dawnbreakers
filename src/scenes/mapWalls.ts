import type Phaser from 'phaser';
import { TOWN_BUILDING_FACES } from '../assets/art/town';
import { ensureWallTexture, wallTextureKey, WALL_E, WALL_N, WALL_S, WALL_W, type WallReach } from '../assets/art/wallPainter';
import { WALL_STYLES } from '../assets/art/wallStyles';
import type { Building, Decor } from './baseMapTypes';

/**
 * Joins wall pieces into continuous runs. Each one-cell wall (decor or a
 * 1x1 building) is given the texture painted for the neighbours it touches:
 * the same wall, or anything its style says it joins (a gate, a tower).
 * Walls on the map's camera-facing edges are cut down so they do not hide
 * the scene.
 */
export function connectWalls(scene: Phaser.Scene, buildings: Building[], decor: Decor[], size: { width: number; height: number }): void {
  const occupant = new Map<string, string>();
  const key = (x: number, y: number) => `${x},${y}`;
  for (const b of buildings) {
    for (let y = b.gridY; y < b.gridY + b.h; y++) {
      for (let x = b.gridX; x < b.gridX + b.w; x++) occupant.set(key(x, y), b.texture);
    }
  }
  for (const d of decor) {
    if (WALL_STYLES[d.texture] || !occupant.has(key(d.gridX, d.gridY))) occupant.set(key(d.gridX, d.gridY), d.texture);
  }

  const connect = (item: { gridX: number; gridY: number; texture: string }): void => {
    const style = WALL_STYLES[item.texture];
    if (!style) return;
    const same = (x: number, y: number): boolean => occupant.get(key(x, y)) === item.texture;
    const joined = (x: number, y: number): boolean => {
      const other = occupant.get(key(x, y));
      return other !== undefined && (style.joins ?? []).includes(other.split('~')[0]!);
    };
    const { gridX: x, gridY: y } = item;
    // A wall runs into a joined building only where it meets it end on or
    // turns into it; a run passing along a building's face stays clear of it.
    const alongNS = same(x, y - 1) && same(x, y + 1);
    const alongEW = same(x - 1, y) && same(x + 1, y);
    const arm = (dx: number, dy: number): boolean =>
      same(x + dx, y + dy) || (joined(x + dx, y + dy) && !(dx !== 0 ? alongNS : alongEW));
    const mask = (arm(0, -1) ? WALL_N : 0) | (arm(1, 0) ? WALL_E : 0)
      | (arm(0, 1) ? WALL_S : 0) | (arm(-1, 0) ? WALL_W : 0);
    // Running up to a house from the south or east, reach on to its face.
    const faces = (dx: number, dy: number) => (joined(x + dx, y + dy) ? TOWN_BUILDING_FACES[occupant.get(key(x + dx, y + dy))!] : undefined);
    const reach: WallReach = {
      n: mask & WALL_N ? faces(0, -1)?.s ?? 0 : 0,
      w: mask & WALL_W ? faces(-1, 0)?.e ?? 0 : 0,
    };
    // The south and east edges face the camera: cut those walls away.
    const cut = y === size.height - 1 || x === size.width - 1;
    ensureWallTexture(scene, item.texture, mask, cut, reach);
    item.texture = wallTextureKey(item.texture, mask, cut, reach);
  };
  for (const b of buildings) if (b.w === 1 && b.h === 1) connect(b);
  decor.forEach(connect);
}
