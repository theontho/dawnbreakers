import { css, groundShadow, outlineBox, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow } from './fieldKit';
import { brick, glazedTiles } from './materials';
import { archPath, clipped, cylinder, cylinderBand, flatTop, LIGHT, walls } from './ornaments';
import { onPlane, subBox, type Pt } from './structureParts';
import { inscriptionBand, tilePanel, townIwan } from './town/monumentKit';
import { ARCADE_H, haftRang, saucerDome, VAKIL_BRICK, VAKIL_MARBLE } from './vakil';

/**
 * The Vakíl prayer hall, its qibla iwan and its street portal at true
 * scale. The hall is shown cut away at the springing of its vaults: a
 * forest of spiral columns, each carrying the arches back to its west and
 * north neighbours (or to the walls), so a grid of them reads as the hall.
 */

const LAPIS = 0x24477a;
const CREAM = 0xf0e6cc;
const TURQUOISE = 0x2e8c96;

/** Column spacing in cells, and the hall's heights in px: the capital, the crown of an arch, the ring's depth. */
export const HALL_BAY = 3;
const SPRING = 86;
const CROWN = 124;
const RING = 9;
const TOP = CROWN + RING + 2;

/** Texture size of one hall column: room for the arches reaching back to both neighbours. */
export const HALL_COLUMN_TEX = { w: (HALL_BAY * 32 + 10) * 2, h: 16 + HALL_BAY * 16 + TOP + 2 } as const;

/** One spiral column of the hall, with its arches back to the west and north neighbours. */
export function drawHallColumn(ctx: Ctx): void {
  const span = HALL_BAY * 32;
  const c: Pt = { x: HALL_COLUMN_TEX.w / 2, y: HALL_COLUMN_TEX.h - 16 };
  const north: Pt = { x: c.x + span, y: c.y - span / 2 };
  const west: Pt = { x: c.x - span, y: c.y - span / 2 };
  ellipseShadow(ctx, c.x + 4, c.y + 1, 13, 5, 0.3);
  // The north arch runs back to the right, behind the column; the west arch back to the left.
  hallArch(ctx, c, north, LIGHT.right, { x: -4, y: -2 });
  hallArch(ctx, west, c, LIGHT.left, { x: 4, y: -2 });
  spiralColumn(ctx, c.x, c.y);
}

/**
 * The curve of a pointed arch from its foot at (x, base) over to (x + w,
 * base), springing straight from the base (the hall's arches are wide and
 * low). With `reverse` it runs from the right foot back to the left.
 */
function archCurve(ctx: Ctx, x: number, base: number, w: number, h: number, reverse = false): void {
  const apex = { x: x + w / 2, y: base - h };
  const left = { x, y: base };
  const right = { x: x + w, y: base };
  const c1 = { x, y: base - w * 0.34 };
  const c2 = { x: apex.x - w * 0.2, y: apex.y + w * 0.14 };
  const c3 = { x: apex.x + w * 0.2, y: apex.y + w * 0.14 };
  const c4 = { x: x + w, y: base - w * 0.34 };
  if (!reverse) {
    ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, apex.x, apex.y);
    ctx.bezierCurveTo(c3.x, c3.y, c4.x, c4.y, right.x, right.y);
  } else {
    ctx.bezierCurveTo(c4.x, c4.y, c3.x, c3.y, apex.x, apex.y);
    ctx.bezierCurveTo(c2.x, c2.y, c1.x, c1.y, left.x, left.y);
  }
}

/** The ring between an outer and an inner arch curve, as one closed path with no chord. */
function ringPath(ctx: Ctx, w: number, base: number): void {
  const rise = CROWN - SPRING;
  ctx.beginPath();
  ctx.moveTo(1, base);
  archCurve(ctx, 1, base, w - 2, rise + RING);
  ctx.lineTo(w - 9, base);
  archCurve(ctx, 9, base, w - 18, rise, true);
  ctx.closePath();
}

/**
 * The brick ring of an arch between two column heads, `from` to `to` along
 * the ground: the hall is cut away just above the arches, so what stands is
 * a lattice of rings over the columns and the floor stays in view. `back`
 * offsets the ring's far edge, giving it thickness.
 */
