import type Phaser from 'phaser';
import { baseCorners, css, footprintBox, groundShadow, outlineBox, paintTexture, polygon, shade, topCorners, type Ctx, type IsoBox } from './canvasKit';
import { planks, stone } from './materials';
import { flatTop, LIGHT, walls } from './ornaments';
import { liftedPoint, subBox, type Pt } from './structureParts';
import { logCourses, roundLog } from './timber';

/**
 * The companions' watchtowers at Ṭabarsí, at true scale (2 x 2 cells, about
 * 9.5 m to the roof's peak): a log blockhouse a little taller than the
 * palisade it anchors, an open frame of braced posts above it with a
 * ladder, and a lookout gallery 5.5 m up that overhangs on brackets under a
 * steep thatched roof.
 */

const POST = 0x3d2816;
const BASE_H = 100;
const DECK = 128;
const BREAST = 24;
const LOOKOUT = 40;
const APEX = 34;
const COURSE = 7;

export function paintWatchtower(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(2, 2, DECK + 4 + BREAST + LOOKOUT, APEX + 14);
  const pad = 12;
  paintTexture(scene, key, texW + pad * 2, texH, ctx => {
    ctx.translate(pad, 0);
    const { w, d } = box;
    groundShadow(ctx, box, 7, 0.3);
    const footing = subBox(box, 0, w, 0, d, 12);
    const block = subBox(box, 3, w - 3, 3, d - 3, BASE_H);
    walls(ctx, footing, (c, fw, fh, light) => stone(c, fw, fh, { base: 0x8a8578, light, seed: 13 }, 6));
    outlineBox(ctx, footing);
    walls(ctx, block, (c, fw, fh, light) => logCourses(c, fw, fh, light, light === 1 ? 3 : 4, COURSE), {
      left: (c, fw, fh) => {
        // Cross-shaped loopholes for the musket.
        c.fillStyle = css(0x120a05);
        for (const u of [fw * 0.3, fw * 0.7]) {
          c.fillRect(u - 1.5, fh * 0.3, 3, 12);
          c.fillRect(u - 4, fh * 0.3 + 4, 8, 2);
        }
      },
      right: (c, fw, fh, l) => {
        // A plank door a man's height, its lintel a single log.
        const dw = 23;
        const dh = 48;
        c.fillStyle = css(0x120a05);
        c.fillRect(fw / 2 - dw / 2 - 1, fh - dh - 1, dw + 2, dh + 1);
        c.save();
        c.translate(fw / 2 - dw / 2, fh - dh);
        planks(c, dw, dh, { base: 0x5a3c22, light: l, seed: 17 }, true, 4.6);
        c.restore();
        c.fillStyle = css(shade(0x3a2616, l));
        c.fillRect(fw / 2 - dw / 2 - 4, fh - dh - 5, dw + 8, 4);
        c.fillStyle = css(shade(0x2a1a0e, l));
        c.fillRect(fw / 2 + dw / 2 - 5, fh - dh / 2, 2, 3);
      },
    });
    flatTop(ctx, block, 0x6b4a2c);
    outlineBox(ctx, block);
    frame(ctx, box);
    gallery(ctx, box);
  });
}

/** Four braced corner posts carrying the deck, a ladder inside them. */
function frame(ctx: Ctx, box: IsoBox): void {
  const { w, d } = box;
  const i = 10;
  const corners: Array<[number, number]> = [[i, d - i], [i, i], [w - i, d - i], [w - i, i]];
  const pt = (p: number, q: number, z: number) => liftedPoint(box, p, q, z);
  const log = (a: Pt, b: Pt, r: number, seed: number) => roundLog(ctx, a, b, r, { ends: 'none', seed, bark: 0x4a3220 });
  // Back post, its two braces, the ladder, then the posts nearer the viewer.
  const [back, left, right, front] = corners as [[number, number], [number, number], [number, number], [number, number]];
  const post = ([p, q]: [number, number], seed: number) => log(pt(p, q, BASE_H - 1), pt(p, q, DECK + 1), 2.6, seed);
  post(back, 1);
  log(pt(back[0], back[1], BASE_H + 2), pt(right[0], right[1], DECK - 4), 1.5, 2);
  log(pt(left[0], left[1], DECK - 4), pt(back[0], back[1], BASE_H + 2), 1.5, 3);
  post(left, 4);
  post(right, 5);
  ladder(ctx, pt(w * 0.42, d * 0.5, BASE_H), pt(w * 0.42, d * 0.5, DECK));
  log(pt(left[0], left[1], BASE_H + 2), pt(front[0], front[1], DECK - 4), 1.6, 6);
  log(pt(front[0], front[1], BASE_H + 2), pt(right[0], right[1], DECK - 4), 1.6, 7);
  post(front, 8);
  // Brackets from the posts out to the overhanging deck.
  for (const [p, q] of [left, front, right]) {
    const out = (v: number, dir: number) => v + dir * 8;
    const tip = pt(out(p, p > w / 2 ? 1 : -1), out(q, q > d / 2 ? 1 : -1), DECK);
    log(pt(p, q, DECK - 18), tip, 1.4, Math.round(p + q));
  }
}

