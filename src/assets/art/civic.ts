import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { iwanNiche, plinth } from './facade';
import { brick, glazedTiles, stone } from './materials';
import { archPath, band, cylinder, cylinderBand, dome, doorway, flatTop, merlons, parapetRoof, walls } from './ornaments';
import { waterJar } from './streetLife';
import { subBox } from './structureParts';

/** Mosques, city gates, wells and lanterns: the shared civic vocabulary. */

const TURQUOISE = 0x2e8c96;
const LAPIS = 0x24477a;
const CREAM = 0xe8d9a8;
const MOSQUE_BRICK = 0xc8a26e;

/**
 * Courtyard mosque: a brick precinct with blind arcades, the domed prayer
 * hall rising behind it, a minaret at the back corner and a tall tiled
 * portal (pīshṭāq) whose iwan shelters a person-sized door.
 */
export function paintMosque(scene: Phaser.Scene, key: string, cellsW = 2, cellsD = 2): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 44, 104);
  paintTexture(scene, key, texW, texH, ctx => {
    const precinct = subBox(box, 0, box.w - 3, 6, box.d, 44);
    groundShadow(ctx, precinct, 8);
    const foot = groundPoint(box, 9, box.d - 9);
    minaret(ctx, foot.x, foot.y, 6, 122);
    walls(ctx, precinct, (c, w, h, light) => brick(c, w, h, { base: MOSQUE_BRICK, light, seed: 5 }), {
      left: (c, w, h, l) => blindArcade(c, w, h, l),
      right: (c, w, h, l) => blindArcade(c, w, h, l),
    });
    parapetRoof(ctx, precinct, MOSQUE_BRICK, { base: 0xb09070, light: 1, seed: 6 }, 3, 4);
    outlineBox(ctx, precinct);
    // The prayer hall shows above the precinct: a drum of brick and the dome.
    const hall = subBox(box, box.w - 40, box.w - 6, box.d - 36, box.d - 3, 16, 44);
    walls(ctx, hall, (c, w, h, light) => brick(c, w, h, { base: MOSQUE_BRICK, light, seed: 7 }), {
      left: (c, w, _h, l) => band(c, w, 2, 3, TURQUOISE, l),
      right: (c, w, _h, l) => band(c, w, 2, 3, TURQUOISE, l),
    });
    flatTop(ctx, hall, MOSQUE_BRICK);
    outlineBox(ctx, hall);
    const centre = roofPoint(hall, hall.w / 2, hall.d / 2);
    dome(ctx, centre.x, centre.y + 2, 18, {
      color: TURQUOISE, drum: 10, drumColor: MOSQUE_BRICK, bulb: 1.25, ribs: true, pattern: CREAM, finial: true,
    });
    portal(ctx, box, precinct);
    const jar = groundPoint(box, box.w - 5, 3);
    waterJar(ctx, jar.x, jar.y, 4, 0x8a6a4a);
  });
}

/** Blind arches in a row along an outer wall, over a stone plinth and under a tile band. */
function blindArcade(c: Ctx, w: number, h: number, l: number): void {
  plinth(c, w, h, 5, 0x9a8a70, l, 8);
  band(c, w, 5, 3, TURQUOISE, l);
  for (let u = 6; u + 10 < w; u += 15) {
    archPath(c, u, h - 9, 10, 22);
    c.fillStyle = css(shade(0x6a4a2c, l), 0.75);
    c.fill();
  }
}

/** The pīshṭāq: half as wide as it is tall, standing proud of the precinct's left wall. */
function portal(ctx: Ctx, box: IsoBox, precinct: IsoBox): void {
  const pw = 30;
  const at = groundPoint(box, precinct.w * 0.48 + pw / 2, 1);
  const p: IsoBox = { x: at.x, y: at.y, w: pw, d: 6, h: 72 };
  walls(ctx, p, (c, w, h, light) => brick(c, w, h, { base: MOSQUE_BRICK, light, seed: 9 }), {
    left: (c, w, h, l) => {
      c.save();
      c.beginPath();
      c.rect(2, 3, w - 4, h - 3);
      c.clip();
      glazedTiles(c, w, h, { base: LAPIS, light: l, seed: 1 }, 5);
      c.restore();
      c.strokeStyle = css(shade(CREAM, l), 0.9);
      c.lineWidth = 1;
      c.strokeRect(3.5, 4.5, w - 7, h - 5);
      iwanNiche(c, w / 2, h, 18, 50, { frame: TURQUOISE, door: 0x4a2a14, light: l, surround: TURQUOISE, panel: LAPIS, wall: MOSQUE_BRICK, seed: 4 });
      // Muqarnas: tiers of small cells in the head of the vault.
      c.fillStyle = css(shade(CREAM, l * 0.7), 0.55);
      for (let i = 0; i < 3; i++) for (let k = 0; k <= i; k++) c.fillRect(w / 2 - i * 2 + k * 4 - 1, h - 46 + i * 3, 2, 2);
    },
  });
  flatTop(ctx, p, MOSQUE_BRICK);
  merlons(ctx, p, MOSQUE_BRICK, 3, 3);
  outlineBox(ctx, p);
}

function minaret(ctx: Ctx, x: number, y: number, r: number, h: number): void {
  cylinder(ctx, x, y, r, h, MOSQUE_BRICK, false);
  for (const t of [0.4, 0.62, 0.82]) cylinderBand(ctx, x, y - h * t, r, 2.5, TURQUOISE);
  // Balcony and lantern.
  cylinder(ctx, x, y - h + 2, r + 2.5, 3, shade(MOSQUE_BRICK, 0.9), true);
  cylinder(ctx, x, y - h - 1, r - 1, 9, TURQUOISE, false);
  dome(ctx, x, y - h - 10, r - 1, { color: TURQUOISE, bulb: 1.1, finial: true });
}

