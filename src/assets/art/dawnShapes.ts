import { css, rng, shade } from './canvasKit';
import { faceGradient, grain, isAccent, rimFace, rimPath, rimStroke, sunSide, tone, windowOpening, type DawnPass } from './dawnPass';

/**
 * Elevation shapes for the dawn skyline: mud-brick blocks with parapets,
 * Persian domes, minarets, cypresses and plane trees. Everything is seen
 * from the front with the sun behind it, so the sun-facing outline carries
 * the light and a sliver of side wall shows toward the middle of the view.
 */

export type Parapet = 'kungura' | 'plain' | 'stepped';

export interface BlockSpec {
  x: number;
  top: number;
  w: number;
  base: number;
  color: number;
  depth: number;
  seed: number;
  parapet?: Parapet;
  windows?: number;
  /** Chance that a window is lamplit. */
  lit?: number;
  /** Brightness of the face, so neighbouring houses do not all match. */
  light?: number;
}

/** A flat-roofed block: a house, a stretch of wall, the body of a mosque. */
export function block(p: DawnPass, b: BlockSpec): void {
  const { ctx, k } = p;
  const h = b.base - b.top;
  const cx = b.x + b.w / 2;
  const side = sunSide(p, cx);
  // A sliver of the side wall facing the middle of the view.
  const sw = Math.min(b.w * 0.22, Math.abs(cx - p.sunX) * 0.018 * (1 - b.depth)) | 0;
  if (sw >= 1) {
    const sx = side > 0 ? b.x + b.w : b.x - sw;
    ctx.fillStyle = tone(p, b.color, 1.06, b.depth);
    ctx.beginPath();
    ctx.moveTo(sx, b.top + (side > 0 ? 0 : sw * 0.5));
    ctx.lineTo(sx + sw, b.top + (side > 0 ? sw * 0.5 : 0));
    ctx.lineTo(sx + sw, b.base);
    ctx.lineTo(sx, b.base);
    ctx.closePath();
    ctx.fill();
    rimFace(p, sx, b.top, sw, h, 0.9);
  }
  const light = b.light ?? 0.9;
  ctx.fillStyle = faceGradient(p, b.top, b.base, b.color, light, b.depth);
  ctx.fillRect(b.x, b.top, b.w, h);
  if (!isAccent(p)) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.x, b.top, b.w, h);
    ctx.clip();
    grain(p, b.x, b.top, b.w, h, b.color, b.depth, b.seed, 0.7);
    // The coping's shadow under the roof line.
    ctx.fillStyle = tone(p, b.color, light * 0.72, b.depth);
    ctx.globalAlpha = 0.6;
    ctx.fillRect(b.x, b.top, b.w, 2.2 * p.k);
    ctx.restore();
  }
  parapet(p, b.x, b.top, b.w, b.color, b.depth, b.parapet ?? 'plain');
  const edgeX = side > 0 ? b.x + b.w : b.x;
  rimStroke(p, [{ x: edgeX, y: b.base - h * 0.6 }, { x: edgeX, y: b.top }], 0.7, b.depth);
  const rand = rng(b.seed);
  const count = b.windows ?? 0;
  for (let i = 0; i < count; i++) {
    const ww = (2.6 + rand() * 1.4) * k;
    const wh = ww * (1.5 + rand() * 0.5);
    const wx = b.x + (b.w / (count + 1)) * (i + 1) - ww / 2 + (rand() - 0.5) * 3;
    const wy = b.top + 5 * k + rand() * Math.max(1, h * 0.5 - wh);
    if (wy + wh > b.base - 2) continue;
    windowOpening(p, { x: wx, y: wy, w: ww, h: wh, lit: rand() < (b.lit ?? 0), arched: rand() < 0.6, depth: b.depth });
  }
}

