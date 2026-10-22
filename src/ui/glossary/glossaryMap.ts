import { GLOSSARY, type GlossaryEntry } from '../../data/glossary';
import { LAKES, LAND, MAP_BOX, PERSIA, PROVINCES, RIVERS, type Flat } from '../../data/glossary/mapData';
import { localizedFont, rtl, t } from '../../i18n';

/**
 * The map on a place's glossary card, as SVG from Natural Earth geography:
 * sea, land, the Caspian and the lakes, rivers, Persia's border, and the
 * provinces. The view is centred on the place (or framed round the
 * province), which is ringed or washed in gold, with a few neighbouring
 * places named so it can be found on the larger map of the mind.
 */

const WIDTH = 280;
const HEIGHT = 190;
/** Degrees of longitude shown around a single place. */
const PLACE_SPAN = 13;
/** Neighbours named on the map besides the place itself. */
const NEIGHBOURS = 4;

interface View {
  lon0: number;
  lat1: number;
  /** Pixels per degree of latitude; longitude is shrunk by `cos`. */
  unit: number;
  cos: number;
}

function viewFor(entry: GlossaryEntry): View {
  let [cx, cy, spanLon] = entry.at ? [entry.at[0], entry.at[1], PLACE_SPAN] : [53, 32, 24];
  const rings = entry.region ? PROVINCES[entry.region] : undefined;
  if (rings?.length) {
    const b = bounds(rings);
    cx = (b.w + b.e) / 2;
    cy = (b.s + b.n) / 2;
    spanLon = Math.max(10, (b.e - b.w) * 2.2, (b.n - b.s) * 2.2 * (WIDTH / HEIGHT));
  }
  const cos = Math.cos(cy * Math.PI / 180);
  const unit = WIDTH / (spanLon * cos);
  const spanLat = HEIGHT / unit;
  // Keep the view inside the mapped area.
  const lon0 = clamp(cx - spanLon / 2, MAP_BOX.w, MAP_BOX.e - spanLon);
  const lat1 = clamp(cy + spanLat / 2, MAP_BOX.s + spanLat, MAP_BOX.n);
  return { lon0, lat1, unit, cos };
}

