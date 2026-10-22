import type { MapExit } from './baseMapTypes';

/**
 * Exits that name a direction must leave by an edge that looks that way.
 *
 * The player reads the compass on the screen: up is north, right is east.
 * The map's grid is drawn as a diamond, so its four edges face the screen's
 * diagonals: `y = 0` is the upper-right edge (north-east), `x = max` the
 * lower-right (south-east), `y = max` the lower-left (south-west) and
 * `x = 0` the upper-left (north-west). A label's arrow or compass word says
 * where the exit leads from here:
 *
 * - a cardinal (↑, "north", "the road west") is satisfied by either edge
 *   within 45° of it: north by the upper-right or upper-left edge;
 * - a diagonal (↗, "south-east") only by its own edge.
 *
 * Words that are not directions are ignored: a capitalised compass word
 * inside the label is part of a name ("the North Gate"), and "from the
 * north" says where the road comes from, not where it goes.
 */

const POINTS: Readonly<Record<string, number>> = {
  north: 0, 'north-east': 45, east: 90, 'south-east': 135,
  south: 180, 'south-west': 225, west: 270, 'north-west': 315,
};

const ARROWS: Readonly<Record<string, string>> = {
  '↑': 'north', '↗': 'north-east', '→': 'east', '↘': 'south-east',
  '↓': 'south', '↙': 'south-west', '←': 'west', '↖': 'north-west',
};

const EDGES = [
  { bearing: 45, name: 'the upper-right edge (y = 0)' },
  { bearing: 135, name: 'the lower-right edge (x = max)' },
  { bearing: 225, name: 'the lower-left edge (y = max)' },
  { bearing: 315, name: 'the upper-left edge (x = 0)' },
] as const;

const CARDINAL_TOLERANCE = 45;
const DIAGONAL_TOLERANCE = 22.5;
const EPSILON = 1e-6;

const WORD = /(\bfrom\s+(?:the\s+)?)?\b(?:(north|south)(?:[\s-]?(east|west))?|(east|west))(?:ern|wards?)?\b/gi;

export interface NamedDirection {
  /** The arrow or words as written. */
  readonly text: string;
  /** `north`, `south-east`, ... */
  readonly point: string;
}

/** Screen bearing of a step `(dx, dy)` off the map, in degrees clockwise from up. */
export function exitBearing(dx: number, dy: number): number {
  // gridToIsoScreen without its 2:1 squash: right = dx - dy, down = dx + dy.
  const degrees = (Math.atan2(dx - dy, -(dx + dy)) * 180) / Math.PI;
  return (degrees + 360) % 360;
}

/** The arrows and compass words in an exit label, in the order written. */
export function namedDirections(label: string): NamedDirection[] {
  const found: NamedDirection[] = [];
  for (const char of label) {
    const point = ARROWS[char];
    if (point) found.push({ text: char, point });
  }
  const firstWord = label.search(/\p{L}/u);
  for (const match of label.matchAll(WORD)) {
    if (match[1]) continue;
    const at = match.index;
    const capital = /\p{Lu}/u.test(label[at]!);
    if (capital && at !== firstWord) continue;
    // "north east", "north-east" and "northeastern" are one diagonal.
    const point = match[2]
      ? [match[2], match[3]].filter(Boolean).join('-').toLowerCase()
      : match[4]!.toLowerCase();
    found.push({ text: match[0].slice(match[1]?.length ?? 0), point });
  }
  return found;
}

function angleBetween(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function tolerance(point: string): number {
  return point.includes('-') ? DIAGONAL_TOLERANCE : CARDINAL_TOLERANCE;
}

/** The edges a compass point may leave by. */
export function edgesFor(point: string): string[] {
  const bearing = POINTS[point]!;
  return EDGES.filter(e => angleBetween(e.bearing, bearing) <= tolerance(point) + EPSILON).map(e => e.name);
}

function edgeName(bearing: number): string {
  const edge = EDGES.find(e => angleBetween(e.bearing, bearing) < EPSILON);
  return edge?.name ?? `the edge facing ${Math.round(bearing)}°`;
}

/** Every way the exits' labels disagree with the edges they leave by. */
export function exitBearingProblems(key: string, exits: readonly MapExit[]): string[] {
  const problems: string[] = [];
  for (const exit of exits) {
    const bearing = exitBearing(exit.dx, exit.dy);
    for (const label of [exit.label, exit.lockedLabel]) {
      if (!label) continue;
      for (const named of namedDirections(label)) {
        if (angleBetween(POINTS[named.point]!, bearing) <= tolerance(named.point) + EPSILON) continue;
        problems.push(`${key}: the exit at (${exit.fromX}, ${exit.fromY}) leaves by ${edgeName(bearing)} `
          + `but "${label}" says ${named.point} ("${named.text}"), which leaves by ${edgesFor(named.point).join(' or ')}`);
      }
    }
  }
  return problems;
}

/** Throws (in development) when an exit's label points another way than the exit goes. */
export function checkExitBearings(key: string, exits: readonly MapExit[]): void {
  const problems = exitBearingProblems(key, exits);
  if (problems.length > 0) throw new Error(problems.join('\n'));
}
