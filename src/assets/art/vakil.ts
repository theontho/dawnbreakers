import { css, groundPoint, groundShadow, onLeftWall, onRightWall, onRoof, outlineBox, polygon, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow } from './fieldKit';
import { brick, glazedTiles, stone } from './materials';
import { archPath, band, clipped, dome, LIGHT, parapetRoof, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * The Vakíl Mosque of Shíráz, built by Karím Khán Zand: yellow brick, bays
 * framed in haft-rang tiles strewn with pink Zand roses, spiral columns in
 * the dim prayer hall, a roof of shallow brick domes, and the minbar cut
 * from a single block of pale marble.
 */

const BRICK = 0xc8a070;
const LAPIS = 0x24477a;
const ROSE = 0xd86a8a;
const CREAM = 0xf0e6cc;
const MARBLE = 0xd4d4c0;

/**
 * One run of the prayer-hall arcade. `footprint` is the whole placement;
 * runs join end to end along their length, so the hall fills it lengthwise
 * but stands back from the front edge behind a marble step, where the
 * worshippers leave their shoes.
 */
export function drawPrayerArcade(ctx: Ctx, footprint: IsoBox): void {
  groundShadow(ctx, footprint, 8);
  const step = subBox(footprint, 0, footprint.w, 0, footprint.d, 3);
  walls(ctx, step, (c, w, h, light) => stone(c, w, h, { base: MARBLE, light, seed: 75 }, 3));
  onRoof(ctx, step, (w, d) => {
    ctx.fillStyle = css(shade(MARBLE, LIGHT.roof * 0.96));
    ctx.fillRect(0, 0, w, d);
    ctx.strokeStyle = 'rgba(90,80,60,0.25)';
    ctx.lineWidth = 0.6;
    for (let p = 16; p < w; p += 16) {
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, d);
      ctx.stroke();
    }
  });
  outlineBox(ctx, step);
  const hall = subBox(footprint, 0, footprint.w, 9, footprint.d, footprint.h - 3, 3);
  const face = (c: Ctx, w: number, h: number, l: number) => {
    const bays = Math.max(1, Math.round(w / 32));
    const span = w / bays;
    for (let i = 0; i < bays; i++) bay(c, i * span, span, h, l);
    // Inscription frieze: white thuluth on lapis.
    c.fillStyle = css(shade(LAPIS, l));
    c.fillRect(0, 3, w, 8);
    c.strokeStyle = css(shade(CREAM, l), 0.9);
    c.lineWidth = 0.7;
    for (let x = 2; x < w - 3; x += 3.4) {
      c.beginPath();
      c.moveTo(x, 9.5);
      c.lineTo(x + 0.6, 4.5 + ((x * 7) % 3));
      c.quadraticCurveTo(x + 1.8, 10, x + 2.6, 8);
      c.stroke();
    }
    band(c, w, 11, 1.5, CREAM, l);
    // A marble dado where worshippers lean.
    c.fillStyle = css(shade(MARBLE, l));
    c.fillRect(0, h - 5, w, 5);
    c.fillStyle = 'rgba(0,0,0,0.18)';
    c.fillRect(0, h - 5, w, 0.8);
  };
  walls(ctx, hall, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: light === 1 ? 71 : 72 }, 3, 8), {
    left: face,
    right: face,
  });
  parapetRoof(ctx, hall, BRICK, { base: 0xb08a60, light: 1, seed: 73 }, 3, 4);
  // Shallow brick saucer domes over the hall, one per bay, just showing over the parapet.
  const tops: Array<{ x: number; y: number }> = [];
  for (let p = 16; p < hall.w; p += 32) for (let q = 14; q < hall.d; q += 28) tops.push(roofPoint(hall, p, q));
  tops.sort((a, b) => a.y - b.y);
  for (const t of tops) saucerDome(ctx, t.x, t.y + 2, 11);
  outlineBox(ctx, hall);
  // Shoes left on the step: a few pairs, set down at the threshold of two bays.
  for (const [p, color] of [[22, 0x3a2a1c], [30, 0x6a2a22], [85, 0x2a2420]] as const) {
    const at = groundPoint(footprint, p, 5);
    shoes(ctx, at.x, at.y - 3, color);
  }
}

