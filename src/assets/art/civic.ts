import type Phaser from 'phaser';
import { css, paintTexture } from './canvasKit';
import { stone } from './materials';
import { cylinder } from './ornaments';

/** Wells and lanterns: the shared street furniture. */

/** Stone well-head with a timber windlass and a bucket on its rope. */
export function paintWell(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 56, 64, ctx => {
    const cx = 28;
    const base = 56;
    ctx.fillStyle = 'rgba(10,6,3,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx + 3, base + 2, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    cylinder(ctx, cx, base, 17, 11, 0x8f8068, false);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, base - 11, 17, 7.6, 0, 0, Math.PI * 2);
    ctx.clip();
    stone(ctx, 56, 64, { base: 0x9a8a70, light: 1.15, seed: 3 }, 4);
    ctx.restore();
    ctx.fillStyle = css(0x0f1a24);
    ctx.beginPath();
    ctx.ellipse(cx, base - 11, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(140,180,200,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 3, base - 12, 5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Windlass frame.
    ctx.strokeStyle = css(0x4a2e18);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 15, base - 10);
    ctx.lineTo(cx - 12, base - 40);
    ctx.moveTo(cx + 15, base - 12);
    ctx.lineTo(cx + 12, base - 40);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = css(0x6a4428);
    ctx.beginPath();
    ctx.moveTo(cx - 14, base - 38);
    ctx.lineTo(cx + 14, base - 38);
    ctx.stroke();
    ctx.strokeStyle = css(0xb8a070);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 2, base - 37);
    ctx.lineTo(cx + 2, base - 24);
    ctx.stroke();
    ctx.fillStyle = css(0x5a3a1e);
    ctx.fillRect(cx - 1, base - 24, 6, 5);
    ctx.fillStyle = css(0x8a6038);
    ctx.fillRect(cx - 1, base - 24, 6, 1);
  });
}

/** Brass lantern on a turned wooden post. */
export function paintLamp(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 32, 60, ctx => {
    ctx.fillStyle = 'rgba(10,6,3,0.25)';
    ctx.beginPath();
    ctx.ellipse(17, 56, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    const post = ctx.createLinearGradient(13, 0, 19, 0);
    post.addColorStop(0, '#6a4428');
    post.addColorStop(1, '#2e1c0e');
    ctx.fillStyle = post;
    ctx.fillRect(14, 18, 4, 38);
    ctx.fillRect(12, 53, 8, 3);
    ctx.fillStyle = '#2e1c0e';
    ctx.fillRect(10, 16, 12, 2);
    // Lantern body: faceted glass with a pierced brass cap.
    const glow = ctx.createRadialGradient(16, 9, 1, 16, 9, 12);
    glow.addColorStop(0, 'rgba(255,226,150,0.85)');
    glow.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(2, 0, 28, 22);
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.lineTo(20, 6);
    ctx.lineTo(21, 13);
    ctx.lineTo(16, 16);
    ctx.lineTo(11, 13);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a6420';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.lineTo(16, 15);
    ctx.stroke();
    ctx.fillStyle = '#b08a3a';
    ctx.beginPath();
    ctx.moveTo(11, 6);
    ctx.lineTo(16, 1);
    ctx.lineTo(21, 6);
    ctx.closePath();
    ctx.fill();
  });
}
