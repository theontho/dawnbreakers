import { css } from '../../canvasKit';
import { dawnPass, isAccent, rimStroke, tone, toneColor, type DawnPass } from '../../dawnPass';
import { block } from '../../dawnShapes';
import { bank, snowCover } from '../kit/ground';
import { paintRange, rockBands } from '../kit/mountains';
import { STONE, townRow } from '../kit/town';
import { grove } from '../kit/trees';
import type { Vista } from '../types';

/**
 * Mákú in winter, as it stands in its gorge: the great rock leaning out
 * over the town like a wave about to break, and the fortress where the Báb
 * was held built into the ledge in the hollow under it, of the same stone,
 * its wall stepping down the scree to the town. Across the gorge the
 * other cliff, the snowy peaks between, bare poplars along the frozen
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
    // The cliff across the gorge.
    paintRange(p, { base: town, peaks: [{ at: 0.95 + 0.12 * (1 - fit), h: 220 * lift, w: 260 * fit, sharp: 0.8 }], floor: 24, rough: 10, color: 0x7a6a62, depth: 0.5, seed: 9.7, snow: 18, rim: 0.8, strata: true });
    const rock = overhang(p, {
      foot: town,
      height: 300 * lift * k,
      lipX: width * (0.38 + 0.24 * (1 - fit) / 0.55),
      reach: 150 * k * (0.75 + 0.25 * fit),
      winter: season === 'winter',
    });
    fortress(p, rock);
    townRow(p, { x0: width * 0.05, x1: width + 10, base: town, heights: [10, 26], palette: STONE, depth: 0.4, seed: 0x3a1, windows: 1, lit: 0.6, parapets: ['plain'] });
    snowCover(p, town, 0x3a2);
    grove(p, { x0: -10, x1: width + 10, base: town + 30 * k, kinds: ['poplar', 'poplar', 'broad'], spacing: 22, size: 50, depth: 0.2, seed: 0x3a3, season, skip: x => Math.abs(x - width / 2) < 60 * k });
    bank(p, { color: 0x9aa0a8, lift: 44, seed: 0x3a4, gap: { at: 0.5, width: 0.4 } });
  },
};

const ROCK = 0x7a6a62;
const DEPTH = 0.5;
/** The fortress's stone: the cliff's own, a little paler where it has been cut and laid. */
const MASONRY = 0x8c7c6c;

interface OverhangSpec {
  /** Screen y of the cliff's foot, at the town. */
  foot: number;
  height: number;
  /** Screen x of the tip of the brow, where it leans furthest over the gorge. */
  lipX: number;
  /** How far the hollow under the brow runs back into the rock. */
  reach: number;
  winter: boolean;
}

/** Where the fortress goes: the ledge at the back of the hollow and the scree below it. */
interface Hollow {
  back: number;
  ledge: number;
  /** The outer edge of the ledge, where the scree begins. */
  edge: number;
  /** The underside of the brow at x, over the ledge. */
  roofAt: (x: number) => number;
  /** The face of the scree at x, from the ledge's edge down to the town. */
  screeAt: (x: number) => number;
  foot: number;
  toe: number;
}

/**
 * The great rock of Mákú, seen along the gorge: a ragged crest running in
 * from the left to a brow that leans out over the town, the underside of
 * the brow sweeping back into a hollow, a ledge at the back of the hollow,
 * and scree from the ledge down to the houses.
 */
