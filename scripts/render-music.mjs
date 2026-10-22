#!/usr/bin/env node
/**
 * Renders the synthesized score and sound effects offline to WAV files so
 * they can be listened to (and level-checked) outside the game.
 *
 *   npm run render:music                      # every mood, 40 s each -> out/music/
 *   npm run render:music -- --moods dusk,road --seconds 20
 *
 * Prints peak and RMS level per file; fails if anything clips or is silent.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { openGame, root } from './lib/gameBrowser.mjs';

const args = process.argv.slice(2);
const argValue = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const seconds = Number(argValue('--seconds') ?? 40);
const only = argValue('--moods')?.split(',').filter(Boolean);
const outDir = resolve(root, argValue('--out') ?? 'out/music');
mkdirSync(outDir, { recursive: true });

const { page, url, close } = await openGame();
let failed = false;
try {
  page.on('pageerror', (e) => console.error(`pageerror: ${e.message}`));
  await page.goto(`${url}scripts/render-music.html`);
  const results = await page.evaluate(async ({ seconds, only }) => {
    const engine = await import('/src/audio/engine.ts');
    const music = await import('/src/audio/music.ts');
    const scores = await import('/src/audio/scores.ts');
    const sfx = await import('/src/audio/sfx.ts');
    const rate = 44100;
    const encode = (buffer) => {
      const ch = [buffer.getChannelData(0), buffer.getChannelData(1)];
      const n = buffer.length;
      const view = new DataView(new ArrayBuffer(44 + n * 4));
      const str = (o, s) => [...s].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
      str(0, 'RIFF'); view.setUint32(4, 36 + n * 4, true); str(8, 'WAVE'); str(12, 'fmt ');
      view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 2, true);
      view.setUint32(24, rate, true); view.setUint32(28, rate * 4, true); view.setUint16(32, 4, true);
      view.setUint16(34, 16, true); str(36, 'data'); view.setUint32(40, n * 4, true);
      let peak = 0;
      let sum = 0;
      for (let i = 0; i < n; i++) {
        for (let c = 0; c < 2; c++) {
          const v = Math.max(-1, Math.min(1, ch[c][i]));
          peak = Math.max(peak, Math.abs(v));
          sum += v * v;
          view.setInt16(44 + i * 4 + c * 2, v * 0x7fff, true);
        }
      }
      const bytes = new Uint8Array(view.buffer);
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      return { data: btoa(bin), peak, rms: Math.sqrt(sum / (n * 2)) };
    };
    const out = [];
    const moods = only ?? Object.keys(scores.PIECES);
    for (const mood of moods) {
      const ctx = new OfflineAudioContext(2, rate * seconds, rate);
      const graph = engine.createAudioGraph(ctx);
      graph.music.gain.value = 0.9 * 0.7 ** 2;
      music.scheduleMood(graph, mood, seconds - 3);
      out.push({ name: `music-${mood}`, ...encode(await ctx.startRendering()) });
    }
    if (!only) {
      // Every effect in sequence, one second apart.
      const ids = ['uiClick', 'uiHover', 'dialogueOpen', 'dialogueAdvance', 'choice', 'objective', 'journal', 'exit', 'locked', 'chapterComplete'];
      const ctx = new OfflineAudioContext(2, rate * (ids.length + 2), rate);
      const graph = engine.createAudioGraph(ctx);
      graph.sfx.gain.value = 0.8 ** 2;
      ids.forEach((id, i) => sfx.renderSfx(graph, id, 0.2 + i));
      out.push({ name: 'sfx-all', ...encode(await ctx.startRendering()) });
    }
    return out;
  }, { seconds, only });
  for (const r of results) {
    const file = join(outDir, `${r.name}.wav`);
    writeFileSync(file, Buffer.from(r.data, 'base64'));
    const db = (v) => (20 * Math.log10(Math.max(v, 1e-9))).toFixed(1);
    const bad = r.peak >= 0.999 ? 'CLIPS' : r.rms < 0.003 ? 'TOO QUIET' : 'ok';
    if (bad !== 'ok') failed = true;
    console.log(`${bad.padEnd(9)} ${r.name.padEnd(22)} peak ${db(r.peak)} dBFS  rms ${db(r.rms)} dBFS  ${file}`);
  }
} finally {
  await close();
}
process.exit(failed ? 1 : 0);
