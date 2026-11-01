import type Phaser from 'phaser';

/** Phaser's loop keeps the interval it waits for in a private field. */
type CappableLoop = Phaser.Core.TimeStep & { _limitRate: number };

/**
 * Caps how many frames a second the whole game runs and draws, or lifts the
 * cap (`undefined`), so a scene that asks for less than the screen offers
 * does no work at all on the frames between. A frame that lands a hair early
 * still counts, so a 60 Hz cap on a 120 Hz screen keeps every other frame.
 * The browser never calls the loop faster than the screen refreshes, so on a
 * 60 Hz screen there is nothing to save and no cap does anything.
 */
export function capFrameRate(game: Phaser.Game, hz: number | undefined): void {
  const loop = game.loop as CappableLoop;
  const limit = hz ?? 0;
  if (loop.fpsLimit === limit) return;
  loop.fpsLimit = limit;
  loop.hasFpsLimit = limit > 0;
  loop._limitRate = limit > 0 ? 1000 / limit - 2 : 0;
  // The loop picks its step function when it starts, so restart it in place.
  loop.sleep();
  loop.wake(true);
}
