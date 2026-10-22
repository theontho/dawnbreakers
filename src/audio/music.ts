import { audioGraph, type AudioGraph } from './engine';
import { playDrum, playNote, type DrumStroke } from './instruments';
import { degreeFreq, PIECES, type MusicMood, type Piece } from './scores';

/**
 * The generative score player. Each mood's piece improvises phrases the
 * way a radīf performer might: circling the central note, stepping more
 * than leaping, decorating with grace notes and santur tremolo, and
 * resolving each phrase home. Phrases are seeded, so a mood always
 * begins the same way, then wanders.
 *
 * Scheduling uses a short look-ahead timer feeding exact WebAudio times.
 */

const LOOKAHEAD = 0.8;
const TICK_MS = 150;
const FADE = 2.2;

interface Voice {
  mood: MusicMood;
  piece: Piece;
  gain: GainNode;
  timer: number;
  /** Start time of the next phrase. */
  next: number;
  phrase: number;
  rand: () => number;
  last: PhraseNote[];
}

interface PhraseNote {
  step: number;
  len: number;
  degree: number;
}

let current: Voice | undefined;

/** Crossfade to `mood`; a no-op if it is already playing. */
export function playMusic(mood: MusicMood): void {
  if (current?.mood === mood) return;
  const graph = audioGraph();
  if (!graph) return;
  stopMusic();
  const gain = graph.ctx.createGain();
  const now = graph.ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(1, now + FADE);
  gain.connect(graph.music);
  const voice = newVoice(mood, gain, now + 0.3);
  voice.timer = window.setInterval(() => schedule(graph, voice), TICK_MS);
  schedule(graph, voice);
  current = voice;
}

/** Fade the current piece out. */
export function stopMusic(): void {
  const voice = current;
  if (!voice) return;
  current = undefined;
  window.clearInterval(voice.timer);
  const graph = audioGraph();
  if (!graph) return;
  const now = graph.ctx.currentTime;
  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setValueAtTime(Math.max(0.0001, voice.gain.gain.value), now);
  voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + FADE);
  window.setTimeout(() => voice.gain.disconnect(), (FADE + 4) * 1000);
}

/** Schedules `mood` on `graph` up to `seconds` in one go (offline rendering for review). */
export function scheduleMood(graph: AudioGraph, mood: MusicMood, seconds: number): void {
  const voice = newVoice(mood, graph.music, 0.1);
  while (voice.next < seconds) voice.next = playPhrase(graph, voice, voice.next);
}

export function currentMood(): MusicMood | undefined {
  return current?.mood;
}

function newVoice(mood: MusicMood, gain: GainNode, next: number): Voice {
  return { mood, piece: PIECES[mood], gain, timer: 0, next, phrase: 0, rand: seeded(mood.length * 7919 + mood.charCodeAt(0)), last: [] };
}

function schedule(graph: AudioGraph, voice: Voice): void {
  // While the context is suspended its clock stands still; stay one phrase ahead.
  while (voice.next < graph.ctx.currentTime + LOOKAHEAD) {
    voice.next = playPhrase(graph, voice, Math.max(voice.next, graph.ctx.currentTime + 0.05));
  }
}

