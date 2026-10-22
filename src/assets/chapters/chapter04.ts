import { css, footprintBox, onRoof, outlineBox, paintTexture, roofPoint, shade, type Ctx, type IsoBox } from '../art/canvasKit';
import { ellipseShadow, litGradient, sideGradient } from '../art/fieldKit';
import { brick, planks } from '../art/materials';
import { walls } from '../art/ornaments';
import { drawMinbar, drawPrayerArcade } from '../art/vakil';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';

/**
 * Chapter 4: return to Shíráz, 1845 to 1846. The Vakíl pulpit and prayer
 * arches, the governor's posted decree, a dyer's vats, and the people of a
 * frightened city.
 */

const DYES = [0x24406e, 0x7a2236, 0xc9a23a] as const;

export const CH04_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch4-pulpit': (scene, def) => {
    const texH = 92;
    // Long and narrow, centred on the cell: 32 deep along the stair, 12 across, the seat above a man's head.
    paintTexture(scene, def.texture, 64, texH, ctx => drawMinbar(ctx, { x: 42, y: texH - 5.5, w: 32, d: 12, h: 44 }));
  },

  /** A run of the Vakíl prayer-hall arcade. Placed as a 4x2 building. */
  'ch4-prayer-arch': (scene, def) => {
    const { box, texW, texH } = footprintBox(4, 2, 84, 24);
    paintTexture(scene, def.texture, texW, texH, ctx => drawPrayerArcade(ctx, box));
  },

  /** The governor's decree nailed to a board under a little roof, sealed in red. */
  'ch4-decree-board': (scene, def) => {
    paintTexture(scene, def.texture, 56, 64, ctx => {
      ellipseShadow(ctx, 30, 59, 20, 4);
      for (const x of [13, 41]) {
        ctx.fillStyle = sideGradient(ctx, x - 2.5, x + 2.5, 0x4a3320);
        ctx.fillRect(x - 2.5, 16, 5, 43);
      }
      ctx.save();
      ctx.translate(7, 18);
      planks(ctx, 42, 26, { base: 0x7b5d39, light: 1, seed: 41 }, true, 6);
      ctx.restore();
      ctx.strokeStyle = css(0x2b1d12);
      ctx.lineWidth = 1.2;
      ctx.strokeRect(7, 18, 42, 26);
      // A little gabled roof against the rain.
      ctx.fillStyle = css(0x5a3a20);
      ctx.beginPath();
      ctx.moveTo(3, 19);
      ctx.lineTo(28, 8);
      ctx.lineTo(53, 19);
      ctx.lineTo(50, 20);
      ctx.lineTo(28, 11);
      ctx.lineTo(6, 20);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = css(0x8a6038, 0.9);
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(3, 18.5);
      ctx.lineTo(28, 7.5);
      ctx.stroke();
      // The farmán: a sheet curling at the corner, lines of shikasta, the seal.
      ctx.fillStyle = css(0xeee1bf);
      ctx.beginPath();
      ctx.moveTo(13, 21);
      ctx.lineTo(43, 21);
      ctx.lineTo(43, 38);
      ctx.quadraticCurveTo(41, 41, 38, 41);
      ctx.lineTo(13, 41);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = css(0xc8b890);
      ctx.beginPath();
      ctx.moveTo(43, 38);
      ctx.quadraticCurveTo(40, 38, 38, 41);
      ctx.lineTo(43, 38);
      ctx.fill();
      ctx.strokeStyle = css(0x3a2a1a, 0.8);
      ctx.lineWidth = 0.6;
      for (let y = 25; y <= 36; y += 2.6) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        for (let x = 40; x > 16 + ((y * 5) % 6); x -= 2) ctx.lineTo(x - 1, y + (x % 4 === 0 ? -0.8 : 0.4));
        ctx.stroke();
      }
      ctx.fillStyle = css(0x8e2a22);
      ctx.beginPath();
      ctx.arc(19, 37, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = css(0xc84a3a, 0.7);
      ctx.fillRect(18, 36, 1, 1);
      ctx.fillStyle = css(0x2a2420);
      for (const [x, y] of [[14, 22], [42, 22], [14, 40]] as const) ctx.fillRect(x - 0.5, y - 0.5, 1.2, 1.2);
    });
  },

  /** The dyer's yard: earthen vats sunk in a brick platform, wet skeins drying on a pole. */
  'ch4-dye-vats': (scene, def) => {
    paintTexture(scene, def.texture, 60, 48, ctx => {
      const platform: IsoBox = { x: 39, y: 46, w: 40, d: 22, h: 8 };
      ellipseShadow(ctx, 32, 38, 26, 8, 0.24);
      drawDryingPole(ctx, true);
      walls(ctx, platform, (c, w, h, light) => {
        brick(c, w, h, { base: 0xa8784a, light, seed: 51 }, 3, 7);
        // Old runs of dye down the brick.
        DYES.forEach((dye, i) => {
          c.fillStyle = css(dye, 0.35);
          c.fillRect(6 + i * 11, 0, 2.5, h * 0.8);
        });
      });
      onRoof(ctx, platform, (w, d) => {
        ctx.fillStyle = css(shade(0x9a7050, 1.08));
        ctx.fillRect(0, 0, w, d);
      });
      outlineBox(ctx, platform);
      DYES.forEach((dye, i) => vat(ctx, roofPoint(platform, 8 + i * 12, 11), dye));
      drawDryingPole(ctx, false);
    });
  },
};

