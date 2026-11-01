import { mix } from '../assets/art/canvasKit';
import { clamp } from '../sky/math';
import type { SkyBodies } from '../sky/skyBodies';
import { altitudeAzimuth } from './skyCamera';

/** The colour and brightness of the sky and land at one moment, from the sun and moon. */
export interface SkyLight {
  zenith: number;
  horizon: number;
  /** Warm band low over the sun's bearing in twilight, and its strength. */
  glow: number;
  glowStrength: number;
  sunAltitude: number;
  sunAzimuth: number;
  moonAltitude: number;
  moonAzimuth: number;
  /** 0 by night to 1 in full day. */
  daylight: number;
  /** How much the moon lights the land, 0 to about 0.4 at full moon high up. */
  moonlight: number;
  /** How much of the starlight shows through twilight and moonlight, 0 to 1. */
  starVisibility: number;
  /** Faintest magnitude that can be seen. */
  limitingMagnitude: number;
}

/** Sky colours by the sun's altitude in degrees, from deep night to full day. */
const SKY_STOPS: readonly { altitude: number; zenith: number; horizon: number }[] = [
  { altitude: -90, zenith: 0x02030a, horizon: 0x131b33 },
  { altitude: -18, zenith: 0x02030a, horizon: 0x131b33 },
  { altitude: -12, zenith: 0x040817, horizon: 0x1c2846 },
  { altitude: -6, zenith: 0x0b1634, horizon: 0x3a4766 },
  { altitude: -2, zenith: 0x1d3462, horizon: 0x8a6a68 },
  { altitude: 3, zenith: 0x3a6aaa, horizon: 0xd8b48a },
  { altitude: 12, zenith: 0x4a86cc, horizon: 0xb8d2ea },
  { altitude: 90, zenith: 0x3f7cc6, horizon: 0xb6d0e8 },
];

/** The two sky stops either side of a sun altitude, and how far between them it lies. */
function skyStopsAt(altitude: number): { lo: typeof SKY_STOPS[number]; hi: typeof SKY_STOPS[number]; t: number } {
  const upper = SKY_STOPS.findIndex(stop => stop.altitude >= altitude);
  const hi = SKY_STOPS[Math.max(1, upper < 0 ? SKY_STOPS.length - 1 : upper)]!;
  const lo = SKY_STOPS[SKY_STOPS.indexOf(hi) - 1]!;
  return { lo, hi, t: clamp((altitude - lo.altitude) / Math.max(0.001, hi.altitude - lo.altitude), 0, 1) };
}

/** How bright the sun alone makes the zenith look at this altitude, 0 to 1. */
function zenithBrightness(altitude: number): number {
  const { lo, hi, t } = skyStopsAt(altitude);
  const c = mix(lo.zenith, hi.zenith, t);
  return (0.2126 * ((c >> 16) & 0xff) + 0.7152 * ((c >> 8) & 0xff) + 0.0722 * (c & 0xff)) / 255;
}

/** Sun altitudes from deep night to full day, with the zenith's brightness at each, to find an altitude by its sky. */
const BRIGHTNESS_SCALE: readonly { altitude: number; brightness: number }[] = Array.from({ length: 121 }, (_, i) => {
  const altitude = -18 + i * 0.25;
  return { altitude, brightness: zenithBrightness(altitude) };
});

/** The sun altitude whose sky is this bright: the dusk a blended sky looks like. */
function altitudeForBrightness(brightness: number): number {
  for (const step of BRIGHTNESS_SCALE) if (step.brightness >= brightness) return step.altitude;
  return BRIGHTNESS_SCALE[BRIGHTNESS_SCALE.length - 1]!.altitude;
}

/** Stars lost to the moon's light: a full moon high up costs most of a magnitude. */
function moonCost(moonlight: number): number {
  return (moonlight / 0.4) * 0.7;
}

function starVisibilityAt(sunAltitude: number): number {
  return clamp((-sunAltitude - 2) / 10, 0, 1);
}

