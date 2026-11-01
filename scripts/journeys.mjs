#!/usr/bin/env node
/**
 * Plays every journey between chapters headlessly and screenshots it after
 * the stars have turned a while; fails on any page error, and on a journey
 * that does not open. Also plays one passage between chapters through to the
 * next chapter's first map.
 *
 *   npm run journeys                               # all, -> out/journeys/<id>.png
 *   npm run journeys -- --only shiraz-to-road,tehran-to-mecca
 *   npm run journeys -- --trails exposure --wait 6000 --rate 4
 *   npm run journeys -- --viewport 390x844         # a phone held upright
 *   npm run journeys -- --locale fa                # right to left, Persian digits
 */
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openGame, root, waitForBoot } from './lib/gameBrowser.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const outDir = resolve(root, argValue('--out') ?? 'out/journeys');
mkdirSync(outDir, { recursive: true });
const only = argValue('--only')?.split(',').filter(Boolean);
const wait = Number(argValue('--wait') ?? 3500);
const [vw, vh] = (argValue('--viewport') ?? '1280x800').split('x').map(Number);
const settings = {
  rateIndex: Number(argValue('--rate') ?? 3),
  direction: 1,
  playing: true,
  trails: argValue('--trails') ?? 'tail',
  turn: Number(argValue('--turn') ?? 0),
  // Hold each journey at the set rate rather than playing its road through.
  autoplay: false,
};

const { page, url, close } = await openGame({ viewport: { width: vw, height: vh } });
const errors = [];
let failed = false;
try {
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' && !/audio|decod/i.test(m.text())) errors.push(`console: ${m.text()}`);
  });
  await page.addInitScript((locale) => {
    localStorage.clear();
    localStorage.setItem('dawnbreakers.locale', locale);
  }, argValue('--locale') ?? 'en');
  await page.goto(url);
  await waitForBoot(page);

  const ids = await page.evaluate(async () => (await import('/src/data/journeys.ts')).JOURNEYS.map((j) => j.id));
  for (const id of ids.filter((id) => !only || only.includes(id))) {
    await page.evaluate(({ id, settings }) => {
      const game = window.__game;
      game.scene.getScenes(true).filter((s) => s.scene.key !== 'Journey').forEach((s) => s.scene.stop());
      // Starting a running scene restarts it with the new journey.
      game.scene.start('Journey', { journeyId: id, settings });
    }, { id, settings });
    await page.waitForFunction((id) => {
      const game = window.__game;
      return game.scene.isActive('Journey') && game.scene.getScene('Journey').journey?.id === id;
    }, id, { timeout: 30000 });
    await page.waitForTimeout(wait);
    const fps = await page.evaluate(() => Math.round(window.__game.loop.actualFps));
    const file = join(outDir, `${id}.png`);
    await page.screenshot({ path: file });
    console.log(`${id}: ${fps} fps -> ${file}`);
  }

  if (!only) {
    // A passage between chapters must carry on into the next chapter by itself.
    await page.evaluate(() => {
      const game = window.__game;
      game.scene.getScenes(true).filter((s) => s.scene.key !== 'Journey').forEach((s) => s.scene.stop());
      // Quick days: this checks the hand-off, and an 18-day road at the default pace takes a minute.
      game.scene.start('Journey', { journeyId: 'shiraz-to-road', onward: { scene: 'Road' }, settings: { secondsPerDay: 0.2 } });
    });
    await page.waitForFunction(() => window.__game.scene.isActive('Road'), null, { timeout: 40000 });
    console.log('passage: shiraz-to-road went on into Road');
  }
} catch (error) {
  failed = true;
  console.error(error);
} finally {
  await close();
}
if (errors.length > 0) {
  console.error(errors.join('\n'));
  failed = true;
}
process.exit(failed ? 1 : 0);
