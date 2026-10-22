import type Phaser from 'phaser';
import { css, footprintBox, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow, foliageClump, litGradient, rope } from './fieldKit';
import { slab } from './massing';
import { glow, subBox } from './structureParts';

/**
 * The road from Káshán to Kulayn, spring 1847, at true scale (1 m is about
 * 23 px): the escort's saddled horses, almond and apricot trees in blossom,
 * and the two thresholds the chapter is told through, a stone step with a
 * lantern and a dish of Naw-Rúz greens before a closed door in Káshán, and
 * a kilim with a lantern and an ewer before a tent at Kulayn.
 */

export interface HorseStyle {
  coat: number;
  mane: number;
  /** The saddle cloth (jul). */
  cloth: number;
  trim: number;
  seed: number;
}

export const BAY_HORSE: HorseStyle = { coat: 0x7a4428, mane: 0x1e140e, cloth: 0x8a2a24, trim: 0xd8b04a, seed: 611 };
export const GREY_HORSE: HorseStyle = { coat: 0xb4ada2, mane: 0x5a544c, cloth: 0x2a3e5e, trim: 0xd8c7a0, seed: 617 };

/** Texture size for a horse: one cell wide plus the head and tail that overhang it. */
export const HORSE_TEX = { w: 80, h: 70 } as const;

/** One leg from the body down to the hoof, `bend` pushing the knee forward. */
function leg(ctx: Ctx, x: number, top: number, ground: number, color: number, bend: number): void {
  ctx.strokeStyle = css(color);
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.quadraticCurveTo(x + bend, (top + ground) / 2, x, ground - 2.5);
  ctx.stroke();
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x, (top + ground) / 2 + 3);
  ctx.lineTo(x, ground - 2.5);
  ctx.stroke();
  ctx.fillStyle = css(0x1a120c);
  ctx.fillRect(x - 2, ground - 3, 4, 3);
}

/**
 * A saddled horse standing at a picket, head to the left: about 1.5 m at
 * the withers (35 px), 1.9 m to the ears, a red or blue saddle cloth with
 * a gold border, the Persian saddle with its high pommel, a tether rope
 * to a stake.
 */
