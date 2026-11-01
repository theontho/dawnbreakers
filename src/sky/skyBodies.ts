import { DEG_TO_RAD, clamp, julianDay, wrapRadians } from './math';
import { planetPositions, type PlanetPosition } from './planets';
import { localDirection, localSiderealTime } from './projection';
import type { GeographicLocation, Vec3 } from './types';

/** Day zero of Paul Schlyter's orbital elements (1999 Dec 31, 0h TT). */
const SCHLYTER_EPOCH_JULIAN_DAY = 2451543.5;

export interface SkyBodies {
  /** Local direction of the moon and the sun, in the sky renderers' frame. */
  moon: Vec3;
  sun: Vec3;
  /** Fraction of the moon's disc that is lit, 0 at new moon to 1 at full. */
  moonIllumination: number;
  /**
   * The way the lit limb faces: the sun's direction with its component along
   * the line of sight to the moon removed, so a renderer can project it and
   * turn the crescent toward the sun.
   */
  sunFromMoon: Vec3;
  /** The five naked-eye planets, by right ascension and declination of date. */
  planets: PlanetPosition[];
}

/**
 * The moon, sun and planets for a date and place, from Schlyter's low-precision
 * elements with the main lunar perturbations: good to a fraction of a degree,
 * plenty for a sky seen from a caravan road. Ported from the native Sky
 * Rewind's `moonState`.
 */
export function skyBodies(date: Date, location: GeographicLocation): SkyBodies {
  const d = julianDay(date) - SCHLYTER_EPOCH_JULIAN_DAY;
  const deg = (value: number) => wrapRadians(value * DEG_TO_RAD);

  const node = deg(125.1228 - 0.0529538083 * d);
  const inclination = 5.1454 * DEG_TO_RAD;
  const perigee = deg(318.0634 + 0.1643573223 * d);
  const anomaly = deg(115.3654 + 13.0649929509 * d);
  const e = 0.0549;

  const eccentric = anomaly + e * Math.sin(anomaly) * (1 + e * Math.cos(anomaly));
  const trueAnomaly = Math.atan2(Math.sqrt(1 - e * e) * Math.sin(eccentric), Math.cos(eccentric) - e);
  const latitudeArgument = wrapRadians(trueAnomaly + perigee);
  const baseLongitude = wrapRadians(node + Math.atan2(Math.sin(latitudeArgument) * Math.cos(inclination), Math.cos(latitudeArgument)));

  const meanLongitude = wrapRadians(node + perigee + anomaly);
  const sunAnomaly = deg(356.047 + 0.9856002585 * d);
  const sunPerihelion = deg(282.9404 + 0.0000470935 * d);
  const sunMeanLongitude = wrapRadians(sunAnomaly + sunPerihelion);
  const elongation = wrapRadians(meanLongitude - sunMeanLongitude);
  const meanLatitudeArgument = wrapRadians(meanLongitude - node);

  const longitudeCorrection =
    -1.274 * Math.sin(anomaly - 2 * elongation) +
    0.658 * Math.sin(2 * elongation) -
    0.186 * Math.sin(sunAnomaly) -
    0.059 * Math.sin(2 * anomaly - 2 * elongation) -
    0.057 * Math.sin(anomaly - 2 * elongation + sunAnomaly) +
    0.053 * Math.sin(anomaly + 2 * elongation) +
    0.046 * Math.sin(2 * elongation - sunAnomaly) +
    0.041 * Math.sin(anomaly - sunAnomaly) -
    0.035 * Math.sin(elongation) -
    0.031 * Math.sin(anomaly + sunAnomaly) -
    0.015 * Math.sin(2 * meanLatitudeArgument - 2 * elongation) +
    0.011 * Math.sin(anomaly - 4 * elongation);
  const latitudeCorrection =
    -0.173 * Math.sin(meanLatitudeArgument - 2 * elongation) -
    0.055 * Math.sin(anomaly - meanLatitudeArgument - 2 * elongation) -
    0.046 * Math.sin(anomaly + meanLatitudeArgument - 2 * elongation) +
    0.033 * Math.sin(meanLatitudeArgument + 2 * elongation) +
    0.017 * Math.sin(2 * anomaly + meanLatitudeArgument);

  const moonLongitude = wrapRadians(baseLongitude + longitudeCorrection * DEG_TO_RAD);
  const moonLatitude = Math.asin(Math.sin(latitudeArgument) * Math.sin(inclination)) + latitudeCorrection * DEG_TO_RAD;
  const sunLongitude = wrapRadians(sunMeanLongitude + (1.915 * Math.sin(sunAnomaly) + 0.02 * Math.sin(2 * sunAnomaly)) * DEG_TO_RAD);
  const obliquity = (23.4393 - 0.0000003563 * d) * DEG_TO_RAD;
  const sunDistance = 1.00014 - 0.01671 * Math.cos(sunAnomaly) - 0.00014 * Math.cos(2 * sunAnomaly);

  const moonEquatorial = eclipticToEquatorial(moonLongitude, moonLatitude, obliquity);
  const sunEquatorial = eclipticToEquatorial(sunLongitude, 0, obliquity);
  const lst = localSiderealTime(date, location);
  const sinLat = Math.sin(location.latitude);
  const cosLat = Math.cos(location.latitude);
  const moon = localDirection(moonEquatorial.ra, moonEquatorial.dec, lst, sinLat, cosLat);
  const sun = localDirection(sunEquatorial.ra, sunEquatorial.dec, lst, sinLat, cosLat);

  // Phase angle from the elongation between the two, ignoring the moon's parallax.
  const cosElongation = clamp(moon.x * sun.x + moon.y * sun.y + moon.z * sun.z, -1, 1);
  return {
    moon,
    sun,
    moonIllumination: (1 - cosElongation) / 2,
    sunFromMoon: { x: sun.x - moon.x * cosElongation, y: sun.y - moon.y * cosElongation, z: sun.z - moon.z * cosElongation },
    planets: planetPositions(d, sunLongitude, sunDistance, obliquity),
  };
}

function eclipticToEquatorial(longitude: number, latitude: number, obliquity: number): { ra: number; dec: number } {
  const x = Math.cos(longitude) * Math.cos(latitude);
  const y = Math.sin(longitude) * Math.cos(latitude);
  const z = Math.sin(latitude);
  const eqY = y * Math.cos(obliquity) - z * Math.sin(obliquity);
  const eqZ = y * Math.sin(obliquity) + z * Math.cos(obliquity);
  return { ra: Math.atan2(eqY, x), dec: Math.asin(clamp(eqZ, -1, 1)) };
}
