import Phaser from 'phaser';
import type { FlagState } from '../../dialogue/types';
import { playSfx } from '../../audio';
import { localizedStyle, t } from '../../i18n';
import { responsiveFont } from '../../ui/responsive';
import { MiniGameScene, type PlayArea } from './MiniGameScene';

/** The invocation at the head of the Arabic Bayán, revealed at Mákú. */
const LINE = 'بسم الله الامنع الاقدس';
const ARABIC_FONT = '"Geeza Pro", "Noto Naskh Arabic", "Amiri", "Traditional Arabic", "Times New Roman", serif';
/** Seconds of daylight left in the window. */
const DAYLIGHT = 34;
/** Seconds of steady writing to copy the whole line. */
const WRITE_SECONDS = 12;
const WARM_SECONDS = 1.1;
/** Warmth lost per second while writing, and per second of cold regardless. */
const INK_USE = 0.2;
const INK_COLD = 0.035;

/**
 * Mákú in winter (chapter 6): Siyyid Ḥusayn lets the player copy the
 * opening line onto a fresh sheet while he warms his hands. The line is
 * traced from right to left, the ink showing behind the pen; the cold
 * thickens the ink in the pen until it will not flow, and it must be warmed
 * over the brazier before the pen will write again. The light from the
 * window is going.
 *
 * Result: `ch6CopiedLine`, 'whole' or 'part'.
 */
export class InkGame extends MiniGameScene {
  constructor() {
    super('InkGame');
  }

  protected readonly heading = 'A Fair Copy';
  protected readonly hint = 'Draw the pen along the line from right to left, or hold ←. When the ink freezes, warm it at the brazier: click the inkwell, or press ↓.';

  private written = 0;
  private warmth = 1;
  private warming = 0;
  private guide!: Phaser.GameObjects.Text;
  private ink!: Phaser.GameObjects.Text;
  private meaning!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private keys?: { write: Phaser.Input.Keyboard.Key[]; warm: Phaser.Input.Keyboard.Key[] };
  private inkwell = new Phaser.Geom.Circle(0, 0, 1);

