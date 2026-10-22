import type Phaser from 'phaser';
import type { BuildingFront } from '../buildingFronts';
import { footprintBox, groundPoint, paintTexture, type Ctx, type IsoBox } from '../canvasKit';
import { cylinderBand, dome } from '../ornaments';
import { steps } from '../streetLife';
import { subBox } from '../structureParts';
import { cypressAt, jarAt } from './houseKit';
import { blindArches, inscriptionBand, tilePanel, townIwan } from './monumentKit';
import { joinedMass, type MassPart } from './joinedMass';
import { CREAM, LAPIS, roofFloor, spout, townWindow, TURQUOISE } from './townKit';

/**
 * A neighbourhood mosque (8 x 7: 256 x 224 px of ground), the Masjid-i-
 * Ílkhání: a brick prayer hall with a small turquoise dome, and a modest
 * tiled portal on the front-left face whose door is person-sized.
 *
 * The door is centred on the front-left face at p = 144, the middle of
 * footprint cell x = 4 on the front row (y = 6); the map's door
 * interactable belongs on that cell.
 */

const BRICK = 0xbf9466;
/** Where the door stands along the front-left face (the centre of cell 4). */
export const MOSQUE_LOCAL_DOOR_P = 144;
/** The portal is the mosque's front on the street. */
export const MOSQUE_LOCAL_FRONT: BuildingFront = { side: 's', door: MOSQUE_LOCAL_DOOR_P };

function paintLocalMosque(ctx: Ctx, box: IsoBox): void {
  // The custodian's rooms down the left and the yard wall behind run into
  // the prayer hall as one building; the portal projects from the hall's
  // front and rises a parapet over it.
  const rooms: MassPart = { p0: 0, p1: 32, q0: 40, q1: box.d, h: 78, spec: { wall: 0xc8a47a, seed: 801, material: 'mud', beams: 12 } };
  const yardWall: MassPart = {
    p0: 246, p1: 256, q0: 150, q1: box.d, h: 72,
    spec: { wall: 0xc8a47a, seed: 805, material: 'mud', roof: 'flat', coping: 0xd8b88a },
  };
  const hallPart: MassPart = {
    p0: 32, p1: 256, q0: 18, q1: 150, h: 104,
    spec: {
      wall: BRICK, seed: 807, material: 'brick', coping: CREAM, beams: 16,
      left: (c, w, h, l) => {
        blindArches(c, w, h - 12, 37.3, 58, BRICK, l);
        spout(c, 18, 10, l);
        spout(c, w - 18, 10, l);
      },
      right: (c, w, h, l) => {
        blindArches(c, w, h - 12, 33, 58, BRICK, l);
        for (const u of [w * 0.3, w * 0.7]) townWindow(c, u, h, 60, { frame: 0x6a4a2c, light: l, arched: true, lit: u < 50 });
      },
    },
  };
  // The portal: a tiled frame a parapet higher than the hall, the door at the back of its iwan.
  const p = MOSQUE_LOCAL_DOOR_P;
  const portal: MassPart = {
    p0: p - 36, p1: p + 36, q0: 8, q1: 26, h: 124,
    spec: {
      wall: BRICK, seed: 809, material: 'brick', coping: CREAM, roof: 'flat',
      left: (c, w, h, l) => {
        tilePanel(c, 4, 4, w - 8, h - 4, TURQUOISE, l, 810, 6);
        inscriptionBand(c, w, 10, 10, l);
        townIwan(c, w / 2, h, 44, 80, { wall: BRICK, frame: TURQUOISE, door: 0x4a2a14, light: l, seed: 811, tile: LAPIS, lantern: true });
      },
      right: (c, w, h, l) => tilePanel(c, 2, 4, w - 4, h - 4, LAPIS, l, 812, 5),
    },
  };
  const all = [rooms, yardWall, hallPart, portal];
  const others = (...parts: MassPart[]) => all.filter(m => !parts.includes(m));
  joinedMass(ctx, box, [rooms], others(rooms));
  const yard = groundPoint(box, 210, 196);
  cypressAt(ctx, yard.x, yard.y, 160, 28, 0x24553a, 803);
  joinedMass(ctx, box, [yardWall, hallPart], others(yardWall, hallPart));
  const hall = subBox(box, hallPart.p0, hallPart.p1, hallPart.q0, hallPart.q1, hallPart.h);
  const at = roofFloor(hall, hall.w * 0.5, hall.d * 0.55);
  dome(ctx, at.x, at.y, 60, { color: TURQUOISE, drum: 22, drumColor: BRICK, bulb: 1.08, pattern: CREAM, finial: true });
  cylinderBand(ctx, at.x, at.y - 22, 60, 4, LAPIS);
  joinedMass(ctx, box, [portal], others(portal));
  steps(ctx, box, p - 24, p + 24, 0, 8, 1, 'q', 4);
  jarAt(ctx, box, p - 58, 10, 9);
}

export function paintMosqueLocal(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 180, 10);
  paintTexture(scene, key, texW, texH, ctx => paintLocalMosque(ctx, box));
}
