import { css, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow, litGradient, pebble } from './fieldKit';
import { roundLog } from './timber';
import { contactShadow, crown, trunk } from './woodland';

/**
 * Bárfurúsh, October 1848: what the companions left on the road and what
 * the day left behind. The heap of their belongings, cast down at dawn by
 * Mullá Ḥusayn's word; the tree by the road cut through with the musket
 * and the man behind it; a companion laid under his cloak; and the goods
 * of Khusraw's horsemen, left in the forest at the last dawn before the
 * shrine. Each is drawn with the middle of its cell at (w / 2, h - 16).
 */

/** Saddlebags, bedding, books in a cloth and a satchel of turquoise spilled in the mud. */
export function drawCastHeap(ctx: Ctx, w: number, h: number): void {
  const cx = w / 2;
  const ground = h - 12;
  ellipseShadow(ctx, cx + 2, ground - 2, 26, 7, 0.3);
  // A rolled quilt at the back of the heap.
  ctx.save();
  ctx.translate(cx - 4, ground - 16);
  ctx.rotate(-0.28);
  ctx.fillStyle = litGradient(ctx, 0, 0, 14, 0x6a5a8a, 0.7);
  ctx.beginPath();
  ctx.ellipse(0, 0, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0x2a2238, 0.7);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
  bag(ctx, cx - 14, ground, 9, 11, 0x7a2f26, 0xc9a55c);
  bag(ctx, cx + 10, ground + 1, 8, 9, 0x3f5a4a, 0xd8c7a0);
  // Books bound in a cloth, tied with cord.
  ctx.fillStyle = litGradient(ctx, cx + 2, ground - 6, 8, 0xc8b48a, 0.6);
  ctx.fillRect(cx - 4, ground - 9, 11, 7);
  ctx.strokeStyle = css(0x5a4a30, 0.9);
  ctx.lineWidth = 0.7;
  ctx.strokeRect(cx - 4, ground - 9, 11, 7);
  ctx.beginPath();
  ctx.moveTo(cx + 1.5, ground - 9);
  ctx.lineTo(cx + 1.5, ground - 2);
  ctx.stroke();
  // The satchel from the turquoise mine, open, its stones in the mud before the heap.
  ctx.fillStyle = litGradient(ctx, cx + 18, ground + 2, 6, 0x6a4a2a, 0.7);
  ctx.beginPath();
  ctx.ellipse(cx + 20, ground + 1, 6, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  const rand = rng(1264);
  for (let i = 0; i < 9; i++) {
    const x = cx + 12 + rand() * 16;
    const y = ground + 2 + rand() * 6;
    pebble(ctx, x, y, 1.4 + rand() * 1.2, 1 + rand() * 0.8, i % 3 ? 0x3aa8a4 : 0x5ec4b8, 30 + i);
  }
}

/** A khurjín: a woven saddlebag, its lozenges in a second colour. */
function bag(ctx: Ctx, cx: number, ground: number, halfW: number, h: number, color: number, motif: number): void {
  ctx.beginPath();
  ctx.moveTo(cx - halfW, ground - h);
  ctx.quadraticCurveTo(cx - halfW - 2, ground - h * 0.3, cx - halfW + 1, ground);
  ctx.lineTo(cx + halfW - 1, ground);
  ctx.quadraticCurveTo(cx + halfW + 2, ground - h * 0.3, cx + halfW, ground - h);
  ctx.quadraticCurveTo(cx, ground - h - 2, cx - halfW, ground - h);
  ctx.fillStyle = litGradient(ctx, cx, ground - h / 2, halfW * 1.3, color, 0.8);
  ctx.fill();
  ctx.strokeStyle = css(shade(color, 0.45));
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = css(motif, 0.85);
  for (let y = ground - h + 3; y < ground - 1; y += 4) {
    for (let x = cx - halfW + 2; x < cx + halfW - 1; x += 4) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 1.2, y - 1.2);
      ctx.lineTo(x + 2.4, y);
      ctx.lineTo(x + 1.2, y + 1.2);
      ctx.fill();
    }
  }
}

/**
 * A broad tree by the road cut clean through at a man's height on a long
 * slant, the upper trunk and its crown fallen to the east, and the two
 * halves of a musket barrel in the grass.
 */
export function drawCleftTree(ctx: Ctx, w: number, h: number): void {
  const cx = w * 0.36;
  const ground = h - 16;
  contactShadow(ctx, cx + 14, ground + 2, 30, 8, 0.3);
  // The fallen crown, lying away to the right.
  crown(ctx, w - 24, ground - 10, 20, 12, { leaves: [0x4a5a2a, 0x5a6a30, 0x7a7a34, 0x8a6a2a], seed: 1848, masses: 7 });
  roundLog(ctx, { x: cx + 6, y: ground - 8 }, { x: w - 30, y: ground - 4 }, 6, { seed: 12, ends: 'a' });
  // The standing stump, its face cut on a slant and pale.
  trunk(ctx, cx, ground, ground - 36, 12, 0x5a4a38);
  ctx.fillStyle = css(0xd8bc8a);
  ctx.beginPath();
  ctx.moveTo(cx - 5, ground - 36);
  ctx.lineTo(cx + 5, ground - 30);
  ctx.lineTo(cx + 4.5, ground - 27);
  ctx.lineTo(cx - 5.5, ground - 33);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x8a6a40, 0.8);
  ctx.lineWidth = 0.6;
  ctx.stroke();
  // The musket barrel, cut in two, and its stock.
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = css(0x3a3a3c);
  ctx.beginPath();
  ctx.moveTo(cx - 20, ground + 4);
  ctx.lineTo(cx - 8, ground + 1);
  ctx.moveTo(cx - 5, ground + 6);
  ctx.lineTo(cx + 6, ground + 9);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = css(0x6a4224);
  ctx.beginPath();
  ctx.moveTo(cx + 6, ground + 9);
  ctx.lineTo(cx + 13, ground + 11);
  ctx.stroke();
}

