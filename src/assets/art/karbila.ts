import { css, footprintBox, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow, litGradient } from './fieldKit';
import { glazedTiles } from './materials';
import { band, cylinder, cylinderBand, dome, walls } from './ornaments';

/**
 * The country of the shrine cities of ʿIráq: the date palm of the Euphrates
 * groves, a small flock of the desert's fat-tailed sheep, and the gilded
 * dome of a great shrine seen from a long way off over the roofs. Drawn for
 * The Forerunners (Karbilá and Kúfih, 1843 to 1844) and shared with any
 * chapter set in Karbilá, Najaf or Kúfih.
 */

/** Where a one-cell prop stands: its cell centre is this far above the texture's foot. */
const FOOT = 16;

export interface PalmStyle {
  /** Height to the top of the trunk, in px (a metre is about 23 px). */
  height: number;
  /** How far the crown sways off the foot, left or right. */
  lean: number;
  /** Frond length. */
  spread: number;
  leaf: number;
  seed: number;
}

/** Texture size for a palm of this style. */
export function palmSize(s: PalmStyle): { w: number; h: number } {
  return { w: Math.ceil(s.spread * 2 + Math.abs(s.lean) * 2 + 24), h: Math.ceil(s.height + s.spread * 0.7 + FOOT + 8) };
}

/**
 * The date palm: a slender ringed trunk with a slight sway, the stubs of cut
 * fronds patterning it in diamonds, a few dead fronds hanging grey beneath a
 * crown of long arching feathered fronds.
 */
export function drawDatePalm(ctx: Ctx, w: number, h: number, s: PalmStyle): void {
  const rand = rng(s.seed);
  const cx = w / 2;
  const ground = h - FOOT;
  const top = { x: cx + s.lean, y: ground - s.height };
  ellipseShadow(ctx, cx + s.spread * 0.25, ground + 2, s.spread * 0.6, s.spread * 0.2, 0.22);
  // Fronds round the crown, sorted back to front so the near ones overlap the trunk's top.
  const fronds = Array.from({ length: 17 }, (_, i) => {
    const a = (i / 17) * Math.PI * 2 + rand() * 0.25;
    return { a, len: s.spread * (0.78 + rand() * 0.3), droop: 0.35 + rand() * 0.35, seed: s.seed + i * 13 };
  });
  const back = fronds.filter(f => Math.sin(f.a) < 0);
  const front = fronds.filter(f => Math.sin(f.a) >= 0);
  // Dead fronds hang under the crown, grey and broken.
  for (let i = 0; i < 5; i++) {
    const a = Math.PI * (0.1 + i * 0.2) + rand() * 0.2;
    frond(ctx, top.x, top.y + 6, a, s.spread * 0.55, 1.6, 0x8a7a5c, s.seed + 90 + i, 0.75);
  }
  back.forEach(f => frond(ctx, top.x, top.y, f.a, f.len, f.droop, shade(s.leaf, 0.72), f.seed, 1));
  trunk(ctx, cx, ground, top, s);
  front.sort((a, b) => Math.sin(a.a) - Math.sin(b.a)).forEach(f => frond(ctx, top.x, top.y, f.a, f.len, f.droop, s.leaf, f.seed, 1));
  // The heart of the crown, where the young fronds stand up.
  ctx.fillStyle = litGradient(ctx, top.x, top.y - 2, 7, shade(s.leaf, 1.1));
  ctx.beginPath();
  ctx.ellipse(top.x, top.y - 2, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** The ringed trunk from the foot up to the crown, swaying on a gentle curve. */
function trunk(ctx: Ctx, cx: number, ground: number, top: { x: number; y: number }, s: PalmStyle): void {
  const bark = 0x7a6448;
  const ctrl = { x: cx + s.lean * 0.15, y: ground - s.height * 0.55 };
  const at = (t: number) => ({
    x: (1 - t) ** 2 * cx + 2 * (1 - t) * t * ctrl.x + t * t * top.x,
    y: (1 - t) ** 2 * ground + 2 * (1 - t) * t * ctrl.y + t * t * top.y,
  });
  const steps = Math.ceil(s.height / 4);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = at(t);
    const r = 5.2 - t * 1.4 + (i === 0 ? 1.5 : 0);
    const g = ctx.createLinearGradient(p.x - r, 0, p.x + r, 0);
    g.addColorStop(0, css(shade(bark, 1.2)));
    g.addColorStop(0.4, css(bark));
    g.addColorStop(1, css(shade(bark, 0.5)));
    ctx.fillStyle = g;
    ctx.fillRect(p.x - r, p.y - 4.5, r * 2, 5);
    // The stubs of old frond bases, alternating, so the trunk reads as woven diamonds.
    if (i % 2 === 0) {
      ctx.fillStyle = css(shade(bark, 0.62), 0.8);
      const off = (i / 2) % 2 ? -r * 0.5 : r * 0.5;
      ctx.beginPath();
      ctx.moveTo(p.x + off - 2.4, p.y - 1);
      ctx.lineTo(p.x + off, p.y - 4);
      ctx.lineTo(p.x + off + 2.4, p.y - 1);
      ctx.closePath();
      ctx.fill();
    }
  }
}

/**
 * One frond out from the crown at screen angle `a` (the ground plane is
 * squashed, so fronds toward the camera dip lower), its spine arching up and
 * drooping to the tip, with leaflets along both sides.
 */
function frond(ctx: Ctx, x0: number, y0: number, a: number, len: number, droop: number, leaf: number, seed: number, alpha: number): void {
  const rand = rng(seed);
  const dx = Math.cos(a) * len;
  const dy = Math.sin(a) * len * 0.45;
  const tip = { x: x0 + dx, y: y0 + dy + len * droop };
  const ctrl = { x: x0 + dx * 0.55, y: y0 + dy * 0.55 - len * 0.32 };
  const at = (t: number) => ({
    x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * ctrl.x + t * t * tip.x,
    y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * ctrl.y + t * t * tip.y,
  });
  const lit = Math.cos(a) < 0.2 && Math.sin(a) < 0.6;
  const base = shade(leaf, lit ? 1.12 : 0.9);
  ctx.strokeStyle = css(shade(base, 0.85), alpha);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(ctrl.x, ctrl.y, tip.x, tip.y);
  ctx.stroke();
  ctx.lineWidth = 0.9;
  const n = Math.round(len / 3);
  for (let i = 2; i < n; i++) {
    const t = i / n;
    const p = at(t);
    const q = at(Math.min(1, t + 0.04));
    const ang = Math.atan2(q.y - p.y, q.x - p.x);
    const l = (1 - t * 0.75) * len * 0.2;
    for (const side of [-1, 1]) {
      const la = ang + side * (0.75 + rand() * 0.2);
      ctx.strokeStyle = css(shade(base, side < 0 ? 1.08 : 0.8 + rand() * 0.15), alpha);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(la) * l, p.y + Math.sin(la) * l + l * 0.35);
      ctx.stroke();
    }
  }
}

