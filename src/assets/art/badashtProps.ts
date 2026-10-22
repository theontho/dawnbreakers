import type Phaser from 'phaser';
import { css, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow, embers, flames, glow, onPlane, post } from './structureParts';
import { LIGHT } from './ornaments';

/**
 * Badasht's gardens and camp: damask roses, mud-brick garden walls, the
 * curtain behind which Ṭáhirih first spoke, and the cookfire that fed
 * eighty-one guests.
 */

/** A damask rosebush (gul-i-muḥammadī): clustered leaves scattered with open blooms. */
export function paintRosebush(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 40, ctx => {
    const rand = rng(251);
    ellipseShadow(ctx, 26, 36, 17, 4.5, 0.28);
    const leaf = 0x3d6a3c;
    const clumps = Array.from({ length: 10 }, () => ({ x: 12 + rand() * 24, y: 14 + rand() * 18, r: 6 + rand() * 4 }))
      .sort((a, b) => a.y - b.y);
    for (const c of clumps) {
      ctx.fillStyle = css(shade(leaf, 0.55));
      ctx.beginPath();
      ctx.arc(c.x + 1.2, c.y + 1.5, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const c of clumps) {
      const g = ctx.createRadialGradient(c.x - c.r * 0.4, c.y - c.r * 0.5, 0.5, c.x, c.y, c.r);
      g.addColorStop(0, css(shade(leaf, 1.4)));
      g.addColorStop(0.6, css(leaf));
      g.addColorStop(1, css(shade(leaf, 0.7)));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
    // Serrated leaf flecks.
    for (let i = 0; i < 70; i++) {
      const x = 8 + rand() * 32;
      const y = 8 + rand() * 26;
      ctx.fillStyle = css(shade(leaf, x + y < 44 ? 1.5 : 0.6), 0.75);
      ctx.fillRect(x, y, 1.5, 1);
    }
    // Blooms: layered petals, deep at the heart.
    for (let i = 0; i < 9; i++) {
      const x = 10 + rand() * 28;
      const y = 9 + rand() * 22;
      const r = 2 + rand() * 1.2;
      ctx.fillStyle = css(0x9a2a44);
      ctx.beginPath();
      ctx.arc(x + 0.5, y + 0.5, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0xd85c7a);
      ctx.beginPath();
      ctx.arc(x, y, r * 0.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0xf2a0b4);
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

export function straw(ctx: Ctx, w: number, h: number, light: number, seed: number): void {
  const rand = rng(seed);
  ctx.strokeStyle = css(shade(0xe0c890, light), 0.55);
  ctx.lineWidth = 0.6;
  for (let i = 0; i < (w * h) / 30; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const a = (rand() - 0.5) * 1.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 2.5, y + Math.sin(a) * 2.5);
    ctx.stroke();
  }
}

/** Where the plaster has fallen away, the mud bricks show. */
export function mudBrickPatch(ctx: Ctx, x: number, y: number, w: number, h: number, light: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = css(shade(0x6f5232, light));
  ctx.fillRect(x, y, w, h);
  for (let row = 0; row * 3 < h; row++) {
    for (let u = x - (row % 2) * 3; u < x + w; u += 6) {
      ctx.fillStyle = css(shade(0x9a7448, light));
      ctx.fillRect(u + 0.4, y + row * 3 + 0.4, 5.2, 2.2);
    }
  }
  ctx.restore();
}

/** A curtain hung on a frame along one diagonal of its cell, lamplight showing through. */
export function paintCurtain(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 66, ctx => {
    const hang = 46;
    const a = { x: 10, y: 42 };
    const b = { x: 54, y: 64 };
    ellipseShadow(ctx, 34, 55, 24, 6, 0.24);
    post(ctx, a.x, a.y, hang + 4, 2.5, 0x5a3f26);
    const top0 = { x: a.x, y: a.y - hang };
    const top1 = { x: b.x, y: b.y - hang };
    onPlane(ctx, top0, top1, a, b.x - a.x, hang, (w, h) => {
      // Folds: alternating lit and shaded pleats.
      const cloth = 0x6f3b5c;
      for (let u = 0; u < w; u += 4) {
        const g = ctx.createLinearGradient(u, 0, u + 4, 0);
        g.addColorStop(0, css(shade(cloth, LIGHT.left * 1.2)));
        g.addColorStop(1, css(shade(cloth, 0.7)));
        ctx.fillStyle = g;
        ctx.fillRect(u, 1, 4, h - 3);
      }
      // Lamplight glowing through from behind.
      glow(ctx, w * 0.5, h * 0.45, h * 0.45, 0xffd890, 0.35);
      // Embroidered gold borders and a hem that just brushes the ground.
      ctx.fillStyle = css(0xd8b56a);
      ctx.fillRect(0, h - 8, w, 2);
      ctx.fillRect(0, 4, w, 1.2);
      ctx.fillStyle = css(0xe8d8a0, 0.8);
      for (let u = 2; u < w; u += 4) ctx.fillRect(u, h - 5.5, 1.5, 1.5);
      ctx.fillStyle = 'rgba(30,10,20,0.4)';
      ctx.fillRect(0, h - 2, w, 2);
      // The rod with its rings.
      ctx.fillStyle = css(0x5a3f26);
      ctx.fillRect(-2, -1, w + 4, 2.5);
      ctx.fillStyle = css(0xc9a55c);
      for (let u = 2; u < w; u += 6) ctx.fillRect(u, 0, 1.5, 2.5);
    });
    post(ctx, b.x, b.y, hang + 4, 2.5, 0x5a3f26);
    for (const p of [a, b]) {
      ctx.fillStyle = css(0xc9a55c);
      ctx.beginPath();
      ctx.arc(p.x, p.y - hang - 5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** A ring of hearthstones, a log fire and a great copper cauldron hung from a tripod. */
export function paintCookfire(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 42, ctx => {
    const cx = 24;
    const base = 34;
    glow(ctx, cx, base - 6, 22, 0xff9a40, 0.22);
    ellipseShadow(ctx, cx + 1, base + 2, 17, 5, 0.25);
    // Back stones, embers and logs, then the front stones.
    const stones: Array<[number, number]> = [[-12, -1], [-6, -4], [2, -4.5], [9, -3], [13, 0], [8, 3], [0, 4], [-8, 3]];
    const stone = ([dx, dy]: [number, number]) => {
      const g = ctx.createRadialGradient(cx + dx - 1.5, base + dy - 2, 0.5, cx + dx, base + dy, 4.5);
      g.addColorStop(0, '#a8a090');
      g.addColorStop(1, '#4a4440');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(cx + dx, base + dy, 4.2, 2.8, 0, 0, Math.PI * 2);
      ctx.fill();
    };
    stones.filter(([, dy]) => dy < 0).forEach(stone);
    embers(ctx, cx, base, 9, 3, 271);
    ctx.lineCap = 'round';
    for (const [x0, y0, x1, y1] of [[-8, 2, 7, -2], [-6, -2, 8, 2]] as const) {
      ctx.strokeStyle = css(0x4a2e18);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + x0, base + y0);
      ctx.lineTo(cx + x1, base + y1);
      ctx.stroke();
    }
    flames(ctx, cx, base, 12, 11, 272);
    // The tripod and the cauldron hanging in the flames.
    ctx.strokeStyle = css(0x2a2018);
    ctx.lineWidth = 1.8;
    for (const [x, y] of [[-14, 1], [13, 2], [1, -6]] as const) {
      ctx.beginPath();
      ctx.moveTo(cx + x, base + y);
      ctx.lineTo(cx, 4);
      ctx.stroke();
    }
    ctx.strokeStyle = css(0x1a1410);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx, 4);
    ctx.lineTo(cx, 15);
    ctx.stroke();
    const pot = ctx.createLinearGradient(cx - 9, 0, cx + 9, 0);
    pot.addColorStop(0, '#d08a4a');
    pot.addColorStop(0.4, '#9a5a2a');
    pot.addColorStop(1, '#3a2010');
    ctx.fillStyle = pot;
    ctx.beginPath();
    ctx.moveTo(cx - 9, 17);
    ctx.quadraticCurveTo(cx - 10, 27, cx, 28);
    ctx.quadraticCurveTo(cx + 10, 27, cx + 9, 17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(0x2a1a10);
    ctx.beginPath();
    ctx.ellipse(cx, 17, 9, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e0a060';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(cx, 17, 9, 2.6, 0, 0, Math.PI);
    ctx.stroke();
    ctx.strokeStyle = css(0x1a1410);
    ctx.beginPath();
    ctx.moveTo(cx - 8, 17);
    ctx.quadraticCurveTo(cx, 10, cx + 8, 17);
    ctx.stroke();
    // Steam.
    ctx.fillStyle = 'rgba(235,230,220,0.4)';
    for (const [x, y, r] of [[-2, 11, 3], [2, 6, 2.5], [-1, 1.5, 2]] as const) {
      ctx.beginPath();
      ctx.arc(cx + x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    stones.filter(([, dy]) => dy >= 0).forEach(stone);
  });
}
