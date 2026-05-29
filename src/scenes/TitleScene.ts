import Phaser from 'phaser';
import { resetFlags } from '../dialogue/flags';
import { buttonFont, isNarrowLayout, responsiveFont, restartSceneOnResize } from '../ui/responsive';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    restartSceneOnResize(this);

    const { width, height } = this.scale;
    const size = { width, height };
    const narrow = isNarrowLayout(size);

    this.addDawnBackground(width, height);

    this.add.text(width / 2, height * 0.32, 'The Dawn-Breakers', {
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(narrow ? 58 : 72, size, 34),
      color: '#f3e2b5',
      align: 'center',
      wordWrap: { width: Math.min(width - 32, 900) },
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.42, 'Shíráz, the eve of 23 May 1844', {
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(22, size, 15),
      color: '#c9b07a',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: Math.min(width - 32, 720) },
    }).setOrigin(0.5);

    const prompt = this.add.text(width / 2, height * 0.7, 'Press SPACE or click to begin', {
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(20, size, 15),
      color: '#e8d9b0',
      align: 'center',
      wordWrap: { width: width - 32 },
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0.3, duration: 900, yoyo: true, repeat: -1 });

    const start = () => this.scene.start('City');
    this.input.keyboard?.once('keydown-SPACE', start);
    this.input.once('pointerdown', start);

    const chapters = this.add.text(width / 2, height * 0.78, 'Chapters ›', {
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => chapters.setColor('#fff1c0'))
      .on('pointerout',  () => chapters.setColor('#c9b07a'))
      .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: { stopPropagation: () => void }) => {
        ev.stopPropagation();
        this.scene.start('ChapterSelect');
      });

    const editor = this.add.text(width / 2, height * 0.86, 'Map Editor', {
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => editor.setColor('#fff1c0'))
      .on('pointerout',  () => editor.setColor('#c9b07a'))
      .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: { stopPropagation: () => void }) => {
        ev.stopPropagation();
        this.scene.start('MapEditor', { from: 'Title' });
      });

    const reset = this.add.text(width - 20, height - 20, 'Reset story', {
      fontFamily: 'Georgia, serif', fontSize: buttonFont(14, size), color: '#9c8458',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 14 },
    }).setOrigin(1, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => reset.setColor('#f3d98a'))
      .on('pointerout',  () => reset.setColor('#9c8458'))
      .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: { stopPropagation: () => void }) => {
        ev.stopPropagation();
        resetFlags();
        reset.setText('Reset ✓');
      });
  }

  private addDawnBackground(width: number, height: number): void {
    const horizonY = height * 0.62;

    this.addSkyGradient(width, height);
    this.addSunrise(width, height, horizonY);
    this.addCloud(width * 0.18, height * 0.2, 1.1, 0.2);
    this.addCloud(width * 0.78, height * 0.27, 0.85, 0.16);
    this.addHorizonGlow(width, height, horizonY);
    this.addCitySilhouette(width, height, horizonY + height * 0.1);

    this.add.rectangle(0, 0, width, height, 0x090611, 0.18).setOrigin(0);
    this.add.rectangle(width / 2, height * 0.36, Math.min(width - 24, 940), height * 0.26, 0x07040a, 0.28)
      .setOrigin(0.5);
  }

  private addSkyGradient(width: number, height: number): void {
    const stops = [
      { at: 0, color: 0x071226 },
      { at: 0.28, color: 0x17264c },
      { at: 0.5, color: 0x69466d },
      { at: 0.68, color: 0xd56b4e },
      { at: 0.82, color: 0xf0b765 },
      { at: 1, color: 0x3a241b },
    ];
    const bandCount = 56;
    const bandHeight = Math.ceil(height / bandCount);

    for (let i = 0; i < bandCount; i += 1) {
      const y = i * bandHeight;
      const color = this.colorAt(stops, i / (bandCount - 1));
      this.add.rectangle(0, y, width, bandHeight + 1, color).setOrigin(0);
    }
  }

  private addSunrise(width: number, height: number, horizonY: number): void {
    const sunX = width / 2;
    const sunRadius = Phaser.Math.Clamp(Math.min(width, height) * 0.15, 52, 132);
    const sunY = horizonY + sunRadius * 1.28;
    const rays = this.add.graphics();

    rays.fillStyle(0xffd27a, 0.055);
    rays.fillTriangle(sunX, sunY, sunX - width * 0.38, height * 0.26, sunX - width * 0.12, height * 0.24);
    rays.fillTriangle(sunX, sunY, sunX + width * 0.38, height * 0.26, sunX + width * 0.12, height * 0.24);
    rays.fillTriangle(sunX, sunY, sunX - width * 0.16, height * 0.46, sunX + width * 0.16, height * 0.46);

    for (let i = 5; i >= 1; i -= 1) {
      this.add.circle(sunX, sunY, sunRadius * (1 + i * 0.38), 0xffb55a, 0.026 + i * 0.006);
    }

    this.add.circle(sunX, sunY, sunRadius, 0xffc66d, 0.72);
    this.add.circle(sunX, sunY - sunRadius * 0.16, sunRadius * 0.72, 0xffdf8f, 0.34);

    for (let i = 0; i < 5; i += 1) {
      this.add.rectangle(0, horizonY - 18 + i * 10, width, 10, 0xffc071, 0.08 - i * 0.01)
        .setOrigin(0);
    }
  }

  private addHorizonGlow(width: number, height: number, horizonY: number): void {
    const g = this.add.graphics();

    g.fillStyle(0xffbc6d, 0.16);
    g.fillEllipse(width / 2, horizonY + height * 0.04, width * 0.92, height * 0.16);
    g.fillStyle(0x5e3140, 0.24);
    g.fillEllipse(width / 2, horizonY + height * 0.12, width * 1.12, height * 0.12);
  }

  private addCitySilhouette(width: number, height: number, baseY: number): void {
    const g = this.add.graphics();
    const buildingBase = Math.min(height - 40, baseY + height * 0.09);
    const palette = [0x17100e, 0x1e1411, 0x241713];

    g.fillStyle(0x130e0d, 0.95);
    g.fillRect(0, baseY, width, height - baseY);

    for (let i = -1; i < Math.ceil(width / 86) + 1; i += 1) {
      const x = i * 86 + (i % 2 === 0 ? 8 : -6);
      const w = 54 + (i % 3) * 12;
      const h = 54 + (i % 4) * 14;
      const roofY = buildingBase - h;

      g.fillStyle(palette[Math.abs(i) % palette.length], 0.92);
      g.fillRect(x, roofY, w, h);

      if (i % 4 === 0) {
        g.fillCircle(x + w / 2, roofY, w * 0.36);
        g.fillRect(x + w * 0.14, roofY, w * 0.72, w * 0.18);
      } else if (i % 5 === 0) {
        g.fillTriangle(x, roofY, x + w / 2, roofY - 24, x + w, roofY);
      }

      if (i % 6 === 0) {
        const minaretX = x + w + 10;
        g.fillRect(minaretX, roofY - 34, 8, h + 34);
        g.fillCircle(minaretX + 4, roofY - 36, 8);
      }
    }

    g.fillStyle(0x0c0908, 0.78);
    g.fillEllipse(width / 2, height + height * 0.08, width * 1.5, height * 0.44);
  }

  private addCloud(x: number, y: number, scale: number, alpha: number): void {
    const g = this.add.graphics();

    g.fillStyle(0xf5cf9f, alpha);
    g.fillEllipse(x - 48 * scale, y + 8 * scale, 90 * scale, 26 * scale);
    g.fillEllipse(x, y, 126 * scale, 34 * scale);
    g.fillEllipse(x + 58 * scale, y + 10 * scale, 84 * scale, 24 * scale);
  }

  private colorAt(stops: Array<{ at: number; color: number }>, t: number): number {
    const clamped = Phaser.Math.Clamp(t, 0, 1);
    const nextIndex = stops.findIndex((stop) => stop.at >= clamped);

    if (nextIndex <= 0) return stops[0].color;
    if (nextIndex === -1) return stops[stops.length - 1].color;

    const from = stops[nextIndex - 1];
    const to = stops[nextIndex];
    const localT = (clamped - from.at) / (to.at - from.at);

    return this.lerpColor(from.color, to.color, localT);
  }

  private lerpColor(from: number, to: number, t: number): number {
    const r = Math.round(this.lerp((from >> 16) & 0xff, (to >> 16) & 0xff, t));
    const g = Math.round(this.lerp((from >> 8) & 0xff, (to >> 8) & 0xff, t));
    const b = Math.round(this.lerp(from & 0xff, to & 0xff, t));

    return (r << 16) | (g << 8) | b;
  }

  private lerp(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }
}
