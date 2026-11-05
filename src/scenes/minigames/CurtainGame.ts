import Phaser from 'phaser';
import type { FlagState } from '../../dialogue/types';
import { playSfx } from '../../audio';
import { localizedStyle, t, wrapsBetweenCharacters } from '../../i18n';
import { responsiveFont } from '../../ui/responsive';
import { MiniGameScene, type PlayArea } from './MiniGameScene';

/** What she is teaching as the player kneels down, before she notices the newcomer. */
const LINES: Array<() => string> = [
  () => t('For every term there is a Book. So it is written, and we have read it a thousand times without believing it.'),
  () => t('The late Siyyid told you the time was near. He did not tell you it was far.'),
  () => t('You ask for signs in the sky. Look instead at the hearts that have begun to turn.'),
  () => t('The night is long only for those who mean to sleep through the dawn.'),
];
/** Seconds per word as she speaks; a pause between lines. */
const WORD_SECONDS = 0.42;
const LINE_PAUSE = 1.6;
/** How near (as a share of the curtain's width) the listener must lean to catch a word. */
const NEAR = 0.16;
const NEAR_IN_DRUMS = 0.07;
const LEAN_SPEED = 0.7;

/** A line split into the pieces caught or lost one at a time: words, or for unspaced scripts, a few characters. */
function pieces(line: string): string[] {
  if (/\s/.test(line.trim())) return line.split(/\s+/).filter(Boolean);
  const chars = Array.from(line);
  const out: string[] = [];
  for (let i = 0; i < chars.length; i += 3) out.push(chars.slice(i, i + 3).join(''));
  return out;
}

/**
 * Karbilá (the Qazvín chapter): the player kneels at the curtain's edge and
 * listens to Qurratu'l-ʿAyn teaching beyond it. Sight is no help; there is
 * only a shadow on the cloth where the lamp is, moving as she turns to a
 * page or to her listeners. The player leans along the curtain to stay near
 * her voice; words spoken while they are near are caught, the rest lost.
 * When the Muḥarram drums pass in the lane, the voice is harder to follow
 * and they must lean closer.
 *
 * Result: `qzListened`, 'clear' or 'part'.
 */
export class CurtainGame extends MiniGameScene {
  constructor() {
    super('CurtainGame');
  }

  readonly heading = 'At the Curtain\'s Edge';
  protected readonly hint = 'Lean along the curtain toward her voice: move the pointer, or ← and →. Words you are near enough to hear stay with you.';
  protected readonly touchHint = 'Lean along the curtain toward her voice: drag your finger. Words you are near enough to hear stay with you.';

  /** When the pause after a line ends and the next begins (or the game ends). */
  private lineStartsAt = Number.POSITIVE_INFINITY;
  private lean = 0.5;
  private leanTarget = 0.5;
  private voice = 0.5;
  private line = 0;
  private words: string[] = [];
  private caught: boolean[] = [];
  private spoken = 0;
  private nextWordAt = 1.2;
  private drumsUntil = 0;
  private nextDrumsAt = 9;
  private caughtTotal = 0;
  private wordTotal = 0;
  private keys?: { left: Phaser.Input.Keyboard.Key[]; right: Phaser.Input.Keyboard.Key[] };
  private heardText!: Phaser.GameObjects.Text;
  private noiseText!: Phaser.GameObjects.Text;

