import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { walls } from './ornaments';
import { barredWindow, batteredFooting, EDGE, fortressStone, ironDoor, keep, roundTower, slit, snowRoof, snowyMerlons, squareTower } from './fortresses';
import { snowEdge, subBox } from './structureParts';
import { boulder } from './woodland';

/**
 * The mountain prisons of Ādharbāyjān at true scale. Each is the inner
 * castle of its fortress: curtain walls of rubble stone under snow, 8.5 to
 * 9.5 m high on a battered footing, towers at the corners, a keep rising
 * a storey and more above them, pierced only by slits and small barred
 * windows set far above a man's reach, and entered by one iron-bound door.
 * Mākū (9 x 7) squats under its overhanging crag behind round bastions;
 * Chihrīq (8 x 8), "the Grievous Mountain", is darker and taller, a keep of
 * square towers. The maps ring each with the `ch6-rampart` wall.
 */

export interface FortressStyle {
  wall: number;
  wallH: number;
  seed: number;
  /** Headroom over the back corner for the keep and the crag. */
  topPad: number;
  /** Mākū's great overhanging rock behind the walls. */
  crag?: boolean;
  /** Round bastions (Mākū) or square towers (Chihrīq) at the visible corners. */
  towers: 'round' | 'square';
  /** How far each corner tower rises above the curtain: left, front, right. */
  towerRise: readonly [number, number, number];
  /** How far the inner keep rises above the curtain. */
  keepRise: number;
}

export const MAKU_FORTRESS: FortressStyle = {
  wall: 0x7a7670, wallH: 196, seed: 101, topPad: 136, crag: true, towers: 'round', towerRise: [30, 44, 14], keepRise: 86,
};
export const CHIHRIQ_FORTRESS: FortressStyle = {
  wall: 0x5c5f66, wallH: 218, seed: 131, topPad: 112, towers: 'square', towerRise: [40, 62, 24], keepRise: 120,
};

/** Curtain wall inset from the footprint edge, leaving room for the battered footing. */
const INSET = 16;

export function paintFortress(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, style: FortressStyle): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, style.wallH, style.topPad);
  paintTexture(scene, key, texW + 24, texH, ctx => {
    ctx.translate(12, 0);
    drawFortress(ctx, box, style);
  });
}

function drawFortress(ctx: Ctx, box: IsoBox, style: FortressStyle): void {
  const s = style.seed;
  const { w, d } = box;
  const curtain = subBox(box, INSET, w - INSET, INSET, d - INSET, style.wallH);
  if (style.crag) crag(ctx, curtain, style.topPad - 6, s);
  groundShadow(ctx, box, 20, 0.38);
  // The keep stands near the back corner, its top well above the walls.
  const size = Math.min(w, d) * 0.42;
  const k0 = INSET + 14;
  keep(ctx, subBox(box, k0, k0 + size, d - k0 - size, d - k0, style.keepRise + 30, style.wallH - 30), style.wall, s + 9);
  walls(ctx, curtain, (c, fw, fh, light) => fortressStone(c, fw, fh, style.wall, light, s), {
    left: (c, fw, fh, l) => {
      // The gatehouse covers the middle; small openings flank it, high up.
      barredWindow(c, fw * 0.14, fh - 150, 14, 18, l, false);
      slit(c, fw * 0.24, fh * 0.42, l);
      barredWindow(c, fw * 0.76, fh - 142, 14, 18, l, true);
      slit(c, fw * 0.88, fh * 0.38, l);
      stringCourse(c, fw, 22, style.wall, l);
      snowEdge(c, fw, 6, s + 1, l);
    },
    right: (c, fw, fh, l) => {
      for (const [u, lit] of [[0.24, false], [0.52, true], [0.8, false]] as const) barredWindow(c, fw * u - 7, fh - 146, 14, 18, l, lit);
      slit(c, fw * 0.38, fh * 0.4, l);
      slit(c, fw * 0.66, fh * 0.46, l);
      // A soot stain down from the guardroom flue.
      const g = c.createLinearGradient(0, 40, 0, fh * 0.75);
      g.addColorStop(0, 'rgba(18,16,14,0.35)');
      g.addColorStop(1, 'rgba(18,16,14,0)');
      c.fillStyle = g;
      c.fillRect(fw * 0.52 - 3, 40, 6, fh * 0.5);
      stringCourse(c, fw, 22, style.wall, l);
      snowEdge(c, fw, 6, s + 2, l);
    },
  });
  snowRoof(ctx, curtain, 14);
  outlineBox(ctx, curtain, EDGE);
  batteredFooting(ctx, box, 3, INSET, 34, style.wall, s + 4);
  snowyMerlons(ctx, curtain, shade(style.wall, 1.05));
  // Corner towers back to front: left, right, then the gatehouse and the front tower.
  const tower = ([p, q, rise]: readonly [number, number, number], front: boolean): void => {
    const h = style.wallH + rise;
    if (style.towers === 'round') roundTower(ctx, groundPoint(box, p, q), front ? 30 : 25, h, style.wall, s + p + q);
    else squareTower(ctx, box, p, q, front ? 56 : 46, h, style.wall, s + p + q);
  };
  tower([INSET, INSET, style.towerRise[0]], false);
  tower([w - INSET, d - INSET, style.towerRise[2]], false);
  const gateP = w * 0.46;
  gatehouse(ctx, subBox(box, gateP - 42, gateP + 42, 0, INSET + 30, style.wallH + 22), style.wall, s + 21);
  tower([w - INSET, INSET, style.towerRise[1]], true);
  foot(ctx, box, gateP, s + 7);
}

