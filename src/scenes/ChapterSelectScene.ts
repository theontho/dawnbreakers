import Phaser from 'phaser';
import { chapters, type Chapter } from '../data/chapters';
import { getFlags } from '../dialogue/flags';
import { resetStory } from '../dialogue/progress';
import { chapterLabel, localizedStyle, rtl, t, textOriginX } from '../i18n';
import { buttonFont, isNarrowLayout, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';

interface ChapterSelectLaunch {
  [key: string]: unknown;
  returnToGameScene?: string;
  returnSpawnX?: number;
  returnSpawnY?: number;
  restartReturnScene?: boolean;
}

/**
 * A grid view of all chapters. Click any chapter to jump straight into it.
 * Reachable from the title screen, settings, and the Chapter-End card.
 */
export class ChapterSelectScene extends Phaser.Scene {
  private returnToGameScene?: string;
  private returnSpawnX?: number;
  private returnSpawnY?: number;
  private restartReturnScene = false;

  constructor() { super('ChapterSelect'); }

  init(data: ChapterSelectLaunch = {}): void {
    this.returnToGameScene = data.returnToGameScene;
    this.returnSpawnX = data.returnSpawnX;
    this.returnSpawnY = data.returnSpawnY;
    this.restartReturnScene = data.restartReturnScene ?? false;
  }

  create(): void {
    restartSceneOnResize(this, () => this.launchData());
    this.scene.bringToTop();

    const { width, height } = this.scale;
    const size = { width, height };
    const narrow = isNarrowLayout(size);
    const safe = safeLayout(size);
    const centerX = safe.x + safe.width / 2;

    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0);

    this.add.text(centerX, safe.y + 42, t('Chapters'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(54, size, 32), color: '#f3e2b5',
    }, 'center')).setOrigin(0.5);
    this.add.text(centerX, safe.y + 88, t('Choose where to begin. What you have learned and chosen carries forward.'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 12), color: '#9c8458', fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: safe.width },
    }, 'center')).setOrigin(0.5);

    const flags = getFlags();
    const cardW = Math.min(900, safe.width);
    const cardH = narrow ? 132 : 100;
    const gap = narrow ? 10 : 14;
    const viewportY = safe.y + 132;
    const viewportH = Math.max(180, safe.bottom - viewportY - (this.returnToGameScene ? 132 : 104));
    const contentH = chapters.length * (cardH + gap) - gap;
    const maxScroll = Math.max(0, contentH - viewportH);
    let scrollY = 0;

    const list = this.add.container(centerX - cardW / 2, viewportY);
    const maskShape = this.add.rectangle(safe.x, viewportY, safe.width, viewportH, 0xffffff, 0)
      .setOrigin(0);
    list.setMask(maskShape.createGeometryMask());
    maskShape.setVisible(false);

    chapters.forEach((ch, i) => {
      const y = i * (cardH + gap);
      this.drawChapterCard(list, 0, y, cardW, cardH, ch, ch.isComplete(flags));
    });

    const track = this.add.rectangle(safe.right - Math.max(8, safe.margin * 0.4), viewportY, 6, viewportH, 0x2a1c10, 0.85)
      .setOrigin(0.5, 0);
    const thumbH = maxScroll > 0
      ? Math.max(44, viewportH * (viewportH / contentH))
      : viewportH;
    const thumb = this.add.rectangle(track.x, viewportY, 10, thumbH, 0xc9a55c, 0.9)
      .setOrigin(0.5, 0);
    track.setVisible(maxScroll > 0);
    thumb.setVisible(maxScroll > 0);

    const setScroll = (value: number) => {
      scrollY = Phaser.Math.Clamp(value, 0, maxScroll);
      list.y = viewportY - scrollY;
      if (maxScroll > 0) {
        thumb.y = viewportY + (viewportH - thumbH) * (scrollY / maxScroll);
      }
    };

    this.input.on('wheel', (
      _pointer: Phaser.Input.Pointer,
      _gameObjects: Phaser.GameObjects.GameObject[],
      _deltaX: number,
      deltaY: number,
    ) => setScroll(scrollY + deltaY * 0.6));

    this.input.keyboard?.on('keydown-UP', () => setScroll(scrollY - 70));
    this.input.keyboard?.on('keydown-DOWN', () => setScroll(scrollY + 70));
    this.input.keyboard?.on('keydown-PAGE_UP', () => setScroll(scrollY - viewportH));
    this.input.keyboard?.on('keydown-PAGE_DOWN', () => setScroll(scrollY + viewportH));

    if (maxScroll > 0) {
      this.add.text(centerX, safe.bottom - (this.returnToGameScene ? 104 : 60), t('Scroll for later chapters'), localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(13, size, 11), color: '#9c8458', fontStyle: 'italic',
      }, 'center')).setOrigin(0.5);
    }

    // Footer controls
    const footerY = safe.bottom - 24;
    const footerOffset = narrow ? Math.min(90, safe.width * 0.26) : 118;
    if (this.returnToGameScene) {
      this.makeTextButton(centerX, safe.bottom - 66, t('Back to Game'),
        () => this.backToGame()).setOrigin(0.5);
    }
    this.makeTextButton(centerX - footerOffset, footerY, t('Back to Title'),
      () => this.goToTitle()).setOrigin(0.5);
    this.makeTextButton(centerX + footerOffset, footerY, t('Reset Story'),
      () => this.resetStory()).setOrigin(0.5);
  }

  private launchData(): ChapterSelectLaunch {
    return {
      returnToGameScene: this.returnToGameScene,
      returnSpawnX: this.returnSpawnX,
      returnSpawnY: this.returnSpawnY,
      restartReturnScene: this.restartReturnScene,
    };
  }

  private drawChapterCard(
    list: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number,
    chapter: Chapter, completed: boolean,
  ): void {
    const card = this.add.rectangle(x, y, w, h, 0x1a120a, 0.95)
      .setOrigin(0)
      .setStrokeStyle(2, completed ? 0xc9a55c : 0x4a3a22, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => card.setStrokeStyle(2, 0xf3d98a, 1))
      .on('pointerout',  () => card.setStrokeStyle(2, completed ? 0xc9a55c : 0x4a3a22, 1))
      .on('pointerdown', () => this.startChapter(chapter));
    list.add(card);

    const textX = rtl ? x + w - 24 : x + 24;
    const originX = textOriginX(0);
    list.add(this.add.text(textX, y + 14, chapterLabel(chapter.number), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, this.scale), color: '#9c8458', fontStyle: 'italic',
    })).setOrigin(originX, 0));
    list.add(this.add.text(textX, y + 30, t(chapter.title), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(24, this.scale, 17), color: '#f3e2b5',
      wordWrap: { width: w - 48 },
    })).setOrigin(originX, 0));
    list.add(this.add.text(textX, y + 60, `${t(chapter.subtitle)}  ·  ${t(chapter.description)}`, localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(13, this.scale), color: '#c9b07a',
      wordWrap: { width: w - (w < 620 ? 48 : 220) },
    })).setOrigin(originX, 0));

    if (completed) {
      list.add(this.add.text(rtl ? x + 24 : x + w - 24, y + h / 2, `✓ ${t('completed')}`, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, this.scale), color: '#c9a55c', fontStyle: 'italic',
      })).setOrigin(textOriginX(1), 0.5));
    }
  }

  private startChapter(chapter: Chapter): void {
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      if (this.returnToGameScene) this.scene.stop(this.returnToGameScene);
      this.scene.start(chapter.startScene, {
        spawnX: chapter.startSpawnX,
        spawnY: chapter.startSpawnY,
      });
    });
  }

  private backToGame(): void {
    const returnScene = this.returnToGameScene;
    if (!returnScene) return;

    this.scene.stop();
    if (!this.restartReturnScene) {
      this.scene.resume(returnScene);
      return;
    }

    this.scene.stop(returnScene);
    this.scene.start(returnScene, {
      spawnX: this.returnSpawnX,
      spawnY: this.returnSpawnY,
    });
  }

  private goToTitle(): void {
    if (this.returnToGameScene) this.scene.stop(this.returnToGameScene);
    this.scene.start('Title');
  }

  private resetStory(): void {
    resetStory();
    if (this.returnToGameScene) this.scene.stop(this.returnToGameScene);
    this.scene.restart();
  }

  private makeTextButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(15, this.scale), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 14, y: 14 },
    }, 'center'))
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => button.setColor('#fff1c0'))
      .on('pointerout',  () => button.setColor('#c9b07a'))
      .on('pointerdown', onClick);
    return button;
  }
}
