import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, paintTexture, polygon, rng, roofPoint, shade, type Ctx, type IsoBox } from '../canvasKit';
import { litGradient } from '../fieldKit';
import { planks } from '../materials';
import { archPath, dome } from '../ornaments';
import { post, subBox, type Pt } from '../structureParts';
import { CREAM, roofFloor, TIMBER, townBlock, TURQUOISE } from './townKit';

/**
 * The bazaar at true scale: a vaulted brick arcade of open shop bays, each
 * under its own low dome with a light-hole, cloth awnings out over the
 * lane; and the open stall of the squares, its counter at a man's hip and
 * its awning over his head.
 */

const BRICK = 0xb88e5e;
const BAY = 64;

interface Shop {
  cloth: number;
  goods: readonly number[];
  kind: 'cloth' | 'copper' | 'spice' | 'carpet';
}

const SHOPS: readonly Shop[] = [
  { cloth: 0xc94f4f, goods: [0x6f2236, 0xd8cfb8, 0x2e6c8c, 0xc98b3a], kind: 'cloth' },
  { cloth: 0x2e6c8c, goods: [0xb8743a, 0xd89a4a, 0x9a5a2a], kind: 'copper' },
  { cloth: 0xc98b3a, goods: [0xd8a23a, 0xb83a2a, 0x8a5a2a, 0x557a3a], kind: 'spice' },
  { cloth: 0x557a3a, goods: [0x8a2a2a, 0x2a3a6a, 0xc8a050], kind: 'carpet' },
];

/** What a shop shows in the shadow of its bay. */
function wares(c: Ctx, x: number, base: number, w: number, shop: Shop, l: number, seed: number): void {
  const rand = rng(seed);
  // The raised platform the shopkeeper sits on.
  c.fillStyle = css(shade(0x9a8a70, l));
  c.fillRect(x, base - 16, w, 16);
  c.fillStyle = css(shade(0xb8a888, l));
  c.fillRect(x, base - 16, w, 2);
  const shelfY = base - 52;
  c.fillStyle = css(shade(TIMBER, l));
  c.fillRect(x + 4, shelfY, w - 8, 2.5);
  for (let i = 0; i < 5; i++) {
    const gx = x + 6 + (i * (w - 12)) / 5;
    const color = shop.goods[i % shop.goods.length]!;
    switch (shop.kind) {
      case 'cloth':
        // Bolts stacked on the shelf and on the platform.
        c.fillStyle = css(shade(color, l));
        c.fillRect(gx, shelfY - 9, (w - 12) / 5 - 1.5, 9);
        c.fillRect(gx, base - 24, (w - 12) / 5 - 1.5, 8);
        c.fillStyle = 'rgba(255,240,210,0.25)';
        c.fillRect(gx, shelfY - 9, (w - 12) / 5 - 1.5, 1.5);
        break;
      case 'copper': {
        c.fillStyle = litGradient(c, gx + 4, shelfY - 5, 6, shade(color, l), 1.2);
        c.beginPath();
        c.ellipse(gx + 4, shelfY - 5, 4.5, 5, 0, 0, Math.PI * 2);
        c.fill();
        c.beginPath();
        c.ellipse(gx + 4, base - 20, 5, 3.5, 0, 0, Math.PI * 2);
        c.fill();
        break;
      }
      case 'spice':
        c.fillStyle = css(shade(color, l));
        c.beginPath();
        c.moveTo(gx - 1, base - 16);
        c.quadraticCurveTo(gx + 4, base - 30 - rand() * 4, gx + 9, base - 16);
        c.fill();
        c.fillStyle = css(shade(color, l * 0.8));
        c.fillRect(gx + 1, shelfY - 7, 6, 7);
        break;
      case 'carpet':
        // Carpets hung from the vault, their borders showing.
        c.fillStyle = css(shade(color, l));
        c.fillRect(gx, shelfY - 22, (w - 12) / 5 - 1, 44 + rand() * 8);
        c.strokeStyle = css(shade(0xe8d9a8, l), 0.7);
        c.lineWidth = 0.8;
        c.strokeRect(gx + 1.5, shelfY - 20, (w - 12) / 5 - 4, 40);
        break;
    }
  }
}

/** The street face of the row: four open bays under pointed arches. */
function shopFronts(c: Ctx, w: number, h: number, l: number): void {
  for (let i = 0; i * BAY < w; i++) {
    const cx = i * BAY + BAY / 2;
    const aw = BAY - 14;
    const ah = 86;
    archPath(c, cx - aw / 2 - 3, h, aw + 6, ah + 3);
    c.fillStyle = css(shade(CREAM, l * 0.9));
    c.fill();
    archPath(c, cx - aw / 2, h, aw, ah);
    const g = c.createLinearGradient(0, h - ah, 0, h);
    g.addColorStop(0, css(shade(0x2a1c10, l)));
    g.addColorStop(1, css(shade(0x5a4430, l)));
    c.fillStyle = g;
    c.fill();
    c.save();
    archPath(c, cx - aw / 2, h, aw, ah);
    c.clip();
    wares(c, cx - aw / 2, h, aw, SHOPS[i % SHOPS.length]!, l, 900 + i);
    c.restore();
    // Lamplight from inside the vault.
    const lg = c.createRadialGradient(cx, h - ah * 0.55, 0, cx, h - ah * 0.55, aw * 0.6);
    lg.addColorStop(0, 'rgba(255,210,140,0.28)');
    lg.addColorStop(1, 'rgba(255,210,140,0)');
    c.fillStyle = lg;
    c.fillRect(cx - aw / 2, h - ah, aw, ah);
  }
}