/** Schedules one phrase starting at `start`; returns when the next should begin. */
function playPhrase(graph: AudioGraph, voice: Voice, start: number): number {
  const { piece, rand } = voice;
  const step = 60 / piece.bpm / 2;
  const bars = 2;
  const total = piece.steps * bars;
  const out = voice.gain;
  const send = graph.musicVerb;
  const answering = piece.answer !== undefined && voice.phrase % 2 === 1 && voice.last.length > 0;

  const notes = answering ? answerPhrase(voice.last, rand) : composePhrase(piece, total, rand);
  const instrument = answering ? piece.answer! : piece.lead;
  const shift = answering ? -7 : 0;
  for (const n of notes) {
    const time = start + n.step * step + humanize(rand);
    const dur = n.len * step;
    const freq = degreeFreq(piece, n.degree + piece.register + shift);
    const vel = 0.75 + rand() * 0.25;
    // Tahrīr-like grace note from the degree above.
    if (rand() < 0.18 && n.len >= 2) {
      playNote(instrument, { graph, out, send, time: time - 0.06, freq: degreeFreq(piece, n.degree + 1 + piece.register + shift), dur: 0.06, vel: vel * 0.6 });
    }
    if (instrument === 'santur' && n.len >= 3) {
      // Tremolo: the santur's way of sustaining a long note.
      for (let t = 0; t < dur - 0.05; t += step / 2) {
        playNote('santur', { graph, out, send, time: time + t, freq, dur: step, vel: vel * (1 - t / dur * 0.5) });
      }
    } else {
      playNote(instrument, { graph, out, send, time, freq, dur, vel });
    }
  }
  if (!answering) voice.last = notes;

  if (piece.drone && voice.phrase % 2 === 0) {
    const len = (total + piece.rest * piece.steps) * 2 * step;
    playNote('drone', { graph, out, send, time: start, freq: piece.root / 2, dur: len, vel: 1 });
  }
  if (piece.drums) {
    for (let bar = 0; bar < bars; bar++) {
      [...piece.drums].forEach((c, i) => {
        const stroke = DRUM[c];
        if (!stroke) return;
        // Leave out the odd stroke so the pattern breathes.
        if (rand() < 0.12 && i > 0) return;
        playDrum(stroke, graph, out, start + (bar * piece.steps + i) * step + humanize(rand) * 0.5, i === 0 ? 1 : 0.7);
      });
    }
  }
  voice.phrase++;
  const restBars = answering ? piece.rest : Math.max(0, piece.rest - 1);
  return start + (total + restBars * piece.steps) * step;
}

const DRUM: Record<string, DrumStroke | undefined> = { D: 'dum', t: 'tak', r: 'ring' };

function composePhrase(piece: Piece, total: number, rand: () => number): PhraseNote[] {
  const notes: PhraseNote[] = [];
  let degree = piece.shahed + (rand() < 0.5 ? 0 : rand() < 0.5 ? 1 : -1);
  let s = rand() < 0.5 ? 0 : 1;
  const end = total - 3;
  while (s < end) {
    if (rand() < piece.density || notes.length === 0) {
      const len = rand() < 0.55 ? 1 : rand() < 0.7 ? 2 : 3;
      notes.push({ step: s, len: Math.min(len, end - s), degree });
      s += len;
      // Mostly stepwise, occasionally a third, always pulled back toward the shāhed.
      const pull = Math.sign(piece.shahed - degree) * (Math.abs(piece.shahed - degree) > 2 ? 1 : 0);
      const leap = rand() < 0.2 ? 2 : 1;
      const dir = pull !== 0 && rand() < 0.6 ? pull : rand() < 0.5 ? 1 : -1;
      degree = Math.max(-2, Math.min(9, degree + dir * leap));
    } else {
      s += 1;
    }
  }
  // Cadence: approach from above or below, then land and hold.
  const home = rand() < 0.65 ? 0 : piece.shahed;
  notes.push({ step: end, len: 1, degree: home + (rand() < 0.5 ? 1 : -1) });
  notes.push({ step: end + 1, len: 2, degree: home });
  return notes;
}

/** The answer echoes the phrase's tail, sometimes a degree higher. */
function answerPhrase(last: PhraseNote[], rand: () => number): PhraseNote[] {
  const tail = last.slice(-Math.min(last.length, 4 + Math.floor(rand() * 3)));
  const offset = tail[0]!.step;
  const lift = rand() < 0.3 ? 1 : 0;
  return tail.map((n, i) => ({
    step: n.step - offset,
    len: i === tail.length - 1 ? n.len + 2 : n.len,
    degree: i === tail.length - 1 ? n.degree : n.degree + lift,
  }));
}

function humanize(rand: () => number): number {
  return (rand() - 0.5) * 0.018;
}

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
