/**
 * The lines of the chapter 3 baghla: one curved hull shared by the deck map
 * (which cells are walkable) and the art (the hull, deck and bulwarks are
 * painted as a few large sprites, not grid-aligned wall pieces).
 *
 * Coordinates are the ground painter's: cell (x, y) spans [x, x + 1) in
 * `fx`, [y, y + 1) in `fy`, so a cell's centre is (x + 0.5, y + 0.5).
 * `fx` runs aft to fore (stern to stem), `fy` across the ship toward the
 * camera; heights `h` are pixels above the deck. Screen points are relative
 * to the centre of grid cell (0, 0), as `gridToIsoScreen` places it.
 */

export interface Pt {
  x: number;
  y: number;
}

export const SHIP = {
  /** The centreline, in `fy`. */
  axis: 8.5,
  /** The transom and the stem at deck level, in `fx`. */
  stern: 3.9,
  stem: 30,
  /** The same at the waterline: the transom overhangs, the stem rakes forward. */
  sternWater: 5,
  stemWater: 28.7,
  /** Greatest half-breadth at the deck, in cells; the flare tucks in to the waterline. */
  beam: 3.95,
  waterBeam: 0.86,
  /** Half-breadth of the square transom at the deck. */
  transom: 3.35,
  /** Deck to waterline, in pixels (about 1.9 m). */
  freeboard: 44,
  /** Bulwark thickness, in cells. */
  bulwark: 0.17,
  /** The gangway in the starboard rail over the ladder (centre, half-width in `fx`). */
  gangway: { fx: 15.5, half: 0.62 },
} as const;

/** Height of the stem head above the deck, and its reach forward of the deck-level stem. */
export const STEM_HEAD = { h: 78, reach: 0.9 };

/** Grid column of the ladder down to the ship's boat (its top is the gangway's deck cell). */
export const LADDER_X = 15;

/** Map-relative screen point of a point on the ship. */
export function toScreen(fx: number, fy: number, h = 0): Pt {
  return { x: (fx - fy) * 32, y: (fx + fy - 1) * 16 - h };
}

const smooth = (a: number, b: number, v: number): number => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Deck-level half-breadth at `s` (0 at the transom, 1 at the stem). */
export function halfBreadth(s: number): number {
  const fx = SHIP.stern + s * (SHIP.stem - SHIP.stern);
  // A broad quarter swelling out from the transom, full amidships, then a fine entry to a sharp stem.
  const aft = SHIP.transom + (SHIP.beam - SHIP.transom) * Math.sin((Math.PI / 2) * smooth(SHIP.stern, 10, fx) ** 0.7);
  const t = Math.max(0, (fx - 17) / (SHIP.stem - 17));
  return aft * (1 - t ** 1.75);
}

/** Bulwark cap height above the deck: the sheer sweeps up to the poop and to the stem head. */
export function sheer(fx: number): number {
  return 20 + 26 * (1 - smooth(5.6, 11.5, fx)) + 16 * smooth(21, SHIP.stem, fx) ** 1.6;
}

export interface HullPoint {
  fx: number;
  fy: number;
  /** Outward normal in the deck plane. */
  nx: number;
  ny: number;
  /** Faces the camera (the outer face is seen; characters inside are behind it). */
  near: boolean;
  /** On the transom rather than the sides. */
  transom: boolean;
}

const SIDE_STEPS = 120;
const TRANSOM_STEPS = 16;

/** The stem's `fx` at height `h` (pixels; negative below the deck): raked at the forefoot, sweeping forward to the head. */
export function stemAt(h: number): number {
  if (h >= 0) return SHIP.stem + STEM_HEAD.reach * (h / STEM_HEAD.h) ** 1.3;
  const u = Math.min(1.4, -h / SHIP.freeboard);
  return SHIP.stem + (SHIP.stemWater - SHIP.stem) * u ** 1.25;
}

