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
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright-core';
import { createServer, preview } from 'vite';

export const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

// ANGLE's OpenGL backend is deprecated on macOS and runs the game at a few
// frames a second there; Metal is the native one.
const GPU_ARGS = ['--enable-gpu', `--use-angle=${process.platform === 'darwin' ? 'metal' : 'gl'}`, '--ignore-gpu-blocklist'];
const SOFTWARE_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

/**
 * `CHROMIUM_PATH`, else the system Chromium on Linux, else Playwright's own
 * download (`npx playwright-core install chromium-headless-shell`), which is
 * how macOS runs these scripts.
 */
function browserPath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  return existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined;
}

/**
 * `built: true` serves the last `vite build` from `dist/` instead of the
 * sources, to check what ships (the loading screen's script loader exists
 * only in a build).
 *
 * `webkit: true` runs Safari's engine instead of Chromium, as an iPhone
 * (touch, mobile viewport), for bugs only Safari shows. `touch: true` makes
 * a Chromium page a phone the same way.
 *
 * `locale` sets the browser's language (`navigator.languages`), e.g. 'fa-IR'.
 *
 * @param {{ gpu?: boolean, built?: boolean, webkit?: boolean, touch?: boolean, args?: string[], viewport?: { width: number, height: number }, deviceScaleFactor?: number, locale?: string }} [options]
 */
export async function openGame(options = {}) {
  const server = options.built
    ? await preview({ root, logLevel: 'error', preview: { port: 0, strictPort: false, open: false } })
    : await createServer({ root, logLevel: 'error', server: { port: 0, strictPort: false, hmr: false, watch: null, open: false } });
  if (!options.built) await server.listen();
  const browser = await (options.webkit
    ? webkit.launch()
    : chromium.launch({
      executablePath: browserPath(),
      args: [...(options.gpu ? GPU_ARGS : SOFTWARE_ARGS), ...(options.args ?? [])],
    })).catch(async (error) => {
    await server.close().catch(() => {});
    if (/Executable doesn't exist/.test(error.message)) {
      throw new Error(`${error.message}\nInstall Playwright's headless Chromium with: npx playwright-core install chromium-headless-shell`);
    }
    throw error;
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
    ...(options.locale ? { locale: options.locale } : {}),
    ...(options.webkit || options.touch ? { isMobile: true, hasTouch: true } : {}),
  });
  return { page, url: server.resolvedUrls.local[0], close };
}

/** Waits for the title screen, i.e. the game has booted. */
export async function waitForBoot(page) {
  await page.waitForFunction(() => window.__game?.scene?.isActive('Title'), null, { timeout: 30000 });
}
