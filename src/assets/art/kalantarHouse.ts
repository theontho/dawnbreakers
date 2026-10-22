import { css, shade, type Ctx } from './canvasKit';
import { planks } from './materials';
import { archPath } from './ornaments';

/**
 * The house of Maḥmúd Khán-i-Kalántar in Ṭihrán, 1850: the narrow door in
 * the back wall of the prisoners' room, behind which a stair climbs to the
 * floor where Ṭáhirih is held. One cell of interior wall (`base` paints the
 * plaster and tile dado) with a person-sized door (about 20 x 48 px) left a
 * finger's width ajar, lamplight from the stair along its edge.
 */
export function stairDoorFace(ctx: Ctx, w: number, h: number, l: number, base: (ctx: Ctx, w: number, h: number, l: number) => void): void {
  base(ctx, w, h, l);
  const dw = 20;
  const dh = 48;
  const x = (w - dw) / 2;
  // The frame and its shadowed reveal.
  archPath(ctx, x - 3, h, dw + 6, dh + 4);
  ctx.fillStyle = css(shade(0x8a6a48, l));
  ctx.fill();
  archPath(ctx, x, h, dw, dh);
  ctx.fillStyle = css(shade(0x2a1e14, l));
  ctx.fill();
  // The leaf, planked, a little open on the right: warm light on the stair beyond.
  ctx.save();
  archPath(ctx, x, h, dw, dh);
  ctx.clip();
  const glow = ctx.createLinearGradient(x + dw - 4, 0, x + dw, 0);
  glow.addColorStop(0, 'rgba(255,190,110,0.15)');
  glow.addColorStop(1, 'rgba(255,200,120,0.75)');
  ctx.fillStyle = glow;
  ctx.fillRect(x + dw - 4, h - dh, 4, dh);
  ctx.beginPath();
  ctx.rect(x, h - dh, dw - 3, dh);
  ctx.clip();
  planks(ctx, x + dw - 3, h, { base: 0x4a3420, light: l * 0.85, seed: 1701 }, true, 4);
  ctx.restore();
  // An iron ring for a handle, and the worn sill.
  ctx.strokeStyle = css(shade(0x8a867d, l), 0.9);
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.arc(x + dw - 7, h - 24, 1.8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = css(shade(0x9a8a70, l));
  ctx.fillRect(x - 3, h - 2, dw + 6, 2);
}
