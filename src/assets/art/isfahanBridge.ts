import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, onRoof, outlineBox, paintTexture, polygon, shade, type Ctx, type IsoBox } from './canvasKit';
import { brick, glazedTiles, stone } from './materials';
import { archPath, band, clipped, flatTop, LIGHT, walls } from './ornaments';
import { liftedPoint, subBox } from './structureParts';

/**
 * A span of the great bridge over the Zāyandih-Rūd. The river runs along
 * the footprint's length (grid x) and the road crosses it along grid y, so
 * the x-facing wall is the bridge's side elevation: water arches on a
 * pier with its cutwater, and above the deck the arcaded gallery that runs
 * along each edge of the roadway. The y-facing wall is the bridge's end at
 * the south bank: broad steps up between two abutments.
 */

const BRICK = 0xc9a46a;
const RIVER = 0x2c4a6b;
const TILE = 0x2e8c96;
const DECK = 20;
const GALLERY = 15;
const RIM = 6;
const CUTWATER = 7;

export function paintBridgeSpan(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box: fp, texW, texH } = footprintBox(cellsW, cellsD, DECK + GALLERY + 8, 10);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, fp, 4, 0.2);
    const body = subBox(fp, 0, fp.w - CUTWATER, 0, fp.d, DECK);
    const abut = 30;
    walls(ctx, body, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: 51 }, 3, 7), {
      left: (c, w, h, l) => bankEnd(c, w, h, l, abut),
      right: (c, w, h, l) => waterArches(c, w, h, l),
    });
    onRoof(ctx, body, (w, d) => clipped(ctx, w, d, () => {
      brick(ctx, w, d, { base: shade(BRICK, 0.92), light: LIGHT.roof, seed: 52 }, 4, 8);
      // Worn stone flags down the roadway where the traffic runs.
      ctx.beginPath();
      ctx.rect(w * 0.3, 0, w * 0.4, d);
      ctx.clip();
      ctx.globalAlpha = 0.6;
      stone(ctx, w, d, { base: 0xb8a684, light: LIGHT.roof, seed: 53 }, 6);
    }));
    outlineBox(ctx, body);
    // The far gallery first, then the cutwater and the near gallery in front of it.
    gallery(ctx, subBox(body, 0, RIM, 0, body.d, GALLERY, DECK), true);
    pavilion(ctx, subBox(body, 0, RIM + 2, 0, RIM + 2, GALLERY + 7, DECK));
    pavilion(ctx, subBox(body, body.w - RIM - 2, body.w, body.d - RIM - 2, body.d, GALLERY + 7, DECK));
    for (let q = 32; q < body.d - 8; q += 32) cutwater(ctx, fp, body.w, q);
    gallery(ctx, subBox(body, body.w - RIM, body.w, 0, body.d, GALLERY, DECK), false);
    pavilion(ctx, subBox(body, body.w - RIM - 2, body.w, 0, RIM + 2, GALLERY + 7, DECK));
    ripples(ctx, fp);
  });
}

/** The south end: an abutment at each side, a broad flight of steps up to the deck between them. */
function bankEnd(c: Ctx, w: number, h: number, l: number, abut: number): void {
  const x0 = abut;
  const x1 = w - abut;
  c.fillStyle = css(shade(0x9a8466, l * 0.9));
  c.fillRect(x0, 0, x1 - x0, h);
  const treads = 6;
  const rise = h / treads;
  for (let i = 0; i < treads; i++) {
    const y = i * rise;
    c.fillStyle = css(shade(0xc8b48a, l));
    c.fillRect(x0, y, x1 - x0, rise * 0.45);
    c.fillStyle = 'rgba(40,24,10,0.25)';
    c.fillRect(x0, y + rise * 0.45, x1 - x0, 0.8);
  }
  c.fillStyle = 'rgba(40,24,10,0.3)';
  c.fillRect(x0, 0, 1.5, h);
  c.fillRect(x1 - 1.5, 0, 1.5, h);
  // A blind arch with a tiled tympanum in each abutment.
  for (const x of [abut / 2, w - abut / 2]) {
    archPath(c, x - 7, h - 3, 14, h - 6);
    c.fillStyle = css(shade(0xe0c890, l * 0.9));
    c.fill();
    archPath(c, x - 5.5, h - 3, 11, h - 8);
    c.save();
    c.clip();
    glazedTiles(c, x + 6, h, { base: TILE, light: l * 0.85, seed: 55 }, 4);
    c.restore();
  }
  band(c, w, h - 3, 3, shade(BRICK, 0.8), l);
}

