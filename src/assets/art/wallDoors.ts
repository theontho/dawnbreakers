import { css, shade, type Ctx } from './canvasKit';
import { glazedTiles, planks } from './materials';
import { archPath, doorway } from './ornaments';
import type { WallStyle } from './wallStyles';

/**
 * Doors in walls. A door in a wall run is a piece of that wall: the wall's
 * own face with a doorway painted into it, joined to the run like any other
 * piece, never a separate block set in a gap. Every wall style tall enough
 * for a person-sized door (23 x 48 px, see docs/true-scale.md) gets two
 * pieces derived from it: `<style>-door`, shut, and `<style>-doorway`, open
 * and walkable. A style gives its doorway character with a `door` look (a
 * timber lintel on a mud wall, a stone one on a rampart, a tile panel on a
 * town house) or opts out with `door: false`.
 *
 * Maps place them with `wallRun(..., { doors })`; `mapSeams.ts` fails a map
 * that pastes some other block into a wall instead.
 */

/** The opening: about 1 m wide and 2.1 m high, 1.2 times a person. */
export const WALL_DOOR = { w: 22, h: 48 } as const;
/** Room over the door for its lintel, below the cap. */
const HEAD = 10;
/** The lowest wall a door fits in. */
export const DOOR_WALL_MIN_H = WALL_DOOR.h + HEAD + 4;

export interface WallDoorLook {
  /** The frame round the arch: brick, stone or a paler plaster. */
  frame: number;
  /** The leaf's wood. */
  leaf?: number;
  /** What spans the head of the recess. */
  lintel?: 'timber' | 'brick' | 'stone' | 'none';
  /** A strip of glazed tile over the arch. */
  tile?: number;
  /** Left a finger's width ajar, lamplight along its edge. */
  ajar?: boolean;
}

/** Paints a doorway in cell space: the cell spans u 0..32 of the face, the ground line is `h`. */
export type OpeningPainter = (ctx: Ctx, h: number, light: number) => void;

export type WallDoorKind = 'door' | 'doorway';

/** The door piece of a wall style: `door` shut, `doorway` open. */
export function wallDoorKey(style: string, kind: WallDoorKind = 'door'): string {
  return `${style}-${kind}`;
}

/** Adds the derived door pieces of every style that takes a door. */
export function withDoorPieces(base: Readonly<Record<string, WallStyle>>): Record<string, WallStyle> {
  const out: Record<string, WallStyle> = { ...base };
  for (const [key, style] of Object.entries(base)) {
    if (style.door === false || style.height < DOOR_WALL_MIN_H) continue;
    const look = style.door ?? { frame: shade(style.top, 0.82), lintel: 'brick' };
    const piece = (open: boolean): WallStyle => ({
      ...style, door: false, doorOf: key, opening: (ctx, h, l) => paintWallDoorway(ctx, h, l, look, open),
    });
    out[wallDoorKey(key, 'door')] = piece(false);
    out[wallDoorKey(key, 'doorway')] = piece(true);
  }
  return out;
}

const CX = 16;

function paintWallDoorway(ctx: Ctx, base: number, l: number, look: WallDoorLook, open: boolean): void {
  const x = CX - WALL_DOOR.w / 2;
  const rx = x - 3;
  const rw = WALL_DOOR.w + 6;
  const rt = base - WALL_DOOR.h - HEAD;
  // The door stands back in the wall's thickness: a shaded reveal, darker under the head and down the left jamb.
  ctx.fillStyle = 'rgba(24,14,6,0.2)';
  ctx.fillRect(rx, rt, rw, base - rt);
  const head = ctx.createLinearGradient(0, rt, 0, rt + 8);
  head.addColorStop(0, 'rgba(20,12,6,0.4)');
  head.addColorStop(1, 'rgba(20,12,6,0)');
  ctx.fillStyle = head;
  ctx.fillRect(rx, rt, rw, 8);
  ctx.fillStyle = 'rgba(20,12,6,0.22)';
  ctx.fillRect(rx, rt, 2, base - rt);
  lintel(ctx, rx, rt, rw, l, look);
  if (look.tile !== undefined) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(CX - 8, rt + 3, 16, 4);
    ctx.clip();
    glazedTiles(ctx, CX + 8, rt + 7, { base: look.tile, light: l, seed: 1601 }, 3);
    ctx.restore();
  }
  doorway(ctx, x, base, WALL_DOOR.w, WALL_DOOR.h, { frame: look.frame, door: look.leaf, light: l, open, seed: 1603 });
  if (open) swungLeaf(ctx, x, base, l, look);
  else if (look.ajar) ajar(ctx, x, base, l, look);
  // The worn step at the threshold.
  ctx.fillStyle = css(shade(0x9a8a70, l * 0.95));
  ctx.fillRect(rx - 1, base - 3, rw + 2, 3);
  ctx.fillStyle = 'rgba(255,240,210,0.25)';
  ctx.fillRect(rx - 1, base - 3, rw + 2, 0.8);
}

