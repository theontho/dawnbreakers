import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, onRoof, paintTexture, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { plinth, wornPlaster } from './facade';
import { LIGHT } from './ornaments';
import { post, snowEdge, subBox } from './structureParts';
import { doorOf, threshold, windowOf, type TownHouseStyle } from './town/houseKit';
import { STONE, townBlock, townDoor, townWindow } from './town/townKit';

/**
 * Village houses of the Ādharbāyjān mountains at true scale (5 x 4 cells):
 * rubble stone to the sills and mud plaster above, poplar beams through the
 * walls, and flat earth roofs heaped with snow, rolled after every fall. A
 * thread of smoke rises from the roof hole of the room with the stove; wood
 * and dung cakes are stacked against the walls for the long winter. One is
 * built into the slope with its living room over the stable, one has a
 * timber porch where the family sits on the brief bright days.
 */

type HouseDraw = (ctx: Ctx, box: IsoBox, s: TownHouseStyle) => void;

interface MountainHouse {
  draw: HouseDraw;
  top: number;
  style: TownHouseStyle;
}

const ROOF_SNOW = 0xe8eef2;

/** Stone to the sills, mud plaster above, beam ends under a snow-laden roof edge. */
function lowerStone(c: Ctx, w: number, h: number, l: number, seed: number): void {
  plinth(c, w, h, 34, shade(STONE, 0.85), l, seed);
}

