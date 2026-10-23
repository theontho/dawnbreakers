import Phaser from 'phaser';
import { formatNumber, localizedFont, rtl } from '../i18n';
import { buttonFont, isNarrowLayout, MIN_TOUCH_TARGET, safeLayout } from '../ui/responsive';
import type { SunriseClock } from './titleSunriseClock';

/**
 * A film transport for the title's sunrise: restart, play/pause, a scrub
 * track, speed and the time. It sits in the top corner opposite the language
 * button and dims when left alone, so the dawn has the screen.
 *
 * Keys: Space or K plays and pauses, Left and Right step five seconds (thirty
 * with Shift), Home and End jump to either end, [ and ] change speed.
 */

type Size = { width: number; height: number };

const BAR_COLOR = 0x1a120a;
const STROKE_COLOR = 0x5a4428;
const ICON_COLOR = 0xe8d9b0;
const ICON_HOVER_COLOR = 0xfff1c0;
const TRACK_COLOR = 0x5a4428;
const PLAYED_COLOR = 0xf3d98a;
const LANGUAGE_BUTTON_WIDTH = 88;
const IDLE_MS = 3000;
const IDLE_ALPHA = 0.35;
const STEP_MS = 5000;
const BIG_STEP_MS = 30000;

export function addSunriseTransport(scene: Phaser.Scene, size: Size, clock: SunriseClock): void {
  const safe = safeLayout(size);
  const narrow = isNarrowLayout(size);
  const height = MIN_TOUCH_TARGET;
  const pad = 4;
  const speedWidth = 52;
  const timeWidth = narrow ? 0 : 112;
  const width = Math.min(480, safe.width - LANGUAGE_BUTTON_WIDTH - 16);
  const trackX = pad + height * 2 + 8;
  const trackWidth = Math.max(48, width - trackX - speedWidth - timeWidth - pad - 8);
  const x = rtl ? safe.right - width : safe.x;
  const bar = scene.add.container(x, safe.y).setDepth(19000);

  bar.add(scene.add.rectangle(0, 0, width, height, BAR_COLOR, 0.8).setOrigin(0).setStrokeStyle(1, STROKE_COLOR, 1));

  addIconButton(scene, bar, pad, height, drawRestartIcon, () => {
    clock.seek(0);
    if (!clock.isPlaying) clock.togglePlay();
  });
  const playPause = addIconButton(scene, bar, pad + height, height, drawPauseIcon, () => clock.togglePlay());

  const track = scene.add.graphics();
  const knob = scene.add.circle(0, height / 2, 7, PLAYED_COLOR).setStrokeStyle(2, BAR_COLOR);
  const trackHit = scene.add.rectangle(trackX - 8, 0, trackWidth + 16, height, 0, 0)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  bar.add([track, knob, trackHit]);

  const speed = scene.add.text(trackX + trackWidth + 8 + speedWidth / 2, height / 2, '', {
    fontFamily: localizedFont(), fontSize: buttonFont(15, size, 14), color: '#e8d9b0',
  }).setOrigin(0.5);
  const speedHit = scene.add.rectangle(trackX + trackWidth + 8, 0, speedWidth, height, 0, 0)
    .setOrigin(0)
    .setInteractive({ useHandCursor: true });
  speedHit
    .on('pointerover', () => speed.setColor('#fff1c0'))
    .on('pointerout', () => speed.setColor('#e8d9b0'))
    .on('pointerdown', stopEvent(() => clock.cycleSpeed()));
  bar.add([speed, speedHit]);

  const time = scene.add.text(width - pad - timeWidth / 2, height / 2, '', {
    fontFamily: localizedFont(), fontSize: buttonFont(14, size, 14), color: '#c9b07a',
  }).setOrigin(0.5).setVisible(timeWidth > 0);
  bar.add(time);

  const render = () => {
    const playedX = trackX + trackWidth * clock.progress;
    track.clear()
      .fillStyle(TRACK_COLOR, 1).fillRoundedRect(trackX, height / 2 - 2, trackWidth, 4, 2)
      .fillStyle(PLAYED_COLOR, 1).fillRoundedRect(trackX, height / 2 - 2, Math.max(4, playedX - trackX), 4, 2);
    knob.setX(playedX);
    playPause.setIcon(clock.isPlaying ? drawPauseIcon : drawPlayIcon);
    speed.setText(`${formatNumber(clock.speed)}×`);
    time.setText(`${formatClock(clock.position)} / ${formatClock(clock.durationMs)}`);
  };

  let dragging = false;
  const seekToPointer = (pointer: Phaser.Input.Pointer) => {
    const ratio = Phaser.Math.Clamp((pointer.x - bar.x - trackX) / trackWidth, 0, 1);
    clock.seek(ratio * clock.durationMs);
  };
  trackHit.on('pointerdown', (pointer: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => {
    ev.stopPropagation();
    dragging = true;
    seekToPointer(pointer);
  });
  const onPointerMove = (pointer: Phaser.Input.Pointer) => {
    wake();
    if (dragging) seekToPointer(pointer);
  };
  const onPointerUp = () => {
    dragging = false;
  };

  let idleTimer: Phaser.Time.TimerEvent | undefined;
  let fade: Phaser.Tweens.Tween | undefined;
  const wake = () => {
    fade?.stop();
    bar.setAlpha(1);
    idleTimer?.remove();
    idleTimer = scene.time.delayedCall(IDLE_MS, () => {
      if (dragging) return wake();
      fade = scene.tweens.add({ targets: bar, alpha: IDLE_ALPHA, duration: 600, ease: 'Sine.easeOut' });
    });
  };

  const onKey = (event: KeyboardEvent) => {
    const step = event.shiftKey ? BIG_STEP_MS : STEP_MS;
    switch (event.code) {
      case 'Space':
      case 'KeyK':
        clock.togglePlay();
        break;
      case 'ArrowLeft':
        clock.seekBy(-step);
        break;
      case 'ArrowRight':
        clock.seekBy(step);
        break;
      case 'Home':
        clock.seek(0);
        break;
      case 'End':
        clock.seek(clock.durationMs);
        break;
      case 'BracketLeft':
        clock.stepSpeed(-1);
        break;
      case 'BracketRight':
        clock.stepSpeed(1);
        break;
      default:
        return;
    }
    event.preventDefault();
    wake();
  };

  const offChange = clock.onChange(render);
  scene.input.on(Phaser.Input.Events.POINTER_MOVE, onPointerMove);
  scene.input.on(Phaser.Input.Events.POINTER_UP, onPointerUp);
  // Phaser replays its whole frame's key queue on every DOM key event, so two
  // presses inside one frame would each step twice. Listen to the page itself.
  window.addEventListener('keydown', onKey);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    offChange();
    scene.input.off(Phaser.Input.Events.POINTER_MOVE, onPointerMove);
    scene.input.off(Phaser.Input.Events.POINTER_UP, onPointerUp);
    window.removeEventListener('keydown', onKey);
  });

  render();
  wake();
}

