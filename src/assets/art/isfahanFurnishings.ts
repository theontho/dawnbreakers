import type Phaser from 'phaser';
import { css, groundShadow, onRoof, outlineBox, paintTexture, polygon, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { flatTop, LIGHT, walls } from './ornaments';
import { ellipseShadow, subBox } from './structureParts';

/**
 * Furnishings of the Muʿtamid's palace at Iṣfahán: the silver ewer and
 * basin, and the seat of honour with its one unpressed cushion.
 */

/** A silver ewer (āftābih) and basin (lagan) on a low inlaid stand. */
export function paintEwer(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 46, ctx => {
    const stand: IsoBox = { x: 24, y: 42, w: 18, d: 18, h: 6 };
    ellipseShadow(ctx, 25, 41, 20, 5);
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
    const bx = 16;
    const by = 29;
    metalEllipse(ctx, bx, by, 8.5, 3.8, 0xb8bcc4);
    ctx.fillStyle = css(0x5a7a96);
    ctx.beginPath();
    ctx.ellipse(bx, by - 0.6, 6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220,235,245,0.5)';
    ctx.fillRect(bx - 3, by - 1.6, 3, 0.7);
    // Ewer: pear body, tall neck, swan spout and looped handle.
    const ex = 31;
    const ey = 30;
    ctx.strokeStyle = css(0x9aa0aa);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex - 4, ey - 7);
    ctx.quadraticCurveTo(ex - 9, ey - 10, ex - 12, ey - 18);
    ctx.stroke();
    ctx.strokeStyle = css(0x7e848e);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ex + 2, ey - 20);
    ctx.bezierCurveTo(ex + 10, ey - 20, ex + 10, ey - 8, ex + 4, ey - 6);
    ctx.stroke();
    const body = ctx.createRadialGradient(ex - 2.5, ey - 9, 0.5, ex, ey - 6, 9);
    body.addColorStop(0, '#f4f6fa');
    body.addColorStop(0.5, '#c4c9d2');
    body.addColorStop(1, '#6e737c');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(ex - 1.5, ey - 19);
    ctx.bezierCurveTo(ex - 2, ey - 13, ex - 7, ey - 11, ex - 6.5, ey - 5);
    ctx.bezierCurveTo(ex - 6, ey, ex + 6, ey, ex + 6.5, ey - 5);
    ctx.bezierCurveTo(ex + 7, ey - 11, ex + 2, ey - 13, ex + 1.5, ey - 19);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,30,40,0.6)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // Lid and a band of chased gold.
    metalEllipse(ctx, ex, ey - 19.5, 2.6, 1.1, 0xcfd3da);
    ctx.fillStyle = css(0xd8b04a);
    ctx.fillRect(ex - 6.2, ey - 6.5, 12.4, 1.4);
    ctx.fillStyle = css(0xd8b04a);
    ctx.beginPath();
    ctx.arc(ex, ey - 21.5, 1, 0, Math.PI * 2);
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

/** A raised takht spread with a carpet, bolsters against the back, and one cushion left square. */
export function paintSeatOfHonour(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 54, ctx => {
    const dais: IsoBox = { x: 32, y: 50, w: 27, d: 27, h: 6 };
    groundShadow(ctx, dais, 4, 0.24);
    walls(ctx, dais, (c, w, h, light) => {
      c.fillStyle = css(shade(0x5e4b36, light));
      c.fillRect(0, 0, w, h);
      c.fillStyle = css(shade(0x7a1f2a, light));
      c.fillRect(0, 0, w, 2.5);
      c.fillStyle = css(shade(0xe8dcc0, light), 0.8);
      for (let u = 1; u < w; u += 2) c.fillRect(u, 2.5, 0.8, 1.5);
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
  });
}
