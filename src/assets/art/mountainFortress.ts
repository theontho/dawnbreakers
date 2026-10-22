import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { parapetRoof, walls } from './ornaments';
import { barredWindow, batteredFooting, fortressStone, gatehouse, keep, roundTower, slit, snowyMerlons, squareTower } from './fortresses';
import { snowEdge, subBox } from './structureParts';
import { boulder } from './woodland';

/**
 * The mountain prisons of Ādharbāyjān. Mākū squats under its overhanging
 * crag behind round bastions; Chihrīq, "the Grievous Mountain", is a
 * darker, taller keep of square towers. Both are rubble stone under snow,
 * three times the height of a man, pierced only by slits and small barred
 * windows high up, entered by one narrow door.
 */

export interface FortressStyle {
  wall: number;
  wallH: number;
  seed: number;
  /** Mākū's great overhanging rock behind the walls. */
  crag?: boolean;
  /** Round bastions (Mākū) or square towers (Chihrīq) at the visible corners. */
  towers: 'round' | 'square';
  /** How far each corner tower rises above the curtain: left, front, right. */
  towerRise: readonly [number, number, number];
  /** How far the inner keep rises above the curtain. */
  keepRise: number;
}

export const MAKU_FORTRESS: FortressStyle = { wall: 0x7a7670, wallH: 96, seed: 101, crag: true, towers: 'round', towerRise: [16, 26, 6], keepRise: 26 };
export const CHIHRIQ_FORTRESS: FortressStyle = { wall: 0x5c5f66, wallH: 104, seed: 131, towers: 'square', towerRise: [22, 38, 12], keepRise: 48 };

/** Curtain wall inset from the footprint edge, leaving room for the battered footing. */
const INSET = 7;

export function paintFortress(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, style: FortressStyle): void {
  const topPad = Math.max(style.keepRise, style.towerRise[0]) + (style.crag ? 44 : 20);
  const { box, texW, texH } = footprintBox(cellsW, cellsD, style.wallH, topPad);
  paintTexture(scene, key, texW + 24, texH, ctx => {
    ctx.translate(12, 0);
    const s = style.seed;
    const { w, d } = box;
    const curtain = subBox(box, INSET, w - INSET, INSET, d - INSET, style.wallH);
    if (style.crag) crag(ctx, curtain, s);
    groundShadow(ctx, box, 12, 0.38);
    // The keep stands near the back corner, its top well above the walls.
    const size = Math.min(w, d) * 0.34;
    const keepBox = subBox(box, INSET + 6, INSET + 6 + size, d - INSET - 6 - size, d - INSET - 6, style.keepRise + 10, style.wallH - 10);
    keep(ctx, keepBox, style.wall, s + 9);
    walls(ctx, curtain, (c, fw, fh, light) => fortressStone(c, fw, fh, style.wall, light, s), {
      left: (c, fw, fh, l) => {
        // The gatehouse covers the middle; small openings flank it, high up.
        barredWindow(c, fw * 0.12, 20, 6, 8, l, false);
        slit(c, fw * 0.2, fh * 0.45, l);
        barredWindow(c, fw * 0.78, 18, 6, 8, l, true);
        slit(c, fw * 0.86, fh * 0.42, l);
        stringCourse(c, fw, 9, style.wall, l);
        snowEdge(c, fw, 3, s + 1, l);
      },
      right: (c, fw, fh, l) => {
        for (const [u, lit] of [[0.22, false], [0.5, true], [0.78, false]] as const) barredWindow(c, fw * u - 3, 18, 6, 8, l, lit);
        slit(c, fw * 0.36, fh * 0.42, l);
        slit(c, fw * 0.64, fh * 0.48, l);
        // A soot stain down from the guardroom flue.
        const g = c.createLinearGradient(0, 28, 0, fh * 0.75);
        g.addColorStop(0, 'rgba(18,16,14,0.35)');
        g.addColorStop(1, 'rgba(18,16,14,0)');
        c.fillStyle = g;
        c.fillRect(fw * 0.5 - 2, 28, 4, fh * 0.5);
        stringCourse(c, fw, 9, style.wall, l);
        snowEdge(c, fw, 3, s + 2, l);
      },
    });
    parapetRoof(ctx, curtain, shade(style.wall, 1.05), { base: 0xd8e2e8, light: 1, seed: s + 3 }, 6, 6);
    outlineBox(ctx, curtain, 0x14181c);
    batteredFooting(ctx, box, 2, INSET, 16, style.wall, s + 4);
    snowyMerlons(ctx, curtain, shade(style.wall, 1.05), 5, 4);
    // Corner towers back to front: left, right, then the gatehouse and the front tower.
    const corners: Array<[number, number, number]> = [
      [INSET, INSET, style.towerRise[0]],
      [w - INSET, d - INSET, style.towerRise[2]],
    ];
    const tower = ([p, q, rise]: [number, number, number], i: number) => {
      const h = style.wallH + rise;
      if (style.towers === 'round') roundTower(ctx, groundPoint(box, p, q), i === 2 ? 14 : 11, h, style.wall, s + p + q);
      else squareTower(ctx, box, p, q, i === 2 ? 24 : 20, h, style.wall, s + p + q);
    };
    corners.forEach(tower);
    const gateP = w * 0.46;
    gatehouse(ctx, subBox(box, gateP - 16, gateP + 16, 0, INSET + 14, style.wallH + 10), style.wall, s + 21);
    tower([w - INSET, INSET, style.towerRise[1]], 2);
    foot(ctx, box, gateP, s + 7);
  });
}

