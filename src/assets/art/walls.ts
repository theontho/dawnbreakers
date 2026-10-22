import type Phaser from 'phaser';
import { GARDEN_WALL_H, gardenWallFace } from './badashtProps';
import { stairDoorFace } from './kalantarHouse';
import { css, onLeftWall, onRightWall, onRoof, paintTexture, polygon, shade, type Ctx, type IsoBox } from './canvasKit';
import { FOLD_WALL, foldWallFace, RAMPART, rampartFace, rampartMerlons } from './fortressProps';
import { brick, glazedTiles, plaster, stone, type Surface } from './materials';
import { archPath, clipped, LIGHT } from './ornaments';
import { SERAI_BAY_H, seraiBayFace, seraiWindowFace } from './seraiWalls';
import { MADRASA_BAY_H, madrasaBayFace, madrasaBlindFace } from './tehranMadrasa';
import {
  SHIP_CABIN_WALL_H, shipCurtainFace, shipPegsFace, shipPortFace, shipTimberFace,
} from './shipCabinWalls';
import { SHRINE_WALL_H, shrineNicheFace, shrineWallFace } from './shrineInterior';
import { ARCH_WALL_H, lowArchFace } from './siyahChal';
import { CITY_WALL_H, cityWallFace, snowyCityWallFace } from './tehranGate';
import { TENT_CLOTH, TENT_WALL_H, tentLiningFace } from './tentInterior';
import { PALISADE, palisadeCap, palisadeFace } from './palisade';
import { COMPOUND_WALL, compoundWallFace, TOWN_WALL, townWallFace } from './town/townWalls';
import { vakilWallFace } from './vakilHall';
import { BRIDGE_GALLERY_H, bridgeGalleryFace } from './isfahanBridge';
import { ROOF_PARAPET_H, roofParapetFace } from './tabriz';

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

type Cap = 'merlons' | 'snowMerlons' | 'stakes' | 'coping' | 'flat' | 'battlements' | 'mudCoping';

