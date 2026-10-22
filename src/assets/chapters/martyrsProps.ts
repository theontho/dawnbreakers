import { css, mix, paintTexture, polygon, rng, shade, type Ctx } from '../art/canvasKit';
import { ellipseShadow } from '../art/structureParts';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Small things of the Sabzih-Maydán in Ṭihrán, February 1850, at true
 * scale (a person is 40 px; a basket is knee-high, about 12 px): the
 * green-sellers' baskets that give the square its name, an old man's tray
 * of sweets, and a patch of paving by the palace wall that has been
 * scrubbed and swept. The executions are never shown; the swept stones are
 * the threshold the chapter's end is told through.
 */

const WICKER = 0x9a7a48;
const COPPER = 0xb0703a;

/** A round wicker basket, `r` px across, heaped with whatever `fill` paints. */
function basket(c: Ctx, x: number, y: number, r: number, h: number, seed: number, fill: (cx: number, cy: number) => void): void {
  ellipseShadow(c, x + 2, y + 1, r + 2, r * 0.45, 0.24);
  // The body: a tapering drum of woven withies.
  c.fillStyle = css(shade(WICKER, 0.78));
  c.beginPath();
  c.moveTo(x - r, y - h);
  c.lineTo(x - r * 0.82, y);
  c.quadraticCurveTo(x, y + r * 0.42, x + r * 0.82, y);
  c.lineTo(x + r, y - h);
  c.closePath();
  c.fill();
  const rand = rng(seed);
  c.strokeStyle = css(shade(WICKER, 0.55), 0.7);
  c.lineWidth = 0.6;
  for (let v = y - h + 2; v < y; v += 2.2) {
    c.beginPath();
    c.moveTo(x - r * 0.95 + rand() * 0.6, v);
    c.quadraticCurveTo(x, v + r * 0.4, x + r * 0.95, v);
    c.stroke();
  }
  // The rim, lit from the upper left, and what is heaped inside.
  c.fillStyle = css(shade(WICKER, 1.15));
  c.beginPath();
  c.ellipse(x, y - h, r, r * 0.42, 0, 0, Math.PI * 2);
  c.fill();
  fill(x, y - h - 1);
}

/** Winter greens heaped above a rim: dark leaves, lighter ribs. */
function greens(c: Ctx, cx: number, cy: number, r: number, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < 26; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * r * 0.8;
    const x = cx + Math.cos(a) * d;
    const y = cy + Math.sin(a) * d * 0.42 - rand() * 3;
    c.fillStyle = css(shade(0x3f6a2e, 0.65 + rand() * 0.6));
    c.beginPath();
    c.ellipse(x, y, 2.4 + rand() * 1.6, 1.2 + rand() * 0.8, (rand() - 0.5) * 1.4, 0, Math.PI * 2);
    c.fill();
  }
}

/** Red winter radishes in a heap. */
function radishes(c: Ctx, cx: number, cy: number, r: number, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < 12; i++) {
    const x = cx + (rand() - 0.5) * r * 1.4;
    const y = cy + (rand() - 0.5) * r * 0.5 - rand() * 2;
    c.fillStyle = css(shade(0xa8283a, 0.7 + rand() * 0.5));
    c.beginPath();
    c.arc(x, y, 1.5 + rand() * 0.6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = css(0x5a8a3a, 0.9);
    c.fillRect(x - 0.3, y - 3, 0.7, 2);
  }
}

/** The green-sellers' baskets: two of greens and one of radishes, set out on a sacking cloth. */
function paintGreensBaskets(c: Ctx): void {
  c.fillStyle = css(0x8a7a5a, 0.55);
  polygon(c, [{ x: 12, y: 38 }, { x: 34, y: 28 }, { x: 56, y: 38 }, { x: 34, y: 48 }]);
  c.fill();
  basket(c, 24, 40, 8, 8, 1601, (x, y) => greens(c, x, y, 8, 1602));
  basket(c, 44, 39, 7, 7, 1603, (x, y) => radishes(c, x, y, 7, 1604));
  basket(c, 34, 46, 8, 9, 1605, (x, y) => greens(c, x, y, 8, 1606));
}

