import { css, groundShadow, shade, type Ctx, type IsoBox } from './canvasKit';
import { edges, recess, slab } from './massing';
import { brick, planks, plaster } from './materials';
import { archPath, band, beamEnds, doorway, flatTop, latticeWindow, parapetRoof, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * The prison quarter of Ṭihrán: mud-plastered street architecture with
 * fired-brick arches. A sābāṭ carries rooms over a passage, with a timber
 * oriel jutting over the lane; the bazaar shops stand on raised platforms
 * behind barred plank shutters.
 */

export const TEHRAN_MUD = 0x9c8466;
const BRICK = 0x9a7656;
const TIMBER = 0x5a3c26;
const SILL = 0x8a8070;
/** Where the oriel sits along the street front, and how far above the upper floor line. */
const ORIEL = [0.38, 0.62] as const;
const ORIEL_LIFT = 8;

/** Mud plaster with the stained foot a street wall gets. */
function mudWall(c: Ctx, w: number, h: number, light: number, seed: number): void {
  plaster(c, w, h, { base: TEHRAN_MUD, light, seed });
}

/** A fired-brick arch frame set into plaster, its opening left as the current path. */
function brickArch(c: Ctx, x: number, base: number, width: number, height: number, light: number, seed: number): void {
  archPath(c, x - 4, base, width + 8, height + 4);
  c.save();
  c.clip();
  brick(c, x + width + 8, base, { base: BRICK, light, seed }, 3.5, 8);
  c.restore();
  archPath(c, x, base, width, height);
}

/** The passage: a brick arch onto a dim vault with the daylight of the lane at its far end. */
function passage(c: Ctx, w: number, h: number, l: number): void {
  const aw = 28;
  const ah = 48;
  const x = w / 2 - aw / 2;
  brickArch(c, x, h, aw, ah, l, 73);
  const dark = c.createLinearGradient(0, h - ah, 0, h);
  dark.addColorStop(0, '#0c0806');
  dark.addColorStop(1, '#2a1e14');
  c.fillStyle = dark;
  c.fill();
  archPath(c, w / 2 - 5, h - 3, 10, 18);
  c.fillStyle = css(shade(0xc8b08a, l), 0.5);
  c.fill();
  // Worn paving running in under the arch.
  c.fillStyle = css(shade(SILL, l), 0.8);
  c.fillRect(x - 2, h - 2, aw + 4, 2);
}

/** A timber oriel (shanāshīl) on the upper storey: plank sides, a lattice front, a little roof. */
function oriel(ctx: Ctx, box: IsoBox): void {
  walls(ctx, box, (c, w, h, light) => planks(c, w, h, { base: TIMBER, light, seed: 76 }, true, 3), {
    left: (c, w, h, l) => {
      latticeWindow(c, 3, 5, w - 6, h - 11, { frame: shade(TIMBER, 1.2), light: l });
      c.fillStyle = css(shade(TIMBER, l * 0.7));
      c.fillRect(0, h - 3, w, 3);
    },
  });
  flatTop(ctx, box, shade(TIMBER, 0.9));
  edges(ctx, box);
}

/** Timber struts under the oriel, painted on the wall face it hangs from. */
function struts(c: Ctx, u0: number, u1: number, v: number, l: number): void {
  c.strokeStyle = css(shade(TIMBER, l));
  c.lineWidth = 2;
  c.beginPath();
  for (const [u, dir] of [[u0 + 2, 1], [u1 - 2, -1]] as const) {
    c.moveTo(u, v);
    c.lineTo(u + dir * 5, v + 7);
  }
  c.stroke();
}

/**
 * A sābāṭ: a ground storey pierced by the passage, and an upper storey of
 * rooms that oversails the street front on its joists.
 */
export function drawStreetArch(ctx: Ctx, box: IsoBox): void {
  const lowerH = 58;
  const lower = subBox(box, 0, box.w, 5, box.d, lowerH);
  const upper = subBox(box, 0, box.w, 0, box.d, 44, lowerH);
  groundShadow(ctx, lower, 8);
  walls(ctx, lower, (c, w, h, light) => mudWall(c, w, h, light, light === 1 ? 71 : 72), {
    left: (c, w, h, l) => {
      // Joists of the floor above, then a house door and two small high windows.
      beamEnds(c, w, 0, l, 8);
      recess(c, w * 0.72 - 9, h, 18, 42, TEHRAN_MUD, l);
      doorway(c, w * 0.72 - 6.5, h, 13, 35, { frame: 0x6a5038, door: 0x3a2a1c, light: l * 0.9, seed: 75 });
      for (const u of [w * 0.22, w * 0.42]) latticeWindow(c, u - 3.5, h - 40, 7, 10, { frame: 0x6a5038, light: l, shutters: 0x4a4038 });
    },
    right: (c, w, h, l) => passage(c, w, h, l),
  });
  flatTop(ctx, lower, shade(TEHRAN_MUD, 0.9));
  edges(ctx, lower);
  // A mud bench (sakkū) along the foot of the street wall.
  slab(ctx, subBox(box, 10, 46, 0, 5, 7), shade(TEHRAN_MUD, 0.95), 79);

  walls(ctx, upper, (c, w, h, light) => mudWall(c, w, h, light, light === 1 ? 77 : 78), {
    left: (c, w, h, l) => {
      beamEnds(c, w, 5, l, 11);
      band(c, w, h - 3, 3, shade(TEHRAN_MUD, 0.78), l);
      for (const u of [w * 0.14, w * 0.86]) latticeWindow(c, u - 4, h - 34, 8, 12, { frame: 0x6a5038, light: l, arched: true });
      struts(c, w * ORIEL[0], w * ORIEL[1], h - ORIEL_LIFT, l);
    },
    right: (c, w, h, l) => {
      beamEnds(c, w, 5, l, 11);
      band(c, w, h - 3, 3, shade(TEHRAN_MUD, 0.78), l);
      latticeWindow(c, w / 2 - 4, h - 32, 8, 12, { frame: 0x6a5038, light: l, arched: true, shutters: 0x4a4038 });
    },
  });
  parapetRoof(ctx, upper, shade(TEHRAN_MUD, 0.95), { base: shade(TEHRAN_MUD, 0.78), light: 1, seed: 74 }, 4, 5);
  edges(ctx, upper);
  oriel(ctx, subBox(box, box.w * ORIEL[0], box.w * ORIEL[1], -6, 1, 26, lowerH + ORIEL_LIFT));
}

/**
 * A bazaar shop: a raised platform at the street, a brick arch filled with
 * plank shutters barred and padlocked, and the reed blind rolled up above.
 */
export function drawShutteredShop(ctx: Ctx, box: IsoBox): void {
  const shop = subBox(box, 0, box.w, 6, box.d, 58);
  const platformH = 6;
  groundShadow(ctx, shop, 5);
  walls(ctx, shop, (c, w, h, light) => mudWall(c, w, h, light, light === 1 ? 81 : 82), {
    left: (c, w, h, l) => {
      beamEnds(c, w, 4, l, 8);
      const aw = w - 8;
      const base = h - platformH + 1;
      brickArch(c, 4, base, aw, 40, l, 83);
      c.save();
      c.clip();
      planks(c, w, h, { base: TIMBER, light: l, seed: 84 }, true, 4);
      c.fillStyle = 'rgba(20,12,6,0.35)';
      c.fillRect(0, base - 22, w, 1);
      c.restore();
      // Iron bar and padlock across the shutters.
      c.fillStyle = css(shade(0x2a2a2a, l));
      c.fillRect(4, base - 16, aw, 2);
      c.fillStyle = css(shade(0x8a867d, l));
      c.fillRect(w / 2 - 2, base - 15, 4, 4.5);
      c.strokeStyle = css(shade(0x8a867d, l));
      c.lineWidth = 0.9;
      c.beginPath();
      c.arc(w / 2, base - 15, 1.5, Math.PI, 0);
      c.stroke();
      // The reed blind, rolled and tied under the beam ends.
      c.fillStyle = css(shade(0xb8a070, l));
      c.fillRect(3, 10, w - 6, 3.5);
      c.fillStyle = css(shade(0x6a5a3a, l), 0.7);
      for (let u = 4; u < w - 4; u += 2) c.fillRect(u, 10, 0.6, 3.5);
      c.fillStyle = css(0x3a2a1a);
      c.fillRect(7, 9.5, 1, 4.5);
      c.fillRect(w - 8, 9.5, 1, 4.5);
    },
    right: (c, w, h, l) => {
      beamEnds(c, w, 4, l, 8);
      archPath(c, w / 2 - 4, h - 26, 8, 12);
      c.fillStyle = css(shade(TEHRAN_MUD, l * 0.62));
      c.fill();
    },
  });
  parapetRoof(ctx, shop, shade(TEHRAN_MUD, 0.95), { base: shade(TEHRAN_MUD, 0.78), light: 1, seed: 85 }, 3, 3);
  edges(ctx, shop);
  slab(ctx, subBox(box, 1, box.w - 1, -1, 7, platformH), SILL, 86);
}
