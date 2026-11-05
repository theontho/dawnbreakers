import { dawnPass, isAccent, rimStroke, tone, type DawnPass } from '../../dawnPass';
import { archPath } from '../../ornaments';
import { dome } from '../../dawnShapes';
import { bank, plain, track } from '../kit/ground';
import { paintRange } from '../kit/mountains';
import { BRICK, bazaarRoof, LAPIS, MUD, townRow, TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Tabríz in summer under the massif of Sahand: the enormous brick wall of
 * the Arg of ʿAlí-Sháh towering over the flat roofs, the lapis dome of the
 * Blue Mosque, the long domes of the bazaar, poplars along the watercourses,
 * and the orchards and wheat outside the town.
 */
export const TABRIZ: Vista = {
  id: 'tabriz',
  latitude: 38.08,
  longitude: 46.29,
  reach: 260,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const town = Math.round(H + height * 0.06);
    paintRange(p, { base: H - 2 * k, peaks: [{ at: 0.3, h: 190, w: 380 }, { at: 0.62, h: 150, w: 300 }, { at: 0.95, h: 120, w: 240 }], floor: 18, rough: 9, color: 0x9c8e96, depth: 0.86, seed: 4.8, snow: 20 });
    townRow(p, { x0: -10, x1: width + 10, base: town - 6 * k, heights: [12, 30], palette: [...BRICK, ...MUD], depth: 0.48, seed: 0x7b1, domes: 0.1, windows: 1 });
    bazaarRoof(p, width * 0.6, width * 0.8, town - 22 * k, 8 * k, 0xb08458, 0.46);
    // The Arg: one great brick wall, a vast arch sunk in its face, its top broken by earthquakes.
    const arg = width / 2 + Math.min(width * 0.07, 80 * k);
    argWall(p, arg, town, 0.44);
    dome(p, { cx: width * 0.28, base: town - 26 * k, r: 26 * k, color: LAPIS, depth: 0.46, drum: 10 * k, bulb: 1.0, tiled: true, finial: true });
    dome(p, { cx: width * 0.86, base: town - 20 * k, r: 12 * k, color: TURQUOISE, depth: 0.46, drum: 5 * k, bulb: 1.15, finial: true });
    grove(p, { x0: -10, x1: width + 10, base: town, kinds: ['poplar', 'poplar', 'broad'], spacing: 18, size: 50, depth: 0.36, seed: 0x7b2, season, skip: x => Math.abs(x - arg) < 60 * k });
    townRow(p, { x0: -10, x1: width + 10, base: town + 6 * k, heights: [4, 16], palette: [...BRICK, ...MUD], depth: 0.36, seed: 0x7b3, windows: 2, lit: 0.4 });
    plain(p, town + 6 * k, season === 'summer' ? 0xcbb46a : 0xa49a6a, 0x8c8048, 0x7b4);
    grove(p, { x0: -10, x1: width + 10, base: town + 40 * k, kinds: ['broad'], spacing: 14, size: 26, depth: 0.14, seed: 0x7b5, season, skip: x => Math.abs(x - width * 0.52) < 60 * k });
    track(p, width * 0.55, { x: width * 0.5, y: town + 6 * k }, 0xcbb28a, 120);
    bank(p, { color: 0x6b6a3e, lift: 52, seed: 0x7b6, gap: { at: 0.55, width: 0.22 } });
  },
};

/** The Arg of ʿAlí-Sháh: a sheer brick mass with a great arched recess and a ragged crown. */
function argWall(p: DawnPass, cx: number, base: number, depth: number): void {
  const { ctx, k } = p;
  const w = 130 * k;
  const h = 140 * k;
  const x = cx - w / 2;
  const crown: Array<{ x: number; y: number }> = [];
  for (let u = 0; u <= 12; u++) crown.push({ x: x + (w * u) / 12, y: base - h + (u % 3 === 1 ? 6 : u % 4 === 2 ? 11 : 0) * k });
  ctx.beginPath();
  ctx.moveTo(x, base);
  crown.forEach(pt => ctx.lineTo(pt.x, pt.y));
  ctx.lineTo(x + w, base);
  ctx.closePath();
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, 0xa87650, 0.92, depth);
  ctx.fill();
  archPath(ctx, cx - w * 0.3, base, w * 0.6, h * 0.78);
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, 0x6a4630, 0.9, depth);
  ctx.fill();
  if (!isAccent(p)) {
    ctx.strokeStyle = tone(p, 0x8a5c3c, 1, depth);
    ctx.globalAlpha = 0.4;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = base - h + 10 * k; y < base; y += 5 * k) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  rimStroke(p, crown, 0.9, depth);
}
