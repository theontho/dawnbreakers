import { css, rng } from '../../canvasKit';
import { dawnPass, isAccent, rimStroke, tone, toneColor, type DawnPass } from '../../dawnPass';
import { bank, snowCover } from '../kit/ground';
import { fort } from '../kit/landmarks';
import { paintRange, rangeY, type RangeSpec } from '../kit/mountains';
import { STONE, townRow } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Mákú in winter: the little town in its gorge under the great cliff, the
 * fortress up on the rock in the hollow under its overhang, snow on the
 * roofs, the slopes and the far peaks, and bare poplars along the frozen
 * stream.
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
    // On a narrow screen the cliffs draw in and step aside, so the gorge and the far peaks still show between them.
    const fit = Math.min(1, Math.max(0.45, width / (1100 * k)));
    const lift = 0.6 + 0.4 * fit;
    paintRange(p, { base: H - 4 * k, peaks: [{ at: 0.5, h: 120, w: 260 * Math.max(0.6, fit), sharp: 1.8 }, { at: 0.72, h: 90, w: 200 * Math.max(0.6, fit) }], floor: 20, rough: 6, color: 0x9aa0b4, depth: 0.9, seed: 8.1, snow: 70 });
    // The cliff the town shelters under, and the fortress tucked under its overhang.
    const cliff: RangeSpec = {
      base: town,
      peaks: [
        { at: 0.16 - 0.06 * (1 - fit), h: 300 * lift, w: 330 * fit, sharp: 0.6 },
        { at: 0.95 + 0.12 * (1 - fit), h: 220 * lift, w: 260 * fit, sharp: 0.8 },
      ],
      floor: 24,
      rough: 10,
      color: 0x7a6a62,
      depth: 0.5,
      seed: 9.7,
      snow: 18,
      rim: 0.8,
      strata: true,
    };
    paintRange(p, cliff);
    fortress(p, cliff, Math.max(width * 0.26, 70 * k), season === 'winter');
    townRow(p, { x0: width * 0.05, x1: width + 10, base: town, heights: [10, 26], palette: STONE, depth: 0.4, seed: 0x3a1, windows: 1, lit: 0.6, parapets: ['plain'] });
    snowCover(p, town, 0x3a2);
    grove(p, { x0: -10, x1: width + 10, base: town + 30 * k, kinds: ['poplar', 'poplar', 'broad'], spacing: 22, size: 50, depth: 0.2, seed: 0x3a3, season, skip: x => Math.abs(x - width / 2) < 60 * k });
    bank(p, { color: 0x9aa0a8, lift: 44, seed: 0x3a4, gap: { at: 0.5, width: 0.4 } });
  },
};

/**
 * The fortress of Mákú as it stands: high on the cliff, in the hollow under
 * the great overhanging rock, the shadow of the overhang behind its walls
 * and a scree of fallen stone below them running down into the face.
 */
