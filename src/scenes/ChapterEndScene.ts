import Phaser from 'phaser';
import { chapterById, nextChapter } from '../data/chapters';

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
    const { width, height } = this.scale;
    const chapter = chapterById(this.chapterId);
    if (!chapter) { this.scene.stop(); return; }
    const next = nextChapter(chapter);

    this.add.rectangle(0, 0, width, height, 0x000000, 0.85).setOrigin(0);

    const cardW = 700, cardH = 360;
    const cx = width / 2, cy = height / 2;
    this.add.rectangle(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 0x1a120a, 0.98)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    this.add.text(cx, cy - 130, `Chapter ${chapter.number} Complete`, {
      fontFamily: 'Georgia, serif', fontSize: '22px', color: '#c9a55c', fontStyle: 'italic',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 88, chapter.title, {
      fontFamily: 'Georgia, serif', fontSize: '34px', color: '#f3e2b5',
    }).setOrigin(0.5);
    this.add.text(cx, cy - 48, chapter.subtitle, {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#9c8458', fontStyle: 'italic',
    }).setOrigin(0.5);

    let buttonY = cy + 30;
    if (next) {
      this.makeButton(cx, buttonY,
        `Continue to Chapter ${next.number}: ${next.title}  ›`,
        () => this.gotoScene(next.startScene, next.startSpawnX, next.startSpawnY));
      buttonY += 56;
    } else {
      this.add.text(cx, cy + 10, 'You have reached the end of the current content.', {
        fontFamily: 'Georgia, serif', fontSize: '15px', color: '#e8d9b0', fontStyle: 'italic',
      }).setOrigin(0.5);
      buttonY = cy + 60;
    }

    this.makeButton(cx, buttonY, 'Chapter Select',
      () => this.gotoScene('ChapterSelect'));
    this.makeButton(cx, buttonY + 50, 'Stay here',
      () => { this.scene.stop(); this.scene.resume(this.fromKey); });
  }

  private gotoScene(key: string, spawnX?: number, spawnY?: number): void {
    this.scene.stop(this.fromKey);
    this.scene.stop();
    this.scene.start(key, { spawnX, spawnY });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '17px', color: '#f3d98a',
      backgroundColor: '#2a1c10', padding: { x: 16, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => t.setColor('#fff1c0'))
      .on('pointerout',  () => t.setColor('#f3d98a'))
      .on('pointerdown', onClick);
    return t;
  }
}
