import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, onRoof, paintTexture, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { clothMesh, lerp3, toScreen, valance, worldLine, type WorldPt } from './clothMesh';
import { drawPavilion, type TentStyle } from './pavilion';
import { post, subBox, type Pt } from './structureParts';

/**
 * The encampment at Badasht in the summer of 1848: pavilion tents of dyed
 * cloth with appliquéd borders, and the open garden canopy where the
 * companions sat.
 */

export const QUDDUS_TENT: TentStyle = { cloth: 0x48613e, trim: 0xc9a55c, lining: 0xead8aa, seed: 221 };
export const RECONCILIATION_TENT: TentStyle = { cloth: 0x3f4f70, trim: 0xd8b56a, lining: 0xead8aa, seed: 231, awning: true };

const POLE = 0x6a4428;

/** A pavilion tent on a `cellsW` x `cellsD` footprint. */
export function paintTent(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, style: TentStyle): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 74, 16);
  paintTexture(scene, key, texW, texH, ctx => drawPavilion(ctx, box, style));
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

/**
 * The garden canopy: a striped cloth roof on slender poles, high enough to
 * stand under, sagging between the poles over carpets and bolsters.
 */
export function paintGardenCanopy(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const poleH = 50;
  const rise = 14;
  const { box, texW, texH } = footprintBox(cellsW, cellsD, poleH + rise, 18);
  paintTexture(scene, key, texW, texH, ctx => {
    const cloth = 0x8d3f42;
    const stripe = 0xe8d8b0;
    const { w, d } = box;
    const p0 = 5;
    const p1 = w - 5;
    const q0 = 6;
    const q1 = d - 4;
    const qm = (q0 + q1) / 2;
    const ground: IsoBox = { ...box, h: 0 };
    groundShadow(ctx, { ...box, h: 4 }, 6, 0.18);
    carpet(ctx, subBox(ground, 10, w - 10, 10, d - 9, 1.5));
    // Poles: corners and the middle of each long side, back to front.
    const poles: Array<[number, number]> = [[p0, q1], [(p0 + p1) / 2, q1], [p1, q1], [p0, q0], [(p0 + p1) / 2, q0], [p1, q0]];
    for (const [p, q] of poles.slice(0, 3)) {
      const foot = toScreen(box, { p, q, z: 0 });
      post(ctx, foot.x, foot.y, poleH, 2, POLE);
    }
    // The cloth sags between the poles along the eave and droops across the slope.
    const eaveZ = (t: number) => poleH - 4 * Math.abs(Math.sin(Math.PI * 2 * t));
    const ridge = (t: number): WorldPt => ({ p: p0 + (p1 - p0) * t, q: qm, z: poleH + rise - 4 * Math.abs(Math.sin(Math.PI * t)) });
    const eave = (t: number): WorldPt => ({ p: p0 - 1 + (p1 - p0 + 2) * t, q: q0 - 1, z: eaveZ(t) });
    const end = (t: number): WorldPt => ({ p: p1 + 1, q: q0 - 1 + (qm - q0 + 1) * t, z: eaveZ(0) + rise * t });
    const color = (u: number) => (Math.floor(u * 12) % 2 ? stripe : cloth);
    // The shaded end of the roof, then the long slope.
    clothMesh(ctx, box, (u, v) => {
      const top = end(u);
      const back: WorldPt = { p: p1 + 1, q: q1 + 1 - (q1 - qm + 1) * u, z: eaveZ(0) + rise * u };
      const pt = lerp3(top, back, v);
      return { ...pt, z: pt.z - 1.5 * Math.sin(Math.PI * v) };
    }, { nu: 6, nv: 6, color: () => shade(cloth, 0.95) });
    clothMesh(ctx, box, (u, v) => {
      const pt = lerp3(ridge(u), eave(u), v);
      return { ...pt, z: pt.z - 2.2 * Math.sin(Math.PI * v) * (0.5 + 0.5 * Math.abs(Math.sin(Math.PI * 2 * u))) };
    }, { nu: 36, nv: 6, color: u => color(u) });
    valance(ctx, box, Array.from({ length: 13 }, (_, i) => eave(i / 12)), 3.5, shade(cloth, 0.85), 0xd8b56a);
    valance(ctx, box, Array.from({ length: 5 }, (_, i) => ({ p: p1 + 1, q: q0 - 1 + (q1 - q0 + 2) * (i / 4), z: eaveZ(0) })), 3.5, shade(cloth, 0.62), 0xd8b56a);
    ctx.strokeStyle = css(0xc9a55c);
    ctx.lineWidth = 1.4;
    worldLine(ctx, box, Array.from({ length: 11 }, (_, i) => ridge(i / 10)));
    for (const [p, q] of poles.slice(3)) {
      const foot = toScreen(box, { p, q, z: 0 });
      post(ctx, foot.x, foot.y, eaveZ((p - p0) / (p1 - p0)) + 1, 2, POLE);
    }
    for (const t of [0, 1]) finial(ctx, toScreen(box, ridge(t)));
  });
}

/** Carpets spread on the grass, bolsters along the back edges and a brass tray of pomegranates. */
function carpet(ctx: Ctx, rug: IsoBox): void {
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
  const at = (p: number, q: number) => toScreen(rug, { p, q, z: rug.h });
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
  bolster(at(4, rug.d - 4), at(rug.w - 4, rug.d - 4));
  bolster(at(4, 4), at(4, rug.d - 4));
  const tray = at(rug.w * 0.55, rug.d * 0.45);
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
}
