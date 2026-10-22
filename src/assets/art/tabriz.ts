import { css, groundShadow, onRoof, shade, type Ctx, type IsoBox } from './canvasKit';
import { edges, recess, slab, type EdgeSet } from './massing';
import { brick, earthRoof, glazedTiles, plaster } from './materials';
import { band, beamEnds, doorway, flatTop, latticeWindow, LIGHT, merlons, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * The buff fired brick of Tabríz: the two-storey barrack around the square
 * and the parapets of the roofs above it.
 *
 * The barrack is laid down as several runs so the cell door and the pillar
 * in front of it sort correctly in depth. Every run shares its storey
 * heights, string courses and cornice, the facades stand back from the
 * footprint edge by the same inset, and the ends of each wing are marked by
 * a projecting brick pier, so the runs read as one building in three wings
 * with a gatehouse.
 */

export const TABRIZ_BRICK = 0xb08458;
export const TABRIZ_LIME = 0xd8c8a4;
const DOOR = 0x4a2e1c;
const FRAME = 0x8a6440;
const PLINTH = 0x9a8a70;
/** Straw-and-mud plaster of the roof stair-houses. */
const STAIR_PLASTER = 0xb89c78;

/** Height of the barrack walls to the roof, and of its ground storey. */
export const BARRACK_H = 100;
const GROUND = 54;
/** How far the facade stands back from the front of the footprint. */
const INSET = 4;
const PARAPET = 6;
const PIER = 6;

export interface BarrackStyle {
  seed: number;
  /** A tall portal (pishtaq) rising above the roof in the middle of the facade. */
  gate?: boolean;
  /** A stair-house on the roof toward the back. */
  stairHouse?: boolean;
  /** Projecting piers and roof parapets at both ends of the run. */
  ends?: boolean;
}

/** Brick with a dressed-stone plinth at the foot. */
function brickWall(c: Ctx, w: number, h: number, light: number, seed: number): void {
  brick(c, w, h, { base: TABRIZ_BRICK, light, seed });
  c.fillStyle = css(shade(PLINTH, light));
  c.fillRect(0, h - 5, w, 5);
  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.fillRect(0, h - 5, w, 0.8);
}

/** Brick cornice: a lime string course over a row of dentils. */
function cornice(c: Ctx, w: number, light: number): void {
  band(c, w, 3, 3, TABRIZ_LIME, light);
  c.fillStyle = css(shade(TABRIZ_BRICK, light * 0.55));
  for (let u = 1; u < w - 1; u += 4) c.fillRect(u, 7, 2, 2);
}

/** One bay of the ground storey: a room door deep in its arch, or a barred guard-room window. */
function groundBay(c: Ctx, u: number, h: number, light: number, seed: number, door: boolean): void {
  if (door) {
    recess(c, u - 10, h - 5, 20, 44, TABRIZ_BRICK, light);
    doorway(c, u - 6.5, h - 5, 13, 35, { frame: shade(TABRIZ_BRICK, 0.72), door: DOOR, light: light * 0.85, seed });
    // The threshold stone stepping down to the square.
    c.fillStyle = css(shade(PLINTH, light * 1.08));
    c.fillRect(u - 9, h - 5, 18, 2);
    return;
  }
  recess(c, u - 8, h - 5, 16, 40, TABRIZ_BRICK, light);
  latticeWindow(c, u - 3.5, h - 34, 7, 10, { frame: FRAME, light: light * 0.85, arched: true });
}

/** One bay of the upper storey: a latticed window in a shallow arched niche. */
function upperBay(c: Ctx, u: number, h: number, light: number): void {
  const base = h - GROUND - 4;
  recess(c, u - 8, base, 16, 30, TABRIZ_BRICK, light);
  latticeWindow(c, u - 4, base - 21, 8, 12, { frame: FRAME, light, arched: true, shutters: 0x5a3a24 });
}

/** The front face of a run: two storeys of bays between string courses. */
function facade(c: Ctx, w: number, h: number, l: number, style: BarrackStyle, portal: readonly [number, number] | null): void {
  cornice(c, w, l);
  band(c, w, h - GROUND - 3, 3, TABRIZ_LIME, l);
  const cells = Math.max(1, Math.round(w / 32));
  const bay = w / cells;
  for (let i = 0; i < cells; i++) {
    const u = i * bay + bay / 2;
    if (portal && u > portal[0] - 4 && u < portal[1] + 4) continue;
    upperBay(c, u, h, l);
    groundBay(c, u, h, l, style.seed + i, !portal);
  }
}

/** The end face of a run: a window to each room above, small high windows below. */
function sideFace(c: Ctx, w: number, h: number, l: number): void {
  cornice(c, w, l);
  band(c, w, h - GROUND - 3, 3, TABRIZ_LIME, l);
  const cells = Math.max(1, Math.round(w / 32));
  for (let i = 0; i < cells; i++) {
    const u = (i + 0.5) * (w / cells);
    upperBay(c, u, h, l);
    latticeWindow(c, u - 3.5, h - 36, 7, 10, { frame: FRAME, light: l, arched: true });
  }
}

/** A low brick wall on the roof edge with a lime coping. */
function roofWall(ctx: Ctx, box: IsoBox, seed: number, crenellate: boolean, set: EdgeSet = {}): void {
  walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: TABRIZ_BRICK, light, seed }));
  flatTop(ctx, box, TABRIZ_LIME);
  if (crenellate) merlons(ctx, box, shade(TABRIZ_BRICK, 1.05), 4, 4);
  edges(ctx, box, { farLeft: false, backRight: false, ...set }, 0x1c120a, 0.6);
}

