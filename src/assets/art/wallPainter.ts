import type Phaser from 'phaser';
import { css, onLeftWall, onRightWall, onRoof, paintTexture, polygon, shade, type Ctx, type IsoBox } from './canvasKit';
import { LIGHT } from './ornaments';
import { CAP_PAD, capFaces, phase } from './wallCaps';
import { WALL_STYLES, type WallStyle } from './wallStyles';

/**
 * Connected walls. A wall is placed one cell at a time, but each cell's
 * piece is painted for the neighbours it joins (a 4-bit mask: N, E, S, W),
 * so a ring of cells reads as one continuous wall with real corners,
 * T-junctions and end caps. Courses, merlons and stakes repeat on a period
 * that divides the cell width, so they line up across cells, and seams
 * between joined pieces are never outlined.
 */

export const WALL_N = 1;
export const WALL_E = 2;
export const WALL_S = 4;
export const WALL_W = 8;

/**
 * How far a building's walls stand in from the south and east edges of its
 * footprint. A wall running up to it from the south or east reaches on by
 * that much, so it meets the face instead of stopping short of it.
 */
export interface BuildingFaces {
  s: number;
  e: number;
}

/** How far a wall's north (`n`) and west (`w`) arms reach on into the building they join. */
export interface WallReach {
  n: number;
  w: number;
}

const NO_REACH: WallReach = { n: 0, w: 0 };
/** Side margin of a wall texture whose arms reach into the next cell. */
const REACH_PAD = 16;

export function wallTextureKey(texture: string, mask: number, cut = false, reach: WallReach = NO_REACH): string {
  const into = reach.n || reach.w ? `r${reach.n},${reach.w}` : '';
  return `${texture}#${mask}${cut ? 'c' : ''}${into}`;
}

/**
 * Walls along the camera-facing edges of a map are drawn cut away: only the
 * lower courses stand, with the wall's core showing on top, so they frame
 * the scene instead of hiding everything behind them.
 */
const CUT_HEIGHT = 34;

/** The base texture (used by the editor palette) is a straight east-west run. */
export function paintWallBase(scene: Phaser.Scene, texture: string): void {
  ensureWallTexture(scene, texture, WALL_E | WALL_W, false, NO_REACH, texture);
}

export function ensureWallTexture(
  scene: Phaser.Scene, texture: string, mask: number, cut = false, reach: WallReach = NO_REACH, key = wallTextureKey(texture, mask, cut, reach),
): void {
  const full = WALL_STYLES[texture];
  if (!full) return;
  const style: WallStyle = cut
    ? { ...full, height: Math.min(full.height, CUT_HEIGHT), cap: 'flat', top: shade(full.top, 0.62) }
    : full;
  const texH = 32 + style.height + CAP_PAD[style.cap];
  // Arms reaching into the next cell need room either side (the texture stays centred on its cell).
  const pad = reach.n || reach.w ? REACH_PAD : 0;
  paintTexture(scene, key, 64 + pad * 2, texH, ctx => {
    ctx.translate(pad, 0);
    paintWall(ctx, style, mask, texH - 32, reach);
  });
}

interface Part {
  a0: number;
  a1: number;
  b0: number;
  b1: number;
}

/** Grid-space (a along +x, b along +y, both 0..1 in the cell) to texture pixels. */
function at(topY: number, a: number, b: number): { x: number; y: number } {
  return { x: 32 + (a - b) * 32, y: topY + (a + b) * 16 };
}

