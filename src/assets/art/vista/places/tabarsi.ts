import { dawnPass, isAccent, tone } from '../../dawnPass';
import { block } from '../../dawnShapes';
import { bank, plain, river, scrub } from '../kit/ground';
import { paintRange } from '../kit/mountains';
import { grove } from '../kit/trees';
import type { Vista } from '../types';
import type { DawnPass } from '../../dawnPass';

/**
 * The shrine of Shaykh Ṭabarsí in the forests of Mázindarán in autumn: the
 * small tomb under its tiled pyramid roof inside the walls and towers raised
 * round it, the wooded hills of the Alborz in mist behind, the forest in
 * its turning colours, and a stream through the clearing in front.
 */
export const TABARSI: Vista = {
  id: 'tabarsi',
  latitude: 36.42,
  longitude: 52.92,
  reach: 220,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const fortBase = Math.round(H + height * 0.065);
    paintRange(p, { base: H - 2 * k, peaks: [{ at: 0.15, h: 170, w: 360 }, { at: 0.55, h: 120, w: 300 }, { at: 0.9, h: 160, w: 300 }], floor: 30, rough: 5, color: 0x5a6a5a, depth: 0.88, seed: 3.9, gullies: false });
    paintRange(p, { base: H + 6 * k, peaks: [{ at: 0.3, h: 70, w: 300 }, { at: 0.78, h: 80, w: 260 }], floor: 20, rough: 4, color: 0x4a5e44, depth: 0.62, seed: 5.1, gullies: false });
    grove(p, { x0: -10, x1: width + 10, base: H + 10 * k, kinds: ['broad'], spacing: 7, size: 34, depth: 0.55, seed: 0x7a1, season });
    // The fort the companions raised round the shrine: walls, corner towers and the tomb within.
    const cx = width / 2 + Math.min(width * 0.05, 60 * k);
    tomb(p, cx, fortBase - 20 * k, 0.4);
    const wallTop = fortBase - 26 * k;
    block(p, { x: cx - 110 * k, top: wallTop, w: 220 * k, base: fortBase, color: 0x9a8668, depth: 0.38, seed: 61, parapet: 'plain' });
    for (const dx of [-110, 110]) block(p, { x: cx + dx * k - 12 * k, top: wallTop - 20 * k, w: 24 * k, base: fortBase, color: 0x8a7658, depth: 0.37, seed: 62 + dx, parapet: 'kungura', windows: 1, lit: 0.8 });
    grove(p, { x0: -10, x1: width + 10, base: fortBase + 4 * k, kinds: ['broad', 'broad', 'poplar'], spacing: 16, size: 60, depth: 0.3, seed: 0x7a2, season, skip: x => Math.abs(x - cx) < 140 * k });
    plain(p, fortBase + 4 * k, 0x7a8a5a, 0x5a6a40, 0x7a3);
    river(p, { far: fortBase + (height - fortBase) * 0.4, near: fortBase + (height - fortBase) * 0.47, seed: 9, wander: 5 });
    scrub(p, fortBase + 12 * k, 40, 0x4e6236, 0x7a6);
    bank(p, { color: 0x4e5e36, lift: 60, seed: 0x7a4, gap: { at: 0.5, width: 0.3 } });
  },
};

/** The shrine: a square tomb under a tiled pyramid roof. */
function tomb(p: DawnPass, cx: number, base: number, depth: number): void {
  const { ctx, k } = p;
  const w = 40 * k;
  block(p, { x: cx - w / 2, top: base - 30 * k, w, base, color: 0xd0bc98, depth, seed: 63, windows: 1, lit: 0.9 });
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.62, base - 30 * k);
  ctx.lineTo(cx, base - 64 * k);
  ctx.lineTo(cx + w * 0.62, base - 30 * k);
  ctx.closePath();
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, 0x3a7a8a, 1, depth);
  ctx.fill();
}
