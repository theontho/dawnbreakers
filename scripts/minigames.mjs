#!/usr/bin/env node
/**
 * Plays every chapter's mini-game headless with a simple bot, start to
 * finish, over the map it belongs to: fails on page errors or on a game that
 * does not end by itself, and saves a screenshot of each in play.
 *
 *   npm run minigames                       # all, bots playing to the end
 *   npm run minigames -- --games LampGame   # a subset
 *   npm run minigames -- --quick            # screenshot, then skip
 *   npm run minigames -- --locale fa        # in another language
 */
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { openGame, root, waitForBoot } from './lib/gameBrowser.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const GAMES = {
  LampGame: 'Ch3Ship',
  InkGame: 'Ch6MakuChamber',
  CoffeeGame: 'TrialCourt',
  RationGame: 'Ch8TabarsiFort',
  CurtainGame: 'QazvinKarbila',
  LanesGame: 'NurMadrasa',
};
const only = argValue('--games')?.split(',').filter(Boolean);
const quick = args.includes('--quick');
const locale = argValue('--locale') ?? 'en';
const outDir = resolve(root, 'out/minigames');
mkdirSync(outDir, { recursive: true });

/** Runs in the page: one step of a bot that plays `key` reasonably well. */
function botStep(key) {
  const s = window.__game.scene.getScene(key);
  if (!s || !window.__game.scene.isActive(key)) return;
  const e = s.elapsed;
  switch (key) {
    case 'LampGame': {
      const gust = s.gusts.find((g) => e >= g.warnAt && e < g.endAt);
      if (gust) s.shieldTarget = gust.from;
      break;
    }
    case 'InkGame':
      if (s.warmth < 0.05) s.warm();
      break;
    case 'CoffeeGame': {
      const nextAt = s.openings[s.next] ?? Infinity;
      const want = s.hot < 0.4 && nextAt - e > 4 ? 0 : 2;
      s.goTo(want);
      break;
    }
    case 'RationGame':
      if (s.portions > 0) s.give(s.groups[s.portions % s.groups.length]);
      else s.shareOut();
      break;
    case 'CurtainGame':
      s.leanTarget = s.voice;
      break;
    case 'LanesGame': {
      // Wait in a doorway while a lantern is near; otherwise walk on.
      const near = s.watch.some((w) => Math.abs(w.x - s.x) < 9.5);
      window.__laneWait = near && s.hidden();
      break;
    }
  }
}

const { page, url, close } = await openGame({ args: ['--autoplay-policy=no-user-gesture-required'] });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error' && !/audio|decod/i.test(m.text())) errors.push(`console: ${m.text()}`);
});
await page.addInitScript((loc) => {
  localStorage.clear();
  localStorage.setItem('dawnbreakers.locale', loc);
}, locale);

let failed = false;
try {
  await page.goto(url);
  await waitForBoot(page);
  for (const [key, map] of Object.entries(GAMES)) {
    if (only && !only.includes(key)) continue;
    const before = errors.length;
    await page.evaluate((map) => {
      const game = window.__game;
      game.scene.getScenes(true).forEach((s) => s.scene.stop());
      game.scene.start(map);
    }, map);
    // A map paints its art on its first visit, which takes a while in software rendering.
    await page.waitForFunction((m) => window.__game.scene.isActive(m), map, { timeout: 60000 });
    await page.evaluate(({ key, map }) => {
      const game = window.__game;
      window.__miniGameDone = false;
      game.scene.getScenes(true).filter((s) => s.scene.key !== map).forEach((s) => s.scene.stop());
      game.scene.pause(map);
      game.scene.run(key, { onFinish: () => { window.__miniGameDone = true; } });
    }, { key, map });
    await page.waitForFunction((k) => window.__game.scene.isActive(k), key, { timeout: 60000 });
    const started = Date.now();
    const hold = key === 'InkGame' ? 'ArrowLeft' : key === 'LanesGame' ? 'ArrowRight' : undefined;
    let shot = false;
    let holding = false;
    while (!(await page.evaluate(() => window.__miniGameDone))) {
      if (Date.now() - started > 150000) {
        errors.push(`${key} did not end within 150 s`);
        await page.evaluate((k) => window.__game.scene.getScene(k).skipMiniGame(), key);
        break;
      }
      if (!quick) await page.evaluate(botStep, key);
      if (hold) {
        const wait = key === 'LanesGame' && (await page.evaluate(() => window.__laneWait));
        if (wait && holding) { await page.keyboard.up(hold); holding = false; }
        if (!wait && !holding) { await page.keyboard.down(hold); holding = true; }
      }
      if (!shot && Date.now() - started > 4500) {
        await page.screenshot({ path: resolve(outDir, `${key}-${locale}.png`) });
        shot = true;
        if (quick) await page.evaluate((k) => window.__game.scene.getScene(k).skipMiniGame(), key);
      }
      await page.waitForTimeout(80);
    }
    if (holding) await page.keyboard.up(hold);
    const seconds = Math.round((Date.now() - started) / 1000);
    const flags = await page.evaluate(() => localStorage.getItem('dawnbreakers.flags.v1'));
    const sceneErrors = errors.slice(before);
    if (sceneErrors.length) failed = true;
    console.log(`${sceneErrors.length ? 'FAIL' : 'ok  '} ${key.padEnd(12)} ${String(seconds).padStart(4)} s  ${flags}`);
    for (const e of sceneErrors) console.log(`       ${e}`);
    await page.evaluate(() => localStorage.removeItem('dawnbreakers.flags.v1'));
  }
} catch (error) {
  failed = true;
  console.error(error);
} finally {
  await close();
}
process.exit(failed ? 1 : 0);
