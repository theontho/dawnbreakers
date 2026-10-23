import type Phaser from 'phaser';
import { mix } from '../assets/art/canvasKit';
import type { PropKind } from './landscapeStyles';

type G = Phaser.GameObjects.Graphics;

/** Lamplight in a far window or a serai gate, warm against the dark. */
const LAMP = 0xffb860;

/**
 * Draws one silhouette standing on `ground` at `x`, about `size` pixels
 * tall. `pick` is a stable random number for the prop, so a tree keeps its
 * shape as it slides past; `lamp` is 0 by day and 1 by night.
 */
export function drawProp(g: G, kind: PropKind, x: number, ground: number, size: number, color: number, pick: number, lamp: number): void {
  switch (kind) {
    case 'cypress': return cypress(g, x, ground, size * (0.8 + pick * 0.4), color);
    case 'poplar': return poplar(g, x, ground, size * (0.85 + pick * 0.35), color);
    case 'roundTree': return roundTree(g, x, ground, size * (0.6 + pick * 0.5), color, pick);
    case 'pine': return pine(g, x, ground, size * (0.7 + pick * 0.5), color, undefined);
    case 'snowPine': return pine(g, x, ground, size * (0.7 + pick * 0.5), color, mix(color, 0xe8f0ff, 0.45));
    case 'shrub': return shrub(g, x, ground, size * (0.16 + pick * 0.14), color, pick);
    case 'rock': return rock(g, x, ground, size * (0.12 + pick * 0.22), color, pick);
    case 'cairn': return cairn(g, x, ground, size * 0.22, color);
    case 'reeds': return reeds(g, x, ground, size * (0.25 + pick * 0.2), color, pick);
    case 'serai': return serai(g, x, ground, size * 0.55, color, lamp);
    case 'village': return village(g, x, ground, size * 0.45, color, pick, lamp);
  }
}

function cypress(g: G, x: number, ground: number, h: number, color: number): void {
  const w = h * 0.16;
  g.fillStyle(color, 1);
  g.fillPoints([
    { x, y: ground - h },
    { x: x + w * 0.55, y: ground - h * 0.62 },
    { x: x + w * 0.5, y: ground - h * 0.2 },
    { x: x + w * 0.15, y: ground },
    { x: x - w * 0.15, y: ground },
    { x: x - w * 0.5, y: ground - h * 0.2 },
    { x: x - w * 0.55, y: ground - h * 0.62 },
  ], true);
}

function poplar(g: G, x: number, ground: number, h: number, color: number): void {
  const w = h * 0.1;
  g.fillStyle(color, 1);
  g.fillEllipse(x, ground - h * 0.55, w * 2, h * 0.9);
  g.fillRect(x - w * 0.15, ground - h * 0.15, w * 0.3, h * 0.15);
}

function roundTree(g: G, x: number, ground: number, h: number, color: number, pick: number): void {
  g.fillStyle(color, 1);
  g.fillRect(x - h * 0.04, ground - h * 0.45, h * 0.08, h * 0.45);
  const r = h * 0.28;
  g.fillCircle(x, ground - h * 0.68, r);
  g.fillCircle(x - r * 0.7, ground - h * 0.55, r * 0.75);
  g.fillCircle(x + r * 0.75, ground - h * (0.56 + pick * 0.06), r * 0.8);
}

function pine(g: G, x: number, ground: number, h: number, color: number, snow: number | undefined): void {
  g.fillStyle(color, 1);
  g.fillRect(x - h * 0.03, ground - h * 0.18, h * 0.06, h * 0.18);
  for (let tier = 0; tier < 3; tier += 1) {
    const top = ground - h * (1 - tier * 0.24);
    const foot = ground - h * (0.42 - tier * 0.12);
    const half = h * (0.16 + tier * 0.07);
    g.fillStyle(color, 1);
    g.fillTriangle(x, top, x - half, foot, x + half, foot);
    if (snow !== undefined) {
      g.fillStyle(snow, 1);
      g.fillTriangle(x, top, x - half * 0.4, top + (foot - top) * 0.4, x + half * 0.4, top + (foot - top) * 0.4);
    }
  }
}

