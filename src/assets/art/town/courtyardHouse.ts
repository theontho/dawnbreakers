import { groundPoint, shade, type Ctx, type IsoBox } from '../canvasKit';
import { wornPlaster } from '../facade';
import { band, dome, type FacePainter } from '../ornaments';
import { pottedPlant } from '../streetLife';
import { subBox } from '../structureParts';
import { hawz } from './fountain';
import { courtFloor, courtNiches, cypressAt, doorOf, jarAt, orosi, talar, threshold, windowOf, type TownHouseStyle } from './houseKit';
import type { HouseVariant } from './townHouses';
import { joinedMass, type MassPart } from './joinedMass';
import { CREAM, LAPIS, roofFloor, spout, townDoor, townWindow, TURQUOISE, windcatcherTower } from './townKit';
import { crown } from './trees';
import { inscriptionBand, townIwan } from './monumentKit';

/**
 * The courtyard house (8 x 7: 256 x 224 px of ground). From the lane it is
 * a long plain wall and a gateway; over the wall you glimpse the court:
 * the crowns of its trees and, across the pool, the tall summer hall at
 * the back, open to the court through a columned talar or a tiled iwan.
 */

const RANGE_H = 92;
const GATE_H = 116;
/** The gateway's door along the street face, and how far the gateway stands proud of the range (q 12). */
const GATE_P = 172;
const GATE_Q = 6;

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
function sideRange(s: TownHouseStyle): MassPart {
  return {
    p0: 0, p1: 40, q0: 50, q1: 150, h: RANGE_H,
    spec: { wall: s.wall, seed: s.seed + 41, material: s.material, right: (c, w, h, l) => courtNiches(c, w, h, l, s.wall, s.frame, 36) },
  };
}

/** The range down the right, its outer face on the side lane. */
function rightRange(s: TownHouseStyle): MassPart {
  return {
    p0: 216, p1: 256, q0: 50, q1: 224, h: RANGE_H,
    spec: {
      wall: s.wall, seed: s.seed + 43, material: s.material, beams: 14,
      right: (c, w, h, l) => {
        townWindow(c, w * 0.3, h, 58, windowOf(s, l));
        townWindow(c, w * 0.7, h, 58, windowOf(s, l, true));
        spout(c, w * 0.5, 9, l);
      },
    },
  };
}

/** The street range, and its gateway standing proud of it; `upper` adds a room over the gateway. */
function streetFront(s: TownHouseStyle, upper: boolean): MassPart[] {
  const street: MassPart = {
    p0: 0, p1: 256, q0: 12, q1: 50, h: RANGE_H,
    spec: {
      wall: s.wall, seed: s.seed + 47, material: s.material, beams: 14,
      left: (c, w, h, l) => {
        townWindow(c, 40, h, 60, windowOf(s, l));
        townWindow(c, 96, h, 60, windowOf(s, l, true));
        wornPlaster(c, w * 0.85, h * 0.5, 22, 14, s.wall, l, s.seed + 4);
        spout(c, 70, 9, l);
        spout(c, w - 30, 9, l);
      },
      right: (c, w, h, l) => wornPlaster(c, w * 0.4, h * 0.4, 12, 10, s.wall, l, s.seed + 5),
    },
  };
  // The gateway rises from the ground through the range; a room over it rides on the same walls.
  const roomH = upper ? 70 : 0;
  const lower = (paint: FacePainter): FacePainter => (c, w, h, l) => {
    c.save();
    c.translate(0, h - GATE_H);
    paint(c, w, GATE_H, l);
    c.restore();
  };
  const gate: MassPart = {
    p0: GATE_P - 30, p1: GATE_P + 30, q0: GATE_Q, q1: 50, h: GATE_H + roomH,
    spec: {
      wall: shade(s.wall, 1.05), seed: s.seed + 49, material: s.material, beams: upper ? 8 : undefined,
      left: (c, w, h, l) => {
        lower((cc, ww, hh, ll) => {
          inscriptionBand(cc, ww, 10, 10, ll);
          townDoor(cc, ww / 2, hh, doorOf(s, ll, TURQUOISE));
        })(c, w, h, l);
        if (!upper) return;
        band(c, w, roomH - 4, 4, shade(s.wall, 0.8), l);
        orosi(c, w / 2 - 14, roomH - 56, 28, 42, s.frame, l, s.lit);
      },
      right: (c, w, h, l) => {
        townWindow(c, w / 2, h, 60, windowOf(s, l));
        if (!upper) return;
        band(c, w, roomH - 4, 4, shade(s.wall, 0.8), l);
        townWindow(c, w / 2, h, GATE_H + 22, windowOf(s, l, false, false));
      },
    },
  };
  return [street, gate];
}

