import { css, rng } from './canvasKit';
import { archPath } from './ornaments';
import type { DawnLayout } from './dawnLayout';
import { faceGradient, grain, isAccent, rimFace, rimStroke, sunSide, tone, type DawnPass } from './dawnPass';
import { minaret, parapet } from './dawnShapes';

/**
 * The city wall of Shíráz: rammed earth and mud brick with rounded
 * merlons, round bastions at intervals, and a gate under a tiled portal
 * between two taller towers, its lamps still burning before dawn.
 */

const WALL = 0xb88f62;

export interface TowerSpec {
  cx: number;
  top: number;
  base: number;
  r: number;
  color: number;
  depth: number;
  /** Fired-brick lozenges, as on the citadel's towers. */
  lozenges?: boolean;
}

/** A round tower: shaded like a drum, crowned with merlons. */
export function roundTower(p: DawnPass, t: TowerSpec): void {
  const { ctx, k } = p;
  const side = sunSide(p, t.cx);
  if (isAccent(p)) ctx.fillStyle = '#000';
  else {
    const g = ctx.createLinearGradient(t.cx - t.r, 0, t.cx + t.r, 0);
    g.addColorStop(0, tone(p, t.color, side > 0 ? 0.68 : 1.08, t.depth));
    g.addColorStop(0.5, tone(p, t.color, 0.92, t.depth));
    g.addColorStop(1, tone(p, t.color, side > 0 ? 1.08 : 0.68, t.depth));
    ctx.fillStyle = g;
  }
  ctx.fillRect(t.cx - t.r, t.top, t.r * 2, t.base - t.top);
  if (!isAccent(p)) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(t.cx - t.r, t.top, t.r * 2, t.base - t.top);
    ctx.clip();
    grain(p, t.cx - t.r, t.top, t.r * 2, t.base - t.top, t.color, t.depth, Math.round(t.cx * 3), 0.8);
    if (t.lozenges) {
      ctx.globalAlpha = p.mode === 'day' ? 0.35 : 0.25;
      ctx.fillStyle = tone(p, 0x6a4a30, 1, t.depth);
      const s = 4 * k;
      for (let y = t.top + 6 * k; y < t.base - 4 * k; y += s * 1.6) {
        for (let x = t.cx - t.r + ((y / (s * 1.6)) % 2) * s; x < t.cx + t.r; x += s * 2) {
          ctx.beginPath();
          ctx.moveTo(x, y - s * 0.7);
          ctx.lineTo(x + s * 0.5, y);
          ctx.lineTo(x, y + s * 0.7);
          ctx.lineTo(x - s * 0.5, y);
          ctx.closePath();
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }
    // Arrow slits.
    ctx.fillStyle = tone(p, 0x1c140e, 1, t.depth);
    for (let y = t.top + 10 * k; y < t.base - 10 * k; y += 16 * k) ctx.fillRect(t.cx - 0.8 * k, y, 1.6 * k, 5 * k);
    ctx.restore();
  }
  rimFace(p, side > 0 ? t.cx + t.r * 0.35 : t.cx - t.r, t.top, t.r * 0.65, t.base - t.top, 0.6);
  parapet(p, t.cx - t.r - 1.5 * k, t.top, t.r * 2 + 3 * k, t.color, t.depth, 'kungura');
  rimStroke(p, [{ x: t.cx + side * t.r, y: t.base - (t.base - t.top) * 0.5 }, { x: t.cx + side * t.r, y: t.top }], 0.8, t.depth);
}

export interface PortalSpec {
  cx: number;
  base: number;
  w: number;
  h: number;
  color: number;
  depth: number;
  /** Glaze for the spandrels and the inscription band. */
  tile: number;
  /** A pair of short minarets on the portal's shoulders. */
  minarets?: boolean;
  /** A lamp burning in the arch before dawn. */
  lamp?: boolean;
}

/** A pīshṭāq: a tall rectangular frame around a pointed arch, faced with tile. */
export function iwanPortal(p: DawnPass, s: PortalSpec): void {
  const { ctx, k } = p;
  const x = s.cx - s.w / 2;
  const top = s.base - s.h;
  if (s.minarets) {
    for (const dx of [-s.w / 2 + 3 * k, s.w / 2 - 3 * k]) {
      minaret(p, { cx: s.cx + dx, base: top + 6 * k, h: 40 * k, r: 2.6 * k, color: s.color, depth: s.depth, bands: s.tile });
    }
  }
  ctx.fillStyle = faceGradient(p, top, s.base, s.color, 0.95, s.depth);
  ctx.fillRect(x, top, s.w, s.h);
  parapet(p, x, top, s.w, s.color, s.depth, 'kungura');
  const archW = s.w * 0.58;
  const archH = s.h * 0.74;
  const ax = s.cx - archW / 2;
  if (!isAccent(p)) {
    // Tile panel and inscription band.
    ctx.fillStyle = tone(p, s.tile, 0.95, s.depth);
    ctx.fillRect(x + s.w * 0.1, top + s.h * 0.06, s.w * 0.8, s.h * 0.9);
    ctx.fillStyle = tone(p, 0xe4d7b0, 1, s.depth);
    ctx.fillRect(x + s.w * 0.1, top + s.h * 0.06, s.w * 0.8, 1.2 * k);
    ctx.fillStyle = tone(p, 0x1d3f8a, 1, s.depth);
    ctx.fillRect(x + s.w * 0.14, top + s.h * 0.1, s.w * 0.72, 3 * k);
    archPath(ctx, ax - 2 * k, s.base, archW + 4 * k, archH + 2 * k);
    ctx.fillStyle = tone(p, s.color, 1.05, s.depth);
    ctx.fill();
  }
  archPath(ctx, ax, s.base, archW, archH);
  ctx.fillStyle = isAccent(p) ? '#000' : tone(p, 0x241a14, 1, s.depth);
  ctx.fill();
  if (s.lamp && p.mode === 'lamp') {
    const ly = s.base - archH * 0.5;
    const g = ctx.createRadialGradient(s.cx, ly, 0, s.cx, ly, archW * 0.9);
    g.addColorStop(0, css(0xffb060, 0.45));
    g.addColorStop(1, css(0xff8a30, 0));
    ctx.save();
    archPath(ctx, ax, s.base, archW, archH);
    ctx.clip();
    ctx.fillStyle = g;
    ctx.fillRect(ax, s.base - archH, archW, archH);
    ctx.restore();
    ctx.fillStyle = css(0xffe0a0);
    ctx.beginPath();
    ctx.arc(s.cx, ly - archH * 0.12, 1.6 * k, 0, Math.PI * 2);
    ctx.fill();
  }
  const side = sunSide(p, s.cx);
  rimStroke(p, [{ x: s.cx + side * s.w / 2, y: s.base - s.h * 0.5 }, { x: s.cx + side * s.w / 2, y: top }], 0.8, s.depth);
}

/** The wall, its bastions and its gate. */
export function paintWall(p: DawnPass, L: DawnLayout): void {
  const { ctx, k } = p;
  const depth = 0.16;
  const top = L.wallTop;
  const base = L.wallBase;
  ctx.fillStyle = faceGradient(p, top, base, WALL, 0.9, depth);
  ctx.fillRect(-2, top, L.width + 4, base - top);
  if (!isAccent(p)) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, top, L.width, base - top);
    ctx.clip();
    grain(p, 0, top, L.width, base - top, WALL, depth, 0x3a11, 0.9);
    // Courses of rammed earth (chīneh), each a little uneven.
    const rand = rng(0xc41e);
    ctx.lineWidth = 1;
    for (let y = top + 7 * k; y < base - 2; y += 7 * k) {
      ctx.strokeStyle = tone(p, WALL, 0.7, depth);
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= L.width; x += 40) ctx.lineTo(x, y + (rand() - 0.5) * 1.4);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Erosion streaks below the merlons.
    for (let x = rand() * 30; x < L.width; x += 14 + rand() * 30) {
      ctx.fillStyle = tone(p, WALL, 0.72, depth);
      ctx.globalAlpha = 0.25;
      ctx.fillRect(x, top, 1.5 * k, (6 + rand() * 14) * k);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }
  parapet(p, -2, top, L.width + 4, WALL, depth, 'kungura');
  // Bastions, keeping clear of the gate.
  const spacing = 128 * k;
  for (let x = (L.gateX % spacing) - spacing / 2; x < L.width + spacing; x += spacing) {
    if (Math.abs(x - L.gateX) < spacing * 0.6) continue;
    roundTower(p, { cx: x, top: top - 11 * k, base: base + 2 * k, r: 14 * k, color: WALL, depth: depth - 0.02 });
  }
  gate(p, L);
  // The wall's foot in shadow where it meets the ground.
  if (!isAccent(p)) {
    const g = ctx.createLinearGradient(0, base - 8 * k, 0, base);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, p.mode === 'day' ? 'rgba(40,25,12,0.35)' : 'rgba(0,0,0,0.4)');
    ctx.fillStyle = g;
    ctx.fillRect(0, base - 8 * k, L.width, 8 * k);
  }
}

