import type Phaser from 'phaser';
import { css, groundPoint, onLeftWall, onRightWall, onRoof, outlineBox, paintTexture, polygon, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { figure, type FigureStyle } from './crowds';
import { cellCentredBox, ellipseShadow } from './fieldKit';
import { plaster } from './materials';
import { archPath, LIGHT } from './ornaments';
import { glow, liftedPoint } from './structureParts';

/**
 * Inside the shrine of Shaykh Ṭabarsí, winter 1848-49: limewashed walls
 * gone grey with damp and lamp smoke, plain niches with clay lamps, the
 * old scholar's cenotaph under its faded cloth, and the few things the
 * companions brought with them.
 */

const LIMEWASH = 0xece6d4;

/** The chamber's walls, 4.5 m to the springing of the dome. */
export const SHRINE_WALL_H = 104;

/** A limewashed wall: damp rising from the floor, soot gathered under the dome. */
export function shrineWallFace(ctx: Ctx, w: number, h: number, l: number): void {
  plaster(ctx, w, h, { base: LIMEWASH, light: l, seed: 811 });
  const soot = ctx.createLinearGradient(0, 0, 0, h * 0.45);
  soot.addColorStop(0, 'rgba(36,30,26,0.22)');
  soot.addColorStop(1, 'rgba(36,30,26,0)');
  ctx.fillStyle = soot;
  ctx.fillRect(0, 0, w, h * 0.45);
  const damp = ctx.createLinearGradient(0, h - 20, 0, h);
  damp.addColorStop(0, 'rgba(70,82,60,0)');
  damp.addColorStop(1, 'rgba(70,82,60,0.4)');
  ctx.fillStyle = damp;
  ctx.fillRect(0, h - 20, w, 20);
  // A plain plaster skirting, and the cornice line under the dome.
  ctx.fillStyle = css(shade(0xb8b09a, l), 0.55);
  ctx.fillRect(0, h - 9, w, 9);
  ctx.fillStyle = css(shade(0xf2ecd8, l), 0.6);
  ctx.fillRect(0, h - 10, w, 1);
  ctx.fillStyle = css(shade(0xc8bfa8, l));
  ctx.fillRect(0, 0, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(0, 3, w, 1);
}

/** The same wall with a plain pointed niche (ṭāqcha) and its clay lamp, smoke plume above. */
export function shrineNicheFace(ctx: Ctx, w: number, h: number, l: number): void {
  shrineWallFace(ctx, w, h, l);
  const x = 9;
  const sill = h - 40;
  const plume = ctx.createLinearGradient(0, sill - 40, 0, sill - 14);
  plume.addColorStop(0, 'rgba(30,24,20,0)');
  plume.addColorStop(1, 'rgba(30,24,20,0.45)');
  ctx.fillStyle = plume;
  ctx.beginPath();
  ctx.moveTo(x + 2, sill - 14);
  ctx.quadraticCurveTo(x + 6, sill - 32, x + 6, sill - 44);
  ctx.lineTo(x + 7, sill - 44);
  ctx.quadraticCurveTo(x + 8, sill - 32, x + 10, sill - 14);
  ctx.closePath();
  ctx.fill();
  archPath(ctx, x - 1.5, sill + 1, 17, 25);
  ctx.fillStyle = css(shade(0xa49c88, l));
  ctx.fill();
  archPath(ctx, x, sill, 14, 22);
  const recess = ctx.createLinearGradient(0, sill - 22, 0, sill);
  recess.addColorStop(0, css(shade(0x2a2420, l)));
  recess.addColorStop(1, css(shade(0x6a5a44, l)));
  ctx.fillStyle = recess;
  ctx.fill();
  glow(ctx, x + 7, sill - 6, 12, 0xffc070, 0.6);
  // The lamp: a small clay dish with its spout and flame.
  ctx.fillStyle = css(shade(0x9a5a34, l));
  ctx.beginPath();
  ctx.ellipse(x + 6, sill - 1.6, 3.6, 1.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd36a';
  ctx.beginPath();
  ctx.ellipse(x + 8.6, sill - 4.2, 0.9, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(shade(0xd8d0bc, l));
  ctx.fillRect(x - 2, sill, 18, 1.5);
}

/** A point in a one-cell box's ground axes raised `z` pixels. */
const at = (box: IsoBox, p: number, q: number, z: number) => liftedPoint(box, p, q, z);

/**
 * The cenotaph of Shaykh Ṭabarsí: a plain plastered chest on a low step,
 * a green cloth faded almost to grey over it, candle stubs at its head.
 */
export function paintTomb(scene: Phaser.Scene, key: string): void {
  const texH = 80;
  paintTexture(scene, key, 80, texH, ctx => {
    ctx.translate(8, 0);
    const step = cellCentredBox(texH, 50, 5, 30);
    const onStep = cellCentredBox(texH, 44, 22, 22);
    const chest = { ...onStep, y: onStep.y - 4 };
    ellipseShadow(ctx, 34, texH - 16, 36, 13, 0.3);
    solidBox(ctx, step, 0x9a9484);
    solidBox(ctx, chest, LIMEWASH);
    // The cloth: over the top and hanging a hand's depth down each side, with a fringe.
    const cloth = 0x4a6a48;
    onRoof(ctx, chest, (w, d) => {
      ctx.fillStyle = css(shade(cloth, 0.9));
      ctx.fillRect(-1, -1, w + 2, d + 2);
      ctx.strokeStyle = css(0xc8b070, 0.7);
      ctx.lineWidth = 0.7;
      ctx.strokeRect(2, 2, w - 4, d - 4);
    });
    onLeftWall(ctx, chest, (w) => drape(ctx, w, cloth, LIGHT.left));
    onRightWall(ctx, chest, (w) => drape(ctx, w, cloth, LIGHT.right));
    outlineBox(ctx, chest);
    // Candle stubs and wax at the head (the far end).
    const rand = rng(83);
    for (let i = 0; i < 4; i++) {
      const base = at(step, 2 + rand() * 5, 5 + i * 6, 3);
      const hgt = 3 + rand() * 4;
      ctx.fillStyle = css(0xeee4c8);
      ctx.fillRect(base.x - 0.9, base.y - hgt, 1.8, hgt);
      if (i % 2 === 0) {
        glow(ctx, base.x, base.y - hgt - 1.5, 6, 0xffc070, 0.6);
        ctx.fillStyle = '#ffd36a';
        ctx.beginPath();
        ctx.ellipse(base.x, base.y - hgt - 1.5, 0.8, 1.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

function solidBox(ctx: Ctx, box: IsoBox, color: number): void {
  onLeftWall(ctx, box, (w, h) => plaster(ctx, w, h, { base: color, light: LIGHT.left, seed: 821 }));
  onRightWall(ctx, box, (w, h) => plaster(ctx, w, h, { base: color, light: LIGHT.right, seed: 822 }));
  onRoof(ctx, box, (w, d) => {
    ctx.fillStyle = css(shade(color, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
  });
  outlineBox(ctx, box);
}

function drape(ctx: Ctx, w: number, cloth: number, light: number): void {
  ctx.fillStyle = css(shade(cloth, light * 0.92));
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  for (let u = w; u >= 0; u -= 3) ctx.lineTo(u, 6 + (u % 6 === 0 ? 1 : 0));
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = css(shade(0xc8b070, light), 0.75);
  for (let u = 1; u < w; u += 2) ctx.fillRect(u, 6.5, 0.7, 1.6);
}

/** A folding Qur'án stand (raḥl) of carved walnut, the Book open on it, on a small prayer mat. */
export function paintRahl(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 48, ctx => {
    const mat = cellCentredBox(48, 22, 0, 16);
    polygon(ctx, [at(mat, 0, 0, 0), at(mat, mat.w, 0, 0), at(mat, mat.w, mat.d, 0), at(mat, 0, mat.d, 0)]);
    ctx.fillStyle = css(0x5a2a26);
    ctx.fill();
    ctx.strokeStyle = css(0xc8a868, 0.7);
    ctx.lineWidth = 0.7;
    ctx.stroke();
    const cx = 33;
    const foot = 36;
    ellipseShadow(ctx, cx, foot, 9, 3, 0.35);
    // Two crossed boards, the book cradled in the upper V.
    ctx.strokeStyle = css(0x4a2e18);
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - 6, foot);
    ctx.lineTo(cx + 5, foot - 13);
    ctx.moveTo(cx + 6, foot);
    ctx.lineTo(cx - 5, foot - 13);
    ctx.stroke();
    ctx.strokeStyle = css(0x8a5a30);
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // The open pages.
    for (const side of [-1, 1]) {
      ctx.fillStyle = css(side < 0 ? 0xf2e8cc : 0xd8ccae);
      ctx.beginPath();
      ctx.moveTo(cx, foot - 9);
      ctx.lineTo(cx + side * 8, foot - 13);
      ctx.lineTo(cx + side * 8, foot - 19);
      ctx.lineTo(cx, foot - 15);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = css(0x6a3a22, 0.8);
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.strokeStyle = css(0x3a2a20, 0.45);
      for (let k = 1; k < 4; k++) {
        ctx.beginPath();
        ctx.moveTo(cx + side * 1.5, foot - 10 - k * 1.4);
        ctx.lineTo(cx + side * 6.5, foot - 13 - k * 1.4);
        ctx.stroke();
      }
    }
  });
}

/** A brass oil lamp (pīh-sūz) on a tall stand, its flame low to save the oil. */
export function paintOilLamp(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 32, 64, ctx => {
    const cx = 16;
    const foot = 58;
    ellipseShadow(ctx, cx + 1, foot, 7, 2.4, 0.35);
    const brass = (x0: number, x1: number) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, '#f0d488');
      g.addColorStop(0.5, '#b8893a');
      g.addColorStop(1, '#5a4018');
      return g;
    };
    ctx.fillStyle = brass(cx - 6, cx + 6);
    ctx.beginPath();
    ctx.ellipse(cx, foot - 1.5, 6, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = brass(cx - 1.4, cx + 1.4);
    ctx.fillRect(cx - 1.2, foot - 30, 2.4, 29);
    for (const y of [foot - 10, foot - 22]) {
      ctx.beginPath();
      ctx.ellipse(cx, y, 2.4, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // The dish with its spout, and the flame.
    ctx.fillStyle = brass(cx - 6, cx + 6);
    ctx.beginPath();
    ctx.ellipse(cx, foot - 31, 5.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + 4, foot - 32);
    ctx.lineTo(cx + 8.5, foot - 33.5);
    ctx.lineTo(cx + 4.5, foot - 30.2);
    ctx.closePath();
    ctx.fill();
    glow(ctx, cx + 8, foot - 37, 13, 0xffc070, 0.55);
    ctx.fillStyle = '#ffd36a';
    ctx.beginPath();
    ctx.ellipse(cx + 8, foot - 36.5, 1.2, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff4c8';
    ctx.beginPath();
    ctx.ellipse(cx + 8, foot - 35.8, 0.5, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** A companion's whole estate: a rolled felt, a folded cloak, a wooden bowl. */
export function paintBedroll(scene: Phaser.Scene, key: string, felt = 0xa8946a, cloak = 0x5a4a3a): void {
  // A felt as long as a man, laid along the wall.
  paintTexture(scene, key, 80, 44, ctx => {
    ctx.translate(8, 0);
    const box = cellCentredBox(44, 40, 0, 20);
    const g = (p: number, q: number, z = 0) => groundPoint({ ...box, y: box.y - z }, p, q);
    ellipseShadow(ctx, 34, 33, 28, 8, 0.3);
    // The felt, unrolled halfway along the wall.
    polygon(ctx, [g(0, 2), g(box.w, 2), g(box.w, box.d - 2), g(0, box.d - 2)]);
    ctx.fillStyle = css(felt);
    ctx.fill();
    ctx.strokeStyle = css(shade(felt, 0.6), 0.8);
    ctx.lineWidth = 0.7;
    ctx.stroke();
    const roll = g(3, box.d / 2, 3);
    const rollEnd = g(3, box.d / 2 + 0.1, 3);
    ctx.fillStyle = css(shade(felt, 0.85));
    ctx.beginPath();
    ctx.ellipse(roll.x, roll.y, 5, 9.5, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(shade(felt, 0.55));
    ctx.beginPath();
    ctx.ellipse(rollEnd.x - 1, rollEnd.y + 1, 2, 2.6, 0.9, 0, Math.PI * 2);
    ctx.stroke();
    // The cloak, folded square.
    const c = [g(16, 4, 2), g(28, 4, 2), g(28, 15, 2), g(16, 15, 2)];
    polygon(ctx, c);
    ctx.fillStyle = css(cloak);
    ctx.fill();
    ctx.strokeStyle = css(shade(cloak, 1.5), 0.6);
    ctx.stroke();
    // The bowl.
    const b = g(33, 16, 0);
    ctx.fillStyle = css(0x6a4424);
    ctx.beginPath();
    ctx.ellipse(b.x, b.y - 1, 3.4, 1.6, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = css(0x3a2414);
    ctx.beginPath();
    ctx.ellipse(b.x, b.y - 1.4, 3.2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

const KNEELERS: ReadonlyArray<{ dx: number; dy: number; style: FigureStyle }> = [
  { dx: 22, dy: 34, style: { robe: 0x4a4036, trim: 0x8a7450, head: 'turban', headColor: 0xe0d8c4, skin: 0xcfae80, beard: 0x2d2018, seated: true, height: 40 } },
  { dx: 42, dy: 38, style: { robe: 0x3a4038, head: 'kolah', headColor: 0x2a2218, skin: 0xc8a676, beard: 0x3a2a1c, seated: true, height: 40 } },
];

/** Two companions kneeling in prayer on the bare floor, keeping the night watch at the tomb. */
export function paintKneelingCompanions(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 44, ctx => {
    for (const k of KNEELERS) figure(ctx, k.dx, k.dy, k.style);
  });
}
