import { baseCorners, css, shade, topCorners, type Ctx, type IsoBox } from './canvasKit';
import { stone } from './materials';
import { archPath, flatTop, walls } from './ornaments';

/**
 * Helpers for buildings assembled from several boxes rather than stamped as
 * one: edges that let abutting runs read as a single wall, recessed arches
 * with real shadow inside, and stone steps at a threshold.
 */

export interface EdgeSet {
  /** The far-left upright: leave it off where another run continues the wall. */
  farLeft?: boolean;
  /** The top edge running back from the far-left corner. */
  farTop?: boolean;
  /** The upright at the back of the right face. */
  backRight?: boolean;
  /** The lit front arris. */
  arris?: boolean;
  /** The bottom edge of the left face. */
  leftFoot?: boolean;
}

/**
 * Like `outlineBox`, but each upright is optional, so pieces placed one
 * cell apart join without a seam.
 */
export function edges(ctx: Ctx, box: IsoBox, set: EdgeSet = {}, edge = 0x1c120a, alpha = 0.85): void {
  const [f, r, , l] = baseCorners(box);
  const [ft, rt, bt, lt] = topCorners(box);
  ctx.save();
  ctx.strokeStyle = css(edge, alpha);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (set.leftFoot ?? true) {
    ctx.moveTo(l!.x, l!.y);
    ctx.lineTo(f!.x, f!.y);
  } else {
    ctx.moveTo(f!.x, f!.y);
  }
  ctx.lineTo(r!.x, r!.y);
  if (set.backRight ?? true) ctx.lineTo(rt!.x, rt!.y);
  else ctx.moveTo(rt!.x, rt!.y);
  ctx.lineTo(bt!.x, bt!.y);
  if (set.farTop ?? true) ctx.lineTo(lt!.x, lt!.y);
  else ctx.moveTo(lt!.x, lt!.y);
  if (set.farLeft ?? true) ctx.lineTo(l!.x, l!.y);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,210,0.3)';
  ctx.beginPath();
  if (set.arris ?? true) {
    ctx.moveTo(f!.x, f!.y - 1);
    ctx.lineTo(ft!.x, ft!.y + 1);
  }
  ctx.moveTo(lt!.x + 1, lt!.y);
  ctx.lineTo(ft!.x, ft!.y);
  ctx.lineTo(rt!.x - 1, rt!.y);
  ctx.stroke();
  ctx.restore();
}

/**
 * A pointed arch recessed into a face: dark at the head and on the jamb the
 * sun cannot reach, so the wall reads as thick. Leaves the recess as the
 * current path for callers that want to clip to it.
 */
export function recess(c: Ctx, x: number, base: number, width: number, height: number, wall: number, light: number): void {
  archPath(c, x - 1.5, base, width + 3, height + 1.5);
  c.fillStyle = css(shade(wall, light * 1.12));
  c.fill();
  archPath(c, x, base, width, height);
  c.save();
  c.clip();
  c.fillStyle = css(shade(wall, light * 0.62));
  c.fillRect(x, base - height, width, height);
  // The left jamb and the soffit throw shade across the back of the recess.
  const side = c.createLinearGradient(x, 0, x + width * 0.45, 0);
  side.addColorStop(0, 'rgba(12,6,2,0.45)');
  side.addColorStop(1, 'rgba(12,6,2,0)');
  c.fillStyle = side;
  c.fillRect(x, base - height, width, height);
  const head = c.createLinearGradient(0, base - height, 0, base - height + width * 0.7);
  head.addColorStop(0, 'rgba(12,6,2,0.5)');
  head.addColorStop(1, 'rgba(12,6,2,0)');
  c.fillStyle = head;
  c.fillRect(x, base - height, width, height);
  c.restore();
  archPath(c, x, base, width, height);
}

/** A dressed stone step or plinth slab. */
export function slab(ctx: Ctx, box: IsoBox, color: number, seed: number): void {
  walls(ctx, box, (c, w, h, light) => stone(c, w, h, { base: color, light, seed }, Math.max(2, h)));
  flatTop(ctx, box, color);
  edges(ctx, box, {}, 0x1c120a, 0.6);
}
