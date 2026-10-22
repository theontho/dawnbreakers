import { css, groundPoint, outlineBox, polygon, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow, foliageClump, litGradient } from './fieldKit';
import { plaster, stone } from './materials';
import { flatTop, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * The life at the foot of a building: benches, jars, potted plants,
 * steps and the dust of the lane. Positions are in the parent box's
 * ground axes (`p` along the left wall toward the front, `q` along the
 * right wall toward the back), so they sit inside the footprint.
 */

/** A khum: a big-bellied terracotta water jar standing on the ground. */
export function waterJar(ctx: Ctx, x: number, y: number, r: number, color = 0xa8603a): void {
  ellipseShadow(ctx, x + 2, y, r * 1.1, r * 0.45, 0.3);
  const cy = y - r * 1.05;
  ctx.fillStyle = litGradient(ctx, x, cy, r, color, 0.9);
  ctx.beginPath();
  ctx.moveTo(x - r * 0.35, y);
  ctx.bezierCurveTo(x - r * 1.25, y - r * 0.4, x - r * 1.1, cy - r * 0.9, x - r * 0.42, cy - r * 1.05);
  ctx.lineTo(x + r * 0.42, cy - r * 1.05);
  ctx.bezierCurveTo(x + r * 1.1, cy - r * 0.9, x + r * 1.25, y - r * 0.4, x + r * 0.35, y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(shade(color, 0.4), 0.85);
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // Rim and the dark water inside.
  const rimY = cy - r * 1.05;
  ctx.fillStyle = css(shade(color, 1.15));
  ctx.beginPath();
  ctx.ellipse(x, rimY, r * 0.5, r * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x1a120c);
  ctx.beginPath();
  ctx.ellipse(x, rimY, r * 0.34, r * 0.12, 0, 0, Math.PI * 2);
  ctx.fill();
  // A band of incised decoration round the shoulder.
  ctx.strokeStyle = css(shade(color, 0.7), 0.7);
  ctx.beginPath();
  ctx.ellipse(x, cy - r * 0.35, r * 0.95, r * 0.3, 0, 0.15, Math.PI - 0.15);
  ctx.stroke();
}

/** A terracotta pot with a flowering plant: geranium, jasmine or a young pomegranate. */
export function pottedPlant(ctx: Ctx, x: number, y: number, r: number, leaf: number, seed: number, bloom?: number): void {
  ellipseShadow(ctx, x + 1.5, y, r * 1.1, r * 0.4, 0.28);
  const top = y - r * 1.4;
  ctx.fillStyle = litGradient(ctx, x, y - r * 0.7, r, 0xb0643c, 0.8);
  ctx.beginPath();
  ctx.moveTo(x - r, top);
  ctx.lineTo(x + r, top);
  ctx.lineTo(x + r * 0.7, y);
  ctx.lineTo(x - r * 0.7, y);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(0xc8784a);
  ctx.fillRect(x - r - 0.5, top - 1, r * 2 + 1, 1.6);
  foliageClump(ctx, x, top - r * 0.9, r * 1.2, { leaf, seed, bloom, masses: 5 });
}

/** A sakku: the plastered bench built against a house wall beside the door. */
export function sakku(ctx: Ctx, parent: IsoBox, p0: number, p1: number, q0: number, q1: number, color: number, seed: number, h = 8): void {
  const b = subBox(parent, p0, p1, q0, q1, h);
  walls(ctx, b, (c, w, hh, light) => plaster(c, w, hh, { base: color, light, seed }));
  flatTop(ctx, b, shade(color, 1.02));
  outlineBox(ctx, b);
}

/**
 * Stone steps up to a doorway. With `axis` 'q' they climb toward the back
 * from the front edge `q0` (a door on a left wall); with 'p' they climb
 * from the front edge `p1` (a door on a right wall).
 */
export function steps(ctx: Ctx, parent: IsoBox, p0: number, p1: number, q0: number, q1: number, count: number, axis: 'p' | 'q' = 'q', rise = 2.5): void {
  const tread = ((axis === 'q' ? q1 - q0 : p1 - p0)) / count;
  for (let i = 0; i < count; i++) {
    const b = axis === 'q'
      ? subBox(parent, p0, p1, q0 + i * tread, q1, rise * (i + 1))
      : subBox(parent, p0, p1 - i * tread, q0, q1, rise * (i + 1));
    walls(ctx, b, (c, w, h, light) => stone(c, w, h, { base: 0x9a8a70, light, seed: 70 + i }, rise));
    flatTop(ctx, b, 0xa89878);
  }
}

/** Trodden dust and scattered straw on the ground: a soft, speckled patch. */
export function laneDust(ctx: Ctx, parent: IsoBox, p0: number, p1: number, q0: number, q1: number, seed: number, color = 0x9a7e56): void {
  const at = (p: number, q: number) => groundPoint(parent, p, q);
  ctx.save();
  ctx.filter = 'blur(2px)';
  polygon(ctx, [at(p0, q0), at(p1, q0), at(p1, q1), at(p0, q1)]);
  ctx.fillStyle = css(color, 0.32);
  ctx.fill();
  ctx.restore();
  const rand = rng(seed);
  for (let i = 0; i < ((p1 - p0) * (q1 - q0)) / 14; i++) {
    const pt = at(p0 + rand() * (p1 - p0), q0 + rand() * (q1 - q0));
    ctx.fillStyle = css(rand() < 0.7 ? shade(color, 0.75) : 0xd8c08a, 0.5);
    ctx.fillRect(pt.x, pt.y, rand() < 0.2 ? 2 : 1, 1);
  }
}
