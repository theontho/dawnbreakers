import { skyBodies } from '../sky/skyBodies';
import type { GeographicLocation } from '../sky/types';
import { altitudeAzimuth } from './skyCamera';

/** The sun's centre at the horizon, with refraction and its half-width: the moment of rising or setting. */
const HORIZON_ALTITUDE = -0.833;
const SEARCH_HOURS = 36;
const STEP_MS = 10 * 60000;

export interface SunEvent {
  kind: 'sunrise' | 'sunset';
  /** Compass bearing in degrees where the sun crosses the horizon. */
  azimuth: number;
}

/**
 * The first time after `from` that the sun rises or sets, and where on the
 * horizon: the bearing to face so the first day's sun comes up (or goes
 * down) in the middle of the view.
 */
export function firstSunEvent(from: Date, location: GeographicLocation): SunEvent | undefined {
  const altitudeAt = (ms: number) => altitudeAzimuth(skyBodies(new Date(ms), location).sun).altitude - HORIZON_ALTITUDE;
  const start = from.getTime();
  let before = altitudeAt(start);
  for (let ms = start + STEP_MS; ms <= start + SEARCH_HOURS * 3600000; ms += STEP_MS) {
    const after = altitudeAt(ms);
    if (Math.sign(after) !== Math.sign(before)) {
      // Halve the step down to a few seconds.
      let a = ms - STEP_MS;
      let b = ms;
      while (b - a > 5000) {
        const mid = (a + b) / 2;
        if (Math.sign(altitudeAt(mid)) === Math.sign(before)) a = mid;
        else b = mid;
      }
      return {
        kind: before < 0 ? 'sunrise' : 'sunset',
        azimuth: altitudeAzimuth(skyBodies(new Date(b), location).sun).azimuth,
      };
    }
    before = after;
  }
  return undefined;
}
