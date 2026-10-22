import { css, groundPoint, onRoof, outlineBox, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow, litGradient, sideGradient } from './fieldKit';
import { brick, planks } from './materials';
import { flatTop, walls } from './ornaments';
import { subBox } from './structureParts';
import { jarAt } from './town/houseKit';
import { minaret, tilePanel } from './town/monumentKit';
import { surface, TURQUOISE } from './town/townKit';

/**
 * Shíráz in 1845 at true scale: the governor's posted decree, a dyer's
 * vats, and the neighbourhood minaret from which the new call was sounded.
 * The uncle's street door is a piece of the courtyard wall (see wallDoors.ts).
 */

const DYES = [0x24406e, 0x7a2236, 0xc9a23a] as const;

/** Texture size of the decree board: two posts about 2.6 m tall under a little roof. */
export const DECREE_TEX = { w: 58, h: 82 } as const;

/** The governor's decree nailed to a board under a little roof, sealed in red: about 2.2 m to the ridge. */
export function drawDecreeBoard(ctx: Ctx): void {
  // Drawn on a 72 x 100 grid and set down at four-fifths, so the posts stand a man's height and a half.
  ctx.scale(0.8, 0.8);
  ellipseShadow(ctx, 38, 86, 26, 5);
  for (const x of [15, 57]) {
    ctx.fillStyle = sideGradient(ctx, x - 3, x + 3, 0x4a3320);
    ctx.fillRect(x - 3, 22, 6, 64);
  }
  ctx.save();
  ctx.translate(9, 26);
  planks(ctx, 54, 34, { base: 0x7b5d39, light: 1, seed: 41 }, true, 6);
  ctx.restore();
  ctx.strokeStyle = css(0x2b1d12);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(9, 26, 54, 34);
  // A little gabled roof against the rain.
  ctx.fillStyle = css(0x5a3a20);
  ctx.beginPath();
  ctx.moveTo(4, 27);
  ctx.lineTo(36, 12);
  ctx.lineTo(68, 27);
  ctx.lineTo(64, 28.5);
  ctx.lineTo(36, 15.5);
  ctx.lineTo(8, 28.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x8a6038, 0.9);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(4, 26.5);
  ctx.lineTo(36, 11.5);
  ctx.stroke();
  // The farmán: a sheet about 50 by 70 cm, curling at the corner, lines of shikasta, the seal.
  sheet(ctx, 22, 29, 14, 19, 0.6);
  sheet(ctx, 39, 30, 16, 24, 1);
  ctx.fillStyle = css(0x2a2420);
  for (const [x, y] of [[40, 31], [54, 31], [40, 53]] as const) ctx.fillRect(x - 0.6, y - 0.6, 1.3, 1.3);
}

/** A sheet of paper on the board: older ones are paler; `fresh` is the governor's new decree. */
function sheet(ctx: Ctx, x: number, y: number, w: number, h: number, fresh: number): void {
  ctx.fillStyle = css(fresh >= 1 ? 0xeee1bf : 0xc8b890, fresh >= 1 ? 1 : 0.85);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + h - 3);
  ctx.quadraticCurveTo(x + w - 2, y + h, x + w - 5, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x3a2a1a, 0.75 * fresh);
  ctx.lineWidth = 0.6;
  for (let v = y + 3; v <= y + h - 5; v += 2.6) {
    ctx.beginPath();
    ctx.moveTo(x + w - 2, v);
    for (let u = x + w - 2; u > x + 3 + ((v * 5) % 4); u -= 2) ctx.lineTo(u - 1, v + (u % 4 < 2 ? -0.7 : 0.4));
    ctx.stroke();
  }
  if (fresh >= 1) {
    ctx.fillStyle = css(0x8e2a22);
    ctx.beginPath();
    ctx.arc(x + 4, y + h - 4, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0xc84a3a, 0.7);
    ctx.fillRect(x + 3, y + h - 5, 1, 1);
  }
}

/**
 * The dyer's yard on a 3 x 2 footprint (96 x 64 px of ground): three
 * earthen vats about a metre across sunk in a brick platform, and behind it
 * a drying frame taller than a man, hung with wet skeins.
 */