/** The coping along a roof line, with Persian stepped or rounded merlons. */
export function parapet(p: DawnPass, x: number, top: number, w: number, color: number, depth: number, kind: Parapet): void {
  const { ctx, k } = p;
  const lip = 2 * k;
  ctx.fillStyle = tone(p, shade(color, 1.06), 1, depth);
  ctx.fillRect(x - 0.5, top - lip, w + 1, lip);
  const outline: Array<{ x: number; y: number }> = [{ x: x - 0.5, y: top - lip }];
  if (kind !== 'plain') {
    const mw = (kind === 'kungura' ? 3.2 : 4) * k;
    const gap = mw * 0.9;
    for (let u = x + gap / 2; u + mw <= x + w; u += mw + gap) {
      const mh = (kind === 'kungura' ? 3.4 : 2.6) * k;
      ctx.beginPath();
      if (kind === 'kungura') {
        ctx.moveTo(u, top - lip);
        ctx.lineTo(u, top - lip - mh * 0.6);
        ctx.quadraticCurveTo(u + mw / 2, top - lip - mh * 1.35, u + mw, top - lip - mh * 0.6);
        ctx.lineTo(u + mw, top - lip);
      } else {
        ctx.rect(u, top - lip - mh, mw, mh);
      }
      ctx.fill();
      outline.push({ x: u, y: top - lip }, { x: u, y: top - lip - mh }, { x: u + mw, y: top - lip - mh }, { x: u + mw, y: top - lip });
    }
  }
  outline.push({ x: x + w + 0.5, y: top - lip });
  rimStroke(p, outline, 1, depth);
}

export interface DomeSpec {
  cx: number;
  base: number;
  r: number;
  color: number;
  depth: number;
  drum?: number;
  /** 1 is a plain dome, 1.3 a Persian onion. */
  bulb?: number;
  /** Glazed tile with a lattice of glaze, as on a shrine. */
  tiled?: boolean;
  finial?: boolean;
}

