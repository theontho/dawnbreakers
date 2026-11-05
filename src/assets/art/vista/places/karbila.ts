import { rng } from '../../canvasKit';
import { dawnPass } from '../../dawnPass';
import { block, dome } from '../../dawnShapes';
import { roundTower } from '../../dawnWall';
import { bank, plain, river, scrub } from '../kit/ground';
import { paintRange } from '../kit/mountains';
import { GOLD, MUD, mosque, townRow, TURQUOISE } from '../kit/town';
import { grove, palm } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Karbilá across its palm groves: the low mud-brick town inside its wall,
 * the golden dome and minarets of the shrine of the Imám Ḥusayn standing
 * against the sunrise and, to the left, the shrine of ʿAbbás; date palms all
 * round, a canal from the Euphrates in front, and the flat desert beyond.
 */
export const KARBILA: Vista = {
  id: 'karbila',
  latitude: 32.616,
  longitude: 44.024,
  reach: 230,
  land: 0xb8a088,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const townBase = Math.round(H + height * 0.075);
    // The desert's edge, barely lifted, and the groves along it.
    paintRange(p, { base: H, peaks: [], floor: 3, rough: 1.5, color: 0xb8a088, depth: 0.95, seed: 2.1, gullies: false, rim: 0.4 });
    grove(p, { x0: -10, x1: width + 10, base: H + 2 * k, kinds: ['palm'], spacing: 8, size: 26, depth: 0.75, seed: 0x1a, season });
    // The town wall and its towers.
    const wallTop = townBase - 30 * k;
    block(p, { x: -4, top: wallTop, w: width + 8, base: townBase, color: 0xbfa078, depth: 0.5, seed: 5, parapet: 'kungura' });
    for (let x = width * 0.04; x < width; x += 150 * k) roundTower(p, { cx: x, top: wallTop - 8 * k, base: townBase, r: 10 * k, color: 0xbfa078, depth: 0.48 });
    townRow(p, { x0: -10, x1: width + 10, base: wallTop + 4 * k, heights: [10, 34], palette: MUD, depth: 0.46, seed: 0x6b1, domes: 0.14, windows: 1 });
    // The shrine of ʿAbbás, smaller, to the left.
    const abbas = width / 2 - Math.min(width * 0.26, 300 * k);
    mosque(p, { cx: abbas, base: wallTop + 6 * k, r: 22 * k, dome: GOLD, body: 0xc8b090, depth: 0.42, drum: 0.55, bulb: 1.05, minarets: { at: [-1.7, 1.7], h: 4.4, color: GOLD, bands: TURQUOISE }, seed: 41 });
    // The shrine of the Imám Ḥusayn, against the sun.
    const shrine = width / 2 + Math.max(30 * k, Math.min(width * 0.06, 70 * k));
    mosque(p, { cx: shrine, base: wallTop + 8 * k, r: 36 * k, dome: GOLD, body: 0xd0b894, depth: 0.4, drum: 0.6, bulb: 1.08, minarets: { at: [-1.9, 1.9], h: 4.2, color: GOLD, bands: TURQUOISE }, seed: 42 });
    // The near quarter, lower, in front of the shrines' feet.
    townRow(p, { x0: -10, x1: width + 10, base: wallTop + 10 * k, heights: [2, 10], palette: MUD, depth: 0.4, seed: 0x6b2, windows: 2, lit: 0.4 });
    dome(p, { cx: width * 0.86, base: wallTop + 2 * k, r: 9 * k, color: TURQUOISE, depth: 0.42, drum: 4 * k, bulb: 1.15, finial: true });
    // The groves and fields outside the wall, the canal, and palms close by.
    plain(p, townBase, 0x8e9a5a, 0x6e7444, 0x4a1);
    grove(p, { x0: -10, x1: width + 10, base: townBase + 14 * k, kinds: ['palm'], spacing: 17, size: 44, depth: 0.22, seed: 0x2b, season, skip: x => Math.abs(x - width / 2) < width * 0.1 || Math.sin(x * 0.011) > 0.55 });
    const canal = river(p, { far: townBase + (height - townBase) * 0.36, near: townBase + (height - townBase) * 0.44, seed: 3, wander: 3 });
    scrub(p, canal.nearAt(width / 2) + 6 * k, 30, 0x5e6a38, 0x5c);
    const edge = bank(p, { color: 0x6b6a3e, lift: 60, seed: 0x7d, gap: { at: 0.55, width: 0.3 } });
    const rand = rng(0x99);
    for (const x of [width * 0.04, width * 0.11, width * 0.9, width * 0.97]) {
      palm(p, { x, base: edge(x) + 10 * k, h: (110 + rand() * 50) * k, depth: 0, seed: Math.round(x) });
    }
  },
};
