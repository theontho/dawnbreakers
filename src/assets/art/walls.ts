import type Phaser from 'phaser';
import { straw } from './badashtProps';
import { css, onLeftWall, onRightWall, onRoof, paintTexture, polygon, shade, type Ctx, type IsoBox } from './canvasKit';
import { fortressStone } from './fortresses';
import { brick, glazedTiles, planks, plaster, stone, type Surface } from './materials';
import { archPath, clipped, LIGHT } from './ornaments';
import { seraiBayFace, seraiWindowFace } from './seraiWalls';
import { shipCurtainFace, shipPegsFace, shipPortFace, shipTimberFace } from './shipCabinWalls';
import { shrineNicheFace, shrineWallFace } from './shrineInterior';
import { snowEdge } from './structureParts';
import { TENT_CLOTH, tentLiningFace } from './tentInterior';
import { lashing, stakeRow } from './timber';
import { COMPOUND_WALL, compoundWallFace, TOWN_WALL, townWallFace } from './town/townWalls';

/**
 * Connected walls. A wall is placed one cell at a time, but each cell's
 * piece is painted for the neighbours it joins (a 4-bit mask: N, E, S, W),
 * so a ring of cells reads as one continuous wall with real corners,
 * T-junctions and end caps. Courses, merlons and stakes repeat on a period
 * that divides the cell width, so they line up across cells, and seams
 * between joined pieces are never outlined.
 */

export const WALL_N = 1;
export const WALL_E = 2;
export const WALL_S = 4;
export const WALL_W = 8;

type Cap = 'merlons' | 'snowMerlons' | 'stakes' | 'coping' | 'rail' | 'flat' | 'battlements' | 'mudCoping';

/** Headroom each cap needs above the wall. */
const CAP_PAD: Record<Cap, number> = { merlons: 8, snowMerlons: 8, stakes: 10, coping: 3, rail: 3, flat: 3, battlements: 18, mudCoping: 6 };

export interface WallStyle {
  height: number;
  /** Thickness as a fraction of a cell. */
  thickness: number;
  /** Paints one face in face space; `light` is the face brightness. */
  face: (ctx: Ctx, w: number, h: number, light: number) => void;
  top: number;
  cap: Cap;
  /** Other textures this wall joins as if they were wall (gates, towers). */
  joins?: readonly string[];
}

const surf = (base: number, light: number, seed: number): Surface => ({ base, light, seed });

