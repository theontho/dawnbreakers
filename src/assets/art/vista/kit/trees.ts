import { css, rng } from '../../canvasKit';
import { isAccent, rimPath, tone, toneColor, type DawnPass } from '../../dawnPass';
import { crown, cypress } from '../../dawnShapes';
import type { Season } from '../types';

/**
 * Trees for the vistas beyond Shíráz: the date palms of the Iraqi plain and
 * the Gulf, poplars along Persian streams, broad trees in their season's
 * leaf, almonds in blossom, and whole groves of them in a row.
 */

const PALM_TRUNK = 0x6e5638;
const PALM_LEAF = 0x4c6a34;
const POPLAR = 0x52783a;

export interface PalmSpec {
  x: number;
  base: number;
  h: number;
  depth: number;
  seed: number;
  /** Sideways sway of the crown, in pixels. */
  lean?: number;
}

/** A date palm: a slim ringed trunk bending up to a crown of arching fronds. */
export function palm(p: DawnPass, s: PalmSpec): void {
  const { ctx, k } = p;
  const rand = rng(s.seed);
  const lean = s.lean ?? (rand() - 0.5) * s.h * 0.25;
  const top = { x: s.x + lean, y: s.base - s.h };
  const trunkW = Math.max(1.4, s.h * 0.045);
  ctx.strokeStyle = tone(p, PALM_TRUNK, 0.9, s.depth);
  ctx.lineWidth = trunkW;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(s.x, s.base);
  ctx.quadraticCurveTo(s.x + lean * 0.1, s.base - s.h * 0.5, top.x, top.y);
  ctx.stroke();
  const fronds = 9;
  const leaf = tone(p, PALM_LEAF, 0.95, s.depth);
  const outline: Array<() => void> = [];
  for (let i = 0; i < fronds; i++) {
    const a = -Math.PI / 2 + (i / (fronds - 1) - 0.5) * Math.PI * 1.5 + (rand() - 0.5) * 0.3;
    const len = s.h * (0.32 + rand() * 0.12);
    const tipX = top.x + Math.cos(a) * len;
    const tipY = top.y + Math.sin(a) * len * 0.6 + len * 0.35;
    const midX = top.x + Math.cos(a) * len * 0.55;
    const midY = top.y + Math.sin(a) * len * 0.55 - len * 0.12;
    const draw = (): void => {
      ctx.moveTo(top.x, top.y);
      ctx.quadraticCurveTo(midX, midY, tipX, tipY);
    };
    ctx.strokeStyle = leaf;
    ctx.lineWidth = Math.max(1.2, s.h * 0.05 * (1 - Math.abs(Math.cos(a)) * 0.3));
    ctx.beginPath();
    draw();
    ctx.stroke();
    if (!isAccent(p) && s.h > 22 * k) {
      // Leaflets along the frond.
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = tone(p, PALM_LEAF, rand() < 0.5 ? 1.25 : 0.75, s.depth);
      ctx.beginPath();
      for (let t = 0.25; t < 1; t += 0.12) {
        const x = (1 - t) * (1 - t) * top.x + 2 * (1 - t) * t * midX + t * t * tipX;
        const y = (1 - t) * (1 - t) * top.y + 2 * (1 - t) * t * midY + t * t * tipY;
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(a + 0.9) * 3 * k, y + 3 * k);
      }
      ctx.stroke();
    }
    if (Math.sin(a) < 0) outline.push(draw);
  }
  ctx.lineCap = 'butt';
  rimPath(p, top.x, () => outline.forEach(draw => draw()), 0.8, s.depth);
}

/** Leaf colour of a broad tree in its season. */
export function leafColor(season: Season, rand: () => number): number {
  if (season === 'autumn') return [0xb98a2e, 0xa8642a, 0x8a8a34, 0xc9a03a][Math.floor(rand() * 4)]!;
  if (season === 'winter') return [0x6a5a48, 0x5e5040][Math.floor(rand() * 2)]!;
  if (season === 'spring') return [0x6a9a48, 0x7aa850][Math.floor(rand() * 2)]!;
  return [0x4f7a3c, 0x3f6e38][Math.floor(rand() * 2)]!;
}

/** A poplar's colour in its season. */
export function poplarColor(season: Season): number {
  if (season === 'autumn') return 0xc4a238;
  if (season === 'winter') return 0x6e6250;
  return POPLAR;
}

export type GroveKind = 'palm' | 'poplar' | 'cypress' | 'broad' | 'almond';

export interface GroveSpec {
  x0: number;
  x1: number;
  base: number;
  kinds: readonly GroveKind[];
  /** Spacing between trunks, in unscaled pixels. */
  spacing: number;
  /** Tree height, in unscaled pixels. */
  size: number;
  depth: number;
  seed: number;
  season: Season;
  /** Leave a gap where this returns true. */
  skip?: (x: number) => boolean;
  rim?: number;
}

/** A row of trees along a line, mixing the kinds given. */
export function grove(p: DawnPass, g: GroveSpec): void {
  const { k } = p;
  const rand = rng(g.seed);
  for (let x = g.x0; x < g.x1; x += g.spacing * k * (0.6 + rand() * 0.8)) {
    const kind = g.kinds[Math.floor(rand() * g.kinds.length)]!;
    const size = g.size * k * (0.75 + rand() * 0.5);
    const base = g.base + (rand() - 0.5) * 3 * k;
    if (g.skip?.(x)) continue;
    tree(p, kind, x, base, size, g, Math.round(x * 13 + g.seed), rand);
  }
}

function tree(p: DawnPass, kind: GroveKind, x: number, base: number, size: number, g: GroveSpec, seed: number, rand: () => number): void {
  const { k } = p;
  switch (kind) {
    case 'palm':
      palm(p, { x, base, h: size, depth: g.depth, seed });
      return;
    case 'poplar':
      cypress(p, { x, base, h: size * 1.2, w: size * 0.16, depth: g.depth, color: poplarColor(g.season), lean: (rand() - 0.5) * 2 * k, rim: g.rim });
      return;
    case 'cypress':
      cypress(p, { x, base, h: size, w: size * 0.18, depth: g.depth, lean: (rand() - 0.5) * 2 * k, rim: g.rim });
      return;
    case 'almond':
      almond(p, x, base, size * 0.35, g.depth, seed, g.season);
      return;
    case 'broad':
      crown(p, { x, base, r: size * 0.36, color: leafColor(g.season, rand), depth: g.depth, seed, trunk: size * 0.3, rim: g.rim });
  }
}

/** An almond tree: pink-white blossom in spring, green leaf the rest of the year. */
export function almond(p: DawnPass, x: number, base: number, r: number, depth: number, seed: number, season: Season): void {
  const { ctx, k } = p;
  const blossom = season === 'spring';
  crown(p, { x, base, r, color: blossom ? 0xe8c8cc : leafColor(season, rng(seed)), depth, seed, trunk: r * 0.8 });
  if (!blossom || isAccent(p)) return;
  const rand = rng(seed + 3);
  ctx.fillStyle = css(toneColor(p, 0xfbe6ea, 1.1, depth), 0.9);
  for (let i = 0; i < r * 2; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * r;
    ctx.fillRect(x + Math.cos(a) * d * 1.2, base - r * 0.8 - r * 1.1 + Math.sin(a) * d * 0.7, 1.2 * k, 1.2 * k);
  }
}
