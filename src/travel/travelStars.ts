import { PACKED_TRAVEL_STARS, PACKED_TRAVEL_STAR_WIDTH } from '../data/travelStars';
import { DEG_TO_RAD, clamp } from '../skyrewind/math';
import { computeProjectionState, precess } from '../skyrewind/projection';
import type { GeographicLocation } from '../skyrewind/types';

/**
 * The naked-eye stars, precessed to one date and ready to be turned by
 * sidereal time: over a night the only thing that changes is the hour
 * angle, so declination's sine and cosine are worked out once.
 */
export interface StarField {
  count: number;
  ra: Float64Array;
  sinDec: Float64Array;
  cosDec: Float64Array;
  magnitude: Float32Array;
  /** Packed 0xRRGGBB tint from the B-V colour index. */
  color: Uint32Array;
}

interface CatalogStar {
  ra: number;
  dec: number;
  magnitude: number;
  colorIndex: number | undefined;
}

let catalog: readonly CatalogStar[] | undefined;

export function starFieldFor(date: Date, location: GeographicLocation): StarField {
  const stars = catalog ??= decodeCatalog();
  const projection = computeProjectionState(date, location);
  const field: StarField = {
    count: stars.length,
    ra: new Float64Array(stars.length),
    sinDec: new Float64Array(stars.length),
    cosDec: new Float64Array(stars.length),
    magnitude: new Float32Array(stars.length),
    color: new Uint32Array(stars.length),
  };
  stars.forEach((star, i) => {
    const ofDate = precess(star.ra, star.dec, projection);
    field.ra[i] = ofDate.ra;
    field.sinDec[i] = Math.sin(ofDate.dec);
    field.cosDec[i] = Math.cos(ofDate.dec);
    field.magnitude[i] = star.magnitude;
    field.color[i] = starTint(star.colorIndex);
  });
  return field;
}

function decodeCatalog(): CatalogStar[] {
  const stars: CatalogStar[] = [];
  const read = (at: number, width: number) => parseInt(PACKED_TRAVEL_STARS.slice(at, at + width), 36);
  for (let at = 0; at < PACKED_TRAVEL_STARS.length; at += PACKED_TRAVEL_STAR_WIDTH) {
    const bv = PACKED_TRAVEL_STARS.slice(at + 8, at + 10);
    stars.push({
      ra: (read(at, 3) / 100) * DEG_TO_RAD,
      dec: (read(at + 3, 3) / 100 - 90) * DEG_TO_RAD,
      magnitude: read(at + 6, 2) / 20 - 2,
      colorIndex: bv === 'zz' ? undefined : parseInt(bv, 36) / 50 - 0.5,
    });
  }
  return stars;
}

/** Blue-white for hot stars through to the orange of Aldebaran and Antares. */
function starTint(colorIndex: number | undefined): number {
  if (colorIndex === undefined) return 0xe8eeff;
  const t = clamp((colorIndex + 0.3) / 2.1, 0, 1);
  const r = clamp(0.78 + t * 0.4, 0, 1);
  const g = clamp(0.84 + Math.sin(t * Math.PI) * 0.1 - t * 0.12, 0, 1);
  const b = clamp(1.08 - t * 0.62, 0, 1);
  return (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255);
}
