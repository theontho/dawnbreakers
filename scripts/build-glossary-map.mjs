#!/usr/bin/env node
/**
 * Builds src/data/glossary/mapData.ts, the geography behind the glossary's
 * place maps, from Natural Earth (public domain, naturalearthdata.com).
 *
 *   node scripts/build-glossary-map.mjs <dir with the Natural Earth geojson>
 *
 * Needs ne_50m_land, ne_50m_lakes, ne_50m_rivers_lake_centerlines,
 * ne_50m_admin_0_countries and ne_10m_admin_1_states_provinces (.geojson)
 * from github.com/nvkelso/natural-earth-vector. Everything is cropped to the
 * story's world, simplified, and rounded to 0.01 degrees.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dir = process.argv[2];
if (!dir) {
  console.error('Usage: build-glossary-map.mjs <natural earth dir>');
  process.exit(1);
}
const BOX = { w: 30, s: 18, e: 64, n: 44 };
const TOLERANCE = 0.04;
const load = (name) => JSON.parse(readFileSync(join(dir, `${name}.geojson`), 'utf8'));

/** Polygons of a feature as arrays of rings ([lon, lat][]). */
const polygonsOf = (geometry) =>
  geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
const linesOf = (geometry) =>
  geometry.type === 'LineString' ? [geometry.coordinates] : geometry.type === 'MultiLineString' ? geometry.coordinates : [];

/** Sutherland-Hodgman clip of a ring to the box. */
function clipRing(ring) {
  const edges = [
    [(p) => p[0] >= BOX.w, (a, b) => cut(a, b, 0, BOX.w)],
    [(p) => p[0] <= BOX.e, (a, b) => cut(a, b, 0, BOX.e)],
    [(p) => p[1] >= BOX.s, (a, b) => cut(a, b, 1, BOX.s)],
    [(p) => p[1] <= BOX.n, (a, b) => cut(a, b, 1, BOX.n)],
  ];
  let out = ring;
  for (const [inside, intersect] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(intersect(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(intersect(prev, cur));
      }
    }
    if (out.length === 0) return [];
  }
  return out;
}

function cut(a, b, axis, value) {
  const t = (value - a[axis]) / (b[axis] - a[axis]);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Douglas-Peucker simplification. */
function simplify(points, tolerance = TOLERANCE) {
  if (points.length < 3) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0;
    let index = -1;
    for (let i = a + 1; i < b; i++) {
      const d = distance(points[i], points[a], points[b]);
      if (d > max) {
        max = d;
        index = i;
      }
    }
    if (max > tolerance) {
      keep[index] = 1;
      stack.push([a, index], [index, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function distance(p, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  // A closed ring starts and ends on the same point: measure from that point.
  if (len < 1e-12) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
}

const flat = (points) => points.flatMap(([x, y]) => [Math.round(x * 100) / 100, Math.round(y * 100) / 100]);

/**
 * Clipped, simplified rings of every polygon in `features`, holes included
 * (the Caspian is a hole in Asia); draw them with the even-odd fill rule.
 */
function rings(features, filter = () => true, minPoints = 4) {
  const out = [];
  for (const f of features) {
    if (!filter(f)) continue;
    for (const polygon of polygonsOf(f.geometry)) {
      for (const source of polygon) {
        const ring = simplify(clipRing(source));
        if (ring.length >= minPoints) out.push(flat(ring));
      }
    }
  }
  return out;
}

const land = rings(load('ne_50m_land').features);
const lakes = rings(load('ne_50m_lakes').features);
const persia = rings(load('ne_50m_admin_0_countries').features, (f) => f.properties.ADMIN === 'Iran');

// Rivers: keep the stretches inside the box.
const rivers = [];
for (const f of load('ne_50m_rivers_lake_centerlines').features) {
  for (const line of linesOf(f.geometry)) {
    let run = [];
    const flush = () => {
      if (run.length >= 2) rivers.push(flat(simplify(run, TOLERANCE / 2)));
      run = [];
    };
    for (const p of line) {
      if (p[0] >= BOX.w && p[0] <= BOX.e && p[1] >= BOX.s && p[1] <= BOX.n) run.push(p);
      else flush();
    }
    flush();
  }
}

// Historical provinces from the modern ones that cover them.
const PROVINCE_PARTS = {
  mazindaran: ['Mazandaran'],
  khurasan: ['North Khorasan', 'Razavi Khorasan', 'South Khorasan'],
  adhirbayjan: ['East Azarbaijan', 'West Azarbaijan', 'Ardebil'],
  fars: ['Fars'],
};
const admin1 = load('ne_10m_admin_1_states_provinces').features.filter((f) => f.properties.admin === 'Iran');
const provinces = Object.fromEntries(Object.entries(PROVINCE_PARTS).map(([id, names]) =>
  [id, rings(admin1, (f) => names.includes(f.properties.name))]));

const list = (arr) => `[\n${arr.map((r) => `  [${r.join(',')}],`).join('\n')}\n]`;
const out = `/**
 * Geography for the glossary's place maps, generated by
 * scripts/build-glossary-map.mjs from Natural Earth (public domain). Do not
 * edit by hand. Rings and lines are flat [lon, lat, lon, lat, ...] arrays.
 * Ring sets may include holes: fill them with the even-odd rule. Persia is
 * drawn with modern Iran's border, and the historical provinces
 * with the modern provinces that cover them.
 */

export type Flat = readonly number[];

export const MAP_BOX = ${JSON.stringify(BOX)} as const;

export const LAND: readonly Flat[] = ${list(land)};

export const LAKES: readonly Flat[] = ${list(lakes)};

export const RIVERS: readonly Flat[] = ${list(rivers)};

export const PERSIA: readonly Flat[] = ${list(persia)};

export const PROVINCES: Readonly<Record<string, readonly Flat[]>> = {
${Object.entries(provinces).map(([id, r]) => `  ${id}: ${list(r).replace(/\n/g, '\n  ')},`).join('\n')}
};
`;
const file = join(root, 'src', 'data', 'glossary', 'mapData.ts');
writeFileSync(file, out);
const points = (a) => a.reduce((n, r) => n + r.length / 2, 0);
console.log(`${file}: land ${points(land)} pts, lakes ${points(lakes)}, rivers ${points(rivers)}, persia ${points(persia)}, provinces ${Object.values(provinces).reduce((n, r) => n + points(r), 0)}; ${(out.length / 1024).toFixed(0)} KB`);
