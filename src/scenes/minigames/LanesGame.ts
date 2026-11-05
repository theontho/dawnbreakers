import Phaser from 'phaser';
import type { FlagState } from '../../dialogue/types';
import { playSfx } from '../../audio';
import { localizedStyle, t, wrapsBetweenCharacters } from '../../i18n';
import { responsiveFont } from '../../ui/responsive';
import { MiniGameScene, type PlayArea } from './MiniGameScene';

/** The way through the lanes, in paces. */
const LENGTH = 100;
const VIEW = 30;
const WALK_SPEED = 5;
/** Recessed doorways along the lanes, where the dark is deep enough to stand unseen. */
const DOORWAYS = [7, 17, 26, 35, 46, 56, 64, 74, 84, 93];
const DOOR_WIDTH = 2.6;
const LANTERN_REACH = 6.5;
const QUESTIONED_SECONDS = 2.6;

interface Watchman {
  from: number;
  to: number;
  x: number;
  dir: 1 | -1;
  speed: number;
  waitLeft: number;
}

/**
 * The hour before dawn in Ṭihrán (the Núr chapter): the player walks ahead
 * of Mullá Muḥammad-i-Muʿallim, who carries the scroll under his cloak,
 * through the lanes to the house of the family of Mírzá Buzurg. The night
 * watch is still going its rounds with lanterns. The player leads the way
 * from one dark doorway to the next and waits there while a lantern passes.
 * Walk into its light and the watchman stops them with questions; the
 * tutor answers for both, and the night is a little shorter.
 *
 * Result: `nurLanesNoticed`, how many times the watch stopped them.
 */
export class LanesGame extends MiniGameScene {
  constructor() {
    super('LanesGame');
  }

  readonly heading = 'Through the Dark Lanes';
  protected readonly hint = 'Walk with → and stop or step back with ←, or hold the pointer on either side. Stand in a doorway while a lantern passes.';
  protected readonly touchHint = 'Hold your finger on the right to walk, and on the left to stop or step back. Stand in a doorway while a lantern passes.';

  private x = 1;
  private noticed = 0;
  private questioned = 0;
  private grace = 0;
  private watch: Watchman[] = [];
  private keys?: { left: Phaser.Input.Keyboard.Key[]; right: Phaser.Input.Keyboard.Key[] };
  private statusText!: Phaser.GameObjects.Text;
  private steps = 0;

