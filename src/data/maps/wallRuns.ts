import type { DecorSpec } from './types';

/**
 * A straight run of one-cell wall pieces from (x0, y0) to (x1, y1), along a
 * row or a column. The pieces join into a continuous wall when the scene
 * connects them. `gaps` lists cells left open (a lane mouth, a gateway).
 */
export function wallRun(
  texture: string,
  x0: number, y0: number, x1: number, y1: number,
  gaps: ReadonlyArray<readonly [number, number]> = [],
): DecorSpec[] {
  if (x0 !== x1 && y0 !== y1) throw new Error(`wallRun ${texture}: (${x0},${y0})-(${x1},${y1}) is not straight`);
  const open = new Set(gaps.map(([x, y]) => `${x},${y}`));
  const out: DecorSpec[] = [];
  const dx = Math.sign(x1 - x0);
  const dy = Math.sign(y1 - y0);
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) {
    const x = x0 + dx * i;
    const y = y0 + dy * i;
    if (!open.has(`${x},${y}`)) out.push({ gridX: x, gridY: y, texture, blocks: true });
  }
  return out;
}