/** A few fat-tailed sheep grazing close together, about 0.8 m at the shoulder. */
export function drawFlock(ctx: Ctx, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  const ground = h - FOOT;
  const sheep = [
    { x: w * 0.3, y: ground - 4, dir: 1 },
    { x: w * 0.62, y: ground - 8, dir: -1 },
    { x: w * 0.5, y: ground + 4, dir: 1 },
  ].sort((a, b) => a.y - b.y);
  sheep.forEach((p, i) => {
    const wool = i === 1 ? 0x6a5a48 : shade(0xd8ccb4, 0.9 + rand() * 0.15);
    ellipseShadow(ctx, p.x, p.y + 1, 12, 3.5, 0.25);
    // Legs.
    ctx.fillStyle = css(0x3a2e24);
    for (const lx of [-7, -3, 4, 7]) ctx.fillRect(p.x + lx * p.dir, p.y - 7, 1.6, 7);
    // Body and the broad fat tail.
    ctx.fillStyle = litGradient(ctx, p.x, p.y - 12, 10, wool, 0.8);
    ctx.beginPath();
    ctx.ellipse(p.x, p.y - 12, 10, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(p.x - 9 * p.dir, p.y - 10, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Head lowered to graze, with drooping ears.
    const hx = p.x + 11 * p.dir;
    ctx.fillStyle = css(i === 1 ? 0x3a2e24 : 0x5a4636);
    ctx.beginPath();
    ctx.ellipse(hx, p.y - 7, 3.2, 4.4, p.dir * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(hx - 2 * p.dir - 1, p.y - 10, 2, 4);
  });
}

/** Footprint and headroom for the shrine glimpse. */
export const SHRINE_DOME_CELLS = 6;
const SHRINE_BODY = 104;
const SHRINE_PAD = 180;

/** Texture size for the shrine glimpse, and its base box. */
export function shrineDomeBox(): { box: IsoBox; texW: number; texH: number } {
  return footprintBox(SHRINE_DOME_CELLS, SHRINE_DOME_CELLS, SHRINE_BODY, SHRINE_PAD);
}

const GOLD = 0xd9a636;
const TILE = 0x2a7a8a;

/**
 * A great shrine as the town sees it over its own roofs: a tiled mass, a
 * gilded onion dome on a high tiled drum, and two gilded minarets. Never
 * entered in the game; it stands at the back of a map, a long way off.
 */
export function drawShrineDome(ctx: Ctx, box: IsoBox): void {
  // Set back 12 px from every edge of the footprint.
  const body: IsoBox = { x: box.x, y: box.y - 12, w: box.w - 24, d: box.d - 24, h: SHRINE_BODY };
  walls(ctx, body, (c, fw, fh, light) => glazedTiles(c, fw, fh, { base: TILE, light, seed: 71 }, 7), {
    left: (c, fw, _fh, l) => {
      band(c, fw, 8, 6, 0xe8dcc0, l);
      archBays(c, fw, SHRINE_BODY, l);
    },
    right: (c, fw, _fh, l) => {
      band(c, fw, 8, 6, 0xe8dcc0, l);
      archBays(c, fw, SHRINE_BODY, l);
    },
  });
  const centre = roofPoint(body, body.w / 2, body.d / 2);
  // The tiled drum, banded with an inscription in white, and the gilded dome on it.
  cylinder(ctx, centre.x, centre.y, 50, 54, TILE, false);
  cylinderBand(ctx, centre.x, centre.y - 40, 50, 7, 0xe8dcc0);
  cylinderBand(ctx, centre.x, centre.y - 12, 50, 3, GOLD);
  dome(ctx, centre.x, centre.y - 54, 56, { color: GOLD, bulb: 1.22, ribs: true, finial: true });
  glint(ctx, centre.x - 22, centre.y - 120);
  // Two gilded minarets either side of the dome.
  for (const [p, q] of [[body.w * 0.08, body.d * 0.08], [body.w * 0.92, body.d * 0.92]] as const) {
    const at = roofPoint(body, p, q);
    goldMinaret(ctx, at.x, at.y + 6, 8, 236);
  }
}

/** Shallow pointed bays across a tiled face. */
function archBays(c: Ctx, fw: number, fh: number, l: number): void {
  const n = Math.max(2, Math.round(fw / 34));
  for (let i = 0; i < n; i++) {
    const u = ((i + 0.5) / n) * fw;
    const bw = (fw / n) * 0.62;
    c.fillStyle = css(shade(0x1a3a48, l), 0.7);
    c.beginPath();
    c.moveTo(u - bw / 2, fh - 6);
    c.lineTo(u - bw / 2, fh * 0.45);
    c.quadraticCurveTo(u - bw / 2, fh * 0.28, u, fh * 0.22);
    c.quadraticCurveTo(u + bw / 2, fh * 0.28, u + bw / 2, fh * 0.45);
    c.lineTo(u + bw / 2, fh - 6);
    c.closePath();
    c.fill();
    c.strokeStyle = css(shade(GOLD, l), 0.8);
    c.lineWidth = 1.2;
    c.stroke();
  }
}

/** A slim minaret: a tiled shaft, gilded from the balcony up. */
function goldMinaret(ctx: Ctx, x: number, y: number, r: number, h: number): void {
  cylinder(ctx, x, y, r, h * 0.62, TILE, false);
  for (const t of [0.2, 0.42]) cylinderBand(ctx, x, y - h * t, r, 4, 0xe8dcc0);
  cylinder(ctx, x, y - h * 0.62, r, h * 0.3, GOLD, false);
  cylinder(ctx, x, y - h * 0.62 + 4, r + 4, 6, shade(GOLD, 0.85), true);
  cylinder(ctx, x, y - h * 0.92 + 4, r + 3, 5, shade(GOLD, 0.85), true);
  cylinder(ctx, x, y - h * 0.92, r - 2, h * 0.06, GOLD, false);
  dome(ctx, x, y - h * 0.98, r - 1, { color: GOLD, bulb: 1.2, finial: true });
}

/** A small hard highlight where the low sun catches the gold. */
function glint(ctx: Ctx, x: number, y: number): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, 14);
  g.addColorStop(0, 'rgba(255,248,220,0.85)');
  g.addColorStop(1, 'rgba(255,248,220,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 14, y - 14, 28, 28);
}
