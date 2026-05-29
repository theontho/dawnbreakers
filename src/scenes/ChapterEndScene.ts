import Phaser from 'phaser';
import { chapterById, nextChapter } from '../data/chapters';
import { buttonFont, responsiveFont, responsiveMargin, restartSceneOnResize } from '../ui/responsive';

/**
 * A modal card shown when a chapter is freshly completed. Lets the player
 * continue straight to the next chapter, jump to the selector, or stay
 * where they are.
 */
export class ChapterEndScene extends Phaser.Scene {
  private chapterId!: string;
  private fromKey = 'City';

  constructor() { super('ChapterEnd'); }

  init(data: { chapterId: string; from?: string }): void {
    this.chapterId = data.chapterId;
    this.fromKey = data.from ?? 'City';
  }

  create(): void {
    restartSceneOnResize(this, () => ({ chapterId: this.chapterId, from: this.fromKey }));

    const { width, height } = this.scale;
    const size = { width, height };
    const margin = responsiveMargin(size);
    const chapter = chapterById(this.chapterId);
    if (!chapter) { this.scene.stop(); return; }
    const next = nextChapter(chapter);

    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const cardW = Math.min(700, width - margin * 2);
    const cardH = Math.min(400, height - margin * 2);
    const cx = width / 2, cy = height / 2;
    this.add.rectangle(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 0x1a120a, 0.98)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    this.add.text(cx, cy - 130, `Chapter ${chapter.number} Complete`, {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(22, size, 14), color: '#c9a55c', fontStyle: 'italic',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 88, chapter.title, {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(34, size, 22), color: '#f3e2b5',
      align: 'center',
      wordWrap: { width: cardW - 48 },
    }).setOrigin(0.5);
    this.add.text(cx, cy - 48, chapter.subtitle, {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 12), color: '#9c8458', fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: cardW - 48 },
    }).setOrigin(0.5);

    let buttonY = cy + 30;
    if (next) {
      let continuing = false;
      const continueToNext = () => {
        if (continuing) return;
        continuing = true;
        this.gotoScene(next.startScene, next.startSpawnX, next.startSpawnY);
      };

      this.makeButton(cx, buttonY,
        `Continue to Chapter ${next.number}: ${next.title}  ›`,
        continueToNext);
      this.input.keyboard?.once('keydown-ENTER', continueToNext);
      this.input.keyboard?.once('keydown-SPACE', continueToNext);
      buttonY += 62;
    } else {
      this.add.text(cx, cy + 10, 'You have reached the end of the current content.', {
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(15, size, 12), color: '#e8d9b0', fontStyle: 'italic',
        align: 'center',
        wordWrap: { width: cardW - 48 },
      }).setOrigin(0.5);
      buttonY = cy + 60;
    }

    this.makeButton(cx, buttonY, 'Chapter Select',
      () => this.gotoScene('ChapterSelect'));
    this.makeButton(cx, buttonY + 56, 'Stay here',
      () => { this.scene.stop(); this.scene.resume(this.fromKey); });
  }

  private gotoScene(key: string, spawnX?: number, spawnY?: number): void {
    this.scene.stop(this.fromKey);
    this.scene.stop();
    this.scene.start(key, { spawnX, spawnY });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: buttonFont(17, this.scale), color: '#f3d98a',
      backgroundColor: '#2a1c10', padding: { x: 16, y: 14 },
      align: 'center',
      wordWrap: { width: this.scale.width - responsiveMargin(this.scale) * 2 - 48 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => t.setColor('#fff1c0'))
      .on('pointerout',  () => t.setColor('#f3d98a'))
      .on('pointerdown', onClick);
    return t;
  }
}
