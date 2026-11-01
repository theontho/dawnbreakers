import type Phaser from 'phaser';
import { css, paintTexture, polygon, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow } from './fieldKit';

/**
 * The shrine square of Karbilá in 1851: its pigeons, and a pilgrim-vendor's
 * cloth spread with tablets of the clay of Karbilá (turbah) and strings of
 * beads. The date palms are The Forerunners' (`art/karbila.ts`).
 */

/** A grey pigeon on the paving, side-on, pecking or upright. */
function pigeon(ctx: Ctx, x: number, y: number, facing: number, pecking: boolean, seed: number): void {
  const rand = rng(seed);
  const body = shade(0x8a8e96, 0.9 + rand() * 0.2);
  ellipseShadow(ctx, x, y + 1, 5, 1.6, 0.25);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.fillStyle = css(body);
  ctx.beginPath();
  ctx.ellipse(0, -5, 5.5, 3.4, pecking ? 0.35 : -0.15, 0, Math.PI * 2);
  ctx.fill();
  // The tail, the wing bars, the iridescent neck and the head.
  ctx.fillStyle = css(shade(body, 0.7));
  polygon(ctx, [{ x: -4, y: -6 }, { x: -9, y: -4 }, { x: -8, y: -2.5 }, { x: -3, y: -4 }]);
  ctx.fill();
  ctx.fillStyle = css(0x3a3c44, 0.7);
  ctx.fillRect(-2, -5.5, 3, 0.8);
  ctx.fillRect(-1.5, -4.3, 3, 0.8);
  const hx = pecking ? 6 : 4;
  const hy = pecking ? -1.5 : -9;
  ctx.fillStyle = css(0x4a7a6a);
  ctx.beginPath();
  ctx.ellipse((hx + 2) / 2, (hy - 5) / 2, 2.2, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(shade(body, 0.85));
  ctx.beginPath();
  ctx.arc(hx, hy, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x2a2420);
  ctx.fillRect(hx + 1.6, hy - 0.4, 1.8, 0.9);
  ctx.strokeStyle = css(0xb05a4a);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(-0.5, -2);
  ctx.lineTo(-0.5, 0);
  ctx.moveTo(1.5, -2);
  ctx.lineTo(1.5, 0);
  ctx.stroke();
  ctx.restore();
}

export function paintPigeons(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 40, ctx => {
    pigeon(ctx, 18, 26, 1, true, 1);
    pigeon(ctx, 34, 31, -1, false, 2);
    pigeon(ctx, 44, 22, 1, true, 3);
    pigeon(ctx, 27, 18, -1, true, 4);
    // A few grains scattered for them.
    ctx.fillStyle = css(0xd8c08a);
    const rand = rng(9);
    for (let i = 0; i < 16; i++) ctx.fillRect(14 + rand() * 36, 18 + rand() * 16, 1, 1);
  });
}

/**
 * A pilgrim-vendor's cloth on the paving: rows of small tablets pressed
 * from the clay of Karbilá, for the forehead to rest on in prayer, a heap
 * of loose ones in a basket, and strings of clay beads.
 */
export function paintTurbahCloth(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 44, ctx => {
    const cloth = [{ x: 32, y: 14 }, { x: 58, y: 27 }, { x: 32, y: 40 }, { x: 6, y: 27 }];
    ellipseShadow(ctx, 33, 29, 26, 11, 0.18);
    polygon(ctx, cloth);
    ctx.fillStyle = css(0x2f4a5c);
    ctx.fill();
    ctx.strokeStyle = css(0xc9a55c, 0.9);
    ctx.lineWidth = 1;
    ctx.stroke();
    // Rows of tablets, grey-brown, each with a pressed rosette.
    const rand = rng(31);
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++) {
        const x = 20 + k * 6.5 + row * 4;
        const y = 22 + row * 3.2 - k * 2.2 + row * 1.2;
        const c = shade(0x8a7a64, 0.9 + rand() * 0.2);
        ctx.fillStyle = css(c);
        ctx.beginPath();
        ctx.ellipse(x, y, 2.6, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = css(shade(c, 1.25));
        ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
      }
    }
    // A basket of loose tablets at the back corner.
    ctx.fillStyle = css(0x9a7444);
    ctx.beginPath();
    ctx.ellipse(44, 22, 6, 3, 0, 0, Math.PI);
    ctx.lineTo(38, 18);
    ctx.ellipse(44, 18, 6, 3, 0, Math.PI, 0, false);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(0x7a6a54);
    ctx.beginPath();
    ctx.ellipse(44, 18, 5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Strings of beads looped on the cloth.
    for (const [bx, by, r] of [[16, 30, 5], [26, 34, 4]] as const) {
      ctx.fillStyle = css(0x6a4a32);
      for (let a = 0; a < Math.PI * 2; a += 0.45) ctx.fillRect(bx + Math.cos(a) * r - 0.7, by + Math.sin(a) * r * 0.5 - 0.7, 1.4, 1.4);
    }
  });
}