/** A dome on its drum; the sun-facing flank carries the light. */
export function dome(p: DawnPass, d: DomeSpec): void {
  const { ctx, k } = p;
  const drum = d.drum ?? 0;
  const side = sunSide(p, d.cx);
  if (drum > 0) {
    block(p, { x: d.cx - d.r * 0.96, top: d.base - drum, w: d.r * 1.92, base: d.base, color: d.tiled ? 0xb89a72 : d.color, depth: d.depth, seed: Math.round(d.cx) });
    if (!isAccent(p)) {
      ctx.fillStyle = tone(p, 0x2a1d14, 1, d.depth);
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.ellipse(d.cx + i * d.r * 0.36, d.base - drum * 0.5, d.r * 0.06, drum * 0.24, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  const y0 = d.base - drum;
  const bulb = d.bulb ?? 1;
  const top = y0 - d.r * (0.95 + bulb * 0.45);
  const shape = (): void => {
    ctx.moveTo(d.cx - d.r, y0);
    ctx.bezierCurveTo(d.cx - d.r * bulb, y0 - d.r * 0.8, d.cx - d.r * 0.3, top + d.r * 0.3, d.cx, top);
    ctx.bezierCurveTo(d.cx + d.r * 0.3, top + d.r * 0.3, d.cx + d.r * bulb, y0 - d.r * 0.8, d.cx + d.r, y0);
    ctx.closePath();
  };
  ctx.beginPath();
  shape();
  if (isAccent(p)) {
    ctx.fillStyle = '#000';
  } else {
    const lit = d.cx + side * d.r * 0.45;
    const g = ctx.createRadialGradient(lit, top + d.r * 0.5, d.r * 0.1, d.cx, y0 - d.r * 0.4, d.r * 1.5);
    g.addColorStop(0, tone(p, d.color, 1.25, d.depth));
    g.addColorStop(0.55, tone(p, d.color, 0.95, d.depth));
    g.addColorStop(1, tone(p, d.color, 0.62, d.depth));
    ctx.fillStyle = g;
  }
  ctx.fill();
  if (d.tiled && !isAccent(p)) {
    ctx.save();
    ctx.beginPath();
    shape();
    ctx.clip();
    // Arabesque lattice of yellow and lapis glaze.
    const cell = 4.2 * k;
    for (let y = top; y < y0; y += cell) {
      for (let x = d.cx - d.r * 1.2 + ((y - top) / cell) % 2 * cell * 0.5; x < d.cx + d.r * 1.2; x += cell) {
        ctx.fillStyle = tone(p, 0x1d3f8a, 1, d.depth);
        ctx.globalAlpha = p.mode === 'day' ? 0.55 : 0.4;
        ctx.fillRect(x, y, 1.4 * k, 1.4 * k);
        ctx.fillStyle = tone(p, 0xe8d27a, 1, d.depth);
        ctx.globalAlpha = p.mode === 'day' ? 0.45 : 0.2;
        ctx.fillRect(x + cell * 0.5, y + cell * 0.5, 0.9 * k, 0.9 * k);
      }
    }
    ctx.restore();
  }
  // Light along the flank facing the sun, and a crest along the crown.
  ctx.save();
  ctx.beginPath();
  ctx.rect(side > 0 ? d.cx - d.r * 0.15 : d.cx - d.r * 1.6, top - 4, d.r * 1.75, y0 - top + 4);
  ctx.clip();
  rimPath(p, d.cx + side * d.r * 0.5, shape, 1.15, d.depth);
  ctx.restore();
  if (d.finial) finial(p, d.cx, top, d.depth);
}

/** A gilded finial with a small crescent. */
function finial(p: DawnPass, x: number, y: number, depth: number): void {
  const { ctx, k } = p;
  ctx.strokeStyle = isAccent(p) ? css(0xffcf80, p.mode === 'rim' ? 0.9 : 0) : tone(p, 0xd8b050, 1.1, depth);
  ctx.lineWidth = 1.2 * k;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 6 * k);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y - 3.2 * k, 1.5 * k, 0, Math.PI * 2);
  ctx.stroke();
}

export interface MinaretSpec {
  cx: number;
  base: number;
  h: number;
  r: number;
  color: number;
  depth: number;
  /** Glazed bands in this colour around the shaft. */
  bands?: number;
}

/** A slender minaret with a corbelled balcony and a small domed lantern. */
export function minaret(p: DawnPass, m: MinaretSpec): void {
  const { ctx, k } = p;
  const side = sunSide(p, m.cx);
  const shaft = (x: number, top: number, bottom: number, r: number): void => {
    if (isAccent(p)) ctx.fillStyle = '#000';
    else {
      const g = ctx.createLinearGradient(x - r, 0, x + r, 0);
      const near = side > 0 ? 1.12 : 0.7;
      const far = side > 0 ? 0.7 : 1.12;
      g.addColorStop(0, tone(p, m.color, far, m.depth));
      g.addColorStop(0.5, tone(p, m.color, 0.92, m.depth));
      g.addColorStop(1, tone(p, m.color, near, m.depth));
      ctx.fillStyle = g;
    }
    ctx.beginPath();
    ctx.moveTo(x - r * 1.08, bottom);
    ctx.lineTo(x - r, top);
    ctx.lineTo(x + r, top);
    ctx.lineTo(x + r * 1.08, bottom);
    ctx.closePath();
    ctx.fill();
    rimStroke(p, [{ x: x + side * r * 1.08, y: bottom }, { x: x + side * r, y: top }], 0.9, m.depth);
  };
  const balconyY = m.base - m.h * 0.78;
  shaft(m.cx, balconyY, m.base, m.r);
  if (m.bands !== undefined && !isAccent(p)) {
    for (const f of [0.25, 0.55]) {
      ctx.fillStyle = tone(p, m.bands, 1, m.depth);
      ctx.fillRect(m.cx - m.r * 1.05, m.base - m.h * f, m.r * 2.1, 2.2 * k);
    }
  }
  // Corbelled balcony.
  const br = m.r * 1.7;
  ctx.fillStyle = tone(p, m.color, 0.85, m.depth);
  ctx.beginPath();
  ctx.moveTo(m.cx - m.r, balconyY + 4 * k);
  ctx.lineTo(m.cx - br, balconyY);
  ctx.lineTo(m.cx - br, balconyY - 2.5 * k);
  ctx.lineTo(m.cx + br, balconyY - 2.5 * k);
  ctx.lineTo(m.cx + br, balconyY);
  ctx.lineTo(m.cx + m.r, balconyY + 4 * k);
  ctx.closePath();
  ctx.fill();
  rimStroke(p, [{ x: m.cx - br, y: balconyY - 2.5 * k }, { x: m.cx + br, y: balconyY - 2.5 * k }], 1, m.depth);
  // Lantern stage and its little dome.
  const lanternTop = m.base - m.h;
  shaft(m.cx, lanternTop + m.r * 1.6, balconyY - 2.5 * k, m.r * 0.82);
  dome(p, { cx: m.cx, base: lanternTop + m.r * 1.6, r: m.r * 0.95, color: m.bands ?? m.color, depth: m.depth, bulb: 1.15, finial: true });
}

export interface CypressSpec {
  x: number;
  base: number;
  h: number;
  w: number;
  depth: number;
  lean?: number;
  /** How much of the sunrise its flank catches. */
  rim?: number;
}

const CYPRESS = 0x2c4a32;

/** The Persian cypress: a dark flame, its sun-facing flank edged with light. */
export function cypress(p: DawnPass, c: CypressSpec): void {
  const { ctx } = p;
  const half = c.w / 2;
  const top = c.base - c.h;
  const lean = c.lean ?? 0;
  const shape = (): void => {
    ctx.moveTo(c.x - half * 0.35, c.base);
    ctx.bezierCurveTo(c.x - half * 1.15, c.base - c.h * 0.25, c.x - half * 0.9, top + c.h * 0.4, c.x + lean, top);
    ctx.bezierCurveTo(c.x + half * 0.9 + lean * 0.3, top + c.h * 0.4, c.x + half * 1.15, c.base - c.h * 0.25, c.x + half * 0.35, c.base);
    ctx.closePath();
  };
  ctx.beginPath();
  shape();
  ctx.fillStyle = faceGradient(p, top, c.base, CYPRESS, 1, c.depth);
  ctx.fill();
  if (!isAccent(p) && c.h > 18) {
    // Scalloped tufts.
    const rand = rng(Math.round(c.x * 7 + c.base));
    ctx.save();
    ctx.beginPath();
    shape();
    ctx.clip();
    ctx.lineWidth = 0.8;
    for (let y = top + 3; y < c.base; y += 2.6) {
      const x = c.x - half + rand() * c.w;
      ctx.strokeStyle = tone(p, CYPRESS, rand() < 0.5 ? 1.35 : 0.6, c.depth);
      ctx.beginPath();
      ctx.arc(x, y, 1.6 + rand() * 1.4, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
    ctx.restore();
  }
  const side = sunSide(p, c.x);
  ctx.save();
  ctx.beginPath();
  ctx.rect(side > 0 ? c.x + lean * 0.5 : c.x - c.w * 2, top - 2, c.w * 2, c.h);
  ctx.clip();
  rimPath(p, c.x, shape, c.rim ?? 0.9, c.depth);
  ctx.restore();
}

export interface CrownSpec {
  x: number;
  base: number;
  r: number;
  color: number;
  depth: number;
  seed: number;
  /** Trunk height below the crown. */
  trunk?: number;
  /** How much of the sunrise it catches; low for trees in the wall's shadow. */
  rim?: number;
}

/** A broad tree, a plane (chenār) or an orchard tree, as a clump of leaf masses. */
export function crown(p: DawnPass, t: CrownSpec): void {
  const { ctx } = p;
  const rand = rng(t.seed);
  const trunk = t.trunk ?? t.r * 0.6;
  const cy = t.base - trunk - t.r * 0.7;
  ctx.fillStyle = tone(p, 0x4a3424, 0.8, t.depth);
  ctx.fillRect(t.x - t.r * 0.09, cy, t.r * 0.18, t.base - cy);
  const blobs: Array<{ x: number; y: number; r: number }> = [];
  for (let i = 0; i < 7; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * t.r * 0.55;
    blobs.push({ x: t.x + Math.cos(a) * d * 1.2, y: cy + Math.sin(a) * d * 0.7, r: t.r * (0.42 + rand() * 0.2) });
  }
  blobs.sort((a, b) => a.y - b.y);
  const side = sunSide(p, t.x);
  for (const b of blobs) {
    ctx.fillStyle = tone(p, t.color, 0.82 + rand() * 0.2, t.depth);
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const b of blobs) {
    // Only the crest of each leaf mass toward the sun catches the light.
    const from = side > 0 ? -Math.PI * 0.62 : -Math.PI * 0.95;
    rimPath(p, b.x, () => ctx.arc(b.x, b.y, b.r, from, from + Math.PI * 0.55), t.rim ?? 0.7, t.depth);
  }
}
