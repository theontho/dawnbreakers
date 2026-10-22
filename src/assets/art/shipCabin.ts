import { css, groundPoint, onRightWall, onRoof, outlineBox, shade, topCorners, type Ctx, type IsoBox } from './canvasKit';
import { coilPath, rope } from './cordage';
import { ellipseShadow } from './fieldKit';
import { planks } from './materials';
import { band, latticeWindow, LIGHT, walls } from './ornaments';
import { subBox } from './structureParts';
import { waterJar } from './streetLife';

/**
 * The stern deckhouse of the pilgrim baghla: a lower forward cabin with
 * the lamplit door, and behind it the taller poop cabin whose roof is the
 * quarterdeck, reached by a ladder. Both are set in from the deck's edges
 * so there is room at their feet for a sea chest, a jar and a coil of rope.
 */

const TEAK = 0x7a4f2c;
const DARK_TEAK = 0x4a2e18;
const GILT = 0xc9a55c;
const LOW = 58;
const HIGH = 76;
/** Centre of the port-side door along the cabin's length: the middle deck cell. */
const PORT_DOOR_P = 48;

/** `box` is the whole footprint; the door faces +x, centred on deck cell `doorQ` pixels back from the front. */
export function drawCabin(ctx: Ctx, box: IsoBox, doorQ = 50): void {
  ellipseShadow(ctx, box.x - 4, box.y - box.w / 2 + 4, box.w * 0.95, box.w * 0.4, 0.24);
  const split = box.d * 0.56;
  const poop = subBox(box, 4, box.w - 10, split, box.d - 3, HIGH);
  const cabin = subBox(box, 2, box.w - 8, 9, split, LOW);

  // The poop: the stern windows look out to the side, the rest is in the cabin's lee.
  walls(ctx, poop, teak(41), {
    left: (c, w, _h, l) => {
      trim(c, w, l);
      ladder(c, w * 0.62, HIGH - LOW, l);
    },
    right: (c, w, h, l) => {
      trim(c, w, l);
      for (const t of [0.3, 0.68]) latticeWindow(c, w * t - 4, h - 40, 8, 11, { frame: GILT, light: l, lit: true });
    },
  });
  deckTop(ctx, poop, 43);
  outlineBox(ctx, poop);
  const [pft, prt, pbt, plt] = topCorners(poop);
  rail(ctx, [plt!, pbt!, prt!], 9);
  rail(ctx, [plt!, pft!, prt!], 9);
  sternLantern(ctx, prt!);

  // The forward cabin with the door.
  const doorU = doorQ - 9;
  walls(ctx, cabin, teak(31), {
    left: (c, w, h, l) => {
      trim(c, w, l);
      for (const u of [11, 68]) latticeWindow(c, u, h - 38, 8, 11, { frame: GILT, light: l, lit: true });
      // The companions' door, on the middle cell of the port side.
      portDoor(c, PORT_DOOR_P - 2, h, l);
    },
    right: (c, w, h, l) => {
      trim(c, w, l);
      latticeWindow(c, w * 0.12, h - 38, 8, 11, { frame: GILT, light: l, lit: true });
      cabinDoor(c, doorU, h, l);
    },
  });
  deckTop(ctx, cabin, 33);
  outlineBox(ctx, cabin);
  const [ft, rt, , lt] = topCorners(cabin);
  rail(ctx, [lt!, ft!, rt!], 7);

  // Lamplight spilling from the door onto the deck.
  onRightWall(ctx, cabin, (_w, h) => {
    const g = ctx.createRadialGradient(doorU, h - 18, 2, doorU, h - 18, 26);
    g.addColorStop(0, 'rgba(255,214,140,0.32)');
    g.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = g;
    ctx.fillRect(doorU - 26, h - 44, 52, 44);
  });
  const sill = groundPoint(box, box.w - 2, doorQ);
  const pool = ctx.createRadialGradient(sill.x, sill.y, 1, sill.x, sill.y, 16);
  pool.addColorStop(0, 'rgba(255,214,140,0.42)');
  pool.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = pool;
  ctx.beginPath();
  ctx.ellipse(sill.x, sill.y, 16, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Life at the foot: a sea chest under the windows, a sweet-water jar, a coil of rope by the door.
  const chest = subBox(box, 4, 26, 1, 8, 9);
  walls(ctx, chest, (c, w, h, light) => {
    planks(c, w, h, { base: 0x5a3a1f, light, seed: 37 }, false, 3);
    c.fillStyle = css(shade(0x2e2a26, light));
    c.fillRect(0, 2, w, 1);
    c.fillRect(w / 2 - 1, 3, 2, 3);
  });
  onRoof(ctx, chest, (w, d) => {
    ctx.fillStyle = css(shade(0x6a4525, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
  });
  outlineBox(ctx, chest);
  const jar = groundPoint(box, 66, 3);
  waterJar(ctx, jar.x, jar.y, 4.5, 0x9a5a34);
  const coil = groundPoint(box, box.w - 3, doorQ + 22);
  rope(ctx, coilPath(coil.x, coil.y, 7, 3.2, 3), 1.6);
}

function teak(seed: number) {
  return (c: Ctx, w: number, h: number, light: number) => {
    planks(c, w, h, { base: TEAK, light, seed: light === 1 ? seed : seed + 1 }, false, 4);
    // A rubbing strake along the foot, darkened by bilge and spray.
    band(c, w, h - 5, 3, DARK_TEAK, light);
    c.fillStyle = 'rgba(20,10,4,0.25)';
    c.fillRect(0, h - 2, w, 2);
  };
}

/** A carved and painted frieze under the eaves. */
function trim(c: Ctx, w: number, l: number): void {
  band(c, w, 2, 4, 0xe8dcc0, l);
  c.fillStyle = css(shade(0xa83a2a, l));
  for (let u = 2; u < w; u += 6) c.fillRect(u, 3, 3, 2);
}

/** Plank decking on a cabin roof. */
function deckTop(ctx: Ctx, box: IsoBox, seed: number): void {
  onRoof(ctx, box, (w, d) => {
    planks(ctx, w, d, { base: 0x8a6038, light: LIGHT.roof, seed }, true, 5);
    ctx.strokeStyle = 'rgba(20,10,4,0.35)';
    ctx.strokeRect(0.5, 0.5, w - 1, d - 1);
  });
}

/** A ship's ladder up the poop's face, from the cabin roof to the quarterdeck. */
function ladder(c: Ctx, u: number, rise: number, l: number): void {
  c.fillStyle = 'rgba(20,10,4,0.3)';
  c.fillRect(u + 1, -6, 9, rise + 6);
  c.fillStyle = css(shade(0xa87848, l));
  c.fillRect(u - 0.5, -7, 1.6, rise + 7);
  c.fillRect(u + 7, -7, 1.6, rise + 7);
  for (let v = -3; v < rise; v += 4) c.fillRect(u, v, 8, 1.1);
}

/** The carved door: a gilt frame round teak leaves, the upper panels a lattice with the lamp behind. */
function cabinDoor(c: Ctx, cx: number, h: number, l: number): void {
  const w = 14;
  const dh = 36;
  const x = cx - w / 2;
  const top = h - 3 - dh;
  // A raised step-board (the coaming that keeps the sea out).
  c.fillStyle = css(shade(DARK_TEAK, l * 0.9));
  c.fillRect(x - 3, h - 3, w + 6, 3);
  c.fillStyle = css(shade(GILT, l * 0.9));
  c.fillRect(x - 2.5, top - 3, w + 5, dh + 3);
  c.fillStyle = css(shade(DARK_TEAK, l));
  c.fillRect(x, top, w, dh);
  latticeWindow(c, x + 2, top + 2, w - 4, 12, { frame: 0x5a3418, light: l, lit: true });
  c.strokeStyle = css(0x1a0f08, 0.9);
  c.lineWidth = 0.8;
  c.strokeRect(x + 2, top + 18, w / 2 - 3, 14);
  c.strokeRect(x + w / 2 + 1, top + 18, w / 2 - 3, 14);
  c.beginPath();
  c.moveTo(x + w / 2, top);
  c.lineTo(x + w / 2, h - 3);
  c.stroke();
  // A carved crest over the frame.
  c.fillStyle = css(shade(GILT, l));
  c.beginPath();
  c.moveTo(x - 3, top - 3);
  c.quadraticCurveTo(cx, top - 9, x + w + 3, top - 3);
  c.closePath();
  c.fill();
  // The lantern on its hook beside the door.
  const lx = x + w + 6;
  const ly = top + 4;
  c.fillStyle = 'rgba(255,214,140,0.35)';
  c.beginPath();
  c.arc(lx, ly + 3, 6, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#ffd98a';
  c.fillRect(lx - 2, ly, 4, 6);
  c.fillStyle = css(0x2a1a0a);
  c.fillRect(lx - 2.5, ly - 1, 5, 1.2);
  c.fillRect(lx - 0.4, ly - 4, 0.8, 3);
}

/** A plain plank door with a rope pull and a raised coaming: the companions' cabin. */
function portDoor(c: Ctx, cx: number, h: number, l: number): void {
  const w = 13;
  const dh = 35;
  const x = cx - w / 2;
  const top = h - 3 - dh;
  c.fillStyle = css(shade(DARK_TEAK, l * 0.9));
  c.fillRect(x - 3, h - 3, w + 6, 3);
  c.fillRect(x - 2, top - 2, w + 4, dh + 2);
  c.save();
  c.translate(x, top);
  planks(c, w, dh, { base: 0x6a4325, light: l, seed: 39 }, true, 3.2);
  c.restore();
  c.fillStyle = css(shade(0x2e2a26, l));
  c.fillRect(x, top + 7, w, 1.4);
  c.fillRect(x, top + dh - 8, w, 1.4);
  c.strokeStyle = css(shade(0xc8b48a, l));
  c.lineWidth = 1;
  c.beginPath();
  c.arc(x + w - 3, top + dh * 0.5, 1.8, 0, Math.PI * 2);
  c.stroke();
}

/** A tall lantern on an iron crook at the stern corner of the quarterdeck. */
function sternLantern(ctx: Ctx, at: { x: number; y: number }): void {
  ctx.fillStyle = css(0x2a1a0a);
  ctx.fillRect(at.x - 0.8, at.y - 22, 1.6, 22);
  ctx.fillRect(at.x - 0.8, at.y - 22, 6, 1.4);
  const lx = at.x + 4.5;
  const ly = at.y - 19;
  const g = ctx.createRadialGradient(lx, ly + 3, 0, lx, ly + 3, 10);
  g.addColorStop(0, 'rgba(255,214,140,0.55)');
  g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(lx - 10, ly - 7, 20, 20);
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(lx - 2, ly, 4, 6);
  ctx.fillStyle = css(0x2a1a0a);
  ctx.fillRect(lx - 2.5, ly - 1, 5, 1.2);
  ctx.fillRect(lx - 2.5, ly + 6, 5, 1);
}

/** Stanchions and a capping rail along a polyline of roof corners. */
function rail(ctx: Ctx, corners: ReadonlyArray<{ x: number; y: number }>, h: number): void {
  for (let i = 0; i < corners.length - 1; i++) {
    const a = corners[i]!;
    const b = corners[i + 1]!;
    const n = Math.max(2, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 10));
    for (let k = 0; k <= n; k++) {
      const x = a.x + ((b.x - a.x) * k) / n;
      const y = a.y + ((b.y - a.y) * k) / n;
      ctx.fillStyle = css(DARK_TEAK);
      ctx.fillRect(x - 0.8, y - h, 1.6, h);
    }
    ctx.strokeStyle = css(0x3a2412);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - h);
    ctx.lineTo(b.x, b.y - h);
    ctx.stroke();
    ctx.strokeStyle = css(0xa87440, 0.9);
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y - h - 0.8);
    ctx.lineTo(b.x, b.y - h - 0.8);
    ctx.stroke();
  }
}
