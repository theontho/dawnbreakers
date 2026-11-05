import { css, rng } from '../../canvasKit';
import { faceGradient, isAccent, rimStroke, tone, type DawnPass } from '../../dawnPass';
import { block, dome } from '../../dawnShapes';
import { roundTower } from '../../dawnWall';
import { archPath } from '../../ornaments';

/**
 * Larger pieces several vistas share: an arcade of arches under a row of
 * small domes, a long bridge of stacked arches over water, a fort of walls
 * and towers, a tent, and the Kaʿba under its black cloth.
 */

export interface ArcadeSpec {
  x0: number;
  x1: number;
  base: number;
  h: number;
  color: number;
  depth: number;
  /** Width of one bay, in pixels. */
  bay: number;
  /** A small dome over each bay. */
  domes?: boolean;
  seed: number;
}

/** A colonnade of pointed arches, as round a mosque's court. */
export function arcade(p: DawnPass, a: ArcadeSpec): void {
  const { ctx } = p;
  const top = a.base - a.h;
  if (a.domes) {
    for (let x = a.x0 + a.bay / 2; x < a.x1; x += a.bay) dome(p, { cx: x, base: top, r: a.bay * 0.42, color: a.color, depth: a.depth, bulb: 0.8 });
  }
  block(p, { x: a.x0, top, w: a.x1 - a.x0, base: a.base, color: a.color, depth: a.depth, seed: a.seed, parapet: 'plain' });
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, 0x2a2018, 1, a.depth);
  for (let x = a.x0 + a.bay * 0.15; x + a.bay * 0.7 <= a.x1; x += a.bay) {
    archPath(ctx, x, a.base, a.bay * 0.7, a.h * 0.7);
    ctx.fill();
  }
}

export interface BridgeSpec {
  x0: number;
  x1: number;
  /** Water line and the top of the parapet. */
  base: number;
  top: number;
  color: number;
  depth: number;
  /** Number of arches across. */
  arches: number;
}

/** A long brick bridge on two tiers of arches, as at Iṣfahán, its reflection broken in the water. */
export function bridge(p: DawnPass, b: BridgeSpec): void {
  const { ctx, k } = p;
  const w = b.x1 - b.x0;
  const h = b.base - b.top;
  ctx.fillStyle = faceGradient(p, b.top, b.base, b.color, 0.95, b.depth);
  ctx.fillRect(b.x0, b.top, w, h);
  const bay = w / b.arches;
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, 0x241a14, 1, b.depth);
  for (let i = 0; i < b.arches; i++) {
    const x = b.x0 + i * bay;
    archPath(ctx, x + bay * 0.18, b.base, bay * 0.64, h * 0.5);
    ctx.fill();
    // The upper gallery of small arches.
    for (const f of [0.12, 0.56]) {
      archPath(ctx, x + bay * f, b.top + h * 0.42, bay * 0.3, h * 0.28);
      ctx.fill();
    }
  }
  rimStroke(p, [{ x: b.x0, y: b.top }, { x: b.x1, y: b.top }], 0.8, b.depth);
  if (p.mode === 'day' || p.mode === 'night') {
    // Its reflection, broken by the current.
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = tone(p, b.color, 0.7, b.depth);
    const rand = rng(Math.round(b.x0 + b.base));
    for (let y = b.base + 1; y < b.base + h * 0.6; y += 2 * k) {
      ctx.fillRect(b.x0 + (rand() - 0.5) * 6 * k, y, w, k);
    }
    ctx.globalAlpha = 1;
  }
}

export interface FortSpec {
  x0: number;
  x1: number;
  /** Foot of the walls and their top. */
  base: number;
  top: number;
  color: number;
  depth: number;
  towers: number;
  seed: number;
  /** A keep standing up inside the walls, at this x. */
  keep?: number;
}

/** A fort: a long wall with round towers at its ends and along it, and perhaps a keep behind. */
export function fort(p: DawnPass, f: FortSpec): void {
  const { k } = p;
  if (f.keep !== undefined) {
    block(p, { x: f.keep - 18 * k, top: f.top - 30 * k, w: 36 * k, base: f.base, color: f.color, depth: f.depth + 0.02, seed: f.seed + 1, parapet: 'kungura', windows: 2, lit: 0.6 });
  }
  block(p, { x: f.x0, top: f.top, w: f.x1 - f.x0, base: f.base, color: f.color, depth: f.depth, seed: f.seed, parapet: 'kungura' });
  for (let i = 0; i < f.towers; i++) {
    const cx = f.x0 + ((f.x1 - f.x0) * i) / Math.max(1, f.towers - 1);
    roundTower(p, { cx, top: f.top - 9 * k, base: f.base, r: 8 * k, color: f.color, depth: f.depth - 0.01 });
  }
}

/** A tent: a ridge pole and sloping cloth, striped or plain, with a dark doorway. */
export function tent(p: DawnPass, x: number, base: number, w: number, h: number, color: number, depth: number, stripes?: number): void {
  const { ctx, k } = p;
  const shape = (): void => {
    ctx.beginPath();
    ctx.moveTo(x - w / 2, base);
    ctx.lineTo(x - w * 0.32, base - h);
    ctx.lineTo(x + w * 0.32, base - h);
    ctx.lineTo(x + w / 2, base);
    ctx.closePath();
  };
  shape();
  ctx.fillStyle = faceGradient(p, base - h, base, color, 1, depth);
  ctx.fill();
  if (!isAccent(p)) {
    if (stripes !== undefined) {
      ctx.save();
      shape();
      ctx.clip();
      ctx.fillStyle = tone(p, stripes, 1, depth);
      for (let u = x - w / 2; u < x + w / 2; u += 6 * k) ctx.fillRect(u, base - h, 2.4 * k, h);
      ctx.restore();
    }
    ctx.fillStyle = tone(p, 0x2a1d14, 1, depth);
    ctx.fillRect(x - w * 0.08, base - h * 0.55, w * 0.16, h * 0.55);
  }
  rimStroke(p, [{ x: x - w * 0.32, y: base - h }, { x: x + w * 0.32, y: base - h }], 0.8, depth);
}

/** The Kaʿba: a plain cube under its black covering, with the gold-embroidered band round its upper part. */
export function kaaba(p: DawnPass, cx: number, base: number, size: number, depth: number): void {
  const { ctx, k } = p;
  const x = cx - size / 2;
  const top = base - size * 1.05;
  ctx.fillStyle = isAccent(p) ? '#000' : css(p.mode === 'day' ? 0x1c1a1c : 0x0c0b10);
  ctx.fillRect(x, top, size, base - top);
  if (!isAccent(p)) {
    ctx.fillStyle = tone(p, 0xc8a048, 1.1, depth);
    ctx.fillRect(x, top + size * 0.22, size, Math.max(1.5 * k, size * 0.07));
  }
  rimStroke(p, [{ x, y: top }, { x: x + size, y: top }], 0.9, depth);
}
