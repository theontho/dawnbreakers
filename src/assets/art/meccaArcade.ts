import type Phaser from 'phaser';
import { baseCorners, css, footprintBox, groundShadow, onLeftWall, onRightWall, onRoof, paintTexture, roofPoint, shade, topCorners, type Ctx, type IsoBox } from './canvasKit';
import { stone } from './materials';
import { archPath, band, cylinder, dome, flatTop, LIGHT, walls } from './ornaments';
import { subBox } from './structureParts';
import { SIDE_E, SIDE_N, SIDE_S, SIDE_W } from './town/joinedMass';

/**
 * The Ottoman colonnade of the Sacred Mosque and its minarets, at true
 * scale (a cell is 1.4 m, a person 40 px). Each bay of the colonnade is a
 * 3 x 3 cell canopy, about 4.2 m square and 8 m to the cornice: slender
 * marble columns at its corners, a pointed arch of striped voussoirs on
 * every side, and a small whitewashed dome on top. The arches are open, so
 * the court and the people in it show through the colonnade.
 */

const LIMESTONE = 0xd8c7a0;
const MARBLE = 0xe4e0d6;
const WHITEWASH = 0xece8dc;
const GOLD = 0xc9a55c;
const RED_STONE = 0x9a5a3a;
const FLOOR_H = 6;
/** Column zone on each side of an arch. */
const PIER = 9;

/** Height of a colonnade bay's walls, to the cornice. */
export const ARCADE_H = 190;
const EDGE = 0x4a3a24;

/**
 * The colonnade is laid bay by bay (and a minaret at each corner), but it is
 * one building: `mask` names the sides (N, E, S, W on the map, see
 * joinedBuildings) where the next bay or minaret carries it on, and there
 * the roof runs through with no rim or outline at the seam.
 */
export function paintArcadeBay(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, mask = 0): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, ARCADE_H, 66);
  paintTexture(scene, key, texW, texH, ctx => drawArcadeBay(ctx, box, mask));
}

export function paintMinaret(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, mask = 0): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, ARCADE_H, 272);
  paintTexture(scene, key, texW, texH, ctx => drawMinaret(ctx, box, mask));
}

/** A flat roof whose pale rim runs only along the sides nothing continues. */
function openTop(ctx: Ctx, box: IsoBox, color: number, mask: number): void {
  onRoof(ctx, box, (w, d) => {
    ctx.fillStyle = css(shade(color, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.strokeStyle = css(shade(color, 1.35), 0.5);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    if (!(mask & SIDE_W)) ctx.rect(0.5, 0.5, 0, d - 1);
    if (!(mask & SIDE_E)) ctx.rect(w - 0.5, 0.5, 0, d - 1);
    if (!(mask & SIDE_S)) ctx.rect(0.5, 0.5, w - 1, 0);
    if (!(mask & SIDE_N)) ctx.rect(0.5, d - 0.5, w - 1, 0);
    ctx.stroke();
  });
}

/** `outlineBox` without the edges and arrises that a joined neighbour carries on. */
function outlineOpen(ctx: Ctx, box: IsoBox, mask: number): void {
  const [f, r, , l] = baseCorners(box);
  const [ft, rt, bt, lt] = topCorners(box);
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  };
  ctx.save();
  ctx.strokeStyle = css(EDGE, 0.85);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  if (!(mask & SIDE_S)) seg(l!, f!);
  if (!(mask & SIDE_E)) seg(f!, r!);
  if (!(mask & (SIDE_E | SIDE_N))) seg(r!, rt!);
  if (!(mask & SIDE_N)) seg(rt!, bt!);
  if (!(mask & SIDE_W)) seg(bt!, lt!);
  if (!(mask & (SIDE_W | SIDE_S))) seg(lt!, l!);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,240,210,0.35)';
  ctx.beginPath();
  if (!(mask & (SIDE_E | SIDE_S))) seg({ x: f!.x, y: f!.y - 1 }, { x: ft!.x, y: ft!.y + 1 });
  if (!(mask & SIDE_S)) seg({ x: lt!.x + 1, y: lt!.y }, ft!);
  ctx.stroke();
  ctx.restore();
}

/**
 * The opening of a bay's arch in face space, added to the current path (so
 * it can be cut out of the wall round it), springing at v = 78.
 */
