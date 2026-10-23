#!/usr/bin/env node
/**
 * Keep the locale catalogs in step with the English source.
 *
 *   node scripts/i18n-sync.mjs --export out/i18n   # write <locale>.json of missing keys
 *   node scripts/i18n-sync.mjs --import out/i18n   # merge translated <locale>.json back in
 *   node scripts/i18n-sync.mjs --prune             # drop unused keys, and translations
 *                                                  # containing em-dashes (they get re-exported)
 *
 * Export format, one file per locale:
 *   { "text": { "<english>": "" }, "names": { "<speaker>": "" },
 *     "context": { "<english>": "src/file.ts:12 (text)" } }
 * Fill in the empty strings and run --import. Untranslated (empty) entries
 * are skipped, so a partial file is safe to import.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { analyzeLocalization, sortedMissing, sortedMissingBy } from './lib/localization.mjs';

const args = process.argv.slice(2);
const mode = args[0];
const target = args[1];
const analysis = analyzeLocalization();
const { root, localizedLocales, nameCatalogs, translationRequired, namesRequired, hasLocaleCoverage } = analysis;
const localePath = (locale) => join(root, 'src', 'i18n', 'locales', `${locale}.ts`);

const SPEAK_RE = /^Speak with (.+?)\s+\[E\]$/;
const speakNames = new Set(
  [...translationRequired.keys()].map((key) => key.match(SPEAK_RE)?.[1]).filter(Boolean),
);

if (mode === '--export' && target) exportMissing(resolve(root, target));
else if (mode === '--import' && target) importTranslations(resolve(root, target));
else if (mode === '--prune') prune();
else {
  console.error('Usage: i18n-sync.mjs --export <dir> | --import <dir> | --prune');
  process.exit(1);
}

function exportMissing(dir) {
  mkdirSync(dir, { recursive: true });
  for (const locale of localizedLocales) {
    const missingText = sortedMissingBy(translationRequired, (key) =>
      hasLocaleCoverage(locale, key) || (SPEAK_RE.test(key)));
    const missingSpeak = [...speakNames]
      .filter((name) => !hasLocaleCoverage(locale, name))
      .map((name) => [name, translationRequired.get(`Speak with ${name}  [E]`) ?? []]);
    const missingNames = sortedMissing(namesRequired, nameCatalogs.get(locale) ?? new Set());
    const out = { text: {}, names: {}, context: {} };
    for (const [key, refs] of missingText) {
      out.text[key] = '';
      out.context[key] = refs[0];
    }
    for (const [key, refs] of [...missingNames, ...missingSpeak]) {
      out.names[key] = '';
      out.context[key] = refs[0] ?? 'NPC prompt name';
    }
    writeFileSync(join(dir, `${locale}.json`), `${JSON.stringify(out, null, 2)}\n`);
    console.log(`${locale}: ${Object.keys(out.text).length} text, ${Object.keys(out.names).length} names missing`);
  }
}

function importTranslations(dir) {
  for (const locale of localizedLocales) {
    let data;
    try {
      data = JSON.parse(readFileSync(join(dir, `${locale}.json`), 'utf8'));
    } catch {
      console.log(`${locale}: no file, skipped`);
      continue;
    }
    let source = readFileSync(localePath(locale), 'utf8');
    const existing = parseEntries(source);
    const lines = (section) => Object.entries(data[section] ?? {})
      .filter(([key, value]) => typeof value === 'string' && value.trim() !== '')
      .filter(([key]) => !existing.some((e) => e.section === section && e.key === key))
      .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`);
    const textLines = lines('text');
    const nameLines = lines('names');
    source = insertBeforeClose(source, 'export const text: TranslationCatalog =', textLines);
    source = insertBeforeClose(source, 'export const names: TranslationCatalog =', nameLines);
    writeFileSync(localePath(locale), source);
    console.log(`${locale}: +${textLines.length} text, +${nameLines.length} names`);
  }
}

function prune() {
  for (const locale of localizedLocales) {
    const source = readFileSync(localePath(locale), 'utf8');
    const entries = parseEntries(source);
    const sourceLines = source.split('\n');
    const drop = new Set(entries
      .filter(({ section, key, line }) => sourceLines[line].includes('\u2014') || (section === 'names'
        ? !namesRequired.has(key) && !speakNames.has(key)
        : !translationRequired.has(key) && !speakNames.has(key)))
      .map((entry) => entry.line));
    const kept = sourceLines.filter((_, i) => !drop.has(i));
    writeFileSync(localePath(locale), kept.join('\n'));
    console.log(`${locale}: pruned ${drop.size}`);
  }
}

/** One entry per line: `  key: 'value',` with the key quoted or bare. */
function parseEntries(source) {
  const entries = [];
  let section;
  source.split('\n').forEach((line, index) => {
    // Each catalog is declared once and extended by later `Object.assign` blocks.
    if (/^(export const text|Object\.assign\(text\b)/.test(line)) section = 'text';
    else if (/^(export const names|Object\.assign\(names\b)/.test(line)) section = 'names';
    if (!section) return;
    const match = line.match(/^\s+(?:'((?:\\.|[^'\\])*)'|"((?:\\.|[^"\\])*)"|([A-Za-z_$][\w$]*))\s*:/);
    if (!match) return;
    const key = match[3] ?? unescape(match[1] ?? match[2], match[1] !== undefined ? '\'' : '"');
    entries.push({ section, key, line: index });
  });
  return entries;
}

function unescape(inner, quote) {
  try {
    return JSON.parse(`"${quote === '\'' ? inner.replace(/\\'/g, '\'').replace(/"/g, '\\"') : inner}"`);
  } catch {
    return inner;
  }
}

function insertBeforeClose(source, marker, lines) {
  if (lines.length === 0) return source;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Missing ${marker}`);
  const close = source.indexOf('\n};', start);
  return `${source.slice(0, close)}\n${lines.join('\n')}${source.slice(close)}`;
}
