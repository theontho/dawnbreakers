import type { Ctx } from '../canvasKit';
import type { DawnMode } from '../dawnPass';

/**
 * A place the title's dawn can break over: where it stands on the earth (for
 * the stars, the moon and the hour of sunrise) and how to paint it in the
 * four layers of a `DawnPass` (night, day, rim and lamp).
 */

export type VistaId =
  | 'karbila'
  | 'shiraz'
  | 'quran-gate'
  | 'tehran'
  | 'mecca'
  | 'baghdad'
  | 'isfahan'
  | 'kashan'
  | 'maku'
  | 'qazvin'
  | 'badasht'
  | 'tabriz'
  | 'tabarsi'
  | 'nayriz'
  | 'zanjan';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

/** The screen the vista is painted for, in screen pixels. */
export interface VistaFrame {
  width: number;
  height: number;
  /** Where the land meets the sky in the middle of the view, under the sunrise. */
  horizonY: number;
  /** Size scale: 1 at 800 pixels tall. */
  k: number;
  season: Season;
}

export interface Vista {
  id: VistaId;
  /** Degrees north and east. */
  latitude: number;
  longitude: number;
  /** How far above `horizonY` anything is painted, in unscaled pixels; the bake skips the open sky above it. */
  reach: number;
  paint: (ctx: Ctx, mode: DawnMode, frame: VistaFrame) => void;
}

/** Size scale for a screen this tall. */
export function vistaScale(height: number): number {
  return Math.min(1.5, Math.max(0.75, height / 800));
}

/** The season of an evening in the northern hemisphere, by its month. */
export function seasonOf(date: Date): Season {
  const month = date.getUTCMonth();
  if (month === 11 || month <= 1) return 'winter';
  if (month <= 4) return 'spring';
  if (month <= 7) return 'summer';
  return 'autumn';
}
