import { dawnPass, tone, type DawnPass } from '../../dawnPass';
import { minaret } from '../../dawnShapes';
import { bank, plain, scrub } from '../kit/ground';
import { arcade, kaaba } from '../kit/landmarks';
import { paintRange } from '../kit/mountains';
import { PLASTER, STONE, townRow } from '../kit/town';
import type { Vista } from '../types';

/**
 * Mecca in its valley among bare black-brown hills: tall houses of stone and
 * plaster climbing the slopes, the arcades of the Sacred Mosque with their
 * rows of small domes and slender minarets, and the Kaʿba in its court,
 * standing against the sunrise. No one is shown.
 */
export const MECCA: Vista = {
  id: 'mecca',
  latitude: 21.4225,
  longitude: 39.8262,
  reach: 260,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H } = frame;
    const court = Math.round(H + height * 0.06);
    paintRange(p, { base: H + 6 * k, peaks: [{ at: 0.12, h: 210, w: 300 }, { at: 0.32, h: 120, w: 200 }, { at: 0.72, h: 150, w: 240 }, { at: 0.94, h: 230, w: 280 }], floor: 20, rough: 9, color: 0x7a6250, depth: 0.7, seed: 4.4, rim: 0.6 });
    paintRange(p, { base: H + 18 * k, peaks: [{ at: 0.02, h: 150, w: 220 }, { at: 0.98, h: 140, w: 200 }], floor: 6, rough: 7, color: 0x6a5242, depth: 0.45, seed: 7.3 });
    // Tall houses on the slopes either side, with their latticed windows.
    townRow(p, { x0: -10, x1: width * 0.36, base: court - 12 * k, heights: [30, 60], widths: [18, 34], palette: [...PLASTER, ...STONE], depth: 0.42, seed: 0x3e1, windows: 3, lit: 0.5, balconies: 0.4 });
    townRow(p, { x0: width * 0.64, x1: width + 10, base: court - 12 * k, heights: [30, 60], widths: [18, 34], palette: [...PLASTER, ...STONE], depth: 0.42, seed: 0x3e2, windows: 3, lit: 0.5, balconies: 0.4 });
    // The far arcade of the Sacred Mosque, its minarets, the court and the Kaʿba.
    const bay = 16 * k;
    const half = Math.min(width * 0.3, 330 * k);
    for (const at of [-1, -0.55, 0.55, 1]) {
      minaret(p, { cx: width / 2 + at * half, base: court - 18 * k, h: 120 * k, r: 3.2 * k, color: 0xd8ccb0, depth: 0.38 });
    }
    arcade(p, { x0: width / 2 - half, x1: width / 2 + half, base: court - 14 * k, h: 22 * k, color: 0xd8ccb0, depth: 0.38, bay, domes: true, seed: 11 });
    courtFloor(p, width / 2 - half, width / 2 + half, court - 14 * k, court + 30 * k);
    kaaba(p, width / 2 + 4 * k, court + 14 * k, 50 * k, 0.32);
    arcade(p, { x0: width / 2 - half - 20 * k, x1: width / 2 + half + 20 * k, base: court + 30 * k, h: 12 * k, color: 0xd2c4a6, depth: 0.3, bay: bay * 1.1, domes: true, seed: 12 });
    // The valley floor, dusty and bare, and the stony foreground.
    plain(p, court + 30 * k, 0xb8a284, 0x8e7a5e, 0x32);
    scrub(p, court + 38 * k, 18, 0x6a6a44, 0x33);
    bank(p, { color: 0x6e5a44, lift: 50, seed: 0x34, gap: { at: 0.5, width: 0.4 }, stones: 14 });
  },
};

/** The marble pavement of the court, between the arcades. */
function courtFloor(p: DawnPass, x0: number, x1: number, top: number, base: number): void {
  p.ctx.fillStyle = tone(p, 0xe2dccc, 1, 0.34);
  p.ctx.fillRect(x0, top, x1 - x0, base - top);
}