/** The end of the row: the arched mouth of the covered lane running through it. */
function laneMouth(c: Ctx, w: number, h: number, l: number): void {
  const aw = 46;
  const ah = 92;
  const cx = w / 2;
  archPath(c, cx - aw / 2 - 4, h, aw + 8, ah + 4);
  c.fillStyle = css(shade(CREAM, l));
  c.fill();
  archPath(c, cx - aw / 2, h, aw, ah);
  c.fillStyle = css(0x140c06);
  c.fill();
  // Shafts of light down the lane from the vaults' light-holes.
  for (const t of [0.35, 0.6]) {
    c.fillStyle = 'rgba(255,220,160,0.22)';
    c.fillRect(cx - aw * 0.15 + t * 6, h - ah * (0.9 - t * 0.3), aw * 0.12, ah * 0.7);
  }
  c.fillStyle = 'rgba(255,200,120,0.6)';
  c.fillRect(cx - 2, h - ah * 0.6, 4, 5);
}

/** A sloping cloth awning out from the wall, front edge on two poles. */
function shopAwning(ctx: Ctx, box: IsoBox, p0: number, p1: number, cloth: number): void {
  const backH = 94;
  const frontH = 64;
  const qWall = 30;
  const qFront = 4;
  for (const p of [p0 + 3, p1 - 3]) {
    const at = groundPoint(box, p, qFront + 1);
    post(ctx, at.x, at.y, frontH, 3, TIMBER);
  }
  const pt = (p: number, q: number, lift: number): Pt => {
    const g = groundPoint(box, p, q);
    return { x: g.x, y: g.y - lift };
  };
  const stripes = 6;
  for (let i = 0; i < stripes; i++) {
    const a = p0 + ((p1 - p0) * i) / stripes;
    const b = p0 + ((p1 - p0) * (i + 1)) / stripes;
    polygon(ctx, [pt(a, qWall, backH), pt(b, qWall, backH), pt(b, qFront, frontH), pt(a, qFront, frontH)]);
    ctx.fillStyle = css(shade(i % 2 ? 0xf0e2c0 : cloth, 0.95 + (i % 2) * 0.05));
    ctx.fill();
    // The scalloped valance hanging from the front edge.
    const f0 = pt(a, qFront, frontH);
    const f1 = pt(b, qFront, frontH);
    ctx.beginPath();
    ctx.moveTo(f0.x, f0.y);
    ctx.lineTo(f1.x, f1.y);
    ctx.quadraticCurveTo((f0.x + f1.x) / 2, (f0.y + f1.y) / 2 + 9, f0.x, f0.y);
    ctx.fillStyle = css(shade(i % 2 ? 0xf0e2c0 : cloth, 0.75));
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(30,15,5,0.55)';
  ctx.lineWidth = 0.8;
  polygon(ctx, [pt(p0, qWall, backH), pt(p1, qWall, backH), pt(p1, qFront, frontH), pt(p0, qFront, frontH)]);
  ctx.stroke();
}

/** Sacks and baskets set out on the lane. */
function streetGoods(ctx: Ctx, box: IsoBox, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < 7; i++) {
    const at = groundPoint(box, 14 + i * 34 + rand() * 10, 10 + rand() * 12);
    const color = [0xc8b088, 0xa8885a, 0xd8a23a, 0xb83a2a][i % 4]!;
    ctx.fillStyle = litGradient(ctx, at.x, at.y - 7, 8, 0xc8b088, 0.7);
    ctx.beginPath();
    ctx.moveTo(at.x - 7, at.y);
    ctx.quadraticCurveTo(at.x - 8, at.y - 14, at.x - 2, at.y - 15);
    ctx.quadraticCurveTo(at.x + 7, at.y - 14, at.x + 7, at.y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(color);
    ctx.beginPath();
    ctx.ellipse(at.x, at.y - 14, 5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintRow(ctx: Ctx, box: IsoBox): void {
  const row = subBox(box, 0, box.w, 30, box.d, 108);
  townBlock(ctx, row, { wall: BRICK, seed: 901, material: 'brick', coping: CREAM, left: shopFronts, right: laneMouth });
  // A low dome over each bay, a light-hole at its crown.
  for (let i = 0; i < row.w / BAY; i++) {
    const at = roofFloor(row, i * BAY + BAY / 2, row.d / 2);
    dome(ctx, at.x, at.y, 30, { color: shade(BRICK, 0.98), bulb: 0.82 });
    const top = roofPoint(row, i * BAY + BAY / 2, row.d / 2);
    ctx.fillStyle = css(TURQUOISE);
    ctx.beginPath();
    ctx.ellipse(top.x, top.y - 15, 5, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x140c06);
    ctx.beginPath();
    ctx.ellipse(top.x, top.y - 15, 3.4, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  SHOPS.forEach((shop, i) => shopAwning(ctx, box, i * BAY + 5, (i + 1) * BAY - 5, shop.cloth));
  streetGoods(ctx, box, 920);
}

export function paintBazaarRow(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 150, 4);
  paintTexture(scene, key, texW, texH, ctx => paintRow(ctx, box));
}

// The open stall ---------------------------------------------------------------

export interface StallLook {
  cloth: number;
  stripe: number;
  goods: readonly number[];
  seed: number;
}

export const LARGE_STALLS: readonly StallLook[] = [
  { cloth: 0xc94f4f, stripe: 0xf0e2c0, goods: [0xd8a23a, 0xb83a2a, 0x8a5a2a], seed: 931 },
  { cloth: 0x2e6c8c, stripe: 0xe8dcc0, goods: [0x6f2236, 0xd8cfb8, 0x2e8c96], seed: 937 },
  { cloth: 0xc98b3a, stripe: 0x6a3020, goods: [0x557a3a, 0xe0c060, 0xa86030], seed: 941 },
];

const COUNTER_H = 23;
const AWNING_BACK = 66;
const AWNING_FRONT = 58;

/** A two-cell stall: a plank counter at hip height, an awning on four poles over the seller's head. */
export function paintLargeStall(scene: Phaser.Scene, key: string, look: StallLook): void {
  const { box, texW, texH } = footprintBox(2, 2, AWNING_BACK, 14);
  paintTexture(scene, key, texW, texH, ctx => {
    const rand = rng(look.seed);
    const poleH = (q: number): number => AWNING_FRONT + ((AWNING_BACK - AWNING_FRONT) * q) / box.d;
    const pole = (p: number, q: number): void => {
      const g = groundPoint(box, p, q);
      post(ctx, g.x, g.y, poleH(q), 2.5, 0x4a2e18);
    };
    // The far pole stands behind the counter; the other three in front of or beside it.
    pole(2, box.d - 2);
    const counter = subBox(box, 6, box.w - 10, 10, box.d - 24, COUNTER_H);
    townBlock(ctx, counter, {
      wall: 0x7a5232, seed: look.seed, roof: 'none', plinth: false,
      left: (c, w, h, l) => planks(c, w, h, { base: 0x7a5232, light: l, seed: look.seed }, false, 5),
      right: (c, w, h, l) => planks(c, w, h, { base: 0x7a5232, light: l, seed: look.seed + 1 }, false, 5),
    });
    const top = (p: number, q: number): Pt => roofPoint(counter, p, q);
    polygon(ctx, [top(0, 0), top(counter.w, 0), top(counter.w, counter.d), top(0, counter.d)]);
    ctx.fillStyle = css(0x9a7048);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const pt = top(6 + rand() * (counter.w - 12), 5 + rand() * (counter.d - 10));
      const color = look.goods[i % look.goods.length]!;
      ctx.fillStyle = css(shade(color, 0.6));
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = litGradient(ctx, pt.x, pt.y - 3, 6, color, 0.8);
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y - 0.5, 5.2, 2.6, 0, Math.PI, 0);
      ctx.quadraticCurveTo(pt.x, pt.y - 9, pt.x - 5.2, pt.y - 0.5);
      ctx.fill();
    }
    // Poles at the corners and the striped awning, higher at the back.
    const awn = (p: number, q: number): Pt => {
      const g = groundPoint(box, p, q);
      return { x: g.x, y: g.y - poleH(q) };
    };
    pole(box.w - 2, box.d - 2);
    pole(2, 2);
    pole(box.w - 2, 2);
    for (let i = 0; i < 6; i++) {
      const a = (box.w * i) / 6;
      const b = (box.w * (i + 1)) / 6;
      polygon(ctx, [awn(a, box.d), awn(b, box.d), awn(b, 0), awn(a, 0)]);
      ctx.fillStyle = css(shade(i % 2 ? look.stripe : look.cloth, 1.05));
      ctx.fill();
      const f0 = awn(a, 0);
      const f1 = awn(b, 0);
      ctx.beginPath();
      ctx.moveTo(f0.x, f0.y);
      ctx.lineTo(f1.x, f1.y);
      ctx.quadraticCurveTo((f0.x + f1.x) / 2, (f0.y + f1.y) / 2 + 7, f0.x, f0.y);
      ctx.fillStyle = css(shade(i % 2 ? look.stripe : look.cloth, 0.78));
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(30,15,5,0.6)';
    ctx.lineWidth = 0.8;
    polygon(ctx, [awn(0, box.d), awn(box.w, box.d), awn(box.w, 0), awn(0, 0)]);
    ctx.stroke();
  });
}
