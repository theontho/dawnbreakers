import type { InstrumentId } from './instruments';

/**
 * The fallback score: one "piece" per mood, each a recipe for the
 * generative composer rather than a fixed tune. Modes approximate the
 * Persian dastgāhs in cents, including the koron (about a quarter-tone
 * flat) that gives Shūr and Segāh their colour; WebAudio can play those
 * intervals exactly, which General MIDI never could.
 */

export type MusicMood =
  | 'title' | 'dusk' | 'night' | 'road' | 'sea' | 'pilgrimage' | 'city' | 'court'
  | 'mountain' | 'garden' | 'forest' | 'siege' | 'sorrow' | 'prison' | 'hope';

/** Seven degrees in cents above the tonic. */
export const MODES = {
  mahur: [0, 200, 400, 500, 700, 900, 1100],
  shur: [0, 150, 300, 500, 700, 800, 1000],
  segah: [0, 150, 350, 500, 650, 850, 1000],
  chahargah: [0, 150, 400, 500, 700, 850, 1100],
  homayun: [0, 150, 400, 500, 700, 800, 1000],
  esfahan: [0, 200, 300, 500, 700, 850, 1100],
  dashti: [0, 150, 300, 500, 700, 800, 1000],
} as const;

export interface Piece {
  mode: readonly number[];
  /** Tonic frequency in Hz. */
  root: number;
  bpm: number;
  /** Eighth-note steps per bar; also the drum pattern length. */
  steps: number;
  lead: InstrumentId;
  /** Answers the lead on alternate phrases, an octave down. */
  answer?: InstrumentId;
  drone?: boolean;
  /** One character per step: D dum, t tak, r daf ring, . rest. */
  drums?: string;
  /** Chance of a note starting on any step. */
  density: number;
  /** Central degree (shāhed) the melody circles; phrases end on 0 or here. */
  shahed: number;
  /** Lead register offset in degrees (7 is an octave up). */
  register: number;
  /** Silent bars between phrases: breath and space. */
  rest: number;
}

const D3 = 146.83;
const E3 = 164.81;
const G3 = 196;
const A3 = 220;
const C3 = 130.81;

export const PIECES: Record<MusicMood, Piece> = {
  title: { mode: MODES.mahur, root: G3, bpm: 64, steps: 8, lead: 'santur', answer: 'ney', drone: true, density: 0.5, shahed: 4, register: 7, rest: 1 },
  dusk: { mode: MODES.shur, root: D3, bpm: 84, steps: 8, lead: 'santur', answer: 'tar', drone: true, drums: 'D..t..D.', density: 0.55, shahed: 3, register: 7, rest: 1 },
  night: { mode: MODES.esfahan, root: A3, bpm: 54, steps: 8, lead: 'ney', drone: true, density: 0.38, shahed: 2, register: 7, rest: 2 },
  road: { mode: MODES.chahargah, root: C3, bpm: 100, steps: 6, lead: 'tar', answer: 'santur', drums: 'D.tD.t', density: 0.6, shahed: 4, register: 7, rest: 1 },
  sea: { mode: MODES.shur, root: E3, bpm: 58, steps: 8, lead: 'santur', answer: 'ney', drone: true, density: 0.35, shahed: 4, register: 7, rest: 2 },
  pilgrimage: { mode: MODES.homayun, root: D3, bpm: 58, steps: 8, lead: 'ney', drone: true, drums: 'r.......', density: 0.4, shahed: 4, register: 7, rest: 1 },
  city: { mode: MODES.mahur, root: C3, bpm: 96, steps: 8, lead: 'santur', answer: 'tar', drums: 'D.t.D.tt', density: 0.6, shahed: 2, register: 8, rest: 1 },
  court: { mode: MODES.esfahan, root: G3, bpm: 70, steps: 8, lead: 'kamancheh', answer: 'santur', drone: true, density: 0.45, shahed: 2, register: 7, rest: 1 },
  mountain: { mode: MODES.segah, root: E3, bpm: 50, steps: 8, lead: 'ney', drone: true, density: 0.3, shahed: 2, register: 7, rest: 2 },
  garden: { mode: MODES.chahargah, root: D3, bpm: 88, steps: 8, lead: 'santur', answer: 'ney', drums: 'D.r.t.r.', density: 0.55, shahed: 4, register: 7, rest: 1 },
  forest: { mode: MODES.homayun, root: A3, bpm: 72, steps: 8, lead: 'tar', answer: 'ney', drums: 'D.....t.', density: 0.45, shahed: 3, register: 7, rest: 1 },
  siege: { mode: MODES.homayun, root: D3, bpm: 80, steps: 8, lead: 'kamancheh', drone: true, drums: 'D..D..t.', density: 0.42, shahed: 3, register: 7, rest: 1 },
  sorrow: { mode: MODES.dashti, root: A3, bpm: 50, steps: 8, lead: 'kamancheh', drone: true, density: 0.34, shahed: 4, register: 7, rest: 2 },
  prison: { mode: MODES.segah, root: D3, bpm: 44, steps: 8, lead: 'ney', drone: true, density: 0.24, shahed: 2, register: 7, rest: 3 },
  hope: { mode: MODES.mahur, root: D3, bpm: 76, steps: 8, lead: 'santur', answer: 'ney', drone: true, drums: 'r...r...', density: 0.5, shahed: 4, register: 7, rest: 1 },
};

/** Frequency of a scale degree (may be negative or beyond the octave). */
export function degreeFreq(piece: Piece, degree: number): number {
  const octave = Math.floor(degree / 7);
  const idx = ((degree % 7) + 7) % 7;
  return piece.root * 2 ** ((piece.mode[idx]! + 1200 * octave) / 1200);
}