export function skyLightFor(bodies: SkyBodies): SkyLight {
  const sun = altitudeAzimuth(bodies.sun);
  const moon = altitudeAzimuth(bodies.moon);
  const { lo, hi, t } = skyStopsAt(sun.altitude);

  const moonUp = clamp((moon.altitude + 1) / 12, 0, 1);
  const moonlight = moonUp * Math.pow(bodies.moonIllumination, 1.5) * 0.4 * clamp(1 - (sun.altitude + 12) / 10, 0, 1);
  const moonSky = 0x16243f;
  const zenith = mix(mix(lo.zenith, hi.zenith, t), moonSky, moonlight * 0.6);
  const horizon = mix(mix(lo.horizon, hi.horizon, t), 0x2a3a58, moonlight * 0.6);

  const twilight = clamp(1 - Math.abs(sun.altitude + 3) / 13, 0, 1);
  const daylight = clamp((sun.altitude + 8) / 16, 0, 1);
  const starVisibility = starVisibilityAt(sun.altitude);

  return {
    zenith,
    horizon,
    glow: mix(0xe0703a, 0xffd59a, clamp((sun.altitude + 4) / 8, 0, 1)),
    glowStrength: twilight * 0.85,
    sunAltitude: sun.altitude,
    sunAzimuth: sun.azimuth,
    moonAltitude: moon.altitude,
    moonAzimuth: moon.azimuth,
    daylight,
    moonlight,
    starVisibility,
    // The eye has the moon to contend with as well as the dusk.
    limitingMagnitude: twilightLimit(sun.altitude) - moonCost(moonlight),
  };
}

/** Faintest magnitude the eye finds against the dusk, by the sun's altitude in degrees. */
const TWILIGHT_LIMITS: readonly { altitude: number; limit: number }[] = [
  { altitude: -16, limit: 6.3 },
  { altitude: -12, limit: 5.7 },
  { altitude: -9, limit: 4.8 },
  { altitude: -6, limit: 3.4 },
  { altitude: -3, limit: 1.8 },
  { altitude: 0, limit: -1.6 },
];

function twilightLimit(sunAltitude: number): number {
  const stops = TWILIGHT_LIMITS;
  if (sunAltitude <= stops[0]!.altitude) return stops[0]!.limit;
  for (let i = 1; i < stops.length; i += 1) {
    const hi = stops[i]!;
    if (sunAltitude <= hi.altitude) {
      const lo = stops[i - 1]!;
      return lo.limit + (hi.limit - lo.limit) * (sunAltitude - lo.altitude) / (hi.altitude - lo.altitude);
    }
  }
  return stops[stops.length - 1]!.limit - (sunAltitude - stops[stops.length - 1]!.altitude) * 0.5;
}

/** The faintest star that shows: the same while time runs as when it stands still, so a fast sky keeps all its stars. */
export function starLimit(light: SkyLight): number {
  return light.limitingMagnitude;
}

/** A star's own brightness from 0 to 1, from sixth magnitude up to Sirius; sets its size. */
export function starBrightness(magnitude: number): number {
  return clamp((6.3 - magnitude) / 7.5, 0, 1);
}

/**
 * How strongly a star shows tonight: its own brightness, faded in over
 * the last half magnitude above the limit, and paler as the dusk grows light.
 */
export function starAlpha(magnitude: number, limit: number, light: SkyLight): number {
  const fade = clamp((limit - magnitude) / 0.6, 0, 1);
  if (fade <= 0) return 0;
  return (0.5 + 0.5 * starBrightness(magnitude)) * fade * (0.25 + 0.75 * light.starVisibility);
}

/**
 * The light of several moments taken together, as a time-lapse camera sees
 * the sky when the days roll by faster than it can follow: day and night
 * blend into one light rather than a flicker. The sun and moon keep their
 * places at the last moment.
 */
export function blendSkyLights(lights: readonly SkyLight[]): SkyLight {
  const last = lights[lights.length - 1]!;
  const mean = (pick: (light: SkyLight) => number) => lights.reduce((sum, light) => sum + pick(light), 0) / lights.length;
  const meanColor = (pick: (light: SkyLight) => number) => {
    let r = 0, g = 0, b = 0;
    for (const light of lights) {
      const c = pick(light);
      r += (c >> 16) & 0xff;
      g += (c >> 8) & 0xff;
      b += c & 0xff;
    }
    const n = lights.length;
    return (Math.round(r / n) << 16) | (Math.round(g / n) << 8) | Math.round(b / n);
  };
  // The dusk the blended sky looks like, from the sun's share of its brightness.
  const seenAltitude = altitudeForBrightness(mean(l => zenithBrightness(l.sunAltitude)));
  const moonlight = mean(l => l.moonlight);
  return {
    ...last,
    zenith: meanColor(l => l.zenith),
    horizon: meanColor(l => l.horizon),
    glow: meanColor(l => l.glow),
    glowStrength: mean(l => l.glowStrength),
    daylight: mean(l => l.daylight),
    moonlight,
    // The stars show as they would against a real sky as bright as the
    // blended one looks: they go as the sky you see grows light, however the
    // hours in the frame were mixed.
    starVisibility: starVisibilityAt(seenAltitude),
    limitingMagnitude: twilightLimit(seenAltitude) - moonCost(moonlight),
  };
}
