import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

/**
 * Writes `LICENSE.txt` beside the built `index.html`: the repository's
 * LICENSE, the full license text of every npm package that ended up in the
 * bundle (Phaser and what it brings), and the MIT and Apache texts the game
 * itself is offered under. The packages are read from the bundle's own
 * modules, so an added or dropped dependency changes the notices with it,
 * and the build fails if a bundled package ships no license file. A bundled
 * package's own dependencies are counted too: a prebuilt file such as
 * `phaser.esm.js` carries eventemitter3 inside it, out of the bundle's sight.
 */

const LICENSE_FILE = /^licen[cs]e(\.(md|txt))?$/i;
const RULE = '='.repeat(78);

interface Package {
  name: string;
  version: string;
  license: string;
  text: string;
}

/** The package directory holding a module, or undefined for the game's own code. */
function packageDir(id: string): string | undefined {
  const at = id.lastIndexOf('/node_modules/');
  if (at < 0) return undefined;
  const parts = id.slice(at + '/node_modules/'.length).split('/');
  const depth = parts[0].startsWith('@') ? 2 : 1;
  return id.slice(0, at) + '/node_modules/' + parts.slice(0, depth).join('/');
}

const manifestOf = (dir: string) => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));

/** Where `name` resolves from a package in `dir`: its own node_modules, then each one above. */
function resolveDependency(dir: string, name: string): string {
  for (let at = dir; at.includes('/node_modules/'); at = at.slice(0, at.lastIndexOf('/node_modules/'))) {
    const candidate = join(at, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) return candidate;
  }
  const top = join(dir.slice(0, dir.indexOf('/node_modules/')), 'node_modules', name);
  if (existsSync(join(top, 'package.json'))) return top;
  throw new Error(`licenseNotices: cannot find ${name}, a dependency of the bundled package in ${dir}`);
}

/** Adds `dir` and, transitively, the runtime dependencies of the package in it. */
function addWithDependencies(dir: string, dirs: Set<string>): void {
  if (dirs.has(dir)) return;
  dirs.add(dir);
  for (const name of Object.keys(manifestOf(dir).dependencies ?? {})) addWithDependencies(resolveDependency(dir, name), dirs);
}

function readPackage(dir: string): Package {
  const manifest = manifestOf(dir);
  const file = readdirSync(dir).find((f) => LICENSE_FILE.test(f));
  if (!file) throw new Error(`licenseNotices: ${manifest.name} is bundled but has no license file in ${dir}`);
  return {
    name: manifest.name,
    version: manifest.version,
    license: manifest.license ?? 'see text',
    text: readFileSync(join(dir, file), 'utf8').trim(),
  };
}

function section(title: string, body: string): string {
  return `${RULE}\n${title}\n${RULE}\n\n${body.trim()}\n`;
}

export function licenseNotices(root: string): Plugin {
  const read = (file: string) => readFileSync(resolve(root, file), 'utf8');
  return {
    name: 'license-notices',
    apply: 'build',
    generateBundle(_options, bundle) {
      const dirs = new Set<string>();
      for (const output of Object.values(bundle)) {
        if (output.type !== 'chunk') continue;
        for (const id of Object.keys(output.modules)) {
          const dir = packageDir(id.replace(/\\/g, '/').replace(/^\0/, ''));
          if (dir && existsSync(join(dir, 'package.json'))) addWithDependencies(dir, dirs);
        }
      }
      const packages = [...dirs].map(readPackage).sort((a, b) => a.name.localeCompare(b.name));
      const source = [
        section('Dawnbreakers: what is licensed how (the repository\'s LICENSE)', read('LICENSE')),
        ...packages.map((p) => section(`Bundled package: ${p.name} ${p.version} (${p.license})`, p.text)),
        section('LICENSE-MIT', read('LICENSE-MIT')),
        section('LICENSE-APACHE', read('LICENSE-APACHE')),
      ].join('\n\n');
      this.emitFile({ type: 'asset', fileName: 'LICENSE.txt', source });
    },
  };
}
