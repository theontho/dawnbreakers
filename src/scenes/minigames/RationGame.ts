import Phaser from 'phaser';
import { getFlags } from '../../dialogue/flags';
import type { FlagState } from '../../dialogue/types';
import { playSfx } from '../../audio';
import { formatNumber, localizedStyle, rtl, t, wrapsBetweenCharacters } from '../../i18n';
import { buttonFont, responsiveFont } from '../../ui/responsive';
import { MiniGameScene, type PlayArea } from './MiniGameScene';

type GroupId = 'wounded' | 'watch' | 'young';

interface Group {
  id: GroupId;
  name: () => string;
  /** Strength lost each week. */
  need: number;
  strength: number;
  given: number;
  total: number;
  label?: Phaser.GameObjects.Text;
  minus?: Phaser.GameObjects.Text;
}

interface Week {
  portions: (flags: FlagState) => number;
  pot: () => string;
}

/** What there was to eat, week by week, after Nabíl: rice, the horses, saddles, grass, bones. */
const WEEKS: Week[] = [
  { portions: f => (f.ch8GaveRice ? 11 : 8),
    pot: () => t('The last of the rice. A few grains in every pot.') },
  { portions: () => 8, pot: () => t('The horses, one by one.') },
  { portions: () => 6, pot: () => t('Saddles and harness, boiled until the leather can be chewed.') },
  { portions: () => 5, pot: () => t('Grass, gathered in the field when the guns fall quiet, and boiled.') },
  { portions: () => 4, pot: () => t('Bones, churned and boiled. Quddús calls them his meat.') },
];
const PORTION = 0.13;

/**
 * The hungry months at Ṭabarsí (chapter 8), after Mullá Ḥusayn's death:
 * Quddús asks the player to share out what there is. Each week there is
 * less in the pot, and three tables to feed: the wounded, the watch on the
 * walls, and the youngest. Nothing the player does can make it enough; the
 * play is in the choosing. No one starves on this screen: what hunger
 * does is told, plainly, in the story around it.
 *
 * Result: `ch8RationFavoured`, the table that was given most ('wounded',
 * 'watch', 'young'), or 'even'.
 */
export class RationGame extends MiniGameScene {
  constructor() {
    super('RationGame');
  }

  readonly heading = 'Sharing Out the Stores';
  protected readonly hint = 'Click a table, or press 1, 2 or 3, to give it a portion; − or Backspace takes one back. Press Enter, or Share it out, to end the week.';

  private groups: Group[] = [];
  private week = 0;
  private portions = 0;
  private order: GroupId[] = [];
  private potText!: Phaser.GameObjects.Text;
  private leftText!: Phaser.GameObjects.Text;
  private shareButton!: Phaser.GameObjects.Text;
  private cards: Phaser.Geom.Rectangle[] = [];
  private shiftAnim = 0;

