import type Phaser from 'phaser';
import { css, mix, paintTexture, rng, shade, type Ctx } from './canvasKit';

/**
 * Trees painted as clustered foliage masses lit from the upper left, with
 * a trunk that shows between them. Cheap to draw once, and far more alive
 * than a single ellipse.
 */

export interface TreeStyle {
  leaf: number;
  trunk: number;
  /** Foliage radius in pixels. */
  size: number;
  seed: number;
  /** Fruit or blossom dots (pomegranate, rose). */
  fruit?: number;
  snow?: boolean;
}

/** A broad deciduous tree: a plane tree, mulberry or pomegranate. */
export function paintTree(scene: Phaser.Scene, key: string, style: TreeStyle): void {
  const r = style.size;
  const w = Math.ceil(r * 2.6);
  const h = Math.ceil(r * 3.4);
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const ground = h - 5;
    const rand = rng(style.seed);
    ctx.fillStyle = 'rgba(10,6,3,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx + r * 0.25, ground, r * 1.05, r * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    // Trunk and two limbs.
    const trunk = ctx.createLinearGradient(cx - 4, 0, cx + 4, 0);
    trunk.addColorStop(0, css(shade(style.trunk, 1.25)));
    trunk.addColorStop(1, css(shade(style.trunk, 0.6)));
    ctx.strokeStyle = trunk;
    ctx.lineWidth = Math.max(3, r * 0.22);
    ctx.beginPath();
    ctx.moveTo(cx, ground);
    ctx.quadraticCurveTo(cx - 2, ground - r * 0.9, cx + 1, ground - r * 1.6);
    ctx.stroke();
    ctx.lineWidth = Math.max(2, r * 0.12);
    ctx.beginPath();
    ctx.moveTo(cx, ground - r * 0.9);
    ctx.quadraticCurveTo(cx - r * 0.5, ground - r * 1.3, cx - r * 0.7, ground - r * 1.8);
    ctx.moveTo(cx + 1, ground - r * 1.1);
    ctx.quadraticCurveTo(cx + r * 0.4, ground - r * 1.4, cx + r * 0.6, ground - r * 1.9);
    ctx.stroke();
    const crownY = ground - r * 1.95;
    foliage(ctx, cx, crownY, r, style, rand);
  });
}

function foliage(ctx: Ctx, cx: number, cy: number, r: number, style: TreeStyle, rand: () => number): void {
  const blobs: Array<{ x: number; y: number; r: number }> = [];
  for (let i = 0; i < 9; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * r * 0.55;
    blobs.push({ x: cx + Math.cos(a) * d * 1.1, y: cy + Math.sin(a) * d * 0.8, r: r * (0.42 + rand() * 0.22) });
  }
  blobs.sort((a, b) => a.y - b.y);
  // Shadow layer, then each mass lit from the upper left.
  for (const b of blobs) {
    ctx.fillStyle = css(shade(style.leaf, 0.55));
    ctx.beginPath();
    ctx.arc(b.x + 1.5, b.y + 2, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const b of blobs) {
    const g = ctx.createRadialGradient(b.x - b.r * 0.45, b.y - b.r * 0.5, b.r * 0.1, b.x, b.y, b.r);
    g.addColorStop(0, css(shade(style.leaf, 1.35)));
    g.addColorStop(0.6, css(style.leaf));
    g.addColorStop(1, css(shade(style.leaf, 0.7)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Leaf flecks break up the silhouette.
  for (let i = 0; i < r * 5; i++) {
    const a = rand() * Math.PI * 2;
    const d = rand() * r * 1.05;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d * 0.85;
    const lit = (x - cx) + (y - cy) < 0;
    ctx.fillStyle = css(shade(style.leaf, lit ? 1.45 : 0.6), 0.8);
    ctx.fillRect(x, y, 1.6, 1.2);
  }
  if (style.fruit !== undefined) {
    for (let i = 0; i < 9; i++) {
      const a = rand() * Math.PI * 2;
      const d = r * (0.3 + rand() * 0.6);
      ctx.fillStyle = css(style.fruit);
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (style.snow) {
    ctx.fillStyle = 'rgba(242,240,232,0.85)';
    for (const b of blobs) {
      ctx.beginPath();
      ctx.ellipse(b.x - b.r * 0.2, b.y - b.r * 0.6, b.r * 0.6, b.r * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export interface CypressStyle {
  height: number;
  width: number;
  leaf: number;
  seed: number;
  /** Lean of the tip in pixels, as wind-bent cypresses have. */
  lean?: number;
}

/** The Persian cypress (sarv): a dense flame of dark green. */
export function paintCypress(scene: Phaser.Scene, key: string, style: CypressStyle): void {
  const w = style.width + 16;
  const h = style.height + 8;
  paintTexture(scene, key, w, h, ctx => {
    const rand = rng(style.seed);
    const cx = w / 2;
    const ground = h - 4;
    const top = ground - style.height;
    const lean = style.lean ?? 0;
    const half = style.width / 2;
    ctx.fillStyle = 'rgba(10,6,3,0.28)';
    ctx.beginPath();
    ctx.ellipse(cx + 3, ground, half + 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x4a2e18);
    ctx.fillRect(cx - 1.5, ground - 10, 3, 10);
    const shape = (): void => {
      ctx.beginPath();
      ctx.moveTo(cx, ground - 6);
      ctx.bezierCurveTo(cx - half * 1.15, ground - 12, cx - half * 1.05, top + style.height * 0.45, cx + lean, top);
      ctx.bezierCurveTo(cx + half * 1.0 + lean * 0.3, top + style.height * 0.45, cx + half * 1.1, ground - 12, cx, ground - 6);
      ctx.closePath();
    };
    const g = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
    g.addColorStop(0, css(shade(style.leaf, 1.3)));
    g.addColorStop(0.5, css(style.leaf));
    g.addColorStop(1, css(shade(style.leaf, 0.55)));
    shape();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    shape();
    ctx.clip();
    // Scalloped tufts, brighter on the sunlit side.
    for (let y = top + 4; y < ground - 4; y += 3) {
      for (let k = 0; k < 3; k++) {
        const x = cx - half + rand() * style.width;
        const lit = x < cx;
        ctx.strokeStyle = css(lit ? shade(style.leaf, 1.5) : shade(style.leaf, 0.5), 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, 2.2 + rand() * 1.5, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
      }
    }
    ctx.restore();
    ctx.strokeStyle = css(mix(style.leaf, 0x000000, 0.55), 0.7);
    ctx.lineWidth = 0.8;
    shape();
    ctx.stroke();
  });
}

export const TREE_VARIANTS: readonly TreeStyle[] = [
  { leaf: 0x46743f, trunk: 0x5b3a24, size: 19, seed: 3 },
  { leaf: 0x557a3a, trunk: 0x6a4428, size: 16, seed: 9, fruit: 0xb83a2a },
  { leaf: 0x6a7f55, trunk: 0x5e4a36, size: 17, seed: 17 },
];

export const CYPRESS_VARIANTS: readonly CypressStyle[] = [
  { height: 84, width: 20, leaf: 0x24553a, seed: 4 },
  { height: 70, width: 18, leaf: 0x2a5e3c, seed: 8, lean: 2 },
  { height: 94, width: 22, leaf: 0x1f4c33, seed: 15, lean: -2 },
];
