import type Phaser from 'phaser';
import { ensureJoinedBuildingTexture, JOIN_E, JOIN_N, JOIN_S, JOIN_W, JOINED_BUILDINGS } from '../assets/art/joinedBuildings';
import type { Building } from './baseMapTypes';

/**
 * Joins modular buildings into continuous ranges. A building whose texture
 * is a joined module (see JOINED_BUILDINGS) gets the variant painted for the
 * sides where a module it joins fills the whole length of its edge.
 */
export function connectBuildings(scene: Phaser.Scene, buildings: Building[]): void {
  const occupant = new Map<string, string>();
  const key = (x: number, y: number) => `${x},${y}`;
  for (const b of buildings) {
    for (let y = b.gridY; y < b.gridY + b.h; y++) {
      for (let x = b.gridX; x < b.gridX + b.w; x++) occupant.set(key(x, y), b.texture.split('~')[0]!);
    }
  }
  for (const b of buildings) {
    const module = JOINED_BUILDINGS[b.texture];
    if (!module) continue;
    const joins = (x: number, y: number): boolean => {
      const other = occupant.get(key(x, y));
      return other === b.texture || (other !== undefined && (module.joins ?? []).includes(other));
    };
    const along = (cells: Array<[number, number]>): boolean => cells.every(([x, y]) => joins(x, y));
    const xs = Array.from({ length: b.w }, (_, i) => b.gridX + i);
    const ys = Array.from({ length: b.h }, (_, i) => b.gridY + i);
    const mask = (along(xs.map(x => [x, b.gridY - 1])) ? JOIN_N : 0)
      | (along(ys.map(y => [b.gridX + b.w, y])) ? JOIN_E : 0)
      | (along(xs.map(x => [x, b.gridY + b.h])) ? JOIN_S : 0)
      | (along(ys.map(y => [b.gridX - 1, y])) ? JOIN_W : 0);
    b.texture = ensureJoinedBuildingTexture(scene, b.texture, b.w, b.h, mask);
  }
}
