import type Phaser from 'phaser';
import { mix } from '../assets/art/canvasKit';
import type { SkyBodies } from '../skyrewind/skyBodies';
import type { SkyCamera } from './skyCamera';
import type { SkyLight } from './skyLight';

/** Drawn at about twice its true half-degree, as the eye remembers it. */
const MOON_ANGULAR_RADIUS = 0.0095;
const LIMB_STEPS = 18;

/** Where the moon was drawn, its phase, and how bright its lit part was. */
export interface MoonDisc {
  x: number;
  y: number;
  radius: number;
  lit: number;
  /** Screen bearing of the lit limb, in radians. */
  sunward: number;
  color: number;
  alpha: number;
}

/**
 * The moon in its true phase: a dark disc with earthshine, the lit part
 * bounded by the limb on the sun's side and the terminator's half ellipse,
 * turned so the bright limb faces the sun.
 */
export function paintMoon(
  graphics: Phaser.GameObjects.Graphics,
  halo: Phaser.GameObjects.Image,
  camera: SkyCamera,
  bodies: SkyBodies,
  light: SkyLight,
  sizeScale: number,
): MoonDisc | undefined {
  const centre = { x: 0, y: 0 };
  const toward = { x: 0, y: 0 };
  const { moon, sunFromMoon } = bodies;
  if (light.moonAltitude < -1 || !camera.project(moon.x, moon.y, moon.z, centre) || centre.y > camera.horizonY + 20) {
    halo.setVisible(false);
    return undefined;
  }
  const radius = Math.max(5 * sizeScale, camera.pixelsPerRadian * MOON_ANGULAR_RADIUS);
  const lit = bodies.moonIllumination;
  const nudge = 0.02 / Math.max(1e-6, Math.hypot(sunFromMoon.x, sunFromMoon.y, sunFromMoon.z));
  camera.project(moon.x + sunFromMoon.x * nudge, moon.y + sunFromMoon.y * nudge, moon.z + sunFromMoon.z * nudge, toward);
  const sunward = Math.atan2(toward.y - centre.y, toward.x - centre.x);

  halo
    .setPosition(centre.x, centre.y)
    .setDisplaySize(radius * 16, radius * 16)
    .setTint(0xc8d4f0)
    .setAlpha((0.08 + lit * 0.4) * (1 - light.daylight * 0.8))
    .setVisible(true);

  graphics.fillStyle(mix(light.zenith, 0x3a4256, 0.5), 0.95);
  graphics.fillCircle(centre.x, centre.y, radius);
  if (lit < 0.01) return undefined;

  const cos = Math.cos(sunward);
  const sin = Math.sin(sunward);
  const points: { x: number; y: number }[] = [];
  const place = (u: number, v: number) => points.push({ x: centre.x + u * cos - v * sin, y: centre.y + u * sin + v * cos });
  for (let s = 0; s <= LIMB_STEPS; s += 1) {
    const a = -Math.PI / 2 + (Math.PI * s) / LIMB_STEPS;
    place(radius * Math.cos(a), radius * Math.sin(a));
  }
  for (let s = LIMB_STEPS; s >= 0; s -= 1) {
    const a = -Math.PI / 2 + (Math.PI * s) / LIMB_STEPS;
    place(-(2 * lit - 1) * radius * Math.cos(a), radius * Math.sin(a));
  }
  const color = mix(0xf6efd8, 0xffffff, light.daylight * 0.5);
  const alpha = 1 - light.daylight * 0.45;
  graphics.fillStyle(color, alpha);
  graphics.fillPoints(points, true);
  return { x: centre.x, y: centre.y, radius, lit, sunward, color, alpha };
}
