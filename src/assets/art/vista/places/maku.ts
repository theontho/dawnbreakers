import { css } from '../../canvasKit';
import { dawnPass, isAccent, rimStroke, tone, toneColor, type DawnPass } from '../../dawnPass';
import { block } from '../../dawnShapes';
import { bank, snowCover } from '../kit/ground';
import { paintRange, rockBands } from '../kit/mountains';
import { STONE, townRow } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Mákú in winter, seen from across its gorge: the great rock wall standing
 * over the town, and high in its face the long shallow cave under the
 * overhang where the fortress that held the Báb was built, its halls going
 * back into the shadow, its curtain wall along the lip of the ledge, and
 * walls running down the scree on either hand to the town. Across the
 * gorge the other cliff, the snowy peaks between, bare poplars along the
 * frozen stream.
 */
export const MAKU: Vista = {
  id: 'maku',
  latitude: 39.29,
  longitude: 44.45,
  reach: 320,
  land: 0x9aa0b4,
  paint: (ctx, mode, frame) => {
    const p = dawnPass(mode, ctx, frame);
    const { k, width, height, horizonY: H, season } = frame;
    const town = Math.round(H + height * 0.07);
    // On a narrow screen the rock draws in, so the gorge and the far peaks still show beside it.
    const fit = Math.min(1, Math.max(0.45, width / (1100 * k)));
    const lift = 0.6 + 0.4 * fit;
    paintRange(p, { base: H - 4 * k, peaks: [{ at: 0.5, h: 120, w: 260 * Math.max(0.6, fit), sharp: 1.8 }, { at: 0.72, h: 90, w: 200 * Math.max(0.6, fit) }], floor: 20, rough: 6, color: 0x9aa0b4, depth: 0.9, seed: 8.1, snow: 70 });
    // The cliff across the gorge.
    paintRange(p, { base: town, peaks: [{ at: 0.95 + 0.12 * (1 - fit), h: 220 * lift, w: 260 * fit, sharp: 0.8 }], floor: 24, rough: 10, color: 0x7a6a62, depth: 0.5, seed: 9.7, snow: 18, rim: 0.8, strata: true });
    const caveW = 300 * k * (0.45 + 0.55 * fit);
    const cave = rockFace(p, {
      foot: town,
      height: 290 * lift * k,
      cx: width * (0.27 + 0.09 * (1 - fit) / 0.55),
      caveW,
      caveH: 84 * lift * k,
      right: 70 * k + 40 * k * fit,
      winter: season === 'winter',
    });
    fortress(p, cave);
    townRow(p, { x0: width * 0.05, x1: width + 10, base: town, heights: [10, 26], palette: STONE, depth: 0.4, seed: 0x3a1, windows: 1, lit: 0.6, parapets: ['plain'] });
    snowCover(p, town, 0x3a2);
    grove(p, { x0: -10, x1: width + 10, base: town + 30 * k, kinds: ['poplar', 'poplar', 'broad'], spacing: 22, size: 50, depth: 0.2, seed: 0x3a3, season, skip: x => Math.abs(x - width / 2) < 60 * k });
    bank(p, { color: 0x9aa0a8, lift: 44, seed: 0x3a4, gap: { at: 0.5, width: 0.4 } });
  },
};

type Pt = { x: number; y: number };

const ROCK = 0x7a6a62;
const DEPTH = 0.5;
/** The fortress's stone: the cliff's own, a little paler where it has been cut and laid. */
const MASONRY = 0x8c7c6c;
const SHADOW = 0x1e1816;

interface FaceSpec {
  /** Screen y of the cliff's foot, at the town. */
  foot: number;
  height: number;
  /** Screen x of the middle of the cave. */
  cx: number;
  caveW: number;
  caveH: number;
  /** How far the rock runs on past the cave's right end before it has fallen to the town. */
  right: number;
  winter: boolean;
}

