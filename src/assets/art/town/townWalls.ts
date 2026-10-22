import { css, shade, type Ctx } from '../canvasKit';
import { plaster, stone } from '../materials';
import { straw } from '../badashtProps';
import { clipped } from '../ornaments';

/**
 * Faces of the true-scale connected walls (see `WALL_STYLES` in walls.ts).
 * Every pattern repeats on a period that divides a cell (32 px), so the
 * courses run on unbroken from one cell's piece to the next.
 */

export const TOWN_WALL = { height: 150, color: 0xa88660 } as const;
export const COMPOUND_WALL = { height: 80, color: 0xb88d5c } as const;

/** The city wall: rammed earth in lifts on a stone footing, putlog holes, gullies cut by rain. */
export function townWallFace(ctx: Ctx, w: number, h: number, l: number): void {
  const base = TOWN_WALL.color;
  plaster(ctx, w, h, { base, light: l, seed: 1501 });
  // Formwork lifts, each about 0.8 m.
  for (let v = 18; v < h - 24; v += 18) {
    ctx.fillStyle = 'rgba(40,24,10,0.24)';
    ctx.fillRect(0, v, w, 1.2);
    ctx.fillStyle = 'rgba(255,240,210,0.1)';
    ctx.fillRect(0, v + 1.2, w, 0.8);
  }
  // Putlog holes left by the formwork, and loopholes high up.
  ctx.fillStyle = 'rgba(28,16,6,0.6)';
  for (let v = 30; v < h - 30; v += 36) for (let u = 6; u < w; u += 16) ctx.fillRect(u, v, 3, 3);
  for (let u = 13; u < w; u += 32) {
    ctx.fillStyle = 'rgba(16,10,4,0.85)';
    ctx.fillRect(u, 14, 3, 14);
    ctx.fillStyle = css(shade(base, l * 1.2), 0.5);
    ctx.fillRect(u + 3, 14, 0.8, 14);
  }
  // Gullies down from between the merlons, darker where water runs.
  for (let u = 4; u < w; u += 16) {
    const g = ctx.createLinearGradient(0, 0, 0, 40);
    g.addColorStop(0, css(shade(base, l * 0.7), 0.45));
    g.addColorStop(1, css(shade(base, l * 0.7), 0));
    ctx.fillStyle = g;
    ctx.fillRect(u - 1.5, 0, 3, 40);
  }
  clipped(ctx, w, h, () => {
    ctx.translate(0, h - 22);
    stone(ctx, w, 22, { base: 0x8f8068, light: l, seed: 1503 }, 11);
    ctx.fillStyle = 'rgba(255,240,210,0.2)';
    ctx.fillRect(0, 0, w, 1);
  });
}

/** A courtyard or garden wall: mud brick under kahgel plaster, rain-streaked, damp at the foot. */
export function compoundWallFace(ctx: Ctx, w: number, h: number, l: number): void {
  const base = COMPOUND_WALL.color;
  plaster(ctx, w, h, { base, light: l, seed: 1511 });
  straw(ctx, w, h, l, 1512);
  // Rain has washed faint streaks down from the coping; spaced unevenly within the cell so a run does not stamp.
  for (const [u, len] of [[5, 26], [19, 14], [27, 34]] as const) {
    const g = ctx.createLinearGradient(0, 8, 0, 8 + len);
    g.addColorStop(0, css(shade(base, l * 0.78), 0.4));
    g.addColorStop(1, css(shade(base, l * 0.78), 0));
    ctx.fillStyle = g;
    for (let k = u; k < w; k += 32) ctx.fillRect(k, 8, 2, len);
  }
  // A thin course of fired brick under the coping.
  ctx.fillStyle = css(shade(0xa8744a, l));
  ctx.fillRect(0, 4, w, 3);
  ctx.fillStyle = 'rgba(20,12,6,0.25)';
  ctx.fillRect(0, 7, w, 1);
}
