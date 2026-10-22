import type Phaser from 'phaser';
import type { BuildingFront } from './buildingFronts';
import { CELL, css, groundPoint, groundShadow, paintTexture, polygon, roofPoint, shade, topCorners, type Ctx, type IsoBox } from './canvasKit';
import { glazedTiles, planks } from './materials';
import { recess } from './massing';
import { archPath, clipped, cylinder, cylinderBand, dome, LIGHT } from './ornaments';
import { laneDust, waterJar } from './streetLife';
import { subBox } from './structureParts';
import { inscriptionBand, tilePanel } from './town/monumentKit';
import { joinedMass, type MassPart } from './town/joinedMass';
import { CREAM, LAPIS, roofFloor, STONE, townMerlons, TURQUOISE } from './town/townKit';

/**
 * The Sháh's road caravanserai outside the Qur'án Gate, at true scale: 20 x
 * 16 cells (28 x 22 m), a fortified ring of travellers' rooms round an open
 * court. Blank brick outer walls 4.5 m high, round towers at the corners and
 * half-round buttresses between, and one tall tiled portal (pīshṭāq) on the
 * south face whose gate is high enough for a laden camel. The court is cut
 * into the roof so its inner arcades show.
 *
 * One texture of the whole would be 1280 px wide, so it is painted as two
 * buildings side by side: `ch2-caravanserai` (the west 12 x 16, with the
 * portal) and `ch2-caravanserai-east` (the east 8 x 16). Both paint the same
 * scene; the east half keeps only what stands inside its own volume, which
 * is always in front of the west half, so drawing it second is correct.
 *
 * The gate is centred on footprint cell x = 10 of the front row (y = 15);
 * the map's door belongs on that cell.
 */

export const SERAI = { w: 20, d: 16, westW: 12 } as const;

const BRICK = 0xc49a64;
const WALL_H = 104;
const TOWER_H = 128;
const TOWER_R = 22;
const PORTAL_H = 164;
/** The main block's inset from the footprint edges (south, other sides). */
const FRONT_INSET = 26;
const INSET = 24;
/** Depth of the range of rooms round the court. */
const RING = 96;
const GATE = { w: 46, h: 88 } as const;
/** The portal spans p 288..384, centred on footprint cell x = 10. */
const PORTAL = { p0: 288, p1: 384 } as const;
/** The portal is the serai's front on the road: its gate is the way in. */
export const CARAVANSERAI_FRONT: BuildingFront = { side: 's', door: (PORTAL.p0 + PORTAL.p1) / 2 };

const TOP_PAD = 10;
const W_PX = SERAI.w * CELL;
const D_PX = SERAI.d * CELL;
const SPLIT_P = SERAI.westW * CELL;

export function paintCaravanseraiWest(scene: Phaser.Scene, key: string): void {
  paintPart(scene, key, SPLIT_P, false);
}

export function paintCaravanseraiEast(scene: Phaser.Scene, key: string): void {
  paintPart(scene, key, W_PX, true);
}

/**
 * Paints the part whose front corner is at `frontP` along the south face.
 * The texture is centred on that corner, as every building's is.
 */
function paintPart(scene: Phaser.Scene, key: string, frontP: number, east: boolean): void {
  const partW = east ? W_PX - SPLIT_P : SPLIT_P;
  const half = Math.max(partW, D_PX);
  // The highest point is the back tower for the west part, the clip's top edge for the east.
  const rise = (frontP - (east ? SPLIT_P : INSET)) / 2 + (D_PX - INSET) / 2 + TOWER_H + 12;
  const texH = rise + TOP_PAD;
  paintTexture(scene, key, half * 2, texH, ctx => {
    // Place the whole building so that `frontP` lands on the texture's anchor.
    const full: IsoBox = { x: half + (W_PX - frontP), y: texH + (W_PX - frontP) / 2, w: W_PX, d: D_PX, h: WALL_H };
    if (east) clipToVolume(ctx, full, SPLIT_P, W_PX + 20, TOWER_H + 12);
    drawCaravanserai(ctx, full);
  });
}

/** Clips to the screen outline of the volume p0..p1 (all q), `h` high. */
function clipToVolume(ctx: Ctx, box: IsoBox, p0: number, p1: number, h: number): void {
  const g = (p: number, q: number) => groundPoint(box, p, q);
  const up = (pt: { x: number; y: number }) => ({ x: pt.x, y: pt.y - h });
  // The near corner stays on the part's own front line, so nothing of the west part's portal comes through.
  polygon(ctx, [g(p0, 0), g(p1, -60), g(p1, D_PX + 20), up(g(p1, D_PX + 20)), up(g(p0, D_PX + 20)), up(g(p0, 0))]);
  ctx.clip();
}

