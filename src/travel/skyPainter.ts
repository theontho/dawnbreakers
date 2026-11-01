import Phaser from 'phaser';
import { mix } from '../assets/art/canvasKit';
import { clamp } from '../sky/math';
import type { SkyBodies } from '../sky/skyBodies';
import type { SkyCamera, ScreenPoint } from './skyCamera';
import { starAlpha, starBrightness, starLimit, type SkyLight } from './skyLight';
import type { StarField } from './travelStars';
import { ensureGlowTexture, GLOW_TEXTURE } from './glowTexture';
import { paintMoon, type MoonDisc } from './moonPainter';

/** Radians of hour angle the sky turns through per millisecond of sky time. */
export const SIDEREAL_RADIANS_PER_MS = (2 * Math.PI * 1.00273790935) / 86400000;

/** The sun as last drawn: centre and radius in screen pixels. */
export interface SunDisc {
  x: number;
  y: number;
  radius: number;
}

export type TrailMode = 'off' | 'tail' | 'exposure';
export const TRAIL_MODES: readonly TrailMode[] = ['off', 'tail', 'exposure'];

/** Everything the sky needs for one frame. */
export interface SkyFrame {
  field: StarField;
  /** Local sidereal time at `skyMs`, and the sky time it is for. */
  siderealTime: number;
  skyMs: number;
  sinLat: number;
  cosLat: number;
  light: SkyLight;
  bodies: SkyBodies;
  /** 0 when the sky is still, 1 when it whirls. */
  motion: number;
  /** 0 normally, 1 when the days roll by too fast to follow the sun and moon across the sky. */
  timeBlur: number;
  trails: TrailMode;
  /** Sky time a comet tail starts from, and the long exposure's shutter. */
  tailStartMs: number;
  realMs: number;
}

/** The sun's disc, a warm white. */
export const SUN_COLOR = 0xfff6dc;
const TAIL_MAGNITUDE = 4.2;
const MAX_TAIL_SWEEP = 1.6;
const EXPOSURE_MAGNITUDE = 4.6;

/**
 * Paints the night sky behind the land: a gradient lit by the sun and moon,
 * the twilight glow over the sun's bearing, real stars turned by sidereal
 * time, and their trails. Comet tails are drawn fresh each frame back along
 * the last moment of motion; a long exposure accumulates in a render texture
 * like the native sky's trail framebuffer, and only clears when the shutter
 * opens again.
 */
export class SkyPainter {
  private readonly camera: SkyCamera;
  private readonly gradient: Phaser.GameObjects.Graphics;
  private readonly sunGlow: Phaser.GameObjects.Image;
  private readonly exposure: Phaser.GameObjects.RenderTexture;
  private readonly exposureBrush: Phaser.GameObjects.Graphics;
  private readonly stars: Phaser.GameObjects.Graphics;
  private readonly moonHalo: Phaser.GameObjects.Image;
  private readonly bodies: Phaser.GameObjects.Graphics;
  private readonly sizeScale: number;
  private readonly point: ScreenPoint = { x: 0, y: 0 };
  private previousX = new Float32Array(0);
  private previousY = new Float32Array(0);
  private hasPrevious = new Uint8Array(0);
  /** The discs of the last frame, for the HDR glow; undefined when below the horizon or not drawn. */
  moonDisc: MoonDisc | undefined;
  sunDisc: SunDisc | undefined;

  constructor(scene: Phaser.Scene, camera: SkyCamera) {
    this.camera = camera;
    this.sizeScale = clamp(camera.height / 760, 0.75, 1.7);
    ensureGlowTexture(scene);
    this.gradient = scene.add.graphics();
    this.sunGlow = scene.add.image(0, camera.horizonY, GLOW_TEXTURE).setBlendMode(Phaser.BlendModes.ADD);
    this.exposure = scene.add.renderTexture(0, 0, camera.width, camera.height).setOrigin(0);
    this.exposureBrush = scene.make.graphics({}, false);
    this.stars = scene.add.graphics();
    this.moonHalo = scene.add.image(0, 0, GLOW_TEXTURE).setBlendMode(Phaser.BlendModes.ADD);
    this.bodies = scene.add.graphics();
  }

  /** Forgets the accumulated long exposure, as when the view or the journey changes. */
  openShutter(): void {
    this.exposure.clear();
    this.hasPrevious.fill(0);
  }

