import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, mix, outlineBox, paintTexture, polygon, rng, roofPoint, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { coilPath, rope, sagPath } from '../art/cordage';
import { brick, plaster } from '../art/materials';
import { edges, recess, slab } from '../art/massing';
import { archPath, band, doorway, flatTop, latticeWindow, LIGHT, merlons, walls } from '../art/ornaments';
import { subBox } from '../art/structureParts';
import { contactShadow } from '../art/woodland';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 9 threshold objects and rooftop props. The Báb never appears as a
 * sprite; His presence is held by these: the pillar with its nail and two
 * ropes, the same ropes severed, the cell door shut and then standing open.
 */

const BRICK = 0xb08458;
const LIME = 0xcdb890;

/** The pillar texture: a little over 5 m of plastered brick between the cell and the next room. */
const PILLAR_TEX = { w: 60, h: 186 } as const;
/** The nail on the pillar, in texture pixels, about 4.5 m above the ground, where both ropes hang. */
const NAIL = { x: 22, y: 76 };
/** The ground line of the pillar texture. */
const FOOT = 182;

/** A plastered brick pillar with an iron nail high on it; `pocked` adds the marks of the volley. */
function drawPillar(ctx: Ctx, pocked: boolean): void {
  const shaft: IsoBox = { x: 30, y: FOOT - 2, w: 18, d: 18, h: 150 };
  const plinth: IsoBox = { x: 30, y: FOOT, w: 24, d: 24, h: 9 };
  const capital: IsoBox = { x: 30, y: FOOT - 152, w: 24, d: 24, h: 10 };
  groundShadow(ctx, plinth, 6, 0.26);
  const rand = rng(pocked ? 19 : 17);
  const face = (c: Ctx, w: number, h: number, l: number, seed: number, patch: number) => {
    plaster(c, w, h, { base: LIME, light: l, seed });
    // Where the plaster has fallen away, the brick shows.
    c.save();
    c.beginPath();
    c.moveTo(0, patch);
    c.lineTo(w * 0.6, patch - 5);
    c.lineTo(w * 0.8, patch + 6);
    c.lineTo(w * 0.35, patch + 18);
    c.lineTo(0, patch + 14);
    c.closePath();
    c.clip();
    brick(c, w, h, { base: BRICK, light: l, seed }, 4, 8);
    c.restore();
    if (pocked) {
      // The volley struck the pillar and the wall about it, never the two who hung there.
      for (let i = 0; i < 10; i++) {
        const x = 2 + rand() * (w - 4);
        const y = 30 + rand() * (h * 0.55);
        c.fillStyle = 'rgba(30,20,12,0.75)';
        c.beginPath();
        c.arc(x, y, 1, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(255,240,210,0.35)';
        c.fillRect(x - 1.5, y - 1.5, 1, 1);
      }
    }
  };
  walls(ctx, plinth, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: 4 }, 3, 8));
  flatTop(ctx, plinth, BRICK);
  outlineBox(ctx, plinth);
  walls(ctx, shaft, (c, w, h, light) => (light === 1 ? face(c, w, h, light, 5, 92) : face(c, w, h, light, 6, 118)));
  outlineBox(ctx, shaft);
  walls(ctx, capital, (c, w, h, light) => plaster(c, w, h, { base: shade(LIME, 1.05), light, seed: 8 }));
  flatTop(ctx, capital, LIME);
  outlineBox(ctx, capital);
  ctx.fillStyle = css(0x1e1a16);
  ctx.fillRect(NAIL.x - 2, NAIL.y - 2, 4, 4);
  ctx.fillStyle = 'rgba(200,200,200,0.5)';
  ctx.fillRect(NAIL.x - 2, NAIL.y - 2, 2, 1);
  ctx.fillStyle = 'rgba(60,30,10,0.35)';
  ctx.fillRect(NAIL.x - 0.5, NAIL.y + 2, 1, 8);
}

