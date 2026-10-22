import type Phaser from 'phaser';
import type { BuildingFaces } from '../walls';
import { footprintBox, groundPoint, paintTexture, shade, type Ctx, type IsoBox } from '../canvasKit';
import { wornPlaster } from '../facade';
import { band, dome } from '../ornaments';
import { pottedPlant } from '../streetLife';
import { subBox } from '../structureParts';
import { awningOver, courtFloor, doorOf, jarAt, orosi, threshold, thresholdRight, windowOf, type TownHouseStyle } from './houseKit';
import { joinedMass, type MassPart } from './joinedMass';
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
  /**
   * How far the walls stand in from the footprint's south (front-left) and
   * east (front-right) edges, so a garden wall running up to the house can
   * reach its face (see mapWalls). Flush with the footprint when omitted.
   */
  faces?: BuildingFaces;
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
  const p1 = box.w - 6;
  const doorQ = 58;
  const groundH = 84;
  // The upper room rises from the ground in the front wall, so the street
  // face runs on from the house beside it; the rest is one storey.
  const upperPart: MassPart = {
    p0: 0, p1: 80, q0: 8, q1: 74, h: groundH + 72,
    spec: {
      wall: s.wall, seed: s.seed, material: s.material, beams: 10,
      left: (c, w, h, l) => {
        wornPlaster(c, 66, h - 40, 18, 12, s.wall, l, s.seed + 2);
        band(c, w, h - groundH - 4, 4, shade(s.wall, 0.8), l);
        orosi(c, w / 2 - 15, h - groundH - 56, 30, 42, s.frame, l, s.lit);
      },
      right: (c, w, h, l) => {
        band(c, w, h - groundH - 4, 4, shade(s.wall, 0.8), l);
        townWindow(c, w / 2, h, groundH + 22, windowOf(s, l, false, false));
      },
    },
  };
  const front: MassPart = {
    p0: 80, p1, q0: 8, q1: box.d, h: groundH,
    spec: {
      wall: s.wall, seed: s.seed, material: s.material,
      left: (c, w, h, l) => {
        townWindow(c, 31, h, 54, windowOf(s, l));
        spout(c, w - 20, 8, l);
      },
      right: (c, _w, h, l) => townDoor(c, doorQ, h, doorOf(s, l)),
    },
  };
  const back: MassPart = { p0: 0, p1: 80, q0: 74, q1: box.d, h: groundH, spec: { wall: s.wall, seed: s.seed, material: s.material } };
  joinedMass(ctx, box, [back, upperPart, front]);
  thresholdRight(ctx, box, 8 + doorQ, p1);
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
  const backPart: MassPart = {
    p0: 0, p1: box.w - 6, q0: 64, q1: box.d, h: 164,
    spec: {
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
    },
  };
  const doorU = 116;
  const frontPart: MassPart = {
    p0: 6, p1: box.w - 6, q0: 6, q1: 64, h: 84,
    spec: {
      wall: s.wall, seed: s.seed + 23, material: s.material, beams: 12,
      left: (c, w, h, l) => {
        townDoor(c, doorU, h, doorOf(s, l));
        townWindow(c, 44, h, 54, windowOf(s, l));
        spout(c, w - 18, 8, l);
      },
      right: (c, w, h, l) => wornPlaster(c, w * 0.3, h * 0.5, 16, 12, s.wall, l, s.seed + 4),
    },
  };
  joinedMass(ctx, box, [backPart], [frontPart]);
  const back = subBox(box, backPart.p0, backPart.p1, backPart.q0, backPart.q1, backPart.h);
  windcatcherTower(ctx, roofFloor(back, 48, back.d - 42), 34, 70, shade(s.wall, 0.97), s.seed + 11);
  joinedMass(ctx, box, [frontPart], [backPart]);
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
  const backPart: MassPart = {
    p0: 0, p1: W, q0: 104, q1: box.d, h: 160,
    spec: {
      wall: s.wall, seed: s.seed, material: s.material, beams: 12,
      left: (c, w, h, l) => {
        band(c, w, h - 82, 4, shade(s.wall, 0.82), l);
        orosi(c, w / 2 - 16, h - 150, 32, 44, s.frame, l, s.lit);
        townWindow(c, w * 0.2, h, 110, windowOf(s, l));
        townWindow(c, w * 0.8, h, 110, windowOf(s, l));
      },
      right: (c, w, h, l) => townWindow(c, w / 2, h, 110, windowOf(s, l)),
    },
  };
  // The court walls: the street wall and the side wall turn the corner as
  // one, and run back into the house.
  const side: MassPart = { p0: W - 10, p1: W, q0: 18, q1: 104, h: 90, spec: { wall: s.wall, seed: s.seed + 13, material: s.material, roof: 'flat', coping: shade(s.wall, 1.1) } };
  const street: MassPart = {
    p0: 0, p1: W, q0: 8, q1: 18, h: 90,
    spec: {
      wall: s.wall, seed: s.seed + 17, material: s.material, roof: 'flat', coping: shade(s.wall, 1.1),
      left: (c, w, h, l) => {
        wornPlaster(c, w * 0.12, h * 0.5, 20, 14, s.wall, l, s.seed + 5);
        spout(c, w * 0.3, 6, l);
      },
    },
  };
  // The gateway (sar-dar) stands a little proud and a little higher than the wall.
  const doorP = 132;
  const gate: MassPart = {
    p0: doorP - 26, p1: doorP + 26, q0: 4, q1: 18, h: 110,
    spec: {
      wall: shade(s.wall, 1.04), seed: s.seed + 19, material: s.material, merlons: true, roof: 'flat',
      left: (c, w, h, l) => townDoor(c, w / 2, h, doorOf(s, l, TURQUOISE)),
    },
  };
  const front = [side, street, gate];
  joinedMass(ctx, box, [backPart], front);
  courtFloor(ctx, box, 0, W - 10, 18, 104, 0xb08a64, s.seed + 9);
  const root = groundPoint(box, 92, 62);
  crown(ctx, root.x, root.y - 96, 44, 36, { leaf: 0x3f6a34, seed: s.seed + 8, fruit: 0xc8402a });
  joinedMass(ctx, box, front, [backPart]);
  threshold(ctx, box, doorP, 4, s);
};

