import type Phaser from 'phaser';
import { css, paintTexture, polygon, shade, type Ctx, type IsoBox } from './canvasKit';
import { cellCentredBox, ellipseShadow } from './fieldKit';
import { liftedPoint } from './structureParts';

/**
 * A copyist's place on the floor, as Qajar scribes worked: no table, but a
 * felt mat to sit on, a thin lap board (takhta) held on the raised knee
 * with the sheet on it, a lacquered pen case (qalamdán) laid beside, a brass
 * inkwell, and the finished pages wrapped in a cloth bundle (buqcha). At
 * true scale (1 m is about 23 px) the mat is 1.2 m and the board 40 cm.
 */

const FELT = 0xb89a6a;
const BOARD = 0x6a4428;
const PAPER = 0xf0e4c4;
const LACQUER = 0x7a2a1e;
const BRASS = 0xb08a3a;
const BUNDLE = 0x2f4a6a;

type Pt = { x: number; y: number };
const at = (box: IsoBox, p: number, q: number, z = 0): Pt => liftedPoint(box, p, q, z);

/** A flat quad lying on the box's ground at height `z`, corners (p0, q0) to (p1, q1). */
function flat(ctx: Ctx, box: IsoBox, p0: number, q0: number, p1: number, q1: number, z: number, fill: number, edge?: number): void {
  polygon(ctx, [at(box, p0, q0, z), at(box, p1, q0, z), at(box, p1, q1, z), at(box, p0, q1, z)]);
  ctx.fillStyle = css(fill);
  ctx.fill();
  if (edge === undefined) return;
  ctx.strokeStyle = css(edge, 0.8);
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

/** The felt mat (namad) with its pressed border. */
function mat(ctx: Ctx, box: IsoBox): void {
  flat(ctx, box, 0, 0, box.w, box.d, 0, FELT, 0x5a4428);
  flat(ctx, box, 2.5, 2.5, box.w - 2.5, box.d - 2.5, 0, shade(FELT, 1.08), 0x7a3a26);
  ctx.fillStyle = css(0x7a3a26, 0.6);
  for (const [p, q] of [[box.w / 2, box.d / 2], [box.w * 0.3, box.d * 0.7], [box.w * 0.7, box.d * 0.3]] as const) {
    const c = at(box, p, q);
    ctx.beginPath();
    ctx.ellipse(c.x, c.y, 2, 1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The lap board propped on a folded cloth, tilted up toward the sitter, a half-written sheet on it. */
function lapBoard(ctx: Ctx, box: IsoBox): void {
  const p0 = 5;
  const p1 = 15;
  const q0 = 7;
  const q1 = 14;
  // The folded cloth that props the far edge, then the board's thickness and face.
  flat(ctx, box, p0 + 1, q1 - 2, p1 - 1, q1 + 1, 2, 0x8a6a4a);
  const face = [at(box, p0, q0, 1.5), at(box, p1, q0, 1.5), at(box, p1, q1, 4.5), at(box, p0, q1, 4.5)];
  polygon(ctx, face.map(pt => ({ x: pt.x, y: pt.y + 1.2 })));
  ctx.fillStyle = css(shade(BOARD, 0.6));
  ctx.fill();
  polygon(ctx, face);
  ctx.fillStyle = css(BOARD);
  ctx.fill();
  ctx.strokeStyle = css(0x2a1a0e, 0.8);
  ctx.lineWidth = 0.6;
  ctx.stroke();
  const sheet = [at(box, p0 + 1.5, q0 + 1, 2), at(box, p1 - 1.5, q0 + 1, 2), at(box, p1 - 1.5, q1 - 1, 4.2), at(box, p0 + 1.5, q1 - 1, 4.2)];
  polygon(ctx, sheet);
  ctx.fillStyle = css(PAPER);
  ctx.fill();
  // Lines of nasta'líq run along the sheet; the lower ones not yet written.
  ctx.strokeStyle = css(0x2a2018, 0.7);
  ctx.lineWidth = 0.5;
  for (let q = q0 + 3; q < q1 - 1.5; q += 1.6) {
    const a = at(box, p0 + 2.5, q, 2 + (q - q0) * 0.4);
    const b = at(box, p1 - 2.5, q, 2 + (q - q0) * 0.4);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

/** The qalamdán: a long lacquered box with rounded ends, a gilt line along its lid. */
function penCase(ctx: Ctx, box: IsoBox): void {
  const a = at(box, 4, 4, 1.4);
  const b = at(box, 16, 4, 1.4);
  ctx.lineCap = 'round';
  ctx.strokeStyle = css(shade(LACQUER, 0.55));
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y + 0.8);
  ctx.lineTo(b.x, b.y + 0.8);
  ctx.stroke();
  ctx.strokeStyle = css(LACQUER);
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.strokeStyle = css(0xd8b060, 0.9);
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(a.x + 1, a.y - 0.6);
  ctx.lineTo(b.x - 1, b.y - 0.6);
  ctx.stroke();
  // A reed pen laid across it.
  const r0 = at(box, 9, 1.5, 2.2);
  const r1 = at(box, 13, 8, 2.2);
  ctx.strokeStyle = css(0xc8a868);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(r0.x, r0.y);
  ctx.lineTo(r1.x, r1.y);
  ctx.stroke();
}

/** The brass inkwell (davát) with its dark mouth. */
function inkwell(ctx: Ctx, box: IsoBox): void {
  const c = at(box, 19, 6);
  ellipseShadow(ctx, c.x + 1, c.y, 3, 1.2, 0.3);
  ctx.fillStyle = css(BRASS);
  ctx.fillRect(c.x - 1.8, c.y - 3, 3.6, 3);
  ctx.beginPath();
  ctx.ellipse(c.x, c.y - 3, 1.8, 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = css(shade(BRASS, 1.25));
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(c.x, c.y - 3.1, 0.8, 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = css(0x120a04);
  ctx.fill();
}

/** The finished pages, stacked and tied in a cloth bundle at the mat's back corner. */
function bundle(ctx: Ctx, box: IsoBox): void {
  const c = at(box, box.w - 6, box.d - 5);
  ellipseShadow(ctx, c.x + 1, c.y + 0.5, 6, 2.2, 0.3);
  ctx.fillStyle = css(shade(BUNDLE, 0.7));
  ctx.beginPath();
  ctx.ellipse(c.x, c.y - 1.5, 5.5, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(BUNDLE);
  ctx.beginPath();
  ctx.ellipse(c.x - 0.3, c.y - 2.6, 5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  // The knot on top, and a page's edge showing.
  ctx.fillStyle = css(shade(BUNDLE, 1.3));
  ctx.beginPath();
  ctx.ellipse(c.x, c.y - 4.6, 1.6, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(PAPER);
  ctx.fillRect(c.x - 4.2, c.y - 1.6, 3, 0.8);
}

/** A copyist's floor place: felt mat, lap board with a sheet, pen case and reed, inkwell, wrapped pages. */
export function paintFloorWritingBoard(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 40, ctx => {
    const box = cellCentredBox(40, 28, 0, 22);
    ellipseShadow(ctx, 32, 32, 18, 5, 0.18);
    mat(ctx, box);
    bundle(ctx, box);
    inkwell(ctx, box);
    lapBoard(ctx, box);
    penCase(ctx, box);
  });
}
