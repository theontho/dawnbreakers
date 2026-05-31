import { dateFromDecimalYear, decimalYear } from './math';

export interface TimeState {
  currentYear: number;
  targetYear: number;
  speed: number;
}

export class TimeController {
  readonly state: TimeState;
  private startYear = 0;
  private startedAtMs = 0;
  private durationMs = 1;
  private completion?: () => void;

  constructor(date: Date) {
    const year = decimalYear(date);
    this.state = {
      currentYear: year,
      targetYear: year,
      speed: 0,
    };
  }

  get currentDate(): Date {
    return dateFromDecimalYear(this.state.currentYear);
  }

  animateTo(targetYear: number, durationMs: number, onComplete?: () => void): void {
    this.startYear = this.state.currentYear;
    this.state.targetYear = targetYear;
    this.state.speed = (targetYear - this.startYear) / Math.max(0.001, durationMs / 1000);
    this.startedAtMs = performance.now();
    this.durationMs = Math.max(1, durationMs);
    this.completion = onComplete;
  }

  setDate(date: Date): void {
    const year = decimalYear(date);
    this.state.currentYear = year;
    this.state.targetYear = year;
    this.state.speed = 0;
    this.completion = undefined;
  }

  update(nowMs = performance.now()): boolean {
    if (this.completion === undefined && this.state.currentYear === this.state.targetYear) return false;

    const raw = Math.min(1, Math.max(0, (nowMs - this.startedAtMs) / this.durationMs));
    const eased = easeInOutCubic(raw);
    this.state.currentYear = this.startYear + (this.state.targetYear - this.startYear) * eased;

    if (raw >= 1) {
      this.state.currentYear = this.state.targetYear;
      this.state.speed = 0;
      const complete = this.completion;
      this.completion = undefined;
      complete?.();
    }

    return true;
  }
}

function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}
