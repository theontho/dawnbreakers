import Phaser from 'phaser';
import { followSunrise, loadTitleMusic, startTitleMusic, type TitleMusic } from './titleMusic';
import { loadBookmark, resetStory } from '../dialogue/progress';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { logGameEvent } from '../logging/gameLogger';
import { buttonFont, isNarrowLayout, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';
import { activateTitleTextButton, addTitleLanguageButton } from './titleControls';
import { playTitleBookOpening } from './titleBookOpening';
import { addSunriseBackground, playSunrise, SUNRISE_DURATION_MS } from './titleSunrise';
import { SunriseClock, type SunriseClockState } from './titleSunriseClock';
import { addSunriseTransport } from './titleTransport';

/**
 * Carried across a restart of the title (a resize or a change of language)
 * once the sunrise is playing, so it comes back at the same moment, with the
 * music where it was, instead of at the "press to begin" gate.
 */
type TitleResume = { clock: SunriseClockState; musicLeadSeconds: number };

export class TitleScene extends Phaser.Scene {
  private titleStartedAtMs = 0;
  private clock?: SunriseClock;
  private music?: TitleMusic;
  private musicLeadSeconds?: number;

  constructor() {
    super('Title');
  }

  create(data: { resume?: TitleResume } = {}): void {
    const { resume } = data;
    this.clock = undefined;
    this.music = undefined;
    this.musicLeadSeconds = resume?.musicLeadSeconds;
    restartSceneOnResize(this, () => this.resumeData());

    const { width, height } = this.scale;

    const size = { width, height };
    const safe = safeLayout(size);
    const centerX = safe.x + safe.width / 2;
    const narrow = isNarrowLayout(size);

    const sunrise = addSunriseBackground(this, width, height);
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

    const showMenu = (clock: SunriseClock) => {
      this.clock = clock;
      playSunrise(this, sunrise, clock, this.titleStartedAtMs);
      addTitleLanguageButton(this, size, () => this.scene.restart(this.resumeData()));
      addSunriseTransport(this, size, clock);
      this.followMusic();
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
    };
    const startMusic = (fromSeconds: number) => {
      void musicReady.then(ready => {
        if (!this.scene.isActive()) return;
        // Without the recorded score, the synthesized ensemble plays instead.
        this.music = startTitleMusic(this, ready, fromSeconds);
        this.followMusic();
      });
    };

    if (resume) {
      this.titleStartedAtMs = performance.now();
      const clock = new SunriseClock(SUNRISE_DURATION_MS, resume.clock);
      showMenu(clock);
      startMusic(resume.musicLeadSeconds + clock.position / 1000);
      return;
    }

    titleLayer.setAlpha(0);
    this.waitForTitleStart(size, () => {
      this.titleStartedAtMs = performance.now();
      logGameEvent('title start', { width, height });
      startMusic(0);
      playTitleBookOpening(this, {
        width,
        height,
        content: titleLayer,
        onComplete: () => showMenu(new SunriseClock(SUNRISE_DURATION_MS)),
      });
    });
  }

  /** Once both the music and the sunrise are going, keep them together. */
  private followMusic(): void {
    const { clock, music } = this;
    if (!clock || !music) return;
    this.musicLeadSeconds ??= music.seconds - clock.position / 1000;
    followSunrise(music, clock, this.musicLeadSeconds);
    if (!clock.isPlaying) music.pause();
  }

  private resumeData(): { resume?: TitleResume } {
    if (!this.clock) return {};
    return { resume: { clock: this.clock.state, musicLeadSeconds: this.musicLeadSeconds ?? 0 } };
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
}
