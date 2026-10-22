#!/usr/bin/env node
/**
 * Screenshots the game with the player standing at given cells, to look at
 * a particular building or corner of a map.
 *
 *   npm run look -- City:8:13,Ch6Maku:6:12            # -> out/look-<Scene>-<x>-<y>.png
 *   npm run look -- City:8:13 --out out/doors --dpr 2
 */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { openGame, root, waitForBoot } from './lib/gameBrowser.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const spots = (args[0] ?? '').split(',').filter(Boolean);
if (spots.length === 0) {
  console.error('Usage: look.mjs Scene:x:y[,Scene:x:y] [--out prefix] [--dpr n] [--locale code]');
  process.exit(1);
}
const prefix = resolve(root, argValue('--out') ?? 'out/look');
mkdirSync(dirname(prefix), { recursive: true });

const { page, url, close } = await openGame({ deviceScaleFactor: Number(argValue('--dpr') ?? 1) });
let failed = false;
try {
  page.on('pageerror', (e) => {
    failed = true;
    console.error(`pageerror: ${e.message}`);
  });
  await page.addInitScript((locale) => {
    localStorage.clear();
    localStorage.setItem('dawnbreakers.locale', locale);
  }, argValue('--locale') ?? 'en');
  await page.goto(url);
  await waitForBoot(page);
  for (const spot of spots) {
    const [key, x, y] = spot.split(':');
    await page.evaluate(({ key, x, y }) => {
      const game = window.__game;
      game.scene.getScenes(true).forEach((s) => s.scene.stop());
      game.scene.start(key, { spawnX: Number(x), spawnY: Number(y) });
    }, { key, x, y });
    await page.waitForFunction((k) => window.__game.scene.isActive(k), key, { timeout: 10000 });
    await page.waitForTimeout(900);
    const file = `${prefix}-${key}-${x}-${y}.png`;
    await page.screenshot({ path: file });
    console.log(file);
  }
} finally {
  await close();
}
process.exit(failed ? 1 : 0);
