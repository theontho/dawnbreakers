import { dawnPass } from '../../dawnPass';
import { crown } from '../../dawnShapes';
import { bank, plain, track } from '../kit/ground';
import { fort } from '../kit/landmarks';
import { paintRange, rangeY, type RangeSpec } from '../kit/mountains';
import { MUD, townRow, TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import { dome } from '../../dawnShapes';
import type { Vista } from '../types';

/**
 * Nayríz in Fárs in early summer: bare ranges, the old fort on its hill above the town, the mud
 * houses and the masjid's small dome, the great plane tree of the quarter,
 * and orchards and green wheat on the plain.
 */
export const NAYRIZ: Vista = {
  id: 'nayriz',
  latitude: 29.2,
  longitude: 54.33,
  reach: 230,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const town = Math.round(H + height * 0.06);
    paintRange(p, { base: H - 2 * k, peaks: [{ at: 0.1, h: 160, w: 320 }, { at: 0.45, h: 110, w: 260 }, { at: 0.85, h: 180, w: 340 }], floor: 12, rough: 8, color: 0xa08c80, depth: 0.88, seed: 9.2 });
    const hill: RangeSpec = { base: town, peaks: [{ at: 0.24, h: 80, w: 200 }], floor: 4, rough: 4, color: 0x9a8268, depth: 0.5, seed: 2.3 };
    paintRange(p, hill);
    const fx = width * 0.24;
    const crest = rangeY(p, hill, fx);
    fort(p, { x0: fx - 50 * k, x1: fx + 50 * k, base: crest + 20 * k, top: crest - 6 * k, color: 0xb0946c, depth: 0.46, towers: 3, seed: 91 });
    townRow(p, { x0: width * 0.32, x1: width + 10, base: town, heights: [8, 24], palette: MUD, depth: 0.42, seed: 0x9b1, domes: 0.1, windows: 2, lit: 0.4 });
    dome(p, { cx: width / 2 + Math.min(width * 0.05, 60 * k), base: town - 16 * k, r: 16 * k, color: TURQUOISE, depth: 0.42, drum: 8 * k, bulb: 1.1, finial: true });
    // The great plane tree of the quarter.
    crown(p, { x: width * 0.72, base: town + 14 * k, r: 40 * k, color: 0x4f7a3c, depth: 0.36, seed: 92, trunk: 30 * k });
    plain(p, town, 0x8c9a58, 0x6e7a44, 0x9b2);
    grove(p, { x0: -10, x1: width + 10, base: town + 30 * k, kinds: ['broad', 'broad', 'cypress'], spacing: 14, size: 28, depth: 0.16, seed: 0x9b3, season, skip: x => Math.abs(x - width * 0.5) < 50 * k });
    track(p, width * 0.52, { x: width * 0.55, y: town }, 0xcbb28a, 110);
    bank(p, { color: 0x6b6a3e, lift: 50, seed: 0x9b4, gap: { at: 0.52, width: 0.22 } });
  },
};
