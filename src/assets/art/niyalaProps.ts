import type Phaser from 'phaser';
import { css, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow } from './structureParts';

/**
 * What the plunderers left in the camp below Niyálá: the Keeper of Names'
 * ledger dropped in the grass with its spine split, and Ṭáhirih's odes,
 * copied out on loose sheets, blown against a stone. Both lie on the
 * ground, a hand's height at most, at true scale (1 m is about 23 px).
 */

const PAPER = 0xefe4c8;
const INK = 0x2a2420;

/** A loose sheet lying on the ground, foreshortened, with lines of writing. */
function sheet(ctx: Ctx, cx: number, cy: number, angle: number, tone: number, lines = 5): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.scale(1, 0.55);
  ctx.fillStyle = 'rgba(10,6,3,0.22)';
  ctx.fillRect(-6.5, -8, 14, 18);
  ctx.fillStyle = css(shade(PAPER, tone));
  ctx.fillRect(-7, -9, 14, 18);
  ctx.fillStyle = css(INK, 0.55);
  for (let i = 0; i < lines; i += 1) ctx.fillRect(-5, -6 + i * 3, 9 - (i % 2) * 2, 0.9);
  ctx.restore();
}

/** The Keeper of Names' ledger, face down and splayed, a hoofprint pressed into one open page. */
export function paintSplitLedger(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 34, ctx => {
    ellipseShadow(ctx, 24, 26, 17, 4.5, 0.3);
    // A page torn free, lying apart.
    sheet(ctx, 37, 25, 0.5, 0.95, 4);
    // The two boards of the binding, leather gone dark with handling, splayed open.
    const leather = 0x5a2e22;
    for (const [dx, tilt] of [[-7, -0.18], [7, 0.22]] as const) {
      ctx.save();
      ctx.translate(22 + dx, 24);
      ctx.rotate(tilt);
      ctx.scale(1, 0.5);
      ctx.fillStyle = css(shade(leather, 0.7));
      ctx.fillRect(-8, -10, 16, 21);
      ctx.fillStyle = css(leather);
      ctx.fillRect(-8, -11, 16, 20);
      // Page edges showing along the fore-edge.
      ctx.fillStyle = css(shade(PAPER, 0.85));
      ctx.fillRect(dx < 0 ? -9 : 7, -10, 2, 18);
      ctx.restore();
    }
    // The split spine, its stitching showing.
    ctx.strokeStyle = css(0xd8c8a0);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(21.5, 19);
    ctx.lineTo(22.5, 29);
    ctx.stroke();
    // One leaf turned back across the binding, a hoof's crescent in the dirt on it.
    sheet(ctx, 15, 22, -0.3, 1, 5);
    ctx.strokeStyle = css(0x4a3a28, 0.75);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(15, 22.5, 3.6, 2, -0.3, Math.PI * 0.15, Math.PI * 1.15);
    ctx.stroke();
  });
}

/** Ṭáhirih's odes on loose sheets, scattered and caught against a fist-sized stone. */
export function paintStrewnOdes(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 52, 34, ctx => {
    const rand = rng(1848);
    ellipseShadow(ctx, 26, 26, 19, 4.5, 0.2);
    // The stone they blew against.
    const stone = 0x8a8478;
    ctx.fillStyle = css(shade(stone, 0.65));
    ctx.beginPath();
    ctx.ellipse(31, 24, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(stone);
    ctx.beginPath();
    ctx.ellipse(30.5, 22.5, 6, 3.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(shade(stone, 1.25));
    ctx.beginPath();
    ctx.ellipse(29, 21.4, 3, 1.6, -0.2, 0, Math.PI * 2);
    ctx.fill();
    // Sheets: some flat, one propped against the stone, edges lifting.
    const spots: Array<[number, number]> = [[14, 26], [21, 21], [40, 27], [10, 20], [24, 28]];
    for (const [x, y] of spots) sheet(ctx, x + rand() * 2, y, (rand() - 0.5) * 1.6, 0.9 + rand() * 0.12);
    ctx.save();
    ctx.translate(35, 19);
    ctx.rotate(0.35);
    ctx.fillStyle = css(PAPER);
    ctx.fillRect(-5, -9, 11, 14);
    ctx.fillStyle = css(INK, 0.5);
    for (let i = 0; i < 4; i += 1) ctx.fillRect(-3.5, -7 + i * 3, 8, 0.9);
    ctx.restore();
    // The boot-print across the last verse of one sheet.
    ctx.fillStyle = css(0x4a3a28, 0.5);
    ctx.beginPath();
    ctx.ellipse(24.5, 28, 3.2, 1.3, 0.2, 0, Math.PI * 2);
    ctx.fill();
  });
}
