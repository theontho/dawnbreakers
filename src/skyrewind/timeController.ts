import { clamp, dateFromDecimalYear, decimalYear } from './math';

export interface TimeState {
  currentYear: number;
  targetYear: number;
  speed: number;
  motionStrength: number;
}

export interface TimeCurveSettings {
  inertiaPortion: number;
  driftProgress: number;
  power: number;
}

export class TimeController {
  readonly state: TimeState;
  private curve: TimeCurveSettings = {
    inertiaPortion: 0.32,
    driftProgress: 0.000004,
    power: 3,
  };
  private startYear = 0;
  private startedAtMs = 0;
  private lastUpdateMs = 0;
  private pausedDurationMs = 0;
  private durationMs = 1;
  private active = false;
  private pausedAtMs: number | undefined;
  private completion?: () => void;

  constructor(date: Date) {
    const year = decimalYear(date);
    this.state = {
      currentYear: year,
      targetYear: year,
      speed: 0,
      motionStrength: 0,
    };
  }

  get currentDate(): Date {
    return dateFromDecimalYear(this.state.currentYear);
  }

  get isActive(): boolean {
    return this.active;
  }

  get isPaused(): boolean {
    return this.active && this.pausedAtMs !== undefined;
  }

  get curveSettings(): TimeCurveSettings {
    return { ...this.curve };
  }

  setCurve(settings: TimeCurveSettings): void {
    this.curve = normalizeCurveSettings(settings);
  }

  animateTo(targetYear: number, durationMs: number, onComplete?: () => void, nowMs = performance.now()): void {
    this.startYear = this.state.currentYear;
    this.state.targetYear = targetYear;
    this.state.speed = (targetYear - this.startYear) / Math.max(0.001, durationMs / 1000);
    this.state.motionStrength = 0;
    this.startedAtMs = nowMs;
    this.lastUpdateMs = this.startedAtMs;
    this.pausedDurationMs = 0;
    this.durationMs = Math.max(1, durationMs);
    this.pausedAtMs = undefined;
    this.active = true;
    this.completion = onComplete;
  }

  pause(nowMs = performance.now()): void {
    if (!this.active || this.pausedAtMs !== undefined) return;

    this.update(nowMs);
    if (!this.active) return;

    this.pausedAtMs = nowMs;
    this.state.speed = 0;
    this.state.motionStrength = 0;
  }

  resume(nowMs = performance.now()): void {
    if (!this.active || this.pausedAtMs === undefined) return;

    this.pausedDurationMs += nowMs - this.pausedAtMs;
    this.lastUpdateMs = nowMs;
    this.pausedAtMs = undefined;
  }

  setDate(date: Date): void {
    const year = decimalYear(date);
    this.state.currentYear = year;
    this.state.targetYear = year;
    this.state.speed = 0;
    this.state.motionStrength = 0;
    this.active = false;
    this.pausedAtMs = undefined;
    this.pausedDurationMs = 0;
    this.completion = undefined;
  }

  update(nowMs = performance.now()): boolean {
    if (!this.active) return false;
    if (this.pausedAtMs !== undefined) return true;

    const raw = Math.min(1, Math.max(0, (nowMs - this.startedAtMs - this.pausedDurationMs) / this.durationMs));
    const eased = cinematicInertiaEase(raw, this.curve);
    const previousYear = this.state.currentYear;
    this.state.currentYear = this.startYear + (this.state.targetYear - this.startYear) * eased;
    const deltaSeconds = Math.max(0.001, (nowMs - this.lastUpdateMs) / 1000);
    this.state.speed = (this.state.currentYear - previousYear) / deltaSeconds;
    this.state.motionStrength = normalizedMotionStrength(this.state.speed, this.startYear, this.state.targetYear, this.durationMs);
    this.lastUpdateMs = nowMs;

    if (raw >= 1) {
      this.state.currentYear = this.state.targetYear;
      this.state.speed = 0;
      this.state.motionStrength = 0;
      this.active = false;
      const complete = this.completion;
      this.completion = undefined;
      complete?.();
    }

    return true;
  }
}

function normalizeCurveSettings(settings: TimeCurveSettings): TimeCurveSettings {
  return {
    inertiaPortion: clamp(settings.inertiaPortion, 0, 0.8),
    driftProgress: clamp(settings.driftProgress, 0, 0.2),
    power: clamp(settings.power, 1, 8),
  };
}

function cinematicInertiaEase(value: number, curve: TimeCurveSettings): number {
  const t = clamp(value, 0, 1);
  const inertiaPortion = clamp(curve.inertiaPortion, 0, 0.8);
  const driftProgress = clamp(curve.driftProgress, 0, 0.2);
  const power = clamp(curve.power, 1, 8);
  if (inertiaPortion <= 0) {
    return easeInOutPower(t, power);
  }

  const transitionWidth = clamp(0.18 + inertiaPortion * 0.18, 0.12, 0.28);
  const transitionStart = clamp(inertiaPortion - transitionWidth * 0.58, 0, 0.92);
  const transitionEnd = clamp(inertiaPortion + transitionWidth * 0.42, transitionStart + 0.001, 0.96);
  const driftInput = clamp(t / Math.max(0.001, inertiaPortion), 0, 1);
  const driftCurve = driftProgress * Math.pow(driftInput, power);
  const launchInput = clamp((t - transitionStart) / Math.max(0.001, 1 - transitionStart), 0, 1);
  const launchCurve = driftProgress + (1 - driftProgress) * easeInOutPower(launchInput, power);
  const blend = smootherStep((t - transitionStart) / (transitionEnd - transitionStart));
  return driftCurve * (1 - blend) + launchCurve * blend;
}

function easeInOutPower(value: number, power: number): number {
  const t = clamp(value, 0, 1);
  return t < 0.5
    ? Math.pow(t * 2, power) / 2
    : 1 - Math.pow((1 - t) * 2, power) / 2;
}

function smootherStep(value: number): number {
  const t = clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function normalizedMotionStrength(speed: number, startYear: number, targetYear: number, durationMs: number): number {
  const averageSpeed = Math.abs(targetYear - startYear) / Math.max(0.001, durationMs / 1000);
  if (averageSpeed <= 0) return 0;

  const ratio = Math.abs(speed) / averageSpeed;
  return clamp((ratio - 0.08) / 2.15, 0, 1);
}
