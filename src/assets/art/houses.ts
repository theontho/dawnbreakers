import type Phaser from 'phaser';
import { footprintBox, groundPoint, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { highWindow, iwanNiche, recessedDoor, wornPlaster } from './facade';
import { foliageClump } from './fieldKit';
import {
  courtyardWall, houseBlock, houseDoor, houseWindow, ROOF_PAD, roofFeature, type HouseStyle, type Massing,
} from './houseParts';
import { planks } from './materials';
import { band, latticeWindow } from './ornaments';
import { laneDust, pottedPlant, sakku, steps, waterJar } from './streetLife';
import { post, subBox } from './structureParts';

export type { HouseStyle, Massing, RoofFeature } from './houseParts';

/**
 * Persian town houses. Tall blank plaster walls with a small door in a
 * framed recess and a few high windows; each variant masses differently on
 * its footprint (a forecourt, a lower wing, a raised bālākhāna room, a
 * timber porch, a stepped two-storey block, a walled garden) so a street
 * does not look stamped from one box.
 */

type Draw = (ctx: Ctx, box: IsoBox, s: HouseStyle) => void;

/** Two high windows spread across a face, the far one lit at dusk. */
function windowsAcross(c: Ctx, w: number, h: number, l: number, s: HouseStyle, sill = 36): void {
  const count = w > 56 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    highWindow(c, (w / (count + 1)) * (i + 1) - 3.5, h, sill, houseWindow(s, l, i === count - 1));
  }
}

/** A plain block set back from the lane, with steps, a bench and a water jar. */
const plainBlock: Draw = (ctx, box, s) => {
  laneDust(ctx, box, 0, box.w, 0, 10, s.seed);
  const main = subBox(box, 0, box.w - 6, 8, box.d, s.wallH);
  const doorU = Math.round(main.w * (s.seed % 2 ? 0.66 : 0.36));
  const doorRight = doorU > main.w / 2;
  houseBlock(ctx, main, s, {
    left: (c, w, h, l) => {
      wornPlaster(c, doorRight ? w * 0.1 : w * 0.72, h * 0.42, 13, 9, s.wall, l, s.seed);
      recessedDoor(c, doorU, h, houseDoor(s, l));
      highWindow(c, doorRight ? doorU - 28 : doorU + 20, h, 34, houseWindow(s, l, false, true));
    },
    right: (c, w, h, l) => windowsAcross(c, w, h, l, s),
  });
  roofFeature(ctx, main, s);
  steps(ctx, box, doorU - 9, doorU + 9, 3, 8, 2);
  const bench = doorRight ? [doorU - 32, doorU - 13] : [doorU + 13, doorU + 32];
  sakku(ctx, box, bench[0]!, bench[1]!, 3, 8, shade(s.wall, 1.05), s.seed + 5);
  const jar = groundPoint(box, box.w - 9, 5);
  waterJar(ctx, jar.x, jar.y, 4.5);
};

/** A deep forecourt: the house stands back behind a short courtyard wall. */
const forecourt: Draw = (ctx, box, s) => {
  laneDust(ctx, box, 0, box.w, 0, 18, s.seed);
  const main = subBox(box, 0, box.w - 4, 18, box.d, s.wallH);
  const doorU = Math.round(main.w * 0.7);
  houseBlock(ctx, main, s, {
    left: (c, w, h, l) => {
      highWindow(c, 10, h, 46, houseWindow(s, l, true, true));
      wornPlaster(c, w * 0.42, h * 0.3, 11, 8, s.wall, l, s.seed + 1);
      recessedDoor(c, doorU, h, houseDoor(s, l));
    },
    right: (c, w, h, l) => windowsAcross(c, w, h, l, s),
  });
  roofFeature(ctx, main, s);
  steps(ctx, box, doorU - 9, doorU + 9, 12, 18, 2);
  // An L of wall closes a little forecourt at the corner of the house.
  courtyardWall(ctx, subBox(box, 21, 26, 5, 18, 34), s, { salt: 44 });
  const stub = subBox(box, 0, 26, 0, 5, 34);
  courtyardWall(ctx, stub, s, {
    left: (c, w, h, l) => wornPlaster(c, w * 0.3, h * 0.5, 9, 7, s.wall, l, s.seed + 2),
  });
  const onStub = roofPoint(stub, 20, 2.5);
  pottedPlant(ctx, onStub.x, onStub.y, 3, 0x4a7a40, s.seed + 3, 0xd84a4a);
  const jar = groundPoint(box, 31, 9);
  waterJar(ctx, jar.x, jar.y, 4.5);
  const pot = groundPoint(box, box.w - 7, 10);
  pottedPlant(ctx, pot.x, pot.y, 3.5, 0x3f6a3a, s.seed + 4, 0xf2ead6);
};

