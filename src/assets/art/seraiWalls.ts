import { css, shade, type Ctx } from './canvasKit';
import { brick } from './materials';
import { recess } from './massing';
import { archPath, clipped, latticeWindow } from './ornaments';

/**
 * Wall faces for the arcade of lodging rooms round a caravanserai court (see
 * `WALL_STYLES` in `wallStyles.ts`), at true scale and painted in cell-aligned
 * pattern space: one arched bay per cell (1.4 m), a storey and its parapet
 * high, the rooms' doors 22 x 48 px at the back of the bays.
 */

export const SERAI_BAY_H = 104;

const SERAI_BRICK = 0xc49a64;
const PLATFORM = 10;

/** The brick wall, the raised platform's edge at its foot and the cornice along its head. */
function arcadeWall(ctx: Ctx, w: number, h: number, l: number, seed: number): void {
  brick(ctx, w, h, { base: SERAI_BRICK, light: l, seed: l === 1 ? seed : seed + 1 }, 4, 8);
  clipped(ctx, w, h, () => {
    ctx.fillStyle = css(shade(0x9a8a70, l));
    ctx.fillRect(0, h - PLATFORM, w, PLATFORM);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, h - PLATFORM, w, 1);
  });
  ctx.fillStyle = css(shade(0xd8b880, l));
  ctx.fillRect(0, 0, w, 4);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 4, w, 1);
  ctx.fillStyle = css(shade(0x2e8c96, l));
  ctx.fillRect(0, 9, w, 2.5);
}

/**
 * One bay of the arcade round the court: a pointed arch over a shallow
 * iwan, and the door of a lodging room at the back of it, lamplit with its
 * curtain looped back, or dark.
 */
export function seraiBayFace(ctx: Ctx, w: number, h: number, l: number, lit: boolean): void {
  arcadeWall(ctx, w, h, l, 621);
  const base = h - PLATFORM;
  recess(ctx, 3, base, w - 6, 74, SERAI_BRICK, l);
  const dw = 20;
  const dh = 48;
  const dx = w / 2 - dw / 2;
  archPath(ctx, dx - 1.5, base, dw + 3, dh + 1.5);
  ctx.fillStyle = css(shade(0x8a6440, l * 0.85));
  ctx.fill();
  archPath(ctx, dx, base, dw, dh);
  if (lit) {
    const g = ctx.createLinearGradient(0, base - dh, 0, base);
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
    ctx.moveTo(dx, base - dh + 8);
    ctx.quadraticCurveTo(dx + 8, base - dh, dx + 8, base - dh + 6);
    ctx.quadraticCurveTo(dx + 4, base - 22, dx + 6, base);
    ctx.lineTo(dx, base);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(shade(0xd8c7a0, l), 0.8);
    ctx.fillRect(dx + 2, base - dh + 10, 1, dh - 11);
  }
}

/** The court wall with a high lattice window lit from within. */
export function seraiWindowFace(ctx: Ctx, w: number, h: number, l: number): void {
  arcadeWall(ctx, w, h, l, 623);
  latticeWindow(ctx, w / 2 - 7, h - 56 - 20, 14, 20, { frame: 0x8a6440, light: l, lit: true, arched: true });
}
