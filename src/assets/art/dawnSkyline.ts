import { css, rng } from './canvasKit';
import type { DawnLayout } from './dawnLayout';
import { isAccent, rimStroke, sunReach, tone, type DawnPass } from './dawnPass';
import { block, crown, cypress, dome, minaret, type Parapet } from './dawnShapes';
import { iwanPortal, roundTower } from './dawnWall';

/**
 * The city behind its wall, back to front: the hazy hills east of Shíráz,
 * a far roofline of bazaar vaults and domes, the turquoise shrine dome
 * that the sun rises behind, then the near quarter of mud-brick houses,
 * wind-catchers, cypresses and plane trees, with Karím Khán's citadel.
 */

const MUD = [0xc8a47a, 0xbf9a6c, 0xd8c2a0, 0xb08660, 0xc9ab84, 0xa98560, 0xd0b48e] as const;
const TURQUOISE = 0x2f9ea4;
const BRICK = 0xb98a5c;
const PLANE = 0x4f7a3c;

export function paintSkyline(p: DawnPass, L: DawnLayout): void {
  paintHills(p, L);
  paintFarCity(p, L);
  paintShrine(p, L);
  paintNearQuarter(p, L);
}

function paintHills(p: DawnPass, L: DawnLayout): void {
  const { ctx, k } = p;
  const ridge = (lift: number, wave: number, seed: number, color: number, depth: number): void => {
    const points: Array<{ x: number; y: number }> = [];
    for (let x = -8; x <= L.width + 8; x += 6) {
      const off = Math.abs(x - p.sunX) / (L.width / 2 + 200);
      const swell = Math.sin(x * 0.011 + seed) * 0.6 + Math.sin(x * 0.027 + seed * 2.3) * 0.3 + Math.sin(x * 0.061 + seed) * 0.1;
      points.push({ x, y: L.horizonY - 3 * k - off ** 1.3 * lift * k - (swell + 1) * wave * k * (0.3 + off) });
    }
    ctx.beginPath();
    ctx.moveTo(-8, L.wallBase);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(L.width + 8, L.wallBase);
    ctx.closePath();
    if (isAccent(p)) ctx.fillStyle = '#000';
    else {
      const g = ctx.createLinearGradient(0, L.horizonY - lift * k, 0, L.horizonY + 10 * k);
      g.addColorStop(0, tone(p, color, 1, depth));
      g.addColorStop(1, tone(p, color, 0.9, depth * 0.85));
      ctx.fillStyle = g;
    }
    if (p.mode === 'rim') {
      // The first light hazing the hills around the sunrise.
      const g = ctx.createRadialGradient(p.sunX, L.horizonY, 0, p.sunX, L.horizonY, L.width * 0.45);
      g.addColorStop(0, css(0xff9a50, 0.3));
      g.addColorStop(1, css(0xff9a50, 0));
      ctx.fillStyle = g;
    }
    ctx.fill();
    if (!isAccent(p)) gullies(p, points, color, depth, seed);
    if (p.mode !== 'day') rimStroke(p, points, 0.6, depth);
  };
  ridge(70, 10, 1.3, 0x9a98a8, 1);
  ridge(34, 6, 4.1, 0xa89482, 0.85);
}

/** Faint gullies running down the hillsides. */
function gullies(p: DawnPass, ridge: ReadonlyArray<{ x: number; y: number }>, color: number, depth: number, seed: number): void {
  const { ctx, k } = p;
  const rand = rng(Math.round(seed * 1000));
  ctx.save();
  ctx.lineWidth = 1;
  for (let i = 0; i < ridge.length; i += 3) {
    const pt = ridge[i]!;
    if (rand() < 0.45) continue;
    const len = (6 + rand() * 18) * k;
    const lean = (rand() - 0.5) * 10 * k;
    ctx.strokeStyle = tone(p, color, rand() < 0.5 ? 0.86 : 1.1, depth);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y + 2);
    ctx.quadraticCurveTo(pt.x + lean * 0.3, pt.y + len * 0.5, pt.x + lean, pt.y + len);
    ctx.stroke();
  }
  ctx.restore();
}

