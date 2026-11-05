import { dawnLayout } from '../../dawnLayout';
import { dawnPass } from '../../dawnPass';
import { block } from '../../dawnShapes';
import { paintWall, roundTower } from '../../dawnWall';
import { bank, plain, snowCover, track } from '../kit/ground';
import { paintRange } from '../kit/mountains';
import { BRICK, MUD, mosque, townRow, TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Ṭihrán under the Alborz, with the white cone of Damávand standing in the
 * east where the sun comes up: the capital's wall and tiled gate, the brick
 * Arg of the Sháh with its towers, the tiled dome and minarets of the royal
 * mosque, poplars, and the plain outside, dry in summer and white in winter.
 */
export const TEHRAN: Vista = {
  id: 'tehran',
  latitude: 35.69,
  longitude: 51.42,
  reach: 300,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, horizonY: H, season } = frame;
    const L = dawnLayout(frame);
    const winter = season === 'winter';
    paintRange(p, { base: H - 4 * k, peaks: [{ at: 0.58, h: 270, w: 240, sharp: 1.9 }], floor: 0, rough: 3, color: 0xa0a2b8, depth: 0.95, seed: 1.9, snow: winter ? 200 : 110 });
    paintRange(p, { base: H - 2 * k, peaks: [{ at: 0.0, h: 200, w: 300 }, { at: 0.22, h: 160, w: 260 }, { at: 0.86, h: 150, w: 280 }], floor: 30, rough: 8, color: 0x9890a0, depth: 0.82, seed: 2.6, snow: winter ? 120 : 30 });
    townRow(p, { x0: -10, x1: width + 10, base: L.wallTop + 4 * k, heights: [12, 30], palette: MUD, depth: 0.42, seed: 0x7e1, domes: 0.12, windows: 1 });
    // The Arg, its brick walls and corner towers, to the left.
    const arg = width * 0.22;
    block(p, { x: arg - 70 * k, top: L.wallTop - 36 * k, w: 140 * k, base: L.wallTop + 4 * k, color: BRICK[0], depth: 0.4, seed: 71, parapet: 'kungura', windows: 5, lit: 0.6 });
    for (const dx of [-70, 70]) roundTower(p, { cx: arg + dx * k, top: L.wallTop - 46 * k, base: L.wallTop + 4 * k, r: 12 * k, color: BRICK[0], depth: 0.39, lozenges: true });
    mosque(p, { cx: width / 2 + Math.min(width * 0.06, 70 * k), base: L.wallTop + 6 * k, r: 30 * k, dome: TURQUOISE, body: 0xc4a682, depth: 0.4, tiled: true, drum: 0.5, bulb: 1.2, minarets: { at: [-1.8, 1.8], h: 3.6, color: 0xc4a682, bands: TURQUOISE }, seed: 72 });
    grove(p, { x0: -10, x1: width + 10, base: L.wallTop + 2 * k, kinds: ['poplar', 'poplar', 'broad'], spacing: 24, size: 46, depth: 0.36, seed: 0x7e2, season, skip: x => Math.abs(x - width / 2) < 80 * k || Math.abs(x - arg) < 80 * k });
    townRow(p, { x0: -10, x1: width + 10, base: L.wallTop + 8 * k, heights: [2, 14], palette: MUD, depth: 0.34, seed: 0x7e3, windows: 2, lit: 0.4 });
    paintWall(p, L);
    if (winter) snowCover(p, L.wallBase, 0x7e4);
    else plain(p, L.wallBase, season === 'summer' ? 0xc8b07a : 0xb09a70, 0x8a7650, 0x7e4);
    track(p, width * 0.6, { x: L.gateX, y: L.wallBase }, winter ? 0xb8b0a4 : 0xcbb28a, 140);
    bank(p, { color: winter ? 0x8a8a84 : 0x6b6a3e, lift: 52, seed: 0x7e5, gap: { at: 0.6, width: 0.24 } });
  },
};
