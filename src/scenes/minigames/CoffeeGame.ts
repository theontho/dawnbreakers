import Phaser from 'phaser';
import type { FlagState } from '../../dialogue/types';
import { playSfx } from '../../audio';
import { localizedStyle, t, wrapsBetweenCharacters } from '../../i18n';
import { responsiveFont } from '../../ui/responsive';
import { MiniGameScene, type PlayArea } from './MiniGameScene';

/** Where the player can stand: by the coffee-maker, at the foot of the steps, at the doors. */
const STATIONS = 3;
const COFFEE = 0;
const DOORS = 2;
const STEP_SECONDS = 0.55;
const DOOR_OPEN_SECONDS = 3.2;
/** Seconds a tray of coffee stays hot. */
const HOT_SECONDS = 16;
/** Below this the coffee is cold: no reason to stand at the doors. */
const COLD = 0.2;
const SUSPICION_LIMIT = 1.3;

/**
 * What carries through the doors when they open: the questions from the
 * divines' side of the hall, after Nabíl's account. The answers are never
 * heard out here; the page tells them afterward.
 */
const FRAGMENTS: Array<() => string> = [
  () => t('The Niẓámu\'l-ʿUlamá: "Whom do you claim to be, and what is the message which you have brought?"'),
  () => t('A stir along the walls. Someone repeats a word as if he cannot believe it: the Qáʾim.'),
  () => t('Mullá Muḥammad of Mamaqán: "You wretched and immature lad of Shíráz! You have already convulsed and subverted ʿIráq; do you now wish to arouse a like turmoil in Ádhirbáyján?"'),
  () => t('A voice asks for proof. Another, for verses, here, before them all.'),
  () => t('Chanting begins, and a dry voice cuts across it: a point of grammar, a case ending, a rule.'),
  () => t('A question about the tense of a word. Then a long silence, and the rustle of a whole room rising to its feet.'),
];

/**
 * The trial at Tabríz (1848): the player, taken on to carry coffee, waits
 * at the foot of the hall steps. Now and then a servant goes in and the
 * doors stand open for a moment; whoever is on the top step with a hot tray
 * to hand in hears what is being said. Standing there with cold coffee
 * draws the farrásh's eye, and he sends the player down. The coffee cools;
 * the coffee-maker's brazier is at the bottom of the court.
 *
 * Result: `trialOverheard`, how many of the six moments were caught.
 */
export class CoffeeGame extends MiniGameScene {
  constructor() {
    super('CoffeeGame');
  }

  readonly heading = 'At the Doors of the Hall';
  protected readonly hint = 'Climb with ↑ and go down with ↓, or click where to stand. Fill the tray at the coffee-maker, and be at the doors with hot coffee when they open.';
  protected readonly touchHint = 'Tap where to stand. Fill the tray at the coffee-maker, and be at the doors with hot coffee when they open.';

  private station = 1;
  private moving = 0;
  private from = 1;
  private hot = 1;
  private suspicion = 0;
  private openings: number[] = [];
  private next = 0;
  private openUntil = -1;
  /** The fragment the doors were last opened on. */
  private opened = -1;
  private heard: boolean[] = [];
  private keys?: { up: Phaser.Input.Keyboard.Key[]; down: Phaser.Input.Keyboard.Key[] };
  private lineText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private lineUntil = 0;
  private statusUntil = 0;

