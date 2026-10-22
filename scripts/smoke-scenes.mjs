#!/usr/bin/env node
/**
 * Headless smoke test: boots the game in Chromium, starts every map scene,
 * opens every NPC's dialogue and clicks through its first choice, and fails
 * on any page error. Also reports frame rate per scene.
 *
 *   npm run smoke                       # all scenes
 *   npm run smoke -- --scenes City,Road # a subset
 *   npm run smoke -- --shots out/shots  # also save a screenshot per scene
 *
 * Uses the system Chromium (override with CHROMIUM_PATH). Starts its own
 * Vite dev server on a free port.
 */
import { mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const only = argValue('--scenes')?.split(',').filter(Boolean);
const shots = argValue('--shots');
if (shots) mkdirSync(resolve(root, shots), { recursive: true });

const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false, hmr: false, watch: null } });
await server.listen();
const url = server.resolvedUrls.local[0];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error' && !/audio|decod/i.test(m.text())) errors.push(`console: ${m.text()}`);
});
await page.addInitScript(() => {
  localStorage.clear();
  localStorage.setItem('dawnbreakers.locale', 'en');
});

let failed = false;
try {
  await page.goto(url);
  await page.waitForFunction(() => window.__game?.scene?.isActive('Title'), null, { timeout: 30000 });
  const keys = only ?? await page.evaluate(() => window.__game.scene.scenes
    .filter((s) => s.constructor.name === 'MapScene')
    .map((s) => s.scene.key));

  for (const key of keys) {
    const before = errors.length;
    await page.evaluate((k) => {
      const game = window.__game;
      game.scene.getScenes(true).forEach((s) => s.scene.stop());
      game.scene.start(k);
    }, key);
    await page.waitForFunction((k) => window.__game.scene.isActive(k), key, { timeout: 10000 });
    await page.waitForTimeout(500);
    const fps = await page.evaluate(() => new Promise((done) => {
      let frames = 0;
      const start = performance.now();
      const tick = () => {
        frames++;
        if (performance.now() - start < 1000) requestAnimationFrame(tick);
        else done(frames);
      };
      requestAnimationFrame(tick);
    }));
    if (shots) await page.screenshot({ path: join(resolve(root, shots), `${key}.png`) });

    // Open each NPC's dialogue and walk the first choice path to its end.
    const talked = await page.evaluate(async (k) => {
      const game = window.__game;
      const scene = game.scene.getScene(k);
      const npcs = scene.npcs.interactables.slice();
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      let count = 0;
      for (const npc of npcs) {
        npc.action();
        await sleep(60);
        const dialogue = game.scene.getScene('Dialogue');
        for (let step = 0; step < 40 && game.scene.isActive('Dialogue'); step++) {
          const node = dialogue.tree.nodes[dialogue.currentId];
          const flags = JSON.parse(localStorage.getItem('dawnbreakers.flags.v1') ?? '{}');
          const choices = node.choices?.filter((c) => !c.requires || c.requires(flags)) ?? [{}];
          dialogue.choose(choices[0] ?? {});
          await sleep(20);
        }
        if (game.scene.isActive('ChapterEnd')) {
          game.scene.stop('ChapterEnd');
          game.scene.resume(k);
        }
        count++;
      }
      return count;
    }, key);

    const sceneErrors = errors.slice(before);
    const status = sceneErrors.length ? 'FAIL' : 'ok';
    if (sceneErrors.length) failed = true;
    console.log(`${status.padEnd(4)} ${key.padEnd(20)} ${String(fps).padStart(4)} fps  ${talked} npc dialogues`);
    for (const e of sceneErrors) console.log(`       ${e}`);
  }
} catch (error) {
  failed = true;
  console.error(error);
} finally {
  await browser.close();
  await server.close();
}

if (errors.length) console.error(`\n${errors.length} error(s):\n${errors.join("\n")}`);
process.exit(failed ? 1 : 0);