function hallArch(ctx: Ctx, from: Pt, to: Pt, light: number, back: Pt): void {
  const span = HALL_BAY * 32;
  const rise = CROWN - SPRING;
  const paint = (shift: Pt, tone: number): void => {
    const o = { x: from.x + shift.x, y: from.y - TOP + shift.y };
    const a = { x: to.x + shift.x, y: to.y - TOP + shift.y };
    const b = { x: from.x + shift.x, y: from.y + shift.y };
    onPlane(ctx, o, a, b, span, TOP, (w, h) => {
      const base = h - SPRING;
      ringPath(ctx, w, base);
      ctx.fillStyle = css(shade(VAKIL_BRICK, light * tone));
      ctx.fill();
      if (tone < 1) return;
      // Brick voussoirs radiating round the ring, and a plaster bead on the intrados.
      ctx.save();
      ringPath(ctx, w, base);
      ctx.clip();
      ctx.strokeStyle = css(shade(VAKIL_BRICK, light * 0.7), 0.6);
      ctx.lineWidth = 0.6;
      const cx = w / 2;
      for (let t = 0.04; t < 0.97; t += 0.06) {
        const ang = Math.PI * (1 - t);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * (cx - 9), base - Math.sin(ang) * rise);
        ctx.lineTo(cx + Math.cos(ang) * (cx + 4), base - Math.sin(ang) * (rise + RING + 4));
        ctx.stroke();
      }
      ctx.restore();
      ctx.beginPath();
      ctx.moveTo(9, base);
      archCurve(ctx, 9, base, w - 18, rise);
      ctx.strokeStyle = css(shade(CREAM, light * 0.95), 0.85);
      ctx.lineWidth = 1.4;
      ctx.stroke();
    });
  };
  // The far face in shadow first, then the near face over it.
  paint(back, 0.62);
  paint({ x: 0, y: 0 }, 1);
}

/** A stone column twisted like a rope, on a square base under a bell capital. */
function spiralColumn(ctx: Ctx, x: number, y: number): void {
  const r = 6;
  const shaftTop = y - SPRING + 12;
  // The base: a square plinth, then a torus.
  const plinth: IsoBox = { x, y: y + 8, w: 16, d: 16, h: 8 };
  walls(ctx, plinth, (c, w, h, light) => {
    c.fillStyle = css(shade(VAKIL_MARBLE, light * 0.92));
    c.fillRect(0, 0, w, h);
  });
  flatTop(ctx, plinth, VAKIL_MARBLE);
  outlineBox(ctx, plinth, 0x2a2a20);
  cylinder(ctx, x, y - 8, r + 2, 4, VAKIL_MARBLE, true);
  cylinder(ctx, x, y - 12, r, y - 12 - shaftTop, 0xc8c2a8, false);
  // The twist: bands climbing round the shaft, light on the left.
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - r, shaftTop, r * 2, y - 12 - shaftTop);
  ctx.clip();
  for (let v = y - 12; v > shaftTop - 8; v -= 5) {
    ctx.strokeStyle = 'rgba(60,50,30,0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(x - r, v);
    ctx.quadraticCurveTo(x, v - 3.5, x + r, v - 6);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,250,230,0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(x - r, v - 2);
    ctx.quadraticCurveTo(x - r * 0.3, v - 4.2, x + r * 0.2, v - 5.5);
    ctx.stroke();
  }
  ctx.restore();
  // The capital: a carved bell, then the impost block the arches spring from.
  ctx.fillStyle = css(shade(VAKIL_MARBLE, 0.95));
  ctx.beginPath();
  ctx.moveTo(x - r, shaftTop);
  ctx.quadraticCurveTo(x - r - 1, shaftTop - 7, x - r - 4, shaftTop - 10);
  ctx.lineTo(x + r + 4, shaftTop - 10);
  ctx.quadraticCurveTo(x + r + 1, shaftTop - 7, x + r, shaftTop);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(40,36,24,0.55)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  for (const dx of [-4, 0, 4]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, shaftTop - 1);
    ctx.lineTo(x + dx * 1.4, shaftTop - 9);
    ctx.stroke();
  }
  const impost: IsoBox = { x, y: y - SPRING + 2 + 9, w: 18, d: 18, h: 6 };
  walls(ctx, impost, (c, w, h, light) => {
    c.fillStyle = css(shade(VAKIL_BRICK, light));
    c.fillRect(0, 0, w, h);
  });
  flatTop(ctx, impost, VAKIL_BRICK);
  outlineBox(ctx, impost);
}

