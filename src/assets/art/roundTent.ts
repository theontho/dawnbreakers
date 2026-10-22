import { css, mix, shade, type Ctx, type IsoBox } from './canvasKit';
import { clothMesh, toScreen, type WorldPt } from './clothMesh';
import { ellipseShadow } from './structureParts';

/**
 * A round Qajar army tent: a short drum of canvas that bellies out at the
 * hem, a tall cone that sags between its ribs, a painted valance of red
 * and blue scallops, and a door flap pinned back on the sunlit side.
 */

const CANVAS = 0xd8cba8;
const RIBS = 12;

export interface RoundTentStyle {
  canvas?: number;
  /** Height of the cone's apex above the ground. */
  apex?: number;
  pennant?: number;
}

export function drawRoundTent(ctx: Ctx, box: IsoBox, style: RoundTentStyle = {}): void {
  const canvas = style.canvas ?? CANVAS;
  const cp = box.w / 2;
  const cq = box.d / 2;
  const R = Math.min(box.w, box.d) / 2 - 5;
  const E = 18;
  const apexZ = style.apex ?? 80;
  const ribSag = (theta: number) => Math.abs(Math.sin((RIBS / 2) * theta));
  const at = (theta: number, r: number, z: number): WorldPt => ({ p: cp + Math.cos(theta) * r, q: cq + Math.sin(theta) * r, z });
  // A point on the cloth at angle `theta` and height `z`, wall or cone.
  const onCloth = (theta: number, z: number): WorldPt => {
    if (z <= E) return at(theta, R + 2.2 * (1 - z / E) ** 2 + 0.8 * ribSag(theta), z);
    const t = (z - E) / (apexZ - E);
    return at(theta, (R + 2) * (1 - t), z);
  };

  const centre = toScreen(box, { p: cp, q: cq, z: 0 });
  ellipseShadow(ctx, centre.x + 6, centre.y + 2, R * 1.55, R * 0.8, 0.26);
  pegs(ctx, box, at, R, apexZ, 'back');

  const stripe = (u: number) => (Math.floor(u * RIBS * 2) % 2 ? shade(canvas, 0.96) : canvas);
  // Wall drum.
  clothMesh(ctx, box, (u, v) => onCloth(u * Math.PI * 2, E * (1 - v)), {
    nu: 48, nv: 4, sort: true,
    color: (u, v) => (v > 0.75 ? mix(canvas, 0x6a5a40, 0.25) : stripe(u)),
  });
  // Cone: each gore sags between its ribs, most near the middle of the slope.
  clothMesh(ctx, box, (u, v) => {
    const theta = u * Math.PI * 2;
    const z = apexZ - (apexZ - E) * v;
    const pt = at(theta, (R + 2) * v, z);
    return { ...pt, z: pt.z - 3 * ribSag(theta) * Math.sin(Math.PI * v) };
  }, { nu: 48, nv: 8, sort: true, color: u => stripe(u) });

  // Rib seams down the visible side of the cone.
  ctx.strokeStyle = css(shade(canvas, 0.62), 0.55);
  ctx.lineWidth = 0.7;
  for (let i = 0; i < RIBS; i++) {
    const theta = (i / RIBS) * Math.PI * 2;
    if (Math.cos(theta) - Math.sin(theta) < -0.2) continue;
    const a = toScreen(box, { p: cp, q: cq, z: apexZ });
    const b = toScreen(box, at(theta, R + 2, E));
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  // Valance: red and blue scallops, one per gore, along the visible eave.
  for (let i = 0; i < RIBS * 2; i++) {
    const t0 = (i / (RIBS * 2)) * Math.PI * 2;
    const t1 = ((i + 1) / (RIBS * 2)) * Math.PI * 2;
    const mid = (t0 + t1) / 2;
    if (Math.cos(mid) - Math.sin(mid) < -0.35) continue;
    const a = toScreen(box, at(t0, R + 2.4, E + 0.5));
    const b = toScreen(box, at(t1, R + 2.4, E + 0.5));
    const lit = 0.75 + 0.3 * (-Math.sin(mid) * 0.7 - Math.cos(mid) * 0.3);
    ctx.fillStyle = css(shade(i % 2 ? 0x2e4a7a : 0x9c2a2a, lit));
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + 7, a.x, a.y);
    ctx.fill();
  }
  door(ctx, box, onCloth, -Math.PI * 0.62, canvas);
  pegs(ctx, box, at, R, apexZ, 'front');
  // Pole cap and pennant.
  const top = toScreen(box, { p: cp, q: cq, z: apexZ });
  ctx.strokeStyle = css(0x4a3220);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(top.x, top.y + 2);
  ctx.lineTo(top.x, top.y - 12);
  ctx.stroke();
  ctx.fillStyle = css(style.pennant ?? 0x9c2a2a);
  ctx.beginPath();
  ctx.moveTo(top.x + 1, top.y - 12);
  ctx.quadraticCurveTo(top.x + 8, top.y - 13, top.x + 14, top.y - 8);
  ctx.quadraticCurveTo(top.x + 8, top.y - 8, top.x + 1, top.y - 6);
  ctx.closePath();
  ctx.fill();
}

/** A person-high slit in the canvas, its flap pinned back, dark within. */
function door(ctx: Ctx, box: IsoBox, onCloth: (theta: number, z: number) => WorldPt, theta: number, canvas: number): void {
  const half = 0.2;
  const s = (t: number, z: number) => toScreen(box, onCloth(t, z));
  const l = s(theta - half, 0);
  const r = s(theta + half, 0);
  const top = s(theta, 36);
  ctx.fillStyle = css(0x1c120a);
  ctx.beginPath();
  ctx.moveTo(l.x, l.y);
  ctx.quadraticCurveTo(l.x + 2, top.y + 10, top.x, top.y);
  ctx.quadraticCurveTo(r.x - 1, top.y + 12, r.x, r.y);
  ctx.closePath();
  ctx.fill();
  // The flap, rolled back toward the light.
  const tie = s(theta + half + 0.14, 16);
  ctx.fillStyle = css(mix(canvas, 0x8a7a5a, 0.35));
  ctx.beginPath();
  ctx.moveTo(top.x, top.y);
  ctx.quadraticCurveTo(tie.x - 3, tie.y - 6, tie.x, tie.y);
  ctx.quadraticCurveTo(r.x + 4, r.y - 6, r.x + 3, r.y);
  ctx.lineTo(r.x, r.y);
  ctx.quadraticCurveTo(r.x - 1, top.y + 12, top.x, top.y);
  ctx.fill();
  ctx.fillStyle = css(0x9c2a2a);
  ctx.fillRect(tie.x - 1, tie.y - 0.5, 2.2, 1.5);
}

function pegs(ctx: Ctx, box: IsoBox, at: (theta: number, r: number, z: number) => WorldPt, R: number, apexZ: number, which: 'front' | 'back'): void {
  ctx.strokeStyle = 'rgba(200,184,140,0.85)';
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 6; i++) {
    const theta = (i / 6) * Math.PI * 2 + 0.3;
    const front = Math.cos(theta) - Math.sin(theta) > 0;
    if (front !== (which === 'front')) continue;
    const from = toScreen(box, at(theta, R * 0.55, apexZ * 0.55));
    const to = toScreen(box, at(theta, R + 13, 0));
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo((from.x + to.x) / 2, (from.y + to.y) / 2 + 2, to.x, to.y);
    ctx.stroke();
    ctx.fillStyle = css(0x4a3220);
    ctx.fillRect(to.x - 1, to.y - 3, 2, 3);
  }
}
