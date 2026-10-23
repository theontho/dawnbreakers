import Phaser from 'phaser';
import { loadTitleMusic, startTitleMusic } from './titleMusic';
import { loadBookmark, resetStory } from '../dialogue/progress';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { logGameEvent } from '../logging/gameLogger';
import { buttonFont, isNarrowLayout, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';
import { activateTitleTextButton, addTitleLanguageButton } from './titleControls';
import { playTitleBookOpening } from './titleBookOpening';
import { addTitleCity, addTitleCloud, type TitleCity } from './titleCity';
import { calculateTitleDaylight } from './titleDaylight';
import { SHIRAZ_EAST_STAR_CHART } from './titleStarChart';
import { drawTitleSunRays } from './titleSunRays';
import { SunriseClock } from './titleSunriseClock';
import { addSunriseTransport } from './titleTransport';

type SunriseBackground = {
  width: number;
  height: number;
  sun: Phaser.GameObjects.Container;
  sunDisk: Phaser.GameObjects.Arc;
  sunEffects: Phaser.GameObjects.Container[];
  sunRays: Phaser.GameObjects.Graphics;
  sunCenterX: number;
  sunCenterY: number;
  sunRadius: number;
  horizonY: number;
  stars: Phaser.GameObjects.Image;
  daySky: Phaser.GameObjects.Image;
  dawnGlow: Phaser.GameObjects.Image;
  dayClouds: Phaser.GameObjects.Container;
  city: TitleCity;
  nightWash: Phaser.GameObjects.Rectangle;
  cloudDrift: { fromX: number; toX: number };
};

const normalSunriseDurationMs = 210000;
const cloudDriftMs = 160000;
const fixedSunPeakingElapsedMs = 23675;
const sunTargetYMultiplier = -1.45;

export class TitleScene extends Phaser.Scene {
  private titleStartedAtMs = 0;

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
    const musicReady = loadTitleMusic(this);

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

    let bookmark = loadBookmark();
    const startButton = this.add.text(centerX, safe.y + safe.height * 0.6, t(bookmark ? 'Continue' : 'Start'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(22, size),
      color: '#e8d9b0',
      backgroundColor: '#1a120acc',
      padding: { x: 24, y: 16 },
      align: 'center',
      wordWrap: { width: safe.width },
    }, 'center')).setOrigin(0.5);

    const start = () => {
      if (bookmark && this.scene.get(bookmark.scene)) {
        this.scene.start(bookmark.scene, { spawnX: bookmark.x, spawnY: bookmark.y });
      } else {
        this.scene.start('City');
      }
    };

    const chapters = this.add.text(centerX, safe.y + safe.height * 0.67, t('Chapters ›'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }, 'center')).setOrigin(0.5);

    const journeys = this.add.text(centerX, safe.y + safe.height * 0.74, t('Journeys'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }, 'center')).setOrigin(0.5);

    const skyRewind = this.add.text(centerX, safe.y + safe.height * 0.81, t('Sky Rewind'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }, 'center')).setOrigin(0.5);

    const editor = this.add.text(centerX, safe.y + safe.height * 0.88, t('Map Editor'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(18, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 16, y: 14 },
    }, 'center')).setOrigin(0.5);

    const reset = this.add.text(rtl ? safe.x : safe.right, safe.bottom, t('Reset story'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(14, size), color: '#9c8458',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 14 },
    })).setOrigin(textOriginX(1), 1);

    titleLayer.add([title, subtitle, startButton, chapters, journeys, skyRewind, editor, reset]);
    titleLayer.setAlpha(0);

    this.waitForTitleStart(size, () => {
      this.titleStartedAtMs = performance.now();
      logGameEvent('title start', { width, height });
      void musicReady.then(ready => {
        if (!this.scene.isActive()) return;
        // Without the recorded score, the synthesized ensemble plays instead.
        startTitleMusic(this, ready);
      });

      playTitleBookOpening(this, {
        width,
        height,
        content: titleLayer,
        onComplete: () => {
          const clock = this.startSunriseAnimation(sunrise, height);
          addTitleLanguageButton(this, size, () => this.scene.restart());
          addSunriseTransport(this, size, clock);
          activateTitleTextButton(this, startButton, '#e8d9b0', '#fff1c0', start);
          activateTitleTextButton(this, chapters, '#c9b07a', '#fff1c0', () => this.scene.start('ChapterSelect'));
          activateTitleTextButton(this, journeys, '#c9b07a', '#fff1c0', () => this.scene.start('Journey'));
          activateTitleTextButton(this, skyRewind, '#c9b07a', '#fff1c0', () => {
            window.location.assign('./skyrewind.html');
          });
          activateTitleTextButton(this, editor, '#c9b07a', '#fff1c0', () => this.scene.start('MapEditor', { from: 'Title' }));
          activateTitleTextButton(this, reset, '#9c8458', '#f3d98a', () => {
            resetStory();
            bookmark = undefined;
            reset.setText(t('Reset ✓'));
            startButton.setText(t('Start'));
          });
        },
      });
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

    const city = addTitleCity(this, width, height, cityBaseY);
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
      sunRadius: sunrise.radius,
      horizonY: cityBaseY,
      stars,
      daySky,
      dawnGlow,
      dayClouds,
      city,
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

    const texture = this.createSizedCanvas(key, textureWidth, textureHeight);
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

  private waitForTitleStart(size: { width: number; height: number }, onStart: () => void): void {
    const safe = safeLayout(size);
    const centerX = safe.x + safe.width / 2;
    const centerY = safe.y + safe.height * 0.58;
    const gate = this.add.container(0, 0).setDepth(2000);
    const hitArea = this.add.rectangle(0, 0, size.width, size.height, 0x05030a, 0.38)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });
    const prompt = this.add.text(centerX, centerY, t('Press SPACE or click to begin'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(22, size),
      color: '#f3e2b5',
      backgroundColor: '#1a120acc',
      padding: { x: 24, y: 16 },
      align: 'center',
      wordWrap: { width: Math.min(safe.width, 760) },
    }, 'center')).setOrigin(0.5);
    let started = false;

    gate.add([hitArea, prompt]);

    const pulse = this.tweens.add({
      targets: prompt,
      alpha: 0.68,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    const cleanupKeyboard = () => {
      this.input.keyboard?.off('keydown-SPACE', begin);
      this.input.keyboard?.off('keydown-ENTER', begin);
    };
    const begin = () => {
      if (started) return;

      started = true;
      cleanupKeyboard();
      pulse.stop();
      gate.destroy();
      onStart();
    };

    hitArea.on('pointerdown', begin);
    this.input.keyboard?.once('keydown-SPACE', begin);
    this.input.keyboard?.once('keydown-ENTER', begin);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanupKeyboard);
  }

  /**
   * The dawn star chart, painted once into a canvas texture. As 863
   * individual Arc shapes it dominated the title screen's frame time.
   */
  private addStars(width: number, height: number, horizonY: number): Phaser.GameObjects.Image {
    const widescreenAspect = 16 / 9;
    const horizontalView = Phaser.Math.Clamp((width / height) / widescreenAspect, 0.45, 1);
    const viewLeft = 0.5 - horizontalView / 2;
    const viewRight = 0.5 + horizontalView / 2;
    const scale = Phaser.Math.Clamp(width / 1000, 0.75, 1.35);
    const textureWidth = Math.ceil(width);
    const textureHeight = Math.max(1, Math.ceil(horizonY));
    const key = `title-stars-${textureWidth}x${textureHeight}`;
    const texture = this.createSizedCanvas(key, textureWidth, textureHeight);
    if (!texture) throw new Error(`Unable to create star chart texture: ${key}`);

    const ctx = texture.context;
    for (const [x, y, radius, alpha] of SHIRAZ_EAST_STAR_CHART) {
      if (x < viewLeft || x > viewRight) continue;
      ctx.fillStyle = `rgba(255, 243, 200, ${alpha})`;
      ctx.beginPath();
      ctx.arc(((x - viewLeft) / horizontalView) * width, (y / 0.98) * horizonY, radius * scale, 0, Math.PI * 2);
      ctx.fill();
    }
    texture.refresh();
    return this.add.image(0, 0, key).setOrigin(0);
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
    radius: number;
  } {
    const sunrise = this.add.container(0, 0);
    const backEffects = this.add.container(0, 0).setAlpha(0);
    const sunX = width / 2;
    const sunRadius = Phaser.Math.Clamp(Math.min(width, height) * 0.15, 52, 132);
    const sunY = calculateInitialSunY(
      visibleHorizonY,
      sunRadius,
      height * sunTargetYMultiplier,
      fixedSunPeakingElapsedMs,
      normalSunriseDurationMs,
    );

    for (let i = 5; i >= 1; i -= 1) {
      backEffects.add(this.add.circle(sunX, sunY, sunRadius * (1 + i * 0.38), 0xffb55a, 0.026 + i * 0.006));
    }

    const disk = this.add.circle(sunX, sunY, sunRadius, 0xffc66d, 1);

    sunrise.add(backEffects);
    sunrise.add(disk);

    return { layer: sunrise, disk, effects: [backEffects], centerX: sunX, centerY: sunY, radius: sunRadius };
  }

  /**
   * The sunrise is a pure function of the clock's position, so the transport
   * can play, pause, scrub and change speed without the scene keeping any
   * other timeline of its own.
   */
  private startSunriseAnimation(sunrise: SunriseBackground, height: number): SunriseClock {
    const clock = new SunriseClock(normalSunriseDurationMs);
    const sunTargetY = height * sunTargetYMultiplier;
    const sunStartedAtMs = performance.now();
    const normalSunPeakingMs = calculateSunPeakingElapsedMs(sunrise, sunTargetY, clock.durationMs);
    let loggedSunPeaking = false;
    const logSunPeaking = () => {
      if (loggedSunPeaking) return;

      loggedSunPeaking = true;
      const now = performance.now();
      logGameEvent('sun peaking', {
        sunriseElapsedMs: Math.round(clock.position),
        realSunriseElapsedMs: Math.round(now - sunStartedAtMs),
        titleElapsedMs: Math.round(now - this.titleStartedAtMs),
        normalSunriseElapsedMs: Math.round(normalSunPeakingMs),
        fixedSunriseElapsedMs: fixedSunPeakingElapsedMs,
      });
    };
    const render = () => {
      sunrise.sun.y = sunTargetY * sineInOut(clock.progress);
      sunrise.dayClouds.x = cloudDriftX(sunrise.cloudDrift, clock.position);
      this.applySunriseLighting(sunrise);

      if (isSunPeakingOverHorizon(sunrise)) {
        logSunPeaking();
      }
    };
    const tick = (_time: number, deltaMs: number) => clock.tick(deltaMs);

    clock.onChange(render);
    this.events.on(Phaser.Scenes.Events.UPDATE, tick);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.events.off(Phaser.Scenes.Events.UPDATE, tick));
    render();

    return clock;
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
    sunrise.city.setLight(daylight.cityLightAmount);
    sunrise.dayClouds.setAlpha(daylight.cloudAlpha);
    sunrise.nightWash.setAlpha(daylight.nightWashAlpha);
  }

  private addHorizonGlow(width: number, height: number, horizonY: number): Phaser.GameObjects.Image {
    const textureWidth = Math.ceil(width);
    const textureHeight = Math.ceil(height);
    const key = `title-horizon-light-${textureWidth}x${textureHeight}`;

    const texture = this.createSizedCanvas(key, textureWidth, textureHeight);
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
    const ctx = texture.context;
    ctx.fillStyle = 'rgba(255, 188, 109, 0.16)';
    ctx.beginPath();
    ctx.ellipse(width / 2, horizonY + height * 0.04, width * 0.46, height * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(94, 49, 64, 0.24)';
    ctx.beginPath();
    ctx.ellipse(width / 2, horizonY + height * 0.12, width * 0.56, height * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    texture.refresh();

    return this.add.image(0, 0, key).setOrigin(0).setDisplaySize(width, height);
  }

  /**
   * Canvas textures here are sized to the screen, so each resize would leave
   * the previous size behind. Replace any stale copy and free it on shutdown.
   */
  private createSizedCanvas(key: string, width: number, height: number): Phaser.Textures.CanvasTexture | null {
    if (this.textures.exists(key)) this.textures.remove(key);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.textures.exists(key)) this.textures.remove(key);
    });
    return this.textures.createCanvas(key, width, height);
  }

  private colorToCss(color: number): string {
    return `#${color.toString(16).padStart(6, '0')}`;
  }
}

