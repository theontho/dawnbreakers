import type Phaser from 'phaser';
import type { BuildingFront } from './buildingFronts';
import { css, footprintBox, groundPoint, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { cylinder, cylinderBand, dome } from './ornaments';
import { subBox } from './structureParts';
import { courtFloor, cypressAt } from './town/houseKit';
import { joinedMass, type MassPart } from './town/joinedMass';
import { blindArches, inscriptionBand, tilePanel, townIwan } from './town/monumentKit';
import { CREAM, LAPIS, roofFloor, townBlock, TURQUOISE, type BlockSpec } from './town/townKit';

/**
 * The shrine of the Imám Ḥusayn at Karbilá, seen from the square before its
 * gate (12 x 10: about 17 by 14 m of ground here, a token of a far larger
 * precinct). From the square: the tiled outer wall of the court with its
 * arched niches, and the gate, a tiled pīshṭāq with a gilded crest. Over the
 * wall rise the sanctuary with its gilded portico, the two gilded minarets,
 * and the gilded dome on its tiled drum. The way in is only ever the gate:
 * the game never shows the place of worship within.
 */

const BRICK = 0xd0aa74;
export const GOLD = 0xd8a63a;
const RANGE_H = 104;
/** The gate: p 148..236 on the front range. */
const GATE = { p0: 148, p1: 236 } as const;
/** The gate is the shrine's front on the square. */
export const KARBILA_SHRINE_FRONT: BuildingFront = { side: 's', door: (GATE.p0 + GATE.p1) / 2 };

/** Gold leaf over copper: warm, with a bright streak where the sun catches it. */
function gilt(c: Ctx, x: number, y: number, w: number, h: number, l: number): void {
  const g = c.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, css(shade(GOLD, l * 1.25)));
  g.addColorStop(0.45, css(shade(GOLD, l)));
  g.addColorStop(0.55, css(shade(0xfff0b0, l)));
  g.addColorStop(1, css(shade(GOLD, l * 0.62)));
  c.fillStyle = g;
  c.fillRect(x, y, w, h);
  c.strokeStyle = css(shade(GOLD, l * 0.5), 0.5);
  c.lineWidth = 0.6;
  for (let u = x + 6; u < x + w; u += 8) {
    c.beginPath();
    c.moveTo(u, y);
    c.lineTo(u, y + h);
    c.stroke();
  }
}

/** The outer face of the court: tiled niches in two rows under an inscription. */
function outerFace(c: Ctx, w: number, h: number, l: number): void {
  inscriptionBand(c, w, 8, 9, l);
  blindArches(c, w, h - 12, 32, 40, BRICK, l);
  for (let u = 16; u + 12 <= w; u += 32) tilePanel(c, u - 8, h - 82, 16, 18, TURQUOISE, l, 900 + u, 4);
}

/** A gilded minaret on a ground point: a tiled shaft, a gilded upper stage and balcony, a gilded cap. */
function giltMinaret(ctx: Ctx, x: number, y: number, r: number, h: number): void {
  cylinder(ctx, x, y, r, h * 0.62, TURQUOISE, false);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - r, y - h * 0.62, r * 2, h * 0.62);
  ctx.clip();
  ctx.fillStyle = css(CREAM, 0.35);
  for (let k = 8; k < h * 0.62; k += 6) {
    for (let j = -r; j < r; j += 5) ctx.fillRect(x + j + ((k / 6) % 2) * 2.5, y - k, 1.2, 1.2);
  }
  ctx.restore();
  cylinderBand(ctx, x, y - h * 0.3, r, 6, LAPIS);
  cylinder(ctx, x, y - h * 0.62, r - 1, h * 0.38, GOLD, false);
  cylinderBand(ctx, x, y - h * 0.62, r, 4, shade(GOLD, 0.8));
  // The balcony for the call to prayer, then the lantern and its cap.
  cylinder(ctx, x, y - h + 4, r + 5, 6, shade(GOLD, 0.92), true);
  cylinder(ctx, x, y - h - 2, r - 2, 16, GOLD, false);
  ctx.fillStyle = 'rgba(40,24,6,0.6)';
  for (const dx of [-0.5, 0, 0.5]) ctx.fillRect(x + dx * r - 1.5, y - h - 14, 3, 8);
  dome(ctx, x, y - h - 18, r - 2, { color: GOLD, bulb: 1.2, finial: true });
}

