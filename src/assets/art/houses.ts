import type Phaser from 'phaser';
import { baseCorners, CELL, css, footprintBox, groundShadow, outlineBox, paintTexture, polygon, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { plaster, planks, type Surface } from './materials';
import { band, beamEnds, dome, doorway, flatTop, latticeWindow, merlons, parapetRoof, walls, windcatcher } from './ornaments';

/**
 * Persian town houses: mud or lime plaster, few street windows, a heavy
 * arched door, beam ends under the parapet, and something on the roof (a
 * wind-catcher, a small mud dome, a stair hut). Variants keep a street of
 * twenty houses from looking stamped.
 */

export type RoofFeature = 'windcatcher' | 'dome' | 'stair' | 'none';

export interface HouseStyle {
  cellsW: number;
  cellsD: number;
  wallH: number;
  wall: number;
  door: number;
  frame: number;
  roof: RoofFeature;
  seed: number;
  beams?: boolean;
  crenellated?: boolean;
  /** A raised band suggesting a second storey. */
  storey?: boolean;
  litWindow?: boolean;
  shutters?: number;
}

const ROOF_DEPTH = 5;
const ROOF_INSET = 4;

/** Paints a house into `ctx` with its front-bottom corner at `box`. */
export function drawHouse(ctx: Ctx, box: IsoBox, style: HouseStyle): void {
  const s = (light: number, salt = 0): Surface => ({ base: style.wall, light, seed: style.seed + salt });
  groundShadow(ctx, box);
  walls(ctx, box, (c, w, h, light) => plaster(c, w, h, s(light, light === 1 ? 0 : 99)), {
    left: (c, w, h, l) => {
      const doorW = Math.min(16, w * 0.3);
      const doorX = w * (style.seed % 2 ? 0.58 : 0.34) - doorW / 2;
      if (style.storey) band(c, w, h * 0.42, 2, shade(style.wall, 0.82), l);
      if (style.beams) beamEnds(c, w, 4, l);
      doorway(c, doorX, h, doorW, Math.min(h * 0.62, 28), { frame: style.frame, door: style.door, light: l, seed: style.seed });
      // A niche for a lamp beside the door.
      const nicheX = doorX > w / 2 ? doorX - 12 : doorX + doorW + 7;
      latticeWindow(c, nicheX, h * 0.42 + (style.storey ? 4 : 0), 6, 8, { frame: style.frame, light: l, arched: true, lit: style.litWindow });
    },
    right: (c, w, h, l) => {
      if (style.storey) band(c, w, h * 0.42, 2, shade(style.wall, 0.82), l);
      if (style.beams) beamEnds(c, w, 4, l);
      const count = w > 50 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const x = (w / (count + 1)) * (i + 1) - 4;
        latticeWindow(c, x, style.storey ? h * 0.18 : h * 0.3, 8, 10, { frame: style.frame, light: l, shutters: style.shutters, lit: style.litWindow && i === count - 1 });
      }
    },
  });
  parapetRoof(ctx, box, shade(style.wall, 0.96), { base: shade(style.wall, 0.78), light: 1.05, seed: style.seed + 3 }, ROOF_INSET, ROOF_DEPTH);
  if (style.crenellated) merlons(ctx, box, style.wall);
  outlineBox(ctx, box);
  roofFeature(ctx, box, style);
}

function roofFeature(ctx: Ctx, box: IsoBox, style: HouseStyle): void {
  const onFloor = (p: number, q: number) => {
    const pt = roofPoint(box, p, q);
    return { x: pt.x, y: pt.y + ROOF_DEPTH };
  };
  switch (style.roof) {
    case 'windcatcher': {
      const size = 14;
      const at = onFloor(size + ROOF_INSET + 2, box.d - size - ROOF_INSET - 2);
      windcatcher(ctx, { x: at.x, y: at.y, w: size, d: size, h: 30 }, shade(style.wall, 0.95), style.seed + 11,
        (c, w, h, surf) => plaster(c, w, h, surf));
      break;
    }
    case 'dome': {
      const at = onFloor(box.w / 2 - 2, box.d / 2 + 4);
      dome(ctx, at.x, at.y, Math.min(box.w, box.d) * 0.26, { color: shade(style.wall, 0.95), drum: 3, bulb: 0.9 });
      break;
    }
    case 'stair': {
      const at = onFloor(16 + ROOF_INSET + 2, box.d - 14 - ROOF_INSET - 4);
      const hut: IsoBox = { x: at.x, y: at.y, w: 16, d: 14, h: 15 };
      walls(ctx, hut, (c, w, h, light) => plaster(c, w, h, { base: style.wall, light, seed: style.seed + 21 }), {
        left: (c, w, h, l) => doorway(c, w / 2 - 4, h, 8, 12, { frame: style.frame, light: l, open: true }),
      });
      flatTop(ctx, hut, style.wall);
      outlineBox(ctx, hut);
      break;
    }
    case 'none':
      break;
  }
}

