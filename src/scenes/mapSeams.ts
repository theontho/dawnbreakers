import { wallFamily, WALL_STYLES } from '../assets/art/wallStyles';
import type { MapDefinition } from '../data/maps/types';
import { isPersonTexture } from './personTextures';
import { streetFronts } from './streetFronts';

/**
 * The seam check: a door or gate in a wall is a piece of that wall, never a
 * block pasted into a gap or against a run's end. Run on every map as it
 * loads in development (and so by `npm run smoke`); it throws with every
 * problem found and what to do about each.
 *
 * - A cell in a gap of a run (pieces of the same wall on both sides along
 *   it, up to three cells apart) holds nothing, people, the wall's own door
 *   piece, or something the wall's style `joins` (a gatehouse, a house).
 * - Nothing but the wall stands on a wall cell: no building footprint, no
 *   prop, no story object with a sprite of its own.
 * - A door-, gate- or tower-like block (`*-door`, `*-gate`, `*-tower`...)
 *   set against a wall run end on must be a door piece of that wall, or
 *   something it joins.
 * - A door piece stands in a straight run, in from the cut-away south and
 *   east edges; a story object with no sprite stands on scenery that draws
 *   it (a door piece, or the door painted on a building's street front).
 * - A building whose art makes a face its own street front (a gateway, a
 *   portal, shopfronts: see BuildingFront) has no wall running along that
 *   face within `YARD` cells of it, except on the cut-away edges: the front
 *   would stand right behind the wall, pasted onto it, with two doors.
 */

/** The widest gap checked: a lane mouth or a gateway. */
const GAP_SPAN = 3;
/** The least open ground between a building's street front and a wall running along it. */
const YARD = 2;
/** Textures that read as a door, a gate or a tower: set against a wall's end without joining it, they look stuck on. */
const DOOR_LIKE = /(^|-)(door|doors|gate|gates|postern|portal|gatehouse|tower|bastion)(-|$)/;

interface Thing {
  texture: string;
  what: 'building' | 'prop' | 'npc';
  /** A story object drawn by the scenery under it. */
  bare?: boolean;
  /** Comes and goes with the story. */
  conditional?: boolean;
  /** The cell it is placed at (a building's north-west corner). */
  origin: string;
}