function shrub(g: G, x: number, ground: number, h: number, color: number, pick: number): void {
  g.fillStyle(color, 1);
  g.fillEllipse(x, ground - h * 0.4, h * 2.2, h * 0.9);
  g.fillEllipse(x + h * (0.5 + pick * 0.4), ground - h * 0.6, h * 1.3, h * 0.9);
}

function rock(g: G, x: number, ground: number, h: number, color: number, pick: number): void {
  const w = h * (1.4 + pick);
  g.fillStyle(color, 1);
  g.fillPoints([
    { x: x - w * 0.6, y: ground + 1 },
    { x: x - w * 0.45, y: ground - h * 0.6 },
    { x: x - w * 0.1, y: ground - h },
    { x: x + w * 0.3, y: ground - h * (0.75 + pick * 0.2) },
    { x: x + w * 0.6, y: ground + 1 },
  ], true);
}

function cairn(g: G, x: number, ground: number, h: number, color: number): void {
  g.fillStyle(color, 1);
  g.fillEllipse(x, ground - h * 0.18, h * 1.2, h * 0.4);
  g.fillEllipse(x, ground - h * 0.5, h * 0.85, h * 0.36);
  g.fillEllipse(x, ground - h * 0.8, h * 0.5, h * 0.3);
}

function reeds(g: G, x: number, ground: number, h: number, color: number, pick: number): void {
  g.lineStyle(Math.max(1, h * 0.04), color, 1);
  for (let i = 0; i < 7; i += 1) {
    const lean = (i - 3) * h * 0.06 + (pick - 0.5) * h * 0.1;
    const top = ground - h * (0.6 + ((i * 37 + pick * 100) % 40) / 100);
    g.lineBetween(x + i * h * 0.05, ground, x + i * h * 0.05 + lean, top);
  }
}

function serai(g: G, x: number, ground: number, h: number, color: number, lamp: number): void {
  const w = h * 3.2;
  g.fillStyle(color, 1);
  g.fillRect(x - w / 2, ground - h * 0.55, w, h * 0.55);
  // Corner towers, and the tall gate block in the middle.
  g.fillRect(x - w / 2 - h * 0.08, ground - h * 0.68, h * 0.24, h * 0.68);
  g.fillRect(x + w / 2 - h * 0.16, ground - h * 0.68, h * 0.24, h * 0.68);
  g.fillRect(x - h * 0.4, ground - h * 0.85, h * 0.8, h * 0.85);
  if (lamp > 0.05) {
    g.fillStyle(LAMP, 0.75 * lamp);
    g.fillRect(x - h * 0.13, ground - h * 0.42, h * 0.26, h * 0.42);
  }
}

function village(g: G, x: number, ground: number, h: number, color: number, pick: number, lamp: number): void {
  g.fillStyle(color, 1);
  const houses = 3 + Math.floor(pick * 3);
  for (let i = 0; i < houses; i += 1) {
    const hx = x + (i - houses / 2) * h * 0.7;
    const hh = h * (0.45 + ((i * 53 + pick * 97) % 30) / 100);
    g.fillRect(hx, ground - hh, h * 0.66, hh);
    if (i === 1) {
      g.fillCircle(hx + h * 0.33, ground - hh, h * 0.3);
      g.fillRect(hx + h * 0.31, ground - hh - h * 0.42, h * 0.04, h * 0.14);
    }
  }
  if (lamp > 0.05 && pick > 0.3) {
    g.fillStyle(LAMP, 0.8 * lamp);
    g.fillRect(x + h * 0.2, ground - h * 0.3, h * 0.08, h * 0.08);
  }
}