export function glossaryMapSvg(entry: GlossaryEntry): string {
  const view = viewFor(entry);
  const px = (lon: number) => (lon - view.lon0) * view.cos * view.unit;
  const py = (lat: number) => (view.lat1 - lat) * view.unit;
  const path = (rings: readonly Flat[], close = true) => rings.map(r => {
    let d = '';
    for (let i = 0; i < r.length; i += 2) d += `${i ? 'L' : 'M'}${px(r[i]!).toFixed(1)},${py(r[i + 1]!).toFixed(1)}`;
    return close ? `${d}Z` : d;
  }).join('');
  const parts: string[] = [];
  parts.push(`<rect width="${WIDTH}" height="${HEIGHT}" fill="#a9bec2"/>`);
  parts.push(`<path d="${path(LAND)}" fill="#ecdcb6" fill-rule="evenodd" stroke="#7d6a48" stroke-width="0.6"/>`);
  parts.push(`<path d="${path(PERSIA)}" fill="#f3e6c6" fill-rule="evenodd"/>`);
  for (const [id, rings] of Object.entries(PROVINCES)) {
    const on = entry.region === id;
    parts.push(`<path d="${path(rings)}" fill="${on ? 'rgba(201,150,40,0.5)' : 'none'}" fill-rule="evenodd" stroke="${on ? '#8a5a10' : 'rgba(138,106,58,0.4)'}" stroke-width="${on ? 1.2 : 0.5}"/>`);
  }
  parts.push(`<path d="${path(LAKES)}" fill="#a9bec2" fill-rule="evenodd" stroke="#6f8a90" stroke-width="0.5"/>`);
  parts.push(`<path d="${path(RIVERS, false)}" fill="none" stroke="#6f949c" stroke-width="0.8" stroke-linejoin="round"/>`);
  parts.push(`<path d="${path(PERSIA)}" fill="none" stroke="#7a5a2a" stroke-width="1" stroke-dasharray="3 2"/>`);

  // Places: every glossary place as a dot; the nearest few named.
  const inView = GLOSSARY.filter(g => g.at && g.id !== entry.id).map(g => ({ g, x: px(g.at![0]), y: py(g.at![1]) }))
    .filter(p => p.x > 4 && p.x < WIDTH - 4 && p.y > 4 && p.y < HEIGHT - 4);
  const here = entry.at ? { x: px(entry.at[0]), y: py(entry.at[1]) } : { x: WIDTH / 2, y: HEIGHT / 2 };
  const named = [...inView].sort((a, b) => Math.hypot(a.x - here.x, a.y - here.y) - Math.hypot(b.x - here.x, b.y - here.y))
    .slice(0, NEIGHBOURS).map(p => p.g.id);
  const font = localizedFont().replace(/"/g, '\'');
  // Labels go beside their dot, right or left, wherever they do not collide.
  const placed: Array<{ x0: number; x1: number; y0: number; y1: number }> = [];
  const label = (x: number, y: number, gap: number, text: string, strong: boolean): string => {
    const size = strong ? 11.5 : 9.5;
    const w = text.length * size * 0.56;
    for (const side of [1, -1]) {
      const x0 = side > 0 ? x + gap : x - gap - w;
      const box = { x0, x1: x0 + w, y0: y - size * 0.7, y1: y + size * 0.4 };
      if (box.x0 < 2 || box.x1 > WIDTH - 2 || box.y0 < 2 || box.y1 > HEIGHT - 2) continue;
      if (placed.some(b => b.x0 < box.x1 && box.x0 < b.x1 && b.y0 < box.y1 && box.y0 < b.y1)) continue;
      placed.push(box);
      return `<text x="${box.x0.toFixed(1)}" y="${(y + size * 0.35).toFixed(1)}" text-anchor="start" font-family="${font}" font-size="${size}" font-weight="${strong ? 700 : 400}" fill="${strong ? '#3a1a08' : '#5a4630'}" stroke="#f3e6c6" stroke-width="2.5" paint-order="stroke">${escapeXml(text)}</text>`;
    }
    return '';
  };
  const labels: string[] = [];
  if (entry.at) labels.push(label(here.x, here.y, 11, t(entry.title), true));
  for (const p of inView) {
    parts.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2" fill="#5a4630"/>`);
  }
  for (const id of named) {
    const p = inView.find(q => q.g.id === id)!;
    labels.push(label(p.x, p.y, 5, t(p.g.title), false));
  }
  if (entry.at) {
    parts.push(`<circle cx="${here.x.toFixed(1)}" cy="${here.y.toFixed(1)}" r="7.5" fill="none" stroke="#b8860b" stroke-width="1.6"/>`);
    parts.push(`<circle cx="${here.x.toFixed(1)}" cy="${here.y.toFixed(1)}" r="3.4" fill="#8a1a10" stroke="#f5e6b8" stroke-width="1"/>`);
  }
  parts.push(...labels);
  return `<svg class="gloss-map" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" direction="${rtl ? 'rtl' : 'ltr'}">${parts.join('')}</svg>`;
}

function bounds(rings: readonly Flat[]): { w: number; s: number; e: number; n: number } {
  const b = { w: Infinity, s: Infinity, e: -Infinity, n: -Infinity };
  for (const r of rings) {
    for (let i = 0; i < r.length; i += 2) {
      b.w = Math.min(b.w, r[i]!);
      b.e = Math.max(b.e, r[i]!);
      b.s = Math.min(b.s, r[i + 1]!);
      b.n = Math.max(b.n, r[i + 1]!);
    }
  }
  return b;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function escapeXml(text: string): string {
  return text.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