/** Point `s` along one side at level `u` (0 the deck, 1 the waterline); `side` is +1 starboard (near), -1 port. */
function sidePoint(s: number, side: number, u: number): Pt {
  const deckFx = SHIP.stern + s * (SHIP.stem - SHIP.stern);
  // Only the ends draw in toward the waterline: the transom's overhang aft, the stem's rake forward.
  const waterFx = deckFx + (SHIP.sternWater - SHIP.stern) * (1 - s) ** 6 + (SHIP.stemWater - SHIP.stem) * s ** 8;
  const half = halfBreadth(s);
  // The topsides flare: they stay wide most of the way down, then tuck in.
  const fy = SHIP.axis + side * half * (1 - (1 - SHIP.waterBeam) * u ** 1.6);
  return { x: deckFx + (waterFx - deckFx) * u ** 1.25, y: fy };
}

function transomPoint(k: number, u: number): Pt {
  // k runs -1 (port) to +1 (starboard); the transom bows aft a little.
  const port = sidePoint(0, -1, u);
  const half = (SHIP.axis - port.y);
  return { x: port.x - 0.22 * (1 - k * k), y: SHIP.axis + k * half };
}

/**
 * The hull's outline at level `u`, closed: up the starboard side from the
 * transom to the stem, down the port side, then across the transom.
 * Every level has the same number of points, so rings stack into strakes.
 */
export function hullRing(u: number): Pt[] {
  const pts: Pt[] = [];
  const at = (i: number): number => 1 - (1 - i / SIDE_STEPS) ** 1.35;
  for (let i = 0; i <= SIDE_STEPS; i++) pts.push(sidePoint(at(i), 1, u));
  for (let i = SIDE_STEPS - 1; i >= 0; i--) pts.push(sidePoint(at(i), -1, u));
  for (let i = 1; i < TRANSOM_STEPS; i++) pts.push(transomPoint(-1 + (2 * i) / TRANSOM_STEPS, u));
  return pts;
}

/** The deck-level ring with normals and facing. */
export function deckRing(): HullPoint[] {
  const pts = hullRing(0);
  const n = pts.length;
  const transomFrom = 2 * SIDE_STEPS + 1;
  return pts.map((p, i) => {
    const a = pts[(i - 1 + n) % n]!;
    const b = pts[(i + 1) % n]!;
    // Starboard (+fy) runs forward first, so the outward normal is (-dy, dx).
    let nx = -(b.y - a.y);
    let ny = b.x - a.x;
    const len = Math.hypot(nx, ny) || 1;
    nx /= len;
    ny /= len;
    const transom = i >= transomFrom || i === 0;
    return { fx: p.x, fy: p.y, nx, ny, near: nx + ny > 0.02 && !transom, transom };
  });
}

/** Whether a point lies on deck, `margin` cells clear of the bulwark's inner face. */
export function insideDeck(fx: number, fy: number, margin: number): boolean {
  const s = (fx - SHIP.stern) / (SHIP.stem - SHIP.stern);
  if (s <= 0 || s >= 1) return false;
  return Math.abs(fy - SHIP.axis) <= halfBreadth(s) - SHIP.bulwark - margin && fx >= SHIP.stern + SHIP.bulwark + margin;
}

/** A deck cell a person can stand on: their body (about 0.3 cells round) clears the bulwark. */
export function isDeckCell(x: number, y: number): boolean {
  const r = 0.3;
  const cx = x + 0.5;
  const cy = y + 0.5;
  return [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].every(([dx, dy]) => insideDeck(cx + dx!, cy + dy!, 0));
}

/** The near bulwark's points along the ring, in order from the starboard quarter to the stem head. */
export function nearRun(): HullPoint[] {
  return deckRing().filter(p => p.near);
}

/** Whether a near-rail point is in the gangway gap. */
export function inGangway(p: { fx: number; fy: number }): boolean {
  return p.fy > SHIP.axis && Math.abs(p.fx - SHIP.gangway.fx) < SHIP.gangway.half;
}

// Sprites ---------------------------------------------------------------------

export interface ShipSprite {
  texture: string;
  /** Map-relative screen rectangle the texture covers. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** The decor cell whose anchor (bottom centre) the texture hangs from. */
  gridX: number;
  gridY: number;
  /** Grid point the sprite depth-sorts at. */
  sortAt: Pt;
  /** The screen columns this sprite paints; neighbours share the rest of its texture's width. */
  clipLeft: number;
  clipRight: number;
}