/** City gate: a tall tiled frame round an arched passage, between two round bastions. */
export function paintGate(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 74, 22);
  paintTexture(scene, key, texW + 16, texH, ctx => {
    ctx.translate(8, 0);
    groundShadow(ctx, box, 6);
    const left = groundPoint(box, 0, 0);
    bastion(ctx, left.x + 2, left.y, 8, 80);
    walls(ctx, box, (c, w, h, light) => stone(c, w, h, { base: 0xa08868, light, seed: 31 }), {
      left: (c, w, h, l) => {
        c.save();
        c.beginPath();
        c.rect(w / 2 - 12, 6, 24, h - 6);
        c.clip();
        glazedTiles(c, w, h, { base: TURQUOISE, light: l, seed: 2 }, 5);
        c.restore();
        c.strokeStyle = css(shade(CREAM, l), 0.85);
        c.lineWidth = 1;
        c.strokeRect(w / 2 - 11.5, 6.5, 23, h - 6.5);
        doorway(c, w / 2 - 9, h, 18, 46, { frame: MOSQUE_BRICK, light: l, open: true });
      },
    });
    flatTop(ctx, box, 0xa08868);
    merlons(ctx, box, 0xa08868, 4, 3);
    outlineBox(ctx, box);
    bastion(ctx, box.x - 1, box.y, 8, 76);
  });
}

function bastion(ctx: Ctx, x: number, y: number, r: number, h: number): void {
  cylinder(ctx, x, y, r, h, 0xa08868, true);
  ctx.save();
  ctx.fillStyle = 'rgba(40,24,10,0.25)';
  for (let k = 8; k < h; k += 7) ctx.fillRect(x - r, y - k, r * 2, 0.8);
  ctx.restore();
  for (let a = -0.8; a <= 0.8; a += 0.4) {
    const mx = x + Math.sin(a) * r * 0.9;
    ctx.fillStyle = css(shade(0xa08868, 1.1 - a * 0.3));
    ctx.fillRect(mx - 1.5, y - h - 4, 3, 4);
  }
}

/** Stone well-head with a timber windlass and a bucket on its rope. */
export function paintWell(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 56, 64, ctx => {
    const cx = 28;
    const base = 56;
    ctx.fillStyle = 'rgba(10,6,3,0.25)';
    ctx.beginPath();
    ctx.ellipse(cx + 3, base + 2, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    cylinder(ctx, cx, base, 17, 11, 0x8f8068, false);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx, base - 11, 17, 7.6, 0, 0, Math.PI * 2);
    ctx.clip();
    stone(ctx, 56, 64, { base: 0x9a8a70, light: 1.15, seed: 3 }, 4);
    ctx.restore();
    ctx.fillStyle = css(0x0f1a24);
    ctx.beginPath();
    ctx.ellipse(cx, base - 11, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(140,180,200,0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 3, base - 12, 5, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Windlass frame.
    ctx.strokeStyle = css(0x4a2e18);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - 15, base - 10);
    ctx.lineTo(cx - 12, base - 40);
    ctx.moveTo(cx + 15, base - 12);
    ctx.lineTo(cx + 12, base - 40);
    ctx.stroke();
    ctx.lineWidth = 3;
    ctx.strokeStyle = css(0x6a4428);
    ctx.beginPath();
    ctx.moveTo(cx - 14, base - 38);
    ctx.lineTo(cx + 14, base - 38);
    ctx.stroke();
    ctx.strokeStyle = css(0xb8a070);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(cx + 2, base - 37);
    ctx.lineTo(cx + 2, base - 24);
    ctx.stroke();
    ctx.fillStyle = css(0x5a3a1e);
    ctx.fillRect(cx - 1, base - 24, 6, 5);
    ctx.fillStyle = css(0x8a6038);
    ctx.fillRect(cx - 1, base - 24, 6, 1);
  });
}

/** Brass lantern on a turned wooden post. */
export function paintLamp(scene: Phaser.Scene, key: string): void {
  paintTexture(scene, key, 32, 60, ctx => {
    ctx.fillStyle = 'rgba(10,6,3,0.25)';
    ctx.beginPath();
    ctx.ellipse(17, 56, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    const post = ctx.createLinearGradient(13, 0, 19, 0);
    post.addColorStop(0, '#6a4428');
    post.addColorStop(1, '#2e1c0e');
    ctx.fillStyle = post;
    ctx.fillRect(14, 18, 4, 38);
    ctx.fillRect(12, 53, 8, 3);
    ctx.fillStyle = '#2e1c0e';
    ctx.fillRect(10, 16, 12, 2);
    // Lantern body: faceted glass with a pierced brass cap.
    const glow = ctx.createRadialGradient(16, 9, 1, 16, 9, 12);
    glow.addColorStop(0, 'rgba(255,226,150,0.85)');
    glow.addColorStop(1, 'rgba(255,190,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(2, 0, 28, 22);
    ctx.fillStyle = '#ffd98a';
    ctx.beginPath();
    ctx.moveTo(12, 6);
    ctx.lineTo(20, 6);
    ctx.lineTo(21, 13);
    ctx.lineTo(16, 16);
    ctx.lineTo(11, 13);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#8a6420';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(16, 6);
    ctx.lineTo(16, 15);
    ctx.stroke();
    ctx.fillStyle = '#b08a3a';
    ctx.beginPath();
    ctx.moveTo(11, 6);
    ctx.lineTo(16, 1);
    ctx.lineTo(21, 6);
    ctx.closePath();
    ctx.fill();
  });
}
