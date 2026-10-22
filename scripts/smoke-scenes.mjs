#!/usr/bin/env node
/**
 * Headless smoke test: boots the game in Chromium, starts every map scene,
 * opens every NPC's dialogue and clicks through its first choice, and fails
 * on any page error or on anyone the player cannot walk up to. Also reports
 * frame rate per scene, and anyone who can be reached from one side only.
 *
 *   npm run smoke                       # all scenes
 *   npm run smoke -- --scenes City,Road # a subset
 *   npm run smoke -- --shots out/shots  # also save a screenshot per scene
 *   npm run smoke -- --gpu              # real GPU, for meaningful frame rates
 *
 * Uses the system Chromium (override with CHROMIUM_PATH) through
 * `lib/gameBrowser.mjs`, which starts its own Vite server and always cleans up.
 */
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openGame, root, waitForBoot } from './lib/gameBrowser.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const only = argValue('--scenes')?.split(',').filter(Boolean);
const shots = argValue('--shots');
if (shots) mkdirSync(resolve(root, shots), { recursive: true });

// Frame rates are only meaningful on the real GPU (`--gpu`); software rendering is the default.
const { page, url, close } = await openGame({ gpu: args.includes('--gpu'), args: ['--autoplay-policy=no-user-gesture-required'] });
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error' && !/audio|decod/i.test(m.text())) errors.push(`console: ${m.text()}`);
});
await page.addInitScript(() => {
  localStorage.clear();
  localStorage.setItem('dawnbreakers.locale', 'en');
});

/**
 * Runs in the page: talks to every NPC on map `k` in turn, choosing the first
 * open choice until the dialogue ends. Waits on scene state rather than fixed
 * sleeps, so a slow, loaded machine only takes longer. A dialogue still open
 * after its step budget (its first choices go round in a loop) is closed by
 * hand, and the map resumed, before the next NPC.
 */
async function walkDialogues(k) {
  const game = window.__game;
  const scene = game.scene.getScene(k);
  const MAX_STEPS = 60;
  const until = async (ready, ms = 10000) => {
    const end = performance.now() + ms;
    while (!ready()) {
      if (performance.now() > end) return false;
      await new Promise((r) => setTimeout(r, 16));
    }
    return true;
  };
  const dialogueOpen = () => game.scene.isActive('Dialogue') || game.scene.isPaused('Dialogue');
  // The map is back in play: running, with no dialogue or chapter card over it.
  const settle = async () => {
    await until(() => !dialogueOpen() && (game.scene.isActive(k) || game.scene.isActive('ChapterEnd')), 3000);
    if (game.scene.isActive('ChapterEnd') || game.scene.isPaused('ChapterEnd')) game.scene.stop('ChapterEnd');
    if (game.scene.isPaused(k)) game.scene.resume(k);
    return until(() => game.scene.isActive(k) && !dialogueOpen());
  };
  let talked = 0;
  const unfinished = [];
  const dialogue = game.scene.getScene('Dialogue');
  // Walk the open dialogue along its first open choices; returns whether it ended.
  const walkOpen = async () => {
    for (let step = 0; step < MAX_STEPS; step++) {
      const node = dialogue.tree.nodes[dialogue.currentId];
      const flags = JSON.parse(localStorage.getItem('dawnbreakers.flags.v1') ?? '{}');
      const choices = node?.choices?.filter((c) => !c.requires || c.requires(flags)) ?? [{}];
      const choice = choices[0] ?? {};
      // Choosing a choice that leads nowhere finishes the dialogue; its stop lands on the next frame.
      const ended = !node || !choice.next || !dialogue.tree.nodes[choice.next];
      dialogue.choose(choice);
      await new Promise((r) => setTimeout(r, 0));
      if (ended) return true;
    }
    return false;
  };
  const closeUnfinished = (who, tree) => {
    unfinished.push(`${who} ("${tree.id}") did not end in ${MAX_STEPS} first choices; closed it`);
    game.scene.stop('Dialogue');
    game.scene.resume(k);
  };
  // A chapter's opening narration plays by itself on its first scene (it is open by now).
  if (game.scene.isActive('Dialogue')) {
    const tree = dialogue.tree;
    if (!(await walkOpen())) closeUnfinished('opening', tree);
  }
  // Doors lead to other maps; only people and story objects open dialogues.
  const people = scene.npcs.interactables.filter((i) => !scene.doors.interactables.includes(i));
  for (const npc of people) {
    if (!(await settle())) {
      unfinished.push(`${k} did not come back after a dialogue; skipped the rest`);
      break;
    }
    npc.action();
    const who = npc.prompt.replace(/\s*\[E\]$/, '');
    if (!(await until(() => game.scene.isActive('Dialogue'), 5000))) {
      unfinished.push(`${who} opened no dialogue`);
      continue;
    }
    const tree = dialogue.tree;
    if (!(await walkOpen())) closeUnfinished(who, tree);
    talked++;
  }
  await settle();
  return { talked, unfinished };
}

