import { css, groundPoint, rng, shade, type Ctx, type IsoBox } from './canvasKit';

/**
 * Assembly parts for the Iṣfahán, mountain-prison and Badasht art: boxes
 * placed on a parent footprint, arbitrary sloped planes (tent roofs,
 * awnings), timber posts, fire and snow.
 */

export interface Pt {
  x: number;
  y: number;
}

/** A box standing on `parent`'s footprint between p0..p1 and q0..q1, raised `lift` pixels. */
export function subBox(parent: IsoBox, p0: number, p1: number, q0: number, q1: number, h: number, lift = 0): IsoBox {
  const at = groundPoint(parent, p1, q0);
  return { x: at.x, y: at.y - lift, w: p1 - p0, d: q1 - q0, h };
}

/** A point in the parent's ground axes raised `lift` pixels. */
export function liftedPoint(box: IsoBox, p: number, q: number, lift: number): Pt {
  const at = groundPoint(box, p, q);
  return { x: at.x, y: at.y - lift };
}

/**
 * Paint in a flat face space mapped onto any parallelogram: `o` is the
 * face origin, `a` the end of its u axis and `b` the end of its v axis.
 */
export function onPlane(ctx: Ctx, o: Pt, a: Pt, b: Pt, uLen: number, vLen: number, paint: (w: number, h: number) => void): void {
  ctx.save();
  ctx.transform((a.x - o.x) / uLen, (a.y - o.y) / uLen, (b.x - o.x) / vLen, (b.y - o.y) / vLen, o.x, o.y);
  paint(uLen, vLen);
  ctx.restore();
}

/** Soft elliptical contact shadow for free-standing props. */
export function ellipseShadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, alpha = 0.26): void {
  ctx.save();
  ctx.fillStyle = `rgba(10,6,3,${alpha})`;
  ctx.filter = 'blur(2px)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Upright timber post, lit on its left side. */
export function post(ctx: Ctx, x: number, base: number, h: number, w: number, color: number): void {
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, css(shade(color, 1.25)));
  g.addColorStop(0.45, css(color));
  g.addColorStop(1, css(shade(color, 0.55)));
  ctx.fillStyle = g;
  ctx.fillRect(x - w / 2, base - h, w, h);
  ctx.strokeStyle = 'rgba(20,10,4,0.55)';
  ctx.lineWidth = 0.6;
  ctx.strokeRect(x - w / 2, base - h, w, h);
}

/** Radial light pool, for lamplight, embers and braziers. */
export function glow(ctx: Ctx, cx: number, cy: number, r: number, color: number, alpha: number): void {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, css(color, alpha));
  g.addColorStop(1, css(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
}

/** Layered tongues of flame rising from `base`, white-gold at the heart. */
export function flames(ctx: Ctx, cx: number, base: number, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  glow(ctx, cx, base - h * 0.4, h * 1.2, 0xffb050, 0.35);
  const layers: Array<[number, number, number]> = [[0xc8401c, 1, 1], [0xf08a2a, 0.75, 0.8], [0xffd27a, 0.45, 0.55], [0xfff4d0, 0.2, 0.3]];
  for (const [color, wf, hf] of layers) {
    ctx.fillStyle = css(color, 0.95);
    const tongues = 3;
    for (let i = 0; i < tongues; i++) {
      const tw = (w * wf) / tongues * 1.6;
      const tx = cx - (w * wf) / 2 + ((i + 0.5) * w * wf) / tongues;
      const th = h * hf * (i === 1 ? 1 : 0.7 + rand() * 0.2);
      const sway = (rand() - 0.5) * tw * 0.6;
      ctx.beginPath();
      ctx.moveTo(tx - tw / 2, base);
      ctx.quadraticCurveTo(tx - tw / 2, base - th * 0.55, tx + sway, base - th);
      ctx.quadraticCurveTo(tx + tw / 2, base - th * 0.55, tx + tw / 2, base);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/** Glowing coals heaped in an elliptical bed. */
export function embers(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, seed: number): void {
  const rand = rng(seed);
  const bed = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  bed.addColorStop(0, '#ffcf6a');
  bed.addColorStop(0.5, '#e0602a');
  bed.addColorStop(1, '#5a1e10');
  ctx.fillStyle = bed;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < rx * 1.5; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand();
    ctx.fillStyle = rand() < 0.5 ? 'rgba(40,14,6,0.7)' : 'rgba(255,230,150,0.8)';
    ctx.fillRect(cx + Math.cos(a) * rx * d * 0.9, cy + Math.sin(a) * ry * d * 0.9, 1.4, 1);
  }
}

/** A wavy snow blanket in face space along the top edge: `depth` deep, lumpy underside. */
export function snowEdge(ctx: Ctx, w: number, depth: number, seed: number, light = 1): void {
  const rand = rng(seed);
  ctx.fillStyle = css(shade(0xeef3f6, light));
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(w, -1);
  for (let u = w; u >= 0; u -= 3) ctx.lineTo(u, depth * (0.4 + rand() * 0.8));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(shade(0x9fb2c4, light), 0.5);
  ctx.fillRect(0, depth * 0.35, w, 0.8);
}
