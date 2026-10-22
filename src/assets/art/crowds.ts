import { css, shade, type Ctx } from './canvasKit';
import { ellipseShadow, sideGradient } from './fieldKit';

/**
 * Small robed figures for crowd and pilgrim props: background people who
 * fill a mosque courtyard or a ship's bow without being characters you can
 * talk to. A little shorter than a character sprite, so they read as
 * background.
 */

export type Headwear = 'turban' | 'kolah' | 'scarf' | 'chador' | 'bare';

export interface FigureStyle {
  robe: number;
  /** Sash, cloak lining or shawl over the shoulders. */
  trim?: number;
  head: Headwear;
  headColor?: number;
  skin: number;
  beard?: number;
  /** Seated cross-legged instead of standing. */
  seated?: boolean;
  /** Height of a standing figure in pixels. */
  height?: number;
}

/** Paint one figure standing (or seated) with its feet at (x, ground). */
export function figure(ctx: Ctx, x: number, ground: number, style: FigureStyle): void {
  const h = style.height ?? 31;
  const seated = style.seated ?? false;
  const bodyH = seated ? h * 0.42 : h * 0.72;
  const halfBase = seated ? h * 0.36 : h * 0.2;
  const halfShoulder = h * 0.15;
  const top = ground - bodyH;
  ellipseShadow(ctx, x + 2, ground, halfBase + 3, 2.6, 0.3);

  // Robe: a flared bell of cloth, lit from the left.
  ctx.beginPath();
  ctx.moveTo(x - halfShoulder, top + 1.5);
  ctx.quadraticCurveTo(x - halfBase * 0.9, top + bodyH * 0.5, x - halfBase, ground - 0.5);
  ctx.quadraticCurveTo(x, ground + 1.5, x + halfBase, ground - 0.5);
  ctx.quadraticCurveTo(x + halfBase * 0.9, top + bodyH * 0.5, x + halfShoulder, top + 1.5);
  ctx.quadraticCurveTo(x, top - 1, x - halfShoulder, top + 1.5);
  ctx.closePath();
  ctx.fillStyle = sideGradient(ctx, x - halfBase, x + halfBase, style.robe);
  ctx.fill();
  ctx.strokeStyle = css(shade(style.robe, 0.4), 0.85);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Folds falling from the shoulders.
  ctx.strokeStyle = css(shade(style.robe, 0.7), 0.7);
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(x - 1, top + 4);
  ctx.lineTo(x - halfBase * 0.35, ground - 1);
  ctx.moveTo(x + 2, top + 4);
  ctx.lineTo(x + halfBase * 0.45, ground - 1);
  ctx.stroke();
  if (style.trim !== undefined) {
    // An ʿabá or shawl edge down the front, or a sash at the waist.
    ctx.fillStyle = css(style.trim);
    if (seated) ctx.fillRect(x - halfShoulder, top + 3, halfShoulder * 2, 1.6);
    else {
      ctx.fillRect(x - halfShoulder + 1, top + 2, 1.4, bodyH - 3);
      ctx.fillRect(x + halfShoulder - 2.4, top + 2, 1.4, bodyH - 3);
    }
  }

  // Head.
  const r = h * 0.13;
  const hy = top - r * 0.7;
  if (style.head === 'chador') {
    // A chador falls from the crown over the whole figure.
    const c = style.headColor ?? 0x2a2424;
    ctx.beginPath();
    ctx.moveTo(x, hy - r * 1.3);
    ctx.quadraticCurveTo(x - r * 1.6, hy - r, x - halfBase - 0.5, ground);
    ctx.lineTo(x + halfBase + 0.5, ground);
    ctx.quadraticCurveTo(x + r * 1.6, hy - r, x, hy - r * 1.3);
    ctx.fillStyle = sideGradient(ctx, x - halfBase, x + halfBase, c);
    ctx.fill();
    ctx.fillStyle = css(style.skin);
    ctx.beginPath();
    ctx.ellipse(x - r * 0.25, hy, r * 0.55, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  const face = ctx.createRadialGradient(x - r * 0.4, hy - r * 0.4, 0.5, x, hy, r * 1.2);
  face.addColorStop(0, css(shade(style.skin, 1.15)));
  face.addColorStop(1, css(shade(style.skin, 0.7)));
  ctx.fillStyle = face;
  ctx.beginPath();
  ctx.arc(x, hy, r, 0, Math.PI * 2);
  ctx.fill();
  if (style.beard !== undefined) {
    ctx.fillStyle = css(style.beard);
    ctx.beginPath();
    ctx.moveTo(x - r * 0.9, hy + r * 0.1);
    ctx.quadraticCurveTo(x, hy + r * 2, x + r * 0.9, hy + r * 0.1);
    ctx.quadraticCurveTo(x, hy + r * 0.8, x - r * 0.9, hy + r * 0.1);
    ctx.fill();
  }
  const hc = style.headColor ?? 0xe8e0c8;
  ctx.fillStyle = sideGradient(ctx, x - r * 1.3, x + r * 1.3, hc);
  ctx.beginPath();
  switch (style.head) {
    case 'turban':
      ctx.ellipse(x, hy - r * 0.55, r * 1.25, r * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(shade(hc, 0.65), 0.8);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(x - r * 1.1, hy - r * 0.3);
      ctx.quadraticCurveTo(x, hy - r * 1.1, x + r * 1.1, hy - r * 0.6);
      ctx.stroke();
      break;
    case 'kolah':
      // The tall lambskin or felt hat of a townsman.
      ctx.moveTo(x - r * 0.95, hy - r * 0.2);
      ctx.lineTo(x - r * 0.75, hy - r * 2.1);
      ctx.quadraticCurveTo(x, hy - r * 2.4, x + r * 0.75, hy - r * 2.1);
      ctx.lineTo(x + r * 0.95, hy - r * 0.2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'scarf':
      ctx.moveTo(x - r * 1.15, hy + r * 0.9);
      ctx.quadraticCurveTo(x - r * 1.3, hy - r * 1.4, x, hy - r * 1.25);
      ctx.quadraticCurveTo(x + r * 1.3, hy - r * 1.4, x + r * 1.2, hy + r * 1.2);
      ctx.lineTo(x + r * 0.6, hy + r * 0.2);
      ctx.quadraticCurveTo(x, hy - r * 0.6, x - r * 0.6, hy + r * 0.2);
      ctx.closePath();
      ctx.fill();
      break;
    case 'bare':
      ctx.fillStyle = css(0x1f1610);
      ctx.arc(x, hy - r * 0.25, r * 0.95, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();
      break;
  }
}
