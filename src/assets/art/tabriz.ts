import { css, groundShadow, onRoof, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { figure, type FigureStyle } from './crowds';
import { edges, slab } from './massing';
import { brick, earthRoof } from './materials';
import { band, flatTop, LIGHT, merlons, walls } from './ornaments';
import { subBox } from './structureParts';
import {
  arcadeFront, BARRACK_H, brickWall, endFace, portalFace, TABRIZ_BRICK, TABRIZ_LIME, TABRIZ_STONE,
} from './tabrizFacade';
import { stairHut } from './town/townKit';

/**
 * The barrack of Tabríz at true scale: two storeys of buff fired brick,
 * about 8 m to the top of the parapet, round the square where the Báb was
 * martyred on 9 July 1850. The north range runs east from the west wing to
 * the gatehouse and on; the west wing faces the square from the other side.
 *
 * A range is laid down as several runs, so the cell door and the pillar in
 * front of it sort correctly in depth. Every run shares its storey heights,
 * string courses and cornice, the facades stand back from the footprint by
 * the same inset, and only the true ends of a range carry end parapets and
 * outlines, so the runs read as one building.
 */

export { BARRACK_H } from './tabrizFacade';

/** How far the facade stands back from the front of the footprint. */
const INSET = 6;
/** The roof parapet: about 0.6 m above the roof, 7 px thick. */
const PARAPET = 14;
const PARAPET_T = 7;
const PORTAL_H = 236;
const STAIR_PLASTER = 0xb89c78;
/** How far the north range reaches south from the back of the wing's corner run (5 cells). */
const CORNER_DEPTH = 160;

export interface BarrackStyle {
  seed: number;
  /** Which way the arcade faces: the north range faces south, the west wing east. */
  facing: 'south' | 'east';
  /** A tall portal (pishtaq) in the middle of the run. */
  gate?: boolean;
  /** A stair hut on the roof toward the back. */
  stairHouse?: boolean;
  /** The run ends the range here (east end of the north range, south end of the wing). */
  end?: boolean;
  /** Townspeople watching from the roof behind the front parapet. */
  watchers?: boolean;
  /**
   * The wing's north run, where the north range meets it: the roof turns the
   * corner into the range's roof (no parapet between them) and the wing's
   * north end carries the range's back parapet on.
   */
  corner?: boolean;
}

/**
 * A low brick wall on the roof edge with a lime coping. Its uprights are
 * drawn only at `corners` (where the parapet really stops), so parapets of
 * neighbouring runs read as one wall.
 */
function roofWall(ctx: Ctx, box: IsoBox, seed: number, crenellate: boolean, corners: { start?: boolean; end?: boolean } = {}): void {
  walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: TABRIZ_BRICK, light, seed }, 4, 8), {
    left: (c, w, _h, l) => band(c, w, 0, 2.5, TABRIZ_LIME, l),
    right: (c, w, _h, l) => band(c, w, 0, 2.5, TABRIZ_LIME, l),
  });
  flatTop(ctx, box, TABRIZ_LIME);
  if (crenellate) merlons(ctx, box, shade(TABRIZ_BRICK, 1.05), 6, 6);
  edges(ctx, box, { farLeft: !!corners.start, arris: !!corners.end, backRight: !!corners.end, leftFoot: false }, 0x1c120a, 0.55);
}

const WATCHERS: FigureStyle[] = [
  { robe: 0x4a3a2e, head: 'kolah', headColor: 0x2a2018, skin: 0xd0b08a, beard: 0x2a1c12, height: 38 },
  { robe: 0x1f1f2a, head: 'chador', headColor: 0x1f1f2a, skin: 0xd6b48a, height: 36 },
  { robe: 0x6a5a44, head: 'turban', headColor: 0xe8e0c8, skin: 0xc8a47a, beard: 0x8a8070, height: 39 },
  { robe: 0x5a4434, trim: 0x8a6a44, head: 'bare', skin: 0xc49a6c, height: 37 },
];

/** Watchers along the roof, just behind the front parapet that hides their feet. */
function watchers(ctx: Ctx, main: IsoBox, style: BarrackStyle): void {
  const along = style.facing === 'south' ? main.w : main.d;
  const count = Math.max(2, Math.round(along / 48));
  for (let i = 0; i < count; i++) {
    const s = (i + 0.5) * (along / count) + ((style.seed + i * 7) % 11) - 5;
    const at = style.facing === 'south' ? roofPoint(main, s, PARAPET_T + 7) : roofPoint(main, main.w - PARAPET_T - 7, s);
    figure(ctx, at.x, at.y, WATCHERS[(style.seed + i) % WATCHERS.length]!);
  }
}

