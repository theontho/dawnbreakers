import { css, rng } from '../../canvasKit';
import { dawnPass, isAccent, rimStroke, sunReach, tone, type DawnPass } from '../../dawnPass';
import { block, crown, dome, minaret } from '../../dawnShapes';
import { bank, nearAt, plain, track } from '../kit/ground';
import { paintRange, rangeY, type RangeSpec } from '../kit/mountains';
import { MUD } from '../kit/town';
import { grove, leafColor } from '../kit/trees';
import type { Season, Vista } from '../types';

/**
 * Bárfurúsh on the plain of Mázindarán in October: a market town of
 * whitewashed houses under steep gables of fired tile, a masjid's dome and
 * its one minaret among them, the dark Hyrcanian forest rising beyond on
 * its foothills, and the Alborz behind with the first snow on its tops.
 * In front, the rice paddies lie flooded between their dikes, each one
 * holding a strip of the dawn sky, and a raised road runs across them to
 * the town.
 */
export const BARFURUSH: Vista = {
  id: 'barfurush',
  latitude: 36.54,
  longitude: 52.68,
  reach: 250,
  land: 0x55684a,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const town = Math.round(H + height * 0.05);
    // The Alborz far behind, snow on the high tops; the forested foothills in front of it.
    paintRange(p, { base: H - 4 * k, peaks: [{ at: 0.08, h: 210, w: 300 }, { at: 0.36, h: 170, w: 280 }, { at: 0.7, h: 230, w: 320, sharp: 1.6 }, { at: 0.97, h: 180, w: 260 }], floor: 40, rough: 6, color: 0x7a8098, depth: 0.9, seed: 4.8, snow: 30 });
    const foothills: RangeSpec = { base: H + 6 * k, peaks: [{ at: 0.18, h: 120, w: 320 }, { at: 0.5, h: 84, w: 260 }, { at: 0.86, h: 128, w: 320 }], floor: 40, rough: 4, color: 0x34482e, depth: 0.66, seed: 2.3, gullies: false };
    paintRange(p, foothills);
    forestCover(p, foothills, season, 0xbf0);
    grove(p, { x0: -10, x1: width + 10, base: town - 10 * k, kinds: ['broad', 'broad', 'poplar'], spacing: 9, size: 40, depth: 0.5, seed: 0xbf1, season });
    // The town: gabled houses, a few flat roofs, the masjid with its dome and one minaret.
    const mx = width / 2 - Math.min(width * 0.12, 140 * k);
    minaret(p, { cx: mx + 34 * k, base: town - 8 * k, h: 74 * k, r: 3.2 * k, color: 0xc8b490, depth: 0.44 });
    block(p, { x: mx - 30 * k, top: town - 30 * k, w: 60 * k, base: town - 2 * k, color: 0xd6c8a8, depth: 0.44, seed: 0xbf2, parapet: 'plain', windows: 2, lit: 0.5 });
    dome(p, { cx: mx, base: town - 32 * k, r: 18 * k, color: 0x3a8a8a, depth: 0.44, drum: 6 * k, bulb: 1.1, tiled: true, finial: true });
    gabledRow(p, { x0: -10, x1: width + 10, base: town, depth: 0.42, seed: 0xbf3, skip: x => Math.abs(x - mx) < 40 * k });
    grove(p, { x0: -10, x1: width + 10, base: town + 6 * k, kinds: ['broad', 'poplar'], spacing: 30, size: 34, depth: 0.36, seed: 0xbf4, season, skip: x => Math.abs(x - width / 2) < 120 * k });
    gabledRow(p, { x0: -10, x1: width + 10, base: town + 10 * k, depth: 0.36, seed: 0xbf5, scale: 1.2, skip: x => Math.abs(x - width * 0.56) < 70 * k });
    // The paddies, the raised road across them, pollards along the dikes.
    plain(p, town + 10 * k, 0x6a7a4a, 0x4e5e34, 0xbf6);
    paddies(p, town + 14 * k, 0xbf7);
    track(p, width * 0.62, { x: width * 0.56, y: town + 12 * k }, 0x9a8a62, 110);
    grove(p, { x0: -10, x1: width + 10, base: town + (height - town) * 0.42, kinds: ['broad'], spacing: 46, size: 26, depth: 0.12, seed: 0xbf8, season, skip: x => Math.abs(x - width * 0.6) < 90 * k });
    bank(p, { color: 0x4e5e34, lift: 52, seed: 0xbf9, gap: { at: 0.62, width: 0.24 } });
  },
};

/** The Hyrcanian forest over the foothills: crowns packed from the crest down, dark green turning here and there. */
function forestCover(p: DawnPass, hills: RangeSpec, season: Season, seed: number): void {
  const { k } = p;
  const rand = rng(seed);
  const count = Math.round(p.width / (1.1 * k));
  for (let i = 0; i < count; i++) {
    const x = rand() * (p.width + 20) - 10;
    const top = rangeY(p, hills, x);
    const y = top + 4 * k + rand() ** 1.4 * (hills.base - top - 2 * k);
    const color = rand() < 0.62 ? [0x34502e, 0x3e5a36, 0x2e4628][Math.floor(rand() * 3)]! : leafColor(season, rand);
    crown(p, { x, base: y, r: (4 + rand() * 4) * k, color, depth: 0.62, seed: seed + i, trunk: 0, rim: 0.4 });
  }
}

interface GabledRowSpec {
  x0: number;
  x1: number;
  base: number;
  depth: number;
  seed: number;
  /** Size of the houses, 1 the far row. */
  scale?: number;
  skip?: (x: number) => boolean;
}

const WALLS = [0xe2d8c0, 0xd8ccb0, 0xcfc2a2, ...MUD.slice(0, 2)] as const;
const TILES = [0xa85a3a, 0x9a4e32, 0xb4664a, 0x8a5a3e] as const;