/** Fits a screen rectangle to a decor anchor: bottom centre on a cell's anchor point. */
function anchored(texture: string, left: number, right: number, top: number, bottom: number, sortAt: Pt): ShipSprite {
  const k = Math.round((left + right) / 64);
  let m = Math.ceil(bottom / 16);
  if ((m - 1 + k) % 2 !== 0) m += 1;
  const gridX = (k + m - 1) / 2;
  const gridY = gridX - k;
  const halfW = Math.ceil(Math.max(k * 32 - left, right - k * 32));
  const height = Math.ceil(m * 16 - top);
  return {
    texture, left: k * 32 - halfW, top: m * 16 - height, width: halfW * 2, height, gridX, gridY, sortAt,
    clipLeft: left, clipRight: right,
  };
}

/** How far below the waterline the painted hull (and its foam) extends. */
const BELOW_WATER = 18;

/**
 * The hull and deck with the far bulwarks, in two halves (stern and bow,
 * each under 1024 px wide): both sort under everything aboard.
 */
export function hullSprites(): ShipSprite[] {
  const deck = hullRing(0).map(p => toScreen(p.x, p.y, sheer(p.x) + 20));
  const water = hullRing(1).map(p => toScreen(p.x, p.y, -SHIP.freeboard - BELOW_WATER));
  const all = [...deck, ...water];
  const xs = all.map(p => p.x);
  const ys = all.map(p => p.y);
  // Room for the wake astern, the bow wave and the rudder.
  const left = Math.min(...xs) - 70;
  const right = Math.max(...xs) + 60;
  const mid = Math.round((left + right) / 128) * 64;
  const top = Math.min(...ys) - 40;
  const bottom = Math.max(...ys) + 14;
  return [
    anchored('ch3-ship-hull-0', left, mid, top, bottom, { x: 0, y: 0 }),
    anchored('ch3-ship-hull-1', mid, right, top, bottom, { x: 0, y: 0 }),
  ];
}

/** Screen width of each near-bulwark slice. */
const SLICE = 64;

/**
 * The near bulwark, cut into vertical slices: each sorts at the lowest
 * (nearest) point of rail it holds, so people on deck pass behind it while
 * someone on the ladder outside stands in front.
 */
export function bulwarkSprites(): ShipSprite[] {
  const run = nearRun();
  const tip = toScreen(SHIP.stem + STEM_HEAD.reach, SHIP.axis, STEM_HEAD.h);
  const xs = run.map(p => toScreen(p.fx, p.fy).x);
  const from = Math.floor(Math.min(...xs) / SLICE) * SLICE;
  const to = tip.x + 8;
  const out: ShipSprite[] = [];
  for (let left = from; left < to; left += SLICE) {
    const right = left + SLICE;
    const held = run.filter(p => {
      const x = toScreen(p.fx, p.fy).x;
      return x >= left - 2 && x <= right + 2 && !inGangway(p);
    });
    const stem = tip.x + 8 >= left && toScreen(SHIP.stemWater, SHIP.axis).x - 8 <= right;
    if (held.length === 0 && !stem) continue;
    const lowest = held.reduce((best, p) => (p.fx + p.fy > best.fx + best.fy ? p : best),
      held[0] ?? { fx: SHIP.stem, fy: SHIP.axis });
    const tops = held.map(p => toScreen(p.fx, p.fy, sheer(p.fx) + 4).y);
    const bottoms = held.map(p => toScreen(p.fx, p.fy, -3).y);
    if (stem) {
      tops.push(tip.y - 8);
      bottoms.push(toScreen(stemAt(-SHIP.freeboard - 4), SHIP.axis, -SHIP.freeboard - 8).y);
    }
    out.push(anchored(`ch3-ship-bulwark-${out.length}`, left, right, Math.min(...tops), Math.max(...bottoms),
      { x: lowest.fx - 0.5, y: lowest.fy - 0.5 }));
  }
  return out;
}

/** Every sprite of the ship, the hull first. */
export const SHIP_SPRITES: readonly ShipSprite[] = [...hullSprites(), ...bulwarkSprites()];
