import { css, groundPoint, onRightWall, onRoof, outlineBox, shade, topCorners, type Ctx, type IsoBox } from './canvasKit';
import { coilPath, rope } from './cordage';
import { ellipseShadow } from './fieldKit';
import { planks } from './materials';
import { band, latticeWindow, LIGHT, walls } from './ornaments';
import { subBox } from './structureParts';
import { waterJar } from './streetLife';

/**
 * The stern deckhouse of the pilgrim baghla at true scale (6 x 4 cells,
 * about 8.4 by 5.6 m; a person is 40 px). Aft, the tall poop with its stern
 * windows, whose roof is the quarterdeck; forward of it the lower cabin of
 * the companions, its lamplit door facing the waist and its plank door on
 * the side. The inner room lies under the poop and is never shown.
 *
 * Box axes: `p` runs aft to fore along grid x, `q` from the near (+y) side
 * of the deckhouse to the far side.
 */

const TEAK = 0x7a4f2c;
const DARK_TEAK = 0x4a2e18;
const GILT = 0xc9a55c;
const RED = 0xa83a2a;
/** The forward cabin: deck to roof planking, about 3.1 m with its beams. */
const LOW = 72;
/** The poop, a full storey higher at the carved stern. */
const HIGH = 112;
/** Where the poop ends and the forward cabin begins. */
const SPLIT = 100;
/** The forward cabin's side face starts here, and its front face is set back to here. */
const FWD_Q0 = 6;
const FWD_P1 = 186;

export interface CabinDoors {
  /** Centre of the side (plank) door along `p`: the deck cell the map's door is on. */
  portP: number;
  /** Centre of the lamplit door along `q`: the deck cell the threshold faces. */
  cabinQ: number;
}

export function drawCabin(ctx: Ctx, box: IsoBox, doors: CabinDoors): void {
  ellipseShadow(ctx, box.x - box.w * 0.35, box.y - box.d * 0.35, box.w * 0.75, box.d * 0.45, 0.24);
  const poop = subBox(box, 2, SPLIT, 3, box.d - 2, HIGH);
  const cabin = subBox(box, SPLIT, FWD_P1, FWD_Q0, box.d - 6, LOW);

  // The poop: stern windows along its side, a ladder up its forward face from the cabin roof.
  walls(ctx, poop, teak(41), {
    left: (c, w, h, l) => {
      trim(c, w, l);
      strakes(c, w, h, l);
      for (const u of [18, 50, 82]) latticeWindow(c, u - 6, h - 62, 12, 18, { frame: GILT, light: l, lit: true, arched: true });
      carvedPanel(c, 6, h - 34, w - 12, l);
    },
    right: (c, w, _h, l) => {
      trim(c, w, l);
      latticeWindow(c, w * 0.72 - 6, 14, 12, 16, { frame: GILT, light: l, lit: true, arched: true });
      ladder(c, w * 0.3, HIGH - LOW, l);
    },
  });
  deckTop(ctx, poop, 43);
  outlineBox(ctx, poop);
  const [pft, prt, pbt, plt] = topCorners(poop);
  rail(ctx, [plt!, pbt!, prt!], 16);
  rail(ctx, [plt!, pft!, prt!], 16);
  sternpost(ctx, plt!);
  sternLantern(ctx, pft!);

  // The forward cabin with both doors.
  const portU = doors.portP - SPLIT;
  const cabinU = doors.cabinQ - FWD_Q0;
  walls(ctx, cabin, teak(31), {
    left: (c, w, h, l) => {
      trim(c, w, l);
      strakes(c, w, h, l);
      latticeWindow(c, 10, h - 52, 12, 18, { frame: GILT, light: l, lit: true });
      portDoor(c, portU, h, l);
    },
    right: (c, w, h, l) => {
      trim(c, w, l);
      strakes(c, w, h, l);
      latticeWindow(c, w - 26, h - 52, 12, 18, { frame: GILT, light: l, lit: true });
      cabinDoor(c, cabinU, h, l);
    },
  });
  deckTop(ctx, cabin, 33);
  outlineBox(ctx, cabin);
  const [ft, rt, , lt] = topCorners(cabin);
  rail(ctx, [lt!, ft!, rt!], 12);

  // Lamplight spilling from the door onto the deck.
  onRightWall(ctx, cabin, (_w, h) => {
    const g = ctx.createRadialGradient(cabinU, h - 26, 2, cabinU, h - 26, 36);
    g.addColorStop(0, 'rgba(255,214,140,0.3)');
    g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g;
    ctx.fillRect(cabinU - 36, h - 62, 72, 62);
  });
  const sill = groundPoint(box, FWD_P1 + 4, doors.cabinQ);
  const pool = ctx.createRadialGradient(sill.x, sill.y, 1, sill.x, sill.y, 22);
  pool.addColorStop(0, 'rgba(255,214,140,0.42)');
  pool.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(sill.x, sill.y, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // At the foot of the side: a sweet-water jar and a coil of rope by the plank door.
  const jar = groundPoint(box, SPLIT + 14, 3);
  waterJar(ctx, jar.x, jar.y, 6, 0x9a5a34);
  const coil = groundPoint(box, doors.portP + 26, 2);
  rope(ctx, coilPath(coil.x, coil.y, 9, 4, 3), 2);
}

function teak(seed: number) {
  return (c: Ctx, w: number, h: number, light: number) => {
    planks(c, w, h, { base: TEAK, light, seed: light === 1 ? seed : seed + 1 }, false, 5);
    c.fillStyle = 'rgba(20,10,4,0.28)';
    c.fillRect(0, h - 3, w, 3);
  };
}

/** Rubbing strakes along the foot, darkened by bilge and spray. */
function strakes(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, h - 9, 4, DARK_TEAK, l);
  band(c, w, h - 20, 2.5, DARK_TEAK, l);
}

