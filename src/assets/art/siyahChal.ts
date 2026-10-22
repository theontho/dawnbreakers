import { css, groundShadow, onLeftWall, onRightWall, onRoof, rng, shade, type Ctx, type IsoBox } from './canvasKit';
import { edges } from './massing';
import { brick, stone } from './materials';
import { archPath, band, flatTop, LIGHT, walls } from './ornaments';
import { subBox } from './structureParts';

/**
 * The Síyáh-Chál: a disused reservoir under Ṭihrán. Its north wall is an
 * arcade of low arches between brick pilasters, black behind; its vault
 * rests on squat stone piers whose arches spring outward into the dark.
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

const ARCH_WALL_H = 62;
const ARCH_H = 42;
const PILASTER = 8;

/**
 * The arcade wall: arches between pilasters that stand proud of it. Runs
 * placed end to end double their pilasters at the join, which reads as a
 * heavier pier.
 */
export function drawLowArch(ctx: Ctx, box: IsoBox): void {
  const setBack = 7;
  const wall = subBox(box, 0, box.w, setBack, box.d, ARCH_WALL_H);
  const bays = Math.max(1, Math.round(box.w / 42));
  const span = box.w / bays;
  groundShadow(ctx, wall, 6, 0.32);
  walls(ctx, wall, (c, w, h, light) => brick(c, w, h, { base: SOOT_BRICK, light, seed: light === 1 ? 51 : 52 }, 4, 9), {
    left: (c, w, h, l) => {
      for (let i = 0; i < bays; i++) {
        const u0 = i * span + PILASTER / 2 + (i === 0 ? PILASTER / 2 : 0);
        const u1 = (i + 1) * span - PILASTER / 2 - (i === bays - 1 ? PILASTER / 2 : 0);
        blackArch(c, u0 + 3, h, u1 - u0 - 6, ARCH_H, l);
      }
      damp(c, w, h, 53);
    },
    right: (c, w, h) => damp(c, w, h, 54),
  });
  // The top of the wall: the haunch of the vault, swept with soot.
  onRoof(ctx, wall, (w, d) => {
    brick(ctx, w, d, { base: shade(SOOT_BRICK, 0.85), light: LIGHT.roof, seed: 55 }, 4, 9);
    ctx.fillStyle = 'rgba(8,6,4,0.35)';
    ctx.fillRect(0, d * 0.5, w, d * 0.5);
  });
  edges(ctx, wall, {}, EDGE);
  for (let i = 0; i <= bays; i++) {
    const at = i * span;
    const p0 = Math.max(0, Math.min(box.w - PILASTER, at - PILASTER / 2));
    const pilaster = subBox(box, p0, p0 + PILASTER, 0, setBack + 1, ARCH_WALL_H);
    walls(ctx, pilaster, (c, w, h, light) => brick(c, w, h, { base: shade(SOOT_BRICK, 1.06), light, seed: 56 + i }, 4, 9), {
      left: (c, w, h, l) => {
        band(c, w, h - ARCH_H + 6, 3, shade(DAMP_STONE, 1.2), l);
        damp(c, w, h, 57 + i);
      },
      right: (c, w, h, l) => band(c, w, h - ARCH_H + 6, 3, shade(DAMP_STONE, 1.2), l),
    });
    flatTop(ctx, pilaster, shade(SOOT_BRICK, 0.95));
    edges(ctx, pilaster, {}, EDGE);
  }
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

/** A vault pier: a stepped plinth, a dressed shaft, an impost slab and the springing of four arches. */
export function drawStonePillar(ctx: Ctx, box: IsoBox): void {
  const { w, d } = box;
  const step = subBox(box, 4, w - 4, 4, d - 4, 4);
  groundShadow(ctx, step, 8, 0.35);
  stonePost(ctx, step, 60);
  stonePost(ctx, subBox(box, 11, w - 11, 11, d - 11, 9, 4), 61);
  stonePost(ctx, subBox(box, 17, w - 17, 17, d - 17, 58, 13), 63);
  stonePost(ctx, subBox(box, 13, w - 13, 13, d - 13, 6, 71), 65);
  // The springer overhangs the impost by 7 px on every side.
  springer(ctx, subBox(box, 6, w - 6, 6, d - 6, 18, 77), 67, 7);
}
