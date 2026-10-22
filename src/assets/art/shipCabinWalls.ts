import { css, shade, type Ctx } from './canvasKit';
import { planks } from './materials';

/**
 * Wall faces for the cabin of the pilgrim ship (see `WALL_STYLES` in
 * `walls.ts`). Each face is painted in cell-aligned pattern space (0..32
 * across one cell), so a feature centred on u = 16 sits in the middle of its
 * cell and plain runs join seamlessly.
 */

const TEAK = 0x7a4f2c;
const DARK_TEAK = 0x4a2e18;
const BRASS = 0xc9a55c;

/** Planked bulkhead on heavy frames, a clamp beam under the deck above, tar in the seams. */
export function shipTimberFace(ctx: Ctx, w: number, h: number, l: number): void {
  planks(ctx, w, h, { base: TEAK, light: l, seed: l === 1 ? 611 : 612 }, false, 5);
  // Frames (ribs) every half cell.
  for (let u = 0; u < w + 16; u += 16) {
    ctx.fillStyle = css(shade(DARK_TEAK, l));
    ctx.fillRect(u - 1.5, 6, 3, h - 6);
    ctx.fillStyle = css(shade(0x9a6a3c, l), 0.5);
    ctx.fillRect(u - 1.5, 6, 0.8, h - 6);
  }
  // The clamp: a heavy beam along the top that carries the deck beams.
  ctx.fillStyle = css(shade(DARK_TEAK, l * 1.1));
  ctx.fillRect(0, 0, w, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.fillRect(0, 6, w, 1.5);
  // A dark strake at the foot where the bilge damp creeps up.
  const damp = ctx.createLinearGradient(0, h - 12, 0, h);
  damp.addColorStop(0, 'rgba(20,10,4,0)');
  damp.addColorStop(1, 'rgba(20,10,4,0.4)');
  ctx.fillStyle = damp;
  ctx.fillRect(0, h - 12, w, 12);
}

/** A small square port with a lattice, grey sea light behind it. */
export function shipPortFace(ctx: Ctx, w: number, h: number, l: number): void {
  shipTimberFace(ctx, w, h, l);
  const x = 10;
  const y = 18;
  ctx.fillStyle = css(shade(BRASS, l * 0.9));
  ctx.fillRect(x - 2, y - 2, 16, 16);
  const sea = ctx.createLinearGradient(0, y, 0, y + 12);
  sea.addColorStop(0, css(shade(0x8aa0b0, l)));
  sea.addColorStop(0.55, css(shade(0x5a7488, l)));
  sea.addColorStop(1, css(shade(0x2e4458, l)));
  ctx.fillStyle = sea;
  ctx.fillRect(x, y, 12, 12);
  ctx.strokeStyle = css(shade(DARK_TEAK, l), 0.95);
  ctx.lineWidth = 0.9;
  for (let k = 3; k < 12; k += 3) {
    ctx.beginPath();
    ctx.moveTo(x + k, y);
    ctx.lineTo(x + k, y + 12);
    ctx.moveTo(x, y + k);
    ctx.lineTo(x + 12, y + k);
    ctx.stroke();
  }
  // Salt crusted on the sill.
  ctx.fillStyle = 'rgba(240,240,232,0.55)';
  ctx.fillRect(x - 1, y + 12, 14, 1);
}

/** Pegs along the bulkhead hung with a cloak, a water skin and a pierced tin lantern, unlit. */
export function shipPegsFace(ctx: Ctx, w: number, h: number, l: number): void {
  shipTimberFace(ctx, w, h, l);
  ctx.fillStyle = css(shade(DARK_TEAK, l * 0.8));
  ctx.fillRect(2, 16, 28, 2.5);
  for (const u of [6, 16, 26]) {
    ctx.fillStyle = css(shade(0x9a6a3c, l));
    ctx.fillRect(u - 1, 14.5, 2, 3);
  }
  // A travelling cloak, folded over its peg.
  ctx.fillStyle = css(shade(0x5a4a38, l));
  ctx.beginPath();
  ctx.moveTo(3, 17);
  ctx.lineTo(10, 17);
  ctx.quadraticCurveTo(12, 30, 10, 44);
  ctx.lineTo(2, 43);
  ctx.quadraticCurveTo(1, 30, 3, 17);
  ctx.fill();
  ctx.fillStyle = css(shade(0x3e3226, l));
  ctx.fillRect(5, 20, 1, 22);
  // A goatskin water bag, slack: the voyage is long.
  ctx.fillStyle = css(shade(0x6a4628, l));
  ctx.beginPath();
  ctx.ellipse(16, 27, 4, 7, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(shade(0x2a1a0a, l));
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(16, 17);
  ctx.lineTo(16, 21);
  ctx.stroke();
  // A pierced tin lantern.
  ctx.fillStyle = css(shade(0x8a8478, l));
  ctx.fillRect(23.5, 19, 5, 8);
  ctx.fillStyle = css(shade(0x3a3630, l));
  for (let v = 20.5; v < 26; v += 2) ctx.fillRect(25, v, 1, 0.8);
  ctx.fillRect(24, 18, 4, 1);
}

/**
 * The partition into the inner room: a doorway hung with an indigo curtain,
 * lamplight leaking round its edges. It is never drawn aside.
 */
export function shipCurtainFace(ctx: Ctx, w: number, h: number, l: number): void {
  shipTimberFace(ctx, w, h, l);
  const x = 8;
  const dw = 16;
  const top = h - 40;
  // The door frame and a raised coaming.
  ctx.fillStyle = css(shade(DARK_TEAK, l * 0.9));
  ctx.fillRect(x - 2.5, top - 3, dw + 5, 43);
  // Lamplight behind the cloth.
  const glow = ctx.createLinearGradient(0, top, 0, h);
  glow.addColorStop(0, '#ffd890');
  glow.addColorStop(1, '#c47a2c');
  ctx.fillStyle = glow;
  ctx.fillRect(x, top, dw, 40);
  // The curtain, hanging in folds from a rod, a hand's breadth short of the sill.
  for (let k = 0; k < 4; k++) {
    const fx = x + 0.6 + k * 3.8;
    ctx.fillStyle = css(shade(k % 2 === 0 ? 0x2c3a6a : 0x22305a, l));
    ctx.fillRect(fx, top + 1, 3.8, 35.5);
  }
  ctx.fillStyle = css(shade(BRASS, l), 0.8);
  for (let u = x + 1.5; u < x + dw - 1; u += 3) ctx.fillRect(u, top + 33, 1.6, 1.6);
  ctx.fillStyle = css(shade(BRASS, l));
  ctx.fillRect(x - 3, top - 1, dw + 6, 1.6);
  // Light along the edges and under the hem.
  ctx.fillStyle = 'rgba(255,214,140,0.65)';
  ctx.fillRect(x, top + 2, 0.8, 35);
  ctx.fillRect(x + dw - 0.8, top + 2, 0.8, 35);
  ctx.fillStyle = 'rgba(255,214,140,0.85)';
  ctx.fillRect(x, top + 36.5, dw, 1.5);
  ctx.fillStyle = css(shade(DARK_TEAK, l * 0.8));
  ctx.fillRect(x - 3, h - 2.5, dw + 6, 2.5);
}
