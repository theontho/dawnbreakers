import { audioGraph, audioRunning, type AudioGraph } from './engine';
import { noiseBurst, playNote } from './instruments';
import type { TileKind } from '../scenes/baseMapTypes';

/**
 * Synthesized sound effects. Each is a few milliseconds of oscillator and
 * filtered noise, so they cost nothing to load and always match the score's
 * tuning (UI chimes are pitched in the Māhur mode on D).
 */

export type SfxId =
  | 'uiClick' | 'uiHover' | 'dialogueOpen' | 'dialogueAdvance' | 'choice'
  | 'objective' | 'journal' | 'exit' | 'locked' | 'chapterComplete'
  // The chapters' mini-games.
  | 'gust' | 'clink' | 'scratch' | 'warm' | 'murmur' | 'call';

const D4 = 293.66;
const MAHUR = [0, 200, 400, 500, 700, 900, 1100];
const pitch = (degree: number) => D4 * 2 ** ((MAHUR[((degree % 7) + 7) % 7]! + 1200 * Math.floor(degree / 7)) / 1200);

/** Minimum gap between repeats of the same effect, so held keys do not machine-gun. */
const MIN_GAP: Partial<Record<SfxId, number>> = { uiHover: 0.06, dialogueAdvance: 0.05, scratch: 0.07, murmur: 0.5 };
const lastPlayed = new Map<SfxId, number>();

export function playSfx(id: SfxId): void {
  const graph = audioGraph();
  if (!graph || !audioRunning()) return;
  const now = graph.ctx.currentTime;
  const gap = MIN_GAP[id] ?? 0.02;
  if (now - (lastPlayed.get(id) ?? -1) < gap) return;
  lastPlayed.set(id, now);
  EFFECTS[id](graph, now);
}

const note = (g: AudioGraph, instrument: Parameters<typeof playNote>[0], time: number, degree: number, dur: number, vel: number) =>
  playNote(instrument, { graph: g, out: g.sfx, send: g.sfxVerb, time, freq: pitch(degree), dur, vel });

const EFFECTS: Record<SfxId, (g: AudioGraph, t: number) => void> = {
  uiClick: (g, t) => {
    noiseBurst(g, g.sfx, t, 0.03, 2400, 'bandpass', 0.18);
    note(g, 'santur', t, 4, 0.1, 0.35);
  },
  uiHover: (g, t) => noiseBurst(g, g.sfx, t, 0.02, 4200, 'bandpass', 0.05),
  dialogueOpen: (g, t) => {
    // A breath of paper and a soft low note.
    pageRustle(g, t, 0.28, 0.12);
    note(g, 'santur', t + 0.02, -3, 0.4, 0.35);
  },
  dialogueAdvance: (g, t) => pageRustle(g, t, 0.09, 0.07),
  choice: (g, t) => {
    note(g, 'santur', t, 2, 0.2, 0.45);
    note(g, 'santur', t + 0.07, 4, 0.3, 0.4);
  },
  objective: (g, t) => {
    note(g, 'bell', t, 4, 0.6, 0.5);
    note(g, 'bell', t + 0.16, 7, 0.9, 0.45);
  },
  journal: (g, t) => {
    pageRustle(g, t, 0.35, 0.14);
    pageRustle(g, t + 0.18, 0.25, 0.08);
  },
  exit: (g, t) => {
    // Wind of passing through a gate.
    const src = g.ctx.createBufferSource();
    src.buffer = g.noise;
    const filter = g.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.7);
    const gain = g.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.22, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    src.connect(filter).connect(gain).connect(g.sfx);
    src.start(t, Math.random());
    src.stop(t + 0.8);
  },
  locked: (g, t) => {
    noiseBurst(g, g.sfx, t, 0.12, 260, 'lowpass', 0.4);
    note(g, 'tar', t, -7, 0.15, 0.5);
  },
  gust: (g, t) => {
    // Wind across the deck: a long swell of low noise.
    noiseBurst(g, g.sfx, t, 1.1, 520, 'bandpass', 0.2);
    noiseBurst(g, g.sfx, t + 0.25, 0.8, 1300, 'bandpass', 0.08);
  },
  clink: (g, t) => {
    // A glass coffee cup set on a brass tray.
    note(g, 'bell', t, 11, 0.18, 0.28);
    noiseBurst(g, g.sfx, t, 0.03, 5200, 'highpass', 0.08);
  },
  scratch: (g, t) => noiseBurst(g, g.sfx, t, 0.06, 3200 + Math.random() * 1600, 'bandpass', 0.05),
  warm: (g, t) => {
    // Coals stirred: a soft crackle.
    for (let i = 0; i < 5; i++) noiseBurst(g, g.sfx, t + i * 0.07 + Math.random() * 0.04, 0.03, 2200, 'bandpass', 0.07);
  },
  murmur: (g, t) => {
    // Voices in a room: a low, shapeless swell.
    noiseBurst(g, g.sfx, t, 0.6, 380, 'lowpass', 0.07);
    noiseBurst(g, g.sfx, t + 0.15, 0.45, 650, 'bandpass', 0.04);
  },
  call: (g, t) => {
    // The night watch's call, far off.
    note(g, 'ney', t, -2, 0.5, 0.32);
    note(g, 'ney', t + 0.45, -4, 0.8, 0.28);
  },
  chapterComplete: (g, t) => {
    [0, 2, 4, 7, 9, 11, 14].forEach((d, i) => note(g, 'santur', t + i * 0.11, d, 0.5, 0.5 - i * 0.03));
    note(g, 'bell', t + 0.85, 14, 1.8, 0.4);
  },
};

function pageRustle(g: AudioGraph, t: number, dur: number, level: number): void {
  noiseBurst(g, g.sfx, t, dur, 3800, 'bandpass', level);
  noiseBurst(g, g.sfx, t + dur * 0.3, dur * 0.6, 1900, 'bandpass', level * 0.6);
}

/** Schedules an effect on any graph at `time` (offline rendering for review). */
export function renderSfx(graph: AudioGraph, id: SfxId, time: number): void {
  EFFECTS[id](graph, time);
}

/** A footstep whose timbre follows the ground underfoot. */
export function playFootstep(tile: TileKind): void {
  const graph = audioGraph();
  if (!graph || !audioRunning()) return;
  const t = graph.ctx.currentTime;
  const v = 0.75 + Math.random() * 0.25;
  switch (tile) {
    case 'grass':
      noiseBurst(graph, graph.sfx, t, 0.09, 900 + Math.random() * 300, 'lowpass', 0.09 * v);
      break;
    case 'sand':
      noiseBurst(graph, graph.sfx, t, 0.12, 2200, 'bandpass', 0.06 * v);
      break;
    case 'water':
      noiseBurst(graph, graph.sfx, t, 0.18, 1200, 'bandpass', 0.12 * v);
      noiseBurst(graph, graph.sfx, t + 0.05, 0.12, 3000, 'bandpass', 0.05 * v);
      break;
    case 'stone':
      noiseBurst(graph, graph.sfx, t, 0.04, 2600, 'bandpass', 0.11 * v);
      noiseBurst(graph, graph.sfx, t, 0.07, 500, 'lowpass', 0.1 * v);
      break;
    case 'path':
      noiseBurst(graph, graph.sfx, t, 0.07, 1500, 'bandpass', 0.08 * v);
      noiseBurst(graph, graph.sfx, t, 0.06, 420, 'lowpass', 0.09 * v);
      break;
  }
}
