import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const srcDir = join(root, 'src');
const i18nPath = join(srcDir, 'i18n.ts');
const i18nModuleDir = join(srcDir, 'i18n');

const ignoreDirs = new Set(['node_modules', 'dist', 'dist-demo', '.git']);
const literalFields = new Set([
  'body',
  'description',
  'heading',
  'hint',
  'label',
  'lockedLabel',
  'prompt',
  'sceneTitle',
  'speaker',
  'subtitle',
  'text',
  'title',
]);
const nameFields = new Set(['speaker']);
const allowedUnwrappedText = new Set(['✓', '⌄', '−']);

function read(path) {
  return readFileSync(path, 'utf8');
}

function stripComments(source) {
  let out = '';
  let i = 0;
  let quote = null;
  let templateDepth = 0;

  while (i < source.length) {
    const char = source[i];
    const next = source[i + 1];

    if (quote) {
      out += char;
      if (char === '\\') {
        out += source[i + 1] ?? '';
        i += 2;
        continue;
      }
      if (quote === '`' && char === '$' && next === '{') {
        templateDepth += 1;
        out += next;
        i += 2;
        continue;
      }
      if (quote === '`' && templateDepth > 0 && char === '}') {
        templateDepth -= 1;
        i += 1;
        continue;
      }
      if (char === quote && templateDepth === 0) quote = null;
      i += 1;
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      out += char;
      i += 1;
      continue;
    }
    if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      out += '\n';
      i += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) {
        out += source[i] === '\n' ? '\n' : ' ';
        i += 1;
      }
      i += 2;
      continue;
    }

    out += char;
    i += 1;
  }

  return out;
}