function gate(p: DawnPass, L: DawnLayout): void {
  const { ctx, k } = p;
  const depth = 0.12;
  const cx = L.gateX;
  const w = 58 * k;
  for (const dx of [-w / 2 - 9 * k, w / 2 + 9 * k]) {
    roundTower(p, { cx: cx + dx, top: L.wallTop - 26 * k, base: L.wallBase + 3 * k, r: 17 * k, color: WALL, depth });
  }
  iwanPortal(p, { cx, base: L.wallBase, w, h: L.wallBase - L.wallTop + 34 * k, color: 0xc29a6c, depth: depth - 0.02, tile: 0x2f9ea4, lamp: true });
  // Hanging lanterns either side of the arch.
  for (const dx of [-w * 0.36, w * 0.36]) {
    const lx = cx + dx;
    const ly = L.wallBase - 26 * k;
    if (p.mode === 'lamp') {
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 11 * k);
      g.addColorStop(0, css(0xffd890, 0.9));
      g.addColorStop(0.15, css(0xffa850, 0.4));
      g.addColorStop(1, css(0xff8a30, 0));
      ctx.fillStyle = g;
      ctx.fillRect(lx - 11 * k, ly - 11 * k, 22 * k, 22 * k);
    } else if (p.mode !== 'rim') {
      ctx.fillStyle = tone(p, 0x3a2a1a, 1, depth);
      ctx.fillRect(lx - 1.5 * k, ly - 3 * k, 3 * k, 5 * k);
    }
  }
}