/** Someone laid on the ground under his own cloak, a cloth over the face, on a straw mat. */
export function drawShroud(ctx: Ctx, w: number, h: number, cloak: number, head: number): void {
  const cx = w / 2;
  const cy = h - 16;
  ellipseShadow(ctx, cx + 2, cy + 2, 25, 8, 0.28);
  // The mat, a lozenge along the cell's diagonal.
  ctx.fillStyle = css(0xb8a070);
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy + 4);
  ctx.lineTo(cx + 6, cy - 12);
  ctx.lineTo(cx + 26, cy - 3);
  ctx.lineTo(cx - 6, cy + 13);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x6a5a3a, 0.7);
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.strokeStyle = css(0x8a7448, 0.5);
  for (let t = 0.2; t < 1; t += 0.2) {
    ctx.beginPath();
    ctx.moveTo(cx - 26 + 32 * t, cy + 4 - 16 * t);
    ctx.lineTo(cx - 6 + 32 * t, cy + 13 - 16 * t);
    ctx.stroke();
  }
  // The body under the cloak: a long low hump, head to the upper right.
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.46);
  ctx.fillStyle = litGradient(ctx, 0, -3, 20, cloak, 0.75);
  ctx.beginPath();
  ctx.moveTo(-19, 1);
  ctx.quadraticCurveTo(-18, -7, -6, -7);
  ctx.quadraticCurveTo(6, -9, 13, -6);
  ctx.lineTo(13, 3);
  ctx.quadraticCurveTo(0, 6, -19, 1);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(shade(cloak, 0.4), 0.8);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // The fold of the cloak down the length of him.
  ctx.strokeStyle = css(shade(cloak, 0.7), 0.7);
  ctx.beginPath();
  ctx.moveTo(-15, -2);
  ctx.quadraticCurveTo(0, -5, 12, -3);
  ctx.stroke();
  // The head, covered.
  ctx.fillStyle = litGradient(ctx, 17, -2, 5, head, 0.6);
  ctx.beginPath();
  ctx.ellipse(17, -1.5, 5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(shade(head, 0.5), 0.8);
  ctx.stroke();
  ctx.restore();
}

/** What Khusraw's horsemen carried off and the companions took back: saddles, bundles, a rug, a copper pan. */
export function drawPlunder(ctx: Ctx, w: number, h: number): void {
  const cx = w / 2;
  const ground = h - 12;
  ellipseShadow(ctx, cx + 1, ground - 1, 24, 7, 0.3);
  // A folded rug at the back.
  ctx.fillStyle = litGradient(ctx, cx - 6, ground - 12, 12, 0x8a2a24, 0.6);
  ctx.beginPath();
  ctx.moveTo(cx - 20, ground - 10);
  ctx.lineTo(cx + 2, ground - 20);
  ctx.lineTo(cx + 12, ground - 15);
  ctx.lineTo(cx - 10, ground - 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x1f2f5a, 0.8);
  ctx.lineWidth = 1.2;
  ctx.stroke();
  // A saddle with its stirrup hanging.
  ctx.fillStyle = litGradient(ctx, cx + 8, ground - 9, 9, 0x6a3a1c, 0.8);
  ctx.beginPath();
  ctx.moveTo(cx - 1, ground - 4);
  ctx.quadraticCurveTo(cx, ground - 14, cx + 6, ground - 12);
  ctx.quadraticCurveTo(cx + 11, ground - 10, cx + 16, ground - 15);
  ctx.quadraticCurveTo(cx + 19, ground - 7, cx + 15, ground - 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x2a1608, 0.8);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = css(0x9a9a9a);
  ctx.beginPath();
  ctx.moveTo(cx + 9, ground - 5);
  ctx.lineTo(cx + 9, ground + 1);
  ctx.stroke();
  ctx.strokeRect(cx + 7.5, ground + 1, 3, 1.5);
  bag(ctx, cx - 13, ground + 1, 7, 8, 0x5a4a2e, 0xb89a5a);
  // A copper pan on its side.
  ctx.fillStyle = litGradient(ctx, cx + 20, ground + 1, 5, 0xb86a34, 0.8);
  ctx.beginPath();
  ctx.ellipse(cx + 21, ground + 1, 4, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0x5a2a10, 0.8);
  ctx.stroke();
}
