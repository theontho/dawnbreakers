import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, mix, onRoof, outlineBox, paintTexture, polygon, rng, roofPoint, shade, type Ctx } from './canvasKit';
import { brick, planks, stone } from './materials';
import { archPath, band, clipped, flatTop, LIGHT, walls } from './ornaments';
import { post, subBox } from './structureParts';

/**
 * The Zāyandih-Rūd at Iṣfahán: the great bridge of thirty-three arches
 * with its double arcade, reeds at the water's edge, and a cloth-printer's
 * awning in the bazaar.
 */

const BRIDGE_BRICK = 0xc9a46a;
const RIVER = 0x2c4a6b;

/** A walkable bridge span: water arches below, a gallery of small arches above, paved deck between low parapets. */
export function paintBridgeSpan(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 24, 16);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 4, 0.2);
    walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: BRIDGE_BRICK, light, seed: 51 }, 3, 7), {
      left: (c, w, h, l) => arcades(c, w, h, l, 32),
      right: (c, w, h, l) => arcades(c, w, h, l, w),
    });
    onRoof(ctx, box, (w, d) => clipped(ctx, w, d, () => {
      brick(ctx, w, d, { base: shade(BRIDGE_BRICK, 0.92), light: LIGHT.roof, seed: 52 }, 4, 8);
      // Worn stone flags down the middle where the traffic runs.
      ctx.beginPath();
      ctx.rect(0, d * 0.34, w, d * 0.32);
      ctx.clip();
      ctx.globalAlpha = 0.55;
      stone(ctx, w, d, { base: 0xb8a684, light: LIGHT.roof, seed: 53 }, 6);
    }));
    outlineBox(ctx, box);
    // Low parapets along both long edges, pierced with little arches.
    const rim = 4;
    const back = subBox(box, 0, box.w, box.d - rim, box.d, 6, box.h);
    const front = subBox(box, 0, box.w, 0, rim, 6, box.h);
    for (const p of [back, front]) {
      walls(ctx, p, (c, w, h, light) => brick(c, w, h, { base: shade(BRIDGE_BRICK, 1.04), light, seed: 54 }, 3, 7));
      flatTop(ctx, p, shade(BRIDGE_BRICK, 1.05));
      outlineBox(ctx, p);
    }
  });
}

