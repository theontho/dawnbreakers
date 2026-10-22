import type Phaser from 'phaser';
import { css, paintTexture, rng, shade, type Ctx } from './canvasKit';
import { foliageClump } from './fieldKit';
import { contactShadow, moss } from './woodland';

/**
 * The pollard of the Mázindarán villages: a willow, elm or hornbeam cut
 * back to its head every few years for fodder and firewood, so it grows as
 * a short thick trunk, gnarled and hollowed, crowned with a knob from which
 * a sheaf of straight young shoots springs, 3 to 5 m in all. They line
 * field banks and lanes. One cell; the trunk on the cell centre.
 */

const FOOT = 16;

export interface PollardStyle {
  /** Total height in px, to the tips of the shoots. */
  height: number;
  /** Height of the cut head. */
  head: number;
  /** Trunk width. */
  bole: number;
  bark: number;
  leaves: readonly number[];
  seed: number;
}

/** Pollards of 3.3 to 5 m: willow-grey, elm-brown, and one freshly cut. */
export const POLLARD_VARIANTS: readonly PollardStyle[] = [
  { height: 104, head: 52, bole: 15, bark: 0x6a6252, seed: 1001, leaves: [0x6a7a3a, 0x8a9a46, 0xa8a24a, 0x5a6e34] },
  { height: 88, head: 44, bole: 13, bark: 0x5a4a38, seed: 1009, leaves: [0x5a7a32, 0x7a8a3a, 0xb09a3a] },
  { height: 115, head: 60, bole: 17, bark: 0x726a5a, seed: 1013, leaves: [0x6f8a42, 0x93a24e, 0x5f7238, 0xc0a848] },
  { height: 76, head: 50, bole: 14, bark: 0x5e5040, seed: 1021, leaves: [0x6a8a3a, 0x86a046] },
];

export function paintPollard(scene: Phaser.Scene, key: string, s: PollardStyle): void {
  const reach = (s.height - s.head) * 0.55 + s.bole;
  const w = Math.ceil(reach * 2 + 16);
  const h = s.height + FOOT + 6;
  paintTexture(scene, key, w, h, ctx => {
    const cx = w / 2;
    const ground = h - FOOT;
    const rand = rng(s.seed);
    contactShadow(ctx, cx + 4, ground + 1, reach * 0.7, reach * 0.24, 0.26);
    const headY = ground - s.head;
    // Shoots behind the head first, then the trunk and knob, then the shoots in front.
    const shoots = Array.from({ length: 14 }, (_, i) => {
      const t = i / 13 - 0.5;
      const len = (s.height - s.head) * (0.75 + rand() * 0.25) * (1 - Math.abs(t) * 0.3);
      const lean = t * 1.5 + (rand() - 0.5) * 0.2;
      return { x0: cx + t * s.bole * 0.9, x1: cx + Math.sin(lean) * len, y1: headY - Math.cos(lean) * len, back: rand() < 0.45 };
    });
    for (const sh of shoots.filter(x => x.back)) shoot(ctx, sh.x0, headY, sh.x1, sh.y1, s, rand);
    trunk(ctx, cx, ground, headY, s);
    for (const sh of shoots.filter(x => !x.back)) shoot(ctx, sh.x0, headY, sh.x1, sh.y1, s, rand);
  });
}

/** The short trunk, swelling into the cut knob, with a dark hollow and moss. */
function trunk(ctx: Ctx, cx: number, ground: number, headY: number, s: PollardStyle): void {
  const half = s.bole / 2;
  const g = ctx.createLinearGradient(cx - half * 1.6, 0, cx + half * 1.6, 0);
  g.addColorStop(0, css(shade(s.bark, 1.3)));
  g.addColorStop(0.45, css(s.bark));
  g.addColorStop(1, css(shade(s.bark, 0.5)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(cx - half * 1.5, ground + 2);
  ctx.quadraticCurveTo(cx - half * 0.8, ground - 8, cx - half, ground - s.head * 0.5);
  ctx.quadraticCurveTo(cx - half * 1.1, headY + 6, cx - half * 1.6, headY);
  ctx.quadraticCurveTo(cx, headY - half * 1.1, cx + half * 1.6, headY);
  ctx.quadraticCurveTo(cx + half * 1.1, headY + 6, cx + half, ground - s.head * 0.5);
  ctx.quadraticCurveTo(cx + half * 0.8, ground - 8, cx + half * 1.5, ground + 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,12,6,0.55)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  // Old cut stubs about the knob.
  ctx.fillStyle = css(shade(s.bark, 1.5));
  for (const t of [-0.9, -0.3, 0.4, 1]) {
    ctx.beginPath();
    ctx.ellipse(cx + t * half, headY - 1 - Math.abs(t) * -2, 2.2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Furrows, and the hollow where the heart has rotted.
  ctx.strokeStyle = css(shade(s.bark, 0.5), 0.6);
  ctx.lineWidth = 0.7;
  for (const t of [-0.5, -0.1, 0.35]) {
    ctx.beginPath();
    ctx.moveTo(cx + t * s.bole, ground - 2);
    ctx.quadraticCurveTo(cx + t * s.bole * 1.2, ground - s.head * 0.5, cx + t * s.bole * 1.4, headY + 4);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(18,10,4,0.75)';
  ctx.beginPath();
  ctx.ellipse(cx + half * 0.15, ground - s.head * 0.42, half * 0.22, s.head * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  moss(ctx, cx - half * 0.5, ground - 6, half * 0.6, 5, s.seed, 0x4a6d32);
}

/** One straight young rod, reddish where the bark is new, with sparse leaves toward its tip. */
function shoot(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, s: PollardStyle, rand: () => number): void {
  ctx.strokeStyle = css(shade(0x7a4a2e, 0.8 + rand() * 0.4));
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + 2, x1, y1);
  ctx.stroke();
  for (let t = 0.55; t <= 1; t += 0.22) {
    if (rand() < 0.3) continue;
    const x = x0 + (x1 - x0) * t + (rand() - 0.5) * 3;
    const y = y0 + (y1 - y0) * t;
    foliageClump(ctx, x, y, 3 + rand() * 2, {
      leaf: s.leaves[Math.floor(rand() * s.leaves.length)]!,
      seed: s.seed + Math.round(x * 13 + y),
      masses: 4,
      squash: 1.1,
    });
  }
}
