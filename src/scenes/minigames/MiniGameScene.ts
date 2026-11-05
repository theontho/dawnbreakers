import Phaser from 'phaser';
import { applyEffect } from '../../dialogue/flags';
import type { FlagState } from '../../dialogue/types';
import { localizedStyle, rtl, t, wrapsBetweenCharacters } from '../../i18n';
import { buttonFont, responsiveFont, safeLayout } from '../../ui/responsive';

/** What a dialogue choice (or the practice picker) hands a mini-game. */
export interface MiniGameLaunch {
  /** Called once the game is over, with its result (already in the flags unless practising). */
  onFinish: (result: FlagState) => void;
  /** Played from the mini-game picker: the result is reported but not kept. */
  practice?: boolean;
}

/** The play area: the safe layout under the heading and above the hint. */
export interface PlayArea {
  x: number;
  y: number;
  width: number;
  height: number;
  cx: number;
  cy: number;
}

const DEPTH_UI = 100;

/**
 * A short game played inside a dialogue (`DialogueChoice.play`), one per
 * chapter: the dialogue hides, the game runs over the paused map, and when
 * it ends its result is written into the flags and the dialogue goes on to
 * the choice's `next` node, which reads the result with `requires`.
 *
 * None of them can be lost. However it goes, the story goes on; how it went
 * only changes what is said about it. Every game can be left with the Skip
 * button (or Escape), which records a middling result.
 *
 * Subclasses draw into `gfx` every frame from `area()`, so a resize needs no
 * rebuild; text objects they make are placed again in `layout()`.
 */
export abstract class MiniGameScene extends Phaser.Scene {
  private onFinish?: (result: FlagState) => void;
  private practice = false;
  private done = false;
  protected gfx!: Phaser.GameObjects.Graphics;
  private headingText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;
  private skipText!: Phaser.GameObjects.Text;
  /** Seconds since the game began. */
  protected elapsed = 0;
  /** Wall-clock time of the last frame, so the game keeps real time however slow the frames. */
  private lastFrameMs = 0;
  /** The scenes under the game (the paused map), hidden so they are not drawn while it plays. */
  private covered: Phaser.Scene[] = [];

  /** The heading over the game, in English (it goes through `t`). */
  abstract readonly heading: string;
  /** One line under the game saying how to play, in English. */
  protected abstract readonly hint: string;
  /** The same for a finger on a touch screen, where there are no keys to press. */
  protected abstract readonly touchHint: string;

  init(data: MiniGameLaunch): void {
    this.onFinish = data.onFinish;
    this.practice = data.practice ?? false;
    this.done = false;
    this.elapsed = 0;
  }

  create(): void {
    const size = this.scale;
    this.gfx = this.add.graphics();
    this.headingText = this.add.text(0, 0, t(this.heading), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(26, size, 18), color: '#f3d98a', fontStyle: 'italic',
      align: 'center',
    }, 'center')).setOrigin(0.5, 0).setDepth(DEPTH_UI);
    this.hintText = this.add.text(0, 0, t(coarsePointer() ? this.touchHint : this.hint), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: responsiveFont(17, size, 14), color: '#d8c79e', align: 'center',
    }, 'center')).setOrigin(0.5, 1).setDepth(DEPTH_UI);
    this.skipText = this.add.text(0, 0, t('Skip'), localizedStyle({
      fontFamily: 'Georgia, serif', fontSize: buttonFont(15, size), color: '#9c8458',
      backgroundColor: '#1a120acc', padding: { x: 12, y: 12 },
    })).setOrigin(rtl ? 0 : 1, 0).setDepth(DEPTH_UI).setInteractive({ useHandCursor: true });
    this.skipText
      .on('pointerover', () => this.skipText.setColor('#f3d98a'))
      .on('pointerout', () => this.skipText.setColor('#9c8458'))
      .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, e: Phaser.Types.Input.EventData) => {
        e.stopPropagation();
        this.skipMiniGame();
      });
    this.input.keyboard?.on('keydown-ESC', () => this.skipMiniGame());

    this.covered = this.game.scene.getScenes(false).filter(other => other !== this
      && other.sys.settings.visible
      && (other.sys.settings.status === Phaser.Scenes.RUNNING || other.sys.settings.status === Phaser.Scenes.PAUSED));
    for (const other of this.covered) other.sys.setVisible(false);
    this.lastFrameMs = performance.now();

    this.begin();
    this.placeFrame();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.placeFrame, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.placeFrame, this);
      this.uncover();
    });
    this.cameras.main.fadeIn(350, 0, 0, 0);
  }

  update(): void {
    if (this.done) return;
    const now = performance.now();
    const dt = Math.min(now - this.lastFrameMs, 100) / 1000;
    this.lastFrameMs = now;
    this.elapsed += dt;
    this.tick(dt);
    if (this.done) return;
    this.gfx.clear();
    this.gfx.fillStyle(0x07050a, 1).fillRect(0, 0, this.scale.width, this.scale.height);
    this.draw(this.area());
  }

  /** Sets up the game's own objects and input. */
  protected abstract begin(): void;
  /** Advances the game by `dt` seconds. */
  protected abstract tick(dt: number): void;
  /** Draws the frame into `gfx`. */
  protected abstract draw(area: PlayArea): void;
  /** Places the game's text objects for the current size. */
  protected layout(_area: PlayArea): void {}
  /** The result recorded when the player skips. */
  protected abstract skipResult(): FlagState;

  /** Ends the game with its result. Also called by the smoke test. */
  skipMiniGame(): void {
    this.finish(this.skipResult());
  }

  protected finish(result: FlagState): void {
    if (this.done) return;
    this.done = true;
    if (!this.practice) applyEffect({ set: result });
    this.input.enabled = false;
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      const onFinish = this.onFinish;
      this.uncover();
      this.scene.stop();
      onFinish?.(result);
    });
  }

  private uncover(): void {
    for (const other of this.covered) other.sys.setVisible(true);
    this.covered = [];
  }

  protected get finished(): boolean {
    return this.done;
  }

  protected area(): PlayArea {
    const { width, height } = this.scale;
    const safe = safeLayout({ width, height });
    const top = this.headingText ? this.headingText.y + this.headingText.height + 10 : safe.y;
    const bottom = this.hintText ? this.hintText.y - this.hintText.height - 10 : safe.bottom;
    const h = Math.max(120, bottom - top);
    return { x: safe.x, y: top, width: safe.width, height: h, cx: safe.x + safe.width / 2, cy: top + h / 2 };
  }

  private placeFrame(): void {
    const { width, height } = this.scale;
    const safe = safeLayout({ width, height });
    this.headingText.setPosition(safe.x + safe.width / 2, safe.y).setWordWrapWidth(safe.width - 160, wrapsBetweenCharacters());
    this.hintText.setPosition(safe.x + safe.width / 2, safe.bottom).setWordWrapWidth(safe.width, wrapsBetweenCharacters());
    this.skipText.setPosition(rtl ? safe.x : safe.right, safe.y);
    this.layout(this.area());
  }
}

/** A finger rather than a mouse: a phone or tablet's touch screen. */
function coarsePointer(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
}
