import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Helpers for scripts that look at the title's dawn: get past the "press to
 * begin" gate and the book opening, then show any chapter's opening at any
 * moment of the sunrise, paused.
 */

/** From a freshly booted title, past the gate and the book, to the playing sunrise. */
export async function enterTitle(page) {
  await page.keyboard.press('Space');
  await page.waitForFunction(() => window.__game.scene.getScene('Title').clock, null, { timeout: 60000 });
}

/**
 * Restarts the title on `chapter`'s opening (a chapter id), paused at
 * `seconds` into the sunrise. Resolves once the new scene is drawn.
 */
export async function showTitleOpening(page, chapter, seconds) {
  await page.evaluate(({ chapter, ms }) => {
    const scene = window.__game.scene.getScene('Title');
    scene.pickedChapter = chapter;
    const data = scene.resumeData();
    data.resume.clock = { ...data.resume.clock, positionMs: ms, playing: false };
    scene.clock = undefined;
    scene.scene.restart(data);
  }, { chapter, ms: seconds * 1000 });
  await page.waitForFunction(() => window.__game.scene.getScene('Title').clock, null, { timeout: 60000 });
  await page.evaluate((ms) => {
    const { clock } = window.__game.scene.getScene('Title');
    if (clock.isPlaying) clock.togglePlay();
    clock.seek(ms);
  }, seconds * 1000);
}

/** Each chapter's id and opening vista, in the book's order, read from `src/data/titleOpenings.ts`. */
export function titleOpenings(root) {
  const source = readFileSync(join(root, 'src/data/titleOpenings.ts'), 'utf8');
  return [...source.matchAll(/^ {2}'?([a-z-]+)'?: \{ vista: '([a-z-]+)'/gm)].map(([, chapter, vista]) => ({ chapter, vista }));
}
