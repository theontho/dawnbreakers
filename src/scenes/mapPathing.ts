import { TILE_H, TILE_W } from './baseMapTypes';

/**
 * Click/tap-to-walk support: screen → grid picking and a breadth-first path
 * over the walkable grid. Maps are small (a few hundred cells), so BFS is
 * effectively free and always finds the shortest 4-way path.
 */

export interface GridPoint {
  x: number;
  y: number;
}

/** Inverse of `gridToIsoScreen`, rounded to the cell under the point. */
export function screenToGrid(originX: number, originY: number, worldX: number, worldY: number): GridPoint {
  const a = (worldX - originX) / (TILE_W / 2);
  const b = (worldY - originY) / (TILE_H / 2);
  return { x: Math.round((a + b) / 2), y: Math.round((b - a) / 2) };
}

const STEPS: readonly GridPoint[] = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];

/**
 * Shortest path from `start` to `goal` (exclusive of start). When the goal
 * itself is blocked (a person, a well), the path ends on the nearest free
 * neighbour so the player walks up to it. Returns undefined if unreachable.
 */
export function findPath(blocked: readonly (readonly boolean[])[], start: GridPoint, goal: GridPoint): GridPoint[] | undefined {
  const height = blocked.length;
  const width = blocked[0]?.length ?? 0;
  const inside = (p: GridPoint): boolean => p.x >= 0 && p.y >= 0 && p.x < width && p.y < height;
  if (!inside(goal)) return undefined;

  const goalBlocked = blocked[goal.y]![goal.x]!;
  const isGoal = (p: GridPoint): boolean => goalBlocked
    ? Math.abs(p.x - goal.x) + Math.abs(p.y - goal.y) === 1
    : p.x === goal.x && p.y === goal.y;
  if (isGoal(start)) return [];

  const prev = new Int32Array(width * height).fill(-1);
  const startIndex = start.y * width + start.x;
  prev[startIndex] = startIndex;
  const queue: number[] = [startIndex];
  for (let head = 0; head < queue.length; head++) {
    const index = queue[head]!;
    const cx = index % width;
    const cy = (index - cx) / width;
    for (const step of STEPS) {
      const next = { x: cx + step.x, y: cy + step.y };
      if (!inside(next) || blocked[next.y]![next.x]) continue;
      const nextIndex = next.y * width + next.x;
      if (prev[nextIndex] !== -1) continue;
      prev[nextIndex] = index;
      if (isGoal(next)) return unwind(prev, width, startIndex, nextIndex);
      queue.push(nextIndex);
    }
  }
  return undefined;
}

function unwind(prev: Int32Array, width: number, startIndex: number, endIndex: number): GridPoint[] {
  const path: GridPoint[] = [];
  for (let index = endIndex; index !== startIndex; index = prev[index]!) {
    path.push({ x: index % width, y: Math.floor(index / width) });
  }
  return path.reverse();
}
