export const TAU = Math.PI * 2;
export const DEG_TO_RAD = Math.PI / 180;
export const ARCSEC_TO_RAD = DEG_TO_RAD / 3600;
export const J2000_JULIAN_DAY = 2451545;
export const J2000_YEAR = 2000;

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function wrapRadians(value: number): number {
  const wrapped = value % TAU;
  return wrapped < 0 ? wrapped + TAU : wrapped;
}

export function decimalYear(date: Date): number {
  const year = date.getUTCFullYear();
  const start = Date.UTC(year, 0, 1, 0, 0, 0, 0);
  const end = Date.UTC(year + 1, 0, 1, 0, 0, 0, 0);
  return year + (date.getTime() - start) / (end - start);
}

export function julianDay(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}