/** The ranges round the court, the hall at the back first and the street front last, joined as one house. */
function paintHouse(ctx: Ctx, box: IsoBox, s: TownHouseStyle, back: MassPart, upper: boolean, onBack: (hall: IsoBox) => void, trees: 'orange' | 'cypress'): void {
  const left = sideRange(s);
  const right = rightRange(s);
  const front = [right, ...streetFront(s, upper)];
  const all = [back, left, ...front];
  const others = (parts: MassPart[]) => all.filter(m => !parts.includes(m));
  joinedMass(ctx, box, [back], others([back]));
  onBack(subBox(box, back.p0, back.p1, back.q0, back.q1, back.h));
  joinedMass(ctx, box, [left], others([left]));
  court(ctx, box, s, trees);
  joinedMass(ctx, box, front, others(front));
  threshold(ctx, box, GATE_P, GATE_Q, s, 'both');
  jarAt(ctx, box, 18, 8);
}

/** Plastered, with a columned talar open to the court and a wind-catcher over it. */
const talarHouse = (ctx: Ctx, box: IsoBox, s: TownHouseStyle): void => {
  const back: MassPart = {
    p0: 0, p1: 216, q0: 150, q1: 224, h: 168,
    spec: {
      wall: s.wall, seed: s.seed, material: s.material, beams: 12,
      left: (c, _w, h, l) => {
        talar(c, 62, 154, h, 26, s.frame, l);
        for (const u of [30, 186]) {
          townWindow(c, u, h, 112, windowOf(s, l));
          townWindow(c, u, h, 40, windowOf(s, l, u > 100));
        }
      },
      right: (c, w, h, l) => townWindow(c, w / 2, h, 120, windowOf(s, l)),
    },
  };
  paintHouse(ctx, box, s, back, false, hall => {
    windcatcherTower(ctx, roofFloor(hall, 120, hall.d - 52), 42, 104, shade(s.wall, 0.97), s.seed + 11);
  }, 'orange');
};

/** Brick, with a tiled iwan across the court, a dome over the hall and a room over the gateway. */
const iwanHouse = (ctx: Ctx, box: IsoBox, s: TownHouseStyle): void => {
  const back: MassPart = {
    p0: 0, p1: 216, q0: 150, q1: 224, h: 150,
    spec: {
      wall: s.wall, seed: s.seed, material: 'brick', beams: 12, coping: CREAM,
      left: (c, w, h, l) => {
        townIwan(c, w / 2, h, 64, 112, { wall: s.wall, frame: s.frame, door: s.door, light: l, seed: s.seed, tile: LAPIS, lantern: true });
        for (const u of [34, w - 34]) {
          orosi(c, u - 12, h - 136, 24, 34, s.frame, l, u < 100 && s.lit);
          townWindow(c, u, h, 40, windowOf(s, l));
        }
      },
      right: (c, w, h, l) => townWindow(c, w / 2, h, 110, windowOf(s, l)),
    },
  };
  paintHouse(ctx, box, s, back, true, hall => {
    const at = roofFloor(hall, hall.w / 2, hall.d / 2);
    dome(ctx, at.x, at.y, 46, { color: shade(s.wall, 0.95), drum: 10, bulb: 1.05 });
  }, 'cypress');
};

export const COURTYARD_HOUSES: readonly HouseVariant[] = [
  { draw: talarHouse, top: 300, faces: { s: 12, e: 0 }, style: { wall: 0xd6cbb0, door: 0x5b3a20, frame: 0x8a6440, seed: 501, shutters: 0x3f6a6a, lit: true } },
  { draw: iwanHouse, top: 290, faces: { s: 12, e: 0 }, style: { wall: 0xc8a06e, door: 0x2f5f6e, frame: 0x7a5a38, seed: 521, material: 'brick', lit: true } },
];
