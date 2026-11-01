import { clamp } from '../sky/math';

/**
 * How much of the HDR glow to show, 0.3 to 1, so a sun burning past paper
 * white does not dazzle someone playing in the dark. A page cannot read the
 * screen's brightness, so it goes by what it can know of the room: the light
 * sensor where the browser offers one, else the hour on the player's clock
 * (full by day, a third at night, easing between), a little less again when
 * the device has turned to its dark appearance.
 */

const NIGHT_COMFORT = 0.3;
/** Dark appearance, often switched on by the device at dusk, dims a little further. */
const DARK_APPEARANCE = 0.85;
/** Room light in lux at which the glow is least and full. */
const DIM_LUX = 5;
const BRIGHT_LUX = 400;

let sensedLux: number | undefined;
let sensorTried = false;

/** Starts the ambient light sensor where the browser has one and allows it; silent otherwise. */
function trySensor(): void {
  if (sensorTried) return;
  sensorTried = true;
  const Sensor = (window as unknown as { AmbientLightSensor?: new (options?: { frequency?: number }) => EventTarget & { illuminance?: number; start(): void } }).AmbientLightSensor;
  if (!Sensor) return;
  try {
    const sensor = new Sensor({ frequency: 1 });
    sensor.addEventListener('reading', () => {
      if (typeof sensor.illuminance === 'number') sensedLux = sensor.illuminance;
    });
    sensor.addEventListener('error', () => {
      sensedLux = undefined;
    });
    sensor.start();
  } catch {
    // No permission or no sensor: the clock will do.
  }
}

function smooth(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/** Daylight on the player's own clock: 1 from 8 to 19, 0 from 22 to 6, easing between. */
function dayOnTheClock(date: Date): number {
  const hour = date.getHours() + date.getMinutes() / 60;
  if (hour < 12) return smooth((hour - 6) / 2);
  return 1 - smooth((hour - 19) / 3);
}

export function hdrComfort(now = new Date()): number {
  trySensor();
  let day: number;
  if (sensedLux !== undefined) {
    day = smooth(Math.log(Math.max(sensedLux, 0.1) / DIM_LUX) / Math.log(BRIGHT_LUX / DIM_LUX));
  } else {
    day = dayOnTheClock(now);
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches) day *= DARK_APPEARANCE;
  }
  return NIGHT_COMFORT + (1 - NIGHT_COMFORT) * day;
}