function overhang(p: DawnPass, o: OverhangSpec): Hollow {
  const { ctx, k } = p;
  const crest = o.foot - o.height;
  const back = o.lipX - o.reach;
  const ledge = crest + o.height * 0.62;
  const lipY = crest + o.height * 0.12;
  const edge = back + o.reach * 0.85;
  const toe = o.lipX + 40 * k;
  const ragged = (x: number): number => Math.sin(x * 0.031 + 2) * 4 * k + Math.sin(x * 0.09 + 5) * 2 * k;
  // The underside of the brow: from its tip, curving back and down to the back of the hollow.
  const roofTop = ledge - o.height * 0.25;
  const roof = (t: number): { x: number; y: number } => cubic(t, { x: o.lipX, y: lipY }, { x: o.lipX - o.reach * 0.25, y: lipY + o.height * 0.1 }, { x: back + o.reach * 0.05, y: roofTop - o.height * 0.12 }, { x: back, y: roofTop });
  const scree = (t: number): { x: number; y: number } => cubic(t, { x: edge, y: ledge + 3 * k }, { x: edge + o.reach * 0.12, y: ledge + (o.foot - ledge) * 0.35 }, { x: toe - 20 * k, y: o.foot - 10 * k }, { x: toe, y: o.foot });

  const crestPoints: Array<{ x: number; y: number }> = [];
  // Lower and broken to the left, rising to the brow, with a few shoulders and notches on the way.
  for (let x = -8; x <= o.lipX - 36 * k; x += 4) {
    const u = Math.max(0, x / (o.lipX - 36 * k));
    const shoulders = Math.sin(u * 7.3 + 1.1) * 9 * k + Math.sin(u * 17 + 4) * 4 * k;
    crestPoints.push({ x, y: crest + o.height * 0.14 * (1 - u) ** 1.5 + shoulders * (1 - u * 0.6) + ragged(x) });
  }
  const browStart = crestPoints[crestPoints.length - 1]!;
  const brow: Array<{ x: number; y: number }> = [];
  for (let i = 1; i <= 8; i++) brow.push(quad(i / 8, browStart, { x: o.lipX + 4 * k, y: browStart.y + 4 * k }, { x: o.lipX, y: lipY }));
  const underside = Array.from({ length: 25 }, (_, i) => roof(i / 24));
  const talus = Array.from({ length: 17 }, (_, i) => scree(i / 16));
  const outline = [
    { x: -8, y: o.foot + 40 * k },
    ...crestPoints,
    ...brow,
    ...underside,
    { x: back, y: ledge },
    { x: edge, y: ledge + 3 * k },
    ...talus,
    { x: toe, y: o.foot + 40 * k },
  ];
  const trace = (): void => {
    ctx.beginPath();
    outline.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.closePath();
  };
  trace();
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
    trace();
    ctx.clip();
    rockBands(p, o.foot, o.height, ROCK, DEPTH);
    // The underside of the brow faces down, away from the light, and the back of the hollow lies in its shadow, deepest at the rock's edge.
    for (let band = 0; band < 10; band++) {
      const inset = 40 - band * 4;
      const alpha = 0.1;
      ctx.beginPath();
      underside.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
      ctx.lineTo(back, ledge);
      ctx.lineTo(back - inset * k, ledge);
      for (let i = underside.length - 1; i >= 0; i--) {
        const pt = underside[i]!;
        const t = i / (underside.length - 1);
        ctx.lineTo(pt.x - inset * k * t, pt.y - inset * k * (1 - t * 0.7));
      }
      ctx.closePath();
      ctx.fillStyle = css(toneColor(p, 0x1e1816, 1, DEPTH), alpha);
      ctx.fill();
    }
    // Stones fallen from the face, scattered down the scree.
    for (let i = 0; i < 40; i++) {
      const t = (i * 0.6180339) % 1;
      const pt = scree(t);
      const x = pt.x - ((i * 0.37) % 1) * (pt.x - back) * 0.9;
      if (x < back) continue;
      const r = (1 + ((i * 0.53) % 1) * 2) * k;
      ctx.fillStyle = tone(p, ROCK, i % 2 ? 0.8 : 1.12, DEPTH);
      ctx.beginPath();
      ctx.ellipse(x, pt.y - 2 * k, r * 1.5, r, 0, Math.PI, 0);
      ctx.fill();
    }
    if (o.winter) {
      // Snow along the crest and on the brow, none under it.
      ctx.fillStyle = tone(p, 0xf1f4f8, 1.08, DEPTH * 0.8);
      ctx.beginPath();
      [...crestPoints, ...brow].forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y - 2 * k) : ctx.lineTo(pt.x, pt.y - 2 * k)));
      for (const pt of [...brow].reverse()) ctx.lineTo(pt.x - 3 * k, pt.y + 5 * k + Math.sin(pt.x * 0.2) * 1.5 * k);
      // Thin where the wind scours the crest, lying deeper in its hollows.
      for (let i = crestPoints.length - 1; i >= 0; i--) {
        const pt = crestPoints[i]!;
        const drift = Math.max(0, Math.sin(pt.x * 0.045 + 2) * 0.5 + Math.sin(pt.x * 0.13) * 0.5);
        ctx.lineTo(pt.x, pt.y + (2 + 9 * drift) * k + Math.sin(pt.x * 0.21 + 9.7) * 1.5 * k);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
  if (p.mode !== 'lamp') {
    rimStroke(p, [...crestPoints, ...brow], 0.8, DEPTH);
    rimStroke(p, talus, 0.35, DEPTH);
  }
  return {
    back,
    ledge,
    edge,
    foot: o.foot,
    toe,
    roofAt: x => underside.reduce((best, pt) => (Math.abs(pt.x - x) < Math.abs(best.x - x) ? pt : best)).y,
    screeAt: x => talus.reduce((best, pt) => (Math.abs(pt.x - x) < Math.abs(best.x - x) ? pt : best)).y,
  };
}

