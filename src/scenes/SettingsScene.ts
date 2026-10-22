import Phaser from 'phaser';
import { addAudioControls } from '../ui/audioControls';
import { isDebugOverlayVisible, setDebugOverlayVisible } from '../ui/debugOverlay';
import { resetStory } from '../dialogue/progress';
import { localizedStyle, rtl, t, textOriginX } from '../i18n';
import { addLanguageDropdown } from '../ui/languageDropdown';
import { buttonFont, isNarrowLayout, MIN_TOUCH_TARGET, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';

interface SettingsLaunch {
  [key: string]: unknown;
  from?: string;
  spawnX?: number;
  spawnY?: number;
}

export class SettingsScene extends Phaser.Scene {
  private fromKey = 'City';
  private spawnX?: number;
  private spawnY?: number;

  constructor() {
    super('Settings');
  }

  init(data: SettingsLaunch): void {
    this.fromKey = data.from ?? 'City';
    this.spawnX = data.spawnX;
    this.spawnY = data.spawnY;
  }

  create(): void {
    restartSceneOnResize(this, () => this.launchData());

    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    const narrow = isNarrowLayout(size);
    const panelW = Math.min(narrow ? safe.width : 520, safe.width);
    const panelH = Math.min(safe.height, narrow ? 680 : 700);
    const panelX = safe.x + (safe.width - panelW) / 2;
    const panelY = safe.y + (safe.height - panelH) / 2;
    const contentX = panelX + panelW / 2;

    this.add.rectangle(0, 0, width, height, 0x000000, 0.62).setOrigin(0);
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a120a, 0.97)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    this.add.text(contentX, panelY + 24, t('Settings'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(34, size, 24),
      color: '#f3d98a',
      align: 'center',
    }, 'center')).setOrigin(0.5, 0);

    const labelY = panelY + (narrow ? 62 : 92);
    this.add.text(contentX, labelY, t('Language'), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(18, size, 14),
      color: '#e8d9b0',
      align: 'center',
    }, 'center')).setOrigin(0.5, 0);

    const dropdownW = Math.min(168, panelW - 56);
    addLanguageDropdown(this, {
      x: contentX - dropdownW / 2,
      y: labelY + 30,
      buttonWidth: dropdownW,
      menuWidth: dropdownW,
      size,
      depth: 30000,
      onChange: () => this.applyLanguage(),
    });

    const helpBoxX = panelX + 28;
    const helpBoxW = panelW - 56;
    const audioY = labelY + (narrow ? 74 : 84);
    const audioH = addAudioControls(this, helpBoxX, audioY, helpBoxW, size);
    const helpY = audioY + audioH + (narrow ? 10 : 16);
    const buttonW = Math.min(280, panelW - 56);
    const buttonX = panelX + (panelW - buttonW) / 2;
    const buttonGap = narrow ? 8 : 12;
    const buttonAreaH = MIN_TOUCH_TARGET * 4 + buttonGap * 3;
    const latestButtonStartY = panelY + panelH - (narrow ? 8 : 24) - buttonAreaH;
    const buttonStartY = Math.min(helpY + (narrow ? 132 : 100), latestButtonStartY);
    const helpBoxH = Math.max(0, buttonStartY - helpY - 10);
    const helpTextX = rtl ? helpBoxX + helpBoxW - 16 : helpBoxX + 16;
    const helpOrigin = textOriginX(0);
    const helpLines = helpBoxH < 128
      ? [
          t('Move with WASD or arrow keys, or click where you want to walk.'),
          t('Press E near people and marked places to interact.'),
        ]
      : [
          t('Move with WASD or arrow keys, or click where you want to walk.'),
          t('Press E near people and marked places to interact.'),
          t('Use H or hold Tab to highlight things you can interact with.'),
          t('Open the journal with J.'),
          t('Open settings with Esc.'),
        ];

    if (helpBoxH >= 48) {
      this.add.rectangle(helpBoxX, helpY, helpBoxW, helpBoxH, 0x24180e, 0.72)
        .setOrigin(0)
        .setStrokeStyle(1, 0x5a4428, 1);
      this.add.text(contentX, helpY + 10, t('How to Play'), localizedStyle({
        fontFamily: 'Georgia, serif',
        fontSize: responsiveFont(18, size, 14),
        color: '#f3d98a',
        align: 'center',
      }, 'center')).setOrigin(0.5, 0);
      this.add.text(helpTextX, helpY + (helpBoxH < 128 ? 32 : 42), helpLines.join('\n'), localizedStyle({
        fontFamily: 'Georgia, serif',
        fontSize: responsiveFont(narrow ? 13 : 14, size, 12),
        color: '#d8c28d',
        wordWrap: { width: helpBoxW - 32 },
      })).setOrigin(helpOrigin, 0);
    }

    let y = buttonStartY;

    this.makeButton(buttonX, y, buttonW, t('Back to Game'), () => this.close());
    y += MIN_TOUCH_TARGET + buttonGap;
    this.makeButton(buttonX, y, buttonW, t('Chapter Select'), () => this.openChapterSelect());
    y += MIN_TOUCH_TARGET + buttonGap;
    this.makeButton(buttonX, y, buttonW, t('Back to Title'), () => this.goToTitle(false));
    y += MIN_TOUCH_TARGET + buttonGap;
    this.makeButton(buttonX, y, buttonW, t('Restart'), () => this.goToTitle(true), '#d7a15c');

    this.addDebugToggle(panelX + panelW - 14, panelY + 14, size);

    this.input.keyboard?.once('keydown-ESC', () => this.close());
  }

  /** Small corner toggle for the developer console and FPS counter. */
  private addDebugToggle(right: number, top: number, size: { width: number; height: number }): void {
    const label = (): string => (isDebugOverlayVisible() ? t('Debug ✓') : t('Debug'));
    const toggle = this.add.text(right, top, label(), localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: responsiveFont(12, size, 11),
      color: '#9c8458',
      padding: { x: 6, y: 6 },
    })).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    toggle.on('pointerdown', () => {
      setDebugOverlayVisible(!isDebugOverlayVisible());
      toggle.setText(label());
    });
  }

  private launchData(): SettingsLaunch {
    return {
      from: this.fromKey,
      spawnX: this.spawnX,
      spawnY: this.spawnY,
    };
  }

  /**
   * Rebuilds the paused map underneath in the new language straight away
   * (keeping it paused behind this panel), then this panel itself.
   */
  private applyLanguage(): void {
    const map = this.scene.get(this.fromKey);
    map.events.once(Phaser.Scenes.Events.CREATE, () => {
      map.scene.pause();
      this.scene.bringToTop();
    });
    map.scene.restart({ spawnX: this.spawnX, spawnY: this.spawnY });
    this.scene.restart(this.launchData());
  }

  private close(): void {
    this.scene.stop();
    this.scene.resume(this.fromKey);
  }

  private openChapterSelect(): void {
    this.scene.launch('ChapterSelect', {
      returnToGameScene: this.fromKey,
      returnSpawnX: this.spawnX,
      returnSpawnY: this.spawnY,
    });
    this.scene.bringToTop('ChapterSelect');
    this.scene.stop();
  }

  private goToTitle(restart: boolean): void {
    if (restart) resetStory();
    this.scene.stop();
    this.scene.stop(this.fromKey);
    this.scene.start('Title');
  }

  private makeButton(
    x: number,
    y: number,
    width: number,
    label: string,
    onClick: () => void,
    color = '#c9b07a',
  ): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(x, y, width, MIN_TOUCH_TARGET, 0x2a1c10, 0.86)
      .setOrigin(0)
      .setStrokeStyle(1, 0x5a4428, 1)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x + width / 2, y + MIN_TOUCH_TARGET / 2, label, localizedStyle({
      fontFamily: 'Georgia, serif',
      fontSize: buttonFont(16, this.scale),
      color,
      align: 'center',
      wordWrap: { width: width - 24 },
    }, 'center')).setOrigin(0.5);

    bg
      .on('pointerover', () => {
        bg.setStrokeStyle(1, 0xf3d98a, 1);
        text.setColor('#fff1c0');
      })
      .on('pointerout', () => {
        bg.setStrokeStyle(1, 0x5a4428, 1);
        text.setColor(color);
      })
      .on('pointerdown', onClick);

    return this.add.container(0, 0, [bg, text]);
  }
}
