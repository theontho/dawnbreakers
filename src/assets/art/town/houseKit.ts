import { css, groundPoint, onRoof, rng, shade, type Ctx, type IsoBox } from '../canvasKit';
import { ellipseShadow } from '../fieldKit';
import { brick, planks } from '../materials';
import { archPath, type WindowStyle } from '../ornaments';
import { sakku, steps, waterJar } from '../streetLife';
import { post, subBox } from '../structureParts';
import { TIMBER, type DoorSpec, type Material } from './townKit';

/**
 * Parts shared by the true-scale town houses: the house's own colours, its
 * door and windows, the coloured-glass sash window of an upper room, the
 * columned talar porch, a timber awning, and the trees that show over a
 * courtyard wall.
 */

export interface TownHouseStyle {
  wall: number;
  door: number;
  frame: number;
  seed: number;
  material?: Material;
  shutters?: number;
  /** Lamplight behind one window. */
  lit?: boolean;
}

export function doorOf(s: TownHouseStyle, light: number, panel?: number): DoorSpec {
  return { frame: s.frame, door: s.door, surround: shade(s.wall, 1.12), light, seed: s.seed, panel };
}

export function windowOf(s: TownHouseStyle, light: number, lit = false, arched = true): WindowStyle {
  return { frame: s.frame, light, shutters: s.shutters, lit: lit && s.lit, arched };
}

/**
 * A door's threshold on the ground in front of a left face: a stone step
 * across the door, with a plastered bench (sakku) on one side.
 */
export function threshold(ctx: Ctx, box: IsoBox, doorP: number, q0: number, s: TownHouseStyle, bench: 'left' | 'right' | 'both' | 'none' = 'none'): void {
  const sides = bench === 'both' ? [-1, 1] : bench === 'left' ? [-1] : bench === 'right' ? [1] : [];
  for (const side of sides) {
    const [b0, b1] = side < 0 ? [doorP - 50, doorP - 22] : [doorP + 22, doorP + 50];
    sakku(ctx, box, b0, b1, Math.max(0, q0 - 10), q0, shade(s.wall, 1.04), s.seed + 5, 14);
  }
  steps(ctx, box, doorP - 17, doorP + 17, Math.max(0, q0 - 8), q0, 1, 'q', 4);
}

/** The same in front of a right face, the door `doorQ` along it. */
export function thresholdRight(ctx: Ctx, box: IsoBox, doorQ: number, p1: number): void {
  steps(ctx, box, p1, Math.min(box.w, p1 + 8), doorQ - 17, doorQ + 17, 1, 'p', 4);
}

/** A water jar by the wall at ground point (p, q). */
export function jarAt(ctx: Ctx, box: IsoBox, p: number, q: number, r = 9): void {
  const at = groundPoint(box, p, q);
  waterJar(ctx, at.x, at.y, r);
}

/**
 * An orosi: a tall sash window of an upper room, its lattice set with red,
 * blue and amber glass. `x`, `y` is its top-left corner in face space.
 */
export function orosi(c: Ctx, x: number, y: number, w: number, h: number, frame: number, l: number, lit = false): void {
  c.fillStyle = 'rgba(20,12,6,0.35)';
  c.fillRect(x + w, y + 2, 2, h);
  c.fillStyle = css(shade(frame, l));
  c.fillRect(x - 3, y - 3, w + 6, h + 6);
  if (lit) {
    const g = c.createRadialGradient(x + w / 2, y + h * 0.6, 1, x + w / 2, y + h * 0.6, h);
    g.addColorStop(0, '#ffe2a0');
    g.addColorStop(1, '#b8642a');
    c.fillStyle = g;
  } else {
    c.fillStyle = css(0x1e1610);
  }
  c.fillRect(x, y, w, h);
  // Coloured panes in the arched head.
  const panes = [0xc83c3c, 0x2e5ca8, 0xe0a83a, 0x3a8a5a];
  const head = h * 0.32;
  for (let i = 0; i < 6; i++) {
    for (let k = 0; k < 3; k++) {
      c.fillStyle = css(shade(panes[(i + k) % panes.length]!, l), lit ? 0.9 : 0.75);
      c.fillRect(x + (i * w) / 6 + 0.6, y + (k * head) / 3 + 0.6, w / 6 - 1.2, head / 3 - 1.2);
    }
  }
  // Sash bars: muntins and the lattice below.
  c.strokeStyle = css(shade(frame, l * 0.9));
  c.lineWidth = 1;
  for (let u = x + w / 3; u < x + w - 1; u += w / 3) {
    c.beginPath();
    c.moveTo(u, y);
    c.lineTo(u, y + h);
    c.stroke();
  }
  c.lineWidth = 0.7;
  for (let v = y + head; v < y + h; v += 4) {
    c.beginPath();
    c.moveTo(x, v);
    c.lineTo(x + w, v);
    c.stroke();
  }
  c.fillStyle = css(shade(0x9a8a70, l));
  c.fillRect(x - 5, y + h + 3, w + 10, 2.5);
}

/**
 * A talar: a deep two-storey porch on slender wooden columns across a
 * face, the hall behind it in shadow with its sash windows lit.
 * `u0`..`u1` spans the opening; it rises from the ground to `top`.
 */
