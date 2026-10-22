import type Phaser from 'phaser';
import { TILE_H, TILE_W } from '../../scenes/baseMapTypes';

/**
 * A small isometric painting kit on the 2D canvas API. Phaser Graphics only
 * fills flat polygons; the canvas gives us gradients, curves, clipping and
 * per-face transforms, which is what makes plaster, arches and domes read as
 * architecture rather than coloured boxes.
 *
 * Every face is painted in its own flat "face space" (u across, v down from
 * the top edge) and the kit shears it into place, so a pointed arch or a
 * row of bricks is drawn once as an ordinary 2D shape.
 */

export type Ctx = CanvasRenderingContext2D;

/** Half a tile in screen pixels: one cell along either iso axis. */
export const CELL = TILE_W / 2;

/** Paints a canvas-backed texture once; later calls with the same key are no-ops. */
export function paintTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx) => void, foot = 0): void {
  if (scene.textures.exists(key)) return;
  const tex = scene.textures.createCanvas(key, Math.ceil(w), Math.ceil(h + foot));
  if (!tex) return;
  // Room below the anchor (`h`) for what spills in front of the footprint;
  // the maps hang the sprite from the anchor, not the canvas's bottom edge.
  if (foot) (tex.customData as { foot?: number }).foot = Math.ceil(foot);
  const ctx = tex.getContext();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  draw(ctx);
  tex.refresh();
}

/** The key of variant `i` of a texture: the base key, then `key~1`, `key~2`... */
export function variantKey(texture: string, i: number): string {
  return i === 0 ? texture : `${texture}~${i}`;
}

// Colour helpers ------------------------------------------------------------

export function css(color: number, alpha = 1): string {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  return alpha >= 1 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
}

/** Scale brightness: `shade(c, 1.2)` is lighter, `shade(c, 0.7)` darker. */
export function shade(color: number, factor: number): number {
  const ch = (shift: number) => Math.max(0, Math.min(255, Math.round(((color >> shift) & 255) * factor)));
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

export function mix(a: number, b: number, t: number): number {
  const ch = (shift: number) => Math.round(((a >> shift) & 255) * (1 - t) + ((b >> shift) & 255) * t);
  return (ch(16) << 16) | (ch(8) << 8) | ch(0);
}

/** Deterministic PRNG (mulberry32) so textures are identical every boot. */
export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

// Iso boxes ------------------------------------------------------------------

/**
 * An upright box in texture pixels. `(x, y)` is the front-bottom corner;
 * `w` runs back-left along the left wall, `d` back-right along the right
 * wall (both in horizontal pixels, so one cell is `CELL`), `h` is height.
 */
export interface IsoBox {
  x: number;
  y: number;
  w: number;
  d: number;
  h: number;
}

/** Texture size and base box for a footprint of `cellsW` x `cellsD` tiles. */
export function footprintBox(cellsW: number, cellsD: number, h: number, topPad: number): { box: IsoBox; texW: number; texH: number } {
  const w = cellsW * CELL;
  const d = cellsD * CELL;
  const half = Math.max(w, d);
  const texH = (cellsW + cellsD) * TILE_H / 2 + h + topPad;
  return { box: { x: half, y: texH, w, d, h }, texW: half * 2, texH };
}

/** A point on the box's roof plane, `p` along the left wall, `q` along the right. */
export function roofPoint(box: IsoBox, p: number, q: number): { x: number; y: number } {
  return { x: box.x - box.w + p + q, y: box.y - box.w / 2 - box.h + p / 2 - q / 2 };
}

/** A point on the ground plane in the box's axes; negative `q` steps out in front of the left wall. */
export function groundPoint(box: IsoBox, p: number, q: number): { x: number; y: number } {
  return { x: box.x - box.w + p + q, y: box.y - box.w / 2 + p / 2 - q / 2 };
}

/** Ground footprint corners: front, right, back, left. */
export function baseCorners(box: IsoBox): Array<{ x: number; y: number }> {
  const { x, y, w, d } = box;
  return [{ x, y }, { x: x + d, y: y - d / 2 }, { x: x - w + d, y: y - w / 2 - d / 2 }, { x: x - w, y: y - w / 2 }];
}

export function topCorners(box: IsoBox): Array<{ x: number; y: number }> {
  return baseCorners(box).map(p => ({ x: p.x, y: p.y - box.h }));
}

/** Paint on the left (sunlit) wall: u in [0, w] from the far corner, v in [0, h] downward. */
export function onLeftWall(ctx: Ctx, box: IsoBox, paint: (width: number, height: number) => void): void {
  ctx.save();
  ctx.transform(1, 0.5, 0, 1, box.x - box.w, box.y - box.w / 2 - box.h);
  paint(box.w, box.h);
  ctx.restore();
}

/** Paint on the right (shaded) wall: u in [0, d] from the front corner. */
export function onRightWall(ctx: Ctx, box: IsoBox, paint: (width: number, height: number) => void): void {
  ctx.save();
  ctx.transform(1, -0.5, 0, 1, box.x, box.y - box.h);
  paint(box.d, box.h);
  ctx.restore();
}

/** Paint on the roof plane: p in [0, w] toward the front, q in [0, d] toward the back. */
export function onRoof(ctx: Ctx, box: IsoBox, paint: (w: number, d: number) => void): void {
  ctx.save();
  ctx.transform(1, 0.5, 1, -0.5, box.x - box.w, box.y - box.w / 2 - box.h);
  paint(box.w, box.d);
  ctx.restore();
}

export function polygon(ctx: Ctx, points: ReadonlyArray<{ x: number; y: number }>): void {
  ctx.beginPath();
  points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.closePath();
}

/** Soft contact shadow on the ground around a footprint. */
export function groundShadow(ctx: Ctx, box: IsoBox, spread = 6, alpha = 0.28): void {
  const [f, r, , l] = baseCorners(box);
  ctx.save();
  ctx.fillStyle = `rgba(10,6,3,${alpha})`;
  ctx.filter = 'blur(3px)';
  polygon(ctx, [
    { x: l!.x - spread * 0.6, y: l!.y },
    { x: f!.x, y: f!.y + spread * 0.25 },
    { x: r!.x + spread, y: r!.y + spread * 0.2 },
    { x: r!.x + spread * 0.4, y: r!.y - spread },
    { x: l!.x, y: l!.y - spread },
  ]);
  ctx.fill();
  ctx.restore();
}

/** Crisp silhouette: dark outer edges and a lit front arris. */
export function outlineBox(ctx: Ctx, box: IsoBox, edge = 0x1c120a): void {
  const [f, r, , l] = baseCorners(box);
  const [ft, rt, bt, lt] = topCorners(box);
  ctx.save();
  ctx.strokeStyle = css(edge, 0.85);
  ctx.lineWidth = 1.2;
  polygon(ctx, [l!, f!, r!, rt!, bt!, lt!]);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,210,0.35)';
  ctx.beginPath();
  ctx.moveTo(f!.x, f!.y - 1);
  ctx.lineTo(ft!.x, ft!.y + 1);
  ctx.moveTo(lt!.x + 1, lt!.y);
  ctx.lineTo(ft!.x, ft!.y);
  ctx.stroke();
  ctx.restore();
}
