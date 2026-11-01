import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, outlineBox, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { brick, planks } from './materials';
import { archPath, band, doorway, flatTop, parapetRoof, walls } from './ornaments';
import { sakku, waterJar } from './streetLife';
import { glow, liftedPoint, subBox } from './structureParts';
import { TOWN_DOOR, townMerlons, townWindow } from './town/townKit';

/**
 * Baghdád on the Tigris, winter 1845, at true scale (a storey is about
 * 75 px). The houses of the river quarters are of the city's buff-yellow
 * brick, plain below, and their upper rooms lean out over the lane in a
 * shanashil: a timber oriel of turned lattice that lets the women of the
 * house see the river without being seen. Three pieces:
 *
 * - a two-storey river house (5 x 4 cells, about 7 by 5.5 m), its door at
 *   the second cell of its front;
 * - the same house as a coffee-house, its ground floor open in three
 *   arches to the quay, benches before it;
 * - the governor's serai (10 x 6), a long brick front with a lattice
 *   gallery over a pointed gateway at its fifth cell, and the low barred
 *   door of its prison at its ninth.
 */

const BRICK = 0xc9a874;
const TIMBER = 0x5a3c24;
const LATTICE = 0x7a5434;
const STOREY = 75;

/** Where a door painted on a building's front stands, in cells from its west corner. */
export const BAGHDAD_HOUSE_DOOR_CELL = 1;
export const BAGHDAD_SERAI_GATE_CELL = 4;
export const BAGHDAD_SERAI_PRISON_CELL = 8;

const cellU = (cell: number, inset: number) => (cell + 0.5) * 32 - inset;

/** The brick face with its plinth of darker, damp-stained courses. */
function brickFace(c: Ctx, w: number, h: number, l: number, seed: number): void {
  brick(c, w, h, { base: BRICK, light: l, seed }, 4, 9);
  const damp = c.createLinearGradient(0, h - 26, 0, h);
  damp.addColorStop(0, 'rgba(70,50,30,0)');
  damp.addColorStop(1, 'rgba(70,50,30,0.35)');
  c.fillStyle = damp;
  c.fillRect(0, h - 26, w, 26);
}

/**
 * A shanashil standing out from a left face between p0 and p1 of `parent`:
 * a timber box on brackets, its front a run of turned-lattice panels.
 */
function shanashil(ctx: Ctx, parent: IsoBox, p0: number, p1: number, face: number, lift: number, seed: number): void {
  const depth = 12;
  const h = 48;
  // Brackets first, under the box.
  ctx.strokeStyle = css(shade(TIMBER, 0.85));
  ctx.lineWidth = 2;
  for (let p = p0 + 6; p <= p1 - 4; p += 22) {
    const wall = liftedPoint(parent, p, face, lift - 18);
    const out = liftedPoint(parent, p, face - depth + 2, lift);
    ctx.beginPath();
    ctx.moveTo(wall.x, wall.y);
    ctx.lineTo(out.x, out.y);
    ctx.stroke();
  }
  const box = subBox(parent, p0, p1, face - depth, face, h, lift);
  walls(ctx, box, (c, w, hh, l) => planks(c, w, hh, { base: TIMBER, light: l, seed }, true, 4), {
    left: (c, w, hh, l) => latticePanels(c, w, hh, l, 4, 13),
    right: (c, w, hh, l) => latticePanels(c, w, hh, l, 4, 13),
  });
  flatTop(ctx, box, shade(TIMBER, 0.8));
  outlineBox(ctx, box);
}

/** Lattice panels set in the timber frame, with a plain rail at the foot and a cornice at the head. */
function latticePanels(c: Ctx, w: number, h: number, l: number, top: number, panel: number): void {
  const bottom = h - 9;
  for (let u = 3; u + panel <= w - 2; u += panel + 3) {
    c.fillStyle = css(0x1a120c);
    c.fillRect(u, top + 3, panel, bottom - top - 3);
    c.strokeStyle = css(shade(LATTICE, l * 1.15), 0.95);
    c.lineWidth = 0.9;
    for (let v = top + 5; v < bottom; v += 3.5) {
      c.beginPath();
      c.moveTo(u, v);
      c.lineTo(u + panel, v);
      c.stroke();
    }
    for (let k = u + 2; k < u + panel; k += 3.5) {
      c.beginPath();
      c.moveTo(k, top + 3);
      c.lineTo(k, bottom);
      c.stroke();
    }
  }
  c.fillStyle = css(shade(TIMBER, l * 1.2));
  c.fillRect(0, 0, w, 3);
  c.fillRect(0, bottom, w, 2);
}

