import Phaser from 'phaser';
import { chapters, type Chapter } from '../data/chapters';
import { getFlags, resetFlags } from '../dialogue/flags';

/**
 * A grid view of all chapters. Click any chapter to jump straight into it.
 * Reachable from the title screen, from the in-game HUD, and from the
 * Chapter-End card.
 */
export class ChapterSelectScene extends Phaser.Scene {
  constructor() { super('ChapterSelect'); }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0);

    this.add.text(width / 2, 80, 'Chapters', {
      fontFamily: 'Georgia, serif', fontSize: '54px', color: '#f3e2b5',
    }).setOrigin(0.5);
    this.add.text(width / 2, 130, 'Choose where to begin — your discovered rumours and outcomes carry forward.', {
      fontFamily: 'Georgia, serif', fontSize: '16px', color: '#9c8458', fontStyle: 'italic',
    }).setOrigin(0.5);

    const flags = getFlags();
    const cardW = 900, cardH = 90;
    const startY = 200;
    chapters.forEach((ch, i) => {
      const y = startY + i * (cardH + 14);
      this.drawChapterCard(width / 2 - cardW / 2, y, cardW, cardH, ch, ch.isComplete(flags));
    });

    // Footer controls
    const footerY = height - 40;
    this.makeTextButton(width / 2 - 110, footerY, 'Back to Title',
      () => this.scene.start('Title')).setOrigin(0.5);
    this.makeTextButton(width / 2 + 110, footerY, 'Reset Story',
      () => { resetFlags(); this.scene.restart(); }).setOrigin(0.5);
  }

  private drawChapterCard(
    x: number, y: number, w: number, h: number,
    chapter: Chapter, completed: boolean,
  ): void {
    const card = this.add.rectangle(x, y, w, h, 0x1a120a, 0.95)
      .setOrigin(0)
      .setStrokeStyle(2, completed ? 0xc9a55c : 0x4a3a22, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => card.setStrokeStyle(2, 0xf3d98a, 1))
      .on('pointerout',  () => card.setStrokeStyle(2, completed ? 0xc9a55c : 0x4a3a22, 1))
      .on('pointerdown', () => this.startChapter(chapter));

    this.add.text(x + 24, y + 14, `Chapter ${chapter.number}`, {
      fontFamily: 'Georgia, serif', fontSize: '14px', color: '#9c8458', fontStyle: 'italic',
    });
    this.add.text(x + 24, y + 30, chapter.title, {
      fontFamily: 'Georgia, serif', fontSize: '24px', color: '#f3e2b5',
    });
    this.add.text(x + 24, y + 60, chapter.subtitle + '  —  ' + chapter.description, {
      fontFamily: 'Georgia, serif', fontSize: '13px', color: '#c9b07a',
      wordWrap: { width: w - 220 },
    });

    if (completed) {
      this.add.text(x + w - 24, y + h / 2, '✓ completed', {
        fontFamily: 'Georgia, serif', fontSize: '16px', color: '#c9a55c', fontStyle: 'italic',
      }).setOrigin(1, 0.5);
    } else {
      this.add.text(x + w - 24, y + h / 2, 'enter ›', {
        fontFamily: 'Georgia, serif', fontSize: '18px', color: '#f3d98a',
      }).setOrigin(1, 0.5);
    }
  }

  private startChapter(chapter: Chapter): void {
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(chapter.startScene, {
        spawnX: chapter.startSpawnX,
        spawnY: chapter.startSpawnY,
      });
    });
  }

  private makeTextButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, label, {
      fontFamily: 'Georgia, serif', fontSize: '15px', color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 6 },
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => t.setColor('#fff1c0'))
      .on('pointerout',  () => t.setColor('#c9b07a'))
      .on('pointerdown', onClick);
    return t;
  }
}