/** A carved and painted frieze under the eaves. */
function trim(c: Ctx, w: number, l: number): void {
  band(c, w, 2, 6, 0xe8dcc0, l);
  c.fillStyle = css(shade(RED, l));
  for (let u = 2; u < w; u += 8) c.fillRect(u, 3.5, 4, 3);
  c.fillStyle = css(shade(GILT, l));
  c.fillRect(0, 9, w, 1.2);
}

/** A band of carved rosettes under the stern windows, the pride of a Gulf shipwright. */
function carvedPanel(c: Ctx, x: number, y: number, w: number, l: number): void {
  c.fillStyle = css(shade(DARK_TEAK, l));
  c.fillRect(x, y, w, 10);
  for (let u = x + 6; u < x + w - 3; u += 12) {
    c.fillStyle = css(shade(GILT, l * 0.95));
    c.beginPath();
    c.arc(u, y + 5, 3.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = css(shade(RED, l));
    c.beginPath();
    c.arc(u, y + 5, 1.4, 0, Math.PI * 2);
    c.fill();
  }
}

/** Plank decking on a cabin roof. */
function deckTop(ctx: Ctx, box: IsoBox, seed: number): void {
  onRoof(ctx, box, (w, d) => {
    planks(ctx, w, d, { base: 0x8a6038, light: LIGHT.roof, seed }, true, 6);
    ctx.strokeStyle = 'rgba(20,10,4,0.35)';
    ctx.strokeRect(0.5, 0.5, w - 1, d - 1);
  });
}

/** A ship's ladder up the poop's face, from the cabin roof to the quarterdeck. */
function ladder(c: Ctx, u: number, rise: number, l: number): void {
  c.fillStyle = 'rgba(20,10,4,0.3)';
  c.fillRect(u + 2, -10, 14, rise + 10);
  c.fillStyle = css(shade(0xa87848, l));
  c.fillRect(u - 0.5, -12, 2.2, rise + 12);
  c.fillRect(u + 11, -12, 2.2, rise + 12);
  for (let v = -6; v < rise; v += 7) c.fillRect(u, v, 12, 1.6);
}

/** The carved door: a gilt frame round teak leaves, the upper panels a lattice with the lamp behind. */
function cabinDoor(c: Ctx, cx: number, h: number, l: number): void {
  const w = 24;
  const dh = 50;
  const x = cx - w / 2;
  const top = h - 4 - dh;
  // A raised coaming that keeps the sea out.
  c.fillStyle = css(shade(DARK_TEAK, l * 0.9));
  c.fillRect(x - 4, h - 4, w + 8, 4);
  c.fillStyle = css(shade(GILT, l * 0.9));
  c.fillRect(x - 3.5, top - 4, w + 7, dh + 4);
  c.fillStyle = css(shade(DARK_TEAK, l));
  c.fillRect(x, top, w, dh);
  latticeWindow(c, x + 3, top + 3, w - 6, 16, { frame: 0x5a3418, light: l, lit: true });
  c.strokeStyle = css(0x1a0f08, 0.9);
  c.lineWidth = 0.9;
  c.strokeRect(x + 3, top + 24, w / 2 - 5, 22);
  c.strokeRect(x + w / 2 + 2, top + 24, w / 2 - 5, 22);
  c.beginPath();
  c.moveTo(x + w / 2, top);
  c.lineTo(x + w / 2, h - 4);
  c.stroke();
  // A carved crest over the frame.
  c.fillStyle = css(shade(GILT, l));
  c.beginPath();
  c.moveTo(x - 4, top - 4);
  c.quadraticCurveTo(cx, top - 13, x + w + 4, top - 4);
  c.closePath();
  c.fill();
  // The lantern on its hook beside the door.
  const lx = x + w + 9;
  const ly = top + 6;
  c.fillStyle = 'rgba(255,214,140,0.35)';
  c.beginPath();
  c.arc(lx, ly + 4, 9, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#ffd98a';
  c.fillRect(lx - 3, ly, 6, 9);
  c.fillStyle = css(0x2a1a0a);
  c.fillRect(lx - 3.5, ly - 1.5, 7, 1.6);
  c.fillRect(lx - 0.5, ly - 6, 1, 4.5);
}

/** A plain plank door with a rope pull and a raised coaming: the companions' cabin. */
function portDoor(c: Ctx, cx: number, h: number, l: number): void {
  const w = 23;
  const dh = 48;
  const x = cx - w / 2;
  const top = h - 4 - dh;
  c.fillStyle = css(shade(DARK_TEAK, l * 0.9));
  c.fillRect(x - 4, h - 4, w + 8, 4);
  c.fillRect(x - 3, top - 3, w + 6, dh + 3);
  c.save();
  c.translate(x, top);
  planks(c, w, dh, { base: 0x6a4325, light: l, seed: 39 }, true, 4.6);
  c.restore();
  c.fillStyle = css(shade(0x2e2a26, l));
  c.fillRect(x, top + 9, w, 1.8);
  c.fillRect(x, top + dh - 11, w, 1.8);
  c.strokeStyle = css(shade(0xc8b48a, l));
  c.lineWidth = 1.2;
  c.beginPath();
  c.arc(x + w - 4, top + dh * 0.52, 2.4, 0, Math.PI * 2);
  c.stroke();
}

/** The tall carved sternpost rising over the aft corner of the quarterdeck. */
function sternpost(ctx: Ctx, at: { x: number; y: number }): void {
  const g = ctx.createLinearGradient(at.x - 3, 0, at.x + 3, 0);
  g.addColorStop(0, css(0xa87848));
  g.addColorStop(1, css(DARK_TEAK));
  ctx.fillStyle = g;
  ctx.fillRect(at.x - 3, at.y - 34, 6, 34);
  ctx.fillStyle = css(GILT);
  ctx.beginPath();
  ctx.arc(at.x, at.y - 37, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(RED);
  ctx.fillRect(at.x - 3, at.y - 22, 6, 3);
  ctx.fillRect(at.x - 3, at.y - 12, 6, 3);
}

/** A tall lantern on an iron crook at the forward corner of the quarterdeck. */
function sternLantern(ctx: Ctx, at: { x: number; y: number }): void {
  ctx.fillStyle = css(0x2a1a0a);
  ctx.fillRect(at.x - 1, at.y - 30, 2, 30);
  ctx.fillRect(at.x - 1, at.y - 30, 9, 1.8);
  const lx = at.x + 7;
  const ly = at.y - 26;
  const g = ctx.createRadialGradient(lx, ly + 4, 0, lx, ly + 4, 14);
  g.addColorStop(0, 'rgba(255,214,140,0.55)');
  g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(lx - 14, ly - 10, 28, 28);
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(lx - 3, ly, 6, 9);
  ctx.fillStyle = css(0x2a1a0a);
  ctx.fillRect(lx - 3.5, ly - 1.5, 7, 1.6);
  ctx.fillRect(lx - 3.5, ly + 9, 7, 1.4);
}

/** Stanchions and a capping rail along a polyline of roof corners. */
function rail(ctx: Ctx, corners: ReadonlyArray<{ x: number; y: number }>, h: number): void {
  for (let i = 0; i < corners.length - 1; i++) {
    const a = corners[i]!;
    const b = corners[i + 1]!;
    const n = Math.max(2, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 12));
    for (let k = 0; k <= n; k++) {
      const x = a.x + ((b.x - a.x) * k) / n;
      const y = a.y + ((b.y - a.y) * k) / n;
      ctx.fillStyle = css(DARK_TEAK);
      ctx.fillRect(x - 1, y - h, 2, h);
    }
    ctx.strokeStyle = css(0x3a2412);
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - h);
    ctx.lineTo(b.x, b.y - h);
    ctx.stroke();
    ctx.strokeStyle = css(0xa87440, 0.9);
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - h - 1);
    ctx.lineTo(b.x, b.y - h - 1);
    ctx.stroke();
  }
}
