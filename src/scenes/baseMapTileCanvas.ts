/**
 * Tile-canvas helpers that back `MapDefinition.build`. Extracted from
 * `MapScene` so the painting primitives can be unit-tested without
 * booting Phaser, and so `MapScene` stays under the 500 LOC guideline.
 */
import type { TileKind } from './baseMapTypes';
import type { TileCanvas } from '../data/maps/types';

export function emptyTileGrid<T>(width: number, height: number, fill: T): T[][] {
  const grid: T[][] = [];
  for (let y = 0; y < height; y += 1) {
    const row: T[] = [];
    for (let x = 0; x < width; x += 1) row.push(fill);
    grid.push(row);
  }
  return grid;
}

export function emptyMap(width: number, height: number): { map: TileKind[][]; blocked: boolean[][] } {
  return {
    map: emptyTileGrid<TileKind>(width, height, 'grass'),
    blocked: emptyTileGrid<boolean>(width, height, false),
  };
}

export function inBounds(width: number, height: number, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < width && y < height;
}

export function paintRectInto(
  map: TileKind[][],
  width: number,
  height: number,
  x0: number,
  y0: number,
  w: number,
  h: number,
  kind: TileKind,
): void {
  for (let y = y0; y < y0 + h; y += 1) {
    for (let x = x0; x < x0 + w; x += 1) {
      if (inBounds(width, height, x, y)) map[y]![x] = kind;
    }
  }
}

export function paintPathInto(
  map: TileKind[][],
  width: number,
  height: number,
  pts: ReadonlyArray<readonly [number, number]>,
): void {
  for (const [x, y] of pts) {
    if (inBounds(width, height, x, y)) map[y]![x] = 'path';
  }
}

export function blockFootprintInto(
  blocked: boolean[][],
  width: number,
  height: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) {
      if (inBounds(width, height, x + dx, y + dy)) blocked[y + dy]![x + dx] = true;
    }
  }
}

/** Build the `TileCanvas` adapter passed to `MapDefinition.build`. */
export function makeTileCanvas(
  width: number,
  height: number,
  map: TileKind[][],
  blocked: boolean[][],
): TileCanvas {
  return {
    width,
    height,
    map,
    blocked,
    paintRect: (x, y, w, h, kind) => paintRectInto(map, width, height, x, y, w, h, kind),
    paintPath: (cells) => paintPathInto(map, width, height, cells),
    setTile: (x, y, kind) => { if (inBounds(width, height, x, y)) map[y]![x] = kind; },
    block: (x, y) => { if (inBounds(width, height, x, y)) blocked[y]![x] = true; },
    unblock: (x, y) => { if (inBounds(width, height, x, y)) blocked[y]![x] = false; },
    inBounds: (x, y) => inBounds(width, height, x, y),
  };
}
