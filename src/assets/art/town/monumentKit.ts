import { css, mix, shade, type Ctx } from '../canvasKit';
import { glazedTiles } from '../materials';
import { archPath, cylinder, cylinderBand, dome, doorway } from '../ornaments';
import { recess } from '../massing';
import { CREAM, LAPIS, TOWN_DOOR, TURQUOISE } from './townKit';

/**
 * The monumental vocabulary at true scale: a tiled iwan with a person-sized
 * door at the back of its vault, arcades of pointed arches, tile panels with
 * a cream border, and the minaret. All of it paints in face space except the
 * minaret, which stands on a ground point.
 */

export interface IwanSpec {
  wall: number;
  frame: number;
  door: number;
  light: number;
  seed: number;
  /** Glazed tile round the arch (the spandrels inside the alfiz frame). */
  tile?: number;
  /** An open passage instead of a closed door. */
  open?: boolean;
  lantern?: boolean;
}

/** A field of glazed tile clipped to a rectangle, with a cream bead round it. */
export function tilePanel(c: Ctx, x: number, y: number, w: number, h: number, tile: number, l: number, seed: number, cell = 6): void {
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.translate(x, y);
  glazedTiles(c, w, h, { base: tile, light: l, seed }, cell);
  c.restore();
  c.strokeStyle = css(shade(CREAM, l), 0.9);
  c.lineWidth = 1.2;
  c.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
}

/** Small tiers of muqarnas cells hanging in the head of a vault. */
function muqarnas(c: Ctx, cx: number, top: number, w: number, color: number, l: number): void {
  const tiers = Math.max(2, Math.round(w / 18));
  for (let t = 0; t < tiers; t++) {
    const n = t + 2;
    const cw = (w * (0.3 + t * 0.12)) / n;
    const y = top + t * cw * 0.8;
    for (let k = 0; k < n; k++) {
      const x = cx - (n * cw) / 2 + k * cw;
      archPath(c, x + 0.5, y + cw * 0.8, cw - 1, cw * 0.8);
      c.fillStyle = css(shade(color, l * (0.62 + t * 0.08)));
      c.fill();
      c.strokeStyle = css(shade(color, l * 1.1), 0.5);
      c.lineWidth = 0.6;
      c.stroke();
    }
  }
}

/**
 * An iwan: a tall pointed-arch vault cut into a face, framed by an alfiz
 * (rectangular frame) of tile, with muqarnas in its head and a 23 x 48 px
 * door at its back. `w` x `h` is the arch opening; `cx` its centre.
 */
