import { css, groundPoint, groundShadow, mix, onLeftWall, onRightWall, onRoof, outlineBox, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { stone } from './materials';
import { clipped, dome, flatTop, LIGHT, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * The Sacred Mosque at Mecca as an 1840s pilgrim saw it, at true scale (a
 * cell is 1.4 m, a person 40 px, so a metre is about 23 px): the Kaʿba, some
 * 13 m high, in its black kiswa with the gold-embroidered belt, and the
 * gilded kiosk over the Station of Abraham. The colonnade and minarets are
 * in `meccaArcade.ts`.
 */

const KISWA = 0x1a1817;
const GOLD = 0xc9a55c;
const WHITEWASH = 0xe8e4d8;
/** In the days of the pilgrimage the kiswa is tucked up and the walls beneath are wrapped in white. */
const IHRAM_H = 48;

function kiswa(c: Ctx, w: number, h: number, light: number): void {
  const rand = rng(light === 1 ? 3 : 4);
  const base = shade(KISWA, light * (light === 1 ? 1.25 : 0.85));
  const sheen = c.createLinearGradient(0, 0, w, h);
  sheen.addColorStop(0, css(shade(base, 1.35)));
  sheen.addColorStop(0.6, css(base));
  sheen.addColorStop(1, css(shade(base, 0.8)));
  c.fillStyle = sheen;
  c.fillRect(0, 0, w, h);
  // Woven-in jacquard: faint chevrons of black on black.
  c.strokeStyle = css(shade(base, 1.6), 0.3);
  c.lineWidth = 0.7;
  for (let y = 6; y < h - IHRAM_H; y += 9) {
    for (let x = (y / 9) % 2 ? 4.5 : 0; x < w; x += 9) {
      c.beginPath();
      c.moveTo(x, y + 2);
      c.lineTo(x + 2.2, y);
      c.lineTo(x + 4.4, y + 2);
      c.stroke();
    }
  }
  // Soft folds where the cloth hangs.
  for (let i = 0; i < w / 9; i++) {
    c.fillStyle = `rgba(0,0,0,${0.1 + rand() * 0.12})`;
    c.fillRect(rand() * w, 0, 2 + rand() * 3, h - IHRAM_H);
  }
  // The ḥizám: a belt of gold-embroidered verses, a metre deep, two thirds of the way up.
  const by = 92;
  c.fillStyle = css(shade(KISWA, light * 0.9));
  c.fillRect(0, by, w, 23);
  c.fillStyle = css(shade(GOLD, light));
  c.fillRect(0, by, w, 2);
  c.fillRect(0, by + 21, w, 2);
  c.strokeStyle = css(shade(GOLD, light * 1.05), 0.95);
  c.lineWidth = 1.1;
  for (let x = 3; x < w - 5; x += 4 + rand() * 3) {
    c.beginPath();
    c.moveTo(x, by + 17);
    c.quadraticCurveTo(x + 1.5, by + 6 - rand() * 3, x + 3.2, by + 11 + rand() * 4);
    if (rand() < 0.4) c.lineTo(x + 3.4, by + 5);
    c.stroke();
  }
  // Lamp-shaped roundels of embroidery hung beneath the belt.
  for (let x = 40; x < w - 20; x += 64) {
    c.fillStyle = css(shade(GOLD, light * 0.9), 0.85);
    c.beginPath();
    c.moveTo(x, by + 25);
    c.quadraticCurveTo(x + 9, by + 34, x, by + 46);
    c.quadraticCurveTo(x - 9, by + 34, x, by + 25);
    c.fill();
  }
  // Below, the kiswa tucked up on cords over the white wrapping.
  const hem = h - IHRAM_H;
  c.fillStyle = css(shade(0xefeadc, light));
  c.fillRect(0, hem, w, IHRAM_H);
  c.fillStyle = 'rgba(120,110,90,0.25)';
  for (let x = 6; x < w; x += 14) c.fillRect(x, hem + 4, 1.4, IHRAM_H - 8);
  c.fillStyle = css(shade(0x0c0b0a, light));
  for (let x = 0; x < w; x += 24) {
    c.beginPath();
    c.moveTo(x, hem - 1);
    c.quadraticCurveTo(x + 12, hem + 6, x + 24, hem - 1);
    c.lineTo(x + 24, hem - 3);
    c.lineTo(x, hem - 3);
    c.fill();
  }
  c.strokeStyle = css(shade(0xb89a5a, light), 0.9);
  c.lineWidth = 0.9;
  for (let x = 12; x < w; x += 24) {
    c.beginPath();
    c.moveTo(x, hem + 4);
    c.lineTo(x, hem - 10);
    c.stroke();
  }
}

/**
 * The Kaʿba. The door is raised on the x-facing (right) wall near the near
 * corner, where the Black Stone is set, as the map expects.
 */
export function drawKaaba(ctx: Ctx, footprint: IsoBox): void {
  groundShadow(ctx, footprint, 14, 0.34);
  // The shádhirwán: a sloping marble skirt a hand high, a step proud of the walls all round.
  const skirt = subBox(footprint, 0, footprint.w, 0, footprint.d, 8);
  walls(ctx, skirt, (c, w, h, light) => stone(c, w, h, { base: 0xdcd8d0, light, seed: 13 }, 4));
  flatTop(ctx, skirt, 0xcfcbc2);
  outlineBox(ctx, skirt, 0x5a564e);
  const box = subBox(footprint, 10, footprint.w - 10, 10, footprint.d - 10, footprint.h - 8, 8);
  walls(ctx, box, kiswa);
  onRightWall(ctx, box, (_w, h) => kaabaDoor(ctx, 66, h, LIGHT.right));
  flatTop(ctx, box, 0x3e3a37);
  onRoof(ctx, box, (w, d) => {
    // The marble roof inside a low parapet, and the gilded rain spout over the Ḥijr.
    ctx.strokeStyle = 'rgba(200,192,176,0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, w - 8, d - 8);
    ctx.fillStyle = css(GOLD);
    ctx.fillRect(w / 2 - 3, d - 2, 6, 14);
  });
  outlineBox(ctx, box, 0x050404);
  // The Black Stone in its silver frame at the near corner, at a pilgrim's chest height.
  const corner = groundPoint(box, box.w, 0);
  ctx.fillStyle = css(0xb8b8b4);
  ctx.beginPath();
  ctx.ellipse(corner.x, corner.y - 28, 5, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x161212);
  ctx.beginPath();
  ctx.ellipse(corner.x, corner.y - 28, 3, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * The golden door, raised some 2 m above the pavement and reached by a
 * wheeled stair on feast days, behind its embroidered curtain.
 */
function kaabaDoor(c: Ctx, cx: number, h: number, l: number): void {
  const w = 40;
  const bottom = h - 42;
  const top = bottom - 72;
  const x = cx - w / 2;
  // The burquʿ: the curtain over the door, black worked thick with gold.
  c.fillStyle = css(shade(0x141210, l));
  c.fillRect(x - 12, top - 14, w + 24, bottom - top + 20);
  c.strokeStyle = css(shade(GOLD, l), 0.95);
  c.lineWidth = 1.2;
  c.strokeRect(x - 9, top - 11, w + 18, bottom - top + 14);
  const rand = rng(31);
  c.lineWidth = 0.9;
  for (let y = top - 7; y < bottom + 2; y += 6) {
    for (let k = x - 7; k < x + w + 6; k += 4 + rand() * 2) {
      if (k > x - 1 && k < x + w + 1 && y > top - 1 && y < bottom + 1) continue;
      c.beginPath();
      c.moveTo(k, y + 3);
      c.quadraticCurveTo(k + 1, y - rand() * 2, k + 2.4, y + 2);
      c.stroke();
    }
  }
  // The door itself, silver-gilt, in two leaves.
  c.fillStyle = css(shade(0x6a4c1a, l));
  c.fillRect(x - 2, top - 2, w + 4, bottom - top + 4);
  const g = c.createLinearGradient(x, top, x + w, bottom);
  g.addColorStop(0, css(shade(0xf0d890, l)));
  g.addColorStop(0.5, css(shade(GOLD, l)));
  g.addColorStop(1, css(shade(0x8a6a2a, l)));
  c.fillStyle = g;
  c.fillRect(x, top, w, bottom - top);
  c.strokeStyle = css(shade(0x6a4c1a, l), 0.9);
  c.lineWidth = 0.9;
  c.beginPath();
  c.moveTo(x + w / 2, top);
  c.lineTo(x + w / 2, bottom);
  for (const y of [top + 12, top + 32, top + 52]) {
    c.rect(x + 3, y - 6, w / 2 - 6, 12);
    c.rect(x + w / 2 + 3, y - 6, w / 2 - 6, 12);
  }
  c.stroke();
  c.fillStyle = css(shade(0xf8e8b0, l));
  for (const y of [top + 36, top + 40]) c.fillRect(x + w / 2 - 4, y, 8, 2);
}

/**
 * The Station of Abraham (2 x 2 cells): a gilded grille kiosk about 3 m
 * square under a small white dome, on a marble step.
 */
export function drawMaqam(ctx: Ctx, footprint: IsoBox): void {
  const plinth = subBox(footprint, 4, footprint.w - 4, 4, footprint.d - 4, 7);
  groundShadow(ctx, plinth, 8, 0.25);
  walls(ctx, plinth, (c, w, h, light) => stone(c, w, h, { base: 0xd8d4cc, light, seed: 12 }, 3.5));
  flatTop(ctx, plinth, 0xe0dcd4);
  outlineBox(ctx, plinth, 0x4a3a24);
  const kiosk = subBox(footprint, 10, footprint.w - 10, 10, footprint.d - 10, 84, 7);
  const grille = (c: Ctx, w: number, h: number, l: number) => clipped(c, w, h, () => {
    c.fillStyle = css(shade(0x2a1e14, l));
    c.fillRect(0, 0, w, h);
    c.strokeStyle = css(shade(GOLD, l * 1.05));
    c.lineWidth = 1;
    for (let k = -h; k < w + h; k += 4) {
      c.beginPath();
      c.moveTo(k, 10);
      c.lineTo(k + h, h + 10);
      c.moveTo(k + h, 10);
      c.lineTo(k, h + 10);
      c.stroke();
    }
    // A cornice of gilt and a frieze of green, the posts at the corners.
    c.fillStyle = css(shade(mix(GOLD, 0xffffff, 0.2), l));
    c.fillRect(0, 0, w, 4);
    c.fillStyle = css(shade(0x2f5a3a, l));
    c.fillRect(0, 4, w, 6);
    c.fillStyle = css(shade(mix(GOLD, 0xffffff, 0.2), l));
    c.fillRect(0, 10, w, 1.5);
    c.fillRect(0, 0, 2.5, h);
    c.fillRect(w - 2.5, 0, 2.5, h);
    c.fillRect(0, h - 6, w, 6);
  });
  onLeftWall(ctx, kiosk, (w, h) => grille(ctx, w, h, LIGHT.left));
  onRightWall(ctx, kiosk, (w, h) => grille(ctx, w, h, LIGHT.right));
  flatTop(ctx, kiosk, GOLD);
  outlineBox(ctx, kiosk, 0x4a3a24);
  const top = roofPoint(kiosk, kiosk.w / 2, kiosk.d / 2);
  dome(ctx, top.x, top.y + 1, 20, { color: WHITEWASH, drum: 5, drumColor: GOLD, bulb: 1.05, finial: true });
}
