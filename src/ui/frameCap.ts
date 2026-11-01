import type Phaser from 'phaser';

/** Phaser's loop keeps the interval it waits for, and its frame driver, in fields it does not type. */
type CappableLoop = Phaser.Core.TimeStep & {
  _limitRate: number;
  raf: { callback: (time: number) => void };
  step(time: number): void;
  stepLimitFPS(time: number): void;
};

/**
 * Caps how many frames a second the whole game runs and draws, or lifts the
 * cap (`undefined`), so a scene that asks for less than the screen offers
 * does no work at all on the frames between. A frame that lands a hair early
 * still counts, so a 60 Hz cap on a 120 Hz screen keeps every other frame.
 * The browser never calls the loop faster than the screen refreshes, so on a
 * 60 Hz screen there is nothing to save and no cap does anything.
 *
 * The loop picks its step function when it starts; this swaps the one the
 * frame driver calls in place. (Restarting the loop instead runs a whole
 * frame there and then, which in the middle of a scene's shutdown updates
 * objects already destroyed and stops the game.)
 */
export function capFrameRate(game: Phaser.Game, hz: number | undefined): void {
  const loop = game.loop as CappableLoop;
  const limit = hz ?? 0;
  if (loop.fpsLimit === limit) return;
  loop.fpsLimit = limit;
  loop.hasFpsLimit = limit > 0;
  loop._limitRate = limit > 0 ? 1000 / limit - 2 : 0;
  loop.delta = 0;
  loop.raf.callback = limit > 0 ? loop.stepLimitFPS.bind(loop) : loop.step.bind(loop);
}