/** Packed-earth roof with its parapets; end parapets only where the wing ends. */
function roof(ctx: Ctx, main: IsoBox, style: BarrackStyle): void {
  onRoof(ctx, main, (w, d) => {
    earthRoof(ctx, w, d, { base: 0x9a8064, light: LIGHT.roof, seed: style.seed + 2 });
    // The parapet's shadow falls on the roof behind the front wall.
    ctx.fillStyle = 'rgba(30,18,8,0.25)';
    ctx.fillRect(0, 3, w, 4);
  });
  const t = 3;
  roofWall(ctx, subBox(main, 0, main.w, main.d - t, main.d, PARAPET, main.h), style.seed, false);
  if (style.ends) {
    roofWall(ctx, subBox(main, 0, t, 0, main.d, PARAPET, main.h), style.seed, false);
    roofWall(ctx, subBox(main, main.w - t, main.w, 0, main.d, PARAPET, main.h), style.seed, false, { backRight: true });
  }
  roofWall(ctx, subBox(main, 0, main.w, 0, t, PARAPET, main.h), style.seed, true);
}

/** A plastered stair-house on the roof, its door open to the stair. */
function stairHouse(ctx: Ctx, main: IsoBox, seed: number): void {
  const hut = subBox(main, main.w - 40, main.w - 14, main.d - 34, main.d - 8, 42, main.h);
  walls(ctx, hut, (c, w, h, light) => plaster(c, w, h, { base: STAIR_PLASTER, light, seed }), {
    left: (c, w, h, l) => {
      recess(c, w / 2 - 6, h, 12, 32, STAIR_PLASTER, l);
      c.fillStyle = css(0x140c06);
      c.fill();
      beamEnds(c, w, 4, l, 8);
    },
    right: (c, w, _h, l) => beamEnds(c, w, 4, l, 8),
  });
  flatTop(ctx, hut, STAIR_PLASTER);
  edges(ctx, hut);
}

/** A brick pier marking the corner of a wing, a little proud of the facade and the roofline. */
function pier(ctx: Ctx, box: IsoBox, seed: number): void {
  walls(ctx, box, (c, w, h, light) => brickWall(c, w, h, light, seed), {
    left: (c, w, _h, l) => cornice(c, w, l),
    right: (c, w, _h, l) => cornice(c, w, l),
  });
  flatTop(ctx, box, TABRIZ_LIME);
  edges(ctx, box);
}

/**
 * The barrack gate: a portal taller than it is wide, a lion-and-sun tile
 * over a deep arch, and a person-sized gate inside it.
 */
function gatePortal(ctx: Ctx, box: IsoBox, seed: number): void {
  walls(ctx, box, (c, w, h, light) => brickWall(c, w, h, light, seed), {
    left: (c, w, h, l) => {
      // Lime frame and the tiled panel over the arch.
      c.strokeStyle = css(shade(TABRIZ_LIME, l));
      c.lineWidth = 2;
      c.strokeRect(4, 6, w - 8, h - 11);
      c.save();
      c.beginPath();
      c.rect(9, 11, w - 18, 14);
      c.clip();
      glazedTiles(c, w, 30, { base: 0x2c6e8a, light: l, seed }, 5);
      c.restore();
      c.fillStyle = css(shade(0xe8b440, l));
      c.beginPath();
      c.arc(w / 2, 18, 4, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = css(shade(0xe8b440, l), 0.8);
      c.lineWidth = 0.8;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        c.beginPath();
        c.moveTo(w / 2 + Math.cos(a) * 5, 18 + Math.sin(a) * 5);
        c.lineTo(w / 2 + Math.cos(a) * 7, 18 + Math.sin(a) * 7);
        c.stroke();
      }
      const aw = 30;
      recess(c, w / 2 - aw / 2, h - 5, aw, h - 36, TABRIZ_BRICK, l);
      latticeWindow(c, w / 2 - 7, h - 70, 14, 14, { frame: FRAME, light: l * 0.8, arched: true });
      doorway(c, w / 2 - 9, h - 5, 18, 42, { frame: TABRIZ_LIME, door: DOOR, light: l * 0.85, seed });
    },
  });
  flatTop(ctx, box, TABRIZ_LIME);
  merlons(ctx, box, shade(TABRIZ_BRICK, 1.05), 4, 3);
  edges(ctx, box);
}

