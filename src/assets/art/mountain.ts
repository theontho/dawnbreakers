import type Phaser from 'phaser';
import { css, mix, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { ellipseShadow, embers, flames, glow } from './structureParts';

/**
 * The winter mountains of Ādharbāyjān: rock, snow-laden shrubs and pines,
 * drifts, and the iron brazier the guards warm their hands at.
 */

type P = [number, number];

/** A cluster of faceted boulders, lit from the upper left, lichen and snow on the tops. */
export function paintRock(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 38, ctx => {
    ellipseShadow(ctx, 25, 33, 21, 5, 0.3);
    boulder(ctx, [[18, 34], [16, 18], [24, 10], [33, 14], [40, 26], [38, 34]], 0x6e7176, 171);
    boulder(ctx, [[5, 35], [7, 24], [14, 18], [22, 22], [25, 35]], 0x7c7a76, 172);
    boulder(ctx, [[28, 36], [30, 29], [37, 26], [44, 30], [44, 36]], 0x66696e, 173);
  });
}

function boulder(ctx: Ctx, pts: readonly P[], color: number, seed: number): void {
  const rand = rng(seed);
  const shape = (): void => {
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
  };
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  shape();
  const g = ctx.createLinearGradient(minX, minY, maxX, maxY);
  g.addColorStop(0, css(shade(color, 1.35)));
  g.addColorStop(0.55, css(color));
  g.addColorStop(1, css(shade(color, 0.55)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  shape();
  ctx.clip();
  // Facet planes: a lit upper-left face and a shadowed right flank.
  const peak = pts.reduce((a, b) => (b[1] < a[1] ? b : a));
  ctx.fillStyle = 'rgba(20,22,28,0.3)';
  ctx.beginPath();
  ctx.moveTo(peak[0], peak[1]);
  ctx.lineTo(maxX + 2, minY + (maxY - minY) * 0.5);
  ctx.lineTo(maxX + 2, maxY);
  ctx.lineTo(peak[0] + 2, maxY);
  ctx.closePath();
  ctx.fill();
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = rand() < 0.5 ? 'rgba(140,150,90,0.45)' : 'rgba(30,30,34,0.35)';
    ctx.fillRect(minX + rand() * (maxX - minX), minY + rand() * (maxY - minY), 1.5, 1);
  }
  // Snow resting on the upward faces.
  ctx.fillStyle = 'rgba(238,243,247,0.95)';
  ctx.beginPath();
  ctx.ellipse(peak[0] - 2, peak[1] + 2, (maxX - minX) * 0.32, 3, -0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(30,32,38,0.85)';
  ctx.lineWidth = 0.9;
  shape();
  ctx.stroke();
}

/** A bare thorn shrub poking through a mound of snow, a little snow along each branch. */
export function paintSnowShrub(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 40, ctx => {
    const rand = rng(181);
    snowMound(ctx, 24, 34, 17, 5.5);
    const branch = (x: number, y: number, a: number, len: number, depth: number): void => {
      const x2 = x + Math.cos(a) * len;
      const y2 = y + Math.sin(a) * len;
      ctx.strokeStyle = css(shade(0x4a3a2c, 0.8 + depth * 0.15));
      ctx.lineWidth = Math.max(0.6, 2.2 - depth * 0.6);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      if (depth < 3) {
        branch(x2, y2, a - 0.35 - rand() * 0.25, len * 0.68, depth + 1);
        branch(x2, y2, a + 0.3 + rand() * 0.25, len * 0.62, depth + 1);
      }
      if (depth >= 1) {
        ctx.strokeStyle = 'rgba(240,245,248,0.9)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y - 0.8);
        ctx.lineTo((x + x2) / 2, (y + y2) / 2 - 0.8);
        ctx.stroke();
      }
    };
    for (const a of [-2.3, -1.75, -1.35, -0.85]) branch(24 + (a + 1.5) * 3, 32, a, 9 + rand() * 3, 0);
    // A few dried rose hips that have kept their colour.
    ctx.fillStyle = css(0x9a2a22);
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(14 + rand() * 20, 10 + rand() * 14, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    snowMound(ctx, 22, 35, 12, 3.5);
  });
}

function snowMound(ctx: Ctx, cx: number, cy: number, rx: number, ry: number): void {
  const g = ctx.createRadialGradient(cx - rx * 0.35, cy - ry, 1, cx, cy, rx);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(0.6, '#e2eaf0');
  g.addColorStop(1, '#a9bccb');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0);
  ctx.quadraticCurveTo(cx, cy + ry * 0.8, cx - rx, cy);
  ctx.fill();
}

/** A wind-shaped drift lying flat on the ground. */
export function paintSnowDrift(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 32, ctx => {
    const rand = rng(191);
    const lobes: Array<[number, number, number, number]> = [[30, 18, 20, 7], [45, 21, 12, 5], [17, 21, 11, 4.5], [36, 23, 14, 4]];
    // Blue shadow on the lee side first, then the lit crests.
    ctx.fillStyle = 'rgba(120,145,170,0.45)';
    for (const [x, y, rx, ry] of lobes) {
      ctx.beginPath();
      ctx.ellipse(x + 2, y + 1.5, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const [x, y, rx, ry] of lobes) {
      const g = ctx.createRadialGradient(x - rx * 0.4, y - ry * 0.6, 0.5, x, y, rx);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.7, '#e3ebf0');
      g.addColorStop(1, '#c4d2dc');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Wind ripples and a glitter of ice.
    ctx.strokeStyle = 'rgba(150,172,192,0.5)';
    ctx.lineWidth = 0.6;
    for (let i = 0; i < 4; i++) {
      const x = 18 + i * 8;
      ctx.beginPath();
      ctx.moveTo(x, 19 + (i % 2));
      ctx.quadraticCurveTo(x + 4, 17 + (i % 2), x + 9, 19 + (i % 2));
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    for (let i = 0; i < 10; i++) ctx.fillRect(14 + rand() * 38, 14 + rand() * 10, 1, 1);
  });
}

/** A mountain pine: drooping tiers of boughs, each carrying snow on its upper side. */
export function paintPine(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 74, ctx => {
    const rand = rng(201);
    const cx = 24;
    ellipseShadow(ctx, cx + 3, 70, 15, 4, 0.3);
    const trunk = ctx.createLinearGradient(cx - 3, 0, cx + 3, 0);
    trunk.addColorStop(0, '#6a4a30');
    trunk.addColorStop(1, '#2a1a10');
    ctx.fillStyle = trunk;
    ctx.fillRect(cx - 2.5, 52, 5, 18);
    const leaf = 0x24463a;
    const tiers: Array<[number, number, number]> = [[60, 19, 22], [48, 16, 20], [36, 13, 18], [24, 9, 15]];
    for (const [base, half, height] of tiers) {
      const top = base - height;
      const bough = (): void => {
        ctx.beginPath();
        ctx.moveTo(cx, top);
        ctx.quadraticCurveTo(cx - half * 0.5, base - height * 0.4, cx - half, base);
        for (let x = cx - half; x < cx + half; x += 4) ctx.quadraticCurveTo(x + 2, base + 2.5, x + 4, base);
        ctx.quadraticCurveTo(cx + half * 0.5, base - height * 0.4, cx, top);
        ctx.closePath();
      };
      const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
      g.addColorStop(0, css(shade(leaf, 1.35)));
      g.addColorStop(0.5, css(leaf));
      g.addColorStop(1, css(shade(leaf, 0.55)));
      bough();
      ctx.fillStyle = g;
      ctx.fill();
      ctx.save();
      bough();
      ctx.clip();
      // Needle texture.
      for (let i = 0; i < half * 3; i++) {
        const x = cx - half + rand() * half * 2;
        const y = top + rand() * height;
        ctx.strokeStyle = css(x < cx ? shade(leaf, 1.5) : shade(leaf, 0.5), 0.6);
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + (x < cx ? -2 : 2), y + 2);
        ctx.stroke();
      }
      // Snow lies on the upper slope of each tier, heavier on the lit side.
      ctx.fillStyle = 'rgba(240,245,248,0.95)';
      ctx.beginPath();
      ctx.moveTo(cx, top - 1);
      ctx.quadraticCurveTo(cx - half * 0.55, base - height * 0.45, cx - half * 0.85, base - height * 0.12);
      ctx.quadraticCurveTo(cx - half * 0.3, base - height * 0.38, cx + half * 0.1, base - height * 0.42);
      ctx.quadraticCurveTo(cx + half * 0.45, base - height * 0.45, cx + half * 0.6, base - height * 0.22);
      ctx.quadraticCurveTo(cx + half * 0.3, base - height * 0.6, cx, top - 1);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = css(mix(leaf, 0x000000, 0.5), 0.7);
      ctx.lineWidth = 0.7;
      bough();
      ctx.stroke();
    }
  });
}

