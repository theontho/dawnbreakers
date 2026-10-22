import type Phaser from 'phaser';
import { css, footprintBox, outlineBox, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from './canvasKit';
import { plaster } from './materials';
import { archPath, clipped, dome, flatTop, latticeWindow, walls } from './ornaments';
import { laneDust } from './streetLife';
import { subBox } from './structureParts';
import { inscriptionBand, tilePanel } from './town/monumentKit';
import { joinedMass, type MassPart } from './town/joinedMass';
import { CREAM, LAPIS, roofFloor, townMerlons, TURQUOISE } from './town/townKit';

/**
 * The Darvázih-i-Qur'án at true scale (3 x 7: 96 x 224 px of ground): a
 * brick gatehouse in the line of the city wall, whose upper chamber holds a
 * Qur'án so that every traveller leaving Shíráz passes beneath the Book.
 * The road runs east through it, so the passage opens in the right (east)
 * face: a tiled pīshṭāq standing higher than the gatehouse, its arch 3.8 m
 * wide and 5.7 m high, centred on footprint row 3 (of 0..6). The map keeps
 * rows 2..4 walkable under the arch and blocks the piers either side.
 */

const GATE_BRICK = 0xc8a070;
const HOUSE_H = 168;
const PISHTAQ_H = 206;
const ARCH = { w: 88, h: 132 } as const;

export function paintQuranGate(scene: Phaser.Scene, key: string, cellsW: number, cellsD: number): void {
  const { box, texW, texH } = footprintBox(cellsW, cellsD, 250, 10);
  paintTexture(scene, key, texW, texH, ctx => drawQuranGate(ctx, box));
}

function drawQuranGate(ctx: Ctx, box: IsoBox): void {
  const mid = box.d / 2;
  laneDust(ctx, box, box.w - 8, box.w + 40, mid - 48, mid + 48, 17);
  const band = (c: Ctx, w: number, l: number): void => {
    c.fillStyle = css(shade(TURQUOISE, l));
    c.fillRect(0, 26, w, 4);
  };
  const house: MassPart = {
    p0: 0, p1: box.w - 12, q0: 0, q1: box.d, h: HOUSE_H,
    spec: {
      wall: GATE_BRICK, seed: 11, material: 'brick', coping: shade(GATE_BRICK, 1.1),
      left: (c, w, h, l) => {
        band(c, w, l);
        niches(c, 10, w - 6, h, l);
      },
      right: (c, w, h, l) => {
        band(c, w, l);
        niches(c, 8, mid - ARCH.w / 2 - 34, h, l);
        niches(c, mid + ARCH.w / 2 + 34, w - 4, h, l);
      },
    },
  };
  // The pīshṭāq stands proud of the gatehouse on the road side and rises
  // over it, built through the gatehouse wall rather than set against it.
  const frame: MassPart = {
    p0: box.w - 12, p1: box.w, q0: mid - ARCH.w / 2 - 30, q1: mid + ARCH.w / 2 + 30, h: PISHTAQ_H,
    spec: {
      wall: GATE_BRICK, seed: 14, material: 'brick', roof: 'flat', coping: CREAM,
      left: (c, w, _h, l) => band(c, w, l),
      right: (c, w, h, l) => pishtaq(c, w, h, l),
    },
  };
  joinedMass(ctx, box, [house], [frame]);
  const houseBox = subBox(box, house.p0, house.p1, house.q0, house.q1, HOUSE_H);
  townMerlons(ctx, houseBox, GATE_BRICK, 8, 8, 10);
  bookChamber(ctx, houseBox);
  joinedMass(ctx, box, [frame], [house]);
  townMerlons(ctx, subBox(box, frame.p0, frame.p1, frame.q0, frame.q1, PISHTAQ_H), GATE_BRICK, 7, 7, 9);
}

/** Two tiers of blind arched niches along a stretch of face. */
function niches(c: Ctx, from: number, to: number, h: number, l: number): void {
  for (let u = from; u + 18 <= to; u += 28) {
    for (const [base, ht] of [[h - 18, 46], [h - 92, 40]] as const) {
      archPath(c, u, base, 18, ht);
      c.fillStyle = css(shade(0x6a4a2c, l), 0.75);
      c.fill();
      archPath(c, u + 2, base, 14, ht - 3);
      c.fillStyle = css(shade(0x4a301c, l), 0.6);
      c.fill();
    }
  }
}

/** The tiled frame, its inscription, and the passage with the road bright at its far end. */
function pishtaq(c: Ctx, w: number, h: number, l: number): void {
  const ax = w / 2 - ARCH.w / 2;
  tilePanel(c, 6, 10, w - 12, h - 10, LAPIS, l, 13, 7);
  c.save();
  c.translate(12, 0);
  inscriptionBand(c, w - 24, 22, 12, l);
  c.restore();
  archPath(c, ax - 5, h, ARCH.w + 10, ARCH.h + 5);
  c.fillStyle = css(shade(CREAM, l * 1.05));
  c.fill();
  archPath(c, ax, h, ARCH.w, ARCH.h);
  const vault = c.createLinearGradient(0, h - ARCH.h, 0, h);
  vault.addColorStop(0, css(0x140c06));
  vault.addColorStop(1, css(0x2e2014));
  c.fillStyle = vault;
  c.fill();
  // The far mouth of the passage: the city lane, lit, small with distance.
  const fw = ARCH.w * 0.62;
  archPath(c, w / 2 - fw / 2, h - 8, fw, ARCH.h * 0.7);
  const far = c.createLinearGradient(0, h - ARCH.h * 0.7, 0, h);
  far.addColorStop(0, '#e8c890');
  far.addColorStop(1, '#b8945c');
  c.fillStyle = far;
  c.fill();
  c.fillStyle = 'rgba(200,170,120,0.3)';
  c.beginPath();
  c.moveTo(w / 2 - fw / 2, h - 8);
  c.lineTo(w / 2 + fw / 2, h - 8);
  c.lineTo(ax + ARCH.w, h);
  c.lineTo(ax, h);
  c.closePath();
  c.fill();
  c.fillStyle = css(shade(0x9a8a70, l));
  c.fillRect(ax - 4, h - 3, ARCH.w + 8, 3);
}

/** The chamber of the Book on the roof: a small plastered room under a turquoise dome, its window lit. */
function bookChamber(ctx: Ctx, house: IsoBox): void {
  const cw = 44;
  const cd = 60;
  const foot = roofFloor(house, house.w / 2 + cw / 2, house.d / 2 - cd / 2);
  const chamber: IsoBox = { x: foot.x, y: foot.y, w: cw, d: cd, h: 44 };
  walls(ctx, chamber, (c, w, h, light) => plaster(c, w, h, { base: 0xd8c6a0, light, seed: 15 }), {
    left: (c, w, h, l) => latticeWindow(c, w / 2 - 6, h - 34, 12, 18, { frame: 0x6a4a2c, light: l, arched: true }),
    right: (c, w, h, l) => {
      c.fillStyle = css(shade(TURQUOISE, l));
      c.fillRect(0, 4, w, 3);
      latticeWindow(c, w / 2 - 7, h - 36, 14, 20, { frame: 0x6a4a2c, light: l, arched: true, lit: true });
      clipped(c, w, h, () => {
        c.fillStyle = 'rgba(255,214,140,0.18)';
        c.beginPath();
        c.ellipse(w / 2, h - 26, 16, 12, 0, 0, Math.PI * 2);
        c.fill();
      });
    },
  });
  flatTop(ctx, chamber, 0xd8c6a0);
  outlineBox(ctx, chamber);
  const top = roofPoint(chamber, cw / 2, cd / 2);
  dome(ctx, top.x, top.y + 2, 20, { color: TURQUOISE, drum: 6, drumColor: 0xd8c6a0, bulb: 1.2, ribs: true, pattern: CREAM, finial: true });
}
