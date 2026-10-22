import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, onRoof, outlineBox, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { planks } from './materials';
import { archPath, LIGHT, walls, type FacePainter } from './ornaments';
import { barredWindow, batteredFooting, fortressStone, paintStoneParts, slit, stonePart } from './fortresses';
import { liftedPoint, post, snowEdge, subBox } from './structureParts';

/**
 * The smaller fortress pieces at true scale: the rampart gate between its
 * two towers, the stone pier whose barred window glows above the snow, and
 * the plank footbridge over a mountain stream.
 */

/** The rampart's stone, shared with its connected wall style in walls.ts: 7.3 m to the wall-walk. */
export const RAMPART = { color: 0x6a737a, height: 168 } as const;

/**
 * One face of the rampart in face space: rubble stone on a darker battered
 * course, an arrow slit every cell and a putlog hole between, all on a
 * 32 px period so the courses run on from one piece to the next.
 */
export function rampartFace(ctx: Ctx, w: number, h: number, l: number): void {
  fortressStone(ctx, w, h, RAMPART.color, l, 141);
  for (let u = 16; u < w; u += 32) slit(ctx, u, 30, l);
  ctx.fillStyle = 'rgba(14,16,20,0.55)';
  for (let u = 4; u < w; u += 32) ctx.fillRect(u, 74, 3, 3);
  // Damp streaks under the merlon gaps.
  for (let u = 13; u < w; u += 16) {
    const g = ctx.createLinearGradient(0, 0, 0, 46);
    g.addColorStop(0, 'rgba(20,24,30,0.3)');
    g.addColorStop(1, 'rgba(20,24,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(u - 1.5, 0, 3, 46);
  }
  snowEdge(ctx, w, 5, 142, l);
}

/** The rampart's merlons, 10 px wide on a 16 px period, each under its cap of snow. */
export function rampartMerlons(ctx: Ctx, w: number, color: number, offset: number): void {
  for (let k = -1; k < 4; k++) {
    const u = k * 16 + 3 - (offset % 16);
    const x0 = Math.max(0, u);
    const x1 = Math.min(w, u + 10);
    if (x1 <= x0) continue;
    ctx.fillStyle = css(color);
    ctx.fillRect(x0, -18, x1 - x0, 18);
    ctx.fillStyle = 'rgba(14,16,20,0.45)';
    if (u >= 0) ctx.fillRect(x0, -18, 0.8, 18);
    ctx.fillStyle = 'rgba(240,244,250,0.95)';
    ctx.fillRect(x0 - (u >= 0 ? 1 : 0), -20.5, x1 - x0 + (u + 10 <= w ? 1 : 0) + (u >= 0 ? 1 : 0), 3.5);
  }
}

/** A shepherd's fold wall: dry stone a little over a metre high, laid without mortar. */
export const FOLD_WALL = { height: 28, color: 0x7c766c } as const;

/**
 * One face of the fold wall: flat field stones laid in rough courses with
 * through-stones jutting at intervals, lichen on the north side, snow drifted
 * at the foot. On a 32 px period so runs join.
 */
export function foldWallFace(ctx: Ctx, w: number, h: number, l: number): void {
  ctx.fillStyle = css(shade(0x3a3630, l));
  ctx.fillRect(0, 0, w, h);
  const courses = [0, 7, 14, 21];
  courses.forEach((v, row) => {
    const len = row % 2 ? [9, 12, 11] : [12, 8, 12];
    for (let k = -1; k * 32 < w; k++) {
      let u = k * 32 + (row % 2 ? 4 : 0);
      len.forEach((n, i) => {
        const tone = 0.82 + ((row * 3 + i) % 4) * 0.08;
        ctx.fillStyle = css(shade(FOLD_WALL.color, l * tone));
        ctx.fillRect(u + 0.6, v + 0.6, n - 1.2, 6);
        ctx.fillStyle = 'rgba(255,255,255,0.14)';
        ctx.fillRect(u + 0.6, v + 0.6, n - 1.2, 1);
        u += n;
      });
    }
  });
  // Through-stones, their ends a shade paler, one to a cell.
  for (let u = 11; u < w; u += 32) {
    ctx.fillStyle = css(shade(0x9a9488, l));
    ctx.fillRect(u, 9, 6, 5);
  }
  ctx.fillStyle = 'rgba(236,241,245,0.9)';
  ctx.fillRect(0, h - 4, w, 4);
}

const GATE_TOWER_H = 214;
const GATE_ARCH = { w: 32, h: 84 } as const;

/**
 * The fortress gate (3 x 3): a vaulted passage between two square towers,
 * set in the line of the rampart. The passage runs north to south through
 * the middle column, so its arch opens in the left (south) face; the map
 * keeps that column walkable and blocks the towers either side.
 */
export function paintFortressGate(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, GATE_TOWER_H + 20, 4);
  paintTexture(scene, key, texW, texH, ctx => drawGate(ctx, box));
}