  protected begin(): void {
    this.groups = [
      { id: 'wounded', name: () => t('The wounded'), need: 0.24, strength: 0.45, given: 0, total: 0 },
      { id: 'watch', name: () => t('The watch on the walls'), need: 0.2, strength: 0.7, given: 0, total: 0 },
      { id: 'young', name: () => t('The youngest'), need: 0.16, strength: 0.6, given: 0, total: 0 },
    ];
    this.week = 0;
    this.order = [];
    const size = this.scale;
    const body = localizedStyle({ fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 14), color: '#f0e4c8', align: 'center' }, 'center');
    this.potText = this.add.text(0, 0, '', { ...body, fontStyle: 'italic' }).setOrigin(0.5, 0);
    this.leftText = this.add.text(0, 0, '', { ...body, color: '#f3d98a' }).setOrigin(0.5, 0);
    for (const group of this.groups) {
      group.label = this.add.text(0, 0, group.name(), { ...body, fontSize: responsiveFont(17, size, 13) }).setOrigin(0.5, 0);
      group.minus = this.add.text(0, 0, '−', localizedStyle({
        fontFamily: 'Georgia, serif', fontSize: buttonFont(20, size), color: '#c9b07a',
        backgroundColor: '#1a120acc', padding: { x: 14, y: 6 },
      })).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
      group.minus.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        this.takeBack(group);
      });
    }
    this.shareButton = this.add.text(0, 0, t('Share it out'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(19, size), color: '#e8d9b0',
      backgroundColor: '#2a1c10', padding: { x: 22, y: 12 },
    }, 'center')).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });
    this.shareButton.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
      e.stopPropagation();
      this.shareOut();
    });
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const i = this.cards.findIndex(r => r.contains(p.x, p.y));
      if (i >= 0) this.give(this.groups[i]!);
    });
    this.input.keyboard?.on('keydown', (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= this.groups.length) this.give(this.groups[n - 1]!);
      else if (e.key === 'Backspace' || e.key === '-') {
        const last = this.order[this.order.length - 1];
        const group = this.groups.find(g => g.id === last);
        if (group) this.takeBack(group);
      } else if (e.key === 'Enter') this.shareOut();
    });
    this.startWeek();
  }

  private startWeek(): void {
    const week = WEEKS[this.week]!;
    this.portions = week.portions(getFlags());
    this.order = [];
    for (const group of this.groups) group.given = 0;
    this.potText.setText(week.pot());
    this.refresh();
  }

  private give(group: Group): void {
    if (this.portions <= 0) return;
    this.portions--;
    group.given++;
    this.order.push(group.id);
    playSfx('clink');
    this.refresh();
  }

  private takeBack(group: Group): void {
    if (group.given <= 0) return;
    group.given--;
    this.portions++;
    const at = this.order.lastIndexOf(group.id);
    if (at >= 0) this.order.splice(at, 1);
    playSfx('uiClick');
    this.refresh();
  }

  private shareOut(): void {
    playSfx('warm');
    for (const group of this.groups) {
      group.strength = Phaser.Math.Clamp(group.strength - group.need + group.given * PORTION, 0.05, 1);
      group.total += group.given;
    }
    this.shiftAnim = 1;
    this.week++;
    if (this.week >= WEEKS.length) {
      this.finish({ ch8RationFavoured: this.favoured() });
      return;
    }
    this.startWeek();
  }

  private favoured(): string {
    const sorted = [...this.groups].sort((a, b) => b.total - a.total);
    const [first, last] = [sorted[0]!, sorted[sorted.length - 1]!];
    return first.total - last.total <= 2 ? 'even' : first.id;
  }

  private refresh(): void {
    this.leftText.setText(t('Week {week} of {weeks}. Portions left: {left}', {
      week: this.week + 1, weeks: WEEKS.length, left: this.portions,
    }));
    for (const group of this.groups) {
      group.label?.setText(`${group.name()}\n${'●'.repeat(group.given) || formatNumber(0)}`);
      group.minus?.setAlpha(group.given > 0 ? 1 : 0.35);
    }
  }

  protected layout(area: PlayArea): void {
    this.potText.setPosition(area.cx, area.y + 6).setWordWrapWidth(area.width * 0.9, wrapsBetweenCharacters());
    this.leftText.setPosition(area.cx, area.y + area.height * 0.16);
    const n = this.groups.length;
    const cardW = Math.min(area.width / n - 12, 240);
    const cardH = Math.min(area.height * 0.48, 260);
    const top = area.y + area.height * 0.26;
    this.cards = this.groups.map((group, i) => {
      // Read from the right in a right-to-left language, so table 1 comes first.
      const place = rtl ? n - 1 - i : i;
      const cx = area.cx + (place - (n - 1) / 2) * (cardW + 12);
      group.label?.setPosition(cx, top + 10).setWordWrapWidth(cardW - 16, wrapsBetweenCharacters());
      group.minus?.setPosition(cx, top + cardH + 6);
      return new Phaser.Geom.Rectangle(cx - cardW / 2, top, cardW, cardH);
    });
    this.shareButton.setPosition(area.cx, Math.min(area.y + area.height - 50, top + cardH + 64));
  }

  protected tick(dt: number): void {
    this.shiftAnim = Math.max(0, this.shiftAnim - dt * 1.5);
  }

  protected draw(area: PlayArea): void {
    const g = this.gfx;
    g.fillStyle(0x1c1610, 1).fillRect(area.x, area.y, area.width, area.height);
    // The cauldron's fire glows behind the tables.
    g.fillStyle(0xff7a2a, 0.05 + 0.03 * Math.sin(this.elapsed * 2)).fillCircle(area.cx, area.y + area.height * 0.2, area.width * 0.3);

    this.groups.forEach((group, i) => {
      const r = this.cards[i];
      if (!r) return;
      g.fillStyle(0x2a1c10, 0.95).fillRect(r.x, r.y, r.width, r.height);
      g.lineStyle(1, 0x6a5232, 1).strokeRect(r.x, r.y, r.width, r.height);
      // Their strength, as a bar along the bottom of the card.
      const bw = r.width - 24;
      const by = r.bottom - 22;
      const after = Phaser.Math.Clamp(group.strength - group.need + group.given * PORTION, 0.05, 1);
      g.fillStyle(0x140e08, 1).fillRect(r.x + 12, by, bw, 10);
      g.fillStyle(0x8a6a3a, 1).fillRect(r.x + 12, by, bw * group.strength, 10);
      g.fillStyle(after >= group.strength ? 0xc9a55c : 0x9a3a2a, 0.9).fillRect(r.x + 12 + bw * Math.min(after, group.strength), by, bw * Math.abs(after - group.strength), 10);
      this.drawTable(r, group);
    });
  }

  /** A few figures at each table, sitting straighter the stronger they are. */
  private drawTable(r: Phaser.Geom.Rectangle, group: Group): void {
    const g = this.gfx;
    const base = r.bottom - 40;
    const slump = (1 - group.strength) * 10;
    for (let k = 0; k < 3; k++) {
      const x = r.x + r.width * (0.25 + k * 0.25);
      g.fillStyle(0x4a3a2a, 1).fillTriangle(x - 12, base, x + 12, base, x + slump * 0.6, base - 34 + slump);
      g.fillStyle(0xb88a68, 1).fillCircle(x + slump * 0.8, base - 38 + slump, 6);
    }
    g.fillStyle(0x6a4a2a, 1).fillEllipse(r.centerX, base + 4, r.width * 0.7, 8);
  }

  protected skipResult(): FlagState {
    return { ch8RationFavoured: 'even' };
  }
}