type Dir = readonly [number, number];
const AXES: readonly Dir[] = [[1, 0], [0, 1]];
const SIDES: readonly Dir[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function checkWallSeams(def: MapDefinition): void {
  const problems: string[] = [];
  const key = (x: number, y: number) => `${x},${y}`;
  const walls = new Map<string, string>();
  /** Wall cells whose piece comes and goes with the story (a wall that falls). */
  const passing = new Set<string>();
  const doorPieces: Array<{ x: number; y: number; texture: string }> = [];
  const things = new Map<string, Thing[]>();
  const put = (x: number, y: number, thing: Thing) => {
    const list = things.get(key(x, y)) ?? [];
    list.push(thing);
    things.set(key(x, y), list);
  };
  for (const d of def.decor) {
    if (WALL_STYLES[d.texture]) {
      walls.set(key(d.gridX, d.gridY), wallFamily(d.texture));
      if (d.present) passing.add(key(d.gridX, d.gridY));
      if (WALL_STYLES[d.texture]!.doorOf) doorPieces.push({ x: d.gridX, y: d.gridY, texture: d.texture });
    } else {
      put(d.gridX, d.gridY, { texture: d.texture, what: 'prop', conditional: !!d.present, origin: key(d.gridX, d.gridY) });
    }
  }
  for (const b of def.buildings) {
    if (b.w === 1 && b.h === 1 && WALL_STYLES[b.texture]) {
      walls.set(key(b.gridX, b.gridY), wallFamily(b.texture));
      continue;
    }
    for (let y = b.gridY; y < b.gridY + b.h; y++) {
      for (let x = b.gridX; x < b.gridX + b.w; x++) put(x, y, { texture: b.texture, what: 'building', origin: key(b.gridX, b.gridY) });
    }
  }
  for (const n of def.npcs) {
    put(n.gridX, n.gridY, { texture: n.texture ?? '', what: 'npc', bare: n.texture === undefined, conditional: !!n.present, origin: key(n.gridX, n.gridY) });
  }

  const familyAt = (x: number, y: number) => walls.get(key(x, y));
  const joins = (family: string, texture: string) => (WALL_STYLES[family]?.joins ?? []).includes(wallFamily(texture.split('~')[0]!));
  /** Whether the piece at (x, y) runs along `d`: kin beyond it on that axis, or none across it. */
  const runsAlong = (x: number, y: number, [dx, dy]: Dir): boolean => {
    const f = familyAt(x, y);
    const kin = (ax: number, ay: number) => familyAt(ax, ay) === f;
    return kin(x + dx, y + dy) || kin(x - dx, y - dy) || (!kin(x + dy, y + dx) && !kin(x - dy, y - dx));
  };
  const isPerson = (t: Thing) => t.what !== 'building' && !t.bare && isPersonTexture(t.texture);
  const fix = (x: number, y: number, t: Thing, family: string) => {
    const piece = `make it the wall's door piece with wallRun('${family}', ..., { doors: [[${x}, ${y}]] }) and keep any interaction there as an NPC with no texture`;
    const join = `add '${t.texture.split('~')[0]}' to the joins of '${family}' in wallStyles.ts so the wall runs into it`;
    return t.what === 'building' ? `if it is a gatehouse, a tower or a house, ${join}; if it is a door in the wall, ${piece}` : `${piece}; or, if it is a structure the wall runs into, ${join}`;
  };

  // Nothing but the wall stands on a wall cell, unless the story swaps one for the other (rubble where a wall falls).
  for (const [cell, family] of walls) {
    for (const t of things.get(cell) ?? []) {
      if (t.bare || (t.conditional && passing.has(cell))) continue;
      if (t.what === 'building') {
        problems.push(`(${cell}) is a ${family} piece inside the footprint of ${t.texture}: end the wall at the building instead of running it in under it`);
      } else {
        problems.push(`(${cell}) is a ${family} piece but also holds ${t.texture}: `
          + (DOOR_LIKE.test(t.texture) ? fix(...xy(cell), t, family) : 'a wall cell holds only the wall, so move it off onto a free cell beside the wall'));
      }
    }
  }

  // Gaps in a run hold only people, the wall's door pieces, or what the wall joins.
  const reported = new Set<string>();
  for (const [cell, family] of walls) {
    const [x, y] = xy(cell);
    for (const d of AXES) {
      if (!runsAlong(x, y, d)) continue;
      let far = 0;
      for (let i = 1; i <= GAP_SPAN + 1 && !far; i++) {
        const other = familyAt(x + d[0] * i, y + d[1] * i);
        if (other !== undefined) far = other === family ? i : -1;
      }
      if (far < 2 || !runsAlong(x + d[0] * far, y + d[1] * far, d)) continue;
      for (let i = 1; i < far; i++) {
        const gx = x + d[0] * i;
        const gy = y + d[1] * i;
        for (const t of things.get(key(gx, gy)) ?? []) {
          if (isPerson(t) || t.bare || joins(family, t.texture) || reported.has(`${gx},${gy} ${t.texture}`)) continue;
          reported.add(`${gx},${gy} ${t.texture}`);
          problems.push(`(${gx},${gy}) is in a gap of the ${family} run and holds ${t.texture}, which is pasted into the wall: ${fix(gx, gy, t, family)}`);
        }
      }
    }
  }

  // Door-, gate- and tower-like blocks set against a run's end.
  for (const [cell, list] of things) {
    const [x, y] = xy(cell);
    for (const t of list) {
      if (!DOOR_LIKE.test(t.texture.split('~')[0]!)) continue;
      for (const d of SIDES) {
        const family = familyAt(x + d[0], y + d[1]);
        const once = `${t.origin} ${t.texture} ${family}`;
        if (!family || !runsAlong(x + d[0], y + d[1], d) || joins(family, t.texture)) continue;
        // Reported once per block, and not again when it already sits in a gap.
        if (reported.has(once) || reported.has(`${cell} ${t.texture}`)) continue;
        reported.add(once);
        problems.push(`${t.texture} at (${t.origin}) is pasted against the end of the ${family} run at (${x + d[0]},${y + d[1]}): ${fix(x, y, t, family)}`);
      }
    }
  }

  // Door pieces stand in straight runs, where they can be seen.
  for (const door of doorPieces) {
    const family = familyAt(door.x, door.y)!;
    const along = AXES.filter(([dx, dy]) => [1, -1].every(s => {
      const other = familyAt(door.x + dx * s, door.y + dy * s);
      const there = things.get(key(door.x + dx * s, door.y + dy * s)) ?? [];
      return other === family || there.some(t => t.what === 'building' && joins(family, t.texture));
    }));
    if (along.length !== 1) problems.push(`${door.texture} at (${door.x},${door.y}) must stand in a straight run of ${family}, with wall on both sides along it`);
    if (door.y === def.height - 1 || door.x === def.width - 1) {
      problems.push(`${door.texture} at (${door.x},${door.y}) is on the cut-away south or east edge, where walls are cut below a door's height`);
    }
  }

  // No wall stands in front of a building that is its own street front.
  const fronts = streetFronts(def.buildings);
  const cutEdge = (x: number, y: number) => y === def.height - 1 || x === def.width - 1;
  for (const front of fronts) {
    const out: Dir = front.side === 's' ? [0, 1] : [1, 0];
    const along: Dir = [out[1], out[0]];
    for (let k = 1; k <= YARD; k++) {
      const hugging = front.cells.map(([x, y]) => [x + out[0] * k, y + out[1] * k] as const)
        .filter(([x, y]) => familyAt(x, y) && !cutEdge(x, y) && runsAlong(x, y, along));
      if (hugging.length < 2) continue;
      const [hx, hy] = hugging[0]!;
      const { building: b, texture } = front;
      const door = front.door
        ? `use the building's own door (stand its door interactions, NPCs with no texture or doors, on its door cell (${front.door.x},${front.door.y}))`
        : 'let its front be the street wall';
      problems.push(`${texture} at (${b.gridX},${b.gridY}) is its own street front on its ${front.side === 's' ? 'south' : 'east'} face, `
        + `but a ${familyAt(hx, hy)} wall runs along it ${k === 1 ? 'right in front' : 'one cell out'} (from (${hx},${hy})): `
        + `remove the wall in front and ${door}; or place the building so its front faces open ground `
        + `(${YARD} or more cells of yard), or use a variant without a street front`);
      break;
    }
  }

  // A story object with no sprite stands on scenery that draws it.
  for (const n of def.npcs) {
    if (n.texture !== undefined) continue;
    const doorPiece = def.decor.some(d => d.gridX === n.gridX && d.gridY === n.gridY && WALL_STYLES[d.texture]?.doorOf);
    const frontDoor = fronts.some(f => f.door?.x === n.gridX && f.door.y === n.gridY);
    if (!doorPiece && !frontDoor) {
      problems.push(`"${n.prompt}" at (${n.gridX},${n.gridY}) has no texture but stands on no door piece or building front door to draw it`);
    }
  }

  if (problems.length) throw new Error(`${def.key}: walls and doors do not meet:\n- ${problems.join('\n- ')}`);
}

function xy(cell: string): [number, number] {
  const [x, y] = cell.split(',').map(Number);
  return [x!, y!];
}
