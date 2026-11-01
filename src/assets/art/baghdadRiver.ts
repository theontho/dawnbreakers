import type Phaser from 'phaser';
import { css, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow, litGradient } from './fieldKit';
import { planks } from './materials';
import { rope } from './cordage';

/**
 * Baghdád by the Tigris, winter 1845, at true scale (a person is 40 px):
 * the date palm of every garden and quay along the river (about 9 m), the
 * guffa, the round boat of reeds sealed with bitumen that has ferried the
 * city since Babylon (about 3 m across), and one of the moored boats that
 * carry the bridge of boats over the river to Karkh.
 */

const FOOT = 16;

/** The fibrous trunk of a date palm: a gentle lean, and the stubs of old fronds in a lattice. */
function palmTrunk(ctx: Ctx, base: { x: number; y: number }, top: { x: number; y: number }, w0: number, w1: number, seed: number): void {
  const steps = 26;
  const rand = rng(seed);
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const bend = Math.sin(t * Math.PI) * 6;
    const x = base.x + (top.x - base.x) * t + bend;
    const y = base.y + (top.y - base.y) * t;
    const w = w0 + (w1 - w0) * t;
    const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, css(0xa48a66));
    g.addColorStop(0.4, css(0x8a7050));
    g.addColorStop(1, css(0x4a3a28));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, w / 2, w * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    // The diamond stubs of cut fronds.
    if (i % 2 === 0 && i < steps) {
      ctx.strokeStyle = css(0x3a2c1c, 0.55);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(x - w / 2, y + 1);
      ctx.lineTo(x - w * 0.1 + rand(), y - 3);
      ctx.lineTo(x + w / 2, y + 1);
      ctx.stroke();
    }
  }
}

/** One frond: a midrib arching out from the crown and drooping, feathered with leaflets. */
function frond(ctx: Ctx, cx: number, cy: number, angle: number, len: number, droop: number, leaf: number): void {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 14; i++) {
    const t = i / 14;
    pts.push({ x: cx + Math.cos(angle) * len * t, y: cy + Math.sin(angle) * len * t * 0.55 + droop * t * t - len * 0.18 * t * (1 - t) });
  }
  ctx.lineWidth = 0.9;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const n = Math.hypot(dx, dy) || 1;
    const along = 1 - i / pts.length;
    const leafLen = 3 + 9 * Math.sin((i / pts.length) * Math.PI);
    for (const side of [-1, 1]) {
      const nx = (-dy / n) * side;
      const ny = (dx / n) * side;
      const lit = ny < 0 ? 1.25 : 0.72;
      ctx.strokeStyle = css(shade(leaf, lit * (0.8 + along * 0.3)));
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + nx * leafLen + dx * 0.3, b.y + ny * leafLen * 0.8 + Math.abs(leafLen) * 0.35);
      ctx.stroke();
    }
  }
  ctx.strokeStyle = css(shade(leaf, 0.6));
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
  ctx.stroke();
}

