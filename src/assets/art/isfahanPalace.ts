import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, onRoof, outlineBox, paintTexture, polygon, rng, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { glazedTiles, plaster, stone } from './materials';
import { archPath, band, beamEnds, dome, doorway, flatTop, latticeWindow, LIGHT, merlons, parapetRoof, walls } from './ornaments';
import { ellipseShadow, liftedPoint, subBox } from './structureParts';

/**
 * The Muʿtamid's palace at Iṣfahán: a tālār, the columned porch of the
 * Safavid palaces, before a tiled hall; and its furnishings, the ewer and
 * basin and the seat of honour.
 */

const WALL = 0xd8c49a;
const WOOD = 0x8a5a32;
const LAPIS = 0x24477a;
const TURQUOISE = 0x2e8c96;
const GOLD = 0xd8b04a;

export function paintPalacePortico(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const colH = 52;
  const { box, texW, texH } = footprintBox(cellsW, cellsD, colH + 10, 34);
  paintTexture(scene, key, texW, texH, ctx => {
    const porch = Math.min(24, box.d * 0.3);
    groundShadow(ctx, box, 8);
    // The hall behind the porch.
    const hall = subBox(box, 0, box.w, porch, box.d, colH);
    walls(ctx, hall, (c, w, h, light) => plaster(c, w, h, { base: WALL, light, seed: 81 }), {
      left: (c, w, h, l) => hallFront(c, w, h, l),
      right: (c, w, h, l) => {
        band(c, w, 6, 3, TURQUOISE, l);
        for (let i = 0; i < 2; i++) latticeWindow(c, w * (0.3 + i * 0.4) - 5, h * 0.4, 10, 14, { frame: WOOD, light: l, arched: true });
      },
    });
    // Stone plinth of the porch.
    const plinth = subBox(box, 0, box.w, 0, porch, 3);
    walls(ctx, plinth, (c, w, h, light) => stone(c, w, h, { base: 0xb8a684, light, seed: 82 }, 3));
    onRoof(ctx, plinth, (w, d) => {
      ctx.fillStyle = css(shade(0xcab894, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
      ctx.strokeStyle = 'rgba(80,60,40,0.3)';
      ctx.lineWidth = 0.6;
      for (let p = 8; p < w; p += 8) {
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, d);
        ctx.stroke();
      }
    });
    outlineBox(ctx, plinth);
    // Slender chenar-wood columns on stone bases.
    const bays = Math.max(3, Math.round(box.w / 30));
    for (let i = 0; i <= bays; i++) {
      const p = 5 + ((box.w - 10) * i) / bays;
      talarColumn(ctx, liftedPoint(box, p, 5, 3), colH - 3);
    }
    talarColumn(ctx, liftedPoint(box, box.w - 5, porch - 3, 3), colH - 3);
    // The flat roof: painted fascia above, parapet and a tiled pīshṭāq crowning the centre.
    const slab = subBox(box, 0, box.w, 0, box.d, 10, colH);
    walls(ctx, slab, (c, w, h, light) => {
      c.fillStyle = css(shade(WOOD, light));
      c.fillRect(0, 0, w, h);
      band(c, w, 0, 3, LAPIS, light);
      c.fillStyle = css(shade(GOLD, light), 0.85);
      for (let u = 2; u < w; u += 6) c.fillRect(u, 1, 2, 1);
      beamEnds(c, w, 5, light, 6);
    });
    parapetRoof(ctx, slab, WALL, { base: 0xb09070, light: 1, seed: 83 }, 4, 4);
    merlons(ctx, slab, WALL, 3, 5);
    outlineBox(ctx, slab);
    // Small plaster domes over the hall's inner rooms.
    for (const t of [0.22, 0.78]) {
      const at = roofPoint(slab, slab.w * t, slab.d * 0.62);
      dome(ctx, at.x, at.y + 4, 11, { color: shade(WALL, 0.97), drum: 4, bulb: 1.05, finial: true });
    }
    pishtaq(ctx, slab);
  });
}

/** The hall façade seen through the columns: tiled iwan, coloured-glass sash windows, niches. */
function hallFront(ctx: Ctx, w: number, h: number, light: number): void {
  band(ctx, w, 6, 3, TURQUOISE, light);
  const iw = Math.min(30, w * 0.2);
  ctx.save();
  ctx.beginPath();
  ctx.rect(w / 2 - iw / 2 - 5, 11, iw + 10, h - 11);
  ctx.clip();
  glazedTiles(ctx, w, h, { base: LAPIS, light, seed: 84 }, 5);
  ctx.restore();
  doorway(ctx, w / 2 - iw / 2, h, iw, h * 0.66, { frame: TURQUOISE, door: 0x4a2a14, light });
  for (const side of [-1, 1]) {
    for (let k = 0; k < 2; k++) {
      const x = w / 2 + side * (iw / 2 + 14 + k * 26) - (side < 0 ? 16 : 0);
      orosi(ctx, x, h * 0.36, 16, h * 0.46, light);
    }
  }
  for (let u = 6; u < w - 6; u += 12) {
    archPath(ctx, u, 18, 6, 7);
    ctx.fillStyle = css(shade(0x6a4a30, light), 0.6);
    ctx.fill();
  }
}

/** An orosi: a sash window of small coloured panes in a wooden grid. */
function orosi(ctx: Ctx, x: number, y: number, w: number, h: number, light: number): void {
  ctx.fillStyle = css(shade(WOOD, light * 0.9));
  archPath(ctx, x - 1.5, y + h + 1, w + 3, h + 2.5);
  ctx.fill();
  archPath(ctx, x, y + h, w, h);
  ctx.save();
  ctx.clip();
  const panes = [0xb83a2a, 0x2e6c8c, 0xd8a23a, 0x3a7a4a, 0xe8dcc0];
  const rand = rng(Math.round(x * 7 + y));
  for (let py = y - 4; py < y + h; py += 3) {
    for (let px = x; px < x + w; px += 3) {
      ctx.fillStyle = css(shade(panes[Math.floor(rand() * panes.length)]!, light * 0.85));
      ctx.fillRect(px, py, 3, 3);
    }
  }
  ctx.strokeStyle = css(shade(WOOD, light * 0.7));
  ctx.lineWidth = 0.6;
  for (let px = x; px <= x + w; px += 3) {
    ctx.beginPath();
    ctx.moveTo(px, y - 6);
    ctx.lineTo(px, y + h);
    ctx.stroke();
  }
  for (let py = y - 4; py <= y + h; py += 3) {
    ctx.beginPath();
    ctx.moveTo(x, py);
    ctx.lineTo(x + w, py);
    ctx.stroke();
  }
  ctx.restore();
}

function talarColumn(ctx: Ctx, foot: { x: number; y: number }, h: number): void {
  const r = 2.4;
  // Stone base.
  const base: IsoBox = { x: foot.x, y: foot.y + 3.5, w: 7, d: 7, h: 4 };
  walls(ctx, base, (c, w, hh, light) => {
    c.fillStyle = css(shade(0xcab894, light));
    c.fillRect(0, 0, w, hh);
  });
  flatTop(ctx, base, 0xcab894);
  const g = ctx.createLinearGradient(foot.x - r, 0, foot.x + r, 0);
  g.addColorStop(0, css(shade(WOOD, 1.3)));
  g.addColorStop(0.4, css(WOOD));
  g.addColorStop(1, css(shade(WOOD, 0.5)));
  ctx.fillStyle = g;
  ctx.fillRect(foot.x - r, foot.y - h, r * 2, h - 2);
  // Faceted shaft: fine vertical flutes.
  ctx.fillStyle = 'rgba(30,15,5,0.3)';
  ctx.fillRect(foot.x - 0.3, foot.y - h + 6, 0.6, h - 10);
  // Muqarnas capital: stepped tiers flaring to the beam.
  for (let k = 0; k < 3; k++) {
    const cw = r * 2 + 2 + k * 2.2;
    ctx.fillStyle = css(shade(k % 2 ? GOLD : LAPIS, 1.05 - k * 0.05));
    ctx.fillRect(foot.x - cw / 2, foot.y - h + 6 - k * 2.2, cw, 2.2);
  }
}

/** The tiled portal rising over the centre of the roof, with the golden sun. */
function pishtaq(ctx: Ctx, slab: IsoBox): void {
  const pw = Math.min(40, slab.w * 0.28);
  const p1 = slab.w / 2 + pw / 2;
  const portal = subBox(slab, p1 - pw, p1, 0, 6, 26, slab.h);
  walls(ctx, portal, (c, w, h, light) => plaster(c, w, h, { base: WALL, light, seed: 85 }), {
    left: (c, w, h, l) => {
      c.save();
      c.beginPath();
      c.rect(2, 2, w - 4, h - 2);
      c.clip();
      glazedTiles(c, w, h, { base: TURQUOISE, light: l, seed: 86 }, 5);
      c.restore();
      c.strokeStyle = css(shade(0xe8d9a8, l), 0.9);
      c.lineWidth = 1;
      c.strokeRect(2.5, 2.5, w - 5, h - 3);
      // The sun: a gilded disc and rays.
      const cx = w / 2;
      const cy = h * 0.52;
      c.strokeStyle = css(shade(GOLD, l));
      c.lineWidth = 1;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        c.beginPath();
        c.moveTo(cx + Math.cos(a) * 4, cy + Math.sin(a) * 4);
        c.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8);
        c.stroke();
      }
      const disc = c.createRadialGradient(cx - 1.5, cy - 1.5, 0.5, cx, cy, 5);
      disc.addColorStop(0, '#fff2b0');
      disc.addColorStop(1, css(shade(GOLD, l * 0.85)));
      c.fillStyle = disc;
      c.beginPath();
      c.arc(cx, cy, 4.5, 0, Math.PI * 2);
      c.fill();
    },
  });
  flatTop(ctx, portal, WALL);
  merlons(ctx, portal, WALL, 3, 3);
  outlineBox(ctx, portal);
}

