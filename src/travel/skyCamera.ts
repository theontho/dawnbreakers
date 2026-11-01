import { DEG_TO_RAD, clamp } from '../sky/math';
import type { Vec3 } from '../sky/types';

export interface ScreenPoint {
  x: number;
  y: number;
}

/**
 * A pinhole camera on the sky, standing on the road and looking toward a
 * compass bearing, tilted up just enough that the true horizon falls on a
 * given screen line. A gnomonic projection keeps that horizon straight under
 * the painted hills, and draws the circles stars turn on as the ellipses a
 * real camera would record.
 */
export class SkyCamera {
  readonly width: number;
  readonly height: number;
  readonly horizonY: number;
  readonly focal: number;
  private readonly cx: number;
  private readonly cy: number;
  private forward: Vec3 = { x: 0, y: 0, z: -1 };
  private right: Vec3 = { x: 1, y: 0, z: 0 };
  private up: Vec3 = { x: 0, y: 1, z: 0 };
  private bearing = 0;

  constructor(width: number, height: number, horizonY: number) {
    this.width = width;
    this.height = height;
    this.horizonY = horizonY;
    this.cx = width / 2;
    this.cy = height / 2;
    // Wider on a landscape screen; a phone held upright sees a narrower slice.
    const fov = clamp(46 + (width / Math.max(1, height)) * 26, 58, 96) * DEG_TO_RAD;
    this.focal = (width / 2) / Math.tan(fov / 2);
    this.face(0);
  }

  /** Bearing in degrees from north, through east. */
  get facing(): number {
    return this.bearing;
  }

  face(bearing: number): void {
    this.bearing = ((bearing % 360) + 360) % 360;
    const az = this.bearing * DEG_TO_RAD;
    const pitch = Math.atan((this.horizonY - this.cy) / this.focal);
    const sinA = Math.sin(az), cosA = Math.cos(az);
    const sinP = Math.sin(pitch), cosP = Math.cos(pitch);
    this.forward = { x: sinA * cosP, y: sinP, z: -cosA * cosP };
    this.right = { x: cosA, y: 0, z: sinA };
    this.up = { x: -sinA * sinP, y: cosP, z: cosA * sinP };
  }

  /** Writes the screen point of a local direction into `out`; false when it is behind the camera. */
  project(x: number, y: number, z: number, out: ScreenPoint): boolean {
    const depth = x * this.forward.x + y * this.forward.y + z * this.forward.z;
    if (depth < 0.08) return false;
    const scale = this.focal / depth;
    out.x = this.cx + (x * this.right.x + z * this.right.z) * scale;
    out.y = this.cy - (x * this.up.x + y * this.up.y + z * this.up.z) * scale;
    return true;
  }

  /** Screen x of a bearing on the horizon, for lighting the land under the sun or moon. */
  bearingX(azimuth: number): number | undefined {
    const az = azimuth * DEG_TO_RAD;
    const point = { x: 0, y: 0 };
    return this.project(Math.sin(az), 0, -Math.cos(az), point) ? point.x : undefined;
  }

  /** Pixels per radian at the centre of the view. */
  get pixelsPerRadian(): number {
    return this.focal;
  }
}

/** Altitude in degrees and compass bearing in degrees of a local direction. */
export function altitudeAzimuth(direction: Vec3): { altitude: number; azimuth: number } {
  const altitude = Math.asin(clamp(direction.y, -1, 1)) / DEG_TO_RAD;
  const azimuth = ((Math.atan2(direction.x, -direction.z) / DEG_TO_RAD) + 360) % 360;
  return { altitude, azimuth };
}
