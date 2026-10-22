import { css, groundPoint, groundShadow, outlineBox, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { planks, plaster, stone } from './materials';
import { archPath, band, doorway, dome, flatTop, latticeWindow, LIGHT, parapetRoof, walls } from './ornaments';
import { ellipseShadow, liftedPoint, onPlane, post, subBox } from './structureParts';
import { moss } from './woodland';

/**
 * The tomb of Shaykh Ṭabarsí in the Māzandarān woods: a limewashed cube on
 * a stone terrace under a small plain dome, entered through a pointed
 * portal that stands a little proud of the wall. A timber veranda in the
 * local manner shelters the side from the rain. The door is darkened by
 * pilgrims' candle smoke.
 */

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
  const terrace = subBox(box, 3, w - 3, 3, d - 3, 6);
  // The chamber sits back from the front edges, leaving a walk before the door.
  const p0 = w * 0.16;
  const p1 = pal.veranda ? w * 0.76 : w * 0.86;
  const q0 = d * 0.2;
  const q1 = d * 0.88;
  const chamber = subBox(box, p0, p1, q0, q1, wallH, terrace.h);
  groundShadow(ctx, terrace, 10, 0.3);
  walls(ctx, terrace, (c, fw, fh, light) => stone(c, fw, fh, { base: pal.plinth, light, seed: s + 3 }, 3));
  onTerraceTop(ctx, terrace, pal.plinth, s);
  outlineBox(ctx, terrace, 0x24180e);

  const smoke = (c: Ctx, fw: number, fh: number) => {
    // Damp rising from the terrace and soot under the cornice.
    const damp = c.createLinearGradient(0, fh, 0, fh - 18);
    damp.addColorStop(0, css(shade(pal.wall, 0.55), pal.overgrown ? 0.55 : 0.35));
    damp.addColorStop(1, css(shade(pal.wall, 0.55), 0));
    c.fillStyle = damp;
    c.fillRect(0, fh - 18, fw, 18);
  };
  walls(ctx, chamber, (c, fw, fh, light) => {
    plaster(c, fw, fh, { base: pal.wall, light, seed: s + (light === 1 ? 0 : 7) });
    smoke(c, fw, fh);
  }, {
    left: (c, fw, fh, l) => {
      band(c, fw, 6, 2.5, shade(pal.wall, 0.82), l);
      // A tall shallow blind arch each side of the portal, a small grille high in it.
      for (const u of [fw * 0.13, fw * 0.87]) blindArch(c, u, fh, pal.wall, l, s);
    },
    right: (c, fw, fh, l) => {
      band(c, fw, 6, 2.5, shade(pal.wall, 0.82), l);
      for (const t of [0.2, 0.5, 0.8]) blindArch(c, fw * t, fh, pal.wall, l, s + 1);
    },
  });
  parapetRoof(ctx, chamber, shade(pal.wall, 0.95), { base: shade(pal.wall, 0.72), light: 1, seed: s + 5 }, 3, 4);
  outlineBox(ctx, chamber);
  if (pal.overgrown) {
    const a = roofPoint(chamber, chamber.w * 0.3, 0);
    moss(ctx, a.x, a.y + 2, 12, 3, s);
    const b = liftedPoint(box, p1, q0 + chamber.d * 0.4, terrace.h + 6);
    moss(ctx, b.x, b.y, 10, 4, s + 1, 0x3f6a32);
    ivy(ctx, groundPoint(box, p0 + chamber.w * 0.04, q0), terrace.h, wallH * 0.85, s);
  }
  const centre = roofPoint(chamber, chamber.w / 2, chamber.d / 2);
  const r = Math.min(chamber.w, chamber.d) * 0.3;
  dome(ctx, centre.x, centre.y + 3, r, { color: pal.dome, drum: Math.round(r * 0.5), drumColor: shade(pal.wall, 0.95), bulb: 1.02, ribs: false, finial: true });

  // The portal, centred on the sunlit wall.
  const pc = (p0 + p1) / 2;
  const pw = Math.min(36, chamber.w * 0.5);
  const portal = subBox(box, pc - pw / 2, pc + pw / 2, q0 - 6, q0 + 4, wallH + 5, terrace.h);
  walls(ctx, portal, (c, fw, fh, light) => plaster(c, fw, fh, { base: shade(pal.wall, 1.03), light, seed: s + 11 }), {
    left: (c, fw, fh, l) => portalFace(c, fw, fh, pal, l),
    right: (c, fw, _fh, l) => band(c, fw, 6, 2.5, shade(pal.wall, 0.82), l),
  });
  flatTop(ctx, portal, shade(pal.wall, 0.95));
  outlineBox(ctx, portal);
  steps(ctx, box, pc, q0 - 6, terrace.h, pal.plinth, s);

  if (pal.veranda) veranda(ctx, box, p1, q0, q1, terrace.h, s);
  lifeAtFoot(ctx, box, pc, q0 - 6, terrace.h, pal, s);
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
  for (let p = 0; p < terrace.w; p += 8) {
    for (let q = 0; q < terrace.d; q += 8) {
      ctx.fillStyle = css(shade(color, LIGHT.roof * (0.92 + rand() * 0.14)));
      ctx.fillRect(p + 0.4, q + 0.4, 7.2, 7.2);
    }
  }
  ctx.restore();
}

