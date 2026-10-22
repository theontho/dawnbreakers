import { css, groundShadow, onLeftWall, onRightWall, outlineBox, polygon, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow } from './fieldKit';
import { brick, glazedTiles } from './materials';
import { archPath, band, clipped, dome, LIGHT, parapetRoof, walls } from './ornaments';

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

/** One run of the prayer-hall arcade: a tiled bay per cell on each face. */
export function drawPrayerArcade(ctx: Ctx, box: IsoBox): void {
  groundShadow(ctx, box, 8);
  const face = (c: Ctx, w: number, h: number, l: number) => {
    const bays = Math.max(1, Math.round(w / 32));
    const step = w / bays;
    for (let i = 0; i < bays; i++) bay(c, i * step, step, h, l);
    // Inscription frieze: white thuluth on lapis.
    c.fillStyle = css(shade(LAPIS, l));
    c.fillRect(0, 2, w, 7);
    c.strokeStyle = css(shade(CREAM, l), 0.9);
    c.lineWidth = 0.7;
    for (let x = 2; x < w - 3; x += 3.4) {
      c.beginPath();
      c.moveTo(x, 7.5);
      c.lineTo(x + 0.6, 3.5 + ((x * 7) % 3));
      c.quadraticCurveTo(x + 1.8, 8, x + 2.6, 6);
      c.stroke();
    }
    band(c, w, 9, 1.5, CREAM, l);
    // A marble dado where worshippers lean.
    c.fillStyle = css(shade(MARBLE, l));
    c.fillRect(0, h - 6, w, 6);
    c.fillStyle = 'rgba(0,0,0,0.18)';
    c.fillRect(0, h - 6, w, 0.8);
  };
  walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: light === 1 ? 71 : 72 }, 3, 8), {
    left: face,
    right: face,
  });
  parapetRoof(ctx, box, BRICK, { base: 0xb08a60, light: 1, seed: 73 }, 3, 3);
  // Shallow brick domes over the hall, one per cell, painted back to front.
  const tops: Array<{ x: number; y: number }> = [];
  for (let p = 16; p < box.w; p += 32) for (let q = 16; q < box.d; q += 32) tops.push(roofPoint(box, p, q));
  tops.sort((a, b) => a.y - b.y);
  for (const t of tops) dome(ctx, t.x, t.y + 3, 9, { color: shade(BRICK, 0.96), bulb: 0.75 });
  outlineBox(ctx, box);
}

/** A tile-framed bay with a pointed arch; a spiral column glimpsed in the hall's shade. */
function bay(c: Ctx, x: number, w: number, h: number, l: number): void {
  const top = 12;
  c.save();
  c.beginPath();
  c.rect(x + 2, top, w - 4, h - top - 6);
  c.clip();
  glazedTiles(c, x + w, h, { base: 0xd8b058, light: l, seed: 74 + x }, 5);
  // Zand roses scattered over the haft-rang field.
  c.fillStyle = css(shade(ROSE, l));
  for (let k = 0; k < 6; k++) {
    const rx = x + 4 + ((k * 13) % (w - 8));
    const ry = top + 3 + ((k * 7) % 10);
    c.beginPath();
    c.arc(rx, ry, 1.2, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
  c.strokeStyle = css(shade(LAPIS, l));
  c.lineWidth = 1.2;
  c.strokeRect(x + 2.5, top + 0.5, w - 5, h - top - 6.5);
  const aw = w - 10;
  archPath(c, x + 4, h - 6, aw + 2, h - top - 8);
  c.fillStyle = css(shade(CREAM, l));
  c.fill();
  archPath(c, x + 5, h - 6, aw, h - top - 10);
  const hall = c.createLinearGradient(0, top, 0, h);
  hall.addColorStop(0, css(shade(0x2a1c12, l)));
  hall.addColorStop(1, css(shade(0x4a3624, l)));
  c.fillStyle = hall;
  c.fill();
  c.save();
  c.clip();
  const cx = x + w / 2;
  c.fillStyle = css(shade(0xb8a888, l * 0.75));
  c.fillRect(cx - 1.6, top + 8, 3.2, h - top);
  c.strokeStyle = css(shade(0x6a5a44, l * 0.75), 0.9);
  c.lineWidth = 0.6;
  for (let y = top + 9; y < h; y += 2.4) {
    c.beginPath();
    c.moveTo(cx - 1.6, y);
    c.lineTo(cx + 1.6, y - 1.6);
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
