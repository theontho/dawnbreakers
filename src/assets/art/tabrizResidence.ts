import type Phaser from 'phaser';
import type { BuildingFront } from './buildingFronts';
import { CELL, css, footprintBox, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { recess } from './massing';
import { archPath, band, latticeWindow } from './ornaments';
import { sakku, steps } from './streetLife';
import { joinedMass, type MassPart } from './town/joinedMass';
import { inscriptionBand, tilePanel, townIwan } from './town/monumentKit';
import { CREAM, TURQUOISE } from './town/townKit';
import { TABRIZ_BRICK, TABRIZ_LIME } from './tabrizFacade';

/**
 * The gate of the governor's residence in Tabríz, summer 1848, at true
 * scale (5 x 3 cells): a tall brick portal (about 6.5 m) proud of two low
 * guard wings, the arch of its iwan framed in turquoise tile with a
 * lion-and-sun panel over it, and a person-sized wicket door at the back
 * of the vault. The gate faces south (the left face); the residence's
 * compound wall meets the wings either side.
 */

const PORTAL_H = 150;
const WING_H = 92;
const ARCH = { w: 58, h: 104 } as const;
const GOLD = 0xd8a840;
const BENCH = 0xb09a78;

/** A golden sun with a lion beneath it, on a turquoise field: the Qajar arms over the arch. */
function lionAndSun(c: Ctx, cx: number, cy: number, l: number): void {
  tilePanel(c, cx - 14, cy - 12, 28, 24, TURQUOISE, l, 811, 4);
  c.fillStyle = css(shade(GOLD, l));
  c.strokeStyle = css(shade(GOLD, l * 0.8));
  c.lineWidth = 0.8;
  c.beginPath();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    c.moveTo(cx + Math.cos(a) * 4, cy - 4 + Math.sin(a) * 4);
    c.lineTo(cx + Math.cos(a) * 7, cy - 4 + Math.sin(a) * 7);
  }
  c.stroke();
  c.beginPath();
  c.arc(cx, cy - 4, 3.6, 0, Math.PI * 2);
  c.fill();
  // The lion walking left, in silhouette.
  c.fillStyle = css(shade(0xc89030, l));
  c.beginPath();
  c.ellipse(cx, cy + 5, 6.5, 2.4, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(cx - 6, cy + 3.2, 2.4, 0, Math.PI * 2);
  c.fill();
  for (const u of [-5, -2, 3, 5.5]) c.fillRect(cx + u, cy + 6, 1, 3.2);
  c.fillRect(cx + 6, cy + 2.5, 3, 0.9);
}

/** The portal's south face: the tiled iwan, the arms above it, an inscription band, small guard windows. */
function portalFace(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, 6, 3, TABRIZ_LIME, l);
  inscriptionBand(c, w, 12, 9, l);
  const cx = w / 2;
  townIwan(c, cx, h, ARCH.w, ARCH.h, { wall: TABRIZ_BRICK, frame: TABRIZ_LIME, door: 0x4a2e1c, light: l, seed: 812, tile: TURQUOISE, lantern: true });
  lionAndSun(c, cx, h - ARCH.h - 22, l);
  for (const u of [10, w - 10]) {
    archPath(c, u - 5, 44, 10, 16);
    c.fillStyle = css(shade(TABRIZ_BRICK, l * 0.45));
    c.fill();
  }
}

/** The portal's east face: plain brick with a lime string course and one high window. */
function portalSide(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, 6, 3, TABRIZ_LIME, l);
  band(c, w, h - 58, 2, TABRIZ_LIME, l);
  latticeWindow(c, w / 2 - 6, 40, 12, 18, { frame: TABRIZ_LIME, light: l });
}

/** A guard wing: blind arches over a lime string course, the guards' bench in the middle one. */
function wingFace(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, 5, 3, TABRIZ_LIME, l);
  band(c, w, h - 60, 2, TABRIZ_LIME, l);
  for (let u = 16; u + 12 <= w; u += 32) recess(c, u - 10, h - 6, 20, 46, TABRIZ_BRICK, l);
  latticeWindow(c, w / 2 - 6, 14, 12, 14, { frame: TABRIZ_LIME, light: l });
}

function brickPart(p0: number, p1: number, q0: number, q1: number, h: number, seed: number, left: (c: Ctx, w: number, h: number, l: number) => void, right?: (c: Ctx, w: number, h: number, l: number) => void): MassPart {
  return {
    p0, p1, q0, q1, h,
    spec: { wall: TABRIZ_BRICK, seed, material: 'brick', coping: CREAM, left, right: right ?? left },
  };
}

function drawGate(ctx: Ctx, box: IsoBox): void {
  const { w, d } = box;
  const west = brickPart(0, 40, 10, d - 10, WING_H, 821, wingFace);
  const east = brickPart(w - 40, w, 10, d - 10, WING_H, 823, wingFace);
  const portal = brickPart(40, w - 40, 0, d, PORTAL_H, 825, portalFace, portalSide);
  joinedMass(ctx, box, [west, portal, east]);
  // The guards' benches at the foot of the wings.
  sakku(ctx, box, 4, 34, -8, 10, BENCH, 827);
  sakku(ctx, box, w - 34, w - 4, -8, 10, BENCH, 828);
  // The threshold: a worn dressed-stone step before the arch.
  steps(ctx, box, w / 2 - 30, w / 2 + 30, -6, 0, 1, 'q', 3);
}

/** The portal is the residence's front on the street, its wicket door in the middle of the 5-cell face. */
export const RESIDENCE_GATE_FRONT: BuildingFront = { side: 's', door: (5 * CELL) / 2 };

export function paintResidenceGate(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, PORTAL_H, 24);
  paintTexture(scene, key, texW, texH, ctx => drawGate(ctx, box));
}