function arch(c: Ctx, w: number, h: number, close = true): void {
  const x = PIER;
  const width = w - PIER * 2;
  const base = h - FLOOR_H;
  const apex = 30;
  const spring = apex + width * 0.62;
  const cx = x + width / 2;
  c.moveTo(x, base);
  c.lineTo(x, spring);
  c.bezierCurveTo(x, spring - width * 0.34, cx - width * 0.2, apex + width * 0.14, cx, apex);
  c.bezierCurveTo(cx + width * 0.2, apex + width * 0.14, x + width, spring - width * 0.34, x + width, spring);
  c.lineTo(x + width, base);
  if (close) c.closePath();
}

/**
 * One face of a bay: the stone round the arch (the opening left clear),
 * the striped voussoirs, the columns and the cornice. `inner` is the far
 * face seen through the opening, darker in the shade of the dome.
 */
function bayFace(c: Ctx, w: number, h: number, l: number, inner: boolean, seed: number): void {
  const light = inner ? l * 0.62 : l;
  c.save();
  c.beginPath();
  c.rect(0, 0, w, h - FLOOR_H);
  arch(c, w, h);
  c.clip('evenodd');
  stone(c, w, h, { base: LIMESTONE, light, seed }, 8);
  c.restore();
  // Ablaq voussoirs: alternating pale and red stones round the arch.
  c.beginPath();
  arch(c, w, h, false);
  c.lineWidth = 4;
  c.strokeStyle = css(shade(0xefe6cf, light));
  c.stroke();
  c.setLineDash([4, 4]);
  c.strokeStyle = css(shade(RED_STONE, light));
  c.stroke();
  c.setLineDash([]);
  // Slender marble columns under the springing, with capitals and bases.
  const spring = 78;
  for (const x of [1.5, w - PIER + 1.5]) {
    c.fillStyle = css(shade(MARBLE, light));
    c.fillRect(x, spring, 6, h - FLOOR_H - spring);
    c.fillStyle = css(shade(0xffffff, light), 0.35);
    c.fillRect(x + 1, spring, 1.4, h - FLOOR_H - spring);
    c.fillStyle = css(shade(LIMESTONE, light * 0.82));
    c.fillRect(x - 1.5, spring - 4, 9, 5);
    c.fillRect(x - 1.5, h - FLOOR_H - 5, 9, 5);
  }
  // The cornice, and a painted band under it.
  band(c, w, 0, 6, shade(LIMESTONE, 0.9), light);
  c.fillStyle = css(shade(RED_STONE, light), 0.7);
  for (let u = 4; u < w; u += 12) c.fillRect(u, 9, 6, 2);
  if (!inner) {
    // A glass lamp on a chain in the arch, lit for the evening.
    const cx = w / 2;
    c.strokeStyle = css(0x3a3026, 0.8);
    c.lineWidth = 0.8;
    c.beginPath();
    c.moveTo(cx, 34);
    c.lineTo(cx, 70);
    c.stroke();
    const g = c.createRadialGradient(cx, 76, 1, cx, 76, 14);
    g.addColorStop(0, 'rgba(255,224,150,0.75)');
    g.addColorStop(1, 'rgba(255,224,150,0)');
    c.fillStyle = g;
    c.fillRect(cx - 14, 62, 28, 28);
    c.fillStyle = '#ffe6a8';
    c.beginPath();
    c.moveTo(cx - 4, 70);
    c.lineTo(cx + 4, 70);
    c.quadraticCurveTo(cx + 5, 78, cx, 82);
    c.quadraticCurveTo(cx - 5, 78, cx - 4, 70);
    c.fill();
  }
}

