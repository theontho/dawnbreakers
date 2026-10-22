import { css, onLeftWall, onRightWall, onRoof, shade, type Ctx, type IsoBox } from './canvasKit';
import { rampartMerlons } from './fortressProps';
import { LIGHT } from './ornaments';
import { palisadeCap } from './palisade';
import type { WallCap, WallStyle } from './wallStyles';

/** Headroom each cap needs above the wall. */
export const CAP_PAD: Record<WallCap, number> = { merlons: 8, snowMerlons: 22, stakes: 10, coping: 3, flat: 3, battlements: 18, mudCoping: 6 };

/** A run position as a phase within the 32 px period (arms reaching into the next cell start before 0). */
export function phase(x: number): number {
  return ((x % 32) + 32) % 32;
}

/** Where a wall piece's faces start along their runs, so caps line up with the courses below. */
export interface CapRun {
  /** Phase of the left (south-facing) face. */
  left: number;
  /** Phase of the right (east-facing) face. */
  right: number;
}

/** Merlons, stakes, snow or coping along the top of the exposed faces. */
export function capFaces(ctx: Ctx, style: WallStyle, box: IsoBox, run: CapRun, left: boolean, right: boolean): void {
  const paint = (w: number, light: number, offset: number) => {
    const base = shade(style.top, light);
    switch (style.cap) {
      case 'merlons':
        for (let k = -1; k < 6; k++) {
          const u = k * 8 + 2 - (offset % 8);
          if (u + 4 <= 0 || u >= w) continue;
          ctx.fillStyle = css(base);
          ctx.fillRect(Math.max(0, u), -5, Math.min(4, w - u, u + 4), 5);
        }
        break;
      case 'snowMerlons':
        rampartMerlons(ctx, w, base, offset);
        break;
      case 'stakes':
        palisadeCap(ctx, w, box.h, light, offset);
        break;
      case 'coping':
        ctx.fillStyle = css(shade(style.top, light * 1.05));
        ctx.fillRect(0, -1, w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 2, w, 1);
        break;
      case 'battlements':
        // Rounded merlons a man's height, two to a cell, each with a loophole.
        for (let k = -1; k < 4; k++) {
          const u = k * 16 + 3 - (offset % 16);
          if (u + 10 <= 0 || u >= w) continue;
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, -20, w, 20);
          ctx.clip();
          ctx.fillStyle = css(base);
          ctx.beginPath();
          ctx.moveTo(u, 0);
          ctx.lineTo(u, -12);
          ctx.quadraticCurveTo(u + 5, -19, u + 10, -12);
          ctx.lineTo(u + 10, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(28,18,10,0.55)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = 'rgba(16,10,4,0.8)';
          ctx.fillRect(u + 4, -10, 2, 6);
          ctx.restore();
        }
        break;
      case 'mudCoping':
        // A rounded cap of mud plaster, bulging a little over the face.
        {
          const g = ctx.createLinearGradient(0, -4, 0, 5);
          g.addColorStop(0, css(shade(style.top, light * 1.2)));
          g.addColorStop(1, css(shade(style.top, light * 0.85)));
          ctx.fillStyle = g;
          ctx.fillRect(0, -4, w, 9);
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.fillRect(0, 5, w, 1.5);
        }
        break;
      case 'flat':
        break;
    }
  };
  if (left) onLeftWall(ctx, box, w => paint(w, LIGHT.left, run.left));
  if (right) onRightWall(ctx, box, w => paint(w, LIGHT.right, run.right));
  if (style.cap === 'snowMerlons') {
    onRoof(ctx, box, (w, d) => {
      ctx.fillStyle = 'rgba(236,240,246,0.9)';
      ctx.fillRect(0, 0, w, d);
    });
  }
}
