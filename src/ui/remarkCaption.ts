import Phaser from 'phaser';
import { localizedStyle, t, wrapsBetweenCharacters } from '../i18n';
import { responsiveFont, safeLayout } from './responsive';

/** One line said aloud while the player goes on walking. */
export interface SpokenLine {
  /** Who says it (translated): a companion, a passer-by, or 'Narrator' for an aside. */
  speaker: string;
  text: string;
}

const FADE_MS = 260;
/** Time to read a line: a pause to look up, then about a word a third of a second. */
const MS_BASE = 2200;
const MS_PER_CHAR = 48;
const MS_MAX = 9000;

/**
 * Words that come and go over the scene without stopping it: what a
 * companion says as you pass a place, or what someone calls out on the
 * road. Lines queue and play one after another, each on screen long enough
 * to read; a tap on the caption moves on. Nothing waits for it, and nothing
 * in it can be answered: anything the player must choose belongs in a
 * dialogue.
 *
 * `bottom` gives the screen y the caption's lower edge sits on, so each
 * scene keeps it clear of its own prompts and controls.
 */
export class RemarkCaption {
  private readonly queue: SpokenLine[] = [];
  private readonly box: Phaser.GameObjects.Container;
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  /** Wall-clock time the current line comes down, as the mini-games keep time, so slow frames do not hold it up. */
  private until = Number.POSITIVE_INFINITY;
  private current?: SpokenLine;

  constructor(private readonly scene: Phaser.Scene, private readonly bottom: () => number, depth: number) {
    const size = scene.scale;
    this.speakerText = scene.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(14, size, 12), color: '#c9a55c', fontStyle: 'italic', align: 'center',
    }, 'center')).setOrigin(0.5, 0);
    this.bodyText = scene.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(17, size, 14), color: '#f0e4c8', align: 'center',
    }, 'center')).setOrigin(0.5, 0);
    this.bg = scene.add.rectangle(0, 0, 10, 10, 0x0a0806, 0.78).setOrigin(0.5, 0).setStrokeStyle(1, 0x6a5232, 0.9);
    this.box = scene.add.container(0, 0, [this.bg, this.speakerText, this.bodyText])
      .setScrollFactor(0).setDepth(depth).setAlpha(0).setVisible(false);
    this.bg.setInteractive().on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation();
      this.advance();
    });
    // Paused under a dialogue or overlay: step out of its way, and come back after.
    scene.events.on(Phaser.Scenes.Events.PAUSE, this.hide, this);
    scene.events.on(Phaser.Scenes.Events.RESUME, this.unhide, this);
    scene.events.on(Phaser.Scenes.Events.UPDATE, this.tick, this);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      scene.events.off(Phaser.Scenes.Events.PAUSE, this.hide, this);
      scene.events.off(Phaser.Scenes.Events.RESUME, this.unhide, this);
      scene.events.off(Phaser.Scenes.Events.UPDATE, this.tick, this);
    });
  }

  /** True while a line is showing or waiting. */
  get speaking(): boolean {
    return this.current !== undefined || this.queue.length > 0;
  }

  /** Queues lines to be said after whatever is being said now. */
  say(lines: readonly SpokenLine[]): void {
    this.queue.push(...lines);
    if (!this.current) this.advance();
  }

  /** Drops whatever is queued and showing. */
  clear(): void {
    this.queue.length = 0;
    this.until = Number.POSITIVE_INFINITY;
    this.current = undefined;
    this.scene.tweens.killTweensOf(this.box);
    this.box.setAlpha(0).setVisible(false);
  }

  private tick(): void {
    if (performance.now() >= this.until) this.advance();
  }

  private advance(): void {
    this.until = Number.POSITIVE_INFINITY;
    const line = this.queue.shift();
    this.current = line;
    if (!line) {
      this.scene.tweens.add({ targets: this.box, alpha: 0, duration: FADE_MS, onComplete: () => this.box.setVisible(false) });
      return;
    }
    const text = t(line.text);
    this.show(line.speaker === 'Narrator' ? '' : t(line.speaker), text);
    const ms = Math.min(MS_MAX, MS_BASE + text.length * MS_PER_CHAR);
    this.until = performance.now() + ms;
  }

  private show(speaker: string, text: string): void {
    const size = this.scene.scale;
    const safe = safeLayout(size);
    const width = Math.min(safe.width, 620);
    const pad = 12;
    this.speakerText.setText(speaker).setVisible(speaker !== '');
    this.bodyText.setText(text).setWordWrapWidth(width - pad * 2, wrapsBetweenCharacters())
      .setFontStyle(speaker === '' ? 'italic' : 'normal');
    const speakerH = speaker === '' ? 0 : this.speakerText.height + 2;
    const height = speakerH + this.bodyText.height + pad * 2;
    const cx = safe.x + safe.width / 2;
    const top = this.bottom() - height;
    this.bg.setPosition(cx, top).setSize(width, height);
    this.bg.input?.hitArea.setTo(0, 0, width, height);
    this.speakerText.setPosition(cx, top + pad);
    this.bodyText.setPosition(cx, top + pad + speakerH);
    this.box.setVisible(true);
    this.scene.tweens.killTweensOf(this.box);
    this.scene.tweens.add({ targets: this.box, alpha: 1, duration: FADE_MS });
  }

  /** Under a dialogue: out of the way, with the line's clock stopped where it was. */
  private pausedLeft = 0;

  private hide(): void {
    this.box.setVisible(false);
    if (this.current) this.pausedLeft = Math.max(0, this.until - performance.now());
    this.until = Number.POSITIVE_INFINITY;
  }

  private unhide(): void {
    if (!this.current) return;
    this.box.setVisible(true);
    this.until = performance.now() + this.pausedLeft;
  }
}
