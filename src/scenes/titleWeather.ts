import Phaser from 'phaser';
import type { Weather } from '../data/titleOpenings';

/**
 * The weather over a title dawn: snow falling on a winter town, rain, or
 * mist lying along the land. It is at its thickest in the dark and thins
 * as the sun climbs, gone by the time the sun is well up, so the day ends
 * as clear as every other dawn's.
 *
 * Snow and rain fall in three layers, far to near: the far ones smaller,
 * fainter and slower, the near ones larger and quicker. They move in real
 * time, while how much of them shows follows the sunrise's playhead.
 */

type Size = { width: number; height: number };

interface Drop {
  bob: Phaser.GameObjects.Bob;
  speed: number;
  drift: number;
  phase: number;
}

interface Fall {
  blitter: Phaser.GameObjects.Blitter;
  drops: Drop[];
  /** Pixels each drop slides sideways for every pixel it falls. */
  slant: number;
  sway: number;
}

interface Bank {
  image: Phaser.GameObjects.Image;
  speed: number;
}

/** Thickest through the dawn, thinning from this height of the sun and gone by the next, late in the morning. */
const CLEAR_FROM_DEG = 14;
const CLEAR_BY_DEG = 40;
const MIST_NIGHT = 0x3c4558;
const MIST_DAY = 0xe6e9ee;

export class TitleWeather {
  private readonly falls: Fall[] = [];
  private readonly banks: Bank[] = [];
  private time = 0;
  private strength = 1;

  constructor(private readonly scene: Phaser.Scene, readonly kind: Weather, private readonly size: Size, horizonY: number) {
    if (kind === 'snow') this.addFalls('snow', [
      { count: 0.2, radius: 1.6, speed: 24, alpha: 0.6 },
      { count: 0.12, radius: 2.6, speed: 42, alpha: 0.85 },
      { count: 0.05, radius: 4, speed: 70, alpha: 1 },
    ], 0.12, 18);
    if (kind === 'rain') this.addFalls('rain', [
      { count: 0.14, radius: 10, speed: 520, alpha: 0.22 },
      { count: 0.08, radius: 16, speed: 760, alpha: 0.32 },
      { count: 0.03, radius: 24, speed: 980, alpha: 0.42 },
    ], 0.18, 0);
    if (kind === 'mist' || kind === 'rain') this.addBanks(horizonY, kind === 'mist' ? 7 : 4);
    const step = (_time: number, deltaMs: number) => this.step(deltaMs);
    scene.events.on(Phaser.Scenes.Events.UPDATE, step);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => scene.events.off(Phaser.Scenes.Events.UPDATE, step));
  }

  /** How much of the sky is clouded over: the stars hide behind falling snow or rain, not behind mist on the ground. */
  get overcast(): number {
    return this.kind === 'mist' ? 0 : this.strength;
  }

  /** Follows the sunrise: `elevation` of the sun in degrees, `light` from 0 at night to 1 in full day. */
  setLight(elevation: number, light: number): void {
    this.strength = 1 - Phaser.Math.SmoothStep(elevation, CLEAR_FROM_DEG, CLEAR_BY_DEG);
    const lit = 0.7 + 0.3 * light;
    for (const fall of this.falls) fall.blitter.setAlpha(this.strength * lit).setVisible(this.strength > 0.01);
    const tint = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(MIST_NIGHT),
      Phaser.Display.Color.ValueToColor(MIST_DAY),
      1,
      light,
    );
    const color = Phaser.Display.Color.GetColor(tint.r, tint.g, tint.b);
    for (const bank of this.banks) bank.image.setTint(color).setAlpha(this.strength * (0.55 + 0.2 * (1 - light))).setVisible(this.strength > 0.01);
  }

  private addFalls(kind: 'snow' | 'rain', layers: Array<{ count: number; radius: number; speed: number; alpha: number }>, slant: number, sway: number): void {
    const { width, height } = this.size;
    const area = width * height / 1000;
    for (const [i, layer] of layers.entries()) {
      const key = kind === 'snow' ? flakeTexture(this.scene, layer.radius) : streakTexture(this.scene, layer.radius, slant);
      const blitter = this.scene.add.blitter(0, 0, key);
      const drops: Drop[] = [];
      const count = Math.round(layer.count * area);
      for (let n = 0; n < count; n++) {
        const bob = blitter.create(Math.random() * width, Math.random() * height);
        bob.setAlpha(layer.alpha * (0.7 + Math.random() * 0.3));
        drops.push({ bob, speed: layer.speed * (0.8 + Math.random() * 0.4), drift: (Math.random() - 0.5) * 0.3, phase: Math.random() * Math.PI * 2 });
      }
      this.falls.push({ blitter, drops, slant: slant * (1 + i * 0.2), sway });
    }
  }

  private addBanks(horizonY: number, count: number): void {
    const { width, height } = this.size;
    const key = mistTexture(this.scene);
    for (let i = 0; i < count; i++) {
      const near = i / Math.max(1, count - 1);
      const image = this.scene.add.image(Math.random() * width, horizonY + height * (0.02 + 0.12 * near), key)
        .setDisplaySize(width * (0.5 + 0.4 * Math.random()), height * (0.05 + 0.05 * near));
      this.banks.push({ image, speed: (4 + 8 * near) * (Math.random() < 0.5 ? -1 : 1) });
    }
  }

  private step(deltaMs: number): void {
    if (this.strength <= 0.01) return;
    const dt = Math.min(deltaMs, 100) / 1000;
    this.time += dt;
    const { width, height } = this.size;
    for (const fall of this.falls) {
      for (const drop of fall.drops) {
        const { bob } = drop;
        const fallBy = drop.speed * dt;
        bob.y += fallBy;
        bob.x += fallBy * (fall.slant + drop.drift) + Math.sin(this.time * 1.3 + drop.phase) * fall.sway * dt;
        if (bob.y > height + 8) {
          bob.y -= height + 24;
          bob.x = Math.random() * width;
        }
        if (bob.x > width + 8) bob.x -= width + 16;
        else if (bob.x < -8) bob.x += width + 16;
      }
    }
    for (const bank of this.banks) {
      const image = bank.image;
      image.x += bank.speed * dt;
      const half = image.displayWidth / 2;
      if (image.x - half > width) image.x = -half;
      else if (image.x + half < 0) image.x = width + half;
    }
  }
}

