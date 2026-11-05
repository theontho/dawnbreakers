import Phaser from 'phaser';
import { playMusic, playSfx } from '../audio';
import { chapterById, nextChapter, type ChapterId } from '../data/chapters';
import { journeyBetween } from '../data/journeys';
import { localizedStyle, t } from '../i18n';
import { buttonFont, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';

/**
 * A modal card shown when a chapter is freshly completed. Lets the player
 * continue straight to the next chapter, jump to the selector, or stay
 * where they are.
 */
export class ChapterEndScene extends Phaser.Scene {
  private chapterId!: ChapterId;
  private fromKey = 'City';

  constructor() { super('ChapterEnd'); }

  init(data: { chapterId: ChapterId; from?: string }): void {
    this.chapterId = data.chapterId;
    this.fromKey = data.from ?? 'City';
  }

  create(): void {
    playSfx('chapterComplete');
    playMusic('hope');
    restartSceneOnResize(this, () => ({ chapterId: this.chapterId, from: this.fromKey }));

    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    const chapter = chapterById(this.chapterId);
    if (!chapter) { this.scene.stop(); return; }
    const next = nextChapter(chapter);

    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const cardW = Math.min(700, safe.width);
    const cardH = Math.min(400, safe.height);
    const cx = safe.x + safe.width / 2, cy = safe.y + safe.height / 2;
    this.add.rectangle(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 0x1a120a, 0.98)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    this.add.text(cx, cy - 130, t('Chapter {number} Complete', { number: chapter.number }), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(22, size, 14), color: '#c9a55c', fontStyle: 'italic',
    }, 'center')).setOrigin(0.5);
    this.add.text(cx, cy - 88, t(chapter.title), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(34, size, 22), color: '#f3e2b5',
      align: 'center',
      wordWrap: { width: cardW - 48 },
    }, 'center')).setOrigin(0.5);
    this.add.text(cx, cy - 48, t(chapter.subtitle), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 12), color: '#9c8458', fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: cardW - 48 },
    }, 'center')).setOrigin(0.5);

    let buttonY = cy + 30;
    if (next) {
      let continuing = false;
      const continueToNext = () => {
        if (continuing) return;
        continuing = true;
        // The road between the chapters plays first, when there is one.
        const journey = journeyBetween(chapter.id, next.id);
        const onward = { scene: next.startScene, spawnX: next.startSpawnX, spawnY: next.startSpawnY };
        if (journey) this.gotoScene('Journey', { journeyId: journey.id, onward });
        else this.gotoScene(next.startScene, { spawnX: onward.spawnX, spawnY: onward.spawnY });
      };

      this.makeButton(cx, buttonY,
        t('Continue to Chapter {number}: {title}  ›', { number: next.number, title: t(next.title) }),
        continueToNext);
      this.input.keyboard?.once('keydown-ENTER', continueToNext);
      this.input.keyboard?.once('keydown-SPACE', continueToNext);
      buttonY += 62;
    } else {
      // The epilogue was the pilgrim's testimony; Nabíl, who was not on that road, gathered such testimony for real.
      const nabil = t('In 1888 Nabíl-i-Zarandí began to write this history. He asked those who had been there, and where they disagreed, he wrote that down too. What you said on the road is what you would have told him.');
      const ending = t('Here ends this telling of The Dawn-Breakers. The dawn it witnessed is still rising.');
      this.add.text(cx, cy + 28, `${nabil}\n\n${ending}`, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, size, 11), color: '#e8d9b0', fontStyle: 'italic',
        align: 'center',
        wordWrap: { width: cardW - 56 },
      }, 'center')).setOrigin(0.5);
      buttonY = cy + 106;
    }

    this.makeButton(cx, buttonY, t('Chapter Select'),
      () => this.openChapterSelect());
    this.makeButton(cx, buttonY + 56, t('Stay here'),
      () => { this.scene.stop(); this.scene.resume(this.fromKey); });
  }

  private gotoScene(key: string, data: object): void {
    this.scene.stop(this.fromKey);
    this.scene.stop();
    this.scene.start(key, data);
  }

  private openChapterSelect(): void {
    this.scene.stop();
    this.scene.start('ChapterSelect', { returnToGameScene: this.fromKey });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const button = this.add.text(x, y, label, localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(17, this.scale), color: '#f3d98a',
      backgroundColor: '#2a1c10', padding: { x: 16, y: 14 },
      align: 'center',
      wordWrap: { width: Math.max(120, safeLayout(this.scale).width - 48) },
    }, 'center'))
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => button.setColor('#fff1c0'))
      .on('pointerout',  () => button.setColor('#f3d98a'))
      .on('pointerdown', onClick);
    return button;
  }
}