export const WALL_STYLES: Readonly<Record<string, WallStyle>> = {
  'ch6-rampart': {
    height: 46, thickness: 0.5, top: 0x7a838a, cap: 'snowMerlons',
    face: (ctx, w, h, l) => {
      fortressStone(ctx, w, h, 0x6a737a, l, 141);
      snowEdge(ctx, w, 2.5, 142, l);
    },
  },
  'ch2-city-wall': {
    height: 54, thickness: 0.5, top: 0xb89466, cap: 'merlons', joins: ['ch2-quran-gate'],
    face: (ctx, w, h, l) => {
      rammedEarth(ctx, w, h, 0xb08a5a, l, 23);
      // Rain has cut shallow gullies down from the merlons.
      for (let u = 4; u < w; u += 8) {
        const g = ctx.createLinearGradient(0, 0, 0, 14);
        g.addColorStop(0, css(shade(0xb08a5a, l * 0.72), 0.5));
        g.addColorStop(1, css(shade(0xb08a5a, l * 0.72), 0));
        ctx.fillStyle = g;
        ctx.fillRect(u - 1, 0, 2, 14);
      }
    },
  },
  'ch10-city-wall': {
    height: 60, thickness: 0.55, top: 0xa88660, cap: 'merlons', joins: ['gate'],
    face: (ctx, w, h, l) => {
      rammedEarth(ctx, w, h, 0xa88660, l, 91);
      // Putlog holes from the formwork, and loopholes under the merlons.
      ctx.fillStyle = 'rgba(30,18,8,0.55)';
      for (let v = h - 11; v > 14; v -= 18) for (let u = 6; u < w; u += 16) ctx.fillRect(u, v - 3, 2, 2);
      ctx.fillStyle = 'rgba(20,12,6,0.8)';
      for (let u = 14; u < w; u += 32) ctx.fillRect(u, 9, 2, 8);
      ctx.fillStyle = 'rgba(240,242,246,0.55)';
      ctx.fillRect(0, h - 5, w, 5);
    },
  },
  'ch10-vault-wall': {
    height: 84, thickness: 0.6, top: 0x2a2826, cap: 'flat',
    face: (ctx, w, h, l) => {
      brick(ctx, w, h, surf(0x3e3a36, l, 41), 4, 8);
      clipped(ctx, w, h, () => {
        ctx.translate(0, h - 22);
        stone(ctx, w, 22, surf(0x4a4844, l, 43), 7);
      });
      // Damp streaks down from the vault.
      for (let u = 3; u < w; u += 11) {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, 'rgba(10,12,10,0.45)');
        g.addColorStop(1, 'rgba(10,12,10,0)');
        ctx.fillStyle = g;
        ctx.fillRect(u, 0, 2.5, h * 0.7);
      }
    },
  },
  'ch7-garden-wall': {
    height: 32, thickness: 0.3, top: 0xa88456, cap: 'coping',
    face: (ctx, w, h, l) => {
      plaster(ctx, w, h, surf(0x9c7648, l, 261));
      straw(ctx, w, h, l, 262);
    },
  },
  'ch8-palisade': {
    height: 42, thickness: 0.3, top: 0x5a4028, cap: 'stakes', joins: ['ch8-watchtower'],
    face: (ctx, w, h) => {
      ctx.fillStyle = css(0x1a120a);
      ctx.fillRect(0, 0, w, h);
    },
  },
  // Indoors; see interiorFace.
  'interior-wall': {
    height: 90, thickness: 0.3, top: 0xd8ccb0, cap: 'flat', joins: ['interior-mihrab'],
    face: (ctx, w, h, l) => interiorFace(ctx, w, h, l),
  },
  // The prayer niche set into the qibla wall: a tiled frame round a pointed arch.
  'interior-mihrab': {
    height: 90, thickness: 0.3, top: 0xd8ccb0, cap: 'flat', joins: ['interior-wall'],
    face: (ctx, w, h, l) => {
      interiorFace(ctx, w, h, l);
      ctx.fillStyle = css(shade(0x24477a, l));
      ctx.fillRect(5, 8, 22, h - 8);
      glazedFrame(ctx, 6, 9, 20, h - 10, l);
      archPath(ctx, 10, h - 2, 12, h - 22);
      ctx.fillStyle = css(shade(0xe8d9a8, l * 0.8));
      ctx.fill();
      archPath(ctx, 12, h - 2, 8, h - 28);
      ctx.fillStyle = css(shade(0x6a5638, l));
      ctx.fill();
    },
  },
  // The pilgrim ship's cabin, below the quarterdeck; see shipCabinWalls.ts.
  'ch3-cabin-wall': {
    height: 64, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-port', 'ch3-cabin-pegs', 'ch3-cabin-curtain'],
    face: shipTimberFace,
  },
  'ch3-cabin-port': {
    height: 64, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-pegs', 'ch3-cabin-curtain'],
    face: shipPortFace,
  },
  'ch3-cabin-pegs': {
    height: 64, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-port', 'ch3-cabin-curtain'],
    face: shipPegsFace,
  },
  // The partition into the inner room, hung with a curtain that is never drawn aside.
  'ch3-cabin-curtain': {
    height: 64, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-port', 'ch3-cabin-pegs'],
    face: shipCurtainFace,
  },
  // The arcade of lodging rooms round a caravanserai court; see seraiWalls.ts.
  'ch2-serai-bay': {
    height: 72, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay-lit', 'ch2-serai-window'],
    face: (ctx, w, h, l) => seraiBayFace(ctx, w, h, l, false),
  },
  'ch2-serai-bay-lit': {
    height: 72, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay', 'ch2-serai-window'],
    face: (ctx, w, h, l) => seraiBayFace(ctx, w, h, l, true),
  },
  'ch2-serai-window': {
    height: 72, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay', 'ch2-serai-bay-lit'],
    face: seraiWindowFace,
  },
  'ch3-ship-rail': {
    height: 16, thickness: 0.14, top: 0x8a6440, cap: 'rail',
    face: (ctx, w, h, l) => {
      ctx.fillStyle = css(shade(0x5a3a1f, l));
      for (let u = 2; u < w; u += 8) ctx.fillRect(u, 2, 2.4, h - 2);
      clipped(ctx, w, h, () => {
        ctx.translate(0, h - 6);
        planks(ctx, w, 6, surf(0x6b4a2c, l, 5), false, 3);
      });
    },
  },
  // The shrine of Shaykh Ṭabarsí: limewash, damp and lamp smoke; see shrineInterior.
  'ch8-shrine-wall': {
    height: 80, thickness: 0.34, top: 0xcfc8b4, cap: 'flat', joins: ['ch8-shrine-niche'],
    face: shrineWallFace,
  },
  'ch8-shrine-niche': {
    height: 80, thickness: 0.34, top: 0xcfc8b4, cap: 'flat', joins: ['ch8-shrine-wall'],
    face: shrineNicheFace,
  },
  // A Badasht pavilion seen from inside: printed cotton lining; see tentInterior.
  'ch7-tent-wall': {
    height: 50, thickness: 0.12, top: TENT_CLOTH, cap: 'flat',
    face: tentLiningFace,
  },
  // True scale (the Shíráz pilot): the city wall, rammed earth under big merlons; see town/townWalls.
  'town-wall': {
    height: TOWN_WALL.height, thickness: 0.8, top: 0xb89670, cap: 'battlements', joins: ['city-gate-large'],
    face: townWallFace,
  },
  // A courtyard or garden wall at true scale, joining the town houses it closes.
  'compound-wall': {
    height: COMPOUND_WALL.height, thickness: 0.3, top: 0xc49a68, cap: 'mudCoping',
    joins: ['town-house-small', 'town-house', 'town-house-large'],
    face: compoundWallFace,
  },
};