function paintWall(ctx: Ctx, style: WallStyle, mask: number, topY: number, reach: WallReach): void {
  const c0 = 0.5 - style.thickness / 2;
  const c1 = 0.5 + style.thickness / 2;
  const has = (bit: number) => (mask & bit) !== 0;
  // Back arms, centre, front arms: painter's order.
  const parts: Part[] = [];
  if (has(WALL_W)) parts.push({ a0: -Math.min(reach.w, REACH_PAD) / 32, a1: c0, b0: c0, b1: c1 });
  if (has(WALL_N)) parts.push({ a0: c0, a1: c1, b0: -Math.min(reach.n, REACH_PAD) / 32, b1: c0 });
  parts.push({ a0: c0, a1: c1, b0: c0, b1: c1 });
  if (has(WALL_E)) parts.push({ a0: c1, a1: 1, b0: c0, b1: c1 });
  if (has(WALL_S)) parts.push({ a0: c0, a1: c1, b0: c1, b1: 1 });

  const covered = (a: number, b: number): boolean => {
    if (a < 0) return has(WALL_W) && b > c0 && b < c1;
    if (a > 1) return has(WALL_E) && b > c0 && b < c1;
    if (b < 0) return has(WALL_N) && a > c0 && a < c1;
    if (b > 1) return has(WALL_S) && a > c0 && a < c1;
    return parts.some(p => a > p.a0 && a < p.a1 && b > p.b0 && b < p.b1);
  };
  const e = 0.01;

  // Contact shadow cast to the right of the wall.
  ctx.fillStyle = 'rgba(10,6,3,0.22)';
  for (const p of parts) {
    polygon(ctx, [at(topY, p.a0, p.b1), at(topY, p.a1 + 0.12, p.b1), at(topY, p.a1 + 0.12, p.b0), at(topY, p.a0, p.b0)]);
    ctx.fill();
  }

  for (const p of parts) {
    const f = at(topY, p.a1, p.b1);
    const box: IsoBox = { x: f.x, y: f.y, w: (p.a1 - p.a0) * 32, d: (p.b1 - p.b0) * 32, h: style.height };
    const leftExposed = !covered((p.a0 + p.a1) / 2, p.b1 + e);
    const rightExposed = !covered(p.a1 + e, (p.b0 + p.b1) / 2);
    // Faces are painted in run-aligned pattern space so courses continue across cells.
    if (leftExposed) onLeftWall(ctx, box, (w, h) => alignedFace(ctx, style, w, h, LIGHT.left, phase(p.a0 * 32)));
    if (rightExposed) onRightWall(ctx, box, (w, h) => alignedFace(ctx, style, w, h, LIGHT.right, (1 - p.b1) * 32));
    onRoof(ctx, box, (w, d) => {
      ctx.fillStyle = css(shade(style.top, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
    });
    capFaces(ctx, style, box, { left: phase(p.a0 * 32), right: (1 - p.b1) * 32 }, leftExposed, rightExposed);
    outlineEdges(ctx, box, p, covered, e);
  }
}

function alignedFace(ctx: Ctx, style: WallStyle, w: number, h: number, light: number, offset: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  const shift = offset % 32;
  ctx.translate(-shift, 0);
  style.face(ctx, w + shift, h, light);
  ctx.restore();
}

/** Outline only silhouette edges, never the seams between joined pieces. */
function outlineEdges(ctx: Ctx, box: IsoBox, p: Part, covered: (a: number, b: number) => boolean, e: number): void {
  const midA = (p.a0 + p.a1) / 2;
  const midB = (p.b0 + p.b1) / 2;
  const top = (pa: number, pb: number) => {
    const x = box.x - box.w + pa + pb;
    const y = box.y - box.w / 2 - box.h + pa / 2 - pb / 2;
    return { x, y };
  };
  const { w, d } = box;
  ctx.strokeStyle = 'rgba(28,18,10,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Top edges: back-left (a0), back-right (b0), front-left (b1), front-right (a1).
  if (!covered(p.a0 - e, midB)) line(ctx, top(0, 0), top(0, d));
  if (!covered(midA, p.b0 - e)) line(ctx, top(0, d), top(w, d));
  if (!covered(midA, p.b1 + e)) line(ctx, top(0, 0), top(w, 0));
  if (!covered(p.a1 + e, midB)) line(ctx, top(w, 0), top(w, d));
  // Vertical arrises at silhouette corners only.
  const drop = (pt: { x: number; y: number }) => line(ctx, pt, { x: pt.x, y: pt.y + box.h });
  const leftFace = !covered(midA, p.b1 + e);
  const rightFace = !covered(p.a1 + e, midB);
  if (leftFace && !covered(p.a0 - e, p.b1 - e)) drop(top(0, 0));
  if ((leftFace || rightFace) && !covered(p.a1 + e, p.b1 - e) && !covered(p.a1 - e, p.b1 + e)) drop(top(w, 0));
  if (rightFace && !covered(p.a1 - e, p.b0 - e)) drop(top(w, d));
  ctx.stroke();
}

function line(ctx: Ctx, a: { x: number; y: number }, b: { x: number; y: number }): void {
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
}