export const SMALL_HOUSES: readonly HouseVariant[] = [
  { draw: smallPlain, top: 160, faces: { s: 10, e: 8 }, style: { wall: 0xc39a6c, door: 0x5b3a20, frame: 0x8a6440, seed: 401, shutters: 0x3f6a6a, lit: true } },
  { draw: smallBalakhana, top: 170, faces: { s: 8, e: 6 }, style: { wall: 0xd2b48a, door: 0x2f5f6e, frame: 0x7a5a38, seed: 413, lit: true } },
  { draw: smallDomed, top: 140, faces: { s: 30, e: 10 }, style: { wall: 0xa98256, door: 0x4a3420, frame: 0x6a4a2c, seed: 427, material: 'mud' } },
];

export const TOWN_HOUSES: readonly HouseVariant[] = [
  { draw: twoStorey, top: 250, faces: { s: 6, e: 6 }, style: { wall: 0xc8a47a, door: 0x6a3020, frame: 0x7a5a38, seed: 433, shutters: 0x5a3a24, lit: true } },
  { draw: windcatcherHouse, top: 205, faces: { s: 12, e: 6 }, style: { wall: 0xbf9a6a, door: 0x2f5f6e, frame: 0x8a6440, seed: 449, lit: true } },
  { draw: courtGlimpse, top: 190, faces: { s: 8, e: 0 }, style: { wall: 0xd6c3a0, door: 0x5b3a20, frame: 0x8a6440, seed: 457, lit: true } },
];

/** Paints every variant of a house def: `key`, `key~1`, `key~2`... */
export function paintHouseSet(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, variants: readonly HouseVariant[]): void {
  variants.forEach((v, i) => {
    const { box, texW, texH } = footprintBox(cellsW, cellsD, v.top, 8);
    paintTexture(scene, i === 0 ? key : `${key}~${i}`, texW, texH, ctx => v.draw(ctx, box, v.style));
  });
}