/** The gatehouse: a tower block pushed forward from the front curtain, holding the castle's one door. */
function gatehouse(ctx: Ctx, g: IsoBox, color: number, seed: number): void {
  walls(ctx, g, (c, w, h, light) => fortressStone(c, w, h, shade(color, 1.02), light, seed), {
    left: (c, w, h, l) => {
      ironDoor(c, w / 2, h, color, l);
      slit(c, w / 2, 26, l, 18);
      snowEdge(c, w, 6, seed + 1, l);
    },
    right: (c, w, h, l) => {
      slit(c, w / 2, h * 0.4, l);
      snowEdge(c, w, 6, seed + 2, l);
    },
  });
  snowRoof(ctx, g);
  snowyMerlons(ctx, g, shade(color, 1.05), 12, 9, 16);
  outlineBox(ctx, g, EDGE);
}

/** A darker band of dressed stone a little below the merlons. */
function stringCourse(ctx: Ctx, w: number, v: number, color: number, light: number): void {
  ctx.fillStyle = css(shade(color, light * 0.62));
  ctx.fillRect(0, v + 3, w, 2);
  ctx.fillStyle = css(shade(color, light * 1.2));
  ctx.fillRect(0, v, w, 3);
}

/** Snow banked against the footing, a trodden track to the door, boulders and firewood. */
function foot(ctx: Ctx, box: IsoBox, gateP: number, seed: number): void {
  const rand = rng(seed);
  // The track: grey slush pressed down by boots, running out from the door.
  for (let t = 0; t < 1; t += 0.06) {
    const at = groundPoint(box, gateP + (rand() - 0.5) * 6, -2 + t * 40);
    ctx.fillStyle = `rgba(110,106,98,${0.4 * (1 - t * 0.6)})`;
    ctx.beginPath();
    ctx.ellipse(at.x, at.y + 2, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(232,238,243,0.92)';
  for (const [axis, len] of [['p', box.w], ['q', box.d]] as const) {
    for (let t = 10; t < len - 10; t += 16 + rand() * 12) {
      if (axis === 'p' && Math.abs(t - gateP) < 50) continue;
      const at = axis === 'p' ? groundPoint(box, t, 3) : groundPoint(box, box.w - 3, t);
      ctx.beginPath();
      ctx.ellipse(at.x, at.y - 1, 12 + rand() * 10, 4 + rand() * 2, axis === 'p' ? 0.45 : -0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // Boulders tumbled from the mountain, capped with snow.
  for (const [p, q, r] of [[box.w * 0.14, 4, 11], [box.w - 4, box.d * 0.34, 12], [box.w - 2, box.d * 0.74, 9]] as const) {
    const at = groundPoint(box, p, q);
    boulder(ctx, at.x, at.y, r, r * 0.85, 0x6e6c68, Math.round(p + q));
    ctx.fillStyle = 'rgba(240,244,247,0.95)';
    ctx.beginPath();
    ctx.ellipse(at.x - r * 0.2, at.y - r * 0.8, r * 0.6, r * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Firewood stacked beside the door for the guards' brazier.
  const pile = groundPoint(box, gateP + 58, 4);
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < 4 - row; i++) {
      const x = pile.x + i * 7 + row * 3.5;
      const y = pile.y - 3 - row * 5.6 - i * 3.5;
      ctx.fillStyle = css(0x5a3c22);
      ctx.beginPath();
      ctx.ellipse(x, y, 3.2, 2.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0xc9a46e);
      ctx.beginPath();
      ctx.ellipse(x - 0.6, y, 2, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(240,244,247,0.9)';
  ctx.beginPath();
  ctx.ellipse(pile.x + 9, pile.y - 24, 12, 3, -0.3, 0, Math.PI * 2);
  ctx.fill();
}

/** Mākū's overhanging rock: a faceted grey cliff rising `rise` px behind the fortress. */
function crag(ctx: Ctx, box: IsoBox, rise: number, seed: number): void {
  const rand = rng(seed);
  const left = roofPoint(box, 0, 0);
  const back = roofPoint(box, 0, box.d);
  const right = roofPoint(box, box.w, box.d);
  const foot = left.y + 30;
  // A jagged ridge of alternate peaks and saddles, highest near the back corner.
  const ridge: Array<{ x: number; y: number }> = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const envelope = 0.25 + 0.75 * Math.pow(Math.sin(Math.min(1, t * 1.15) * Math.PI), 0.6);
    const zig = i % 2 ? 0.55 + rand() * 0.3 : 0.85 + rand() * 0.15;
    const x = left.x - 14 + (right.x - left.x + 28) * t + (rand() - 0.5) * 14;
    const y = back.y - 10 - envelope * zig * (rise - 4) + (i === 0 || i === steps ? 40 : 0);
    ridge.push({ x, y: Math.max(2, y) });
  }
  for (let i = 0; i < steps; i++) {
    const a = ridge[i]!;
    const b = ridge[i + 1]!;
    // Slopes rising to the right face the sun; falling ones are in shadow.
    // Fall lines splay outward so the facets read as buttresses, not stripes.
    const lit = b.y < a.y;
    const footA = a.x + (i % 2 ? 12 : -12);
    const footB = b.x + ((i + 1) % 2 ? 12 : -12);
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
  ctx.lineWidth = 1;
  for (let i = 0; i < 70; i++) {
    const x = left.x + rand() * (right.x - left.x);
    const y = back.y - rise + rand() * rise * 1.1;
    ctx.strokeStyle = rand() < 0.6 ? 'rgba(30,28,28,0.4)' : 'rgba(220,215,205,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 14 + rand() * 18, y + 3 + rand() * 5);
    ctx.stroke();
  }
  const under = ctx.createLinearGradient(0, back.y - 50, 0, back.y + 10);
  under.addColorStop(0, 'rgba(20,20,24,0)');
  under.addColorStop(1, 'rgba(20,20,24,0.6)');
  ctx.fillStyle = under;
  ctx.fillRect(left.x - 20, back.y - 50, right.x - left.x + 40, foot - back.y + 50);
  // Snow caught on the peaks and ledges, thinning down the gullies.
  ctx.fillStyle = 'rgba(238,243,247,0.95)';
  for (let i = 0; i <= steps; i += 2) {
    const p = ridge[i]!;
    const len = 12 + rand() * 16;
    ctx.beginPath();
    ctx.moveTo(p.x - 11, p.y + len * 0.7);
    ctx.lineTo(p.x, p.y - 0.5);
    ctx.lineTo(p.x + 12, p.y + len * 0.5);
    ctx.lineTo(p.x + 3, p.y + len * 0.35);
    ctx.lineTo(p.x - 2, p.y + len);
    ctx.closePath();
    ctx.fill();
  }
  // Snow lying on the ledges across the face.
  for (let i = 0; i < 16; i++) {
    const x = left.x + rand() * (right.x - left.x);
    const y = back.y - rise * 0.75 + rand() * rise * 0.6;
    ctx.fillStyle = 'rgba(232,238,243,0.7)';
    ctx.beginPath();
    ctx.ellipse(x, y, 6 + rand() * 8, 1.6, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(20,20,24,0.75)';
  ctx.lineWidth = 1.2;
  outline();
  ctx.stroke();
}
