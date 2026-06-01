import {
  ARCSEC_TO_RAD,
  DEG_TO_RAD,
  J2000_JULIAN_DAY,
  J2000_YEAR,
  clamp,
  decimalYear,
  julianDay,
  normalizeVec3,
  scaleVec3,
  wrapRadians,
} from './math';
import type { GeographicLocation, RenderStar, Star, Vec3 } from './types';

const HIPPARCOS_CATALOG_EPOCH_YEAR = 1991.25;
const DARK_SKY_LIMIT_MAGNITUDE = 12.5;

export function convertRaDecToVec3(ra: number, dec: number): Vec3 {
  const cosDec = Math.cos(dec);
  return {
    x: cosDec * Math.cos(ra),
    y: cosDec * Math.sin(ra),
    z: Math.sin(dec),
  };
}

export function applyProperMotion(star: Star, yearsSinceJ2000: number): { ra: number; dec: number } {
  return {
    ra: wrapRadians(star.ra + star.pmRa * yearsSinceJ2000),
    dec: clamp(star.dec + star.pmDec * yearsSinceJ2000, -Math.PI / 2, Math.PI / 2),
  };
}

export function applyPrecession(ra: number, dec: number, yearsSinceJ2000: number): { ra: number; dec: number } {
  const centuries = yearsSinceJ2000 / 100;
  const zeta = (
    2306.2181 * centuries +
    0.30188 * centuries * centuries +
    0.017998 * centuries * centuries * centuries
  ) * ARCSEC_TO_RAD;
  const z = (
    2306.2181 * centuries +
    1.09468 * centuries * centuries +
    0.018203 * centuries * centuries * centuries
  ) * ARCSEC_TO_RAD;
  const theta = (
    2004.3109 * centuries -
    0.42665 * centuries * centuries -
    0.041833 * centuries * centuries * centuries
  ) * ARCSEC_TO_RAD;

  const cosDec = Math.cos(dec);
  const raZeta = ra + zeta;
  const a = cosDec * Math.sin(raZeta);
  const b = Math.cos(theta) * cosDec * Math.cos(raZeta) - Math.sin(theta) * Math.sin(dec);
  const c = Math.sin(theta) * cosDec * Math.cos(raZeta) + Math.cos(theta) * Math.sin(dec);

  return {
    ra: wrapRadians(Math.atan2(a, b) + z),
    dec: Math.asin(clamp(c, -1, 1)),
  };
}

export function starToEquatorial(star: Star, date: Date): { ra: number; dec: number } {
  const moved = applyProperMotion(star, decimalYear(date) - HIPPARCOS_CATALOG_EPOCH_YEAR);
  return applyPrecession(moved.ra, moved.dec, decimalYear(date) - J2000_YEAR);
}

export function equatorialToLocalVector(
  ra: number,
  dec: number,
  date: Date,
  location: GeographicLocation,
): Vec3 {
  const localSiderealTime = greenwichMeanSiderealTime(date) + location.longitude;
  const hourAngle = wrapRadians(localSiderealTime - ra);
  const sinLat = Math.sin(location.latitude);
  const cosLat = Math.cos(location.latitude);
  const sinDec = Math.sin(dec);
  const cosDec = Math.cos(dec);
  const sinAlt = sinDec * sinLat + cosDec * cosLat * Math.cos(hourAngle);
  const altitude = Math.asin(clamp(sinAlt, -1, 1));
  const azimuth = Math.atan2(
    -Math.sin(hourAngle),
    Math.tan(dec) * cosLat - sinLat * Math.cos(hourAngle),
  );

  return normalizeVec3({
    x: Math.cos(altitude) * Math.sin(azimuth),
    y: Math.sin(altitude),
    z: -Math.cos(altitude) * Math.cos(azimuth),
  });
}

export function computeRenderStars(
  catalog: readonly Star[],
  date: Date,
  location: GeographicLocation,
  radius: number,
): RenderStar[] {
  const out: RenderStar[] = [];
  for (const star of catalog) {
    if (star.magnitude > DARK_SKY_LIMIT_MAGNITUDE) continue;

    const equatorial = starToEquatorial(star, date);
    const local = equatorialToLocalVector(equatorial.ra, equatorial.dec, date, location);

    out.push({
      id: star.id,
      position: scaleVec3(local, radius),
      magnitude: star.magnitude,
      ...(star.colorIndex === undefined ? {} : { colorIndex: star.colorIndex }),
    });
  }
  return out;
}

export function locationFromDegrees(name: string, latitude: number, longitude: number): GeographicLocation {
  return {
    name,
    latitude: latitude * DEG_TO_RAD,
    longitude: longitude * DEG_TO_RAD,
  };
}

function greenwichMeanSiderealTime(date: Date): number {
  const jd = julianDay(date);
  const t = (jd - J2000_JULIAN_DAY) / 36525;
  const degrees = 280.46061837 +
    360.98564736629 * (jd - J2000_JULIAN_DAY) +
    0.000387933 * t * t -
    (t * t * t) / 38710000;
  return wrapRadians(degrees * DEG_TO_RAD);
}
