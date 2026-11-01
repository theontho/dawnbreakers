import { clamp } from './math';

/** The cinematic sky's inertia curve: a long held breath with the stars almost still, then the launch. */
export interface TimeCurveSettings {
  inertiaPortion: number;
  driftProgress: number;
  power: number;
}

export function cinematicInertiaEase(value: number, curve: TimeCurveSettings): number {
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
