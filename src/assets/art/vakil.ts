import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, onRoof, outlineBox, paintTexture, roofPoint, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { stone } from './materials';
import { recess } from './massing';
import { flatTop, LIGHT, walls, type FacePainter } from './ornaments';
import { subBox } from './structureParts';
import { continuations, joinedMass, type MassPart } from './town/joinedMass';
import { inscriptionBand } from './town/monumentKit';

/**
 * The Vakíl Mosque of Shíráz at true scale, built by Karím Khán Zand: yellow
 * brick, bays framed in haft-rang tile (a warm yellow ground strewn with
 * pink Zand roses and blue scrolls), shallow brick saucer domes, and the
 * minbar of fourteen steps cut from a single block of pale marble.
 */

export const VAKIL_BRICK = 0xc8a070;
export const VAKIL_MARBLE = 0xd0d4c2;
const HAFT = 0xd8b058;
const LAPIS = 0x24477a;
const ROSE = 0xd86a8a;
const LEAF = 0x3f7a4a;
const CREAM = 0xf0e6cc;

/** Height of the court arcades: one tall storey of arches under a tiled frieze (about 5 m). */
export const ARCADE_H = 118;

/** A field of haft-rang tile in face space: yellow ground, blue scrolls, pink roses, a cream bead round it. */
export function haftRang(c: Ctx, x: number, y: number, w: number, h: number, l: number, seed: number): void {
  const rand = rng(seed);
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  c.fillStyle = css(shade(HAFT, l));
  c.fillRect(x, y, w, h);
  // Blue arabesque scrolls winding up the panel.
  c.strokeStyle = css(shade(LAPIS, l), 0.75);
  c.lineWidth = 0.9;
  for (let u = x - 6; u < x + w + 6; u += 9) {
    c.beginPath();
    c.moveTo(u, y + h);
    for (let v = y + h; v > y - 6; v -= 6) c.quadraticCurveTo(u + (((v - y) / 6) % 2 ? 4 : -4), v - 3, u, v - 6);
    c.stroke();
  }
  // Roses with a sprig of leaves.
  for (let k = 0; k < (w * h) / 70; k++) {
    const rx = x + rand() * w;
    const ry = y + rand() * h;
    c.fillStyle = css(shade(LEAF, l), 0.9);
    c.fillRect(rx - 2.6, ry + 0.4, 1.8, 1);
    c.fillRect(rx + 1, ry + 0.8, 1.8, 1);
    c.fillStyle = css(shade(ROSE, l));
    c.beginPath();
    c.arc(rx, ry, 1.5, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = css(shade(0x9a3050, l));
    c.fillRect(rx - 0.4, ry - 0.4, 0.8, 0.8);
  }
  c.restore();
  c.strokeStyle = css(shade(CREAM, l), 0.9);
  c.lineWidth = 1;
  c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

/** A low brick saucer dome, the kind that roofs an arcade bay by bay. */
export function saucerDome(ctx: Ctx, cx: number, baseY: number, r: number): void {
  const rise = r * 0.55;
  ctx.beginPath();
  ctx.moveTo(cx - r, baseY);
  ctx.bezierCurveTo(cx - r, baseY - rise * 0.9, cx - r * 0.45, baseY - rise, cx, baseY - rise);
  ctx.bezierCurveTo(cx + r * 0.45, baseY - rise, cx + r, baseY - rise * 0.9, cx + r, baseY);
  ctx.ellipse(cx, baseY, r, r * 0.42, 0, 0, Math.PI, false);
  ctx.closePath();
  const g = ctx.createRadialGradient(cx - r * 0.4, baseY - rise * 0.8, 1, cx, baseY - rise * 0.3, r * 1.3);
  g.addColorStop(0, css(shade(VAKIL_BRICK, 1.25)));
  g.addColorStop(0.5, css(shade(VAKIL_BRICK, 0.96)));
  g.addColorStop(1, css(shade(VAKIL_BRICK, 0.55)));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = css(shade(VAKIL_BRICK, 0.6), 0.5);
  ctx.lineWidth = 0.7;
  for (const k of [0.35, 0.68]) {
    ctx.beginPath();
    ctx.ellipse(cx, baseY - rise * k, r * (1 - k * 0.45), r * 0.42 * (1 - k * 0.45), 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(20,10,4,0.45)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(cx - r, baseY);
  ctx.bezierCurveTo(cx - r, baseY - rise * 0.9, cx - r * 0.45, baseY - rise, cx, baseY - rise);
  ctx.bezierCurveTo(cx + r * 0.45, baseY - rise, cx + r, baseY - rise * 0.9, cx + r, baseY);
  ctx.stroke();
}

/** One face of the court arcade: a lapis frieze, then tall pointed bays in haft-rang frames on a marble dado. */
function arcadeFace(c: Ctx, w: number, h: number, l: number): void {
  inscriptionBand(c, w, 5, 11, l);
  c.fillStyle = css(shade(CREAM, l));
  c.fillRect(0, 17, w, 1.5);
  // Marble dado along the piers, where people lean in the shade.
  c.fillStyle = css(shade(VAKIL_MARBLE, l));
  c.fillRect(0, h - 14, w, 14);
  c.fillStyle = 'rgba(0,0,0,0.18)';
  c.fillRect(0, h - 14, w, 0.8);
  const bays = Math.max(1, Math.round(w / 48));
  const span = w / bays;
  for (let i = 0; i < bays; i++) {
    const x0 = i * span;
    haftRang(c, x0 + 4, 22, span - 8, h - 40, l, 7400 + i * 13 + Math.round(w));
    const aw = span - 16;
    recess(c, x0 + 8, h - 3, aw, h - 34, VAKIL_BRICK, l);
    // The pier's own shadow and a glimpse of the next arch deep in the bay.
    c.strokeStyle = css(shade(0x6a5236, l * 0.7), 0.6);
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(x0 + 13, h - 3);
    c.lineTo(x0 + 13, h - 46);
    c.quadraticCurveTo(x0 + span / 2, h - 82, x0 + span - 13, h - 46);
    c.lineTo(x0 + span - 13, h - 3);
    c.stroke();
  }
}

/** The court arcade as a block of joinedMass: yellow brick, both faces arcaded, a sunk roof of saucer domes. */
function arcadePart(p0: number, p1: number, q0: number, q1: number, seed: number): MassPart {
  return { p0, p1, q0, q1, h: ARCADE_H, spec: { wall: VAKIL_BRICK, seed, material: 'brick', plinth: false, left: arcadeFace, right: arcadeFace } };
}

/** The court arcade in the Vakíl portal's wings, as a part to join with it. */
export function vakilArcadePart(p0: number, p1: number, q0: number, q1: number, seed: number, faces?: { left?: FacePainter; right?: FacePainter }): MassPart {
  const part = arcadePart(p0, p1, q0, q1, seed);
  return { ...part, spec: { ...part.spec, ...faces } };
}

/**
 * One 3 x 3 piece of the court arcade (96 x 96 px of ground, the arches
 * about 3.6 m high). Pieces join end to end along either axis, so a run of
 * them rings a court; both faces are arcaded. `mask` names the sides another
 * piece (or the portal) continues, where the roof runs on without a seam.
 */
export function drawPrayerArcade(ctx: Ctx, footprint: IsoBox, mask = 0): void {
  const part = arcadePart(0, footprint.w, 0, footprint.d, 71);
  joinedMass(ctx, footprint, [part], continuations(footprint, part, mask));
  const block = subBox(footprint, 0, footprint.w, 0, footprint.d, ARCADE_H);
  const tops = [24, 72].flatMap(p => [24, 72].map(q => roofPoint(block, p, q))).sort((a, b) => a.y - b.y);
  for (const t of tops) saucerDome(ctx, t.x, t.y + 12, 15);
  // Slippers left at the threshold of a bay.
  for (const [p, color] of [[30, 0x3a2a1c], [38, 0x6a2a22]] as const) {
    const at = groundPoint(footprint, p, -4);
    slippers(ctx, at.x, at.y, color);
  }
}

export function paintPrayerArcade(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, mask = 0): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 136, 10);
  paintTexture(scene, key, texW, texH, ctx => drawPrayerArcade(ctx, box, mask));
}

/** A pair of slippers on the paving, toes toward the arcade. */
function slippers(ctx: Ctx, x: number, y: number, color: number): void {
  for (const dx of [0, 4]) {
    ctx.fillStyle = css(color);
    ctx.beginPath();
    ctx.ellipse(x + dx, y + dx * 0.15, 1.8, 3.4, -1.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,240,210,0.35)';
    ctx.fillRect(x + dx - 1, y + dx * 0.15 - 1.2, 1.2, 0.8);
  }
}

/** Faint interlaced stars cut into a marble face. */
function carvedStars(c: Ctx, w: number, h: number, l: number): void {
  stone(c, w, h, { base: VAKIL_MARBLE, light: l, seed: 75 }, Math.max(3, h));
  c.strokeStyle = css(shade(VAKIL_MARBLE, l * 0.72), 0.55);
  c.lineWidth = 0.5;
  for (let k = -h; k < w + h; k += 4) {
    c.beginPath();
    c.moveTo(k, 0);
    c.lineTo(k + h, h);
    c.moveTo(k + h, 0);
    c.lineTo(k, h);
    c.stroke();
  }
}

/** Steps of the minbar and the seat at its head. */
export const MINBAR_STEPS = 14;

/**
 * The marble minbar on a 1 x 3 footprint (32 x 96 px of ground): its foot
 * at the front (south) cell, fourteen steps climbing back toward the qibla
 * wall to a small seat with a back slab. About 0.8 m wide, 4.2 m long, the
 * seat 3 m up: a preacher on it stands well above a standing crowd.
 */
export function drawMinbar(ctx: Ctx, box: IsoBox): void {
  const p0 = 7;
  const p1 = 25;
  const q0 = 4;
  const qTop = 70;
  const q1 = 92;
  const rise = 5;
  const tread = (qTop - q0) / MINBAR_STEPS;
  groundShadow(ctx, subBox(box, p0, p1, q0, q1, 0), 10, 0.3);
  const marble = (b: IsoBox): void => {
    walls(ctx, b, (c, w, h, light) => carvedStars(c, w, h, light));
    flatTop(ctx, b, VAKIL_MARBLE);
  };
  // The seat platform behind, then the steps from the foot upward.
  const top = rise * MINBAR_STEPS;
  marble(subBox(box, p0, p1, qTop, q1, top));
  for (let i = 0; i < MINBAR_STEPS; i++) {
    const b = subBox(box, p0, p1, q0 + i * tread, qTop, rise * (i + 1));
    // Risers a shade darker than the treads, each with the shadow of the nosing above it.
    walls(ctx, b, (c, w, h, light) => {
      carvedStars(c, w, h, light * 0.84);
      c.fillStyle = 'rgba(30,30,20,0.35)';
      c.fillRect(0, 0, w, 1);
    });
    onRoof(ctx, subBox(box, p0, p1, q0 + i * tread, q0 + (i + 1) * tread, rise * (i + 1)), (w, d) => {
      ctx.fillStyle = css(shade(VAKIL_MARBLE, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
      ctx.fillStyle = 'rgba(40,40,30,0.18)';
      ctx.fillRect(0, d - 0.8, w, 0.8);
    });
  }
  // The back slab of the seat, and a small finial.
  const back = subBox(box, p0, p1, q1 - 5, q1, top + 30);
  marble(back);
  outlineBox(ctx, back, 0x2a2a20);
  const crest = roofPoint(back, back.w / 2, back.d / 2);
  ctx.fillStyle = css(shade(VAKIL_MARBLE, 1.1));
  ctx.beginPath();
  ctx.arc(crest.x, crest.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,30,20,0.6)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  // A green cloth over the seat.
  const seat = roofPoint(subBox(box, p0, p1, qTop, q1 - 5, top), (p1 - p0) / 2, 8);
  ctx.fillStyle = css(0x2f6a3a, 0.9);
  ctx.beginPath();
  ctx.ellipse(seat.x, seat.y, 8, 3.5, -0.46, 0, Math.PI * 2);
  ctx.fill();
}
