import Phaser from 'phaser';
import { resetFlags } from '../dialogue/flags';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { buttonFont, isNarrowLayout, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';
import { activateTitleTextButton, addFastSunriseButton, addTitleLanguageButton } from './titleControls';
import { playTitleBookOpening } from './titleBookOpening';
import { addTitleCityDaylight, addTitleCitySilhouette, addTitleCloud } from './titleCity';
import { calculateTitleDaylight } from './titleDaylight';
import { SHIRAZ_EAST_STAR_CHART } from './titleStarChart';
import { drawTitleSunRays } from './titleSunRays';

type SunriseBackground = {
  width: number;
  height: number;
  sun: Phaser.GameObjects.Container;
  sunDisk: Phaser.GameObjects.Arc;
  sunEffects: Phaser.GameObjects.Container[];
  sunRays: Phaser.GameObjects.Graphics;
  sunCenterX: number;
  sunCenterY: number;
  horizonY: number;
  stars: Phaser.GameObjects.Container;
  daySky: Phaser.GameObjects.Image;
  dawnGlow: Phaser.GameObjects.Container;
  dayClouds: Phaser.GameObjects.Container;
  cityDay: Phaser.GameObjects.Container;
  nightWash: Phaser.GameObjects.Rectangle;
  cloudDrift: { fromX: number; toX: number };
};

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create(): void {
    restartSceneOnResize(this);

    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    const centerX = safe.x + safe.width / 2;
    const narrow = isNarrowLayout(size);

    const sunrise = this.addDawnBackground(width, height);

    const titleLayer = this.add.container(0, 0);

    const title = this.add.text(centerX, safe.y + safe.height * 0.32, t('The Dawn-Breakers'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(narrow ? 58 : 72, size, 34),
      color: '#f3e2b5',
      align: 'center',
      wordWrap: { width: Math.min(safe.width, 900) },
    }, 'center')).setOrigin(0.5);

    const subtitle = this.add.text(centerX, safe.y + safe.height * 0.42, t('Shíráz, the eve of 23 May 1844'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(22, size, 15),
      color: '#c9b07a',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: Math.min(safe.width, 720) },
    }, 'center')).setOrigin(0.5);

    const startButton = this.add.text(centerX, safe.y + safe.height * 0.7, t('Start'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(22, size),
      color: '#e8d9b0',
      backgroundColor: '#1a120acc',
      padding: { x: 24, y: 16 },
      align: 'center',
      wordWrap: { width: safe.width },
    }, 'center')).setOrigin(0.5);

    const start = () => this.scene.start('City');

    const chapters = this.add.text(centerX, safe.y + safe.height * 0.78, t('Chapters ›'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }, 'center')).setOrigin(0.5);

    const editor = this.add.text(centerX, safe.y + safe.height * 0.86, t('Map Editor'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }, 'center')).setOrigin(0.5);

    const reset = this.add.text(rtl ? safe.x : safe.right, safe.bottom, t('Reset story'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(14, size), color: '#9c8458',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 14 },
    })).setOrigin(textOriginX(1), 1);

    titleLayer.add([title, subtitle, startButton, chapters, editor, reset]);

    playTitleBookOpening(this, {
      width,
      height,
      content: titleLayer,
      onComplete: () => {
        let showRestartOpening = () => {};
        const speedUpSunrise = this.startSunriseAnimation(sunrise, height, () => showRestartOpening());
        addTitleLanguageButton(this, size, () => this.scene.restart());
        showRestartOpening = addFastSunriseButton(this, size, speedUpSunrise);
        activateTitleTextButton(this, startButton, '#e8d9b0', '#fff1c0', start);
        activateTitleTextButton(this, chapters, '#c9b07a', '#fff1c0', () => this.scene.start('ChapterSelect'));
        activateTitleTextButton(this, editor, '#c9b07a', '#fff1c0', () => this.scene.start('MapEditor', { from: 'Title' }));
        activateTitleTextButton(this, reset, '#9c8458', '#f3d98a', () => {
          resetFlags();
          reset.setText(t('Reset ✓'));
        });
      },
    });
  }

  private addDawnBackground(width: number, height: number): SunriseBackground {
    const horizonY = height * 0.62;
    const cityBaseY = horizonY + height * 0.1;

    this.addSkyGradient('night', width, height, [
      { at: 0, color: 0x030716 },
      { at: 0.36, color: 0x071329 },
      { at: 0.68, color: 0x1a1831 },
      { at: 1, color: 0x0a090c },
    ]);
    const daySky = this.addSkyGradient('day', width, height, [
      { at: 0, color: 0x61aeea },
      { at: 0.34, color: 0x96cdf2 },
      { at: 0.64, color: 0xd2ebfb },
      { at: 1, color: 0xf5d19a },
    ]).setAlpha(0);
    const sunRays = this.add.graphics();
    const sunrise = this.addSunrise(width, height, cityBaseY);
    const dawnGlow = this.addHorizonGlow(width, height, horizonY).setAlpha(0);
    const stars = this.addStars(width, height, cityBaseY);
    const cloudDrift = { fromX: -width * 0.28, toX: width * 0.28 };
    const dayClouds = this.add.container(cloudDrift.fromX, 0)
      .add(addTitleCloud(this, -width * 0.18, height * 0.24, 0.9, 0.14))
      .add(addTitleCloud(this, width * 0.18, height * 0.2, 1.1, 0.2))
      .add(addTitleCloud(this, width * 0.78, height * 0.27, 0.85, 0.16))
      .add(addTitleCloud(this, width * 1.22, height * 0.18, 0.95, 0.14))
      .setAlpha(0);

    addTitleCitySilhouette(this, width, height, cityBaseY);
    const cityDay = addTitleCityDaylight(this, width, height, cityBaseY).setAlpha(0);
    const nightWash = this.add.rectangle(0, 0, width, height, 0x030611, 0.12).setOrigin(0);
    this.add.rectangle(width / 2, height * 0.36, Math.min(width - 24, 940), height * 0.26, 0x07040a, 0.28)
      .setOrigin(0.5);

    const background = {
      width,
      height,
      sun: sunrise.layer,
      sunDisk: sunrise.disk,
      sunEffects: sunrise.effects,
      sunRays,
      sunCenterX: sunrise.centerX,
      sunCenterY: sunrise.centerY,
      horizonY: cityBaseY,
      stars,
      daySky,
      dawnGlow,
      dayClouds,
      cityDay,
      nightWash,
      cloudDrift,
    };
    this.applySunriseLighting(background);

    return background;
  }

  private addSkyGradient(
    name: string,
    width: number,
    height: number,
    stops: Array<{ at: number; color: number }>,
  ): Phaser.GameObjects.Image {
    const textureWidth = Math.ceil(width);
    const textureHeight = Math.ceil(height);
    const key = `title-${name}-sky-${textureWidth}x${textureHeight}`;

    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }

    const texture = this.textures.createCanvas(key, textureWidth, textureHeight);
    if (!texture) {
      throw new Error(`Unable to create sky gradient texture: ${key}`);
    }

    const gradient = texture.context.createLinearGradient(0, 0, 0, textureHeight);
    stops.forEach((stop) => gradient.addColorStop(stop.at, this.colorToCss(stop.color)));
    texture.context.fillStyle = gradient;
    texture.context.fillRect(0, 0, textureWidth, textureHeight);
    texture.refresh();

    return this.add.image(0, 0, key).setOrigin(0).setDisplaySize(width, height);
  }

  private addStars(width: number, height: number, horizonY: number): Phaser.GameObjects.Container {
    const stars = this.add.container(0, 0);
    const widescreenAspect = 16 / 9;
    const horizontalView = Phaser.Math.Clamp((width / height) / widescreenAspect, 0.45, 1);
    const viewLeft = 0.5 - horizontalView / 2;
    const viewRight = 0.5 + horizontalView / 2;
    const scale = Phaser.Math.Clamp(width / 1000, 0.75, 1.35);

    for (const [x, y, radius, alpha] of SHIRAZ_EAST_STAR_CHART) {
      if (x < viewLeft || x > viewRight) continue;

      const screenX = ((x - viewLeft) / horizontalView) * width;
      const screenY = (y / 0.98) * horizonY;
      stars.add(this.add.circle(screenX, screenY, radius * scale, 0xfff3c8, alpha));
    }

    return stars;
  }

  private addSunrise(
    width: number,
    height: number,
    visibleHorizonY: number,
  ): {
    layer: Phaser.GameObjects.Container;
    disk: Phaser.GameObjects.Arc;
    effects: Phaser.GameObjects.Container[];
    centerX: number;
    centerY: number;
  } {
    const sunrise = this.add.container(0, 0);
    const backEffects = this.add.container(0, 0).setAlpha(0);
    const sunX = width / 2;
    const sunRadius = Phaser.Math.Clamp(Math.min(width, height) * 0.15, 52, 132);
    const sunY = Math.max(visibleHorizonY + sunRadius * 1.3, visibleHorizonY * 1.22);

    for (let i = 5; i >= 1; i -= 1) {
      backEffects.add(this.add.circle(sunX, sunY, sunRadius * (1 + i * 0.38), 0xffb55a, 0.026 + i * 0.006));
    }

    const disk = this.add.circle(sunX, sunY, sunRadius, 0xffc66d, 1);

    sunrise.add(backEffects);
    sunrise.add(disk);

    return { layer: sunrise, disk, effects: [backEffects], centerX: sunX, centerY: sunY };
  }

  private startSunriseAnimation(sunrise: SunriseBackground, height: number, onComplete: () => void): () => void {
    const duration = 210000;
    const acceleratedDuration = 10000;
    const sunTargetY = -height * 1.45;
    let completed = false;
    const updateLight = () => this.applySunriseLighting(sunrise);
    const completeSunrise = () => {
      if (completed) return;

      completed = true;
      updateLight();
      onComplete();
    };
    updateLight();

    const activeTweens = [
      this.tweens.add({
        targets: sunrise.sun,
        y: sunTargetY,
        duration,
        ease: 'Sine.easeInOut',
        onUpdate: updateLight,
        onComplete: completeSunrise,
      }),
    ];
    this.tweens.add({
      targets: sunrise.dayClouds,
      x: sunrise.cloudDrift.toX,
      duration: 160000,
      ease: 'Sine.easeInOut',
      repeat: -1,
    });

    return () => {
      if (completed) return;

      activeTweens.forEach((tween) => tween.stop());
      this.tweens.add({
        targets: sunrise.sun,
        y: sunTargetY,
        duration: acceleratedDuration,
        ease: 'Sine.easeInOut',
        onUpdate: updateLight,
        onComplete: completeSunrise,
      });
    };
  }

  private applySunriseLighting(sunrise: SunriseBackground): void {
    const sunCenterX = sunrise.sunCenterX + sunrise.sun.x;
    const sunCenterY = sunrise.sunCenterY + sunrise.sun.y;
    const daylight = calculateTitleDaylight(sunCenterY, sunrise.horizonY);

    drawTitleSunRays(
      sunrise.sunRays,
      sunrise.width,
      sunrise.height,
      sunCenterX,
      sunCenterY,
      daylight.sunTint,
      daylight.sunEffectsAlpha,
    );
    sunrise.daySky.setAlpha(daylight.daySkyAlpha);
    sunrise.daySky.setTint(daylight.skyTint);
    sunrise.dawnGlow.setAlpha(daylight.dawnGlowAlpha);
    sunrise.sunEffects.forEach((effect) => effect.setAlpha(daylight.sunEffectsAlpha));
    sunrise.sunDisk.setFillStyle(daylight.sunTint, 1);
    sunrise.stars.setAlpha(daylight.starAlpha);
    sunrise.cityDay.setAlpha(daylight.cityDayAlpha);
    sunrise.dayClouds.setAlpha(daylight.cloudAlpha);
    sunrise.nightWash.setAlpha(daylight.nightWashAlpha);
  }

  private addHorizonGlow(width: number, height: number, horizonY: number): Phaser.GameObjects.Container {
    const glow = this.add.container(0, 0);
    const textureWidth = Math.ceil(width);
    const textureHeight = Math.ceil(height);
    const key = `title-horizon-light-${textureWidth}x${textureHeight}`;

    if (this.textures.exists(key)) {
      this.textures.remove(key);
    }

    const texture = this.textures.createCanvas(key, textureWidth, textureHeight);
    if (!texture) {
      throw new Error(`Unable to create horizon light texture: ${key}`);
    }

    const verticalGlow = texture.context.createLinearGradient(
      0,
      horizonY - height * 0.34,
      0,
      horizonY + height * 0.26,
    );
    verticalGlow.addColorStop(0, 'rgba(255, 174, 97, 0)');
    verticalGlow.addColorStop(0.42, 'rgba(255, 189, 113, 0.16)');
    verticalGlow.addColorStop(0.68, 'rgba(255, 145, 105, 0.12)');
    verticalGlow.addColorStop(1, 'rgba(255, 174, 97, 0)');
    texture.context.fillStyle = verticalGlow;
    texture.context.fillRect(0, 0, textureWidth, textureHeight);

    const radialGlow = texture.context.createRadialGradient(
      width / 2,
      horizonY + height * 0.03,
      0,
      width / 2,
      horizonY + height * 0.03,
      width * 0.62,
    );
    radialGlow.addColorStop(0, 'rgba(255, 207, 139, 0.18)');
    radialGlow.addColorStop(0.46, 'rgba(255, 167, 104, 0.11)');
    radialGlow.addColorStop(1, 'rgba(255, 167, 104, 0)');
    texture.context.fillStyle = radialGlow;
    texture.context.fillRect(0, 0, textureWidth, textureHeight);
    texture.refresh();

    const g = this.add.graphics();

    glow.add(this.add.image(0, 0, key).setOrigin(0).setDisplaySize(width, height));
    g.fillStyle(0xffbc6d, 0.16);
    g.fillEllipse(width / 2, horizonY + height * 0.04, width * 0.92, height * 0.16);
    g.fillStyle(0x5e3140, 0.24);
    g.fillEllipse(width / 2, horizonY + height * 0.12, width * 1.12, height * 0.12);
    glow.add(g);

    return glow;
  }

  private colorToCss(color: number): string {
    return `#${color.toString(16).padStart(6, '0')}`;
  }
}
