import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Validates dialogue trees in src/data/dialogues_ch/*.ts. For each tree:
 *   - every `next: '...'` in a `choices: [...]` block resolves to a node
 *     key within the same tree (or is omitted, meaning "end dialogue")
 *   - `startId: '...'` resolves to a node key
 *
 * Approach is regex-based on purpose: we already commit to the canonical
 * shape (`export const X: DialogueTree = { id, startId, nodes: {...} }`)
 * and a typo-detector is more useful than a full TS parser.
 *
 * Exits 1 on any failure so it can wrap into `npm run typecheck` later.
 */

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dialoguesDir = join(root, 'src', 'data', 'dialogues_ch');

const errors = [];

function listTsFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listTsFiles(full));
    else if (entry.endsWith('.ts')) out.push(full);
  }
  return out;
}

/**
 * Find each tree literal `export const <name>: DialogueTree = { ... };`
 * Returns an array of { file, name, body, startLine } where body is the
 * source between the opening `{` and the matching closing `}`.
 */
function extractTrees(file, source) {
  const trees = [];
  const re = /export\s+const\s+(\w+)\s*:\s*DialogueTree\s*=\s*\{/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const startBrace = m.index + m[0].length - 1;
    let depth = 1;
    let i = startBrace + 1;
    let inStr = null;
    while (i < source.length && depth > 0) {
      const c = source[i];
      const prev = source[i - 1];
      if (inStr) {
        if (c === inStr && prev !== '\\') inStr = null;
      } else if (c === "'" || c === '"' || c === '`') {
        inStr = c;
      } else if (c === '{') depth++;
      else if (c === '}') depth--;
      i++;
    }
    const body = source.slice(startBrace + 1, i - 1);
    const startLine = source.slice(0, m.index).split('\n').length;
    trees.push({ file, name: m[1], body, startLine });
  }
  return trees;
}

/** Inside a tree body, find the `nodes: { ... }` block and return its inner source. */
function extractNodesBody(body) {
  const re = /nodes\s*:\s*\{/;
  const m = body.match(re);
  if (!m) return null;
  const start = m.index + m[0].length - 1;
  let depth = 1;
  let i = start + 1;
  let inStr = null;
  while (i < body.length && depth > 0) {
    const c = body[i];
    const prev = body[i - 1];
    if (inStr) {
      if (c === inStr && prev !== '\\') inStr = null;
    } else if (c === "'" || c === '"' || c === '`') {
      inStr = c;
    } else if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }
  return body.slice(start + 1, i - 1);
}

/**
 * Extract top-level node keys from a `nodes: { ... }` body. Top-level here
 * means "at brace depth 0 within the nodes body."
 */
function extractNodeKeys(nodesBody) {
  const keys = new Set();
  let depth = 0;
  let inStr = null;
  let i = 0;
  let lineStart = 0;
  while (i < nodesBody.length) {
    const c = nodesBody[i];
    const prev = nodesBody[i - 1];
    if (inStr) {
      if (c === inStr && prev !== '\\') inStr = null;
      i++;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') { inStr = c; i++; continue; }
    if (c === '{') { depth++; i++; continue; }
    if (c === '}') { depth--; i++; continue; }
    if (c === '\n') { lineStart = i + 1; i++; continue; }
    if (depth === 0 && /[a-zA-Z_$]/.test(c)) {
      // try to match `<key>: {`
      const slice = nodesBody.slice(lineStart);
      const m = slice.match(/^\s*([a-zA-Z_$][\w$]*)\s*:\s*\{/);
      if (m) {
        keys.add(m[1]);
        i = lineStart + m[0].length;
        depth++;
        continue;
      }
    }
    i++;
  }
  return keys;
}

/** Find every `next: '...'` reference inside a tree body. */
function extractNextRefs(body) {
  const refs = [];
  const re = /next\s*:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const line = body.slice(0, m.index).split('\n').length;
    refs.push({ id: m[1], line });
  }
  return refs;
}

/** Find the `startId: '...'` value. */
function extractStartId(body) {
  const m = body.match(/startId\s*:\s*'([^']+)'/);
  return m ? m[1] : null;
}

/** Find the tree's own id `id: '...'`. */
function extractTreeId(body) {
  const m = body.match(/id\s*:\s*'([^']+)'/);
  return m ? m[1] : null;
}

