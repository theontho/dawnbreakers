import { css, mix, rng, shade, type Ctx } from './canvasKit';
import { brick, glazedTiles, stone } from './materials';
import { archPath, clipped, doorway, latticeWindow, type DoorwayStyle, type WindowStyle } from './ornaments';

/**
 * Facade openings drawn to the scale of a person (see the scale table in
 * docs/content-guide.md): a door is about 14 x 36 px and sits back in a
 * framed recess; windows are small and set high. Everything here paints in
 * face space (u across, v down), inside `walls(...)` decorators.
 */

/** A house door: about a person's height and a little over a third of it wide. */
export const DOOR = { w: 14, h: 36 } as const;

export interface RecessStyle extends DoorwayStyle {
  /** The raised frame round the recess: brick or a paler plaster. */
  surround: number;
  w?: number;
  h?: number;
  /** A strip of glazed tile across the head of the recess. */
  panel?: number;
}

/**
 * A door set back in a framed rectangular recess, the usual Persian street
 * entrance: a raised surround, a shadowed reveal, then the arched door.
 * `cx` is the door's centre and `base` the ground line.
 */
export function recessedDoor(ctx: Ctx, cx: number, base: number, style: RecessStyle): void {
  const w = style.w ?? DOOR.w;
  const h = style.h ?? DOOR.h;
  const l = style.light;
  const fw = w + 12;
  const fx = cx - fw / 2;
  const top = base - h - 12;
  // The surround stands a little proud of the wall and drops a shadow to its right.
  ctx.fillStyle = 'rgba(30,18,8,0.28)';
  ctx.fillRect(fx + fw, top + 1.5, 1.5, base - top - 1.5);
  ctx.fillStyle = css(shade(style.surround, l * 1.04));
  ctx.fillRect(fx, top, fw, base - top);
  ctx.fillStyle = 'rgba(255,240,210,0.3)';
  ctx.fillRect(fx, top, fw, 0.9);
  ctx.fillRect(fx, top, 0.9, base - top);
  // The recess, shaded by its own lintel and left jamb.
  const rx = fx + 2.5;
  const rw = fw - 5;
  const rt = top + 2.5;
  ctx.fillStyle = css(shade(style.surround, l * 0.68));
  ctx.fillRect(rx, rt, rw, base - rt);
  const lintel = ctx.createLinearGradient(0, rt, 0, rt + 5);
  lintel.addColorStop(0, 'rgba(20,12,6,0.45)');
  lintel.addColorStop(1, 'rgba(20,12,6,0)');
  ctx.fillStyle = lintel;
  ctx.fillRect(rx, rt, rw, 5);
  ctx.fillStyle = 'rgba(20,12,6,0.3)';
  ctx.fillRect(rx, rt, 2, base - rt);
  if (style.panel !== undefined) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(rx + 2, rt + 1.5, rw - 4, 4);
    ctx.clip();
    glazedTiles(ctx, rx + rw, rt + 6, { base: style.panel, light: l, seed: style.seed ?? 3 }, 3);
    ctx.restore();
  }
  doorway(ctx, cx - w / 2, base, w, h, style);
}

export interface IwanStyle extends RecessStyle {
  /** The wall colour, darkened for the vault and the back wall. */
  wall: number;
  /** A lantern hanging in the vault. */
  lantern?: boolean;
}

/**
 * An iwan: a deep pointed-arch porch cut into the wall, its vault in
 * shadow, a person-sized door at the back and a raised floor reached by a
 * step. `w` x `h` is the arch opening.
 */
