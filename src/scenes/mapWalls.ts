import type Phaser from 'phaser';
import { ensureWallTexture, wallTextureKey, WALL_E, WALL_N, WALL_S, WALL_STYLES, WALL_W } from '../assets/art/walls';
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
    const joins = (x: number, y: number): boolean => {
      const other = occupant.get(key(x, y));
      return other === item.texture || (other !== undefined && (style.joins ?? []).includes(other.split('~')[0]!));
    };
    const { gridX: x, gridY: y } = item;
    const mask = (joins(x, y - 1) ? WALL_N : 0) | (joins(x + 1, y) ? WALL_E : 0)
      | (joins(x, y + 1) ? WALL_S : 0) | (joins(x - 1, y) ? WALL_W : 0);
    // The south and east edges face the camera: cut those walls away.
    const cut = y === size.height - 1 || x === size.width - 1;
    ensureWallTexture(scene, item.texture, mask, cut);
    item.texture = wallTextureKey(item.texture, mask, cut);
  };
  for (const b of buildings) if (b.w === 1 && b.h === 1) connect(b);
  decor.forEach(connect);
}
