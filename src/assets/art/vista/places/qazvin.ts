import { dawnLayout } from '../../dawnLayout';
import { dawnPass } from '../../dawnPass';
import { block, dome } from '../../dawnShapes';
import { paintWall } from '../../dawnWall';
import { bank, plain, track } from '../kit/ground';
import { paintRange } from '../kit/mountains';
import { arcade } from '../kit/landmarks';
import { MUD, mosque, townRow, TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Qazvín on its plain under the Alborz: the city wall and its tiled gate,
 * the green-blue dome of the Friday mosque, the two-storeyed pavilion of
 * the old Ṣafavid palace, plane trees turning in autumn, and the vineyards
 * and stubble fields running up to the walls.
 */
export const QAZVIN: Vista = {
  id: 'qazvin',
  latitude: 36.27,
  longitude: 50.0,
  reach: 240,
  land: 0xa09a8a,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, horizonY: H, season } = frame;
    const L = dawnLayout(frame);
    paintRange(p, { base: H - 2 * k, peaks: [{ at: 0.05, h: 190, w: 320 }, { at: 0.3, h: 150, w: 260 }, { at: 0.62, h: 110, w: 240 }, { at: 0.9, h: 80, w: 220 }], floor: 16, rough: 7, color: 0x9a92a4, depth: 0.88, seed: 6.2, snow: 26 });
    townRow(p, { x0: -10, x1: width + 10, base: L.wallTop + 4 * k, heights: [12, 32], palette: MUD, depth: 0.42, seed: 0x9a1, domes: 0.15, windows: 1 });
    arcade(p, { x0: width * 0.2, x1: width * 0.2 + 70 * k, base: L.wallTop - 6 * k, h: 26 * k, color: 0xc8aa84, depth: 0.4, bay: 14 * k, seed: 51 });
    block(p, { x: width * 0.2 + 10 * k, top: L.wallTop - 48 * k, w: 50 * k, base: L.wallTop - 30 * k, color: 0xc8aa84, depth: 0.4, seed: 52, parapet: 'plain', windows: 3, lit: 0.5 });
    mosque(p, { cx: width / 2 + Math.min(width * 0.07, 80 * k), base: L.wallTop + 6 * k, r: 34 * k, dome: 0x3a9a8a, body: 0xc4a682, depth: 0.4, tiled: true, drum: 0.45, bulb: 1.15, minarets: { at: [-1.7, 1.7], h: 3.4, color: 0xc4a682, bands: TURQUOISE }, seed: 53 });
    dome(p, { cx: width * 0.82, base: L.wallTop - 6 * k, r: 13 * k, color: TURQUOISE, depth: 0.42, drum: 6 * k, bulb: 1.2, finial: true });
    grove(p, { x0: -10, x1: width + 10, base: L.wallTop + 2 * k, kinds: ['broad', 'poplar', 'broad'], spacing: 26, size: 44, depth: 0.36, seed: 0x9a2, season, skip: x => Math.abs(x - width / 2) < 90 * k });
    townRow(p, { x0: -10, x1: width + 10, base: L.wallTop + 8 * k, heights: [2, 14], palette: MUD, depth: 0.34, seed: 0x9a3, windows: 2, lit: 0.4 });
    paintWall(p, L);
    plain(p, L.wallBase, 0xb8a272, 0x8a7a50, 0x9a4);
    grove(p, { x0: -10, x1: width + 10, base: L.wallBase + 22 * k, kinds: ['broad'], spacing: 12, size: 22, depth: 0.12, seed: 0x9a5, season, skip: x => Math.abs(x - L.gateX - 40 * k) < 70 * k });
    track(p, width * 0.58, { x: L.gateX, y: L.wallBase }, 0xcbb28a, 130);
    bank(p, { color: 0x6b6a3e, lift: 56, seed: 0x9a6, gap: { at: 0.58, width: 0.22 } });
  },
};