  draw(frame: SkyFrame): void {
    this.paintGradient(frame.light);
    this.paintSunGlow(frame.light);
    this.stars.clear();
    if (this.previousX.length !== frame.field.count) {
      this.previousX = new Float32Array(frame.field.count);
      this.previousY = new Float32Array(frame.field.count);
      this.hasPrevious = new Uint8Array(frame.field.count);
    }
    if (frame.trails === 'exposure') this.accumulateExposure(frame);
    else this.hasPrevious.fill(0);
    this.exposure.setVisible(frame.trails === 'exposure').setAlpha(frame.light.starVisibility);
    if (frame.trails === 'tail') this.paintTails(frame);
    this.paintStars(frame);
    this.bodies.clear();
    this.moonDisc = paintMoon(this.bodies, this.moonHalo, this.camera, frame.bodies, frame.light, this.sizeScale);
    this.sunDisc = this.paintSun(frame);
    // A disc that leaps across the sky between frames would strobe, so it fades out instead.
    this.bodies.setAlpha(1 - frame.timeBlur);
    this.moonHalo.setAlpha(this.moonHalo.alpha * (1 - frame.timeBlur));
  }

  private paintGradient(light: SkyLight): void {
    const { width, horizonY } = this.camera;
    const mid = mix(light.zenith, light.horizon, 0.45);
    const split = horizonY * 0.5;
    this.gradient.clear();
    this.gradient.fillGradientStyle(light.zenith, light.zenith, mid, mid, 1);
    this.gradient.fillRect(0, 0, width, split);
    this.gradient.fillGradientStyle(mid, mid, light.horizon, light.horizon, 1);
    this.gradient.fillRect(0, split, width, horizonY - split + 40);
  }

  private paintSunGlow(light: SkyLight): void {
    const { width, height, horizonY } = this.camera;
    const offset = Math.abs(((light.sunAzimuth - this.camera.facing + 540) % 360) - 180);
    const strength = light.glowStrength * clamp(1.15 - offset / 110, 0.15, 1);
    const x = this.camera.bearingX(light.sunAzimuth) ?? (offset > 0 ? width * 1.4 : -width * 0.4);
    this.sunGlow
      .setPosition(clamp(x, -width * 0.4, width * 1.4), horizonY)
      .setDisplaySize(width * 1.5, height * 0.75)
      .setTint(light.glow)
      .setAlpha(strength)
      .setVisible(strength > 0.01);
  }

  private paintStars(frame: SkyFrame): void {
    const { field, light } = frame;
    const limit = starLimit(light, frame.motion);
    const twinkle = 1 - frame.motion;
    const p = this.point;
    for (let i = 0; i < field.count; i += 1) {
      const magnitude = field.magnitude[i]!;
      if (magnitude > limit) break;
      if (!this.starPoint(frame, i, frame.siderealTime, p)) continue;
      const b = starBrightness(magnitude);
      const extinction = clamp(this.lastAltitude / 0.2, 0.1, 1);
      const flicker = 1 - twinkle * (0.12 + (1 - extinction) * 0.3) * (0.5 + 0.5 * Math.sin(frame.realMs * 0.004 * (1 + (i % 7) * 0.37) + i));
      const alpha = clamp(starAlpha(magnitude, limit, light) * extinction * flicker, 0, 1);
      const radius = (0.85 + 2 * Math.pow(b, 1.4)) * this.sizeScale;
      const color = field.color[i]!;
      if (b > 0.62) {
        this.stars.fillStyle(color, alpha * 0.12);
        this.stars.fillCircle(p.x, p.y, radius * 3);
      }
      this.stars.fillStyle(color, alpha);
      if (radius < 1.2) this.stars.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
      else this.stars.fillCircle(p.x, p.y, radius);
    }
  }