/** A shallow pointed recess running most of the wall's height, with a small grille high up. */
function blindArch(ctx: Ctx, u: number, h: number, wall: number, light: number, seed: number): void {
  const aw = 11;
  archPath(ctx, u - aw / 2 - 1.5, h - 6, aw + 3, h - 20);
  ctx.fillStyle = css(shade(wall, light * 1.06));
  ctx.fill();
  archPath(ctx, u - aw / 2, h - 6, aw, h - 22);
  ctx.fillStyle = css(shade(wall, light * 0.8));
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  ctx.fillRect(u - aw / 2, 20, 1.5, h - 26);
  latticeWindow(ctx, u - 3.5, 30, 7, 10, { frame: shade(wall, 0.7), light, arched: true, lit: seed % 2 === 0 });
}

/** The pishtaq: a pointed recess, its door small and smoke-dark, a brick frame and a plain inscription band. */
function portalFace(ctx: Ctx, w: number, h: number, pal: ShrinePalette, light: number): void {
  const mid = w / 2;
  const rw = w - 10;
  const rh = h * 0.72;
  ctx.fillStyle = css(shade(0x9a6a44, light));
  ctx.fillRect(3, h - rh - 10, w - 6, rh + 10);
  ctx.fillStyle = css(shade(pal.wall, light * 1.05));
  ctx.fillRect(4.5, h - rh - 8.5, w - 9, 4);
  // Inscription band: a row of dark marks, no legible text.
  ctx.fillStyle = css(shade(0x3a4a5a, light), 0.75);
  for (let u = 7; u < w - 7; u += 2.5) ctx.fillRect(u, h - rh - 7.5 + ((u * 7) % 3) * 0.4, 1.4, 1.6);
  archPath(ctx, mid - rw / 2, h, rw, rh);
  const deep = ctx.createLinearGradient(mid - rw / 2, 0, mid + rw / 2, 0);
  deep.addColorStop(0, css(shade(pal.wall, light * 0.5)));
  deep.addColorStop(1, css(shade(pal.wall, light * 0.78)));
  ctx.fillStyle = deep;
  ctx.fill();
  // A semi-dome of shallow muqarnas cells in the arch head.
  ctx.strokeStyle = css(shade(pal.wall, light * 0.4), 0.6);
  ctx.lineWidth = 0.6;
  for (let row = 0; row < 3; row++) {
    const y = h - rh + 8 + row * 4;
    const span = rw * (0.4 + row * 0.2);
    for (let u = mid - span / 2; u < mid + span / 2 - 1; u += 3.5) {
      ctx.beginPath();
      ctx.arc(u + 1.75, y, 1.75, Math.PI, 0);
      ctx.stroke();
    }
  }
  // Candle smoke has darkened the wall above the door.
  const soot = ctx.createRadialGradient(mid, h - 34, 1, mid, h - 30, 14);
  soot.addColorStop(0, 'rgba(30,22,16,0.45)');
  soot.addColorStop(1, 'rgba(30,22,16,0)');
  ctx.fillStyle = soot;
  ctx.fillRect(mid - 14, h - 48, 28, 30);
  doorway(ctx, mid - 7, h, 14, 34, { frame: shade(pal.plinth, 0.9), door: 0x3a2412, light: light * 0.9, seed: pal.seed });
  // A grille window above the door to light the tomb.
  latticeWindow(ctx, mid - 3.5, h - 48, 7, 8, { frame: shade(pal.wall, 0.7), light, arched: true, lit: true });
}

