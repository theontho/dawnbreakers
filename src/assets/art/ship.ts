import { css, shade, type Ctx } from './canvasKit';
import { rope } from './cordage';
import { ellipseShadow } from './fieldKit';

/**
 * The pilgrim baghla out of Búshihr at true scale (one cell is 1.4 m, a
 * person 40 px): the mainmast with its lateen yard and reefed storm sail,
 * and the ship's boat. The stern deckhouse is in `shipCabin.ts`.
 *
 * The mast is drawn in the ship's own frame: `c` cells along the keel (grid x,
 * toward the bow), `s` cells athwartships (grid y, toward the near rail),
 * `h` pixels above the deck.
 */

const DARK_TEAK = 0x4a2e18;
const SPAR = 0x8a6038;
const CANVAS = 0xd8c7a0;
const LINE = 'rgba(40,28,16,0.8)';

type Pt = { x: number; y: number };
type Frame = (c: number, s: number, h: number) => Pt;

function shipFrame(cx: number, deck: number): Frame {
  return (c, s, h) => ({ x: cx + (c - s) * 32, y: deck + (c + s) * 16 - h });
}

function line(ctx: Ctx, a: Pt, b: Pt, width = 0.8, color = LINE): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

/**
 * Texture size for the mast: the yard reaches 8 cells aft, the forestay 13.5
 * forward to the stem head. The stem head lies well in front of the mast's
 * cell, so `foot` leaves room below the anchor for the forestay to reach it.
 */
export const MAST_TEXTURE = { w: 900, h: 590, foot: 128 } as const;

/**
 * The mainmast, raked forward, about 15 m above the deck. Its long lateen
 * yard rises aft; under it the sail is reefed down for the storm, its foot
 * well above a man's head so the deck stays clear beneath.
 */
