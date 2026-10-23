import type Phaser from 'phaser';
import { mix } from '../assets/art/canvasKit';
import type { SkyCamera } from './skyCamera';
import type { SkyLight } from './skyLight';
import { lattice } from './landNoise';

const ROWS = 26;

/**
 * Still or open water between `top` (its far edge, at the horizon) and
 * `bottom`: the sky's colours mirrored, wave crests that widen and spread as
 * they come nearer, and a path of glitter under the moon, or under the sun
 * at dawn.
 */
export function paintWater(
  g: Phaser.GameObjects.Graphics,
  camera: SkyCamera,
  light: SkyLight,
  top: number,
  bottom: number,
  shift: number,
  realMs: number,
): void {
  const { width } = camera;
  const far = mix(light.horizon, 0x000000, 0.2);
  const near = mix(light.zenith, 0x000000, 0.45);
  g.fillGradientStyle(far, far, near, near, 1);
  g.fillRect(0, top, width, bottom - top);

  const crest = mix(light.horizon, 0xffffff, 0.08);
  const moonX = light.moonAltitude > -1 ? camera.bearingX(light.moonAzimuth) : undefined;
  const sunX = light.sunAltitude > -6 ? camera.bearingX(light.sunAzimuth) : undefined;
  const moonGlint = Math.min(1, light.moonlight * 3);
  const sunGlint = Math.max(0, Math.min(1, (light.sunAltitude + 6) / 10));

  for (let row = 0; row < ROWS; row += 1) {
    const depth = Math.pow((row + 0.5) / ROWS, 1.7);
    const y = top + (bottom - top) * depth;
    const length = 6 + depth * width * 0.06;
    const thick = Math.max(1, depth * 3);
    // Nearer swells move past faster, like the land's parallax.
    const rowShift = shift * (0.4 + depth * 1.6) + realMs * 0.01 * (row % 2 ? 1 : -0.6);
    const spacing = length * 3.2;
    g.fillStyle(crest, 0.18 + depth * 0.12);
    for (let k = Math.floor(rowShift / spacing) - 1; k <= Math.ceil((rowShift + width) / spacing) + 1; k += 1) {
      const x = k * spacing + lattice(row * 31 + 7, k) * spacing - rowShift;
      g.fillRect(x, y, length * (0.5 + lattice(row * 31 + 9, k)), thick);
    }
    glitter(g, moonX, y, depth, thick, 0xdfe6ff, moonGlint, row, realMs);
    glitter(g, sunX, y, depth, thick, light.glow, sunGlint, row + 50, realMs);
  }
}

function glitter(
  g: Phaser.GameObjects.Graphics,
  x: number | undefined,
  y: number,
  depth: number,
  thick: number,
  color: number,
  strength: number,
  row: number,
  realMs: number,
): void {
  if (x === undefined || strength <= 0.01) return;
  const spread = 8 + depth * 90;
  for (let i = 0; i < 4; i += 1) {
    const flicker = 0.5 + 0.5 * Math.sin(realMs * 0.006 + row * 1.7 + i * 2.3);
    const offset = (lattice(row * 13 + 3, i + Math.floor(realMs / 240)) - 0.5) * spread * 2;
    g.fillStyle(color, strength * flicker * (0.35 + depth * 0.5));
    g.fillRect(x + offset - spread * 0.3, y, spread * (0.3 + flicker * 0.4), thick);
  }
}
