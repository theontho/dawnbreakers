import type Phaser from 'phaser';
import { footprintBox, paintTexture, shade } from './canvasKit';
import { wornPlaster } from './facade';
import { subBox } from './structureParts';
import { orosi, threshold, windowOf, type TownHouseStyle } from './town/houseKit';
import { joinedMass, type MassPart } from './town/joinedMass';
import { townIwan } from './town/monumentKit';
import { roofFloor, spout, townWindow, TURQUOISE, windcatcherTower } from './town/townKit';

/**
 * The summer hall of a Káshán merchant's house, across the court from the
 * street door: a tall plastered range (6.5 m) with a tiled iwan in the
 * middle, its door closed and a lantern hung in the vault, lit sash windows
 * (orosi) either side, and over it all the wind-catcher (bādgīr) that
 * Káshán is known by, 4.5 m above the roof. Lower wings close the court at
 * either end. The door in the iwan is the guest room's; the chapter never
 * goes through it.
 *
 * Ground axes: `p` runs along the court face (west to east), `q` back
 * from it (north). The iwan's door stands at the middle of the face.
 */

const HALL_H = 150;
const WING_H = 96;
const TOWER = { size: 46, h: 104 } as const;

const STYLE: TownHouseStyle = { wall: 0xdccaa4, door: 0x5b3a20, frame: 0x7a5434, seed: 641, shutters: 0x3f6a6a, lit: true };

/** Texture key, size and painter for the hall on a `cellsW` x `cellsD` footprint. */
export function paintKashanHall(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, HALL_H, TOWER.h + 30);
  const s = STYLE;
  const W = box.w;
  const D = box.d;
  const wing = 64;
  paintTexture(scene, key, texW, texH, ctx => {
    const hall: MassPart = {
      p0: wing, p1: W - wing, q0: 10, q1: D, h: HALL_H,
      spec: {
        wall: s.wall, seed: s.seed, beams: 14,
        left: (c, w, h, l) => {
          townIwan(c, w / 2, h, 64, 116, { wall: s.wall, frame: s.frame, door: s.door, light: l, seed: s.seed, tile: TURQUOISE, lantern: true });
          for (const u of [w * 0.17, w * 0.83]) {
            orosi(c, u - 16, h - 100, 32, 56, s.frame, l, true);
            townWindow(c, u, h, 112, windowOf(s, l, true), 10, 14);
          }
          spout(c, w * 0.32, 9, l);
          spout(c, w * 0.68, 9, l);
        },
        right: (c, w, h, l) => {
          townWindow(c, w / 2, h, 96, windowOf(s, l));
          wornPlaster(c, w * 0.3, h * 0.6, 14, 10, s.wall, l, s.seed + 3);
        },
      },
    };
    const wingPart = (p0: number, p1: number, seed: number): MassPart => ({
      p0, p1, q0: 22, q1: D, h: WING_H,
      spec: {
        wall: shade(s.wall, 0.97), seed, beams: 12,
        left: (c, w, h, l) => {
          townWindow(c, w / 2, h, 40, windowOf(s, l, true));
          wornPlaster(c, w * 0.2, h * 0.5, 12, 9, s.wall, l, seed + 1);
        },
        right: (c, w, h, l) => townWindow(c, w / 2, h, 40, windowOf(s, l)),
      },
    });
    const west = wingPart(0, wing, s.seed + 21);
    const east = wingPart(W - wing, W, s.seed + 23);
    joinedMass(ctx, box, [west, hall, east]);
    const body = subBox(box, hall.p0, hall.p1, hall.q0, hall.q1, hall.h);
    windcatcherTower(ctx, roofFloor(body, body.w * 0.66, body.d * 0.62), TOWER.size, TOWER.h, shade(s.wall, 0.97), s.seed + 11);
    threshold(ctx, box, W / 2, hall.q0, s, 'none');
  });
}
