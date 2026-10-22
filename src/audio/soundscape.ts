import { audioGraph, audioRunning, type AudioGraph } from './engine';
import { noiseBurst } from './instruments';

/**
 * Ambient beds under the score: wind, rain, surf, a fire's crackle,
 * crickets, birdsong. Continuous layers are looped filtered noise with a
 * slow swell; event layers (chirps, crackles) are scheduled at random.
 * Changing the soundscape crossfades every layer.
 */

export type SoundLayer = 'wind' | 'breeze' | 'rain' | 'sea' | 'river' | 'fire' | 'crickets' | 'birds';

interface ActiveLayer {
  id: SoundLayer;
  gain: GainNode;
  stop: () => void;
}

const FADE = 1.8;
let active: ActiveLayer[] = [];

export function setSoundscape(layers: readonly SoundLayer[]): void {
  const graph = audioGraph();
  if (!graph) return;
  const wanted = new Set(layers);
  for (const layer of active) {
    if (!wanted.has(layer.id)) fadeOut(graph, layer);
  }
  active = active.filter(l => wanted.has(l.id));
  for (const id of wanted) {
    if (active.some(l => l.id === id)) continue;
    active.push(startLayer(graph, id));
  }
}

function startLayer(graph: AudioGraph, id: SoundLayer): ActiveLayer {
  const { ctx } = graph;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + FADE);
  gain.connect(graph.ambience);
  const stop = LAYERS[id](graph, gain);
  return { id, gain, stop };
}

function fadeOut(graph: AudioGraph, layer: ActiveLayer): void {
  const now = graph.ctx.currentTime;
  layer.gain.gain.cancelScheduledValues(now);
  layer.gain.gain.setValueAtTime(Math.max(0.0001, layer.gain.gain.value), now);
  layer.gain.gain.exponentialRampToValueAtTime(0.0001, now + FADE);
  window.setTimeout(() => {
    layer.stop();
    layer.gain.disconnect();
  }, (FADE + 0.2) * 1000);
}

/** Looping filtered noise whose level swells with a slow LFO. */
function bed(graph: AudioGraph, out: AudioNode, type: BiquadFilterType, freq: number, q: number, level: number, swellHz: number, swellDepth: number): () => void {
  const { ctx } = graph;
  const src = ctx.createBufferSource();
  src.buffer = graph.noise;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.value = level;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = swellHz;
  const depth = ctx.createGain();
  depth.gain.value = level * swellDepth;
  lfo.connect(depth).connect(gain.gain);
  const sweep = ctx.createGain();
  sweep.gain.value = freq * 0.25 * swellDepth;
  lfo.connect(sweep).connect(filter.frequency);
  src.connect(filter).connect(gain).connect(out);
  src.start();
  lfo.start();
  return () => {
    src.stop();
    lfo.stop();
  };
}

/** Calls `fire` at random intervals until stopped. */
function events(minMs: number, maxMs: number, fire: () => void): () => void {
  let timer = 0;
  const loop = () => {
    timer = window.setTimeout(() => {
      // A suspended context's clock is frozen; skip rather than pile events up.
      if (audioRunning()) fire();
      loop();
    }, minMs + Math.random() * (maxMs - minMs));
  };
  loop();
  return () => window.clearTimeout(timer);
}

function chirp(graph: AudioGraph, out: AudioNode, time: number, from: number, to: number, dur: number, level: number): void {
  const { ctx } = graph;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(from, time);
  osc.frequency.exponentialRampToValueAtTime(to, time + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(level, time + dur * 0.2);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  osc.connect(g).connect(out);
  osc.start(time);
  osc.stop(time + dur + 0.02);
}

const LAYERS: Record<SoundLayer, (graph: AudioGraph, out: GainNode) => () => void> = {
  wind: (g, out) => bed(g, out, 'bandpass', 500, 0.7, 0.16, 0.09, 0.6),
  breeze: (g, out) => bed(g, out, 'bandpass', 900, 0.5, 0.05, 0.07, 0.5),
  rain: (g, out) => {
    const hiss = bed(g, out, 'highpass', 3500, 0.4, 0.09, 0.05, 0.15);
    const drops = events(30, 120, () => noiseBurst(g, out, g.ctx.currentTime, 0.02, 5000 + Math.random() * 3000, 'bandpass', 0.03));
    return () => {
      hiss();
      drops();
    };
  },
  sea: (g, out) => bed(g, out, 'lowpass', 700, 0.5, 0.2, 0.11, 0.85),
  river: (g, out) => bed(g, out, 'bandpass', 1400, 0.4, 0.06, 0.3, 0.25),
  fire: (g, out) => {
    const roar = bed(g, out, 'lowpass', 260, 0.6, 0.07, 0.4, 0.3);
    const crackle = events(60, 420, () => noiseBurst(g, out, g.ctx.currentTime, 0.015 + Math.random() * 0.03, 1800 + Math.random() * 2500, 'bandpass', 0.05 + Math.random() * 0.08));
    return () => {
      roar();
      crackle();
    };
  },
  crickets: (g, out) => events(500, 1600, () => {
    const t = g.ctx.currentTime;
    const f = 4200 + Math.random() * 600;
    for (let i = 0; i < 3 + Math.floor(Math.random() * 3); i++) chirp(g, out, t + i * 0.07, f, f * 0.98, 0.04, 0.025);
  }),
  birds: (g, out) => events(1800, 6000, () => {
    const t = g.ctx.currentTime;
    const base = 2200 + Math.random() * 1600;
    const count = 1 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) chirp(g, out, t + i * 0.13, base * (1 + Math.random() * 0.3), base * (0.8 + Math.random() * 0.5), 0.08 + Math.random() * 0.06, 0.03);
  }),
};
