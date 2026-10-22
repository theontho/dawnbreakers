import { css, groundPoint, polygon, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { figure, type FigureStyle } from './crowds';
import { ellipseShadow, litGradient } from './fieldKit';
import { cellBox } from './zanjanSiege';

/**
 * Zanján, 1850: the household of a besieged quarter. The women baked the
 * bread, ground the grain, carried water in skins and nursed the wounded;
 * these are their tools and their places. Also the cradle in Ḥujjat's house,
 * a wounded man laid on his mattress, and a child of the quarter, drawn at
 * a child's height against the 40 px adult.
 */

const at = (box: IsoBox, p: number, q: number, z = 0) => {
  const g = groundPoint(box, p, q);
  return { x: g.x, y: g.y - z };
};

const WOMAN_DARK: FigureStyle = { robe: 0x2a2a34, head: 'chador', headColor: 0x22222a, skin: 0xd6b48a, seated: true, height: 38 };
const WOMAN_BLUE: FigureStyle = { robe: 0x2f3e56, head: 'chador', headColor: 0x283448, skin: 0xd0ae84, seated: true, height: 38 };

/** A clay tanúr sunk in a mud-brick plinth, the fire glowing in its mouth, a woman beside it with the dough. */
export function drawTanur(ctx: Ctx, texH: number): void {
  const box = cellBox(texH);
  ellipseShadow(ctx, 34, texH - 15, 28, 9, 0.26);
  const w = at(box, 4, 30);
  figure(ctx, w.x, w.y, WOMAN_DARK);
  // The plinth: a low block of mud brick, knee high.
  const c = at(box, 16, 18);
  const g = ctx.createLinearGradient(c.x - 16, 0, c.x + 16, 0);
  g.addColorStop(0, css(0xb08a5e));
  g.addColorStop(1, css(0x6a5034));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(c.x - 15, c.y - 4);
  ctx.lineTo(c.x - 15, c.y - 16);
  ctx.ellipse(c.x, c.y - 16, 15, 7, 0, Math.PI, 0, false);
  ctx.lineTo(c.x + 15, c.y - 4);
  ctx.ellipse(c.x, c.y - 4, 15, 7, 0, 0, Math.PI, false);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x3a2814, 0.7);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.fillStyle = css(0xc49a6a);
  ctx.beginPath();
  ctx.ellipse(c.x, c.y - 16, 15, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // The oven's mouth, red with embers.
  const glow = ctx.createRadialGradient(c.x, c.y - 16, 0.5, c.x, c.y - 16, 8);
  glow.addColorStop(0, '#fff0b0');
  glow.addColorStop(0.4, '#f08a2a');
  glow.addColorStop(1, '#5a1a08');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.ellipse(c.x, c.y - 16, 7.5, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Flat loaves cooling on a cloth.
  const cloth = [at(box, 22, -2), at(box, 32, -2), at(box, 32, 8), at(box, 22, 8)];
  polygon(ctx, cloth);
  ctx.fillStyle = css(0xd8ccb0);
  ctx.fill();
  for (const [p, q] of [[25, 1], [28, 4], [26, 6]] as const) {
    const l = at(box, p, q, 1);
    ctx.fillStyle = litGradient(ctx, l.x, l.y, 4, 0xc8945a, 0.6);
    ctx.beginPath();
    ctx.ellipse(l.x, l.y, 4.4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A hand-mill of two round stones on a cloth, a woman kneeling to turn it. */
export function drawHandMill(ctx: Ctx, texH: number): void {
  const box = cellBox(texH);
  ellipseShadow(ctx, 32, texH - 15, 24, 8, 0.24);
  const w = at(box, 4, 28);
  figure(ctx, w.x, w.y, WOMAN_BLUE);
  const cloth = [at(box, 6, 4), at(box, 28, 4), at(box, 28, 26), at(box, 6, 26)];
  polygon(ctx, cloth);
  ctx.fillStyle = css(0x8a3a2a);
  ctx.fill();
  ctx.strokeStyle = css(0x4a1a10, 0.7);
  ctx.lineWidth = 0.7;
  ctx.stroke();
  const m = at(box, 16, 14);
  for (const [z, color] of [[0, 0x7a7a72], [5, 0x9a9a90]] as const) {
    ctx.fillStyle = css(shade(color, 0.7));
    ctx.beginPath();
    ctx.ellipse(m.x, m.y - z, 10, 4.6, 0, 0, Math.PI);
    ctx.lineTo(m.x - 10, m.y - z - 4);
    ctx.fill();
    ctx.fillStyle = css(color);
    ctx.beginPath();
    ctx.ellipse(m.x, m.y - z - 4, 10, 4.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0x3a3a36, 0.7);
    ctx.stroke();
  }
  ctx.fillStyle = css(0x2a2a26);
  ctx.beginPath();
  ctx.ellipse(m.x, m.y - 9, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  // The wooden handle, and flour spilled on the cloth.
  ctx.strokeStyle = css(0x6a4424);
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(m.x + 6, m.y - 10);
  ctx.lineTo(m.x + 6, m.y - 17);
  ctx.stroke();
  ctx.fillStyle = 'rgba(244,236,214,0.85)';
  ctx.beginPath();
  ctx.ellipse(m.x + 2, m.y + 3, 9, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Goatskin water-skins, swollen and tied at the legs, set down on a cloth. */
export function drawWaterSkins(ctx: Ctx, texH: number): void {
  const box = cellBox(texH);
  ellipseShadow(ctx, 32, texH - 14, 24, 8, 0.26);
  const rand = rng(17);
  for (const [p, q] of [[10, 18], [20, 10], [22, 22]] as const) {
    const c = at(box, p, q);
    const rx = 8 + rand() * 2;
    ctx.fillStyle = litGradient(ctx, c.x, c.y - 6, 9, 0x5a3a22, 0.9);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y - 6, rx, 6.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0x24140a, 0.8);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Tied legs and the neck.
    ctx.strokeStyle = css(0x3a2414);
    ctx.lineWidth = 1.8;
    for (const dx of [-5, 4]) {
      ctx.beginPath();
      ctx.moveTo(c.x + dx, c.y - 11);
      ctx.lineTo(c.x + dx + 1, c.y - 14);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(c.x + rx - 1, c.y - 7);
    ctx.lineTo(c.x + rx + 3, c.y - 9);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,240,220,0.25)';
    ctx.beginPath();
    ctx.ellipse(c.x - 3, c.y - 9, 3, 1.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A gahvárih: a painted wooden cradle on rockers, a bow over the head, a red quilt. */
export function drawCradle(ctx: Ctx, texH: number): void {
  const box = cellBox(texH);
  ellipseShadow(ctx, 32, texH - 15, 20, 7, 0.28);
  const z = 9;
  const top = 20;
  const side = (q: number, light: number) => {
    polygon(ctx, [at(box, 8, q, z), at(box, 26, q, z), at(box, 26, q, top), at(box, 8, q, top)]);
    ctx.fillStyle = css(shade(0x8a5a2a, light));
    ctx.fill();
    ctx.strokeStyle = css(0x2a180a, 0.8);
    ctx.lineWidth = 0.8;
    ctx.stroke();
  };
  // Rockers.
  for (const q of [9, 23]) {
    const a = at(box, 5, q, 4);
    const b = at(box, 29, q, 4);
    ctx.strokeStyle = css(0x5a3818);
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + 5, b.x, b.y);
    ctx.stroke();
    for (const p of [9, 25]) {
      const f = at(box, p, q, 3);
      const t = at(box, p, q, z);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y);
      ctx.lineTo(t.x, t.y);
      ctx.stroke();
    }
  }
  side(22, 0.75);
  // The quilt inside.
  polygon(ctx, [at(box, 9, 11, top - 2), at(box, 25, 11, top - 2), at(box, 25, 21, top - 2), at(box, 9, 21, top - 2)]);
  ctx.fillStyle = css(0xa8302a);
  ctx.fill();
  ctx.fillStyle = css(0xe0c070, 0.8);
  for (const [p, q] of [[13, 14], [18, 17], [22, 13]] as const) {
    const d = at(box, p, q, top - 2);
    ctx.fillRect(d.x, d.y, 1.5, 1.5);
  }
  side(10, 1);
  // The painted band and the bow over the head end.
  const b0 = at(box, 8, 10, top);
  const b1 = at(box, 8, 22, top);
  ctx.strokeStyle = css(0x2f6a6a);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(at(box, 8, 10, top - 3).x, at(box, 8, 10, top - 3).y);
  ctx.lineTo(at(box, 26, 10, top - 3).x, at(box, 26, 10, top - 3).y);
  ctx.stroke();
  ctx.strokeStyle = css(0x6a4020);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(b0.x, b0.y);
  ctx.quadraticCurveTo((b0.x + b1.x) / 2, Math.min(b0.y, b1.y) - 16, b1.x, b1.y);
  ctx.stroke();
}

/**
 * A wounded man laid on a felt mattress against a bolster, a quilt drawn
 * up, his right arm bound in white cloth over it, his turban set down
 * beside his head. Drawn along the cell's left axis, about 1.8 m long.
 */
export function drawWoundedOnMattress(ctx: Ctx, texH: number): void {
  const box: IsoBox = { ...cellBox(texH), x: 40 };
  ellipseShadow(ctx, 40, texH - 16, 34, 9, 0.28);
  const mat = [at(box, -10, 4, 2), at(box, 34, 4, 2), at(box, 34, 28, 2), at(box, -10, 28, 2)];
  polygon(ctx, mat);
  ctx.fillStyle = css(0xb8a47a);
  ctx.fill();
  ctx.strokeStyle = css(0x5a4a30, 0.8);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Bolster at the head (the far, left end).
  const bol = at(box, -6, 16, 7);
  ctx.fillStyle = litGradient(ctx, bol.x, bol.y, 9, 0x7a2a28, 0.7);
  ctx.beginPath();
  ctx.ellipse(bol.x, bol.y, 6, 10, 0.95, 0, Math.PI * 2);
  ctx.fill();
  // The body under the quilt: a long low hump from shoulders to feet.
  const quilt = [at(box, 2, 7, 4), at(box, 31, 7, 4), at(box, 32, 25, 4), at(box, 2, 25, 4)];
  const mid = at(box, 16, 16, 9);
  ctx.fillStyle = litGradient(ctx, mid.x, mid.y, 26, 0x34506a, 0.7);
  ctx.beginPath();
  ctx.moveTo(quilt[0]!.x, quilt[0]!.y);
  ctx.quadraticCurveTo(at(box, 16, 6, 12).x, at(box, 16, 6, 12).y, quilt[1]!.x, quilt[1]!.y);
  ctx.quadraticCurveTo(at(box, 33, 16, 9).x, at(box, 33, 16, 9).y, quilt[2]!.x, quilt[2]!.y);
  ctx.quadraticCurveTo(at(box, 16, 26, 10).x, at(box, 16, 26, 10).y, quilt[3]!.x, quilt[3]!.y);
  ctx.quadraticCurveTo(at(box, 1, 16, 10).x, at(box, 1, 16, 10).y, quilt[0]!.x, quilt[0]!.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = css(0x1c1a20, 0.7);
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.strokeStyle = css(0xc9a55c, 0.5);
  for (const p of [10, 20]) {
    const a = at(box, p, 8, 8);
    const b = at(box, p, 24, 8);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // Head on the bolster: face, dark beard, a white cap.
  const h = at(box, -1, 16, 12);
  ctx.fillStyle = css(0xd6b48a);
  ctx.beginPath();
  ctx.ellipse(h.x, h.y, 4.2, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x2a1c12);
  ctx.beginPath();
  ctx.ellipse(h.x + 2.4, h.y + 2.6, 3, 2.4, 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0xeae4d4);
  ctx.beginPath();
  ctx.ellipse(h.x - 2, h.y - 2.6, 3.8, 2.8, 0.6, 0, Math.PI * 2);
  ctx.fill();
  // The bound arm across the quilt.
  const a0 = at(box, 6, 9, 11);
  const a1 = at(box, 15, 13, 11);
  ctx.strokeStyle = css(0xf0ebe0);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(a0.x, a0.y);
  ctx.lineTo(a1.x, a1.y);
  ctx.stroke();
  ctx.strokeStyle = css(0xb8483a, 0.6);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(a0.x + 3, a0.y + 0.5);
  ctx.lineTo(a0.x + 5, a0.y + 1.5);
  ctx.stroke();
  // His turban, unwound a little, set down by the mattress.
  const t = at(box, -4, 0, 3);
  ctx.fillStyle = litGradient(ctx, t.x, t.y, 6, 0xeae4d4, 0.5);
  ctx.beginPath();
  ctx.ellipse(t.x, t.y, 6, 3.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(0x8a8070, 0.8);
  ctx.lineWidth = 0.7;
  ctx.stroke();
}

/** A boy of nine or ten in a short coat and felt cap: some 30 px against the adult's 40. */
export function drawChild(ctx: Ctx, w: number, h: number): void {
  figure(ctx, w / 2, h - 2, { robe: 0x6a5a3a, trim: 0x8a3a2a, head: 'bare', headColor: 0x1c120a, skin: 0xd2ae84, height: 30 });
}