/** The cave and the scree under it, where the fortress goes. */
interface Cave {
  cx: number;
  /** Half the cave's width. */
  half: number;
  /** The cave's floor, the ledge the fortress stands on. */
  ledge: number;
  top: number;
  mouth: Pt[];
  foot: number;
}

const ragged = (x: number, k: number): number => Math.sin(x * 0.031 + 2) * 4 * k + Math.sin(x * 0.09 + 5) * 2 * k;

/**
 * The great rock of Mákú, face on: a ragged crest highest over the cave,
 * its right shoulder falling to the town, horizontal strata and vertical
 * cracks across its face, and the long low cave high in it, the brow of the
 * overhang a pale lip along its top and its back lost in shadow.
 */
function rockFace(p: DawnPass, o: FaceSpec): Cave {
  const { ctx, k } = p;
  const crest = o.foot - o.height;
  const half = o.caveW / 2;
  const ledge = o.foot - o.height * 0.38;
  const top = ledge - o.caveH;
  const shoulder = o.cx + half + 24 * k;
  const end = o.cx + half + o.right;

  const crestPoints: Pt[] = [];
  for (let x = -8; x <= end; x += 4) {
    const u = (x - o.cx) / half;
    // Lower and broken away to the left; over the cave the summit; past the shoulder the rock falls away.
    const left = Math.max(0, -u - 0.9) * o.height * 0.07;
    const along = x > shoulder ? (x - shoulder) / (end - shoulder) : 0;
    // The shoulder breaks down in steps, buttresses and gullies, not a smooth fall.
    const fall = along > 0 ? (o.foot - crest) * Math.min(1, along ** 1.4 + Math.max(0, Math.sin(along * 13 + 0.5)) * 0.07 * along + Math.sin(along * 29) * 0.015) : 0;
    const shoulders = Math.sin(u * 2.3 + 1.1) * 8 * k + Math.sin(u * 6.1 + 4) * 3 * k;
    crestPoints.push({ x, y: Math.min(o.foot, crest + left + fall + shoulders * (1 - fall / o.height) + ragged(x, k) * (1 + 3 * along)) });
  }
  const outline: Pt[] = [{ x: -8, y: o.foot + 40 * k }, ...crestPoints, { x: end, y: o.foot + 40 * k }];
  const trace = (pts: Pt[]): void => {
    ctx.beginPath();
    pts.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.closePath();
  };

  // The cave mouth: a long low arch, its crown a little left of middle, its floor the ledge.
  const mouth: Pt[] = [];
  for (let i = 0; i <= 32; i++) {
    const u = -1 + (2 * i) / 32;
    const v = Math.max(0, 1 - Math.abs(u + 0.1 * (1 - u * u)) ** 3.2) ** 0.45;
    // The roof sags and juts where blocks have fallen from it.
    const sag = (Math.sin(u * 7 + 1) * 4 + Math.sin(u * 17 + 3) * 2) * k * v;
    mouth.push({ x: o.cx + u * half, y: ledge - o.caveH * v * (0.9 + 0.1 * Math.cos(u * 3)) + sag });
  }
  for (let i = 1; i < 12; i++) {
    const u = 1 - (2 * i) / 12;
    mouth.push({ x: o.cx + u * half * 0.98, y: ledge + Math.sin(u * 5) * 1.5 * k });
  }

  // The scree fanning from under the cave down to the town.
  const scree: Pt[] = [
    { x: o.cx - half * 0.9, y: ledge },
    { x: o.cx + half * 0.9, y: ledge },
    { x: o.cx + half * 1.05, y: ledge + (o.foot - ledge) * 0.5 },
    { x: o.cx + half * 1.25, y: o.foot + 2 * k },
    { x: o.cx - half * 1.3, y: o.foot + 2 * k },
    { x: o.cx - half * 1.08, y: ledge + (o.foot - ledge) * 0.5 },
  ];

  trace(outline);
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(0, crest, 0, o.foot);
    g.addColorStop(0, tone(p, ROCK, 1, DEPTH));
    g.addColorStop(1, tone(p, ROCK, 0.86, DEPTH * 0.9));
    ctx.fillStyle = g;
  }
  ctx.fill();
  if (!isAccent(p)) {
    ctx.save();
    trace(outline);
    ctx.clip();
    rockBands(p, o.foot, o.height, ROCK, DEPTH);
    cracks(p, crest, o.foot, -8, end, ledge, o.cx, half);
    // The rock's right shoulder turns toward the sunrise and takes more of its light.
    const lit = ctx.createLinearGradient(o.cx + half, 0, end, 0);
    lit.addColorStop(0, css(toneColor(p, ROCK, 1.3, DEPTH), 0));
    lit.addColorStop(1, css(toneColor(p, ROCK, 1.3, DEPTH), 0.45));
    ctx.fillStyle = lit;
    ctx.fillRect(o.cx + half, crest - 20 * k, end - o.cx - half + 8, o.height + 40 * k);
    if (o.winter) winterFace(p, crestPoints, o.foot, o.height);
    // The scree, paler, its stones fallen from the face.
    trace(scree.map((pt, i) => ({ x: pt.x, y: pt.y + (i < 2 ? 0 : Math.sin(pt.x) * 2 * k) })));
    const fan = ctx.createLinearGradient(0, ledge, 0, o.foot);
    fan.addColorStop(0, css(toneColor(p, ROCK, 1.08, DEPTH), 0.85));
    fan.addColorStop(1, css(toneColor(p, ROCK, 1.08, DEPTH), 0.2));
    ctx.fillStyle = fan;
    ctx.fill();
    for (let i = 0; i < 46; i++) {
      const t = (i * 0.6180339) % 1;
      const y = ledge + 6 * k + t * (o.foot - ledge - 8 * k);
      const spread = half * (0.9 + 0.35 * t);
      const x = o.cx - spread + ((i * 0.37) % 1) * spread * 2;
      const r = (1 + ((i * 0.53) % 1) * 2) * k;
      ctx.fillStyle = tone(p, o.winter && i % 3 === 0 ? 0xf1f4f8 : ROCK, i % 2 ? 0.82 : 1.2, DEPTH);
      ctx.beginPath();
      ctx.ellipse(x, y, r * 1.5, r, 0, Math.PI, 0);
      ctx.fill();
    }
    // Inside the cave: dark under the roof, a little light reaching the back over the ledge.
    trace(mouth);
    const dark = ctx.createLinearGradient(0, top, 0, ledge);
    dark.addColorStop(0, tone(p, SHADOW, 1, DEPTH * 0.5));
    dark.addColorStop(1, tone(p, ROCK, 0.45, DEPTH * 0.7));
    ctx.fillStyle = dark;
    ctx.fill();
    ctx.restore();
  }
  if (p.mode !== 'lamp') rimStroke(p, crestPoints, 0.8, DEPTH);
  return { cx: o.cx, half, ledge, top, mouth, foot: o.foot };
}

