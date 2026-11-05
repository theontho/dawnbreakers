import Phaser from 'phaser';
import { chapterById } from '../data/chapters';
import { journeyDeparture, type Journey } from '../data/journeys';
import { activeLocale, localizedStyle, rtl, t, textOriginX, type Locale } from '../i18n';
import { buttonFont, isNarrowLayout, responsiveFont, safeLayout, type SafeLayout } from '../ui/responsive';

const DATE_LOCALES: Record<Locale, string> = { en: 'en-GB', fa: 'fa-IR-u-ca-gregory', zh: 'zh-CN' };
const HUD_DEPTH = 100;
const SHADE_ALPHA = 0.55;

export interface HudButton {
  label: () => string;
  onClick: () => void;
  /** Kept in view on a narrow screen, where the rest wait behind "More". */
  essential?: boolean;
  /** Kept on the same line as the next button when the row wraps, as a dial's − and +. */
  keepWithNext?: boolean;
}

/**
 * The words over a journey: which chapters it joins, its title, route and
 * description at the top, the local time on the road at the top corner, and a
 * row of controls along the bottom that wraps on a narrow screen. There the
 * ground is a short strip, so only the essential controls show until "More"
 * opens the rest, and the party stays in sight.
 */
export class JourneyHud {
  readonly layer: Phaser.GameObjects.Container;
  private readonly clock: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;
  /** The shade, the road's name and description, and its clock: what the arrival's chapter card takes the place of. */
  private readonly heading: Phaser.GameObjects.GameObject[] = [];
  private readonly buttons: { text: Phaser.GameObjects.Text; spec: HudButton }[] = [];
  private readonly safe: SafeLayout;
  private readonly dateFormat: Intl.DateTimeFormat;
  private readonly timeFormat: Intl.DateTimeFormat;
  private lastClock = '';
  private readonly shadeHeight: number;
  private readonly narrow: boolean;
  private expanded = false;
  /** Whether the controls fold behind "More": a narrow screen with optional controls. */
  private folds = false;

  constructor(private readonly scene: Phaser.Scene, journey: Journey) {
    const size = scene.scale;
    this.safe = safeLayout(size);
    const narrow = isNarrowLayout(size);
    this.narrow = narrow;
    const { x, y, right, width } = this.safe;
    this.layer = scene.add.container(0, 0).setDepth(HUD_DEPTH);
    this.dateFormat = new Intl.DateTimeFormat(DATE_LOCALES[activeLocale], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
    this.timeFormat = new Intl.DateTimeFormat(DATE_LOCALES[activeLocale], { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'UTC' });

    // Shade under the words so they read against a bright dawn.
    const shade = scene.add.graphics();
    this.shadeHeight = Math.min(size.height * 0.36, 260);
    shade.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, SHADE_ALPHA, SHADE_ALPHA, 0, 0);
    shade.fillRect(0, 0, size.width, this.shadeHeight);
    this.layer.add(shade);

    const start = rtl ? right : x;
    const columnWidth = narrow ? width : Math.min(620, width * 0.6);
    const from = chapterById(journey.from);
    const to = chapterById(journey.to);
    const eyebrow = from && to ? t('Chapter {from} to Chapter {to}', { from: from.number, to: to.number }) : '';
    const lines = [
      this.text(start, y, eyebrow, { fontSize: responsiveFont(14, size, 11), color: '#9c8458', fontStyle: 'italic' }, columnWidth),
      this.text(start, 0, t(journey.title), { fontSize: responsiveFont(34, size, 22), color: '#f3e2b5' }, columnWidth),
      this.text(start, 0, t(journey.subtitle), { fontSize: responsiveFont(15, size, 12), color: '#c9b07a', fontStyle: 'italic' }, columnWidth),
      this.text(start, 0, t(journey.description), { fontSize: responsiveFont(16, size, 13), color: '#e8d9b0' }, columnWidth),
    ];
    let top = y;
    for (const line of lines) {
      line.setY(top);
      top += line.height + 4;
    }

    // The clock sits in the far corner, or under the words on a narrow screen.
    const clockX = narrow ? start : rtl ? x : right;
    const clockY = narrow ? top + 6 : y;
    const clockOrigin = narrow ? textOriginX(0) : textOriginX(1);
    const clockWidth = narrow ? width : Math.min(320, width * 0.3);
    this.clock = this.text(clockX, clockY, ' ', { fontSize: responsiveFont(18, size, 13), color: '#f3e2b5' }, clockWidth).setOrigin(clockOrigin, 0);
    this.status = this.text(clockX, clockY + this.clock.height + 2, '', { fontSize: responsiveFont(13, size, 11), color: '#9c8458', fontStyle: 'italic' }, clockWidth)
      .setOrigin(clockOrigin, 0);
    this.updateClockFor(journeyDeparture(journey), journey.longitude, '');
    this.heading.push(shade, ...lines, this.clock, this.status);
  }