export function townIwan(c: Ctx, cx: number, base: number, w: number, h: number, s: IwanSpec): void {
  const l = s.light;
  const x = cx - w / 2;
  const frame = Math.max(6, w * 0.12);
  if (s.tile !== undefined) {
    tilePanel(c, x - frame, base - h - frame, w + frame * 2, h + frame, s.tile, l, s.seed, Math.max(5, w / 10));
  }
  // The arch's own moulding.
  archPath(c, x - 2.5, base, w + 5, h + 2.5);
  c.fillStyle = css(shade(s.tile !== undefined ? CREAM : s.wall, l * 1.05));
  c.fill();
  // The vault in shadow, lighter toward the floor where daylight reaches.
  archPath(c, x, base, w, h);
  const vault = c.createLinearGradient(0, base - h, 0, base);
  vault.addColorStop(0, css(shade(s.wall, l * 0.32)));
  vault.addColorStop(1, css(shade(s.wall, l * 0.58)));
  c.fillStyle = vault;
  c.fill();
  c.save();
  archPath(c, x, base, w, h);
  c.clip();
  muqarnas(c, cx, base - h + 2, w * 0.86, s.tile !== undefined ? mix(s.tile, CREAM, 0.35) : s.wall, l * 0.85);
  // The back wall, set in by the depth of the vault.
  const inset = w * 0.16;
  const backBase = base - 4;
  const backH = Math.max(TOWN_DOOR.h + 10, h - inset * 2.2);
  archPath(c, x + inset, backBase, w - inset * 2, backH);
  c.fillStyle = css(shade(s.wall, l * 0.64));
  c.fill();
  // The right reveal faces the light; the left stays dark.
  c.fillStyle = css(shade(s.wall, l * 0.84));
  c.beginPath();
  c.moveTo(x + w, base);
  c.lineTo(x + w, base - h * 0.6);
  c.lineTo(x + w - inset, backBase - backH * 0.6);
  c.lineTo(x + w - inset, backBase);
  c.closePath();
  c.fill();
  c.restore();
  // Raised floor and step.
  c.fillStyle = css(shade(0xa89878, l * 0.85));
  c.fillRect(x, backBase, w, 4);
  c.fillStyle = css(shade(0xa89878, l));
  c.fillRect(x - 3, base - 2, w + 6, 2);
  const dw = Math.min(TOWN_DOOR.w, w - inset * 2 - 6);
  if (s.tile !== undefined) {
    tilePanel(c, cx - dw / 2 - 6, backBase - TOWN_DOOR.h - 14, dw + 12, 10, s.tile, l * 0.75, s.seed + 1, 4);
  }
  doorway(c, cx - dw / 2, backBase, dw, TOWN_DOOR.h, { frame: s.frame, door: s.door, light: l * 0.8, open: s.open, seed: s.seed });
  if (s.lantern) {
    const ly = base - h + h * 0.38;
    c.strokeStyle = css(0x2a1a0c, 0.8);
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(cx, base - h + 8);
    c.lineTo(cx, ly);
    c.stroke();
    const g = c.createRadialGradient(cx, ly + 4, 0, cx, ly + 4, 16);
    g.addColorStop(0, 'rgba(255,220,150,0.65)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    c.fillStyle = g;
    c.fillRect(cx - 16, ly - 12, 32, 32);
    c.fillStyle = '#ffd98a';
    c.fillRect(cx - 2.5, ly, 5, 7);
  }
}

export interface ArcadeSpec {
  wall: number;
  light: number;
  /** Bay width (centre to centre) and the arch's clear width and height. */
  bay: number;
  arch: number;
  rise: number;
  /** Where the bays start (centre of the first). */
  offset?: number;
  /** A tile band in each spandrel. */
  tile?: number;
}

/** A row of deep arched bays along a face, their bases on `base`. */
export function arcade(c: Ctx, w: number, base: number, s: ArcadeSpec): void {
  for (let u = s.offset ?? s.bay / 2; u - s.arch / 2 >= 0 && u + s.arch / 2 <= w; u += s.bay) {
    recess(c, u - s.arch / 2, base, s.arch, s.rise, s.wall, s.light);
    if (s.tile !== undefined) {
      c.fillStyle = css(shade(s.tile, s.light), 0.9);
      c.beginPath();
      c.arc(u + s.bay / 2, base - s.rise + 6, 2.5, 0, Math.PI * 2);
      c.fill();
    }
  }
}

/** Shallow blind arches on an outer wall: the arches of the court read through it. */
export function blindArches(c: Ctx, w: number, base: number, bay: number, rise: number, wall: number, l: number): void {
  for (let u = bay / 2; u + bay / 2 <= w + 0.5; u += bay) {
    archPath(c, u - bay * 0.32, base, bay * 0.64, rise);
    c.fillStyle = css(shade(wall, l * 0.8), 0.8);
    c.fill();
    c.strokeStyle = css(shade(wall, l * 1.15), 0.6);
    c.lineWidth = 1;
    c.stroke();
  }
}

/** A band of lapis tile with a white inscription-like ribbon, along the top of a face. */
export function inscriptionBand(c: Ctx, w: number, y: number, h: number, l: number): void {
  c.fillStyle = css(shade(LAPIS, l));
  c.fillRect(0, y, w, h);
  c.strokeStyle = css(shade(0xf2ead6, l), 0.85);
  c.lineWidth = 1;
  c.beginPath();
  for (let u = 2; u < w - 2; u += 7) {
    c.moveTo(u, y + h * 0.75);
    c.lineTo(u, y + h * 0.3);
    c.quadraticCurveTo(u + 2, y + h * 0.2, u + 4, y + h * 0.6);
  }
  c.stroke();
  c.fillStyle = css(shade(CREAM, l));
  c.fillRect(0, y, w, 1);
  c.fillRect(0, y + h - 1, w, 1);
}

/**
 * A minaret on a ground point: a brick shaft banded with tile, a corbelled
 * balcony for the call to prayer, and a small tiled cap.
 */
export function minaret(ctx: Ctx, x: number, y: number, r: number, h: number, brick: number): void {
  cylinder(ctx, x, y, r, h, brick, false);
  // Brick courses read as fine horizontal lines.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - r, y - h, r * 2, h);
  ctx.clip();
  ctx.fillStyle = 'rgba(40,24,10,0.12)';
  for (let k = 6; k < h; k += 4) ctx.fillRect(x - r, y - k, r * 2, 0.8);
  ctx.restore();
  for (const t of [0.3, 0.55, 0.78]) cylinderBand(ctx, x, y - h * t, r, 5, TURQUOISE);
  cylinderBand(ctx, x, y - h * 0.68, r, 9, LAPIS);
  // Balcony on corbels, then the lantern and cap.
  cylinder(ctx, x, y - h + 4, r + 5, 6, shade(brick, 0.9), true);
  cylinder(ctx, x, y - h - 2, r - 2, 18, TURQUOISE, false);
  ctx.fillStyle = 'rgba(20,12,6,0.6)';
  for (const dx of [-0.5, 0, 0.5]) ctx.fillRect(x + dx * r - 1.5, y - h - 15, 3, 9);
  dome(ctx, x, y - h - 20, r - 2, { color: TURQUOISE, bulb: 1.15, finial: true, pattern: CREAM });
}
