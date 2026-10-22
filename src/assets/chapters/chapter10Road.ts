import { footprintBox, groundShadow, onRoof, outlineBox, paintTexture, rng, type Ctx } from '../art/canvasKit';
import { earthRoof, plaster } from '../art/materials';
import { LIGHT, merlons, walls } from '../art/ornaments';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 10, the western gate of Ṭihrán in January 1853: the mud-brick
 * city wall, drifted snow, and the tracks the exiles' caravan cut in it on
 * the road toward Baghdád.
 */

const RAMMED_EARTH = 0xa88660;

/** Layers of rammed earth (chineh), putlog holes and loopholes near the top. */
function earthWall(c: Ctx, w: number, h: number, light: number, seed: number): void {
  plaster(c, w, h, { base: RAMMED_EARTH, light, seed });
  const rand = rng(seed + 1);
  for (let v = h - 11; v > 6; v -= 11) {
    c.fillStyle = 'rgba(60,40,20,0.28)';
    c.fillRect(0, v, w, 1.2);
    c.fillStyle = 'rgba(255,236,200,0.12)';
    c.fillRect(0, v + 1.2, w, 0.8);
    for (let u = 4 + rand() * 8; u < w - 2; u += 14 + rand() * 6) {
      c.fillStyle = 'rgba(30,18,8,0.55)';
      c.fillRect(u, v - 3, 2, 2);
    }
  }
  for (let u = 10; u < w - 6; u += 24) {
    c.fillStyle = 'rgba(20,12,6,0.8)';
    c.fillRect(u, 9, 2, 8);
  }
}

/** Soft heaped snow: overlapping mounds, blue in their shadows. */
function snowMounds(ctx: Ctx, mounds: ReadonlyArray<readonly [number, number, number, number]>): void {
  for (const [x, y, rx, ry] of mounds) {
    ctx.fillStyle = 'rgba(70,90,120,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + ry * 0.45, rx, ry * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const [x, y, rx, ry] of mounds) {
    const g = ctx.createRadialGradient(x - rx * 0.4, y - ry * 0.6, 1, x, y, rx);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.55, '#e8ecf2');
    g.addColorStop(1, '#a9b6c8');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, Math.PI, 0);
    ctx.ellipse(x, y, rx, ry * 0.4, 0, 0, Math.PI);
    ctx.fill();
  }
}

export const CH10_ROAD_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch10-city-wall': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 1, def.footprint?.h ?? 3, 70, 14);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 8);
      walls(ctx, box, (c, w, h, light) => earthWall(c, w, h, light, light === 1 ? 91 : 92));
      onRoof(ctx, box, (w, d) => earthRoof(ctx, w, d, { base: 0x8a6c4a, light: LIGHT.roof, seed: 93 }));
      merlons(ctx, box, RAMMED_EARTH, 6, 4);
      outlineBox(ctx, box, 0x2a1c12);
    });
  },

  'ch10-snow-drift': (scene, def) => paintTexture(scene, def.texture, 64, 36, ctx => {
    snowMounds(ctx, [[22, 22, 15, 8], [40, 24, 18, 9], [30, 27, 13, 5], [52, 27, 9, 4]]);
    const rand = rng(3);
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillRect(12 + rand() * 42, 14 + rand() * 10, 1, 1);
    }
  }),

  // The caravan's ruts and the prints of laden mules, all heading west.
  'ch10-snow-tracks': (scene, def) => paintTexture(scene, def.texture, 64, 36, ctx => {
    const field = ctx.createRadialGradient(32, 20, 2, 32, 20, 30);
    field.addColorStop(0, 'rgba(242,240,234,0.85)');
    field.addColorStop(1, 'rgba(242,240,234,0)');
    ctx.fillStyle = field;
    ctx.beginPath();
    ctx.ellipse(32, 20, 31, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    // West lies up and to the left along one iso axis; `off` steps across
    // the track along the other.
    const along = (t: number, off: number) => ({ x: 32 + t * 2 + off, y: 20 + t - off / 2 });
    for (const off of [-5, 5]) {
      const a = along(-10, off);
      const b = along(10, off);
      const rut = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      rut.addColorStop(0, 'rgba(110,120,140,0)');
      rut.addColorStop(0.25, 'rgba(110,120,140,0.5)');
      rut.addColorStop(0.75, 'rgba(110,120,140,0.5)');
      rut.addColorStop(1, 'rgba(110,120,140,0)');
      ctx.strokeStyle = rut;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    for (let t = -9; t <= 9; t += 3) {
      const p = along(t, (t / 4) % 2 ? 1.5 : -1.5);
      ctx.fillStyle = 'rgba(90,96,110,0.6)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 1.8, 1.1, 0.46, 0, Math.PI * 2);
      ctx.fill();
    }
  }),
};
