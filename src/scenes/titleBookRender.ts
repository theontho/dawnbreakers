import { PAGE_H, PAGE_W, type BookArt } from './titleBookArt';

/**
 * Draws the title book in perspective onto a 2D canvas: the book lies on a
 * table, its front half (cover and half the pages) swings over on the spine,
 * then single leaves turn with a curl. Every surface is texture-mapped by
 * splitting it into small triangles and drawing each with an affine
 * transform; faces are lit from the upper left and back faces are culled.
 *
 * World units are pixels: x to the right, y up off the table, z toward the
 * viewer; the spine lies along z at x = 0.
 */

type V3 = { x: number; y: number; z: number };
type V2 = { x: number; y: number };

export interface BookPose {
  /** Front half's swing, 0 (closed) to 1 (open flat on the left). */
  cover: number;
  /** Each leaf's turn, 0 (on the right) to 1 (landed on the left). */
  leaves: readonly number[];
  /** Camera push toward the right page, 1 = resting view. */
  zoom: number;
  /** Overall opacity of the book. */
  alpha: number;
}

export interface BookFrame {
  width: number;
  height: number;
  /** Page size in world pixels. */
  pageW: number;
  pageH: number;
}

const HALF = 10;   // Thickness of each half: pages plus cover.
const COVER = 4;
const PITCH = 0.98; // Camera elevation above the table, radians.
const DISTANCE = 1500;
const LIGHT = norm({ x: -0.45, y: 0.8, z: 0.4 });

export function drawBook(ctx: CanvasRenderingContext2D, art: BookArt, frame: BookFrame, pose: BookPose): void {
  const { width, height, pageW: PW, pageH: PH } = frame;
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = pose.alpha;
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
  const radius = PW * 1.3 * pose.zoom;
  const g = ctx.createRadialGradient(shadowCentre.x, shadowCentre.y, radius * 0.2, shadowCentre.x, shadowCentre.y, radius);
  g.addColorStop(0, 'rgba(0,0,0,0.45)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  const face = (corner: (u: number, v: number) => V3, normal: V3, image: CanvasImageSource, mirror: boolean, cols = 6, rows = 8) => {
    if (!facing(corner(0.5, 0.5), normal)) return;
    texturedSurface(ctx, image, (u, v) => project(corner(mirror ? 1 - u : u, v)), cols, rows, light(normal));
  };
  const solid = (pts: V3[], normal: V3, colour: string) => {
    if (!facing(pts[0]!, normal)) return;
    const s = pts.map(project);
    ctx.beginPath();
    s.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.fillStyle = `rgba(0,0,0,${1 - light(normal)})`;
    ctx.fill();
  };

  // The right half: back cover and pages, lying still.
  const zTop = -PH / 2;
  const zBot = PH / 2;
  rightHalf(solid, face, art, PW, zTop, zBot);
  // The front half, swung by `cover` about the hinge at the top of the spine.
  frontHalf(solid, face, art, PW, zTop, zBot, pose.cover * Math.PI);
  // The turning leaves, earliest landed first.
  const order = pose.leaves.map((s, i) => ({ s, i })).sort((a, b) => b.s - a.s);
  for (const { s, i } of order) {
    if (s <= 0) continue;
    leaf(ctx, art, project, facing, light, PW, zTop, zBot, s, i === pose.leaves.length - 1);
  }
  ctx.globalAlpha = 1;
}

type Solid = (pts: V3[], normal: V3, colour: string) => void;
type Face = (corner: (u: number, v: number) => V3, normal: V3, image: CanvasImageSource, mirror: boolean, cols?: number, rows?: number) => void;

const GILT = '#c9a24e';
const LEATHER = '#4a1810';

function rightHalf(solid: Solid, face: Face, art: BookArt, PW: number, z0: number, z1: number): void {
  const top = HALF;
  solid([{ x: PW, y: 0, z: z0 }, { x: PW, y: 0, z: z1 }, { x: PW, y: top, z: z1 }, { x: PW, y: top, z: z0 }], { x: 1, y: 0, z: 0 }, GILT);
  solid([{ x: 0, y: 0, z: z1 }, { x: PW, y: 0, z: z1 }, { x: PW, y: top, z: z1 }, { x: 0, y: top, z: z1 }], { x: 0, y: 0, z: 1 }, GILT);
  solid([{ x: 0, y: 0, z: z1 }, { x: PW, y: 0, z: z1 }, { x: PW, y: COVER * 0.6, z: z1 }, { x: 0, y: COVER * 0.6, z: z1 }], { x: 0, y: 0, z: 1 }, LEATHER);
  face((u, v) => ({ x: u * PW, y: top, z: z0 + v * (z1 - z0) }), { x: 0, y: 1, z: 0 }, art.rightPage, false);
}

function frontHalf(solid: Solid, face: Face, art: BookArt, PW: number, z0: number, z1: number, angle: number): void {
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
  face((u, v) => at(u * PW, HALF, z0 + v * (z1 - z0)), out, art.cover, false);
  face((u, v) => at(u * PW, 0, z0 + v * (z1 - z0)), inn, art.endpaper, true);
}

