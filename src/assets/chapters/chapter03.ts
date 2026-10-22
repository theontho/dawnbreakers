import { footprintBox, paintTexture } from '../art/canvasKit';
import { figure, type FigureStyle } from '../art/crowds';
import { drawArcadeBay, drawKaaba, drawMaqam, drawMinaret } from '../art/mecca';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';
import { CH03_SHIP_TEXTURE_GENERATORS } from './chapter03Ship';

/**
 * Chapter 3: the pilgrim ship (see `chapter03Ship.ts`) and the Sacred
 * Mosque at Mecca: the Kaʿba, domed colonnades, minarets, the Station of
 * Abraham, and the "courtyard hush" floor marker where the proclamation is
 * heard. The Báb is never drawn; His presence is told through narration.
 */

/** Pilgrims in plain travelling white: two standing, one bareheaded in iḥrám, one seated. */
const PILGRIMS: ReadonlyArray<{ dx: number; dy: number; style: FigureStyle }> = [
  { dx: 13, dy: 42, style: { robe: 0xd8d0bd, trim: 0x9c8458, head: 'turban', headColor: 0xf7f0dc, skin: 0xd8bd8a, beard: 0x3a2a1c } },
  { dx: 29, dy: 40, style: { robe: 0xb8aa8d, head: 'scarf', headColor: 0xe8e0c8, skin: 0xb8916d, beard: 0x1f1610 } },
  { dx: 45, dy: 43, style: { robe: 0xf2ead6, head: 'bare', skin: 0xc49a6c, beard: 0x2a1c12 } },
  { dx: 18, dy: 52, style: { robe: 0xa89878, trim: 0xe4dccb, head: 'turban', headColor: 0xd8c7a0, skin: 0xd1b37c, beard: 0xd8d2c4, seated: true } },
];

export const CH03_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH03_SHIP_TEXTURE_GENERATORS,

  'ch3-kaaba': (scene, def) => {
    const { box, texW, texH } = footprintBox(2, 2, 74, 8);
    paintTexture(scene, def.texture, texW, texH, ctx => drawKaaba(ctx, box));
  },

  'ch3-arcade': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 32, 28);
    paintTexture(scene, def.texture, texW, texH, ctx => drawArcadeBay(ctx, box));
  },

  'ch3-minaret': (scene, def) => paintTexture(scene, def.texture, 48, 156, ctx => drawMinaret(ctx, 24, 154)),

  'ch3-maqam': (scene, def) => paintTexture(scene, def.texture, 40, 56, ctx => drawMaqam(ctx, 20, 54)),

  'ch3-pilgrim-cluster': (scene, def) => {
    paintTexture(scene, def.texture, 58, 56, ctx => {
      for (const { dx, dy, style } of PILGRIMS) figure(ctx, dx, dy, style);
    });
  },

  /** A pool of stillness on the paving: a soft gold glow, a ring, and light rising. */
  'ch3-courtyard-hush': (scene, def) => {
    paintTexture(scene, def.texture, 64, 44, ctx => {
      const cx = 32;
      const cy = 32;
      const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 28);
      glow.addColorStop(0, 'rgba(255,240,200,0.42)');
      glow.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.save();
      ctx.scale(1, 0.4);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy / 0.4, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.strokeStyle = 'rgba(201,165,92,0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 22, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(247,240,220,0.45)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 17, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
      for (const dx of [-10, -4, 3, 9]) {
        const ray = ctx.createLinearGradient(0, cy, 0, cy - 28);
        ray.addColorStop(0, 'rgba(255,240,200,0.35)');
        ray.addColorStop(1, 'rgba(255,240,200,0)');
        ctx.fillStyle = ray;
        ctx.fillRect(cx + dx - 1, cy - 28 + Math.abs(dx), 2, 28 - Math.abs(dx));
      }
    });
  },
};

