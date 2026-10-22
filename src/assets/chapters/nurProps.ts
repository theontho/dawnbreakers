import type Phaser from 'phaser';
import { css, footprintBox, paintTexture, roofPoint } from '../art/canvasKit';
import { glow } from '../art/structureParts';

/**
 * Before Mullá Ḥusayn's cell in the madrasa of Mírzá Ṣáliḥ: a reed mat on
 * the platform, his clay lamp burning, a pen case and a closed book. He
 * goes out before dawn and comes back an hour after sunset; this is where
 * the player waits, and where the tutor from Núr finds him awake at
 * midnight. At true scale the lamp is a hand's length, so it is small.
 */
export function paintCellLamp(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 18, 8);
  paintTexture(scene, key, texW, texH, ctx => {
    const flat = { ...box, h: 0 };
    // The reed mat.
    const corners = [roofPoint(flat, 3, 4), roofPoint(flat, 29, 4), roofPoint(flat, 29, 26), roofPoint(flat, 3, 26)];
    ctx.fillStyle = css(0xc8a868);
    ctx.beginPath();
    corners.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = css(0x8a6a3a, 0.6);
    ctx.lineWidth = 0.6;
    for (let p = 5; p < 29; p += 2.5) {
      const a = roofPoint(flat, p, 4);
      const b = roofPoint(flat, p, 26);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    // A closed book and a pen case.
    const book = roofPoint(flat, 10, 18);
    ctx.fillStyle = css(0x6a2a22);
    ctx.fillRect(book.x - 5, book.y - 3, 9, 4);
    ctx.fillStyle = css(0xe8dcc0);
    ctx.fillRect(book.x - 5, book.y, 9, 1);
    const pens = roofPoint(flat, 20, 22);
    ctx.fillStyle = css(0x2a1a10);
    ctx.fillRect(pens.x - 6, pens.y - 1.5, 10, 2.5);
    ctx.fillStyle = css(0xc9a55c, 0.8);
    ctx.fillRect(pens.x - 6, pens.y - 1.5, 10, 0.6);
    // The clay lamp and its flame.
    const lamp = roofPoint(flat, 20, 10);
    glow(ctx, lamp.x, lamp.y - 6, 14, 0xffc070, 0.45);
    ctx.fillStyle = css(0xa8603a);
    ctx.beginPath();
    ctx.ellipse(lamp.x, lamp.y, 4.2, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lamp.x + 3, lamp.y - 1);
    ctx.lineTo(lamp.x + 7, lamp.y - 1.8);
    ctx.lineTo(lamp.x + 4, lamp.y + 1);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffe2a0';
    ctx.beginPath();
    ctx.ellipse(lamp.x + 6.5, lamp.y - 4.5, 1.3, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}
