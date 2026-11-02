import type { OutputBundle } from 'rollup';
import type { Plugin } from 'vite';

/**
 * Puts a true progress bar on the page's loading screen. A module script
 * gives no word of how far its download has come, so in a build the game's
 * scripts (and the player's language, if not English) are fetched first by a
 * small loader that counts their bytes against the sizes known here, then
 * started from the browser's cache. Downloads fill the bar to `SHARE`; the
 * game itself reports the rest as it boots (`src/ui/splash.ts`).
 */

/** How much of the bar the downloads fill. */
const SHARE = 0.85;

interface Counted {
  url: string;
  size: number;
}

function counted(bundle: OutputBundle, fileName: string, base: string): Counted {
  const chunk = bundle[fileName];
  const source = chunk?.type === 'chunk' ? chunk.code : chunk?.type === 'asset' ? chunk.source : '';
  const size = typeof source === 'string' ? new TextEncoder().encode(source).byteLength : source.byteLength;
  return { url: base + fileName, size };
}

function loader(entry: string, files: Counted[], locales: Record<string, Counted>): string {
  return `<script>
      // Fetches the game's scripts counting their bytes for the loading bar, then starts them from the cache.
      (function () {
        var files = ${JSON.stringify(files)};
        var locales = ${JSON.stringify(locales)};
        var locale;
        try { locale = localStorage.getItem('dawnbreakers.locale'); } catch (e) { locale = null; }
        if (locale && locales[locale]) files.push(locales[locale]);
        var total = 0, got = 0;
        files.forEach(function (f) { total += f.size; });
        function start() {
          var script = document.createElement('script');
          script.type = 'module';
          script.crossOrigin = '';
          script.src = ${JSON.stringify(entry)};
          document.body.appendChild(script);
        }
        if (!window.fetch || !window.ReadableStream) { start(); return; }
        Promise.all(files.map(function (f) {
          return fetch(f.url, { credentials: 'same-origin' }).then(function (response) {
            if (!response.ok || !response.body) return;
            var reader = response.body.getReader();
            function pump() {
              return reader.read().then(function (part) {
                if (part.done) return;
                got += part.value.length;
                window.splashProgress && window.splashProgress(${SHARE} * Math.min(1, got / total));
                return pump();
              });
            }
            return pump();
          });
        })).catch(function () {}).then(start);
      })();
    </script>`;
}

export function splashLoader(): Plugin {
  let base = './';
  return {
    name: 'dawnbreakers-splash-loader',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      base = config.base;
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const bundle = ctx.bundle;
        if (!bundle) return html;
        const entryTag = /\s*<script type="module" crossorigin src="([^"]+)"><\/script>/;
        const preloadTag = /\s*<link rel="modulepreload" crossorigin href="([^"]+)">/g;
        const entry = entryTag.exec(html)?.[1];
        if (!entry) throw new Error('splashLoader: no entry module script in index.html');
        const strip = (url: string) => url.replace(base, '');
        const preloads = [...html.matchAll(preloadTag)].map(match => match[1]!);
        const files = [entry, ...preloads].map(url => counted(bundle, strip(url), base));
        const locales: Record<string, Counted> = {};
        for (const chunk of Object.values(bundle)) {
          if (chunk.type === 'chunk' && chunk.isDynamicEntry && /^(fa|zh)$/.test(chunk.name)) {
            locales[chunk.name] = counted(bundle, chunk.fileName, base);
          }
        }
        return html
          .replace(entryTag, '')
          .replace(preloadTag, '')
          .replace('</body>', `  ${loader(entry, files, locales)}\n  </body>`);
      },
    },
  };
}