export function drawHorse(ctx: Ctx, s: HorseStyle): void {
  const ground = HORSE_TEX.h - 14;
  const rand = rng(s.seed);
  ellipseShadow(ctx, 42, ground, 26, 5.5, 0.3);
  // Far legs, in shade, behind the body.
  const far = shade(s.coat, 0.55);
  leg(ctx, 30, 34, ground - 1, far, 1.5);
  leg(ctx, 53, 34, ground - 1, far, -1.5);
  // Tail, falling from the croup.
  ctx.strokeStyle = css(s.mane);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(60, 23);
  ctx.bezierCurveTo(66, 26, 65, 36, 63, 44);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(61, 25);
    ctx.bezierCurveTo(65 + i, 28, 64 + i * 0.6, 38, 62 + i * 0.8, 45 + rand() * 2);
    ctx.stroke();
  }
  // Barrel of the body, chest to haunch.
  ctx.beginPath();
  ctx.moveTo(24, 22);
  ctx.bezierCurveTo(28, 15, 52, 14, 59, 19);
  ctx.bezierCurveTo(64, 23, 62, 33, 56, 35);
  ctx.quadraticCurveTo(42, 39, 28, 35);
  ctx.bezierCurveTo(22, 33, 21, 26, 24, 22);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 38, 24, 22, s.coat, 0.9);
  ctx.fill();
  ctx.strokeStyle = css(shade(s.coat, 0.4), 0.9);
  ctx.lineWidth = 0.9;
  ctx.stroke();
  // Neck rising to the poll, and the head angled down to the left.
  ctx.beginPath();
  ctx.moveTo(25, 26);
  ctx.bezierCurveTo(22, 18, 18, 12, 15, 7);
  ctx.lineTo(21, 4);
  ctx.bezierCurveTo(26, 9, 31, 15, 34, 19);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 22, 13, 12, shade(s.coat, 1.02), 0.8);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(15, 6);
  ctx.bezierCurveTo(12, 8, 7, 14, 5, 18);
  ctx.quadraticCurveTo(5, 21, 8, 21);
  ctx.bezierCurveTo(12, 19, 16, 15, 21, 9);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 12, 12, 8, s.coat, 0.8);
  ctx.fill();
  ctx.stroke();
  // Ears, eye, nostril, mane along the crest.
  ctx.fillStyle = css(shade(s.coat, 0.8));
  ctx.beginPath();
  ctx.moveTo(17, 5);
  ctx.lineTo(17.5, 0.5);
  ctx.lineTo(19.5, 4.5);
  ctx.fill();
  ctx.fillStyle = css(0x120c08);
  ctx.fillRect(13.5, 9.5, 1.6, 1.3);
  ctx.fillRect(6.2, 18.4, 1, 1);
  ctx.strokeStyle = css(s.mane);
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(19, 4);
  ctx.bezierCurveTo(24, 9, 29, 15, 33, 19);
  ctx.stroke();
  // Bridle: cheek strap and reins over the neck.
  ctx.strokeStyle = css(0x3a2414);
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(16, 6);
  ctx.lineTo(9, 17);
  ctx.moveTo(9, 17);
  ctx.quadraticCurveTo(18, 22, 30, 19);
  ctx.stroke();
  // Near legs, in front of the body.
  leg(ctx, 27, 32, ground, shade(s.coat, 0.85), 2);
  leg(ctx, 56, 32, ground, shade(s.coat, 0.85), -2);
  // Saddle cloth, then the saddle with its high pommel and cantle.
  ctx.beginPath();
  ctx.moveTo(34, 17);
  ctx.lineTo(50, 17);
  ctx.lineTo(51, 31);
  ctx.quadraticCurveTo(42, 33, 33, 31);
  ctx.closePath();
  ctx.fillStyle = litGradient(ctx, 38, 21, 12, s.cloth, 0.8);
  ctx.fill();
  ctx.strokeStyle = css(s.trim);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = css(s.trim, 0.9);
  for (let x = 35; x < 50; x += 3.2) ctx.fillRect(x, 30.4, 1, 2.2);
  ctx.fillStyle = litGradient(ctx, 41, 15, 6, 0x5a3418, 0.8);
  ctx.beginPath();
  ctx.moveTo(35, 17);
  ctx.quadraticCurveTo(35, 11, 37, 11);
  ctx.quadraticCurveTo(42, 16, 47, 14);
  ctx.quadraticCurveTo(49, 13, 49, 17);
  ctx.closePath();
  ctx.fill();
  // Stirrup hanging on its leather.
  ctx.strokeStyle = css(0x3a2414);
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(41, 18);
  ctx.lineTo(41, 33);
  ctx.stroke();
  ctx.fillStyle = css(0x8a8070);
  ctx.fillRect(39.5, 33, 3, 1.6);
  // Tether to a stake in front.
  rope(ctx, [{ x: 7, y: 19 }, { x: 5, y: 30 }, { x: 4, y: 42 }, { x: 6, y: ground - 1 }], 0x8a6a42, 0.9);
  ctx.fillStyle = css(0x5a3a20);
  ctx.fillRect(5, ground - 6, 2, 6);
}

/** A tree in blossom: almond or apricot, no leaves yet, a cloud of white and pink on dark limbs. */
export interface BlossomStyle {
  height: number;
  bloom: number;
  seed: number;
}

export const ALMOND_BLOSSOM: BlossomStyle = { height: 112, bloom: 0xf2dfe2, seed: 701 };
export const APRICOT_BLOSSOM: BlossomStyle = { height: 98, bloom: 0xf6eee6, seed: 709 };