/** Phaser's `Sine.easeInOut`, which the sun's climb has always followed. */
function sineInOut(progress: number): number {
  return (1 - Math.cos(Phaser.Math.Clamp(progress, 0, 1) * Math.PI)) / 2;
}

/** The clouds drift across and back, easing at each turn. */
function cloudDriftX(drift: { fromX: number; toX: number }, positionMs: number): number {
  const phase = (positionMs / cloudDriftMs) % 2;
  const leg = phase <= 1 ? phase : 2 - phase;
  return drift.fromX + (drift.toX - drift.fromX) * sineInOut(leg);
}

function calculateInitialSunY(
  horizonY: number,
  sunRadius: number,
  sunTargetY: number,
  fixedPeakingElapsedMs: number,
  durationMs: number,
): number {
  const peakingTweenY = sunTargetY * sineInOut(fixedPeakingElapsedMs / durationMs);

  return horizonY + sunRadius - peakingTweenY;
}

function calculateSunPeakingElapsedMs(
  sunrise: SunriseBackground,
  sunTargetY: number,
  durationMs: number,
): number {
  const peakingY = sunrise.horizonY + sunrise.sunRadius - sunrise.sunCenterY;
  const easedProgress = Phaser.Math.Clamp(peakingY / sunTargetY, 0, 1);
  const linearProgress = Math.acos(1 - 2 * easedProgress) / Math.PI;

  return linearProgress * durationMs;
}

function isSunPeakingOverHorizon(sunrise: SunriseBackground): boolean {
  const sunTopY = sunrise.sunCenterY + sunrise.sun.y - sunrise.sunRadius;

  return sunTopY <= sunrise.horizonY;
}
