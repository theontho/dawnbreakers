import {
  ARCSEC_TO_RAD,
  DEG_TO_RAD,
  J2000_JULIAN_DAY,
  J2000_YEAR,
  clamp,
  decimalYear,
  julianDay,
  wrapRadians,
} from './math';
import type { GeographicLocation, Vec3 } from './types';

/**
 * Everything needed to carry a catalogue star to the local sky at one moment
 * and place: the IAU 1976 precession angles from J2000, local sidereal time
 * and the observer's latitude.
 */
export interface ProjectionState {
  zeta: number;
  z: number;
  cosTheta: number;
  sinTheta: number;
  localSiderealTime: number;
  sinLat: number;
  cosLat: number;
}

export interface Equatorial {
  ra: number;
  dec: number;
}

export function computeProjectionState(date: Date, location: GeographicLocation): ProjectionState {
  const year = decimalYear(date);
  const centuriesSinceJ2000 = (year - J2000_YEAR) / 100;
  const c = centuriesSinceJ2000;
  const zeta = (2306.2181 * c + 0.30188 * c * c + 0.017998 * c * c * c) * ARCSEC_TO_RAD;
  const z = (2306.2181 * c + 1.09468 * c * c + 0.018203 * c * c * c) * ARCSEC_TO_RAD;
  const theta = (2004.3109 * c - 0.42665 * c * c - 0.041833 * c * c * c) * ARCSEC_TO_RAD;

  return {
    zeta,
    z,
    cosTheta: Math.cos(theta),
    sinTheta: Math.sin(theta),
    localSiderealTime: localSiderealTime(date, location),
    sinLat: Math.sin(location.latitude),
    cosLat: Math.cos(location.latitude),
  };
}

export function locationFromDegrees(name: string, latitude: number, longitude: number): GeographicLocation {
  return { name, latitude: latitude * DEG_TO_RAD, longitude: longitude * DEG_TO_RAD };
}

export function localSiderealTime(date: Date, location: GeographicLocation): number {
  return wrapRadians(greenwichMeanSiderealTime(date) + location.longitude);
}

/** Precesses a J2000 position to the equinox of the projection's date. */
export function precess(ra: number, dec: number, projection: ProjectionState): Equatorial {
  const cosDec = Math.cos(dec);
  const sinDec = Math.sin(dec);
  const raZeta = wrapRadians(ra + projection.zeta);
  const a = cosDec * Math.sin(raZeta);
  const b = projection.cosTheta * cosDec * Math.cos(raZeta) - projection.sinTheta * sinDec;
  const c = clamp(projection.sinTheta * cosDec * Math.cos(raZeta) + projection.cosTheta * sinDec, -1, 1);
  return { ra: wrapRadians(Math.atan2(a, b) + projection.z), dec: Math.asin(c) };
}

/**
 * Unit direction of an equatorial position in the local sky, in the sky
 * renderers' frame: x east, y up, z south (so a camera looking down -z faces
 * north).
 */
export function localDirection(
  ra: number,
  dec: number,
  siderealTime: number,
  sinLat: number,
  cosLat: number,
): Vec3 {
  const cosDec = Math.cos(dec);
  const sinDec = Math.sin(dec);
  const hourAngle = siderealTime - ra;
  const cosHour = Math.cos(hourAngle);
  const north = sinDec * cosLat - cosDec * sinLat * cosHour;
  return {
    x: -cosDec * Math.sin(hourAngle),
    y: sinDec * sinLat + cosDec * cosLat * cosHour,
    z: -north,
  };
}

export function greenwichMeanSiderealTime(date: Date): number {
  const jd = julianDay(date);
  const t = (jd - J2000_JULIAN_DAY) / 36525;
  const degrees = 280.46061837 +
    360.98564736629 * (jd - J2000_JULIAN_DAY) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return wrapRadians(degrees * DEG_TO_RAD);
}
