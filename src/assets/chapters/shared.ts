import { CELL, css, footprintBox, groundPoint, groundShadow, outlineBox, paintTexture, polygon, roofPoint, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { figure, type FigureStyle } from '../art/crowds';
import { cellCentredBox, ellipseShadow } from '../art/fieldKit';
import { brick, planks, plaster, stone } from '../art/materials';
import { archPath, beamEnds, clipped, doorway, flatTop, latticeWindow, parapetRoof, walls } from '../art/ornaments';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Generators shared across chapters, plus the base objects that have no
 * art of their own in `art/index.ts`. When more than one chapter wants a
 * different look for the same `MapObjectId` we should split the asset id
 * instead of resolving by chapter context here.
 */

const LISTENERS: ReadonlyArray<{ dx: number; dy: number; style: FigureStyle }> = [
  { dx: 13, dy: 39, style: { robe: 0x3f3328, trim: 0x8a7450, head: 'turban', headColor: 0xe8e0c8, skin: 0xd1b37c, beard: 0x2d2018 } },
  { dx: 28, dy: 36, style: { robe: 0x6a5030, head: 'kolah', headColor: 0x2a2218, skin: 0xc8a676, beard: 0x3a2a1c } },
  { dx: 43, dy: 40, style: { robe: 0x2f3b44, trim: 0xc9a55c, head: 'turban', headColor: 0x2a4a3a, skin: 0xd8b98a, beard: 0xd8d2c4 } },
  { dx: 20, dy: 50, style: { robe: 0x574027, head: 'turban', headColor: 0xd8cfb8, skin: 0xcaa978, beard: 0x1c140c, seated: true } },
  { dx: 37, dy: 51, style: { robe: 0x4a3f33, trim: 0x7a5a3a, head: 'kolah', headColor: 0x3a2a1c, skin: 0xd1b37c, seated: true } },
];

export const SHARED_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  /** A house front in a lane: plastered walls and a studded door under a brick arch, shut. */
  'closed-door': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 42, 12);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      groundShadow(ctx, box, 5);
      walls(ctx, box, (c, w, h, light) => plaster(c, w, h, { base: 0x9a7e58, light, seed: light === 1 ? 61 : 62 }), {
        left: (c, w, h, l) => {
          beamEnds(c, w, 4, l, 10);
          latticeWindow(c, w / 2 - 3, h * 0.38, 6, 8, { frame: 0x6a4a2c, light: l, arched: true });
        },
        right: (c, w, h, l) => {
          // Brick arch surround with a tympanum over the door leaves.
          archPath(c, w * 0.16, h, w * 0.68, 36);
          c.save();
          c.clip();
          brick(c, w, h, { base: 0xa8784a, light: l, seed: 64 }, 3, 7);
          c.restore();
          doorway(c, w * 0.24, h, w * 0.52, 30, { frame: 0x6a4a2c, door: 0x4a2c18, light: l, seed: 63 });
          // Iron knocker rings: one for men, one for women, each with its own sound.
          c.strokeStyle = css(shade(0x2a2420, l + 0.3));
          c.lineWidth = 0.9;
          c.beginPath();
          c.arc(w * 0.44, h - 15, 1.8, 0, Math.PI * 2);
          c.moveTo(w * 0.6 + 1.3, h - 15);
          c.arc(w * 0.6, h - 15, 1.3, 0, Math.PI * 2);
          c.stroke();
        },
      });
      parapetRoof(ctx, box, 0x9a7e58, { base: 0x7a6040, light: 1, seed: 65 }, 3, 4);
      outlineBox(ctx, box);
    });
  },

  /** Listeners gathered for a sermon: three standing behind, two seated before them. */
  crowd: (scene, def) => {
    paintTexture(scene, def.texture, 58, 56, ctx => {
      for (const { dx, dy, style } of LISTENERS) figure(ctx, dx, dy, style);
    });
  },

  /** A low walnut writing table with a sheet, a pen case and an inkwell. */
  'writing-desk': (scene, def) => {
    const texH = 40;
    paintTexture(scene, def.texture, 64, texH, ctx => {
      const ground = cellCentredBox(texH, 30, 0, 20);
      const top: IsoBox = { ...ground, y: ground.y - 9, h: 3 };
      groundShadow(ctx, ground, 4, 0.22);
      // Turned legs at the three visible corners.
      for (const [p, q] of [[1.5, 1.5], [28.5, 1.5], [28.5, 18.5]] as const) {
        const a = groundPoint(ground, p, q);
        ctx.fillStyle = css(0x3a2414);
        ctx.fillRect(a.x - 1.2, a.y - 9, 2.4, 9);
        ctx.fillStyle = css(0x6a4428);
        ctx.fillRect(a.x - 1.2, a.y - 9, 1, 9);
      }
      walls(ctx, top, (c, w, h, light) => planks(c, w, h, { base: 0x6a4428, light, seed: 71 }, false, 3));
      flatTop(ctx, top, 0x7a5232);
      outlineBox(ctx, top);
      // The sheet, a qalamdán (lacquered pen case) and a brass inkwell.
      const at = (p: number, q: number) => roofPoint(top, p, q);
      polygon(ctx, [at(6, 5), at(18, 5), at(18, 14), at(6, 14)]);
      ctx.fillStyle = css(0xeee1bf);
      ctx.fill();
      ctx.strokeStyle = css(0x5a4a38, 0.7);
      ctx.lineWidth = 0.6;
      for (let p = 8; p < 17; p += 2.2) {
        const a = at(p, 7);
        const b = at(p, 12.5);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      polygon(ctx, [at(21, 3), at(24, 3), at(24, 16), at(21, 16)]);
      ctx.fillStyle = css(0x7a2a1e);
      ctx.fill();
      ctx.strokeStyle = css(0xc9a55c, 0.9);
      ctx.stroke();
      const ink = at(9, 17);
      ctx.fillStyle = css(0xb08a3a);
      ctx.beginPath();
      ctx.ellipse(ink.x, ink.y - 1.5, 2.2, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0x140c06);
      ctx.beginPath();
      ctx.ellipse(ink.x, ink.y - 2, 1, 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  /** Pre-rendered contact shadows beneath a crowd. */
  'crowd-shadow': (scene, def) => {
    paintTexture(scene, def.texture, 54, 34, ctx => {
      for (let i = 0; i < 7; i++) {
        ellipseShadow(ctx, 8 + (i % 4) * 11 + (i >= 4 ? 5 : 0), 13 + Math.floor(i / 4) * 11, 6.5, 3.4, 0.3);
      }
    });
  },

  /**
   * A brick bridge of the Zand kind: a paved deck between low parapets,
   * with pointed arches over the water. Walkable, so it stays low.
   */
  bridge: (scene, def) => {
    const cellsW = def.footprint?.w ?? 3;
    const cellsD = def.footprint?.h ?? 1;
    const { box, texW, texH } = footprintBox(cellsW, cellsD, 6, 12);
    paintTexture(scene, def.texture, texW, texH, ctx => {
      const deck: IsoBox = { ...box, h: 6 };
      walls(ctx, deck, (c, w, h, light) => brick(c, w, h, { base: 0xb0845a, light, seed: 81 }, 3, 7), {
        left: (c, w, h, l) => clipped(c, w, h, () => {
          for (let u = 9; u + 14 < w; u += CELL) {
            archPath(c, u, h + 8, 14, 12);
            c.fillStyle = css(shade(0x1a2a34, l + 0.2), 0.85);
            c.fill();
          }
        }),
      });
      onDeck(ctx, deck);
      // Back parapet, then the front one, which runs along the near edge.
      const parapet = (q: number): IsoBox => {
        const at = roofPoint(deck, deck.w, q);
        return { x: at.x, y: at.y, w: deck.w, d: 4, h: 7 };
      };
      for (const p of [parapet(deck.d), parapet(4)]) {
        walls(ctx, p, (c, w, h, light) => stone(c, w, h, { base: 0xa08868, light, seed: 82 }, 3.5));
        flatTop(ctx, p, 0xb09878);
        outlineBox(ctx, p);
      }
      outlineBox(ctx, deck);
    });
  },
};

/** Paving on the bridge deck: brick laid in herringbone strips. */
function onDeck(ctx: Ctx, deck: IsoBox): void {
  const at = (p: number, q: number) => roofPoint(deck, p, q);
  polygon(ctx, [at(0, 0), at(deck.w, 0), at(deck.w, deck.d), at(0, deck.d)]);
  ctx.fillStyle = css(shade(0xa88a62, 1.1));
  ctx.fill();
  ctx.strokeStyle = css(0x6a5034, 0.45);
  ctx.lineWidth = 0.6;
  for (let p = 3; p < deck.w; p += 4) {
    const a = at(p, 4);
    const b = at(p, deck.d - 4);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}