export function drawLateenMast(ctx: Ctx, cx: number, deck: number): void {
  const at = shipFrame(cx, deck);
  const MAST_H = 340;
  const rake = 0.35;
  const head = at(rake, 0, MAST_H);
  ellipseShadow(ctx, cx + 4, deck, 16, 6);
  // Shrouds from the masthead down to the chain plates on both rails.
  for (const [c, s] of [[-1.2, -3.8], [0.4, -3.8], [-2.6, 3.8], [-1.6, 3.8]] as const) line(ctx, head, at(c, s, 20), 0.9);
  // The forestay to the stem head.
  line(ctx, head, at(13.4, 0, 78), 0.9);

  // The mast: a tapering pole of teak bound with rope wooldings.
  const foot = at(0, 0, 0);
  ctx.save();
  const shaft = ctx.createLinearGradient(foot.x - 6, 0, foot.x + 6, 0);
  shaft.addColorStop(0, css(0x8a6038));
  shaft.addColorStop(0.4, css(0xb08050));
  shaft.addColorStop(1, css(DARK_TEAK));
  ctx.fillStyle = shaft;
  ctx.beginPath();
  ctx.moveTo(foot.x - 6, foot.y);
  ctx.lineTo(head.x - 3, head.y);
  ctx.lineTo(head.x + 3, head.y);
  ctx.lineTo(foot.x + 6, foot.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,4,0.55)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
  for (let k = 0.12; k < 0.75; k += 0.11) {
    const y = foot.y + (head.y - foot.y) * k;
    const x = foot.x + (head.x - foot.x) * k;
    const r = 6 - 3 * k;
    ctx.fillStyle = css(0x8a7450);
    ctx.fillRect(x - r - 0.5, y - 2, r * 2 + 1, 4);
    ctx.fillStyle = 'rgba(20,10,4,0.4)';
    ctx.fillRect(x - r - 0.5, y + 1.2, r * 2 + 1, 0.8);
  }
  // The mast partners: a collar of timber where it passes through the deck.
  ctx.fillStyle = css(DARK_TEAK);
  ctx.beginPath();
  ctx.ellipse(foot.x, foot.y - 2, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // The yard: two spars fished together, from the tack forward up to the peak aft.
  const yard = (c: number): Pt => at(c, 0, 210 + (7 - c) * 14);
  const tack = yard(7);
  const peak = yard(-8);
  sail(ctx, at, yard);
  ctx.lineCap = 'round';
  line(ctx, tack, peak, 5, css(SPAR));
  line(ctx, at(7, 0, 211), yard(-1), 2, css(shade(SPAR, 1.3), 0.6));
  for (const c of [-1.5, -0.6, 0.3]) {
    const p = yard(c);
    ctx.fillStyle = css(0x8a7450);
    ctx.fillRect(p.x - 2, p.y - 4, 4, 8);
  }
  ctx.lineCap = 'butt';
  // The halyard and its tackle from the masthead to the yard.
  const sling = yard(0.4);
  line(ctx, head, sling, 1.4, 'rgba(60,40,20,0.9)');
  ctx.fillStyle = css(DARK_TEAK);
  ctx.fillRect(sling.x - 3, sling.y - 9, 6, 7);
  // A red pennant streaming from the masthead before the wind.
  ctx.fillStyle = css(0xa83a2a);
  ctx.beginPath();
  ctx.moveTo(head.x, head.y);
  ctx.quadraticCurveTo(head.x + 12, head.y + 2, head.x + 28, head.y + 9);
  ctx.quadraticCurveTo(head.x + 14, head.y + 6, head.x, head.y + 7);
  ctx.closePath();
  ctx.fill();
}

/** The reefed sail: tack forward, head lashed along the yard, clew sheeted aft. */
function sail(ctx: Ctx, at: Frame, yard: (c: number) => Pt): void {
  const tack = yard(6.6);
  const head = yard(-6);
  const clew = at(-4, 0.6, 128);
  const belly = (c: number, h: number) => at(c, 1.4, h);
  const outline = (): void => {
    ctx.beginPath();
    ctx.moveTo(tack.x, tack.y);
    ctx.lineTo(head.x, head.y);
    const leech = belly(-5.6, 230);
    ctx.quadraticCurveTo(leech.x, leech.y, clew.x, clew.y);
    const foot = belly(1.8, 150);
    ctx.quadraticCurveTo(foot.x, foot.y, tack.x, tack.y);
    ctx.closePath();
  };
  outline();
  const cloth = ctx.createLinearGradient(tack.x, tack.y, clew.x, clew.y);
  cloth.addColorStop(0, css(shade(CANVAS, 0.78)));
  cloth.addColorStop(0.5, css(CANVAS));
  cloth.addColorStop(1, css(shade(CANVAS, 1.08)));
  ctx.globalAlpha = 0.94;
  ctx.fillStyle = cloth;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.save();
  outline();
  ctx.clip();
  // Cloths of canvas running down from the yard, a weathered patch, and the reef band.
  ctx.strokeStyle = css(shade(CANVAS, 0.7), 0.55);
  ctx.lineWidth = 0.8;
  for (let k = 0; k <= 14; k++) {
    const c = 6.6 - k * 0.9;
    const top = yard(c);
    const bottom = at(c - 1.2, 1, 60);
    ctx.beginPath();
    ctx.moveTo(top.x, top.y);
    ctx.lineTo(bottom.x, bottom.y);
    ctx.stroke();
  }
  ctx.fillStyle = css(shade(CANVAS, 0.82), 0.85);
  const patch = at(-1, 0.8, 250);
  ctx.fillRect(patch.x, patch.y, 14, 11);
  // The reefed foot: canvas gathered up and tied off in a fat roll.
  ctx.restore();
  const roll: Pt[] = [];
  for (let k = 0; k <= 12; k++) {
    const t = k / 12;
    const a = clew;
    const b = tack;
    const mid = belly(1.8, 150);
    roll.push({
      x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * mid.x + t * t * b.x,
      y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * mid.y + t * t * b.y,
    });
  }
  rope(ctx, roll, 6, shade(CANVAS, 0.72));
  ctx.fillStyle = css(0x6a5030);
  for (let k = 1; k < roll.length - 1; k += 2) ctx.fillRect(roll[k]!.x - 0.7, roll[k]!.y - 3.5, 1.4, 7);
  ctx.strokeStyle = 'rgba(40,24,10,0.6)';
  ctx.lineWidth = 0.9;
  outline();
  ctx.stroke();
  // The sheet from the clew down to a cleat by the rail.
  line(ctx, clew, at(-5.5, 2.6, 22), 1);
}

/** Texture size for the ship's boat. */
export const SKIFF_TEXTURE = { w: 256, h: 84 } as const;

/**
 * The ship's boat, double-ended, about 6 m long, riding at the end of its
 * painter across the swell (its keel square to the camera, so it lies flat
 * along its cell), oars shipped, the painter slack up to the ship's side.
 * `c` runs along the boat (45 px a cell), `s` across it.
 */
export function drawSkiff(ctx: Ctx, cx: number, water: number): void {
  const at = (c: number, s: number, h: number): Pt => ({ x: cx + c * 45.25, y: water + s * 22.6 - h });
  const L = 2.15;
  const B = 0.62;
  // The hull's plan: fine at both ends, full amidships.
  const plan = (scale: number, h: number): Pt[] => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = (i / 40) * Math.PI * 2;
      const c = Math.cos(a) * L * scale;
      const s = Math.sin(a) * B * scale * (1 - 0.3 * Math.pow(Math.abs(Math.cos(a)), 3));
      pts.push(at(c, s, h));
    }
    return pts;
  };
  const trace = (pts: readonly Pt[]): void => {
    ctx.beginPath();
    pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
  };
  const fill = (pts: readonly Pt[], color: string): void => {
    trace(pts);
    ctx.fillStyle = color;
    ctx.fill();
  };
  // Ripples and the boat's shadow on the water.
  ctx.strokeStyle = 'rgba(220,230,235,0.3)';
  ctx.lineWidth = 1;
  for (const k of [1.1, 1.22]) {
    trace(plan(k, 0));
    ctx.stroke();
  }
  fill(plan(1.04, -1), 'rgba(8,16,24,0.4)');
  // The topsides: slices from the waterline to the gunwale, tarred low, painted high.
  for (let h = 0; h <= 13; h += 1) {
    const tone = h < 5 ? 0x2a1a0e : h < 11 ? 0x5a3a1f : 0x7a2f26;
    fill(plan(1, h), css(shade(tone, 0.85 + h * 0.012)));
  }
  // The gunwale rim and the open boat inside it.
  fill(plan(1, 14), css(0x8a6038));
  fill(plan(0.88, 14), css(0x3a2412));
  fill(plan(0.84, 8), css(0x6a4525));
  // Thwarts across the boat, and oars shipped along it.
  for (const c of [-1, 0, 1]) line(ctx, at(c, -B * 0.82, 12), at(c, B * 0.82, 12), 3.4, css(0x8a6038));
  line(ctx, at(-1.8, -0.2, 14), at(1.8, -0.28, 14), 1.6, css(0xc8a070));
  line(ctx, at(-1.8, 0.22, 14), at(1.8, 0.12, 14), 1.6, css(0xc8a070));
  // Stem and stern posts.
  for (const c of [-L, L]) line(ctx, at(c, 0, 10), at(c * 1.05, 0, 22), 3, css(0x5a3a1f));
  // The painter, made fast at the bow and slack up toward the ship.
  rope(ctx, [at(L * 1.05, 0, 20), at(L * 1.1, -0.6, 12), at(2.5, -1.2, 18), at(2.65, -1.6, 32)], 1.4);
}
