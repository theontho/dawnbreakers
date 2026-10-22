import { css, shade, type Ctx } from './canvasKit';
import { brick, glazedTiles, plaster, stone, type Surface } from './materials';
import { archPath, clipped } from './ornaments';

/**
 * Faces of the indoor connected wall styles that have no art module of their
 * own (see `WALL_STYLES` in wallStyles.ts): plastered walls, the mihrab, and
 * the Síyáh-Chál's vaults.
 */

const surf = (base: number, light: number, seed: number): Surface => ({ base, light, seed });

/** The Síyáh-Chál's vaults: sooty brick over a stone footing, streaked with damp. */
export function vaultWallFace(ctx: Ctx, w: number, h: number, l: number): void {
  brick(ctx, w, h, surf(0x3e3a36, l, 41), 4, 8);
  clipped(ctx, w, h, () => {
    ctx.translate(0, h - 22);
    stone(ctx, w, 22, surf(0x4a4844, l, 43), 7);
  });
  // Damp streaks down from the vault.
  for (let u = 3; u < w; u += 11) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(10,12,10,0.45)');
    g.addColorStop(1, 'rgba(10,12,10,0)');
    ctx.fillStyle = g;
    ctx.fillRect(u, 0, 2.5, h * 0.7);
  }
}

/** The prayer niche set into the qibla wall: a tiled frame round a pointed arch. */
export function mihrabFace(ctx: Ctx, w: number, h: number, l: number): void {
  interiorFace(ctx, w, h, l);
  ctx.fillStyle = css(shade(0x24477a, l));
  ctx.fillRect(5, 8, 22, h - 8);
  glazedFrame(ctx, 6, 9, 20, h - 10, l);
  archPath(ctx, 10, h - 2, 12, h - 22);
  ctx.fillStyle = css(shade(0xe8d9a8, l * 0.8));
  ctx.fill();
  archPath(ctx, 12, h - 2, 8, h - 28);
  ctx.fillStyle = css(shade(0x6a5638, l));
  ctx.fill();
}

/** Indoor wall: lime plaster over a dado of glazed tile, with a moulded cornice. */
export function interiorFace(ctx: Ctx, w: number, h: number, l: number): void {
  plaster(ctx, w, h, surf(0xd6c9aa, l, 301));
  clipped(ctx, w, h, () => {
    ctx.translate(0, h - 18);
    glazedTiles(ctx, w, 18, surf(0x2e7c8a, l, 302), 4);
  });
  ctx.fillStyle = css(shade(0xe8d9a8, l));
  ctx.fillRect(0, h - 19, w, 1.5);
  ctx.fillStyle = css(shade(0xb8a888, l));
  ctx.fillRect(0, 0, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 3, w, 1);
}

/** A glazed-tile frame (turquoise border, cream bead) round a panel. */
function glazedFrame(ctx: Ctx, x: number, y: number, w: number, h: number, l: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.rect(x + 3, y + 3, w - 6, h - 3);
  ctx.clip('evenodd');
  ctx.translate(x, y);
  glazedTiles(ctx, w, h, surf(0x2e8c96, l, 303), 3);
  ctx.restore();
  ctx.strokeStyle = css(shade(0xe8d9a8, l), 0.9);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}