/** An old man's tray of sweets on a low trestle: sugared almonds and amber rock-sugar. */
function paintSweetsTray(c: Ctx): void {
  ellipseShadow(c, 34, 44, 20, 7, 0.24);
  // The trestle's legs, crossed.
  c.strokeStyle = css(shade(0x5a3a20, 0.8));
  c.lineWidth = 1.6;
  for (const [x0, x1] of [[18, 28], [28, 18], [40, 50], [50, 40]] as const) {
    c.beginPath();
    c.moveTo(x0, 30);
    c.lineTo(x1, 44);
    c.stroke();
  }
  // The copper tray, its rim catching the light.
  c.fillStyle = css(shade(COPPER, 0.7));
  c.beginPath();
  c.ellipse(34, 31, 20, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = css(shade(COPPER, 1.05));
  c.beginPath();
  c.ellipse(34, 30, 18, 7, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = css(shade(COPPER, 1.45), 0.8);
  c.lineWidth = 0.8;
  c.beginPath();
  c.ellipse(34, 30, 18, 7, 0, Math.PI * 0.95, Math.PI * 1.6);
  c.stroke();
  const rand = rng(1611);
  // Sugared almonds in a white heap on one side, rock-sugar crystals on the other.
  for (let i = 0; i < 26; i++) {
    const x = 26 + (rand() - 0.5) * 12;
    const y = 30 + (rand() - 0.5) * 5 - rand() * 2;
    c.fillStyle = css(mix(0xf4efe4, 0xe8d8c8, rand()));
    c.beginPath();
    c.ellipse(x, y, 1.4, 0.9, rand(), 0, Math.PI * 2);
    c.fill();
  }
  for (let i = 0; i < 9; i++) {
    const x = 41 + (rand() - 0.5) * 10;
    const y = 30 + (rand() - 0.5) * 4 - rand() * 2;
    c.fillStyle = css(shade(0xd8a040, 0.8 + rand() * 0.5), 0.92);
    c.beginPath();
    c.moveTo(x, y - 2);
    c.lineTo(x + 1.6, y);
    c.lineTo(x, y + 1.4);
    c.lineTo(x - 1.6, y);
    c.closePath();
    c.fill();
  }
  // A small brass scale pan resting on the rim.
  c.fillStyle = css(0xc8a050);
  c.beginPath();
  c.ellipse(48, 27, 3.2, 1.3, 0, 0, Math.PI * 2);
  c.fill();
}

/** Paving scrubbed and swept by the palace wall, still dark with water; a broom laid down, a sprig of green. */
function paintSweptStones(c: Ctx): void {
  const diamond = [{ x: 32, y: 8 }, { x: 60, y: 22 }, { x: 32, y: 36 }, { x: 4, y: 22 }];
  c.save();
  polygon(c, diamond);
  c.clip();
  const wet = c.createRadialGradient(30, 22, 2, 32, 22, 30);
  wet.addColorStop(0, 'rgba(34,36,40,0.5)');
  wet.addColorStop(0.7, 'rgba(40,40,42,0.28)');
  wet.addColorStop(1, 'rgba(40,40,42,0)');
  c.fillStyle = wet;
  c.fillRect(0, 0, 64, 40);
  // The sweep of the broom, in long arcs.
  const rand = rng(1621);
  c.strokeStyle = 'rgba(200,204,210,0.16)';
  c.lineWidth = 0.6;
  for (let i = 0; i < 16; i++) {
    const r = 6 + rand() * 20;
    const a = -0.4 + rand() * 0.8;
    c.beginPath();
    c.ellipse(32, 22, r, r / 2, 0, Math.PI + a, Math.PI + a + 0.9);
    c.stroke();
  }
  // Sky caught in a puddle.
  c.fillStyle = 'rgba(190,198,214,0.22)';
  c.beginPath();
  c.ellipse(24, 24, 7, 2.6, -0.2, 0, Math.PI * 2);
  c.fill();
  c.restore();
  // The broom, laid down along the edge: a bundle of twigs on a short handle.
  c.strokeStyle = css(shade(0x6a4a2a, 0.9));
  c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(44, 30);
  c.lineTo(56, 24);
  c.stroke();
  c.strokeStyle = css(shade(0xa88a50, 0.95));
  c.lineWidth = 0.6;
  for (let i = 0; i < 9; i++) {
    c.beginPath();
    c.moveTo(44, 30);
    c.lineTo(36 + i * 0.6, 32 + (i - 4) * 0.7);
    c.stroke();
  }
  // A sprig of winter green from the market, dropped or left.
  c.strokeStyle = css(0x3a6a2a);
  c.lineWidth = 0.8;
  c.beginPath();
  c.moveTo(30, 20);
  c.lineTo(35, 18);
  c.stroke();
  c.fillStyle = css(0x4a7a34);
  for (const [x, y] of [[31, 19], [33, 18.4], [35, 17.6], [32.5, 19.8]] as const) {
    c.beginPath();
    c.ellipse(x, y, 1.4, 0.7, -0.4, 0, Math.PI * 2);
    c.fill();
  }
}

export const MARTYRS_PROP_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'martyrs-greens-baskets': (scene, def) => paintTexture(scene, def.texture, 64, 56, paintGreensBaskets),
  'martyrs-sweets-tray': (scene, def) => paintTexture(scene, def.texture, 64, 52, paintSweetsTray),
  'martyrs-swept-stones': (scene, def) => paintTexture(scene, def.texture, 64, 40, paintSweptStones),
};
