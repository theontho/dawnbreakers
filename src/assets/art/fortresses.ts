import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, onLeftWall, onRightWall, onRoof, outlineBox, paintTexture, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { planks, stone } from './materials';
import { cylinder, doorway, LIGHT, merlons, parapetRoof, walls } from './ornaments';
import { post, snowEdge, subBox } from './structureParts';

/**
 * The mountain prisons of Ādharbāyjān. Mākū squats under its overhanging
 * crag behind round bastions; Chihrīq, "the Grievous Mountain", is a
 * darker keep of square towers. Both are rubble stone under snow.
 */

export interface FortressStyle {
  wall: number;
  wallH: number;
  seed: number;
  /** Mākū's great overhanging rock behind the walls. */
  crag?: boolean;
  /** Round bastions (Mākū) or square towers (Chihrīq) at the visible corners. */
  towers: 'round' | 'square';
  keepH: number;
}

export const MAKU_FORTRESS: FortressStyle = { wall: 0x7a7670, wallH: 78, seed: 101, crag: true, towers: 'round', keepH: 22 };
export const CHIHRIQ_FORTRESS: FortressStyle = { wall: 0x5c5f66, wallH: 84, seed: 131, towers: 'square', keepH: 40 };

export function paintFortress(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number, style: FortressStyle): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, style.wallH, style.crag ? 60 : 50);
  paintTexture(scene, key, texW + 24, texH, ctx => {
    ctx.translate(12, 0);
    const s = style.seed;
    if (style.crag) crag(ctx, box, s);
    groundShadow(ctx, box, 10, 0.35);
    walls(ctx, box, (c, w, h, light) => fortressStone(c, w, h, style.wall, light, s), {
      left: (c, w, h, l) => {
        doorway(c, w / 2 - 9, h, 18, 30, { frame: shade(style.wall, 1.2), door: 0x3a2a1c, light: l, seed: s });
        // Iron bands across the gate.
        c.fillStyle = css(0x1a1a1e, 0.8);
        for (const v of [h - 9, h - 20]) c.fillRect(w / 2 - 8, v, 16, 1.2);
        for (const u of [w * 0.2, w * 0.8]) slit(c, u, h * 0.3, l);
        snowEdge(c, w, 3, s + 1, l);
      },
      right: (c, w, h, l) => {
        for (const u of [w * 0.3, w * 0.55, w * 0.8]) barredWindow(c, u - 4, h * 0.26, 8, 9, l, false);
        snowEdge(c, w, 3, s + 2, l);
      },
    });
    parapetRoof(ctx, box, shade(style.wall, 1.05), { base: 0xd8e2e8, light: 1, seed: s + 3 }, 6, 6);
    outlineBox(ctx, box, 0x14181c);
    keep(ctx, box, style);
    snowyMerlons(ctx, box, shade(style.wall, 1.05), 5, 4);
    const corners: Array<[number, number]> = [[0, 0], [box.w, box.d], [box.w, 0]];
    for (const [p, q] of corners) {
      if (style.towers === 'round') roundTower(ctx, groundPoint(box, p, q), 11, style.wallH + 12, style.wall, s + p + q);
      else squareTower(ctx, box, p, q, style, s + p + q);
    }
    snowBank(ctx, box, s + 7);
  });
}

function fortressStone(ctx: Ctx, w: number, h: number, color: number, light: number, seed: number): void {
  stone(ctx, w, h, { base: color, light, seed }, 8);
  // Battered talus: the lower courses are larger and darker.
  ctx.fillStyle = 'rgba(20,24,30,0.22)';
  ctx.fillRect(0, h - 12, w, 12);
  ctx.fillStyle = 'rgba(230,235,240,0.18)';
  ctx.fillRect(0, h - 12, w, 1);
}

function slit(ctx: Ctx, u: number, v: number, light: number): void {
  ctx.fillStyle = css(shade(0x0e1014, light + 0.2));
  ctx.fillRect(u - 1, v, 2, 8);
  ctx.fillRect(u - 2.5, v + 3, 5, 1.5);
}

