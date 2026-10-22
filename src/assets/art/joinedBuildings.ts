import type Phaser from 'phaser';
import { paintArcadeBay, paintMinaret } from './meccaArcade';
import { paintBridgeSpan } from './isfahanBridge';
import { paintBazaarRow } from './town/bazaar';
import { paintPrayerArcade } from './vakil';
import { paintVakilPortal } from './vakilHall';

/**
 * Buildings placed as modules that join their neighbours: a bazaar row
 * continued by the next row, an arcade by the next bay. A module is painted
 * for the sides it joins (a 4-bit mask, the same N, E, S, W bits as walls),
 * so where two meet their roofs run on and no outline or end face shows at
 * the seam. The scene picks the variant (see `connectBuildings`).
 */

export const JOIN_N = 1;
export const JOIN_E = 2;
export const JOIN_S = 4;
export const JOIN_W = 8;

export interface JoinedBuilding {
  /** Other textures this module joins besides its own. */
  joins?: readonly string[];
  paint: (scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, mask: number) => void;
}

export const JOINED_BUILDINGS: Readonly<Record<string, JoinedBuilding>> = {
  'bazaar-row': { paint: paintBazaarRow },
  'ch3-arcade': { joins: ['ch3-minaret'], paint: paintArcadeBay },
  'ch3-minaret': { joins: ['ch3-arcade'], paint: paintMinaret },
  'ch5-bridge-span': { paint: paintBridgeSpan },
  'ch4-prayer-arch': { joins: ['ch4-vakil-portal'], paint: paintPrayerArcade },
  'ch4-vakil-portal': { joins: ['ch4-prayer-arch'], paint: paintVakilPortal },
};

export function joinedBuildingKey(texture: string, mask: number): string {
  return `${texture}#${mask}`;
}

export function ensureJoinedBuildingTexture(scene: Phaser.Scene, texture: string, cellsW: number, cellsD: number, mask: number): string {
  const key = mask === 0 ? texture : joinedBuildingKey(texture, mask);
  if (!scene.textures.exists(key)) JOINED_BUILDINGS[texture]!.paint(scene, key, cellsW, cellsD, mask);
  return key;
}