interface HouseLook {
  seed: number;
  coffee?: boolean;
}

function drawRiverHouse(ctx: Ctx, box: IsoBox, look: HouseLook): void {
  const inset = 4;
  const face = 20;
  const body = subBox(box, inset, box.w - inset, face, box.d - 4, STOREY * 2);
  groundShadow(ctx, body, 16, 0.3);
  const doorU = cellU(BAGHDAD_HOUSE_DOOR_CELL, inset);
  walls(ctx, body, (c, w, h, l) => brickFace(c, w, h, l, look.seed), {
    left: (c, w, h, l) => {
      band(c, w, h - STOREY - 4, 4, shade(BRICK, 0.85), l);
      if (look.coffee) coffeeArches(c, w, h, l);
      else {
        doorway(c, doorU - TOWN_DOOR.w / 2, h, TOWN_DOOR.w, TOWN_DOOR.h, { frame: shade(BRICK, 0.8), door: 0x4a3020, light: l, seed: look.seed + 1 });
        townWindow(c, w * 0.72, h, 34, { frame: TIMBER, light: l, shutters: 0x3a4a3a }, 12, 16);
      }
      townWindow(c, w * 0.12, h, STOREY + 18, { frame: TIMBER, light: l, arched: true }, 10, 18);
    },
    right: (c, w, h, l) => {
      band(c, w, h - STOREY - 4, 4, shade(BRICK, 0.85), l);
      townWindow(c, w * 0.5, h, 36, { frame: TIMBER, light: l }, 10, 14);
      townWindow(c, w * 0.35, h, STOREY + 16, { frame: TIMBER, light: l, arched: true, lit: look.coffee }, 12, 20);
    },
  });
  outlineBox(ctx, body);
  shanashil(ctx, box, inset + body.w * 0.3, inset + body.w * 0.92, face, STOREY + 6, look.seed + 3);
  parapetRoof(ctx, body, shade(BRICK, 0.95), { base: 0xa88a62, light: 1.05, seed: look.seed + 5 });
  if (look.coffee) {
    sakku(ctx, box, inset + 6, inset + 60, face - 14, face - 2, 0xb89a72, look.seed + 7, 10);
    sakku(ctx, box, inset + 84, box.w - inset - 8, face - 14, face - 2, 0xb89a72, look.seed + 9, 10);
  } else {
    const jar = liftedPoint(box, inset + doorU + 22, face - 5, 0);
    waterJar(ctx, jar.x, jar.y, 7, 0x9a6a44);
  }
}