/** A domed hall entered through an iwan, with a lower storeroom wing in front. */
const iwanWing: Draw = (ctx, box, s) => {
  laneDust(ctx, box, 0, box.w, 0, 8, s.seed);
  const main = subBox(box, 0, box.w - 22, 8, box.d, s.wallH);
  const wing = subBox(box, box.w - 24, box.w - 2, 3, box.d - 14, 46);
  houseBlock(ctx, main, s, {
    left: (c, w, h, l) => iwanNiche(c, w / 2, h, 22, 48, { ...houseDoor(s, l), wall: s.wall, lantern: s.litWindow, panel: 0x2e8c96 }),
    right: (c, w, h, l) => highWindow(c, w * 0.6, h, 52, houseWindow(s, l, true, true)),
  });
  roofFeature(ctx, main, s);
  steps(ctx, box, main.w / 2 - 13, main.w / 2 + 13, 4, 8, 1);
  houseBlock(ctx, wing, s, {
    salt: 17,
    left: (c, w, h, l) => highWindow(c, w / 2 - 3.5, h, 26, houseWindow(s, l)),
    right: (c, w, h, l) => {
      wornPlaster(c, w * 0.2, h * 0.35, 12, 8, s.wall, l, s.seed + 6);
      highWindow(c, w * 0.62, h, 26, houseWindow(s, l));
    },
  });
  for (const p of [6, main.w - 6]) {
    const at = groundPoint(box, p, 4);
    pottedPlant(ctx, at.x, at.y, 3.5, 0x3f6a3a, s.seed + p, p < 10 ? 0xd84a4a : 0xf2ead6);
  }
};

/** A raised upper room (bālākhāna) over the street corner, its sash window lit. */
const balakhana: Draw = (ctx, box, s) => {
  laneDust(ctx, box, 0, box.w, 0, 6, s.seed);
  const main = subBox(box, 0, box.w - 4, 6, box.d, s.wallH);
  const upper = subBox(box, 4, 32, 6, 34, 36, s.wallH);
  const doorU = 46;
  houseBlock(ctx, main, s, {
    crenellated: false,
    left: (c, _w, h, l) => {
      highWindow(c, 14, h, 34, houseWindow(s, l, false, true));
      wornPlaster(c, 4, h * 0.62, 10, 7, s.wall, l, s.seed + 1);
      recessedDoor(c, doorU, h, houseDoor(s, l));
    },
    right: (c, w, h, l) => windowsAcross(c, w, h, l, s),
  });
  houseBlock(ctx, upper, s, {
    salt: 31, plinth: false, shadow: false, beams: false,
    left: (c, w, h, l) => {
      band(c, w, h - 3, 3, shade(s.wall, 0.8), l);
      // An orosi: a tall lattice sash window with coloured panes.
      latticeWindow(c, w / 2 - 7, h - 31, 14, 20, { frame: s.frame, light: l, lit: s.litWindow });
      c.fillStyle = 'rgba(200,60,60,0.35)';
      c.fillRect(w / 2 - 7, h - 31, 14, 3);
    },
    right: (c, w, h, l) => {
      band(c, w, h - 3, 3, shade(s.wall, 0.8), l);
      latticeWindow(c, w / 2 - 3.5, h - 26, 7, 10, houseWindow(s, l));
    },
  });
  steps(ctx, box, doorU - 9, doorU + 9, 1, 6, 2);
  const jar = groundPoint(box, 27, 3);
  waterJar(ctx, jar.x, jar.y, 4);
  const pot = roofPoint(main, main.w - 6, 6);
  pottedPlant(ctx, pot.x, pot.y, 3, 0x4a7a40, s.seed + 9, 0xd84a4a);
};

