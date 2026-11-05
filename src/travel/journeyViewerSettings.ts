import { SECONDS_PER_DAY } from './roadCurve';
import type { TrailMode } from './skyPainter';

/**
 * The journey viewer's settings, kept across a restart for the next journey
 * or a resize, and the labels its buttons show.
 */

/** How the viewer was set, carried across a restart for the next journey or a resize. */
export interface ViewerSettings {
  rateIndex: number;
  direction: 1 | -1;
  playing: boolean;
  trails: TrailMode;
  /** Quarter turns away from the journey's own facing. */
  turn: number;
  /** Facing where the sun first rises or sets after the road sets out, instead of the road's facing. */
  centerSun: boolean;
  /** Playing each road as the game does between chapters, and going on to the next. */
  autoplay: boolean;
  /** Real seconds each day takes while the days between roll by. */
  secondsPerDay: number;
  /** The most frames a second the sky is drawn: 120 for fast stars on a screen that can show them, 60 to save power. */
  maxHz: FrameRate;
  /** The full dark of the 1840s: every star the naked eye could find, and the Milky Way. */
  fullDark: boolean;
}

export type FrameRate = 60 | 120;

export const FACINGS: readonly { label: string }[] = [
  { label: 'Facing north' },
  { label: 'Facing east' },
  { label: 'Facing south' },
  { label: 'Facing west' },
];
export const TRAIL_LABELS: Record<TrailMode, { label: string }> = {
  off: { label: 'Trails: off' },
  tail: { label: 'Trails: comet tails' },
  exposure: { label: 'Trails: long exposure' },
};
export const DEFAULT_SETTINGS: ViewerSettings = { rateIndex: 2, direction: 1, playing: true, trails: 'tail', turn: 0, centerSun: true, autoplay: true, secondsPerDay: SECONDS_PER_DAY, maxHz: 120, fullDark: false };

/** Which quarter of the compass a bearing faces: north, east, south or west. */
export function facingIndex(bearing: number): number {
  return Math.round(bearing / 90) % 4;
}