/** Dark vertical cracks running down the face, the joints the rock splits along, none crossing the cave. */
function cracks(p: DawnPass, crest: number, foot: number, x0: number, x1: number, ledge: number, cx: number, half: number): void {
  const { ctx, k } = p;
  ctx.strokeStyle = tone(p, SHADOW, 1, DEPTH);
  for (let i = 0; i < 14; i++) {
    const x = x0 + ((i * 0.618 + 0.13) % 1) * (x1 - x0);
    const start = crest + ((i * 0.41) % 1) * 40 * k;
    const length = (60 + ((i * 0.73) % 1) * 140) * k;
    const inCave = Math.abs(x - cx) < half * 1.05;
    const stop = Math.min(foot, start + length, inCave ? ledge - 90 * k : foot);
    if (stop <= start + 10 * k) continue;
    ctx.globalAlpha = 0.18 + ((i * 0.29) % 1) * 0.2;
    ctx.lineWidth = (0.8 + (i % 3) * 0.7) * k;
    ctx.beginPath();
    for (let y = start; y <= stop; y += 6 * k) {
      const dx = Math.sin(y * 0.021 + i) * 2.5 * k + (Math.sin(y * 0.23 + i * 2) > 0.6 ? 1.5 * k : 0);
      if (y === start) ctx.moveTo(x + dx, y);
      else ctx.lineTo(x + dx, y);
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Snow along the crest, and caught in short streaks on the ledges of the strata. */
function winterFace(p: DawnPass, crestPoints: Pt[], foot: number, height: number): void {
  const { ctx, k } = p;
  ctx.fillStyle = tone(p, 0xf1f4f8, 1.08, DEPTH * 0.8);
  ctx.beginPath();
  crestPoints.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y - 2 * k) : ctx.lineTo(pt.x, pt.y - 2 * k)));
  for (let i = crestPoints.length - 1; i >= 0; i--) {
    const pt = crestPoints[i]!;
    const drift = Math.max(0, Math.sin(pt.x * 0.045 + 2) * 0.5 + Math.sin(pt.x * 0.13) * 0.5);
    ctx.lineTo(pt.x, pt.y + (2 + 9 * drift) * k + Math.sin(pt.x * 0.21 + 9.7) * 1.5 * k);
  }
  ctx.closePath();
  ctx.fill();
  // Only the upper strata hold snow, in short broken drifts on their ledges.
  for (let i = 0; (16 + i * 20) * k < height - 6 * k; i++) {
    const y = foot - (16 + i * 20) * k;
    const high = (16 + i * 20) * k / height;
    if (high < 0.45) continue;
    for (let j = 0; j < 9; j++) {
      const seed = (i * 0.37 + j * 0.618) % 1;
      if ((seed * 7.3) % 1 > high) continue;
      const x = crestPoints[0]!.x + seed * (crestPoints[crestPoints.length - 1]!.x - crestPoints[0]!.x);
      const len = (4 + ((i * 3 + j * 5) % 7) * 2.5) * k;
      ctx.globalAlpha = 0.35 + 0.35 * high;
      ctx.beginPath();
      for (let s = 0; s <= 6; s++) {
        const px = x + (len * s) / 6;
        const dy = Math.sin(px * 0.02 + i) * 4 * k + Math.sin(px * 0.07 + i * 3) * 2 * k;
        if (s === 0) ctx.moveTo(px, y + dy);
        else ctx.lineTo(px, y + dy - Math.sin((Math.PI * s) / 6) * 1.6 * k);
      }
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * The fortress in the cave, face on: its halls and keep standing back
 * under the roof, their upper storeys lost in the overhang's shadow, the
 * curtain wall along the lip of the ledge with its towers, and a wall down
 * each side of the scree to a gate tower at the town.
 */
function fortress(p: DawnPass, c: Cave): void {
  const { ctx, k } = p;
  const depth = DEPTH - 0.02;
  const traceMouth = (): void => {
    ctx.beginPath();
    c.mouth.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.closePath();
  };
  const caveH = c.ledge - c.top;
  ctx.save();
  traceMouth();
  ctx.clip();
  // The halls at the back, reaching up into the dark.
  const halls = [
    { u: -0.86, w: 0.3, h: 0.62, windows: 2 },
    { u: -0.58, w: 0.36, h: 0.95, windows: 3 },
    { u: -0.2, w: 0.3, h: 0.78, windows: 2 },
    { u: 0.12, w: 0.42, h: 1.0, windows: 4 },
    { u: 0.56, w: 0.3, h: 0.7, windows: 2 },
  ];
  halls.forEach((hall, i) => {
    block(p, { x: c.cx + hall.u * c.half, top: c.ledge - caveH * hall.h, w: hall.w * c.half, base: c.ledge + 2 * k, color: MASONRY, depth, seed: 61 + i, parapet: i % 2 ? 'kungura' : 'plain', windows: hall.windows, lit: 0.6, light: 0.8 + 0.04 * i });
  });
  if (!isAccent(p)) {
    // The overhang's shadow, deepest under the roof, falling off toward the ledge.
    const shade = ctx.createLinearGradient(0, c.top, 0, c.ledge);
    shade.addColorStop(0, css(toneColor(p, SHADOW, 1, DEPTH * 0.5), 0.96));
    shade.addColorStop(0.5, css(toneColor(p, SHADOW, 1, DEPTH * 0.5), 0.7));
    shade.addColorStop(1, css(toneColor(p, SHADOW, 1, DEPTH * 0.5), 0.15));
    ctx.fillStyle = shade;
    ctx.fillRect(c.cx - c.half - 4, c.top - 4, c.half * 2 + 8, caveH + 8);
    // The underside of the brow, a band of rock just inside the lip, catching a little light from below.
    ctx.beginPath();
    const arch = c.mouth.slice(0, 33);
    arch.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    for (let i = arch.length - 1; i >= 0; i--) {
      const pt = arch[i]!;
      const u = (pt.x - c.cx) / c.half;
      ctx.lineTo(pt.x, pt.y + 9 * k * Math.max(0, 1 - u * u));
    }
    ctx.closePath();
    ctx.fillStyle = tone(p, ROCK, 0.62, DEPTH);
    ctx.fill();
  }
  ctx.restore();
  // The pale lip of the overhang.
  if (p.mode !== 'lamp') rimStroke(p, c.mouth.slice(0, 33), 0.45, DEPTH);
  if (!isAccent(p)) {
    ctx.strokeStyle = tone(p, ROCK, 1.25, DEPTH);
    ctx.lineWidth = 1.5 * k;
    ctx.beginPath();
    c.mouth.slice(4, 29).forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y - 1.5 * k) : ctx.lineTo(pt.x, pt.y - 1.5 * k)));
    ctx.stroke();
  }

  // The curtain wall along the ledge's lip, and its towers.
  const d = depth - 0.01;
  block(p, { x: c.cx - c.half * 0.94, top: c.ledge - 13 * k, w: c.half * 1.88, base: c.ledge + 7 * k, color: MASONRY, depth: d, seed: 66, parapet: 'kungura', light: 0.95 });
  for (const [i, u] of [-0.62, -0.05, 0.5].entries()) {
    const w = 14 * k;
    block(p, { x: c.cx + u * c.half - w / 2, top: c.ledge - 26 * k, w, base: c.ledge + 8 * k, color: MASONRY, depth: d, seed: 67 + i, parapet: 'kungura', windows: 1, lit: 0.5, light: 1 });
  }

  // A wall down each side of the scree, stepping down in short lengths, with a gate tower at its foot.
  for (const side of [-1, 1]) {
    const steps = 6;
    const x0 = c.cx + side * c.half * 0.92;
    const x1 = c.cx + side * c.half * (side < 0 ? 1.22 : 1.16);
    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;
      const xa = x0 + (x1 - x0) * t0;
      const xb = x0 + (x1 - x0) * t1;
      const ya = c.ledge + (c.foot - c.ledge) * t0;
      const yb = c.ledge + (c.foot - c.ledge) * t1;
      const w = Math.max(5 * k, Math.abs(xb - xa) + 4 * k);
      block(p, { x: Math.min(xa, xb) - 2 * k, top: ya - 7 * k, w, base: yb + 2 * k, color: MASONRY, depth: d - 0.01, seed: 70 + i + (side > 0 ? 10 : 0), parapet: 'kungura', light: 0.9 });
    }
    const tw = 16 * k;
    block(p, { x: x1 - tw / 2, top: c.foot - 30 * k, w: tw, base: c.foot + 4 * k, color: MASONRY, depth: d - 0.02, seed: 90 + side, parapet: 'kungura', windows: 1, lit: 0.6, light: 0.95 });
  }
}