  protected begin(): void {
    this.lean = 0.5;
    this.leanTarget = 0.5;
    this.line = 0;
    this.nextWordAt = 1.2;
    this.lineStartsAt = Number.POSITIVE_INFINITY;
    this.drumsUntil = 0;
    this.nextDrumsAt = 9 + Math.random() * 3;
    this.caughtTotal = 0;
    this.wordTotal = 0;
    this.startLine();
    const kb = this.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = { left: [kb.addKey(K.LEFT), kb.addKey(K.A)], right: [kb.addKey(K.RIGHT), kb.addKey(K.D)] };
    }
    const aim = (p: Phaser.Input.Pointer) => {
      const r = this.curtain(this.area());
      this.leanTarget = Phaser.Math.Clamp((p.x - r.x) / r.width, 0, 1);
    };
    this.input.on('pointermove', aim);
    this.input.on('pointerdown', aim);
    const size = this.scale;
    this.heardText = this.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(20, size, 15), color: '#f6e7c0', align: 'center', lineSpacing: 4,
    }, 'center')).setOrigin(0.5, 0);
    this.noiseText = this.add.text(0, 0, t('Drums in the lane. The voice thins; lean closer.'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(15, size, 13), color: '#c98a6a', fontStyle: 'italic', align: 'center',
    }, 'center')).setOrigin(0.5, 0).setVisible(false);
  }

  private startLine(): void {
    this.words = pieces(LINES[this.line]!());
    this.caught = [];
    this.spoken = 0;
  }

  private curtain(area: PlayArea): Phaser.Geom.Rectangle {
    const w = Math.min(area.width * 0.92, 900);
    return new Phaser.Geom.Rectangle(area.cx - w / 2, area.y + 8, w, area.height * 0.55);
  }

  protected layout(area: PlayArea): void {
    const r = this.curtain(area);
    this.heardText.setPosition(area.cx, r.bottom + 34).setWordWrapWidth(r.width * 0.95, wrapsBetweenCharacters());
    this.noiseText.setPosition(area.cx, r.y + 6);
  }

  protected tick(dt: number): void {
    const left = this.keys?.left.some(k => k.isDown);
    const right = this.keys?.right.some(k => k.isDown);
    if (left || right) {
      this.lean = Phaser.Math.Clamp(this.lean + ((right ? 1 : 0) - (left ? 1 : 0)) * LEAN_SPEED * dt, 0, 1);
      this.leanTarget = this.lean;
    } else {
      this.lean += (this.leanTarget - this.lean) * Math.min(1, dt * 6);
    }

    // She moves: slowly between the lamp and her listeners, now and then crossing the room.
    const e = this.elapsed;
    this.voice = Phaser.Math.Clamp(0.5 + Math.sin(e * 0.23) * 0.3 + Math.sin(e * 0.61 + 1) * 0.12, 0.08, 0.92);

    if (e >= this.nextDrumsAt) {
      this.drumsUntil = e + 4.5;
      this.nextDrumsAt = e + 11 + Math.random() * 5;
      playSfx('murmur');
    }
    const drums = e < this.drumsUntil;
    this.noiseText.setVisible(drums);

    if (e >= this.lineStartsAt) this.nextLine();
    else if (e >= this.nextWordAt) this.speakWord(drums);
  }

  private nextLine(): void {
    this.lineStartsAt = Number.POSITIVE_INFINITY;
    if (this.line >= LINES.length) {
      this.finish({ qzListened: this.caughtTotal >= this.wordTotal * 0.7 ? 'clear' : 'part' });
      return;
    }
    this.startLine();
    this.nextWordAt = this.elapsed + WORD_SECONDS;
  }

  private speakWord(drums: boolean): void {
    const near = Math.abs(this.lean - this.voice) < (drums ? NEAR_IN_DRUMS : NEAR);
    this.caught[this.spoken] = near;
    this.spoken++;
    this.wordTotal++;
    if (near) this.caughtTotal++;
    this.heardText.setText(this.words.slice(0, this.spoken).map((w, i) => (this.caught[i] ? w : '…')).join(this.joiner()));
    this.nextWordAt = this.elapsed + WORD_SECONDS;
    if (this.spoken < this.words.length) return;

    // The next line (or the end) comes after a pause, on the same clock as the words.
    this.line++;
    this.lineStartsAt = this.elapsed + LINE_PAUSE;
    this.nextWordAt = Number.POSITIVE_INFINITY;
  }

  private joiner(): string {
    return /\s/.test(LINES[Math.min(this.line, LINES.length - 1)]!().trim()) ? ' ' : '';
  }

  protected draw(area: PlayArea): void {
    const g = this.gfx;
    const r = this.curtain(area);
    g.fillStyle(0x120c08, 1).fillRect(area.x, area.y, area.width, area.height);

    // The curtain, lit from behind by her lamp.
    const lampX = r.x + r.width * 0.5;
    g.fillStyle(0x5a3a2a, 1).fillRect(r.x, r.y, r.width, r.height);
    g.fillStyle(0xffb860, 0.22).fillEllipse(lampX, r.y + r.height * 0.55, r.width * 0.7, r.height * 0.9);
    const folds = 18;
    for (let i = 0; i < folds; i++) {
      const fx = r.x + (i + 0.5) * r.width / folds;
      g.fillStyle(0x000000, 0.12 + 0.06 * Math.sin(i * 1.7)).fillRect(fx - 3, r.y, 6, r.height);
    }
    // Her shadow on the cloth.
    const sx = r.x + this.voice * r.width;
    const sy = r.bottom - r.height * 0.08;
    g.fillStyle(0x1a0e08, 0.55).fillTriangle(sx - r.height * 0.14, sy, sx + r.height * 0.14, sy, sx, sy - r.height * 0.55);
    g.fillCircle(sx, sy - r.height * 0.6, r.height * 0.07);
    // The rail and the hem.
    g.fillStyle(0x3a2616, 1).fillRect(r.x - 6, r.y - 6, r.width + 12, 8);
    g.fillStyle(0x2a1a10, 1).fillRect(r.x, r.bottom, r.width, 6);

    // Where the player has leaned: a hand on the hem, and the reach of their hearing.
    const drums = this.elapsed < this.drumsUntil;
    const reach = (drums ? NEAR_IN_DRUMS : NEAR) * r.width;
    const lx = r.x + this.lean * r.width;
    const near = Math.abs(this.lean - this.voice) * r.width < reach;
    g.fillStyle(near ? 0xf3d98a : 0x8a7a5a, near ? 0.22 : 0.12).fillRect(lx - reach, r.bottom + 8, reach * 2, 10);
    g.fillStyle(near ? 0xf3d98a : 0xb8a07a, 1).fillCircle(lx, r.bottom + 13, 6);
    if (drums) {
      g.lineStyle(2, 0xc98a6a, 0.3 + 0.3 * Math.abs(Math.sin(this.elapsed * 7)));
      for (let k = 1; k <= 3; k++) g.strokeCircle(area.x + 16, r.y + r.height * 0.4, k * 14 + (this.elapsed * 30) % 14);
    }
  }

  protected skipResult(): FlagState {
    return { qzListened: 'part' };
  }
}