/**
 * The face of the hall's walls (`ch4-vakil-wall`, a connected wall): yellow
 * brick over a marble dado, a band of haft-rang tile at eye height and a
 * lapis frieze under the coping. Patterns repeat on 32 px.
 */
export function vakilWallFace(ctx: Ctx, w: number, h: number, l: number): void {
  brick(ctx, w, h, { base: VAKIL_BRICK, light: l, seed: 91 }, 3, 8);
  inscriptionBand(ctx, w, 6, 12, l);
  for (let u = 0; u < w; u += 32) haftRang(ctx, u, h - 74, 32, 26, l, 93);
  clipped(ctx, w, h, () => {
    ctx.fillStyle = css(shade(VAKIL_MARBLE, l));
    ctx.fillRect(0, h - 24, w, 24);
    ctx.fillStyle = 'rgba(40,36,24,0.25)';
    ctx.fillRect(0, h - 24, w, 1);
    for (let u = 16; u < w; u += 32) ctx.fillRect(u, h - 24, 0.8, 24);
  });
}

/** A tall pīshṭāq block: haft-rang and lapis tile, a frieze, a cream coping. */
function pishtaqBlock(ctx: Ctx, b: IsoBox, seed: number, front: 'left' | 'right', vault: (c: Ctx, w: number, h: number, l: number) => void): void {
  groundShadow(ctx, b, 14, 0.3);
  const side = (c: Ctx, w: number, h: number, l: number): void => {
    tilePanel(c, 3, 6, w - 6, h - 6, LAPIS, l, seed + 1, 7);
    haftRang(c, 7, 24, w - 14, h - 40, l, seed + 2);
  };
  const face = (c: Ctx, w: number, h: number, l: number): void => {
    tilePanel(c, 3, 4, w - 6, h - 4, TURQUOISE, l, seed + 3, 7);
    inscriptionBand(c, w, 10, 14, l);
    vault(c, w, h, l);
  };
  walls(ctx, b, (c, w, h, light) => brick(c, w, h, { base: VAKIL_BRICK, light, seed }, 3, 8), {
    left: front === 'left' ? face : side,
    right: front === 'right' ? face : side,
  });
  flatTop(ctx, b, CREAM);
  outlineBox(ctx, b);
}

/** Small tiers of muqarnas cells hanging in the head of a vault. */
function muqarnas(c: Ctx, cx: number, top: number, w: number, l: number): void {
  for (let t = 0; t < 4; t++) {
    const n = t + 2;
    const cw = (w * (0.3 + t * 0.12)) / n;
    const y = top + t * cw * 0.8;
    for (let k = 0; k < n; k++) {
      const x = cx - (n * cw) / 2 + k * cw;
      archPath(c, x + 0.5, y + cw * 0.8, cw - 1, cw * 0.8);
      c.fillStyle = css(shade(t % 2 ? CREAM : TURQUOISE, l * (0.6 + t * 0.08)));
      c.fill();
      c.strokeStyle = css(shade(CREAM, l), 0.5);
      c.lineWidth = 0.6;
      c.stroke();
    }
  }
}

