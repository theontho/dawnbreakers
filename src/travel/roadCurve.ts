import { clamp } from '../sky/math';
import { cinematicInertiaEase, type TimeCurveSettings } from '../sky/inertiaEase';

const HOUR_MS = 3600000;
/** Each night runs from the evening it is entered toward dawn. */
const NIGHT_HOURS = 8.5;
const SINGLE_NIGHT_MS = 12000;
/** A long held breath with the stars almost still, then the launch, as the cinematic sky's inertia curve. */
const NIGHT_CURVE: TimeCurveSettings = { inertiaPortion: 0.26, driftProgress: 0.0004, power: 3 };

/** Sky hours per real second while a night is watched. */
const NIGHT_PACE = 1.6;
/**
 * Real seconds each day takes while the days between roll by, slowly enough
 * to watch the sky turn, and the choices the Journeys viewer's dial offers.
 */
export const SECONDS_PER_DAY = 3;
export const SECONDS_PER_DAY_STEPS: readonly number[] = [0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.75, 1, 1.5, 2, 3, 5, 7.5, 10, 15, 20, 30];
/** Real seconds for each stretch of the road. */
const HOLD_S = 1.5;
const FIRST_NIGHT_S = 3.5;
const LAST_NIGHT_S = 3;
const SETTLE_S = 1.5;
const RAMP_S = 1.8;
const MIN_CRUISE_S = 1.5;
const STEP_MS = 20;

/** How far the sky has gone, in milliseconds after it set out, at each moment of a passage. */
export interface PassageCurve {
  durationMs: number;
  offsetAt(elapsedMs: number): number;
}

/** One stretch of a passage: how long it lasts and the pace it eases from and to. */
interface Stretch {
  seconds: number;
  from: number;
  to: number;
}

/**
 * The whole of a road as the sky sees it: the first evening held, the first
 * night watched, the days between rolling by at `secondsPerDay`, and the
 * last night slowing into dawn. A one-night road plays as a single night on
 * the cinematic curve.
 */
export function roadCurve(days: number, secondsPerDay = SECONDS_PER_DAY): PassageCurve {
  const spanHours = (Math.max(1, days) - 1) * 24 + NIGHT_HOURS;
  if (days <= 1) {
    return {
      durationMs: SINGLE_NIGHT_MS,
      offsetAt: (ms) => spanHours * HOUR_MS * cinematicInertiaEase(clamp(ms / SINGLE_NIGHT_MS, 0, 1), NIGHT_CURVE),
    };
  }
  // The nights and the ramps cover a fixed stretch of sky; the cruise between covers the rest.
  const nightHours = NIGHT_PACE * (HOLD_S / 2 + FIRST_NIGHT_S + LAST_NIGHT_S + SETTLE_S / 2 + RAMP_S);
  let cruise = 24 / secondsPerDay;
  let cruiseSeconds = (spanHours - nightHours) / cruise - RAMP_S;
  // A short road has too few days to reach the pace; it rolls them by more gently.
  if (cruiseSeconds < MIN_CRUISE_S) {
    cruiseSeconds = MIN_CRUISE_S;
    cruise = Math.max(NIGHT_PACE, (spanHours - nightHours) / (RAMP_S + cruiseSeconds));
  }
  return tabulate(spanHours * HOUR_MS, [
    { seconds: HOLD_S, from: 0, to: NIGHT_PACE },
    { seconds: FIRST_NIGHT_S, from: NIGHT_PACE, to: NIGHT_PACE },
    { seconds: RAMP_S, from: NIGHT_PACE, to: cruise },
    { seconds: cruiseSeconds, from: cruise, to: cruise },
    { seconds: RAMP_S, from: cruise, to: NIGHT_PACE },
    { seconds: LAST_NIGHT_S, from: NIGHT_PACE, to: NIGHT_PACE },
    { seconds: SETTLE_S, from: NIGHT_PACE, to: 0 },
  ]);
}

/** Integrates the paces into a table of sky offsets, scaled so the passage ends exactly at `spanMs`. */
function tabulate(spanMs: number, stretches: readonly Stretch[]): PassageCurve {
  const offsets = [0];
  let sky = 0;
  for (const stretch of stretches) {
    const steps = Math.max(1, Math.round((stretch.seconds * 1000) / STEP_MS));
    for (let i = 0; i < steps; i += 1) {
      const t = (i + 0.5) / steps;
      const ease = t * t * (3 - 2 * t);
      const pace = stretch.from + (stretch.to - stretch.from) * ease;
      sky += pace * (STEP_MS / 1000);
      offsets.push(sky);
    }
  }
  const scale = spanMs / sky;
  const durationMs = (offsets.length - 1) * STEP_MS;
  return {
    durationMs,
    offsetAt: (ms) => {
      const at = clamp(ms, 0, durationMs) / STEP_MS;
      const i = Math.min(offsets.length - 2, Math.floor(at));
      return (offsets[i]! + (offsets[i + 1]! - offsets[i]!) * (at - i)) * scale;
    },
  };
}
