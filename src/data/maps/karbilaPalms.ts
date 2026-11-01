import type { DecorSpec } from './types';

type Cell = readonly [number, number];

/** The Forerunners' date palms (`chapters/forerunners.ts`), grown, tall and young. */
const PALM_KINDS = ['date-palm', 'date-palm-tall', 'date-palm', 'date-palm-young'] as const;

/**
 * Date palms for the Karbilá maps, kept off the line of sight to the
 * people and story objects on `watched` cells. A palm's crown hangs 90 to
 * 280 px above its foot, so it can cover whoever stands up to 20 cells
 * behind it (in `x + y`) in about the same screen column (`x - y`).
 */
export function palms(cells: readonly Cell[], watched: readonly Cell[]): DecorSpec[] {
  const hides = ([px, py]: Cell, [wx, wy]: Cell) => {
    const depth = px + py - (wx + wy);
    const column = Math.abs(px - py - (wx - wy));
    return depth >= 1 && depth <= 20 && column <= 3;
  };
  return cells
    .filter(c => !watched.some(w => hides(c, w)))
    .map(([gridX, gridY], i) => ({ gridX, gridY, texture: PALM_KINDS[(gridX * 7 + gridY * 3 + i) % PALM_KINDS.length]!, blocks: true }));
}
