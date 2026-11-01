import type Phaser from 'phaser';
import { clamp } from '../sky/math';
import type { SkyCamera, ScreenPoint } from './skyCamera';
import { starAlpha, starBrightness, type SkyLight } from './skyLight';
import type { StarField } from './travelStars';
import type { PlanetPosition } from '../sky/planets';

/** The stars at one sidereal time from one latitude. */
export interface StarSky {
  field: StarField;
  siderealTime: number;
  sinLat: number;
  cosLat: number;
}

/**
 * Projects star `i` at `siderealTime` into `out`. Returns its altitude (as
 * the sine of it) when it lands on or near the sky on screen, else NaN.
 */
export function projectStar(camera: SkyCamera, sky: StarSky, i: number, siderealTime: number, out: ScreenPoint): number {
  const { field } = sky;
  return projectEquatorial(camera, sky, field.ra[i]!, field.sinDec[i]!, field.cosDec[i]!, siderealTime, out);
}

/** As `projectStar`, for any right ascension and declination. */
function projectEquatorial(
  camera: SkyCamera, sky: StarSky, ra: number, sinDec: number, cosDec: number, siderealTime: number, out: ScreenPoint,
): number {
  const { sinLat, cosLat } = sky;
  const hourAngle = siderealTime - ra;
  const cosHour = Math.cos(hourAngle);
  const up = sinDec * sinLat + cosDec * cosLat * cosHour;
  if (up < -0.06) return NaN;
  const east = -cosDec * Math.sin(hourAngle);
  const south = -(sinDec * cosLat - cosDec * sinLat * cosHour);
  if (!camera.project(east, up, south, out)) return NaN;
  const onScreen = out.x > -40 && out.x < camera.width + 40 && out.y > -40 && out.y < camera.horizonY + 40;
  return onScreen ? up : NaN;
}

export interface StarStyle {
  /** The faintest magnitude drawn, and the light it is seen in. */
  limit: number;
  light: SkyLight;
  /** How much brighter than usual each star is drawn (the full-dark sky). */
  gain: number;
  /** 1 for stars twinkling in a still sky, 0 while they wheel. */
  twinkle: number;
  realMs: number;
  /** Star sizes for this screen. */
  sizeScale: number;
}

/** Draws every star down to the limit: dimmed low by the air, twinkling, the brightest with a soft halo. */
export function drawStars(graphics: Phaser.GameObjects.Graphics, camera: SkyCamera, sky: StarSky, style: StarStyle): void {
  const { field } = sky;
  const { limit, light, gain, twinkle, realMs, sizeScale } = style;
  const p: ScreenPoint = { x: 0, y: 0 };
  for (let i = 0; i < field.count; i += 1) {
    const magnitude = field.magnitude[i]!;
    if (magnitude > limit) break;
    const altitude = projectStar(camera, sky, i, sky.siderealTime, p);
    if (Number.isNaN(altitude)) continue;
    const b = starBrightness(magnitude);
    const extinction = clamp(altitude / 0.2, 0.1, 1);
    const flicker = 1 - twinkle * (0.12 + (1 - extinction) * 0.3) * (0.5 + 0.5 * Math.sin(realMs * 0.004 * (1 + (i % 7) * 0.37) + i));
    const alpha = clamp(starAlpha(magnitude, limit, light) * extinction * flicker * gain, 0, 1);
    const radius = (0.85 + 2 * Math.pow(b, 1.4)) * sizeScale;
    const color = field.color[i]!;
    if (b > 0.62) {
      graphics.fillStyle(color, alpha * 0.12);
      graphics.fillCircle(p.x, p.y, radius * 3);
    }
    graphics.fillStyle(color, alpha);
    if (radius < 1.2) graphics.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
    else graphics.fillCircle(p.x, p.y, radius);
  }
}

/**
 * Draws the planets among the stars: steady points (they do not twinkle),
 * a little larger than a star as bright, each in its own colour, seen or lost
 * in the dusk by their brightness as the stars are.
 */
export function drawPlanets(
  graphics: Phaser.GameObjects.Graphics, camera: SkyCamera, sky: StarSky, planets: readonly PlanetPosition[], style: StarStyle,
): void {
  const p: ScreenPoint = { x: 0, y: 0 };
  for (const planet of planets) {
    if (planet.magnitude > style.limit) continue;
    const altitude = projectEquatorial(camera, sky, planet.ra, Math.sin(planet.dec), Math.cos(planet.dec), sky.siderealTime, p);
    if (Number.isNaN(altitude)) continue;
    const b = starBrightness(planet.magnitude);
    const extinction = clamp(altitude / 0.2, 0.1, 1);
    const alpha = clamp(starAlpha(planet.magnitude, style.limit, style.light) * extinction * style.gain, 0, 1);
    const radius = (1.1 + 2.3 * Math.pow(b, 1.3)) * style.sizeScale;
    graphics.fillStyle(planet.color, alpha * 0.14);
    graphics.fillCircle(p.x, p.y, radius * 3.2);
    graphics.fillStyle(planet.color, alpha);
    graphics.fillCircle(p.x, p.y, radius);
  }
}
