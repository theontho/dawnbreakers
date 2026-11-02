import type { OutputBundle, OutputChunk } from 'rollup';
import type { Plugin } from 'vite';

/**
 * Puts a true progress bar on the page's loading screen. A module script
 * gives no word of how far its download has come, so in a build a small
 * loader fetches the game's scripts (and the player's language, if not
 * English) itself, counting their bytes against the sizes known here, and
 * runs them from those very bytes as in-memory modules. Nothing is
 * downloaded twice: Safari does not reuse a fetched script for a module, and
 * a phone would sit at the end of the bar while it came down again.
 *
 * An in-memory module has no address of its own to find its neighbours
 * from, so the loader points each chunk's imports (`"./phaser-….js"`) at the
 * in-memory copy, or at the real address for one not fetched, and writes the
 * chunk's real address in for `import.meta.url`. The build checks every
 * chunk's relative references are ones it knows, so nothing is missed.
 *
 * Downloads fill the bar to `SHARE`; the game itself reports the rest as it
 * boots (`src/ui/splash.ts`).
 */

/** How much of the bar the downloads fill. */
const SHARE = 0.85;

interface Module {
  /** Path from the page. */
  url: string;
  size: number;
  /** The chunks it names by relative path, by file name, as written in its code. */
  imports: Record<string, string>;
}

function moduleOf(chunk: OutputChunk, base: string): Module {
  const imports: Record<string, string> = {};
  for (const fileName of [...chunk.imports, ...chunk.dynamicImports]) {
    const specifier = `"./${fileName.split('/').pop()}"`;
    if (!chunk.code.includes(specifier)) throw new Error(`splashLoader: ${chunk.fileName} imports ${fileName} but not as ${specifier}`);
    imports[fileName] = specifier;
  }
  const relative = chunk.code.match(/["'`]\.\.?\/[^"'`]*["'`]/g) ?? [];
  const known = new Set(Object.values(imports));
  const strays = relative.filter(spec => !known.has(spec.replace(/^['`]|['`]$/g, '"')));
  if (strays.length > 0) throw new Error(`splashLoader: ${chunk.fileName} has relative references the loader cannot follow: ${strays.join(', ')}`);
  return { url: base + chunk.fileName, size: new TextEncoder().encode(chunk.code).byteLength, imports };
}

function loader(entry: string, modules: Record<string, Module>, eager: string[], locales: Record<string, string>): string {
  return `<script>
      // Fetches the game's scripts counting their bytes for the loading bar, then runs them from those bytes.
      (function () {
        var modules = ${JSON.stringify(modules)};
        var eager = ${JSON.stringify(eager)};
        var locales = ${JSON.stringify(locales)};
        var entry = ${JSON.stringify(entry)};
        var locale;
        try { locale = localStorage.getItem('dawnbreakers.locale'); } catch (e) { locale = null; }
        if (locale && locales[locale]) eager.push(locales[locale]);
        var total = 0, got = 0, texts = {}, blobs = {};
        eager.forEach(function (name) { total += modules[name].size; });
        function run(src) {
          var script = document.createElement('script');
          script.type = 'module';
          script.crossOrigin = '';
          script.src = src;
          document.body.appendChild(script);
        }
        function address(name) { return new URL(modules[name].url, document.baseURI).href; }
        function blobFor(name) {
          if (blobs[name]) return blobs[name];
          var text = texts[name];
          var imports = modules[name].imports;
          Object.keys(imports).forEach(function (dep) {
            var target = texts[dep] !== undefined ? blobFor(dep) : address(dep);
            text = text.split(imports[dep]).join(JSON.stringify(target));
          });
          text = text.split('import.meta.url').join(JSON.stringify(address(name)))
            .replace(/\\/\\/# sourceMappingURL=(\\S+)\\s*$/, function (_, map) { return '//# sourceMappingURL=' + new URL(map, address(name)).href; });
          blobs[name] = URL.createObjectURL(new Blob([text], { type: 'text/javascript' }));
          return blobs[name];
        }
        function fetchText(name) {
          return fetch(modules[name].url, { credentials: 'same-origin' }).then(function (response) {
            if (!response.ok || !response.body) throw new Error(response.status);
            var reader = response.body.getReader();
            var decoder = new TextDecoder();
            var parts = [];
            function pump() {
              return reader.read().then(function (part) {
                if (part.done) { parts.push(decoder.decode()); texts[name] = parts.join(''); return; }
                got += part.value.length;
                parts.push(decoder.decode(part.value, { stream: true }));
                window.splashProgress && window.splashProgress(${SHARE} * Math.min(1, got / total));
                return pump();
              });
            }
            return pump();
          });
        }
        if (!window.fetch || !window.ReadableStream || !window.TextDecoder || !window.URL || !URL.createObjectURL) { run(modules[entry].url); return; }
        Promise.all(eager.map(fetchText)).then(function () {
          run(blobFor(entry));
        }, function () {
          // Something went wrong counting: let the browser load the game itself.
          run(modules[entry].url);
        });
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
        const bundle: OutputBundle | undefined = ctx.bundle;
        if (!bundle) return html;
        const entryTag = /\s*<script type="module" crossorigin src="([^"]+)"><\/script>/;
        const preloadTag = /\s*<link rel="modulepreload" crossorigin href="([^"]+)">/g;
        const entryUrl = entryTag.exec(html)?.[1];
        if (!entryUrl) throw new Error('splashLoader: no entry module script in index.html');
        const chunks = Object.values(bundle).filter((item): item is OutputChunk => item.type === 'chunk');
        const modules: Record<string, Module> = {};
        for (const chunk of chunks) modules[chunk.fileName] = moduleOf(chunk, base);
        const entry = entryUrl.replace(base, '');
        if (!modules[entry]) throw new Error(`splashLoader: entry ${entry} is not in the bundle`);
        const eager = [entry, ...[...html.matchAll(preloadTag)].map(match => match[1]!.replace(base, ''))];
        const locales: Record<string, string> = {};
        for (const chunk of chunks) {
          if (chunk.isDynamicEntry && /^(fa|zh)$/.test(chunk.name)) locales[chunk.name] = chunk.fileName;
        }
        return html
          .replace(entryTag, '')
          .replace(preloadTag, '')
          .replace('</body>', `  ${loader(entry, modules, eager, locales)}\n  </body>`);
      },
    },
  };
}
