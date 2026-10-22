import { css, shade, type Ctx } from './canvasKit';
import { recess } from './massing';
import { brick, glazedTiles } from './materials';
import { archPath, band, doorway, latticeWindow } from './ornaments';
import { spout } from './town/townKit';

/**
 * The faces of the Tabríz barrack at true scale (a person is 40 px, a metre
 * about 23 px): a ground storey opened in an arcade of pointed arches with
 * the room doors in shadow at the back, an upper storey of small latticed
 * windows in arched niches, string courses of lime and a dentil cornice.
 * Every bay is one cell (32 px) wide and centred on the cell, so runs laid
 * side by side continue each other's rhythm.
 */

export const TABRIZ_BRICK = 0xb08458;
export const TABRIZ_LIME = 0xd8c8a4;
export const TABRIZ_STONE = 0x9a8a70;
const DOOR = 0x4a2e1c;
const FRAME = 0x8a6440;
const SHUTTERS = 0x5a3a24;

/** Height of the walls to the roof (7.7 m), and of the arcaded ground storey. */
export const BARRACK_H = 178;
export const GROUND = 92;
const PLINTH = 6;

/** Brick on a dressed-stone plinth. */
export function brickWall(c: Ctx, w: number, h: number, light: number, seed: number): void {
  brick(c, w, h, { base: TABRIZ_BRICK, light, seed }, 4, 8);
  c.fillStyle = css(shade(TABRIZ_STONE, light));
  c.fillRect(0, h - PLINTH, w, PLINTH);
  c.fillStyle = 'rgba(255,240,210,0.22)';
  c.fillRect(0, h - PLINTH, w, 0.8);
}

/** The cornice under the parapet: a lime course over a row of brick dentils. */
function cornice(c: Ctx, w: number, light: number): void {
  band(c, w, 4, 4, TABRIZ_LIME, light);
  c.fillStyle = css(shade(TABRIZ_BRICK, light * 0.55));
  for (let u = 1; u < w - 1; u += 4) c.fillRect(u, 9, 2, 2.5);
}

/** The string course between the storeys. */
function stringCourse(c: Ctx, w: number, h: number, light: number): void {
  band(c, w, h - GROUND - 3, 4, TABRIZ_LIME, light);
}

/**
 * One bay of the ground arcade: a pointed arch 26 px wide and about 3.3 m
 * high, the gallery behind it in shadow, and at the back a room's door
 * (or a barred guard-room window).
 */
function arcadeBay(c: Ctx, u: number, h: number, l: number, seed: number, door: boolean): void {
  const base = h - PLINTH;
  recess(c, u - 13, base, 26, 76, TABRIZ_BRICK, l);
  c.save();
  c.clip();
  // The gallery is deep: its back wall sits in shade, lit only near the floor.
  const g = c.createLinearGradient(0, base - 76, 0, base);
  g.addColorStop(0, 'rgba(14,8,4,0.55)');
  g.addColorStop(1, 'rgba(14,8,4,0.18)');
  c.fillStyle = g;
  c.fillRect(u - 13, base - 76, 26, 76);
  if (door) {
    doorway(c, u - 9, base, 18, 46, { frame: shade(TABRIZ_BRICK, 0.7), door: DOOR, light: l * 0.62, seed });
  } else {
    latticeWindow(c, u - 5, base - 46, 10, 16, { frame: FRAME, light: l * 0.6, arched: true });
  }
  c.restore();
  // A lime impost where the arch springs from its piers.
  c.fillStyle = css(shade(TABRIZ_LIME, l));
  c.fillRect(u - 15.5, base - 50, 3, 2);
  c.fillRect(u + 12.5, base - 50, 3, 2);
}

/** One bay of the upper storey: a latticed window (12 x 18) in a shallow niche, its sill 30 px up. */
function upperBay(c: Ctx, u: number, h: number, l: number): void {
  const floor = h - GROUND;
  recess(c, u - 10, floor - 8, 20, 62, TABRIZ_BRICK, l);
  latticeWindow(c, u - 6, floor - 30 - 18, 12, 18, { frame: FRAME, light: l, arched: true, shutters: SHUTTERS });
}

