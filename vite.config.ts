import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { splashLoader } from './scripts/vite/splashLoader';

/**
 * Hash of `patches/` (patch-package). Vite keys its pre-bundled dependency
 * cache, and the browser's cache of it, on the lockfile and config, not on
 * the contents of node_modules, so a patched package would keep being served
 * unpatched. Folding the patches into the config makes any change rebundle.
 */
function patchesHash(): string {
  const dir = fileURLToPath(new URL('./patches', import.meta.url));
  const hash = createHash('sha256');
  for (const file of readdirSync(dir).sort()) hash.update(file).update(readFileSync(`${dir}/${file}`));
  return hash.digest('hex').slice(0, 12);
}

export default defineConfig({
  base: './',
  plugins: [splashLoader()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Never open a browser: agents and scripts start servers constantly, and each
  // auto-opened tab is a full desktop Chromium running the game on the GPU.
  // Open http://localhost:5173 yourself, or run `npm run dev -- --open`.
  server: { port: 5173, open: false },
  preview: { open: false },
  optimizeDeps: {
    esbuildOptions: { banner: { js: `/* patches ${patchesHash()} */` } },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
      },
      output: {
        // Phaser is half the download and changes only with an upgrade; its
        // own file stays in the browser's cache across releases of the game.
        manualChunks: (id) => (id.includes('/node_modules/phaser/') ? 'phaser' : undefined),
      },
    },
  },
});
