import type Phaser from 'phaser';
import { css, footprintBox, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { brick, planks, plaster } from './materials';
import { archPath, flatTop } from './ornaments';
import { snowEdge, subBox } from './structureParts';
import { snowyMerlons } from './fortresses';
import { joinedMass, type MassPart } from './town/joinedMass';

/**
 * The western gate of Ṭihrán in January 1853 (3 x 4): a gatehouse of rammed
 * earth between two square towers, set in the line of the city wall where
 * it runs north to south. The road runs east to west through the middle
 * two rows of the footprint, so the passage opens in the right (east) face,
 * toward the city; the map blocks the tower rows and leaves the passage
 * walkable. Snow lies on the wall-walks and the merlons.
 */

export const CITY_EARTH = 0xa88660;
const GATE_H = 150;
const TOWER_H = 176;
const PASSAGE = { w: 54, h: 100 } as const;
/** The towers stand this far proud of the gatehouse on its city side. */
const PROUD = 8;

/** Rammed earth in lifts, with putlog holes, rain gullies and a stone footing. */
export function rammedEarth(c: Ctx, w: number, h: number, l: number, seed: number): void {
  plaster(c, w, h, { base: CITY_EARTH, light: l, seed });
  for (let v = 18; v < h - 20; v += 18) {
    c.fillStyle = 'rgba(40,24,10,0.22)';
    c.fillRect(0, v, w, 1.2);
  }
  c.fillStyle = 'rgba(28,16,6,0.55)';
  for (let v = 30; v < h - 30; v += 36) for (let u = 6; u < w; u += 16) c.fillRect(u, v, 3, 3);
  for (let u = 4; u < w; u += 16) {
    const g = c.createLinearGradient(0, 0, 0, 36);
    g.addColorStop(0, css(shade(CITY_EARTH, l * 0.7), 0.4));
    g.addColorStop(1, css(shade(CITY_EARTH, l * 0.7), 0));
    c.fillStyle = g;
    c.fillRect(u - 1.5, 0, 3, 36);
  }
  c.fillStyle = css(shade(0x8f8068, l));
  c.fillRect(0, h - 16, w, 16);
  c.fillStyle = 'rgba(255,240,210,0.18)';
  c.fillRect(0, h - 16, w, 1);
}

/** A loophole: a tall dark slot with a lit sill. */
function loophole(c: Ctx, u: number, v: number, l: number): void {
  c.fillStyle = 'rgba(16,10,4,0.85)';
  c.fillRect(u - 1.5, v, 3, 16);
  c.fillStyle = css(shade(CITY_EARTH, l * 1.2), 0.5);
  c.fillRect(u + 1.5, v, 0.8, 16);
}

/** The city wall's height to the wall-walk, shared with its connected wall styles in walls.ts. */
export const CITY_WALL_H = 130;

/** One face of the city wall: rammed earth, a loophole every cell, on a 32 px period so runs join. */
export function cityWallFace(c: Ctx, w: number, h: number, l: number): void {
  rammedEarth(c, w, h, l, 611);
  for (let u = 13; u < w; u += 32) loophole(c, u, 16, l);
}

/** The same in winter: snow along the wall-walk and drifted at the foot. */
export function snowyCityWallFace(c: Ctx, w: number, h: number, l: number): void {
  cityWallFace(c, w, h, l);
  snowEdge(c, w, 5, 612, l);
  c.fillStyle = css(shade(0xeef3f6, l), 0.85);
  c.fillRect(0, h - 7, w, 7);
}

function snowTop(ctx: Ctx, box: IsoBox): void {
  flatTop(ctx, box, 0xe8eef2);
  snowyMerlons(ctx, box, CITY_EARTH);
}

/** A part of the gate in rammed earth: towers and gatehouse share one silhouette (see joinedMass). */
function earthPart(p0: number, p1: number, q0: number, q1: number, h: number, seed: number, right?: (c: Ctx, w: number, h: number, l: number) => void): MassPart {
  const towerFace = (c: Ctx, w: number, hh: number, l: number): void => {
    rammedEarth(c, w, hh, l, seed + (l === 1 ? 0 : 1));
    if (hh > GATE_H) for (const v of [24, 92]) loophole(c, w / 2, v, l);
    snowEdge(c, w, 5, seed + 2, l);
    c.fillStyle = 'rgba(240,244,250,0.7)';
    c.fillRect(0, hh - 6, w, 6);
  };
  return {
    p0, p1, q0, q1, h,
    spec: {
      wall: CITY_EARTH, seed, material: 'plaster', plinth: false, roof: 'flat',
      left: towerFace,
      right: (c, w, hh, l) => {
        towerFace(c, w, hh, l);
        right?.(c, w, hh, l);
      },
    },
  };
}

/** The passage arch in the gatehouse's east face: brick ring, the vault, its doors folded back, snow light beyond. */
function passage(c: Ctx, w: number, h: number, l: number): void {
  const x = w / 2 - PASSAGE.w / 2;
  archPath(c, x - 7, h, PASSAGE.w + 14, PASSAGE.h + 7);
  c.save();
  c.clip();
  brick(c, x + PASSAGE.w + 14, h, { base: 0x9a7656, light: l, seed: 593 }, 3.5, 8);
  c.restore();
  archPath(c, x, h, PASSAGE.w, PASSAGE.h);
  const dark = c.createLinearGradient(0, h - PASSAGE.h, 0, h);
  dark.addColorStop(0, '#0c0806');
  dark.addColorStop(1, '#241a12');
  c.fillStyle = dark;
  c.fill();
  // The far mouth of the passage: the snowfields west of the city, pale at dawn.
  archPath(c, w / 2 - 17, h - 8, 34, 66);
  const snow = c.createLinearGradient(0, h - 74, 0, h - 8);
  snow.addColorStop(0, '#d8b8a0');
  snow.addColorStop(1, '#eef0f2');
  c.fillStyle = snow;
  c.fill();
  // The two leaves of the gate, folded back against the reveals.
  for (const u of [x + 2, x + PASSAGE.w - 9]) {
    c.save();
    c.beginPath();
    c.rect(u, h - PASSAGE.h * 0.78, 7, PASSAGE.h * 0.78);
    c.clip();
    planks(c, u + 7, h, { base: 0x4a3424, light: l * 0.8, seed: 594 }, true, 3);
    c.restore();
  }
  c.fillStyle = 'rgba(240,244,250,0.8)';
  c.fillRect(x - 4, h - 3, PASSAGE.w + 8, 3);
}

function drawGate(ctx: Ctx, box: IsoBox): void {
  const { w, d } = box;
  const cell = d / 4;
  const north = earthPart(0, w, 3 * cell, d, TOWER_H, 596);
  const house = earthPart(0, w - PROUD, cell, 3 * cell, GATE_H, 600, (c, ww, h, l) => {
    passage(c, ww, h, l);
    for (const u of [ww * 0.18, ww * 0.82]) loophole(c, u, 26, l);
  });
  const south = earthPart(0, w, 0, cell, TOWER_H, 604);
  // Back (north) tower and gatehouse, their snowy tops, then the front (south) tower.
  joinedMass(ctx, box, [north, house], [south]);
  for (const part of [north, house]) snowTop(ctx, subBox(box, part.p0, part.p1, part.q0, part.q1, part.h));
  joinedMass(ctx, box, [south], [north, house]);
  snowTop(ctx, subBox(box, south.p0, south.p1, south.q0, south.q1, south.h));
}

export function paintTehranGate(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, TOWER_H + 24, 4);
  paintTexture(scene, key, texW, texH, ctx => drawGate(ctx, box));
}
