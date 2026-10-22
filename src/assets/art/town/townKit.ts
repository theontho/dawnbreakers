import { straw } from '../badashtProps';
import { css, groundShadow, onLeftWall, onRightWall, outlineBox, roofPoint, shade, type Ctx, type IsoBox } from '../canvasKit';
import { plinth, recessedDoor } from '../facade';
import { brick, plaster, type Surface } from '../materials';
import { doorway, flatTop, latticeWindow, LIGHT, parapetRoof, walls, type FacePainter, type WindowStyle } from '../ornaments';

/**
 * The true-scale town kit (the Shíráz pilot). One cell runs 32 px along a
 * wall (about 1.4 m) and a person stands 40 px (1.75 m), so a metre is about
 * 23 px: a storey is 80 px, a door 23 x 48 px in its recess, a window
 * 12 x 18 px with its sill well above a man's head. Everything here is sized
 * from those numbers; the older `facade.ts` sizes belong to the small world.
 */

/** Pixels to the metre. */
export const M = 23;
export const STOREY = 80;
export const TOWN_DOOR = { w: 23, h: 48 } as const;
export const TOWN_WINDOW = { w: 12, h: 18 } as const;
/** How far a parapet rises above the roof floor behind it. */
export const PARAPET = 14;
/** The thickness of a parapet seen on the roof. */
export const PARAPET_T = 7;

export const TURQUOISE = 0x2e8c96;
export const LAPIS = 0x24477a;
export const CREAM = 0xe8d9a8;
export const STONE = 0x9a8a70;
export const TIMBER = 0x5a3a20;

export type Material = 'plaster' | 'mud' | 'brick';

/** Paints a wall material into face space. */
export function surface(c: Ctx, w: number, h: number, material: Material, s: Surface): void {
  if (material === 'brick') {
    brick(c, w, h, s, 3, 8);
    return;
  }
  plaster(c, w, h, s);
  if (material === 'mud') straw(c, w, h, s.light, s.seed + 1);
}

export interface BlockSpec {
  wall: number;
  seed: number;
  material?: Material;
  left?: FacePainter;
  right?: FacePainter;
  /** A stone base course (off for blocks raised on a roof). */
  plinth?: boolean;
  /** Beam ends this far below the top of the wall. */
  beams?: number;
  /** A sunk roof behind a parapet (the default) or a plain flat top. */
  roof?: 'parapet' | 'flat' | 'none';
  /** Stepped merlons along the parapet, as on old town walls and gatehouses. */
  merlons?: boolean;
  shadow?: boolean;
  /** A coping band of paler plaster or brick along the top of both faces. */
  coping?: number;
}

/** A block of a town building: plastered, mud or brick walls under a parapet roof. */
export function townBlock(ctx: Ctx, b: IsoBox, spec: BlockSpec): void {
  const material = spec.material ?? 'plaster';
  if (spec.shadow !== false) groundShadow(ctx, b, 14, 0.3);
  const face = (paint?: FacePainter): FacePainter => (c, w, h, l) => {
    if (spec.plinth !== false) plinth(c, w, h, 10, STONE, l, spec.seed + 7);
    if (spec.coping !== undefined) copingBand(c, w, spec.coping, l);
    if (spec.beams !== undefined) townBeams(c, w, spec.beams, l);
    paint?.(c, w, h, l);
  };
  walls(ctx, b, (c, w, h, light) => surface(c, w, h, material, { base: spec.wall, light, seed: spec.seed + (light === 1 ? 0 : 99) }), {
    left: face(spec.left),
    right: face(spec.right),
  });
  const roof = spec.roof ?? 'parapet';
  if (roof === 'parapet') {
    parapetRoof(ctx, b, shade(spec.wall, 0.97), { base: shade(spec.wall, 0.8), light: 1.05, seed: spec.seed + 3 }, PARAPET_T, PARAPET);
  } else if (roof === 'flat') {
    flatTop(ctx, b, shade(spec.wall, 0.95));
  }
  if (spec.merlons) townMerlons(ctx, b, spec.wall);
  outlineBox(ctx, b);
}

/** A paler band along the top of a face: the parapet's coping. */
export function copingBand(c: Ctx, w: number, color: number, l: number): void {
  c.fillStyle = css(shade(color, l * 1.06));
  c.fillRect(0, 0, w, 4);
  c.fillStyle = 'rgba(255,240,210,0.25)';
  c.fillRect(0, 0, w, 1);
  c.fillStyle = 'rgba(20,12,6,0.25)';
  c.fillRect(0, 4, w, 1.5);
}

