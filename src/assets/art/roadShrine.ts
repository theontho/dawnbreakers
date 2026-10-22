import type Phaser from 'phaser';
import { css, footprintBox, groundPoint, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { recessedDoor, wornPlaster } from './facade';
import { band, dome } from './ornaments';
import { steps, waterJar } from './streetLife';
import { subBox } from './structureParts';
import { TOWN_DOOR, townBlock, townWindow, TURQUOISE } from './town/townKit';

/**
 * A roadside imāmzādih at true scale (3 x 3): a whitewashed cube about 3.3 m
 * a side and 4 m high under a turquoise dome on a drum, its door facing
 * south onto the track, votive rags knotted to the grille of its east
 * window by travellers who stopped to pray.
 */

const WALL = 0xe0d6bc;
const CUBE_H = 92;

export function paintRoadShrine(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, CUBE_H + 96, 8);
  paintTexture(scene, key, texW, texH, ctx => drawShrine(ctx, box));
}

function drawShrine(ctx: Ctx, box: IsoBox): void {
  const cube = subBox(box, 10, box.w - 10, 12, box.d - 6, CUBE_H);
  townBlock(ctx, cube, {
    wall: WALL, seed: 41, material: 'plaster', roof: 'flat', coping: shade(WALL, 1.05),
    left: (c, w, h, l) => {
      band(c, w, 10, 3, TURQUOISE, l);
      wornPlaster(c, 8, h * 0.6, 14, 12, WALL, l, 42);
      recessedDoor(c, w / 2, h, { frame: 0x8a6440, door: 0x2f5f4a, light: l, seed: 43, surround: shade(WALL, 1.04), w: TOWN_DOOR.w, h: TOWN_DOOR.h, panel: TURQUOISE });
    },
    right: (c, w, h, l) => {
      band(c, w, 10, 3, TURQUOISE, l);
      townWindow(c, w / 2, h, 34, { frame: 0x6a5a48, light: l, arched: true }, 16, 22);
      // Votive rags knotted to the grille.
      for (const [dx, color, len] of [[-5, 0x2f7a3a, 9], [-1, 0xb83a2a, 12], [3, 0xf2ead6, 8], [6, 0x2e6c8c, 10]] as const) {
        c.fillStyle = css(shade(color, l));
        c.fillRect(w / 2 + dx, h - 38, 1.8, len);
      }
    },
  });
  const centre = roofPoint(cube, cube.w / 2, cube.d / 2);
  dome(ctx, centre.x, centre.y + 4, 30, { color: TURQUOISE, drum: 14, drumColor: WALL, bulb: 1.15, ribs: true, finial: true });
  steps(ctx, cube, cube.w / 2 - 18, cube.w / 2 + 18, -8, 0, 1, 'q', 3);
  oilLamp(ctx, groundPoint(cube, cube.w / 2 + 22, -4));
  const jar = groundPoint(box, 14, 6);
  waterJar(ctx, jar.x, jar.y, 8, 0x9a6a4a);
}

/** A clay lamp on the step, left burning for the next traveller. */
function oilLamp(ctx: Ctx, at: { x: number; y: number }): void {
  const g = ctx.createRadialGradient(at.x, at.y - 3, 0, at.x, at.y - 3, 10);
  g.addColorStop(0, 'rgba(255,214,140,0.6)');
  g.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = g;
  ctx.fillRect(at.x - 10, at.y - 13, 20, 20);
  ctx.fillStyle = css(0xa8603a);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, 4, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.ellipse(at.x + 3, at.y - 2.5, 1, 2, 0, 0, Math.PI * 2);
  ctx.fill();
}
