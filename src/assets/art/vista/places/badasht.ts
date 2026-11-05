import { rng } from '../../canvasKit';
import { dawnPass } from '../../dawnPass';
import { block } from '../../dawnShapes';
import { bank, plain, river } from '../kit/ground';
import { tent } from '../kit/landmarks';
import { paintRange } from '../kit/mountains';
import { MUD, townRow } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Badasht in summer: a hamlet at the foot of the bare Alborz foothills, its
 * three walled gardens of poplar and fruit trees with tents pitched among
 * them, a stream running through the meadow, and the green grass of the
 * high valley in front.
 */
export const BADASHT: Vista = {
  id: 'badasht',
  latitude: 36.45,
  longitude: 55.07,
  reach: 240,
  land: 0x8a8a5e,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const gardens = Math.round(H + height * 0.06);
    paintRange(p, { base: H - 2 * k, peaks: [{ at: 0.1, h: 200, w: 340 }, { at: 0.42, h: 130, w: 260 }, { at: 0.8, h: 210, w: 340 }], floor: 24, rough: 7, color: 0xa69280, depth: 0.86, seed: 7.7, snow: 16 });
    paintRange(p, { base: H + 10 * k, peaks: [{ at: 0.3, h: 50, w: 280 }, { at: 0.7, h: 40, w: 260 }], floor: 10, rough: 3, color: 0x8a8a5e, depth: 0.6, seed: 1.1, gullies: false });
    townRow(p, { x0: width * 0.04, x1: width * 0.2, base: gardens - 10 * k, heights: [8, 18], palette: MUD, depth: 0.46, seed: 0xbd1, windows: 1, lit: 0.6 });
    // Three gardens, each behind its own wall, with tents among the trees.
    const rand = rng(0xbd2);
    const spans = [[0.08, 0.34], [0.4, 0.62], [0.68, 0.94]] as const;
    spans.forEach(([a, b], i) => {
      const x0 = width * a;
      const x1 = width * b;
      block(p, { x: x0, top: gardens - 14 * k, w: x1 - x0, base: gardens - 4 * k, color: 0xbfa078, depth: 0.4, seed: 0xbd6 + i, parapet: 'plain' });
      grove(p, { x0, x1, base: gardens - 12 * k, kinds: ['poplar', 'poplar', 'broad'], spacing: 12, size: 52, depth: 0.42, seed: 0xbd3 + i, season });
      for (let t = 0; t < 2; t++) {
        const x = x0 + (x1 - x0) * (0.25 + t * 0.45) + (rand() - 0.5) * 20 * k;
        tent(p, x, gardens + 2 * k, (40 + rand() * 14) * k, 30 * k, 0xe8dcc0, 0.36, t === 0 ? 0xa0402e : undefined);
      }
    });
    plain(p, gardens + 2 * k, 0x8aa05a, 0x5e7a3e, 0xbd7);
    river(p, { far: gardens + (height - gardens) * 0.3, near: gardens + (height - gardens) * 0.36, seed: 6, wander: 6 });
    grove(p, { x0: -10, x1: width + 10, base: gardens + (height - gardens) * 0.3, kinds: ['broad'], spacing: 30, size: 30, depth: 0.12, seed: 0xbd8, season, skip: x => Math.abs(x - width / 2) < 100 * k });
    bank(p, { color: 0x5a7036, lift: 50, seed: 0xbd9, gap: { at: 0.5, width: 0.3 } });
  },
};
