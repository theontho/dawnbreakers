import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, mix, onLeftWall, onRightWall, onRoof, paintTexture, polygon, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { LIGHT } from './ornaments';
import { glow, liftedPoint, onPlane, post, subBox, type Pt } from './structureParts';

/**
 * The encampment at Badasht in the summer of 1848: ridged pavilion tents
 * of dyed cloth with appliquéd borders, and the open garden canopy where
 * the companions sat.
 */

export interface TentStyle {
  cloth: number;
  trim: number;
  lining: number;
  seed: number;
}

export const QUDDUS_TENT: TentStyle = { cloth: 0x48613e, trim: 0xc9a55c, lining: 0xead8aa, seed: 221 };
export const RECONCILIATION_TENT: TentStyle = { cloth: 0x3f4f70, trim: 0xd8b56a, lining: 0xead8aa, seed: 231 };

const POLE = 0x6a4428;

/** A ridged pavilion tent: low cloth walls, a pitched roof, the door flap tied back on the sunlit side. */
export function paintTent(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, style: TentStyle): void {
  const rise = 28;
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 20, rise + 14);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 8, 0.24);
    guyRopes(ctx, box, rise, 'back');
    onRightWall(ctx, box, (w, h) => {
      gable(ctx, w, rise, style, LIGHT.right);
      clothWall(ctx, w, h, style, LIGHT.right);
    });
    onLeftWall(ctx, box, (w, h) => {
      clothWall(ctx, w, h, style, LIGHT.left);
      doorFlap(ctx, w * 0.55, h, style);
    });
    const ridge0 = liftedPoint(box, 0, box.d / 2, box.h + rise);
    const ridge1 = liftedPoint(box, box.w, box.d / 2, box.h + rise);
    const eave0 = roofPoint(box, 0, 0);
    onPlane(ctx, ridge0, ridge1, eave0, box.w, 30, (w, h) => roofCloth(ctx, w, h, style));
    outline(ctx, [roofPoint(box, 0, 0), groundPoint(box, 0, 0), groundPoint(box, box.w, 0), groundPoint(box, box.w, box.d), roofPoint(box, box.w, box.d), ridge1, ridge0]);
    ctx.strokeStyle = css(shade(style.trim, 1.1));
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ridge0.x, ridge0.y);
    ctx.lineTo(ridge1.x, ridge1.y);
    ctx.lineTo(roofPoint(box, box.w, 0).x, roofPoint(box, box.w, 0).y);
    ctx.stroke();
    for (const r of [ridge0, ridge1]) finial(ctx, r);
    guyRopes(ctx, box, rise, 'front');
  });
}

