import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, outlineBox, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { gableRoof, shingleCover, thatchCover } from './gableRoof';
import { recessedDoor, wornPlaster } from './facade';
import { plaster, stone } from './materials';
import { walls } from './ornaments';
import { waterJar } from './streetLife';
import { liftedPoint, post, subBox } from './structureParts';
import { TOWN_DOOR, townWindow } from './town/townKit';
import { roundLog } from './timber';

/**
 * A woodcutter's cottage in the Mázindarán forest at true scale (5 x 4, about
 * 6 by 5 m): mud-plastered walls on a fieldstone base, framed in timber,
 * under a steep gable of rice straw whose deep eave, held on two posts,
 * keeps the rain off the door. The gable end is boarded; a jar stands by
 * the step. A town house of the plain (`TOWN_COTTAGE`) is the same house
 * whitewashed, under fired clay instead of straw.
 */

export interface CottageLook {
  wall: number;
  /** Rice-straw thatch, or the plain's fired clay roof tiles. */
  roof: 'thatch' | 'tile';
  roofColor: number;
  seed: number;
}

const FOREST_COTTAGE: CottageLook = { wall: 0xb89a72, roof: 'thatch', roofColor: 0x9a7e4a, seed: 901 };
export const TOWN_COTTAGE: CottageLook = { wall: 0xd8ccb0, roof: 'tile', roofColor: 0xa85a3a, seed: 931 };

const TIMBER = 0x4a3220;
const WALL_H = 74;
const RIDGE = 74;
const EAVE = 18;

export function paintMazandaranCottage(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, look: CottageLook = FOREST_COTTAGE): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, WALL_H + RIDGE, 24);
  paintTexture(scene, key, texW, texH, ctx => drawCottage(ctx, box, look));
}

function drawCottage(ctx: Ctx, box: IsoBox, look: CottageLook): void {
  const wall = look.wall;
  const s = look.seed;
  const house = subBox(box, 10, box.w - 8, EAVE + 6, box.d - 6, WALL_H);
  const base = subBox(box, 8, box.w - 6, EAVE + 4, box.d - 4, 10);
  groundShadow(ctx, base, 18, 0.3);
  walls(ctx, base, (c, w, h, l) => stone(c, w, h, { base: 0x7a7468, light: l, seed: s }, 5));
  outlineBox(ctx, base);
  const body = { ...house, y: house.y - 10, h: WALL_H - 10 };
  walls(ctx, body, (c, w, h, l) => {
    plaster(c, w, h, { base: wall, light: l, seed: s + 2 + (l === 1 ? 0 : 5) });
    frame(c, w, h, l);
  }, {
    left: (c, w, h, l) => {
      wornPlaster(c, w * 0.15, h * 0.5, 16, 12, wall, l, s + 4);
      recessedDoor(c, w * 0.5, h, { frame: TIMBER, door: 0x5a3c22, light: l, seed: s + 6, surround: shade(wall, 1.02), w: TOWN_DOOR.w, h: TOWN_DOOR.h });
      townWindow(c, w * 0.82, h, 30, { frame: TIMBER, light: l }, 12, 16);
    },
    right: (c, w, h, l) => townWindow(c, w * 0.5, h, 30, { frame: TIMBER, light: l, lit: true }, 12, 16),
  });
  outlineBox(ctx, body);
  gableRoof(ctx, house, { wallH: WALL_H, ridge: RIDGE, eave: EAVE, overhang: 8, cover: look.roof === 'thatch' ? thatchCover(look.roofColor, s + 18) : shingleCover(look.roofColor, s + 18), ridgeRoll: shade(look.roofColor, 0.8), seed: s + 12 });
  // The two posts that hold the eave, and life at the door.
  for (const p of [house.w * 0.12, house.w * 0.88]) {
    const foot = liftedPoint(house, p, -EAVE + 4, 0);
    post(ctx, foot.x, foot.y, WALL_H - 4, 4, TIMBER);
  }
  const jar = liftedPoint(house, house.w * 0.3, -8, 0);
  waterJar(ctx, jar.x, jar.y, 8, 0x9a6a4a);
  const a = liftedPoint(house, house.w * 0.68, -10, 1);
  const b = liftedPoint(house, house.w * 0.78, -4, 1);
  roundLog(ctx, a, b, 3.5, { ends: 'a', seed: s + 10 });
}

/** Dark timber framing showing through the plaster: sill, posts and a mid rail. */
function frame(c: Ctx, w: number, h: number, l: number): void {
  c.fillStyle = css(shade(TIMBER, l));
  c.fillRect(0, h - 4, w, 4);
  c.fillRect(0, 0, w, 4);
  c.fillRect(0, h * 0.45, w, 3);
  for (let u = 0; u <= w; u += 48) c.fillRect(Math.min(u, w - 4), 0, 4, h);
}