/** Frayed strands at a cut rope end. */
function frayed(ctx: Ctx, x: number, y: number): void {
  ctx.strokeStyle = css(0xd8c08a);
  ctx.lineWidth = 0.7;
  for (const [dx, dy] of [[-3, 4], [2, 5], [0, 5.5], [-1, 4.5], [3, 3.5]] as const) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  }
}

/**
 * The cell's vestibule, built out from the barrack arcade into the square: a
 * narrow brick porch about 3 m high with a door (22 x 48 px, a little over a
 * man's height) deep in its arch and a worn step before it. It reaches back
 * past its own cell to meet the facade, which stands behind the footprint edge.
 */
function paintCellDoor(scene: Phaser.Scene, key: string, open: boolean): void {
  const { box, texW, texH } = footprintBox(1, 1, 72, 18);
  const porch = subBox(box, 2, 30, 4, 40, 70);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, porch, 6);
    walls(ctx, porch, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: open ? 31 : 29 }, 4, 8), {
      left: (c, w, h, l) => {
        band(c, w, 4, 3, LIME, l);
        recess(c, w / 2 - 13, h, 26, 56, BRICK, l);
        if (!open) {
          doorway(c, w / 2 - 11, h, 22, 48, { frame: LIME, door: 0x4a2e1c, light: l * 0.85, seed: 3 });
          return;
        }
        doorway(c, w / 2 - 11, h, 22, 48, { frame: LIME, light: l, open: true });
        // Faint daylight on the floor of the empty cell, and the leaf swung in.
        c.save();
        archPath(c, w / 2 - 11, h, 22, 48);
        c.clip();
        const glow = c.createRadialGradient(w / 2, h - 3, 1, w / 2, h - 10, 26);
        glow.addColorStop(0, 'rgba(243,217,138,0.4)');
        glow.addColorStop(1, 'rgba(243,217,138,0)');
        c.fillStyle = glow;
        c.fillRect(0, 0, w, h);
        c.fillStyle = css(shade(0x4a2e1c, l * 0.7));
        c.fillRect(w / 2 + 5, h - 46, 4, 46);
        c.restore();
      },
      right: (c, w, _h, l) => {
        band(c, w, 4, 3, LIME, l);
        latticeWindow(c, w / 2 - 5, 18, 10, 14, { frame: 0x8a6440, light: l });
      },
    });
    flatTop(ctx, porch, LIME);
    merlons(ctx, porch, shade(BRICK, 1.05), 4, 4);
    edges(ctx, porch);
    slab(ctx, subBox(box, 4, 28, 0, 5, 4), 0x9a8a70, 5);
  });
}

/** Draws `paint` scaled about its foot at (x, y), for props repainted at true size. */
function scaledAbout(ctx: Ctx, x: number, y: number, k: number, paint: () => void): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.translate(-x, -y);
  paint();
  ctx.restore();
}

