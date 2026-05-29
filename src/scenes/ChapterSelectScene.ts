import Phaser from 'phaser';
import { chapters, type Chapter } from '../data/chapters';
import { getFlags, resetFlags } from '../dialogue/flags';
import { buttonFont, isNarrowLayout, responsiveFont, responsiveMargin, restartSceneOnResize } from '../ui/responsive';

/**
 * A grid view of all chapters. Click any chapter to jump straight into it.
 * Reachable from the title screen, from the in-game HUD, and from the
 * Chapter-End card.
 */
export class ChapterSelectScene extends Phaser.Scene {
  constructor() { super('ChapterSelect'); }

  create(): void {
    restartSceneOnResize(this);

    const { width, height } = this.scale;
    const size = { width, height };
    const narrow = isNarrowLayout(size);
    const margin = responsiveMargin(size);

    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0);

    this.add.text(width / 2, margin + 42, 'Chapters', {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(54, size, 32), color: '#f3e2b5',
    }).setOrigin(0.5);
    this.add.text(width / 2, margin + 88, 'Choose where to begin — your discovered rumours and outcomes carry forward.', {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 12), color: '#9c8458', fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: width - margin * 2 },
    }).setOrigin(0.5);

    const flags = getFlags();
    const cardW = Math.min(900, width - margin * 2);
    const cardH = narrow ? 132 : 100;
    const gap = narrow ? 10 : 14;
    const viewportY = margin + 132;
    const viewportH = Math.max(220, height - viewportY - 124);
    const contentH = chapters.length * (cardH + gap) - gap;
    const maxScroll = Math.max(0, contentH - viewportH);
    let scrollY = 0;

    const list = this.add.container(width / 2 - cardW / 2, viewportY);
    const maskShape = this.add.rectangle(0, viewportY, width, viewportH, 0xffffff, 0)
      .setOrigin(0);
    list.setMask(maskShape.createGeometryMask());
    maskShape.setVisible(false);

    chapters.forEach((ch, i) => {
      const y = i * (cardH + gap);
      this.drawChapterCard(list, 0, y, cardW, cardH, ch, ch.isComplete(flags));
    });

    const track = this.add.rectangle(width - Math.max(16, margin * 0.6), viewportY, 6, viewportH, 0x2a1c10, 0.85)
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
      this.add.text(width / 2, height - 82, 'Scroll for later chapters', {
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(13, size, 11), color: '#9c8458', fontStyle: 'italic',
      }).setOrigin(0.5);
    }

    // Footer controls
    const footerY = height - 46;
    this.makeTextButton(width / 2 - (narrow ? 90 : 118), footerY, 'Back to Title',
      () => this.scene.start('Title')).setOrigin(0.5);
    this.makeTextButton(width / 2 + (narrow ? 90 : 118), footerY, 'Reset Story',
      () => { resetFlags(); this.scene.restart(); }).setOrigin(0.5);
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

    list.add(this.add.text(x + 24, y + 14, `Chapter ${chapter.number}`, {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, this.scale), color: '#9c8458', fontStyle: 'italic',
    }));
    list.add(this.add.text(x + 24, y + 30, chapter.title, {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(24, this.scale, 17), color: '#f3e2b5',
      wordWrap: { width: w - 48 },
    }));
    list.add(this.add.text(x + 24, y + 60, chapter.subtitle + '  —  ' + chapter.description, {
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(13, this.scale), color: '#c9b07a',
      wordWrap: { width: w - (w < 620 ? 48 : 220) },
    }));

    if (completed) {
      list.add(this.add.text(x + w - 24, y + h / 2, '✓ completed', {
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, this.scale), color: '#c9a55c', fontStyle: 'italic',
      }).setOrigin(1, 0.5));
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
      fontFamily: 'Georgia, serif', fontSize: buttonFont(15, this.scale), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 14, y: 14 },
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => t.setColor('#fff1c0'))
      .on('pointerout',  () => t.setColor('#c9b07a'))
      .on('pointerdown', onClick);
    return t;
  }
}