/** One domed bay of the colonnade, filling its footprint. */
function drawArcadeBay(ctx: Ctx, box: IsoBox, mask: number): void {
  groundShadow(ctx, box, 6, 0.2);
  // The raised marble floor.
  const floor = subBox(box, 0, box.w, 0, box.d, FLOOR_H);
  walls(ctx, floor, (c, w, h, l) => stone(c, w, h, { base: MARBLE, light: l * 0.92, seed: 17 }, 3));
  flatTop(ctx, floor, 0x8a8274);
  // The shade of the dome over the floor, deepest at the back.
  onRoof(ctx, floor, (w, d) => {
    const g = ctx.createLinearGradient(0, d, w, 0);
    g.addColorStop(0, 'rgba(20,14,8,0.45)');
    g.addColorStop(1, 'rgba(20,14,8,0.05)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, d);
    ctx.strokeStyle = 'rgba(230,224,210,0.18)';
    ctx.lineWidth = 0.8;
    for (let k = 16; k < w; k += 16) {
      ctx.beginPath();
      ctx.moveTo(k, 0);
      ctx.lineTo(k, d);
      ctx.moveTo(0, k);
      ctx.lineTo(w, k);
      ctx.stroke();
    }
  });
  // The far arches, seen through the near ones.
  const back = subBox(box, 0, box.w, box.d - 2, box.d, box.h);
  onLeftWall(ctx, back, (w, h) => bayFace(ctx, w, h, LIGHT.left, true, 7));
  const side = subBox(box, 0, 2, 0, box.d, box.h);
  onRightWall(ctx, side, (w, h) => bayFace(ctx, w, h, LIGHT.right, true, 8));
  // The near arches.
  onLeftWall(ctx, box, (w, h) => bayFace(ctx, w, h, LIGHT.left, false, 9));
  onRightWall(ctx, box, (w, h) => bayFace(ctx, w, h, LIGHT.right, false, 10));
  openTop(ctx, box, WHITEWASH, mask);
  outlineOpen(ctx, box, mask);
  const top = roofPoint(box, box.w / 2, box.d / 2);
  dome(ctx, top.x, top.y + 2, box.w * 0.34, { color: WHITEWASH, drum: 8, drumColor: LIMESTONE, bulb: 0.95, finial: true });
}

/**
 * An Ottoman minaret on a 3 x 3 footprint, about 20 m: a square stone base
 * filling the corner of the colonnade up to its cornice, a tall round shaft
 * banded in red stone with two corbelled balconies for the call to prayer,
 * and a lead-grey spire.
 */
function drawMinaret(ctx: Ctx, box: IsoBox, mask: number): void {
  const base = box;
  groundShadow(ctx, base, 12, 0.3);
  const face = (c: Ctx, w: number, h: number, l: number): void => {
    archPath(c, w / 2 - 12, h, 24, 52);
    c.fillStyle = css(shade(0x3a2e22, l));
    c.fill();
    for (const y of [h - 100, 40]) {
      archPath(c, w / 2 - 6, y + 18, 12, 18);
      c.fillStyle = css(shade(0x2a2018, l));
      c.fill();
    }
    band(c, w, 0, 6, shade(LIMESTONE, 0.9), l);
  };
  walls(ctx, base, (c, w, h, light) => stone(c, w, h, { base: LIMESTONE, light, seed: 9 }, 8), { left: face, right: face });
  openTop(ctx, base, LIMESTONE, mask);
  outlineOpen(ctx, base, mask);
  const cx = roofPoint(base, base.w / 2, base.d / 2).x;
  let y = roofPoint(base, base.w / 2, base.d / 2).y;
  const stage = (r: number, h: number): void => {
    cylinder(ctx, cx, y, r, h, LIMESTONE, false);
    for (let k = 18; k < h - 6; k += 22) {
      ctx.strokeStyle = css(RED_STONE, 0.55);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, y - k, r, r * 0.45, 0, 0, Math.PI);
      ctx.stroke();
    }
    y -= h;
    // A corbelled balcony with a pierced railing.
    cylinder(ctx, cx, y + 6, r + 7, 6, shade(LIMESTONE, 0.88), true);
    ctx.strokeStyle = css(0x6a5a3a, 0.9);
    ctx.lineWidth = 0.9;
    for (let a = 0.12; a < Math.PI; a += 0.22) {
      const x = cx + Math.cos(a) * (r + 6.5);
      const yy = y + Math.sin(a) * (r + 6.5) * 0.45;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x, yy - 8);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(cx, y - 8, r + 6.5, (r + 6.5) * 0.45, 0, 0, Math.PI);
    ctx.stroke();
  };
  stage(19, 170);
  stage(15, 60);
  cylinder(ctx, cx, y, 11, 16, LIMESTONE, false);
  y -= 16;
  // The spire and its crescent.
  const spire = ctx.createLinearGradient(cx - 11, 0, cx + 11, 0);
  spire.addColorStop(0, css(0xd8dcdc));
  spire.addColorStop(1, css(0x6a7070));
  ctx.fillStyle = spire;
  ctx.beginPath();
  ctx.moveTo(cx - 11.5, y);
  ctx.lineTo(cx, y - 56);
  ctx.lineTo(cx + 11.5, y);
  ctx.ellipse(cx, y, 11.5, 5, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = css(GOLD);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx, y - 56);
  ctx.lineTo(cx, y - 62);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, y - 66, 3.5, Math.PI * 0.35, Math.PI * 1.65);
  ctx.stroke();
}
