import type { ClothingStyle, HatStyle } from '../../scenes/characterTexture';
import { css, mix, type Ctx } from './canvasKit';

/** Shared geometry and brushes for the figure painters. */

export const FIGURE_W = 30;
export const FIGURE_H = 44;

/** Outline and deep-shadow ink, the same warm black as the buildings. */
export const INK = 0x1c120a;

/** Fully resolved figure description: every colour chosen, every default applied. */
export interface FigureSpec {
  clothing: ClothingStyle;
  hat: HatStyle;
  skin: number;
  body: number;
  secondary: number;
  accent: number;
  hatColor: number;
  hatAccent: number;
  hair: number;
  beard: 'full' | 'moustache' | 'none';
  shadow: boolean;
}

/** Toward warm sunlight; works on near-black cloth where scaling would not. */
export function lit(color: number, t: number): number {
  return mix(color, 0xfff1d6, t);
}

/** Toward the shadow ink. */
export function dim(color: number, t: number): number {
  return mix(color, INK, t);
}

/** Side-lit fill across the figure's width: bright on the left, falling into shade on the right. */
export function cloth(ctx: Ctx, color: number): CanvasGradient {
  const g = ctx.createLinearGradient(5, 0, 25, 0);
  g.addColorStop(0, css(lit(color, 0.24)));
  g.addColorStop(0.42, css(color));
  g.addColorStop(1, css(dim(color, 0.42)));
  return g;
}

/**
 * Builds a path (optionally mirrored about the figure's centre line) and
 * fills it. The mirror only applies to the path, never to the fill, so a
 * mirrored shape is still lit from the left.
 */
export function fillShape(ctx: Ctx, fill: string | CanvasGradient, build: () => void, flip = false): void {
  ctx.save();
  if (flip) {
    ctx.translate(FIGURE_W, 0);
    ctx.scale(-1, 1);
  }
  ctx.beginPath();
  build();
  ctx.closePath();
  ctx.restore();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A soft seam or fold line through `points`. */
export function stroke(
  ctx: Ctx,
  color: number,
  alpha: number,
  width: number,
  points: ReadonlyArray<readonly [number, number]>,
  flip = false,
): void {
  ctx.beginPath();
  points.forEach(([x, y], i) => {
    const px = flip ? FIGURE_W - x : x;
    if (i === 0) ctx.moveTo(px, y);
    else ctx.lineTo(px, y);
  });
  ctx.strokeStyle = css(color, alpha);
  ctx.lineWidth = width;
  ctx.stroke();
}

/** Runs a painter for the left half of the figure, then again mirrored for the right. */
export function mirrored(paint: (flip: boolean) => void): void {
  paint(false);
  paint(true);
}