export function talar(c: Ctx, u0: number, u1: number, faceH: number, top: number, frame: number, l: number): void {
  const w = u1 - u0;
  // The deep shadow of the porch and the back wall of the hall.
  const g = c.createLinearGradient(0, top, 0, faceH);
  g.addColorStop(0, css(shade(0x3a2a1a, l)));
  g.addColorStop(1, css(shade(0x6a5236, l)));
  c.fillStyle = g;
  c.fillRect(u0, top, w, faceH - top);
  // Sash windows of the hall at the back.
  for (let i = 0; i < 2; i++) orosi(c, u0 + w * (0.18 + i * 0.42), top + 26, w * 0.22, faceH - top - 50, frame, l * 0.8, i === 0);
  // A painted beam across the head, with a band of carving.
  c.fillStyle = css(shade(TIMBER, l * 1.1));
  c.fillRect(u0 - 3, top, w + 6, 9);
  c.fillStyle = css(shade(0xc8a050, l), 0.8);
  for (let u = u0; u < u1; u += 6) c.fillRect(u + 1, top + 3, 3, 3);
  // Columns standing on stone bases, with flared capitals.
  const cols = Math.max(2, Math.round(w / 48));
  for (let i = 0; i <= cols; i++) {
    const u = u0 + 2 + ((w - 4) * i) / cols;
    const cg = c.createLinearGradient(u - 2.5, 0, u + 2.5, 0);
    cg.addColorStop(0, css(shade(0x8a6038, l * 1.2)));
    cg.addColorStop(1, css(shade(0x5a3a20, l * 0.8)));
    c.fillStyle = cg;
    c.fillRect(u - 2.5, top + 9, 5, faceH - top - 13);
    c.fillStyle = css(shade(0x7a5230, l));
    c.beginPath();
    c.moveTo(u - 6, top + 9);
    c.lineTo(u + 6, top + 9);
    c.lineTo(u + 2.5, top + 17);
    c.lineTo(u - 2.5, top + 17);
    c.closePath();
    c.fill();
    c.fillStyle = css(shade(0x9a8a70, l));
    c.fillRect(u - 4.5, faceH - 6, 9, 5);
  }
  // The raised floor of the porch.
  c.fillStyle = css(shade(0xa89878, l));
  c.fillRect(u0 - 2, faceH - 4, w + 4, 4);
}

/** A row of shallow arched niches along a court face (the doors of the rooms). */
export function courtNiches(c: Ctx, w: number, h: number, l: number, wall: number, frame: number, every = 40): void {
  for (let u = every / 2; u + 14 < w; u += every) {
    archPath(c, u - 13, h - 4, 26, h * 0.62);
    c.fillStyle = css(shade(wall, l * 0.72));
    c.fill();
    archPath(c, u - 8, h - 4, 16, 46);
    c.fillStyle = css(shade(frame, l * 0.75));
    c.fill();
    c.strokeStyle = 'rgba(20,12,6,0.6)';
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(u, h - 4);
    c.lineTo(u, h - 46);
    c.stroke();
  }
}

/**
 * A timber awning on two posts over a door: a reed mat on poles, its front
 * edge `h` px up, standing out from the wall between p0..p1, q0..q1.
 */
export function awningOver(ctx: Ctx, box: IsoBox, p0: number, p1: number, q0: number, q1: number, h: number, seed: number): void {
  for (const p of [p0 + 2, p1 - 2]) {
    const at = groundPoint(box, p, q0 + 2);
    post(ctx, at.x, at.y, h, 3, TIMBER);
  }
  const mat = subBox(box, p0, p1, q0, q1, 0, h);
  onRoof(ctx, mat, (w, d) => {
    planks(ctx, w, d, { base: 0xa88a58, light: 1.08, seed }, true, 2.5);
    ctx.fillStyle = 'rgba(20,12,6,0.2)';
    ctx.fillRect(0, 0, w, 2);
  });
  const front = groundPoint(box, p0, q0);
  const end = groundPoint(box, p1, q0);
  ctx.strokeStyle = css(TIMBER);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(front.x, front.y - h);
  ctx.lineTo(end.x, end.y - h);
  ctx.stroke();
}

/** A court or garden floor: brick paving laid between p0..p1, q0..q1. */
export function courtFloor(ctx: Ctx, box: IsoBox, p0: number, p1: number, q0: number, q1: number, color: number, seed: number): void {
  onRoof(ctx, subBox(box, p0, p1, q0, q1, 0), (w, d) => brick(ctx, w, d, { base: color, light: 1.02, seed }, 4, 8));
}

/** A slim cypress standing at a ground point, for courts and gardens. */
export function cypressAt(ctx: Ctx, x: number, ground: number, h: number, w: number, leaf: number, seed: number): void {
  const rand = rng(seed);
  ellipseShadow(ctx, x + 4, ground, w * 0.7, w * 0.22, 0.28);
  ctx.fillStyle = css(0x4a2e18);
  ctx.fillRect(x - 2, ground - 12, 4, 12);
  const top = ground - h;
  const shape = (): void => {
    ctx.beginPath();
    ctx.moveTo(x, ground - 8);
    ctx.bezierCurveTo(x - w * 0.6, ground - 14, x - w * 0.55, top + h * 0.45, x, top);
    ctx.bezierCurveTo(x + w * 0.52, top + h * 0.45, x + w * 0.58, ground - 14, x, ground - 8);
    ctx.closePath();
  };
  const g = ctx.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  g.addColorStop(0, css(shade(leaf, 1.3)));
  g.addColorStop(0.5, css(leaf));
  g.addColorStop(1, css(shade(leaf, 0.5)));
  shape();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  shape();
  ctx.clip();
  ctx.lineWidth = 1.2;
  for (let y = top + 4; y < ground - 8; y += 4) {
    for (let k = 0; k < 3; k++) {
      const tx = x - w / 2 + rand() * w;
      ctx.strokeStyle = css(shade(leaf, tx < x ? 1.5 : 0.5), 0.55);
      ctx.beginPath();
      ctx.arc(tx, y, 3 + rand() * 2, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(10,20,12,0.6)';
  ctx.lineWidth = 0.8;
  shape();
  ctx.stroke();
}
