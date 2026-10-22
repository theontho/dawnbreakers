#!/usr/bin/env node
/**
 * Renders every generated map texture onto contact sheets so art can be
 * reviewed without walking the maps.
 *
 *   npm run gallery                        # all textures -> out/gallery/sheet-N.png
 *   npm run gallery -- --filter ch8-,house  # only keys containing any of these
 *   npm run gallery -- --scale 2            # magnify
 */
import { mkdirSync, writeFileSync } from 'node:fs';
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
const filters = argValue('--filter')?.split(',').filter(Boolean) ?? [];
const scale = Number(argValue('--scale') ?? 1.5);
const outDir = resolve(root, argValue('--out') ?? 'out/gallery');
mkdirSync(outDir, { recursive: true });

const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false, hmr: false, watch: null } });
await server.listen();
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
  args: ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.error(`pageerror: ${e.message}`));
  await page.goto(server.resolvedUrls.local[0]);
  await page.waitForFunction(() => window.__game?.scene?.isActive('Title'), null, { timeout: 30000 });
  const sheets = await page.evaluate(({ filters, scale }) => {
    const textures = window.__game.textures;
    const keys = textures.getTextureKeys()
      .filter((k) => !k.startsWith('__') && !k.startsWith('tile-') && !k.startsWith('fx-') && !k.startsWith('title'))
      .filter((k) => filters.length === 0 || filters.some((f) => k.includes(f)))
      .sort();
    const sheetW = 1600;
    const pad = 10;
    const label = 14;
    const pages = [];
    let canvas;
    let ctx;
    let x = pad;
    let y = pad;
    let rowH = 0;
    const flush = () => {
      if (canvas) pages.push(canvas.toDataURL('image/png'));
    };
    const fresh = () => {
      flush();
      canvas = document.createElement('canvas');
      canvas.width = sheetW;
      canvas.height = 1400;
      ctx = canvas.getContext('2d');
      ctx.fillStyle = '#5a6b4a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '11px sans-serif';
      x = pad;
      y = pad;
      rowH = 0;
    };
    fresh();
    for (const key of keys) {
      const img = textures.get(key).getSourceImage();
      const w = img.width * scale;
      const h = img.height * scale;
      const cellW = Math.max(w, ctx.measureText(key).width) + pad;
      if (x + cellW > sheetW) {
        x = pad;
        y += rowH + label + pad;
        rowH = 0;
      }
      if (y + h + label > canvas.height) fresh();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x, y, w, h);
      ctx.fillStyle = '#fff';
      ctx.fillText(key, x, y + h + 11);
      x += cellW;
      rowH = Math.max(rowH, h);
    }
    flush();
    return pages;
  }, { filters, scale });
  sheets.forEach((data, i) => {
    const file = join(outDir, `sheet-${i + 1}.png`);
    writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
    console.log(file);
  });
} finally {
  await browser.close();
  await server.close();
}
