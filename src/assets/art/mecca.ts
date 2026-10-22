import { css, groundPoint, groundShadow, mix, onLeftWall, onRightWall, outlineBox, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { ellipseShadow } from './fieldKit';
import { subBox } from './structureParts';
import { stone } from './materials';
import { archPath, band, clipped, cylinder, dome, flatTop, LIGHT, walls } from './ornaments';

/**
 * The Sacred Mosque at Mecca as an 1840s pilgrim saw it: the Kaʿba in its
 * black kiswa with the gold-embroidered belt, the Ottoman colonnade of
 * small white domes on striped arches, slender minarets, and the gilded
 * kiosk over the Station of Abraham.
 */

const KISWA = 0x1a1817;
const GOLD = 0xc9a55c;
const LIMESTONE = 0xd8c7a0;
const WHITEWASH = 0xe8e4d8;

/** The Kaʿba. The door is raised on the x-facing (right) wall, as the map expects. */
export function drawKaaba(ctx: Ctx, footprint: IsoBox): void {
  groundShadow(ctx, footprint, 9, 0.32);
  // The shádhirwán: a sloping marble skirt a step proud of the walls all round.
  const skirt = subBox(footprint, 0, footprint.w, 0, footprint.d, 4);
  walls(ctx, skirt, (c, w, h, light) => stone(c, w, h, { base: 0xdcd8d0, light, seed: 13 }, 4));
  flatTop(ctx, skirt, 0xcfcbc2);
  outlineBox(ctx, skirt, 0x5a564e);
  const box = subBox(footprint, 3, footprint.w - 3, 3, footprint.d - 3, footprint.h);
  const kiswa = (c: Ctx, w: number, h: number, light: number) => {
    const rand = rng(light === 1 ? 3 : 4);
    const base = shade(KISWA, light * (light === 1 ? 1.25 : 0.85));
    const sheen = c.createLinearGradient(0, 0, w, h);
    sheen.addColorStop(0, css(shade(base, 1.35)));
    sheen.addColorStop(0.6, css(base));
    sheen.addColorStop(1, css(shade(base, 0.8)));
    c.fillStyle = sheen;
    c.fillRect(0, 0, w, h);
    // Woven-in jacquard: faint chevrons of black on black.
    c.strokeStyle = css(shade(base, 1.6), 0.35);
    c.lineWidth = 0.6;
    for (let y = 4; y < h; y += 6) {
      for (let x = (y / 6) % 2 ? 3 : 0; x < w; x += 6) {
        c.beginPath();
        c.moveTo(x, y + 1.5);
        c.lineTo(x + 1.5, y);
        c.lineTo(x + 3, y + 1.5);
        c.stroke();
      }
    }
    // Soft folds where the cloth hangs.
    for (let i = 0; i < w / 10; i++) {
      c.fillStyle = `rgba(0,0,0,${0.1 + rand() * 0.12})`;
      c.fillRect(rand() * w, 0, 1.5 + rand() * 2, h);
    }
    // The ḥizám: a belt of gold-embroidered verses two thirds of the way up.
    const by = h * 0.24;
    c.fillStyle = css(shade(KISWA, light * 0.9));
    c.fillRect(0, by, w, 9);
    c.fillStyle = css(shade(GOLD, light));
    c.fillRect(0, by, w, 1.2);
    c.fillRect(0, by + 7.8, w, 1.2);
    c.strokeStyle = css(shade(GOLD, light * 1.05), 0.95);
    c.lineWidth = 0.8;
    for (let x = 2; x < w - 3; x += 3 + rand() * 2) {
      c.beginPath();
      c.moveTo(x, by + 6.5);
      c.quadraticCurveTo(x + 1, by + 2 - rand() * 1.5, x + 2.2, by + 4 + rand() * 2);
      if (rand() < 0.4) c.lineTo(x + 2.4, by + 2);
      c.stroke();
    }
    // The hem, tied down to brass rings set in the marble skirt.
    c.fillStyle = css(shade(0x0c0b0a, light));
    c.fillRect(0, h - 2, w, 2);
    c.strokeStyle = css(shade(0xb89a5a, light), 0.9);
    c.lineWidth = 0.7;
    for (let x = 4; x < w; x += 8) {
      c.beginPath();
      c.arc(x, h - 1.5, 1, 0, Math.PI * 2);
      c.stroke();
    }
  };
  walls(ctx, box, kiswa);
  onRightWall(ctx, box, (w, h) => kaabaDoor(ctx, w * 0.3, h, LIGHT.right));
  flatTop(ctx, box, 0x4e4a47);
  outlineBox(ctx, box, 0x050404);
  // The Black Stone in its silver frame at the eastern corner, at a pilgrim's chest height.
  const corner = groundPoint(box, box.w, 0);
  ctx.fillStyle = css(0xa8a8a4);
  ctx.beginPath();
  ctx.ellipse(corner.x, corner.y - 28, 2, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x161212);
  ctx.beginPath();
  ctx.ellipse(corner.x, corner.y - 28, 1.2, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** The golden door, raised above a man's head and reached by a wheeled stair on feast days. */
function kaabaDoor(c: Ctx, x: number, h: number, l: number): void {
  const w = 12;
  const top = h - 68;
  const bottom = h - 34;
  c.fillStyle = css(shade(0x6a4c1a, l));
  c.fillRect(x - 1.5, top - 1.5, w + 3, bottom - top + 3);
  const g = c.createLinearGradient(x, top, x + w, bottom);
  g.addColorStop(0, css(shade(0xf0d890, l)));
  g.addColorStop(0.5, css(shade(GOLD, l)));
  g.addColorStop(1, css(shade(0x8a6a2a, l)));
  c.fillStyle = g;
  c.fillRect(x, top, w, bottom - top);
  c.strokeStyle = css(shade(0x6a4c1a, l), 0.9);
  c.lineWidth = 0.7;
  c.beginPath();
  c.moveTo(x + w / 2, top);
  c.lineTo(x + w / 2, bottom);
  for (const y of [top + 6, top + 15, top + 24]) {
    c.rect(x + 1.5, y - 3, w / 2 - 3, 5);
    c.rect(x + w / 2 + 1.5, y - 3, w / 2 - 3, 5);
  }
  c.stroke();
}

/**
 * One bay of the colonnade: a tall pointed arch of striped voussoirs on
 * slender marble columns, a white dome above, the floor raised a step.
 * Bays join along a run, so the box fills its cell edge to edge.
 */
export function drawArcadeBay(ctx: Ctx, box: IsoBox): void {
  groundShadow(ctx, box, 4, 0.22);
  const bay = (c: Ctx, w: number, h: number, l: number) => {
    stone(c, w, h, { base: LIMESTONE, light: l, seed: l === 1 ? 7 : 8 }, 6);
    const aw = w - 9;
    const step = 3;
    const springH = h - 16;
    // The shadowed hall behind the arch, lighter toward the paved floor.
    archPath(c, 4.5, h - step, aw, springH);
    const inside = c.createLinearGradient(0, h - springH, 0, h);
    inside.addColorStop(0, css(shade(0x2a2018, l)));
    inside.addColorStop(1, css(shade(0x6a5a46, l)));
    c.fillStyle = inside;
    c.fill();
    // The inner arcade glimpsed through the opening.
    c.save();
    archPath(c, 4.5, h - step, aw, springH);
    c.clip();
    archPath(c, 9, h - step - 4, aw - 9, springH - 12);
    c.strokeStyle = css(shade(LIMESTONE, l * 0.45), 0.8);
    c.lineWidth = 1.4;
    c.stroke();
    c.restore();
    // Ablaq voussoirs: alternating pale and red-brown stones round the arch.
    archPath(c, 3.5, h - step, aw + 2, springH + 1);
    c.strokeStyle = css(shade(0xefe6cf, l));
    c.lineWidth = 2.2;
    c.stroke();
    c.setLineDash([2.5, 2.5]);
    c.strokeStyle = css(shade(0x9a5a3a, l));
    c.stroke();
    c.setLineDash([]);
    // Slender columns at the bay corners, with a capital and a base.
    for (const x of [0.5, w - 3.5]) {
      c.fillStyle = css(shade(0xd0ccc0, l));
      c.fillRect(x, h - springH + 10, 3, springH - 10 - step);
      c.fillStyle = css(shade(0xf4efe2, l));
      c.fillRect(x, h - springH + 10, 1, springH - 10 - step);
      c.fillStyle = css(shade(LIMESTONE, l * 0.85));
      c.fillRect(x - 0.5, h - springH + 9, 4, 2);
      c.fillRect(x - 0.5, h - step - 2, 4, 2);
    }
    // A cornice under the roof and the raised floor's step at the foot.
    band(c, w, 2, 2, shade(LIMESTONE, 0.85), l);
    c.fillStyle = css(shade(0xd8d4cc, l));
    c.fillRect(0, h - step, w, step);
    c.fillStyle = 'rgba(0,0,0,0.22)';
    c.fillRect(0, h - step, w, 0.8);
  };
  walls(ctx, box, (c, w, h, light) => bay(c, w, h, light));
  flatTop(ctx, box, LIMESTONE);
  outlineBox(ctx, box, 0x4a3a24);
  const top = roofPoint(box, box.w / 2, box.d / 2);
  dome(ctx, top.x, top.y + 1, 11, { color: WHITEWASH, drum: 4, drumColor: LIMESTONE, bulb: 0.95, finial: true });
}

/** An Ottoman minaret: square base, banded shaft, two balconies and a pencil spire. */
export function drawMinaret(ctx: Ctx, cx: number, ground: number): void {
  ellipseShadow(ctx, cx + 3, ground - 6, 18, 6, 0.3);
  const base: IsoBox = { x: cx, y: ground - 2, w: 18, d: 18, h: 38 };
  walls(ctx, base, (c, w, h, light) => stone(c, w, h, { base: LIMESTONE, light, seed: 9 }, 6), {
    left: (c, w, h, l) => {
      archPath(c, w / 2 - 4.5, h, 9, 22);
      c.fillStyle = css(shade(0x3a2e22, l));
      c.fill();
    },
  });
  flatTop(ctx, base, LIMESTONE);
  outlineBox(ctx, base, 0x4a3a24);
  let y = roofPoint(base, base.w / 2, base.d / 2).y;
  const stage = (r: number, h: number, balcony: boolean): void => {
    cylinder(ctx, cx, y, r, h, LIMESTONE, false);
    for (let k = 7; k < h - 3; k += 9) {
      ctx.strokeStyle = css(shade(LIMESTONE, 0.75), 0.6);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.ellipse(cx, y - k, r, r * 0.45, 0, 0, Math.PI);
      ctx.stroke();
    }
    y -= h;
    if (!balcony) return;
    // Corbelled balcony with a pierced railing.
    cylinder(ctx, cx, y + 3, r + 3.5, 3, shade(LIMESTONE, 0.88), true);
    ctx.strokeStyle = css(0x6a5a3a, 0.9);
    ctx.lineWidth = 0.7;
    for (let a = 0.15; a < Math.PI; a += 0.32) {
      const x = cx + Math.cos(a) * (r + 3.2);
      const yy = y + Math.sin(a) * (r + 3.2) * 0.45;
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x, yy - 4);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.ellipse(cx, y - 4, r + 3.2, (r + 3.2) * 0.45, 0, 0, Math.PI);
    ctx.stroke();
  };
  stage(7, 40, true);
  stage(5.5, 26, true);
  stage(4, 9, false);
  // The spire, a lead-grey cone, and its crescent.
  const spire = ctx.createLinearGradient(cx - 4, 0, cx + 4, 0);
  spire.addColorStop(0, css(0xd8dcdc));
  spire.addColorStop(1, css(0x7a8080));
  ctx.fillStyle = spire;
  ctx.beginPath();
  ctx.moveTo(cx - 4.5, y);
  ctx.lineTo(cx, y - 18);
  ctx.lineTo(cx + 4.5, y);
  ctx.ellipse(cx, y, 4.5, 2, 0, 0, Math.PI);
  ctx.fill();
  ctx.strokeStyle = css(GOLD);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, y - 18);
  ctx.lineTo(cx, y - 22);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, y - 24.5, 2.2, Math.PI * 0.35, Math.PI * 1.65);
  ctx.stroke();
}

/** The Station of Abraham: a gilded grille kiosk under a small dome, on a marble step. */
export function drawMaqam(ctx: Ctx, cx: number, ground: number): void {
  const plinth: IsoBox = { x: cx, y: ground, w: 18, d: 18, h: 5 };
  groundShadow(ctx, plinth, 4, 0.25);
  walls(ctx, plinth, (c, w, h, light) => stone(c, w, h, { base: 0xd8d4cc, light, seed: 12 }, 2.5));
  flatTop(ctx, plinth, 0xe0dcd4);
  outlineBox(ctx, plinth, 0x4a3a24);
  const at = roofPoint(plinth, 16, 2);
  const kiosk: IsoBox = { x: at.x, y: at.y, w: 14, d: 14, h: 30 };
  const grille = (c: Ctx, w: number, h: number, l: number) => clipped(c, w, h, () => {
    c.fillStyle = css(shade(0x2a1e14, l));
    c.fillRect(0, 0, w, h);
    c.strokeStyle = css(shade(GOLD, l * 1.05));
    c.lineWidth = 0.8;
    for (let k = -h; k < w + h; k += 2.6) {
      c.beginPath();
      c.moveTo(k, 0);
      c.lineTo(k + h, h);
      c.moveTo(k + h, 0);
      c.lineTo(k, h);
      c.stroke();
    }
    c.fillStyle = css(shade(mix(GOLD, 0xffffff, 0.2), l));
    c.fillRect(0, 0, w, 2);
    c.fillRect(0, 0, 1.4, h);
    c.fillRect(w - 1.4, 0, 1.4, h);
  });
  onLeftWall(ctx, kiosk, (w, h) => grille(ctx, w, h, LIGHT.left));
  onRightWall(ctx, kiosk, (w, h) => grille(ctx, w, h, LIGHT.right));
  flatTop(ctx, kiosk, GOLD);
  outlineBox(ctx, kiosk, 0x4a3a24);
  const top = roofPoint(kiosk, 7, 7);
  dome(ctx, top.x, top.y + 1, 7.5, { color: WHITEWASH, drum: 2, drumColor: GOLD, bulb: 1.1, finial: true });
}
