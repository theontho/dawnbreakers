import { css, shade, type Ctx } from './canvasKit';
import { ellipseShadow } from './fieldKit';

/**
 * The pilgrim baghla out of Búshihr: a lateen-rigged mast and the ship's
 * boat, painted in the deck plane where that is what the eye expects. The
 * stern deckhouse is in `shipCabin.ts`.
 */

const DARK_TEAK = 0x4a2e18;
const CANVAS = 0xd8c7a0;

/** A mast with its lateen yard and sail, shrouds and a pennant. */
export function drawLateenMast(ctx: Ctx, x: number, deck: number): void {
  ellipseShadow(ctx, x + 3, deck - 1, 12, 4);
  const top = 8;
  // Shrouds behind the sail.
  ctx.strokeStyle = 'rgba(40,28,16,0.75)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  for (const fx of [x - 24, x - 16, x + 16, x + 24]) {
    ctx.moveTo(x, top + 6);
    ctx.lineTo(fx, deck - 2);
  }
  ctx.stroke();
  const mast = ctx.createLinearGradient(x - 3, 0, x + 3, 0);
  mast.addColorStop(0, css(0x8a6038));
  mast.addColorStop(0.4, css(0xa87848));
  mast.addColorStop(1, css(0x4a2e18));
  ctx.fillStyle = mast;
  ctx.beginPath();
  ctx.moveTo(x - 2, top);
  ctx.lineTo(x + 2, top);
  ctx.lineTo(x + 3, deck);
  ctx.lineTo(x - 3, deck);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(DARK_TEAK);
  ctx.fillRect(x - 4.5, deck - 4, 9, 4);
  // The sail: luff along the yard, leech and foot bellied by the wind.
  const tack = { x: 3, y: 62 };
  const peak = { x: 62, y: 4 };
  const clew = { x: 54, y: 92 };
  const sail = (): void => {
    ctx.beginPath();
    ctx.moveTo(tack.x, tack.y);
    ctx.lineTo(peak.x, peak.y);
    ctx.quadraticCurveTo(peak.x + 2, (peak.y + clew.y) / 2, clew.x, clew.y);
    ctx.quadraticCurveTo(26, 86, tack.x, tack.y);
    ctx.closePath();
  };
  sail();
  const cloth = ctx.createLinearGradient(tack.x, tack.y, clew.x, clew.y - 40);
  cloth.addColorStop(0, css(shade(CANVAS, 1.1)));
  cloth.addColorStop(0.55, css(CANVAS));
  cloth.addColorStop(1, css(shade(CANVAS, 0.66)));
  ctx.fillStyle = cloth;
  ctx.globalAlpha = 0.96;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.save();
  sail();
  ctx.clip();
  // Seams of the sailcloth, and a weathered patch.
  ctx.strokeStyle = css(shade(CANVAS, 0.72), 0.6);
  ctx.lineWidth = 0.6;
  for (let k = 0; k < 9; k++) {
    const t = k / 9;
    const sx = tack.x + (peak.x - tack.x) * t;
    const sy = tack.y + (peak.y - tack.y) * t;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + 14 + t * 6, sy + 40);
    ctx.stroke();
  }
  ctx.fillStyle = css(shade(CANVAS, 0.85), 0.8);
  ctx.fillRect(36, 44, 7, 6);
  // The mast seen through the thin canvas.
  ctx.fillStyle = 'rgba(40,24,10,0.18)';
  ctx.fillRect(x - 2, top, 4, deck - top);
  ctx.restore();
  ctx.strokeStyle = 'rgba(40,24,10,0.6)';
  ctx.lineWidth = 0.8;
  sail();
  ctx.stroke();
  // The long yard.
  ctx.strokeStyle = css(DARK_TEAK);
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(tack.x - 1, tack.y + 1);
  ctx.lineTo(peak.x + 1, peak.y - 1);
  ctx.stroke();
  ctx.strokeStyle = css(0xa87848, 0.8);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(tack.x, tack.y - 0.8);
  ctx.lineTo(peak.x, peak.y - 1.8);
  ctx.stroke();
  // Sheet from the clew to the deck, and a red pennant at the masthead.
  ctx.strokeStyle = 'rgba(40,28,16,0.8)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(clew.x, clew.y);
  ctx.lineTo(clew.x - 6, deck - 4);
  ctx.stroke();
  ctx.fillStyle = css(0xa83a2a);
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.quadraticCurveTo(x - 6, top - 1, x - 13, top + 2);
  ctx.lineTo(x, top + 4);
  ctx.closePath();
  ctx.fill();
}

/** The ship's boat, double-ended, riding on the water along the grid x axis. */
export function drawSkiff(ctx: Ctx): void {
  // Ground plane: p along grid x, q along grid y.
  const plane = (lift: number, paint: () => void): void => {
    ctx.save();
    ctx.translate(0, -lift);
    ctx.transform(1, 0.5, -1, 0.5, 14, 6);
    paint();
    ctx.restore();
  };
  const hull = (inset: number): void => {
    const L = 46;
    const B = 13;
    ctx.beginPath();
    ctx.moveTo(inset * 1.6, B / 2);
    ctx.quadraticCurveTo(L * 0.25, inset, L / 2, inset);
    ctx.quadraticCurveTo(L * 0.75, inset, L - inset * 1.6, B / 2);
    ctx.quadraticCurveTo(L * 0.75, B - inset, L / 2, B - inset);
    ctx.quadraticCurveTo(L * 0.25, B - inset, inset * 1.6, B / 2);
    ctx.closePath();
  };
  // Ripples and the boat's shadow on the water.
  plane(0, () => {
    ctx.strokeStyle = 'rgba(220,230,235,0.35)';
    ctx.lineWidth = 0.8;
    for (const k of [3, 6]) {
      ctx.beginPath();
      ctx.ellipse(23, 6.5, 23 + k, 6.5 + k, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    hull(0);
    ctx.fillStyle = 'rgba(8,16,24,0.35)';
    ctx.fill();
  });
  plane(1, () => {
    hull(0);
    ctx.fillStyle = css(0x3a2412);
    ctx.fill();
  });
  plane(4, () => {
    hull(0);
    ctx.fillStyle = css(0x5a3a1f);
    ctx.fill();
    hull(1.6);
    ctx.fillStyle = css(0x8a6038);
    ctx.fill();
    // Thwarts and floorboards.
    ctx.fillStyle = css(0x6a4525);
    for (const p of [14, 24, 34]) ctx.fillRect(p, 2, 2.2, 9);
    ctx.strokeStyle = 'rgba(40,24,10,0.35)';
    ctx.lineWidth = 0.5;
    for (let q = 4; q < 10; q += 2) {
      ctx.beginPath();
      ctx.moveTo(6, q);
      ctx.lineTo(40, q);
      ctx.stroke();
    }
    // Oars shipped along the boat.
    ctx.strokeStyle = css(0xc8a070);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, 4.5);
    ctx.lineTo(42, 5.5);
    ctx.moveTo(8, 8.5);
    ctx.lineTo(42, 7.5);
    ctx.stroke();
    hull(0);
    ctx.strokeStyle = css(0x2a1a0a, 0.9);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });
}
