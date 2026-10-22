import type Phaser from 'phaser';
import { CELL, css, footprintBox, groundPoint, paintTexture, shade, type Ctx, type IsoBox } from '../canvasKit';
import { planks } from '../materials';
import { archPath, cylinder } from '../ornaments';
import { laneDust } from '../streetLife';
import { subBox } from '../structureParts';
import { tilePanel } from './monumentKit';
import { TURQUOISE, townBlock, townMerlons, TIMBER } from './townKit';
import { TOWN_WALL } from './townWalls';

/**
 * The Kázirún gate of Shíráz (4 x 3: 128 x 96 px of ground). A gatehouse of
 * rammed earth and brick between two round towers, its arched passage tall
 * enough for a laden camel (about 4.5 m, 104 px), a tiled panel over the
 * arch. The towers stand on the front row, where the city wall runs in from
 * both sides to meet them; the gatehouse runs back into the city behind.
 */

const EARTH = TOWN_WALL.color;
const PASSAGE = { w: 52, h: 104 } as const;
const GATE_H = 172;
const TOWER_H = 192;
const TOWER_R = 26;

/** A round tower in rammed earth: lifts, loopholes and a crown of merlons. */
function tower(ctx: Ctx, x: number, y: number): void {
  cylinder(ctx, x, y, TOWER_R, TOWER_H, EARTH, true);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - TOWER_R, y - TOWER_H, TOWER_R * 2, TOWER_H + TOWER_R);
  ctx.clip();
  for (let k = 18; k < TOWER_H - 6; k += 18) {
    ctx.strokeStyle = 'rgba(40,24,10,0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(x, y - k, TOWER_R, TOWER_R * 0.45, 0, 0, Math.PI);
    ctx.stroke();
  }
  // A stone footing.
  ctx.fillStyle = 'rgba(60,50,40,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, y - 11, TOWER_R, TOWER_R * 0.45, 0, 0, Math.PI);
  ctx.lineTo(x - TOWER_R, y - 22);
  ctx.ellipse(x, y - 22, TOWER_R, TOWER_R * 0.45, 0, Math.PI, 0, true);
  ctx.fill();
  ctx.restore();
  for (const dx of [-0.45, 0.05, 0.5]) {
    ctx.fillStyle = 'rgba(16,10,4,0.8)';
    ctx.fillRect(x + dx * TOWER_R - 1.5, y - TOWER_H + 22, 3, 14);
    ctx.fillRect(x + dx * TOWER_R - 1.5, y - TOWER_H + 90, 3, 12);
  }
  // Merlons round the top, the near ones lit on their left.
  for (let a = -0.85; a <= 0.86; a += 0.34) {
    const mx = x + Math.sin(a) * TOWER_R * 0.92;
    const my = y - TOWER_H + Math.cos(a) * TOWER_R * 0.42;
    ctx.fillStyle = css(shade(EARTH, 1.15 - a * 0.35));
    ctx.beginPath();
    ctx.moveTo(mx - 5, my);
    ctx.lineTo(mx - 5, my - 10);
    ctx.quadraticCurveTo(mx, my - 16, mx + 5, my - 10);
    ctx.lineTo(mx + 5, my);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(28,18,10,0.5)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
}

/** The passage: a pointed arch through the gatehouse, its leaves swung back, daylight at the far end. */
function passage(c: Ctx, w: number, h: number, l: number): void {
  // The towers stand forward of the gatehouse, so the arch sits a little left of centre to clear the near one.
  const cx = w / 2 - 4;
  const x = cx - PASSAGE.w / 2;
  tilePanel(c, x - 12, h - PASSAGE.h - 48, PASSAGE.w + 24, 40, TURQUOISE, l, 1601, 7);
  archPath(c, x - 5, h, PASSAGE.w + 10, PASSAGE.h + 5);
  c.fillStyle = css(shade(0xb89670, l * 1.05));
  c.fill();
  archPath(c, x, h, PASSAGE.w, PASSAGE.h);
  const g = c.createLinearGradient(0, h - PASSAGE.h, 0, h);
  g.addColorStop(0, css(0x120a04));
  g.addColorStop(1, css(0x2e2014));
  c.fillStyle = g;
  c.fill();
  // The far opening, small with distance, bright with the evening outside.
  archPath(c, cx - 12, h - 10, 24, 52);
  const sky = c.createLinearGradient(0, h - 62, 0, h - 10);
  sky.addColorStop(0, '#e8b070');
  sky.addColorStop(1, '#a88a5a');
  c.fillStyle = sky;
  c.fill();
  c.fillStyle = 'rgba(200,170,120,0.25)';
  c.beginPath();
  c.moveTo(cx - 12, h - 10);
  c.lineTo(cx + 12, h - 10);
  c.lineTo(x + PASSAGE.w, h);
  c.lineTo(x, h);
  c.closePath();
  c.fill();
  // The great leaves, folded back against the reveals.
  for (const side of [-1, 1]) {
    const lx = side < 0 ? x + 2 : x + PASSAGE.w - 12;
    c.save();
    c.beginPath();
    c.rect(lx, h - 76, 10, 76);
    c.clip();
    planks(c, lx + 10, h, { base: 0x5a3a20, light: l * (side < 0 ? 0.7 : 0.95), seed: 1602 }, true, 3);
    c.fillStyle = css(shade(0xb0a080, l), 0.8);
    for (let v = h - 70; v < h - 4; v += 8) c.fillRect(lx + 2, v, 1.5, 1.5);
    c.restore();
  }
}

function paintGate(ctx: Ctx, box: IsoBox): void {
  // The towers stand on the line of the wall (the front row); the gatehouse stands back between them.
  const qWall = CELL / 2;
  laneDust(ctx, box, 30, 98, 0, qWall + 6, 1607, 0x8a7656);
  const house = subBox(box, 24, 104, qWall + 4, box.d - 2, GATE_H);
  townBlock(ctx, house, {
    wall: EARTH, seed: 1605, material: 'mud', roof: 'flat', merlons: false,
    left: passage,
    right: (c, w, h, l) => {
      c.fillStyle = 'rgba(16,10,4,0.8)';
      c.fillRect(w / 2 - 1.5, h - 120, 3, 14);
      c.fillStyle = css(shade(TIMBER, l));
      for (let u = 8; u < w - 4; u += 18) c.fillRect(u, 12, 5, 4);
    },
  });
  townMerlons(ctx, house, EARTH, 10, 6, 14);
  const r = TOWER_R / Math.SQRT2;
  for (const p of [r + 1, box.w - r - 1]) {
    const at = groundPoint(box, p, qWall);
    tower(ctx, at.x, at.y);
  }
}

export function paintCityGateLarge(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, TOWER_H, 30);
  paintTexture(scene, key, texW, texH, ctx => paintGate(ctx, box));
}