function clothWall(ctx: Ctx, w: number, h: number, style: TentStyle, light: number): void {
  const rand = rng(style.seed + Math.round(w));
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  ctx.fillStyle = css(shade(style.cloth, light));
  ctx.fillRect(0, 0, w, h);
  // Panels sewn edge to edge, each a shade apart.
  for (let u = 0; u < w; u += 8) {
    ctx.fillStyle = css(shade(style.cloth, light * (0.92 + rand() * 0.14)));
    ctx.fillRect(u, 0, 7.4, h);
  }
  // Appliquéd border along the hem: trim band with a running lozenge.
  ctx.fillStyle = css(shade(style.lining, light));
  ctx.fillRect(0, h - 6, w, 4.5);
  ctx.fillStyle = css(shade(style.trim, light));
  for (let u = 2; u < w; u += 5) {
    ctx.beginPath();
    ctx.moveTo(u, h - 3.75);
    ctx.lineTo(u + 1.8, h - 5.5);
    ctx.lineTo(u + 3.6, h - 3.75);
    ctx.lineTo(u + 1.8, h - 2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(30,20,10,0.35)';
  ctx.fillRect(0, h - 1.5, w, 1.5);
  // Scalloped valance hanging from the eave.
  ctx.fillStyle = css(shade(mix(style.cloth, 0x000000, 0.25), light));
  ctx.fillRect(0, 0, w, 3);
  for (let u = 0; u < w; u += 6) {
    ctx.beginPath();
    ctx.arc(u + 3, 3, 3, 0, Math.PI);
    ctx.fill();
  }
  ctx.fillStyle = css(shade(style.trim, light));
  for (let u = 0; u < w; u += 6) ctx.fillRect(u + 2.6, 5.5, 0.8, 1.5);
  ctx.restore();
}

function gable(ctx: Ctx, w: number, rise: number, style: TentStyle, light: number): void {
  ctx.beginPath();
  ctx.moveTo(0, 0.5);
  ctx.lineTo(w / 2, -rise);
  ctx.lineTo(w, 0.5);
  ctx.closePath();
  ctx.save();
  ctx.clip();
  ctx.fillStyle = css(shade(style.cloth, light * 0.95));
  ctx.fillRect(0, -rise, w, rise + 1);
  ctx.strokeStyle = css(shade(style.cloth, light * 0.75), 0.8);
  ctx.lineWidth = 0.8;
  for (let u = 4; u < w; u += 8) {
    ctx.beginPath();
    ctx.moveTo(w / 2, -rise);
    ctx.lineTo(u, 0);
    ctx.stroke();
  }
  // A shamsa medallion appliquéd in the gable.
  ctx.fillStyle = css(shade(style.trim, light));
  ctx.beginPath();
  ctx.arc(w / 2, -rise * 0.4, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(shade(style.lining, light));
  ctx.beginPath();
  ctx.arc(w / 2, -rise * 0.4, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The roof slope in face space: v runs from the ridge (0) down to the eave. */
function roofCloth(ctx: Ctx, w: number, h: number, style: TentStyle): void {
  const rand = rng(style.seed + 5);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, css(shade(style.cloth, 1.28)));
  g.addColorStop(1, css(shade(style.cloth, 1.02)));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  for (let u = 0; u < w; u += 8) {
    ctx.fillStyle = css(shade(style.cloth, 0.9 + rand() * 0.2), 0.35);
    ctx.fillRect(u, 0, 7.4, h);
    ctx.fillStyle = 'rgba(20,10,4,0.18)';
    ctx.fillRect(u + 7.4, 0, 0.6, h);
  }
  // Sag between the rafters: soft darker troughs.
  for (let u = 16; u < w; u += 24) {
    const sag = ctx.createLinearGradient(u - 8, 0, u + 8, 0);
    sag.addColorStop(0, 'rgba(0,0,0,0)');
    sag.addColorStop(0.5, 'rgba(0,0,0,0.12)');
    sag.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sag;
    ctx.fillRect(u - 8, h * 0.2, 16, h * 0.8);
  }
  ctx.fillStyle = css(style.lining);
  ctx.fillRect(0, h - 5, w, 3);
  ctx.fillStyle = css(style.trim);
  for (let u = 1; u < w; u += 4) ctx.fillRect(u, h - 4.2, 2, 1.4);
  ctx.fillStyle = css(shade(style.trim, 1.15));
  ctx.fillRect(0, 0, w, 1.5);
}

function doorFlap(ctx: Ctx, cx: number, h: number, style: TentStyle): void {
  const dw = 20;
  const top = 4;
  // The dark interior, a carpet and the glow of a lamp within.
  ctx.fillStyle = css(0x1e140c);
  ctx.beginPath();
  ctx.moveTo(cx - dw / 2, h);
  ctx.lineTo(cx - 2, top);
  ctx.lineTo(cx + 2, top);
  ctx.lineTo(cx + dw / 2, h);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.clip();
  glow(ctx, cx + 2, h - 6, 10, 0xffc070, 0.55);
  ctx.fillStyle = css(0x7f2a2a);
  ctx.fillRect(cx - dw / 2, h - 3, dw, 3);
  ctx.fillStyle = css(0xd8b870, 0.8);
  ctx.fillRect(cx - dw / 2, h - 3, dw, 0.6);
  ctx.restore();
  // Flaps tied back, showing their pale lining.
  for (const side of [-1, 1]) {
    ctx.fillStyle = css(shade(style.lining, side < 0 ? 1 : 0.85));
    ctx.beginPath();
    ctx.moveTo(cx + side * 2, top);
    ctx.quadraticCurveTo(cx + side * 6, h * 0.5, cx + side * (dw / 2 + 4), h);
    ctx.lineTo(cx + side * (dw / 2), h);
    ctx.quadraticCurveTo(cx + side * 4, h * 0.55, cx + side * 2, top);
    ctx.fill();
    ctx.fillStyle = css(style.trim);
    ctx.fillRect(cx + side * 6 - 1, h * 0.55, 2, 1.5);
  }
}

function guyRopes(ctx: Ctx, box: IsoBox, rise: number, which: 'front' | 'back'): void {
  ctx.strokeStyle = 'rgba(220,205,170,0.8)';
  ctx.lineWidth = 0.6;
  const ropes: Array<[Pt, Pt]> = which === 'front'
    ? [0.15, 0.4, 0.85].map(t => [roofPoint(box, box.w * t, 0), groundPoint(box, box.w * t - 4, -12)])
    : [[liftedPoint(box, 0, box.d / 2, box.h + rise), groundPoint(box, -12, box.d / 2)]];
  for (const [from, to] of ropes) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.fillStyle = css(0x4a3020);
    ctx.fillRect(to.x - 0.8, to.y - 2.5, 1.6, 3);
  }
}

function finial(ctx: Ctx, at: Pt): void {
  ctx.strokeStyle = css(POLE);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(at.x, at.y);
  ctx.lineTo(at.x, at.y - 7);
  ctx.stroke();
  const g = ctx.createRadialGradient(at.x - 0.8, at.y - 8.5, 0.3, at.x, at.y - 8, 2.4);
  g.addColorStop(0, '#fff0b0');
  g.addColorStop(1, '#a8802a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(at.x, at.y - 8, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

function outline(ctx: Ctx, pts: Pt[]): void {
  ctx.strokeStyle = 'rgba(28,18,10,0.8)';
  ctx.lineWidth = 1.1;
  polygon(ctx, pts);
  ctx.stroke();
}

/** The garden canopy: a shallow cloth roof on slender poles over carpets and bolsters. */
export function paintGardenCanopy(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const poleH = 32;
  // Steeper than a quarter of the depth, so the far slope stays hidden behind the ridge.
  const rise = 18;
  const { box, texW, texH } = footprintBox(cellsW, cellsD, poleH, rise + 14);
  paintTexture(scene, key, texW, texH, ctx => {
    const cloth = 0x8d3f42;
    const stripe = 0xe8d8b0;
    const ground: IsoBox = { ...box, h: 0 };
    groundShadow(ctx, { ...box, h: 4 }, 6, 0.18);
    // Carpets spread on the grass.
    const rug = subBox(ground, 8, box.w - 8, 8, box.d - 8, 1.5);
    onRoof(ctx, rug, (w, d) => {
      ctx.fillStyle = css(0x1f2f5a);
      ctx.fillRect(0, 0, w, d);
      ctx.fillStyle = css(0x7f2a2a);
      ctx.fillRect(3, 3, w - 6, d - 6);
      ctx.strokeStyle = css(0xd8b870, 0.85);
      ctx.lineWidth = 0.6;
      ctx.strokeRect(1.5, 1.5, w - 3, d - 3);
      ctx.strokeRect(5, 5, w - 10, d - 10);
      const rand = rng(241);
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = rand() < 0.5 ? 'rgba(216,184,112,0.55)' : 'rgba(40,60,110,0.5)';
        ctx.fillRect(6 + rand() * (w - 12), 6 + rand() * (d - 12), 1.2, 1.2);
      }
    });
    // Bolsters along the back edges and a brass tray of pomegranates.
    const bolster = (a: Pt, b: Pt) => {
      ctx.strokeStyle = css(0x3a5a3a);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - 3);
      ctx.lineTo(b.x, b.y - 3);
      ctx.stroke();
      ctx.strokeStyle = css(0x5a7a52);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x - 0.5, a.y - 4.5);
      ctx.lineTo(b.x - 0.5, b.y - 4.5);
      ctx.stroke();
    };
    bolster(roofPoint(rug, 4, 4), roofPoint(rug, 4, rug.d - 4));
    bolster(roofPoint(rug, 4, rug.d - 4), roofPoint(rug, rug.w - 4, rug.d - 4));
    const tray = roofPoint(rug, rug.w * 0.55, rug.d * 0.45);
    ctx.fillStyle = css(0xb88a3a);
    ctx.beginPath();
    ctx.ellipse(tray.x, tray.y, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0x7a5a20);
    ctx.lineWidth = 0.7;
    ctx.stroke();
    for (const [dx, dy] of [[-3, -1], [2, -1.5], [0, 1]] as const) {
      ctx.fillStyle = css(0xa8282a);
      ctx.beginPath();
      ctx.arc(tray.x + dx, tray.y + dy - 1.5, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Poles at the corners and the middle of each long side, back to front.
    const poles: Array<[number, number]> = [[0, box.d], [box.w / 2, box.d], [0, 0], [box.w, box.d], [box.w / 2, 0], [box.w, 0]];
    for (const [p, q] of poles) {
      const foot = groundPoint(box, p, q);
      post(ctx, foot.x, foot.y, poleH, 2, POLE);
    }
    // The cloth roof: a shallow ridge with striped slopes and a fringed valance.
    const ridge0 = liftedPoint(box, 0, box.d / 2, poleH + rise);
    const ridge1 = liftedPoint(box, box.w, box.d / 2, poleH + rise);
    const eave0 = roofPoint(box, 0, 0);
    const eave1 = roofPoint(box, box.w, 0);
    const back1 = roofPoint(box, box.w, box.d);
    onPlane(ctx, ridge0, ridge1, eave0, box.w, 20, (w, h) => {
      for (let u = 0; u < w; u += 8) {
        ctx.fillStyle = css(shade((u / 8) % 2 ? stripe : cloth, 1.1));
        ctx.fillRect(u, 0, 8, h);
      }
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,240,210,0.15)');
      g.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    });
    // The end of the roof, in shadow.
    polygon(ctx, [eave1, ridge1, back1]);
    ctx.fillStyle = css(shade(cloth, LIGHT.right * 0.95));
    ctx.fill();
    // Fringed valance on the two near edges.
    const valance = (a: Pt, b: Pt, light: number) => {
      const n = Math.max(4, Math.round(Math.hypot(b.x - a.x, b.y - a.y) / 7));
      for (let i = 0; i < n; i++) {
        const x0 = a.x + ((b.x - a.x) * i) / n;
        const y0 = a.y + ((b.y - a.y) * i) / n;
        const x1 = a.x + ((b.x - a.x) * (i + 1)) / n;
        const y1 = a.y + ((b.y - a.y) * (i + 1)) / n;
        ctx.fillStyle = css(shade(cloth, light * 0.85));
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 7, x0, y0);
        ctx.fill();
        ctx.fillStyle = css(0xd8b56a);
        ctx.fillRect((x0 + x1) / 2 - 0.5, (y0 + y1) / 2 + 3.5, 1, 2.5);
      }
    };
    valance(eave0, eave1, LIGHT.left);
    valance(eave1, back1, LIGHT.right);
    outline(ctx, [eave0, eave1, back1, ridge1, ridge0]);
    ctx.strokeStyle = css(0xc9a55c);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ridge0.x, ridge0.y);
    ctx.lineTo(ridge1.x, ridge1.y);
    ctx.stroke();
    for (const r of [ridge0, ridge1]) finial(ctx, r);
  });
}