  /** Fades out the road's name, description and clock, leaving only the controls. */
  fadeHeading(): void {
    this.scene.tweens.add({ targets: this.heading, alpha: 0, duration: 700, ease: 'Sine.easeIn' });
  }

  /** Lays out the control row along the bottom, wrapping when it runs out of width. */
  setButtons(specs: readonly HudButton[]): void {
    for (const { text } of this.buttons) text.destroy();
    this.buttons.length = 0;
    // Only a row with both kinds folds; a lone "Continue" always shows.
    this.folds = this.narrow && specs.some(spec => spec.essential) && specs.some(spec => !spec.essential);
    const all: readonly HudButton[] = this.folds
      ? [...specs, { label: () => t(this.expanded ? 'Less' : 'More'), onClick: () => { this.expanded = !this.expanded; }, essential: true }]
      : specs;
    for (const spec of all) {
      const text = this.scene.add.text(0, 0, spec.label(), localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: buttonFont(15, this.scene.scale), color: '#c9b07a',
        backgroundColor: '#1a120acc', padding: { x: 12, y: 12 },
      }, 'center'))
        .setOrigin(0, 1)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => text.setColor('#fff1c0'))
        .on('pointerout', () => text.setColor('#c9b07a'))
        .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
          event.stopPropagation();
          spec.onClick();
          this.refreshButtons();
        });
      this.layer.add(text);
      this.buttons.push({ text, spec });
    }
    this.layoutButtons();
  }

  refreshButtons(): void {
    for (const { text, spec } of this.buttons) text.setText(spec.label());
    this.layoutButtons();
  }

  /** The date and local mean time on the road, and a line on how time is running. */
  updateClockFor(date: Date, longitude: number, status: string): void {
    const local = new Date(date.getTime() + (longitude / 15) * 3600000);
    const clock = `${this.dateFormat.format(local)}  ·  ${this.timeFormat.format(local)}`;
    if (clock !== this.lastClock) {
      this.clock.setText(clock);
      this.lastClock = clock;
    }
    if (this.status.text !== status) this.status.setText(status);
  }

  /** How dark the shade under the words is at screen line `y`, 0 where there is none. */
  shadeAt(y: number): number {
    if (!this.layer.visible) return 0;
    return SHADE_ALPHA * Math.min(1, Math.max(0, 1 - y / this.shadeHeight));
  }

  setVisible(visible: boolean): void {
    this.layer.setVisible(visible);
  }

  /** The top of the control row as laid out now, for what sits just above it. */
  controlsTop(): number {
    const tops = this.buttons.filter(b => b.text.visible).map(b => b.text.getBounds().top);
    return tops.length > 0 ? Math.min(...tops) : this.safe.bottom;
  }

  private layoutButtons(): void {
    const gap = 8;
    const { x, width, bottom } = this.safe;
    // Buttons that keep with the next wrap as one group.
    type Placed = { text: Phaser.GameObjects.Text; width: number };
    const groups: Placed[][] = [];
    let joinNext = false;
    for (const { text, spec } of this.buttons) {
      const shown = !this.folds || this.expanded || spec.essential === true;
      text.setVisible(shown);
      if (!shown) continue;
      if (joinNext && groups.length > 0) groups[groups.length - 1]!.push({ text, width: text.width });
      else groups.push([{ text, width: text.width }]);
      joinNext = spec.keepWithNext === true;
    }
    const rows: Placed[][] = [[]];
    let used = 0;
    for (const group of groups) {
      const w = group.reduce((sum, b) => sum + b.width, 0) + gap * (group.length - 1);
      if (used > 0 && used + gap + w > width) {
        rows.push([]);
        used = 0;
      }
      rows[rows.length - 1]!.push(...group);
      used += (used > 0 ? gap : 0) + w;
    }
    const rowHeight = (this.buttons[0]?.text.height ?? 40) + gap;
    rows.forEach((row, i) => {
      const rowWidth = row.reduce((sum, b) => sum + b.width, 0) + gap * (row.length - 1);
      let cursor = x + (width - rowWidth) / 2;
      const items = rtl ? [...row].reverse() : row;
      for (const item of items) {
        item.text.setPosition(cursor, bottom - (rows.length - 1 - i) * rowHeight);
        cursor += item.width + gap;
      }
    });
  }

  private text(x: number, y: number, value: string, style: Phaser.Types.GameObjects.Text.TextStyle, wrap: number): Phaser.GameObjects.Text {
    const text = this.scene.add.text(x, y, value, localizedStyle({
      fontFamily: 'Georgia, serif', ...style, wordWrap: { width: wrap },
    })).setOrigin(textOriginX(0), 0);
    this.layer.add(text);
    return text;
  }
}