/** A darker band of dressed stone a little below the merlons. */
function stringCourse(ctx: Ctx, w: number, v: number, color: number, light: number): void {
  ctx.fillStyle = css(shade(color, light * 0.62));
  ctx.fillRect(0, v + 2, w, 1.2);
  ctx.fillStyle = css(shade(color, light * 1.2));
  ctx.fillRect(0, v, w, 2);
}

/** Snow banked against the footing, a trodden track to the gate, boulders and firewood. */
function foot(ctx: Ctx, box: IsoBox, gateP: number, seed: number): void {
  const rand = rng(seed);
  // The track: grey slush pressed down by boots, running out from the door.
  const door = groundPoint(box, gateP, -1);
  for (let t = 0; t < 1; t += 0.09) {
    ctx.fillStyle = `rgba(110,106,98,${0.4 * (1 - t)})`;
    ctx.beginPath();
    ctx.ellipse(door.x - 4 - t * 20 + (rand() - 0.5) * 3, door.y + 2 + t * 11, 5 - t * 2, 2, 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(232,238,243,0.92)';
  for (const [axis, len] of [['p', box.w], ['q', box.d]] as const) {
    for (let t = 4; t < len - 4; t += 8 + rand() * 6) {
      if (axis === 'p' && Math.abs(t - gateP) < 14) continue;
      const at = axis === 'p' ? groundPoint(box, t, 1) : groundPoint(box, box.w - 1, t);
      ctx.beginPath();
      ctx.ellipse(at.x, at.y - 1, 6 + rand() * 5, 2 + rand(), axis === 'p' ? 0.45 : -0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Boulders tumbled from the mountain, capped with snow.
  for (const [p, q, r] of [[box.w * 0.16, -3, 5], [box.w + 2, box.d * 0.32, 6], [box.w + 3, box.d * 0.72, 4]] as const) {
    const at = groundPoint(box, p, q);
    boulder(ctx, at.x, at.y, r, r * 0.8, 0x6e6c68, Math.round(p + q));
    ctx.fillStyle = 'rgba(240,244,247,0.95)';
    ctx.beginPath();
    ctx.ellipse(at.x - r * 0.2, at.y - r * 0.75, r * 0.6, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Firewood stacked beside the door for the guards' brazier.
  const pile = groundPoint(box, gateP + 22, -3);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 3 - row; i++) {
      const x = pile.x + i * 4.2 + row * 2.1;
      const y = pile.y - 2 - row * 3.4 - i * 2.1;
      ctx.fillStyle = css(0x5a3c22);
      ctx.beginPath();
      ctx.ellipse(x, y, 1.9, 1.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0xc9a46e);
      ctx.beginPath();
      ctx.ellipse(x - 0.4, y, 1.2, 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** Mākū's overhanging rock: a faceted grey cliff rising behind the fortress. */
function crag(ctx: Ctx, box: IsoBox, seed: number): void {
  const rand = rng(seed);
  const left = roofPoint(box, 0, 0);
  const back = roofPoint(box, 0, box.d);
  const right = roofPoint(box, box.w, box.d);
  const foot = left.y + 12;
  // A jagged ridge of alternate peaks and saddles, highest near the back corner.
  const ridge: Array<{ x: number; y: number }> = [];
  const steps = 12;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const envelope = 0.3 + 0.7 * Math.pow(Math.sin(Math.min(1, t * 1.2) * Math.PI), 0.7);
    const zig = i % 2 ? 0.62 : 1;
    const x = left.x - 6 + (right.x - left.x + 12) * t + (rand() - 0.5) * 4;
    const y = back.y - 6 - envelope * zig * 64 - rand() * 6 + (i === 0 || i === steps ? 18 : 0);
    ridge.push({ x, y });
  }
  for (let i = 0; i < steps; i++) {
    const a = ridge[i]!;
    const b = ridge[i + 1]!;
    // Slopes rising to the right face the sun; falling ones are in shadow.
    // Fall lines splay outward so the facets read as buttresses, not stripes.
    const lit = b.y < a.y;
    const footA = a.x + (i % 2 ? 6 : -6);
    const footB = b.x + ((i + 1) % 2 ? 6 : -6);
    const g = ctx.createLinearGradient(0, Math.min(a.y, b.y), 0, foot);
    g.addColorStop(0, css(shade(lit ? 0x9a968e : 0x5e5b58, 0.9 + rand() * 0.2)));
    g.addColorStop(1, css(shade(lit ? 0x6a6660 : 0x3a3836, 1)));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(footB, foot);
    ctx.lineTo(footA, foot);
    ctx.closePath();
    ctx.fill();
  }
  const outline = (): void => {
    ctx.beginPath();
    ctx.moveTo(ridge[0]!.x, foot);
    for (const p of ridge) ctx.lineTo(p.x, p.y);
    ctx.lineTo(ridge[steps]!.x, foot);
  };
  ctx.save();
  outline();
  ctx.clip();
  // Strata running across the face, and a dark undercut beneath the overhang.
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 26; i++) {
    const x = left.x + rand() * (right.x - left.x);
    const y = back.y - 56 + rand() * 60;
    ctx.strokeStyle = rand() < 0.6 ? 'rgba(30,28,28,0.4)' : 'rgba(220,215,205,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 8 + rand() * 10, y + 2 + rand() * 3);
    ctx.stroke();
  }
  const under = ctx.createLinearGradient(0, back.y - 24, 0, back.y + 6);
  under.addColorStop(0, 'rgba(20,20,24,0)');
  under.addColorStop(1, 'rgba(20,20,24,0.55)');
  ctx.fillStyle = under;
  ctx.fillRect(left.x - 8, back.y - 24, right.x - left.x + 16, foot - back.y + 24);
  // Snow caught on the peaks, thinning down the gullies.
  ctx.fillStyle = 'rgba(238,243,247,0.95)';
  for (let i = 0; i <= steps; i += 2) {
    const p = ridge[i]!;
    const len = 6 + rand() * 8;
    ctx.beginPath();
    ctx.moveTo(p.x - 6, p.y + len * 0.7);
    ctx.lineTo(p.x, p.y - 0.5);
    ctx.lineTo(p.x + 7, p.y + len * 0.5);
    ctx.lineTo(p.x + 2, p.y + len * 0.35);
    ctx.lineTo(p.x - 1, p.y + len);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,20,24,0.75)';
  ctx.lineWidth = 1;
  outline();
  ctx.stroke();
}
