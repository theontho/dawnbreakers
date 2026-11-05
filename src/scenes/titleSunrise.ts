import Phaser from 'phaser';
import { logGameEvent } from '../logging/gameLogger';
import { addTitleCity, addTitleCloud, type TitleCity } from './titleCity';
import { calculateTitleDaylight } from './titleDaylight';
import { TitleNightSky, timeForAltitude, titleSkyClock } from './titleNightSky';
import type { SunriseClock } from './titleSunriseClock';
import { glowTitleSun } from './titleSunGlow';
import { drawTitleSunRays } from './titleSunRays';

/**
 * The title's dawn over Shíráz: night sky, stars, the city, the sun and its
 * light. Every part is a function of one playhead, so the sunrise can be
 * shown at any moment in any order (see `titleSunriseClock.ts`).
 */

export type SunriseBackground = {
  width: number;
  height: number;
  sun: Phaser.GameObjects.Container;
  sunDisk: Phaser.GameObjects.Arc;
  sunEffects: Phaser.GameObjects.Container[];
  sunRays: Phaser.GameObjects.Graphics;
  sunCenterX: number;
  sunCenterY: number;
  sunRadius: number;
  horizonY: number;
  nightSky: TitleNightSky;
  /** The real time that morning for each moment of the dawn, once it plays. */
  skyTime?: (ms: number) => Date;
  daySky: Phaser.GameObjects.Image;
  dawnGlow: Phaser.GameObjects.Image;
  /** Screen y of the top of the dusky haze band in `dawnGlow` at column x, which reads as a far ridge. */
  hazeTop: (x: number) => number;
  dayClouds: Phaser.GameObjects.Container;
  city: TitleCity;
  nightWash: Phaser.GameObjects.Rectangle;
  cloudDrift: { fromX: number; toX: number };
};

export const SUNRISE_DURATION_MS = 210000;
const cloudDriftMs = 160000;
const fixedSunPeakingElapsedMs = 23675;
const sunTargetYMultiplier = -1.45;

export function addSunriseBackground(scene: Phaser.Scene, width: number, height: number): SunriseBackground {
  const horizonY = height * 0.62;
  const cityBaseY = horizonY + height * 0.1;

  addSkyGradient(scene, 'night', width, height, [
    { at: 0, color: 0x030716 },
    { at: 0.36, color: 0x071329 },
    { at: 0.68, color: 0x1a1831 },
    { at: 1, color: 0x0a090c },
  ]);
  const daySky = addSkyGradient(scene, 'day', width, height, [
    { at: 0, color: 0x61aeea },
    { at: 0.34, color: 0x96cdf2 },
    { at: 0.64, color: 0xd2ebfb },
    { at: 1, color: 0xf5d19a },
  ]).setAlpha(0);
  const sunRays = scene.add.graphics();
  const sunrise = addSunrise(scene, width, height, cityBaseY);
  const haze = horizonHaze(width, height, horizonY);
  const dawnGlow = addHorizonGlow(scene, width, height, horizonY, haze).setAlpha(0);
  const nightSky = new TitleNightSky(scene, width, height, cityBaseY);
  const cloudDrift = { fromX: -width * 0.28, toX: width * 0.28 };
  const dayClouds = scene.add.container(cloudDrift.fromX, 0)
    .add(addTitleCloud(scene, -width * 0.18, height * 0.24, 0.9, 0.14))
    .add(addTitleCloud(scene, width * 0.18, height * 0.2, 1.1, 0.2))
    .add(addTitleCloud(scene, width * 0.78, height * 0.27, 0.85, 0.16))
    .add(addTitleCloud(scene, width * 1.22, height * 0.18, 0.95, 0.14))
    .setAlpha(0);

  const city = addTitleCity(scene, width, height, cityBaseY);
  const nightWash = scene.add.rectangle(0, 0, width, height, 0x030611, 0.12).setOrigin(0);

  const background = {
    width,
    height,
    sun: sunrise.layer,
    sunDisk: sunrise.disk,
    sunEffects: sunrise.effects,
    sunRays,
    sunCenterX: sunrise.centerX,
    sunCenterY: sunrise.centerY,
    sunRadius: sunrise.radius,
    horizonY: cityBaseY,
    nightSky,
    daySky,
    dawnGlow,
    hazeTop: (x: number) => ellipseTop(haze, x),
    dayClouds,
    city,
    nightWash,
    cloudDrift,
  };
  applySunriseLighting(background);

  return background;
}

function addSkyGradient(
  scene: Phaser.Scene,
  name: string,
  width: number,
  height: number,
  stops: Array<{ at: number; color: number }>,
): Phaser.GameObjects.Image {
  const textureWidth = Math.ceil(width);
  const textureHeight = Math.ceil(height);
  const key = `title-${name}-sky-${textureWidth}x${textureHeight}`;

  const texture = createSizedCanvas(scene, key, textureWidth, textureHeight);
  if (!texture) {
    throw new Error(`Unable to create sky gradient texture: ${key}`);
  }

  const gradient = texture.context.createLinearGradient(0, 0, 0, textureHeight);
  stops.forEach((stop) => gradient.addColorStop(stop.at, colorToCss(stop.color)));
  texture.context.fillStyle = gradient;
  texture.context.fillRect(0, 0, textureWidth, textureHeight);
  texture.refresh();

  return scene.add.image(0, 0, key).setOrigin(0).setDisplaySize(width, height);
}