/** Headroom each cap needs above the wall. */
const CAP_PAD: Record<Cap, number> = { merlons: 8, snowMerlons: 22, stakes: 10, coping: 3, flat: 3, battlements: 18, mudCoping: 6 };

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
  // The mountain fortresses' outer wall (chapter 6), 8 m to the merlon tops; see fortressProps.
  'ch6-rampart': {
    height: RAMPART.height, thickness: 0.6, top: 0x7a838a, cap: 'snowMerlons',
    joins: ['ch6-fortress-gate', 'ch6-maku-fortress', 'ch6-chihriq-fortress'],
    face: rampartFace,
  },
  // A shepherd's fold on the mountainside (chapter 6): 1.2 m of dry stone under a cap of snow; see fortressProps.
  'ch6-fold-wall': {
    height: FOLD_WALL.height, thickness: 0.3, top: 0xe6ecf0, cap: 'mudCoping',
    face: foldWallFace,
  },
  // Ṭihrán's city wall (chapter 10), 5.7 m of rammed earth, plain in summer and snowbound in winter; see tehranGate.
  'ch10-city-wall': {
    height: CITY_WALL_H, thickness: 0.6, top: 0xb89670, cap: 'battlements', joins: ['ch10-west-gate'],
    face: cityWallFace,
  },
  'ch10-city-wall-snow': {
    height: CITY_WALL_H, thickness: 0.6, top: 0xb89670, cap: 'snowMerlons', joins: ['ch10-west-gate'],
    face: snowyCityWallFace,
  },
  // The Síyáh-Chál's walls, as high as its arcade (4.3 m); see siyahChal.
  'ch10-low-arch': {
    height: ARCH_WALL_H, thickness: 0.6, top: 0x2a2826, cap: 'flat', joins: ['ch10-vault-wall'],
    face: lowArchFace,
  },
  'ch10-vault-wall': {
    height: ARCH_WALL_H, thickness: 0.6, top: 0x2a2826, cap: 'flat', joins: ['ch10-low-arch'],
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
  // Badasht's garden walls (chapter 7), at true scale; see badashtProps.
  'ch7-garden-wall': {
    height: GARDEN_WALL_H, thickness: 0.34, top: 0xa88456, cap: 'mudCoping',
    face: gardenWallFace,
  },
  // Ṭabarsí's palisade (chapter 8): 3.5 m of stakes on an earth bank; see palisade.ts.
  'ch8-palisade': {
    height: PALISADE.height, thickness: 0.36, top: 0x5a4028, cap: 'stakes', joins: ['ch8-watchtower'],
    face: palisadeFace,
  },
  // Indoors; see interiorFace.
  'interior-wall': {
    height: 90, thickness: 0.3, top: 0xd8ccb0, cap: 'flat', joins: ['interior-mihrab', 'martyrs-stair-door'],
    face: (ctx, w, h, l) => interiorFace(ctx, w, h, l),
  },
  // The door to the stair in the Kalántar's house; see kalantarHouse.
  'martyrs-stair-door': {
    height: 90, thickness: 0.3, top: 0xd8ccb0, cap: 'flat', joins: ['interior-wall'],
    face: (ctx, w, h, l) => stairDoorFace(ctx, w, h, l, interiorFace),
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
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-port', 'ch3-cabin-pegs', 'ch3-cabin-curtain'],
    face: shipTimberFace,
  },
  'ch3-cabin-port': {
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-pegs', 'ch3-cabin-curtain'],
    face: shipPortFace,
  },
  'ch3-cabin-pegs': {
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-port', 'ch3-cabin-curtain'],
    face: shipPegsFace,
  },
  // The partition into the inner room, hung with a curtain that is never drawn aside.
  'ch3-cabin-curtain': {
    height: SHIP_CABIN_WALL_H, thickness: 0.26, top: 0x5a3a20, cap: 'flat', joins: ['ch3-cabin-wall', 'ch3-cabin-port', 'ch3-cabin-pegs'],
    face: shipCurtainFace,
  },
  // The arcade of lodging rooms round a caravanserai court; see seraiWalls.ts.
  'ch2-serai-bay': {
    height: SERAI_BAY_H, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay-lit', 'ch2-serai-window'],
    face: (ctx, w, h, l) => seraiBayFace(ctx, w, h, l, false),
  },
  'ch2-serai-bay-lit': {
    height: SERAI_BAY_H, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay', 'ch2-serai-window'],
    face: (ctx, w, h, l) => seraiBayFace(ctx, w, h, l, true),
  },
  'ch2-serai-window': {
    height: SERAI_BAY_H, thickness: 0.34, top: 0xb89466, cap: 'coping', joins: ['ch2-serai-bay', 'ch2-serai-bay-lit'],
    face: seraiWindowFace,
  },
  // The arcade of students' cells round a Ṭihrán madrasa court; see tehranMadrasa.ts.
  'nur-madrasa-cell': {
    height: MADRASA_BAY_H, thickness: 0.34, top: 0xbc9a6a, cap: 'coping', joins: ['nur-madrasa-cell-lit', 'nur-madrasa-blind'],
    face: (ctx, w, h, l) => madrasaBayFace(ctx, w, h, l, false),
  },
  'nur-madrasa-cell-lit': {
    height: MADRASA_BAY_H, thickness: 0.34, top: 0xbc9a6a, cap: 'coping', joins: ['nur-madrasa-cell', 'nur-madrasa-blind'],
    face: (ctx, w, h, l) => madrasaBayFace(ctx, w, h, l, true),
  },
  'nur-madrasa-blind': {
    height: MADRASA_BAY_H, thickness: 0.34, top: 0xbc9a6a, cap: 'coping', joins: ['nur-madrasa-cell', 'nur-madrasa-cell-lit'],
    face: madrasaBlindFace,
  },
  // The shrine of Shaykh Ṭabarsí: limewash, damp and lamp smoke; see shrineInterior.
  'ch8-shrine-wall': {
    height: SHRINE_WALL_H, thickness: 0.34, top: 0xcfc8b4, cap: 'flat', joins: ['ch8-shrine-niche'],
    face: shrineWallFace,
  },
  'ch8-shrine-niche': {
    height: SHRINE_WALL_H, thickness: 0.34, top: 0xcfc8b4, cap: 'flat', joins: ['ch8-shrine-wall'],
    face: shrineNicheFace,
  },
  // A Badasht pavilion seen from inside: printed cotton lining; see tentInterior.
  'ch7-tent-wall': {
    height: TENT_WALL_H, thickness: 0.12, top: TENT_CLOTH, cap: 'flat',
    face: tentLiningFace,
  },
  // True scale (the Shíráz pilot): the city wall, rammed earth under big merlons; see town/townWalls.
  'town-wall': {
    height: TOWN_WALL.height, thickness: 0.8, top: 0xb89670, cap: 'battlements', joins: ['city-gate', 'ch2-quran-gate'],
    face: townWallFace,
  },
  // A courtyard or garden wall at true scale, joining the town houses it closes.
  'compound-wall': {
    height: COMPOUND_WALL.height, thickness: 0.3, top: 0xc49a68, cap: 'mudCoping',
    joins: ['town-house-small', 'town-house', 'town-house-large'],
    face: compoundWallFace,
  },
  // The Vakíl Mosque's hall walls (chapter 4): yellow brick, haft-rang band, marble dado; see vakilHall.ts.
  'ch4-vakil-wall': {
    height: 150, thickness: 0.4, top: 0xc8a070, cap: 'coping', joins: ['ch4-qibla-iwan', 'ch4-prayer-arch', 'ch4-vakil-portal'],
    face: vakilWallFace,
  },
  // The Sí-o-Se-Pol's west gallery seen from the roadway (chapter 5): an arch to each cell; see isfahanBridge.ts.
  'ch5-bridge-gallery': {
    height: BRIDGE_GALLERY_H, thickness: 0.9, top: 0xc9a46a, cap: 'coping',
    face: (ctx, w, h, l) => bridgeGalleryFace(ctx, w, h, l),
  },
  // The low brick parapets of the Tabríz roofs (chapter 9), chest-high at true scale; see tabriz.ts.
  'ch9-parapet-low': {
    height: ROOF_PARAPET_H, thickness: 0.3, top: 0xd8c8a4, cap: 'coping',
    face: roofParapetFace,
  },
};

