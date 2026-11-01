#!/usr/bin/env node
/**
 * Renders the link preview image (Open Graph / iMessage / Slack) from the
 * title screen: the sun half over Shíráz with the title above it, the menu
 * and transport hidden.
 *
 *   npm run social-preview          # -> public/social-preview.png (1200x630)
 *   npm run social-preview -- --at 75 --out out/preview.png
 */
import { resolve } from 'node:path';
import { openGame, root, waitForBoot } from './lib/gameBrowser.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const atSeconds = Number(argValue('--at') ?? 62);
const out = resolve(root, argValue('--out') ?? 'public/social-preview.png');

const { page, url, close } = await openGame({ viewport: { width: 1200, height: 630 } });
let failed = false;
try {
  page.on('pageerror', (e) => {
    failed = true;
    console.error(`pageerror: ${e.message}`);
  });
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('dawnbreakers.locale', 'en');
  });
  await page.goto(url);
  await waitForBoot(page);
  await page.keyboard.press('Space');
  // Past the book opening, then pause and seek to the moment.
  await page.waitForFunction(() => window.__game.scene.getScene('Title').clock, null, { timeout: 30000 });
  await page.evaluate((ms) => {
    const { clock } = window.__game.scene.getScene('Title');
    if (clock.isPlaying) clock.togglePlay();
    clock.seek(ms);
  }, atSeconds * 1000);
  await page.waitForTimeout(500);
  // Keep the painting and the title; hide everything tappable and the
  // overlays above it (the transport and the language menu).
  await page.evaluate(() => {
    const scene = window.__game.scene.getScene('Title');
    const hide = (object) => {
      if (object.input?.enabled || object.depth >= 1000) object.setVisible(false);
      else if (object.type === 'Container') object.list.forEach(hide);
    };
    scene.children.list.forEach(hide);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: out });
  console.log(`Wrote ${out}`);
} finally {
  await close();
}
process.exit(failed ? 1 : 0);