/**
 * The fortress in the hollow: a keep and its halls against the back wall,
 * rising no higher than the rock above them lets, a curtain wall along the
 * ledge's edge with a bastion at its end, and a wall stepping down the
 * scree toward the town. All of the rock's own stone, and in its shadow.
 */
function fortress(p: DawnPass, h: Hollow): void {
  const { k } = p;
  const span = h.edge - h.back;
  const room = (x0: number, x1: number): number => Math.min(h.roofAt(x0), h.roofAt(x1)) + 6 * k;
  const depth = DEPTH - 0.02;
  const keepX0 = h.back - 2 * k;
  const keepX1 = h.back + span * 0.34;
  block(p, { x: keepX0, top: Math.max(room(keepX0, keepX1), h.ledge - 58 * k), w: keepX1 - keepX0, base: h.ledge + 2 * k, color: MASONRY, depth, seed: 61, parapet: 'kungura', windows: 2, lit: 0.7, light: 0.82 });
  const hallX0 = h.back + span * 0.3;
  const hallX1 = h.back + span * 0.66;
  block(p, { x: hallX0, top: Math.max(room(hallX0, hallX1), h.ledge - 36 * k), w: hallX1 - hallX0, base: h.ledge + 2 * k, color: MASONRY, depth, seed: 62, parapet: 'plain', windows: 3, lit: 0.6, light: 0.9 });
  // The curtain wall along the edge of the ledge, and its bastion.
  block(p, { x: h.back + span * 0.12, top: h.ledge - 14 * k, w: span * 0.86, base: h.ledge + 6 * k, color: MASONRY, depth: depth - 0.01, seed: 63, parapet: 'kungura', light: 0.95 });
  const bastion = 16 * k;
  block(p, { x: h.edge - bastion * 0.6, top: h.ledge - 26 * k, w: bastion, base: h.ledge + 10 * k, color: MASONRY, depth: depth - 0.01, seed: 64, parapet: 'kungura', windows: 1, lit: 0.5 });
  // The wall down the scree, in short stepped lengths, each set into the slope.
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const x0 = h.edge + ((h.toe - h.edge) * i) / steps;
    const x1 = h.edge + ((h.toe - h.edge) * (i + 1)) / steps;
    const top = h.screeAt(x0) - 9 * k;
    block(p, { x: x0, top, w: x1 - x0 + 1, base: h.screeAt(x1) + 4 * k, color: MASONRY, depth: depth - 0.02, seed: 70 + i, parapet: 'kungura', light: 0.92 });
  }
}

function cubic(t: number, a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }, d: { x: number; y: number }): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
    y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
  };
}

function quad(t: number, a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): { x: number; y: number } {
  const u = 1 - t;
  return { x: u * u * a.x + 2 * u * t * b.x + t * t * c.x, y: u * u * a.y + 2 * u * t * b.y + t * t * c.y };
}