/** A date palm about 9 m tall, its fronds grey-green in the winter light, the last dates hanging. */
export function paintDatePalm(scene: Phaser.Scene, key: string, height = 200, seed = 7301): void {
  const w = 176;
  const h = height + 44 + FOOT;
  paintTexture(scene, key, w, h, ctx => {
    const ground = h - FOOT;
    const cx = w / 2;
    const rand = rng(seed);
    ellipseShadow(ctx, cx + 20, ground + 2, 46, 12, 0.22);
    ctx.fillStyle = css(0x5a4630, 0.6);
    ctx.beginPath();
    ctx.ellipse(cx, ground, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const top = { x: cx + 6, y: ground - height };
    palmTrunk(ctx, { x: cx, y: ground }, top, 15, 10, seed);
    const leaf = 0x5f7a4a;
    // Back fronds first, then the dates, then the fronds that hang in front.
    const angles = Array.from({ length: 15 }, (_, i) => (i / 15) * Math.PI * 2 + rand() * 0.25);
    const back = angles.filter(a => Math.sin(a) < 0);
    const front = angles.filter(a => Math.sin(a) >= 0);
    for (const a of back) frond(ctx, top.x, top.y, a, 58 + rand() * 18, 18 + rand() * 14, shade(leaf, 0.85));
    // Dry brown fronds hanging below the crown.
    for (const a of [Math.PI * 0.15, Math.PI * 0.8]) frond(ctx, top.x, top.y + 4, a, 40, 40, 0x8a7448);
    // Date clusters under the crown.
    for (const dx of [-8, 6]) {
      rope(ctx, [{ x: top.x + dx * 0.4, y: top.y + 2 }, { x: top.x + dx, y: top.y + 14 }], 1.4, 0xb08a3a);
      for (let i = 0; i < 9; i++) {
        ctx.fillStyle = css(rand() < 0.5 ? 0x8a4a1c : 0xa8642a);
        ctx.beginPath();
        ctx.ellipse(top.x + dx + (rand() - 0.5) * 7, top.y + 13 + rand() * 9, 1.6, 2.1, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    // The crown's heart.
    ctx.fillStyle = litGradient(ctx, top.x, top.y, 7, 0x6a7a44);
    ctx.beginPath();
    ctx.ellipse(top.x, top.y, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    for (const a of front) frond(ctx, top.x, top.y, a, 54 + rand() * 18, 22 + rand() * 14, leaf);
  });
}

/**
 * A guffa drawn up on the shingle: a round basket boat about 3 m across,
 * woven of reeds and sealed inside and out with black bitumen, a paddle
 * laid across its rim and a coil of rope inside.
 */
export function paintGuffa(scene: Phaser.Scene, key: string): void {
  const w = 96;
  const h = 64;
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const cy = h - FOOT - 2;
    const rx = 38;
    const ry = 19;
    const depth = 13;
    ellipseShadow(ctx, cx + 4, cy + 6, rx + 4, ry * 0.8, 0.3);
    // The hull's outer belly.
    const g = ctx.createLinearGradient(cx - rx, 0, cx + rx, 0);
    g.addColorStop(0, css(0x4a3e30));
    g.addColorStop(0.4, css(0x2c241c));
    g.addColorStop(1, css(0x120e0a));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI);
    ctx.lineTo(cx - rx, cy - depth);
    ctx.ellipse(cx, cy - depth, rx, ry, 0, Math.PI, 0, true);
    ctx.closePath();
    ctx.fill();
    // A sheen of bitumen on the lit side.
    ctx.strokeStyle = 'rgba(220,210,190,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy - depth * 0.45, rx - 3, ry - 2, 0, Math.PI * 0.55, Math.PI * 0.95);
    ctx.stroke();
    // Inside: the woven floor, dark with pitch, ribs showing.
    ctx.fillStyle = css(0x3a3026);
    ctx.beginPath();
    ctx.ellipse(cx, cy - depth, rx - 2, ry - 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x5a4a36);
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy - depth + 2, rx - 7, ry - 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0x2a2018, 0.7);
    ctx.lineWidth = 0.8;
    for (let a = 0; a < Math.PI; a += Math.PI / 9) {
      ctx.beginPath();
      ctx.moveTo(cx + 2 + Math.cos(a) * (rx - 7), cy - depth + 2 + Math.sin(a) * (ry - 5));
      ctx.lineTo(cx + 2 - Math.cos(a) * (rx - 7), cy - depth + 2 - Math.sin(a) * (ry - 5));
      ctx.stroke();
    }
    // The rim: a thick lip of bound reeds.
    ctx.strokeStyle = css(0x6a5a44);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(cx, cy - depth, rx - 1, ry - 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,240,210,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy - depth - 1, rx - 1, ry - 0.5, 0, Math.PI, Math.PI * 1.7);
    ctx.stroke();
    // A coil of rope and the paddle across the rim.
    const coil = Array.from({ length: 30 }, (_, i) => {
      const a = (i / 30) * Math.PI * 5;
      const r = 3 + i * 0.12;
      return { x: cx - 12 + Math.cos(a) * r, y: cy - depth + 3 + Math.sin(a) * r * 0.5 };
    });
    rope(ctx, coil, 1.4);
    ctx.strokeStyle = css(0x8a6a44);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - rx - 6, cy - depth + 6);
    ctx.lineTo(cx + rx + 2, cy - depth - 10);
    ctx.stroke();
    ctx.fillStyle = css(0x7a5a38);
    ctx.beginPath();
    ctx.ellipse(cx + rx + 4, cy - depth - 11, 6, 3, -0.35, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * One of the boats moored side by side across the river to carry the
 * bridge of boats: a broad wooden hull lying along the bridge, its deck
 * planks laid over, a mooring rope down into the water.
 */
export function paintPontoon(scene: Phaser.Scene, key: string): void {
  const w = 72;
  const h = 64;
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const cy = h - FOOT;
    const hull = 0x5a4430;
    // The hull, its bow pointing upstream toward the upper left.
    const bow = { x: cx - 30, y: cy - 15 };
    const stern = { x: cx + 30, y: cy + 15 };
    ctx.fillStyle = 'rgba(10,20,26,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx + 2, cy + 3, 34, 11, 0.46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(shade(hull, 0.7));
    ctx.beginPath();
    ctx.moveTo(bow.x, bow.y - 4);
    ctx.quadraticCurveTo(cx + 6, cy - 14, stern.x + 2, stern.y - 6);
    ctx.lineTo(stern.x - 2, stern.y + 2);
    ctx.quadraticCurveTo(cx - 10, cy + 10, bow.x, bow.y - 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(hull);
    ctx.beginPath();
    ctx.moveTo(bow.x, bow.y - 4);
    ctx.quadraticCurveTo(cx - 12, cy - 2, stern.x - 2, stern.y + 2);
    ctx.lineTo(stern.x - 4, stern.y + 7);
    ctx.quadraticCurveTo(cx - 14, cy + 5, bow.x, bow.y);
    ctx.closePath();
    ctx.fill();
    // Deck planks laid across the gunwales.
    ctx.save();
    ctx.translate(cx - 7, cy - 20);
    ctx.transform(1, 0.5, -1, 0.5, 0, 0);
    planks(ctx, 34, 20, { base: 0x8a6a46, light: 1.05, seed: 7311 }, false, 4);
    ctx.restore();
    ctx.strokeStyle = 'rgba(30,18,8,0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bow.x, bow.y - 4);
    ctx.quadraticCurveTo(cx + 6, cy - 14, stern.x + 2, stern.y - 6);
    ctx.stroke();
    rope(ctx, [{ x: bow.x + 4, y: bow.y - 3 }, { x: bow.x - 2, y: bow.y + 8 }, { x: bow.x - 4, y: bow.y + 14 }], 1.3);
  });
}