function findMatchingBrace(source, openIndex) {
  let quote = null;
  let depth = 0;

  for (let i = openIndex; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (char === '\\') {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function objectBodyAfter(source, marker) {
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${marker}`);
  const open = source.indexOf('{', start);
  const close = findMatchingBrace(source, open);
  if (open === -1 || close === -1) throw new Error(`Could not parse object after ${marker}`);
  return source.slice(open + 1, close);
}

function objectBodiesAfter(source, marker) {
  const bodies = [];
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf(marker, cursor);
    if (start === -1) break;
    const open = source.indexOf('{', start);
    const close = findMatchingBrace(source, open);
    if (open === -1 || close === -1) throw new Error(`Could not parse object after ${marker}`);
    bodies.push(source.slice(open + 1, close));
    cursor = close + 1;
  }

  return bodies;
}

function stringArrayAfter(source, marker) {
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Could not find ${marker}`);
  const assignment = source.indexOf('=', start);
  const open = source.indexOf('[', assignment === -1 ? start : assignment);
  const close = source.indexOf(']', open);
  if (open === -1 || close === -1) throw new Error(`Could not parse array after ${marker}`);

  return [...source.slice(open + 1, close).matchAll(/(['"])((?:\\.|(?!\1)[\s\S])*?)\1/g)]
    .map(match => parseStringLiteral(`${match[1]}${match[2]}${match[1]}`));
}

function parseStringLiteral(raw) {
  const quote = raw[0];
  const inner = raw.slice(1, -1);
  if (quote === '`') return inner.replace(/\\`/g, '`').replace(/\\\$/g, '$');
  try {
    return JSON.parse(`"${inner.replace(/"/g, '\\"')}"`);
  } catch {
    return inner.replace(/\\'/g, '\'').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  }
}

function lineFor(source, index) {
  return source.slice(0, index).split('\n').length;
}

function collectObjectKeys(body, label, seen, duplicates) {
  // Catalog entries are one per line; anchoring at line start keeps a
  // "word:" inside a translated value from being read as a key.
  const keyRe = /^[ \t]*(?:(['"])((?:\\.|(?!\1)[^\n])*?)\1|([\p{ID_Start}$_][\p{ID_Continue}$\u200c\u200d]*))[ \t]*:/gmu;
  const keys = new Set();
  let match;

  while ((match = keyRe.exec(body))) {
    const key = match[2] !== undefined
      ? parseStringLiteral(`${match[1]}${match[2]}${match[1]}`)
      : match[3];
    const id = `${label}:${key}`;
    keys.add(key);
    if (seen.has(id)) duplicates.push(`${label}.${key}`);
    seen.add(id);
  }

  return keys;
}

function walk(dir) {
  const files = [];

  for (const entry of readdirSync(dir)) {
    if (ignoreDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      files.push(...walk(path));
    } else if (stat.isFile() && extname(path) === '.ts') {
      files.push(path);
    }
  }

  return files;
}

function addRequired(map, key, file, line, kind) {
  if (!key || !key.trim()) return;
  if (/^\s*$/.test(key)) return;
  const refs = map.get(key) ?? [];
  refs.push(`${relative(root, file)}:${line} (${kind})`);
  map.set(key, refs);
}

function collectFromTranslationCalls(source, file, translationRequired, namesRequired) {
  const callRe = /\b(t|tName)\(\s*(["'`])((?:\\.|(?!\2)[\s\S])*?)\2/g;
  let match;

  while ((match = callRe.exec(source))) {
    if (match[2] === '`' && match[3].includes('${')) continue;
    const key = parseStringLiteral(`${match[2]}${match[3]}${match[2]}`);
    const target = match[1] === 'tName' ? namesRequired : translationRequired;
    addRequired(target, key, file, lineFor(source, match.index), `${match[1]}()`);
  }

  // Both branches of `t(cond ? 'a' : 'b')`.
  const ternaryRe = /\b(t|tName)\(\s*[^'"`()?]+\?\s*(["'])((?:\\.|(?!\2).)*?)\2\s*:\s*(["'])((?:\\.|(?!\4).)*?)\4\s*\)/g;
  while ((match = ternaryRe.exec(source))) {
    const target = match[1] === 'tName' ? namesRequired : translationRequired;
    for (const [quote, body] of [[match[2], match[3]], [match[4], match[5]]]) {
      addRequired(target, parseStringLiteral(`${quote}${body}${quote}`), file, lineFor(source, match.index), `${match[1]}()`);
    }
  }
}

function collectFromLiteralFields(source, file, translationRequired, namesRequired) {
  const fieldRe = /\b([A-Za-z_$][\w$]*)\s*[:=]\s*(["'`])((?:\\.|(?!\2)[\s\S])*?)\2/g;
  let match;

  while ((match = fieldRe.exec(source))) {
    const field = match[1];
    if (!literalFields.has(field)) continue;
    if (match[2] === '`' && match[3].includes('${')) continue;

    const key = parseStringLiteral(`${match[2]}${match[3]}${match[2]}`);
    const target = nameFields.has(field) ? namesRequired : translationRequired;
    addRequired(target, key, file, lineFor(source, match.index), field);
  }
}

function collectFromNpcPrompts(source, file, translationRequired) {
  const promptRe = /addNPC\([\s\S]*?\(\)\s*=>\s*(["'`])((?:\\.|(?!\1)[\s\S])*?)\1/g;
  let match;

  while ((match = promptRe.exec(source))) {
    if (match[1] === '`' && match[2].includes('${')) continue;
    const key = parseStringLiteral(`${match[1]}${match[2]}${match[1]}`);
    addRequired(translationRequired, key, file, lineFor(source, match.index), 'addNPC prompt');
  }
}

function extractCallArguments(source, callIndex) {
  const open = source.indexOf('(', callIndex);
  if (open === -1) return null;

  const args = [];
  let quote = null;
  let depth = 0;
  let argStart = open + 1;

  for (let i = open + 1; i < source.length; i += 1) {
    const char = source[i];

    if (quote) {
      if (char === '\\') {
        i += 1;
        continue;
      }
      if (char === quote) quote = null;
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      continue;
    }
    if (char === '(' || char === '[' || char === '{') depth += 1;
    if (char === ')' || char === ']' || char === '}') {
      if (depth === 0 && char === ')') {
        args.push(source.slice(argStart, i).trim());
        return args;
      }
      depth -= 1;
      continue;
    }
    if (char === ',' && depth === 0) {
      args.push(source.slice(argStart, i).trim());
      argStart = i + 1;
    }
  }

  return null;
}

function collectUnwrappedText(source, file, errors) {
  const textCallRe = /\badd\.text\s*\(/g;
  let match;

  while ((match = textCallRe.exec(source))) {
    const args = extractCallArguments(source, match.index);
    const textArg = args?.[2];
    if (!textArg) continue;

    const literal = textArg.match(/^(['"`])((?:\\.|(?!\1)[\s\S])*?)\1$/);
    if (!literal) continue;

    const value = parseStringLiteral(`${literal[1]}${literal[2]}${literal[1]}`);
    if (literal[1] === '`' && literal[2].includes('${')) continue;
    if (value.trim() === '') continue;
    if (allowedUnwrappedText.has(value)) continue;

    errors.push(`${relative(root, file)}:${lineFor(source, match.index)} add.text() uses unlocalized text "${value}"`);
  }
}

/**
 * The glossary cards: `term(id, title, match, body)`, `person(id, title, match, body)`,
 * `place(id, title, at, body)`
 * and `region(id, title, body)` in the glossary data, and the kind labels the
 * tooltip prints. They reach `t()` through fields, not literals.
 */
function collectFromGlossary(source, file, translationRequired) {
  const literal = /^(['"`])((?:\\.|(?!\1)[\s\S])*?)\1$/;
  const add = (arg, index, kind) => {
    const m = arg?.match(literal);
    if (!m) return;
    addRequired(translationRequired, parseStringLiteral(`${m[1]}${m[2]}${m[1]}`), file, lineFor(source, index), kind);
  };
  const bodyAt = { term: 3, person: 3, place: 3, region: 2 };
  const callRe = /^[ \t]*(term|person|place|region)\(/gm;
  let match;
  while ((match = callRe.exec(source))) {
    const args = extractCallArguments(source, match.index);
    if (!args) continue;
    add(args[1], match.index, 'glossary title');
    add(args[bodyAt[match[1]]], match.index, 'glossary body');
  }
}

function collectKindLabels(source, file, translationRequired) {
  const decl = source.match(/const KIND_LABEL = \{([^}]*)\}/);
  if (!decl) return;
  for (const m of decl[1].matchAll(/:\s*(['"])((?:\\.|(?!\1).)*)\1/g)) {
    addRequired(translationRequired, m[2], file, lineFor(source, decl.index), 'glossary kind label');
  }
}

function sortedMissing(required, available) {
  return [...required.entries()]
    .filter(([key]) => !available.has(key))
    .sort(([a], [b]) => a.localeCompare(b));
}

function sortedMissingBy(required, isCovered) {
  return [...required.entries()]
    .filter(([key]) => !isCovered(key))
    .sort(([a], [b]) => a.localeCompare(b));
}

/**
 * Scan the source tree for every player-facing string and read every locale
 * catalog. Shared by `lint-localization.mjs` and `i18n-sync.mjs`.
 */
export function analyzeLocalization() {
  const i18nSource = stripComments(read(i18nPath));
  const supportedLocales = stringArrayAfter(i18nSource, 'export const SUPPORTED_LOCALES =');
  const localizedLocales = supportedLocales.filter(locale => locale !== 'en');
  const duplicates = [];
  const catalogs = new Map();
  const nameCatalogs = new Map();

  for (const locale of supportedLocales) {
    const seenTranslationKeys = new Set();
    const catalog = new Set();
    const marker = `const ${locale}: TranslationCatalog =`;
    const localePath = join(i18nModuleDir, 'locales', `${locale}.ts`);
    const localeSource = existsSync(localePath) ? stripComments(read(localePath)) : '';

    if (i18nSource.includes(marker)) {
      for (const body of [
        objectBodyAfter(i18nSource, marker),
        ...objectBodiesAfter(i18nSource, `Object.assign(${locale},`),
      ]) {
        for (const key of collectObjectKeys(body, locale, seenTranslationKeys, duplicates)) catalog.add(key);
      }
    } else if (localeSource.includes('export const text: TranslationCatalog =')) {
      for (const body of [
        objectBodyAfter(localeSource, 'export const text: TranslationCatalog ='),
        ...objectBodiesAfter(localeSource, 'Object.assign(text,'),
      ]) {
        for (const key of collectObjectKeys(body, locale, seenTranslationKeys, duplicates)) catalog.add(key);
      }
    }
    catalogs.set(locale, catalog);
    const seenNameKeys = new Set();
    const names = new Set();
    const nameMarker = `const ${locale}Names: TranslationCatalog =`;

    if (i18nSource.includes(nameMarker)) {
      for (const key of collectObjectKeys(
        objectBodyAfter(i18nSource, nameMarker),
        `${locale}Names`,
        seenNameKeys,
        duplicates,
      )) {
        names.add(key);
      }
    } else if (localeSource.includes('export const names: TranslationCatalog =')) {
      for (const key of collectObjectKeys(
        objectBodyAfter(localeSource, 'export const names: TranslationCatalog ='),
        `${locale}Names`,
        seenNameKeys,
        duplicates,
      )) {
        names.add(key);
      }
    }
    nameCatalogs.set(locale, names);
  }

  const translationRequired = new Map();
  const namesRequired = new Map();
  const unwrappedTextErrors = [];

  for (const file of walk(srcDir)) {
    if (!relative(i18nModuleDir, file).startsWith('..')) continue;
    const source = stripComments(read(file));
    collectFromTranslationCalls(source, file, translationRequired, namesRequired);
    collectFromLiteralFields(source, file, translationRequired, namesRequired);
    collectFromNpcPrompts(source, file, translationRequired);
    collectUnwrappedText(source, file, unwrappedTextErrors);
    if (file.includes(join('data', 'glossary', ''))) collectFromGlossary(source, file, translationRequired);
    collectKindLabels(source, file, translationRequired);
  }

  const hasLocaleCoverage = (locale, key) => {
    const catalog = catalogs.get(locale) ?? new Set();
    const names = nameCatalogs.get(locale) ?? new Set();
    if (catalog.has(key) || names.has(key)) return true;

    const speakMatch = key.match(/^Speak with (.+?)\s+\[E\]$/);
    return Boolean(speakMatch && (names.has(speakMatch[1]) || catalog.has(speakMatch[1])));
  };

  return {
    root,
    supportedLocales,
    localizedLocales,
    catalogs,
    nameCatalogs,
    duplicates,
    translationRequired,
    namesRequired,
    unwrappedTextErrors,
    hasLocaleCoverage,
  };
}

export { sortedMissing, sortedMissingBy };