/** A sunken vat: a clay rim and the dye's still surface catching the light. */
function vat(ctx: Ctx, at: { x: number; y: number }, dye: number): void {
  ctx.fillStyle = css(0x6b5a44);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y, 7.5, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = litGradient(ctx, at.x, at.y, 6, dye, 0.7);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y + 0.5, 6, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.beginPath();
  ctx.ellipse(at.x - 2, at.y - 0.2, 2, 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** The drying pole: the far post behind the platform, or the near post, crossbar and skeins in front. */
function drawDryingPole(ctx: Ctx, far: boolean): void {
  ctx.fillStyle = sideGradient(ctx, 0, 3, 0x4a3320);
  if (far) {
    ctx.fillRect(51, 6, 2.4, 26);
    return;
  }
  ctx.fillRect(6, 10, 2.4, 30);
  ctx.strokeStyle = css(0x4a3320);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6, 10);
  ctx.lineTo(54, 6);
  ctx.stroke();
  [...DYES, 0x2f5a3a].forEach((dye, i) => {
    const x = 14 + i * 9;
    const y = 10 - (x - 6) / 12;
    const len = 9 + (i % 2) * 4;
    ctx.fillStyle = litGradient(ctx, x + 2, y + len / 2, 4, dye, 0.6);
    ctx.fillRect(x, y, 4.5, len);
    ctx.strokeStyle = css(shade(dye, 0.6), 0.8);
    ctx.lineWidth = 0.5;
    for (const dx of [1.2, 2.4, 3.6]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y);
      ctx.lineTo(x + dx, y + len);
      ctx.stroke();
    }
    ctx.fillStyle = css(dye, 0.5);
    ctx.fillRect(x + 1.5, y + len, 1, 2);
  });
}