function addSunrise(
  scene: Phaser.Scene,
  width: number,
  height: number,
  visibleHorizonY: number,
): {
  layer: Phaser.GameObjects.Container;
  disk: Phaser.GameObjects.Arc;
  effects: Phaser.GameObjects.Container[];
  centerX: number;
  centerY: number;
  radius: number;
} {
  const sunrise = scene.add.container(0, 0);
  const backEffects = scene.add.container(0, 0).setAlpha(0);
  const sunX = width / 2;
  const sunRadius = Phaser.Math.Clamp(Math.min(width, height) * 0.15, 52, 132);
  const sunY = calculateInitialSunY(
    visibleHorizonY,
    sunRadius,
    height * sunTargetYMultiplier,
    fixedSunPeakingElapsedMs,
    SUNRISE_DURATION_MS,
  );

  for (let i = 5; i >= 1; i -= 1) {
    backEffects.add(scene.add.circle(sunX, sunY, sunRadius * (1 + i * 0.38), 0xffb55a, 0.026 + i * 0.006));
  }

  const disk = scene.add.circle(sunX, sunY, sunRadius, 0xffc66d, 1);

  sunrise.add(backEffects);
  sunrise.add(disk);

  return { layer: sunrise, disk, effects: [backEffects], centerX: sunX, centerY: sunY, radius: sunRadius };
}

/**
 * Runs the sunrise from `clock`: ticks it each frame and draws whatever
 * moment it points at, so the transport can play, pause, scrub and change
 * speed without the scene keeping any other timeline of its own.
 */
export function playSunrise(
  scene: Phaser.Scene,
  sunrise: SunriseBackground,
  clock: SunriseClock,
  titleStartedAtMs: number,
): void {
  const sunTargetY = sunrise.height * sunTargetYMultiplier;
  const sunStartedAtMs = performance.now();
  const normalSunPeakingMs = calculateSunPeakingElapsedMs(sunrise, sunTargetY, clock.durationMs);
  let loggedSunPeaking = false;
  const logSunPeaking = () => {
    if (loggedSunPeaking) return;

    loggedSunPeaking = true;
    const now = performance.now();
    logGameEvent('sun peaking', {
      sunriseElapsedMs: Math.round(clock.position),
      realSunriseElapsedMs: Math.round(now - sunStartedAtMs),
      titleElapsedMs: Math.round(now - titleStartedAtMs),
      normalSunriseElapsedMs: Math.round(normalSunPeakingMs),
      fixedSunriseElapsedMs: fixedSunPeakingElapsedMs,
    });
  };
  sunrise.skyTime = titleSkyClock(
    ms => calculateTitleDaylight(sunrise.sunCenterY + sunTargetY * sineInOut(ms / clock.durationMs), sunrise.horizonY).solarElevationDeg,
    clock.durationMs,
  );
  const render = () => {
    sunrise.sun.y = sunTargetY * sineInOut(clock.progress);
    sunrise.dayClouds.x = cloudDriftX(sunrise.cloudDrift, clock.position);
    applySunriseLighting(sunrise, clock.position);

    if (isSunPeakingOverHorizon(sunrise)) {
      logSunPeaking();
    }
  };
  const tick = (_time: number, deltaMs: number) => clock.tick(deltaMs);

  clock.onChange(render);
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
  glowTitleSun(scene, sunrise);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, tick));
  render();
}

function applySunriseLighting(sunrise: SunriseBackground, positionMs = 0): void {
  const sunCenterX = sunrise.sunCenterX + sunrise.sun.x;
  const sunCenterY = sunrise.sunCenterY + sunrise.sun.y;
  const daylight = calculateTitleDaylight(sunCenterY, sunrise.horizonY);

  drawTitleSunRays(
    sunrise.sunRays,
    sunrise.width,
    sunrise.height,
    sunCenterX,
    sunCenterY,
    daylight.sunTint,
    daylight.sunEffectsAlpha,
  );
  sunrise.daySky.setAlpha(daylight.daySkyAlpha);
  sunrise.daySky.setTint(daylight.skyTint);
  sunrise.dawnGlow.setAlpha(daylight.dawnGlowAlpha);
  sunrise.sunEffects.forEach((effect) => effect.setAlpha(daylight.sunEffectsAlpha));
  sunrise.sunDisk.setFillStyle(daylight.sunTint, 1);
  sunrise.nightSky.draw(sunrise.skyTime?.(positionMs) ?? timeForAltitude(daylight.solarElevationDeg), daylight.starAlpha);
  sunrise.city.setLight(daylight.cityLightAmount);
  sunrise.dayClouds.setAlpha(daylight.cloudAlpha);
  sunrise.nightWash.setAlpha(daylight.nightWashAlpha);
}