  protected begin(): void {
    this.x = 1;
    this.noticed = 0;
    this.questioned = 0;
    this.grace = 0;
    this.watch = [
      { from: 12, to: 40, x: 30, dir: -1, speed: 3.1, waitLeft: 0 },
      { from: 50, to: 70, x: 52, dir: 1, speed: 2.7, waitLeft: 0 },
      { from: 72, to: 96, x: 95, dir: -1, speed: 3.4, waitLeft: 0 },
    ];
    const kb = this.input.keyboard;
    if (kb) {
      const K = Phaser.Input.Keyboard.KeyCodes;
      this.keys = { left: [kb.addKey(K.LEFT), kb.addKey(K.A)], right: [kb.addKey(K.RIGHT), kb.addKey(K.D)] };
    }
    this.statusText = this.add.text(0, 0, '', localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(17, this.scale, 14), color: '#e8dcc0', fontStyle: 'italic',
      align: 'center', backgroundColor: '#0a0806aa', padding: { x: 10, y: 6 },
    }, 'center')).setOrigin(0.5, 0).setVisible(false);
  }

  protected layout(area: PlayArea): void {
    this.statusText.setPosition(area.cx, area.y + 8).setWordWrapWidth(area.width * 0.9, wrapsBetweenCharacters());
  }

  private hidden(): boolean {
    return DOORWAYS.some(d => Math.abs(this.x - d) < DOOR_WIDTH / 2);
  }

  protected tick(dt: number): void {
    for (const w of this.watch) this.patrol(w, dt);
    this.grace = Math.max(0, this.grace - dt);

    if (this.questioned > 0) {
      this.questioned -= dt;
      if (this.questioned <= 0) this.statusText.setVisible(false);
      return;
    }

    let dir = 0;
    if (this.keys?.right.some(k => k.isDown)) dir += 1;
    if (this.keys?.left.some(k => k.isDown)) dir -= 1;
    const p = this.input.activePointer;
    if (p.isDown) dir = p.x >= this.scale.width / 2 ? 1 : -1;
    if (dir !== 0) {
      this.x = Phaser.Math.Clamp(this.x + dir * WALK_SPEED * dt, 0, LENGTH);
      this.steps += dt;
    }

    if (this.grace === 0 && !this.hidden() && this.watch.some(w => Math.abs(w.x - this.x) < LANTERN_REACH)) {
      this.noticed++;
      this.questioned = QUESTIONED_SECONDS;
      this.grace = QUESTIONED_SECONDS + 3;
      playSfx('call');
      this.statusText.setText(t('"Who goes there?" A lantern in your face. "Students, to the dawn prayer," says the tutor, and the watchman waves you on, grumbling.')).setVisible(true);
    }
    if (this.x >= LENGTH - 0.5) this.finish({ nurLanesNoticed: this.noticed });
  }

  private patrol(w: Watchman, dt: number): void {
    if (w.waitLeft > 0) {
      w.waitLeft -= dt;
      return;
    }
    w.x += w.dir * w.speed * dt;
    if (w.x > w.to || w.x < w.from) {
      w.x = Phaser.Math.Clamp(w.x, w.from, w.to);
      w.dir = w.dir === 1 ? -1 : 1;
      w.waitLeft = 1.2 + Math.random() * 1.5;
    }
  }

  protected draw(area: PlayArea): void {
    const g = this.gfx;
    const unit = area.width / VIEW;
    const cam = Phaser.Math.Clamp(this.x, VIEW / 2, LENGTH - VIEW / 2);
    const sx = (wx: number) => area.cx + (wx - cam) * unit;
    const ground = area.y + area.height * 0.78;
    const wallTop = area.y + area.height * 0.22;

    // The sky greys toward dawn as they near the house.
    const dawn = Phaser.Math.Clamp(this.x / LENGTH * 0.8 + this.elapsed / 240, 0, 1);
    const sky = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x070a18), Phaser.Display.Color.ValueToColor(0x3a4060), 100, dawn * 100);
    g.fillStyle(Phaser.Display.Color.GetColor(sky.r, sky.g, sky.b), 1).fillRect(area.x, area.y, area.width, wallTop - area.y);
    for (let i = 0; i < 24; i++) {
      const starX = area.x + ((i * 97) % 100) / 100 * area.width;
      const starY = area.y + ((i * 53) % 100) / 100 * (wallTop - area.y);
      g.fillStyle(0xffffff, 0.6 * (1 - dawn)).fillCircle(starX, starY, 1);
    }

    // The lane's walls, the doorways in them, the beaten earth underfoot.
    g.fillStyle(0x2a2420, 1).fillRect(area.x, wallTop, area.width, ground - wallTop);
    g.fillStyle(0x1a1612, 1).fillRect(area.x, ground, area.width, area.y + area.height - ground);
    for (const d of DOORWAYS) {
      const dx = sx(d);
      if (dx < area.x - unit * 3 || dx > area.x + area.width + unit * 3) continue;
      const dw = DOOR_WIDTH * unit;
      const dh = (ground - wallTop) * 0.62;
      g.fillStyle(0x0a0806, 1).fillRect(dx - dw / 2, ground - dh, dw, dh);
      g.fillCircle(dx, ground - dh, dw / 2);
    }
    // The house at the end of the way.
    const hx = sx(LENGTH);
    if (hx < area.x + area.width + unit * 4) {
      g.fillStyle(0x3a3228, 1).fillRect(hx - unit * 2, wallTop - unit * 1.2, unit * 4, ground - wallTop + unit * 1.2);
      g.fillStyle(0x4a7aa0, 1).fillRect(hx - unit * 0.9, ground - unit * 3.2, unit * 1.8, unit * 3.2);
    }

    // The watch and their lanterns.
    for (const w of this.watch) {
      const wx = sx(w.x);
      if (wx < area.x - LANTERN_REACH * unit || wx > area.x + area.width + LANTERN_REACH * unit) continue;
      const flicker = 1 + Math.sin(this.elapsed * 13 + w.from) * 0.04;
      g.fillStyle(0xffb050, 0.1).fillEllipse(wx, ground - unit, LANTERN_REACH * 2 * unit * flicker, unit * 5);
      g.fillStyle(0xffc070, 0.12).fillEllipse(wx, ground - unit, LANTERN_REACH * unit * flicker, unit * 3);
      this.figure(wx, ground, unit, 0x3a3a4a);
      g.fillStyle(0xffe0a0, 1).fillCircle(wx + w.dir * unit * 0.5, ground - unit * 1.5, unit * 0.18);
    }

    // The player, and the tutor a pace behind with his hand on his cloak.
    const bob = Math.sin(this.steps * 9) * unit * 0.05;
    const hidden = this.hidden();
    this.figure(sx(this.x - 1.1), ground + bob, unit, hidden ? 0x2a2622 : 0x5a4a3a);
    this.figure(sx(this.x), ground - bob, unit, hidden ? 0x2a2622 : 0x6a5a48);

    // How far there is still to go.
    g.fillStyle(0x2a2420, 1).fillRect(area.x + area.width * 0.2, area.y + area.height - 10, area.width * 0.6, 4);
    g.fillStyle(0xc9a55c, 1).fillRect(area.x + area.width * 0.2, area.y + area.height - 10, area.width * 0.6 * this.x / LENGTH, 4);
  }

  private figure(x: number, y: number, unit: number, coat: number): void {
    const g = this.gfx;
    g.fillStyle(coat, 1).fillTriangle(x - unit * 0.45, y, x + unit * 0.45, y, x, y - unit * 2.2);
    g.fillCircle(x, y - unit * 2.35, unit * 0.28);
    g.fillStyle(0xd8d0c0, 0.8).fillEllipse(x, y - unit * 2.58, unit * 0.62, unit * 0.22);
  }

  protected skipResult(): FlagState {
    return { nurLanesNoticed: 1 };
  }
}