function paintShrine(ctx: Ctx, box: IsoBox): void {
  const brick = (seed: number, left?: BlockSpec['left'], right?: BlockSpec['right']): BlockSpec =>
    ({ wall: BRICK, seed, material: 'brick', coping: CREAM, left, right });
  const tiledCourt = (c: Ctx, w: number, h: number, l: number) => {
    for (let u = 10; u + 26 <= w; u += 40) townIwan(c, u + 13, h - 4, 26, 58, { wall: BRICK, frame: TURQUOISE, door: 0x3a2412, light: l, seed: 930 + u, tile: TURQUOISE, open: true });
  };
  const leftRange: MassPart = { p0: 0, p1: 56, q0: 48, q1: 320, h: RANGE_H, spec: brick(911, undefined, tiledCourt) };
  const backRange: MassPart = { p0: 56, p1: 328, q0: 280, q1: 320, h: RANGE_H, spec: brick(913) };
  const rightRange: MassPart = { p0: 328, p1: 384, q0: 48, q1: 320, h: RANGE_H, spec: brick(915, undefined, outerFace) };
  const frontRange: MassPart = { p0: 0, p1: 384, q0: 0, q1: 48, h: RANGE_H, spec: brick(917, outerFace, outerFace) };
  // The gate projects from the front range and rises over it, its crest gilded.
  const gate: MassPart = {
    p0: GATE.p0, p1: GATE.p1, q0: -6, q1: 54, h: RANGE_H + 40,
    spec: {
      ...brick(919),
      roof: 'flat',
      left: (c, w, h, l) => {
        tilePanel(c, 5, 5, w - 10, h - 5, LAPIS, l, 920, 7);
        gilt(c, 5, 5, w - 10, 14, l);
        inscriptionBand(c, w, 22, 10, l);
        townIwan(c, w / 2, h, 52, 100, { wall: BRICK, frame: GOLD, door: 0x4a2a14, light: l, seed: 921, tile: TURQUOISE, lantern: true });
      },
      right: (c, w, h, l) => tilePanel(c, 4, 6, w - 8, h - 10, LAPIS, l, 922, 7),
    },
  };
  joinedMass(ctx, box, [leftRange, backRange], [rightRange, frontRange, gate]);
  courtFloor(ctx, box, 56, 328, 48, 280, 0xd8c8a4, 907);
  // The sanctuary: a square block, its portico toward the gate faced with gold.
  const sanctuary = subBox(box, 120, 264, 150, 270, 150);
  townBlock(ctx, sanctuary, {
    wall: BRICK, seed: 923, material: 'brick', coping: CREAM, roof: 'flat',
    left: (c, w, h, l) => {
      tilePanel(c, 4, 4, w - 8, h - 4, TURQUOISE, l, 924, 7);
      inscriptionBand(c, w, 10, 10, l);
    },
    right: (c, w, h, l) => {
      tilePanel(c, 4, 4, w - 8, h - 4, TURQUOISE, l, 925, 7);
      inscriptionBand(c, w, 10, 10, l);
    },
  });
  const centre = roofFloor(sanctuary, sanctuary.w / 2, sanctuary.d / 2);
  dome(ctx, centre.x, centre.y, 74, { color: GOLD, drum: 56, drumColor: TURQUOISE, bulb: 1.16, ribs: true, finial: true });
  cylinderBand(ctx, centre.x, centre.y - 44, 74, 9, LAPIS);
  // The minarets stand in the court on either side of the portico.
  for (const p of [96, 288]) {
    const foot = groundPoint(box, p, 150);
    giltMinaret(ctx, foot.x, foot.y, 10, 250);
  }
  // The gilded portico before the sanctuary.
  const portico = subBox(box, 112, 272, 132, 158, 120);
  townBlock(ctx, portico, {
    wall: GOLD, seed: 927, material: 'plaster', roof: 'flat', plinth: false,
    left: (c, w, h, l) => {
      gilt(c, 0, 0, w, h, l);
      townIwan(c, w / 2, h, 60, 92, { wall: shade(GOLD, 0.7), frame: GOLD, door: 0x4a2a14, light: l, seed: 928, open: true, lantern: true });
      for (const u of [22, w - 22]) townIwan(c, u, h, 22, 52, { wall: shade(GOLD, 0.7), frame: GOLD, door: 0x4a2a14, light: l, seed: 929 + u, open: true });
    },
    right: (c, w, h, l) => gilt(c, 0, 0, w, h, l),
  });
  // Two cypresses in the court before the portico.
  for (const [p, q] of [[84, 120], [300, 120]] as const) {
    const at = groundPoint(box, p, q);
    cypressAt(ctx, at.x, at.y, 120, 24, 0x2a5a3a, 940 + p);
  }
  joinedMass(ctx, box, [rightRange, frontRange, gate], [leftRange, backRange]);
}

export function paintKarbilaShrine(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 330, 16);
  paintTexture(scene, key, texW, texH, ctx => paintShrine(ctx, box));
}
