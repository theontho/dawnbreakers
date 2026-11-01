import { css, footprintBox, groundShadow, shade, type Ctx, type IsoBox } from './canvasKit';
import { brick } from './materials';
import { archPath, band, parapetRoof, walls } from './ornaments';

/**
 * The retreat cells of the old masjid of Kúfih: a long low range of fired
 * brick against the court wall, about 4 m high, opening on the court by a
 * row of pointed arches, each a cell with a wool curtain half drawn across
 * it. Built on a footprint `cells` wide (east to west) and 2 deep.
 */

export const CELL_RANGE_H = 92;
const BRICK = 0xc8a878;

export function cellRangeBox(cells: number): { box: IsoBox; texW: number; texH: number } {
  return footprintBox(cells, 2, CELL_RANGE_H, 16);
}

export function drawCellRange(ctx: Ctx, box: IsoBox, seed: number): void {
  groundShadow(ctx, box, 10, 0.3);
  walls(ctx, box, (c, fw, fh, light) => brick(c, fw, fh, { base: BRICK, light, seed }, 4, 9), {
    left: (c, fw, fh, l) => {
      band(c, fw, 6, 4, shade(BRICK, 0.8), l);
      // One cell to each 1.4 m bay pair: pointed arches across the court face.
      const bays = Math.max(1, Math.round(fw / 46));
      for (let i = 0; i < bays; i++) cellArch(c, ((i + 0.5) / bays) * fw, fh, l, seed + i);
    },
    right: (c, fw, _fh, l) => band(c, fw, 6, 4, shade(BRICK, 0.8), l),
  });
  parapetRoof(ctx, box, shade(BRICK, 0.92), { base: 0xb09a74, light: 1.1, seed: seed + 9 }, 3, 4);
}

/** A pointed arch about 1.1 m wide and 2.4 m high, dark within, a wool curtain half drawn. */
function cellArch(c: Ctx, u: number, fh: number, l: number, seed: number): void {
  const w = 26;
  const h = 56;
  const x = u - w / 2;
  archPath(c, x - 3, fh, w + 6, h + 3);
  c.fillStyle = css(shade(0x9a7a52, l));
  c.fill();
  archPath(c, x, fh, w, h);
  c.fillStyle = css(0x1a120a);
  c.fill();
  // The curtain, drawn to one side, in undyed wool or madder.
  const wool = seed % 3 === 0 ? 0x8a3a2a : 0xcabd9c;
  c.save();
  archPath(c, x, fh, w, h);
  c.clip();
  const g = c.createLinearGradient(x, 0, x + w * 0.55, 0);
  g.addColorStop(0, css(shade(wool, l * 1.05)));
  g.addColorStop(1, css(shade(wool, l * 0.7)));
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(x, fh - h);
  c.lineTo(x + w * 0.55, fh - h);
  c.quadraticCurveTo(x + w * 0.3, fh - h * 0.45, x + w * 0.42, fh);
  c.lineTo(x, fh);
  c.closePath();
  c.fill();
  c.restore();
  // A worn step.
  c.fillStyle = css(shade(0xa8946e, l));
  c.fillRect(x - 3, fh - 2, w + 6, 2);
}