export function isWallTexture(texture: string): boolean {
  return texture in WALL_STYLES;
}

/**
 * How far a building's walls stand in from the south and east edges of its
 * footprint. A wall running up to it from the south or east reaches on by
 * that much, so it meets the face instead of stopping short of it.
 */
export interface BuildingFaces {
  s: number;
  e: number;
}

/** How far a wall's north (`n`) and west (`w`) arms reach on into the building they join. */
export interface WallReach {
  n: number;
  w: number;
}

const NO_REACH: WallReach = { n: 0, w: 0 };
/** Side margin of a wall texture whose arms reach into the next cell. */
const REACH_PAD = 16;

export function wallTextureKey(texture: string, mask: number, cut = false, reach: WallReach = NO_REACH): string {
  const into = reach.n || reach.w ? `r${reach.n},${reach.w}` : '';
  return `${texture}#${mask}${cut ? 'c' : ''}${into}`;
}

/**
 * Walls along the camera-facing edges of a map are drawn cut away: only the
 * lower courses stand, with the wall's core showing on top, so they frame
 * the scene instead of hiding everything behind them.
 */
const CUT_HEIGHT = 34;

/** The base texture (used by the editor palette) is a straight east-west run. */
export function paintWallBase(scene: Phaser.Scene, texture: string): void {
  ensureWallTexture(scene, texture, WALL_E | WALL_W, false, NO_REACH, texture);
}

export function ensureWallTexture(
  scene: Phaser.Scene, texture: string, mask: number, cut = false, reach: WallReach = NO_REACH, key = wallTextureKey(texture, mask, cut, reach),
): void {
  const full = WALL_STYLES[texture];
  if (!full) return;
  const style: WallStyle = cut
    ? { ...full, height: Math.min(full.height, CUT_HEIGHT), cap: 'flat', top: shade(full.top, 0.62) }
    : full;
  const texH = 32 + style.height + CAP_PAD[style.cap];
  // Arms reaching into the next cell need room either side (the texture stays centred on its cell).
  const pad = reach.n || reach.w ? REACH_PAD : 0;
  paintTexture(scene, key, 64 + pad * 2, texH, ctx => {
    ctx.translate(pad, 0);
    paintWall(ctx, style, mask, texH - 32, reach);
  });
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

function paintWall(ctx: Ctx, style: WallStyle, mask: number, topY: number, reach: WallReach): void {
  const c0 = 0.5 - style.thickness / 2;
  const c1 = 0.5 + style.thickness / 2;
  const has = (bit: number) => (mask & bit) !== 0;
  // Back arms, centre, front arms: painter's order.
  const parts: Part[] = [];
  if (has(WALL_W)) parts.push({ a0: -Math.min(reach.w, REACH_PAD) / 32, a1: c0, b0: c0, b1: c1 });
  if (has(WALL_N)) parts.push({ a0: c0, a1: c1, b0: -Math.min(reach.n, REACH_PAD) / 32, b1: c0 });
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
    if (leftExposed) onLeftWall(ctx, box, (w, h) => alignedFace(ctx, style, w, h, LIGHT.left, phase(p.a0 * 32)));
    if (rightExposed) onRightWall(ctx, box, (w, h) => alignedFace(ctx, style, w, h, LIGHT.right, (1 - p.b1) * 32));
    onRoof(ctx, box, (w, d) => {
      ctx.fillStyle = css(shade(style.top, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
    });
    capFaces(ctx, style, box, p, leftExposed, rightExposed);
    outlineEdges(ctx, box, p, covered, e);
  }
}

/** A run position as a phase within the 32 px period (arms reaching into the next cell start before 0). */
function phase(x: number): number {
  return ((x % 32) + 32) % 32;
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
        for (let k = -1; k < 6; k++) {
          const u = k * 8 + 2 - (offset % 8);
          if (u + 4 <= 0 || u >= w) continue;
          ctx.fillStyle = css(base);
          ctx.fillRect(Math.max(0, u), -5, Math.min(4, w - u, u + 4), 5);
        }
        break;
      case 'snowMerlons':
        rampartMerlons(ctx, w, base, offset);
        break;
      case 'stakes':
        palisadeCap(ctx, w, box.h, light, offset);
        break;
      case 'coping':
        ctx.fillStyle = css(shade(style.top, light * 1.05));
        ctx.fillRect(0, -1, w, 3);
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, 2, w, 1);
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
  if (left) onLeftWall(ctx, box, w => paint(w, LIGHT.left, phase(p.a0 * 32)));
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
