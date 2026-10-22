import type Phaser from 'phaser';
import { css, footprintBox, groundShadow, mix, outlineBox, paintTexture, polygon, rng, shade, type Ctx, type IsoBox } from '../art/canvasKit';
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

/** The nail on the pillar, in texture pixels, where both ropes hang. */
const NAIL = { x: 19, y: 30 };

/** A plastered brick pillar with an iron nail near its head; `pocked` adds the marks of the volley. */
function drawPillar(ctx: Ctx, pocked: boolean): void {
  const shaft: IsoBox = { x: 24, y: 118, w: 14, d: 14, h: 94 };
  const plinth: IsoBox = { x: 24, y: 120, w: 18, d: 18, h: 6 };
  const capital: IsoBox = { x: 24, y: 31, w: 18, d: 18, h: 7 };
  groundShadow(ctx, plinth, 5, 0.26);
  const rand = rng(pocked ? 19 : 17);
  const face = (c: Ctx, w: number, h: number, l: number, seed: number, patch: number) => {
    plaster(c, w, h, { base: LIME, light: l, seed });
    // Where the plaster has fallen away, the brick shows.
    c.save();
    c.beginPath();
    c.moveTo(0, patch);
    c.lineTo(w * 0.6, patch - 4);
    c.lineTo(w * 0.8, patch + 5);
    c.lineTo(w * 0.35, patch + 14);
    c.lineTo(0, patch + 11);
    c.closePath();
    c.clip();
    brick(c, w, h, { base: BRICK, light: l, seed }, 3.5, 7);
    c.restore();
    if (pocked) {
      for (let i = 0; i < 7; i++) {
        const x = 2 + rand() * (w - 4);
        const y = 18 + rand() * (h * 0.5);
        c.fillStyle = 'rgba(30,20,12,0.75)';
        c.beginPath();
        c.arc(x, y, 0.9, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = 'rgba(255,240,210,0.35)';
        c.fillRect(x - 1.4, y - 1.4, 1, 1);
      }
    }
  };
  walls(ctx, plinth, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: 4 }, 3, 7));
  flatTop(ctx, plinth, BRICK);
  outlineBox(ctx, plinth);
  walls(ctx, shaft, (c, w, h, light) => (light === 1 ? face(c, w, h, light, 5, 58) : face(c, w, h, light, 6, 80)));
  outlineBox(ctx, shaft);
  walls(ctx, capital, (c, w, h, light) => plaster(c, w, h, { base: shade(LIME, 1.05), light, seed: 8 }));
  flatTop(ctx, capital, LIME);
  outlineBox(ctx, capital);
  ctx.fillStyle = css(0x1e1a16);
  ctx.fillRect(NAIL.x - 1.5, NAIL.y - 1.5, 3, 3);
  ctx.fillStyle = 'rgba(200,200,200,0.5)';
  ctx.fillRect(NAIL.x - 1.5, NAIL.y - 1.5, 1.5, 1);
  ctx.fillStyle = 'rgba(60,30,10,0.35)';
  ctx.fillRect(NAIL.x - 0.5, NAIL.y + 1.5, 1, 6);
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
 * The cell's vestibule, built out from the barrack wall into the square: a
 * narrow brick porch with a person-sized door deep in its arch and a worn
 * step before it. It reaches back past its own cell to meet the facade,
 * which stands a few pixels behind the footprint edge.
 */
