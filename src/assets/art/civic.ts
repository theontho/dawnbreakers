import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { brick, glazedTiles, stone } from './materials';
import { archPath, band, cylinder, cylinderBand, dome, doorway, flatTop, merlons, parapetRoof, walls } from './ornaments';

/** Mosques, city gates, wells and lanterns: the shared civic vocabulary. */

const TURQUOISE = 0x2e8c96;
const LAPIS = 0x24477a;
const CREAM = 0xe8d9a8;

/** Courtyard mosque: brick precinct, tiled portal, turquoise dome and a minaret. */
export function paintMosque(scene: Phaser.Scene, key: string, cellsW = 2, cellsD = 2): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 30, 92);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, box, 8);
    // Minaret behind the precinct wall at the back corner.
    const foot = groundPoint(box, 10, box.d - 10);
    minaret(ctx, foot.x, foot.y, 6, 104);
    walls(ctx, box, (c, w, h, light) => brick(c, w, h, { base: 0xc8a26e, light, seed: 5 }), {
      left: (c, w, _h, l) => band(c, w, 5, 4, TURQUOISE, l),
      right: (c, w, h, l) => {
        band(c, w, 5, 4, TURQUOISE, l);
        for (let u = 10; u < w - 8; u += 16) {
          archPath(c, u, h - 4, 9, 16);
          c.fillStyle = css(shade(0x2a1a10, l + 0.2));
          c.fill();
        }
      },
    });
    parapetRoof(ctx, box, 0xc8a26e, { base: 0xb09070, light: 1, seed: 6 }, 3, 4);
    outlineBox(ctx, box);
    const centre = roofPoint(box, box.w / 2 + 2, box.d / 2 + 2);
    dome(ctx, centre.x, centre.y + 4, Math.min(box.w, box.d) * 0.36, {
      color: TURQUOISE, drum: 11, drumColor: 0xc8a26e, bulb: 1.25, ribs: true, pattern: CREAM, finial: true,
    });
    // The pīshṭāq: a tall tiled portal standing proud of the left wall.
    const pw = Math.min(30, box.w * 0.5);
    const at = groundPoint(box, box.w * 0.5 + pw / 2, -5);
    const portal: IsoBox = { x: at.x, y: at.y, w: pw, d: 5, h: 52 };
    walls(ctx, portal, (c, w, h, light) => brick(c, w, h, { base: 0xc8a26e, light, seed: 9 }), {
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
        doorway(c, w / 2 - 7, h, 14, h * 0.72, { frame: TURQUOISE, door: 0x4a2a14, light: l });
        // Muqarnas hint: stacked small arches in the hood.
        c.fillStyle = css(shade(CREAM, l * 0.6), 0.5);
        for (let i = 0; i < 3; i++) c.fillRect(w / 2 - 4 + i * 3, h * 0.36, 1.5, 3);
      },
    });
    flatTop(ctx, portal, 0xc8a26e);
    merlons(ctx, portal, 0xc8a26e, 3, 3);
    outlineBox(ctx, portal);
  });
}

function minaret(ctx: Ctx, x: number, y: number, r: number, h: number): void {
  cylinder(ctx, x, y, r, h, 0xc8a26e, false);
  for (const t of [0.35, 0.6, 0.82]) cylinderBand(ctx, x, y - h * t, r, 2.5, TURQUOISE);
  // Balcony and lantern.
  cylinder(ctx, x, y - h + 2, r + 2.5, 3, shade(0xc8a26e, 0.9), true);
  cylinder(ctx, x, y - h - 1, r - 1, 9, TURQUOISE, false);
  dome(ctx, x, y - h - 10, r - 1, { color: TURQUOISE, bulb: 1.1, finial: true });
}

/** City gate: an arched passage between two round bastions. */
export function paintGate(scene: Phaser.Scene, key: string): void {
  const { box, texW, texH } = footprintBox(1, 1, 50, 24);
  paintTexture(scene, key, texW + 16, texH, ctx => {
    ctx.translate(8, 0);
    groundShadow(ctx, box, 6);
    const left = groundPoint(box, 0, 0);
    bastion(ctx, left.x + 2, left.y, 8, 58);
    walls(ctx, box, (c, w, h, light) => stone(c, w, h, { base: 0xa08868, light, seed: 31 }), {
      left: (c, w, h, l) => {
        c.save();
        c.beginPath();
        c.rect(w / 2 - 12, 4, 24, h * 0.32);
        c.clip();
        glazedTiles(c, w, h, { base: TURQUOISE, light: l, seed: 2 }, 5);
        c.restore();
        doorway(c, w / 2 - 9, h, 18, h * 0.6, { frame: 0xc8a26e, light: l, open: true });
      },
    });
    flatTop(ctx, box, 0xa08868);
    merlons(ctx, box, 0xa08868, 4, 3);
    outlineBox(ctx, box);
    bastion(ctx, box.x - 1, box.y, 8, 54);
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
