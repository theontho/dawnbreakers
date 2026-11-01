import Phaser from 'phaser';
import { playSfx } from '../audio';
import { logGameEvent } from '../logging/gameLogger';
import { paintBookArt } from './titleBookArt';
import { BookMesh } from './titleBookMesh';
import { drawBook, type BookPose } from './titleBookRender';

/**
 * The title's opening: an illuminated manuscript lies on a dark table. Its
 * cover swings open, a few leaves turn with a curl, and the view pushes into
 * the illuminated page while the dawn title rises through it. A click or key
 * skips to the end.
 *
 * The book is a WebGL mesh rebuilt each frame from its pose (see
 * `titleBookRender.ts` and `titleBookMesh.ts`) for the few seconds it
 * plays, then freed. Without WebGL the title simply fades in.
 */

type TitleBookOpeningOptions = {
  width: number;
  height: number;
  content: Phaser.GameObjects.Container;
  onComplete: () => void;
};

/** Timeline in milliseconds. */
const COVER = { start: 350, end: 1500 };
const LEAVES = [1250, 1650, 2050] as const;
const LEAF_MS = 780;
const PUSH = { start: 2750, end: 3900 };
const END = 4000;

export function playTitleBookOpening(
  scene: Phaser.Scene,
  { width, height, content, onComplete }: TitleBookOpeningOptions,
): void {
  logGameEvent('book start', { width, height });
  const dimmer = scene.add.rectangle(0, 0, width, height, 0x05030a, 0.86).setOrigin(0).setDepth(998);
  const blocker = scene.add.rectangle(0, 0, width, height, 0x000000, 0).setOrigin(0).setDepth(1001).setInteractive();
  const book = scene.game.renderer.type === Phaser.WEBGL ? new BookMesh(scene, paintBookArt(), 999) : undefined;
  const pageH = Math.min(height * 0.62, 600, width * 0.5);
  const frame = { width, height, pageW: pageH * 0.72, pageH };
  content.setAlpha(0);

  // Driven by the wall clock: the game's smoothed frame delta lags behind
  // when the intro's first frames are slow, and the timing should not drift.
  let startedAt = performance.now();
  let elapsed = 0;
  let finished = false;
  const sounded = new Set<string>();
  const cue = (key: string, at: number, sfx: Parameters<typeof playSfx>[0]) => {
    if (elapsed >= at && !sounded.has(key)) {
      sounded.add(key);
      playSfx(sfx);
    }
  };

  const render = (): void => {
    const pose: BookPose = {
      cover: ease(span(elapsed, COVER.start, COVER.end)),
      leaves: LEAVES.map(start => ease(span(elapsed, start, start + LEAF_MS))),
      zoom: 1 + 2.2 * easeIn(span(elapsed, PUSH.start, PUSH.end)),
    };
    if (book) {
      book.begin(span(elapsed, 0, 300) * (1 - span(elapsed, PUSH.start + 500, PUSH.end)));
      drawBook(book, frame, pose);
      book.end();
    }
    const reveal = span(elapsed, PUSH.start + 250, PUSH.end);
    content.setAlpha(reveal);
    dimmer.setAlpha(0.86 * (1 - reveal));
    cue('cover', COVER.start, 'journal');
    LEAVES.forEach((start, i) => cue(`leaf${i}`, start, 'dialogueAdvance'));
  };

  const finish = (): void => {
    if (finished) return;
    finished = true;
    scene.events.off(Phaser.Scenes.Events.UPDATE, tick);
    scene.input.keyboard?.off('keydown', skip);
    content.setAlpha(1);
    book?.destroy();
    dimmer.destroy();
    blocker.destroy();
    logGameEvent('book end', { width, height });
    onComplete();
  };

  const tick = (): void => {
    elapsed = performance.now() - startedAt;
    if (elapsed >= END) {
      finish();
      return;
    }
    render();
  };

  // Skipping jumps to the end, so the title is simply there. The press that
  // started the title arrives a frame late, so ignore the first moments.
  const skip = (): void => {
    if (elapsed > 400 && elapsed < PUSH.end) startedAt = performance.now() - END;
  };
  blocker.on('pointerdown', skip);
  scene.input.keyboard?.on('keydown', skip);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, tick);
    if (!finished) book?.destroy();
  });

  render();
  scene.events.on(Phaser.Scenes.Events.UPDATE, tick);
}

/** Progress of `t` through [from, to], clamped to 0..1. */
function span(t: number, from: number, to: number): number {
  return Phaser.Math.Clamp((t - from) / (to - from), 0, 1);
}

function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

function easeIn(t: number): number {
  return t * t * t;
}