/**
 * The arcaded front of a run, one bay per cell. `skip` is a span of the face
 * (a gate portal stands there) left plain.
 */
export function arcadeFront(c: Ctx, w: number, h: number, l: number, seed: number, skip: readonly [number, number] | null): void {
  cornice(c, w, l);
  stringCourse(c, w, h, l);
  const cells = Math.max(1, Math.round(w / 32));
  for (let i = 0; i < cells; i++) {
    const u = i * 32 + 16;
    if (skip && u > skip[0] && u < skip[1]) continue;
    upperBay(c, u, h, l);
    arcadeBay(c, u, h, l, seed + i, (seed + i) % 3 !== 0);
    if (i % 3 === 1) spout(c, u + 15, 14, l);
  }
}

/** The end of a run: a window to each upper room, small high windows below. */
export function endFace(c: Ctx, w: number, h: number, l: number): void {
  cornice(c, w, l);
  stringCourse(c, w, h, l);
  const cells = Math.max(1, Math.round(w / 32));
  for (let i = 0; i < cells; i++) {
    const u = i * 32 + 16;
    upperBay(c, u, h, l);
    latticeWindow(c, u - 5, h - 66, 10, 14, { frame: FRAME, light: l, arched: true });
  }
}

/** The lion and sun of the state, in gold on the tiled panel over the gate. */
function lionAndSun(c: Ctx, cx: number, cy: number, l: number): void {
  const gold = css(shade(0xe8b440, l));
  c.strokeStyle = css(shade(0xe8b440, l), 0.85);
  c.lineWidth = 1;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    c.beginPath();
    c.moveTo(cx + Math.cos(a) * 6.5, cy - 4 + Math.sin(a) * 6.5);
    c.lineTo(cx + Math.cos(a) * 9.5, cy - 4 + Math.sin(a) * 9.5);
    c.stroke();
  }
  c.fillStyle = gold;
  c.beginPath();
  c.arc(cx, cy - 4, 5.5, 0, Math.PI * 2);
  c.fill();
  // The lion passant beneath the sun: body, head and raised tail.
  c.beginPath();
  c.ellipse(cx, cy + 7, 9, 3.2, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.arc(cx - 8, cy + 4, 3, 0, Math.PI * 2);
  c.fill();
  c.fillRect(cx - 7, cy + 8, 1.6, 5);
  c.fillRect(cx + 5, cy + 8, 1.6, 5);
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(cx + 8, cy + 6);
  c.quadraticCurveTo(cx + 13, cy + 2, cx + 11, cy - 2);
  c.stroke();
}

/**
 * The barrack gate (a pishtaq): a portal taller than wide, a tiled panel
 * with the lion and sun over a deep arch, and inside the arch the gate
 * itself, man-high and a little more, with a lattice window over it.
 */
export function portalFace(c: Ctx, w: number, h: number, l: number, seed: number): void {
  c.strokeStyle = css(shade(TABRIZ_LIME, l));
  c.lineWidth = 2.5;
  c.strokeRect(5, 8, w - 10, h - 14);
  c.save();
  c.beginPath();
  c.rect(11, 14, w - 22, 26);
  c.clip();
  glazedTiles(c, w, 46, { base: 0x2c6e8a, light: l, seed }, 6);
  c.restore();
  lionAndSun(c, w / 2, 25, l);
  const base = h - PLINTH;
  const aw = w - 22;
  recess(c, w / 2 - aw / 2, base, aw, h - 58, TABRIZ_BRICK, l);
  // Muqarnas-like shadow in the half-dome of the arch.
  c.save();
  archPath(c, w / 2 - aw / 2, base, aw, h - 58);
  c.clip();
  const g = c.createLinearGradient(0, 50, 0, 120);
  g.addColorStop(0, 'rgba(14,8,4,0.5)');
  g.addColorStop(1, 'rgba(14,8,4,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  c.restore();
  latticeWindow(c, w / 2 - 10, base - 104, 20, 24, { frame: FRAME, light: l * 0.8, arched: true });
  doorway(c, w / 2 - 15, base, 30, 64, { frame: TABRIZ_LIME, door: DOOR, light: l * 0.85, seed });
}