function paintFarCity(p: DawnPass, L: DawnLayout): void {
  const { k } = p;
  const rand = rng(0xfa7c17);
  const depth = 0.64;
  // Tall things first, so the roofline stands in front of their feet.
  const spires: Array<() => void> = [];
  for (let x = L.width * 0.06; x < L.width; x += (90 + rand() * 120) * k) {
    if (Math.abs(x - L.shrineX) < 70 * k) continue;
    const roll = rand();
    const base = L.horizonY - 8 * k;
    if (roll < 0.3) spires.push(() => minaret(p, { cx: x, base, h: (44 + rand() * 16) * k, r: 2.2 * k, color: 0xc0a07a, depth, bands: TURQUOISE }));
    else if (roll < 0.75) spires.push(() => dome(p, { cx: x, base: base - 4 * k, r: (7 + rand() * 6) * k, color: rand() < 0.35 ? TURQUOISE : 0xb89470, depth, drum: 4 * k, bulb: 1.1, finial: true }));
    else spires.push(() => cypress(p, { x, base, h: (20 + rand() * 12) * k, w: 5 * k, depth }));
  }
  spires.forEach(draw => draw());
  // The vaulted roofs of the Vakíl bazaar: a long row of shallow domes.
  const bazaarFrom = L.width * 0.24;
  const bazaarTo = Math.min(L.width * 0.42, p.sunX - 30 * k);
  for (let x = bazaarFrom; x < bazaarTo; x += 11 * k) {
    dome(p, { cx: x, base: L.horizonY - 7 * k, r: 5.6 * k, color: 0xbf9f78, depth, bulb: 0.75 });
  }
  // The roofline itself, dipping low where the sun comes up.
  for (let x = -10; x < L.width + 10;) {
    const w = (16 + rand() * 30) * k;
    const near = Math.abs(x + w / 2 - p.sunX) < L.width * 0.05 + 20 * k;
    const h = near ? (3 + rand() * 4) * k : (7 + rand() * 16) * k;
    block(p, {
      x,
      top: L.horizonY - h,
      w,
      base: L.wallBase,
      color: MUD[Math.floor(rand() * MUD.length)]!,
      depth,
      seed: Math.round(x * 13),
      parapet: rand() < 0.4 ? 'kungura' : 'plain',
      windows: rand() < 0.5 ? 1 : 0,
      lit: 0.25,
    });
    x += w - 1;
  }
}

/** A shrine in the manner of Shíráz: a bulbous tiled dome between two minarets, entered by a tall portal. */
function paintShrine(p: DawnPass, L: DawnLayout): void {
  const { k } = p;
  const cx = L.shrineX;
  const depth = 0.48;
  const roof = L.horizonY - 20 * k;
  for (const dx of [-33, 33]) {
    minaret(p, { cx: cx + dx * k, base: roof + 8 * k, h: 92 * k, r: 3.1 * k, color: 0xc4a47c, depth, bands: TURQUOISE });
  }
  block(p, { x: cx - 38 * k, top: roof, w: 76 * k, base: L.wallBase, color: 0xc7a882, depth, seed: 41, parapet: 'kungura', windows: 3, lit: 0.6 });
  dome(p, { cx, base: roof - 2 * k, r: 25 * k, color: TURQUOISE, depth, drum: 13 * k, bulb: 1.28, tiled: true, finial: true });
  iwanPortal(p, { cx: cx - 52 * k, base: L.horizonY + 6 * k, w: 28 * k, h: 44 * k, color: 0xc7a882, depth: depth + 0.04, tile: TURQUOISE, lamp: true });
}

function paintNearQuarter(p: DawnPass, L: DawnLayout): void {
  const { k } = p;
  const rand = rng(0x5a1c0d);
  const depth = 0.3;
  const argHalf = 64 * k;
  const portalHalf = 26 * k;
  const clear = (x: number, w: number, around: number | null, half: number): boolean => around === null || x + w < around - half || x > around + half;
  // Back row: taller houses, many with wind-catchers or a small mud dome.
  row(p, L, rand, {
    depth,
    top: [16, 40],
    keep: (x, w) => clear(x, w, L.argX, argHalf * 0.7),
    extras: true,
  });
  if (L.argX !== null) citadel(p, L, L.argX, argHalf, depth - 0.02);
  if (L.portalX !== null) iwanPortal(p, { cx: L.portalX, base: L.wallTop + 6 * k, w: portalHalf * 2, h: 64 * k, color: 0xc9a982, depth: depth - 0.02, tile: TURQUOISE, minarets: true, lamp: true });
  // Trees standing in the courtyards.
  const trees = rng(0x7ee5);
  for (let x = 10 * k; x < L.width; x += (40 + trees() * 70) * k) {
    if (Math.abs(x - L.gateX) < 60 * k) continue;
    if (trees() < 0.55) {
      const n = 1 + Math.floor(trees() * 3);
      for (let i = 0; i < n; i++) {
        cypress(p, { x: x + i * 7 * k, base: L.wallTop + 2 * k, h: (34 + trees() * 22) * k, w: (7 + trees() * 2) * k, depth: depth - 0.04, lean: (trees() - 0.5) * 2 * k });
      }
    } else {
      crown(p, { x, base: L.wallTop + 2 * k, r: (11 + trees() * 6) * k, color: PLANE, depth: depth - 0.04, seed: Math.round(x), trunk: 8 * k });
    }
  }
  // Front row: lower roofs just behind the wall.
  row(p, L, rand, {
    depth: depth - 0.08,
    top: [3, 18],
    keep: (x, w) => clear(x, w, L.argX, argHalf + 6 * k) && clear(x, w, L.portalX, portalHalf + 4 * k),
    extras: false,
  });
}

