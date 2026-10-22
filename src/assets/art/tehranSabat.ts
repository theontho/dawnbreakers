import { css, shade, type Ctx, type IsoBox } from './canvasKit';
import { wornPlaster } from './facade';
import { edges } from './massing';
import { brick, planks } from './materials';
import { archPath, band, flatTop, latticeWindow, walls } from './ornaments';
import { laneDust } from './streetLife';
import { subBox } from './structureParts';
import type { TownHouseStyle } from './town/houseKit';
import { spout, townBlock, TIMBER } from './town/townKit';
import { barredDoor, shutWindow, TEHRAN_MUD } from './tehran';

/**
 * A sābāṭ at true scale (6 x 4): rooms built over a lane on a vault, the
 * lane running north to south through it. The ground storey (4.2 m) is
 * pierced by a brick arch over the middle two columns of the footprint,
 * which the map leaves walkable; the upper storey oversails the street
 * front on its joists, with a timber oriel (shanāshīl) above the arch.
 */

const LOWER_H = 96;
const UPPER_H = 76;
const BRICK = 0x9a7656;
const SILL_STONE = 0x8a8070;
const STYLE: TownHouseStyle = { wall: TEHRAN_MUD, door: 0x3a2a1c, frame: 0x6a5038, seed: 571, shutters: 0x4a4038 };
/** The passage, in pixels along the left face: the middle two of six columns. */
export const SABAT_PASSAGE = { p0: 64, p1: 128 } as const;
const ARCH = { w: 56, h: 78 } as const;

/** The passage arch: a brick ring, the dark vault, and the lane's daylight at its far end. */
function passage(c: Ctx, h: number, l: number): void {
  const cx = (SABAT_PASSAGE.p0 + SABAT_PASSAGE.p1) / 2;
  const x = cx - ARCH.w / 2;
  archPath(c, x - 6, h, ARCH.w + 12, ARCH.h + 6);
  c.save();
  c.clip();
  brick(c, x + ARCH.w + 12, h, { base: BRICK, light: l, seed: 573 }, 3.5, 8);
  c.restore();
  archPath(c, x, h, ARCH.w, ARCH.h);
  const dark = c.createLinearGradient(0, h - ARCH.h, 0, h);
  dark.addColorStop(0, '#0c0806');
  dark.addColorStop(1, '#2a1e14');
  c.fillStyle = dark;
  c.fill();
  // The far mouth of the vault, the lane bright beyond it.
  archPath(c, cx - 13, h - 10, 26, 46);
  c.fillStyle = css(shade(0xd8c09a, l), 0.55);
  c.fill();
  c.fillStyle = css(shade(SILL_STONE, l), 0.8);
  c.fillRect(x - 4, h - 2, ARCH.w + 8, 2);
}
/** A timber oriel on the upper storey: plank sides, a lattice front, a little roof. */
function oriel(ctx: Ctx, box: IsoBox): void {
  walls(ctx, box, (c, w, h, light) => planks(c, w, h, { base: TIMBER, light, seed: 576 }, true, 3), {
    left: (c, w, h, l) => {
      latticeWindow(c, 4, 6, w - 8, h - 14, { frame: shade(TIMBER, 1.2), light: l });
      c.fillStyle = css(shade(TIMBER, l * 0.7));
      c.fillRect(0, h - 4, w, 4);
    },
  });
  flatTop(ctx, box, shade(TIMBER, 0.9));
  edges(ctx, box);
}

/** Timber struts under the oriel, painted on the wall face it hangs from. */
function struts(c: Ctx, u0: number, u1: number, v: number, l: number): void {
  c.strokeStyle = css(shade(TIMBER, l));
  c.lineWidth = 3;
  c.beginPath();
  for (const [u, dir] of [[u0 + 3, 1], [u1 - 3, -1]] as const) {
    c.moveTo(u, v);
    c.lineTo(u + dir * 8, v + 12);
  }
  c.stroke();
}

export const SABAT_TOP = LOWER_H + UPPER_H + 24;

export function drawSabat(ctx: Ctx, box: IsoBox): void {
  const { p0, p1 } = SABAT_PASSAGE;
  laneDust(ctx, box, p0 + 4, p1 - 4, -20, 6, 577);
  // One mass, both storeys: the upper floor line is a joist band, not a seam.
  const mass = subBox(box, 0, box.w, 8, box.d, LOWER_H + UPPER_H);
  const floorLine = (c: Ctx, w: number, h: number, l: number): void => {
    const v = h - LOWER_H;
    c.fillStyle = 'rgba(20,12,6,0.3)';
    c.fillRect(0, v, w, 3);
    band(c, w, v - 6, 3, shade(STYLE.wall, 0.8), l);
  };
  townBlock(ctx, mass, {
    wall: STYLE.wall, seed: STYLE.seed, material: 'mud', beams: 10,
    left: (c, w, h, l) => {
      floorLine(c, w, h, l);
      barredDoor(c, 30, h, STYLE, l);
      wornPlaster(c, 6, h - 40, 18, 12, STYLE.wall, l, 578);
      passage(c, h, l);
      shutWindow(c, w - 32, h, 56, l, 579);
      shutWindow(c, 30, h, LOWER_H + 26, l, 582);
      shutWindow(c, w - 30, h, LOWER_H + 26, l, 583);
      struts(c, p0 + 8, p1 - 8, h - LOWER_H - 20, l);
      spout(c, w - 60, 8, l);
    },
    right: (c, w, h, l) => {
      floorLine(c, w, h, l);
      shutWindow(c, w * 0.3, h, 56, l, 580);
      wornPlaster(c, w * 0.62, h - 48, 24, 16, STYLE.wall, l, 581);
      shutWindow(c, w * 0.45, h, LOWER_H + 26, l, 584);
    },
  });
  oriel(ctx, subBox(box, p0 + 8, p1 - 8, 0, 8, 40, LOWER_H + 22));
}
