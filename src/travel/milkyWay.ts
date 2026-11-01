import Phaser from 'phaser';
import { clamp } from '../sky/math';
import type { SkyCamera, ScreenPoint } from './skyCamera';
import { GLOW_TEXTURE } from './glowTexture';

/**
 * The Milky Way as a sky with no light but the stars shows it: a soft band
 * along the galactic plane, brightest toward the centre in Sagittarius and
 * again in Cygnus, faint toward the anticentre in Auriga, clumped into star
 * clouds and split by the Great Rift. Drawn as glows laid in three rows along
 * the plane every few degrees, turned with the sky like the stars, and only
 * in the full-dark sky.
 */

const DEG = Math.PI / 180;
/** The north galactic pole (J2000) and the galactic longitude of the celestial pole. */
const POLE_RA = 192.85948 * DEG;
const POLE_DEC = 27.12825 * DEG;
const POLE_L = 122.93192 * DEG;
const STEP_DEGREES = 3;
/** Rows across the band, in degrees of galactic latitude, and how bright each is. */
const ROWS: readonly { b: number; weight: number }[] = [{ b: -4.5, weight: 0.75 }, { b: 0, weight: 1 }, { b: 4.5, weight: 0.75 }];
/** Each glow's width on the sky, in radians: wider at the bulge. */
const GLOW_WIDTH = 9 * DEG;

interface BandPoint {
  ra: number;
  sinDec: number;
  cosDec: number;
  /** How bright this patch of the band is, 0 to 1. */
  weight: number;
  /** Width multiplier, for the bulge. */
  width: number;
  tint: number;
}

/** Angular distance between two galactic longitudes, in degrees. */
function apart(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/** A fixed brightness for each patch, so the band clumps into star clouds instead of lying flat. */
function clump(l: number, b: number): number {
  const h = Math.sin(l * 12.9898 + b * 78.233) * 43758.5453;
  return 0.55 + 0.9 * (h - Math.floor(h));
}

/** Galactic longitude and latitude (degrees) on the celestial sphere. */
function toEquatorial(l: number, b: number): { ra: number; sinDec: number; cosDec: number } {
  const fromPole = POLE_L - l * DEG;
  const sinB = Math.sin(b * DEG);
  const cosB = Math.cos(b * DEG);
  const sinDec = sinB * Math.sin(POLE_DEC) + cosB * Math.cos(POLE_DEC) * Math.cos(fromPole);
  const ra = POLE_RA + Math.atan2(cosB * Math.sin(fromPole), sinB * Math.cos(POLE_DEC) - cosB * Math.sin(POLE_DEC) * Math.cos(fromPole));
  return { ra, sinDec, cosDec: Math.sqrt(1 - sinDec * sinDec) };
}

const BAND: readonly BandPoint[] = ROWS.flatMap(row => Array.from({ length: 360 / STEP_DEGREES }, (_, i) => {
  const l = i * STEP_DEGREES;
  const core = Math.exp(-((apart(l, 0) / 38) ** 2));
  const cygnus = Math.exp(-((apart(l, 75) / 22) ** 2));
  // The Great Rift: dust down the middle of the band from Cygnus to Sagittarius.
  const rift = row.b === 0 && l >= 10 && l <= 75 ? 0.35 : 1;
  return {
    ...toEquatorial(l, row.b),
    weight: (0.3 + 0.7 * core + 0.35 * cygnus) * row.weight * rift * clump(l, row.b),
    width: 1 + 0.5 * core,
    // Warmer toward the centre's old stars, bluer out along the arms.
    tint: core > 0.4 ? 0xfff0dc : 0xdfe6ff,
  };
}));

export class MilkyWay {
  private readonly glows: Phaser.GameObjects.Image[];
  private readonly point: ScreenPoint = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene, private readonly camera: SkyCamera) {
    this.glows = BAND.map(stretch => scene.add.image(0, 0, GLOW_TEXTURE)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setTint(stretch.tint)
      .setVisible(false));
  }

  /**
   * Shows the band at this sidereal time and latitude, as bright as
   * `strength` (0 hides it): the darkness of the night, less the moon.
   */
  draw(siderealTime: number, sinLat: number, cosLat: number, strength: number): void {
    const p = this.point;
    BAND.forEach((stretch, i) => {
      const glow = this.glows[i]!;
      if (strength <= 0.01) {
        glow.setVisible(false);
        return;
      }
      const hourAngle = siderealTime - stretch.ra;
      const cosHour = Math.cos(hourAngle);
      const up = stretch.sinDec * sinLat + stretch.cosDec * cosLat * cosHour;
      const east = -stretch.cosDec * Math.sin(hourAngle);
      const south = -(stretch.sinDec * cosLat - stretch.cosDec * sinLat * cosHour);
      // Low down the band is lost in the haze over the horizon.
      const haze = clamp((up + 0.02) / 0.3, 0, 1);
      if (haze <= 0 || !this.camera.project(east, up, south, p)) {
        glow.setVisible(false);
        return;
      }
      const size = GLOW_WIDTH * stretch.width * this.camera.pixelsPerRadian * 2;
      glow
        .setVisible(true)
        .setPosition(p.x, p.y)
        .setDisplaySize(size, size)
        .setAlpha(0.045 * stretch.weight * strength * haze);
    });
  }
}
