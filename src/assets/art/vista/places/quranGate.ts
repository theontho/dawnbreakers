import { dawnPass } from '../../dawnPass';
import { block } from '../../dawnShapes';
import { iwanPortal } from '../../dawnWall';
import { bank, plain, scrub, track } from '../kit/ground';
import { paintRange } from '../kit/mountains';
import { TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * The Qur'án Gate in its pass north of Shíráz: two bare mountains closing
 * in on either side, the gate's arch with the little room over it where the
 * Qur'án is kept so that travellers pass beneath it, the road running
 * through it and away, and the stony slopes and a few cypresses on this side.
 */
export const QURAN_GATE: Vista = {
  id: 'quran-gate',
  latitude: 29.635,
  longitude: 52.56,
  reach: 280,
  land: 0xa89490,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const pass = Math.round(H + height * 0.05);
    paintRange(p, { base: H, peaks: [{ at: 0.5, h: 30, w: 300 }], floor: 6, rough: 4, color: 0xa89490, depth: 0.92, seed: 2.2 });
    paintRange(p, { base: pass + 30 * k, peaks: [{ at: 0.12, h: 270, w: 380, sharp: 1.1 }, { at: 0.9, h: 250, w: 360, sharp: 1.1 }], floor: 10, rough: 10, color: 0x8a7462, depth: 0.5, seed: 4.1, rim: 0.8 });
    // The gate: an arch between two short towers, its room on top.
    const cx = width / 2;
    block(p, { x: cx - 46 * k, top: pass - 118 * k, w: 92 * k, base: pass - 76 * k, color: 0xc8a882, depth: 0.36, seed: 111, parapet: 'kungura', windows: 3, lit: 0.9 });
    iwanPortal(p, { cx, base: pass, w: 108 * k, h: 80 * k, color: 0xc29a6c, depth: 0.34, tile: TURQUOISE, lamp: true });
    for (const dx of [-72, 72]) block(p, { x: cx + dx * k - 16 * k, top: pass - 64 * k, w: 32 * k, base: pass, color: 0xb89064, depth: 0.35, seed: 112 + dx, parapet: 'kungura' });
    plain(p, pass, 0xb09a7a, 0x8a7458, 0x113);
    grove(p, { x0: width * 0.05, x1: width * 0.36, base: pass + 24 * k, kinds: ['cypress'], spacing: 34, size: 58, depth: 0.2, seed: 0x114, season });
    grove(p, { x0: width * 0.66, x1: width * 0.95, base: pass + 28 * k, kinds: ['cypress', 'broad'], spacing: 38, size: 54, depth: 0.2, seed: 0x115, season });
    scrub(p, pass + 10 * k, 30, 0x6a6a44, 0x116);
    track(p, width * 0.52, { x: cx, y: pass }, 0xcbb28a, 150);
    bank(p, { color: 0x6e5e44, lift: 64, seed: 0x117, gap: { at: 0.52, width: 0.26 }, stones: 16 });
  },
};