export function drawDyeVats(ctx: Ctx, box: IsoBox): void {
  const platform = subBox(box, 10, 86, 8, 46, 14);
  const postA = groundPoint(box, 6, 56);
  const postB = groundPoint(box, 90, 56);
  const top = 82;
  // The drying frame behind the platform: posts, a pole, and skeins of every colour.
  ellipseShadow(ctx, (postA.x + postB.x) / 2, (postA.y + postB.y) / 2 + 2, 46, 9, 0.18);
  for (const p of [postA, postB]) {
    ctx.fillStyle = sideGradient(ctx, p.x - 2, p.x + 2, 0x4a3320);
    ctx.fillRect(p.x - 2, p.y - top, 4, top);
  }
  ctx.strokeStyle = css(0x4a3320);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(postA.x - 3, postA.y - top + 3);
  ctx.lineTo(postB.x + 3, postB.y - top + 3);
  ctx.stroke();
  [...DYES, 0x2f5a3a, DYES[0], 0xd8cfb8, DYES[1]].forEach((dye, i, all) => {
    const t = (i + 0.7) / (all.length + 0.4);
    const x = postA.x + (postB.x - postA.x) * t;
    const y = postA.y - top + 4 + (postB.y - postA.y) * t;
    skein(ctx, x, y, 18 + ((i * 7) % 3) * 5, dye);
  });
  // The platform and its vats.
  ellipseShadow(ctx, platform.x - platform.w / 2 + platform.d / 2, platform.y - platform.w / 4 - platform.d / 4 + 4, 52, 18, 0.24);
  walls(ctx, platform, (c, w, h, light) => {
    brick(c, w, h, { base: 0xa8784a, light, seed: 51 }, 3, 8);
    // Old runs of dye down the brick.
    DYES.forEach((dye, i) => {
      c.fillStyle = css(dye, 0.35);
      for (let u = 8 + i * 9; u < w; u += 31) c.fillRect(u, 0, 3, h * (0.6 + (i % 2) * 0.3));
    });
  });
  onRoof(ctx, platform, (w, d) => {
    ctx.fillStyle = css(shade(0x9a7050, 1.08));
    ctx.fillRect(0, 0, w, d);
  });
  outlineBox(ctx, platform);
  DYES.forEach((dye, i) => vat(ctx, roofPoint(platform, 14 + i * 24, platform.d / 2), dye));
  // A stirring pole leaning on the platform, a jar of mordant, a puddle of indigo.
  const lean = groundPoint(box, 92, 10);
  ctx.strokeStyle = css(0x6a4a2c);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lean.x, lean.y);
  ctx.lineTo(lean.x - 14, lean.y - 36);
  ctx.stroke();
  jarAt(ctx, box, 4, 10, 8);
  const puddle = groundPoint(box, 40, 2);
  ctx.fillStyle = css(DYES[0], 0.55);
  ctx.beginPath();
  ctx.ellipse(puddle.x, puddle.y, 10, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** A sunken vat: a clay rim and the dye's still surface catching the light. */
function vat(ctx: Ctx, at: { x: number; y: number }, dye: number): void {
  ctx.fillStyle = css(0x6b5a44);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, 13, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0x8a7458);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = litGradient(ctx, at.x, at.y, 10, dye, 0.7);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y + 0.8, 10.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(at.x - 3.5, at.y - 0.4, 3.5, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** A hank of wet wool hanging from the pole, darker where it drips. */
function skein(ctx: Ctx, x: number, y: number, len: number, dye: number): void {
  ctx.fillStyle = litGradient(ctx, x + 2, y + len / 2, 5, dye, 0.6);
  ctx.fillRect(x - 3, y, 6, len);
  ctx.strokeStyle = css(shade(dye, 0.6), 0.8);
  ctx.lineWidth = 0.5;
  for (const dx of [-1.5, 0, 1.5]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y);
    ctx.lineTo(x + dx, y + len);
    ctx.stroke();
  }
  ctx.fillStyle = css(dye, 0.5);
  ctx.fillRect(x - 0.5, y + len, 1, 3);
}

/** Texture size of the minaret: a square base and a shaft about 9 m tall. */
export const MINARET_TEX = { w: 64, h: 300 } as const;

/** The neighbourhood minaret: a brick shaft on a square base, a balcony for the call to prayer. */
export function drawMinaret(ctx: Ctx): void {
  const base: IsoBox = { x: 32, y: MINARET_TEX.h - 4, w: 28, d: 28, h: 44 };
  ellipseShadow(ctx, 38, base.y - 12, 26, 9, 0.3);
  walls(ctx, base, (c, w, h, light) => surface(c, w, h, 'brick', { base: 0xbf9466, light, seed: 1201 }), {
    left: (c, w, _h, l) => tilePanel(c, 5, 8, w - 10, 12, TURQUOISE, l, 1202, 4),
    right: (c, w, _h, l) => tilePanel(c, 5, 8, w - 10, 12, TURQUOISE, l, 1203, 4),
  });
  flatTop(ctx, base, 0xbf9466);
  outlineBox(ctx, base);
  const foot = roofPoint(base, base.w / 2, base.d / 2);
  minaret(ctx, foot.x, foot.y + 2, 10, 168, 0xbf9466);
}
