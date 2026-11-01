import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, outlineBox, paintTexture, polygon, roofPoint, rng, shade, type IsoBox } from './canvasKit';
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
  paintCarpet(scene, key, field, border, 1, 1);
}

/**
 * A knotted carpet lying flat over `cellsW` x `cellsD` cells: a border in
 * `border` with gold guard stripes, the field in `field` strewn with small
 * motifs, a medallion at its heart (and corner pieces on a large one), and
 * fringe on the short ends. Painted so its front corner sits on the anchor
 * of its front cell, like a building's footprint.
 */
export function paintCarpet(scene: Phaser.Scene, key: string, field: number, border: number, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 0, 2);
  // A carpet stops a little short of the cells' edges.
  const inset = 2;
  paintTexture(scene, key, texW, texH, ctx => {
    const at = (p: number, q: number) => roofPoint(box, p + inset, q + inset);
    const quad = (p0: number, q0: number, p1: number, q1: number) =>
      polygon(ctx, [at(p0, q0), at(p1, q0), at(p1, q1), at(p0, q1)]);
    const w = box.w - inset * 2;
    const d = box.d - inset * 2;
    const band = Math.min(3 + Math.min(cellsW, cellsD) * 1.5, 9);
    quad(0, 0, w, d);
    ctx.fillStyle = css(border);
    ctx.fill();
    quad(band, band, w - band, d - band);
    ctx.fillStyle = css(field);
    ctx.fill();
    // Guard stripes either side of the border.
    ctx.strokeStyle = css(0xd8b870, 0.85);
    ctx.lineWidth = 0.7;
    quad(band * 0.4, band * 0.4, w - band * 0.4, d - band * 0.4);
    ctx.stroke();
    quad(band + 1, band + 1, w - band - 1, d - band - 1);
    ctx.stroke();
    // The medallion, and corner pieces on a carpet big enough for them.
    const medallion = (cp: number, cq: number, r: number, color: number) => {
      const c = at(cp, cq);
      ctx.fillStyle = css(color);
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - r * 0.55);
      ctx.lineTo(c.x + r, c.y);
      ctx.lineTo(c.x, c.y + r * 0.55);
      ctx.lineTo(c.x - r, c.y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = css(0xd8b870);
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, r / 3, r / 6, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    const size = Math.min(w, d);
    medallion(w / 2, d / 2, Math.min(9 + size * 0.12, 26), shade(border, 1.3));
    if (cellsW * cellsD >= 4) {
      for (const [cp, cq] of [[band * 2.2, band * 2.2], [w - band * 2.2, band * 2.2], [band * 2.2, d - band * 2.2], [w - band * 2.2, d - band * 2.2]] as const) {
        medallion(cp, cq, 5 + size * 0.03, shade(border, 1.15));
      }
    }
    const rand = rng(field + cellsW * 31 + cellsD * 7);
    for (let i = 0; i < 40 * cellsW * cellsD; i++) {
      const pt = at(band + 2 + rand() * (w - band * 2 - 4), band + 2 + rand() * (d - band * 2 - 4));
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