type Ellipse = { x: number; y: number; rx: number; ry: number };

/** The dusky band low over the hills, in front of the sun while it is low. */
function horizonHaze(width: number, height: number, horizonY: number): Ellipse {
  return { x: width / 2, y: horizonY + height * 0.12, rx: width * 0.56, ry: height * 0.06 };
}

function ellipseTop(e: Ellipse, x: number): number {
  const u = (x - e.x) / e.rx;
  return Math.abs(u) >= 1 ? Infinity : e.y - e.ry * Math.sqrt(1 - u * u);
}

function addHorizonGlow(scene: Phaser.Scene, width: number, height: number, horizonY: number, haze: Ellipse): Phaser.GameObjects.Image {
  const textureWidth = Math.ceil(width);
  const textureHeight = Math.ceil(height);
  const key = `title-horizon-light-${textureWidth}x${textureHeight}`;

  const texture = createSizedCanvas(scene, key, textureWidth, textureHeight);
  if (!texture) {
    throw new Error(`Unable to create horizon light texture: ${key}`);
  }

  const verticalGlow = texture.context.createLinearGradient(
    0,
    horizonY - height * 0.34,
    0,
    horizonY + height * 0.26,
  );
  verticalGlow.addColorStop(0, 'rgba(255, 174, 97, 0)');
  verticalGlow.addColorStop(0.42, 'rgba(255, 189, 113, 0.16)');
  verticalGlow.addColorStop(0.68, 'rgba(255, 145, 105, 0.12)');
  verticalGlow.addColorStop(1, 'rgba(255, 174, 97, 0)');
  texture.context.fillStyle = verticalGlow;
  texture.context.fillRect(0, 0, textureWidth, textureHeight);

  const radialGlow = texture.context.createRadialGradient(
    width / 2,
    horizonY + height * 0.03,
    0,
    width / 2,
    horizonY + height * 0.03,
    width * 0.62,
  );
  radialGlow.addColorStop(0, 'rgba(255, 207, 139, 0.18)');
  radialGlow.addColorStop(0.46, 'rgba(255, 167, 104, 0.11)');
  radialGlow.addColorStop(1, 'rgba(255, 167, 104, 0)');
  texture.context.fillStyle = radialGlow;
  texture.context.fillRect(0, 0, textureWidth, textureHeight);
  const ctx = texture.context;
  ctx.fillStyle = 'rgba(255, 188, 109, 0.16)';
  ctx.beginPath();
  ctx.ellipse(width / 2, horizonY + height * 0.04, width * 0.46, height * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(94, 49, 64, 0.24)';
  ctx.beginPath();
  ctx.ellipse(haze.x, haze.y, haze.rx, haze.ry, 0, 0, Math.PI * 2);
  ctx.fill();
  texture.refresh();

  return scene.add.image(0, 0, key).setOrigin(0).setDisplaySize(width, height);
}

/**
 * Canvas textures here are sized to the screen, so each resize would leave
 * the previous size behind. Replace any stale copy and free it on shutdown.
 */
function createSizedCanvas(scene: Phaser.Scene, key: string, width: number, height: number): Phaser.Textures.CanvasTexture | null {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    if (scene.textures.exists(key)) scene.textures.remove(key);
  });
  return scene.textures.createCanvas(key, width, height);
}

function colorToCss(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

/** Phaser's `Sine.easeInOut`, which the sun's climb has always followed. */
function sineInOut(progress: number): number {
  return (1 - Math.cos(Phaser.Math.Clamp(progress, 0, 1) * Math.PI)) / 2;
}

/** The clouds drift across and back, easing at each turn. */
function cloudDriftX(drift: { fromX: number; toX: number }, positionMs: number): number {
  const phase = (positionMs / cloudDriftMs) % 2;
  const leg = phase <= 1 ? phase : 2 - phase;
  return drift.fromX + (drift.toX - drift.fromX) * sineInOut(leg);
}

function calculateInitialSunY(
  horizonY: number,
  sunRadius: number,
  sunTargetY: number,
  fixedPeakingElapsedMs: number,
  durationMs: number,
): number {
  const peakingTweenY = sunTargetY * sineInOut(fixedPeakingElapsedMs / durationMs);

  return horizonY + sunRadius - peakingTweenY;
}

function calculateSunPeakingElapsedMs(
  sunrise: SunriseBackground,
  sunTargetY: number,
  durationMs: number,
): number {
  const peakingY = sunrise.horizonY + sunrise.sunRadius - sunrise.sunCenterY;
  const easedProgress = Phaser.Math.Clamp(peakingY / sunTargetY, 0, 1);
  const linearProgress = Math.acos(1 - 2 * easedProgress) / Math.PI;

  return linearProgress * durationMs;
}

function isSunPeakingOverHorizon(sunrise: SunriseBackground): boolean {
  const sunTopY = sunrise.sunCenterY + sunrise.sun.y - sunrise.sunRadius;

  return sunTopY <= sunrise.horizonY;
}
