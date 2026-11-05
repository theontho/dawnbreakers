import { rng } from '../../canvasKit';
import { dawnPass, isAccent, tone } from '../../dawnPass';
import { dome, minaret } from '../../dawnShapes';
import { bank, river } from '../kit/ground';
import { BRICK, MUD, mosque, townRow, TURQUOISE } from '../kit/town';
import { grove, palm } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Baghdád across the Tigris, from the Karkh bank: the governor's serai and
 * the brick houses of the east bank with their wooden balconies over the
 * water, turquoise domes and a tall brick minaret, palms behind, round
 * reed boats on the river, and the broad water taking the sunrise.
 */
export const BAGHDAD: Vista = {
  id: 'baghdad',
  latitude: 33.34,
  longitude: 44.4,
  reach: 210,
  land: 0xa08a6a,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const quay = Math.round(H + height * 0.05);
    grove(p, { x0: -10, x1: width + 10, base: H, kinds: ['palm'], spacing: 9, size: 30, depth: 0.7, seed: 0xba1, season });
    townRow(p, { x0: -10, x1: width + 10, base: quay - 8 * k, heights: [22, 44], palette: [...BRICK, ...MUD], depth: 0.5, seed: 0xba2, domes: 0.1, windows: 2, lit: 0.4 });
    minaret(p, { cx: width * 0.3, base: quay - 30 * k, h: 130 * k, r: 5 * k, color: 0xb08458, depth: 0.46, bands: TURQUOISE });
    mosque(p, { cx: width / 2 + Math.min(width * 0.07, 80 * k), base: quay - 10 * k, r: 28 * k, dome: TURQUOISE, body: 0xc4a07a, depth: 0.44, tiled: true, drum: 0.5, bulb: 1.15, minarets: { at: [-1.6, 1.6], h: 3.4, color: 0xc4a07a, bands: TURQUOISE }, seed: 7 });
    dome(p, { cx: width * 0.78, base: quay - 26 * k, r: 14 * k, color: TURQUOISE, depth: 0.46, drum: 6 * k, bulb: 1.2, tiled: true, finial: true });
    // The river front: houses down to the water with their balconies.
    townRow(p, { x0: -10, x1: width + 10, base: quay, heights: [14, 30], palette: [...BRICK, ...MUD], depth: 0.4, seed: 0xba3, windows: 2, lit: 0.5, balconies: 0.55, keep: x => Math.abs(x - width * 0.62) > 40 * k });
    const water = river(p, { far: quay, near: height - 50 * k, seed: 5, wander: 2 });
    boats(p, water.farAt(0), height - 60 * k);
    const edge = bank(p, { color: 0x6a6440, lift: 46, seed: 0xba4, gap: { at: 0.5, width: 0.55 } });
    const rand = rng(0xba5);
    for (const x of [width * 0.03, width * 0.1, width * 0.93]) {
      palm(p, { x, base: edge(x) + 8 * k, h: (120 + rand() * 50) * k, depth: 0, seed: Math.round(x) });
    }
  },
};

/** Round reed boats (quffa) and a long boat or two on the water. */
function boats(p: ReturnType<typeof dawnPass>, far: number, near: number): void {
  const { ctx, k, width } = p;
  const rand = rng(0xb0a7);
  for (let i = 0; i < 6; i++) {
    const t = rand();
    const y = far + (near - far) * (0.15 + 0.7 * t);
    const s = (3 + 9 * t) * k;
    const x = rand() * width;
    if (Math.abs(x - width / 2) < 60 * k) continue;
    ctx.fillStyle = tone(p, 0x3a2a1c, 0.9, 0.2 * (1 - t));
    ctx.beginPath();
    if (rand() < 0.6) ctx.ellipse(x, y, s * 1.4, s * 0.45, 0, 0, Math.PI * 2);
    else {
      ctx.moveTo(x - s * 3, y - s * 0.6);
      ctx.quadraticCurveTo(x, y + s * 0.8, x + s * 3, y - s * 0.6);
      ctx.closePath();
    }
    ctx.fill();
    if (!isAccent(p)) {
      ctx.fillStyle = tone(p, 0x6a5a40, 1, 0.2);
      ctx.fillRect(x - s * 1.4, y - s * 0.3, s * 2.8, 0.8 * k);
    }
  }
}
