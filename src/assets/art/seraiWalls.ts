import { css, shade, type Ctx } from './canvasKit';
import { brick } from './materials';
import { archPath, clipped, latticeWindow } from './ornaments';

/**
 * Wall faces for the arcade of lodging rooms round a caravanserai court (see
 * `WALL_STYLES` in `walls.ts`), painted in cell-aligned pattern space: one
 * arched bay per cell.
 */

const SERAI_BRICK = 0xc49a64;

/**
 * One bay of the arcade round the court: brick piers, a pointed arch over a
 * shallow iwan, and the low door of a lodging room at the back of it.
 */
export function seraiBayFace(ctx: Ctx, w: number, h: number, l: number, lit: boolean): void {
  brick(ctx, w, h, { base: SERAI_BRICK, light: l, seed: l === 1 ? 621 : 622 }, 4, 8);
  // Plinth: the raised platform edge in front of the rooms.
  clipped(ctx, w, h, () => {
    ctx.fillStyle = css(shade(0x9a8a70, l));
    ctx.fillRect(0, h - 6, w, 6);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(0, h - 6, w, 1);
  });
  // Cornice.
  ctx.fillStyle = css(shade(0xd8b880, l));
  ctx.fillRect(0, 0, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 3, w, 1);
  // The iwan arch and its shaded recess.
  archPath(ctx, 4, h - 6, 24, 54);
  ctx.fillStyle = css(shade(0xe0c890, l * 0.92));
  ctx.fill();
  archPath(ctx, 5.5, h - 6, 21, 51);
  ctx.fillStyle = css(shade(0x8a6a48, l * 0.7));
  ctx.fill();
  // The room door, person-sized, at the back of the recess.
  archPath(ctx, 10, h - 6, 12, 36);
  if (lit) {
    const g = ctx.createLinearGradient(0, h - 42, 0, h - 6);
    g.addColorStop(0, '#ffd890');
    g.addColorStop(1, '#b86a2a');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = css(0x1a100a);
  }
  ctx.fill();
  if (lit) {
    // A striped curtain looped back to one side.
    ctx.fillStyle = css(shade(0x8a2f26, l));
    ctx.beginPath();
    ctx.moveTo(10, h - 34);
    ctx.quadraticCurveTo(16, h - 40, 16, h - 36);
    ctx.quadraticCurveTo(13, h - 22, 15, h - 6);
    ctx.lineTo(10, h - 6);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(shade(0xd8c7a0, l), 0.8);
    ctx.fillRect(11.5, h - 30, 1, 23);
  }
  // A small lamp niche in the pier.
  archPath(ctx, 26.5, h - 30, 4, 7);
  ctx.fillStyle = css(shade(0x3a2616, l));
  ctx.fill();
}

/** The court wall with a high lattice window lit from within. */
export function seraiWindowFace(ctx: Ctx, w: number, h: number, l: number): void {
  brick(ctx, w, h, { base: SERAI_BRICK, light: l, seed: l === 1 ? 623 : 624 }, 4, 8);
  clipped(ctx, w, h, () => {
    ctx.fillStyle = css(shade(0x9a8a70, l));
    ctx.fillRect(0, h - 6, w, 6);
  });
  ctx.fillStyle = css(shade(0xd8b880, l));
  ctx.fillRect(0, 0, w, 3);
  latticeWindow(ctx, 12, 22, 8, 12, { frame: 0x8a6440, light: l, lit: true, arched: true });
}