/** An iron brazier on three legs, heaped with coals and burning bright. */
export function paintBrazier(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 40, 50, ctx => {
    const cx = 20;
    glow(ctx, cx, 30, 20, 0xff9a40, 0.25);
    ellipseShadow(ctx, cx + 2, 45, 12, 3.5, 0.3);
    ctx.strokeStyle = css(0x24201c);
    ctx.lineWidth = 2;
    for (const [x0, x1] of [[12, 15], [28, 25], [20, 20]] as const) {
      ctx.beginPath();
      ctx.moveTo(x0, x0 === 20 ? 47 : 45);
      ctx.lineTo(x1, 30);
      ctx.stroke();
    }
    // Bowl: hammered iron, a rim catching the firelight.
    const bowl = ctx.createLinearGradient(cx - 12, 0, cx + 12, 0);
    bowl.addColorStop(0, '#5a4a3e');
    bowl.addColorStop(0.4, '#3a302a');
    bowl.addColorStop(1, '#1a1512');
    ctx.fillStyle = bowl;
    ctx.beginPath();
    ctx.moveTo(cx - 12, 26);
    ctx.quadraticCurveTo(cx - 10, 35, cx, 35);
    ctx.quadraticCurveTo(cx + 10, 35, cx + 12, 26);
    ctx.closePath();
    ctx.fill();
    embers(ctx, cx, 26, 11.5, 3.6, 211);
    ctx.strokeStyle = '#c87a3a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, 26, 12, 4, 0, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,170,90,0.35)';
    ctx.fillRect(cx - 9, 29, 1.2, 3);
    flames(ctx, cx, 26, 14, 16, 212);
    // Sparks.
    ctx.fillStyle = '#ffe2a0';
    for (const [x, y] of [[16, 6], [24, 4], [21, 1], [27, 9]] as const) ctx.fillRect(x, y, 1, 1);
  });
}