function paintCellDoor(scene: Phaser.Scene, key: string, open: boolean): void {
  const { box, texW, texH } = footprintBox(1, 1, 54, 8);
  const porch = subBox(box, 4, 28, 4, 36, 52);
  paintTexture(scene, key, texW, texH, ctx => {
    groundShadow(ctx, porch, 5);
    walls(ctx, porch, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: open ? 31 : 29 }), {
      left: (c, w, h, l) => {
        band(c, w, 4, 2, LIME, l);
        recess(c, w / 2 - 9.5, h, 19, 44, BRICK, l);
        if (!open) {
          doorway(c, w / 2 - 6.5, h, 13, 35, { frame: LIME, door: 0x4a2e1c, light: l * 0.85, seed: 3 });
          return;
        }
        doorway(c, w / 2 - 6.5, h, 13, 35, { frame: LIME, light: l, open: true });
        // Faint daylight on the floor of the empty cell, and the leaf swung in.
        c.save();
        archPath(c, w / 2 - 6.5, h, 13, 35);
        c.clip();
        const glow = c.createRadialGradient(w / 2, h - 3, 1, w / 2, h - 8, 18);
        glow.addColorStop(0, 'rgba(243,217,138,0.4)');
        glow.addColorStop(1, 'rgba(243,217,138,0)');
        c.fillStyle = glow;
        c.fillRect(0, 0, w, h);
        c.fillStyle = css(shade(0x4a2e1c, l * 0.7));
        c.fillRect(w / 2 + 3, h - 33, 3, 33);
        c.restore();
      },
      right: (c, w, _h, l) => {
        band(c, w, 4, 2, LIME, l);
        latticeWindow(c, w / 2 - 3, 14, 6, 8, { frame: 0x8a6440, light: l });
      },
    });
    flatTop(ctx, porch, LIME);
    merlons(ctx, porch, shade(BRICK, 1.05), 3, 3);
    edges(ctx, porch);
    slab(ctx, subBox(box, 7, 25, 0, 4, 3), 0x9a8a70, 5);
  });
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
  'ch9-pillar-ropes': (scene, def) => paintTexture(scene, def.texture, 48, 122, ctx => {
    drawPillar(ctx, false);
    rope(ctx, sagPath(NAIL, { x: 15, y: 112 }, 2), 2.2);
    rope(ctx, sagPath(NAIL, { x: 30, y: 113 }, 3), 2.2);
    rope(ctx, coilPath(14, 115, 6, 2.6, 2), 1.8);
    rope(ctx, coilPath(32, 116, 6, 2.6, 2), 1.8);
  }),

  'ch9-severed-ropes': (scene, def) => paintTexture(scene, def.texture, 48, 122, ctx => {
    drawPillar(ctx, true);
    rope(ctx, sagPath(NAIL, { x: 18, y: 60 }, 1), 2.2);
    rope(ctx, sagPath(NAIL, { x: 25, y: 56 }, 1), 2.2);
    frayed(ctx, 18, 60);
    frayed(ctx, 25, 56);
    // The cut lengths fallen in the dust.
    rope(ctx, sagPath({ x: 5, y: 115 }, { x: 21, y: 109 }, -1), 2);
    rope(ctx, sagPath({ x: 27, y: 117 }, { x: 44, y: 111 }, 1.5), 2);
    frayed(ctx, 21, 109);
    frayed(ctx, 27, 117);
  }),

  'ch9-cell-door': (scene, def) => paintCellDoor(scene, def.texture, false),
  'ch9-open-door': (scene, def) => paintCellDoor(scene, def.texture, true),

  'ch9-brick-dome': (scene, def) => paintTexture(scene, def.texture, 60, 54, ctx => {
    const drum: IsoBox = { x: 30, y: 52, w: 26, d: 26, h: 7 };
    groundShadow(ctx, drum, 5, 0.25);
    walls(ctx, drum, (c, w, h, light) => brick(c, w, h, { base: BRICK, light, seed: 12 }, 3.5, 7));
    flatTop(ctx, drum, shade(BRICK, 0.95));
    outlineBox(ctx, drum);
    brickDome(ctx, 30, 33, 19, 26, 12);
  }),

  'ch9-washing-line': (scene, def) => paintTexture(scene, def.texture, 64, 58, ctx => {
    contactShadow(ctx, 32, 50, 26, 5, 0.18);
    const poleA = { x: 8, y: 12 };
    const poleB = { x: 56, y: 20 };
    const line = sagPath(poleA, poleB, 3, 24);
    for (const [p, base] of [[poleA, 52], [poleB, 52]] as const) {
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
    const cloths: ReadonlyArray<readonly [number, number, number, number]> = [[4, 0x8a2f2a, 9, 15], [9, 0xe8e2d0, 8, 18], [14, 0x2f4a6a, 9, 14], [19, 0xd9a441, 7, 12]];
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

  // A tall terracotta water jar with a tin cup at its foot.
  'ch9-water-jar': (scene, def) => paintTexture(scene, def.texture, 44, 46, ctx => {
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
  }),

  // A bundle (boqcheh) of patterned cloth knotted at the top.
  'ch9-cloth-bundle': (scene, def) => paintTexture(scene, def.texture, 52, 46, ctx => {
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
  }),

  'ch9-rope-coils': (scene, def) => paintTexture(scene, def.texture, 52, 44, ctx => {
    contactShadow(ctx, 26, 32, 20, 6, 0.22);
    rope(ctx, coilPath(18, 31, 11, 5, 3), 2.4);
    rope(ctx, coilPath(34, 33, 10, 4.5, 3), 2.4);
    rope(ctx, sagPath({ x: 41, y: 34 }, { x: 48, y: 40 }, 1), 2.2);
  }),

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
