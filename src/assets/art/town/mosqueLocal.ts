import type Phaser from 'phaser';
import { footprintBox, groundPoint, paintTexture, type Ctx, type IsoBox } from '../canvasKit';
import { cylinderBand, dome } from '../ornaments';
import { steps } from '../streetLife';
import { subBox } from '../structureParts';
import { cypressAt, jarAt } from './houseKit';
import { blindArches, inscriptionBand, tilePanel, townIwan } from './monumentKit';
import { CREAM, LAPIS, roofFloor, spout, townBlock, townWindow, TURQUOISE } from './townKit';

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

function paintLocalMosque(ctx: Ctx, box: IsoBox): void {
  // The custodian's rooms down the left, and a walled yard behind with its cypress.
  townBlock(ctx, subBox(box, 0, 32, 40, box.d, 78), { wall: 0xc8a47a, seed: 801, material: 'mud', beams: 12 });
  const yard = groundPoint(box, 210, 196);
  cypressAt(ctx, yard.x, yard.y, 160, 28, 0x24553a, 803);
  townBlock(ctx, subBox(box, 246, 256, 150, box.d, 72), { wall: 0xc8a47a, seed: 805, material: 'mud', roof: 'flat', coping: 0xd8b88a });
  // The prayer hall.
  const hall = subBox(box, 32, 256, 18, 150, 104);
  townBlock(ctx, hall, {
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
  });
  const at = roofFloor(hall, hall.w * 0.5, hall.d * 0.55);
  dome(ctx, at.x, at.y, 60, { color: TURQUOISE, drum: 22, drumColor: BRICK, bulb: 1.08, pattern: CREAM, finial: true });
  cylinderBand(ctx, at.x, at.y - 22, 60, 4, LAPIS);
  // The portal: a tiled frame a parapet higher than the hall, the door at the back of its iwan.
  const p = MOSQUE_LOCAL_DOOR_P;
  const portal = subBox(box, p - 36, p + 36, 8, 26, 124);
  townBlock(ctx, portal, {
    wall: BRICK, seed: 809, material: 'brick', coping: CREAM, roof: 'flat',
    left: (c, w, h, l) => {
      tilePanel(c, 4, 4, w - 8, h - 4, TURQUOISE, l, 810, 6);
      inscriptionBand(c, w, 10, 10, l);
      townIwan(c, w / 2, h, 44, 80, { wall: BRICK, frame: TURQUOISE, door: 0x4a2a14, light: l, seed: 811, tile: LAPIS, lantern: true });
    },
    right: (c, w, h, l) => tilePanel(c, 2, 4, w - 4, h - 4, LAPIS, l, 812, 5),
  });
  steps(ctx, box, p - 24, p + 24, 0, 8, 1, 'q', 4);
  jarAt(ctx, box, p - 58, 10, 9);
}

export function paintMosqueLocal(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 180, 10);
  paintTexture(scene, key, texW, texH, ctx => paintLocalMosque(ctx, box));
}