/** A flat earth roof under snow: a soft blanket, a trodden path to the roof hole, the stone roller. */
function snowRoof(ctx: Ctx, b: IsoBox, seed: number, roller = true): void {
  const rand = rng(seed);
  onRoof(ctx, b, (w, d) => {
    ctx.fillStyle = css(shade(ROOF_SNOW, LIGHT.roof));
    ctx.fillRect(-2, -2, w + 4, d + 4);
    ctx.fillStyle = 'rgba(150,170,190,0.16)';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(rand() * w, rand() * d, 10 + rand() * 12, 4 + rand() * 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(120,112,100,0.2)';
    ctx.fillRect(w * 0.45, d * 0.2, 6, d * 0.55);
  });
  if (roller) {
    // The stone roller that packs the roof after snow and rain.
    const at = groundPoint(b, b.w * 0.75, b.d * 0.7);
    const y = at.y - b.h;
    ctx.fillStyle = css(0x8a8478);
    ctx.beginPath();
    ctx.ellipse(at.x, y - 4, 10, 5, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x5e5a52);
    ctx.beginPath();
    ctx.ellipse(at.x + 8, y - 8, 4, 5, -0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The roof hole's chimney pot and a thread of smoke leaning with the wind. */
function smoke(ctx: Ctx, b: IsoBox, p: number, q: number, seed: number): void {
  const rand = rng(seed);
  const at = groundPoint(b, p, q);
  const y = at.y - b.h;
  ctx.fillStyle = css(0x6a5a48);
  ctx.fillRect(at.x - 5, y - 14, 10, 14);
  ctx.fillStyle = css(0x2a2018);
  ctx.beginPath();
  ctx.ellipse(at.x, y - 14, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(ROOF_SNOW);
  ctx.fillRect(at.x - 6, y - 16, 3, 2);
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    ctx.fillStyle = `rgba(190,196,204,${0.4 * (1 - t)})`;
    ctx.beginPath();
    ctx.arc(at.x + t * 26 + (rand() - 0.5) * 4, y - 20 - t * 46, 4 + t * 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Split logs stacked against a wall, snow on top. */
function woodpile(ctx: Ctx, box: IsoBox, p: number, q: number, n = 5): void {
  const at = groundPoint(box, p, q);
  for (let row = 0; row < 4; row++) {
    for (let i = 0; i < n - row; i++) {
      const x = at.x + i * 7 + row * 3.5;
      const y = at.y - 3 - row * 5.6 - i * 3.5;
      ctx.fillStyle = css(0x5a3c22);
      ctx.beginPath();
      ctx.ellipse(x, y, 3.2, 2.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0xc9a46e);
      ctx.beginPath();
      ctx.ellipse(x - 0.6, y, 2, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.fillStyle = 'rgba(240,244,247,0.9)';
  ctx.beginPath();
  ctx.ellipse(at.x + n * 3, at.y - 24 - n * 1.5, n * 3, 3, -0.45, 0, Math.PI * 2);
  ctx.fill();
}

/** Snow drifted against the foot of the two front faces. */
function banks(ctx: Ctx, box: IsoBox, seed: number): void {
  const rand = rng(seed);
  ctx.fillStyle = 'rgba(232,238,243,0.9)';
  for (let t = 10; t < box.w - 10; t += 18 + rand() * 14) {
    const at = groundPoint(box, t, 2);
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, 10 + rand() * 8, 3.5, 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let t = 10; t < box.d - 10; t += 18 + rand() * 14) {
    const at = groundPoint(box, box.w - 2, t);
    ctx.beginPath();
    ctx.ellipse(at.x, at.y, 10 + rand() * 8, 3.5, -0.45, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** One storey: the door and a lit window under the roof edge, wood stacked at the side. */
const stoneHouse: HouseDraw = (ctx, box, s) => {
  const main = subBox(box, 0, box.w - 8, 16, box.d, 84);
  const doorU = 96;
  townBlock(ctx, main, {
    wall: s.wall, seed: s.seed, material: 'mud', roof: 'flat', beams: 10,
    left: (c, w, h, l) => {
      lowerStone(c, w, h, l, s.seed + 1);
      townDoor(c, doorU, h, doorOf(s, l));
      townWindow(c, 40, h, 50, windowOf(s, l, true, false));
      wornPlaster(c, w - 30, h * 0.4, 18, 12, s.wall, l, s.seed + 2);
      snowEdge(c, w, 7, s.seed + 3, l);
    },
    right: (c, w, h, l) => {
      lowerStone(c, w, h, l, s.seed + 4);
      townWindow(c, w * 0.6, h, 52, windowOf(s, l, false, false));
      snowEdge(c, w, 7, s.seed + 5, l);
    },
  });
  snowRoof(ctx, main, s.seed + 6);
  smoke(ctx, main, main.w * 0.3, main.d * 0.5, s.seed + 7);
  threshold(ctx, box, doorU, 16, s);
  woodpile(ctx, box, box.w - 6, 40);
  banks(ctx, box, s.seed + 8);
};

/** Built into the slope: the living rooms over the stable, a wide stable door below. */
const steppedHouse: HouseDraw = (ctx, box, s) => {
  const back = subBox(box, 0, box.w - 6, 58, box.d, 150);
  townBlock(ctx, back, {
    wall: s.wall, seed: s.seed, material: 'mud', roof: 'flat', beams: 10,
    left: (c, w, h, l) => {
      lowerStone(c, w, h, l, s.seed + 1);
      townWindow(c, w * 0.3, h, 104, windowOf(s, l, true, false));
      townWindow(c, w * 0.66, h, 104, windowOf(s, l, false, false));
      snowEdge(c, w, 7, s.seed + 2, l);
    },
    right: (c, w, h, l) => {
      lowerStone(c, w, h, l, s.seed + 3);
      townWindow(c, w * 0.5, h, 104, windowOf(s, l, false, false));
      snowEdge(c, w, 7, s.seed + 4, l);
    },
  });
  snowRoof(ctx, back, s.seed + 5);
  smoke(ctx, back, back.w * 0.4, back.d * 0.4, s.seed + 6);
  const front = subBox(box, 8, box.w - 6, 8, 58, 74);
  const doorU = 70;
  townBlock(ctx, front, {
    wall: shade(s.wall, 0.92), seed: s.seed + 7, material: 'mud', roof: 'flat', beams: 10,
    left: (c, w, h, l) => {
      lowerStone(c, w, h, l, s.seed + 8);
      // The stable's wide plank door, and the house door beside it.
      c.fillStyle = css(shade(0x3a2a1a, l));
      c.fillRect(20, h - 50, 34, 50);
      c.strokeStyle = css(shade(0x6a4a2c, l));
      c.lineWidth = 1;
      for (let u = 24; u < 54; u += 6) c.strokeRect(u, h - 49, 0.5, 48);
      c.strokeRect(20, h - 50, 34, 50);
      townDoor(c, doorU + 30, h, doorOf(s, l));
      snowEdge(c, w, 7, s.seed + 9, l);
    },
    right: (c, w, _h, l) => snowEdge(c, w, 7, s.seed + 10, l),
  });
  snowRoof(ctx, front, s.seed + 11, false);
  threshold(ctx, box, 8 + doorU + 30, 8, s);
  woodpile(ctx, box, 12, 4, 4);
  banks(ctx, box, s.seed + 12);
};

/** A timber porch along the front on posts, where the family sits on the brief bright days. */
const porchHouse: HouseDraw = (ctx, box, s) => {
  const main = subBox(box, 0, box.w - 6, 40, box.d, 88);
  const doorU = 84;
  townBlock(ctx, main, {
    wall: s.wall, seed: s.seed, material: 'mud', roof: 'flat', beams: 10,
    left: (c, w, h, l) => {
      lowerStone(c, w, h, l, s.seed + 1);
      townDoor(c, doorU, h, doorOf(s, l));
      townWindow(c, 34, h, 50, windowOf(s, l, true, false));
      townWindow(c, w - 30, h, 50, windowOf(s, l, false, false));
      snowEdge(c, w, 7, s.seed + 2, l);
    },
    right: (c, w, h, l) => {
      lowerStone(c, w, h, l, s.seed + 3);
      wornPlaster(c, w * 0.4, h * 0.45, 18, 12, s.wall, l, s.seed + 4);
      snowEdge(c, w, 7, s.seed + 5, l);
    },
  });
  snowRoof(ctx, main, s.seed + 6);
  smoke(ctx, main, main.w * 0.6, main.d * 0.6, s.seed + 7);
  // The porch: four poplar posts carrying a thin earth roof under snow, a rug-covered bench.
  const porch = subBox(box, 6, box.w - 12, 8, 40, 70);
  const posts = [10, porch.w * 0.36, porch.w * 0.68, porch.w - 4];
  for (const p of posts) {
    const at = groundPoint(porch, p, 4);
    post(ctx, at.x, at.y, porch.h, 5, 0x6a4a2c);
  }
  const slab = subBox(porch, 0, porch.w, 0, porch.d, 8, porch.h);
  townBlock(ctx, slab, { wall: 0x7a5a38, seed: s.seed + 8, material: 'mud', roof: 'flat', plinth: false, shadow: false,
    left: (c, w, _h, l) => snowEdge(c, w, 5, s.seed + 9, l),
    right: (c, w, _h, l) => snowEdge(c, w, 5, s.seed + 10, l),
  });
  snowRoof(ctx, slab, s.seed + 11, false);
  woodpile(ctx, box, box.w - 4, 54, 4);
  banks(ctx, box, s.seed + 12);
};

export const MOUNTAIN_HOUSES: readonly MountainHouse[] = [
  { draw: stoneHouse, top: 150, style: { wall: 0x9a8064, door: 0x4a3420, frame: 0x6a4a2c, seed: 611, shutters: 0x4a3a2a, lit: true } },
  { draw: steppedHouse, top: 200, style: { wall: 0xa88a68, door: 0x3f2f22, frame: 0x6a4a2c, seed: 623, lit: true } },
  { draw: porchHouse, top: 156, style: { wall: 0x8f7658, door: 0x5b3a20, frame: 0x6a4a2c, seed: 641, lit: true } },
];

/** Paints every variant of the mountain house: `key`, `key~1`, `key~2`. */
export function paintMountainHouses(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  MOUNTAIN_HOUSES.forEach((v, i) => {
    const { box, texW, texH } = footprintBox(cellsW, cellsD, v.top, 8);
    paintTexture(scene, i === 0 ? key : `${key}~${i}`, texW, texH, ctx => v.draw(ctx, box, v.style));
  });
}