let failed = false;
try {
  await page.goto(url);
  await waitForBoot(page);
  const keys = only ?? await page.evaluate(() => window.__game.scene.scenes
    .filter((s) => s.constructor.name === 'MapScene')
    .map((s) => s.scene.key));

  for (const key of keys) {
    const before = errors.length;
    await page.evaluate((k) => {
      const game = window.__game;
      game.scene.getScenes(true).forEach((s) => s.scene.stop());
      game.scene.start(k);
    }, key);
    await page.waitForFunction((k) => window.__game.scene.isActive(k), key, { timeout: 10000 });
    await page.waitForTimeout(500);
    const fps = await page.evaluate(() => new Promise((done) => {
      let frames = 0;
      const start = performance.now();
      const tick = () => {
        frames++;
        if (performance.now() - start < 1000) requestAnimationFrame(tick);
        else done(frames);
      };
      requestAnimationFrame(tick);
    }));
    if (shots) await page.screenshot({ path: join(resolve(root, shots), `${key}.png`) });

    // Reach: from where the player stands, how many sides of each interactable can they step to?
    const reach = await page.evaluate((k) => {
      const scene = window.__game.scene.getScene(k);
      const { blocked, playerGrid } = scene;
      const seen = new Set([`${playerGrid.x},${playerGrid.y}`]);
      const queue = [playerGrid];
      while (queue.length) {
        const { x, y } = queue.shift();
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = x + dx;
          const ny = y + dy;
          if (blocked[ny]?.[nx] !== false || seen.has(`${nx},${ny}`)) continue;
          seen.add(`${nx},${ny}`);
          queue.push({ x: nx, y: ny });
        }
      }
      // Doors and thresholds are meant to be met from one side.
      const doorway = (i) => scene.doors.interactables.includes(i) || /door|threshold/.test(i.texture);
      return scene.npcs.interactables.map((i) => ({
        doorway: doorway(i),
        name: i.prompt.replace(/\s*\[E\]$/, ''),
        at: `${i.gridX},${i.gridY}`,
        sides: [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => seen.has(`${i.gridX + dx},${i.gridY + dy}`)).length,
      }));
    }, key);
    for (const r of reach.filter((r) => r.sides === 0)) errors.push(`unreachable: ${r.name} at ${r.at}`);
    const tight = reach.filter((r) => r.sides === 1 && !r.doorway);

    // Open each NPC's dialogue and walk the first choice path to its end.
    const { talked, unfinished } = await page.evaluate(walkDialogues, key);

    const sceneErrors = errors.slice(before);
    const status = sceneErrors.length ? 'FAIL' : 'ok';
    if (sceneErrors.length) failed = true;
    console.log(`${status.padEnd(4)} ${key.padEnd(20)} ${String(fps).padStart(4)} fps  ${talked} npc dialogues`);
    for (const e of sceneErrors) console.log(`       ${e}`);
    for (const r of tight) console.log(`       tight: ${r.name} at ${r.at} is reachable from one side only`);
    // A dialogue whose first choices loop is closed by hand; that is only a note, page errors still fail.
    for (const u of unfinished) console.log(`       note: ${u}`);
  }
} catch (error) {
  failed = true;
  console.error(error);
} finally {
  await close();
}

if (errors.length) console.error(`\n${errors.length} error(s):\n${errors.join("\n")}`);
process.exit(failed ? 1 : 0);
