#!/usr/bin/env node
/**
 * Finds and stops what our work leaves running, so a finished task leaves no
 * memory behind:
 *
 * - Vite dev and preview servers started from this repo (or from a copy of
 *   it, such as a scratchpad build), and the npm wrappers around them.
 * - Node scripts of this repo (smoke, look, throwaway out/ scripts).
 * - Headless Chromium started by the test harness (Playwright profiles).
 * - Desktop Chromium launched on a localhost URL: that is how a server's
 *   "open the browser" starts one, and each such window runs the game on the
 *   GPU until closed.
 *
 * By default only orphans are stopped: processes whose shell, agent or
 * terminal has gone, so they now hang off the system (pid 1 or the user's
 * systemd). Anything still attached to a live session, such as another
 * agent's smoke run or a server someone is keeping up, is left alone.
 *
 *   npm run reap                       # stop orphans
 *   npm run reap -- --dry-run          # only list them
 *   npm run reap -- --all              # also stop attached ones (yours to stop)
 *   npm run reap -- --keep-port 4173   # spare a server on that port even with --all
 *
 * Linux only (reads /proc). Never touches a browser you opened yourself on
 * an ordinary page.
 */
import { readdirSync, readFileSync, readlinkSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const everything = args.includes('--all');
const keepPorts = args.flatMap((a, i) => (a === '--keep-port' ? [args[i + 1]] : []));
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const repoName = basename(root);

/** Every process as { pid, ppid, argv, cwd }. */
function processes() {
  const out = [];
  for (const entry of readdirSync('/proc')) {
    if (!/^\d+$/.test(entry)) continue;
    const pid = Number(entry);
    try {
      const argv = readFileSync(`/proc/${pid}/cmdline`, 'utf8').split('\0').filter(Boolean);
      if (argv.length === 0) continue;
      const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
      const ppid = Number(stat.slice(stat.lastIndexOf(')') + 2).split(' ')[1]);
      let cwd = '';
      try { cwd = readlinkSync(`/proc/${pid}/cwd`); } catch { /* another user's process */ }
      out.push({ pid, ppid, argv, cwd });
    } catch { /* exited while we looked */ }
  }
  return out;
}

const all = processes();
// This script and everything above it (the npm wrapper, the shell that ran
// it) may mention vite or node in their command lines: never touch them.
const self = new Set([process.pid]);
for (let pid = process.ppid; pid > 1 && !self.has(pid);) {
  self.add(pid);
  pid = all.find(p => p.pid === pid)?.ppid ?? 0;
}
const line = (p) => p.argv.join(' ');
/** Started from this repo or a copy of it (a scratchpad build lives under a path naming the repo). */
const ours = (p) => p.cwd.startsWith(root) || p.cwd.includes(repoName);

function why(p) {
  if (self.has(p.pid)) return undefined;
  const cmd = line(p);
  const exe = basename(p.argv[0].split(' ')[0]); // npm retitles itself "npm exec vite ..."
  if (/\/chromium|chrome|headless_shell/.test(p.argv[0])) {
    if (cmd.includes('--type=')) return undefined; // helpers go with their browser
    if (/playwright_chromiumdev_profile|--headless/.test(cmd)) return 'headless test browser';
    if (/\shttps?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?\/?\S*\s*$/.test(` ${cmd}`)) return 'browser opened on a local server';
    return undefined;
  }
  if (!ours(p)) return undefined;
  // Only the programs themselves, never a shell whose script text mentions them.
  if (!/^(node|npm|npx|vite)$/.test(exe)) return undefined;
  if (/\bvite\b/.test(cmd)) {
    if (keepPorts.some(port => cmd.includes(`--port ${port}`))) return undefined;
    return /preview/.test(cmd) ? 'vite preview server' : 'vite dev server';
  }
  if (exe === 'node' && /(^|\s)(\S*\/)?(scripts|out)\/\S+\.m?js\b/.test(cmd)) return 'repo script';
  return undefined;
}

const byPid = new Map(all.map(p => [p.pid, p]));
const isSystem = (p) => !p || p.pid === 1 || /(^|\/)systemd$/.test(p.argv[0]) || p.argv[0] === 'systemd';

/**
 * Whether the process's owner is gone: climbing through its parents, only our
 * kind of process (npm, node, vite, the browser) stands between it and the
 * system. A shell, an agent or a terminal on the way means someone is still
 * running it.
 */
function orphaned(p) {
  for (let up = byPid.get(p.ppid); ; up = byPid.get(up.ppid)) {
    if (isSystem(up)) return true;
    const exe = basename(up.argv[0].split(' ')[0]);
    if (!/^(node|npm|npx|vite|chromium|chrome)$/.test(exe)) return false;
  }
}

const targets = all.map(p => ({ p, reason: why(p) }))
  .filter(t => t.reason && (everything || orphaned(t.p)));
const pids = new Set(targets.map(t => t.p.pid));
if (targets.length === 0) {
  console.log('Nothing to reap.');
  process.exit(0);
}
for (const { p, reason } of targets) {
  console.log(`${dryRun ? 'would stop' : 'stopping'} ${String(p.pid).padStart(7)}  ${reason.padEnd(32)} ${line(p).slice(0, 110)}`);
}
if (dryRun) process.exit(0);

const signal = (sig) => {
  for (const pid of pids) {
    try { process.kill(pid, sig); } catch { pids.delete(pid); }
  }
};
signal('SIGTERM');
await sleep(2500);
signal(0);
if (pids.size) {
  console.log(`${pids.size} still running; killing.`);
  signal('SIGKILL');
}
const left = processes().filter(p => /\/chromium|chrome/.test(p.argv[0]) && targets.some(t => t.p.pid === p.ppid));
console.log(left.length ? `${left.length} browser helpers still exiting.` : 'Done.');