/** The side elevation: one river arch per cell, the water dark and glinting beneath. */
function waterArches(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, 1, 2, shade(BRICK, 0.82), l);
  const bays = Math.max(1, Math.round(w / 32));
  const step = w / bays;
  for (let i = 0; i < bays; i++) {
    const aw = step * 0.62;
    const ax = i * step + (step - aw) / 2;
    archPath(c, ax - 1.5, h, aw + 3, h - 3);
    c.fillStyle = css(shade(0xe0c890, l * 0.85));
    c.fill();
    archPath(c, ax, h, aw, h - 5);
    const g = c.createLinearGradient(0, 4, 0, h);
    g.addColorStop(0, css(0x120c08));
    g.addColorStop(1, css(shade(RIVER, l * 0.8)));
    c.fillStyle = g;
    c.fill();
    // Light on the water beyond the arch.
    c.fillStyle = 'rgba(190,220,235,0.45)';
    c.fillRect(ax + aw * 0.25, h - 2.5, aw * 0.5, 0.8);
  }
}

/** The arcaded gallery along one edge of the roadway: small pointed arches open to the river breeze. */
function gallery(ctx: Ctx, g: IsoBox, far: boolean): void {
  const arcade = (c: Ctx, w: number, h: number, l: number) => {
    for (let u = 3; u + 6 < w; u += 9) {
      archPath(c, u - 1, h - 1, 8, h - 4);
      c.fillStyle = css(shade(0xe0c890, l * 0.9));
      c.fill();
      archPath(c, u, h - 1, 6, h - 6);
      c.fillStyle = css(shade(far ? 0x8aa0a8 : 0x2a1a10, far ? l : l + 0.15), far ? 0.55 : 1);
      c.fill();
    }
    band(c, w, 0, 2, shade(BRICK, 1.05), l);
  };
  walls(ctx, g, (c, w, h, light) => brick(c, w, h, { base: shade(BRICK, 1.04), light, seed: 54 }, 3, 7), {
    right: arcade,
  });
  flatTop(ctx, g, shade(BRICK, 1.05));
  outlineBox(ctx, g);
}

/** A little square pavilion rising at a gallery corner, its cap tiled. */
function pavilion(ctx: Ctx, p: IsoBox): void {
  const opening = (c: Ctx, w: number, h: number, l: number) => {
    archPath(c, w / 2 - 2, h - 4, 4, 8);
    c.fillStyle = css(shade(0x2a1a10, l));
    c.fill();
  };
  walls(ctx, p, (c, w, h, light) => brick(c, w, h, { base: shade(BRICK, 1.06), light, seed: 56 }, 3, 7), {
    left: opening,
    right: opening,
  });
  onRoof(ctx, p, (w, d) => {
    ctx.fillStyle = css(shade(TILE, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
  });
  outlineBox(ctx, p);
}

/** A pointed cutwater on the pier between two arches, splitting the current. */
function cutwater(ctx: Ctx, fp: IsoBox, face: number, q: number): void {
  const half = 4;
  const h = DECK - 6;
  const at = (p: number, qq: number, lift: number) => liftedPoint(fp, p, qq, lift);
  const tip = fp.w;
  const lit = [at(face, q - half, 0), at(tip, q, 0), at(tip, q, h), at(face, q - half, h)];
  const dark = [at(tip, q, 0), at(face, q + half, 0), at(face, q + half, h), at(tip, q, h)];
  polygon(ctx, lit);
  ctx.fillStyle = css(shade(BRICK, LIGHT.left * 0.88));
  ctx.fill();
  polygon(ctx, dark);
  ctx.fillStyle = css(shade(BRICK, LIGHT.right * 0.95));
  ctx.fill();
  // The sloping stone cap.
  const top = at(face, q, h + 3);
  polygon(ctx, [at(face, q - half, h), at(tip, q, h), top]);
  ctx.fillStyle = css(shade(0xb8a684, LIGHT.left));
  ctx.fill();
  polygon(ctx, [at(tip, q, h), at(face, q + half, h), top]);
  ctx.fillStyle = css(shade(0x9a8a6a, LIGHT.right));
  ctx.fill();
  ctx.strokeStyle = 'rgba(28,18,10,0.7)';
  ctx.lineWidth = 0.8;
  polygon(ctx, [lit[0]!, lit[1]!, dark[1]!, dark[2]!, top, lit[3]!]);
  ctx.stroke();
  // Foam where the river parts.
  const foot = at(tip, q, 0);
  ctx.fillStyle = 'rgba(235,245,250,0.6)';
  ctx.beginPath();
  ctx.ellipse(foot.x + 1, foot.y, 4, 1.4, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** Ripples on the water along the downstream side. */
function ripples(ctx: Ctx, fp: IsoBox): void {
  ctx.strokeStyle = 'rgba(210,230,240,0.35)';
  ctx.lineWidth = 0.7;
  for (let q = 8; q < fp.d - 4; q += 11) {
    const a = groundPoint(fp, fp.w - 2, q);
    const b = groundPoint(fp, fp.w - 2, q + 6);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y + 1);
    ctx.lineTo(b.x, b.y + 1);
    ctx.stroke();
  }
}
