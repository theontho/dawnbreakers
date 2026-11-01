import Phaser from 'phaser';
import { clamp } from '../sky/math';
import { localSiderealTime, locationFromDegrees } from '../sky/projection';
import { skyBodies } from '../sky/skyBodies';
import { ensureGlowTexture, GLOW_TEXTURE } from '../travel/glowTexture';
import { firstSunEvent } from '../travel/firstSunEvent';
import { MilkyWay } from '../travel/milkyWay';
import { paintMoon } from '../travel/moonPainter';
import { altitudeAzimuth, SkyCamera } from '../travel/skyCamera';
import { skyLightFor, starLimit } from '../travel/skyLight';
import { drawPlanets, drawStars } from '../travel/starDrawing';
import { starFieldFor, type StarField } from '../travel/travelStars';

/**
 * The title's night sky as it truly stood over Shíráz on the morning of
 * 23 May 1844, with no light but the stars': every star the eye could find
 * down to seventh magnitude, the planets, the Milky Way, and the moon in its place and
 * phase, its light paling the faint stars when it is up. The title's dawn is
 * drawn by its own art; each moment of it is matched to the real time that
 * morning when the sun stood as high, so the stars wheel and go out with it.
 */

const SHIRAZ = locationFromDegrees('Shíráz', 29.61, 52.54);
/** The evening the night began, before the dawn of the Báb's declaration. */
const EVENING = new Date(Date.UTC(1844, 4, 22, 15, 0));
/** How much fainter than usual the 1840s dark reaches, and how much brighter each star shows. */
const FULL_DARK_REACH = 0.8;
const FULL_DARK_GAIN = 1.4;
/** A star moves less than this many pixels before the sky is drawn again. */
const REDRAW_PIXELS = 0.35;

interface Dawn {
  /** The sun's altitude in degrees each minute from three hours before sunrise to six after. */
  altitudes: Float64Array;
  startMs: number;
  azimuth: number;
}

let dawn: Dawn | undefined;

/** The morning's sun, minute by minute, and where it rose. */
function dawnOverShiraz(): Dawn {
  if (dawn) return dawn;
  const startMs = findRise() - 3 * 3600000;
  const altitudes = new Float64Array(9 * 60 + 1);
  for (let i = 0; i < altitudes.length; i += 1) {
    altitudes[i] = altitudeAzimuth(skyBodies(new Date(startMs + i * 60000), SHIRAZ).sun).altitude;
  }
  dawn = { altitudes, startMs, azimuth: firstSunEvent(EVENING, SHIRAZ)?.azimuth ?? 64 };
  return dawn;
}

/** When the sun's centre crossed the horizon that morning. */
function findRise(): number {
  let a = EVENING.getTime() + 6 * 3600000;
  let b = EVENING.getTime() + 18 * 3600000;
  const altitude = (ms: number) => altitudeAzimuth(skyBodies(new Date(ms), SHIRAZ).sun).altitude;
  for (let i = 0; i < 40; i += 1) {
    const mid = (a + b) / 2;
    if (altitude(mid) < 0) a = mid;
    else b = mid;
  }
  return b;
}

/** The time that morning when the sun stood at `altitude` degrees. */
function timeForAltitude(altitude: number): Date {
  const { altitudes, startMs } = dawnOverShiraz();
  if (altitude <= altitudes[0]!) return new Date(startMs);
  for (let i = 1; i < altitudes.length; i += 1) {
    if (altitudes[i]! >= altitude) {
      const t = (altitude - altitudes[i - 1]!) / (altitudes[i]! - altitudes[i - 1]!);
      return new Date(startMs + (i - 1 + t) * 60000);
    }
  }
  return new Date(startMs + (altitudes.length - 1) * 60000);
}

export class TitleNightSky {
  private readonly camera: SkyCamera;
  private readonly field: StarField;
  private readonly milkyWay: MilkyWay;
  private readonly stars: Phaser.GameObjects.Graphics;
  private readonly moonHalo: Phaser.GameObjects.Image;
  private readonly moon: Phaser.GameObjects.Graphics;
  private readonly sizeScale: number;
  private drawnSidereal = NaN;
  private drawnVeil = NaN;

  constructor(scene: Phaser.Scene, width: number, height: number, horizonY: number) {
    const { azimuth, startMs } = dawnOverShiraz();
    this.camera = new SkyCamera(width, height, horizonY);
    this.camera.face(azimuth);
    this.field = starFieldFor(new Date(startMs), SHIRAZ);
    this.sizeScale = clamp(height / 760, 0.75, 1.7);
    ensureGlowTexture(scene);
    this.milkyWay = new MilkyWay(scene, this.camera);
    this.stars = scene.add.graphics();
    this.moonHalo = scene.add.image(0, 0, GLOW_TEXTURE).setBlendMode(Phaser.BlendModes.ADD);
    this.moon = scene.add.graphics();
  }

  /**
   * Shows the sky as it was when the sun stood at `sunAltitude` degrees,
   * under the title's own dawn, which veils it by `veil` (1 clear, 0 gone).
   */
  draw(sunAltitude: number, veil: number): void {
    const date = timeForAltitude(sunAltitude);
    const siderealTime = localSiderealTime(date, SHIRAZ);
    const moved = Math.abs(siderealTime - this.drawnSidereal) * this.camera.pixelsPerRadian;
    if (moved < REDRAW_PIXELS && Math.abs(veil - this.drawnVeil) < 0.01) return;
    this.drawnSidereal = siderealTime;
    this.drawnVeil = veil;

    const bodies = skyBodies(date, SHIRAZ);
    const light = skyLightFor(bodies);
    const sky = { field: this.field, siderealTime, sinLat: Math.sin(SHIRAZ.latitude), cosLat: Math.cos(SHIRAZ.latitude) };
    this.stars.clear();
    if (veil > 0.01) {
      const style = {
        limit: starLimit(light) + FULL_DARK_REACH * light.starVisibility,
        light,
        gain: FULL_DARK_GAIN * veil,
        twinkle: 0,
        realMs: 0,
        sizeScale: this.sizeScale,
      };
      drawStars(this.stars, this.camera, sky, style);
      drawPlanets(this.stars, this.camera, sky, bodies.planets, style);
    }
    const night = light.starVisibility ** 2 * clamp(1 - light.moonlight * 2, 0, 1);
    this.milkyWay.draw(siderealTime, sky.sinLat, sky.cosLat, night * veil);
    this.moon.clear();
    paintMoon(this.moon, this.moonHalo, this.camera, bodies, light, this.sizeScale);
  }
}
