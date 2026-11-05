import Phaser from 'phaser';
import { chapters, type Chapter } from '../data/chapters';
import { chapterLabel, localizedStyle, rtl, t } from '../i18n';
import { buttonFont, MIN_TOUCH_TARGET, safeLayout } from '../ui/responsive';

/**
 * A viewer for every chapter's opening dawn, as the Journeys viewer is for
 * the roads: two buttons under the language button step to the previous or
 * next chapter's title scene, and , and . do the same from the keyboard.
 * The choice only lasts while the title is open; the title always opens on
 * the chapter the story would continue.
 */

type Size = { width: number; height: number };

const LANGUAGE_BUTTON_WIDTH = 88;
const GAP = 6;
const BAR_COLOR = 0x1a120a;
const STROKE_COLOR = 0x5a4428;
const ICON_COLOR = 0xe8d9b0;
const ICON_HOVER_COLOR = 0xfff1c0;
const IDLE_ALPHA = 0.35;
const IDLE_MS = 3000;

export function addTitleOpeningPicker(scene: Phaser.Scene, size: Size, current: Chapter, onPick: (chapter: Chapter) => void): void {
  const safe = safeLayout(size);
  const height = MIN_TOUCH_TARGET;
  const half = LANGUAGE_BUTTON_WIDTH / 2;
  const x = rtl ? safe.x : safe.right - LANGUAGE_BUTTON_WIDTH;
  const bar = scene.add.container(x, safe.y + height + GAP).setDepth(19000);
  bar.add(scene.add.rectangle(0, 0, LANGUAGE_BUTTON_WIDTH, height, BAR_COLOR, 0.8).setOrigin(0).setStrokeStyle(1, STROKE_COLOR, 1));
  bar.add(scene.add.rectangle(half, 8, 1, height - 16, STROKE_COLOR, 1).setOrigin(0.5, 0));

  const step = (by: number) => {
    const index = chapters.indexOf(current);
    onPick(chapters[(index + by + chapters.length) % chapters.length]!);
  };
  // The arrows point the way the reading runs, so in a right-to-left language "next" is on the left.
  const forward = rtl ? -1 : 1;
  chevron(scene, bar, 0, half, height, -1, () => step(-forward));
  chevron(scene, bar, half, half, height, 1, () => step(forward));

  let fade: Phaser.Tweens.Tween | undefined;
  let idle: Phaser.Time.TimerEvent | undefined;
  const wake = () => {
    fade?.stop();
    bar.setAlpha(1);
    idle?.remove();
    idle = scene.time.delayedCall(IDLE_MS, () => {
      fade = scene.tweens.add({ targets: bar, alpha: IDLE_ALPHA, duration: 600, ease: 'Sine.easeOut' });
    });
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.code === 'Comma') step(-1);
    else if (event.code === 'Period') step(1);
    else return;
    event.preventDefault();
  };
  scene.input.on(Phaser.Input.Events.POINTER_MOVE, wake);
  window.addEventListener('keydown', onKey);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.input.off(Phaser.Input.Events.POINTER_MOVE, wake);
    window.removeEventListener('keydown', onKey);
  });
  wake();
}

/**
 * Names the chapter whose dawn is showing, under the subtitle, for a moment
 * after the viewer switches to it.
 */
export function announceTitleOpening(scene: Phaser.Scene, size: Size, chapter: Chapter, x: number, y: number, wrap: number): void {
  const label = scene.add.text(x, y, `${chapterLabel(chapter.number)} · ${t(chapter.title)}`, localizedStyle({
    fontFamily: 'Georgia, serif',
    fontSize: buttonFont(17, size, 14),
    color: '#f3e2b5',
    backgroundColor: '#1a120acc',
    padding: { x: 12, y: 6 },
    align: 'center',
    wordWrap: { width: wrap },
  }, 'center')).setOrigin(0.5, 0).setDepth(19000);
  scene.tweens.add({ targets: label, alpha: 0, delay: 2200, duration: 900, ease: 'Sine.easeIn', onComplete: () => label.destroy() });
}

function chevron(scene: Phaser.Scene, bar: Phaser.GameObjects.Container, x: number, width: number, height: number, pointing: -1 | 1, onClick: () => void): void {
  const graphics = scene.add.graphics();
  const paint = (color: number) => {
    const cx = x + width / 2;
    const cy = height / 2;
    graphics.clear().lineStyle(3, color, 1).beginPath()
      .moveTo(cx - 4 * pointing, cy - 9).lineTo(cx + 5 * pointing, cy).lineTo(cx - 4 * pointing, cy + 9)
      .strokePath();
  };
  const hit = scene.add.rectangle(x, 0, width, height, 0, 0).setOrigin(0).setInteractive({ useHandCursor: true });
  hit
    .on('pointerover', () => paint(ICON_HOVER_COLOR))
    .on('pointerout', () => paint(ICON_COLOR))
    .on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => {
      ev.stopPropagation();
      onClick();
    });
  bar.add([graphics, hit]);
  paint(ICON_COLOR);
}
