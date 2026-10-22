import { css, groundShadow, mix, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { clothMesh, lerp3, toScreen, valance, worldLine, type WorldPt } from './clothMesh';
import { ellipseShadow, glow, post } from './structureParts';

/**
 * The pavilion tents of the camp at Badasht: cloth walls a little taller
 * than a man, laced to poles, a hipped roof that sags between its ridge
 * poles and billows between the rafters, an appliquéd valance, and guy
 * ropes pegged out on every side.
 */

export interface TentStyle {
  cloth: number;
  trim: number;
  lining: number;
  seed: number;
  /** A sun awning (sāyabān) propped on two poles before the door. */
  awning?: boolean;
}

const POLE = 0x6a4428;
const EAVE = 38;
const RIDGE = 74;

/** Paints a pavilion tent inside `box`'s footprint (p along the long side). */
export function drawPavilion(ctx: Ctx, box: IsoBox, style: TentStyle): void {
  const { w, d } = box;
  const p0 = 7;
  const p1 = w - 7;
  const q0 = 10;
  const q1 = d - 6;
  const qm = (q0 + q1) / 2;
  const pa = p0 + (qm - q0) * 0.8;
  const pb = p1 - (qm - q0) * 0.8;
  const bays = 3;
  const endBays = 2;
  // Eave height dips between the wall poles; the ridge dips between its two poles.
  const eaveZ = (t: number, n: number) => EAVE - 3.5 * Math.abs(Math.sin(Math.PI * n * t));
  const ridge = (t: number): WorldPt => ({ p: pa + (pb - pa) * t, q: qm, z: RIDGE - 5 * Math.sin(Math.PI * t) });
  const frontEave = (t: number): WorldPt => ({ p: p0 - 2 + (p1 - p0 + 4) * t, q: q0 - 2.5, z: eaveZ(t, bays) });
  const endEave = (t: number): WorldPt => ({ p: p1 + 2.5, q: q0 - 2 + (q1 - q0 + 4) * t, z: eaveZ(t, endBays) });

  groundShadow(ctx, { x: box.x, y: box.y, w, d, h: 0 }, 8, 0.24);
  guyRopes(ctx, box, frontEave, endEave, bays, endBays, q0, p1, 'back');

  const stripe = (t: number, n: number) => (Math.floor(t * n) % 2 ? shade(style.cloth, 0.9) : style.cloth);
  const wallColor = (t: number, v: number, n: number) => {
    if (v < 0.12) return mix(style.cloth, 0x000000, 0.28);
    if (v > 0.78 && v < 0.9) return style.lining;
    if (v >= 0.9) return shade(style.cloth, 0.7);
    return stripe(t, n * 4);
  };
  // Walls: they bow out between the poles and flare at the pegged hem.
  const bow = (t: number, n: number, v: number) => 1.6 * Math.abs(Math.sin(Math.PI * n * t)) * Math.sin(Math.PI * Math.min(1, v * 1.2)) + 2.5 * v * v;
  clothMesh(ctx, box, (u, v) => ({ p: p1 + bow(u, endBays, v), q: q0 + (q1 - q0) * u, z: eaveZ(u, endBays) * (1 - v) }), {
    nu: 16, nv: 8, color: (u, v) => wallColor(u, v, endBays),
  });
  clothMesh(ctx, box, (u, v) => ({ p: p0 + (p1 - p0) * u, q: q0 - bow(u, bays, v), z: eaveZ(u, bays) * (1 - v) }), {
    nu: 24, nv: 8, color: (u, v) => wallColor(u, v, bays),
  });
  hemTrim(ctx, box, (t) => ({ p: p0 + (p1 - p0) * t, q: q0 - 2.4, z: 4.6 }), style.trim);
  doorway(ctx, box, (p0 + p1) / 2, q0 - 1, style);

  // Roof: the shaded hip at the right end, then the long sunlit slope.
  const roofColor = (u: number, v: number, n: number) => {
    if (v > 0.9) return style.lining;
    return stripe(u, n * 4);
  };
  const sagAcross = (v: number) => 2.5 * Math.sin(Math.PI * v);
  clothMesh(ctx, box, (u, v) => {
    const pt = lerp3(ridge(1), endEave(u), v);
    return { ...pt, z: pt.z - sagAcross(v) - 1.2 * Math.abs(Math.sin(Math.PI * endBays * u)) * v };
  }, { nu: 12, nv: 8, color: (u, v) => roofColor(u, v, endBays) });
  clothMesh(ctx, box, (u, v) => {
    const pt = lerp3(ridge(u), frontEave(u), v);
    return { ...pt, z: pt.z - sagAcross(v) - 1.4 * Math.pow(Math.sin(Math.PI * bays * 2 * u), 2) * v };
  }, { nu: 30, nv: 9, color: (u, v) => roofColor(u, v, bays) });

  // Trim along the ridge and down the hip, and the valance under the eaves.
  ctx.strokeStyle = css(shade(style.trim, 1.1));
  ctx.lineWidth = 1.5;
  worldLine(ctx, box, [...Array.from({ length: 13 }, (_, i) => ridge(i / 12)), endEave(0)]);
  const eaveRun = (f: (t: number) => WorldPt, n: number) => Array.from({ length: n * 3 + 1 }, (_, i) => f(i / (n * 3)));
  valance(ctx, box, eaveRun(frontEave, bays), 3, mix(style.cloth, 0x000000, 0.2), style.trim);
  valance(ctx, box, eaveRun(endEave, endBays), 3, shade(mix(style.cloth, 0x000000, 0.2), 0.75), style.trim);
  for (const t of [0, 1]) finial(ctx, toScreen(box, { ...ridge(t), z: ridge(t).z + 0.5 }));

  if (style.awning) awning(ctx, box, (p0 + p1) / 2, q0 - 2.5, style);
  frontLife(ctx, box, (p0 + p1) / 2, q0, style);
  guyRopes(ctx, box, frontEave, endEave, bays, endBays, q0, p1, 'front');
}

function hemTrim(ctx: Ctx, box: IsoBox, f: (t: number) => WorldPt, trim: number): void {
  ctx.fillStyle = css(trim);
  for (let t = 0.01; t < 1; t += 0.035) {
    const s = toScreen(box, f(t));
    ctx.beginPath();
    ctx.moveTo(s.x, s.y - 1.6);
    ctx.lineTo(s.x + 1.6, s.y);
    ctx.lineTo(s.x, s.y + 1.6);
    ctx.lineTo(s.x - 1.6, s.y);
    ctx.closePath();
    ctx.fill();
  }
}

/** The door: a person-high opening with its flaps tied back on their pale lining, a lamp within. */
function doorway(ctx: Ctx, box: IsoBox, pc: number, q: number, style: TentStyle): void {
  const at = (p: number, z: number) => toScreen(box, { p, q: q - (z < 6 ? 2.5 * (1 - z / 6) : 0), z });
  const half = 8;
  const top = 35;
  const opening = [at(pc - half, 0), at(pc - 2, top), at(pc + 2, top), at(pc + half, 0)];
  ctx.fillStyle = css(0x1e140c);
  ctx.beginPath();
  opening.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  const mid = at(pc, 8);
  glow(ctx, mid.x + 2, mid.y, 13, 0xffc070, 0.6);
  // Carpet on the floor within.
  const c0 = at(pc - half, 0);
  const c1 = at(pc + half, 0);
  ctx.fillStyle = css(0x7f2a2a);
  ctx.beginPath();
  ctx.moveTo(c0.x, c0.y);
  ctx.lineTo(c1.x, c1.y);
  ctx.lineTo(c1.x + 6, c1.y - 6);
  ctx.lineTo(c0.x + 6, c0.y - 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  for (const side of [-1, 1]) {
    const peak = at(pc + side * 2, top);
    const tie = at(pc + side * (half + 1), top * 0.45);
    const hem = at(pc + side * (half + 4), 0);
    const inner = at(pc + side * half, 0);
    ctx.fillStyle = css(shade(style.lining, side < 0 ? 1 : 0.85));
    ctx.beginPath();
    ctx.moveTo(peak.x, peak.y);
    ctx.quadraticCurveTo(tie.x + side * 2, tie.y - 4, tie.x, tie.y);
    ctx.quadraticCurveTo(hem.x, hem.y - 6, hem.x, hem.y);
    ctx.lineTo(inner.x, inner.y);
    ctx.quadraticCurveTo(tie.x - side * 2, tie.y + 2, peak.x, peak.y);
    ctx.fill();
    ctx.fillStyle = css(style.trim);
    ctx.fillRect(tie.x - 1, tie.y - 0.5, 2.2, 1.6);
  }
}

/** A flat cloth awning on two poles, sagging between them and lifting at the free edge. */
function awning(ctx: Ctx, box: IsoBox, pc: number, q: number, style: TentStyle): void {
  const half = 17;
  const out = 17;
  const inner = (t: number): WorldPt => ({ p: pc - half + 2 * half * t, q, z: EAVE - 3 });
  const outer = (t: number): WorldPt => ({ p: pc - half - 1 + (2 * half + 2) * t, q: q - out, z: 30 - 3.5 * Math.sin(Math.PI * t) });
  // Shade on the ground beneath it.
  const g0 = toScreen(box, { p: pc - half, q: q - 1, z: 0 });
  const g1 = toScreen(box, { p: pc + half, q: q - out - 3, z: 0 });
  ellipseShadow(ctx, (g0.x + g1.x) / 2 + 3, (g0.y + g1.y) / 2, half * 1.15, out * 0.55, 0.22);
  for (const t of [0, 1]) {
    const foot = toScreen(box, { ...outer(t), z: 0 });
    post(ctx, foot.x, foot.y, outer(t).z + 4, 1.8, POLE);
  }
  clothMesh(ctx, box, (u, v) => {
    const pt = lerp3(inner(u), outer(u), v);
    return { ...pt, z: pt.z - 1.8 * Math.sin(Math.PI * v) * (0.6 + 0.4 * Math.sin(Math.PI * u)) };
  }, {
    nu: 10, nv: 5,
    color: (u, v) => (v > 0.82 ? style.lining : Math.floor(u * 6) % 2 ? style.trim : style.cloth),
  });
  valance(ctx, box, Array.from({ length: 7 }, (_, i) => outer(i / 6)), 2.5, mix(style.cloth, 0x000000, 0.2), style.trim);
  for (const t of [0, 1]) finial(ctx, toScreen(box, { ...outer(t), z: outer(t).z + 3 }), 0.7);
}

/** A carpet before the door, a brass ewer and a pair of slippers. */
function frontLife(ctx: Ctx, box: IsoBox, pc: number, q: number, style: TentStyle): void {
  const rand = rng(style.seed + 3);
  const rug = [toScreen(box, { p: pc - 12, q: q - 4, z: 0 }), toScreen(box, { p: pc + 12, q: q - 4, z: 0 }), toScreen(box, { p: pc + 12, q: q - 16, z: 0 }), toScreen(box, { p: pc - 12, q: q - 16, z: 0 })];
  ctx.fillStyle = css(0x8a2a28);
  ctx.beginPath();
  rug.forEach((s, i) => (i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0xd8b870, 0.8);
  ctx.lineWidth = 0.7;
  ctx.stroke();
  for (let i = 0; i < 18; i++) {
    const s = toScreen(box, { p: pc - 10 + rand() * 20, q: q - 6 - rand() * 8, z: 0 });
    ctx.fillStyle = rand() < 0.5 ? 'rgba(216,184,112,0.6)' : 'rgba(30,40,80,0.5)';
    ctx.fillRect(s.x, s.y, 1.2, 1);
  }
  const slip = toScreen(box, { p: pc + 5, q: q - 5, z: 0 });
  ctx.fillStyle = css(0x2a2018);
  for (const dx of [0, 3]) {
    ctx.beginPath();
    ctx.ellipse(slip.x + dx, slip.y - dx * 0.4, 1.2, 2.3, 1, 0, Math.PI * 2);
    ctx.fill();
  }
  const ewer = toScreen(box, { p: pc - 16, q: q - 4, z: 0 });
  ellipseShadow(ctx, ewer.x + 1, ewer.y, 3.5, 1.4, 0.3);
  const g = ctx.createLinearGradient(ewer.x - 3, 0, ewer.x + 3, 0);
  g.addColorStop(0, '#f0d080');
  g.addColorStop(1, '#8a6020');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(ewer.x - 1, ewer.y - 9);
  ctx.quadraticCurveTo(ewer.x - 4, ewer.y - 4, ewer.x - 2, ewer.y);
  ctx.lineTo(ewer.x + 2, ewer.y);
  ctx.quadraticCurveTo(ewer.x + 4, ewer.y - 4, ewer.x + 1, ewer.y - 9);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a8802a';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(ewer.x + 2.5, ewer.y - 4);
  ctx.quadraticCurveTo(ewer.x + 6, ewer.y - 7, ewer.x + 5, ewer.y - 10);
  ctx.stroke();
}

function guyRopes(ctx: Ctx, box: IsoBox, front: (t: number) => WorldPt, end: (t: number) => WorldPt, bays: number, endBays: number, q0: number, p1: number, which: 'front' | 'back'): void {
  ctx.strokeStyle = 'rgba(225,210,175,0.85)';
  ctx.lineWidth = 0.6;
  const ropes: Array<[WorldPt, WorldPt]> = [];
  if (which === 'front') {
    for (let i = 0; i <= bays; i++) {
      if (i === 0 || i === bays) continue;
      const e = front(i / bays);
      ropes.push([e, { p: e.p - 3, q: q0 - 15, z: 0 }]);
    }
    ropes.push([front(1), { p: p1 + 10, q: q0 - 10, z: 0 }]);
  } else {
    for (let i = 1; i < endBays; i++) {
      const e = end(i / endBays);
      ropes.push([e, { p: p1 + 16, q: e.q + 2, z: 0 }]);
    }
    ropes.push([front(0), { p: front(0).p - 8, q: q0 - 12, z: 0 }]);
  }
  for (const [from, to] of ropes) {
    const a = toScreen(box, from);
    const b = toScreen(box, to);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + 2, b.x, b.y);
    ctx.stroke();
    ctx.fillStyle = css(0x4a3020);
    ctx.fillRect(b.x - 0.8, b.y - 2.5, 1.6, 3);
  }
}

function finial(ctx: Ctx, at: { x: number; y: number }, scale = 1): void {
  ctx.strokeStyle = css(POLE);
  ctx.lineWidth = 1.6 * scale;
  ctx.beginPath();
  ctx.moveTo(at.x, at.y);
  ctx.lineTo(at.x, at.y - 7 * scale);
  ctx.stroke();
  const r = 2.2 * scale;
  const g = ctx.createRadialGradient(at.x - 0.8, at.y - 8.5 * scale, 0.3, at.x, at.y - 8 * scale, r + 0.2);
  g.addColorStop(0, '#fff0b0');
  g.addColorStop(1, '#a8802a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(at.x, at.y - 8 * scale, r, 0, Math.PI * 2);
  ctx.fill();
}