/** One leaf turning with a curl: its free edge lags behind the spine. */
function leaf(
  ctx: CanvasRenderingContext2D,
  art: BookArt,
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
    const image = showFront ? art.leaf : last ? art.leftPage : art.leaf;
    // The back is read mirrored: its texture runs from the fore-edge.
    const u0 = showFront ? k / strips : 1 - k / strips;
    const u1 = showFront ? (k + 1) / strips : 1 - (k + 1) / strips;
    texturedSurface(ctx, image, (u, v) => {
      const p = u === 0 ? p0 : p1;
      return project({ x: p.x, y: p.y, z: z0 + v * (z1 - z0) });
    }, 1, 6, light(normal), [u0, u1]);
  }
}

/**
 * Draws `image` over a surface given by `at(u, v)` in screen space, split
 * into cols x rows quads of two affine-mapped triangles each.
 */
function texturedSurface(
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  at: (u: number, v: number) => V2,
  cols: number,
  rows: number,
  shade: number,
  uRange: [number, number] = [0, 1],
): void {
  // Outline of the whole surface, for a base fill under the triangles (so
  // hairline gaps between them show page, not night) and one shade overlay.
  const outline: V2[] = [];
  for (let c = 0; c <= cols; c++) outline.push(at(c / cols, 0));
  for (let r = 1; r <= rows; r++) outline.push(at(1, r / rows));
  for (let c = cols - 1; c >= 0; c--) outline.push(at(c / cols, 1));
  for (let r = rows - 1; r > 0; r--) outline.push(at(0, r / rows));
  const path = () => {
    ctx.beginPath();
    outline.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
  };
  path();
  ctx.fillStyle = baseColour(image);
  ctx.fill();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const u0 = c / cols;
      const u1 = (c + 1) / cols;
      const v0 = r / rows;
      const v1 = (r + 1) / rows;
      const a = at(u0, v0);
      const b = at(u1, v0);
      const d = at(u0, v1);
      const e = at(u1, v1);
      const tu = (u: number) => (uRange[0] + (uRange[1] - uRange[0]) * u) * PAGE_W;
      const tv = (v: number) => v * PAGE_H;
      triangle(ctx, image, a, b, e, { x: tu(u0), y: tv(v0) }, { x: tu(u1), y: tv(v0) }, { x: tu(u1), y: tv(v1) });
      triangle(ctx, image, a, e, d, { x: tu(u0), y: tv(v0) }, { x: tu(u1), y: tv(v1) }, { x: tu(u0), y: tv(v1) });
    }
  }
  if (shade < 0.999) {
    path();
    ctx.fillStyle = `rgba(20,10,0,${(1 - shade) * 0.9})`;
    ctx.fill();
  }
}

const baseColours = new WeakMap<object, string>();

/** The average colour of a texture, sampled once. */
function baseColour(image: CanvasImageSource): string {
  const known = baseColours.get(image as object);
  if (known) return known;
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  const ctx = c.getContext('2d')!;
  ctx.drawImage(image, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  const colour = `rgb(${r},${g},${b})`;
  baseColours.set(image as object, colour);
  return colour;
}

/** One texture-mapped triangle: solve the affine map from texture to screen, clip, draw. */
function triangle(ctx: CanvasRenderingContext2D, image: CanvasImageSource, s0: V2, s1: V2, s2: V2, t0: V2, t1: V2, t2: V2): void {
  const det = (t1.x - t0.x) * (t2.y - t0.y) - (t2.x - t0.x) * (t1.y - t0.y);
  if (Math.abs(det) < 1e-6) return;
  const a = ((s1.x - s0.x) * (t2.y - t0.y) - (s2.x - s0.x) * (t1.y - t0.y)) / det;
  const b = ((s1.y - s0.y) * (t2.y - t0.y) - (s2.y - s0.y) * (t1.y - t0.y)) / det;
  const c = ((s2.x - s0.x) * (t1.x - t0.x) - (s1.x - s0.x) * (t2.x - t0.x)) / det;
  const d = ((s2.y - s0.y) * (t1.x - t0.x) - (s1.y - s0.y) * (t2.x - t0.x)) / det;
  const e = s0.x - a * t0.x - c * t0.y;
  const f = s0.y - b * t0.x - d * t0.y;
  ctx.save();
  ctx.beginPath();
  // Grow the clip a hair so neighbouring triangles leave no seam.
  const cx = (s0.x + s1.x + s2.x) / 3;
  const cy = (s0.y + s1.y + s2.y) / 3;
  for (const [i, p] of [s0, s1, s2].entries()) {
    const gx = p.x + Math.sign(p.x - cx) * 1.1;
    const gy = p.y + Math.sign(p.y - cy) * 1.1;
    if (i === 0) ctx.moveTo(gx, gy);
    else ctx.lineTo(gx, gy);
  }
  ctx.closePath();
  ctx.clip();
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(image, 0, 0);
  ctx.restore();
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