  protected begin(): void {
    this.station = 1;
    this.moving = 0;
    this.from = 1;
    this.hot = 1;
    this.suspicion = 0;
    this.next = 0;
    this.openUntil = -1;
    this.opened = -1;
    this.heard = [];
    this.openings = FRAGMENTS.map((_, i) => 5 + i * 7.5 + Math.random() * 2.5);
    const kb = this.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = { up: [kb.addKey(K.UP), kb.addKey(K.W)], down: [kb.addKey(K.DOWN), kb.addKey(K.S)] };
    }
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      const area = this.area();
      const target = Phaser.Math.Clamp(Math.round((this.stationY(area, 0) - p.y) / this.stationGap(area)), 0, STATIONS - 1);
      this.goTo(target);
    });
    const size = this.scale;
    this.lineText = this.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 14), color: '#f6e7c0', align: 'center',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 8 },
    }, 'center')).setOrigin(0.5, 0).setVisible(false);
    this.statusText = this.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(16, size, 13), color: '#d8c79e', fontStyle: 'italic', align: 'center',
    }, 'center')).setOrigin(0.5, 0);
  }

  protected layout(area: PlayArea): void {
    this.lineText.setPosition(area.cx, area.y + 4).setWordWrapWidth(Math.min(area.width * 0.9, 760), wrapsBetweenCharacters());
    this.statusText.setPosition(area.cx, area.y + area.height - 28).setWordWrapWidth(area.width * 0.9, wrapsBetweenCharacters());
  }

  private stationGap(area: PlayArea): number {
    return area.height * 0.2;
  }

  private stationY(area: PlayArea, station: number): number {
    return area.y + area.height * 0.84 - station * this.stationGap(area);
  }

  private goTo(target: number): void {
    if (this.moving > 0 || target === this.station) return;
    this.from = this.station;
    this.station = this.station + Math.sign(target - this.station);
    this.moving = STEP_SECONDS;
  }

  private say(text: string, seconds: number): void {
    this.statusText.setText(text);
    this.statusUntil = this.elapsed + seconds;
  }

  protected tick(dt: number): void {
    if (this.keys?.up.some(k => Phaser.Input.Keyboard.JustDown(k))) this.goTo(this.station + 1);
    if (this.keys?.down.some(k => Phaser.Input.Keyboard.JustDown(k))) this.goTo(this.station - 1);
    this.moving = Math.max(0, this.moving - dt);
    const standing = this.moving === 0;

    if (standing && this.station === COFFEE) {
      if (this.hot < 1) playSfx('clink');
      this.hot = Math.min(1, this.hot + dt * 1.6);
    } else {
      this.hot = Math.max(0, this.hot - dt / HOT_SECONDS);
    }

    const open = this.elapsed < this.openUntil;
    if (standing && this.station === DOORS && !open && this.hot < COLD) {
      this.suspicion += dt;
      if (this.suspicion > SUSPICION_LIMIT) {
        this.suspicion = 0;
        this.from = DOORS;
        this.station = DOORS - 1;
        this.moving = STEP_SECONDS;
        this.say(t('The farrásh jerks his chin: down. Cold coffee is no reason to stand at the doors.'), 3);
      }
    } else {
      this.suspicion = Math.max(0, this.suspicion - dt);
    }

    const at = this.openings[this.next];
    if (at !== undefined && this.elapsed >= at) this.openDoors();
    else this.listen();
    if (this.elapsed > this.lineUntil) this.lineText.setVisible(false);
    if (this.elapsed > this.statusUntil) this.statusText.setText('');

    if (this.next >= FRAGMENTS.length && this.elapsed > this.openUntil + 3) {
      this.finish({ trialOverheard: this.heard.filter(Boolean).length });
    }
  }

  private openDoors(): void {
    this.opened = this.next++;
    this.openUntil = this.elapsed + DOOR_OPEN_SECONDS;
    this.heard[this.opened] = false;
    if (!this.listen()) {
      playSfx('murmur');
      this.say(t('A servant goes in. Voices spill out, too far away for words.'), 2.5);
    }
  }

  /** While the doors stand open, whoever reaches the top step with hot coffee hears what is said. */
  private listen(): boolean {
    const i = this.opened;
    if (i < 0 || this.heard[i] || this.elapsed >= this.openUntil) return false;
    if (this.moving > 0 || this.station !== DOORS || this.hot < COLD) return false;
    this.heard[i] = true;
    playSfx('clink');
    this.hot = Math.max(0, this.hot - 0.25);
    this.lineText.setText(FRAGMENTS[i]!()).setVisible(true);
    this.lineUntil = this.elapsed + 6.5;
    this.statusText.setText('');
    return true;
  }

  protected draw(area: PlayArea): void {
    const g = this.gfx;
    const gap = this.stationGap(area);
    const steps = Math.min(area.width * 0.5, 420);

    // The court in evening light, and the hall's façade above the steps.
    g.fillStyle(0x2a2016, 1).fillRect(area.x, area.y, area.width, area.height);
    const topY = this.stationY(area, DOORS);
    g.fillStyle(0x4a3826, 1).fillRect(area.cx - steps * 0.75, area.y, steps * 1.5, topY - area.y);
    for (let s = 0; s < 6; s++) {
      const y = topY + s * (gap * 2 / 6);
      const w = steps * (0.6 + s * 0.08);
      g.fillStyle(s % 2 ? 0x8a7458 : 0x9a8466, 1).fillRect(area.cx - w / 2, y, w, gap * 2 / 6 + 1);
    }

    // The doors, opening a crack of lamplight when a servant passes.
    const open = this.elapsed < this.openUntil;
    const dw = steps * 0.36;
    const dh = Math.min(gap * 1.4, topY - area.y - 10);
    const dy = topY - dh;
    const crack = open ? Math.min(1, (this.openUntil - this.elapsed) * 3, (this.elapsed - (this.openUntil - DOOR_OPEN_SECONDS)) * 4) : 0;
    g.fillStyle(0xffc070, 0.9).fillRect(area.cx - dw / 2, dy, dw, dh);
    const leaf = dw / 2 * (1 - crack * 0.7);
    g.fillStyle(0x5a3a1e, 1).fillRect(area.cx - dw / 2, dy, leaf, dh).fillRect(area.cx + dw / 2 - leaf, dy, leaf, dh);
    g.lineStyle(2, 0x2a1a0c, 1).strokeRect(area.cx - dw / 2, dy, dw, dh);
    if (open) g.fillStyle(0xffc070, 0.12 * crack).fillTriangle(area.cx - dw / 2, topY, area.cx + dw / 2, topY, area.cx, topY + gap * 1.5);

    // The farrásh beside the doors, watching.
    const fx = area.cx + dw / 2 + 26;
    this.figure(fx, topY, 0x3a4a6a, this.suspicion > 0.4 ? 0.9 : 0);

    // The slippers on the lowest step.
    const slipY = this.stationY(area, 1) + 6;
    [0xa03a2a, 0x2a6a3a, 0x1a1a1a, 0xe8e0d0].forEach((c, i) => {
      g.fillStyle(c, 1).fillEllipse(area.cx - 60 + i * 34, slipY, 16, 6);
    });

    // The coffee-maker at his brazier, bottom of the court.
    const cy = this.stationY(area, COFFEE);
    const cx = area.cx - steps * 0.55;
    g.fillStyle(0xff6a20, 0.6 + 0.2 * Math.sin(this.elapsed * 5)).fillEllipse(cx - 34, cy + 4, 30, 10);
    this.figure(cx - 60, cy, 0x6a4a2a, 0);

    // The player with the tray, moving between stations.
    const k = this.moving > 0 ? 1 - this.moving / STEP_SECONDS : 1;
    const py = Phaser.Math.Linear(this.stationY(area, this.from), this.stationY(area, this.station), k);
    const xOf = (station: number) => (station === COFFEE ? cx : area.cx);
    const px = Phaser.Math.Linear(xOf(this.from), xOf(this.station), k);
    this.figure(px, py, 0x8a6a4a, 0);
    g.fillStyle(0xc9a55c, 1).fillEllipse(px, py - 30, 26, 6);
    // Steam while the coffee is hot.
    if (this.hot >= COLD) {
      g.lineStyle(1.5, 0xe8e0d0, 0.2 + this.hot * 0.4);
      for (let i = -1; i <= 1; i++) {
        const sx = px + i * 7;
        const w = Math.sin(this.elapsed * 4 + i) * 3;
        g.lineBetween(sx, py - 34, sx + w, py - 46);
      }
    }
    // The tray's warmth, beside the player.
    g.fillStyle(0x2a1c10, 1).fillRect(px + 22, py - 40, 6, 36);
    g.fillStyle(this.hot >= COLD ? 0xd07a3a : 0x7a9ab8, 1).fillRect(px + 22, py - 4 - 36 * this.hot, 6, 36 * this.hot);
  }

  /** A standing figure in a long coat, feet at (x, y); `alert` tints a raised arm. */
  private figure(x: number, y: number, coat: number, alert: number): void {
    const g = this.gfx;
    g.fillStyle(coat, 1).fillTriangle(x - 10, y, x + 10, y, x, y - 30);
    g.fillStyle(0xc89a78, 1).fillCircle(x, y - 34, 6);
    g.fillStyle(0xe8e0d0, 1).fillEllipse(x, y - 39, 14, 6);
    if (alert > 0) g.lineStyle(3, coat, alert).lineBetween(x - 4, y - 24, x - 14, y - 38);
  }

  protected skipResult(): FlagState {
    return { trialOverheard: 3 };
  }
}
