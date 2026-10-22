import { variantTexture } from '../assets/art';
import { BUILDING_FRONTS } from '../assets/art/buildingFronts';
import { CELL } from '../assets/art/canvasKit';
import type { BuildingSpec } from '../data/maps/types';

/**
 * The street fronts of a map's buildings (see BuildingFront): which face of
 * each building is its own front on the street, the footprint cells along
 * it, and the cell its door is painted on.
 */
export interface StreetFront {
  building: BuildingSpec;
  /** The placed texture, variant included. */
  texture: string;
  side: 's' | 'e';
  /** The footprint's cells along the front face, west to east or south to north. */
  cells: Array<readonly [number, number]>;
  /** The cell the door is painted on, and the door's foot relative to that cell's centre on screen. */
  door?: { x: number; y: number; foot: { dx: number; dy: number } };
}

export function streetFronts(buildings: readonly BuildingSpec[]): StreetFront[] {
  return buildings.flatMap(b => {
    const texture = variantTexture(b.texture, b.gridX, b.gridY, b.variant);
    const front = BUILDING_FRONTS[texture];
    if (!front) return [];
    const south = front.side === 's';
    const length = south ? b.w : b.h;
    const cell = (i: number) => (south ? [b.gridX + i, b.gridY + b.h - 1] as const : [b.gridX + b.w - 1, b.gridY + b.h - 1 - i] as const);
    const cells = Array.from({ length }, (_, i) => cell(i));
    if (front.door === undefined) return [{ building: b, texture, side: front.side, cells }];
    const i = Math.min(length - 1, Math.floor(front.door / CELL));
    const [x, y] = cell(i);
    // From the cell's middle out to the face (half a cell), then along it to the door.
    const along = front.door - (i + 0.5) * CELL;
    const foot = south ? { dx: along - CELL / 2, dy: along / 2 + CELL / 4 } : { dx: along + CELL / 2, dy: CELL / 4 - along / 2 };
    return [{ building: b, texture, side: front.side, cells, door: { x, y, foot } }];
  });
}