/** A silver ewer (āftābih) and basin (lagan) on a low inlaid stand. */
export function paintEwer(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 48, 46, ctx => {
    const stand: IsoBox = { x: 24, y: 42, w: 18, d: 18, h: 6 };
    ellipseShadow(ctx, 25, 41, 20, 5);
    walls(ctx, stand, (c, w, h, light) => {
      c.fillStyle = css(shade(0x5b3f24, light));
      c.fillRect(0, 0, w, h);
      // Khātam inlay: a row of tiny ivory and brass lozenges.
      for (let u = 2; u < w - 1; u += 3) {
        c.fillStyle = css(shade(u % 2 ? 0xe8dcc0 : 0xc9a55c, light), 0.9);
        c.fillRect(u, h / 2 - 0.5, 1.5, 1.5);
      }
    });
    onRoof(ctx, stand, (w, d) => {
      ctx.fillStyle = css(shade(0x7a5636, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
      ctx.strokeStyle = css(0xc9a55c, 0.7);
      ctx.lineWidth = 0.6;
      ctx.strokeRect(1.5, 1.5, w - 3, d - 3);
    });
    outlineBox(ctx, stand);
    // Basin.
    const bx = 16;
    const by = 29;
    metalEllipse(ctx, bx, by, 8.5, 3.8, 0xb8bcc4);
    ctx.fillStyle = css(0x5a7a96);
    ctx.beginPath();
    ctx.ellipse(bx, by - 0.6, 6, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(220,235,245,0.5)';
    ctx.fillRect(bx - 3, by - 1.6, 3, 0.7);
    // Ewer: pear body, tall neck, swan spout and looped handle.
    const ex = 31;
    const ey = 30;
    ctx.strokeStyle = css(0x9aa0aa);
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(ex - 4, ey - 7);
    ctx.quadraticCurveTo(ex - 9, ey - 10, ex - 12, ey - 18);
    ctx.stroke();
    ctx.strokeStyle = css(0x7e848e);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ex + 2, ey - 20);
    ctx.bezierCurveTo(ex + 10, ey - 20, ex + 10, ey - 8, ex + 4, ey - 6);
    ctx.stroke();
    const body = ctx.createRadialGradient(ex - 2.5, ey - 9, 0.5, ex, ey - 6, 9);
    body.addColorStop(0, '#f4f6fa');
    body.addColorStop(0.5, '#c4c9d2');
    body.addColorStop(1, '#6e737c');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(ex - 1.5, ey - 19);
    ctx.bezierCurveTo(ex - 2, ey - 13, ex - 7, ey - 11, ex - 6.5, ey - 5);
    ctx.bezierCurveTo(ex - 6, ey, ex + 6, ey, ex + 6.5, ey - 5);
    ctx.bezierCurveTo(ex + 7, ey - 11, ex + 2, ey - 13, ex + 1.5, ey - 19);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,30,40,0.6)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    // Lid and a band of chased gold.
    metalEllipse(ctx, ex, ey - 19.5, 2.6, 1.1, 0xcfd3da);
    ctx.fillStyle = css(0xd8b04a);
    ctx.fillRect(ex - 6.2, ey - 6.5, 12.4, 1.4);
    ctx.fillStyle = css(0xd8b04a);
    ctx.beginPath();
    ctx.arc(ex, ey - 21.5, 1, 0, Math.PI * 2);
    ctx.fill();
  });
}

