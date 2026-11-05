import Phaser from 'phaser';
import { attachGlossary } from '../ui/glossary/glossaryText';
import { playSfx } from '../audio';
import { chapterByScene, chapters, type Chapter } from '../data/chapters';
import type { JournalEntry } from '../data/story/types';
import { getFlags } from '../dialogue/flags';
import type { FlagState } from '../dialogue/types';
import { chapterLabel, formatNumber, localizedStyle, rtl, t, textOriginX } from '../i18n';
import { buttonFont, responsiveFont, restartSceneOnResize, safeLayout } from '../ui/responsive';
import { currentObjectiveText } from './mapObjectiveHud';
import { claimById, claimsWithKnowledge, heardAccounts, written } from '../data/record';
import type { RecordLaunch } from './RecordScene';

function entryRevealed(entry: JournalEntry, flags: FlagState): boolean {
  const value = flags[entry.flag];
  if (entry.equals !== undefined) return value === entry.equals;
  return value !== undefined && value !== false;
}

/**
 * The seeker's journal: every chapter's revealed entries, newest chapter
 * first, with the current objective pinned at the top. Scrolls with the
 * mouse wheel, drag, or arrow keys when it outgrows the panel.
 */
export class JournalScene extends Phaser.Scene {
  private fromKey = 'City';

  constructor() {
    super('Journal');
  }

  init(data: { from?: string }): void {
    this.fromKey = data.from ?? 'City';
  }

  create(): void {
    playSfx('journal');
    restartSceneOnResize(this, () => ({ from: this.fromKey }));

    const { width, height } = this.scale;
    const size = { width, height };
    const safe = safeLayout(size);
    this.add.rectangle(0, 0, width, height, 0x000000, 0.6).setOrigin(0);

    const panelX = safe.x, panelY = safe.y;
    const panelW = safe.width, panelH = safe.height;
    const close = (): void => { this.scene.stop(); this.scene.resume(this.fromKey); };
    this.add.rectangle(panelX, panelY, panelW, panelH, 0x1a120a, 0.96)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9a55c, 1);

