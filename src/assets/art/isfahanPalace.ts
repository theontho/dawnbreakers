import type Phaser from 'phaser';
import type { BuildingFront } from './buildingFronts';
import { css, footprintBox, groundShadow, onRoof, outlineBox, paintTexture, shade, type Ctx, type IsoBox } from './canvasKit';
import { plaster, stone } from './materials';
import { band, beamEnds, LIGHT, walls } from './ornaments';
import { pottedPlant, steps } from './streetLife';
import { liftedPoint, subBox } from './structureParts';
import { orosi } from './town/houseKit';
import { joinedMass } from './town/joinedMass';
import { inscriptionBand, tilePanel, townIwan } from './town/monumentKit';
import { townBeams, townDoor, townWindow } from './town/townKit';

/**
 * The Muʿtamid's palace at Iṣfahán at true scale (a person is 40 px, 1.75 m):
 * a tālār, the columned porch of the Safavid palaces, before a hall of
 * mirror-work and coloured glass. Its furnishings are in
 * `isfahanFurnishings.ts`.
 *
 * Footprint (p east, q north; 12 x 8 cells): steps up from the front edge
 * to a stone terrace; the porch on p 0..288, two rows of slender plane-wood
 * columns 8 m tall under a painted timber roof; the hall at the back of the
 * porch; a two-storey wing on the east, p 288..384.
 */

const WALL = 0xd8c49a;
const WOOD = 0x8a5a32;
const LAPIS = 0x24477a;
const TURQUOISE = 0x2e8c96;
const GOLD = 0xd8b04a;
const MARBLE = 0xd8d0bc;
/** Heights: the terrace, the columns (8 m), the painted roof timbers (the wing rises to them). */
const TERRACE = 14;
const COLUMN = 184;
const ROOF = 24;
/** The terrace stands back from the footprint's front to leave room for the steps. */
const FRONT = 28;
/** Depth of the porch from the terrace edge to the hall front. */
const PORCH = 108;
const WING_W = 96;
const COLUMNS = 6;

/** The porch is open to the garden across its whole front, up the steps: no one door. */
export const PALACE_PORTICO_FRONT: BuildingFront = { side: 's' };

export function paintPalacePortico(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const top = TERRACE + COLUMN + ROOF;
  const { box: fp, texW, texH } = footprintBox(cellsW, cellsD, top, 18);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, fp, 16, 0.28);
    const main = fp.w - WING_W;
    terrace(ctx, subBox(fp, 0, fp.w, FRONT, fp.d, TERRACE));
    const mid = main / 2;
    steps(ctx, fp, mid - 52, mid + 52, 4, FRONT, 3, 'q', TERRACE / 3);
    // The hall at the back of the porch, its face in the porch's shade.
    const hall = subBox(fp, 0, main, FRONT + PORCH, fp.d, COLUMN, TERRACE);
    walls(ctx, hall, (c, w, h, light) => plaster(c, w, h, { base: WALL, light: light * 0.8, seed: 81 }), {
      left: (c, w, h, l) => hallFront(c, w, h, l * 0.78),
    });
    // The porch's west end wall, a tall blind niche on its inner face.
    const end = subBox(fp, 0, 10, FRONT + 6, FRONT + PORCH, COLUMN, TERRACE);
    walls(ctx, end, (c, w, h, light) => plaster(c, w, h, { base: WALL, light, seed: 85 }), {
      right: (c, w, h, l) => {
        tilePanel(c, w / 2 - 26, h - 150, 52, 130, TURQUOISE, l * 0.8, 86, 6);
        band(c, w, h - 18, 18, MARBLE, l);
      },
    });
    outlineBox(ctx, end);
    // Two rows of columns, the back row first.
    const colP = (i: number) => 22 + ((main - 44) * i) / (COLUMNS - 1);
    for (const q of [FRONT + PORCH - 40, FRONT + 14]) {
      for (let i = 0; i < COLUMNS; i++) talarColumn(ctx, liftedPoint(fp, colP(i), q, TERRACE), COLUMN);
    }
    // The wing rises to the porch roof, and the two share one roofline.
    wingWalls(ctx, subBox(fp, main, fp.w - 6, FRONT + 20, fp.d, COLUMN + 2, TERRACE));
    const eaves = subBox(fp, 0, fp.w, 0, fp.d, 0, TERRACE + COLUMN);
    joinedMass(ctx, eaves, [
      { p0: 0, p1: main, q0: FRONT, q1: fp.d, h: ROOF, spec: { wall: WALL, seed: 83, plinth: false, shadow: false, left: fascia, right: fascia } },
      { p0: main, p1: fp.w - 6, q0: FRONT + 20, q1: fp.d, h: ROOF, spec: { wall: WALL, seed: 87, plinth: false, shadow: false, left: wingCornice, right: wingCornice } },
    ]);
    // Orange trees in pots along the terrace edge either side of the steps.
    for (const p of [mid - 84, mid - 64, mid + 64, mid + 84]) {
      const at = liftedPoint(fp, p, FRONT + 4, TERRACE);
      pottedPlant(ctx, at.x, at.y, 7, 0x3f6a32, 89 + p, 0xe89a3a);
    }
  });
}

