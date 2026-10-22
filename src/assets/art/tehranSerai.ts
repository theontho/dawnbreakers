import type Phaser from 'phaser';
import type { BuildingFront } from './buildingFronts';
import { CELL, css, footprintBox, paintTexture, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { planks } from './materials';
import { recess } from './massing';
import { archPath, band, latticeWindow } from './ornaments';
import { sakku, steps } from './streetLife';
import { joinedMass, type MassPart } from './town/joinedMass';
import { inscriptionBand, tilePanel } from './town/monumentKit';
import { CREAM, LAPIS, STONE, TURQUOISE } from './town/townKit';

/**
 * The street gate of a merchants' caravanserai by the bazaar of Ṭihrán,
 * winter 1850, at true scale (5 x 3 cells): a brick pīshṭāq about 6.5 m
 * high, framed in lapis tile, whose gateway is tall enough for a laden mule
 * (about 2 m by 3.6 m), its leaves folded back on a court in winter light.
 * Two lower wings either side hold shop bays shut for the cold, with the
 * porters' benches at their feet. The gate faces south (the left face);
 * the serai's street wall meets the wings either side.
 */

const BRICK = 0xb08660;
const WOOD = 0x553a22;
const PORTAL_H = 150;
const WING_H = 84;
const ARCH = { w: 56, h: 108 } as const;
const GATE = { w: 40, h: 82 } as const;
const BENCH = 0xa89474;

/** The vault of the portal, its gate leaves open on the pale court beyond. */
function gateway(c: Ctx, cx: number, base: number, l: number): void {
  archPath(c, cx - ARCH.w / 2 - 3, base, ARCH.w + 6, ARCH.h + 3);
  c.fillStyle = css(shade(CREAM, l));
  c.fill();
  archPath(c, cx - ARCH.w / 2, base, ARCH.w, ARCH.h);
  const vault = c.createLinearGradient(0, base - ARCH.h, 0, base);
  vault.addColorStop(0, css(shade(BRICK, l * 0.3)));
  vault.addColorStop(1, css(shade(BRICK, l * 0.55)));
  c.fillStyle = vault;
  c.fill();
  // The court beyond: cold, bright, a bale or two on the paving.
  const gx = cx - GATE.w / 2;
  archPath(c, gx, base - 2, GATE.w, GATE.h);
  const court = c.createLinearGradient(0, base - GATE.h, 0, base);
  court.addColorStop(0, '#d8d4c8');
  court.addColorStop(1, '#a89a80');
  c.fillStyle = court;
  c.fill();
  c.fillStyle = css(shade(0x6a5a44, l));
  c.fillRect(cx + 4, base - 12, 9, 6);
  c.fillStyle = css(shade(0x8a7050, l));
  c.fillRect(cx - 12, base - 10, 7, 5);
  // The leaves folded back against the reveals, studded with iron.
  for (const side of [-1, 1]) {
    const lx = side < 0 ? gx - 8 : gx + GATE.w - 2;
    c.save();
    c.beginPath();
    c.rect(lx, base - GATE.h + 8, 10, GATE.h - 10);
    c.clip();
    planks(c, lx + 10, base, { base: WOOD, light: l * (side < 0 ? 0.65 : 0.95), seed: 1501 }, true, 3);
    c.fillStyle = css(shade(0xb0a080, l), 0.8);
    for (let v = base - GATE.h + 14; v < base - 4; v += 9) c.fillRect(lx + 3, v, 1.5, 1.5);
    c.restore();
  }
  // The worn sill.
  c.fillStyle = css(shade(STONE, l));
  c.fillRect(cx - ARCH.w / 2 - 2, base - 3, ARCH.w + 4, 3);
}

/** The portal's south face: lapis frame, an inscription band, the gateway, two small guard windows. */
function portalFace(c: Ctx, w: number, h: number, l: number): void {
  tilePanel(c, 5, 8, w - 10, h - 8, LAPIS, l, 1502, 6);
  c.save();
  c.translate(9, 0);
  inscriptionBand(c, w - 18, 16, 10, l);
  c.restore();
  gateway(c, w / 2, h, l);
  for (const u of [12, w - 12]) {
    archPath(c, u - 4, h - ARCH.h + 10, 8, 14);
    c.fillStyle = css(shade(BRICK, l * 0.42));
    c.fill();
  }
}

/** The portal's east face: plain brick, a turquoise strip, one high window. */
function portalSide(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, 8, 4, TURQUOISE, l);
  band(c, w, h - 64, 2, CREAM, l);
  latticeWindow(c, w / 2 - 6, 44, 12, 18, { frame: CREAM, light: l });
}

/** A shop bay in a wing, its plank shutter drawn for the winter. */
function shopBay(c: Ctx, x: number, base: number, l: number, seed: number): void {
  recess(c, x, base - 10, 22, 46, BRICK, l);
  c.save();
  archPath(c, x + 2, base - 10, 18, 40);
  c.clip();
  planks(c, x + 20, base - 10, { base: 0x5a4430, light: l * 0.9, seed }, true, 3);
  c.restore();
  // The raised platform the shopkeeper sits on, a step proud of the wall.
  c.fillStyle = css(shade(STONE, l * 0.95));
  c.fillRect(x - 2, base - 10, 26, 10);
  c.fillStyle = css(shade(STONE, l * 0.7));
  c.fillRect(x - 2, base - 2, 26, 2);
}

/** A wing: two shop bays under a string course, a high window over them. */
function wingFace(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, 6, 3, CREAM, l);
  band(c, w, h - 62, 2, CREAM, l);
  const rand = rng(1503 + Math.round(w));
  shopBay(c, 4, h, l, 1504 + Math.round(rand() * 10));
  if (w > 40) shopBay(c, w - 28, h, l, 1505);
  latticeWindow(c, w / 2 - 5, 12, 10, 12, { frame: CREAM, light: l });
}

function brickPart(p0: number, p1: number, q0: number, q1: number, h: number, seed: number,
  left: (c: Ctx, w: number, h: number, l: number) => void, right?: (c: Ctx, w: number, h: number, l: number) => void): MassPart {
  return { p0, p1, q0, q1, h, spec: { wall: BRICK, seed, material: 'brick', coping: CREAM, left, right: right ?? left } };
}

function drawGate(ctx: Ctx, box: IsoBox): void {
  const { w, d } = box;
  const wing = 46;
  const west = brickPart(0, wing, 12, d - 8, WING_H, 1511, wingFace);
  const east = brickPart(w - wing, w, 12, d - 8, WING_H, 1513, wingFace);
  const portal = brickPart(wing, w - wing, 0, d, PORTAL_H, 1515, portalFace, portalSide);
  joinedMass(ctx, box, [west, portal, east]);
  // The porters' benches at the foot of the wings, the dressed-stone threshold before the gate.
  sakku(ctx, box, 6, 38, -2, 12, BENCH, 1517);
  sakku(ctx, box, w - 38, w - 6, -2, 12, BENCH, 1518);
  steps(ctx, box, w / 2 - 32, w / 2 + 32, -6, 0, 1, 'q', 3);
}

/** The portal is the serai's front on the street, its gateway in the middle of the 5-cell face. */
export const SERAI_GATE_FRONT: BuildingFront = { side: 's', door: (5 * CELL) / 2 };

export function paintSeraiGate(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, PORTAL_H, 24);
  paintTexture(scene, key, texW, texH, ctx => drawGate(ctx, box));
}
