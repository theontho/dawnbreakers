import Phaser from 'phaser';
import { TILE_H, TILE_W } from './baseMapTypes';
import type { EditorPlacedObject, ObjectFootprint } from './mapEditorTypes';

const SINGLE_TILE: ObjectFootprint = { w: 1, h: 1 };

export function pointerToEditorGrid(
  pointer: Phaser.Input.Pointer,
  originX: number,
  originY: number,
  width: number,
  height: number,
): { x: number; y: number } | undefined {
  const a = (pointer.x - originX) / (TILE_W / 2);
  const b = (pointer.y - originY) / (TILE_H / 2);
  const x = Math.round((a + b) / 2);
  const y = Math.round((b - a) / 2);
  return x >= 0 && y >= 0 && x < width && y < height ? { x, y } : undefined;
}

export function editorGridToScreen(
  originX: number,
  originY: number,
  gx: number,
  gy: number,
): { sx: number; sy: number } {
  return {
    sx: originX + (gx - gy) * (TILE_W / 2),
    sy: originY + (gx + gy) * (TILE_H / 2),
  };
}

export function tileDiamond(sx: number, sy: number): Phaser.Types.Math.Vector2Like[] {
  return [
    { x: sx, y: sy - TILE_H / 2 },
    { x: sx + TILE_W / 2, y: sy },
    { x: sx, y: sy + TILE_H / 2 },
    { x: sx - TILE_W / 2, y: sy },
  ];
}

export function objectFrontCell(
  obj: EditorPlacedObject,
  footprint: ObjectFootprint = SINGLE_TILE,
): { x: number; y: number } {
  return {
    x: obj.x + footprint.w - 1,
    y: obj.y + footprint.h - 1,
  };
}

export function objectTouchesCell(
  obj: EditorPlacedObject,
  x: number,
  y: number,
  footprint: ObjectFootprint = SINGLE_TILE,
): boolean {
  return x >= obj.x && y >= obj.y && x < obj.x + footprint.w && y < obj.y + footprint.h;
}

export function footprintCells(
  x: number,
  y: number,
  footprint: ObjectFootprint = SINGLE_TILE,
): Array<{ x: number; y: number }> {
  const cells: Array<{ x: number; y: number }> = [];
  for (let dy = 0; dy < footprint.h; dy++) {
    for (let dx = 0; dx < footprint.w; dx++) {
      cells.push({ x: x + dx, y: y + dy });
    }
  }
  return cells;
}

export function footprintInBounds(
  x: number,
  y: number,
  footprint: ObjectFootprint = SINGLE_TILE,
  width?: number,
  height?: number,
): boolean {
  return width !== undefined &&
    height !== undefined &&
    x >= 0 &&
    y >= 0 &&
    x + footprint.w <= width &&
    y + footprint.h <= height;
}