function drawCaravanserai(ctx: Ctx, full: IsoBox): void {
  const main = subBox(full, INSET, W_PX - INSET, FRONT_INSET, D_PX - INSET, WALL_H);
  groundShadow(ctx, main, 16, 0.3);
  laneDust(ctx, full, PORTAL.p0 + 4, PORTAL.p1 - 8, -26, FRONT_INSET, 58);
  const [front, right, back, left] = topCorners(main);
  // The back tower stands behind everything; only its upper part shows over the roof.
  tower(ctx, back!.x, back!.y + WALL_H, TOWER_R, TOWER_H);
  const range: MassPart = {
    p0: INSET, p1: W_PX - INSET, q0: FRONT_INSET, q1: D_PX - INSET, h: WALL_H,
    spec: {
      wall: BRICK, seed: 51, material: 'brick', coping: shade(BRICK, 1.12),
      left: (c, w, h, l) => outerWall(c, w, h, l, 0),
      right: (c, w, h, l) => outerWall(c, w, h, l, 1),
    },
  };
  const gate = portalPart();
  joinedMass(ctx, full, [range], [gate]);
  court(ctx, main);
  roofVaults(ctx, main);
  townMerlons(ctx, main, BRICK, 8, 8, 10);
  for (const corner of [left!, right!]) tower(ctx, corner.x, corner.y + WALL_H, TOWER_R, TOWER_H);
  // Half-round buttresses along the two outer faces the road sees.
  for (const p of [140, 520]) buttress(ctx, groundPoint(main, p - INSET, 0));
  for (const q of [150, 330]) buttress(ctx, groundPoint(main, main.w, q));
  tower(ctx, front!.x, front!.y + WALL_H, TOWER_R, TOWER_H);
  joinedMass(ctx, full, [gate], [range]);
  townMerlons(ctx, subBox(full, gate.p0, gate.p1, gate.q0, gate.q1, PORTAL_H), BRICK, 7, 7, 9);
  // A trough and water jars beside the gate for the caravans.
  for (const [p, q, r, color] of [[PORTAL.p0 - 22, -6, 10, 0xa8603a], [PORTAL.p0 - 40, -2, 8, 0x9a6a44], [PORTAL.p1 + 30, 8, 9, 0xa8603a]] as const) {
    const at = groundPoint(full, p, q);
    waterJar(ctx, at.x, at.y, r, color);
  }
}

/** The rooms' vaults show on the roof as rows of low mud domes, one to a room. */
function roofVaults(ctx: Ctx, main: IsoBox): void {
  const mid = RING / 2;
  const spots: Array<{ x: number; y: number }> = [];
  for (let p = mid; p <= main.w - mid; p += 48) {
    spots.push(roofFloor(main, p, mid), roofFloor(main, p, main.d - mid));
  }
  for (let q = RING + 24; q <= main.d - RING - 24; q += 48) {
    spots.push(roofFloor(main, mid, q), roofFloor(main, main.w - mid, q));
  }
  spots.sort((a, b) => a.y - b.y);
  for (const at of spots) dome(ctx, at.x, at.y, 13, { color: 0xb08a62, bulb: 0.55 });
}

/** Blank defensive walls: a tiled string course, slit windows high up, rain streaks under the spouts. */
function outerWall(c: Ctx, w: number, h: number, l: number, seed: number): void {
  clipped(c, w, h, () => {
    for (let u = 40 + seed * 17; u < w - 20; u += 96) {
      const g = c.createLinearGradient(0, 14, 0, 70);
      g.addColorStop(0, 'rgba(50,30,14,0.28)');
      g.addColorStop(1, 'rgba(50,30,14,0)');
      c.fillStyle = g;
      c.fillRect(u, 14, 5, 56);
    }
  });
  c.fillStyle = css(shade(TURQUOISE, l));
  c.fillRect(0, 18, w, 3);
  for (let u = 70 + seed * 23; u < w - 40; u += 74) {
    c.fillStyle = css(shade(0x1a100a, l + 0.2));
    c.fillRect(u, 30, 4, 16);
    c.fillStyle = 'rgba(255,240,210,0.2)';
    c.fillRect(u + 4, 30, 0.8, 16);
  }
}

