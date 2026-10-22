import { css, onRoof, outlineBox, paintTexture, shade, type Ctx } from '../art/canvasKit';
import { figure } from '../art/crowds';
import { cellCentredBox, ellipseShadow } from '../art/fieldKit';
import { stone } from '../art/materials';
import { walls } from '../art/ornaments';
import { waterJar } from '../art/streetLife';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 2: inside the caravanserai beyond the Qur'án Gate. The court has
 * an arcade of lodging rooms on two sides (walls in `seraiWalls.ts`), a
 * stone pool, water jars, travellers taking tea, and the swept threshold of
 * a room its guest has already left.
 */

const STONE = 0x9a8a70;

export const CH02_SERAI_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  /** The court's pool: a low stone kerb round still water that holds the sky. */
  'ch2-serai-pool': (scene, def) => {
    const texH = 40;
    paintTexture(scene, def.texture, 64, texH, ctx => {
      const box = cellCentredBox(texH, 30, 5);
      walls(ctx, box, (c, w, h, light) => stone(c, w, h, { base: STONE, light, seed: light === 1 ? 641 : 642 }, 5));
      onRoof(ctx, box, (w, d) => {
        ctx.fillStyle = css(shade(0xb8a888, 1.1));
        ctx.fillRect(0, 0, w, d);
        const water = ctx.createLinearGradient(0, 0, w, d);
        water.addColorStop(0, css(0x6a8a9a));
        water.addColorStop(1, css(0x2e4a5a));
        ctx.fillStyle = water;
        ctx.fillRect(3, 3, w - 6, d - 6);
        // Dawn on the water.
        ctx.fillStyle = 'rgba(255,214,170,0.35)';
        ctx.fillRect(6, 8, w - 14, 1.2);
        ctx.fillRect(9, 13, w - 20, 1);
      });
      outlineBox(ctx, box);
    });
  },

  /** Three tall water jars on a timber stand, a tin cup on a cord. */
  'ch2-water-jars': (scene, def) => paintTexture(scene, def.texture, 48, 46, ctx => {
    ctx.fillStyle = css(0x5b3a20);
    ctx.fillRect(8, 36, 32, 3);
    ctx.fillRect(10, 39, 2, 4);
    ctx.fillRect(36, 39, 2, 4);
    waterJar(ctx, 14, 36, 6.5);
    waterJar(ctx, 34, 37, 6, 0x9a6a44);
    waterJar(ctx, 24, 39, 7, 0xb87048);
  }),

  /** Two travellers cross-legged over a tray of tea glasses. */
  'ch2-tea-travellers': (scene, def) => paintTexture(scene, def.texture, 60, 48, ctx => {
    ellipseShadow(ctx, 30, 40, 24, 5);
    figure(ctx, 16, 38, { robe: 0x6a5a40, trim: 0xd8c7a0, head: 'turban', headColor: 0xe8e0c8, skin: 0xc8a676, beard: 0x3a2a1c, seated: true });
    figure(ctx, 44, 40, { robe: 0x3f5a6a, head: 'kolah', headColor: 0x3a2a1c, skin: 0xd6b483, beard: 0x8a8070, seated: true });
    teaTray(ctx, 30, 41);
  }),

  /** Before an empty room: the reed mat rolled, a broom propped, the oil lamp left full on the step. */
  'ch2-swept-threshold': (scene, def) => paintTexture(scene, def.texture, 48, 40, ctx => {
    ellipseShadow(ctx, 24, 32, 17, 4);
    // Rolled reed mat.
    ctx.fillStyle = css(0xc8a868);
    ctx.beginPath();
    ctx.roundRect(8, 26, 20, 6, 3);
    ctx.fill();
    ctx.strokeStyle = css(0x8a6a3a, 0.7);
    ctx.lineWidth = 0.6;
    for (let x = 10; x < 27; x += 2.2) {
      ctx.beginPath();
      ctx.moveTo(x, 26.5);
      ctx.lineTo(x, 31.5);
      ctx.stroke();
    }
    ctx.fillStyle = css(0xa88848);
    ctx.beginPath();
    ctx.ellipse(28, 29, 1.8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // A palm-rib broom propped against nothing but the morning.
    ctx.strokeStyle = css(0x6a4a28);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(34, 8);
    ctx.lineTo(37, 26);
    ctx.stroke();
    ctx.fillStyle = css(0xb89a5a);
    ctx.beginPath();
    ctx.moveTo(35, 24);
    ctx.lineTo(41, 33);
    ctx.lineTo(33, 34);
    ctx.closePath();
    ctx.fill();
    // The clay lamp, filled for the next guest, unlit.
    ctx.fillStyle = css(0xa8603a);
    ctx.beginPath();
    ctx.ellipse(18, 36, 4, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(21, 35);
    ctx.lineTo(25, 34.5);
    ctx.lineTo(22, 37);
    ctx.closePath();
    ctx.fill();
  }),
};

function teaTray(ctx: Ctx, cx: number, cy: number): void {
  ctx.fillStyle = css(0xb8944a);
  ctx.beginPath();
  ctx.ellipse(cx, cy, 6, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = css(0x6a3a1a);
  ctx.beginPath();
  ctx.ellipse(cx - 1, cy - 3, 2.6, 2.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(200,90,40,0.85)';
  ctx.fillRect(cx + 2, cy - 2.5, 1.6, 2.2);
  ctx.fillRect(cx - 4.5, cy - 1.5, 1.6, 2.2);
}

/** Placeable objects for the caravanserai court. */
export const CH02_SERAI_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch2-serai-bay', label: 'Caravanserai', texture: 'ch2-serai-bay', kind: 'prop', category: 'buildings', color: 0xc49a64, blocks: true },
  { id: 'ch2-serai-bay-lit', label: 'Caravanserai', texture: 'ch2-serai-bay-lit', kind: 'prop', category: 'buildings', color: 0xc49a64, blocks: true },
  { id: 'ch2-serai-window', label: 'Caravanserai', texture: 'ch2-serai-window', kind: 'prop', category: 'buildings', color: 0xc49a64, blocks: true },
  { id: 'ch2-serai-pool', label: 'Well', texture: 'ch2-serai-pool', kind: 'prop', category: 'bridges-water', color: 0x2e4a5a, blocks: true },
  { id: 'ch2-water-jars', label: 'Water Jar', texture: 'ch2-water-jars', kind: 'prop', category: 'market-supplies', color: 0xa8603a, blocks: true },
  { id: 'ch2-tea-travellers', label: 'Pilgrim Cluster', texture: 'ch2-tea-travellers', kind: 'prop', category: 'people-crowds', color: 0x6a5a40, blocks: true },
  { id: 'ch2-swept-threshold', label: 'House Threshold', texture: 'ch2-swept-threshold', kind: 'prop', category: 'furnishings', color: 0xc8a868, blocks: false },
  { id: 'ch2-serai-merchant', label: 'Merchant', texture: 'ch2-serai-merchant', kind: 'character', category: 'characters', color: 0x5a3a5a, blocks: true,
    character: { body: 0x5a3a4a, skin: 0xd9bc8c, clothing: { style: 'robe', secondary: 0xc8b48a, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xd8c7a0, accent: 0x5a3a4a }, shadow: true } },
  { id: 'ch2-serai-cameleer', label: 'Townsman', texture: 'ch2-serai-cameleer', kind: 'character', category: 'characters', color: 0x6a5032, blocks: true,
    character: { body: 0x6a5032, skin: 0xa8805a, clothing: { style: 'cloak', secondary: 0x8a7050, accent: 0x3a2a1c }, hat: { style: 'headscarf', color: 0xd8c7a0 }, shadow: true } },
];
