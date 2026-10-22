import { css, groundPoint, groundShadow, outlineBox, polygon, roofPoint, shade, topCorners, type Ctx, type IsoBox } from './canvasKit';
import { brick, glazedTiles, stone } from './materials';
import { laneDust, waterJar } from './streetLife';
import { archPath, band, clipped, cylinder, cylinderBand, doorway, flatTop, LIGHT, merlons, parapetRoof, walls } from './ornaments';

/**
 * The Sháh's road caravanserai outside the Qur'án Gate: a fortified ring of
 * travellers' rooms round an open court, blank brick outer walls with round
 * corner towers, and one tall tiled portal (pīshṭāq) where the caravans come
 * and go. The court is cut into the roof so its inner arcades show.
 */

const BRICK = 0xc49a64;
const TURQUOISE = 0x2e8c96;
const LAPIS = 0x24477a;
const CREAM = 0xe8d9a8;

export function drawCaravanserai(ctx: Ctx, box: IsoBox): void {
  groundShadow(ctx, box, 9);
  laneDust(ctx, box, box.w - 4, box.w + 10, box.d / 2 - 22, box.d / 2 + 22, 58);
  walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: light === 1 ? 51 : 52 }), {
    left: (c, w, h, l) => outerWall(c, w, h, l),
    right: (c, w, h, l) => outerWall(c, w, h, l),
  });
  parapetRoof(ctx, box, BRICK, { base: 0xa88560, light: 1, seed: 53 }, 3, 3);
  courtyard(ctx, box, 14, 18);
  merlons(ctx, box, BRICK, 4, 4);
  outlineBox(ctx, box);

  // Round towers at the corners; the back one only shows above the roof.
  const [front, right, back, left] = topCorners(box);
  // Each tower is set a little into its corner, so its base stays on the canvas.
  tower(ctx, back!.x, back!.y, 7, 8);
  for (const corner of [left!, right!, front!]) tower(ctx, corner.x, corner.y + box.h - 3.5, 7, box.h + 5);
  portal(ctx, box);
  // A drinking trough and water jars beside the gate for the caravans.
  const jar = groundPoint(box, box.w + 3, box.d / 2 + 24);
  waterJar(ctx, jar.x, jar.y, 4.5);
  const jar2 = groundPoint(box, box.w + 2, box.d / 2 + 31);
  waterJar(ctx, jar2.x, jar2.y, 3.6, 0x9a6a44);
}

/** Blank defensive walls: a stone plinth, a tiled string course and a few high slit windows. */
function outerWall(c: Ctx, w: number, h: number, l: number): void {
  clipped(c, w, h, () => {
    c.save();
    c.translate(0, h - 7);
    stone(c, w, 7, { base: 0x9a8a70, light: l, seed: 54 }, 3.5);
    c.restore();
  });
  band(c, w, 7, 2.5, TURQUOISE, l);
  for (let u = 14; u < w - 8; u += 22) {
    archPath(c, u, 22, 3, 7);
    c.fillStyle = css(shade(0x1a100a, l + 0.2));
    c.fill();
  }
}

/** A round corner tower with a tile ring and its own merlons. */
function tower(ctx: Ctx, x: number, baseY: number, r: number, h: number): void {
  cylinder(ctx, x, baseY, r, h, BRICK, true);
  ctx.save();
  ctx.fillStyle = 'rgba(40,24,10,0.18)';
  for (let k = 6; k < h; k += 4) ctx.fillRect(x - r, baseY - k, r * 2, 0.6);
  ctx.restore();
  if (h > 20) cylinderBand(ctx, x, baseY - h + 9, r, 2.5, TURQUOISE);
  for (let a = -0.9; a <= 0.91; a += 0.45) {
    const mx = x + Math.sin(a) * r * 0.85;
    ctx.fillStyle = css(shade(BRICK, 1.1 - a * 0.35));
    ctx.fillRect(mx - 1.5, baseY - h - 4, 3, 4);
  }
}

/**
 * The open court seen over the parapet: the far inner walls with their
 * rooms' arched doorways, and a strip of beaten-earth floor with a pool.
 * `ring` is the depth of the rooms around the court; `sink` how far below
 * the roof the floor appears.
 */
