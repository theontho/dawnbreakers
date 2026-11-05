import { dawnPass } from '../../dawnPass';
import { block, dome } from '../../dawnShapes';
import { bank, river } from '../kit/ground';
import { bridge } from '../kit/landmarks';
import { paintRange } from '../kit/mountains';
import { LAPIS, MUD, mosque, townRow, TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Iṣfahán from the south bank of the Zāyandih-Rúd: the long two-tiered
 * bridge across the river, the plane trees of the Chahár Bágh in their
 * autumn colour, and over the roofs the great lapis dome and minarets of
 * the royal mosque, the cream dome of Shaykh Luṭfu'lláh and the high
 * terrace of the ʿÁlí Qápú, with the bare Ṣuffih mountain behind.
 */
export const ISFAHAN: Vista = {
  id: 'isfahan',
  latitude: 32.65,
  longitude: 51.67,
  reach: 220,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const town = Math.round(H + height * 0.03);
    paintRange(p, { base: H, peaks: [{ at: 0.08, h: 110, w: 260 }, { at: 0.86, h: 90, w: 280 }], floor: 8, rough: 6, color: 0xa08a78, depth: 0.85, seed: 3.3 });
    townRow(p, { x0: -10, x1: width + 10, base: town, heights: [10, 26], palette: MUD, depth: 0.55, seed: 0x15a, domes: 0.18, windows: 1 });
    block(p, { x: width * 0.24, top: town - 64 * k, w: 46 * k, base: town, color: 0xc8aa82, depth: 0.5, seed: 9, parapet: 'plain', windows: 4, lit: 0.6 });
    dome(p, { cx: width * 0.36, base: town - 20 * k, r: 26 * k, color: 0xd8c4a0, depth: 0.5, drum: 12 * k, bulb: 1.0, tiled: true, finial: true });
    mosque(p, { cx: width / 2 + Math.min(width * 0.06, 70 * k), base: town, r: 38 * k, dome: LAPIS, body: 0xc4a682, depth: 0.48, tiled: true, drum: 0.55, bulb: 1.22, minarets: { at: [-1.9, 1.9], h: 3.6, color: 0xc4a682, bands: TURQUOISE }, seed: 15 });
    const avenue = Math.round(town + height * 0.04);
    grove(p, { x0: -10, x1: width + 10, base: avenue, kinds: ['broad', 'broad', 'poplar'], spacing: 14, size: 44, depth: 0.32, seed: 0x15b, season, skip: x => Math.abs(x - width / 2) < 50 * k });
    const water = river(p, { far: avenue + 4 * k, near: height - 46 * k, seed: 8, wander: 1.5 });
    const deck = water.farAt(width / 2) + (height - 46 * k - water.farAt(width / 2)) * 0.32;
    bridge(p, { x0: -20, x1: width + 20, base: deck + 30 * k, top: deck, color: 0xc49a6c, depth: 0.22, arches: Math.max(9, Math.round(width / (70 * k))) });
    bank(p, { color: 0x6b6a3e, lift: 40, seed: 0x15c, gap: { at: 0.5, width: 0.6 } });
  },
};
