import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, outlineBox, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { recessedDoor, wornPlaster } from './facade';
import { gableRoof, shingleCover } from './gableRoof';
import { plaster, stone } from './materials';
import { walls } from './ornaments';
import { waterJar } from './streetLife';
import { liftedPoint, post, subBox } from './structureParts';
import { TOWN_DOOR, townWindow } from './town/townKit';

/**
 * The house of the late Vazír at Tákur in Núr, at true scale (9 x 6, about
 * 12 by 8 m): what the flood left of it. Two storeys of lime plaster framed
 * in dark timber on a fieldstone base, the upper storey opening to the
 * valley in a columned verandah (tālār) under a steep gable of split-oak
 * shingles, as the great houses of the Mázindarán hills are built. The
 * ground-floor door stands under the verandah; one upper window is lit.
 * The footings of the half the torrent carried away are a separate prop.
 */

const WALL = 0xd6c6a6;
const TIMBER = 0x3e2a1a;
const SHINGLE = 0x7a6a58;
const PLINTH = 14;
const GROUND = 78;
const UPPER = 84;
const RIDGE = 84;
const EAVE = 22;

export function paintTakurMansion(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, PLINTH + GROUND + UPPER + RIDGE, 26);
  paintTexture(scene, key, texW, texH, ctx => drawMansion(ctx, box));
}

function drawMansion(ctx: Ctx, box: IsoBox): void {
  const house = subBox(box, 10, box.w - 8, EAVE + 6, box.d - 6, PLINTH + GROUND + UPPER);
  const base = subBox(box, 8, box.w - 6, EAVE + 4, box.d - 4, PLINTH);
  groundShadow(ctx, base, 20, 0.32);
  walls(ctx, base, (c, w, h, l) => stone(c, w, h, { base: 0x7a7468, light: l, seed: 941 }, 5));
  outlineBox(ctx, base);

  const ground: IsoBox = { ...house, y: house.y - PLINTH, h: GROUND };
  walls(ctx, ground, (c, w, h, l) => {
    plaster(c, w, h, { base: WALL, light: l, seed: 943 + (l === 1 ? 0 : 5) });
    frame(c, w, h, l);
  }, {
    left: (c, w, h, l) => {
      wornPlaster(c, w * 0.12, h * 0.55, 18, 12, WALL, l, 945);
      recessedDoor(c, w * 0.42, h, { frame: TIMBER, door: 0x4a301c, light: l, seed: 947, surround: shade(WALL, 1.02), w: TOWN_DOOR.w, h: TOWN_DOOR.h });
      for (const u of [0.18, 0.66, 0.84]) townWindow(c, w * u, h, 32, { frame: TIMBER, light: l, shutters: 0x4a3a2a }, 12, 18);
    },
    right: (c, w, h, l) => townWindow(c, w * 0.5, h, 32, { frame: TIMBER, light: l }, 12, 18),
  });
  outlineBox(ctx, ground);

  const upper: IsoBox = { ...house, y: house.y - PLINTH - GROUND, h: UPPER };
  walls(ctx, upper, (c, w, h, l) => {
    plaster(c, w, h, { base: WALL, light: l, seed: 951 + (l === 1 ? 0 : 5) });
    frame(c, w, h, l);
  }, {
    left: (c, w, h, l) => verandah(c, w, h, l),
    right: (c, w, h, l) => townWindow(c, w * 0.5, h, 26, { frame: TIMBER, light: l, lit: true }, 12, 18),
  });
  outlineBox(ctx, upper);

  gableRoof(ctx, house, {
    wallH: PLINTH + GROUND + UPPER, ridge: RIDGE, eave: EAVE, overhang: 10,
    cover: shingleCover(SHINGLE, 957), ridgeRoll: shade(SHINGLE, 0.7), seed: 959,
  });
  // The posts that carry the eave, and the life at the door.
  for (const p of [house.w * 0.06, house.w * 0.66, house.w * 0.94]) {
    const foot = liftedPoint(house, p, -EAVE + 4, 0);
    post(ctx, foot.x, foot.y, PLINTH + GROUND + UPPER - 6, 4, TIMBER);
  }
  const jar = liftedPoint(house, house.w * 0.3, -8, 0);
  waterJar(ctx, jar.x, jar.y, 8, 0x9a6a4a);
}

/** Dark timber framing in the plaster: sill, head, a mid rail and posts. */
function frame(c: Ctx, w: number, h: number, l: number): void {
  c.fillStyle = css(shade(TIMBER, l));
  c.fillRect(0, h - 4, w, 4);
  c.fillRect(0, 0, w, 4);
  c.fillRect(0, h * 0.45, w, 3);
  for (let u = 0; u <= w; u += 40) c.fillRect(Math.min(u, w - 4), 0, 4, h);
}

/** The upper verandah: deep shade within, turned posts, a balustrade along the front. */
function verandah(c: Ctx, w: number, h: number, l: number): void {
  const x0 = 6;
  const x1 = w - 6;
  const top = 8;
  const g = c.createLinearGradient(0, top, 0, h);
  g.addColorStop(0, css(0x1e140c));
  g.addColorStop(1, css(0x3a2818));
  c.fillStyle = g;
  c.fillRect(x0, top, x1 - x0, h - top - 4);
  // The back wall of the verandah: a lit doorway into the upper room.
  c.fillStyle = css(shade(WALL, l * 0.55));
  c.fillRect(x0, top + 6, x1 - x0, h - top - 10);
  c.fillStyle = css(0x2a1c10);
  c.fillRect(w * 0.42 - 9, h - 4 - 46, 18, 46);
  c.fillStyle = css(0xe0a860, 0.55);
  c.fillRect(w * 0.42 - 7, h - 4 - 44, 14, 44);
  // Posts and the beam they carry.
  c.fillStyle = css(shade(TIMBER, l * 1.2));
  c.fillRect(x0, top, x1 - x0, 5);
  for (let u = x0; u <= x1 - 4; u += (x1 - x0 - 4) / 6) {
    c.fillRect(u, top, 4, h - top - 4);
    c.fillStyle = css(shade(0x8a6440, l), 0.7);
    c.fillRect(u, top, 1, h - top - 4);
    c.fillStyle = css(shade(TIMBER, l * 1.2));
  }
  // Balustrade.
  const rail = h - 24;
  c.fillRect(x0, rail, x1 - x0, 3);
  for (let u = x0 + 3; u < x1; u += 4) c.fillRect(u, rail + 3, 1.5, 17);
}

/**
 * The footings of the half of the house the flood took: a broken course of
 * fieldstone, a charred beam end, grass and ferns grown up through the
 * floor (one cell, a prop).
 */
export function paintFloodFootings(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 16, 6);
  paintTexture(scene, key, texW, texH, ctx => {
    const course = subBox(box, 2, 30, 4, 28, 9);
    walls(ctx, course, (c, w, h, l) => stone(c, w, h, { base: 0x6e6a60, light: l, seed: 961 }, 4));
    // Broken top: the stones step down toward the front.
    ctx.fillStyle = css(0x5a7a3a, 0.85);
    for (let i = 0; i < 9; i++) {
      const at = liftedPoint(course, 4 + i * 3, 6 + ((i * 7) % 15), 9);
      ctx.fillRect(at.x - 1, at.y - 3, 2, 4);
    }
    const a = liftedPoint(course, 6, 20, 10);
    ctx.strokeStyle = css(0x2a1c12);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x + 14, a.y - 3);
    ctx.stroke();
  });
}