/** Draws one run of the barrack inside its footprint box. */
export function drawBarrack(ctx: Ctx, box: IsoBox, style: BarrackStyle): void {
  const main = subBox(box, 0, box.w, INSET, box.d, BARRACK_H);
  const portalSpan = style.gate ? ([box.w / 2 - 24, box.w / 2 + 24] as const) : null;
  groundShadow(ctx, main, 8);
  walls(ctx, main, (c, w, h, light) => brickWall(c, w, h, light, style.seed + (light === 1 ? 0 : 5)), {
    left: (c, w, h, l) => facade(c, w, h, l, style, portalSpan),
    right: (c, w, h, l) => sideFace(c, w, h, l),
  });
  roof(ctx, main, style);
  edges(ctx, main, { farLeft: false, farTop: !!style.ends, arris: !!style.ends });
  if (style.stairHouse) stairHouse(ctx, main, style.seed + 7);
  if (style.ends) {
    pier(ctx, subBox(box, 0, PIER, 0, INSET + 3, BARRACK_H + PARAPET), style.seed + 3);
    pier(ctx, subBox(box, box.w - PIER, box.w, 0, INSET + 3, BARRACK_H + PARAPET), style.seed + 4);
  }
  if (portalSpan) {
    const [p0, p1] = portalSpan;
    slab(ctx, subBox(box, p0 + 6, p1 - 6, -4, INSET, 3), PLINTH, style.seed);
    gatePortal(ctx, subBox(box, p0, p1, 0, INSET + 4, 120), style.seed + 11);
  }
}

// Roof parapets ---------------------------------------------------------------

/** One height for every parapet on the Tabríz roofs, so the edges read as one wall. */
export const ROOF_PARAPET_H = 20;
const PARAPET_T = 10;

/**
 * A run of roof parapet: brick under a lime coping, with a wooden rain
 * spout every few cells. `seamless` pieces are laid one cell at a time, so
 * they draw no uprights where the next piece continues them.
 */
export function drawRoofParapet(ctx: Ctx, part: IsoBox, seamless: boolean): void {
  const spouts = (c: Ctx, w: number, h: number, l: number) => {
    band(c, w, 0, 3, TABRIZ_LIME, l);
    if (w > 32 * 3) beamEnds(c, w, h * 0.5, l, 32 * 4);
  };
  // Courses and bricks sized to divide a cell, so the bond runs on across joins.
  walls(ctx, part, (c, w, h, light) => brick(c, w, h, { base: TABRIZ_BRICK, light, seed: 41 }, 4, 8), {
    left: spouts,
    right: spouts,
  });
  onRoof(ctx, part, (w, d) => {
    ctx.fillStyle = css(shade(TABRIZ_LIME, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.fillStyle = css(shade(TABRIZ_LIME, 0.82), 0.6);
    if (w < d) ctx.fillRect(w / 2 - 0.5, 0, 1, d);
    else ctx.fillRect(0, d / 2 - 0.5, w, 1);
  });
  edges(ctx, part, seamless ? { farLeft: false, backRight: false, arris: false, leftFoot: false } : {}, 0x1c120a, 0.7);
}

/** Where the parapet stands inside its footprint: hard against the roof it encloses. */
export type ParapetSide = 'north' | 'east' | 'south' | 'divider';

export function parapetPart(box: IsoBox, side: ParapetSide): IsoBox {
  const h = ROOF_PARAPET_H;
  const t = PARAPET_T;
  // Dividers stand in the middle of their cell; the long runs start and stop
  // at a divider's centre line and at the east wall's inner face.
  const mid0 = (32 - t) / 2;
  switch (side) {
    case 'north': return subBox(box, mid0, box.w - (32 - t), 0, t, h);
    case 'south': return subBox(box, mid0, box.w - (32 - t), box.d - t, box.d, h);
    case 'east': return subBox(box, 0, t, 0, box.d, h);
    case 'divider': return subBox(box, mid0, mid0 + t, 0, box.d, h);
  }
}
