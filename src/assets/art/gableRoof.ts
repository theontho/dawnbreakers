import { css, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { planks } from './materials';
import { LIGHT } from './ornaments';
import { liftedPoint, onPlane, type Pt } from './structureParts';
import { roundLog } from './timber';

/**
 * The steep gable of the Mázindarán houses: its ridge runs along the front
 * (the box's `w` axis), one long slope comes down over the door to a deep
 * eave, and the gable end on the shaded wall is boarded. The forest
 * cottages thatch it with rice straw; the great houses of Núr cover it with
 * split-oak shingles.
 */

export interface GableRoof {
  /** Height of the walls the roof sits on. */
  wallH: number;
  /** Rise from the wall head to the ridge. */
  ridge: number;
  /** How far the eave reaches out in front of the wall. */
  eave: number;
  /** How far the roof runs past each end wall. */
  overhang: number;
  /** Paints the front slope in its face space. */
  cover: (ctx: Ctx, w: number, h: number) => void;
  /** Colour of the roll along the ridge. */
  ridgeRoll: number;
  seed: number;
}

export function gableRoof(ctx: Ctx, house: IsoBox, r: GableRoof): void {
  const { w, d } = house;
  const z0 = r.wallH;
  const z1 = r.wallH + r.ridge;
  const at = (p: number, q: number, z: number): Pt => liftedPoint(house, p, q, z);
  // Boarded gable end on the shaded wall.
  const gable = [at(w, 0, z0), at(w, d, z0), at(w, d / 2, z1)];
  ctx.beginPath();
  gable.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
  ctx.closePath();
  ctx.save();
  ctx.clip();
  onPlane(ctx, at(w, 0, z1), at(w, d, z1), at(w, 0, z0), d, r.ridge, (fw, fh) => planks(ctx, fw, fh, { base: 0x6b4a2c, light: LIGHT.right, seed: r.seed }, true, 6));
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,10,4,0.75)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // The front slope, from the eave up to the ridge.
  const o = r.overhang;
  const eaveL = at(-o, -r.eave, z0 - 6);
  const eaveR = at(w + o, -r.eave, z0 - 6);
  const ridgeL = at(-o, d / 2, z1);
  const ridgeR = at(w + o, d / 2, z1);
  const len = w + o * 2;
  const rise = Math.hypot(d / 2 + r.eave, r.ridge + 6);
  onPlane(ctx, ridgeL, ridgeR, eaveL, len, rise, (fw, fh) => r.cover(ctx, fw, fh));
  ctx.strokeStyle = 'rgba(20,10,4,0.8)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(eaveL.x, eaveL.y);
  ctx.lineTo(eaveR.x, eaveR.y);
  ctx.lineTo(ridgeR.x, ridgeR.y);
  ctx.lineTo(ridgeL.x, ridgeL.y);
  ctx.closePath();
  ctx.stroke();
  roundLog(ctx, { x: ridgeL.x, y: ridgeL.y - 2 }, { x: ridgeR.x, y: ridgeR.y - 2 }, 3.5, { ends: 'none', bark: r.ridgeRoll, seed: r.seed + 4 });
}

/** Rice-straw thatch: combed strands, courses, moss where the damp sits, a ragged hem. */
export function thatchCover(color: number, seed: number) {
  return (ctx: Ctx, fw: number, fh: number): void => {
    const rand = rng(seed);
    const g = ctx.createLinearGradient(0, 0, 0, fh);
    g.addColorStop(0, css(shade(color, LIGHT.roof * 0.95)));
    g.addColorStop(1, css(shade(color, 0.8)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, fw, fh);
    for (let i = 0; i < fw * fh * 0.06; i++) {
      const u = rand() * fw;
      const v = rand() * fh;
      ctx.strokeStyle = css(shade(color, 0.6 + rand() * 0.7), 0.7);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(u, v);
      ctx.lineTo(u + (rand() - 0.5) * 1.5, v + 5 + rand() * 6);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(40,28,12,0.35)';
    for (let v = 14; v < fh; v += 14) ctx.fillRect(0, v, fw, 1.5);
    ctx.fillStyle = 'rgba(70,100,50,0.35)';
    for (let i = 0; i < 12; i++) ctx.fillRect(rand() * fw, fh * 0.5 + rand() * fh * 0.5, 10 + rand() * 14, 3);
    ctx.fillStyle = css(shade(color, 0.65));
    for (let u = 0; u < fw; u += 3) ctx.fillRect(u, fh - 3, 2, 3 + rand() * 3);
  };
}

/** Split-oak shingles laid in staggered courses, silvered by rain, mossy low down. */
export function shingleCover(color: number, seed: number) {
  return (ctx: Ctx, fw: number, fh: number): void => {
    const rand = rng(seed);
    const g = ctx.createLinearGradient(0, 0, 0, fh);
    g.addColorStop(0, css(shade(color, LIGHT.roof)));
    g.addColorStop(1, css(shade(color, 0.78)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, fw, fh);
    const course = 6;
    for (let v = 0, row = 0; v < fh; v += course, row++) {
      for (let u = row % 2 ? -4 : 0; u < fw; u += 8) {
        ctx.fillStyle = css(shade(color, 0.8 + rand() * 0.45), 0.55);
        ctx.fillRect(u + 0.5, v + 0.5, 7, course - 1);
        ctx.fillStyle = 'rgba(20,12,6,0.45)';
        ctx.fillRect(u, v, 0.8, course);
      }
      ctx.fillStyle = 'rgba(20,12,6,0.4)';
      ctx.fillRect(0, v + course - 1, fw, 1);
    }
    ctx.fillStyle = 'rgba(80,110,60,0.3)';
    for (let i = 0; i < 16; i++) ctx.fillRect(rand() * fw, fh * 0.55 + rand() * fh * 0.45, 8 + rand() * 12, 2.5);
  };
}
