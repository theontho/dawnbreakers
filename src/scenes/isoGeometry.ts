import Phaser from 'phaser';
import { TILE_H, TILE_W, type IsoPoint, type IsoPrism } from './baseMapTypes';

export function gridToIsoScreen(
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

export function createIsoPrism(widthCells: number, heightCells: number, wallH: number, topPad = 0): IsoPrism {
  const leftExtent = widthCells * TILE_W / 2;
  const rightExtent = heightCells * TILE_W / 2;
  const halfW = Math.max(leftExtent, rightExtent);
  const baseH = (widthCells + heightCells) * TILE_H / 2;
  const texH = baseH + wallH + topPad;
  const bottom = { x: halfW, y: texH };
  const top = {
    x: halfW + (heightCells - widthCells) * TILE_W / 2,
    y: texH - baseH,
  };
  const right = {
    x: halfW + rightExtent,
    y: texH - heightCells * TILE_H / 2,
  };
  const left = {
    x: halfW - leftExtent,
    y: texH - widthCells * TILE_H / 2,
  };
  const raise = (p: IsoPoint) => ({ x: p.x, y: p.y - wallH });

  return {
    texW: halfW * 2,
    texH,
    top,
    right,
    bottom,
    left,
    topR: raise(top),
    rightR: raise(right),
    bottomR: raise(bottom),
    leftR: raise(left),
  };
}

export function wallInsetPoints(start: IsoPoint, end: IsoPoint, from: number, to: number, height: number): IsoPoint[] {
  const along = (t: number) => ({
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  });
  const a = along(from);
  const b = along(to);

  return [a, b, { x: b.x, y: b.y - height }, { x: a.x, y: a.y - height }];
}

export function drawIsoPrismShape(
  g: Phaser.GameObjects.Graphics,
  geo: IsoPrism,
  colors: { right: number; left: number; top: number; edge?: number; alpha?: number },
): void {
  const edge = colors.edge ?? 0x2a1a0a;
  const alpha = colors.alpha ?? 1;

  g.lineStyle(2, edge, alpha);
  g.fillStyle(colors.right, 1);
  g.fillPoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);
  g.strokePoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);

  g.fillStyle(colors.left, 1);
  g.fillPoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);
  g.strokePoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);

  g.fillStyle(colors.top, 1);
  g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
  g.strokePoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
}
