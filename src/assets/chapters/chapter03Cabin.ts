import { css, onRoof, outlineBox, paintTexture, shade, type Ctx } from '../art/canvasKit';
import { chain } from '../art/cordage';
import { cellCentredBox, ellipseShadow, sideGradient } from '../art/fieldKit';
import { planks } from '../art/materials';
import { flatTop, walls } from '../art/ornaments';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 3: inside the companions' cabin of the pilgrim ship. Bedding rolls,
 * an iron-bound sea chest, a lamp that swings with the swell, Quddús's
 * writing things, and the slippers left before the curtained partition into
 * the inner room. The inner room is never shown.
 */

const TEAK = 0x7a4f2c;
const DARK_TEAK = 0x4a2e18;
const BRASS = 0xc9a55c;

export const CH03_CABIN_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  /** Two quilted bedding rolls tied with cord on a reed mat. */
  'ch3-bedding-roll': (scene, def) => paintTexture(scene, def.texture, 56, 34, ctx => {
    floorMat(ctx, 28, 24, 22, 0xb89a62);
    roll(ctx, 20, 20, 0x8a3a2a, 0xd8c7a0);
    roll(ctx, 34, 25, 0x3f5a6a, 0xe8dcc0);
  }),

  /** An iron-bound teak sea chest with brass corners: Mubárak's provisions. */
  'ch3-sea-chest': (scene, def) => {
    const texH = 46;
    paintTexture(scene, def.texture, 64, texH, ctx => {
      const box = cellCentredBox(texH, 26, 14, 16);
      ellipseShadow(ctx, 32, texH - 14, 20, 6, 0.3);
      walls(ctx, box, (c, w, h, light) => {
        planks(c, w, h, { base: TEAK, light, seed: light === 1 ? 631 : 632 }, false, 3.5);
        c.fillStyle = css(shade(0x2e2a26, light));
        c.fillRect(0, 3, w, 1.4);
        c.fillRect(0, h - 3, w, 1.4);
        c.fillStyle = css(shade(BRASS, light));
        c.fillRect(0, 0, 3, 3);
        c.fillRect(w - 3, 0, 3, 3);
        c.fillRect(w / 2 - 1.5, 4, 3, 4);
      });
      flatTop(ctx, box, shade(TEAK, 1.05));
      onRoof(ctx, box, (w, d) => {
        ctx.fillStyle = css(shade(0x2e2a26, 1.1));
        ctx.fillRect(w * 0.3, 0, 1.4, d);
        ctx.fillRect(w * 0.7, 0, 1.4, d);
      });
      outlineBox(ctx, box);
    });
  },

  /**
   * A brass lamp on a chain from the deck beam. The texture hangs from its
   * top edge: map decor gives it `swing` so it rocks with the sea.
   */
  'ch3-hanging-lamp': (scene, def) => paintTexture(scene, def.texture, 28, 120, ctx => {
    chain(ctx, [{ x: 14, y: 0 }, { x: 14, y: 52 }], 4, 0x6a5a40);
    hangingLamp(ctx, 14, 52);
  }),

  /** Slippers set side by side before the curtain, a brass ewer beside them. */
  'ch3-curtain-threshold': (scene, def) => paintTexture(scene, def.texture, 48, 34, ctx => {
    floorMat(ctx, 24, 24, 16, 0x24452c);
    for (const [x, y] of [[19, 24], [26, 25]] as const) slipper(ctx, x, y);
    ewer(ctx, 37, 26);
  }),

  /** A folding book-stand with Quddús's writing board, pen case and pages wrapped in oilcloth. */
  'ch3-cabin-pages': (scene, def) => paintTexture(scene, def.texture, 48, 42, ctx => {
    ellipseShadow(ctx, 25, 35, 17, 5);
    // The oilcloth bundle, tied with cord.
    ctx.fillStyle = css(0x4a4a2e);
    ctx.beginPath();
    ctx.ellipse(13, 32, 9, 4.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = css(0x6a6a44);
    ctx.beginPath();
    ctx.ellipse(13, 30.5, 8, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = css(0xc8b48a);
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(8, 33);
    ctx.lineTo(18, 28);
    ctx.stroke();
    // The book-stand (raḥl): two crossed boards.
    ctx.fillStyle = css(shade(TEAK, 0.85));
    ctx.beginPath();
    ctx.moveTo(22, 36);
    ctx.lineTo(36, 22);
    ctx.lineTo(39, 24);
    ctx.lineTo(26, 37);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = css(shade(TEAK, 1.1));
    ctx.beginPath();
    ctx.moveTo(28, 37);
    ctx.lineTo(24, 21);
    ctx.lineTo(39, 18);
    ctx.lineTo(41, 33);
    ctx.closePath();
    ctx.fill();
    // Pages on the board, lines of ink.
    ctx.fillStyle = css(0xf2ead6);
    ctx.beginPath();
    ctx.moveTo(27, 33);
    ctx.lineTo(25, 22);
    ctx.lineTo(37.5, 20);
    ctx.lineTo(39, 31);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(30,24,20,0.7)';
    ctx.lineWidth = 0.5;
    for (let k = 0; k < 5; k++) {
      ctx.beginPath();
      ctx.moveTo(27 - k * 0.1, 24 + k * 1.9);
      ctx.lineTo(37 - k * 0.05, 22.3 + k * 1.9);
      ctx.stroke();
    }
    // Pen case and inkwell.
    ctx.fillStyle = css(0x7a2f26);
    ctx.fillRect(30, 36, 10, 2.2);
    ctx.fillStyle = css(BRASS);
    ctx.fillRect(30, 36, 1.5, 2.2);
    ctx.fillStyle = css(0x1a1410);
    ctx.beginPath();
    ctx.ellipse(43, 36, 2.4, 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
  }),
};

/** A woven mat laid in the floor plane, centred at (cx, cy). */
function floorMat(ctx: Ctx, cx: number, cy: number, r: number, color: number): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, 0.5);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = css(shade(color, 0.75));
  ctx.fillRect(-r * 0.62, -r * 0.62, r * 1.24, r * 1.24);
  ctx.fillStyle = css(color);
  ctx.fillRect(-r * 0.55, -r * 0.55, r * 1.1, r * 1.1);
  ctx.strokeStyle = css(shade(color, 0.7), 0.6);
  ctx.lineWidth = 1;
  for (let k = -r * 0.5; k < r * 0.55; k += 3) {
    ctx.beginPath();
    ctx.moveTo(k, -r * 0.55);
    ctx.lineTo(k, r * 0.55);
    ctx.stroke();
  }
  ctx.restore();
}

