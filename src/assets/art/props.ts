import type Phaser from 'phaser';
import { css, groundShadow, outlineBox, paintTexture, polygon, roofPoint, rng, shade, type IsoBox } from './canvasKit';
import { planks } from './materials';
import { flatTop, walls } from './ornaments';

/** Small everyday props: crates and sacks, carpets. */

/** Two stacked crates with a grain sack leaning against them. */
export function paintCrates(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 56, 56, ctx => {
    const big: IsoBox = { x: 26, y: 50, w: 20, d: 20, h: 16 };
    const small: IsoBox = { x: 26, y: 34, w: 14, d: 14, h: 12 };
    groundShadow(ctx, big, 5, 0.25);
    for (const [box, seed] of [[big, 3], [small, 5]] as const) {
      walls(ctx, box, (c, w, h, light) => {
        planks(c, w, h, { base: 0x9b6a3a, light, seed }, false, 4);
        c.strokeStyle = css(shade(0x4a2e18, light));
        c.lineWidth = 1.5;
        c.strokeRect(0.75, 0.75, w - 1.5, h - 1.5);
        c.beginPath();
        c.moveTo(0, h);
        c.lineTo(w, 0);
        c.stroke();
      });
      flatTop(ctx, box, 0xa87a48);
      outlineBox(ctx, box);
    }
    // Sack.
    ctx.fillStyle = css(0xc8b088);
    ctx.beginPath();
    ctx.ellipse(44, 46, 7, 8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x9a8460);
    ctx.beginPath();
    ctx.ellipse(46, 48, 5, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0x6a5638);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(42, 38);
    ctx.lineTo(44, 36);
    ctx.lineTo(46, 38);
    ctx.stroke();
  });
}

/** A Persian carpet laid flat on the ground: border, field, medallion, fringe. */
export function paintRug(scene: Phaser.Scene, key: string, field = 0x7f2a2a, border = 0x1f2f5a): void {
  paintTexture(scene, key, 60, 32, ctx => {
    const ground: IsoBox = { x: 30, y: 30, w: 26, d: 30, h: 0 };
    const at = (p: number, q: number) => roofPoint(ground, p, q);
    const quad = (p0: number, q0: number, p1: number, q1: number) =>
      polygon(ctx, [at(p0, q0), at(p1, q0), at(p1, q1), at(p0, q1)]);
    const { w, d } = ground;
    quad(0, 0, w, d);
    ctx.fillStyle = css(border);
    ctx.fill();
    quad(3, 3, w - 3, d - 3);
    ctx.fillStyle = css(field);
    ctx.fill();
    // Guard stripes and the central medallion.
    ctx.strokeStyle = css(0xd8b870, 0.85);
    ctx.lineWidth = 0.7;
    quad(2, 2, w - 2, d - 2);
    ctx.stroke();
    quad(4, 4, w - 4, d - 4);
    ctx.stroke();
    const c = at(w / 2, d / 2);
    ctx.fillStyle = css(shade(border, 1.3));
    ctx.beginPath();
    ctx.moveTo(c.x, c.y - 5);
    ctx.lineTo(c.x + 9, c.y);
    ctx.lineTo(c.x, c.y + 5);
    ctx.lineTo(c.x - 9, c.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(0xd8b870);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    const rand = rng(field);
    for (let i = 0; i < 40; i++) {
      const pt = at(5 + rand() * (w - 10), 5 + rand() * (d - 10));
      ctx.fillStyle = css(rand() < 0.5 ? 0xd8b870 : shade(field, 1.4), 0.6);
      ctx.fillRect(pt.x, pt.y, 1, 1);
    }
    // Fringe on the two short ends.
    ctx.strokeStyle = css(0xe8dcc0, 0.9);
    ctx.lineWidth = 0.6;
    for (let q = 1; q < d; q += 2) {
      for (const p of [0, w]) {
        const a = at(p, q);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (p === 0 ? -1.5 : 1.5), a.y + (p === 0 ? -0.8 : 0.8));
        ctx.stroke();
      }
    }
  });
}
