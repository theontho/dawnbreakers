import { css, groundPoint, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { wornPlaster } from './facade';
import { brick, planks } from './materials';
import { archPath, band, dome } from './ornaments';
import { slab } from './massing';
import { subBox } from './structureParts';
import { doorOf, jarAt, threshold, thresholdRight, type TownHouseStyle } from './town/houseKit';
import type { HouseVariant } from './town/townHouses';
import { joinedMass, type MassPart } from './town/joinedMass';
import { roofFloor, spout, stairHut, townBlock, townDoor, TOWN_WINDOW, TIMBER } from './town/townKit';

/**
 * The prison quarter of Ṭihrán in August 1852, at true scale: mud-plastered
 * houses shut against the street, every door barred and every shutter
 * closed; bazaar shops behind plank shutters on their raised platforms;
 * and the broken street door of a plundered house. The sābāṭ over the lane
 * is in `tehranSabat.ts`, the western gate in `tehranGate.ts`.
 */

export const TEHRAN_MUD = 0x9c8466;
const BRICK = 0x9a7656;
const IRON = 0x2a2a2a;
const PALE_IRON = 0x8a867d;
const SILL = 0x8a8070;

/** A small window shut with two plank leaves and a bar, its sill `sill` px up. */
export function shutWindow(c: Ctx, cx: number, faceH: number, sill: number, l: number, seed: number): void {
  const { w, h } = TOWN_WINDOW;
  const x = cx - w / 2;
  const y = faceH - sill - h;
  c.fillStyle = css(shade(0x6a5038, l));
  c.fillRect(x - 2, y - 2, w + 4, h + 4);
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  planks(c, x + w, y + h, { base: 0x4a4038, light: l, seed }, true, 3);
  c.fillStyle = 'rgba(12,8,4,0.7)';
  c.fillRect(cx - 0.5, y, 1, h);
  c.restore();
  c.fillStyle = css(shade(IRON, l));
  c.fillRect(x - 1, y + h * 0.45, w + 2, 1.6);
  c.fillStyle = css(shade(SILL, l));
  c.fillRect(x - 3, y + h + 2, w + 6, 1.5);
}

/** A street door at true scale, barred across with a beam and padlocked, two boards nailed over it. */
export function barredDoor(c: Ctx, cx: number, base: number, s: TownHouseStyle, l: number): void {
  townDoor(c, cx, base, doorOf(s, l));
  const y = base - 26;
  c.fillStyle = css(shade(TIMBER, l * 0.9));
  c.fillRect(cx - 17, y, 34, 4);
  c.fillStyle = 'rgba(255,230,190,0.18)';
  c.fillRect(cx - 17, y, 34, 1);
  c.fillStyle = css(shade(PALE_IRON, l));
  c.fillRect(cx - 2, y + 4, 4, 5);
  c.strokeStyle = css(shade(PALE_IRON, l));
  c.lineWidth = 0.9;
  c.beginPath();
  c.arc(cx, y + 4, 1.6, Math.PI, 0);
  c.stroke();
  // Two boards nailed corner to corner across the leaves.
  c.strokeStyle = css(shade(0x7a6448, l));
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(cx - 11, base - 44);
  c.lineTo(cx + 11, base - 32);
  c.moveTo(cx + 11, base - 44);
  c.lineTo(cx - 11, base - 32);
  c.stroke();
}

type Draw = HouseVariant['draw'];

/** A shut house: a storey on the street with a raised upper room at the back, both shuttered. */
const shutHouse: Draw = (ctx, box, s) => {
  const doorU = 120;
  const back: MassPart = {
    p0: 0, p1: box.w - 40, q0: 56, q1: box.d, h: 150,
    spec: {
      wall: s.wall, seed: s.seed, material: 'mud', beams: 10,
      left: (c, w, h, l) => {
        band(c, w, h - 82, 4, shade(s.wall, 0.82), l);
        shutWindow(c, w * 0.3, h, 104, l, s.seed + 1);
        shutWindow(c, w * 0.62, h, 104, l, s.seed + 2);
        spout(c, w - 20, 8, l);
      },
      right: (c, w, h, l) => {
        band(c, w, h - 82, 4, shade(s.wall, 0.82), l);
        shutWindow(c, w * 0.5, h, 104, l, s.seed + 3);
        shutWindow(c, w * 0.5, h, 54, l, s.seed + 9);
      },
    },
  };
  const front: MassPart = {
    p0: 0, p1: box.w - 6, q0: 8, q1: 56, h: 86,
    spec: {
      wall: s.wall, seed: s.seed + 5, material: 'mud', beams: 12,
      left: (c, w, h, l) => {
        shutWindow(c, 40, h, 54, l, s.seed + 6);
        wornPlaster(c, 66, h * 0.5, 22, 14, s.wall, l, s.seed + 7);
        barredDoor(c, doorU, h, s, l);
        spout(c, w - 24, 8, l);
      },
      right: (c, w, h, l) => shutWindow(c, w * 0.5, h, 54, l, s.seed + 8),
    },
  };
  joinedMass(ctx, box, [back], [front]);
  const hut = subBox(box, 0, box.w - 40, 56, box.d, 150);
  stairHut(ctx, roofFloor(hut, 40, hut.d - 40), s.wall, s.frame, s.seed + 4);
  joinedMass(ctx, box, [front], [back]);
  threshold(ctx, box, doorU, 8, s, 'left');
  jarAt(ctx, box, box.w - 4, 24);
};

/** A low mud house under two domes, its door on the side lane, a reed fence where its court was. */
const domedHouse: Draw = (ctx, box, s) => {
  const main = subBox(box, 0, box.w - 8, 10, box.d - 20, 84);
  const doorQ = 52;
  townBlock(ctx, main, {
    wall: s.wall, seed: s.seed, material: 'mud', beams: 12,
    left: (c, w, h, l) => {
      shutWindow(c, w * 0.22, h, 52, l, s.seed + 1);
      shutWindow(c, w * 0.5, h, 52, l, s.seed + 2);
      wornPlaster(c, w * 0.7, h * 0.4, 26, 16, s.wall, l, s.seed + 3);
      spout(c, w * 0.36, 8, l);
      spout(c, w * 0.84, 8, l);
    },
    right: (c, _w, h, l) => barredDoor(c, doorQ, h, s, l),
  });
  for (const [p, r] of [[main.w * 0.32, 30], [main.w * 0.72, 26]] as const) {
    const at = roofFloor(main, p, main.d * 0.52);
    dome(ctx, at.x, at.y, r, { color: shade(s.wall, 0.96), drum: 5, bulb: 0.9 });
  }
  thresholdRight(ctx, box, 10 + doorQ, main.w);
  // Spoil from the house thrown out by the door: a broken jar, a torn mat.
  const mat = groundPoint(box, box.w - 2, 62);
  ctx.fillStyle = css(0xa88a58, 0.85);
  ctx.beginPath();
  ctx.ellipse(mat.x + 10, mat.y + 4, 13, 5, 0.46, 0, Math.PI * 2);
  ctx.fill();
  jarAt(ctx, box, box.w - 2, 104, 8);
};

export const TEHRAN_HOUSES: readonly HouseVariant[] = [
  { draw: shutHouse, top: 220, style: { wall: TEHRAN_MUD, door: 0x3a2a1c, frame: 0x6a5038, seed: 531, shutters: 0x4a4038 } },
  { draw: domedHouse, top: 140, style: { wall: 0xa48a68, door: 0x4a3424, frame: 0x6a5038, seed: 547 } },
];

/** A fired-brick arch frame set into the wall, its opening left as the current path. */
function brickArch(c: Ctx, x: number, base: number, width: number, height: number, light: number, seed: number): void {
  archPath(c, x - 5, base, width + 10, height + 5);
  c.save();
  c.clip();
  brick(c, x + width + 10, base, { base: BRICK, light, seed }, 3.5, 8);
  c.restore();
  archPath(c, x, base, width, height);
}

const SHOP_H = 78;
const PLATFORM_H = 12;

/**
 * A bazaar shop (2 x 2): a raised platform at the street, a brick arch
 * about 2 m wide filled with plank shutters, barred and padlocked, and the
 * reed blind rolled up under the beam ends.
 */
export function drawShutteredShop(ctx: Ctx, box: IsoBox): void {
  const shop = subBox(box, 0, box.w, 12, box.d, SHOP_H);
  townBlock(ctx, shop, {
    wall: TEHRAN_MUD, seed: 81, material: 'mud', plinth: false, beams: 6,
    left: (c, w, h, l) => {
      const aw = w - 16;
      const base = h - PLATFORM_H + 2;
      brickArch(c, 8, base, aw, 52, l, 83);
      c.save();
      c.clip();
      planks(c, w, h, { base: TIMBER, light: l, seed: 84 }, true, 4);
      c.fillStyle = 'rgba(20,12,6,0.4)';
      c.fillRect(w / 2 - 0.5, 0, 1, h);
      c.restore();
      c.fillStyle = css(shade(IRON, l));
      c.fillRect(6, base - 24, aw + 4, 2.5);
      c.fillStyle = css(shade(PALE_IRON, l));
      c.fillRect(w / 2 - 2.5, base - 22, 5, 6);
      // The reed blind, rolled and tied under the beam ends.
      c.fillStyle = css(shade(0xb8a070, l));
      c.fillRect(5, 13, w - 10, 4.5);
      c.fillStyle = css(shade(0x6a5a3a, l), 0.7);
      for (let u = 6; u < w - 6; u += 2) c.fillRect(u, 13, 0.6, 4.5);
      c.fillStyle = css(0x3a2a1a);
      c.fillRect(10, 12, 1, 6);
      c.fillRect(w - 11, 12, 1, 6);
    },
    right: (c, w, h, l) => {
      archPath(c, w / 2 - 6, h - 34, 12, 18);
      c.fillStyle = css(shade(TEHRAN_MUD, l * 0.6));
      c.fill();
    },
  });
  slab(ctx, subBox(box, 2, box.w - 2, 0, 14, PLATFORM_H), SILL, 86);
}

/** Texture size of the broken door: one cell of street wall with its portal. */
export const BROKEN_DOOR_TEX = { w: 80, h: 32 + 100 + 8 } as const;

/**
 * The street door of a plundered house (one cell, in a courtyard wall): one
 * leaf torn off its pivot and leaning, the other hanging open on the dark
 * of the passage, the bar split on the step. The door faces the lane on
 * its left face.
 */
export function drawBrokenDoor(ctx: Ctx): void {
  const cell: IsoBox = { x: 40, y: BROKEN_DOOR_TEX.h, w: 32, d: 32, h: 0 };
  const s: TownHouseStyle = { wall: 0xa88a62, door: 0x4a3424, frame: 0x6a5038, seed: 561 };
  const front = subBox(cell, -3, 35, 10, 22, 100);
  townBlock(ctx, front, {
    wall: s.wall, seed: s.seed, material: 'mud', roof: 'flat', coping: shade(s.wall, 1.1), beams: 10,
    left: (c, w, h, l) => {
      const cx = w / 2;
      // The doorway gapes: the passage dark behind it.
      townDoor(c, cx, h, { ...doorOf(s, l), door: 0x140c06 });
      archPath(c, cx - 10.5, h, 21, 46);
      c.fillStyle = css(0x0e0804);
      c.fill();
      // The right leaf still hangs, swung in on its pivot: only its edge shows.
      c.fillStyle = css(shade(s.door, l * 0.8));
      c.fillRect(cx + 4, h - 44, 6, 44);
      // Gouges round the lock and soot from a torch on the surround.
      c.fillStyle = 'rgba(16,10,4,0.55)';
      const rand = rng(s.seed + 3);
      for (let i = 0; i < 9; i++) c.fillRect(cx - 14 + rand() * 4, h - 30 + rand() * 12, 2, 1);
      const soot = c.createRadialGradient(cx + 8, h - 60, 1, cx + 8, h - 60, 16);
      soot.addColorStop(0, 'rgba(20,14,8,0.45)');
      soot.addColorStop(1, 'rgba(20,14,8,0)');
      c.fillStyle = soot;
      c.fillRect(cx - 10, h - 78, 36, 36);
    },
  });
  // The torn-off leaf, leaning against the wall left of the door: its foot
  // out on the lane, its head resting on the plaster.
  const foot = groundPoint(cell, 3, -6);
  ctx.save();
  ctx.translate(foot.x, foot.y);
  ctx.transform(1, 0.5, 0.22, 1, 0, 0);
  ctx.fillStyle = 'rgba(10,6,3,0.3)';
  ctx.fillRect(3, -40, 11, 40);
  ctx.translate(0, -42);
  ctx.beginPath();
  ctx.rect(0, 0, 11, 42);
  ctx.clip();
  planks(ctx, 11, 42, { base: s.door, light: 0.95, seed: s.seed + 5 }, true, 3);
  ctx.fillStyle = css(IRON, 0.8);
  ctx.fillRect(0, 10, 11, 1.5);
  ctx.fillRect(0, 30, 11, 1.5);
  ctx.restore();
  // The split bar on the step.
  const bar = groundPoint(cell, 20, -2);
  ctx.strokeStyle = css(TIMBER);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(bar.x - 10, bar.y - 1);
  ctx.lineTo(bar.x + 2, bar.y + 4);
  ctx.moveTo(bar.x + 5, bar.y + 3);
  ctx.lineTo(bar.x + 14, bar.y + 1);
  ctx.stroke();
}