/** Paint a house texture of the given footprint. */
export function paintHouse(scene: Phaser.Scene, key: string, style: HouseStyle): void {
  const topPad = style.roof === 'windcatcher' ? 44 : style.roof === 'dome' ? 26 : style.roof === 'stair' ? 22 : 10;
  const { box, texW, texH } = footprintBox(style.cellsW, style.cellsD, style.wallH, topPad);
  paintTexture(scene, key, texW, texH, ctx => drawHouse(ctx, box, style));
}

/** The four looks of the generic `house` object; index 0 is the base texture. */
export const HOUSE_VARIANTS: ReadonlyArray<Omit<HouseStyle, 'cellsW' | 'cellsD'>> = [
  { wallH: 46, wall: 0xb88d5c, door: 0x2f5f6e, frame: 0x8a6440, roof: 'windcatcher', seed: 11, beams: true },
  { wallH: 42, wall: 0xd6cbb0, door: 0x5b3a20, frame: 0xa08868, roof: 'dome', seed: 23, beams: true, shutters: 0x3f6a6a },
  { wallH: 54, wall: 0xc39a7a, door: 0x6a3020, frame: 0x8a5a3a, roof: 'none', seed: 37, storey: true, crenellated: true, litWindow: true },
  { wallH: 40, wall: 0xa98858, door: 0x4a3420, frame: 0x7a5a38, roof: 'stair', seed: 41, beams: true },
];

export function paintHouseVariants(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  HOUSE_VARIANTS.forEach((v, i) => paintHouse(scene, i === 0 ? key : `${key}~${i}`, { ...v, cellsW, cellsD }));
}

/** Wooden market stall with a striped cloth awning and goods on the counter. */
export function paintStall(scene: Phaser.Scene, key: string, cloth: number, stripe: number, goods: readonly number[], seed: number): void {
  const { box, texW, texH } = footprintBox(1, 1, 34, 14);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 4, 0.22);
    // Counter: a low plank box.
    const counter: IsoBox = { ...box, h: 14 };
    walls(ctx, counter, (c, w, h, light) => planks(c, w, h, { base: 0x7a5232, light, seed }, false, 4));
    flatTop(ctx, counter, 0x8a6240);
    outlineBox(ctx, counter);
    // Goods: pots, bolts of cloth and heaped spice.
    const rand = (n: number) => ((seed * 9301 + n * 49297) % 233280) / 233280;
    for (let i = 0; i < 5; i++) {
      const pt = roofPoint(counter, 5 + rand(i) * (CELL - 10), 5 + rand(i + 7) * (CELL - 10));
      ctx.fillStyle = css(goods[i % goods.length]!);
      ctx.beginPath();
      ctx.ellipse(pt.x, pt.y - 2, 3.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,200,0.35)';
      ctx.fillRect(pt.x - 1.5, pt.y - 4, 1.2, 1);
    }
    // Corner posts at the three visible corners.
    const [front, right, , left] = baseCorners(box);
    ctx.fillStyle = css(0x4a2e18);
    for (const c of [left!, front!, right!]) ctx.fillRect(c.x - 1, c.y - box.h - 6, 2, box.h + 6);
    // Sloping awning, higher at the back, striped front to back.
    const awning: IsoBox = { x: box.x, y: box.y - box.h - 4, w: box.w + 4, d: box.d + 4, h: 0 };
    const lift = 9;
    const stripeW = awning.w / 6;
    for (let i = 0; i < 6; i++) {
      const a = roofPoint(awning, i * stripeW, 0);
      const b = roofPoint(awning, (i + 1) * stripeW, 0);
      const c = roofPoint(awning, (i + 1) * stripeW, awning.d);
      const d = roofPoint(awning, i * stripeW, awning.d);
      polygon(ctx, [a, b, { x: c.x, y: c.y - lift }, { x: d.x, y: d.y - lift }]);
      ctx.fillStyle = css(shade(i % 2 ? stripe : cloth, 1.05));
      ctx.fill();
      // Scalloped valance along the front edge.
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + 6, a.x, a.y);
      ctx.fillStyle = css(shade(i % 2 ? stripe : cloth, 0.8));
      ctx.fill();
    }
    const front0 = roofPoint(awning, 0, 0);
    const front1 = roofPoint(awning, awning.w, 0);
    const back1 = roofPoint(awning, awning.w, awning.d);
    const back0 = roofPoint(awning, 0, awning.d);
    ctx.strokeStyle = 'rgba(30,15,5,0.6)';
    ctx.lineWidth = 0.8;
    polygon(ctx, [front0, front1, { x: back1.x, y: back1.y - lift }, { x: back0.x, y: back0.y - lift }]);
    ctx.stroke();
  });
}