const files = listTsFiles(dialoguesDir).sort();
const treeIds = new Map();

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const trees = extractTrees(file, source);

  for (const tree of trees) {
    const nodesBody = extractNodesBody(tree.body);
    if (!nodesBody) {
      errors.push(`${file}:${tree.startLine}  ${tree.name}: missing 'nodes' block`);
      continue;
    }
    const nodeKeys = extractNodeKeys(nodesBody);
    const treeId = extractTreeId(tree.body);
    const startId = extractStartId(tree.body);

    if (!treeId) errors.push(`${file}:${tree.startLine}  ${tree.name}: missing tree id`);
    else if (treeIds.has(treeId)) errors.push(`${file}:${tree.startLine}  ${tree.name}: duplicate tree id '${treeId}' (also in ${treeIds.get(treeId)})`);
    else treeIds.set(treeId, file);
    if (!startId) {
      errors.push(`${file}:${tree.startLine}  ${tree.name}: missing startId`);
    } else if (!nodeKeys.has(startId)) {
      errors.push(`${file}:${tree.startLine}  ${tree.name}: startId '${startId}' has no matching node`);
    }

    for (const ref of extractNextRefs(tree.body)) {
      if (!nodeKeys.has(ref.id)) {
        const line = tree.startLine + ref.line - 1;
        errors.push(`${file}:${line}  ${tree.name}: next: '${ref.id}' has no matching node`);
      }
    }
  }
}

// Flags that chapter logic depends on must actually be set by some dialogue.
const setFlags = new Set();
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const block of source.matchAll(/\bset:\s*\{([^}]*)\}/g)) {
    for (const key of block[1].matchAll(/(?:^|,)\s*(?:\[`[^`]*`\]|'([^']+)'|([A-Za-z_$][\w$]*))\s*:/g)) {
      const name = key[1] ?? key[2];
      if (name) setFlags.add(name);
    }
  }
}
const requiredFlagSources = [
  { file: join(dialoguesDir, 'chapter01_rumourFlags.ts'), pattern: /RUMOUR_FLAGS\s*=\s*\[([\s\S]*?)\]/ },
  { file: join(root, 'src', 'data', 'chapters.ts'), pattern: /CHAPTER_COMPLETION_FLAGS[^=]*=\s*\{([\s\S]*?)\}/ },
];
for (const { file, pattern } of requiredFlagSources) {
  const body = readFileSync(file, 'utf8').match(pattern)?.[1];
  if (!body) {
    errors.push(`${file}: could not find required flag list`);
    continue;
  }
  for (const flag of body.matchAll(/'([A-Za-z_$][\w$]*)'(?!\s*:)/g)) {
    if (!setFlags.has(flag[1])) errors.push(`${file}: flag '${flag[1]}' is never set by any dialogue`);
  }
}

// Every NPC on every map must point at a dialogue tree that exists.
const mapsDir = join(dirname(dialoguesDir), 'maps');
for (const file of listTsFiles(mapsDir).sort()) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(/\b(dialogue|lockedDialogue):\s*'([^']+)'/g)) {
    if (!treeIds.has(match[2])) {
      const line = source.slice(0, match.index).split('\n').length;
      errors.push(`${file}:${line}  ${match[1]} '${match[2]}' has no matching dialogue tree`);
    }
  }
}

if (errors.length === 0) {
  console.log(`OK — checked ${files.length} dialogue file(s).`);
  process.exit(0);
} else {
  console.error(`Dialogue lint failed (${errors.length} error(s)):\n`);
  for (const err of errors) console.error(`  ${err}`);
  process.exit(1);
}
