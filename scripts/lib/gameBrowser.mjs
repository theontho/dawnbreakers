/**
 * Shared harness for the headless scripts: starts a Vite server and a
 * Chromium page on the game, and guarantees both are shut down, including on
 * Ctrl-C and on errors.
 *
 * Rendering is software (SwiftShader) by default. Real-GPU runs are opt-in
 * (`gpu: true`, e.g. `npm run smoke -- --gpu` to measure frame rate): every
 * GPU-backed headless browser leaves its textures in the graphics driver's
 * page pool after it exits, and many runs in a day can pin gigabytes there.
 */
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';
import { createServer } from 'vite';

export const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const GPU_ARGS = ['--enable-gpu', '--use-angle=gl', '--ignore-gpu-blocklist'];
const SOFTWARE_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

/**
 * @param {{ gpu?: boolean, args?: string[], viewport?: { width: number, height: number }, deviceScaleFactor?: number }} [options]
 */
export async function openGame(options = {}) {
  const server = await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false, hmr: false, watch: null, open: false } });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? '/usr/bin/chromium',
    args: [...(options.gpu ? GPU_ARGS : SOFTWARE_ARGS), ...(options.args ?? [])],
  });
  let closed = false;
  const close = async () => {
    if (closed) return;
    closed = true;
    await browser.close().catch(() => {});
    await server.close().catch(() => {});
  };
  const onSignal = (signal) => {
    void close().finally(() => process.exit(signal === 'SIGINT' ? 130 : 143));
  };
  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
  const page = await browser.newPage({
    viewport: options.viewport ?? { width: 1280, height: 800 },
    deviceScaleFactor: options.deviceScaleFactor ?? 1,
  });
  return { page, url: server.resolvedUrls.local[0], close };
}

/** Waits for the title screen, i.e. the game has booted. */
export async function waitForBoot(page) {
  await page.waitForFunction(() => window.__game?.scene?.isActive('Title'), null, { timeout: 30000 });
}
