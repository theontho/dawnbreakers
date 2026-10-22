/**
 * The WebAudio graph shared by the synthesized score, sound effects and
 * ambient beds: three buses into a gentle compressor, plus a small
 * generated reverb that gives the plucked instruments a room to ring in.
 *
 * Nothing here needs an audio file. Browsers keep an AudioContext
 * suspended until a user gesture, so `installAudioUnlock` resumes it on the
 * first key or pointer press.
 */

export interface AudioSettings {
  music: number;
  sfx: number;
  muted: boolean;
}

const SETTINGS_KEY = 'dawnbreakers.audio';
const DEFAULTS: AudioSettings = { music: 0.7, sfx: 0.8, muted: false };

export interface AudioGraph {
  ctx: BaseAudioContext;
  music: GainNode;
  sfx: GainNode;
  ambience: GainNode;
  /** Reverb sends that return into the music and sfx buses, so volume applies to the tail too. */
  musicVerb: GainNode;
  sfxVerb: GainNode;
  noise: AudioBuffer;
}

let graph: AudioGraph | undefined;
let settings: AudioSettings = loadSettings();
const listeners = new Set<(s: AudioSettings) => void>();

/** The live graph, created lazily; undefined where WebAudio is unavailable. */
export function audioGraph(): AudioGraph | undefined {
  if (graph) return graph;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return undefined;
  graph = createAudioGraph(new Ctor({ latencyHint: 'interactive' }));
  applySettings();
  return graph;
}

/** Builds the bus graph on any context; offline contexts are used to render the score for review. */
export function createAudioGraph(ctx: BaseAudioContext): AudioGraph {
  const master = ctx.createDynamicsCompressor();
  master.threshold.value = -14;
  master.ratio.value = 3;
  master.connect(ctx.destination);
  const bus = () => {
    const g = ctx.createGain();
    g.connect(master);
    return g;
  };
  const hall = impulse(ctx, 2.4);
  const verb = (into: AudioNode, level: number) => {
    const send = ctx.createGain();
    send.gain.value = level;
    const convolver = ctx.createConvolver();
    convolver.buffer = hall;
    send.connect(convolver).connect(into);
    return send;
  };
  const music = bus();
  const sfx = bus();
  return { ctx, music, sfx, ambience: bus(), musicVerb: verb(music, 0.3), sfxVerb: verb(sfx, 0.18), noise: noiseBuffer(ctx) };
}

/** Resume audio on the first gesture, and pause it while the tab is hidden. */
export function installAudioUnlock(): void {
  const resume = () => {
    const g = audioGraph();
    if (g && g.ctx.state === 'suspended' && !document.hidden) void (g.ctx as AudioContext).resume();
  };
  for (const type of ['pointerdown', 'keydown', 'touchend'] as const) {
    window.addEventListener(type, resume, { capture: true, passive: true });
  }
  document.addEventListener('visibilitychange', () => {
    if (!graph) return;
    const ctx = graph.ctx as AudioContext;
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  });
}

/** True once the context is running, i.e. sound will actually be heard. */
export function audioRunning(): boolean {
  return graph?.ctx.state === 'running';
}

export function getAudioSettings(): AudioSettings {
  return { ...settings };
}

export function setAudioSettings(patch: Partial<AudioSettings>): void {
  settings = { ...settings, ...patch };
  settings.music = clamp01(settings.music);
  settings.sfx = clamp01(settings.sfx);
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Private mode: settings simply do not persist.
  }
  applySettings();
  listeners.forEach(fn => fn(getAudioSettings()));
}

export function onAudioSettingsChange(fn: (s: AudioSettings) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function applySettings(): void {
  if (!graph) return;
  const now = graph.ctx.currentTime;
  const on = settings.muted ? 0 : 1;
  // Perceived loudness is roughly logarithmic; square the slider value.
  graph.music.gain.setTargetAtTime(on * settings.music ** 2 * 0.9, now, 0.05);
  graph.sfx.gain.setTargetAtTime(on * settings.sfx ** 2, now, 0.05);
  graph.ambience.gain.setTargetAtTime(on * settings.sfx ** 2 * 0.8, now, 0.05);
}

function loadSettings(): AudioSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AudioSettings>) };
  } catch {
    // Fall through to defaults.
  }
  return { ...DEFAULTS };
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
}

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

/** Exponentially decaying stereo noise: a cheap, warm hall. */
function impulse(ctx: BaseAudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3.2;
  }
  return buffer;
}