/** The stone terrace: dressed blocks on its faces, marble flags on top. */
function terrace(ctx: Ctx, t: IsoBox): void {
  walls(ctx, t, (c, w, h, light) => stone(c, w, h, { base: 0xb8a684, light, seed: 82 }, TERRACE / 2));
  onRoof(ctx, t, (w, d) => {
    ctx.fillStyle = css(shade(MARBLE, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
    ctx.strokeStyle = 'rgba(80,60,40,0.25)';
    ctx.lineWidth = 0.6;
    for (let p = 16; p < w; p += 16) {
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, d);
      ctx.stroke();
    }
    for (let q = 16; q < d; q += 16) {
      ctx.beginPath();
      ctx.moveTo(0, q);
      ctx.lineTo(w, q);
      ctx.stroke();
    }
    // The porch roof's shadow over the flags.
    const g = ctx.createLinearGradient(0, d, 0, FRONT);
    g.addColorStop(0, 'rgba(30,20,12,0.45)');
    g.addColorStop(1, 'rgba(30,20,12,0.12)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w - WING_W, d);
  });
  outlineBox(ctx, t);
}

/**
 * The hall seen through the columns: a tall iwan of mirror-work at the
 * centre with a door at its back, and either side two tiers of orosi sash
 * windows of coloured glass over a marble dado.
 */
function hallFront(c: Ctx, w: number, h: number, l: number): void {
  band(c, w, h - 20, 20, MARBLE, l);
  inscriptionBand(c, w, 4, 12, l);
  townIwan(c, w / 2, h, 66, 150, {
    wall: 0xc8ccd4, frame: GOLD, door: 0x4a2a14, light: l * 1.1, seed: 84, tile: TURQUOISE, lantern: true,
  });
  for (const side of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const cx = w / 2 + side * (70 + k * 58);
      orosi(c, cx - 16, h - 104, 32, 78, WOOD, l, k === 0);
      orosi(c, cx - 12, h - 160, 24, 34, WOOD, l);
    }
  }
}

/** The porch roof's painted timbers: lapis and gold fascia, beam ends. */
function fascia(c: Ctx, w: number, h: number, light: number): void {
  c.fillStyle = css(shade(WOOD, light));
  c.fillRect(0, 0, w, h);
  band(c, w, 0, 5, LAPIS, light);
  c.fillStyle = css(shade(GOLD, light), 0.85);
  for (let u = 3; u < w; u += 8) c.fillRect(u, 1.5, 3, 2);
  band(c, w, 9, 3, TURQUOISE, light);
  beamEnds(c, w, h - 6, light, 12);
}

/** The top of the wing, level with the porch roof: plaster under beam ends. */
function wingCornice(c: Ctx, w: number, _h: number, l: number): void {
  townBeams(c, w, 8, l, 24);
}

/** The east wing's walls below the shared roof: two storeys of rooms, a door onto the terrace, sash windows above. */
function wingWalls(ctx: Ctx, b: IsoBox): void {
  walls(ctx, b, (c, w, h, light) => plaster(c, w, h, { base: WALL, light, seed: 87 }), {
    left: (c, w, h, l) => {
      band(c, w, h - 84, 3, TURQUOISE, l);
      townDoor(c, w / 2, h, { frame: WOOD, door: 0x4a2a14, surround: 0xe8d9a8, light: l, seed: 871, panel: TURQUOISE });
      orosi(c, w / 2 - 14, h - 150, 28, 52, WOOD, l, true);
    },
    right: (c, w, h, l) => {
      band(c, w, h - 84, 3, TURQUOISE, l);
      for (const t of [0.2, 0.45, 0.7]) {
        townWindow(c, w * t, h, 40, { frame: WOOD, light: l, arched: true });
        orosi(c, w * t - 11, h - 150, 22, 46, WOOD, l);
      }
    },
  });
  // Two px taller than the columns, so its top outline is buried under the shared roof's faces.
  outlineBox(ctx, b);
}

/** A tālār column: a stone base, a faceted plane-wood shaft 8 m tall, a muqarnas capital under the beam. */
function talarColumn(ctx: Ctx, foot: { x: number; y: number }, h: number): void {
  const r = 5;
  const base: IsoBox = { x: foot.x, y: foot.y + 7, w: 14, d: 14, h: 12 };
  walls(ctx, base, (c, w, hh, light) => stone(c, w, hh, { base: 0xcab894, light, seed: 891 }, 6));
  onRoof(ctx, base, (w, d) => {
    ctx.fillStyle = css(shade(0xcab894, LIGHT.roof));
    ctx.fillRect(0, 0, w, d);
  });
  outlineBox(ctx, base);
  const y0 = foot.y - 12;
  const g = ctx.createLinearGradient(foot.x - r, 0, foot.x + r, 0);
  g.addColorStop(0, css(shade(WOOD, 1.35)));
  g.addColorStop(0.4, css(WOOD));
  g.addColorStop(1, css(shade(WOOD, 0.5)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(foot.x - r, y0);
  ctx.lineTo(foot.x - r * 0.8, foot.y - h + 16);
  ctx.lineTo(foot.x + r * 0.8, foot.y - h + 16);
  ctx.lineTo(foot.x + r, y0);
  ctx.closePath();
  ctx.fill();
  // Facets catch the light in fine vertical lines.
  ctx.fillStyle = 'rgba(30,15,5,0.3)';
  ctx.fillRect(foot.x - 0.4, foot.y - h + 18, 0.8, h - 30);
  ctx.fillStyle = 'rgba(255,230,190,0.25)';
  ctx.fillRect(foot.x - r * 0.6, foot.y - h + 18, 0.8, h - 30);
  // Muqarnas capital: stepped tiers flaring to the beam.
  for (let k = 0; k < 4; k++) {
    const cw = r * 1.6 + 2 + k * 3.2;
    ctx.fillStyle = css(shade(k % 2 ? GOLD : LAPIS, 1.05 - k * 0.04));
    ctx.fillRect(foot.x - cw / 2, foot.y - h + 16 - (k + 1) * 4, cw, 4);
    ctx.fillStyle = 'rgba(20,10,4,0.35)';
    ctx.fillRect(foot.x - cw / 2, foot.y - h + 16 - k * 4 - 0.8, cw, 0.8);
  }
}