/** Houses of the Caspian plain: plastered walls under steep tiled gables, a dark eave over each door. */
function gabledRow(p: DawnPass, s: GabledRowSpec): void {
  const { ctx, k } = p;
  const rand = rng(s.seed);
  const scale = s.scale ?? 1;
  for (let x = s.x0; x < s.x1;) {
    const w = (26 + rand() * 26) * k * scale;
    const wallH = (12 + rand() * 8) * k * scale;
    const rise = w * (0.34 + rand() * 0.12);
    const wall = WALLS[Math.floor(rand() * WALLS.length)]!;
    const tile = TILES[Math.floor(rand() * TILES.length)]!;
    if (!s.skip?.(x + w / 2)) {
      const top = s.base - wallH;
      block(p, { x, top, w, base: s.base, color: wall, depth: s.depth, seed: Math.round(x * 17 + s.seed), windows: 1 + Math.floor(rand() * 2), lit: 0.35 });
      const eave = 3 * k * scale;
      const ridge = { x: x + w / 2 + (rand() - 0.5) * w * 0.1, y: top - rise };
      ctx.beginPath();
      ctx.moveTo(x - eave, top + eave * 0.6);
      ctx.lineTo(ridge.x, ridge.y);
      ctx.lineTo(x + w + eave, top + eave * 0.6);
      ctx.closePath();
      if (isAccent(p)) ctx.fillStyle = '#000';
      else {
        const g = ctx.createLinearGradient(0, ridge.y, 0, top);
        g.addColorStop(0, tone(p, tile, 1.05, s.depth));
        g.addColorStop(1, tone(p, tile, 0.78, s.depth));
        ctx.fillStyle = g;
      }
      ctx.fill();
      if (!isAccent(p)) {
        // Courses of tile across the slope.
        ctx.strokeStyle = tone(p, tile, 0.6, s.depth);
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        for (let t = 0.3; t < 1; t += 0.25) {
          const y = ridge.y + (top - ridge.y) * t;
          const half = (w / 2 + eave) * t;
          ctx.moveTo(ridge.x - half, y);
          ctx.lineTo(ridge.x + half, y);
        }
        ctx.stroke();
      }
      // The slope that faces the sunrise catches it.
      const toSun = ridge.x < p.sunX ? x + w + eave : x - eave;
      rimStroke(p, [{ x: ridge.x, y: ridge.y }, { x: toSun, y: top + eave * 0.6 }], 0.9, s.depth);
    }
    x += w + (rand() < 0.3 ? 8 * k : -2 * k);
  }
}

/**
 * Rice paddies from `from` to the bottom of the screen: flooded strips
 * that hold the sky's colour, narrowing with distance, with the sun's path
 * on the water and low green dikes between them.
 */
function paddies(p: DawnPass, from: number, seed: number): void {
  const { ctx, k } = p;
  const rand = rng(seed);
  const rows = 7;
  for (let i = 0; i < rows; i++) {
    const y0 = from + (p.height - from) * (i / rows) ** 1.6;
    const y1 = from + (p.height - from) * ((i + 0.62) / rows) ** 1.6;
    if (y1 - y0 < 1) continue;
    const near = nearAt(p, from, y0);
    // Each row is broken into fields by cross-dikes, wider apart nearer the eye.
    for (let x = -20 + rand() * 40; x < p.width + 20;) {
      const w = (70 + rand() * 160) * k * (0.5 + near * 1.6);
      const x0 = x + 5 * k * (0.4 + near);
      const x1 = x + w;
      // Some fields are already drained, the rice cut and the stubble left standing.
      if (rand() < 0.3) {
        if (!isAccent(p)) {
          ctx.fillStyle = tone(p, rand() < 0.5 ? 0x9a8e52 : 0x7e8444, 1, 0.2 * (1 - near));
          ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        }
        x = x1;
        continue;
      }
      ctx.beginPath();
      ctx.rect(x0, y0, x1 - x0, y1 - y0);
      if (isAccent(p)) ctx.fillStyle = '#000';
      else if (p.mode === 'day') {
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, css(0xb4c8cc));
        g.addColorStop(1, css(0x6e8c8c));
        ctx.fillStyle = g;
      } else {
        const g = ctx.createLinearGradient(0, y0, 0, y1);
        g.addColorStop(0, css(0x34386a));
        g.addColorStop(1, css(0x1c2040));
        ctx.fillStyle = g;
      }
      ctx.fill();
      if (p.mode === 'rim') {
        // The sun's path on the water, narrow far off and widening toward us.
        const half = p.width * (0.03 + 0.07 * near) + 18 * k;
        const a = Math.max(x0, p.sunX - half);
        const b = Math.min(x1, p.sunX + half);
        if (b > a) {
          const g = ctx.createLinearGradient(p.sunX - half, 0, p.sunX + half, 0);
          const on = 0.75 * sunReach(p, p.sunX);
          g.addColorStop(0, css(0xffc77a, 0));
          g.addColorStop(0.5, css(0xffd890, on));
          g.addColorStop(1, css(0xffc77a, 0));
          ctx.fillStyle = g;
          ctx.fillRect(a, y0, b - a, y1 - y0);
        }
      } else if (!isAccent(p)) {
        // Rice stubble standing in the water.
        ctx.fillStyle = p.mode === 'day' ? 'rgba(90,110,60,0.55)' : 'rgba(30,40,40,0.5)';
        const tufts = Math.floor((x1 - x0) / (3 * k));
        for (let t = 0; t < tufts; t++) ctx.fillRect(x0 + rand() * (x1 - x0), y0 + rand() * (y1 - y0), 1, (1 + near * 3) * k);
      }
      x = x1;
    }
  }
}