  protected begin(): void {
    this.written = 0;
    this.warmth = 1;
    this.warming = 0;
    const style = { fontFamily: ARABIC_FONT, fontSize: '64px', rtl: true, padding: { x: 6, y: 18 } };
    this.guide = this.add.text(0, 0, LINE, { ...style, color: '#b9a57e' }).setOrigin(0.5).setAlpha(0.45);
    this.ink = this.add.text(0, 0, LINE, { ...style, color: '#2a1a0c' }).setOrigin(0.5);
    const size = this.scale;
    this.meaning = this.add.text(0, 0, t('In the Name of God, the Most Inaccessible, the Most Holy.'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 13), color: '#6a5232', fontStyle: 'italic', align: 'center',
    }, 'center')).setOrigin(0.5, 0);
    this.statusText = this.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(17, size, 14), color: '#f0e4c8', fontStyle: 'italic', align: 'center',
    }, 'center')).setOrigin(0.5, 0);
    const kb = this.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = { write: [kb.addKey(K.LEFT), kb.addKey(K.A)], warm: [kb.addKey(K.DOWN), kb.addKey(K.S)] };
    }
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.inkwell.contains(p.x, p.y)) this.warm();
    });
  }

  protected layout(area: PlayArea): void {
    const paperW = Math.min(area.width * 0.92, 900);
    const fontPx = Math.max(30, Math.min(72, paperW / 9));
    for (const text of [this.guide, this.ink]) {
      text.setFontSize(fontPx).setPosition(area.cx, area.y + area.height * 0.38);
    }
    this.meaning.setPosition(area.cx, this.guide.y + this.guide.height / 2 + 8).setWordWrapWidth(paperW * 0.9);
    this.statusText.setPosition(area.cx, area.y + area.height * 0.9).setWordWrapWidth(area.width * 0.9);
    this.updateCrop();
  }

  private warm(): void {
    if (this.warming > 0 || this.warmth > 0.95) return;
    this.warming = WARM_SECONDS;
    playSfx('warm');
    this.statusText.setText(t('You hold the inkwell over the coals until the ink runs again.'));
  }

  private get lineWidth(): number {
    return this.ink.width;
  }

  protected tick(dt: number): void {
    if (this.keys?.warm.some(k => Phaser.Input.Keyboard.JustDown(k))) this.warm();
    if (this.warming > 0) {
      this.warming -= dt;
      if (this.warming <= 0) {
        this.warmth = 1;
        this.statusText.setText('');
      }
      return;
    }
    this.warmth = Math.max(0, this.warmth - INK_COLD * dt);

    const speed = this.lineWidth / WRITE_SECONDS;
    let want = 0;
    if (this.keys?.write.some(k => k.isDown)) want = speed * 0.8 * dt;
    const p = this.input.activePointer;
    if (p.isDown) {
      const right = this.ink.x + this.lineWidth / 2;
      const nearLine = Math.abs(p.y - this.ink.y) < this.ink.height * 0.6;
      const reach = right - p.x;
      if (nearLine && reach > this.written && reach - this.written < this.lineWidth * 0.2) {
        want = Math.max(want, Math.min(reach - this.written, speed * dt));
      }
    }
    if (want > 0) {
      if (this.warmth <= 0) {
        this.statusText.setText(t('The ink has thickened in the pen and will not flow. Warm it at the brazier.'));
      } else {
        this.written = Math.min(this.lineWidth, this.written + want);
        this.warmth = Math.max(0, this.warmth - INK_USE * want / speed);
        playSfx('scratch');
        this.updateCrop();
      }
    }

    if (this.written >= this.lineWidth - 1) this.finish({ ch6CopiedLine: 'whole' });
    else if (this.elapsed >= DAYLIGHT) this.finish({ ch6CopiedLine: 'part' });
  }

  private updateCrop(): void {
    const w = this.lineWidth;
    this.ink.setCrop(w - this.written, 0, this.written, this.ink.height);
  }

  protected draw(area: PlayArea): void {
    const g = this.gfx;
    const light = Phaser.Math.Clamp(1 - this.elapsed / DAYLIGHT, 0, 1);

    // The cold room, and the window's light going.
    g.fillStyle(0x1a1612, 1).fillRect(area.x, area.y, area.width, area.height);
    g.fillStyle(0x9fb4c8, 0.05 + light * 0.18).fillRect(area.x + area.width * 0.05, area.y, area.width * 0.12, area.height * 0.5);
    g.lineStyle(4, 0x2a221a, 1).lineBetween(area.x + area.width * 0.11, area.y, area.x + area.width * 0.11, area.y + area.height * 0.5);

    // The sheet.
    const paperW = Math.min(area.width * 0.92, 900);
    const paperH = Math.min(area.height * 0.6, this.guide.height * 2.6);
    const px = area.cx - paperW / 2;
    const py = this.guide.y - paperH * 0.45;
    const dim = 0.55 + light * 0.45;
    g.fillStyle(Phaser.Display.Color.GetColor(236 * dim, 222 * dim, 188 * dim), 1).fillRect(px, py, paperW, paperH);
    g.lineStyle(1, 0x8a7350, 0.6).strokeRect(px + 10, py + 10, paperW - 20, paperH - 20);

    // The pen nib at the end of the line written so far.
    const nx = this.ink.x + this.lineWidth / 2 - this.written;
    const ny = this.ink.y;
    const flowing = this.warmth > 0 && this.warming <= 0;
    g.lineStyle(3, flowing ? 0x3a2412 : 0x6a7a8a, 1).lineBetween(nx, ny, nx + 26, ny - 46);
    g.fillStyle(flowing ? 0x2a1a0c : 0x6a7a8a, 1).fillCircle(nx, ny, 3);

    // The brazier and the inkwell over it, bottom right.
    const bx = area.x + area.width * 0.84;
    const by = area.y + area.height * 0.72;
    const r = Math.max(22, Math.min(area.width, area.height) * 0.055);
    g.fillStyle(0x3a2a1a, 1).fillEllipse(bx, by + r * 0.9, r * 3, r * 1.1);
    const coal = 0.5 + 0.3 * Math.sin(this.elapsed * 3) + (this.warming > 0 ? 0.3 : 0);
    g.fillStyle(0xff6a20, Math.min(1, coal)).fillEllipse(bx, by + r * 0.75, r * 2.2, r * 0.5);
    g.fillStyle(0x1a120a, 1).fillCircle(bx, by, r);
    g.fillStyle(0x0a0604, 1).fillCircle(bx, by - r * 0.15, r * 0.55);
    this.inkwell.setTo(bx, by, r * 1.6);
    if (this.warmth < 0.3 && this.warming <= 0) {
      g.lineStyle(2, 0xf3d98a, 0.5 + 0.4 * Math.sin(this.elapsed * 6)).strokeCircle(bx, by, r * 1.35);
    }

    // How warm the ink is, beside the inkwell.
    const mh = r * 3;
    g.fillStyle(0x2a1c10, 1).fillRect(bx - r * 2.2, by - mh / 2, 8, mh);
    g.fillStyle(this.warmth > 0.3 ? 0xd07a3a : 0x7a9ab8, 1).fillRect(bx - r * 2.2, by + mh / 2 - mh * this.warmth, 8, mh * this.warmth);

    // The daylight left, along the top of the sheet.
    g.fillStyle(0x9fb4c8, 0.7).fillRect(px, py - 8, paperW * light, 3);
  }

  protected skipResult(): FlagState {
    return { ch6CopiedLine: 'part' };
  }
}