/** A low brick saucer dome, the kind that roofs a prayer hall bay by bay. */
function saucerDome(ctx: Ctx, cx: number, baseY: number, r: number): void {
  const rise = r * 0.62;
  ctx.beginPath();
  ctx.moveTo(cx - r, baseY);
  ctx.bezierCurveTo(cx - r, baseY - rise * 0.9, cx - r * 0.45, baseY - rise, cx, baseY - rise);
  ctx.bezierCurveTo(cx + r * 0.45, baseY - rise, cx + r, baseY - rise * 0.9, cx + r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.42, 0, 0, Math.PI, false);
  ctx.closePath();
  const g = ctx.createRadialGradient(cx - r * 0.4, baseY - rise * 0.8, 1, cx, baseY - rise * 0.3, r * 1.3);
  g.addColorStop(0, css(shade(BRICK, 1.3)));
  g.addColorStop(0.5, css(shade(BRICK, 0.98)));
  g.addColorStop(1, css(shade(BRICK, 0.55)));
  ctx.fillStyle = g;
  ctx.fill();
  // Courses of brick ringing the dome, and a tiny lantern opening at the crown.
  ctx.strokeStyle = css(shade(BRICK, 0.7), 0.45);
  ctx.lineWidth = 0.6;
  for (const k of [0.35, 0.65]) {
    ctx.beginPath();
    ctx.ellipse(cx, baseY - rise * k, r * (1 - k * 0.45), r * 0.42 * (1 - k * 0.45), 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.fillStyle = css(shade(BRICK, 0.5));
  ctx.beginPath();
  ctx.ellipse(cx, baseY - rise + 0.6, 1.6, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** A pair of slippers on the step, toes toward the hall. */
function shoes(ctx: Ctx, x: number, y: number, color: number): void {
  for (const dx of [0, 3.2]) {
    ctx.fillStyle = css(color);
    ctx.beginPath();
    ctx.ellipse(x + dx, y + dx * 0.15, 1.4, 2.6, -1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,210,0.35)';
    ctx.fillRect(x + dx - 0.8, y + dx * 0.15 - 1, 1, 0.7);
  }
}

/** A tile-framed bay: a tall pointed arch, a spiral column glimpsed in the hall's shade. */
function bay(c: Ctx, x: number, w: number, h: number, l: number): void {
  const top = 15;
  const foot = h - 5;
  c.save();
  c.beginPath();
  c.rect(x + 2, top, w - 4, foot - top);
  c.clip();
  glazedTiles(c, x + w, h, { base: 0xd8b058, light: l, seed: 74 + x }, 5);
  // Zand roses scattered over the haft-rang spandrels.
  c.fillStyle = css(shade(ROSE, l));
  for (let k = 0; k < 6; k++) {
    const rx = x + 4 + ((k * 13) % (w - 8));
    const ry = top + 3 + ((k * 7) % 12);
    c.beginPath();
    c.arc(rx, ry, 1.2, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  c.strokeStyle = css(shade(LAPIS, l));
  c.lineWidth = 1.2;
  c.strokeRect(x + 2.5, top + 0.5, w - 5, foot - top - 0.5);
  const aw = w - 12;
  const ah = foot - top - 9;
  archPath(c, x + 5, foot, aw + 2, ah + 1.5);
  c.fillStyle = css(shade(CREAM, l));
  c.fill();
  archPath(c, x + 6, foot, aw, ah);
  const hall = c.createLinearGradient(0, foot - ah, 0, foot);
  hall.addColorStop(0, css(shade(0x2a1c12, l)));
  hall.addColorStop(1, css(shade(0x5a4430, l)));
  c.fillStyle = hall;
  c.fill();
  c.save();
  c.clip();
  // A spiral column deep in the hall, and the next arch beyond it.
  const cx = x + w / 2;
  archPath(c, x + 9, foot, aw - 6, ah - 8);
  c.strokeStyle = css(shade(0x6a5236, l * 0.7), 0.7);
  c.lineWidth = 1;
  c.stroke();
  c.fillStyle = css(shade(0xb8a888, l * 0.75));
  c.fillRect(cx - 1.4, foot - ah + 14, 2.8, ah);
  c.strokeStyle = css(shade(0x6a5a44, l * 0.75), 0.9);
  c.lineWidth = 0.6;
  for (let y = foot - ah + 15; y < foot; y += 2.4) {
    c.beginPath();
    c.moveTo(cx - 1.4, y);
    c.lineTo(cx + 1.4, y - 1.4);
    c.stroke();
  }
  c.restore();
}

/** The marble minbar: a stair of fourteen steps rising to a canopied seat, gate at its foot. */
export function drawMinbar(ctx: Ctx, box: IsoBox): void {
  const { w, d, h } = box;
  const landing = 8;
  ellipseShadow(ctx, box.x - 4, box.y - 9, 22, 8, 0.28);
  // A point on the left (stair-side) face, in face space.
  const side = (u: number, v: number) => ({ x: box.x - w + u, y: box.y - w / 2 - h + u / 2 + v });
  const back = (pt: { x: number; y: number }) => ({ x: pt.x + d, y: pt.y - d / 2 });
  const rise = (u: number) => ((u - landing) / (w - landing)) * (h - 6);
  // Treads, then the side panel in front of them.
  const steps = 14;
  for (let k = 0; k < steps; k++) {
    const u0 = landing + ((w - landing) * k) / steps;
    const u1 = landing + ((w - landing) * (k + 1)) / steps;
    const a = side(u0, rise(u1));
    const b = side(u1, rise(u1));
    polygon(ctx, [a, b, back(b), back(a)]);
    ctx.fillStyle = css(shade(MARBLE, LIGHT.roof));
    ctx.fill();
    polygon(ctx, [side(u0, rise(u0)), a, back(a), back(side(u0, rise(u0)))]);
    ctx.fillStyle = css(shade(MARBLE, 0.8));
    ctx.fill();
  }
  polygon(ctx, [side(0, 0), side(landing, 0), back(side(landing, 0)), back(side(0, 0))]);
  ctx.fillStyle = css(shade(MARBLE, LIGHT.roof));
  ctx.fill();
  onLeftWall(ctx, box, (fw, fh) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(landing, 0);
    ctx.lineTo(fw, fh - 6);
    ctx.lineTo(fw, fh);
    ctx.lineTo(0, fh);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, fw, fh);
    g.addColorStop(0, css(shade(MARBLE, 1.08)));
    g.addColorStop(1, css(shade(MARBLE, 0.9)));
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,24,16,0.7)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    // A carved triangular panel of interlaced stars.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(3, 6);
    ctx.lineTo(fw - 8, fh - 9);
    ctx.lineTo(3, fh - 9);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(90,80,60,0.7)';
    ctx.stroke();
    ctx.clip();
    ctx.strokeStyle = 'rgba(110,100,80,0.45)';
    ctx.lineWidth = 0.5;
    for (let k = -fh; k < fw + fh; k += 3) {
      ctx.beginPath();
      ctx.moveTo(k, 0);
      ctx.lineTo(k + fh, fh);
      ctx.moveTo(k + fh, 0);
      ctx.lineTo(k, fh);
      ctx.stroke();
    }
    ctx.restore();
  });
  // The gate at the foot of the stair: two posts and a pointed arch.
  onRightWall(ctx, box, (fw, fh) => clipped(ctx, fw, fh, () => {
    ctx.fillStyle = css(shade(MARBLE, LIGHT.right));
    ctx.fillRect(0, fh - 6, fw, 6);
    ctx.fillRect(0, fh - 30, 2.2, 30);
    ctx.fillRect(fw - 2.2, fh - 30, 2.2, 30);
    archPath(ctx, 0, fh - 24, fw, 9);
    ctx.lineWidth = 2;
    ctx.strokeStyle = css(shade(MARBLE, LIGHT.right));
    ctx.stroke();
  }));
  // Canopy over the preacher's seat.
  const posts = [side(0.8, 0), side(landing - 0.8, 0)];
  const ch = 15;
  ctx.fillStyle = css(shade(MARBLE, 0.95));
  for (const p of posts.map(back)) ctx.fillRect(p.x - 0.8, p.y - ch, 1.6, ch);
  for (const p of posts) ctx.fillRect(p.x - 0.8, p.y - ch, 1.6, ch);
  const centre = { x: (posts[0]!.x + back(posts[1]!).x) / 2, y: (posts[0]!.y + back(posts[1]!).y) / 2 - ch };
  dome(ctx, centre.x, centre.y + 2, 6, { color: MARBLE, bulb: 1.3, finial: true });
}