function drawGate(ctx: Ctx, box: IsoBox): void {
  const color = RAMPART.color;
  const mid = box.w / 2;
  const towerW = 26;
  // A trodden track of grey slush through the gate.
  for (let t = -0.3; t < 1.2; t += 0.08) {
    const at = groundPoint(box, mid, box.d * (1 - t));
    ctx.fillStyle = 'rgba(110,106,98,0.35)';
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, 22, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // The two towers and the vaulted block between them are one mass: the
  // arch block is built into the towers' flanks, set back a little from
  // their fronts, and rises to just under their merlons.
  const archFace: FacePainter = (c, w, h, l) => {
    archPath(c, w / 2 - GATE_ARCH.w / 2 - 4, h, GATE_ARCH.w + 8, GATE_ARCH.h + 5);
    c.fillStyle = css(shade(color, l * 1.25));
    c.fill();
    archPath(c, w / 2 - GATE_ARCH.w / 2, h, GATE_ARCH.w, GATE_ARCH.h);
    const vault = c.createLinearGradient(0, h - GATE_ARCH.h, 0, h);
    vault.addColorStop(0, css(0x0c0e12));
    vault.addColorStop(1, css(0x262a30));
    c.fillStyle = vault;
    c.fill();
    // The far mouth of the passage: snow light from the courtyard.
    archPath(c, w / 2 - 9, h - 6, 18, GATE_ARCH.h * 0.6);
    c.fillStyle = 'rgba(200,210,222,0.55)';
    c.fill();
    // The raised portcullis, its teeth just showing under the arch.
    c.fillStyle = css(0x1a1a1e);
    for (let u = w / 2 - GATE_ARCH.w / 2 + 4; u < w / 2 + GATE_ARCH.w / 2 - 3; u += 5) c.fillRect(u, h - GATE_ARCH.h + 26, 2, 10);
    c.fillRect(w / 2 - GATE_ARCH.w / 2 + 3, h - GATE_ARCH.h + 26, GATE_ARCH.w - 6, 2);
    barredWindow(c, w / 2 - 6, 34, 12, 16, l, true);
    snowEdge(c, w, 5, 406, l);
  };
  const towerLeft = (seed: number): FacePainter => (c, w, h, l) => {
    slit(c, w / 2, h * 0.5, l);
    slit(c, w / 2, 40, l, 18);
    snowEdge(c, w, 5, seed + 1, l);
  };
  const towerRight = (seed: number): FacePainter => (c, w, h, l) => {
    slit(c, w * 0.3, h * 0.55, l);
    slit(c, w * 0.7, h * 0.3, l);
    snowEdge(c, w, 5, seed + 2, l);
  };
  const west = stonePart(0, towerW, 2, box.d - 2, GATE_TOWER_H, color, 401, towerLeft(401), towerRight(401));
  const east = stonePart(box.w - towerW, box.w, 2, box.d - 2, GATE_TOWER_H, color, 403, towerLeft(403), towerRight(403));
  const arch = stonePart(towerW, box.w - towerW, 10, box.d - 10, GATE_TOWER_H - 26, shade(color, 1.03), 405, archFace, (c, w, _h, l) => snowEdge(c, w, 5, 407, l));
  paintStoneParts(ctx, box, [west, arch, east], [], part => (part === arch ? { walk: 8 } : { merlon: [10, 8, 16] }));
}

/** A stone pier 5.5 m high, a barred window set in it above a man's reach, a lamp still burning within. */
export function paintBarredMarker(scene: Phaser.Scene, key: string): void {
  const h = 128;
  const { box, texW, texH } = footprintBox(1, 1, h, 12);
  const color = 0x4e555e;
  paintTexture(scene, key, texW, texH, ctx => {
    const pier = subBox(box, 3, box.w - 3, 3, box.d - 3, h);
    groundShadow(ctx, pier, 6, 0.3);
    walls(ctx, pier, (c, w, fh, light) => fortressStone(c, w, fh, color, light, 151), {
      left: (c, w, fh, l) => {
        barredWindow(c, w / 2 - 7, fh - 96, 14, 20, l, true);
        snowEdge(c, w, 5, 152, l);
      },
      right: (c, w, fh, l) => {
        slit(c, w / 2, fh - 108, l, 20);
        snowEdge(c, w, 5, 153, l);
      },
    });
    onRoof(ctx, pier, (w, d) => {
      ctx.fillStyle = css(shade(0xe2e9ee, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
    });
    outlineBox(ctx, pier, 0x101418);
    batteredFooting(ctx, box, 0, 3, 18, color, 150);
    // Lamplight from the window falling on the snow below.
    const sill = groundPoint(pier, pier.w / 2, -6);
    const g = ctx.createRadialGradient(sill.x, sill.y + 2, 0, sill.x, sill.y + 2, 18);
    g.addColorStop(0, 'rgba(255,200,120,0.32)');
    g.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = g;
    ctx.fillRect(sill.x - 18, sill.y - 14, 36, 24);
  });
}

/** A plank footbridge over one water cell, with rope rails at hand height; low enough to walk. */
export function paintFootbridge(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 6, 26);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 3, 0.25);
    walls(ctx, box, (c, w, h, light) => {
      c.fillStyle = css(shade(0x3a2a1a, light));
      c.fillRect(0, 0, w, h);
      c.fillStyle = css(shade(0x5a4028, light));
      c.fillRect(0, 0, w, 2);
    });
    onRoof(ctx, box, (w, d) => {
      planks(ctx, w, d, { base: 0x8a6a44, light: LIGHT.roof, seed: 161 }, true, 6);
      ctx.fillStyle = 'rgba(236,241,245,0.6)';
      ctx.fillRect(0, 0, 4, d);
      ctx.fillRect(w - 4, 0, 4, d);
    });
    outlineBox(ctx, box, 0x24180e);
    // Posts on the four corners and rope rails a metre up along the two banks' edges.
    const at = (p: number, q: number) => liftedPoint(box, p, q, box.h);
    const corners = [at(0, 0), at(0, box.d), at(box.w, 0), at(box.w, box.d)];
    const railH = 23;
    ctx.strokeStyle = css(0xc9b088, 0.95);
    ctx.lineWidth = 1.3;
    for (const [a, b] of [[corners[1]!, corners[3]!], [corners[0]!, corners[2]!]] as const) {
      post(ctx, a.x, a.y, railH, 3, 0x4a3018);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - railH + 2);
      ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 - railH + 7, b.x, b.y - railH + 2);
      ctx.stroke();
      post(ctx, b.x, b.y, railH, 3, 0x4a3018);
    }
  });
}
