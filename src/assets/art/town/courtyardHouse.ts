import { groundPoint, shade, type Ctx, type IsoBox } from '../canvasKit';
import { wornPlaster } from '../facade';
import { band, dome } from '../ornaments';
import { pottedPlant } from '../streetLife';
import { subBox } from '../structureParts';
import { hawz } from './fountain';
import { courtFloor, courtNiches, cypressAt, doorOf, jarAt, orosi, talar, threshold, windowOf, type TownHouseStyle } from './houseKit';
import type { HouseVariant } from './townHouses';
import { CREAM, LAPIS, roofFloor, spout, townBlock, townDoor, townWindow, TURQUOISE, windcatcherTower } from './townKit';
import { crown } from './trees';
import { inscriptionBand, townIwan } from './monumentKit';

/**
 * The courtyard house (8 x 7: 256 x 224 px of ground). From the lane it is
 * a long plain wall and a gateway; over the wall you glimpse the court:
 * the crowns of its trees and, across the pool, the tall summer hall at
 * the back, open to the court through a columned talar or a tiled iwan.
 */

/** The court in the middle of the house: brick paving, a pool and trees. Paint it after the back and left ranges. */
function court(ctx: Ctx, box: IsoBox, s: TownHouseStyle, trees: 'orange' | 'cypress'): void {
  courtFloor(ctx, box, 40, 216, 50, 150, 0xb48a62, s.seed + 9);
  const tree = (p: number, q: number): void => {
    const root = groundPoint(box, p, q);
    if (trees === 'cypress') cypressAt(ctx, root.x, root.y, 170, 30, 0x24553a, s.seed + p);
    else crown(ctx, root.x, root.y - 96, 40, 34, { leaf: 0x3a6e34, seed: s.seed + p, fruit: 0xf08a1a });
  };
  tree(66, 128);
  hawz(ctx, box, 100, 160, 84, 118, 8, 6, s.seed + 2, 3);
  tree(186, 128);
  const pot = groundPoint(box, 196, 64);
  pottedPlant(ctx, pot.x, pot.y, 7, 0x4a7a40, s.seed + 3, 0xd84a4a);
}

/** The range along the left of the court, its rooms opening onto it through arched doors. */
function sideRange(ctx: Ctx, box: IsoBox, s: TownHouseStyle): void {
  townBlock(ctx, subBox(box, 0, 40, 50, 150, 92), {
    wall: s.wall, seed: s.seed + 41, material: s.material,
    right: (c, w, h, l) => courtNiches(c, w, h, l, s.wall, s.frame, 36),
  });
}

/** The range down the right, its outer face on the side lane. */
function rightRange(ctx: Ctx, box: IsoBox, s: TownHouseStyle): void {
  townBlock(ctx, subBox(box, 216, 256, 50, 224, 92), {
    wall: s.wall, seed: s.seed + 43, material: s.material, beams: 14,
    right: (c, w, h, l) => {
      townWindow(c, w * 0.3, h, 58, windowOf(s, l));
      townWindow(c, w * 0.7, h, 58, windowOf(s, l, true));
      spout(c, w * 0.5, 9, l);
    },
  });
}