function fortress(p: DawnPass, cliff: RangeSpec, cx: number, winter: boolean): void {
  const { ctx, k } = p;
  const crest = rangeY(p, cliff, cx);
  const top = crest + 92 * k;
  const base = top + 30 * k;
  const x0 = cx - 50 * k;
  const x1 = cx + 60 * k;
  // The hollow under the overhang: a cave-dark recess wider than the fort, its roof the lip of the rock above.
  const roof = top - 30 * k;
  const left = x0 - 34 * k;
  const right = x1 + 38 * k;
  // The lip of the overhang: a ragged line of rock from one shoulder of the hollow to the other.
  const lip: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const sag = (Math.abs(t - 0.5) * 2) ** 3;
    lip.push({ x: left + (right - left) * t, y: roof + sag * (base - roof) * 0.9 + Math.sin(t * 23) * 2 * k + Math.sin(t * 61) * k });
  }
  const hollow = (): void => {
    ctx.beginPath();
    lip.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.lineTo(right - 6 * k, base + 10 * k);
    ctx.lineTo(left + 6 * k, base + 10 * k);
    ctx.closePath();
  };
  hollow();
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    // Darkest under the roof, opening into the cliff's own colour toward the foot, so it reads as a hollow in the face.
    const g = ctx.createLinearGradient(0, roof, 0, base + 10 * k);
    g.addColorStop(0, tone(p, 0x1c1614, 1, cliff.depth));
    g.addColorStop(0.55, tone(p, 0x3e332e, 1, cliff.depth));
    g.addColorStop(1, css(toneColor(p, cliff.color, 0.86, cliff.depth), 0));
    ctx.fillStyle = g;
  }
  ctx.fill();
  if (p.mode !== 'lamp') rimStroke(p, lip, 0.5, cliff.depth);
  if (winter && !isAccent(p)) {
    // Snow lodged along the lip, where the overhang shelters it from the wind.
    ctx.fillStyle = tone(p, 0xf1f4f8, 1.05, cliff.depth * 0.8);
    for (let i = 6; i <= 18; i += 3) {
      const pt = lip[i]!;
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y - 1.5 * k, 7 * k, 1.8 * k, 0, Math.PI, 0);
      ctx.fill();
    }
  }
  fort(p, { x0, x1, base, top, color: 0x9a8670, depth: 0.46, towers: 3, seed: 31, keep: cx + 20 * k });
  scree(p, cliff, x0 - 30 * k, x1 + 34 * k, base, winter);
}

/** A fan of fallen stone under the walls, hiding their footings and spreading down into the cliff face. */
function scree(p: DawnPass, cliff: RangeSpec, x0: number, x1: number, top: number, winter: boolean): void {
  const { ctx, k } = p;
  const drop = 40 * k;
  const edge = (x: number): number => top - 4 * k + Math.sin(x * 0.18) * 1.5 * k + Math.sin(x * 0.05 + 1) * 2 * k;
  // Ragged all round, spilling furthest down the middle, so it has no straight side to cut the rock bands across.
  const foot = (t: number): number => top + drop * (0.35 + 0.65 * Math.sin(t * Math.PI) ** 0.7) + Math.sin(t * 37) * 3 * k + Math.sin(t * 13) * 4 * k;
  const fan = (): void => {
    ctx.beginPath();
    ctx.moveTo(x0, edge(x0));
    for (let x = x0; x <= x1; x += 3) ctx.lineTo(x, edge(x));
    for (let i = 24; i >= 0; i--) {
      const t = i / 24;
      ctx.lineTo(x0 - 10 * k + (x1 - x0 + 20 * k) * t, foot(t));
    }
    ctx.closePath();
  };
  fan();
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(0, top, 0, top + drop);
    g.addColorStop(0, tone(p, 0x86766a, 0.98, cliff.depth));
    g.addColorStop(0.5, css(toneColor(p, 0x86766a, 0.96, cliff.depth), 0.7));
    g.addColorStop(1, css(toneColor(p, cliff.color, 0.95, cliff.depth), 0));
    ctx.fillStyle = g;
  }
  ctx.fill();
  if (isAccent(p)) return;
  ctx.save();
  fan();
  ctx.clip();
  const rand = rng(0x3a5);
  for (let i = 0; i < 46; i++) {
    const t = rand();
    const y = top + drop * t ** 1.4;
    const x = x0 - 20 * k * t + (x1 - x0 + 44 * k * t) * rand();
    const r = (1 + rand() * 2.2) * k * (1 - t * 0.6);
    ctx.fillStyle = tone(p, 0x86766a, rand() < 0.5 ? 0.8 : 1.1, cliff.depth);
    ctx.globalAlpha = 1 - t * 0.8;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.5, r, 0, Math.PI, 0);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  if (winter) {
    ctx.fillStyle = tone(p, 0xf1f4f8, 1.05, cliff.depth * 0.8);
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 7; i++) {
      const x = x0 + (x1 - x0) * rand();
      ctx.beginPath();
      ctx.ellipse(x, top + drop * (0.1 + rand() * 0.45), (3 + rand() * 6) * k, 1.1 * k, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
