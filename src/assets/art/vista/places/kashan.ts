import { dawnPass } from '../../dawnPass';
import { block } from '../../dawnShapes';
import { roundTower } from '../../dawnWall';
import { bank, plain, scrub, track } from '../kit/ground';
import { paintRange } from '../kit/mountains';
import { bazaarRoof, MUD, mosque, townRow, TURQUOISE } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Káshán on the edge of the desert, on the eve of Naw-Rúz: a forest of
 * wind-catchers over the mud roofs, the domes of the bazaar, a brick
 * mosque and its minarets against the sunrise, the town wall with its round
 * towers, the Karkas mountains behind with snow still on them, almond
 * orchards in blossom outside the gate, and the sand running off to the east.
 */
export const KASHAN: Vista = {
  id: 'kashan',
  latitude: 33.98,
  longitude: 51.43,
  reach: 230,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const wallBase = Math.round(H + height * 0.07);
    const wallTop = wallBase - 28 * k;
    paintRange(p, { base: H - 2 * k, peaks: [{ at: 0.18, h: 150, w: 300 }, { at: 0.4, h: 100, w: 200 }, { at: 0.8, h: 170, w: 320 }], floor: 10, rough: 6, color: 0x9a8a88, depth: 0.88, seed: 5.5, snow: 34 });
    townRow(p, { x0: -10, x1: width + 10, base: wallTop + 4 * k, heights: [14, 34], palette: MUD, depth: 0.5, seed: 0xca1, windcatchers: 0.45, domes: 0.12, windows: 1 });
    bazaarRoof(p, width * 0.18, width * 0.42, wallTop - 4 * k, 7 * k, 0xc0a07a, 0.48);
    mosque(p, { cx: width / 2 + Math.min(width * 0.06, 70 * k), base: wallTop + 6 * k, r: 26 * k, dome: 0xb89068, body: 0xc4a07a, depth: 0.46, drum: 0.5, bulb: 1.0, minarets: { at: [-1.9, 1.9], h: 3.8, color: 0xb88a5e, bands: TURQUOISE }, seed: 21 });
    townRow(p, { x0: -10, x1: width + 10, base: wallTop + 8 * k, heights: [4, 16], palette: MUD, depth: 0.44, seed: 0xca2, windcatchers: 0.3, windows: 2, lit: 0.4 });
    block(p, { x: -4, top: wallTop, w: width + 8, base: wallBase, color: 0xc49e72, depth: 0.4, seed: 22, parapet: 'kungura' });
    for (let x = width * 0.06; x < width; x += 140 * k) roundTower(p, { cx: x, top: wallTop - 9 * k, base: wallBase, r: 11 * k, color: 0xc49e72, depth: 0.38 });
    plain(p, wallBase, 0xc8b08a, 0xa88c64, 0xca3);
    grove(p, { x0: -10, x1: width * 0.42, base: wallBase + 26 * k, kinds: ['almond'], spacing: 16, size: 40, depth: 0.18, seed: 0xca5, season });
    grove(p, { x0: width * 0.62, x1: width + 10, base: wallBase + 30 * k, kinds: ['almond', 'almond', 'cypress'], spacing: 18, size: 42, depth: 0.16, seed: 0xca6, season });
    scrub(p, wallBase + 50 * k, 24, 0x7a7a4a, 0xca7);
    track(p, width * 0.56, { x: width * 0.47, y: wallBase }, 0xd8c098, 120);
    bank(p, { color: 0x7a6a48, lift: 44, seed: 0xca8, gap: { at: 0.56, width: 0.26 } });
  },
};