/** A humble mud house with a timber porch shading its door, a vine over the porch. */
const porch: Draw = (ctx, box, s) => {
  const W = box.w;
  const D = box.d;
  laneDust(ctx, box, W - 18, W, 4, D, s.seed);
  const main = subBox(box, 0, W - 18, 4, D, s.wallH);
  const doorU = Math.round(main.d / 2);
  houseBlock(ctx, main, s, {
    left: (c, w, h, l) => {
      windowsAcross(c, w, h, l, s, 38);
      wornPlaster(c, w * 0.3, h * 0.62, 14, 9, s.wall, l, s.seed + 1);
    },
    right: (c, _w, h, l) => recessedDoor(c, doorU, h, houseDoor(s, l)),
  });
  roofFeature(ctx, main, s);
  const doorQ = 4 + doorU;
  steps(ctx, box, W - 18, W - 13, doorQ - 9, doorQ + 9, 2, 'p');
  sakku(ctx, box, W - 18, W - 12, doorQ + 13, D - 8, shade(s.wall, 1.05), s.seed + 5);
  // Poles carry a flat reed-and-timber roof out from the wall.
  const timber = 0x5a3a20;
  const back = groundPoint(box, W - 2, D - 8);
  const front = groundPoint(box, W - 2, 10);
  post(ctx, back.x, back.y, 40, 2.4, timber);
  post(ctx, front.x, front.y, 40, 2.4, timber);
  const slab = subBox(box, W - 20, W - 1, 9, D - 7, 3, 40);
  courtyardWall(ctx, slab, { ...s, wall: 0x8a6a42 }, {
    left: (c, w, h, l) => planks(c, w, h, { base: 0x6a4a2a, light: l, seed: s.seed }, true, 3),
    right: (c, w, h, l) => planks(c, w, h, { base: 0x6a4a2a, light: l, seed: s.seed + 1 }, true, 3),
  });
  for (const [p, q, r] of [[6, 10, 6], [10, 24, 5], [4, 40, 6]] as const) {
    const at = roofPoint(slab, p, q);
    foliageClump(ctx, at.x, at.y - 2, r, { leaf: 0x4f7a38, seed: s.seed + q, masses: 5 });
  }
  const jar = groundPoint(box, 22, 1);
  waterJar(ctx, jar.x, jar.y, 4);
};

/** A tall two-storey block at the back, a single-storey front range before it. */
const stepped: Draw = (ctx, box, s) => {
  const W = box.w;
  const upperH = s.wallH + 34;
  laneDust(ctx, box, 0, W, 0, 6, s.seed);
  const back = subBox(box, 0, W - 2, 30, box.d, upperH);
  const front = subBox(box, 4, W - 10, 4, 30, s.wallH);
  const storey = (c: Ctx, w: number, h: number, l: number, lower: boolean) => {
    band(c, w, h - s.wallH - 3, 2.5, shade(s.wall, 0.82), l);
    const n = Math.max(2, Math.round(w / 22));
    for (let i = 0; i < n; i++) {
      const u = (w / n) * (i + 0.5) - 3.5;
      highWindow(c, u, h, s.wallH + 10, houseWindow(s, l, i === n - 1, true));
      if (lower && i === 0) highWindow(c, u, h, 36, houseWindow(s, l));
    }
  };
  houseBlock(ctx, back, s, {
    left: (c, w, h, l) => storey(c, w, h, l, false),
    right: (c, w, h, l) => {
      storey(c, w, h, l, true);
      wornPlaster(c, w * 0.6, h * 0.75, 12, 8, s.wall, l, s.seed + 2);
    },
  });
  roofFeature(ctx, back, s);
  const doorU = Math.round(front.w * 0.4);
  houseBlock(ctx, front, s, {
    salt: 23,
    left: (c, _w, h, l) => {
      recessedDoor(c, doorU, h, houseDoor(s, l));
      highWindow(c, doorU + 18, h, 36, houseWindow(s, l, false, true));
    },
    right: (c, w, h, l) => highWindow(c, w / 2 - 3.5, h, 36, houseWindow(s, l)),
  });
  steps(ctx, box, 4 + doorU - 9, 4 + doorU + 9, 0, 4, 1);
  const jar = groundPoint(box, W - 6, 8);
  waterJar(ctx, jar.x, jar.y, 4.5);
};