function metalEllipse(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, color: number): void {
  const g = ctx.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
  g.addColorStop(0, css(shade(color, 1.25)));
  g.addColorStop(1, css(shade(color, 0.6)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,30,40,0.55)';
  ctx.lineWidth = 0.6;
  ctx.stroke();
}

/** A raised takht spread with a carpet, bolsters against the back, and one cushion left square. */
export function paintSeatOfHonour(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 64, 54, ctx => {
    const dais: IsoBox = { x: 32, y: 50, w: 27, d: 27, h: 6 };
    groundShadow(ctx, dais, 4, 0.24);
    walls(ctx, dais, (c, w, h, light) => {
      c.fillStyle = css(shade(0x5e4b36, light));
      c.fillRect(0, 0, w, h);
      c.fillStyle = css(shade(0x7a1f2a, light));
      c.fillRect(0, 0, w, 2.5);
      c.fillStyle = css(shade(0xe8dcc0, light), 0.8);
      for (let u = 1; u < w; u += 2) c.fillRect(u, 2.5, 0.8, 1.5);
    });
    onRoof(ctx, dais, (w, d) => {
      ctx.fillStyle = css(shade(0x1f2f5a, LIGHT.roof));
      ctx.fillRect(0, 0, w, d);
      ctx.fillStyle = css(shade(0x7a1f2a, LIGHT.roof));
      ctx.fillRect(3, 3, w - 6, d - 6);
      ctx.strokeStyle = css(0xd8b870, 0.85);
      ctx.lineWidth = 0.6;
      ctx.strokeRect(2, 2, w - 4, d - 4);
      ctx.strokeRect(4.5, 4.5, w - 9, d - 9);
      const rand = rng(91);
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = rand() < 0.5 ? 'rgba(216,184,112,0.6)' : 'rgba(160,60,70,0.6)';
        ctx.fillRect(5 + rand() * (w - 10), 5 + rand() * (d - 10), 1, 1);
      }
    });
    outlineBox(ctx, dais);
    // Bolsters along the two back edges.
    const bolster = (a: { x: number; y: number }, b: { x: number; y: number }) => {
      ctx.lineCap = 'round';
      ctx.strokeStyle = css(shade(0x315f68, 0.6));
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - 3);
      ctx.lineTo(b.x, b.y - 3);
      ctx.stroke();
      ctx.strokeStyle = css(0x315f68);
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(a.x - 0.5, a.y - 4);
      ctx.lineTo(b.x - 0.5, b.y - 4);
      ctx.stroke();
      ctx.strokeStyle = css(0xd8b04a, 0.8);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(a.x - 1, a.y - 5.5);
      ctx.lineTo(b.x - 1, b.y - 5.5);
      ctx.stroke();
    };
    bolster(roofPoint(dais, 3, 3), roofPoint(dais, 3, dais.d - 3));
    bolster(roofPoint(dais, 3, dais.d - 3), roofPoint(dais, dais.w - 3, dais.d - 3));
    // The cushion, square and unpressed.
    const cushion = subBox(dais, 9, 19, 8, 18, 3, dais.h);
    walls(ctx, cushion, (c, w, h, light) => {
      c.fillStyle = css(shade(0xc9a85a, light));
      c.fillRect(0, 0, w, h);
    });
    flatTop(ctx, cushion, 0xd8c07a);
    const top = [0, 1, 2, 3].map(i => roofPoint(cushion, i === 1 || i === 2 ? cushion.w : 0, i >= 2 ? cushion.d : 0));
    ctx.fillStyle = css(0xe8d090);
    polygon(ctx, top);
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(255,250,220,0.25)';
    ctx.fillRect(top[0]!.x, top[0]!.y - 6, 10, 10);
    ctx.restore();
    outlineBox(ctx, cushion);
    for (const [p, q] of [[0, 0], [cushion.w, 0], [cushion.w, cushion.d]] as const) {
      const at = roofPoint(cushion, p, q);
      ctx.fillStyle = css(0xd8b04a);
      ctx.fillRect(at.x - 0.6, at.y, 1.2, 2.5);
    }
  });
}