type IconPainter = (g: Phaser.GameObjects.Graphics, cx: number, cy: number, color: number) => void;

function addIconButton(
  scene: Phaser.Scene,
  bar: Phaser.GameObjects.Container,
  x: number,
  size: number,
  icon: IconPainter,
  onClick: () => void,
): { setIcon: (next: IconPainter) => void } {
  const graphics = scene.add.graphics();
  const hit = scene.add.rectangle(x, 0, size, size, 0, 0).setOrigin(0).setInteractive({ useHandCursor: true });
  let current = icon;
  let color = ICON_COLOR;
  const paint = () => {
    graphics.clear();
    current(graphics, x + size / 2, size / 2, color);
  };
  hit
    .on('pointerover', () => {
      color = ICON_HOVER_COLOR;
      paint();
    })
    .on('pointerout', () => {
      color = ICON_COLOR;
      paint();
    })
    .on('pointerdown', stopEvent(onClick));
  bar.add([graphics, hit]);
  paint();
  return {
    setIcon: (next) => {
      if (next === current) return;
      current = next;
      paint();
    },
  };
}

function stopEvent(onClick: () => void) {
  return (_p: Phaser.Input.Pointer, _x: number, _y: number, ev: Phaser.Types.Input.EventData) => {
    ev.stopPropagation();
    onClick();
  };
}

const drawPlayIcon: IconPainter = (g, cx, cy, color) => {
  g.fillStyle(color, 1).fillTriangle(cx - 6, cy - 9, cx - 6, cy + 9, cx + 9, cy);
};

const drawPauseIcon: IconPainter = (g, cx, cy, color) => {
  g.fillStyle(color, 1).fillRect(cx - 8, cy - 9, 5, 18).fillRect(cx + 3, cy - 9, 5, 18);
};

const drawRestartIcon: IconPainter = (g, cx, cy, color) => {
  g.fillStyle(color, 1).fillRect(cx - 9, cy - 9, 3, 18).fillTriangle(cx + 8, cy - 9, cx + 8, cy + 9, cx - 5, cy);
};

function formatClock(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return formatNumber(`${minutes}:${seconds}`);
}
