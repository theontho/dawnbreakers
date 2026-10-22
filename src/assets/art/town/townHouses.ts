import type Phaser from 'phaser';
import { footprintBox, groundPoint, paintTexture, shade, type Ctx, type IsoBox } from '../canvasKit';
import { wornPlaster } from '../facade';
import { band, dome } from '../ornaments';
import { pottedPlant } from '../streetLife';
import { subBox } from '../structureParts';
import { awningOver, courtFloor, doorOf, jarAt, orosi, threshold, thresholdRight, windowOf, type TownHouseStyle } from './houseKit';
import { roofFloor, spout, stairHut, townBlock, townDoor, townWindow, TURQUOISE, windcatcherTower } from './townKit';
import { crown } from './trees';

/**
 * Persian town houses at true scale, as they meet a lane: a plain street
 * wall a storey high (80 to 90 px), one framed door with its step, a few
 * small windows set high, beam ends and spouts under the parapet. Family
 * life is turned inward, so what shows over the wall is a raised upper
 * room, a wind-catcher, a mud dome or the crown of a courtyard tree.
 */

type HouseDraw = (ctx: Ctx, box: IsoBox, s: TownHouseStyle) => void;

export interface HouseVariant {
  draw: HouseDraw;
  /** Height of the tallest part above the ground, for the texture size. */
  top: number;
  style: TownHouseStyle;
}

// The small house (5 x 4): 160 x 128 px of ground --------------------------------

/** One storey, a stair hut on the roof, a bench by the door. */
const smallPlain: HouseDraw = (ctx, box, s) => {
  const main = subBox(box, 0, box.w - 8, 10, box.d, 86);
  const doorU = 104;
  townBlock(ctx, main, {
    wall: s.wall, seed: s.seed, material: s.material, beams: 14,
    left: (c, _w, h, l) => {
      wornPlaster(c, 10, h * 0.45, 22, 14, s.wall, l, s.seed + 1);
      townWindow(c, 48, h, 56, windowOf(s, l, true));
      spout(c, 26, 10, l);
      townDoor(c, doorU, h, doorOf(s, l));
    },
    right: (c, w, h, l) => townWindow(c, w * 0.55, h, 56, windowOf(s, l)),
  });
  stairHut(ctx, roofFloor(main, 54, main.d - 52), s.wall, s.frame, s.seed + 21);
  threshold(ctx, box, doorU, 10, s, 'left');
  jarAt(ctx, box, box.w - 4, 24);
};

/** A raised upper room (bālākhāna) flush with the street front, its sash window over the lane. */
const smallBalakhana: HouseDraw = (ctx, box, s) => {
  const main = subBox(box, 0, box.w - 6, 8, box.d, 84);
  const doorQ = 58;
  townBlock(ctx, main, {
    wall: s.wall, seed: s.seed, material: s.material,
    left: (c, w, h, l) => {
      townWindow(c, w * 0.72, h, 54, windowOf(s, l));
      wornPlaster(c, w * 0.5, h * 0.55, 18, 12, s.wall, l, s.seed + 2);
      spout(c, w - 20, 8, l);
    },
    right: (c, _w, h, l) => townDoor(c, doorQ, h, doorOf(s, l)),
  });
  const upper = subBox(box, 4, 80, 8, 74, 72, 84);
  townBlock(ctx, upper, {
    wall: s.wall, seed: s.seed + 31, material: s.material, plinth: false, shadow: false, beams: 10,
    left: (c, w, h, l) => {
      band(c, w, h - 4, 4, shade(s.wall, 0.8), l);
      orosi(c, w / 2 - 15, h - 56, 30, 42, s.frame, l, s.lit);
    },
    right: (c, w, h, l) => {
      band(c, w, h - 4, 4, shade(s.wall, 0.8), l);
      townWindow(c, w / 2, h, 22, windowOf(s, l, false, false));
    },
  });
  thresholdRight(ctx, box, 8 + doorQ, box.w - 6);
  jarAt(ctx, box, 30, 4, 8);
};