/** A small deep-set window crossed with iron bars, dark or lamp-lit within. */
export function barredWindow(ctx: Ctx, x: number, y: number, w: number, h: number, light: number, lit: boolean): void {
  ctx.fillStyle = css(shade(0xb8b4ac, light));
  ctx.fillRect(x - 1.5, y - 1.5, w + 3, h + 3);
  if (lit) {
    const g = ctx.createRadialGradient(x + w / 2, y + h * 0.6, 0.5, x + w / 2, y + h / 2, w);
    g.addColorStop(0, '#ffd890');
    g.addColorStop(1, '#6a3a18');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = css(0x0e1014);
  }
  ctx.fillRect(x, y, w, h);
  // The reveal: the thickness of the wall shows on the sunlit side.
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(x, y, 1.5, h);
  ctx.fillRect(x, y, w, 1.2);
  ctx.strokeStyle = css(shade(0x9aa4ac, light));
  ctx.lineWidth = 1;
  for (let u = x + 2; u < x + w - 0.5; u += 2.5) {
    ctx.beginPath();
    ctx.moveTo(u, y);
    ctx.lineTo(u, y + h);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x, y + h * 0.45);
  ctx.lineTo(x + w, y + h * 0.45);
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,245,250,0.85)';
  ctx.fillRect(x - 1.5, y + h + 0.5, w + 3, 1.5);
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
    const x = left.x + 4 + (right.x - left.x - 8) * t + (rand() - 0.5) * 4;
    const y = back.y - 6 - envelope * zig * 54 - rand() * 6 + (i === 0 || i === steps ? 18 : 0);
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
  for (let i = 0; i < 22; i++) {
    const x = left.x + rand() * (right.x - left.x);
    const y = back.y - 46 + rand() * 50;
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
  ctx.fillRect(left.x, back.y - 24, right.x - left.x, foot - back.y + 24);
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

/** The inner keep standing in the courtyard near the back corner. */
function keep(ctx: Ctx, box: IsoBox, style: FortressStyle): void {
  const size = Math.min(box.w, box.d) * 0.36;
  const k = subBox(box, 10, 10 + size, box.d - 10 - size, box.d - 10, style.keepH + 6, style.wallH - 6);
  walls(ctx, k, (c, w, h, light) => stone(c, w, h, { base: shade(style.wall, 0.95), light, seed: style.seed + 9 }, 7), {
    left: (c, w, _h, l) => {
      barredWindow(c, w / 2 - 3, 8, 6, 8, l, true);
      snowEdge(c, w, 3, style.seed + 10, l);
    },
    right: (c, w, _h, l) => {
      slit(c, w / 2, 8, l);
      snowEdge(c, w, 3, style.seed + 11, l);
    },
  });
  onRoof(ctx, k, (w, d) => {
    ctx.fillStyle = css(0xe8eef2);
    ctx.fillRect(0, 0, w, d);
  });
  snowyMerlons(ctx, k, shade(style.wall, 1.05), 4, 3);
  outlineBox(ctx, k, 0x14181c);
}

/** Crenellations with a cap of snow on every merlon. */
function snowyMerlons(ctx: Ctx, box: IsoBox, color: number, size: number, gap: number): void {
  merlons(ctx, box, color, size, gap);
  const caps = (w: number) => {
    ctx.fillStyle = css(0xf0f4f7, 0.95);
    for (let u = gap / 2; u + size <= w; u += size + gap) {
      ctx.beginPath();
      ctx.ellipse(u + size / 2, -size - 0.6, size / 2 + 0.5, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  onLeftWall(ctx, box, caps);
  onRightWall(ctx, box, caps);
}

function roundTower(ctx: Ctx, foot: { x: number; y: number }, r: number, h: number, color: number, seed: number): void {
  const rand = rng(seed);
  cylinder(ctx, foot.x, foot.y, r, h, color, false);
  ctx.save();
  ctx.beginPath();
  ctx.rect(foot.x - r, foot.y - h, r * 2, h + r);
  ctx.clip();
  // Coursed stone: curved joints following the drum.
  ctx.strokeStyle = 'rgba(20,22,26,0.35)';
  ctx.lineWidth = 0.7;
  for (let k = 6; k < h; k += 6) {
    ctx.beginPath();
    ctx.ellipse(foot.x, foot.y - k, r, r * 0.45, 0, 0, Math.PI);
    ctx.stroke();
  }
  for (let i = 0; i < h / 3; i++) {
    const a = rand() * Math.PI;
    const y = foot.y - rand() * h;
    ctx.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)';
    ctx.fillRect(foot.x - Math.cos(a) * r * 0.9, y, 3, 1.5);
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(14,16,20,0.9)';
  ctx.fillRect(foot.x - 3, foot.y - h * 0.62, 1.6, 7);
  // Crenellated crown with snow on each merlon.
  const crownY = foot.y - h;
  ctx.fillStyle = css(shade(color, 1.18));
  ctx.beginPath();
  ctx.ellipse(foot.x, crownY, r, r * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0xe8eef2);
  ctx.beginPath();
  ctx.ellipse(foot.x, crownY, r - 1.5, r * 0.45 - 1, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let a = -1.25; a <= 1.25; a += 0.42) {
    const mx = foot.x + Math.sin(a) * r * 0.92;
    const my = crownY + Math.cos(a) * r * 0.4;
    ctx.fillStyle = css(shade(color, 1.15 - a * 0.28));
    ctx.fillRect(mx - 1.8, my - 5, 3.6, 5);
    ctx.fillStyle = css(0xf0f4f7);
    ctx.beginPath();
    ctx.ellipse(mx, my - 5, 2.3, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function squareTower(ctx: Ctx, box: IsoBox, p: number, q: number, style: FortressStyle, seed: number): void {
  const size = 18;
  const p0 = Math.min(Math.max(p - size / 2, -4), box.w - size + 4);
  const q0 = Math.min(Math.max(q - size / 2, -4), box.d - size + 4);
  const t = subBox(box, p0, p0 + size, q0, q0 + size, style.wallH + 14);
  walls(ctx, t, (c, w, h, light) => fortressStone(c, w, h, shade(style.wall, 0.95), light, seed), {
    left: (c, w, _h, l) => {
      slit(c, w / 2, 14, l);
      snowEdge(c, w, 3, seed + 1, l);
    },
    right: (c, w, _h, l) => {
      slit(c, w / 2, 22, l);
      snowEdge(c, w, 3, seed + 2, l);
    },
  });
  onRoof(ctx, t, (w, d) => {
    ctx.fillStyle = css(0xe8eef2);
    ctx.fillRect(0, 0, w, d);
  });
  snowyMerlons(ctx, t, shade(style.wall, 1.05), 4, 3);
  outlineBox(ctx, t, 0x14181c);
}

/** Snow banked against the foot of both front walls. */
function snowBank(ctx: Ctx, box: IsoBox, seed: number): void {
  const rand = rng(seed);
  ctx.fillStyle = 'rgba(232,238,243,0.9)';
  for (const [axis, len] of [['p', box.w], ['q', box.d]] as const) {
    for (let t = 6; t < len - 6; t += 9 + rand() * 6) {
      const at = axis === 'p' ? groundPoint(box, t, 0) : groundPoint(box, box.w, t);
      ctx.beginPath();
      ctx.ellipse(at.x, at.y - 1, 6 + rand() * 5, 2 + rand(), axis === 'p' ? 0.45 : -0.45, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** One block of fortress wall: coursed stone, crenellations, snow on every ledge. */
export function paintRampart(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 30, 14);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 4, 0.28);
    walls(ctx, box, (c, w, h, light) => fortressStone(c, w, h, 0x6a737a, light, 141), {
      left: (c, w, _h, l) => {
        slit(c, w / 2, 10, l);
        snowEdge(c, w, 2.5, 142, l);
      },
      right: (c, w, _h, l) => snowEdge(c, w, 2.5, 143, l),
    });
    onRoof(ctx, box, (w, d) => {
      ctx.fillStyle = css(shade(0xe6edf1, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
      ctx.fillStyle = 'rgba(150,170,190,0.35)';
      ctx.fillRect(0, d - 3, w, 3);
    });
    snowyMerlons(ctx, box, 0x7a838a, 5, 4);
    outlineBox(ctx, box, 0x1f252b);
  });
}

/** A stone pier pierced by a barred window, a lamp still burning within. */
export function paintBarredMarker(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 36, 10);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 4, 0.3);
    walls(ctx, box, (c, w, h, light) => fortressStone(c, w, h, 0x4e555e, light, 151), {
      left: (c, w, h, l) => {
        barredWindow(c, w / 2 - 6, h * 0.28, 12, 13, l, true);
        snowEdge(c, w, 3, 152, l);
      },
      right: (c, w, h, l) => {
        barredWindow(c, w / 2 - 5, h * 0.3, 10, 12, l, false);
        snowEdge(c, w, 3, 153, l);
      },
    });
    onRoof(ctx, box, (w, d) => {
      ctx.fillStyle = css(shade(0xe2e9ee, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
    });
    outlineBox(ctx, box, 0x101418);
    // Lamplight spilling onto the snow below the window.
    const sill = groundPoint(box, box.w / 2, 0);
    const g = ctx.createRadialGradient(sill.x, sill.y + 2, 0, sill.x, sill.y + 2, 12);
    g.addColorStop(0, 'rgba(255,200,120,0.3)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(sill.x - 12, sill.y - 10, 24, 16);
  });
}

/** A plank footbridge over one water cell with rope rails; kept low so it can be walked. */
export function paintFootbridge(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 5, 14);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 3, 0.25);
    walls(ctx, box, (c, w, h, light) => {
      c.fillStyle = css(shade(0x3a2a1a, light));
      c.fillRect(0, 0, w, h);
      c.fillStyle = css(shade(0x5a4028, light));
      c.fillRect(0, 0, w, 2);
    });
    onRoof(ctx, box, (w, d) => planks(ctx, w, d, { base: 0x8a6a44, light: LIGHT.roof, seed: 161 }, true, 5));
    outlineBox(ctx, box, 0x24180e);
    // Posts on the four corners and rope rails along the two banks' edges.
    const at = (p: number, q: number) => roofPoint(box, p, q);
    const corners = [at(0, 0), at(0, box.d), at(box.w, 0), at(box.w, box.d)];
    const railH = 10;
    ctx.strokeStyle = css(0xc9b088, 0.95);
    ctx.lineWidth = 1;
    for (const [a, b] of [[corners[1]!, corners[3]!], [corners[0]!, corners[2]!]] as const) {
      post(ctx, a.x, a.y, railH, 2, 0x4a3018);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - railH + 1);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - railH + 4, b.x, b.y - railH + 1);
      ctx.stroke();
      post(ctx, b.x, b.y, railH, 2, 0x4a3018);
    }
  });
}
