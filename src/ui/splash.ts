import Phaser from 'phaser';

/**
 * The page's own first screen (in `index.html`), shown before any script
 * arrives so a slow connection never shows black. Its bar is filled by the
 * script downloads (`scripts/vite/splashLoader.ts`) and then by the game's
 * boot through `splashProgress`; it fades once the title has been drawn and
 * the page's size has held still, so the settling of a phone's viewport and
 * any rebuild of the title it causes happen behind it, not in view.
 */

declare global {
  interface Window {
    splashProgress?: (fraction: number) => void;
  }
}

/** The stages of boot after the downloads, as shares of the bar. */
export const SPLASH_STAGE = {
  scripts: 0.88,
  language: 0.92,
  tiles: 0.96,
  title: 1,
} as const;

/** How long the page's size must hold still before the splash lifts. */
const SETTLE_MS = 250;
/** Lift it by then whatever the page is doing. */
const LONGEST_WAIT_MS = 2500;

export function splashProgress(fraction: number): void {
  window.splashProgress?.(fraction);
}

let waiting = false;

/**
 * Fills the bar and lifts the splash once the game has rendered a frame and
 * no resize has come for a moment. Safe to call again on every title build.
 */
export function hideSplashWhenSettled(game: Phaser.Game): void {
  const splash = document.getElementById('splash');
  if (!splash || waiting) return;
  waiting = true;
  splashProgress(SPLASH_STAGE.title);
  const startedAt = performance.now();
  let lastResize = startedAt;
  const onResize = (): void => {
    lastResize = performance.now();
  };
  game.scale.on(Phaser.Scale.Events.RESIZE, onResize);
  const check = (): void => {
    const now = performance.now();
    if (now - lastResize < SETTLE_MS && now - startedAt < LONGEST_WAIT_MS) return;
    game.events.off(Phaser.Core.Events.POST_RENDER, check);
    game.scale.off(Phaser.Scale.Events.RESIZE, onResize);
    splash.classList.add('gone');
    window.setTimeout(() => splash.remove(), 700);
  };
  game.events.on(Phaser.Core.Events.POST_RENDER, check);
}
