import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, onRoof, outlineBox, paintTexture, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { highWindow, iwanNiche } from './facade';
import { plaster, stone } from './materials';
import { archPath, band, beamEnds, dome, flatTop, LIGHT, merlons, parapetRoof, walls } from './ornaments';
import { pottedPlant, steps } from './streetLife';
import { liftedPoint, subBox } from './structureParts';

/**
 * The Muʿtamid's palace at Iṣfahán: a tālār, the columned porch of the
 * Safavid palaces, before a tiled hall. Its furnishings are in
 * `isfahanFurnishings.ts`.
 */

const WALL = 0xd8c49a;
const WOOD = 0x8a5a32;
const LAPIS = 0x24477a;
const TURQUOISE = 0x2e8c96;
const GOLD = 0xd8b04a;
/** Heights: the terrace, the roof slab, the tālār's top, and the lower wing. */
const TERRACE = 6;
const SLAB = 8;
const TOP = 94;
const WING = 60;

/**
 * The tālār: a tall porch of slender chenar columns raised on a stone
 * terrace before the tiled hall, a lower service wing stepping down at the
 * side, and a tiled portal and domes rising over the roof. The terrace is
 * set back from the footprint's front so the steps and the orange trees in
 * their pots have somewhere to stand.
 */
export function paintPalacePortico(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box: fp, texW, texH } = footprintBox(cellsW, cellsD, TOP, 40);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, fp, 8);
    const wingW = Math.min(36, fp.w * 0.24);
    const main = fp.w - wingW;
    const porch = Math.min(32, fp.d * 0.34);
    const front = 8;
    // The stone terrace and its steps.
    const terrace = subBox(fp, 0, fp.w - 4, front, fp.d, TERRACE);
    walls(ctx, terrace, (c, w, h, light) => stone(c, w, h, { base: 0xb8a684, light, seed: 82 }, 3));
    onRoof(ctx, terrace, (w, d) => {
      ctx.fillStyle = css(shade(0xcab894, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
      ctx.strokeStyle = 'rgba(80,60,40,0.3)';
      ctx.lineWidth = 0.6;
      for (let p = 8; p < w; p += 8) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, d);
        ctx.stroke();
      }
    });
    outlineBox(ctx, terrace);
    const mid = main / 2;
    steps(ctx, fp, mid - 18, mid + 18, 0, front, 2, 'q', TERRACE / 2);
    // The hall behind the porch.
    const hall = subBox(fp, 0, main, front + porch, fp.d, TOP - TERRACE, TERRACE);
    walls(ctx, hall, (c, w, h, light) => plaster(c, w, h, { base: WALL, light, seed: 81 }), {
      left: (c, w, h, l) => hallFront(c, w, h, l),
      right: (c, w, _h, l) => band(c, w, 6, 3, TURQUOISE, l),
    });
    // The lower wing at the side, its roof a storey below the tālār's.
    const wing = subBox(fp, main, fp.w - 4, front + 10, fp.d, WING, TERRACE);
    walls(ctx, wing, (c, w, h, light) => plaster(c, w, h, { base: shade(WALL, 0.97), light, seed: 87 }), {
      left: (c, w, h, l) => {
        band(c, w, 5, 2, TURQUOISE, l);
        highWindow(c, w / 2 - 4, h, 26, { frame: WOOD, light: l, arched: true }, 8, 12);
      },
      right: (c, w, h, l) => {
        band(c, w, 5, 2, TURQUOISE, l);
        for (const t of [0.25, 0.6]) highWindow(c, w * t - 4, h, 26, { frame: WOOD, light: l, arched: true }, 8, 12);
      },
    });
    parapetRoof(ctx, wing, WALL, { base: 0xb09070, light: 1, seed: 88 }, 3, 3);
    outlineBox(ctx, wing);
    // Slender chenar-wood columns along the front of the porch.
    const colH = TOP - TERRACE - SLAB;
    const bays = Math.max(3, Math.round(main / 28));
    for (let i = 0; i <= bays; i++) {
      const p = 5 + ((main - 10) * i) / bays;
      talarColumn(ctx, liftedPoint(fp, p, front + 5, TERRACE), colH);
    }
    // The flat roof over porch and hall: painted fascia, parapet, the tiled portal crowning the centre.
    const slab = subBox(fp, 0, main, front, fp.d, SLAB, TERRACE + colH);
    walls(ctx, slab, (c, w, h, light) => {
      c.fillStyle = css(shade(WOOD, light));
      c.fillRect(0, 0, w, h);
      band(c, w, 0, 3, LAPIS, light);
      c.fillStyle = css(shade(GOLD, light), 0.85);
      for (let u = 2; u < w; u += 6) c.fillRect(u, 1, 2, 1);
      beamEnds(c, w, 5, light, 6);
    });
    parapetRoof(ctx, slab, WALL, { base: 0xb09070, light: 1, seed: 83 }, 4, 4);
    merlons(ctx, slab, WALL, 3, 5);
    outlineBox(ctx, slab);
    const domeAt = roofPoint(slab, slab.w * 0.2, slab.d * 0.66);
    dome(ctx, domeAt.x, domeAt.y + 4, 12, { color: shade(WALL, 0.97), drum: 5, bulb: 1.05, finial: true });
    // Orange trees in pots at the head of the steps.
    for (const p of [mid - 26, mid + 26]) {
      const at = liftedPoint(fp, p, front + 2, TERRACE);
      pottedPlant(ctx, at.x, at.y, 4, 0x3f6a32, 89 + p, 0xe89a3a);
    }
  });
}