/** Texture size for a blossom tree; its trunk stands on the cell's centre, 16 px above the bottom. */
export function blossomTex(s: BlossomStyle): { w: number; h: number } {
  return { w: Math.ceil(s.height * 0.8 + 24), h: s.height + 22 };
}

export function drawBlossomTree(ctx: Ctx, s: BlossomStyle): void {
  const { w, h } = blossomTex(s);
  const cx = w / 2;
  const ground = h - 16;
  const r = s.height * 0.38;
  const rand = rng(s.seed);
  ellipseShadow(ctx, cx + r * 0.25, ground + 1, r * 0.9, r * 0.32, 0.26);
  // A low trunk forking into bare dark limbs that show through the flowers.
  const bark = 0x4a3426;
  ctx.strokeStyle = css(bark);
  ctx.lineCap = 'round';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx, ground);
  ctx.quadraticCurveTo(cx - 2, ground - s.height * 0.2, cx + 1, ground - s.height * 0.32);
  ctx.stroke();
  const fork = { x: cx + 1, y: ground - s.height * 0.32 };
  const top = ground - s.height + r;
  for (let i = 0; i < 5; i++) {
    const t = -0.9 + i * 0.45 + (rand() - 0.5) * 0.2;
    ctx.lineWidth = 3.2 - Math.abs(t);
    ctx.beginPath();
    ctx.moveTo(fork.x, fork.y);
    ctx.quadraticCurveTo(fork.x + t * r * 0.4, fork.y - r * 0.5, fork.x + t * r * 0.85, top - r * 0.2 + Math.abs(t) * r * 0.3);
    ctx.stroke();
  }
  // Blossom in clumps, paler on the lit upper left; twigs between them.
  const clumps = Array.from({ length: 16 }, () => {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 0.8;
    return { x: cx + Math.cos(a) * r * d, y: top + Math.sin(a) * r * 0.8 * d, k: rand() };
  }).sort((a, b) => a.y - b.y);
  clumps.forEach((k, i) => {
    const shadeK = 1 - Math.max(0, (k.x - cx) / r + (k.y - top) / r) * 0.14;
    foliageClump(ctx, k.x, k.y, r * (0.26 + k.k * 0.14), {
      leaf: shade(s.bloom, shadeK * 0.96), seed: s.seed + i * 5, masses: 5, squash: 0.8, bloom: i % 3 === 0 ? 0xd88a98 : 0xffffff,
    });
  });
  ctx.strokeStyle = css(bark, 0.7);
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 9; i++) {
    const x = cx + (rand() - 0.5) * r * 1.6;
    const y = top + (rand() - 0.5) * r;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 8, y - 3 - rand() * 5);
    ctx.stroke();
  }
  // A few fallen petals on the ground.
  ctx.fillStyle = css(s.bloom, 0.85);
  for (let i = 0; i < 14; i++) ctx.fillRect(cx + (rand() - 0.5) * r * 1.8, ground - 2 + (rand() - 0.5) * 8, 1.2, 1);
}

/** A brass lantern standing on the ground or a step, alight. */
function lantern(ctx: Ctx, x: number, base: number): void {
  glow(ctx, x, base - 7, 22, 0xffc070, 0.45);
  ctx.fillStyle = css(0x6a4a1c);
  ctx.fillRect(x - 3.5, base - 2, 7, 2);
  ctx.fillStyle = css(0xffd890, 0.95);
  ctx.fillRect(x - 3, base - 11, 6, 9);
  ctx.strokeStyle = css(0x8a6a2a);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x - 3, base - 11, 6, 9);
  ctx.beginPath();
  ctx.moveTo(x, base - 11);
  ctx.lineTo(x, base - 2);
  ctx.stroke();
  ctx.fillStyle = css(0x8a6a2a);
  ctx.beginPath();
  ctx.moveTo(x - 4, base - 11);
  ctx.lineTo(x, base - 15);
  ctx.lineTo(x + 4, base - 11);
  ctx.fill();
  ctx.strokeStyle = css(0x6a4a1c);
  ctx.beginPath();
  ctx.arc(x, base - 16.5, 1.6, 0, Math.PI * 2);
  ctx.stroke();
}