export function isWallTexture(texture: string): boolean {
  return texture in WALL_STYLES;
}

export function wallTextureKey(texture: string, mask: number, cut = false): string {
  return `${texture}#${mask}${cut ? 'c' : ''}`;
}

/**
 * Walls along the camera-facing edges of a map are drawn cut away: only the
 * lower courses stand, with the wall's core showing on top, so they frame
 * the scene instead of hiding everything behind them.
 */
const CUT_HEIGHT = 34;

/** The base texture (used by the editor palette) is a straight east-west run. */
export function paintWallBase(scene: Phaser.Scene, texture: string): void {
  ensureWallTexture(scene, texture, WALL_E | WALL_W, false, texture);
}

export function ensureWallTexture(scene: Phaser.Scene, texture: string, mask: number, cut = false, key = wallTextureKey(texture, mask, cut)): void {
  const full = WALL_STYLES[texture];
  if (!full) return;
  const style: WallStyle = cut
    ? { ...full, height: Math.min(full.height, CUT_HEIGHT), cap: 'flat', top: shade(full.top, 0.62) }
    : full;
  const texH = 32 + style.height + CAP_PAD[style.cap];
  paintTexture(scene, key, 64, texH, ctx => paintWall(ctx, style, mask, texH - 32));
}

interface Part {
  a0: number;
  a1: number;
  b0: number;
  b1: number;
}

/** Grid-space (a along +x, b along +y, both 0..1 in the cell) to texture pixels. */
function at(topY: number, a: number, b: number): { x: number; y: number } {
  return { x: 32 + (a - b) * 32, y: topY + (a + b) * 16 };
}

