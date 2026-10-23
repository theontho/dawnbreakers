import Phaser from 'phaser';
import { mix } from '../assets/art/canvasKit';
import { GLOW_TEXTURE } from './glowTexture';
import type { GroundLayout } from './landscape';
import type { SkyCamera } from './skyCamera';
import type { SkyLight } from './skyLight';
import { paintWater } from './waterPainter';

/**
 * The open Gulf: water from the horizon to the foot of the screen and a
 * pilgrim ship under two lateen sails, pitching and rolling as it runs
 * south, a lamp at its stern.
 */
export class Sea {
  private readonly water: Phaser.GameObjects.Graphics;
  private readonly ship: Phaser.GameObjects.Graphics;
  private readonly lamp: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, private readonly camera: SkyCamera, private readonly ground: GroundLayout) {
    this.water = scene.add.graphics();
    this.lamp = scene.add.image(0, 0, GLOW_TEXTURE).setDepth(9).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffb45a);
    this.ship = scene.add.graphics().setDepth(10);
  }

  draw(scroll: number, light: SkyLight, realMs: number): void {
    this.water.clear();
    paintWater(this.water, this.camera, light, this.ground.horizonY, this.camera.height, scroll, realMs);
    this.paintShip(light, realMs);
  }

  private paintShip(light: SkyLight, realMs: number): void {
    const g = this.ship;
    g.clear();
    const f = this.ground.figure;
    const scale = f * 2.1;
    const cx = this.camera.width * 0.5;
    const cy = this.ground.roadY + Math.sin(realMs * 0.0011) * f * 0.06;
    const roll = Math.sin(realMs * 0.0009 + 1) * 0.035;
    const color = mix(mix(0x05070c, 0x1c2438, light.moonlight), 0x2e241c, light.daylight);
    const sail = mix(mix(0x1a2030, 0x4a5470, light.moonlight), 0xd8ccb0, light.daylight);
    const cos = Math.cos(roll);
    const sin = Math.sin(roll);
    const at = (u: number, v: number) => ({ x: cx + (u * cos - v * sin) * scale, y: cy + (u * sin + v * cos) * scale });

    // Wake and bow wave, pale on the dark water.
    g.fillStyle(mix(light.horizon, 0xffffff, 0.2), 0.35);
    g.fillEllipse(cx - scale * 0.9, cy + scale * 0.02, scale * 0.9, scale * 0.03);
    g.fillEllipse(cx + scale * 0.62, cy + scale * 0.01, scale * 0.18, scale * 0.025);

    g.fillStyle(color, 1);
    g.fillPoints([
      at(-0.62, -0.16), at(-0.5, -0.12), at(0.4, -0.1), at(0.7, -0.24),
      at(0.62, -0.06), at(0.42, 0.04), at(-0.46, 0.04), at(-0.6, -0.06),
    ], true);
    // Two masts raked forward, each with a lateen yard and its triangle of sail.
    for (const [foot, height, yard] of [[0.12, 0.95, 0.75], [-0.32, 0.62, 0.5]] as const) {
      const base = at(foot, -0.1);
      const top = at(foot + 0.06, -0.1 - height);
      g.lineStyle(scale * 0.012, color, 1);
      g.lineBetween(base.x, base.y, top.x, top.y);
      const fore = at(foot + yard * 0.55, -0.1 - height * 0.32);
      const aft = at(foot - yard * 0.5, -0.1 - height * 1.05);
      const clew = at(foot - yard * 0.05, -0.14);
      g.fillStyle(sail, 0.92);
      g.fillTriangle(fore.x, fore.y, aft.x, aft.y, clew.x, clew.y);
      g.lineStyle(scale * 0.008, color, 1);
      g.lineBetween(fore.x, fore.y, aft.x, aft.y);
    }

    const stern = at(-0.56, -0.2);
    const night = 1 - light.daylight;
    this.lamp.setPosition(stern.x, stern.y).setDisplaySize(f * 2.4, f * 1.8).setAlpha(0.6 * night);
    g.fillStyle(0xffd590, 0.4 + 0.6 * night);
    g.fillRect(stern.x - f * 0.03, stern.y - f * 0.04, f * 0.06, f * 0.07);
  }
}
