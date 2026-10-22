import { wallDoorKey } from '../../assets/art/wallDoors';
import { WALL_STYLES } from '../../assets/art/wallStyles';
import type { FlagState } from '../../dialogue/types';
import type { DecorSpec } from './types';

type Cell = readonly [number, number];

/**
 * A door in a wall run: a cell, shut; or `{ at, open }`, an open doorway
 * (`open: true`), or one that opens as the story allows (the shut door
 * stands until `open(flags)` holds, then the open doorway, walkable).
 */
export type WallDoor = Cell | { at: Cell; open: true | ((flags: FlagState) => boolean) };

export interface WallRunOptions {
  /** Cells left open (a lane mouth, a gap a gate building fills). */
  gaps?: readonly Cell[];
  /** Cells that get the wall's own door piece (see wallDoors.ts). */
  doors?: readonly WallDoor[];
}

/**
 * A straight run of one-cell wall pieces from (x0, y0) to (x1, y1), along a
 * row or a column. The pieces join into a continuous wall when the scene
 * connects them. A door in the wall is one of its pieces, never a block set
 * in a gap: name its cell in `doors`.
 */
export function wallRun(
  texture: string,
  x0: number, y0: number, x1: number, y1: number,
  { gaps = [], doors = [] }: WallRunOptions = {},
): DecorSpec[] {
  if (x0 !== x1 && y0 !== y1) throw new Error(`wallRun ${texture}: (${x0},${y0})-(${x1},${y1}) is not straight`);
  const at = (x: number, y: number) => `${x},${y}`;
  const open = new Set(gaps.map(([x, y]) => at(x, y)));
  const doorAt = new Map(doors.map(d => [at(...(isCell(d) ? d : d.at)), d] as const));
  if (doors.length && !WALL_STYLES[wallDoorKey(texture)]) {
    throw new Error(`wallRun ${texture}: this wall takes no door (too low for one, or its style opts out)`);
  }
  const out: DecorSpec[] = [];
  const dx = Math.sign(x1 - x0);
  const dy = Math.sign(y1 - y0);
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const x = x0 + dx * i;
    const y = y0 + dy * i;
    const door = doorAt.get(at(x, y));
    doorAt.delete(at(x, y));
    if (open.has(at(x, y))) continue;
    if (!door) out.push({ gridX: x, gridY: y, texture, blocks: true });
    else out.push(...doorPieces(texture, x, y, door));
  }
  if (doorAt.size) throw new Error(`wallRun ${texture}: doors at ${[...doorAt.keys()].join(' ')} are not on the run`);
  return out;
}

function isCell(door: WallDoor): door is Cell {
  return Array.isArray(door);
}

function doorPieces(texture: string, gridX: number, gridY: number, door: WallDoor): DecorSpec[] {
  const shut = { gridX, gridY, texture: wallDoorKey(texture, 'door'), blocks: true };
  const doorway = { gridX, gridY, texture: wallDoorKey(texture, 'doorway') };
  if (isCell(door)) return [shut];
  const { open } = door;
  if (open === true) return [doorway];
  return [{ ...shut, present: f => !open(f) }, { ...doorway, present: open }];
}