/** A house behind its garden wall: a gateway, a pomegranate tree over the coping. */
const walled: Draw = (ctx, box, s) => {
  const W = box.w;
  const D = box.d;
  const house = subBox(box, 0, 40, 30, D, s.wallH);
  houseBlock(ctx, house, s, {
    left: (c, w, h, l) => {
      highWindow(c, w * 0.25, h, 46, houseWindow(s, l, false, true));
      highWindow(c, w * 0.65, h, 46, houseWindow(s, l, true, true));
    },
    right: (c, w, h, l) => highWindow(c, w * 0.45, h, 46, houseWindow(s, l)),
  });
  roofFeature(ctx, house, s);
  // The pomegranate in the court.
  const root = groundPoint(box, 50, 20);
  ctx.strokeStyle = '#4a2e18';
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(root.x, root.y);
  ctx.quadraticCurveTo(root.x - 3, root.y - 22, root.x + 1, root.y - 40);
  ctx.stroke();
  foliageClump(ctx, root.x - 2, root.y - 46, 13, { leaf: 0x3f6a34, seed: s.seed + 8, bloom: 0xc8402a, masses: 8 });
  const side = subBox(box, W - 8, W - 3, 5, D - 4, 34);
  courtyardWall(ctx, side, s);
  // Jasmine trailing over the coping from the court.
  const spill = roofPoint(side, 2.5, 18);
  foliageClump(ctx, spill.x, spill.y - 2, 6, { leaf: 0x4a7a40, seed: s.seed + 9, bloom: 0xf2ead6, masses: 5, squash: 0.6 });
  const front = subBox(box, 0, W - 3, 0, 5, 34);
  courtyardWall(ctx, front, s, {
    left: (c, w, h, l) => {
      wornPlaster(c, w * 0.08, h * 0.4, 10, 7, s.wall, l, s.seed + 3);
      wornPlaster(c, w * 0.8, h * 0.55, 8, 6, s.wall, l, s.seed + 4);
    },
  });
  const gate = subBox(box, 22, 44, -1, 6, 52);
  houseBlock(ctx, gate, s, {
    salt: 13, beams: false, crenellated: true,
    left: (c, w, h, l) => recessedDoor(c, w / 2, h, { ...houseDoor(s, l), panel: 0x2e8c96 }),
  });
  const onWall = roofPoint(front, 10, 2.5);
  pottedPlant(ctx, onWall.x, onWall.y, 3, 0x4a7a40, s.seed + 5, 0xf2ead6);
};

const MASSINGS: Record<Massing, { draw: Draw; extra: (s: HouseStyle) => number }> = {
  block: { draw: plainBlock, extra: s => ROOF_PAD[s.roof] },
  courtyard: { draw: forecourt, extra: s => ROOF_PAD[s.roof] },
  wing: { draw: iwanWing, extra: s => ROOF_PAD[s.roof] },
  balakhana: { draw: balakhana, extra: () => 46 },
  porch: { draw: porch, extra: s => ROOF_PAD[s.roof] },
  stepped: { draw: stepped, extra: s => 34 + ROOF_PAD[s.roof] },
  walled: { draw: walled, extra: s => ROOF_PAD[s.roof] },
};

/** Paints a house into `ctx` on the footprint `box`. */
export function drawHouse(ctx: Ctx, box: IsoBox, style: HouseStyle): void {
  MASSINGS[style.massing ?? 'block'].draw(ctx, box, style);
}

/** Paint a house texture of the given footprint. */
export function paintHouse(scene: Phaser.Scene, key: string, style: HouseStyle): void {
  const massing = MASSINGS[style.massing ?? 'block'];
  const { box, texW, texH } = footprintBox(style.cellsW, style.cellsD, style.wallH, massing.extra(style));
  paintTexture(scene, key, texW, texH, ctx => massing.draw(ctx, box, style));
}

/** The looks of the generic `house` object; index 0 is the base texture. */
export const HOUSE_VARIANTS: ReadonlyArray<Omit<HouseStyle, 'cellsW' | 'cellsD'>> = [
  { massing: 'courtyard', wallH: 70, wall: 0xb88d5c, door: 0x2f5f6e, frame: 0x8a6440, roof: 'windcatcher', seed: 11, beams: true, litWindow: true },
  { massing: 'wing', wallH: 68, wall: 0xd6cbb0, door: 0x5b3a20, frame: 0xa08868, roof: 'dome', seed: 23, shutters: 0x3f6a6a, litWindow: true },
  { massing: 'balakhana', wallH: 64, wall: 0xc39a7a, door: 0x6a3020, frame: 0x8a5a3a, roof: 'none', seed: 37, crenellated: true, litWindow: true },
  { massing: 'porch', wallH: 64, wall: 0xa98858, door: 0x4a3420, frame: 0x7a5a38, roof: 'stair', seed: 41, beams: true },
  { massing: 'stepped', wallH: 62, wall: 0xc8a47a, door: 0x3f5a3a, frame: 0x7a5a38, roof: 'none', seed: 53, beams: true, shutters: 0x5a3a24, litWindow: true },
  { massing: 'walled', wallH: 70, wall: 0xbfa27c, door: 0x5b3a20, frame: 0x8a6440, roof: 'none', seed: 67, beams: true },
];

export function paintHouseVariants(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  HOUSE_VARIANTS.forEach((v, i) => paintHouse(scene, i === 0 ? key : `${key}~${i}`, { ...v, cellsW, cellsD }));
}
