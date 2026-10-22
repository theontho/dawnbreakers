import { GLOSSARY, type GlossaryEntry } from '../../data/glossary';
import { EXTENT, PERSIA, PROVINCES, SEAS, type Ring } from '../../data/glossary/geography';

/**
 * A small map of the story's world for a tooltip, as SVG: the seas, the
 * outline of Persia, every place in the glossary as a faint dot, and the
 * entry's own city ringed in gold or its province washed in gold.
 */

const WIDTH = 280;
/** Shrink longitude by the cosine of the middle latitude so shapes keep their proportions. */
const LON_SCALE = Math.cos(((EXTENT.s + EXTENT.n) / 2) * Math.PI / 180);
const UNIT = WIDTH / ((EXTENT.e - EXTENT.w) * LON_SCALE);
const HEIGHT = Math.round((EXTENT.n - EXTENT.s) * UNIT);

const x = (lon: number) => ((lon - EXTENT.w) * LON_SCALE * UNIT).toFixed(1);
const y = (lat: number) => ((EXTENT.n - lat) * UNIT).toFixed(1);
const path = (ring: Ring) => `M${ring.map(([lon, lat]) => `${x(lon)},${y(lat)}`).join('L')}Z`;

export function glossaryMapSvg(entry: GlossaryEntry): string {
  const parts: string[] = [];
  parts.push(`<rect width="${WIDTH}" height="${HEIGHT}" fill="#e8d9b4"/>`);
  parts.push(`<path d="${path(PERSIA)}" fill="#efe2c2" stroke="#8a6a3a" stroke-width="1" stroke-dasharray="3 2"/>`);
  for (const [id, ring] of Object.entries(PROVINCES)) {
    const on = entry.region === id;
    parts.push(`<path d="${path(ring)}" fill="${on ? 'rgba(201,150,40,0.55)' : 'none'}" stroke="${on ? '#8a5a10' : 'rgba(138,106,58,0.35)'}" stroke-width="${on ? 1.2 : 0.6}"/>`);
  }
  for (const ring of Object.values(SEAS)) parts.push(`<path d="${path(ring)}" fill="#a9bcc0" stroke="#6f8a90" stroke-width="0.8"/>`);
  for (const other of GLOSSARY) {
    if (!other.at || other.id === entry.id) continue;
    parts.push(`<circle cx="${x(other.at[0])}" cy="${y(other.at[1])}" r="1.6" fill="#6a5434" opacity="0.55"/>`);
  }
  if (entry.at) {
    const cx = x(entry.at[0]);
    const cy = y(entry.at[1]);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="7" fill="none" stroke="#b8860b" stroke-width="1.5"/>`);
    parts.push(`<circle cx="${cx}" cy="${cy}" r="3.2" fill="#8a1a10" stroke="#f5e6b8" stroke-width="1"/>`);
  }
  return `<svg class="gloss-map" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img">${parts.join('')}</svg>`;
}
