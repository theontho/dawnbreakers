import type Phaser from 'phaser';
import { css, footprintBox, paintTexture, rng, roofPoint, shade, type Ctx } from '../art/canvasKit';
import { slab } from '../art/massing';
import { subBox } from '../art/structureParts';

/**
 * The slippers at the foot of the hall steps in the governor's residence:
 * the divines left them there going in, as one does at any threshold. The
 * examination is never staged; this is where the player waits, and the
 * threshold object the hall's story is told through.
 *
 * At true scale a slipper is about 6 px long, so they are small: a scatter
 * of pairs, red leather, green, black and the cream of cotton gīvih, on the
 * lowest step of dressed stone.
 */

const COLOURS = [0x8a2a22, 0x2f5a3a, 0x1e1a18, 0xd8c8a0, 0x6a4a2a, 0x8a2a22, 0x1e1a18] as const;

/** One slipper on the step: a pointed sole and its dark opening, turned by `angle`. */
function slipper(c: Ctx, x: number, y: number, angle: number, color: number): void {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.fillStyle = 'rgba(10,6,3,0.3)';
  c.beginPath();
  c.ellipse(0.6, 1, 3.6, 1.6, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = css(color);
  c.beginPath();
  c.moveTo(-3.4, 0);
  c.quadraticCurveTo(-3, -1.8, 0, -1.7);
  c.quadraticCurveTo(3, -1.4, 3.8, -0.2);
  c.quadraticCurveTo(3, 1.4, 0, 1.6);
  c.quadraticCurveTo(-3, 1.8, -3.4, 0);
  c.fill();
  c.fillStyle = css(shade(color, 0.35));
  c.beginPath();
  c.ellipse(-1.2, 0, 1.6, 0.9, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = css(shade(color, 1.5), 0.6);
  c.fillRect(1, -1.3, 2, 0.6);
  c.restore();
}

export function paintSlippers(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 5, 8);
  paintTexture(scene, key, texW, texH, ctx => {
    const step = subBox(box, 2, 30, 2, 30, 5);
    slab(ctx, step, 0xa89878, 841);
    const rand = rng(842);
    COLOURS.forEach((color, i) => {
      const p = 6 + (i % 4) * 6 + rand() * 2;
      const q = 6 + Math.floor(i / 4) * 11 + rand() * 3;
      const at = roofPoint(step, p, q);
      const angle = -0.45 + (rand() - 0.5) * 0.6;
      slipper(ctx, at.x - 1.8, at.y - 0.6, angle, color);
      slipper(ctx, at.x + 1.8, at.y + 0.9, angle + (rand() - 0.5) * 0.3, color);
    });
  });
}
