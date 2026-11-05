import { dawnPass } from '../../dawnPass';
import { bank, snowCover } from '../kit/ground';
import { fort } from '../kit/landmarks';
import { paintRange, rangeY, type RangeSpec } from '../kit/mountains';
import { STONE, townRow } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Mákú in winter: the little town in its gorge under the great overhanging
 * cliff, the fortress walls up on the rock, snow on the roofs, the slopes
 * and the far peaks, and bare poplars along the frozen stream.
 */
export const MAKU: Vista = {
  id: 'maku',
  latitude: 39.29,
  longitude: 44.45,
  reach: 320,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const town = Math.round(H + height * 0.07);
    paintRange(p, { base: H - 4 * k, peaks: [{ at: 0.5, h: 120, w: 260, sharp: 1.8 }, { at: 0.72, h: 90, w: 200 }], floor: 20, rough: 6, color: 0x9aa0b4, depth: 0.9, seed: 8.1, snow: 70 });
    // The cliff the town shelters under, and the fortress on its ledge.
    const cliff: RangeSpec = { base: town, peaks: [{ at: 0.16, h: 300, w: 330, sharp: 0.6 }, { at: 0.95, h: 220, w: 260, sharp: 0.8 }], floor: 24, rough: 10, color: 0x7a6a62, depth: 0.5, seed: 9.7, snow: 18, rim: 0.8 };
    paintRange(p, cliff);
    const ledgeX = width * 0.26;
    const ledge = rangeY(p, cliff, ledgeX) + 40 * k;
    fort(p, { x0: ledgeX - 50 * k, x1: ledgeX + 60 * k, base: ledge + 30 * k, top: ledge, color: 0x9a8670, depth: 0.46, towers: 3, seed: 31, keep: ledgeX + 20 * k });
    townRow(p, { x0: width * 0.05, x1: width + 10, base: town, heights: [10, 26], palette: STONE, depth: 0.4, seed: 0x3a1, windows: 1, lit: 0.6, parapets: ['plain'] });
    snowCover(p, town, 0x3a2);
    grove(p, { x0: -10, x1: width + 10, base: town + 30 * k, kinds: ['poplar', 'poplar', 'broad'], spacing: 22, size: 50, depth: 0.2, seed: 0x3a3, season, skip: x => Math.abs(x - width / 2) < 60 * k });
    bank(p, { color: 0x9aa0a8, lift: 44, seed: 0x3a4, gap: { at: 0.5, width: 0.4 } });
  },
};
