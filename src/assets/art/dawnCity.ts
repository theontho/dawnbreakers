import type { Ctx } from './canvasKit';
import { paintLand } from './dawnLand';
import type { DawnLayout } from './dawnLayout';
import { dawnPass, type DawnMode } from './dawnPass';
import { roadPath } from './dawnRoad';
import { paintSkyline } from './dawnSkyline';
import { paintWall } from './dawnWall';

/**
 * Shíráz at dawn from outside its walls, painted back to front in one of
 * the four layers (see `dawnPass`). The context's origin is the screen's
 * top-left; the caller translates it to crop away the open sky.
 */
export function paintDawnCity(ctx: Ctx, mode: DawnMode, layout: DawnLayout): void {
  const pass = dawnPass(mode, ctx, layout);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  paintSkyline(pass, layout);
  paintWall(pass, layout);
  paintLand(pass, layout, roadPath(layout));
}
