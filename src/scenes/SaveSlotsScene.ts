import Phaser from 'phaser';
import { chapters, type Chapter } from '../data/chapters';
import { titleChapter } from '../data/titleOpenings';
import { eraseStory, selectStory, storyInSlot } from '../dialogue/progress';
import { activeSlot, SLOTS } from '../dialogue/saveSlots';
import { activeLocale, chapterLabel, localizedStyle, rtl, t, textOriginX } from '../i18n';
import { chapterDawnTexture } from './chapterDawn';
import { buttonFont, isNarrowLayout, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';

/**
 * The player's stories, one to a slot: where each has reached, with that
 * chapter's dawn, how many chapters it has finished and when it was last
 * played. Choosing one opens the title on its dawn, ready to continue it
 * (or, for an empty slot, to begin); each can be erased with a second tap.
 */
export class SaveSlotsScene extends Phaser.Scene {
  constructor() { super('SaveSlots'); }

  create(): void {
    restartSceneOnResize(this, () => ({}));
    const { width, height } = this.scale;
    const size = { width, height };
    const narrow = isNarrowLayout(size);
    const safe = safeLayout(size);
    const centerX = safe.x + safe.width / 2;

    this.add.rectangle(0, 0, width, height, 0x0a0806).setOrigin(0).setDepth(-2);
    this.add.text(centerX, safe.y + 42, t('Saves'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(54, size, 32), color: '#f3e2b5',
    }, 'center')).setOrigin(0.5);
    this.add.text(centerX, safe.y + 88, t('Each story keeps its own place and its own choices.'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 12), color: '#9c8458', fontStyle: 'italic',
      align: 'center', wordWrap: { width: safe.width },
    }, 'center')).setOrigin(0.5);

    const cardW = Math.min(900, safe.width);
    const gap = narrow ? 10 : 14;
    let y = safe.y + 124;
    for (const slot of SLOTS) y += this.drawSlot(centerX - cardW / 2, y, cardW, slot) + gap;

    const back = this.add.text(centerX, safe.bottom - 24, t('Back to Title'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(15, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 14, y: 14 },
    }, 'center')).setOrigin(0.5).setInteractive({ useHandCursor: true })
      .on('pointerover', () => back.setColor('#fff1c0'))
      .on('pointerout', () => back.setColor('#c9b07a'))
      .on('pointerdown', () => this.scene.start('Title'));
    this.input.keyboard?.once('keydown-ESC', () => this.scene.start('Title'));
  }

  /** One slot's card at `y`; returns its height. */
  private drawSlot(x: number, y: number, w: number, slot: number): number {
    const { bookmark, flags } = storyInSlot(slot);
    const begun = bookmark !== undefined || Object.keys(flags).length > 0;
    const chapter: Chapter = titleChapter(bookmark?.scene);
    const playing = slot === activeSlot();
    const narrowCard = w < 620;
    const pad = 14;
    const art = narrowCard
      ? { x: x + 8, y: y + 8, w: w - 16, h: Math.round((w - 16) / 4.2) }
      : { x: rtl ? x + w - 8 - 200 : x + 8, y: y + 8, w: 200, h: 112 };
    const side = narrowCard ? 0 : art.w + 8;
    const textX = rtl ? x + w - 24 - side : x + 24 + side;
    const textW = w - 48 - side;
    const originX = textOriginX(0);
    const style = (px: number, color: string, extra: Phaser.Types.GameObjects.Text.TextStyle = {}) => localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(px, this.scale), color, wordWrap: { width: textW }, ...extra,
    });

    const lines: Phaser.GameObjects.Text[] = [];
    const add = (text: string, px: number, color: string, extra?: Phaser.Types.GameObjects.Text.TextStyle) => {
      const top = lines.length ? lines[lines.length - 1]!.y + lines[lines.length - 1]!.height + 4 : (narrowCard ? art.y + art.h + 6 : y + pad);
      lines.push(this.add.text(textX, top, text, style(px, color, extra)).setOrigin(originX, 0));
    };
    add(playing ? `${t('Story {n}', { n: slot })} · ${t('Playing')}` : t('Story {n}', { n: slot }), 14, playing ? '#f3d98a' : '#9c8458', { fontStyle: 'italic' });
    if (begun) {
      add(`${chapterLabel(chapter.number)} · ${t(chapter.title)}`, 22, '#f3e2b5');
      const done = chapters.filter(c => c.isComplete(flags)).length;
      add(t('{done} of {total} chapters finished', { done, total: chapters.length }), 13, '#c9b07a');
      if (bookmark?.savedAt) add(t('Last played {date}', { date: formatDate(bookmark.savedAt) }), 13, '#9c8458');
    } else {
      add(t('Empty'), 22, '#8a7a5a');
      add(t('Begin a new story'), 13, '#c9b07a');
    }
    const last = lines[lines.length - 1]!;
    const h = Math.ceil(Math.max(last.y + last.height + pad, art.y + art.h + 8) - y);

    const card = this.add.rectangle(x, y, w, h, 0x1a120a, 0.95).setOrigin(0)
      .setStrokeStyle(2, playing ? 0xc9a55c : 0x4a3a22, 1)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => card.setStrokeStyle(2, 0xf3d98a, 1))
      .on('pointerout', () => card.setStrokeStyle(2, playing ? 0xc9a55c : 0x4a3a22, 1))
      .on('pointerdown', () => this.play(slot));
    card.setDepth(-1);
    if (begun) this.add.image(art.x, art.y, chapterDawnTexture(this, chapter.id, art.w, art.h)).setOrigin(0);
    else this.add.rectangle(art.x, art.y, art.w, art.h, 0x15100c, 1).setOrigin(0).setStrokeStyle(1, 0x3a2e1c, 1);
    if (begun) this.addEraseButton(rtl ? x + 12 : x + w - 12, y + h - 12, slot);
    return h;
  }

  /** Erase, asking once more before it does. */
  private addEraseButton(x: number, y: number, slot: number): void {
    let armed = false;
    let disarm: Phaser.Time.TimerEvent | undefined;
    const button = this.add.text(x, y, t('Erase'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(13, this.scale), color: '#a88a6a',
      backgroundColor: '#24180ecc', padding: { x: 12, y: 12 },
    }, 'center')).setOrigin(rtl ? 0 : 1, 1).setInteractive({ useHandCursor: true })
      .on('pointerover', () => button.setColor('#fff1c0'))
      .on('pointerout', () => button.setColor(armed ? '#e8a080' : '#a88a6a'))
      .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
        event.stopPropagation();
        if (!armed) {
          armed = true;
          button.setText(t('Tap again to erase')).setColor('#e8a080');
          disarm = this.time.delayedCall(3000, () => {
            armed = false;
            button.setText(t('Erase')).setColor('#a88a6a');
          });
          return;
        }
        disarm?.remove();
        eraseStory(slot);
        this.scene.restart();
      });
  }

  private play(slot: number): void {
    selectStory(slot);
    this.cameras.main.fadeOut(280, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start('Title', { direct: true });
    });
  }
}

function formatDate(ms: number): string {
  const tag = activeLocale === 'fa' ? 'fa-IR' : activeLocale === 'zh' ? 'zh-CN' : 'en-GB';
  try {
    return new Intl.DateTimeFormat(tag, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms));
  } catch {
    return new Date(ms).toLocaleString();
  }
}
