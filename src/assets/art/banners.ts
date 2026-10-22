import { css, mix, shade, type Ctx } from './canvasKit';

/**
 * Standards and flags on wooden poles: a cloth that ripples away from the
 * pole with light and shadow folds, and a finial at the top.
 */

export interface BannerStyle {
  cloth: number;
  /** Cloth width and height in pixels. */
  w: number;
  h: number;
  /** Number of ripples along the fly. */
  waves?: number;
  /** Swallow-tailed fly, as on a war standard. */
  forked?: boolean;
  finial?: 'spear' | 'knob';
}

/** A pole from `base` up `height` pixels at `x`, with its cloth near the top. */
export function standard(ctx: Ctx, x: number, base: number, height: number, style: BannerStyle): void {
  const top = base - height;
  ctx.fillStyle = 'rgba(10,6,3,0.28)';
  ctx.beginPath();
  ctx.ellipse(x + 3, base, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const pole = ctx.createLinearGradient(x - 2, 0, x + 2, 0);
  pole.addColorStop(0, '#7a5434');
  pole.addColorStop(1, '#2e1c0e');
  ctx.fillStyle = pole;
  ctx.fillRect(x - 1.8, top, 3.6, height);
  if (style.finial === 'spear') {
    ctx.fillStyle = '#d9b45a';
    ctx.beginPath();
    ctx.moveTo(x - 3, top);
    ctx.lineTo(x, top - 10);
    ctx.lineTo(x + 3, top);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a6a2a';
    ctx.fillRect(x - 3, top, 6, 2);
  } else {
    ctx.fillStyle = '#c9a24a';
    ctx.beginPath();
    ctx.arc(x, top - 1.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  const y0 = top + 3;
  const { w, h, cloth } = style;
  const waves = style.waves ?? 2;
  const amp = h * 0.08;
  const wave = (u: number) => Math.sin((u / w) * Math.PI * waves) * amp * (u / w);
  ctx.beginPath();
  ctx.moveTo(x + 1.5, y0);
  for (let u = 0; u <= w; u += 2) ctx.lineTo(x + 1.5 + u, y0 + wave(u) + (u / w) * h * 0.08);
  if (style.forked) ctx.lineTo(x + 1.5 + w * 0.78, y0 + h * 0.5 + wave(w * 0.78));
  for (let u = w; u >= 0; u -= 2) ctx.lineTo(x + 1.5 + u, y0 + h + wave(u) + (u / w) * h * 0.04);
  ctx.closePath();
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  for (let i = 0; i <= waves * 2; i++) {
    const t = i / (waves * 2);
    g.addColorStop(t, css(i % 2 ? shade(cloth, 0.62) : mix(cloth, 0xffffff, 0.16)));
  }
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = css(shade(cloth, 0.4), 0.8);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Sleeve where the cloth wraps the pole.
  ctx.fillStyle = css(shade(cloth, 0.8));
  ctx.fillRect(x - 2.2, y0, 4.4, h);
}