/** The mihrab at the back of the qibla iwan: a niche in a lapis frame, its hood picked out in cream. */
function mihrabVault(c: Ctx, w: number, h: number, l: number): void {
  const aw = 76;
  const ah = 168;
  const x = w / 2 - aw / 2;
  archPath(c, x - 3, h, aw + 6, ah + 3);
  c.fillStyle = css(shade(CREAM, l));
  c.fill();
  archPath(c, x, h, aw, ah);
  const g = c.createLinearGradient(0, h - ah, 0, h);
  g.addColorStop(0, css(shade(VAKIL_BRICK, l * 0.4)));
  g.addColorStop(1, css(shade(VAKIL_BRICK, l * 0.7)));
  c.fillStyle = g;
  c.fill();
  c.save();
  archPath(c, x, h, aw, ah);
  c.clip();
  muqarnas(c, w / 2, h - ah + 2, aw * 0.9, l * 0.9);
  // The niche itself, person-sized and a little more: 1.6 by 2.6 m.
  const nw = 36;
  const nh = 62;
  c.fillStyle = css(shade(LAPIS, l));
  c.fillRect(w / 2 - nw / 2 - 6, h - nh - 16, nw + 12, nh + 16);
  c.save();
  c.beginPath();
  c.rect(w / 2 - nw / 2 - 5, h - nh - 15, nw + 10, nh + 15);
  c.clip();
  glazedTiles(c, w / 2 + nw, h, { base: LAPIS, light: l, seed: 97 }, 5);
  c.restore();
  archPath(c, w / 2 - nw / 2, h, nw, nh);
  c.fillStyle = css(shade(CREAM, l * 0.92));
  c.fill();
  archPath(c, w / 2 - nw / 2 + 5, h, nw - 10, nh - 9);
  const niche = c.createLinearGradient(0, h - nh, 0, h);
  niche.addColorStop(0, css(shade(0x6a5638, l * 0.7)));
  niche.addColorStop(1, css(shade(0xa08a68, l)));
  c.fillStyle = niche;
  c.fill();
  c.restore();
  // The marble step before it.
  c.fillStyle = css(shade(VAKIL_MARBLE, l));
  c.fillRect(x - 4, h - 4, aw + 8, 4);
}

/** Height of the qibla iwan's pīshṭāq. */
const QIBLA_H = 236;

/**
 * The qibla iwan (4 x 1: 128 x 32 px of ground) standing in the hall's back
 * wall, a tiled pīshṭāq well above the vaults with the mihrab at its back.
 */
export function drawQiblaIwan(ctx: Ctx, box: IsoBox): void {
  pishtaqBlock(ctx, subBox(box, 0, box.w, 0, box.d, QIBLA_H), 1101, 'left', mihrabVault);
}

/**
 * The portal from the street (3 x 6: 96 x 192 px of ground), in the west
 * range of the court. A tiled pīshṭāq faces the court on its right face,
 * its iwan open through to the street over footprint rows 2 and 3 from the
 * front (q 64..128); arcade wings stand either side. The map leaves those
 * rows walkable.
 */
export function drawVakilPortal(ctx: Ctx, box: IsoBox): void {
  const wing = (q0: number, q1: number, seed: number): void => {
    const b = subBox(box, 0, box.w, q0, q1, ARCADE_H);
    walls(ctx, b, (c, w, h, light) => brick(c, w, h, { base: VAKIL_BRICK, light, seed }, 3, 8), {
      left: (c, w, h, l) => {
        inscriptionBand(c, w, 5, 11, l);
        haftRang(c, 6, 22, w - 12, h - 40, l, seed + 1);
      },
      right: (c, w, h, l) => {
        inscriptionBand(c, w, 5, 11, l);
        haftRang(c, 4, 22, w - 8, h - 40, l, seed + 2);
        c.fillStyle = css(shade(VAKIL_MARBLE, l));
        c.fillRect(0, h - 14, w, 14);
      },
    });
    flatTop(ctx, b, VAKIL_BRICK);
    outlineBox(ctx, b);
  };
  wing(152, 192, 1111);
  pishtaqBlock(ctx, subBox(box, 0, box.w, 40, 152, QIBLA_H - 16), 1121, 'right', (c, w, h, l) =>
    townIwan(c, w / 2, h, 76, 150, { wall: VAKIL_BRICK, frame: TURQUOISE, door: 0x4a2a14, light: l, seed: 1125, open: true, lantern: true }));
  const top = subBox(box, 0, box.w, 40, 152, QIBLA_H - 16);
  const at = roofPoint(top, top.w / 2, top.d / 2);
  saucerDome(ctx, at.x, at.y + 6, 20);
  cylinderBand(ctx, at.x, at.y + 4, 20, 2, TURQUOISE);
  wing(0, 40, 1131);
}
