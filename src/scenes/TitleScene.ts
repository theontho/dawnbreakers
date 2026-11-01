import Phaser from 'phaser';
import { followSunrise, loadTitleMusic, startTitleMusic, type TitleMusic } from './titleMusic';
import { loadBookmark, resetStory } from '../dialogue/progress';
import { localizedStyle, t } from '../i18n';
import { logGameEvent } from '../logging/gameLogger';
import {
  buttonFont, isNarrowLayout, MIN_TOUCH_TARGET, responsiveFont, restartSceneOnResize, safeLayout, visibleGameHeight,
} from '../ui/responsive';
import { activateTitleTextButton, addTitleLanguageButton } from './titleControls';
import { playTitleBookOpening } from './titleBookOpening';
import { addSunriseBackground, playSunrise, SUNRISE_DURATION_MS } from './titleSunrise';
import { SunriseClock, type SunriseClockState } from './titleSunriseClock';
import { addGitHubLink, addMenuButton, layoutMenu, MENU_COLORS, type MenuTone } from './titleMenu';
import { addSunriseTransport } from './titleTransport';

/**
 * Carried across a restart of the title (a resize or a change of language)
 * once the sunrise is playing, so it comes back at the same moment, with the
 * music where it was, instead of at the "press to begin" gate.
 */
type TitleResume = { clock: SunriseClockState; musicLeadSeconds: number };

const REPO_URL = 'https://github.com/theontho/dawnbreakers';

/** A soft dark halo that keeps the title legible over night and noon sky alike. */
const TITLE_SHADOW = { offsetX: 0, offsetY: 2, color: '#120b05', blur: 10, fill: true, stroke: false };

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

    // On a phone held sideways the canvas's foot runs off the screen, and the
    // menu lives at the foot: lay the title out on what shows.
    const { width } = this.scale;
    const height = visibleGameHeight(this.scale.height);

    const size = { width, height };
    const safe = safeLayout(size);
    const centerX = safe.x + safe.width / 2;
    const narrow = isNarrowLayout(size);

    const sunrise = addSunriseBackground(this, width, height);
    const musicReady = loadTitleMusic(this);

    const titleLayer = this.add.container(0, 0);

    // The title keeps to the band under the transport and language buttons,
    // and the menu to the fields below the city, so the sun has the sky.
    const titleTop = safe.y + MIN_TOUCH_TARGET + (narrow ? 16 : 28);
    const title = this.add.text(centerX, titleTop, t('The Dawn-Breakers'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(narrow ? 52 : 68, size, 32),
      color: '#f3e2b5',
      align: 'center',
      wordWrap: { width: Math.min(safe.width, 900) },
      shadow: TITLE_SHADOW,
    }, 'center')).setOrigin(0.5, 0);

    const subtitle = this.add.text(centerX, title.y + title.height + 4, t('Shíráz, the eve of 23 May 1844'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(22, size, 15),
      color: '#e2c98f',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: Math.min(safe.width, 720) },
      shadow: TITLE_SHADOW,
    }, 'center')).setOrigin(0.5, 0);

    let bookmark = loadBookmark();
    const startButton = addMenuButton(this, size, t(bookmark ? 'Continue' : 'Start'), 'primary');
    const chapters = addMenuButton(this, size, t('Chapters ›'), 'secondary');
    const journeys = addMenuButton(this, size, t('Journeys'), 'secondary');
    const miniGames = addMenuButton(this, size, t('Mini-games'), 'secondary');
    const editor = addMenuButton(this, size, t('Map Editor'), 'secondary');
    const reset = addMenuButton(this, size, t('Reset story'), 'quiet');
    const source = addGitHubLink(this, REPO_URL);
    layoutMenu([[startButton], [chapters, journeys, miniGames, editor, reset, source]], safe);

    const start = () => {
      if (bookmark && this.scene.get(bookmark.scene)) {
        this.scene.start(bookmark.scene, { spawnX: bookmark.x, spawnY: bookmark.y });
      } else {
        this.scene.start('City');
      }
    };

    titleLayer.add([title, subtitle, startButton, chapters, journeys, miniGames, editor, reset, source]);

    const showMenu = (clock: SunriseClock) => {
      this.clock = clock;
      playSunrise(this, sunrise, clock, this.titleStartedAtMs);
      addTitleLanguageButton(this, size, () => this.scene.restart(this.resumeData()));
      addSunriseTransport(this, size, clock);
      this.followMusic();
      const activate = (button: Phaser.GameObjects.Text, tone: MenuTone, onClick: () => void) =>
        activateTitleTextButton(this, button, MENU_COLORS[tone].normal, MENU_COLORS[tone].hover, onClick);
      activate(startButton, 'primary', start);
      activate(chapters, 'secondary', () => this.scene.start('ChapterSelect'));
      activate(journeys, 'secondary', () => this.scene.start('Journey'));
      activate(miniGames, 'secondary', () => this.scene.start('MiniGamePicker'));
      activate(editor, 'secondary', () => this.scene.start('MapEditor', { from: 'Title' }));
      activate(reset, 'quiet', () => {
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
    this.waitForTitleStart(size, startButton.y, () => {
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

  /** The "press to begin" prompt, where the start button will appear. */
  private waitForTitleStart(size: { width: number; height: number }, promptY: number, onStart: () => void): void {
    const safe = safeLayout(size);
    const centerX = safe.x + safe.width / 2;
    const centerY = promptY;
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
