import type { AudioGraph } from './engine';

/**
 * General-MIDI-style voices for the Persian ensemble, built from oscillators,
 * filters and envelopes: hammered santur, plucked tār, breathy ney, bowed
 * kamāncheh, a tanbūr drone, and the daf and tombak for rhythm. Each call
 * schedules one note and cleans up after itself.
 */

export type InstrumentId = 'santur' | 'tar' | 'ney' | 'kamancheh' | 'drone' | 'bell';
export type DrumStroke = 'dum' | 'tak' | 'ring';

export interface Note {
  graph: AudioGraph;
  out: AudioNode;
  /** Reverb send for this note's bus. */
  send: AudioNode;
  time: number;
  freq: number;
  dur: number;
  vel: number;
}

export function playNote(id: InstrumentId, n: Note): void {
  VOICES[id](n);
}

const VOICES: Record<InstrumentId, (n: Note) => void> = {
  santur: n => {
    // Paired strings, slightly detuned, struck by light hammers.
    for (const cents of [-4, 4]) {
      pluck(n, 'triangle', cents, 1.6, 0.32, 5200);
    }
    click(n, 0.06, 3200);
  },
  tar: n => {
    pluck(n, 'sawtooth', 0, 0.9, 0.22, 2600);
    pluck(n, 'square', 1200, 0.4, 0.05, 1800);
    click(n, 0.05, 1800);
  },
  ney: n => sustained(n, 'sine', { attack: 0.14, release: 0.25, cutoff: 2400, vibrato: 0.006, breath: 0.12, level: 0.3 }),
  kamancheh: n => sustained(n, 'sawtooth', { attack: 0.18, release: 0.3, cutoff: 1500, vibrato: 0.009, breath: 0.03, level: 0.24 }),
  drone: n => {
    for (const [ratio, level] of [[1, 0.08], [1.5, 0.05], [2, 0.035]] as const) {
      sustained({ ...n, freq: n.freq * ratio }, 'sawtooth', { attack: 1.4, release: 1.6, cutoff: 520, vibrato: 0, breath: 0, level });
    }
  },
  bell: n => {
    for (const [ratio, level, decay] of [[1, 0.22, 2.2], [2.76, 0.08, 1.1], [5.4, 0.04, 0.5]] as const) {
      const osc = n.graph.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = n.freq * ratio;
      envelope(n, osc, 0.004, decay, level);
    }
  },
};

/** Percussion: the deep centre stroke, the bright rim, and the daf's jingles. */
export function playDrum(stroke: DrumStroke, graph: AudioGraph, out: AudioNode, time: number, vel: number): void {
  const { ctx } = graph;
  if (stroke === 'dum') {
    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(52, time + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(0.55 * vel, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.42);
    osc.connect(g).connect(out);
    osc.start(time);
    osc.stop(time + 0.45);
    noiseBurst(graph, out, time, 0.05, 700, 'lowpass', 0.25 * vel);
  } else if (stroke === 'tak') {
    noiseBurst(graph, out, time, 0.06, 2600, 'bandpass', 0.35 * vel);
    const osc = ctx.createOscillator();
    osc.frequency.value = 410;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18 * vel, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
    osc.connect(g).connect(out);
    osc.start(time);
    osc.stop(time + 0.08);
  } else {
    noiseBurst(graph, out, time, 0.22, 7200, 'highpass', 0.12 * vel);
  }
}

export function noiseBurst(
  graph: AudioGraph,
  out: AudioNode,
  time: number,
  dur: number,
  freq: number,
  type: BiquadFilterType,
  level: number,
): void {
  const { ctx } = graph;
  const src = ctx.createBufferSource();
  src.buffer = graph.noise;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  filter.Q.value = type === 'bandpass' ? 1.4 : 0.7;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, level), time + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  src.connect(filter).connect(g).connect(out);
  src.start(time, Math.random() * 1.5);
  src.stop(time + dur + 0.02);
}

function pluck(n: Note, type: OscillatorType, cents: number, decay: number, level: number, bright: number): void {
  const { ctx } = n.graph;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = n.freq;
  osc.detune.value = cents;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(bright, n.time);
  filter.frequency.exponentialRampToValueAtTime(Math.max(300, n.freq * 1.5), n.time + decay * 0.6);
  osc.connect(filter);
  envelope(n, filter, 0.003, Math.min(decay, n.dur + decay * 0.5), level, osc);
}

interface SustainOptions {
  attack: number;
  release: number;
  cutoff: number;
  vibrato: number;
  breath: number;
  level: number;
}

function sustained(n: Note, type: OscillatorType, o: SustainOptions): void {
  const { ctx } = n.graph;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = n.freq;
  if (o.vibrato > 0) {
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 5.2;
    const depth = ctx.createGain();
    depth.gain.setValueAtTime(0, n.time);
    depth.gain.linearRampToValueAtTime(n.freq * o.vibrato, n.time + Math.min(0.5, n.dur * 0.6));
    lfo.connect(depth).connect(osc.frequency);
    lfo.start(n.time);
    lfo.stop(n.time + n.dur + o.release + 0.05);
  }
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = o.cutoff;
  osc.connect(filter);
  const g = ctx.createGain();
  const peak = o.level * n.vel;
  g.gain.setValueAtTime(0.0001, n.time);
  g.gain.linearRampToValueAtTime(peak, n.time + o.attack);
  g.gain.setValueAtTime(peak * 0.85, n.time + Math.max(o.attack, n.dur));
  g.gain.exponentialRampToValueAtTime(0.0001, n.time + n.dur + o.release);
  filter.connect(g);
  route(n, g);
  osc.start(n.time);
  osc.stop(n.time + n.dur + o.release + 0.05);
  if (o.breath > 0) noiseBurst(n.graph, n.out, n.time, Math.min(0.3, n.dur), n.freq * 2, 'bandpass', o.breath * n.vel);
}

function envelope(n: Note, source: AudioNode, attack: number, decay: number, level: number, osc?: OscillatorNode): void {
  const g = n.graph.ctx.createGain();
  g.gain.setValueAtTime(0.0001, n.time);
  g.gain.exponentialRampToValueAtTime(level * n.vel, n.time + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, n.time + attack + decay);
  source.connect(g);
  route(n, g);
  const node = osc ?? (source as OscillatorNode);
  node.start(n.time);
  node.stop(n.time + attack + decay + 0.05);
}

function click(n: Note, level: number, freq: number): void {
  noiseBurst(n.graph, n.out, n.time, 0.025, freq, 'bandpass', level * n.vel);
}

function route(n: Note, node: AudioNode): void {
  node.connect(n.out);
  node.connect(n.send);
}