/** A quilt rolled lengthwise and tied twice with cord. */
function roll(ctx: Ctx, cx: number, cy: number, color: number, stripe: number): void {
  ellipseShadow(ctx, cx + 2, cy + 4, 13, 3.5, 0.3);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.45);
  ctx.fillStyle = sideGradient(ctx, -12, 12, color);
  ctx.beginPath();
  ctx.roundRect(-12, -4.5, 24, 9, 4.5);
  ctx.fill();
  ctx.strokeStyle = css(stripe, 0.7);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-10, -1);
  ctx.lineTo(10, -1);
  ctx.stroke();
  ctx.fillStyle = css(0xc8b48a);
  ctx.fillRect(-6, -4.8, 1.4, 9.6);
  ctx.fillRect(5, -4.8, 1.4, 9.6);
  // The spiral end.
  ctx.fillStyle = css(shade(color, 1.25));
  ctx.beginPath();
  ctx.ellipse(12, 0, 2.4, 4.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(shade(color, 0.6));
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.ellipse(12, 0, 1.2, 2.4, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** A pierced brass lamp with a glass chimney, its glow drawn round it. */
function hangingLamp(ctx: Ctx, cx: number, top: number): void {
  const glow = ctx.createRadialGradient(cx, top + 9, 1, cx, top + 9, 14);
  glow.addColorStop(0, 'rgba(255,214,140,0.7)');
  glow.addColorStop(1, 'rgba(255,214,140,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 14, top - 5, 28, 28);
  ctx.fillStyle = css(shade(BRASS, 0.8));
  ctx.beginPath();
  ctx.moveTo(cx - 2, top);
  ctx.lineTo(cx + 2, top);
  ctx.lineTo(cx + 5, top + 4);
  ctx.lineTo(cx - 5, top + 4);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffe2a0';
  ctx.fillRect(cx - 3.5, top + 4, 7, 8);
  ctx.strokeStyle = css(shade(BRASS, 0.7));
  ctx.lineWidth = 0.8;
  ctx.strokeRect(cx - 3.5, top + 4, 7, 8);
  ctx.beginPath();
  ctx.moveTo(cx, top + 4);
  ctx.lineTo(cx, top + 12);
  ctx.stroke();
  ctx.fillStyle = css(BRASS);
  ctx.beginPath();
  ctx.ellipse(cx, top + 13, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(shade(BRASS, 0.7));
  ctx.beginPath();
  ctx.moveTo(cx - 2, top + 14);
  ctx.lineTo(cx + 2, top + 14);
  ctx.lineTo(cx, top + 17);
  ctx.closePath();
  ctx.fill();
}

function slipper(ctx: Ctx, x: number, y: number): void {
  ctx.fillStyle = css(0x6a2a22);
  ctx.beginPath();
  ctx.ellipse(x, y, 4.2, 1.9, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0xa84a3a);
  ctx.beginPath();
  ctx.ellipse(x + 1.6, y - 1, 2.2, 1.2, -0.45, 0, Math.PI * 2);
  ctx.fill();
}

function ewer(ctx: Ctx, x: number, ground: number): void {
  ellipseShadow(ctx, x + 1, ground, 4, 1.5, 0.3);
  ctx.fillStyle = sideGradient(ctx, x - 3.5, x + 3.5, BRASS);
  ctx.beginPath();
  ctx.ellipse(x, ground - 4, 3.5, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 1, ground - 11, 2, 4);
  ctx.strokeStyle = css(shade(BRASS, 0.75));
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(x + 3, ground - 5);
  ctx.quadraticCurveTo(x + 7, ground - 9, x + 6, ground - 11);
  ctx.moveTo(x - 3, ground - 6);
  ctx.quadraticCurveTo(x - 6, ground - 8, x - 1, ground - 10);
  ctx.stroke();
}

/** Placeable objects for the cabin interior. */
export const CH03_CABIN_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch3-cabin-wall', label: 'Ship Cabin', texture: 'ch3-cabin-wall', kind: 'prop', category: 'furnishings', color: TEAK, blocks: true },
  { id: 'ch3-cabin-port', label: 'Ship Cabin', texture: 'ch3-cabin-port', kind: 'prop', category: 'furnishings', color: TEAK, blocks: true },
  { id: 'ch3-cabin-pegs', label: 'Ship Cabin', texture: 'ch3-cabin-pegs', kind: 'prop', category: 'furnishings', color: TEAK, blocks: true },
  { id: 'ch3-cabin-curtain', label: 'Ship Cabin', texture: 'ch3-cabin-curtain', kind: 'prop', category: 'furnishings', color: 0x2c3a6a, blocks: true },
  { id: 'ch3-bedding-roll', label: 'Cloth Bundle', texture: 'ch3-bedding-roll', kind: 'prop', category: 'furnishings', color: 0x8a3a2a, blocks: true },
  { id: 'ch3-sea-chest', label: 'Ship Cabin', texture: 'ch3-sea-chest', kind: 'prop', category: 'furnishings', color: DARK_TEAK, blocks: true },
  { id: 'ch3-hanging-lamp', label: 'Lamp', texture: 'ch3-hanging-lamp', kind: 'prop', category: 'lighting-effects', color: BRASS, blocks: true },
  { id: 'ch3-curtain-threshold', label: 'House Threshold', texture: 'ch3-curtain-threshold', kind: 'prop', category: 'furnishings', color: 0x24452c, blocks: false },
  { id: 'ch3-cabin-pages', label: 'Writing Desk', texture: 'ch3-cabin-pages', kind: 'prop', category: 'furnishings', color: 0xf2ead6, blocks: true },
  { id: 'ch3-ship-boy', label: 'Sailor', texture: 'ch3-ship-boy', kind: 'character', category: 'characters', color: 0x6a4a2a, blocks: true,
    character: { body: 0x6a4a2a, skin: 0x9a6a44, clothing: { style: 'wrap', secondary: 0xd8c7a0, accent: 0x2f5f73 }, hat: { style: 'cap', color: 0xe8e0c8 }, shadow: true } },
];
