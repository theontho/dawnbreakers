import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, outlineBox, paintTexture, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { recessedDoor, wornPlaster } from './facade';
import { planks, plaster, stone } from './materials';
import { LIGHT, walls } from './ornaments';
import { waterJar } from './streetLife';
import { liftedPoint, onPlane, post, subBox, type Pt } from './structureParts';
import { TOWN_DOOR, townWindow } from './town/townKit';
import { roundLog } from './timber';

/**
 * A woodcutter's cottage in the Mázindarán forest at true scale (5 x 4, about
 * 6 by 5 m): mud-plastered walls on a fieldstone base, framed in timber,
 * under a steep gable of rice straw whose deep eave, held on two posts,
 * keeps the rain off the door. The gable end is boarded; a jar stands by
 * the step.
 */

const WALL = 0xb89a72;
const TIMBER = 0x4a3220;
const THATCH = 0x9a7e4a;
const WALL_H = 74;
const RIDGE = 74;
const EAVE = 18;

export function paintMazandaranCottage(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, WALL_H + RIDGE, 24);
  paintTexture(scene, key, texW, texH, ctx => drawCottage(ctx, box));
}

function drawCottage(ctx: Ctx, box: IsoBox): void {
  const house = subBox(box, 10, box.w - 8, EAVE + 6, box.d - 6, WALL_H);
  const base = subBox(box, 8, box.w - 6, EAVE + 4, box.d - 4, 10);
  groundShadow(ctx, base, 18, 0.3);
  walls(ctx, base, (c, w, h, l) => stone(c, w, h, { base: 0x7a7468, light: l, seed: 901 }, 5));
  outlineBox(ctx, base);
  const body = { ...house, y: house.y - 10, h: WALL_H - 10 };
  walls(ctx, body, (c, w, h, l) => {
    plaster(c, w, h, { base: WALL, light: l, seed: 903 + (l === 1 ? 0 : 5) });
    frame(c, w, h, l);
  }, {
    left: (c, w, h, l) => {
      wornPlaster(c, w * 0.15, h * 0.5, 16, 12, WALL, l, 905);
      recessedDoor(c, w * 0.5, h, { frame: TIMBER, door: 0x5a3c22, light: l, seed: 907, surround: shade(WALL, 1.02), w: TOWN_DOOR.w, h: TOWN_DOOR.h });
      townWindow(c, w * 0.82, h, 30, { frame: TIMBER, light: l }, 12, 16);
    },
    right: (c, w, h, l) => townWindow(c, w * 0.5, h, 30, { frame: TIMBER, light: l, lit: true }, 12, 16),
  });
  outlineBox(ctx, body);
  roof(ctx, house);
  // The two posts that hold the eave, and life at the door.
  for (const p of [house.w * 0.12, house.w * 0.88]) {
    const foot = liftedPoint(house, p, -EAVE + 4, 0);
    post(ctx, foot.x, foot.y, WALL_H - 4, 4, TIMBER);
  }
  const jar = liftedPoint(house, house.w * 0.3, -8, 0);
  waterJar(ctx, jar.x, jar.y, 8, 0x9a6a4a);
  const a = liftedPoint(house, house.w * 0.68, -10, 1);
  const b = liftedPoint(house, house.w * 0.78, -4, 1);
  roundLog(ctx, a, b, 3.5, { ends: 'a', seed: 911 });
}

/** Dark timber framing showing through the plaster: sill, posts and a mid rail. */
function frame(c: Ctx, w: number, h: number, l: number): void {
  c.fillStyle = css(shade(TIMBER, l));
  c.fillRect(0, h - 4, w, 4);
  c.fillRect(0, 0, w, 4);
  c.fillRect(0, h * 0.45, w, 3);
  for (let u = 0; u <= w; u += 48) c.fillRect(Math.min(u, w - 4), 0, 4, h);
}

/** A steep gable of rice straw, its ridge running along the front, the boarded gable to the east. */
function roof(ctx: Ctx, house: IsoBox): void {
  const { w, d } = house;
  const z0 = WALL_H;
  const z1 = WALL_H + RIDGE;
  const at = (p: number, q: number, z: number): Pt => liftedPoint(house, p, q, z);
  // Boarded gable end on the shaded wall.
  const gable = [at(w, 0, z0), at(w, d, z0), at(w, d / 2, z1)];
  ctx.beginPath();
  gable.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
  ctx.closePath();
  ctx.save();
  ctx.clip();
  onPlane(ctx, at(w, 0, z1), at(w, d, z1), at(w, 0, z0), d, RIDGE, (fw, fh) => planks(ctx, fw, fh, { base: 0x6b4a2c, light: LIGHT.right, seed: 913 }, true, 6));
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,10,4,0.75)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // The front slope, from the eave over the door up to the ridge.
  const o = 8;
  const slope = (fw: number, fh: number) => thatch(fw, fh);
  const eaveL = at(-o, -EAVE, z0 - 6);
  const eaveR = at(w + o, -EAVE, z0 - 6);
  const ridgeL = at(-o, d / 2, z1);
  const len = w + o * 2;
  const rise = Math.hypot(d / 2 + EAVE, RIDGE + 6);
  onPlane(ctx, ridgeL, at(w + o, d / 2, z1), eaveL, len, rise, slope);
  ctx.strokeStyle = 'rgba(20,10,4,0.8)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(eaveL.x, eaveL.y);
  ctx.lineTo(eaveR.x, eaveR.y);
  const ridgeR = at(w + o, d / 2, z1);
  ctx.lineTo(ridgeR.x, ridgeR.y);
  ctx.lineTo(ridgeL.x, ridgeL.y);
  ctx.closePath();
  ctx.stroke();
  // A ridge roll of bound straw.
  roundLog(ctx, { x: ridgeL.x, y: ridgeL.y - 2 }, { x: ridgeR.x, y: ridgeR.y - 2 }, 3.5, { ends: 'none', bark: shade(THATCH, 0.8), seed: 917 });

  function thatch(fw: number, fh: number): void {
    const rand = rng(919);
    const g = ctx.createLinearGradient(0, 0, 0, fh);
    g.addColorStop(0, css(shade(THATCH, LIGHT.roof * 0.95)));
    g.addColorStop(1, css(shade(THATCH, 0.8)));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, fw, fh);
    for (let i = 0; i < fw * fh * 0.06; i++) {
      const u = rand() * fw;
      const v = rand() * fh;
      ctx.strokeStyle = css(shade(THATCH, 0.6 + rand() * 0.7), 0.7);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(u, v);
      ctx.lineTo(u + (rand() - 0.5) * 1.5, v + 5 + rand() * 6);
      ctx.stroke();
    }
    // Courses of straw, and moss where the damp sits.
    ctx.fillStyle = 'rgba(40,28,12,0.35)';
    for (let v = 14; v < fh; v += 14) ctx.fillRect(0, v, fw, 1.5);
    ctx.fillStyle = 'rgba(70,100,50,0.35)';
    for (let i = 0; i < 12; i++) ctx.fillRect(rand() * fw, fh * 0.5 + rand() * fh * 0.5, 10 + rand() * 14, 3);
    // The ragged hem of the eave.
    ctx.fillStyle = css(shade(THATCH, 0.65));
    for (let u = 0; u < fw; u += 3) ctx.fillRect(u, fh - 3, 2, 3 + rand() * 3);
  }
}