    const contentX = rtl ? panelX + panelW - 24 : panelX + 24;
    const contentOrigin = textOriginX(0);
    this.add.text(contentX, panelY + 18, t('Journal'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(32, size, 22), color: '#f3d98a',
    })).setOrigin(contentOrigin, 0);
    const closeButton = this.add.text(rtl ? panelX + 20 : panelX + panelW - 20, panelY + 14, t('Close'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(14, size), color: '#c9b07a',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 14 },
    })).setOrigin(textOriginX(1), 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => closeButton.setColor('#fff1c0'))
      .on('pointerout',  () => closeButton.setColor('#c9b07a'))
      .on('pointerdown', close)
      .setDepth(2);
    this.add.text(rtl ? panelX + 24 : panelX + panelW - 24, panelY + 64, t('J / Esc'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, size), color: '#9c8458',
    })).setOrigin(textOriginX(1), 0);

    const viewTop = panelY + 90;
    const viewBottom = panelY + panelH - 16;
    const content = this.add.container(0, 0);
    const view = new Phaser.Geom.Rectangle(panelX, viewTop, panelW, viewBottom - viewTop);
    const contentHeight = this.layoutEntries(content, contentX, contentOrigin, view, panelX, panelW, size);

    const maskShape = this.make.graphics({ x: 0, y: 0 }, false);
    maskShape.fillStyle(0xffffff, 1);
    maskShape.fillRect(panelX, viewTop, panelW, viewBottom - viewTop);
    content.setMask(maskShape.createGeometryMask());
    this.enableScrolling(content, Math.max(0, contentHeight - (viewBottom - viewTop)), panelX, viewTop, panelW, viewBottom - viewTop);

    this.input.keyboard?.once('keydown-J', close);
    this.input.keyboard?.once('keydown-ESC', close);
  }

  private layoutEntries(
    content: Phaser.GameObjects.Container,
    contentX: number,
    contentOrigin: number,
    view: Phaser.Geom.Rectangle,
    panelX: number,
    panelW: number,
    size: { width: number; height: number },
  ): number {
    const flags = getFlags();
    const here = chapterByScene(this.fromKey);
    const top = view.y;
    let y = top;
    const add = (text: Phaser.GameObjects.Text, gapAfter: number): void => {
      content.add(text);
      y += text.height + gapAfter;
    };

    const objective = currentObjectiveText(here, flags);
    if (objective) {
      add(this.add.text(contentX, y, rtl ? `${objective} ◆` : `◆ ${objective}`, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(17, size, 13), color: '#fff1c0', fontStyle: 'italic',
        wordWrap: { width: panelW - 48 },
      })).setOrigin(contentOrigin, 0), 18);
    }

    const known = claimsWithKnowledge(flags);
    if (known.length > 0) {
      const accounts = known.reduce((n, id) => n + heardAccounts(flags, claimById(id)).length, 0);
      const writtenCount = known.filter(id => !!written(flags, id)).length;
      const label = t('Your record: {accounts} accounts heard on {questions} questions, {written} written down  ›', {
        accounts: formatNumber(accounts), questions: formatNumber(known.length), written: formatNumber(writtenCount),
      });
      const link = this.add.text(contentX, y, rtl ? `${label} ✎` : `✎ ${label}`, localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: buttonFont(16, size), color: '#9ed6c8',
        backgroundColor: '#1f2a26', padding: { x: 10, y: 12 }, wordWrap: { width: panelW - 68 },
      })).setOrigin(contentOrigin, 0).setInteractive({ useHandCursor: true });
      link.on('pointerover', () => link.setColor('#d8fff4'))
        .on('pointerout', () => link.setColor('#9ed6c8'))
        .on('pointerdown', () => this.openRecord());
      add(link, 18);
    }

    const ordered = here ? [here, ...chapters.filter(c => c !== here).reverse()] : [...chapters].reverse();
    const sections = ordered
      .map(chapter => ({ chapter, entries: chapter.story.journal.filter(e => entryRevealed(e, flags)) }))
      .filter(section => section.entries.length > 0);

    if (sections.length === 0) {
      add(this.add.text(contentX, y, t('You have learned nothing yet. Speak with the people of Shíráz.'), localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 13), color: '#c9b07a', fontStyle: 'italic',
        wordWrap: { width: panelW - 48 },
      })).setOrigin(contentOrigin, 0), 0);
      return y - top;
    }

    for (const { chapter, entries } of sections) {
      add(this.sectionHeading(chapter, contentX, y, contentOrigin, panelW, size), 10);
      for (const entry of entries) {
        add(this.add.text(contentX, y, rtl ? `${t(entry.title)} •` : `• ${t(entry.title)}`, localizedStyle({
          fontFamily: 'Georgia, serif', fontSize: responsiveFont(19, size, 14), color: '#f3d98a',
          wordWrap: { width: panelW - 48 },
        })).setOrigin(contentOrigin, 0), 6);
        const bodyX = rtl ? panelX + panelW - 40 : panelX + 40;
        const body = this.add.text(bodyX, y, t(entry.body), localizedStyle({
          fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 12), color: '#e8d9b0',
          wordWrap: { width: panelW - 80 }, lineSpacing: 3,
        })).setOrigin(contentOrigin, 0);
        add(body, 16);
        attachGlossary(this, body, content, view);
      }
      y += 8;
    }
    return y - top;
  }

  /** The record over the journal; the journal comes back, redrawn, when it closes. */
  private openRecord(): void {
    this.scene.setVisible(false);
    this.scene.launch('Record', {
      onFinish: () => {
        this.scene.resume();
        this.scene.setVisible(true);
        this.scene.restart({ from: this.fromKey });
      },
    } as RecordLaunch);
    this.scene.pause();
  }

  private sectionHeading(
    chapter: Chapter,
    x: number,
    y: number,
    origin: number,
    panelW: number,
    size: { width: number; height: number },
  ): Phaser.GameObjects.Text {
    return this.add.text(x, y, `${chapterLabel(chapter.number)} · ${t(chapter.title)}`, localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, size, 11), color: '#9c8458',
      fontStyle: 'italic', wordWrap: { width: panelW - 48 },
    })).setOrigin(origin, 0);
  }

  private enableScrolling(
    content: Phaser.GameObjects.Container,
    maxScroll: number,
    x: number,
    y: number,
    w: number,
    h: number,
  ): void {
    if (maxScroll <= 0) return;
    let scroll = 0;
    const scrollTo = (value: number): void => {
      scroll = Phaser.Math.Clamp(value, 0, maxScroll);
      content.y = -scroll;
    };
    this.input.on(Phaser.Input.Events.POINTER_WHEEL, (_p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
      scrollTo(scroll + dy * 0.6);
    });
    // Beneath the content, so glossary words inside it still take the pointer.
    const zone = this.add.zone(x, y, w, h).setOrigin(0).setDepth(-1).setInteractive();
    let dragStart: { pointerY: number; scroll: number } | undefined;
    zone.on('pointerdown', (p: Phaser.Input.Pointer) => { dragStart = { pointerY: p.y, scroll }; });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
      if (dragStart && p.isDown) scrollTo(dragStart.scroll - (p.y - dragStart.pointerY));
    });
    this.input.on(Phaser.Input.Events.POINTER_UP, () => { dragStart = undefined; });
    this.input.keyboard?.on('keydown-DOWN', () => scrollTo(scroll + 60));
    this.input.keyboard?.on('keydown-UP', () => scrollTo(scroll - 60));
    this.add.text(x + w / 2, y + h + 2, '⌄', { fontFamily: 'Georgia, serif', fontSize: '18px', color: '#9c8458' })
      .setOrigin(0.5, 1);
  }
}
