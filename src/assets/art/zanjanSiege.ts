import { css, groundPoint, polygon, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow } from './fieldKit';
import { LIGHT } from './ornaments';
import { roundLog } from './timber';
import { boulder, contactShadow } from './woodland';

/**
 * Zanján, 1850: the barricades the besieged threw across the lanes of their
 * quarter (earth-filled sacks, house doors, beams and carts, about chest
 * high so a man can watch over them), the royal army's field guns, the
 * rubble of shelled houses, the baskets in which the women gathered the
 * shot fired into the courts, and a ladder up to the fort's wall walk.
 * Every piece is one cell, drawn on the cell's own diamond so a row of them
 * reads as one continuous work.
 */

/** A point `z` px above the ground at (p, q) of `box`. */
const at = (box: IsoBox, p: number, q: number, z = 0) => {
  const g = groundPoint(box, p, q);
  return { x: g.x, y: g.y - z };
};

/** The ground diamond of a one-cell texture `texH` tall, its front corner at the bottom centre. */
export const cellBox = (texH: number): IsoBox => ({ x: 32, y: texH, w: 32, d: 32, h: 0 });

const HESSIAN = [0xb09a70, 0xa08a62, 0xc0a87c, 0x8f7a56] as const;

/** One earth-filled sack lying lengthwise, its top lit. */
function sack(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: number, light: number): void {
  const c = shade(color, light);
  const g = ctx.createLinearGradient(x, y - ry, x, y + ry);
  g.addColorStop(0, css(shade(c, 1.18)));
  g.addColorStop(0.6, css(c));
  g.addColorStop(1, css(shade(c, 0.6)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(shade(c, 0.45), 0.8);
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // The tied neck.
  ctx.fillStyle = css(shade(c, 0.7));
  ctx.fillRect(x + rx - 2, y - 1.2, 3, 2.4);
}

/** Courses of sacks on one face of the wall, in face space (u along the face, v down). */
function sackFace(ctx: Ctx, w: number, h: number, light: number, seed: number): void {
  const rand = rng(seed);
  ctx.fillStyle = css(shade(0x3a2a18, light));
  ctx.fillRect(0, 0, w, h);
  for (let v = h - 4, row = 0; v > 0; v -= 7, row++) {
    for (let u = row % 2 ? -4 : 2; u < w + 6; u += 11) {
      sack(ctx, u + 4, v, 5.6, 3.6, HESSIAN[Math.floor(rand() * HESSIAN.length)]!, light * (0.9 + rand() * 0.2));
    }
  }
}

/** A box of stacked sacks filling the cell, painted face by face. */
function sackWall(ctx: Ctx, box: IsoBox, seed: number): void {
  const { w, d, h } = box;
  const top = (p: number, q: number) => at(box, p, q, h);
  // Left (south) face.
  ctx.save();
  ctx.transform(1, 0.5, 0, 1, box.x - w, box.y - w / 2 - h);
  sackFace(ctx, w, h, LIGHT.left, seed);
  ctx.restore();
  // Right (east) face.
  ctx.save();
  ctx.transform(1, -0.5, 0, 1, box.x, box.y - h);
  sackFace(ctx, d, h, LIGHT.right, seed + 1);
  ctx.restore();
  // The top: a last course of sacks lying across.
  polygon(ctx, [top(0, 0), top(w, 0), top(w, d), top(0, d)]);
  ctx.fillStyle = css(0x4a3826);
  ctx.fill();
  const rand = rng(seed + 2);
  for (let q = 4; q < d; q += 8) {
    for (let p = 4; p < w; p += 10) {
      const c = top(p + rand() * 2, q);
      sack(ctx, c.x, c.y - 2, 6, 3.4, HESSIAN[Math.floor(rand() * HESSIAN.length)]!, LIGHT.roof);
    }
  }
}

/**
 * The barricade: a chest-high wall of earth-filled sacks, a beam and a
 * house door laid along its top, stones packed at its foot. 1.3 m high.
 */
export function drawBarricade(ctx: Ctx, texH: number): void {
  const cell = cellBox(texH);
  const box: IsoBox = { ...cell, h: 26 };
  contactShadow(ctx, 34, texH - 14, 30, 10, 0.25);
  sackWall(ctx, box, 211);
  // A beam along the top, and a plank door laid against it.
  roundLog(ctx, at(box, -2, 10, 29), at(box, 34, 12, 30), 2.6, { ends: 'both', bark: 0x5a4028, seed: 3 });
  const door = [at(box, 6, -1, 2), at(box, 18, -1, 2), at(box, 18, -5, 24), at(box, 6, -5, 24)];
  polygon(ctx, door);
  ctx.fillStyle = css(0x6a4424);
  ctx.fill();
  ctx.strokeStyle = css(0x2a180a);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  for (const p of [9, 12, 15]) {
    const a = at(box, p, -1, 2);
    const b = at(box, p, -5, 24);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = css(0x3a2414, 0.7);
    ctx.stroke();
  }
  for (const [p, q, r, c] of [[24, -3, 4, 0x8a7a64], [30, 6, 3.4, 0x7a6a56], [-1, 22, 3.6, 0x9a8a72]] as const) {
    const g = at(box, p, q);
    boulder(ctx, g.x, g.y, r, r * 0.9, c, p + q);
  }
}

/** A barricade built round an overturned cart: a spoked wheel up, sacks banked behind. */
export function drawCartBarricade(ctx: Ctx, texH: number): void {
  const cell = cellBox(texH);
  const box: IsoBox = { ...cell, h: 18 };
  contactShadow(ctx, 34, texH - 14, 30, 10, 0.25);
  sackWall(ctx, box, 223);
  // The cart bed on its side, planks to the lane.
  const bed = [at(box, 2, -2, 0), at(box, 30, -2, 0), at(box, 30, -4, 30), at(box, 2, -4, 30)];
  polygon(ctx, bed);
  ctx.fillStyle = css(0x7a5434);
  ctx.fill();
  ctx.strokeStyle = css(0x2a180a);
  ctx.lineWidth = 0.9;
  ctx.stroke();
  for (let z = 6; z < 30; z += 6) {
    const a = at(box, 2, -2.5, z);
    const b = at(box, 30, -2.5, z);
    ctx.strokeStyle = css(0x4a3018, 0.8);
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // The upturned wheel, seen edge-on in the face's plane.
  const hub = at(box, 22, -6, 26);
  ctx.save();
  ctx.translate(hub.x, hub.y);
  ctx.transform(1, 0.5, 0, 1, 0, 0);
  ctx.strokeStyle = css(0x4a3018);
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  for (let a = 0; a < Math.PI; a += Math.PI / 4) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11);
    ctx.lineTo(-Math.cos(a) * 11, -Math.sin(a) * 11);
    ctx.stroke();
  }
  ctx.fillStyle = css(0x2a1a0c);
  ctx.beginPath();
  ctx.arc(0, 0, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A Qajar field gun on its carriage: a bronze barrel about 2 m long on two
 * cheeks and spoked wheels, its muzzle toward the quarter (north-west).
 */
export function drawFieldGun(ctx: Ctx): void {
  ellipseShadow(ctx, 34, 44, 26, 7, 0.28);
  // The trail resting on the ground behind.
  roundLog(ctx, { x: 30, y: 38 }, { x: 54, y: 48 }, 2.6, { ends: 'b', bark: 0x5a4028, seed: 7 });
  // Far wheel.
  wheel(ctx, 28, 30, 0x4a3420);
  // The barrel: bronze, a reinforcing ring, a dark bore at the muzzle.
  roundLog(ctx, { x: 10, y: 22 }, { x: 40, y: 36 }, 3.6, { ends: 'none', bark: 0x8a6a34, seed: 2 });
  ctx.fillStyle = css(0x1a120a);
  ctx.beginPath();
  ctx.ellipse(10, 22, 2.2, 3.4, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0xb8944c);
  ctx.lineWidth = 1.2;
  for (const t of [0.15, 0.62]) {
    const x = 10 + 30 * t;
    const y = 22 + 14 * t;
    ctx.beginPath();
    ctx.moveTo(x - 1.6, y - 3.6);
    ctx.lineTo(x + 1.6, y + 3.6);
    ctx.stroke();
  }
  // The near cheek and wheel.
  polygon(ctx, [{ x: 24, y: 36 }, { x: 42, y: 44 }, { x: 42, y: 39 }, { x: 26, y: 31 }]);
  ctx.fillStyle = css(0x6a4a2a);
  ctx.fill();
  ctx.strokeStyle = css(0x2a180a);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  wheel(ctx, 34, 40, 0x5a4028);
}

function wheel(ctx: Ctx, x: number, y: number, wood: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.transform(0.55, 0.28, 0, 1, 0, 0);
  ctx.strokeStyle = css(wood);
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = css(0x2a2a28);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 11.4, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = css(shade(wood, 1.2));
  ctx.lineWidth = 1.3;
  for (let a = 0; a < Math.PI; a += Math.PI / 5) {
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 9.5, Math.sin(a) * 9.5);
    ctx.lineTo(-Math.cos(a) * 9.5, -Math.sin(a) * 9.5);
    ctx.stroke();
  }
  ctx.fillStyle = css(0x2a1a0c);
  ctx.beginPath();
  ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A shelled house's corner: a stump of mud-brick wall with a jagged top, fallen brick and roof beams heaped before it. */
export function drawRubble(ctx: Ctx, texH: number, seed: number): void {
  const box = cellBox(texH);
  const rand = rng(seed);
  contactShadow(ctx, 33, texH - 15, 30, 11, 0.24);
  // The broken wall stump along the back of the cell: left face only, its top torn.
  const wall = 0xa88660;
  const base = (p: number) => at(box, p, 26);
  const tops: Array<{ x: number; y: number }> = [];
  for (let p = 0; p <= 30; p += 3) tops.push(at(box, p, 26, 10 + rand() * 30 * (1 - Math.abs(p - 12) / 22)));
  polygon(ctx, [base(0), ...tops, base(30)]);
  ctx.fillStyle = css(shade(wall, LIGHT.left * 0.85));
  ctx.fill();
  ctx.strokeStyle = css(0x2a1a0c, 0.7);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  for (let i = 0; i < 26; i++) {
    const g = at(box, 1 + rand() * 28, 26, 2 + rand() * 16);
    ctx.fillStyle = css(shade(wall, 0.6 + rand() * 0.3), 0.6);
    ctx.fillRect(g.x, g.y, 4, 1.2);
  }
  // Beams fallen across, and the heap of brick in front.
  roundLog(ctx, at(box, 4, 24, 22), at(box, 26, 6, 2), 2.6, { ends: 'both', bark: 0x4a3420, seed: seed + 1 });
  const chunks: Array<[number, number, number]> = [];
  for (let i = 0; i < 9; i++) chunks.push([3 + rand() * 26, 2 + rand() * 20, 5 + rand() * 4]);
  chunks.sort((a, b) => (a[0] - a[1]) - (b[0] - b[1]));
  for (const [p, q, r] of chunks) {
    const g = at(box, p, q);
    boulder(ctx, g.x, g.y, r, r * 0.75, rand() < 0.6 ? 0xb08c62 : 0x8a6a48, Math.round(p * 7 + q));
  }
  roundLog(ctx, at(box, 28, 18, 3), at(box, 6, 2, 9), 2, { ends: 'a', bark: 0x5a4028, seed: seed + 2 });
  for (let i = 0; i < 60; i++) {
    const g = at(box, rand() * 32, rand() * 26, rand() * 4);
    ctx.fillStyle = css(rand() < 0.5 ? 0xd8bc84 : 0x9a7e56, 0.7);
    ctx.fillRect(g.x, g.y, rand() < 0.3 ? 3 : 1, 1);
  }
}

/** A wicker basket of iron shot gathered from the courts and terraces. */
export function drawShotBasket(ctx: Ctx): void {
  ellipseShadow(ctx, 25, 36, 14, 4.5, 0.3);
  ctx.fillStyle = css(0x9a7a44);
  ctx.beginPath();
  ctx.moveTo(13, 24);
  ctx.lineTo(15, 35);
  ctx.quadraticCurveTo(24, 39, 33, 35);
  ctx.lineTo(35, 24);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x5a4220, 0.8);
  ctx.lineWidth = 0.6;
  for (let y = 26; y < 36; y += 2.2) {
    ctx.beginPath();
    ctx.moveTo(14, y);
    ctx.lineTo(34, y);
    ctx.stroke();
  }
  ctx.fillStyle = css(0x3a2a14);
  ctx.beginPath();
  ctx.ellipse(24, 24, 11, 3.6, 0, 0, Math.PI * 2);
  ctx.fill();
  for (const [x, y] of [[19, 22], [24, 21], [29, 22], [21, 19], [27, 19], [24, 17]] as const) shot(ctx, x, y, 3.2);
  shot(ctx, 39, 36, 3);
  shot(ctx, 9, 36, 2.6);
}

function shot(ctx: Ctx, x: number, y: number, r: number): void {
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, 0.3, x, y, r);
  g.addColorStop(0, '#8a8a86');
  g.addColorStop(0.5, '#3a3a38');
  g.addColorStop(1, '#141414');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A ladder of poles and lashed rungs up to the wall walk, leaning back against the wall. */
export function drawLadder(ctx: Ctx, texH: number): void {
  const box = cellBox(texH);
  const foot = (q: number) => at(box, 12, q);
  const head = (q: number) => at(box, 30, q, 146);
  contactShadow(ctx, 30, texH - 16, 12, 4, 0.25);
  for (const q of [10, 22]) roundLog(ctx, foot(q), head(q), 1.8, { ends: 'none', bark: 0x6a4a2c, seed: q });
  for (let t = 0.06; t < 1; t += 0.085) {
    const a = foot(10);
    const b = head(10);
    const c = foot(22);
    const d = head(22);
    const l = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    const r = { x: c.x + (d.x - c.x) * t, y: c.y + (d.y - c.y) * t };
    ctx.strokeStyle = css(0x8a6a44);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
  }
}