/** A shallow dish of sprouted wheat, the sabzih grown for Naw-Rúz, tied with a red ribbon. */
function sabzih(ctx: Ctx, x: number, y: number, seed: number): void {
  const rand = rng(seed);
  ctx.fillStyle = css(0x2a5a7a);
  ctx.beginPath();
  ctx.ellipse(x, y, 6, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0x6a9a40);
  ctx.lineWidth = 0.7;
  for (let i = 0; i < 26; i++) {
    const bx = x + (rand() - 0.5) * 9;
    ctx.beginPath();
    ctx.moveTo(bx, y - 0.5);
    ctx.lineTo(bx + (rand() - 0.5) * 2, y - 6 - rand() * 3);
    ctx.stroke();
  }
  ctx.fillStyle = css(0xb02a2a);
  ctx.fillRect(x - 4.5, y - 3.5, 9, 1.2);
}

/**
 * The step before the guest room in Ḥájí Mírzá Jání's house: a stone
 * threshold, a lantern alight, the dish of Naw-Rúz greens, and a pair of
 * slippers left at the door.
 */
export function paintHallThreshold(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 6, 24);
  paintTexture(scene, key, texW, texH, ctx => {
    const step = subBox(box, 2, 30, 2, 30, 6);
    slab(ctx, step, 0xb0a084, 851);
    const top = step.y - step.w / 2 - step.h;
    lantern(ctx, step.x - 8, top + 4);
    sabzih(ctx, step.x + 9, top + 6, 852);
    ctx.fillStyle = css(0x2f2a24);
    ctx.beginPath();
    ctx.ellipse(step.x - 1, top + 11, 3.2, 1.4, -0.3, 0, Math.PI * 2);
    ctx.ellipse(step.x + 3, top + 12.5, 3.2, 1.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** The kilim spread before the tent at Kulayn, a lantern and a copper ewer on it. */
export function drawTentThreshold(ctx: Ctx, texW: number, texH: number): void {
  const cx = texW / 2;
  const cy = texH - 16;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  ctx.moveTo(-22, 0);
  ctx.lineTo(0, -11);
  ctx.lineTo(22, 0);
  ctx.lineTo(0, 11);
  ctx.closePath();
  ctx.fillStyle = css(0x8a3226);
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = css(0xd8b06a, 0.9);
  ctx.lineWidth = 1.2;
  for (const k of [0.75, 0.45]) {
    ctx.beginPath();
    ctx.moveTo(-22 * k, 0);
    ctx.lineTo(0, -11 * k);
    ctx.lineTo(22 * k, 0);
    ctx.lineTo(0, 11 * k);
    ctx.closePath();
    ctx.stroke();
  }
  ctx.fillStyle = css(0x1f2f5a);
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(0, -2.5);
  ctx.lineTo(5, 0);
  ctx.lineTo(0, 2.5);
  ctx.fill();
  ctx.restore();
  lantern(ctx, cx - 8, cy + 1);
  // The ewer: a round copper body, a long spout, a handle.
  const ex = cx + 9;
  const ey = cy - 1;
  ctx.fillStyle = litGradient(ctx, ex, ey - 5, 5, 0xa8603a);
  ctx.beginPath();
  ctx.ellipse(ex, ey - 4, 4, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(ex - 1.5, ey - 12, 3, 5);
  ctx.strokeStyle = css(0x7a4022);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(ex - 3, ey - 4);
  ctx.quadraticCurveTo(ex - 7, ey - 7, ex - 8, ey - 11);
  ctx.moveTo(ex + 3.5, ey - 9);
  ctx.quadraticCurveTo(ex + 7, ey - 6, ex + 3.5, ey - 2);
  ctx.stroke();
}