/** Three open arches into the coffee-room, lamplit and smoky within. */
function coffeeArches(c: Ctx, w: number, h: number, l: number): void {
  const aw = 30;
  const ah = 52;
  for (const u of [w * 0.2, w * 0.5, w * 0.8]) {
    archPath(c, u - aw / 2 - 3, h, aw + 6, ah + 3);
    c.fillStyle = css(shade(BRICK, l * 0.78));
    c.fill();
    archPath(c, u - aw / 2, h, aw, ah);
    c.save();
    c.clip();
    c.fillStyle = css(0x1e140c);
    c.fillRect(u - aw / 2, h - ah, aw, ah);
    glow(c, u, h - 20, 26, 0xffb860, 0.45);
    // A shelf of cups and the brass coffee-pots at the back.
    c.fillStyle = css(0x6a4a2a);
    c.fillRect(u - aw / 2, h - 30, aw, 2);
    c.fillStyle = css(0xc89a40);
    for (const k of [-8, 0, 8]) {
      c.beginPath();
      c.ellipse(u + k, h - 34, 2.4, 3.2, 0, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
}

export function paintBaghdadHouse(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, coffee = false): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, STOREY * 2 + 10, 16);
  paintTexture(scene, key, texW, texH, ctx => drawRiverHouse(ctx, box, { seed: coffee ? 7421 : 7401, coffee }));
}

/** The governor's serai: a long two-storey front, a gallery over the gateway, the prison door. */
function drawSerai(ctx: Ctx, box: IsoBox): void {
  const inset = 2;
  const face = 18;
  const h = 170;
  const body = subBox(box, inset, box.w - inset, face, box.d - 2, h);
  groundShadow(ctx, body, 20, 0.3);
  const gateU = cellU(BAGHDAD_SERAI_GATE_CELL, inset);
  const prisonU = cellU(BAGHDAD_SERAI_PRISON_CELL, inset);
  walls(ctx, body, (c, w, hh, l) => brickFace(c, w, hh, l, 7441), {
    left: (c, w, hh, l) => {
      band(c, w, hh - 92, 5, shade(BRICK, 0.82), l);
      // Blind arches along the ground floor, leaving room for the two doors.
      for (let u = 18; u < w - 12; u += 34) {
        if (Math.abs(u - gateU) < 40 || Math.abs(u - prisonU) < 26) continue;
        archPath(c, u - 11, hh - 10, 22, 50);
        c.fillStyle = css(shade(BRICK, l * 0.8));
        c.fill();
        townWindow(c, u, hh, 40, { frame: TIMBER, light: l }, 9, 13);
      }
      seraiGate(c, gateU, hh, l);
      prisonDoor(c, prisonU, hh, l);
      // The upper storey's shuttered windows.
      for (let u = 22; u < w - 10; u += 30) {
        if (u > gateU - 70 && u < gateU + 70) continue;
        townWindow(c, u, hh, 112, { frame: TIMBER, light: l, shutters: 0x3a4a52, arched: true }, 11, 22);
      }
    },
    right: (c, w, hh, l) => {
      band(c, w, hh - 92, 5, shade(BRICK, 0.82), l);
      for (let u = 24; u < w - 10; u += 34) {
        townWindow(c, u, hh, 40, { frame: TIMBER, light: l }, 9, 13);
        townWindow(c, u, hh, 112, { frame: TIMBER, light: l, shutters: 0x3a4a52, arched: true }, 11, 22);
      }
    },
  });
  outlineBox(ctx, body);
  shanashil(ctx, box, inset + gateU - 66, inset + gateU + 66, face, 104, 7443);
  parapetRoof(ctx, body, shade(BRICK, 0.92), { base: 0xa88a62, light: 1.05, seed: 7445 });
  townMerlons(ctx, body, shade(BRICK, 0.95), 7, 9, 9);
  // Mounting-blocks at the gateway.
  sakku(ctx, box, inset + gateU - 42, inset + gateU - 24, face - 10, face, 0xa89878, 7447, 8);
  sakku(ctx, box, inset + gateU + 24, inset + gateU + 42, face - 10, face, 0xa89878, 7449, 8);
}

/** The serai's gateway: a tall pointed arch in a framed panel, its doors standing open on a dark passage. */
function seraiGate(c: Ctx, u: number, h: number, l: number): void {
  const fw = 50;
  const fh = 88;
  c.fillStyle = 'rgba(30,18,8,0.28)';
  c.fillRect(u + fw / 2, h - fh + 2, 2, fh - 2);
  c.fillStyle = css(shade(0xd8c098, l));
  c.fillRect(u - fw / 2, h - fh, fw, fh);
  c.strokeStyle = css(shade(0x2e6a7a, l), 0.9);
  c.lineWidth = 2;
  c.strokeRect(u - fw / 2 + 3, h - fh + 3, fw - 6, fh - 3);
  doorway(c, u - 15, h, 30, 66, { frame: shade(BRICK, 0.75), light: l, open: true, tile: 0x2e6a7a });
}

/** The prison door: low, iron-bound, a barred grating beside it at a man's height. */
function prisonDoor(c: Ctx, u: number, h: number, l: number): void {
  const w = 22;
  const dh = 46;
  c.fillStyle = css(shade(0x8a7a62, l));
  c.fillRect(u - w / 2 - 5, h - dh - 6, w + 10, dh + 6);
  c.fillStyle = css(0x1a120c);
  c.fillRect(u - w / 2, h - dh, w, dh);
  c.save();
  c.beginPath();
  c.rect(u - w / 2 + 1, h - dh + 1, w - 2, dh - 1);
  c.clip();
  planks(c, u + w / 2, h, { base: 0x3e2c1c, light: l, seed: 7455 }, true, 3);
  c.restore();
  c.fillStyle = css(shade(0x3a3a3c, l));
  for (const v of [h - dh + 8, h - 14]) c.fillRect(u - w / 2, v, w, 2.5);
  // The grating.
  const gx = u + w / 2 + 10;
  c.fillStyle = css(0x120c08);
  c.fillRect(gx, h - 40, 12, 12);
  c.fillStyle = css(shade(0x4a4a4c, l));
  for (let k = 0; k < 4; k++) c.fillRect(gx + 1.5 + k * 3, h - 40, 1.2, 12);
}

export function paintBaghdadSerai(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 190, 16);
  paintTexture(scene, key, texW, texH, ctx => drawSerai(ctx, box));
}