/** Poplar roof beams poking through the wall, each with its rain stain. */
export function townBeams(c: Ctx, w: number, y: number, l: number, spacing = 20): void {
  for (let u = spacing / 2; u < w - 4; u += spacing) {
    const g = c.createLinearGradient(0, y + 4, 0, y + 20);
    g.addColorStop(0, 'rgba(40,24,10,0.28)');
    g.addColorStop(1, 'rgba(40,24,10,0)');
    c.fillStyle = g;
    c.fillRect(u, y + 4, 5, 16);
    c.fillStyle = css(shade(0x4a2e18, l));
    c.beginPath();
    c.ellipse(u + 2.5, y + 2.5, 3, 2.6, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = css(shade(0x9a6a40, l), 0.85);
    c.beginPath();
    c.ellipse(u + 2.2, y + 2.2, 1.6, 1.3, 0, 0, Math.PI * 2);
    c.fill();
  }
}

/** A wooden rain spout (nāvdān) through the parapet, and the streak it leaves. */
export function spout(c: Ctx, u: number, y: number, l: number): void {
  const g = c.createLinearGradient(0, y, 0, y + 40);
  g.addColorStop(0, 'rgba(50,30,14,0.32)');
  g.addColorStop(1, 'rgba(50,30,14,0)');
  c.fillStyle = g;
  c.fillRect(u - 1, y + 3, 5, 40);
  c.fillStyle = css(shade(TIMBER, l));
  c.fillRect(u - 2, y, 7, 4);
  c.fillStyle = css(shade(0x8a6038, l));
  c.fillRect(u - 2, y, 7, 1);
}

export interface DoorSpec {
  frame: number;
  door: number;
  /** The raised surround of the recess. */
  surround: number;
  light: number;
  seed: number;
  /** A strip of glazed tile over the door. */
  panel?: number;
}

/** A street door at true scale: 23 x 48 px, arched, in a framed recess. */
export function townDoor(c: Ctx, cx: number, base: number, d: DoorSpec): void {
  recessedDoor(c, cx, base, { ...d, w: TOWN_DOOR.w, h: TOWN_DOOR.h });
}

/** A small high window centred on `cx`, its sill `sill` px above the ground. */
export function townWindow(c: Ctx, cx: number, faceH: number, sill: number, style: WindowStyle, w: number = TOWN_WINDOW.w, h: number = TOWN_WINDOW.h): void {
  latticeWindow(c, cx - w / 2, faceH - sill - h, w, h, style);
}

/** Rounded stepped merlons along both front faces of a block. */
export function townMerlons(ctx: Ctx, b: IsoBox, color: number, size = 8, gap = 8, rise = 10): void {
  const paint = (w: number, light: number): void => {
    for (let u = gap / 2; u + size <= w; u += size + gap) {
      ctx.fillStyle = css(shade(color, light));
      ctx.beginPath();
      ctx.moveTo(u, 0);
      ctx.lineTo(u, -rise + 2);
      ctx.quadraticCurveTo(u + size / 2, -rise - 2, u + size, -rise + 2);
      ctx.lineTo(u + size, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(28,18,10,0.55)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  };
  onLeftWall(ctx, b, w => paint(w, LIGHT.left));
  onRightWall(ctx, b, w => paint(w, LIGHT.right));
}

/** A point on a block's sunk roof floor. */
export function roofFloor(b: IsoBox, p: number, q: number): { x: number; y: number } {
  const pt = roofPoint(b, p, q);
  return { x: pt.x, y: pt.y + PARAPET };
}

/** A wind-catcher (bādgīr) standing on a roof: a tall shaft with deep vent slots and a crenellated head. */
export function windcatcherTower(ctx: Ctx, foot: { x: number; y: number }, size: number, h: number, wall: number, seed: number): void {
  const tower: IsoBox = { x: foot.x, y: foot.y, w: size, d: size, h };
  const vents = (c: Ctx, w: number, hh: number, l: number): void => {
    const n = Math.max(3, Math.round(w / 9));
    const step = w / n;
    for (let i = 0; i < n; i++) {
      const x = i * step + step * 0.28;
      c.fillStyle = css(shade(0x1a100a, l + 0.15));
      c.fillRect(x, 10, step * 0.44, hh * 0.42);
      c.fillStyle = 'rgba(255,240,210,0.18)';
      c.fillRect(x + step * 0.44, 10, 0.8, hh * 0.42);
    }
    c.fillStyle = css(shade(wall, l * 0.85));
    c.fillRect(0, 6, w, 2.5);
  };
  groundShadow(ctx, tower, 6, 0.22);
  walls(ctx, tower, (c, w, hh, light) => surface(c, w, hh, 'plaster', { base: wall, light, seed }), { left: vents, right: vents });
  flatTop(ctx, tower, wall);
  townMerlons(ctx, tower, wall, 4, 4, 6);
  outlineBox(ctx, tower);
}

/** A stair hut on a roof, its open door tall enough to walk out of. */
export function stairHut(ctx: Ctx, foot: { x: number; y: number }, wall: number, frame: number, seed: number): void {
  const hut: IsoBox = { x: foot.x, y: foot.y, w: 40, d: 36, h: 58 };
  walls(ctx, hut, (c, w, h, light) => surface(c, w, h, 'mud', { base: wall, light, seed }), {
    left: (c, w, h, l) => doorway(c, w / 2 - 11, h, 22, 48, { frame, light: l, open: true }),
  });
  flatTop(ctx, hut, wall);
  outlineBox(ctx, hut);
}