function ladder(ctx: Ctx, foot: Pt, top: Pt): void {
  ctx.strokeStyle = css(0x5a3c22);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  for (const dx of [-5, 5]) {
    ctx.moveTo(foot.x + dx, foot.y);
    ctx.lineTo(top.x + dx, top.y);
  }
  ctx.stroke();
  ctx.lineWidth = 1.2;
  for (let y = foot.y - 6; y > top.y; y -= 7) {
    ctx.beginPath();
    ctx.moveTo(foot.x - 5, y);
    ctx.lineTo(foot.x + 5, y);
    ctx.stroke();
  }
}

/** The deck, a log breastwork with loopholes, open corner posts and the thatched roof. */
function gallery(ctx: Ctx, box: IsoBox): void {
  const o = 7;
  const deck = subBox(box, -o, box.w + o, -o, box.d + o, 5, DECK);
  walls(ctx, deck, (c, fw, fh, light) => planks(c, fw, fh, { base: 0x6b4a2c, light, seed: 21 }, false, 2.5));
  outlineBox(ctx, deck);
  const breast = subBox(box, -o, box.w + o, -o, box.d + o, BREAST, DECK + 4);
  // The far inside faces of the breastwork, in shadow.
  const b = baseCorners(breast);
  const t = topCorners(breast);
  for (const [i, j] of [[3, 2], [2, 1]] as const) {
    polygon(ctx, [b[i]!, b[j]!, t[j]!, t[i]!]);
    ctx.fillStyle = css(0x2a1a0e);
    ctx.fill();
  }
  walls(ctx, breast, (c, fw, fh, light) => logCourses(c, fw, fh, light, light === 1 ? 23 : 24, 6), {
    left: (c, fw) => loopholes(c, fw),
    right: (c, fw) => loopholes(c, fw),
  });
  outlineBox(ctx, breast);
  lookout(ctx, subBox(box, -o, box.w + o, -o, box.d + o, LOOKOUT, DECK + 4 + BREAST));
}

function loopholes(ctx: Ctx, w: number): void {
  ctx.fillStyle = css(0x120a05);
  for (const u of [w * 0.2, w * 0.5, w * 0.8]) ctx.fillRect(u - 1.5, 6, 3, 9);
}

/** Corner posts and a steep pyramidal thatch roof over the gallery. */
function lookout(ctx: Ctx, top: IsoBox): void {
  const bases = baseCorners(top);
  const tops = topCorners(top);
  const post = (i: number) => {
    ctx.strokeStyle = css(POST);
    ctx.lineWidth = 3.6;
    ctx.beginPath();
    ctx.moveTo(bases[i]!.x, bases[i]!.y);
    ctx.lineTo(tops[i]!.x, tops[i]!.y);
    ctx.stroke();
  };
  // The far side of the roof's underside, in deep shade, then the posts.
  for (const [i, j] of [[3, 2], [2, 1]] as const) {
    polygon(ctx, [bases[i]!, bases[j]!, tops[j]!, tops[i]!]);
    ctx.fillStyle = css(0x1a1008);
    ctx.fill();
  }
  for (const i of [2, 3, 1, 0]) post(i);
  const corners = [tops[3]!, tops[0]!, tops[1]!, tops[2]!];
  const mx = corners.reduce((s, p) => s + p.x, 0) / 4;
  const my = corners.reduce((s, p) => s + p.y, 0) / 4;
  const eave = corners.map(p => ({ x: mx + (p.x - mx) * 1.25, y: my + (p.y - my) * 1.25 + 3 }));
  const apex = { x: mx, y: my - APEX };
  const [el, ef, er] = eave;
  for (const [a, c, light] of [[el!, ef!, LIGHT.left], [ef!, er!, LIGHT.right]] as const) {
    polygon(ctx, [a, c, apex]);
    ctx.fillStyle = css(shade(0x9a8050, light));
    ctx.fill();
    ctx.save();
    polygon(ctx, [a, c, apex]);
    ctx.clip();
    ctx.strokeStyle = css(shade(0x6a5430, light), 0.7);
    ctx.lineWidth = 0.7;
    for (let k = 0; k <= 1; k += 0.03) {
      ctx.beginPath();
      ctx.moveTo(apex.x, apex.y);
      ctx.lineTo(a.x + (c.x - a.x) * k, a.y + (c.y - a.y) * k);
      ctx.stroke();
    }
    // A ragged thatch hem.
    ctx.fillStyle = css(shade(0x6a5430, light));
    for (let k = 0; k < 1; k += 0.05) ctx.fillRect(a.x + (c.x - a.x) * k, a.y + (c.y - a.y) * k - 2, 2.5, 3.5);
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(20,10,4,0.8)';
  ctx.lineWidth = 1;
  polygon(ctx, [el!, ef!, er!, apex]);
  ctx.stroke();
  // A bound sheaf at the peak.
  ctx.fillStyle = css(0x6a5430);
  ctx.fillRect(apex.x - 2, apex.y - 6, 4, 7);
}