function paintWall(ctx: Ctx, style: WallStyle, mask: number, topY: number): void {
  const c0 = 0.5 - style.thickness / 2;
  const c1 = 0.5 + style.thickness / 2;
  const has = (bit: number) => (mask & bit) !== 0;
  // Back arms, centre, front arms: painter's order.
  const parts: Part[] = [];
  if (has(WALL_W)) parts.push({ a0: 0, a1: c0, b0: c0, b1: c1 });
  if (has(WALL_N)) parts.push({ a0: c0, a1: c1, b0: 0, b1: c0 });
  parts.push({ a0: c0, a1: c1, b0: c0, b1: c1 });
  if (has(WALL_E)) parts.push({ a0: c1, a1: 1, b0: c0, b1: c1 });
  if (has(WALL_S)) parts.push({ a0: c0, a1: c1, b0: c1, b1: 1 });

  const covered = (a: number, b: number): boolean => {
    if (a < 0) return has(WALL_W) && b > c0 && b < c1;
    if (a > 1) return has(WALL_E) && b > c0 && b < c1;
    if (b < 0) return has(WALL_N) && a > c0 && a < c1;
    if (b > 1) return has(WALL_S) && a > c0 && a < c1;
    return parts.some(p => a > p.a0 && a < p.a1 && b > p.b0 && b < p.b1);
  };
  const e = 0.01;

  // Contact shadow cast to the right of the wall.
  ctx.fillStyle = 'rgba(10,6,3,0.22)';
  for (const p of parts) {
    polygon(ctx, [at(topY, p.a0, p.b1), at(topY, p.a1 + 0.12, p.b1), at(topY, p.a1 + 0.12, p.b0), at(topY, p.a0, p.b0)]);
    ctx.fill();
  }

  for (const p of parts) {
    const f = at(topY, p.a1, p.b1);
    const box: IsoBox = { x: f.x, y: f.y, w: (p.a1 - p.a0) * 32, d: (p.b1 - p.b0) * 32, h: style.height };
    const leftExposed = !covered((p.a0 + p.a1) / 2, p.b1 + e);
    const rightExposed = !covered(p.a1 + e, (p.b0 + p.b1) / 2);
    // Faces are painted in run-aligned pattern space so courses continue across cells.
    if (leftExposed) onLeftWall(ctx, box, (w, h) => alignedFace(ctx, style, w, h, LIGHT.left, p.a0 * 32));
    if (rightExposed) onRightWall(ctx, box, (w, h) => alignedFace(ctx, style, w, h, LIGHT.right, (1 - p.b1) * 32));
    onRoof(ctx, box, (w, d) => {
      ctx.fillStyle = css(shade(style.top, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
    });
    capFaces(ctx, style, box, p, leftExposed, rightExposed);
    outlineEdges(ctx, box, p, covered, e);
  }
}

function alignedFace(ctx: Ctx, style: WallStyle, w: number, h: number, light: number, offset: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();
  const shift = offset % 32;
  ctx.translate(-shift, 0);
  style.face(ctx, w + shift, h, light);
  ctx.restore();
}

/** Merlons, stakes, snow or coping along the top of the exposed faces. */
function capFaces(ctx: Ctx, style: WallStyle, box: IsoBox, p: Part, left: boolean, right: boolean): void {
  const paint = (w: number, light: number, offset: number) => {
    const base = shade(style.top, light);
    switch (style.cap) {
      case 'merlons':
      case 'snowMerlons':
        for (let k = -1; k < 6; k++) {
          const u = k * 8 + 2 - (offset % 8);
          if (u + 4 <= 0 || u >= w) continue;
          ctx.fillStyle = css(base);
          ctx.fillRect(Math.max(0, u), -5, Math.min(4, w - u, u + 4), 5);
          if (style.cap === 'snowMerlons') {
            ctx.fillStyle = 'rgba(240,244,250,0.95)';
            ctx.fillRect(Math.max(0, u), -6.5, Math.min(4, w - u, u + 4), 2);
          }
        }
        break;
      case 'stakes':
        ctx.save();
        ctx.translate(-(offset % 8), 0);
        stakeRow(ctx, w + 8, box.h, light, 5 + Math.round(offset), 8, 7);
        lashing(ctx, w + 8, box.h * 0.28, light);
        lashing(ctx, w + 8, box.h * 0.62, light);
        ctx.restore();
        clipped(ctx, w, box.h, () => {
          ctx.translate(0, box.h - 7);
          stone(ctx, w, 7, surf(0x8a8578, light, 2), 3.5);
        });
        break;
      case 'coping':
        ctx.fillStyle = css(shade(style.top, light * 1.05));
        ctx.fillRect(0, -1, w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 2, w, 1);
        break;
      case 'rail':
        ctx.fillStyle = css(shade(style.top, light));
        ctx.fillRect(0, -1.5, w, 3);
        break;
      case 'battlements':
        // Rounded merlons a man's height, two to a cell, each with a loophole.
        for (let k = -1; k < 4; k++) {
          const u = k * 16 + 3 - (offset % 16);
          if (u + 10 <= 0 || u >= w) continue;
          ctx.save();
          ctx.beginPath();
          ctx.rect(0, -20, w, 20);
          ctx.clip();
          ctx.fillStyle = css(base);
          ctx.beginPath();
          ctx.moveTo(u, 0);
          ctx.lineTo(u, -12);
          ctx.quadraticCurveTo(u + 5, -19, u + 10, -12);
          ctx.lineTo(u + 10, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = 'rgba(28,18,10,0.55)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.fillStyle = 'rgba(16,10,4,0.8)';
          ctx.fillRect(u + 4, -10, 2, 6);
          ctx.restore();
        }
        break;
      case 'mudCoping':
        // A rounded cap of mud plaster, bulging a little over the face.
        {
          const g = ctx.createLinearGradient(0, -4, 0, 5);
          g.addColorStop(0, css(shade(style.top, light * 1.2)));
          g.addColorStop(1, css(shade(style.top, light * 0.85)));
          ctx.fillStyle = g;
          ctx.fillRect(0, -4, w, 9);
          ctx.fillStyle = 'rgba(0,0,0,0.22)';
          ctx.fillRect(0, 5, w, 1.5);
        }
        break;
      case 'flat':
        break;
    }
  };
  if (left) onLeftWall(ctx, box, w => paint(w, LIGHT.left, p.a0 * 32));
  if (right) onRightWall(ctx, box, w => paint(w, LIGHT.right, (1 - p.b1) * 32));
  if (style.cap === 'snowMerlons') {
    onRoof(ctx, box, (w, d) => {
      ctx.fillStyle = 'rgba(236,240,246,0.9)';
      ctx.fillRect(0, 0, w, d);
    });
  }
}

/** Outline only silhouette edges, never the seams between joined pieces. */
function outlineEdges(ctx: Ctx, box: IsoBox, p: Part, covered: (a: number, b: number) => boolean, e: number): void {
  const midA = (p.a0 + p.a1) / 2;
  const midB = (p.b0 + p.b1) / 2;
  const top = (pa: number, pb: number) => {
    const x = box.x - box.w + pa + pb;
    const y = box.y - box.w / 2 - box.h + pa / 2 - pb / 2;
    return { x, y };
  };
  const { w, d } = box;
  ctx.strokeStyle = 'rgba(28,18,10,0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  // Top edges: back-left (a0), back-right (b0), front-left (b1), front-right (a1).
  if (!covered(p.a0 - e, midB)) line(ctx, top(0, 0), top(0, d));
  if (!covered(midA, p.b0 - e)) line(ctx, top(0, d), top(w, d));
  if (!covered(midA, p.b1 + e)) line(ctx, top(0, 0), top(w, 0));
  if (!covered(p.a1 + e, midB)) line(ctx, top(w, 0), top(w, d));
  // Vertical arrises at silhouette corners only.
  const drop = (pt: { x: number; y: number }) => line(ctx, pt, { x: pt.x, y: pt.y + box.h });
  const leftFace = !covered(midA, p.b1 + e);
  const rightFace = !covered(p.a1 + e, midB);
  if (leftFace && !covered(p.a0 - e, p.b1 - e)) drop(top(0, 0));
  if ((leftFace || rightFace) && !covered(p.a1 + e, p.b1 - e) && !covered(p.a1 - e, p.b1 + e)) drop(top(w, 0));
  if (rightFace && !covered(p.a1 - e, p.b0 - e)) drop(top(w, d));
  ctx.stroke();
}

function line(ctx: Ctx, a: { x: number; y: number }, b: { x: number; y: number }): void {
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
}

/** Indoor wall: lime plaster over a dado of glazed tile, with a moulded cornice. */
function interiorFace(ctx: Ctx, w: number, h: number, l: number): void {
  plaster(ctx, w, h, surf(0xd6c9aa, l, 301));
  clipped(ctx, w, h, () => {
    ctx.translate(0, h - 18);
    glazedTiles(ctx, w, 18, surf(0x2e7c8a, l, 302), 4);
  });
  ctx.fillStyle = css(shade(0xe8d9a8, l));
  ctx.fillRect(0, h - 19, w, 1.5);
  ctx.fillStyle = css(shade(0xb8a888, l));
  ctx.fillRect(0, 0, w, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(0, 3, w, 1);
}

/** A glazed-tile frame (turquoise border, cream bead) round a panel. */
function glazedFrame(ctx: Ctx, x: number, y: number, w: number, h: number, l: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.rect(x + 3, y + 3, w - 6, h - 3);
  ctx.clip('evenodd');
  ctx.translate(x, y);
  glazedTiles(ctx, w, h, surf(0x2e8c96, l, 303), 3);
  ctx.restore();
  ctx.strokeStyle = css(shade(0xe8d9a8, l), 0.9);
  ctx.lineWidth = 0.8;
  ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
}

/** Rammed earth: plaster with the horizontal lift lines of the formwork. */
function rammedEarth(ctx: Ctx, w: number, h: number, base: number, light: number, seed: number): void {
  plaster(ctx, w, h, surf(base, light, seed));
  ctx.fillStyle = 'rgba(40,24,10,0.22)';
  for (let v = 9; v < h - 2; v += 9) ctx.fillRect(0, v, w, 1);
  ctx.fillStyle = 'rgba(255,240,210,0.1)';
  for (let v = 10; v < h - 2; v += 9) ctx.fillRect(0, v, w, 0.8);
}