function courtyard(ctx: Ctx, box: IsoBox, ring: number, sink: number): void {
  const p0 = ring;
  const p1 = box.w - ring;
  const q0 = ring;
  const q1 = box.d - ring;
  const at = (p: number, q: number) => roofPoint(box, p, q);
  ctx.save();
  polygon(ctx, [at(p0, q0), at(p1, q0), at(p1, q1), at(p0, q1)]);
  ctx.clip();
  // Floor, dropped by `sink`.
  const down = (pt: { x: number; y: number }) => ({ x: pt.x, y: pt.y + sink });
  polygon(ctx, [down(at(p0, q0)), down(at(p1, q0)), down(at(p1, q1)), down(at(p0, q1))]);
  ctx.fillStyle = css(0x9a7c56);
  ctx.fill();
  const pool = down(at((p0 + p1) / 2, (q0 + q1) / 2));
  ctx.fillStyle = css(0x6a5a44);
  ctx.beginPath();
  ctx.ellipse(pool.x, pool.y, 9, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x3a5a6a);
  ctx.beginPath();
  ctx.ellipse(pool.x, pool.y, 7, 3.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Far wall along the back right edge, facing the viewer like a left wall.
  const farLeft = at(p0, q1);
  ctx.save();
  ctx.transform(1, 0.5, 0, 1, farLeft.x, farLeft.y);
  innerArcade(ctx, p1 - p0, sink, LIGHT.left);
  ctx.restore();
  // Far wall along the back left edge, in shade like a right wall.
  const farRight = at(p0, q0);
  ctx.save();
  ctx.transform(1, -0.5, 0, 1, farRight.x, farRight.y);
  innerArcade(ctx, q1 - q0, sink, LIGHT.right);
  ctx.restore();
  ctx.restore();
}

function innerArcade(c: Ctx, w: number, h: number, l: number): void {
  brick(c, w, h, { base: BRICK, light: l * 0.92, seed: 55 }, 3, 7);
  const bays = Math.max(2, Math.round(w / 11));
  const step = w / bays;
  for (let i = 0; i < bays; i++) {
    const middle = i === Math.floor(bays / 2);
    const aw = middle ? step * 0.8 : step * 0.6;
    archPath(c, i * step + (step - aw) / 2, h, aw, middle ? h - 2 : h * 0.72);
    c.fillStyle = css(shade(0x24160c, l + 0.15));
    c.fill();
  }
  c.fillStyle = 'rgba(20,10,4,0.25)';
  c.fillRect(0, 0, w, 3);
}

/** The pīshṭāq: a tiled portal rising above the right wall, its iwan open to the road. */
function portal(ctx: Ctx, box: IsoBox): void {
  const pw = 34;
  const out = 5;
  const at = groundPoint(box, box.w + out, box.d / 2 - pw / 2);
  const p: IsoBox = { x: at.x, y: at.y, w: out, d: pw, h: box.h + 28 };
  walls(ctx, p, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: 56 }), {
    right: (c, w, h, l) => {
      c.save();
      c.beginPath();
      c.rect(2.5, 3, w - 5, h - 3);
      c.clip();
      glazedTiles(c, w, h, { base: LAPIS, light: l, seed: 57 }, 5);
      c.restore();
      c.strokeStyle = css(shade(CREAM, l), 0.9);
      c.lineWidth = 1;
      c.strokeRect(3.5, 4, w - 7, h - 4);
      band(c, w - 7, 7, 3, TURQUOISE, l);
      archPath(c, 5.5, h, w - 11, h - 14);
      c.fillStyle = css(shade(CREAM, l * 0.95));
      c.fill();
      archPath(c, 7, h, w - 14, h - 16);
      c.fillStyle = css(shade(0x3a2616, l));
      c.fill();
      // The gate within the iwan, its leaves standing open.
      doorway(c, w / 2 - 7, h, 14, h * 0.48, { frame: 0x8a6440, light: l, open: true });
      c.fillStyle = css(shade(0x5b3a20, l));
      c.fillRect(w / 2 - 11, h - h * 0.46, 3.5, h * 0.46);
      c.fillRect(w / 2 + 7.5, h - h * 0.46, 3.5, h * 0.46);
    },
  });
  flatTop(ctx, p, BRICK);
  merlons(ctx, p, BRICK, 3, 3);
  outlineBox(ctx, p);
}