function lintel(ctx: Ctx, rx: number, rt: number, rw: number, l: number, look: WallDoorLook): void {
  switch (look.lintel ?? 'timber') {
    case 'timber':
      // A poplar beam across the head, its ends let into the wall.
      ctx.fillStyle = css(shade(0x6a4a2c, l));
      ctx.fillRect(rx - 2, rt - 4, rw + 4, 4);
      ctx.fillStyle = 'rgba(255,230,190,0.18)';
      ctx.fillRect(rx - 2, rt - 4, rw + 4, 0.8);
      ctx.fillStyle = 'rgba(20,12,6,0.35)';
      ctx.fillRect(rx - 2, rt, rw + 4, 1);
      break;
    case 'brick':
      // A course of bricks set on end.
      for (let u = rx - 2, k = 0; u < rx + rw + 2; u += 3, k++) {
        ctx.fillStyle = css(shade(look.frame, l * (k % 2 ? 0.92 : 1.02)));
        ctx.fillRect(u, rt - 5, 2.6, 5);
      }
      ctx.fillStyle = 'rgba(20,12,6,0.3)';
      ctx.fillRect(rx - 2, rt, rw + 4, 1);
      break;
    case 'stone':
      // One long dressed block.
      ctx.fillStyle = css(shade(look.frame, l * 1.05));
      ctx.fillRect(rx - 3, rt - 6, rw + 6, 6);
      ctx.fillStyle = 'rgba(255,240,210,0.22)';
      ctx.fillRect(rx - 3, rt - 6, rw + 6, 0.8);
      ctx.fillStyle = 'rgba(20,12,6,0.35)';
      ctx.fillRect(rx - 3, rt, rw + 6, 1);
      break;
    case 'none':
      break;
  }
}

/** The leaf swung in against the dark of the passage, daylight on the threshold beyond. */
function swungLeaf(ctx: Ctx, x: number, base: number, l: number, look: WallDoorLook): void {
  const w = WALL_DOOR.w;
  const h = WALL_DOOR.h;
  ctx.save();
  archPath(ctx, x, base, w, h);
  ctx.clip();
  const glow = ctx.createRadialGradient(x + w / 2, base - 2, 1, x + w / 2, base - 10, 22);
  glow.addColorStop(0, 'rgba(243,217,138,0.34)');
  glow.addColorStop(1, 'rgba(243,217,138,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, base - h, w, h);
  // Only the leaf's edge shows, swung back on its pivot against the right jamb.
  ctx.fillStyle = css(shade(look.leaf ?? 0x5b3a20, l * 0.7));
  ctx.fillRect(x + w - 6, base - h + 6, 4, h - 6);
  ctx.fillStyle = 'rgba(255,230,190,0.18)';
  ctx.fillRect(x + w - 6, base - h + 6, 0.8, h - 6);
  ctx.restore();
}

/** Warm light from beyond along the edge of a leaf left a little open. */
function ajar(ctx: Ctx, x: number, base: number, l: number, look: WallDoorLook): void {
  const w = WALL_DOOR.w;
  const h = WALL_DOOR.h;
  ctx.save();
  archPath(ctx, x, base, w, h);
  ctx.clip();
  const glow = ctx.createLinearGradient(x + w - 4, 0, x + w, 0);
  glow.addColorStop(0, 'rgba(255,190,110,0.15)');
  glow.addColorStop(1, 'rgba(255,200,120,0.75)');
  ctx.fillStyle = glow;
  ctx.fillRect(x + w - 4, base - h, 4, h);
  ctx.beginPath();
  ctx.rect(x, base - h, w - 3, h);
  ctx.clip();
  planks(ctx, x + w - 3, base, { base: look.leaf ?? 0x4a3420, light: l * 0.85, seed: 1701 }, true, 4);
  ctx.restore();
}