/** A round tower in brick with a tile ring and a crown of merlons. */
function tower(ctx: Ctx, x: number, baseY: number, r: number, h: number): void {
  cylinder(ctx, x, baseY, r, h, BRICK, true);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - r, baseY - h, r * 2, h + r);
  ctx.clip();
  ctx.fillStyle = 'rgba(40,24,10,0.14)';
  for (let k = 6; k < h; k += 4) ctx.fillRect(x - r, baseY - k, r * 2, 0.6);
  ctx.restore();
  cylinderBand(ctx, x, baseY - 10, r, 6, STONE);
  cylinderBand(ctx, x, baseY - h + 14, r, 3.5, TURQUOISE);
  for (const dx of [-0.45, 0.1]) {
    ctx.fillStyle = 'rgba(16,10,4,0.8)';
    ctx.fillRect(x + dx * r - 1.5, baseY - h + 26, 3, 12);
  }
  for (let a = -0.9; a <= 0.91; a += 0.36) {
    const mx = x + Math.sin(a) * r * 0.9;
    const my = baseY - h + Math.cos(a) * r * 0.4;
    ctx.fillStyle = css(shade(BRICK, 1.12 - a * 0.35));
    ctx.beginPath();
    ctx.moveTo(mx - 3.5, my);
    ctx.lineTo(mx - 3.5, my - 7);
    ctx.quadraticCurveTo(mx, my - 11, mx + 3.5, my - 7);
    ctx.lineTo(mx + 3.5, my);
    ctx.closePath();
    ctx.fill();
  }
}

/** A half-round buttress against an outer wall, a little higher than the wall. */
function buttress(ctx: Ctx, at: { x: number; y: number }): void {
  cylinder(ctx, at.x, at.y, 13, WALL_H + 6, BRICK, true);
  cylinderBand(ctx, at.x, at.y - 10, 13, 6, STONE);
  cylinderBand(ctx, at.x, at.y - WALL_H + 22, 13, 3, TURQUOISE);
}

/**
 * The open court seen over the parapet: the far inner walls with their
 * rooms' arched bays, and the beaten-earth floor with its pool. The floor
 * lies a storey below the roof.
 */
function court(ctx: Ctx, main: IsoBox): void {
  const p0 = RING;
  const p1 = main.w - RING;
  const q0 = RING;
  const q1 = main.d - RING;
  const sink = WALL_H - 10;
  const at = (p: number, q: number) => roofPoint(main, p, q);
  const down = (p: number, q: number) => ({ x: at(p, q).x, y: at(p, q).y + sink });
  ctx.save();
  polygon(ctx, [at(p0, q0), at(p1, q0), at(p1, q1), at(p0, q1)]);
  ctx.clip();
  polygon(ctx, [down(p0, q0), down(p1, q0), down(p1, q1), down(p0, q1)]);
  ctx.fillStyle = css(0x9a7c56);
  ctx.fill();
  // The raised pool in the middle, its water holding the sky.
  const pm = (p0 + p1) / 2;
  const qm = (q0 + q1) / 2;
  polygon(ctx, [down(pm - 40, qm - 30), down(pm + 40, qm - 30), down(pm + 40, qm + 30), down(pm - 40, qm + 30)]);
  ctx.fillStyle = css(0x9a8a70);
  ctx.fill();
  polygon(ctx, [down(pm - 34, qm - 24), down(pm + 34, qm - 24), down(pm + 34, qm + 24), down(pm - 34, qm + 24)]);
  ctx.fillStyle = css(0x4a6a7a);
  ctx.fill();
  // The far range, facing the viewer like a left wall, then the one in shade like a right wall.
  const far = down(p0, q1);
  ctx.save();
  ctx.transform(1, 0.5, 0, 1, far.x, far.y - sink);
  innerArcade(ctx, p1 - p0, sink, LIGHT.left);
  ctx.restore();
  const side = down(p0, q0);
  ctx.save();
  ctx.transform(1, -0.5, 0, 1, side.x, side.y - sink);
  innerArcade(ctx, q1 - q0, sink, LIGHT.right);
  ctx.restore();
  ctx.restore();
}