/** A humble mud house: a mud dome over the main room and a reed awning over the door. */
const smallDomed: HouseDraw = (ctx, box, s) => {
  const main = subBox(box, 0, box.w - 10, 30, box.d, 80);
  const doorU = 72;
  townBlock(ctx, main, {
    wall: s.wall, seed: s.seed, material: 'mud', beams: 12,
    left: (c, w, h, l) => {
      townDoor(c, doorU, h, doorOf(s, l));
      townWindow(c, w - 34, h, 52, windowOf(s, l, true));
      spout(c, 18, 9, l);
    },
    right: (c, w, h, l) => {
      wornPlaster(c, w * 0.3, h * 0.4, 20, 14, s.wall, l, s.seed + 3);
      townWindow(c, w * 0.7, h, 52, windowOf(s, l));
    },
  });
  const at = roofFloor(main, main.w * 0.5, main.d * 0.55);
  dome(ctx, at.x, at.y, 38, { color: shade(s.wall, 0.95), drum: 6, bulb: 0.92 });
  awningOver(ctx, box, doorU - 30, doorU + 30, 6, 30, 64, s.seed + 4);
  threshold(ctx, box, doorU, 30, s);
  const pot = groundPoint(box, doorU + 44, 24);
  pottedPlant(ctx, pot.x, pot.y, 6, 0x4a7a40, s.seed + 5, 0xd84a4a);
  jarAt(ctx, box, doorU - 42, 22);
};

// The town house (6 x 5): 192 x 160 px of ground ---------------------------------

/** A two-storey block at the back over a one-storey front range with the door. */
const twoStorey: HouseDraw = (ctx, box, s) => {
  const back = subBox(box, 0, box.w - 6, 64, box.d, 164);
  townBlock(ctx, back, {
    wall: s.wall, seed: s.seed, material: s.material, beams: 12,
    left: (c, w, h, l) => {
      band(c, w, h - 84, 4, shade(s.wall, 0.82), l);
      orosi(c, w * 0.3 - 14, h - 150, 28, 40, s.frame, l, s.lit);
      townWindow(c, w * 0.72, h, 112, windowOf(s, l));
    },
    right: (c, w, h, l) => {
      band(c, w, h - 84, 4, shade(s.wall, 0.82), l);
      townWindow(c, w * 0.35, h, 112, windowOf(s, l));
      townWindow(c, w * 0.7, h, 112, windowOf(s, l, true));
      townWindow(c, w * 0.5, h, 54, windowOf(s, l));
    },
  });
  windcatcherTower(ctx, roofFloor(back, 48, back.d - 42), 34, 70, shade(s.wall, 0.97), s.seed + 11);
  const front = subBox(box, 6, box.w - 14, 6, 64, 84);
  const doorU = 116;
  townBlock(ctx, front, {
    wall: s.wall, seed: s.seed + 23, material: s.material, beams: 12,
    left: (c, w, h, l) => {
      townDoor(c, doorU, h, doorOf(s, l));
      townWindow(c, 44, h, 54, windowOf(s, l));
      spout(c, w - 18, 8, l);
    },
    right: (c, w, h, l) => wornPlaster(c, w * 0.3, h * 0.5, 16, 12, s.wall, l, s.seed + 4),
  });
  threshold(ctx, box, 6 + doorU, 6, s, 'left');
  jarAt(ctx, box, box.w - 6, 30);
};

/** One tall storey under a wind-catcher; the door has a tiled panel and benches either side. */
const windcatcherHouse: HouseDraw = (ctx, box, s) => {
  const main = subBox(box, 0, box.w - 6, 12, box.d, 92);
  const doorU = 96;
  townBlock(ctx, main, {
    wall: s.wall, seed: s.seed, material: s.material, beams: 14,
    left: (c, w, h, l) => {
      townDoor(c, doorU, h, doorOf(s, l, TURQUOISE));
      townWindow(c, 32, h, 58, windowOf(s, l));
      townWindow(c, w - 32, h, 58, windowOf(s, l, true));
      spout(c, 60, 9, l);
      spout(c, w - 60, 9, l);
    },
    right: (c, w, h, l) => {
      townWindow(c, w * 0.4, h, 58, windowOf(s, l));
      wornPlaster(c, w * 0.66, h * 0.36, 20, 14, s.wall, l, s.seed + 6);
    },
  });
  windcatcherTower(ctx, roofFloor(main, 64, main.d - 50), 40, 96, shade(s.wall, 0.97), s.seed + 12);
  const at = roofFloor(main, main.w * 0.7, main.d * 0.35);
  dome(ctx, at.x, at.y, 26, { color: shade(s.wall, 0.95), drum: 4, bulb: 0.9 });
  threshold(ctx, box, doorU, 12, s, 'both');
  const pot = roofFloor(main, main.w - 24, 20);
  pottedPlant(ctx, pot.x, pot.y, 6, 0x4a7a40, s.seed + 7, 0xd84a4a);
};