/** A low brick dome of the Tabríz rooftops, its courses stepping in to an oculus. */
function brickDome(ctx: Ctx, cx: number, baseY: number, rx: number, h: number, seed: number): void {
  const shape = () => {
    ctx.beginPath();
    ctx.moveTo(cx - rx, baseY);
    ctx.bezierCurveTo(cx - rx, baseY - h * 0.75, cx - rx * 0.55, baseY - h, cx, baseY - h);
    ctx.bezierCurveTo(cx + rx * 0.55, baseY - h, cx + rx, baseY - h * 0.75, cx + rx, baseY);
    ctx.ellipse(cx, baseY, rx, rx * 0.42, 0, 0, Math.PI, false);
    ctx.closePath();
  };
  const g = ctx.createRadialGradient(cx - rx * 0.45, baseY - h * 0.8, 1, cx, baseY - h * 0.4, rx * 1.4);
  g.addColorStop(0, css(shade(BRICK, 1.35)));
  g.addColorStop(0.5, css(BRICK));
  g.addColorStop(1, css(shade(BRICK, 0.45)));
  shape();
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  shape();
  ctx.clip();
  const rand = rng(seed);
  for (let y = baseY - 2; y > baseY - h; y -= 3) {
    const t = (baseY - y) / h;
    const r = rx * Math.sqrt(Math.max(0, 1 - t * t)) * 1.02;
    ctx.strokeStyle = 'rgba(60,32,16,0.45)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(cx, y, r, r * 0.42, 0, 0, Math.PI);
    ctx.stroke();
    for (let a = 0.1; a < Math.PI; a += 0.32) {
      ctx.fillStyle = css(shade(BRICK, 0.8 + rand() * 0.4), 0.35);
      ctx.fillRect(cx + Math.cos(a) * r, y + Math.sin(a) * r * 0.42 - 2.4, 2, 2);
    }
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(30,16,8,0.6)';
  ctx.lineWidth = 0.9;
  shape();
  ctx.stroke();
  // Oculus with a low lime-washed kerb.
  ctx.fillStyle = css(LIME);
  ctx.beginPath();
  ctx.ellipse(cx, baseY - h + 1, 4.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x1a120c);
  ctx.beginPath();
  ctx.ellipse(cx, baseY - h + 0.6, 3, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

export const CH09_PROP_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch9-pillar-ropes': (scene, def) => paintTexture(scene, def.texture, PILLAR_TEX.w, PILLAR_TEX.h, ctx => {
    drawPillar(ctx, false);
    rope(ctx, sagPath(NAIL, { x: 16, y: FOOT - 8 }, 2), 2.4);
    rope(ctx, sagPath(NAIL, { x: 34, y: FOOT - 7 }, 3), 2.4);
    rope(ctx, coilPath(14, FOOT - 5, 7, 3, 2), 2);
    rope(ctx, coilPath(37, FOOT - 4, 7, 3, 2), 2);
  }),

  'ch9-severed-ropes': (scene, def) => paintTexture(scene, def.texture, PILLAR_TEX.w, PILLAR_TEX.h, ctx => {
    drawPillar(ctx, true);
    rope(ctx, sagPath(NAIL, { x: 18, y: NAIL.y + 40 }, 1), 2.4);
    rope(ctx, sagPath(NAIL, { x: 27, y: NAIL.y + 34 }, 1), 2.4);
    frayed(ctx, 18, NAIL.y + 40);
    frayed(ctx, 27, NAIL.y + 34);
    // The cut lengths fallen in the dust.
    rope(ctx, sagPath({ x: 4, y: FOOT - 3 }, { x: 24, y: FOOT - 10 }, -1), 2.2);
    rope(ctx, sagPath({ x: 32, y: FOOT - 1 }, { x: 56, y: FOOT - 9 }, 1.5), 2.2);
    frayed(ctx, 24, FOOT - 10);
    frayed(ctx, 32, FOOT - 1);
  }),

  'ch9-cell-door': (scene, def) => paintCellDoor(scene, def.texture, false),
  'ch9-open-door': (scene, def) => paintCellDoor(scene, def.texture, true),

  // A brick dome over a room below (2 x 2 cells, about 2.8 m across), rising
  // a man's height and a half above the roof, its oculus open to the sky.
  'ch9-brick-dome': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 2, def.footprint?.h ?? 2, 14, 52);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      const drum = subBox(box, 8, box.w - 8, 8, box.d - 8, 14);
      groundShadow(ctx, drum, 8, 0.25);
      walls(ctx, drum, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: 12 }, 4, 8));
      flatTop(ctx, drum, shade(BRICK, 0.95));
      outlineBox(ctx, drum);
      const top = roofPoint(drum, drum.w / 2, drum.d / 2);
      brickDome(ctx, top.x, top.y + 2, 30, 40, 12);
    });
  },

  'ch9-washing-line': (scene, def) => paintTexture(scene, def.texture, 100, 84, ctx => {
    // Two poles a little over 2 m tall, about 3.5 m apart, and the day's washing.
    contactShadow(ctx, 50, 74, 40, 7, 0.18);
    const poleA = { x: 10, y: 22 };
    const poleB = { x: 90, y: 34 };
    const line = sagPath(poleA, poleB, 5, 24);
    for (const [p, base] of [[poleA, 74], [poleB, 80]] as const) {
      const g = ctx.createLinearGradient(p.x - 2, 0, p.x + 2, 0);
      g.addColorStop(0, '#7a5a40');
      g.addColorStop(1, '#3a2a1a');
      ctx.fillStyle = g;
      ctx.fillRect(p.x - 1.5, p.y - 2, 3, base - p.y + 2);
    }
    ctx.strokeStyle = css(0x3a2a1a);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    line.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
    const cloths: ReadonlyArray<readonly [number, number, number, number]> = [[3, 0x8a2f2a, 13, 22], [8, 0xe8e2d0, 12, 27], [13, 0x2f4a6a, 13, 20], [18, 0xd9a441, 10, 17]];
    for (const [i, color, w, h] of cloths) {
      const a = line[i]!;
      const b = line[Math.min(line.length - 1, i + 3)]!;
      const rand = rng(color);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(b.x - 0.5, b.y + h);
      for (let k = 1; k <= 4; k++) ctx.lineTo(b.x + (a.x - b.x) * (k / 4), b.y + h + (a.y - b.y) * (k / 4) + (k % 2 ? 1.5 : -0.5) * rand());
      ctx.closePath();
      const g = ctx.createLinearGradient(a.x, 0, a.x + w, 0);
      g.addColorStop(0, css(shade(color, 1.1)));
      g.addColorStop(0.6, css(color));
      g.addColorStop(1, css(shade(color, 0.62)));
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = css(shade(color, 0.45), 0.7);
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.fillStyle = css(0x6a4a2a);
      ctx.fillRect(a.x + 1, a.y - 1, 1.2, 2.5);
      ctx.fillRect(b.x - 2, b.y - 1, 1.2, 2.5);
    }
  }),

  // A terracotta water jar about 0.9 m tall, a tin cup at its foot.
  'ch9-water-jar': (scene, def) => paintTexture(scene, def.texture, 44, 46, ctx => scaledAbout(ctx, 22, 44, 0.72, () => {
    contactShadow(ctx, 23, 40, 13, 4);
    const body = () => {
      ctx.beginPath();
      ctx.moveTo(17, 10);
      ctx.bezierCurveTo(17, 14, 8, 16, 8, 26);
      ctx.bezierCurveTo(8, 34, 14, 40, 22, 40);
      ctx.bezierCurveTo(30, 40, 36, 34, 36, 26);
      ctx.bezierCurveTo(36, 16, 27, 14, 27, 10);
      ctx.closePath();
    };
    const g = ctx.createRadialGradient(16, 22, 1, 22, 26, 18);
    g.addColorStop(0, '#d89a68');
    g.addColorStop(0.5, '#a86a3e');
    g.addColorStop(1, '#5a3218');
    body();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,20,8,0.6)';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // Incised band on the shoulder and a damp sweat line below it.
    ctx.strokeStyle = 'rgba(70,36,16,0.6)';
    ctx.beginPath();
    ctx.ellipse(22, 19, 11, 2.5, 0, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'rgba(60,30,14,0.22)';
    ctx.beginPath();
    ctx.ellipse(22, 34, 12, 4.5, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = css(0x8a5430);
    ctx.beginPath();
    ctx.ellipse(22, 10, 6.5, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x1e120a);
    ctx.beginPath();
    ctx.ellipse(22, 10, 4.5, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0xa8a8a0);
    ctx.fillRect(33, 37, 5, 4);
    ctx.fillStyle = css(0xd8d8d0);
    ctx.fillRect(33, 37, 5, 1);
  })),

  // A bundle (boqcheh) of patterned cloth knotted at the top, knee-high.
  'ch9-cloth-bundle': (scene, def) => paintTexture(scene, def.texture, 52, 46, ctx => scaledAbout(ctx, 26, 42, 0.7, () => {
    contactShadow(ctx, 27, 38, 19, 5);
    const cloth = 0x8a3a2a;
    const shape = () => {
      ctx.beginPath();
      ctx.moveTo(9, 33);
      ctx.bezierCurveTo(6, 24, 14, 18, 24, 17);
      ctx.lineTo(28, 17);
      ctx.bezierCurveTo(38, 18, 46, 24, 43, 33);
      ctx.bezierCurveTo(40, 40, 12, 40, 9, 33);
      ctx.closePath();
    };
    const g = ctx.createLinearGradient(8, 16, 44, 40);
    g.addColorStop(0, css(shade(cloth, 1.35)));
    g.addColorStop(0.5, css(cloth));
    g.addColorStop(1, css(shade(cloth, 0.55)));
    shape();
    ctx.fillStyle = g;
    ctx.fill();
    ctx.save();
    shape();
    ctx.clip();
    // Boteh (paisley) sprigs scattered over the cloth.
    const rand = rng(91);
    for (let i = 0; i < 16; i++) {
      const x = 10 + rand() * 32;
      const y = 19 + rand() * 18;
      ctx.fillStyle = css(rand() < 0.5 ? 0xe0c070 : 0x2f4a6a, 0.85);
      ctx.beginPath();
      ctx.ellipse(x, y, 1.6, 1, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = css(shade(cloth, 0.5), 0.6);
    ctx.lineWidth = 0.8;
    for (const [x0, x1] of [[16, 11], [22, 20], [30, 33], [36, 41]] as const) {
      ctx.beginPath();
      ctx.moveTo(26, 17);
      ctx.quadraticCurveTo((x0 + x1) / 2, 28, x1, 37);
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = 'rgba(30,12,6,0.6)';
    shape();
    ctx.stroke();
    // The knot and its two ears.
    for (const [x, y, rot] of [[20, 13, -0.6], [32, 13, 0.6]] as const) {
      ctx.fillStyle = css(shade(cloth, rot < 0 ? 1.2 : 0.8));
      ctx.beginPath();
      ctx.ellipse(x, y, 5, 2.6, rot, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = css(shade(cloth, 0.9));
    ctx.beginPath();
    ctx.ellipse(26, 16, 3.5, 2.8, 0, 0, Math.PI * 2);
    ctx.fill();
  })),

  'ch9-rope-coils': (scene, def) => paintTexture(scene, def.texture, 52, 44, ctx => scaledAbout(ctx, 26, 40, 0.85, () => {
    contactShadow(ctx, 26, 32, 20, 6, 0.22);
    rope(ctx, coilPath(18, 31, 11, 5, 3), 2.4);
    rope(ctx, coilPath(34, 33, 10, 4.5, 3), 2.4);
    rope(ctx, sagPath({ x: 41, y: 34 }, { x: 48, y: 40 }, 1), 2.2);
  })),

  // Where something stood and no longer stands: swept, trodden earth.
  'ch9-empty-space': (scene, def) => paintTexture(scene, def.texture, 64, 40, ctx => {
    const diamond = [{ x: 32, y: 8 }, { x: 60, y: 22 }, { x: 32, y: 36 }, { x: 4, y: 22 }];
    ctx.save();
    polygon(ctx, diamond);
    ctx.clip();
    const g = ctx.createRadialGradient(32, 22, 2, 32, 22, 30);
    g.addColorStop(0, css(mix(0x1b1714, 0x5a4a3a, 0.3), 0.32));
    g.addColorStop(1, 'rgba(27,23,20,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 40);
    ctx.strokeStyle = css(shade(0x6a5a48, LIGHT.left), 0.25);
    ctx.lineWidth = 0.7;
    const rand = rng(5);
    for (let i = 0; i < 14; i++) {
      const a = rand() * Math.PI * 2;
      const r = 6 + rand() * 18;
      ctx.beginPath();
      ctx.ellipse(32, 22, r, r / 2, 0, a, a + 0.6);
      ctx.stroke();
    }
    ctx.restore();
  }),
};