/** The rooms round the court: an arched bay every 48 px, a door at the back of each, a platform before them. */
function innerArcade(c: Ctx, w: number, h: number, l: number): void {
  clipped(c, w, h, () => {
    c.fillStyle = css(shade(BRICK, l * 0.92));
    c.fillRect(0, 0, w, h);
  });
  c.fillStyle = css(shade(STONE, l));
  c.fillRect(0, h - 10, w, 10);
  for (let u = 24, i = 0; u + 16 <= w; u += 48, i++) {
    recess(c, u - 16, h - 10, 32, 64, BRICK, l);
    archPath(c, u - 10, h - 10, 20, 44);
    c.fillStyle = i % 3 === 1 ? '#e0a860' : css(0x1a100a);
    c.fill();
  }
  c.fillStyle = 'rgba(20,10,4,0.3)';
  c.fillRect(0, 0, w, 4);
}

/**
 * The pīshṭāq: a tiled frame standing proud of the south wall and higher
 * than it, built into the range (one mass with it, no seam), with a deep
 * iwan whose gate leaves stand open on the court.
 */
function portalPart(): MassPart {
  return {
    p0: PORTAL.p0, p1: PORTAL.p1, q0: 0, q1: FRONT_INSET, h: PORTAL_H,
    spec: {
      wall: BRICK, seed: 56, material: 'brick', roof: 'flat', coping: CREAM, plinth: true,
      left: (c, w, h, l) => {
        tilePanel(c, 4, 6, w - 8, h - 6, LAPIS, l, 57, 6);
        c.save();
        c.translate(8, 0);
        inscriptionBand(c, w - 16, 14, 10, l);
        c.restore();
        gateIwan(c, w / 2, h, l);
      },
      right: (c, w, h, l) => {
        tilePanel(c, 3, 6, w - 6, h - 40, TURQUOISE, l, 58, 5);
        c.fillStyle = css(shade(0x1a100a, l + 0.2));
        c.fillRect(w / 2 - 2, 50, 4, 14);
      },
    },
  };
}

/** The vault of the portal and the gate at its back: 2 m wide, nearly 4 m high, both leaves open. */
function gateIwan(c: Ctx, cx: number, base: number, l: number): void {
  const aw = 68;
  const ah = 124;
  archPath(c, cx - aw / 2 - 4, base, aw + 8, ah + 4);
  c.fillStyle = css(shade(CREAM, l));
  c.fill();
  archPath(c, cx - aw / 2, base, aw, ah);
  const vault = c.createLinearGradient(0, base - ah, 0, base);
  vault.addColorStop(0, css(shade(BRICK, l * 0.3)));
  vault.addColorStop(1, css(shade(BRICK, l * 0.55)));
  c.fillStyle = vault;
  c.fill();
  // The court beyond, bright with morning.
  const gx = cx - GATE.w / 2;
  archPath(c, gx, base - 2, GATE.w, GATE.h);
  const sky = c.createLinearGradient(0, base - GATE.h, 0, base);
  sky.addColorStop(0, '#f0d0a0');
  sky.addColorStop(1, '#b89466');
  c.fillStyle = sky;
  c.fill();
  // A traveller's lamp still burning in the passage, and the leaves folded back.
  c.fillStyle = 'rgba(255,214,140,0.35)';
  c.fillRect(cx - 2, base - GATE.h + 14, 4, 6);
  for (const side of [-1, 1]) {
    const lx = side < 0 ? gx - 9 : gx + GATE.w - 1;
    c.save();
    c.beginPath();
    c.rect(lx, base - GATE.h + 8, 10, GATE.h - 10);
    c.clip();
    planks(c, lx + 10, base, { base: 0x5a3a20, light: l * (side < 0 ? 0.7 : 0.95), seed: 59 }, true, 3);
    c.fillStyle = css(shade(0xb0a080, l), 0.8);
    for (let v = base - GATE.h + 14; v < base - 4; v += 9) c.fillRect(lx + 2, v, 1.5, 1.5);
    c.restore();
  }
  // The worn sill, and a strip of glazed tile over the arch.
  c.fillStyle = css(shade(STONE, l));
  c.fillRect(cx - aw / 2 - 2, base - 3, aw + 4, 3);
  glazedTilesStrip(c, cx, base - ah - 18, aw + 20, l);
}

/** A strip of glazed tile above the arch. */
function glazedTilesStrip(c: Ctx, cx: number, y: number, w: number, l: number): void {
  c.save();
  c.beginPath();
  c.rect(cx - w / 2, y, w, 10);
  c.clip();
  c.translate(cx - w / 2, y);
  glazedTiles(c, w, 10, { base: TURQUOISE, light: l, seed: 60 }, 5);
  c.restore();
}