/** Placeable map objects owned by chapter 3. */
export const CH03_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch3-kaaba', label: 'Kaaba', texture: 'ch3-kaaba', kind: 'structure', category: 'shrines', color: 0x181512, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch3-arcade', label: 'Colonnade', texture: 'ch3-arcade', kind: 'structure', category: 'shrines', color: 0xc8b48a, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch3-minaret', label: 'Minaret', texture: 'ch3-minaret', kind: 'prop', category: 'shrines', color: 0xd8c7a0, blocks: true },
  { id: 'ch3-maqam', label: 'Station of Abraham', texture: 'ch3-maqam', kind: 'prop', category: 'shrines', color: 0xc9a55c, blocks: true },
  { id: 'ch3-pilgrim-cluster', label: 'Pilgrim Cluster', texture: 'ch3-pilgrim-cluster', kind: 'prop', category: 'people-crowds', color: 0x6b5a44, blocks: true },
  { id: 'ch3-courtyard-hush', label: 'Courtyard Hush', texture: 'ch3-courtyard-hush', kind: 'prop', category: 'shrines', color: 0xd8c07a, blocks: false },
  { id: 'ch3-cabin', label: 'Ship Cabin', texture: 'ch3-cabin', kind: 'structure', category: 'furnishings', color: 0x6a4325, blocks: true, footprint: { w: 3, h: 4 }, isometric: true },
  { id: 'ch3-cabin-threshold', label: 'House Threshold', texture: 'ch3-cabin-threshold', kind: 'prop', category: 'furnishings', color: 0x2f5a3a, blocks: false },
  { id: 'ch3-mast', label: 'Ship Mast', texture: 'ch3-mast', kind: 'prop', category: 'furnishings', color: 0x8a5a2a, blocks: true },
  { id: 'ch3-ship-rail', label: 'Ship Rail', texture: 'ch3-ship-rail', kind: 'prop', category: 'furnishings', color: 0x6b5136, blocks: false },
  { id: 'ch3-hatch', label: 'Hold Hatch', texture: 'ch3-hatch', kind: 'prop', category: 'furnishings', color: 0x5a3a1f, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch3-water-cask', label: 'Water Cask', texture: 'ch3-water-cask', kind: 'prop', category: 'market-supplies', color: 0x7a5030, blocks: true },
  { id: 'ch3-brazier', label: 'Brazier', texture: 'ch3-brazier', kind: 'prop', category: 'lighting-effects', color: 0xe06a2a, blocks: true },
  { id: 'ch3-rope-coil', label: 'Rope Coils', texture: 'ch3-rope-coil', kind: 'prop', category: 'market-supplies', color: 0xb89a68, blocks: false },
  { id: 'ch3-skiff', label: 'Ship\'s Boat', texture: 'ch3-skiff', kind: 'prop', category: 'bridges-water', color: 0x4b2d18, blocks: false },
  { id: 'ch3-muhit', label: 'Muhit', texture: 'ch3-muhit', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0x2a2520, skin: 0xdfc28f, clothing: { style: 'robe', secondary: 0xf2ead6, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x2a2520 }, shadow: true } },
  { id: 'ch3-pilgrim', label: 'Pilgrim', texture: 'ch3-pilgrim', kind: 'character', category: 'characters', color: 0xf2ead6, blocks: true,
    character: { body: 0x6b5a44, skin: 0xc49a6c, clothing: { style: 'wrap', secondary: 0xf7f0dc, accent: 0x9c8458 }, hat: { style: 'none' }, hair: 0x1f1610, shadow: true } },
  { id: 'ch3-quddus', label: 'Quddus', texture: 'ch3-quddus', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0x263d4f, skin: 0xe8d8b0, clothing: { style: 'robe', secondary: 0xf2ead6, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x263d4f }, shadow: true } },
  { id: 'ch3-sailor', label: 'Sailor', texture: 'ch3-sailor', kind: 'character', category: 'characters', color: 0x2f4a5f, blocks: true,
    character: { body: 0x5b3a24, skin: 0xb8916d, clothing: { style: 'vest', secondary: 0x2f5f73, accent: 0xd8c7a0 }, hat: { style: 'cap', color: 0x3f5f73 }, shadow: true } },
  { id: 'ch3-captain', label: 'Sailor', texture: 'ch3-captain', kind: 'character', category: 'characters', color: 0x2f3f5a, blocks: true,
    character: { body: 0x2f3f5a, skin: 0xa8805a, clothing: { style: 'sash', secondary: 0xe8e0c8, accent: 0xb84a3a }, hat: { style: 'turban', color: 0xd8c7a0, accent: 0xb84a3a }, shadow: true } },
  { id: 'ch3-ship-pilgrim', label: 'Ship Pilgrim', texture: 'ch3-ship-pilgrim', kind: 'character', category: 'characters', color: 0x8f5a2f, blocks: true,
    character: { body: 0x3a3030, skin: 0xe2c997, clothing: { style: 'wrap', secondary: 0x5a4a48, accent: 0x9c8458 }, hat: { style: 'veil', color: 0x2a2424 }, shadow: true } },
  { id: 'ch3-abul-hasan', label: 'Merchant', texture: 'ch3-abul-hasan', kind: 'character', category: 'characters', color: 0x6a4a2a, blocks: true,
    character: { body: 0x6a4a2a, skin: 0xdcc08e, clothing: { style: 'robe', secondary: 0xc8b48a, accent: 0x3f6a6a }, hat: { style: 'turban', color: 0xe8e0c8, accent: 0x6a4a2a }, shadow: true } },
  { id: 'ch3-water-seller', label: 'Water-Carrier', texture: 'ch3-water-seller', kind: 'character', category: 'characters', color: 0x8a6a42, blocks: true,
    character: { body: 0x8a6a42, skin: 0x8a6448, clothing: { style: 'wrap', secondary: 0xe8e0c8, accent: 0x3f6a8a }, hat: { style: 'cap', color: 0xf2ead6 }, shadow: true } },
];