export function iwanNiche(ctx: Ctx, cx: number, base: number, w: number, h: number, style: IwanStyle): void {
  const l = style.light;
  const x = cx - w / 2;
  // Rectangular frame (alfiz) round the arch.
  ctx.fillStyle = 'rgba(30,18,8,0.28)';
  ctx.fillRect(x - 4 + w + 8, base - h - 5, 1.5, h + 5);
  ctx.fillStyle = css(shade(style.surround, l * 1.04));
  ctx.fillRect(x - 4, base - h - 6, w + 8, h + 6);
  ctx.fillStyle = 'rgba(255,240,210,0.3)';
  ctx.fillRect(x - 4, base - h - 6, w + 8, 0.9);
  if (style.panel !== undefined) {
    ctx.save();
    archPath(ctx, x - 2, base, w + 4, h + 2);
    ctx.rect(x - 3, base - h - 5, w + 6, h + 5);
    ctx.clip('evenodd');
    glazedTiles(ctx, x + w + 4, base, { base: style.panel, light: l, seed: style.seed ?? 5 }, 4);
    ctx.restore();
  }
  // The vault: deep shade, lighter toward the floor where daylight reaches.
  archPath(ctx, x, base, w, h);
  const vault = ctx.createLinearGradient(0, base - h, 0, base);
  vault.addColorStop(0, css(shade(style.wall, l * 0.3)));
  vault.addColorStop(1, css(shade(style.wall, l * 0.55)));
  ctx.fillStyle = vault;
  ctx.fill();
  // The back wall, set in by the depth of the porch.
  const inset = Math.max(3, w * 0.16);
  const backBase = base - 3;
  archPath(ctx, x + inset, backBase, w - inset * 2, h - inset * 1.6);
  ctx.fillStyle = css(shade(style.wall, l * 0.6));
  ctx.fill();
  // The right reveal faces the light; the left one stays dark.
  ctx.save();
  archPath(ctx, x, base, w, h);
  ctx.clip();
  ctx.fillStyle = css(shade(style.wall, l * 0.82));
  ctx.beginPath();
  ctx.moveTo(x + w, base);
  ctx.lineTo(x + w, base - h * 0.55);
  ctx.lineTo(x + w - inset, backBase - (h - inset * 1.6) * 0.55);
  ctx.lineTo(x + w - inset, backBase);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // Raised floor and its step.
  ctx.fillStyle = css(shade(0xa89878, l * 0.85));
  ctx.fillRect(x, backBase, w, 3);
  ctx.fillStyle = css(shade(0xa89878, l));
  ctx.fillRect(x - 2, base - 1.5, w + 4, 1.5);
  const dw = Math.min(DOOR.w - 1, w - inset * 2 - 4);
  doorway(ctx, cx - dw / 2, backBase, dw, Math.min(DOOR.h - 3, h - inset * 1.6 - 8), { ...style, light: l * 0.78 });
  if (style.lantern) {
    const ly = base - h + inset + 4;
    ctx.strokeStyle = css(0x2a1a0c, 0.8);
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(cx, base - h + 2);
    ctx.lineTo(cx, ly);
    ctx.stroke();
    const g = ctx.createRadialGradient(cx, ly + 2, 0, cx, ly + 2, 8);
    g.addColorStop(0, 'rgba(255,220,150,0.6)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 8, ly - 6, 16, 16);
    ctx.fillStyle = '#ffd98a';
    ctx.fillRect(cx - 1.2, ly, 2.4, 3);
  }
}

/** A small lattice window with its sill `sill` px above the ground; `x` is its left edge. */
export function highWindow(ctx: Ctx, x: number, faceH: number, sill: number, style: WindowStyle, w = 7, h = 11): void {
  latticeWindow(ctx, x, faceH - sill - h, w, h, style);
}

/** A stone base course along the foot of a wall. */
export function plinth(ctx: Ctx, w: number, faceH: number, height: number, color: number, light: number, seed: number): void {
  clipped(ctx, w, faceH, () => {
    ctx.save();
    ctx.translate(0, faceH - height);
    stone(ctx, w, height, { base: color, light, seed }, height / 2);
    ctx.fillStyle = 'rgba(255,240,210,0.2)';
    ctx.fillRect(0, 0, w, 0.8);
    ctx.restore();
  });
}

/** Where the plaster has fallen away: a ragged patch of the mud brick beneath. */
export function wornPlaster(ctx: Ctx, x: number, y: number, w: number, h: number, color: number, light: number, seed: number): void {
  const rand = rng(seed);
  const n = 11;
  const outline = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const r = 0.55 + rand() * 0.45;
    return { x: x + w / 2 + Math.cos(a) * (w / 2) * r, y: y + h / 2 + Math.sin(a) * (h / 2) * r };
  });
  const trace = (): void => {
    ctx.beginPath();
    outline.forEach((pt, i) => (i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y)));
    ctx.closePath();
  };
  ctx.save();
  trace();
  ctx.clip();
  brick(ctx, x + w, y + h, { base: mix(color, 0x9a6440, 0.45), light: light * 0.9, seed }, 3, 6);
  // The broken plaster edge throws a thin shadow into the hole along its top.
  ctx.strokeStyle = 'rgba(30,18,8,0.45)';
  ctx.lineWidth = 1.6;
  ctx.translate(0.6, 0.8);
  trace();
  ctx.stroke();
  ctx.restore();
}