/** The street range with a gateway standing proud of it; `upper` adds a room over the gateway. */
function streetFront(ctx: Ctx, box: IsoBox, s: TownHouseStyle, upper: boolean): void {
  townBlock(ctx, subBox(box, 0, 256, 12, 50, 92), {
    wall: s.wall, seed: s.seed + 47, material: s.material, beams: 14,
    left: (c, w, h, l) => {
      townWindow(c, 40, h, 60, windowOf(s, l));
      townWindow(c, 96, h, 60, windowOf(s, l, true));
      wornPlaster(c, w * 0.85, h * 0.5, 22, 14, s.wall, l, s.seed + 4);
      spout(c, 70, 9, l);
      spout(c, w - 30, 9, l);
    },
    right: (c, w, h, l) => wornPlaster(c, w * 0.4, h * 0.4, 12, 10, s.wall, l, s.seed + 5),
  });
  const doorP = 172;
  const gate = subBox(box, doorP - 30, doorP + 30, 12, 56, 116);
  townBlock(ctx, gate, {
    wall: shade(s.wall, 1.05), seed: s.seed + 49, material: s.material, roof: upper ? 'flat' : 'parapet',
    left: (c, w, h, l) => {
      inscriptionBand(c, w, 10, 10, l);
      townDoor(c, w / 2, h, doorOf(s, l, TURQUOISE));
    },
    right: (c, w, h, l) => townWindow(c, w / 2, h, 60, windowOf(s, l)),
  });
  if (upper) {
    townBlock(ctx, subBox(box, doorP - 30, doorP + 30, 12, 56, 70, 116), {
      wall: s.wall, seed: s.seed + 51, material: s.material, plinth: false, shadow: false, beams: 8,
      left: (c, w, h, l) => {
        band(c, w, h - 4, 4, shade(s.wall, 0.8), l);
        orosi(c, w / 2 - 14, h - 56, 28, 42, s.frame, l, s.lit);
      },
      right: (c, w, h, l) => {
        band(c, w, h - 4, 4, shade(s.wall, 0.8), l);
        townWindow(c, w / 2, h, 22, windowOf(s, l, false, false));
      },
    });
  }
  threshold(ctx, box, doorP, 12, s, 'both');
  jarAt(ctx, box, 18, 8);
}

/** Plastered, with a columned talar open to the court and a wind-catcher over it. */
const talarHouse = (ctx: Ctx, box: IsoBox, s: TownHouseStyle): void => {
  const back = subBox(box, 0, 216, 150, 224, 168);
  townBlock(ctx, back, {
    wall: s.wall, seed: s.seed, material: s.material, beams: 12,
    left: (c, _w, h, l) => {
      talar(c, 62, 154, h, 26, s.frame, l);
      for (const u of [30, 186]) {
        townWindow(c, u, h, 112, windowOf(s, l));
        townWindow(c, u, h, 40, windowOf(s, l, u > 100));
      }
    },
    right: (c, w, h, l) => townWindow(c, w / 2, h, 120, windowOf(s, l)),
  });
  windcatcherTower(ctx, roofFloor(back, 120, back.d - 52), 42, 104, shade(s.wall, 0.97), s.seed + 11);
  sideRange(ctx, box, s);
  court(ctx, box, s, 'orange');
  rightRange(ctx, box, s);
  streetFront(ctx, box, s, false);
};

/** Brick, with a tiled iwan across the court, a dome over the hall and a room over the gateway. */
const iwanHouse = (ctx: Ctx, box: IsoBox, s: TownHouseStyle): void => {
  const back = subBox(box, 0, 216, 150, 224, 150);
  townBlock(ctx, back, {
    wall: s.wall, seed: s.seed, material: 'brick', beams: 12, coping: CREAM,
    left: (c, w, h, l) => {
      townIwan(c, w / 2, h, 64, 112, { wall: s.wall, frame: s.frame, door: s.door, light: l, seed: s.seed, tile: LAPIS, lantern: true });
      for (const u of [34, w - 34]) {
        orosi(c, u - 12, h - 136, 24, 34, s.frame, l, u < 100 && s.lit);
        townWindow(c, u, h, 40, windowOf(s, l));
      }
    },
    right: (c, w, h, l) => townWindow(c, w / 2, h, 110, windowOf(s, l)),
  });
  const at = roofFloor(back, back.w / 2, back.d / 2);
  dome(ctx, at.x, at.y, 46, { color: shade(s.wall, 0.95), drum: 10, bulb: 1.05 });
  sideRange(ctx, box, s);
  court(ctx, box, s, 'cypress');
  rightRange(ctx, box, s);
  streetFront(ctx, box, s, true);
};

export const COURTYARD_HOUSES: readonly HouseVariant[] = [
  { draw: talarHouse, top: 300, style: { wall: 0xd6cbb0, door: 0x5b3a20, frame: 0x8a6440, seed: 501, shutters: 0x3f6a6a, lit: true } },
  { draw: iwanHouse, top: 290, style: { wall: 0xc8a06e, door: 0x2f5f6e, frame: 0x7a5a38, seed: 521, material: 'brick', lit: true } },
];
