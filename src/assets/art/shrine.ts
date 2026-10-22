import { css, groundPoint, groundShadow, outlineBox, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { planks, stone } from './materials';
import { archPath, band, doorway, dome, flatTop, latticeWindow, LIGHT, walls } from './ornaments';
import { ellipseShadow, liftedPoint, onPlane, post, subBox } from './structureParts';
import { joinedMass, type MassPart } from './town/joinedMass';
import { moss } from './woodland';

/**
 * The tomb of Shaykh Ṭabarsí in the Māzandarān woods, at true scale on a
 * 6 x 6 footprint: a limewashed cube about 6 m a side and 4.5 m high on a
 * stone terrace under a small plain dome, entered through a pointed portal
 * that stands a little proud of the wall. A timber veranda in the local
 * manner shelters the side from the rain. The door is darkened by pilgrims'
 * candle smoke.
 */

/** The chamber's wall height, and the headroom the dome needs above it. */
export const SHRINE_WALL = 104;
export const SHRINE_DOME_PAD = 110;

export interface ShrinePalette {
  wall: number;
  plinth: number;
  dome: number;
  seed: number;
  /** Damp and moss of a building half lost in the woods. */
  overgrown?: boolean;
  /** Add the timber veranda along the shaded side. */
  veranda?: boolean;
}

const TIMBER = 0x5a3c22;

/**
 * Draws the shrine inside `box`'s footprint. `wallH` is the chamber height;
 * the portal rises about a fifth above it.
 */
export function drawShrine(ctx: Ctx, box: IsoBox, wallH: number, pal: ShrinePalette): void {
  const { w, d } = box;
  const s = pal.seed;
  const terrace = subBox(box, 6, w - 6, 6, d - 6, 10);
  // The chamber sits back from the front edges, leaving a walk before the door.
  const p0 = w * 0.12;
  const p1 = pal.veranda ? w * 0.78 : w * 0.88;
  const q0 = d * 0.2;
  const q1 = d * 0.92;
  groundShadow(ctx, terrace, 16, 0.3);
  walls(ctx, terrace, (c, fw, fh, light) => stone(c, fw, fh, { base: pal.plinth, light, seed: s + 3 }, 5));
  onTerraceTop(ctx, terrace, pal.plinth, s);
  outlineBox(ctx, terrace, 0x24180e);

  const smoke = (c: Ctx, fw: number, fh: number) => {
    // Damp rising from the terrace and soot under the cornice.
    const damp = c.createLinearGradient(0, fh, 0, fh - 30);
    damp.addColorStop(0, css(shade(pal.wall, 0.55), pal.overgrown ? 0.55 : 0.35));
    damp.addColorStop(1, css(shade(pal.wall, 0.55), 0));
    c.fillStyle = damp;
    c.fillRect(0, fh - 30, fw, 30);
  };
  // The chamber and its portal are one mass: no seam where the portal stands out of the wall.
  const floor = { ...box, y: box.y - terrace.h };
  const pc = (p0 + p1) / 2;
  const pw = Math.min(64, (p1 - p0) * 0.5);
  const chamberPart: MassPart = {
    p0, p1, q0, q1, h: wallH,
    spec: {
      wall: pal.wall, seed: s, plinth: false, shadow: false,
      left: (c, fw, fh, l) => {
        smoke(c, fw, fh);
        band(c, fw, 10, 4, shade(pal.wall, 0.82), l);
        // A tall shallow blind arch each side of the portal, a small grille high in it.
        for (const u of [fw * 0.13, fw * 0.87]) blindArch(c, u, fh, pal.wall, l, s);
      },
      right: (c, fw, fh, l) => {
        smoke(c, fw, fh);
        band(c, fw, 10, 4, shade(pal.wall, 0.82), l);
        for (const t of [0.2, 0.5, 0.8]) blindArch(c, fw * t, fh, pal.wall, l, s + 1);
      },
    },
  };
  const portalPart: MassPart = {
    p0: pc - pw / 2, p1: pc + pw / 2, q0: q0 - 10, q1: q0 + 6, h: wallH + 14,
    spec: {
      wall: shade(pal.wall, 1.03), seed: s + 11, plinth: false, shadow: false, roof: 'flat',
      left: (c, fw, fh, l) => { smoke(c, fw, fh); portalFace(c, fw, fh, pal, l); },
      right: (c, fw, fh, l) => { smoke(c, fw, fh); band(c, fw, 10, 4, shade(pal.wall, 0.82), l); },
    },
  };
  joinedMass(ctx, floor, [chamberPart], [portalPart]);
  const chamber = subBox(box, p0, p1, q0, q1, wallH, terrace.h);
  if (pal.overgrown) {
    const a = roofPoint(chamber, chamber.w * 0.3, 0);
    moss(ctx, a.x, a.y + 3, 22, 5, s);
    const b = liftedPoint(box, p1, q0 + chamber.d * 0.4, terrace.h + 10);
    moss(ctx, b.x, b.y, 18, 7, s + 1, 0x3f6a32);
  }
  const centre = roofPoint(chamber, chamber.w / 2, chamber.d / 2);
  const r = Math.min(chamber.w, chamber.d) * 0.3;
  dome(ctx, centre.x, centre.y + 5, r, { color: pal.dome, drum: Math.round(r * 0.5), drumColor: shade(pal.wall, 0.95), bulb: 1.02, ribs: false, finial: true });
  // The portal, centred on the sunlit wall, in front of the dome.
  joinedMass(ctx, floor, [portalPart], [chamberPart]);
  if (pal.overgrown) ivy(ctx, groundPoint(box, p0 + chamber.w * 0.04, q0), terrace.h, wallH * 0.85, s);
  steps(ctx, box, pc, q0 - 10, terrace.h, pal.plinth, s);

  if (pal.veranda) veranda(ctx, box, p1, q0, q1, terrace.h, s);
  lifeAtFoot(ctx, box, pc, q0 - 10, terrace.h, pal, s);
}

function onTerraceTop(ctx: Ctx, terrace: IsoBox, color: number, seed: number): void {
  const rand = rng(seed + 13);
  ctx.save();
  ctx.transform(1, 0.5, 1, -0.5, terrace.x - terrace.w, terrace.y - terrace.w / 2 - terrace.h);
  ctx.fillStyle = css(shade(color, LIGHT.roof));
  ctx.fillRect(0, 0, terrace.w, terrace.d);
  // Flagstones.
  ctx.strokeStyle = css(shade(color, 0.7), 0.6);
  ctx.lineWidth = 0.6;
  for (let p = 0; p < terrace.w; p += 12) {
    for (let q = 0; q < terrace.d; q += 12) {
      ctx.fillStyle = css(shade(color, LIGHT.roof * (0.92 + rand() * 0.14)));
      ctx.fillRect(p + 0.5, q + 0.5, 11, 11);
    }
  }
  ctx.restore();
}

/** A shallow pointed recess running most of the wall's height, with a small grille high up. */
function blindArch(ctx: Ctx, u: number, h: number, wall: number, light: number, seed: number): void {
  const aw = 22;
  archPath(ctx, u - aw / 2 - 2.5, h - 10, aw + 5, h - 26);
  ctx.fillStyle = css(shade(wall, light * 1.06));
  ctx.fill();
  archPath(ctx, u - aw / 2, h - 10, aw, h - 30);
  ctx.fillStyle = css(shade(wall, light * 0.8));
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(u - aw / 2, 28, 2, h - 38);
  latticeWindow(ctx, u - 6, 36, 12, 18, { frame: shade(wall, 0.7), light, arched: true, lit: seed % 2 === 0 });
}

/** The pishtaq: a pointed recess, its door small and smoke-dark, a brick frame and a plain inscription band. */
function portalFace(ctx: Ctx, w: number, h: number, pal: ShrinePalette, light: number): void {
  const mid = w / 2;
  const rw = w - 16;
  const rh = h * 0.74;
  ctx.fillStyle = css(shade(0x9a6a44, light));
  ctx.fillRect(5, h - rh - 16, w - 10, rh + 16);
  ctx.fillStyle = css(shade(pal.wall, light * 1.05));
  ctx.fillRect(7, h - rh - 14, w - 14, 7);
  // Inscription band: a row of dark marks, no legible text.
  ctx.fillStyle = css(shade(0x3a4a5a, light), 0.75);
  for (let u = 10; u < w - 10; u += 3) ctx.fillRect(u, h - rh - 13 + ((u * 7) % 4) * 0.5, 1.6, 3);
  archPath(ctx, mid - rw / 2, h, rw, rh);
  const deep = ctx.createLinearGradient(mid - rw / 2, 0, mid + rw / 2, 0);
  deep.addColorStop(0, css(shade(pal.wall, light * 0.5)));
  deep.addColorStop(1, css(shade(pal.wall, light * 0.78)));
  ctx.fillStyle = deep;
  ctx.fill();
  // A semi-dome of shallow muqarnas cells in the arch head.
  ctx.strokeStyle = css(shade(pal.wall, light * 0.4), 0.6);
  ctx.lineWidth = 0.6;
  for (let row = 0; row < 4; row++) {
    const y = h - rh + 12 + row * 6;
    const span = rw * (0.35 + row * 0.17);
    for (let u = mid - span / 2; u < mid + span / 2 - 1; u += 5) {
      ctx.beginPath();
      ctx.arc(u + 2.5, y, 2.5, Math.PI, 0);
      ctx.stroke();
    }
  }
  // Candle smoke has darkened the wall above the door.
  const soot = ctx.createRadialGradient(mid, h - 50, 1, mid, h - 44, 20);
  soot.addColorStop(0, 'rgba(30,22,16,0.45)');
  soot.addColorStop(1, 'rgba(30,22,16,0)');
  ctx.fillStyle = soot;
  ctx.fillRect(mid - 20, h - 68, 40, 40);
  doorway(ctx, mid - 11.5, h, 23, 48, { frame: shade(pal.plinth, 0.9), door: 0x3a2412, light: light * 0.9, seed: pal.seed });
  // A grille window above the door to light the tomb.
  latticeWindow(ctx, mid - 6, h - 74, 12, 14, { frame: shade(pal.wall, 0.7), light, arched: true, lit: true });
}

/** Three stone steps down from the terrace in front of the door. */
function steps(ctx: Ctx, box: IsoBox, pc: number, q: number, h: number, color: number, seed: number): void {
  for (let i = 0; i < 3; i++) {
    const rise = h - i * 3.3;
    const st = subBox(box, pc - 16 + i, pc + 16 - i, q - 6 - i * 6, q - i * 6, 3.3, rise - 3.3);
    walls(ctx, st, (c, fw, fh, light) => stone(c, fw, fh, { base: shade(color, 1.05), light, seed: seed + i }, 4));
    flatTop(ctx, st, shade(color, 1.05));
  }
}

/** A tālār: a planked veranda on posts along the shaded side, roofed against the rain. */
function veranda(ctx: Ctx, box: IsoBox, wallP: number, q0: number, q1: number, floor: number, seed: number): void {
  const p1 = box.w - 10;
  const qa = q0 + (q1 - q0) * 0.1;
  const qb = q1 - (q1 - q0) * 0.06;
  const hi = floor + 76;
  const lo = floor + 62;
  // Shade cast on the chamber wall by the roof.
  const shadeTop = [liftedPoint(box, wallP, qa, hi), liftedPoint(box, wallP, qb, hi), liftedPoint(box, wallP, qb, floor), liftedPoint(box, wallP, qa, floor)];
  ctx.fillStyle = 'rgba(20,12,6,0.32)';
  ctx.beginPath();
  shadeTop.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
  ctx.closePath();
  ctx.fill();
  // A bench along the wall.
  const bench = subBox(box, wallP, wallP + 10, qa + 10, qb - 10, 10, floor);
  walls(ctx, bench, (c, fw, fh, light) => planks(c, fw, fh, { base: 0x6b4a2c, light, seed: seed + 2 }, false, 3));
  flatTop(ctx, bench, 0x7a5634);
  // Posts along the outer edge, back to front.
  const n = 4;
  for (let i = n - 1; i >= 0; i--) {
    const q = qa + ((qb - qa) * i) / (n - 1);
    const foot = liftedPoint(box, p1, q, floor);
    post(ctx, foot.x, foot.y, lo - floor, 4, TIMBER);
    // Carved bracket under the beam.
    ctx.fillStyle = css(shade(TIMBER, 0.9));
    ctx.beginPath();
    ctx.moveTo(foot.x - 7, foot.y - (lo - floor) + 1);
    ctx.lineTo(foot.x + 7, foot.y - (lo - floor) - 5);
    ctx.lineTo(foot.x + 2, foot.y - (lo - floor) + 7);
    ctx.closePath();
    ctx.fill();
  }
  // The roof: boards sloping from the wall out over the posts, with a deep eave.
  const o = liftedPoint(box, wallP, qa - 6, hi);
  const a = liftedPoint(box, wallP, qb + 6, hi);
  const b = liftedPoint(box, p1 + 7, qa - 6, lo - 1);
  const len = qb - qa + 12;
  onPlane(ctx, o, a, b, len, 24, (fw, fh) => {
    planks(ctx, fw, fh, { base: 0x7a5a3a, light: LIGHT.roof * 0.95, seed: seed + 4 }, true, 5);
    ctx.fillStyle = 'rgba(40,70,30,0.25)';
    ctx.fillRect(0, fh - 5, fw, 5);
  });
  // Fascia board along the eave, in shade.
  const e0 = liftedPoint(box, p1 + 7, qa - 6, lo - 1);
  const e1 = liftedPoint(box, p1 + 7, qb + 6, lo - 1);
  ctx.fillStyle = css(shade(TIMBER, LIGHT.right));
  ctx.beginPath();
  ctx.moveTo(e0.x, e0.y);
  ctx.lineTo(e1.x, e1.y);
  ctx.lineTo(e1.x, e1.y + 5);
  ctx.lineTo(e0.x, e0.y + 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,4,0.7)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(e1.x, e1.y + 5);
  ctx.moveTo(b.x, b.y + 5);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

/** Ivy climbing from the terrace up the sunlit wall. */
function ivy(ctx: Ctx, foot: { x: number; y: number }, lift: number, h: number, seed: number): void {
  const rand = rng(seed + 31);
  for (let i = 0; i < 160; i++) {
    const t = rand();
    const x = foot.x + t * 18 + (rand() - 0.5) * 14 * (1 - t);
    const y = foot.y - lift - t * h + t * 9;
    ctx.fillStyle = css(rand() < 0.5 ? 0x3f6a32 : 0x557f3c, 0.9);
    ctx.fillRect(x, y, 2.5, 2);
  }
}

/** A water jar and a pilgrim's slippers by the steps, a few tufts of grass along the terrace. */
function lifeAtFoot(ctx: Ctx, box: IsoBox, pc: number, q: number, h: number, pal: ShrinePalette, seed: number): void {
  const rand = rng(seed + 41);
  const jar = liftedPoint(box, pc - 18, q - 2, h);
  ellipseShadow(ctx, jar.x + 1, jar.y, 4, 1.6, 0.3);
  const g = ctx.createRadialGradient(jar.x - 1.5, jar.y - 6, 0.5, jar.x, jar.y - 4, 5);
  g.addColorStop(0, '#d89a64');
  g.addColorStop(1, '#7a4422');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(jar.x - 1.6, jar.y - 9);
  ctx.quadraticCurveTo(jar.x - 5, jar.y - 6, jar.x - 2.5, jar.y);
  ctx.lineTo(jar.x + 2.5, jar.y);
  ctx.quadraticCurveTo(jar.x + 5, jar.y - 6, jar.x + 1.6, jar.y - 9);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(0x5a3018);
  ctx.fillRect(jar.x - 2, jar.y - 10, 4, 1.2);
  const slip = liftedPoint(box, pc + 12, q - 1, h);
  ctx.fillStyle = css(0x6a2a1e);
  for (const dx of [0, 3.2]) {
    ctx.beginPath();
    ctx.ellipse(slip.x + dx, slip.y - 0.8 + dx * 0.3, 1.3, 2.4, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < (pal.overgrown ? 16 : 9); i++) {
    const along = rand();
    const at = rand() < 0.5 ? groundPoint(box, 3 + along * (box.w - 6), 2) : groundPoint(box, box.w - 2, 3 + along * (box.d - 6));
    ctx.strokeStyle = css(rand() < 0.5 ? 0x4f7a3a : 0x6a8a3a, 0.9);
    ctx.lineWidth = 0.8;
    for (let k = -1; k <= 1; k++) {
      ctx.beginPath();
      ctx.moveTo(at.x, at.y);
      ctx.lineTo(at.x + k * 1.6, at.y - 3 - rand() * 2);
      ctx.stroke();
    }
  }
}