/** The double arcade: river arches between piers, a band, then the upper gallery. */
function arcades(ctx: Ctx, w: number, h: number, light: number, bay: number): void {
  const gallery = 9;
  band(ctx, w, gallery + 1, 2, shade(BRIDGE_BRICK, 0.82), light);
  for (let u = 2.5; u + 5 < w; u += 8) {
    archPath(ctx, u - 0.8, gallery + 0.5, 6.6, 7.5);
    ctx.fillStyle = css(shade(0xe0c890, light * 0.85));
    ctx.fill();
    archPath(ctx, u, gallery, 5, 6.5);
    ctx.fillStyle = css(shade(0x2a1a10, light + 0.15));
    ctx.fill();
  }
  const bays = Math.max(1, Math.round(w / bay));
  const step = w / bays;
  for (let i = 0; i < bays; i++) {
    const aw = step * 0.66;
    const ax = i * step + (step - aw) / 2;
    archPath(ctx, ax - 1.5, h, aw + 3, h - gallery - 1);
    ctx.fillStyle = css(shade(0xe0c890, light * 0.85));
    ctx.fill();
    archPath(ctx, ax, h, aw, h - gallery - 3);
    const g = ctx.createLinearGradient(0, gallery, 0, h);
    g.addColorStop(0, css(0x120c08));
    g.addColorStop(1, css(shade(RIVER, light * 0.8)));
    ctx.fillStyle = g;
    ctx.fill();
    // Light on the water beyond the arch, and foam at the cutwater.
    ctx.fillStyle = 'rgba(190,220,235,0.45)';
    ctx.fillRect(ax + aw * 0.25, h - 2.5, aw * 0.5, 0.8);
    ctx.fillStyle = 'rgba(235,245,250,0.55)';
    ctx.beginPath();
    ctx.ellipse(i * step, h - 0.5, 3, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Reeds and bulrushes standing in a shallow pool at the river's edge. */
export function paintRiverReeds(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 44, ctx => {
    const rand = rng(77);
    const cx = 24;
    const base = 38;
    const pool = ctx.createRadialGradient(cx - 4, base - 2, 2, cx, base, 22);
    pool.addColorStop(0, css(shade(RIVER, 1.35), 0.9));
    pool.addColorStop(1, css(RIVER, 0));
    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.ellipse(cx, base, 22, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(200,225,240,0.4)';
    ctx.lineWidth = 0.7;
    for (const r of [8, 14]) {
      ctx.beginPath();
      ctx.ellipse(cx + 2, base + 1, r, r * 0.28, 0, Math.PI * 0.1, Math.PI * 0.9);
      ctx.stroke();
    }
    // Back stalks are darker; front stalks catch the light on the left.
    const stalks = Array.from({ length: 22 }, () => ({
      x: cx - 13 + rand() * 26,
      h: 16 + rand() * 18,
      bend: (rand() - 0.4) * 8,
      depth: rand(),
    })).sort((a, b) => a.depth - b.depth);
    for (const s of stalks) {
      const y = base - 1 + s.depth * 3;
      const lit = s.x < cx;
      ctx.strokeStyle = css(shade(mix(0x516b38, 0x7a8a3a, rand()), (lit ? 1.15 : 0.8) * (0.7 + s.depth * 0.4)));
      ctx.lineWidth = 1.1 + rand() * 0.6;
      ctx.beginPath();
      ctx.moveTo(s.x, y);
      ctx.quadraticCurveTo(s.x + s.bend * 0.2, y - s.h * 0.6, s.x + s.bend, y - s.h);
      ctx.stroke();
      if (rand() < 0.3) {
        // Bulrush head.
        const hx = s.x + s.bend * 0.75;
        const hy = y - s.h * 0.78;
        ctx.fillStyle = css(shade(0x7a5228, lit ? 1.1 : 0.8));
        ctx.beginPath();
        ctx.ellipse(hx, hy, 1.6, 4, s.bend * 0.03, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,220,170,0.35)';
        ctx.fillRect(hx - 1, hy - 3, 0.8, 4);
      }
    }
    // A few long blades arching over.
    ctx.strokeStyle = css(0x6f8a44, 0.9);
    ctx.lineWidth = 1;
    for (const [x, dir] of [[18, -1], [30, 1], [24, 1]] as const) {
      ctx.beginPath();
      ctx.moveTo(x, base);
      ctx.quadraticCurveTo(x + dir * 4, base - 22, x + dir * 12, base - 16);
      ctx.stroke();
    }
  });
}

/** A cloth-printer's booth: a peaked canvas roof on posts over a counter of block-printed cotton. */
export function paintMarketAwning(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 24, 26);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 4, 0.22);
    const cloth = 0x315f68;
    const wood = 0x5b3f24;
    const rise = 20;
    const corner = (p: number, q: number) => roofPoint(box, p, q);
    // The back post stands behind everything else.
    const backPost = corner(0, box.d);
    post(ctx, backPost.x, backPost.y + box.h, box.h, 2.5, wood);
    // Counter with bolts of qalamkār cloth, madder red and indigo.
    const counter = subBox(box, 5, box.w - 5, 5, box.d - 5, 11);
    walls(ctx, counter, (c, w, h, light) => planks(c, w, h, { base: 0x7a5232, light, seed: 61 }, false, 3), {
      left: (c, w, h, l) => drapedPrint(c, w, h, l),
    });
    flatTop(ctx, counter, 0x8a6240);
    outlineBox(ctx, counter);
    const bolts = [0x9a2e22, 0x24406e, 0xd8c7a0, 0x8e5a2a];
    bolts.forEach((color, i) => {
      const at = roofPoint(counter, 5 + i * 5, 5 + (i % 2) * 8);
      ctx.fillStyle = css(color);
      ctx.fillRect(at.x - 5, at.y - 6, 10, 4);
      ctx.fillStyle = css(shade(color, 1.3));
      ctx.fillRect(at.x - 5, at.y - 6, 10, 1);
      ctx.fillStyle = css(shade(color, 0.6));
      ctx.beginPath();
      ctx.ellipse(at.x + 5, at.y - 4, 1.2, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    for (const [p, q] of [[0, 0], [box.w, 0], [box.w, box.d]] as const) {
      const top = corner(p, q);
      post(ctx, top.x, top.y + box.h, box.h, 2.5, wood);
    }
    // Pyramid roof: the two faces toward the viewer.
    const apex = roofPoint(box, box.w / 2, box.d / 2);
    apex.y -= rise;
    const left = corner(0, 0);
    const front = corner(box.w, 0);
    const right = corner(box.w, box.d);
    const face = (a: { x: number; y: number }, b: { x: number; y: number }, light: number, seed: number) => {
      polygon(ctx, [a, b, apex]);
      ctx.fillStyle = css(shade(cloth, light));
      ctx.fill();
      ctx.save();
      ctx.clip();
      const rand = rng(seed);
      ctx.strokeStyle = css(shade(0xe8dcc0, light), 0.75);
      ctx.lineWidth = 1.6;
      for (let t = 0.17; t < 1; t += 0.22) {
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        ctx.lineTo(apex.x, apex.y);
        ctx.stroke();
      }
      ctx.strokeStyle = css(0x000000, 0.12);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < 6; i++) {
        const t = rand();
        ctx.beginPath();
        ctx.moveTo(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        ctx.lineTo(apex.x + (rand() - 0.5) * 4, apex.y + 4);
        ctx.stroke();
      }
      ctx.restore();
      // Scalloped valance hanging from the eave.
      const n = 4;
      for (let i = 0; i < n; i++) {
        const x0 = a.x + ((b.x - a.x) * i) / n;
        const y0 = a.y + ((b.y - a.y) * i) / n;
        const x1 = a.x + ((b.x - a.x) * (i + 1)) / n;
        const y1 = a.y + ((b.y - a.y) * (i + 1)) / n;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 6, x0, y0);
        ctx.fillStyle = css(shade(0x9a2e22, light));
        ctx.fill();
      }
    };
    face(left, front, LIGHT.left * 1.08, 62);
    face(front, right, LIGHT.right, 63);
    ctx.strokeStyle = 'rgba(30,15,5,0.7)';
    ctx.lineWidth = 0.9;
    polygon(ctx, [left, front, right, apex]);
    ctx.stroke();
    ctx.strokeStyle = css(0xc9a55c);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(front.x, front.y);
    ctx.lineTo(apex.x, apex.y);
    ctx.stroke();
    ctx.fillStyle = css(0xe0c070);
    ctx.beginPath();
    ctx.arc(apex.x, apex.y - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** A length of block-printed cotton hung over the counter front. */
function drapedPrint(ctx: Ctx, w: number, h: number, light: number): void {
  const x = w * 0.2;
  const cw = w * 0.6;
  ctx.fillStyle = css(shade(0xe8d8b4, light));
  ctx.fillRect(x, 0, cw, h - 1);
  ctx.fillStyle = css(shade(0x9a2e22, light), 0.85);
  for (let v = 2; v < h - 2; v += 4) {
    for (let u = x + 2 + ((v / 4) % 2) * 2; u < x + cw - 1; u += 4) {
      ctx.beginPath();
      ctx.arc(u, v, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = css(shade(0x24406e, light));
  ctx.fillRect(x, h - 3, cw, 1.5);
}
