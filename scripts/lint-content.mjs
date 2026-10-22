#!/usr/bin/env node
/**
 * Content guardrails lint.
 *
 * Two checks:
 *   1. No em-dash character (U+2014) in user-facing strings. Per AGENTS.md
 *      the AI-slop em-dash is banned in game text writing.
 *   2. No central Bahá'í figure (Bahá'u'lláh, the Báb) as a dialogue
 *      speaker or a "Speak with ..." NPC. Story can speak of them, but they
 *      must not appear as characters the player can talk to.
 *
 * Existing legacy violations are tracked in `scripts/lint-content-baseline.json`
 * (regenerate with `node scripts/lint-content.mjs --update-baseline`). New
 * drift fails the lint.
 *
 * "User-facing strings" =
 *   - any string value or key inside `src/i18n/locales/<locale>.ts`
 *   - any `t(...)` / `tName(...)` argument string
 *   - any literal-field assignment: `text:`, `body:`, `label:`, `title:`,
 *     `subtitle:`, `prompt:`, `description:`, `speaker:`, `sceneTitle:`
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, 'src');
const baselinePath = join(root, 'scripts', 'lint-content-baseline.json');
const updateBaseline = process.argv.includes('--update-baseline');

const ignoreDirs = new Set(['node_modules', 'dist', 'dist-demo', '.git']);
const literalFields = new Set([
  'text', 'body', 'label', 'title', 'subtitle', 'prompt',
  'description', 'speaker', 'sceneTitle',
]);

const EM_DASH = '\u2014';
const CENTRAL_FIGURE_PATTERNS = [
  /\bBah[áa]['’]?u['’]?ll[áa]h\b/i,
  /\bBaha'?u'?llah\b/i,
  /(?<!\p{L})B[áa]b(?!\p{L})/iu,
  /Siyyid\s+ʿ?Al[íi]-Mu[ḥh]ammad/i,
  /Primal\s+Point/i,
  /Young\s+Host/i,
  /Blessed\s+Beauty/i,
  /Ancient\s+Beauty/i,
  /[ḤH]usayn-ʿ?Al[íi]/i,
];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (ignoreDirs.has(entry)) continue;
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) out.push(...walk(path));
    else if (stat.isFile() && extname(path) === '.ts') out.push(path);
  }
  return out;
}

function lineFor(source, index) {
  return source.slice(0, index).split('\n').length;
}

/**
 * Walks a TS source character-by-character, returning the [start,end] index
 * range of every string literal that is NOT inside a // or /* *\/ comment.
 */
function findStringLiterals(source) {
  const ranges = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    const n = source[i + 1];
    if (c === '/' && n === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (c === '/' && n === '*') {
      i += 2;
      while (i < source.length - 1 && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (c === '\'' || c === '"' || c === '`') {
      const quote = c;
      const start = i + 1;
      i += 1;
      let templateDepth = 0;
      while (i < source.length) {
        const cc = source[i];
        if (cc === '\\') { i += 2; continue; }
        if (quote === '`' && cc === '$' && source[i + 1] === '{') {
          templateDepth += 1;
          i += 2;
          continue;
        }
        if (quote === '`' && templateDepth > 0 && cc === '}') {
          templateDepth -= 1;
          i += 1;
          continue;
        }
        if (cc === quote && templateDepth === 0) { break; }
        i += 1;
      }
      ranges.push({ start, end: i, quote });
      i += 1;
      continue;
    }
    i += 1;
  }
  return ranges;
}

/** True if the string literal at `range` is in a user-facing context. */
function isUserFacing(file, source, range) {
  // Locale files: every string is user-facing (key OR value).
  if (file.includes(`${`/`}i18n/locales/`) || file.includes('\\i18n\\locales\\')) {
    return true;
  }
  // Scan backwards from range.start to find the nearest preceding token.
  // Match: `t(`, `tName(`, or `<field>:` / `<field> =`.
  const back = source.slice(Math.max(0, range.start - 80), range.start - 1);
  if (/\b(?:t|tName)\s*\(\s*$/.test(back)) return true;
  const fieldMatch = back.match(/\b([A-Za-z_$][\w$]*)\s*[:=]\s*$/);
  if (fieldMatch && literalFields.has(fieldMatch[1])) return true;
  return false;
}

const issues = []; // { file, line, kind, snippet }

for (const file of walk(srcDir)) {
  const source = readFileSync(file, 'utf8');
  const ranges = findStringLiterals(source);
  for (const range of ranges) {
    if (!isUserFacing(file, source, range)) continue;
    const value = source.slice(range.start, range.end);
    if (value.includes(EM_DASH)) {
      issues.push({
        file: relative(root, file),
        line: lineFor(source, range.start),
        kind: 'em-dash',
        snippet: value.length > 120 ? `${value.slice(0, 117)}...` : value,
      });
    }
    for (const pattern of CENTRAL_FIGURE_PATTERNS) {
      if (pattern.test(value)) {
        // Only flag when the string names a speaker or an NPC's interaction
        // prompt, since narrative text is allowed to MENTION central figures.
        const back = source.slice(Math.max(0, range.start - 80), range.start - 1);
        const isSpeaker = /\bspeaker\s*[:=]\s*$/.test(back);
        const isNpcPrompt = /\bprompt\s*:\s*$/.test(back) && /^(Speak|Talk) with/i.test(value);
        if (isSpeaker || isNpcPrompt) {
          issues.push({
            file: relative(root, file),
            line: lineFor(source, range.start),
            kind: 'central-figure-character',
            snippet: value,
          });
        }
        break;
      }
    }
  }
}

function issueKey(issue) {
  return `${issue.kind}::${issue.file}::${issue.snippet}`;
}

const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf8'))
  : { allowed: [] };
const allowed = new Set(baseline.allowed);

if (updateBaseline) {
  const newAllowed = [...new Set(issues.map(issueKey))].sort();
  writeFileSync(baselinePath, `${JSON.stringify({ allowed: newAllowed }, null, 2)}\n`);
  console.log(`Wrote baseline with ${newAllowed.length} grandfathered entries to ${relative(root, baselinePath)}`);
  process.exit(0);
}

const newIssues = issues.filter(issue => !allowed.has(issueKey(issue)));

if (newIssues.length === 0) {
  const grandfathered = issues.length;
  console.log(`Content lint passed. (${grandfathered} grandfathered legacy entries via baseline.)`);
  process.exit(0);
}

console.error(`Content lint failed: ${newIssues.length} new violation(s).\n`);
const byKind = new Map();
for (const issue of newIssues) {
  const list = byKind.get(issue.kind) ?? [];
  list.push(issue);
  byKind.set(issue.kind, list);
}
for (const [kind, list] of byKind) {
  console.error(`\n[${kind}] ${list.length} issue(s):`);
  for (const issue of list.slice(0, 50)) {
    console.error(`  ${issue.file}:${issue.line}  ${issue.snippet}`);
  }
  if (list.length > 50) console.error(`  ... and ${list.length - 50} more`);
}
console.error('\nIf these are intentional and pre-existing, run:');
console.error('  node scripts/lint-content.mjs --update-baseline');
process.exit(1);