/** A street wall with its gateway, a little court, and the two-storey house beyond it. */
const courtGlimpse: HouseDraw = (ctx, box, s) => {
  const W = box.w;
  const back = subBox(box, 0, W, 104, box.d, 160);
  townBlock(ctx, back, {
    wall: s.wall, seed: s.seed, material: s.material, beams: 12,
    left: (c, w, h, l) => {
      band(c, w, h - 82, 4, shade(s.wall, 0.82), l);
      orosi(c, w / 2 - 16, h - 150, 32, 44, s.frame, l, s.lit);
      townWindow(c, w * 0.2, h, 110, windowOf(s, l));
      townWindow(c, w * 0.8, h, 110, windowOf(s, l));
    },
    right: (c, w, h, l) => townWindow(c, w / 2, h, 110, windowOf(s, l)),
  });
  courtFloor(ctx, box, 0, W - 10, 18, 104, 0xb08a64, s.seed + 9);
  const root = groundPoint(box, 92, 62);
  crown(ctx, root.x, root.y - 96, 44, 36, { leaf: 0x3f6a34, seed: s.seed + 8, fruit: 0xc8402a });
  const side = subBox(box, W - 10, W, 18, 104, 90);
  townBlock(ctx, side, { wall: s.wall, seed: s.seed + 13, material: s.material, roof: 'flat', coping: shade(s.wall, 1.1) });
  const street = subBox(box, 0, W, 8, 18, 90);
  townBlock(ctx, street, {
    wall: s.wall, seed: s.seed + 17, material: s.material, roof: 'flat', coping: shade(s.wall, 1.1),
    left: (c, w, h, l) => {
      wornPlaster(c, w * 0.12, h * 0.5, 20, 14, s.wall, l, s.seed + 5);
      spout(c, w * 0.3, 6, l);
    },
  });
  // The gateway (sar-dar) stands a little proud and a little higher than the wall.
  const doorP = 132;
  const gate = subBox(box, doorP - 26, doorP + 26, 6, 22, 110);
  townBlock(ctx, gate, {
    wall: shade(s.wall, 1.04), seed: s.seed + 19, material: s.material, merlons: true, roof: 'flat',
    left: (c, w, h, l) => townDoor(c, w / 2, h, doorOf(s, l, TURQUOISE)),
  });
  threshold(ctx, box, doorP, 6, s);
};

export const SMALL_HOUSES: readonly HouseVariant[] = [
  { draw: smallPlain, top: 160, style: { wall: 0xc39a6c, door: 0x5b3a20, frame: 0x8a6440, seed: 401, shutters: 0x3f6a6a, lit: true } },
  { draw: smallBalakhana, top: 170, style: { wall: 0xd2b48a, door: 0x2f5f6e, frame: 0x7a5a38, seed: 413, lit: true } },
  { draw: smallDomed, top: 140, style: { wall: 0xa98256, door: 0x4a3420, frame: 0x6a4a2c, seed: 427, material: 'mud' } },
];

export const TOWN_HOUSES: readonly HouseVariant[] = [
  { draw: twoStorey, top: 250, style: { wall: 0xc8a47a, door: 0x6a3020, frame: 0x7a5a38, seed: 433, shutters: 0x5a3a24, lit: true } },
  { draw: windcatcherHouse, top: 205, style: { wall: 0xbf9a6a, door: 0x2f5f6e, frame: 0x8a6440, seed: 449, lit: true } },
  { draw: courtGlimpse, top: 190, style: { wall: 0xd6c3a0, door: 0x5b3a20, frame: 0x8a6440, seed: 457, lit: true } },
];

/** Paints every variant of a house def: `key`, `key~1`, `key~2`... */
export function paintHouseSet(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, variants: readonly HouseVariant[]): void {
  variants.forEach((v, i) => {
    const { box, texW, texH } = footprintBox(cellsW, cellsD, v.top, 8);
    paintTexture(scene, i === 0 ? key : `${key}~${i}`, texW, texH, ctx => v.draw(ctx, box, v.style));
  });
}
