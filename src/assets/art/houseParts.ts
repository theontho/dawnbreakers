import { groundShadow, outlineBox, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { plinth, type RecessStyle } from './facade';
import { plaster, type Surface } from './materials';
import { beamEnds, dome, doorway, flatTop, merlons, parapetRoof, walls, windcatcher, type FacePainter, type WindowStyle } from './ornaments';

/**
 * The parts a town house is assembled from: plastered blocks with a
 * parapet roof, the things that stand on roofs, and the house's own door
 * and window styles. `houses.ts` arranges them into massings.
 */

export type RoofFeature = 'windcatcher' | 'dome' | 'stair' | 'none';

export interface HouseStyle {
  cellsW: number;
  cellsD: number;
  /** Height of the main block; 64 to 72 px is one storey (see the scale table). */
  wallH: number;
  wall: number;
  door: number;
  frame: number;
  roof: RoofFeature;
  seed: number;
  /** How the house is massed on its footprint; a plain inset block by default. */
  massing?: Massing;
  beams?: boolean;
  crenellated?: boolean;
  litWindow?: boolean;
  shutters?: number;
}

export type Massing = 'block' | 'courtyard' | 'wing' | 'balakhana' | 'porch' | 'stepped' | 'walled';

const ROOF_DEPTH = 5;
const ROOF_INSET = 4;

/** Headroom each roof feature needs above its block. */
export const ROOF_PAD: Record<RoofFeature, number> = { windcatcher: 46, dome: 30, stair: 46, none: 10 };

export interface BlockDecor {
  left?: FacePainter;
  right?: FacePainter;
  /** Seed offset so neighbouring blocks of one house do not share a plaster pattern. */
  salt?: number;
  beams?: boolean;
  crenellated?: boolean;
  /** A stone base course; omit on blocks raised on a roof. */
  plinth?: boolean;
  shadow?: boolean;
  wall?: number;
}

/** A plastered block with a sunk parapet roof. */
export function houseBlock(ctx: Ctx, b: IsoBox, style: HouseStyle, decor: BlockDecor = {}): void {
  const wall = decor.wall ?? style.wall;
  const seed = style.seed + (decor.salt ?? 0);
  const surface = (light: number): Surface => ({ base: wall, light, seed: seed + (light === 1 ? 0 : 99) });
  if (decor.shadow !== false) groundShadow(ctx, b);
  const face = (paint?: FacePainter): FacePainter => (c, w, h, l) => {
    if (decor.plinth !== false) plinth(c, w, h, 5, 0x9a8a70, l, seed + 7);
    if (decor.beams ?? style.beams) beamEnds(c, w, 5, l, 10);
    paint?.(c, w, h, l);
  };
  walls(ctx, b, (c, w, h, light) => plaster(c, w, h, surface(light)), { left: face(decor.left), right: face(decor.right) });
  parapetRoof(ctx, b, shade(wall, 0.96), { base: shade(wall, 0.78), light: 1.05, seed: seed + 3 }, ROOF_INSET, ROOF_DEPTH);
  if (decor.crenellated ?? style.crenellated) merlons(ctx, b, wall, 3, 4);
  outlineBox(ctx, b);
}

/** A thin wall with a rounded mud coping: a courtyard or garden wall. */
export function courtyardWall(ctx: Ctx, b: IsoBox, style: HouseStyle, decor: BlockDecor = {}): void {
  const seed = style.seed + (decor.salt ?? 40);
  walls(ctx, b, (c, w, h, light) => plaster(c, w, h, { base: shade(style.wall, 0.94), light, seed: seed + (light === 1 ? 0 : 9) }), {
    left: decor.left,
    right: decor.right,
  });
  flatTop(ctx, b, shade(style.wall, 0.9));
  outlineBox(ctx, b);
}

/** Door style for a house: the door in a recess framed in a paler plaster. */
export function houseDoor(style: HouseStyle, light: number): RecessStyle {
  return { frame: style.frame, door: style.door, light, seed: style.seed, surround: shade(style.wall, 1.12) };
}

export function houseWindow(style: HouseStyle, light: number, lit = false, arched = false): WindowStyle {
  return { frame: style.frame, light, shutters: style.shutters, lit: lit && style.litWindow, arched };
}

/** A point on a block's sunk roof floor. */
function onRoofFloor(b: IsoBox, p: number, q: number): { x: number; y: number } {
  const pt = roofPoint(b, p, q);
  return { x: pt.x, y: pt.y + ROOF_DEPTH };
}

/** Whatever stands on the roof: a wind-catcher, a small mud dome or a stair hut. */
export function roofFeature(ctx: Ctx, b: IsoBox, style: HouseStyle, feature: RoofFeature = style.roof): void {
  switch (feature) {
    case 'windcatcher': {
      const size = 13;
      const at = onRoofFloor(b, size + ROOF_INSET + 2, b.d - size - ROOF_INSET - 2);
      windcatcher(ctx, { x: at.x, y: at.y, w: size, d: size, h: 38 }, shade(style.wall, 0.95), style.seed + 11,
        (c, w, h, surf) => plaster(c, w, h, surf));
      break;
    }
    case 'dome': {
      const at = onRoofFloor(b, b.w / 2 - 2, b.d / 2 + 4);
      dome(ctx, at.x, at.y, Math.min(b.w, b.d) * 0.26, { color: shade(style.wall, 0.95), drum: 3, bulb: 0.9 });
      break;
    }
    case 'stair': {
      const at = onRoofFloor(b, 16 + ROOF_INSET + 2, b.d - 16 - ROOF_INSET - 4);
      // Tall enough to walk out of onto the roof.
      const hut: IsoBox = { x: at.x, y: at.y, w: 16, d: 16, h: 40 };
      walls(ctx, hut, (c, w, h, light) => plaster(c, w, h, { base: style.wall, light, seed: style.seed + 21 }), {
        left: (c, w, h, l) => doorway(c, w / 2 - 6, h, 12, 34, { frame: style.frame, light: l, open: true }),
      });
      flatTop(ctx, hut, style.wall);
      outlineBox(ctx, hut);
      break;
    }
    case 'none':
      break;
  }
}