/** A soft round flake, white with a feathered edge. */
function flakeTexture(scene: Phaser.Scene, radius: number): string {
  const key = `weather-flake-${radius}`;
  if (scene.textures.exists(key)) return key;
  const side = Math.ceil(radius * 2 + 2);
  const texture = scene.textures.createCanvas(key, side, side)!;
  const ctx = texture.context;
  const g = ctx.createRadialGradient(side / 2, side / 2, 0, side / 2, side / 2, radius);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, side, side);
  texture.refresh();
  return key;
}

/** A streak of rain `length` long, leaning with the wind, bright at its foot. */
function streakTexture(scene: Phaser.Scene, length: number, slant: number): string {
  const key = `weather-streak-${length}-${slant}`;
  if (scene.textures.exists(key)) return key;
  const lean = length * slant;
  const w = Math.ceil(lean + 3);
  const h = Math.ceil(length + 2);
  const texture = scene.textures.createCanvas(key, w, h)!;
  const ctx = texture.context;
  const g = ctx.createLinearGradient(0, 0, lean, length);
  g.addColorStop(0, 'rgba(220,230,245,0)');
  g.addColorStop(1, 'rgba(220,230,245,0.9)');
  ctx.strokeStyle = g;
  ctx.lineWidth = 1.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(1, 1);
  ctx.lineTo(1 + lean, 1 + length);
  ctx.stroke();
  texture.refresh();
  return key;
}

/** A long soft bank of mist, densest along its middle and fading out at every edge. */
function mistTexture(scene: Phaser.Scene): string {
  const key = 'weather-mist';
  if (scene.textures.exists(key)) return key;
  const w = 512;
  const h = 96;
  const texture = scene.textures.createCanvas(key, w, h)!;
  const ctx = texture.context;
  ctx.save();
  ctx.scale(w / h, 1);
  const g = ctx.createRadialGradient(h / 2, h / 2, 0, h / 2, h / 2, h / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.5, 'rgba(255,255,255,0.5)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, h, h);
  ctx.restore();
  texture.refresh();
  return key;
}