  private paintTails(frame: SkyFrame): void {
    const { field, light } = frame;
    // Held short of a full turn, so a sky racing through the days draws arcs rather than rings.
    const sweep = clamp((frame.skyMs - frame.tailStartMs) * SIDEREAL_RADIANS_PER_MS, -MAX_TAIL_SWEEP, MAX_TAIL_SWEEP);
    if (Math.abs(sweep) * this.camera.pixelsPerRadian < 2) return;
    const segments = clamp(Math.ceil(Math.abs(sweep) / 0.025), 3, 28);
    const limit = Math.min(TAIL_MAGNITUDE, starLimit(light, frame.motion));
    const from = { x: 0, y: 0 };
    const to = this.point;
    for (let i = 0; i < field.count; i += 1) {
      const magnitude = field.magnitude[i]!;
      if (magnitude > limit) break;
      const b = starBrightness(magnitude);
      const strength = starAlpha(magnitude, limit, light);
      const width = (0.5 + 1.8 * b) * this.sizeScale;
      let have = this.starPoint(frame, i, frame.siderealTime - sweep, from);
      for (let s = 1; s <= segments; s += 1) {
        const ok = this.starPoint(frame, i, frame.siderealTime - sweep * (1 - s / segments), to);
        if (have && ok && this.lastAltitude > -0.02) {
          const fade = Math.pow(s / segments, 1.6);
          this.stars.lineStyle(width, field.color[i]!, strength * 0.8 * fade * frame.motion);
          this.stars.lineBetween(from.x, from.y, to.x, to.y);
        }
        from.x = to.x;
        from.y = to.y;
        have = ok;
      }
    }
  }

  private accumulateExposure(frame: SkyFrame): void {
    const { field } = frame;
    const brush = this.exposureBrush;
    const limit = Math.min(EXPOSURE_MAGNITUDE, starLimit(frame.light, frame.motion) + 0.6);
    const p = this.point;
    brush.clear();
    let drew = false;
    for (let i = 0; i < field.count; i += 1) {
      const magnitude = field.magnitude[i]!;
      if (magnitude > limit) break;
      if (!this.starPoint(frame, i, frame.siderealTime, p) || this.lastAltitude < -0.05) {
        this.hasPrevious[i] = 0;
        continue;
      }
      if (this.hasPrevious[i]) {
        const dx = p.x - this.previousX[i]!;
        const dy = p.y - this.previousY[i]!;
        const step = dx * dx + dy * dy;
        // Wait for the star to move a little, so a still sky does not burn in dots.
        if (step < 0.36) continue;
        if (step < 6400) {
          const b = starBrightness(magnitude);
          brush.lineStyle((0.6 + 1.7 * b) * this.sizeScale, field.color[i]!, 0.2 + 0.7 * b);
          brush.lineBetween(this.previousX[i]!, this.previousY[i]!, p.x, p.y);
          drew = true;
        }
      }
      this.previousX[i] = p.x;
      this.previousY[i] = p.y;
      this.hasPrevious[i] = 1;
    }
    if (drew) this.exposure.draw(brush);
  }

  private paintSun(frame: SkyFrame): SunDisc | undefined {
    const { light, bodies } = frame;
    if (light.sunAltitude < -1.5) return undefined;
    const p = this.point;
    if (!this.camera.project(bodies.sun.x, bodies.sun.y, bodies.sun.z, p)) return undefined;
    const radius = 14 * this.sizeScale;
    this.bodies.fillStyle(0xfff0c0, 0.25);
    this.bodies.fillCircle(p.x, p.y, radius * 2.2);
    this.bodies.fillStyle(SUN_COLOR, 1);
    this.bodies.fillCircle(p.x, p.y, radius);
    return { x: p.x, y: p.y, radius };
  }

  private lastAltitude = 0;

  /** Projects star `i` at a sidereal time; leaves its altitude (radians, roughly) in `lastAltitude`. */
  private starPoint(frame: SkyFrame, i: number, siderealTime: number, out: ScreenPoint): boolean {
    const { field, sinLat, cosLat } = frame;
    const hourAngle = siderealTime - field.ra[i]!;
    const sinDec = field.sinDec[i]!;
    const cosDec = field.cosDec[i]!;
    const cosHour = Math.cos(hourAngle);
    const up = sinDec * sinLat + cosDec * cosLat * cosHour;
    this.lastAltitude = up;
    if (up < -0.06) return false;
    const east = -cosDec * Math.sin(hourAngle);
    const south = -(sinDec * cosLat - cosDec * sinLat * cosHour);
    if (!this.camera.project(east, up, south, out)) return false;
    return out.x > -40 && out.x < this.camera.width + 40 && out.y > -40 && out.y < this.camera.horizonY + 40;
  }
}
