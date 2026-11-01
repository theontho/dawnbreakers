import type { BookArt } from './titleBookArt';

/**
 * The title book in perspective: the book lies on a table, its front half
 * (cover and half the pages) swings over on the spine, then single leaves
 * turn with a curl. Every surface is split into small quads for the sink to
 * texture-map (see `titleBookMesh.ts`, which hands them to the GPU), faces
 * are lit from the upper left, and back faces are culled.
 *
 * World units are pixels: x to the right, y up off the table, z toward the
 * viewer; the spine lies along z at x = 0.
 */

type V3 = { x: number; y: number; z: number };
export type V2 = { x: number; y: number };

/** One of the book's painted surfaces. */
export type BookPage = keyof BookArt;

export interface BookPose {
  /** Front half's swing, 0 (closed) to 1 (open flat on the left). */
  cover: number;
  /** Each leaf's turn, 0 (on the right) to 1 (landed on the left). */
  leaves: readonly number[];
  /** Camera push toward the right page, 1 = resting view. */
  zoom: number;
}

export interface BookFrame {
  width: number;
  height: number;
  /** Page size in world pixels. */
  pageW: number;
  pageH: number;
}

/** Where the book's surfaces go, back to front, in screen pixels. */
export interface BookSink {
  /** The soft shadow on the table. */
  shadow(x: number, y: number, radius: number): void;
  /** A page, split into cols x rows quads, `at(u, v)` on screen; `uRange` is the strip of the page it shows. */
  surface(page: BookPage, at: (u: number, v: number) => V2, cols: number, rows: number, shade: number, uRange: readonly [number, number]): void;
  /** A flat convex face of one colour (0xRRGGBB), dimmed to `shade`. */
  polygon(points: readonly V2[], colour: number, shade: number): void;
}

const HALF = 10;   // Thickness of each half: pages plus cover.
const COVER = 4;
const PITCH = 0.98; // Camera elevation above the table, radians.
const DISTANCE = 1500;
const LIGHT = norm({ x: -0.45, y: 0.8, z: 0.4 });

export function drawBook(sink: BookSink, frame: BookFrame, pose: BookPose): void {
  const { width, height, pageW: PW, pageH: PH } = frame;
  const sin = Math.sin(PITCH);
  const cos = Math.cos(PITCH);
  const camera = { x: 0, y: DISTANCE * sin, z: DISTANCE * cos };
  // Centred on the closed book, then on the spine as it opens; the push-in
  // drifts toward the middle of the right page.
  const focus = { x: PW * 0.5 * (1 - pose.cover) + PW * 0.5 * (pose.zoom - 1) / pose.zoom, y: 0, z: 0 };
  const project = (p: V3): V2 => {
    const depth = p.y * sin + p.z * cos;
    const up = p.y * cos - p.z * sin;
    const s = (DISTANCE / (DISTANCE - depth)) * pose.zoom;
    return { x: width / 2 + (p.x - focus.x) * s, y: height * 0.54 - up * s };
  };
  const facing = (p: V3, n: V3) => dot(n, sub(camera, p)) > 0;
  const light = (n: V3) => 0.55 + 0.45 * Math.max(0, dot(n, LIGHT));

  // Soft shadow on the table.
  const shadowCentre = project({ x: PW * (pose.cover > 0.5 ? 0 : 0.5), y: 0, z: 0 });
  sink.shadow(shadowCentre.x, shadowCentre.y, PW * 1.3 * pose.zoom);

  const face = (corner: (u: number, v: number) => V3, normal: V3, page: BookPage, mirror: boolean, cols = 6, rows = 8) => {
    if (!facing(corner(0.5, 0.5), normal)) return;
    sink.surface(page, (u, v) => project(corner(mirror ? 1 - u : u, v)), cols, rows, light(normal), [0, 1]);
  };
  const solid = (pts: V3[], normal: V3, colour: number) => {
    if (!facing(pts[0]!, normal)) return;
    sink.polygon(pts.map(project), colour, light(normal));
  };

  // The right half: back cover and pages, lying still.
  const zTop = -PH / 2;
  const zBot = PH / 2;
  rightHalf(solid, face, PW, zTop, zBot);
  // The front half, swung by `cover` about the hinge at the top of the spine.
  frontHalf(solid, face, PW, zTop, zBot, pose.cover * Math.PI);
  // The turning leaves, earliest landed first.
  const order = pose.leaves.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);
  for (const { s, i } of order) {
    if (s <= 0) continue;
    leaf(sink, project, facing, light, PW, zTop, zBot, s, i === pose.leaves.length - 1);
  }
}

