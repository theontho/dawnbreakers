import { css, rng, shade, type Ctx } from './canvasKit';
import { lashing, stakeRow } from './timber';

/**
 * The companions' palisade at Ṭabarsí, at true scale: a bank of earth
 * thrown up from the ditch, about 0.7 m high and turfed where the rain has
 * not cut it, and in it a row of sharpened trunks standing 3.5 m clear,
 * bound with rope at two heights. (The same fence pens the shepherds' fold
 * at Mákú and the yard at Chihríq.)
 */
export const PALISADE = { height: 96, bank: 16, pitch: 8, tip: 7 } as const;

/** The gaps between the stakes: deep shadow. */
export function palisadeFace(ctx: Ctx, w: number, h: number): void {
  ctx.fillStyle = css(0x1a120a);
  ctx.fillRect(0, 0, w, h);
}

/** The stakes, their lashings and the earth bank, in face space aligned to the run (`offset` px along it). */
export function palisadeCap(ctx: Ctx, w: number, h: number, light: number, offset: number): void {
  const stakesH = h - PALISADE.bank + 4;
  ctx.save();
  ctx.translate(-(offset % PALISADE.pitch), 0);
  stakeRow(ctx, w + PALISADE.pitch, stakesH, light, 5 + Math.round(offset), PALISADE.pitch, PALISADE.tip);
  lashing(ctx, w + PALISADE.pitch, stakesH * 0.2, light);
  lashing(ctx, w + PALISADE.pitch, stakesH * 0.7, light);
  ctx.restore();
  bank(ctx, w, h, light, offset);
}

function bank(ctx: Ctx, w: number, h: number, light: number, offset: number): void {
  const top = h - PALISADE.bank;
  const earth = 0x6b4a2c;
  const g = ctx.createLinearGradient(0, top, 0, h);
  g.addColorStop(0, css(shade(0x4f6a30, light)));
  g.addColorStop(0.25, css(shade(earth, light * 1.05)));
  g.addColorStop(1, css(shade(earth, light * 0.7)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, top + 1);
  for (let u = 0; u <= w; u += 4) ctx.lineTo(u, top + Math.sin((u + offset) * 0.4) * 1.2);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
  const rand = rng(31 + Math.round(offset));
  // Clods, stones and the runnels the rain has cut.
  for (let i = 0; i < w * 0.8; i++) {
    ctx.fillStyle = css(rand() < 0.5 ? shade(earth, light * 1.35) : shade(earth, light * 0.5), 0.6);
    ctx.fillRect(rand() * w, top + 3 + rand() * (PALISADE.bank - 4), 1.4, 1);
  }
  ctx.strokeStyle = css(shade(earth, light * 0.45), 0.55);
  ctx.lineWidth = 0.8;
  for (let u = (8 - (offset % 16) + 16) % 16; u < w; u += 16) {
    ctx.beginPath();
    ctx.moveTo(u, top + 2);
    ctx.quadraticCurveTo(u + 2, top + 8, u + 1, h);
    ctx.stroke();
  }
  // Tufts of grass along the crest.
  ctx.strokeStyle = css(shade(0x5f7a3a, light), 0.9);
  for (let u = 2; u < w; u += 3 + rand() * 4) {
    ctx.beginPath();
    ctx.moveTo(u, top + 1);
    ctx.lineTo(u - 1, top - 2 - rand() * 2);
    ctx.stroke();
  }
}
