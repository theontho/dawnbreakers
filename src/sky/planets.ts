import { DEG_TO_RAD, clamp, wrapRadians } from './math';

/**
 * The five planets the eye can see, from Paul Schlyter's low-precision
 * orbital elements (the same as the moon and sun in `skyBodies.ts`): good to
 * a degree or so, and their brightness from their distances and phase.
 * Positions are of the equinox of date, like the precessed stars.
 */

export interface PlanetPosition {
  name: 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn';
  ra: number;
  dec: number;
  /** Apparent visual magnitude. */
  magnitude: number;
  color: number;
}

interface Elements {
  name: PlanetPosition['name'];
  /** Longitude of the ascending node, inclination, argument of perihelion (degrees), and their daily rates. */
  node: [number, number];
  inclination: [number, number];
  perihelion: [number, number];
  /** Semi-major axis (AU), eccentricity and its rate, mean anomaly (degrees) and its rate. */
  axis: number;
  eccentricity: [number, number];
  anomaly: [number, number];
  /** Magnitude at 1 AU from sun and earth, and its change with phase angle (degrees). */
  magnitude: (phaseDegrees: number) => number;
  color: number;
}

const ELEMENTS: readonly Elements[] = [
  {
    name: 'Mercury', node: [48.3313, 3.24587e-5], inclination: [7.0047, 5.0e-8], perihelion: [29.1241, 1.01444e-5],
    axis: 0.387098, eccentricity: [0.205635, 5.59e-10], anomaly: [168.6562, 4.0923344368],
    magnitude: fv => -0.36 + 0.027 * fv + 2.2e-13 * fv ** 6, color: 0xe2d8c8,
  },
  {
    name: 'Venus', node: [76.6799, 2.4659e-5], inclination: [3.3946, 2.75e-8], perihelion: [54.891, 1.38374e-5],
    axis: 0.72333, eccentricity: [0.006773, -1.302e-9], anomaly: [48.0052, 1.6021302244],
    magnitude: fv => -4.34 + 0.013 * fv + 4.2e-7 * fv ** 3, color: 0xfffaee,
  },
  {
    name: 'Mars', node: [49.5574, 2.11081e-5], inclination: [1.8497, -1.78e-8], perihelion: [286.5016, 2.92961e-5],
    axis: 1.523688, eccentricity: [0.093405, 2.516e-9], anomaly: [18.6021, 0.5240207766],
    magnitude: fv => -1.51 + 0.016 * fv, color: 0xffb488,
  },
  {
    name: 'Jupiter', node: [100.4542, 2.76854e-5], inclination: [1.303, -1.557e-7], perihelion: [273.8777, 1.64505e-5],
    axis: 5.20256, eccentricity: [0.048498, 4.469e-9], anomaly: [19.895, 0.0830853001],
    magnitude: fv => -9.25 + 0.014 * fv, color: 0xfff2dc,
  },
  {
    // The rings add up to half a magnitude when open; taken here at a middling tilt.
    name: 'Saturn', node: [113.6634, 2.3898e-5], inclination: [2.4886, -1.081e-7], perihelion: [339.3939, 2.97661e-5],
    axis: 9.55475, eccentricity: [0.055546, -9.499e-9], anomaly: [316.967, 0.0334442282],
    magnitude: fv => -9.0 - 0.3 + 0.044 * fv, color: 0xf4e2b4,
  },
];

/** Heliocentric ecliptic position (AU) from elements on day `d`. */
function heliocentric(el: Elements, d: number): { x: number; y: number; z: number } {
  const node = el.node[0] * DEG_TO_RAD + el.node[1] * DEG_TO_RAD * d;
  const inclination = (el.inclination[0] + el.inclination[1] * d) * DEG_TO_RAD;
  const perihelion = (el.perihelion[0] + el.perihelion[1] * d) * DEG_TO_RAD;
  const e = el.eccentricity[0] + el.eccentricity[1] * d;
  const anomaly = wrapRadians((el.anomaly[0] + el.anomaly[1] * d) * DEG_TO_RAD);
  let eccentric = anomaly + e * Math.sin(anomaly) * (1 + e * Math.cos(anomaly));
  for (let i = 0; i < 6; i += 1) {
    eccentric -= (eccentric - e * Math.sin(eccentric) - anomaly) / (1 - e * Math.cos(eccentric));
  }
  const xv = el.axis * (Math.cos(eccentric) - e);
  const yv = el.axis * Math.sqrt(1 - e * e) * Math.sin(eccentric);
  const v = Math.atan2(yv, xv);
  const r = Math.hypot(xv, yv);
  const u = v + perihelion;
  return {
    x: r * (Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(inclination)),
    y: r * (Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(inclination)),
    z: r * Math.sin(u) * Math.sin(inclination),
  };
}

/**
 * The planets on day `d` of Schlyter's epoch, given the sun's geocentric
 * ecliptic longitude (radians), its distance (AU) and the obliquity.
 */
export function planetPositions(d: number, sunLongitude: number, sunDistance: number, obliquity: number): PlanetPosition[] {
  const sunX = sunDistance * Math.cos(sunLongitude);
  const sunY = sunDistance * Math.sin(sunLongitude);
  return ELEMENTS.map(el => {
    const h = heliocentric(el, d);
    const x = h.x + sunX;
    const y = h.y + sunY;
    const z = h.z;
    const fromSun = Math.hypot(h.x, h.y, h.z);
    const fromEarth = Math.hypot(x, y, z);
    const cosPhase = clamp((fromSun ** 2 + fromEarth ** 2 - sunDistance ** 2) / (2 * fromSun * fromEarth), -1, 1);
    const phaseDegrees = Math.acos(cosPhase) / DEG_TO_RAD;
    const eqY = y * Math.cos(obliquity) - z * Math.sin(obliquity);
    const eqZ = y * Math.sin(obliquity) + z * Math.cos(obliquity);
    return {
      name: el.name,
      ra: Math.atan2(eqY, x),
      dec: Math.asin(clamp(eqZ / fromEarth, -1, 1)),
      magnitude: el.magnitude(phaseDegrees) + 5 * Math.log10(fromSun * fromEarth),
      color: el.color,
    };
  });
}
