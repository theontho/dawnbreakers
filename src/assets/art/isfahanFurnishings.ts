import type Phaser from 'phaser';
import { css, groundPoint, groundShadow, onRoof, outlineBox, paintTexture, polygon, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { flatTop, LIGHT, walls } from './ornaments';
import { ellipseShadow, liftedPoint, post, subBox } from './structureParts';

/**
 * Furnishings of chapter 5 at true scale (a person is 40 px, 1.75 m): the
 * Imám-Jumʿih's silver ewer and basin, and the Muʿtamid's seat of honour
 * under its canopy, with its one unpressed cushion.
 */

/** A silver ewer (āftābih) and basin (lagan) on a low inlaid stand, at their real size: the ewer a forearm tall. */
export function paintEwer(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 40, ctx => {
    const stand: IsoBox = { x: 24, y: 36, w: 22, d: 22, h: 8 };
    ellipseShadow(ctx, 25, 35, 18, 5);
    walls(ctx, stand, (c, w, h, light) => {
      c.fillStyle = css(shade(0x5b3f24, light));
      c.fillRect(0, 0, w, h);
      // Khātam inlay: a row of tiny ivory and brass lozenges.
      for (let u = 2; u < w - 1; u += 3) {
        c.fillStyle = css(shade(u % 2 ? 0xe8dcc0 : 0xc9a55c, light), 0.9);
        c.fillRect(u, h / 2 - 0.5, 1.5, 1.5);
      }
    });
    onRoof(ctx, stand, (w, d) => {
      ctx.fillStyle = css(shade(0x7a5636, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
      ctx.strokeStyle = css(0xc9a55c, 0.7);
      ctx.lineWidth = 0.6;
      ctx.strokeRect(1.5, 1.5, w - 3, d - 3);
    });
    outlineBox(ctx, stand);
    // Basin.
    const bx = 19;
    const by = 25;
    metalEllipse(ctx, bx, by, 6, 2.7, 0xb8bcc4);
    ctx.fillStyle = css(0x5a7a96);
    ctx.beginPath();
    ctx.ellipse(bx, by - 0.4, 4.2, 1.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220,235,245,0.5)';
    ctx.fillRect(bx - 2, by - 1.2, 2, 0.6);
    // Ewer: pear body, tall neck, swan spout and looped handle.
    const ex = 29;
    const ey = 27;
    ctx.strokeStyle = css(0x9aa0aa);
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(ex - 2.5, ey - 4.5);
    ctx.quadraticCurveTo(ex - 5.5, ey - 6.5, ex - 7.5, ey - 11.5);
    ctx.stroke();
    ctx.strokeStyle = css(0x7e848e);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ex + 1.2, ey - 12.5);
    ctx.bezierCurveTo(ex + 6.5, ey - 12.5, ex + 6.5, ey - 5, ex + 2.5, ey - 3.8);
    ctx.stroke();
    const body = ctx.createRadialGradient(ex - 1.6, ey - 5.6, 0.3, ex, ey - 3.8, 6);
    body.addColorStop(0, '#f4f6fa');
    body.addColorStop(0.5, '#c4c9d2');
    body.addColorStop(1, '#6e737c');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(ex - 1, ey - 12);
    ctx.bezierCurveTo(ex - 1.3, ey - 8, ex - 4.5, ey - 7, ex - 4.2, ey - 3.2);
    ctx.bezierCurveTo(ex - 3.8, ey, ex + 3.8, ey, ex + 4.2, ey - 3.2);
    ctx.bezierCurveTo(ex + 4.5, ey - 7, ex + 1.3, ey - 8, ex + 1, ey - 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,30,40,0.6)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
    // Lid and a band of chased gold.
    metalEllipse(ctx, ex, ey - 12.3, 1.7, 0.7, 0xcfd3da);
    ctx.fillStyle = css(0xd8b04a);
    ctx.fillRect(ex - 4, ey - 4.2, 8, 1);
    ctx.beginPath();
    ctx.arc(ex, ey - 13.6, 0.7, 0, Math.PI * 2);
    ctx.fill();
  });
}

function metalEllipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: number): void {
  const g = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
  g.addColorStop(0, css(shade(color, 1.25)));
  g.addColorStop(1, css(shade(color, 0.6)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,30,40,0.55)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

/** Texture size of the seat of honour: one cell, its canopy 2.9 m up. */
const SEAT_TEX = { w: 80, h: 32 + 72 + 22 } as const;
const CANOPY_H = 66;

/**
 * The seat of honour at true scale: a raised takht (0.45 m) spread with a
 * carpet, bolsters along the back, one cushion left square, under a fringed
 * cloth canopy on four slender poles.
 */
export function paintSeatOfHonour(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, SEAT_TEX.w, SEAT_TEX.h, ctx => {
    const cell: IsoBox = { x: SEAT_TEX.w / 2, y: SEAT_TEX.h, w: 32, d: 32, h: 0 };
    const dais = subBox(cell, 2, 30, 2, 30, 10);
    groundShadow(ctx, dais, 4, 0.24);
    const pole = (p: number, q: number): void => {
      const foot = groundPoint(cell, p, q);
      post(ctx, foot.x, foot.y, CANOPY_H, 2, 0x6a4a2c);
      ctx.fillStyle = css(0xd8b04a);
      ctx.beginPath();
      ctx.arc(foot.x, foot.y - CANOPY_H - 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
    };
    pole(0, 32);
    takht(ctx, dais);
    pole(0, 0);
    pole(32, 32);
    pole(32, 0);
    canopy(ctx, cell);
  });
}

function takht(ctx: Ctx, dais: IsoBox): void {
  walls(ctx, dais, (c, w, h, light) => {
    c.fillStyle = css(shade(0x5e4b36, light));
    c.fillRect(0, 0, w, h);
    c.fillStyle = css(shade(0x7a1f2a, light));
    c.fillRect(0, 0, w, 3.5);
    c.fillStyle = css(shade(0xe8dcc0, light), 0.8);
    for (let u = 1; u < w; u += 2) c.fillRect(u, 3.5, 0.8, 2);
  });
  onRoof(ctx, dais, (w, d) => {
    ctx.fillStyle = css(shade(0x1f2f5a, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.fillStyle = css(shade(0x7a1f2a, LIGHT.roof));
    ctx.fillRect(3, 3, w - 6, d - 6);
    ctx.strokeStyle = css(0xd8b870, 0.85);
    ctx.lineWidth = 0.6;
    ctx.strokeRect(2, 2, w - 4, d - 4);
    ctx.strokeRect(4.5, 4.5, w - 9, d - 9);
    const rand = rng(91);
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = rand() < 0.5 ? 'rgba(216,184,112,0.6)' : 'rgba(160,60,70,0.6)';
      ctx.fillRect(5 + rand() * (w - 10), 5 + rand() * (d - 10), 1, 1);
    }
  });
  outlineBox(ctx, dais);
  // Bolsters along the two back edges.
  const bolster = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    ctx.lineCap = 'round';
    ctx.strokeStyle = css(shade(0x315f68, 0.6));
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - 3);
    ctx.lineTo(b.x, b.y - 3);
    ctx.stroke();
    ctx.strokeStyle = css(0x315f68);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(a.x - 0.5, a.y - 4);
    ctx.lineTo(b.x - 0.5, b.y - 4);
    ctx.stroke();
    ctx.strokeStyle = css(0xd8b04a, 0.8);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(a.x - 1, a.y - 5.5);
    ctx.lineTo(b.x - 1, b.y - 5.5);
    ctx.stroke();
  };
  bolster(roofPoint(dais, 3, 3), roofPoint(dais, 3, dais.d - 3));
  bolster(roofPoint(dais, 3, dais.d - 3), roofPoint(dais, dais.w - 3, dais.d - 3));
  // The cushion, square and unpressed.
  const cushion = subBox(dais, 9, 19, 8, 18, 3, dais.h);
  walls(ctx, cushion, (c, w, h, light) => {
    c.fillStyle = css(shade(0xc9a85a, light));
    c.fillRect(0, 0, w, h);
  });
  flatTop(ctx, cushion, 0xd8c07a);
  const top = [0, 1, 2, 3].map(i => roofPoint(cushion, i === 1 || i === 2 ? cushion.w : 0, i >= 2 ? cushion.d : 0));
  ctx.fillStyle = css(0xe8d090);
  polygon(ctx, top);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = 'rgba(255,250,220,0.25)';
  ctx.fillRect(top[0]!.x, top[0]!.y - 6, 10, 10);
  ctx.restore();
  outlineBox(ctx, cushion);
  for (const [p, q] of [[0, 0], [cushion.w, 0], [cushion.w, cushion.d]] as const) {
    const at = roofPoint(cushion, p, q);
    ctx.fillStyle = css(0xd8b04a);
    ctx.fillRect(at.x - 0.6, at.y, 1.2, 2.5);
  }
}

/** The canopy: a square of embroidered cloth, sagging a little, its fringed valance on the two near sides. */
function canopy(ctx: Ctx, cell: IsoBox): void {
  const at = (p: number, q: number) => liftedPoint(cell, p, q, CANOPY_H);
  const corners = [at(0, 0), at(32, 0), at(32, 32), at(0, 32)];
  polygon(ctx, corners);
  ctx.fillStyle = css(shade(0x7a1f2a, LIGHT.roof));
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = css(0xd8b870, 0.8);
  ctx.lineWidth = 0.8;
  polygon(ctx, [at(4, 4), at(28, 4), at(28, 28), at(4, 28)]);
  ctx.stroke();
  const mid = at(16, 16);
  ctx.fillStyle = css(0xd8b870, 0.7);
  ctx.beginPath();
  ctx.ellipse(mid.x, mid.y, 5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // The valance: scallops of red cloth with a gold fringe.
  const edge = (a: { x: number; y: number }, b: { x: number; y: number }, light: number): void => {
    const n = 4;
    for (let i = 0; i < n; i++) {
      const x0 = a.x + ((b.x - a.x) * i) / n;
      const y0 = a.y + ((b.y - a.y) * i) / n;
      const x1 = a.x + ((b.x - a.x) * (i + 1)) / n;
      const y1 = a.y + ((b.y - a.y) * (i + 1)) / n;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x1, y1 + 3);
      ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 9, x0, y0 + 3);
      ctx.closePath();
      ctx.fillStyle = css(shade(0x9a2e30, light));
      ctx.fill();
      ctx.fillStyle = css(0xd8b04a, 0.85);
      ctx.fillRect((x0 + x1) / 2 - 0.6, (y0 + y1) / 2 + 6, 1.2, 2.5);
    }
  };
  edge(corners[0]!, corners[1]!, LIGHT.left);
  edge(corners[1]!, corners[2]!, LIGHT.right);
  ctx.strokeStyle = 'rgba(30,12,8,0.7)';
  ctx.lineWidth = 0.8;
  polygon(ctx, corners);
  ctx.stroke();
}
