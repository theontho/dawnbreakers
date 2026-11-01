import { clamp } from '../sky/math';
import type { PassageCurve } from './roadCurve';

/** How fast the sky's time runs against the player's, as in the native Sky Rewind's time player. */
export interface TimeRate {
  /** Sky seconds per real second. */
  seconds: number;
  label: string;
}

export const TIME_RATES: readonly TimeRate[] = [
  { seconds: 1, label: 'Real time' },
  { seconds: 60, label: 'A minute a second' },
  { seconds: 600, label: 'Ten minutes a second' },
  { seconds: 3600, label: 'An hour a second' },
  { seconds: 10800, label: 'Three hours a second' },
];

export const DEFAULT_RATE_INDEX = 2;

/** How much real time the comet tails of moving stars cover. */
const TAIL_WINDOW_MS = 700;
const HISTORY_MS = 1500;
const MAX_EXPOSURE_MS = 14 * 3600000;

interface Passage {
  fromMs: number;
  curve: PassageCurve;
  startedAt: number;
  onDone?: () => void;
}

/**
 * The sky's clock for a journey. It runs at one of the fixed rates, forward
 * or back, or plays a passage along a whole road. It keeps a
 * short history of sky time so trails can be drawn back over the last
 * moment of motion, and an open shutter for long exposures.
 */
export class JourneyClock {
  rateIndex = DEFAULT_RATE_INDEX;
  direction: 1 | -1 = 1;
  playing = true;
  private skyMs: number;
  private shutterMs: number;
  private lastRealMs: number | undefined;
  private passage: Passage | undefined;
  private readonly history: { real: number; sky: number }[] = [];

  constructor(start: Date) {
    this.skyMs = start.getTime();
    this.shutterMs = this.skyMs;
  }

  get date(): Date {
    return new Date(this.skyMs);
  }

  get rate(): TimeRate {
    return TIME_RATES[this.rateIndex] ?? TIME_RATES[DEFAULT_RATE_INDEX]!;
  }

  /** Sky seconds per real second over the last frames, signed. */
  get speed(): number {
    const first = this.history[0];
    const last = this.history[this.history.length - 1];
    if (!first || !last || last.real - first.real < 1) return 0;
    const recent = this.history.find(sample => sample.real >= last.real - 250) ?? first;
    return (last.sky - recent.sky) / Math.max(1, last.real - recent.real);
  }

  /**
   * 0 when the sky is still or at real time, 1 when it whirls: drives
   * the comet tails.
   */
  get motion(): number {
    const speed = Math.abs(this.speed);
    return clamp((Math.log10(Math.max(1, speed)) - 1.4) / 2.3, 0, 1);
  }

  setRate(index: number): void {
    this.passage = undefined;
    this.rateIndex = clamp(Math.round(index), 0, TIME_RATES.length - 1);
  }

  togglePlaying(): void {
    this.passage = undefined;
    this.playing = !this.playing;
  }

  reverse(): void {
    this.passage = undefined;
    this.direction = this.direction === 1 ? -1 : 1;
  }

  /** Cuts to another moment, as between the nights of a long road, leaving no trail across the gap. */
  jumpTo(date: Date): void {
    this.passage = undefined;
    this.skyMs = date.getTime();
    this.history.length = 0;
    this.openShutter();
  }

  /** Opens the long-exposure shutter at the present moment. */
  openShutter(): void {
    this.shutterMs = this.skyMs;
  }

  /** Runs the sky along a passage's curve from the present moment, then holds at the end and calls `onDone`. */
  startPassage(curve: PassageCurve, onDone?: () => void): void {
    this.passage = {
      fromMs: this.skyMs,
      curve,
      startedAt: this.lastRealMs ?? performance.now(),
      onDone,
    };
    this.playing = true;
    this.openShutter();
  }

  update(realMs: number): void {
    const previous = this.lastRealMs ?? realMs;
    this.lastRealMs = realMs;
    const deltaMs = clamp(realMs - previous, 0, 100);

    if (this.passage) {
      const passage = this.passage;
      const elapsed = realMs - passage.startedAt;
      this.skyMs = passage.fromMs + passage.curve.offsetAt(elapsed);
      if (elapsed >= passage.curve.durationMs) {
        this.passage = undefined;
        this.playing = false;
        passage.onDone?.();
      }
    } else if (this.playing) {
      this.skyMs += deltaMs * this.rate.seconds * this.direction;
    }

    this.history.push({ real: realMs, sky: this.skyMs });
    while (this.history.length > 2 && this.history[0]!.real < realMs - HISTORY_MS) this.history.shift();
  }

  /** The sky time at which a comet tail drawn now should begin. */
  tailStart(): number {
    const last = this.history[this.history.length - 1];
    if (!last) return this.skyMs;
    const sample = this.history.find(s => s.real >= last.real - TAIL_WINDOW_MS) ?? last;
    return sample.sky;
  }

  /** The sky time the long-exposure shutter opened, held to a night's span. */
  exposureStart(): number {
    const span = clamp(this.skyMs - this.shutterMs, -MAX_EXPOSURE_MS, MAX_EXPOSURE_MS);
    return this.skyMs - span;
  }
}