/** The roof: packed earth, its parapets, a stair hut and watchers; the front parapet last. */
function roof(ctx: Ctx, main: IsoBox, style: BarrackStyle): void {
  onRoof(ctx, main, (w, d) => {
    earthRoof(ctx, w, d, { base: 0x9a8064, light: LIGHT.roof, seed: style.seed + 2 });
  });
  const t = PARAPET_T;
  const end = !!style.end;
  const wall = (p0: number, p1: number, q0: number, q1: number, crenellate = false, corners = {}) =>
    roofWall(ctx, subBox(main, p0, p1, q0, q1, PARAPET, main.h), style.seed, crenellate, corners);
  const { w, d } = main;
  const hutAt = style.facing === 'south' ? roofPoint(main, w - 22, d - 46) : roofPoint(main, w - 48, d - 56);
  if (style.facing === 'south') {
    // Back, east end, then the front parapet with the end corner it turns.
    wall(0, w, d - t, d, false, { end });
    if (end) wall(w - t, w, 0, d, false, { end: true });
    if (style.stairHouse) stairHut(ctx, hutAt, STAIR_PLASTER, 0x6a4a30, style.seed + 7);
    if (style.watchers) watchers(ctx, main, style);
    wall(0, w, 0, t, true, { end });
  } else {
    // The wing's back (west) parapet, its north end at the corner, its south end.
    wall(0, t, 0, d, false, { start: end });
    if (style.corner) wall(t, w, d - t, d, false, { end: true });
    if (end) wall(0, w, 0, t, false, { start: true, end: true });
    if (style.stairHouse) stairHut(ctx, hutAt, STAIR_PLASTER, 0x6a4a30, style.seed + 7);
    if (style.watchers) watchers(ctx, main, style);
    // The front parapet stops where the north range's roof runs on from the corner.
    const q1 = style.corner ? d - CORNER_DEPTH + INSET : d;
    wall(w - t, w, 0, q1, true, { start: true, end });
  }
}

/** Draws one run of the barrack inside its footprint box. */
export function drawBarrack(ctx: Ctx, box: IsoBox, style: BarrackStyle): void {
  const south = style.facing === 'south';
  const main = south ? subBox(box, 0, box.w, INSET, box.d, BARRACK_H) : subBox(box, 0, box.w - INSET, 0, box.d, BARRACK_H);
  const portal = style.gate ? ([box.w / 2 - 34, box.w / 2 + 34] as const) : null;
  groundShadow(ctx, main, 12, 0.3);
  const front = (c: Ctx, w: number, h: number, l: number) => arcadeFront(c, w, h, l, style.seed, portal);
  walls(ctx, main, (c, w, h, light) => brickWall(c, w, h, light, style.seed + (light === 1 ? 0 : 5)), south
    ? { left: front, right: endFace }
    : { left: endFace, right: front });
  // A step along the foot of the arcade.
  const step = south ? subBox(box, 2, box.w - 2, INSET - 4, INSET, 3) : subBox(box, box.w - INSET, box.w - INSET + 4, 2, box.d - 2, 3);
  slab(ctx, step, TABRIZ_STONE, style.seed);
  roof(ctx, main, style);
  // Outline only the range's true corners, so joined runs show no seam.
  edges(ctx, main, south
    ? { farLeft: false, farTop: false, backRight: !!style.end, arris: !!style.end }
    : { farTop: false, backRight: false, arris: !!style.end, leftFoot: !!style.end }, 0x1c120a, 0.7);
  if (portal) gatePortal(ctx, subBox(box, portal[0], portal[1], 0, INSET + 8, PORTAL_H), style.seed + 11);
}

function gatePortal(ctx: Ctx, box: IsoBox, seed: number): void {
  groundShadow(ctx, box, 8, 0.25);
  walls(ctx, box, (c, w, h, light) => brickWall(c, w, h, light, seed), {
    left: (c, w, h, l) => portalFace(c, w, h, l, seed),
    right: (c, w, _h, l) => band(c, w, 8, 3, TABRIZ_LIME, l),
  });
  flatTop(ctx, box, TABRIZ_LIME);
  merlons(ctx, box, shade(TABRIZ_BRICK, 1.05), 6, 4);
  edges(ctx, box);
}

// The low parapets of the roofs above the square --------------------------------

/** About a metre: chest-high on a person leaning on it. */
export const ROOF_PARAPET_H = 24;

/**
 * A face of the connected roof parapet (`ch9-parapet-low` in WALL_STYLES):
 * brick in courses that divide a cell, a lime coping, and a rain spout once
 * a cell, so a run continues unbroken from piece to piece.
 */
export function roofParapetFace(c: Ctx, w: number, h: number, l: number): void {
  brick(c, w, h, { base: TABRIZ_BRICK, light: l, seed: 41 }, 4, 8);
  band(c, w, 0, 3, TABRIZ_LIME, l);
  for (let u = 22; u < w; u += 32) {
    c.fillStyle = 'rgba(40,24,10,0.25)';
    c.fillRect(u, 8, 2.5, h - 8);
    c.fillStyle = css(shade(0x4a2e18, l));
    c.fillRect(u - 1, 6, 4.5, 3);
  }
}
