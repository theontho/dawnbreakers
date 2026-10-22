import type Phaser from 'phaser';
import { footprintBox, groundPoint, paintTexture, roofPoint, type Ctx, type IsoBox } from '../canvasKit';
import { cylinderBand, dome } from '../ornaments';
import { subBox } from '../structureParts';
import { hawz } from './fountain';
import { courtFloor, cypressAt } from './houseKit';
import { arcade, blindArches, inscriptionBand, minaret, tilePanel, townIwan } from './monumentKit';
import { CREAM, LAPIS, roofFloor, townBlock, TURQUOISE } from './townKit';

/**
 * The congregational mosque (12 x 10: 384 x 320 px of ground, about 17 by
 * 14 m). From the street: plain brick ranges with blind arches, and a tiled
 * pīshṭāq whose crest rises only a parapet above them. Over the walls show
 * the two-tier arcades round the court, the qibla iwan with its pair of
 * minarets, and the turquoise dome (about 7 m across) on its drum.
 */

const BRICK = 0xc8a26e;
const RANGE_H = 120;
const COURT_H = 140;

function brickBlock(ctx: Ctx, b: IsoBox, seed: number, left?: (c: Ctx, w: number, h: number, l: number) => void, right?: (c: Ctx, w: number, h: number, l: number) => void): void {
  townBlock(ctx, b, { wall: BRICK, seed, material: 'brick', coping: CREAM, left, right });
}

/** Two tiers of arches facing the court. */
function courtArcade(c: Ctx, w: number, h: number, l: number, bay: number): void {
  arcade(c, w, h - 4, { wall: BRICK, light: l, bay, arch: bay * 0.66, rise: 56, tile: TURQUOISE });
  c.fillStyle = 'rgba(20,12,6,0.18)';
  c.fillRect(0, h - 70, w, 2);
  arcade(c, w, h - 72, { wall: BRICK, light: l, bay, arch: bay * 0.6, rise: 46, tile: TURQUOISE });
}

/** The outer face of a street range: blind arches under an inscription band. */
function streetFace(c: Ctx, w: number, h: number, l: number): void {
  inscriptionBand(c, w, 8, 9, l);
  blindArches(c, w, h - 12, 32, 64, BRICK, l);
}

function paintGreatMosque(ctx: Ctx, box: IsoBox): void {
  // The left range, its arcade facing across the court.
  brickBlock(ctx, subBox(box, 0, 64, 48, 320, COURT_H), 711, undefined, (c, w, h, l) => courtArcade(c, w, h, l, 37.3));
  // The prayer hall at the back, between two arcaded wings.
  brickBlock(ctx, subBox(box, 64, 112, 160, 320, COURT_H), 713, (c, w, h, l) => courtArcade(c, w, h, l, 48));
  const hall = subBox(box, 112, 272, 160, 320, 150);
  brickBlock(ctx, hall, 715, undefined, (c, w, _h, l) => inscriptionBand(c, w, 10, 10, l));
  const centre = roofFloor(hall, hall.w / 2, hall.d / 2);
  dome(ctx, centre.x, centre.y, 104, {
    color: TURQUOISE, drum: 38, drumColor: BRICK, bulb: 1.12, pattern: CREAM, ribs: true, finial: true,
  });
  cylinderBand(ctx, centre.x, centre.y - 38, 104, 6, LAPIS);
  brickBlock(ctx, subBox(box, 272, 320, 160, 320, COURT_H), 717, (c, w, h, l) => courtArcade(c, w, h, l, 48));
  // The qibla iwan, its portal standing over the court, a minaret on each shoulder.
  const iwan = subBox(box, 136, 248, 148, 176, 196);
  townBlock(ctx, iwan, {
    wall: BRICK, seed: 719, material: 'brick', coping: CREAM, roof: 'flat',
    left: (c, w, h, l) => {
      tilePanel(c, 6, 6, w - 12, h - 6, LAPIS, l, 720, 8);
      inscriptionBand(c, w, 12, 12, l);
      townIwan(c, w / 2, h, 66, 136, { wall: BRICK, frame: TURQUOISE, door: 0x4a2a14, light: l, seed: 721, tile: TURQUOISE, lantern: true });
    },
    right: (c, w, h, l) => tilePanel(c, 3, 6, w - 6, h - 6, LAPIS, l, 722, 8),
  });
  for (const p of [14, iwan.w - 14]) {
    const foot = roofPoint(iwan, p, iwan.d / 2);
    minaret(ctx, foot.x, foot.y, 11, 96, BRICK);
  }
  // The court: paving, a pool for ablutions, a cypress before each wing.
  courtFloor(ctx, box, 64, 320, 48, 160, 0xc0a07a, 707);
  for (const [p, q] of [[96, 146], [296, 146]] as const) {
    const at = groundPoint(box, p, q);
    cypressAt(ctx, at.x, at.y, 170, 30, 0x24553a, 700 + p);
  }
  hawz(ctx, box, 150, 234, 72, 120, 10, 7, 709, 3);
  // The street ranges: the right one, then the front with its portal.
  brickBlock(ctx, subBox(box, 320, 384, 48, 320, RANGE_H), 723, undefined, streetFace);
  brickBlock(ctx, subBox(box, 0, 384, 0, 48, RANGE_H), 725, streetFace, streetFace);
  const portal = subBox(box, 148, 236, 0, 58, RANGE_H + 14);
  townBlock(ctx, portal, {
    wall: BRICK, seed: 727, material: 'brick', coping: CREAM, roof: 'flat',
    left: (c, w, h, l) => {
      tilePanel(c, 5, 5, w - 10, h - 5, TURQUOISE, l, 728, 7);
      inscriptionBand(c, w, 12, 11, l);
      townIwan(c, w / 2, h, 52, 88, { wall: BRICK, frame: TURQUOISE, door: 0x4a2a14, light: l, seed: 729, tile: LAPIS, lantern: true });
    },
    right: (c, w, h, l) => blindArches(c, w, h - 12, 29, 64, BRICK, l),
  });
}

export function paintMosqueGreat(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 190, 12);
  paintTexture(scene, key, texW, texH, ctx => paintGreatMosque(ctx, box));
}

