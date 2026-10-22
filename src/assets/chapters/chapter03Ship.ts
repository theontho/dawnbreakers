import { css, footprintBox, onRoof, outlineBox, paintTexture, shade, type Ctx } from '../art/canvasKit';
import { cellCentredBox, ellipseShadow, litGradient, rope, sideGradient } from '../art/fieldKit';
import { planks } from '../art/materials';
import { flatTop, walls } from '../art/ornaments';
import { drawCabin, drawLateenMast, drawSkiff } from '../art/ship';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 3 ship pieces: the pilgrim vessel out of Búshihr. Stern cabin with
 * a lamplit door, the threshold mat before it, rails along both axes, hold
 * hatch, water cask, galley brazier, rope coil, mast, and the ship's boat.
 */

const TEAK = 0x7a4f2c;
const IRON = 0x2e2a26;

export const CH03_SHIP_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  /** Stern deckhouse. The door is on the x-facing wall, a lamp behind its lattice. */
  'ch3-cabin': (scene, def) => {
    const { box, texW, texH } = footprintBox(def.footprint?.w ?? 3, def.footprint?.h ?? 4, 44, 16);
    paintTexture(scene, def.texture, texW, texH, ctx => drawCabin(ctx, box));
  },

  /** A green prayer mat laid before the cabin door, a hooded lantern on a peg. */
  'ch3-cabin-threshold': (scene, def) => {
    paintTexture(scene, def.texture, 56, 60, ctx => {
      // The mat lies in the deck plane: p along grid x, q along grid y.
      ctx.save();
      ctx.transform(1, 0.5, -1, 0.5, 28, 33);
      ctx.fillStyle = css(0x24452c);
      ctx.fillRect(0, 0, 22, 14);
      ctx.fillStyle = css(0x2f5a3a);
      ctx.fillRect(2, 2, 18, 10);
      ctx.strokeStyle = css(0xc9a55c, 0.95);
      ctx.lineWidth = 0.8;
      ctx.strokeRect(1.5, 1.5, 19, 11);
      // The miḥráb niche woven at the head of the mat, pointing toward Mecca.
      ctx.beginPath();
      ctx.moveTo(19, 4);
      ctx.lineTo(13, 4);
      ctx.quadraticCurveTo(8, 7, 13, 10);
      ctx.lineTo(19, 10);
      ctx.stroke();
      ctx.fillStyle = css(0xd8b870, 0.8);
      ctx.fillRect(5, 6.4, 2, 1.2);
      ctx.strokeStyle = css(0xe8dcc0, 0.85);
      ctx.lineWidth = 0.5;
      for (let q = 1; q < 14; q += 1.6) {
        ctx.beginPath();
        ctx.moveTo(0, q);
        ctx.lineTo(-1.6, q);
        ctx.stroke();
      }
      ctx.restore();
      lanternPost(ctx, 45, 46);
    });
  },



  'ch3-mast': (scene, def) => paintTexture(scene, def.texture, 64, 122, ctx => drawLateenMast(ctx, 30, 118)),

  /** Hold hatch: a raised coaming with a wooden grating over the dark hold. */
  'ch3-hatch': (scene, def) => {
    const texH = 44;
    paintTexture(scene, def.texture, 64, texH, ctx => {
      const box = cellCentredBox(texH, 28, 7);
      walls(ctx, box, (c, w, h, light) => planks(c, w, h, { base: 0x5a3a1f, light, seed: 21 }, false, 3.5));
      flatTop(ctx, box, 0x6a4525);
      onRoof(ctx, box, (w, d) => {
        ctx.fillStyle = css(0x120a05);
        ctx.fillRect(3, 3, w - 6, d - 6);
        for (let k = 5; k < w - 3; k += 4) {
          ctx.fillStyle = css(shade(0x7a5530, 1.1));
          ctx.fillRect(k, 3, 1.6, d - 6);
          ctx.fillRect(3, k, w - 6, 1.6);
        }
      });
      outlineBox(ctx, box);
    });
  },

  /** A water cask of coopered staves and iron hoops, a copper dipper hung on the rim. */
  'ch3-water-cask': (scene, def) => {
    paintTexture(scene, def.texture, 40, 50, ctx => {
      const cx = 20;
      const ground = 45;
      const top = 13;
      ellipseShadow(ctx, cx + 3, ground, 15, 4.5);
      const rx = (y: number) => 11 + Math.sin(((y - top) / (ground - top)) * Math.PI) * 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - rx(top), top);
      for (let y = top; y <= ground; y += 2) ctx.lineTo(cx - rx(y), y);
      ctx.ellipse(cx, ground, rx(ground), 4, 0, Math.PI, 0, true);
      for (let y = ground; y >= top; y -= 2) ctx.lineTo(cx + rx(y), y);
      ctx.closePath();
      ctx.fillStyle = sideGradient(ctx, cx - 13, cx + 13, TEAK);
      ctx.fill();
      ctx.strokeStyle = css(0x2a1a0c, 0.9);
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.strokeStyle = css(shade(TEAK, 0.55), 0.7);
      ctx.lineWidth = 0.6;
      for (const t of [-0.7, -0.35, 0, 0.35, 0.7]) {
        ctx.beginPath();
        ctx.moveTo(cx + t * rx(top), top + 2);
        ctx.quadraticCurveTo(cx + t * (rx(top) + 3.5), (top + ground) / 2, cx + t * rx(ground), ground + 3);
        ctx.stroke();
      }
      for (const y of [top + 4, top + 12, ground - 9, ground - 2]) {
        ctx.strokeStyle = css(IRON);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, y, rx(y), 4, 0, 0, Math.PI);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(220,210,190,0.35)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.ellipse(cx, y - 0.8, rx(y), 4, 0, Math.PI * 0.55, Math.PI * 0.95);
        ctx.stroke();
      }
      ctx.fillStyle = litGradient(ctx, cx, top, 11, shade(TEAK, 1.15), 0.6);
      ctx.beginPath();
      ctx.ellipse(cx, top, rx(top), 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(IRON);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = css(0x2a1a0a);
      ctx.beginPath();
      ctx.arc(cx - 2, top, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Copper dipper hooked over the rim.
      ctx.strokeStyle = css(0xb8743a);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + 5, top - 1);
      ctx.lineTo(cx + 10, top - 5);
      ctx.stroke();
      ctx.fillStyle = litGradient(ctx, cx + 11, top - 6, 3, 0xb8743a);
      ctx.beginPath();
      ctx.ellipse(cx + 11, top - 6, 3, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  },

  /** The galley: an iron brazier on three legs, coals glowing, a kettle on the grate. */
  'ch3-brazier': (scene, def) => {
    paintTexture(scene, def.texture, 40, 46, ctx => {
      const cx = 20;
      const halo = ctx.createRadialGradient(cx, 26, 2, cx, 26, 20);
      halo.addColorStop(0, 'rgba(255,150,60,0.32)');
      halo.addColorStop(1, 'rgba(255,150,60,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, 40, 46);
      ellipseShadow(ctx, cx + 2, 42, 13, 3.5);
      ctx.strokeStyle = css(IRON);
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(cx - 9, 30);
      ctx.lineTo(cx - 12, 42);
      ctx.moveTo(cx + 9, 30);
      ctx.lineTo(cx + 12, 42);
      ctx.moveTo(cx, 33);
      ctx.lineTo(cx, 43);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 13, 27);
      ctx.quadraticCurveTo(cx, 40, cx + 13, 27);
      ctx.closePath();
      ctx.fillStyle = sideGradient(ctx, cx - 13, cx + 13, 0x3a3430);
      ctx.fill();
      const coals = ctx.createRadialGradient(cx - 2, 27, 1, cx, 27, 12);
      coals.addColorStop(0, '#ffe090');
      coals.addColorStop(0.45, '#e06a2a');
      coals.addColorStop(1, '#5a1a0a');
      ctx.fillStyle = coals;
      ctx.beginPath();
      ctx.ellipse(cx, 27, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(0x1a1410);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = css(0x2a1a10, 0.6);
      for (const [x, y] of [[-6, 0], [-1, -1.5], [4, 1], [7, -1]] as const) ctx.fillRect(cx + x, 27 + y, 2, 1);
      // A dented kettle.
      ctx.fillStyle = litGradient(ctx, cx + 3, 19, 6, 0x4a4038);
      ctx.beginPath();
      ctx.ellipse(cx + 3, 20, 6, 4.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = css(0x1a1410);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx + 3, 17, 4, Math.PI * 1.1, Math.PI * 1.9);
      ctx.moveTo(cx + 8.5, 19);
      ctx.lineTo(cx + 12, 16);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(210,200,190,0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx + 12, 15);
      ctx.bezierCurveTo(cx + 14, 10, cx + 10, 7, cx + 13, 2);
      ctx.stroke();
    });
  },

  /** Hemp cable flaked down in a flat coil, its end trailing. */
  'ch3-rope-coil': (scene, def) => {
    paintTexture(scene, def.texture, 42, 28, ctx => {
      const cx = 20;
      const cy = 16;
      ellipseShadow(ctx, cx + 1, cy + 3, 17, 6, 0.22);
      for (let k = 0; k < 5; k++) {
        const rx = 15 - k * 2.6;
        const ry = 6.5 - k * 1.1;
        const pts = Array.from({ length: 33 }, (_, i) => {
          const a = (i / 32) * Math.PI * 2;
          return { x: cx + Math.cos(a) * rx, y: cy - k * 0.6 + Math.sin(a) * ry };
        });
        rope(ctx, pts, 0xb89a68, 2.2);
      }
      ctx.fillStyle = css(0x4a3420);
      ctx.beginPath();
      ctx.ellipse(cx, cy - 3, 3, 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      rope(ctx, [{ x: cx + 14, y: cy + 2 }, { x: cx + 18, y: cy + 6 }, { x: cx + 21, y: cy + 8 }], 0xb89a68, 2.2);
    });
  },

  /** The ship's boat, bobbing at the foot of the ladder. */
  'ch3-skiff': (scene, def) => paintTexture(scene, def.texture, 68, 40, ctx => drawSkiff(ctx)),
};


/** A tall peg with a hooded brass lantern, glowing. */
function lanternPost(ctx: Ctx, x: number, ground: number): void {
  ellipseShadow(ctx, x + 1, ground, 4, 1.6);
  ctx.fillStyle = sideGradient(ctx, x - 1.5, x + 1.5, 0x4a2e18);
  ctx.fillRect(x - 1.5, ground - 36, 3, 36);
  ctx.fillStyle = css(0x3a2412);
  ctx.fillRect(x - 9, ground - 36, 10, 2);
  const lx = x - 7;
  const ly = ground - 26;
  const glow = ctx.createRadialGradient(lx, ly, 1, lx, ly, 12);
  glow.addColorStop(0, 'rgba(255,220,150,0.6)');
  glow.addColorStop(1, 'rgba(255,220,150,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(lx - 12, ly - 12, 24, 24);
  ctx.strokeStyle = css(0x2a1a0a);
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(lx, ground - 34);
  ctx.lineTo(lx, ly - 6);
  ctx.stroke();
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(lx - 3, ly - 5, 6, 9);
  ctx.strokeStyle = css(0x8a6420);
  ctx.strokeRect(lx - 3, ly - 5, 6, 9);
  ctx.beginPath();
  ctx.moveTo(lx, ly - 5);
  ctx.lineTo(lx, ly + 4);
  ctx.stroke();
  ctx.fillStyle = css(0x2a1a0a);
  ctx.beginPath();
  ctx.moveTo(lx - 4, ly - 5);
  ctx.lineTo(lx, ly - 9);
  ctx.lineTo(lx + 4, ly - 5);
  ctx.fill();
}
