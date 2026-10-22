import type { MapExit, TileKind } from './baseMapTypes';

/**
 * Exits as wide as the road they sit on. A map defines one exit cell on its
 * edge; it widens along that edge over the neighbouring walkable cells of
 * the same ground (the road's width), up to `REACH` cells either side. Each
 * widened cell keeps its offset across the road on arrival, so walking out
 * on the left of a road brings you in on the left.
 */

const REACH = 3;

export function widenExits(exits: readonly MapExit[], map: TileKind[][], blocked: boolean[][]): MapExit[] {
  const out: MapExit[] = [];
  const height = map.length;
  const width = map[0]?.length ?? 0;
  const taken = new Set(exits.map(e => `${e.fromX},${e.fromY},${e.dx},${e.dy}`));
  for (const exit of exits) {
    out.push({ ...exit });
    const kind = map[exit.fromY]?.[exit.fromX];
    // Lateral axis: along the edge the exit sits on.
    const lx = exit.dx === 0 ? 1 : 0;
    const ly = exit.dx === 0 ? 0 : 1;
    for (const side of [-1, 1]) {
      for (let k = 1; k <= REACH; k++) {
        const x = exit.fromX + lx * side * k;
        const y = exit.fromY + ly * side * k;
        if (x < 0 || y < 0 || x >= width || y >= height) break;
        if (blocked[y]![x] || map[y]![x] !== kind) break;
        const key = `${x},${y},${exit.dx},${exit.dy}`;
        if (taken.has(key)) break;
        taken.add(key);
        out.push({
          ...exit,
          fromX: x,
          fromY: y,
          targetSpawnX: exit.targetSpawnX + lx * side * k,
          targetSpawnY: exit.targetSpawnY + ly * side * k,
        });
      }
    }
  }
  return out;
}

/** The walkable cell nearest to `(x, y)` (itself if free), searching outward. */
export function nearestFreeCell(blocked: boolean[][], x: number, y: number): { x: number; y: number } {
  const height = blocked.length;
  const width = blocked[0]?.length ?? 0;
  const clampX = Math.max(0, Math.min(width - 1, x));
  const clampY = Math.max(0, Math.min(height - 1, y));
  if (!blocked[clampY]![clampX]) return { x: clampX, y: clampY };
  const seen = new Set([`${clampX},${clampY}`]);
  const queue = [{ x: clampX, y: clampY }];
  while (queue.length > 0) {
    const cell = queue.shift()!;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = cell.x + dx;
      const ny = cell.y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || seen.has(`${nx},${ny}`)) continue;
      if (!blocked[ny]![nx]) return { x: nx, y: ny };
      seen.add(`${nx},${ny}`);
      queue.push({ x: nx, y: ny });
    }
  }
  return { x: clampX, y: clampY };
}