/** The hall façade seen through the columns: a tiled iwan with a person-sized door, coloured-glass sash windows, niches. */
function hallFront(ctx: Ctx, w: number, h: number, light: number): void {
  band(ctx, w, 6, 3, TURQUOISE, light);
  const iw = 26;
  iwanNiche(ctx, w / 2, h, iw, Math.min(64, h - 16), {
    surround: 0xe8d9a8, wall: WALL, frame: TURQUOISE, door: 0x4a2a14, panel: LAPIS, light, lantern: true, seed: 84,
  });
  for (const side of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const x = w / 2 + side * (iw / 2 + 14 + k * 20) - (side < 0 ? 11 : 0);
      orosi(ctx, x, h - 26 - 18, 11, 18, light);
    }
  }
  for (let u = 6; u < w - 6; u += 12) {
    archPath(ctx, u, 22, 6, 7);
    ctx.fillStyle = css(shade(0x6a4a30, light), 0.6);
    ctx.fill();
  }
}

/** An orosi: a sash window of small coloured panes in a wooden grid. */
function orosi(ctx: Ctx, x: number, y: number, w: number, h: number, light: number): void {
  ctx.fillStyle = css(shade(WOOD, light * 0.9));
  archPath(ctx, x - 1.5, y + h + 1, w + 3, h + 2.5);
  ctx.fill();
  archPath(ctx, x, y + h, w, h);
  ctx.save();
  ctx.clip();
  const panes = [0xb83a2a, 0x2e6c8c, 0xd8a23a, 0x3a7a4a, 0xe8dcc0];
  const rand = rng(Math.round(x * 7 + y));
  for (let py = y - 4; py < y + h; py += 3) {
    for (let px = x; px < x + w; px += 3) {
      ctx.fillStyle = css(shade(panes[Math.floor(rand() * panes.length)]!, light * 0.85));
      ctx.fillRect(px, py, 3, 3);
    }
  }
  ctx.strokeStyle = css(shade(WOOD, light * 0.7));
  ctx.lineWidth = 0.6;
  for (let px = x; px <= x + w; px += 3) {
    ctx.beginPath();
    ctx.moveTo(px, y - 6);
    ctx.lineTo(px, y + h);
    ctx.stroke();
  }
  for (let py = y - 4; py <= y + h; py += 3) {
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + w, py);
    ctx.stroke();
  }
  ctx.restore();
}

function talarColumn(ctx: Ctx, foot: { x: number; y: number }, h: number): void {
  const r = 2.4;
  // Stone base.
  const base: IsoBox = { x: foot.x, y: foot.y + 3.5, w: 7, d: 7, h: 4 };
  walls(ctx, base, (c, w, hh, light) => {
    c.fillStyle = css(shade(0xcab894, light));
    c.fillRect(0, 0, w, hh);
  });
  flatTop(ctx, base, 0xcab894);
  const g = ctx.createLinearGradient(foot.x - r, 0, foot.x + r, 0);
  g.addColorStop(0, css(shade(WOOD, 1.3)));
  g.addColorStop(0.4, css(WOOD));
  g.addColorStop(1, css(shade(WOOD, 0.5)));
  ctx.fillStyle = g;
  ctx.fillRect(foot.x - r, foot.y - h, r * 2, h - 2);
  // Faceted shaft: fine vertical flutes.
  ctx.fillStyle = 'rgba(30,15,5,0.3)';
  ctx.fillRect(foot.x - 0.3, foot.y - h + 6, 0.6, h - 10);
  // Muqarnas capital: stepped tiers flaring to the beam.
  for (let k = 0; k < 3; k++) {
    const cw = r * 2 + 2 + k * 2.2;
    ctx.fillStyle = css(shade(k % 2 ? GOLD : LAPIS, 1.05 - k * 0.05));
    ctx.fillRect(foot.x - cw / 2, foot.y - h + 6 - k * 2.2, cw, 2.2);
  }
}