/** Three stone steps down from the terrace in front of the door. */
function steps(ctx: Ctx, box: IsoBox, pc: number, q: number, h: number, color: number, seed: number): void {
  for (let i = 0; i < 3; i++) {
    const rise = h - i * 2;
    const st = subBox(box, pc - 9 + i * 0.5, pc + 9 - i * 0.5, q - 4 - i * 3, q - i * 3, 2, rise - 2);
    walls(ctx, st, (c, fw, fh, light) => stone(c, fw, fh, { base: shade(color, 1.05), light, seed: seed + i }, 3));
    flatTop(ctx, st, shade(color, 1.05));
  }
}

/** A tālār: a planked veranda on posts along the shaded side, roofed against the rain. */
function veranda(ctx: Ctx, box: IsoBox, wallP: number, q0: number, q1: number, floor: number, seed: number): void {
  const p1 = box.w - 5;
  const qa = q0 + (q1 - q0) * 0.1;
  const qb = q1 - (q1 - q0) * 0.06;
  const hi = floor + 44;
  const lo = floor + 36;
  // Shade cast on the chamber wall by the roof.
  const shadeTop = [liftedPoint(box, wallP, qa, hi), liftedPoint(box, wallP, qb, hi), liftedPoint(box, wallP, qb, floor), liftedPoint(box, wallP, qa, floor)];
  ctx.fillStyle = 'rgba(20,12,6,0.32)';
  ctx.beginPath();
  shadeTop.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
  ctx.closePath();
  ctx.fill();
  // A bench along the wall.
  const bench = subBox(box, wallP, wallP + 5, qa + 6, qb - 6, 6, floor);
  walls(ctx, bench, (c, fw, fh, light) => planks(c, fw, fh, { base: 0x6b4a2c, light, seed: seed + 2 }, false, 3));
  flatTop(ctx, bench, 0x7a5634);
  // Posts along the outer edge, back to front.
  const n = 4;
  for (let i = n - 1; i >= 0; i--) {
    const q = qa + ((qb - qa) * i) / (n - 1);
    const foot = liftedPoint(box, p1, q, floor);
    post(ctx, foot.x, foot.y, lo - floor, 2.6, TIMBER);
    // Carved bracket under the beam.
    ctx.fillStyle = css(shade(TIMBER, 0.9));
    ctx.beginPath();
    ctx.moveTo(foot.x - 4, foot.y - (lo - floor) + 1);
    ctx.lineTo(foot.x + 4, foot.y - (lo - floor) - 3);
    ctx.lineTo(foot.x + 1.3, foot.y - (lo - floor) + 4);
    ctx.closePath();
    ctx.fill();
  }
  // The roof: boards sloping from the wall out over the posts, with a deep eave.
  const o = liftedPoint(box, wallP, qa - 4, hi);
  const a = liftedPoint(box, wallP, qb + 4, hi);
  const b = liftedPoint(box, p1 + 4, qa - 4, lo - 1);
  const len = qb - qa + 8;
  onPlane(ctx, o, a, b, len, 14, (fw, fh) => {
    planks(ctx, fw, fh, { base: 0x7a5a3a, light: LIGHT.roof * 0.95, seed: seed + 4 }, true, 3.5);
    ctx.fillStyle = 'rgba(40,70,30,0.25)';
    ctx.fillRect(0, fh - 3, fw, 3);
  });
  // Fascia board along the eave, in shade.
  const e0 = liftedPoint(box, p1 + 4, qa - 4, lo - 1);
  const e1 = liftedPoint(box, p1 + 4, qb + 4, lo - 1);
  ctx.fillStyle = css(shade(TIMBER, LIGHT.right));
  ctx.beginPath();
  ctx.moveTo(e0.x, e0.y);
  ctx.lineTo(e1.x, e1.y);
  ctx.lineTo(e1.x, e1.y + 3);
  ctx.lineTo(e0.x, e0.y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,10,4,0.7)';
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(o.x, o.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(e1.x, e1.y + 3);
  ctx.moveTo(b.x, b.y + 3);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

/** Ivy climbing from the terrace up the sunlit wall. */
function ivy(ctx: Ctx, foot: { x: number; y: number }, lift: number, h: number, seed: number): void {
  const rand = rng(seed + 31);
  for (let i = 0; i < 70; i++) {
    const t = rand();
    const x = foot.x + t * 10 + (rand() - 0.5) * 8 * (1 - t);
    const y = foot.y - lift - t * h + t * 5;
    ctx.fillStyle = css(rand() < 0.5 ? 0x3f6a32 : 0x557f3c, 0.9);
    ctx.fillRect(x, y, 2, 1.5);
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
