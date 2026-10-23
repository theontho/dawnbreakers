import Phaser from 'phaser';
import type { FlagState } from '../../dialogue/types';
import { playSfx } from '../../audio';
import { localizedStyle, t } from '../../i18n';
import { responsiveFont } from '../../ui/responsive';
import { MiniGameScene, type PlayArea } from './MiniGameScene';

/** Seconds of light the sailors need to lash the cask. */
const LASH_SECONDS = 36;
/** How close (in shield units, -1 left to 1 right) the cloak must be to the wind to turn it. */
const SHELTER = 0.22;
const SHELTER_FALLOFF = 0.45;
const WARN_SECONDS = 1.1;
const RELIGHT_SECONDS = 2.2;
const SHIELD_SPEED = 2.4;

type Gust = { from: number; strength: number; warnAt: number; startAt: number; endAt: number };

/**
 * The storm night aboard ship (chapter 3): a sailor pushes the galley
 * lantern into the player's hands so the crew can see to lash a loose cask.
 * Gusts come from one side or the other, or down off the sail; the player
 * turns a fold of cloak toward each one before it arrives. When the flame
 * drowns, Mubárak relights it from the galley coals and the work waits.
 * Through all of it the lamp behind the cabin lattice never goes out.
 *
 * Result: `ch3LanternOuts`, how many times the flame went out.
 */
export class LampGame extends MiniGameScene {
  constructor() {
    super('LampGame');
  }

  readonly heading = 'The Galley Lantern';
  protected readonly hint = 'Turn your cloak into the wind: move the pointer, or ← and →. Watch the spray for where the next gust comes from.';

  private shield = 0;
  private shieldTarget = 0;
  private flame = 1;
  private outs = 0;
  private relightLeft = 0;
  private lashed = 0;
  private gusts: Gust[] = [];
  private nextGustAt = 2;
  private keys?: { left: Phaser.Input.Keyboard.Key[]; right: Phaser.Input.Keyboard.Key[] };
  private statusText!: Phaser.GameObjects.Text;
  private lashText!: Phaser.GameObjects.Text;
  private rain: Array<{ x: number; y: number; speed: number }> = [];

