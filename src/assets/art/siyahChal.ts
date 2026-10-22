import { css, groundShadow, onLeftWall, onRightWall, onRoof, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { edges } from './massing';
import { brick, stone } from './materials';
import { archPath, band, flatTop, LIGHT, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * The Síyáh-Chál at true scale: a disused reservoir under Ṭihrán. Its walls
 * are an arcade of low arches onto black galleries (a connected wall, so
 * runs and corners join); its vault rests on squat stone piers whose arches
 * spring outward into the dark.
 */

export const SOOT_BRICK = 0x6a5a4c;
export const DAMP_STONE = 0x5a5650;
const EDGE = 0x0b0b0a;

/** Water stains, lime bloom and a dark tide line at the foot of a damp wall. */
export function damp(c: Ctx, w: number, h: number, seed: number): void {
  const rand = rng(seed);
  for (let i = 0; i < w / 14; i++) {
    const x = rand() * w;
    const top = h * (0.1 + rand() * 0.4);
    const g = c.createLinearGradient(0, top, 0, h);
    g.addColorStop(0, 'rgba(20,24,22,0)');
    g.addColorStop(1, 'rgba(20,24,22,0.45)');
    c.fillStyle = g;
    c.fillRect(x, top, 2 + rand() * 4, h - top);
  }
  c.fillStyle = 'rgba(230,228,215,0.18)';
  for (let i = 0; i < w / 3; i++) c.fillRect(rand() * w, h * 0.55 + rand() * h * 0.35, 1.2, 1);
  const tide = c.createLinearGradient(0, h - 14, 0, h);
  tide.addColorStop(0, 'rgba(30,38,34,0)');
  tide.addColorStop(1, 'rgba(30,38,34,0.55)');
  c.fillStyle = tide;
  c.fillRect(0, h - 14, w, 14);
}

/** A square block of damp dressed stone. */
export function stonePost(ctx: Ctx, box: IsoBox, seed: number): void {
  walls(ctx, box, (c, w, h, light) => {
    stone(c, w, h, { base: DAMP_STONE, light, seed: seed + (light === 1 ? 0 : 1) }, 7);
    damp(c, w, h, seed);
  });
  flatTop(ctx, box, DAMP_STONE);
  edges(ctx, box, {}, EDGE);
}

/** An arch opening onto darkness, framed by a ring of brick voussoirs. */
function blackArch(c: Ctx, x: number, base: number, width: number, height: number, l: number): void {
  archPath(c, x - 3, base, width + 6, height + 3);
  c.fillStyle = css(shade(SOOT_BRICK, l * 1.18));
  c.fill();
  c.strokeStyle = css(shade(SOOT_BRICK, l * 0.6), 0.7);
  c.lineWidth = 0.6;
  c.stroke();
  archPath(c, x, base, width, height);
  const g = c.createLinearGradient(0, base - height, 0, base);
  g.addColorStop(0, '#050404');
  g.addColorStop(1, '#1a1612');
  c.fillStyle = g;
  c.fill();
}

/** The arcade wall stands 4.3 m to the haunch of the vault. */
export const ARCH_WALL_H = 100;
/** One low arch to each cell (about 1 m wide, 2.2 m high), on the 32 px period of a connected wall. */
const ARCH = { w: 22, h: 50 } as const;

/**
 * One face of the arcade wall (the connected `ch10-low-arch` style in
 * walls.ts): sooty brick, a low arch onto black galleries in every cell,
 * a pier between each pair with its impost band, damp at the foot.
 */
export function lowArchFace(c: Ctx, w: number, h: number, l: number): void {
  brick(c, w, h, { base: SOOT_BRICK, light: l, seed: 51 }, 4, 8);
  for (let u = 0; u <= w; u += 32) {
    c.fillStyle = css(shade(SOOT_BRICK, l * 1.1), 0.5);
    c.fillRect(u - 3, h - ARCH.h - 8, 6, ARCH.h + 8);
  }
  band(c, w, h - ARCH.h - 8, 3, shade(DAMP_STONE, 1.2), l);
  for (let u = 16; u < w + 16; u += 32) blackArch(c, u - ARCH.w / 2, h, ARCH.w, ARCH.h, l);
  damp(c, w, h, 53);
  // The haunch of the vault above, swept with soot.
  const soot = c.createLinearGradient(0, 0, 0, 22);
  soot.addColorStop(0, 'rgba(8,6,4,0.45)');
  soot.addColorStop(1, 'rgba(8,6,4,0)');
  c.fillStyle = soot;
  c.fillRect(0, 0, w, 22);
}

/**
 * The flared head of a pier: each face is cut away below by two half
 * arches springing outward, so the pier visibly carries the vault.
 */
function springer(ctx: Ctx, box: IsoBox, seed: number, reach: number): void {
  const face = (w: number, h: number, light: number) => {
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h * 0.18);
      ctx.quadraticCurveTo(w - reach * 0.2, h, w - reach, h);
      ctx.lineTo(reach, h);
      ctx.quadraticCurveTo(reach * 0.2, h, 0, h * 0.18);
      ctx.closePath();
    };
    ctx.save();
    path();
    ctx.clip();
    stone(ctx, w, h, { base: DAMP_STONE, light, seed }, 6);
    ctx.fillStyle = 'rgba(8,6,4,0.3)';
    ctx.fillRect(0, 0, w, 3);
    ctx.restore();
    path();
    ctx.strokeStyle = css(EDGE, 0.8);
    ctx.lineWidth = 1;
    ctx.stroke();
  };
  onLeftWall(ctx, box, (w, h) => face(w, h, LIGHT.left));
  onRightWall(ctx, box, (w, h) => face(w, h, LIGHT.right));
  // Above it, the rubble fill of the vault haunches.
  onRoof(ctx, box, (w, d) => {
    brick(ctx, w, d, { base: shade(SOOT_BRICK, 0.8), light: LIGHT.roof, seed: seed + 1 }, 4, 9);
    ctx.strokeStyle = css(EDGE, 0.6);
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, d - 1);
  });
}

/** The pier's full height, from its plinth to the top of the springer. */
export const PILLAR_H = 116;

/** A vault pier (about 3.7 m to the springing of its arches): a stepped plinth, a dressed shaft, an impost slab and the springing of four arches. */
export function drawStonePillar(ctx: Ctx, box: IsoBox): void {
  const { w, d } = box;
  const step = subBox(box, 4, w - 4, 4, d - 4, 6);
  groundShadow(ctx, step, 8, 0.35);
  stonePost(ctx, step, 60);
  stonePost(ctx, subBox(box, 10, w - 10, 10, d - 10, 12, 6), 61);
  stonePost(ctx, subBox(box, 16, w - 16, 16, d - 16, 66, 18), 63);
  stonePost(ctx, subBox(box, 12, w - 12, 12, d - 12, 8, 84), 65);
  // The springer overhangs the impost by 7 px on every side.
  springer(ctx, subBox(box, 5, w - 5, 5, d - 5, 24, 92), 67, 8);
}
