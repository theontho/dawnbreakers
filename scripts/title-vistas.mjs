#!/usr/bin/env node
/**
 * Renders every chapter's opening dawn on the title at a few moments of the
 * sunrise, to review the vistas side by side.
 *
 *   npm run vistas                                 # every chapter -> out/vistas/
 *   npm run vistas -- --chapters mecca,baghdad     # a subset, by chapter id
 *   npm run vistas -- --at 20,62,110 --size 390x844 --out out/vistas-phone
 *   npm run vistas -- --one                        # one chapter per vista
 */
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openGame, root, waitForBoot } from './lib/gameBrowser.mjs';
import { enterTitle, showTitleOpening, titleOpenings } from './lib/titleView.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const only = argValue('--chapters')?.split(',').filter(Boolean);
const moments = (argValue('--at') ?? '30,62,110').split(',').map(Number);
const [width, height] = (argValue('--size') ?? '1280x800').split('x').map(Number);
const out = resolve(root, argValue('--out') ?? 'out/vistas');
mkdirSync(out, { recursive: true });

let openings = titleOpenings(root).filter(o => !only || only.includes(o.chapter));
if (args.includes('--one')) openings = openings.filter((o, i, all) => all.findIndex(other => other.vista === o.vista) === i);

const { page, url, close } = await openGame({ viewport: { width, height }, touch: width < 600 });
let failed = false;
try {
  page.on('pageerror', (e) => {
    failed = true;
    console.error(`pageerror: ${e.message}`);
  });
  await page.addInitScript(() => localStorage.setItem('dawnbreakers.locale', 'en'));
  await page.goto(url);
  await waitForBoot(page);
  await enterTitle(page);
  for (const { chapter, vista } of openings) {
    for (const at of moments) {
      await showTitleOpening(page, chapter, at);
      await page.waitForTimeout(400);
      const file = join(out, `${chapter}-${String(at).padStart(3, '0')}.png`);
      await page.screenshot({ path: file });
      console.log(`${chapter} (${vista}) at ${at}s -> ${file}`);
    }
  }
} finally {
  await close();
}
process.exit(failed ? 1 : 0);
