import { css, shade, type Ctx } from './canvasKit';
import { brick, glazedTiles } from './materials';
import { recess } from './massing';
import { archPath, clipped } from './ornaments';

/**
 * Wall faces for the court of a Ṭihrán madrasa (the Madrasa of Mírzá Ṣáliḥ,
 * chapter "Ṭihrán and Núr"), one arched bay to a cell (1.4 m), painted in
 * cell-aligned pattern space so a run of bays reads as one arcade (see
 * `WALL_STYLES` in `walls.ts`). Two storeys of students' cells: below, a
 * pointed bay with the cell's two-leaf door at the back of it; above, a
 * smaller arched balcony. A turquoise band runs under the cornice and the
 * spandrels are tiled. A lit cell stands with one leaf open on lamplight.
 */

export const MADRASA_BAY_H = 168;

const BRICK = 0xc8a676;
const PLATFORM = 10;
const TILE = 0x2e8c96;
const LAPIS = 0x24477a;
const DOOR = { w: 20, h: 48 } as const;

/** Brick, the platform's edge at the foot, the tiled band and cornice at the head, a string course between storeys. */
function arcadeWall(ctx: Ctx, w: number, h: number, l: number): void {
  brick(ctx, w, h, { base: BRICK, light: l, seed: l === 1 ? 731 : 732 }, 4, 8);
  clipped(ctx, w, h, () => {
    ctx.fillStyle = css(shade(0x9a8a70, l));
    ctx.fillRect(0, h - PLATFORM, w, PLATFORM);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fillRect(0, h - PLATFORM, w, 1);
    ctx.save();
    ctx.translate(0, 6);
    glazedTiles(ctx, w, 7, { base: TILE, light: l, seed: 733 }, 4);
    ctx.restore();
  });
  ctx.fillStyle = css(shade(0xe0c590, l));
  ctx.fillRect(0, 0, w, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(0, 5, w, 1);
  // String course between the storeys.
  const floor = h - PLATFORM - 84;
  ctx.fillStyle = css(shade(0xd8bc88, l));
  ctx.fillRect(0, floor, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, floor + 3, w, 1);
}

/** Tiled spandrels either side of an arch springing from `base` to `top`. */
function spandrels(ctx: Ctx, x: number, base: number, width: number, top: number, l: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, top, width, base - top);
  archPath(ctx, x, base, width, base - top);
  ctx.clip('evenodd');
  ctx.translate(x, top);
  glazedTiles(ctx, width, base - top, { base: LAPIS, light: l, seed: 735 }, 5);
  ctx.restore();
  ctx.strokeStyle = css(shade(0xe8d9a8, l), 0.75);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 0.5, top + 0.5, width - 1, base - top - 1);
}

/** The upper storey's balcony: a small arch, dark within, a low wooden rail. */
function balcony(ctx: Ctx, w: number, floor: number, l: number): void {
  const bw = 18;
  const bx = w / 2 - bw / 2;
  recess(ctx, bx, floor - 2, bw, 44, BRICK, l);
  ctx.fillStyle = css(0x1a120c, 0.75);
  archPath(ctx, bx + 3, floor - 2, bw - 6, 36);
  ctx.fill();
  ctx.fillStyle = css(shade(0x6a4628, l));
  ctx.fillRect(bx + 1, floor - 12, bw - 2, 1.6);
  for (let u = bx + 3; u < bx + bw - 1; u += 3) ctx.fillRect(u, floor - 12, 1, 10);
}

/**
 * One bay of the madrasa arcade: the cell's door at the back of a pointed
 * bay below, a balcony above. `lit` opens one leaf on a lamplit cell.
 */
export function madrasaBayFace(ctx: Ctx, w: number, h: number, l: number, lit: boolean): void {
  arcadeWall(ctx, w, h, l);
  const base = h - PLATFORM;
  const bayW = w - 6;
  spandrels(ctx, 3, base, bayW, base - 74, l);
  recess(ctx, 3, base, bayW, 70, BRICK, l);
  balcony(ctx, w, base - 84, l);
  const dx = w / 2 - DOOR.w / 2;
  archPath(ctx, dx - 1.5, base, DOOR.w + 3, DOOR.h + 1.5);
  ctx.fillStyle = css(shade(0x7a5434, l * 0.9));
  ctx.fill();
  archPath(ctx, dx, base, DOOR.w, DOOR.h);
  ctx.save();
  ctx.clip();
  if (lit) {
    const g = ctx.createLinearGradient(0, base - DOOR.h, 0, base);
    g.addColorStop(0, '#ffd890');
    g.addColorStop(1, '#b86a2a');
    ctx.fillStyle = g;
    ctx.fillRect(dx, base - DOOR.h, DOOR.w, DOOR.h);
    leaf(ctx, dx, base, DOOR.w / 2 - 1, l * 0.9);
    // The open leaf swung back against the jamb, seen edge-on.
    ctx.fillStyle = css(shade(0x4a2e18, l));
    ctx.fillRect(dx + DOOR.w - 3, base - DOOR.h, 3, DOOR.h);
  } else {
    leaf(ctx, dx, base, DOOR.w / 2, l);
    leaf(ctx, dx + DOOR.w / 2, base, DOOR.w / 2, l);
  }
  ctx.restore();
  ctx.fillStyle = css(shade(0x9a8a70, l));
  ctx.fillRect(dx - 3, base - 1.5, DOOR.w + 6, 1.5);
}

/** One panelled door leaf, `lw` wide, with its iron knocker. */
function leaf(ctx: Ctx, x: number, base: number, lw: number, l: number): void {
  ctx.fillStyle = css(shade(0x5b3a20, l));
  ctx.fillRect(x, base - DOOR.h, lw, DOOR.h);
  ctx.strokeStyle = css(shade(0x3a2412, l), 0.9);
  ctx.lineWidth = 0.8;
  for (const [v, ph] of [[0.18, 0.26], [0.5, 0.3]] as const) {
    ctx.strokeRect(x + 1.5, base - DOOR.h * (1 - v), lw - 3, DOOR.h * ph);
  }
  ctx.fillStyle = css(shade(0xb08a48, l));
  ctx.fillRect(x + lw / 2 - 0.5, base - DOOR.h * 0.52, 1.2, 2.5);
}

/** A blind bay: the arcade's rhythm kept up where a stair or a store opens behind. */
export function madrasaBlindFace(ctx: Ctx, w: number, h: number, l: number): void {
  arcadeWall(ctx, w, h, l);
  const base = h - PLATFORM;
  spandrels(ctx, 3, base, w - 6, base - 74, l);
  recess(ctx, 3, base, w - 6, 70, BRICK, l);
  balcony(ctx, w, base - 84, l);
}