  protected begin(): void {
    this.shield = 0;
    this.shieldTarget = 0;
    this.flame = 1;
    this.outs = 0;
    this.relightLeft = 0;
    this.lashed = 0;
    this.gusts = [];
    this.nextGustAt = 2;
    this.rain = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), speed: 0.6 + Math.random() * 0.8 }));
    const kb = this.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = {
        left: [kb.addKey(K.LEFT), kb.addKey(K.A)],
        right: [kb.addKey(K.RIGHT), kb.addKey(K.D)],
      };
    }
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => this.aimAt(p));
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => this.aimAt(p));
    const size = this.scale;
    this.statusText = this.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(18, size, 14), color: '#f0e4c8', align: 'center',
      fontStyle: 'italic',
    }, 'center')).setOrigin(0.5, 0);
    this.lashText = this.add.text(0, 0, t('The sailors lash the cask'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(15, size, 13), color: '#c9b07a', align: 'center',
    }, 'center')).setOrigin(0.5, 1);
  }

  protected layout(area: PlayArea): void {
    this.statusText.setPosition(area.cx, area.y + area.height * 0.84).setWordWrapWidth(area.width * 0.9);
    this.lashText.setPosition(area.cx, area.y + area.height * 0.08 - 6);
  }

  private aimAt(p: Phaser.Input.Pointer): void {
    const area = this.area();
    this.shieldTarget = Phaser.Math.Clamp((p.x - area.cx) / (Math.min(area.width, area.height) * 0.35), -1, 1);
  }

  protected tick(dt: number): void {
    const left = this.keys?.left.some(k => k.isDown);
    const right = this.keys?.right.some(k => k.isDown);
    if (left || right) {
      this.shield = Phaser.Math.Clamp(this.shield + ((right ? 1 : 0) - (left ? 1 : 0)) * SHIELD_SPEED * dt, -1, 1);
      this.shieldTarget = this.shield;
    } else {
      this.shield += (this.shieldTarget - this.shield) * Math.min(1, dt * 12);
    }

    this.scheduleGusts();
    const gust = this.gusts.find(g => this.elapsed >= g.startAt && this.elapsed < g.endAt);

    if (this.relightLeft > 0) {
      this.relightLeft -= dt;
      if (this.relightLeft <= 0) {
        this.flame = 0.55;
        playSfx('warm');
        this.statusText.setText('');
      }
      return;
    }

    if (gust) {
      const miss = Math.abs(this.shield - gust.from);
      const exposure = Phaser.Math.Clamp((miss - SHELTER) / SHELTER_FALLOFF, 0, 1);
      this.flame -= exposure * gust.strength * 0.62 * dt;
    } else {
      this.flame = Math.min(1, this.flame + 0.1 * dt);
    }

    if (this.flame <= 0) {
      this.flame = 0;
      this.outs++;
      this.relightLeft = RELIGHT_SECONDS;
      this.statusText.setText(t('The flame drowns. Mubárak cups an ember from the galley and lights it again.'));
      return;
    }
    this.lashed += dt * (0.4 + 0.6 * this.flame);
    if (this.lashed >= LASH_SECONDS) this.finish({ ch3LanternOuts: this.outs });
  }

  /** Gusts come quicker as the night goes on, each warned of by spray from its side. */
  private scheduleGusts(): void {
    if (this.elapsed < this.nextGustAt - WARN_SECONDS) return;
    const warnAt = this.nextGustAt - WARN_SECONDS;
    const late = Math.min(1, this.lashed / LASH_SECONDS);
    const sides = [-1, -0.5, 0, 0.5, 1];
    const last = this.gusts[this.gusts.length - 1]?.from;
    const from = Phaser.Utils.Array.GetRandom(sides.filter(s => s !== last)) as number;
    const length = 1.3 + Math.random() * 0.9;
    this.gusts.push({ from, strength: 0.75 + Math.random() * 0.35 + late * 0.2, warnAt, startAt: this.nextGustAt, endAt: this.nextGustAt + length });
    this.time.delayedCall(WARN_SECONDS * 1000, () => playSfx('gust'));
    this.nextGustAt += length + Phaser.Math.Linear(2.4, 1.2, late) + Math.random() * 1.2;
    this.gusts = this.gusts.filter(g => g.endAt > this.elapsed - 1);
  }

  protected draw(area: PlayArea): void {
    const g = this.gfx;
    const size = Math.min(area.width, area.height);
    const roll = Math.sin(this.elapsed * 0.9) * 0.08 + Math.sin(this.elapsed * 2.3) * 0.02;

    // Sky and sea, the horizon swinging with the roll.
    g.fillStyle(0x0b1222, 1).fillRect(area.x, area.y, area.width, area.height);
    const hy = area.cy - size * 0.05;
    const dx = area.width / 2;
    g.fillStyle(0x060a14, 1);
    g.fillPoints([
      { x: area.x, y: hy - Math.tan(roll) * dx },
      { x: area.x + area.width, y: hy + Math.tan(roll) * dx },
      { x: area.x + area.width, y: area.y + area.height },
      { x: area.x, y: area.y + area.height },
    ], true);

    // Rain, driven by the gust that is blowing.
    const gust = this.gusts.find(gu => this.elapsed >= gu.startAt && this.elapsed < gu.endAt);
    const drift = gust ? -gust.from * 0.9 : Math.sin(this.elapsed * 0.4) * 0.2;
    g.lineStyle(1, 0x8fa6c8, 0.35);
    for (const r of this.rain) {
      r.y = (r.y + r.speed * 0.016) % 1;
      r.x = (r.x + drift * 0.006 + 1) % 1;
      const x = area.x + r.x * area.width;
      const y = area.y + r.y * area.height;
      g.lineBetween(x, y, x + drift * 10, y + 14);
    }

    // Spray thrown from the side the next gust will come from.
    const warning = this.gusts.find(gu => this.elapsed >= gu.warnAt && this.elapsed < gu.endAt);
    if (warning) this.drawSpray(area, size, warning);

    // The lantern, held in the middle, and the flame inside it.
    const lx = area.cx;
    const ly = area.cy + size * 0.05;
    const glow = this.relightLeft > 0 ? 0 : this.flame;
    g.fillStyle(0xffb050, 0.08 + glow * 0.12).fillCircle(lx, ly, size * (0.18 + glow * 0.14));
    g.fillStyle(0xffc070, 0.1 + glow * 0.1).fillCircle(lx, ly, size * 0.11);
    g.lineStyle(3, 0x8a6a34, 1).strokeRect(lx - size * 0.05, ly - size * 0.08, size * 0.1, size * 0.15);
    g.fillStyle(0x8a6a34, 1).fillTriangle(lx - size * 0.06, ly - size * 0.08, lx + size * 0.06, ly - size * 0.08, lx, ly - size * 0.13);
    g.lineStyle(2, 0x8a6a34, 1).strokeCircle(lx, ly - size * 0.145, size * 0.015);
    if (glow > 0) {
      const lean = gust ? -gust.from * 0.5 * Phaser.Math.Clamp((Math.abs(this.shield - gust.from) - SHELTER) / SHELTER_FALLOFF, 0, 1) : 0;
      const flicker = 1 + Math.sin(this.elapsed * 23) * 0.06 + Math.sin(this.elapsed * 37) * 0.04;
      const fh = size * 0.07 * (0.35 + glow * 0.65) * flicker;
      g.fillStyle(0xff8a2a, 1).fillTriangle(lx - fh * 0.28, ly + size * 0.04, lx + fh * 0.28, ly + size * 0.04, lx + lean * fh, ly + size * 0.04 - fh);
      g.fillStyle(0xfff0b0, 1).fillTriangle(lx - fh * 0.14, ly + size * 0.04, lx + fh * 0.14, ly + size * 0.04, lx + lean * fh * 0.8, ly + size * 0.04 - fh * 0.6);
    } else if (this.relightLeft > 0) {
      g.fillStyle(0xff5a1a, 0.5 + Math.sin(this.elapsed * 9) * 0.3).fillCircle(lx + size * 0.12, ly + size * 0.06, size * 0.012);
    }

    // The fold of cloak: an arc on the side the player has turned it to.
    const angle = -Math.PI / 2 + this.shield * Math.PI / 2;
    const r = size * 0.16;
    g.lineStyle(size * 0.035, 0x5a3f2a, 1);
    g.beginPath();
    g.arc(lx, ly - size * 0.02, r, angle - 0.6, angle + 0.6);
    g.strokePath();
    g.lineStyle(2, 0x8a6a4a, 1);
    g.beginPath();
    g.arc(lx, ly - size * 0.02, r + size * 0.018, angle - 0.6, angle + 0.6);
    g.strokePath();

    // The lamp behind the lattice, far off at the stern: steady all night.
    const sx = area.x + area.width * 0.12;
    const sy = hy - Math.tan(roll) * (dx - area.width * 0.12) - size * 0.02;
    g.fillStyle(0xffc070, 0.25).fillCircle(sx, sy, size * 0.03);
    g.fillStyle(0xffe0a0, 1).fillCircle(sx, sy, size * 0.007);

    // How far the lashing has come.
    const barW = area.width * 0.5;
    const bx = area.cx - barW / 2;
    const by = area.y + area.height * 0.08;
    g.fillStyle(0x2a1c10, 0.9).fillRect(bx, by, barW, 6);
    g.fillStyle(0xc9a55c, 1).fillRect(bx, by, barW * Math.min(1, this.lashed / LASH_SECONDS), 6);
  }

  private drawSpray(area: PlayArea, size: number, gust: Gust): void {
    const g = this.gfx;
    const coming = this.elapsed < gust.startAt;
    const angle = -Math.PI / 2 + gust.from * Math.PI / 2;
    const ox = area.cx + Math.cos(angle) * size * 0.42;
    const oy = area.cy + Math.sin(angle) * size * 0.42;
    const pulse = coming ? 0.5 + 0.5 * Math.sin(this.elapsed * 14) : 1;
    g.lineStyle(2, 0xcfe0f5, 0.25 + 0.45 * pulse);
    for (let i = 0; i < 9; i++) {
      const spread = (i - 4) * 0.09;
      const a = angle + Math.PI + spread;
      const len = size * (coming ? 0.06 : 0.16) * (0.6 + ((i * 37) % 5) / 8);
      const sx = ox + Math.cos(angle + Math.PI / 2) * spread * size * 0.4;
      const sy = oy + Math.sin(angle + Math.PI / 2) * spread * size * 0.4;
      g.lineBetween(sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
    }
  }

  protected skipResult(): FlagState {
    return { ch3LanternOuts: 1 };
  }
}
