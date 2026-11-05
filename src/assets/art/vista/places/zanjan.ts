import { dawnPass } from '../../dawnPass';
import { dome } from '../../dawnShapes';
import { bank, plain, river } from '../kit/ground';
import { fort } from '../kit/landmarks';
import { paintRange } from '../kit/mountains';
import { BRICK, MUD, mosque, townRow, TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Zanján in autumn among its rolling hills: the brick town, the walls and
 * towers of the fort of ʿAlí-Mardán Khán where the believers held out, the
 * Friday mosque's dome, poplars yellowing along the Zanján river, and the
 * stubble fields running down to the water.
 */
export const ZANJAN: Vista = {
  id: 'zanjan',
  latitude: 36.68,
  longitude: 48.48,
  reach: 210,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const town = Math.round(H + height * 0.06);
    paintRange(p, { base: H, peaks: [{ at: 0.2, h: 90, w: 340 }, { at: 0.6, h: 70, w: 300 }, { at: 0.92, h: 110, w: 300 }], floor: 20, rough: 4, color: 0xa69684, depth: 0.85, seed: 6.6 });
    townRow(p, { x0: -10, x1: width + 10, base: town - 4 * k, heights: [12, 30], palette: [...BRICK, ...MUD], depth: 0.46, seed: 0x2a1, domes: 0.12, windows: 1 });
    mosque(p, { cx: width * 0.3, base: town - 6 * k, r: 22 * k, dome: TURQUOISE, body: 0xc0a07a, depth: 0.44, tiled: true, drum: 0.5, bulb: 1.15, minarets: { at: [-1.6, 1.6], h: 3.4, color: 0xb88a5e, bands: TURQUOISE }, seed: 101 });
    const fx = width / 2 + Math.min(width * 0.06, 70 * k);
    fort(p, { x0: fx - 90 * k, x1: fx + 90 * k, base: town + 2 * k, top: town - 40 * k, color: 0xa88058, depth: 0.42, towers: 4, seed: 102, keep: fx });
    dome(p, { cx: width * 0.84, base: town - 18 * k, r: 10 * k, color: 0xb89a74, depth: 0.44, bulb: 0.9 });
    townRow(p, { x0: -10, x1: width + 10, base: town + 8 * k, heights: [2, 12], palette: [...BRICK, ...MUD], depth: 0.38, seed: 0x2a2, windows: 2, lit: 0.4, keep: x => Math.abs(x - fx) > 100 * k });
    plain(p, town + 8 * k, 0xb09a6a, 0x8a7a50, 0x2a3);
    const water = river(p, { far: town + (height - town) * 0.42, near: town + (height - town) * 0.52, seed: 4, wander: 4 });
    grove(p, { x0: -10, x1: width + 10, base: water.farAt(0) - 2 * k, kinds: ['poplar', 'poplar', 'broad'], spacing: 16, size: 54, depth: 0.2, seed: 0x2a4, season, skip: x => Math.abs(x - width / 2) < 70 * k });
    bank(p, { color: 0x6e6440, lift: 54, seed: 0x2a5, gap: { at: 0.5, width: 0.3 } });
  },
};
