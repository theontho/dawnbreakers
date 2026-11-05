import type { Season, VistaFrame } from './vista/types';

/**
 * Where everything stands in the dawn view of a walled city (Shíráz first),
 * in screen pixels.
 * The sun rises at the centre of the screen over `horizonY`; the city wall
 * runs across the view with its gate a little to the left, so the road can
 * wind up to it out of the fields.
 */
export interface DawnLayout {
  width: number;
  height: number;
  horizonY: number;
  wallTop: number;
  wallBase: number;
  gateX: number;
  /** The tiled shrine dome that stands against the rising sun. */
  shrineX: number;
  /** Karím Khán's citadel, with its round brick towers; left out where the view is too narrow for it. */
  argX: number | null;
  /** A mosque portal with its pair of short minarets; left out where the view is too narrow for it. */
  portalX: number | null;
  /** Size scale: 1 at 800 pixels tall. */
  k: number;
  season: Season;
}

export function dawnLayout(frame: VistaFrame): DawnLayout {
  const { width, height, horizonY, k, season } = frame;
  const wallBase = Math.round(Math.min(height - 60 * k, horizonY + height * 0.085));
  const wallTop = wallBase - Math.round(36 * k);
  const centre = width / 2;
  const gateX = centre - Math.min(width * 0.17, 230);
  const shrineX = centre + Math.max(34, Math.min(width * 0.075, 96));
  const argX = Math.max(70 * k, width * 0.16);
  const portalX = Math.min(width - 60 * k, width * 0.8);
  return {
    width,
    height,
    horizonY,
    wallTop,
    wallBase,
    gateX,
    shrineX,
    argX: gateX - argX > 140 * k ? argX : null,
    portalX: portalX - shrineX > 150 * k ? portalX : null,
    k,
    season,
  };
}