/** Placeable map objects owned by chapter 4. */
export const CH04_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch4-pulpit', label: 'Pulpit', texture: 'ch4-pulpit', kind: 'prop', category: 'shrines', color: 0x8a5a2a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch4-prayer-arch', label: 'Prayer Arch', texture: 'ch4-prayer-arch', kind: 'prop', category: 'shrines', color: 0xd8c07a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch4-officer', label: 'Officer', texture: 'ch4-officer', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x31424a, skin: 0xd9c79a, clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x6f2222 }, shadow: true } },
  { id: 'ch4-witness', label: 'Witness', texture: 'ch4-witness', kind: 'character', category: 'characters', color: 0x6b5a44, blocks: true,
    character: { body: 0x5b4936, skin: 0xd1b37c, clothing: { style: 'robe', secondary: 0x7a5a3a, accent: 0xd8c7a0 }, hat: { style: 'turban', color: 0xd8c7a0, accent: 0x7a5a3a }, shadow: true } },
  { id: 'ch4-quddus', label: 'Quddus', texture: 'ch4-quddus', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0xead9ad, skin: 0xe6c89a, clothing: { style: 'cloak', secondary: 0x2d2d2d, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x2d2d2d }, shadow: true } },
  { id: 'ch4-townsman', label: 'Townsman', texture: 'ch4-townsman', kind: 'character', category: 'characters', color: 0x8a5a2a, blocks: true,
    character: { body: 0x5b4936, skin: 0xd1b37c, clothing: { style: 'vest', secondary: 0x7a5a3a, accent: 0xd8c7a0 }, hat: { style: 'cap', color: 0x7a5a3a }, shadow: true } },
  { id: 'ch4-decree-board', label: 'Decree Board', texture: 'ch4-decree-board', kind: 'prop', category: 'furnishings', color: 0x7b5d39, blocks: true },
  { id: 'ch4-dye-vats', label: 'Dye Vats', texture: 'ch4-dye-vats', kind: 'prop', category: 'market-supplies', color: 0x24406e, blocks: true },
  { id: 'ch4-mulla-sadiq', label: 'Mulla', texture: 'ch4-mulla-sadiq', kind: 'character', category: 'characters', color: 0x3d3a34, blocks: true,
    character: { body: 0x3d3a34, skin: 0xd8b98a, clothing: { style: 'robe', secondary: 0x5a5448, accent: 0xb8a27a }, hat: { style: 'turban', color: 0xeae2cc, accent: 0x5a5448 }, hair: 0xd8d2c4, shadow: true } },
  { id: 'ch4-khal', label: 'Merchant', texture: 'ch4-khal', kind: 'character', category: 'characters', color: 0x2f3a2e, blocks: true,
    character: { body: 0x2f3a2e, skin: 0xd9bf8e, clothing: { style: 'cloak', secondary: 0x5a4a32, accent: 0xc9a55c }, hat: { style: 'turban', color: 0x2a5a32, accent: 0x1c2a1c }, hair: 0x3a2a1c, shadow: true } },
  { id: 'ch4-vahid', label: 'Mulla', texture: 'ch4-vahid', kind: 'character', category: 'characters', color: 0x2a2a3a, blocks: true,
    character: { body: 0x2a2a3a, skin: 0xe0c69a, clothing: { style: 'cloak', secondary: 0x6b5a3a, accent: 0xe8d9b0 }, hat: { style: 'turban', color: 0x1a1a1a, accent: 0xc9a55c }, hair: 0x1c140c, shadow: true } },
  { id: 'ch4-imam-jumih', label: 'Mulla', texture: 'ch4-imam-jumih', kind: 'character', category: 'characters', color: 0x4a3f33, blocks: true,
    character: { body: 0x4a3f33, skin: 0xd5b585, clothing: { style: 'robe', secondary: 0x8a7a5a, accent: 0xf0e6cc }, hat: { style: 'turban', color: 0xf4eedc, accent: 0x8a7a5a }, hair: 0xbcb6a8, shadow: true } },
  { id: 'ch4-baker', label: 'Townsman', texture: 'ch4-baker', kind: 'character', category: 'characters', color: 0x9a8a6a, blocks: true,
    character: { body: 0x8a7a5a, skin: 0xc8a477, clothing: { style: 'apron', secondary: 0xe8dcc0, accent: 0x6b4a2a }, hat: { style: 'cap', color: 0xe8dcc0 }, hair: 0x2d1b10, shadow: true } },
  { id: 'ch4-water-boy', label: 'Water-Carrier', texture: 'ch4-water-boy', kind: 'character', category: 'characters', color: 0x5a6a7a, blocks: true,
    character: { body: 0x5a6a7a, skin: 0xc49a6c, clothing: { style: 'sash', secondary: 0x8a6a4a, accent: 0xd8c7a0 }, hat: { style: 'none' }, hair: 0x1c120a, shadow: true } },
];
