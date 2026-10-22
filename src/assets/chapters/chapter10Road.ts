import { paintTexture, rng, type Ctx } from '../art/canvasKit';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 10, the western gate of Ṭihrán in January 1853: the mud-brick
 * city wall, drifted snow, and the tracks the exiles' caravan cut in it on
 * the road toward Baghdád.
 */

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