type Solid = (pts: V3[], normal: V3, colour: number) => void;
type Face = (corner: (u: number, v: number) => V3, normal: V3, page: BookPage, mirror: boolean, cols?: number, rows?: number) => void;

const GILT = 0xc9a24e;
const LEATHER = 0x4a1810;

function rightHalf(solid: Solid, face: Face, PW: number, z0: number, z1: number): void {
  const top = HALF;
  solid([{ x: PW, y: 0, z: z0 }, { x: PW, y: 0, z: z1 }, { x: PW, y: top, z: z1 }, { x: PW, y: top, z: z0 }], { x: 1, y: 0, z: 0 }, GILT);
  solid([{ x: 0, y: 0, z: z1 }, { x: PW, y: 0, z: z1 }, { x: PW, y: top, z: z1 }, { x: 0, y: top, z: z1 }], { x: 0, y: 0, z: 1 }, GILT);
  solid([{ x: 0, y: 0, z: z1 }, { x: PW, y: 0, z: z1 }, { x: PW, y: COVER * 0.6, z: z1 }, { x: 0, y: COVER * 0.6, z: z1 }], { x: 0, y: 0, z: 1 }, LEATHER);
  face((u, v) => ({ x: u * PW, y: top, z: z0 + v * (z1 - z0) }), { x: 0, y: 1, z: 0 }, 'rightPage', false);
}

function frontHalf(solid: Solid, face: Face, PW: number, z0: number, z1: number, angle: number): void {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  // Local (u across, d up from the hinge) to world.
  const at = (u: number, d: number, z: number): V3 => ({ x: u * c - d * s, y: HALF + u * s + d * c, z });
  const out = { x: -s, y: c, z: 0 };   // Cover side.
  const inn = { x: s, y: -c, z: 0 };   // Page side.
  const fore = { x: c, y: s, z: 0 };
  solid([at(PW, 0, z0), at(PW, 0, z1), at(PW, HALF, z1), at(PW, HALF, z0)], fore, GILT);
  solid([at(0, 0, z1), at(PW, 0, z1), at(PW, HALF, z1), at(0, HALF, z1)], { x: 0, y: 0, z: 1 }, GILT);
  solid([at(0, HALF - COVER, z1), at(PW, HALF - COVER, z1), at(PW, HALF, z1), at(0, HALF, z1)], { x: 0, y: 0, z: 1 }, LEATHER);
  face((u, v) => at(u * PW, HALF, z0 + v * (z1 - z0)), out, 'cover', false);
  face((u, v) => at(u * PW, 0, z0 + v * (z1 - z0)), inn, 'endpaper', true);
}

/** One leaf turning with a curl: its free edge lags behind the spine. */
function leaf(
  sink: BookSink,
  project: (p: V3) => V2,
  facing: (p: V3, n: V3) => boolean,
  light: (n: V3) => number,
  PW: number,
  z0: number,
  z1: number,
  s: number,
  last: boolean,
): void {
  const strips = 14;
  const base = s * Math.PI;
  const lag = 0.9 * Math.sin(s * Math.PI);
  const pts3: { x: number; y: number }[] = [{ x: 0, y: HALF }];
  for (let k = 0; k < strips; k++) {
    const u = (k + 0.5) / strips;
    const a = base - lag * u * u;
    const prev = pts3[k]!;
    pts3.push({ x: prev.x + Math.cos(a) * PW / strips, y: prev.y + Math.sin(a) * PW / strips + 0.2 });
  }
  for (let k = 0; k < strips; k++) {
    const p0 = pts3[k]!;
    const p1 = pts3[k + 1]!;
    // Normal of this strip, on the leaf's front (upper when lying right).
    const tx = p1.x - p0.x;
    const ty = p1.y - p0.y;
    const len = Math.hypot(tx, ty) || 1;
    const front = { x: -ty / len, y: tx / len, z: 0 };
    const showFront = facing({ x: p0.x, y: p0.y, z: 0 }, front);
    const normal = showFront ? front : { x: -front.x, y: -front.y, z: 0 };
    const page: BookPage = showFront || !last ? 'leaf' : 'leftPage';
    // The back is read mirrored: its texture runs from the fore-edge.
    const u0 = showFront ? k / strips : 1 - k / strips;
    const u1 = showFront ? (k + 1) / strips : 1 - (k + 1) / strips;
    sink.surface(page, (u, v) => {
      const p = u === 0 ? p0 : p1;
      return project({ x: p.x, y: p.y, z: z0 + v * (z1 - z0) });
    }, 1, 6, light(normal), [u0, u1]);
  }
}

function sub(a: V3, b: V3): V3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function dot(a: V3, b: V3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function norm(v: V3): V3 {
  const l = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}