interface RowSpec {
  depth: number;
  /** Range of roof heights above the wall top, in unscaled pixels. */
  top: [number, number];
  keep: (x: number, w: number) => boolean;
  extras: boolean;
}

function row(p: DawnPass, L: DawnLayout, rand: () => number, spec: RowSpec): void {
  const { k } = p;
  const parapets: Parapet[] = ['plain', 'plain', 'plain', 'kungura', 'stepped'];
  for (let x = -14 * k; x < L.width + 14 * k;) {
    const w = (24 + rand() * 30) * k;
    const top = L.wallTop - (spec.top[0] + rand() * (spec.top[1] - spec.top[0])) * k;
    const color = MUD[Math.floor(rand() * MUD.length)]!;
    const parapet = parapets[Math.floor(rand() * parapets.length)]!;
    const extra = rand();
    const seed = Math.round(x * 31 + top);
    if (spec.keep(x, w)) {
      if (spec.extras && extra < 0.2) windcatcher(p, x + w * (0.25 + rand() * 0.4), top, color, spec.depth);
      block(p, { x, top, w, base: L.wallBase, color, depth: spec.depth, seed, parapet, windows: 1 + Math.floor(rand() * 3), lit: 0.3, light: 0.8 + rand() * 0.25 });
      if (spec.extras && extra > 0.86) dome(p, { cx: x + w / 2, base: top - 2 * k, r: Math.min(w * 0.3, 10 * k), color, depth: spec.depth, bulb: 0.85 });
    }
    x += w - 2 * k;
  }
}

/** A wind-catcher (bādgír): a slim tower with tall vent slots. */
export function windcatcher(p: DawnPass, cx: number, roof: number, color: number, depth: number): void {
  const { ctx, k } = p;
  const w = 9 * k;
  const h = 20 * k;
  block(p, { x: cx - w / 2, top: roof - h, w, base: roof, color, depth, seed: Math.round(cx), parapet: 'kungura' });
  if (isAccent(p)) return;
  ctx.fillStyle = tone(p, 0x2a1d14, 1, depth);
  for (let i = 0; i < 3; i++) ctx.fillRect(cx - w / 2 + (i + 0.3) * (w / 3), roof - h + 3 * k, w / 3 * 0.42, h * 0.5);
}

/** The Arg of Karím Khán: high blank brick walls between round corner towers. */
function citadel(p: DawnPass, L: DawnLayout, cx: number, half: number, depth: number): void {
  const { k } = p;
  const top = L.wallTop - 40 * k;
  block(p, { x: cx - half, top, w: half * 2, base: L.wallBase, color: BRICK, depth, seed: 77, parapet: 'kungura' });
  // A single gate in the long wall, with a tiled panel over it.
  iwanPortal(p, { cx, base: L.wallTop + 4 * k, w: 22 * k, h: 30 * k, color: BRICK, depth: depth - 0.01, tile: 0x2f6aa0 });
  for (const dx of [-half, half]) {
    roundTower(p, { cx: cx + dx, top: top - 10 * k, base: L.wallBase, r: 12 * k, color: BRICK, depth, lozenges: true });
  }
  if (p.mode === 'rim') {
    // The citadel's top catches the light across its whole length.
    rimStroke(p, [{ x: cx - half, y: top - 2 * k }, { x: cx + half, y: top - 2 * k }], 0.6 * sunReach(p, cx), depth);
  }
}
