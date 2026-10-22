import type Phaser from 'phaser';
import { footprintBox, paintTexture } from '../art/canvasKit';
import { BARRACK_H, drawBarrack, drawRoofParapet, parapetPart, ROOF_PARAPET_H, type BarrackStyle, type ParapetSide } from '../art/tabriz';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { CH09_PROP_TEXTURE_GENERATORS } from './chapter09Props';

/**
 * Chapter 9: the barrack square of Tabríz and the rooftops above it, 9 July
 * 1850. The barrack and the roof parapets are drawn in `art/tabriz.ts`;
 * threshold objects and rooftop props live in `chapter09Props.ts`.
 *
 * Each roof wall size is its own MapObjectId so the dimensions and texture
 * key stay paired.
 */

function paintRoofParapet(scene: Phaser.Scene, def: MapObjectDefinition, side: ParapetSide): void {
  const { box, texW, texH } = footprintBox(def.footprint?.w ?? 1, def.footprint?.h ?? 1, ROOF_PARAPET_H, 6);
  paintTexture(scene, def.texture, texW, texH, ctx => drawRoofParapet(ctx, parapetPart(box, side), side === 'divider'));
}

function paintBarrack(scene: Phaser.Scene, def: MapObjectDefinition, topPad: number, style: BarrackStyle): void {
  const { box, texW, texH } = footprintBox(def.footprint?.w ?? 3, def.footprint?.h ?? 3, BARRACK_H, topPad);
  paintTexture(scene, def.texture, texW, texH, ctx => drawBarrack(ctx, box, style));
}

export const CH09_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH09_PROP_TEXTURE_GENERATORS,

  // The wings close the square's north side: the outer runs end in piers
  // and carry the roof stair; the inner runs continue them unbroken.
  'ch9-barrack-2': (scene, def) => paintBarrack(scene, def, 12, { seed: 2 }),
  'ch9-barrack-3': (scene, def) => paintBarrack(scene, def, 46, { seed: 3, ends: true, stairHouse: true }),
  'ch9-barrack-front': (scene, def) => paintBarrack(scene, def, 30, { seed: 9, gate: true, ends: true }),

  'ch9-parapet-low': (scene, def) => paintRoofParapet(scene, def, 'divider'),
  'ch9-roof-wall-north': (scene, def) => paintRoofParapet(scene, def, 'north'),
  'ch9-roof-wall-east': (scene, def) => paintRoofParapet(scene, def, 'east'),
  'ch9-roof-wall-south': (scene, def) => paintRoofParapet(scene, def, 'south'),
};

/** Placeable map objects owned by chapter 9. */
export const CH09_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch9-barrack-front', label: 'Barrack Front', texture: 'ch9-barrack-front', kind: 'structure', category: 'buildings', color: 0x8c7f6a, blocks: true, footprint: { w: 3, h: 2 }, isometric: true },
  { id: 'ch9-barrack-2', label: 'Barrack Front', texture: 'ch9-barrack-2', kind: 'structure', category: 'buildings', color: 0x8c7f6a, blocks: true, footprint: { w: 2, h: 3 }, isometric: true },
  { id: 'ch9-barrack-3', label: 'Barrack Front', texture: 'ch9-barrack-3', kind: 'structure', category: 'buildings', color: 0x8c7f6a, blocks: true, footprint: { w: 3, h: 3 }, isometric: true },
  { id: 'ch9-cell-door', label: 'Closed Door', texture: 'ch9-cell-door', kind: 'prop', category: 'furnishings', color: 0x5b3320, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-cloth-bundle', label: 'Cloth Bundle', texture: 'ch9-cloth-bundle', kind: 'prop', category: 'market-supplies', color: 0xd0c1a0, blocks: true },
  { id: 'ch9-rope-coils', label: 'Rope Coils', texture: 'ch9-rope-coils', kind: 'prop', category: 'market-supplies', color: 0xb88742, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-empty-space', label: 'Empty Space', texture: 'ch9-empty-space', kind: 'prop', category: 'lighting-effects', color: 0x3f3a34, blocks: false },
  { id: 'ch9-pillar-ropes', label: 'Pillar', texture: 'ch9-pillar-ropes', kind: 'prop', category: 'barriers-prison', color: 0xb8a07a, blocks: true },
  { id: 'ch9-severed-ropes', label: 'Severed Ropes', texture: 'ch9-severed-ropes', kind: 'prop', category: 'barriers-prison', color: 0xbca06d, blocks: true },
  { id: 'ch9-open-door', label: 'Open Door', texture: 'ch9-open-door', kind: 'prop', category: 'furnishings', color: 0x0c0806, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-brick-dome', label: 'Brick Dome', texture: 'ch9-brick-dome', kind: 'prop', category: 'buildings', color: 0xb47e52, blocks: true },
  { id: 'ch9-washing-line', label: 'Washing Line', texture: 'ch9-washing-line', kind: 'prop', category: 'furnishings', color: 0x8a2f2a, blocks: true },
  { id: 'ch9-water-jar', label: 'Water Jar', texture: 'ch9-water-jar', kind: 'prop', category: 'market-supplies', color: 0xa86a3e, blocks: true },
  { id: 'ch9-parapet-low', label: 'Roof Parapet', texture: 'ch9-parapet-low', kind: 'structure', category: 'barriers-prison', color: 0x7a6e5e, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch9-roof-wall-north', label: 'Roof Parapet', texture: 'ch9-roof-wall-north', kind: 'structure', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 24, h: 1 }, isometric: true },
  { id: 'ch9-roof-wall-east', label: 'Roof Parapet', texture: 'ch9-roof-wall-east', kind: 'structure', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 16 }, isometric: true },
  { id: 'ch9-roof-wall-south', label: 'Roof Parapet', texture: 'ch9-roof-wall-south', kind: 'structure', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 24, h: 1 }, isometric: true },
  // People
  { id: 'ch9-witness', label: 'Witness', texture: 'ch9-witness', kind: 'character', category: 'characters', color: 0x6b5a44, blocks: true,
    character: { body: 0x4b3b34, skin: 0xd8c6a0, clothing: { style: 'vest', secondary: 0x7a5a3a, accent: 0xd8c7a0 }, hat: { style: 'cap', color: 0x7a5a3a }, shadow: true } },
  { id: 'ch9-soldier', label: 'Soldier', texture: 'ch9-soldier', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x4c5360, skin: 0xd6c09a, clothing: { style: 'uniform', secondary: 0x2e3742, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x2e3742 }, shadow: true } },
  { id: 'ch9-sam-khan', label: 'Sam Khan', texture: 'ch9-sam-khan', kind: 'character', category: 'characters', color: 0x59606a, blocks: true,
    character: { body: 0x59606a, skin: 0xd8c6a0, clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x3b4048, accent: 0xc9a55c }, shadow: true } },
  { id: 'ch9-anis', label: 'Anis', texture: 'ch9-anis', kind: 'character', category: 'characters', color: 0xe8e2d0, blocks: true,
    character: { body: 0xd8d0b8, skin: 0xe6cfa4, clothing: { style: 'robe', secondary: 0x8a9aa0, accent: 0xc9a55c }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x8a9aa0 }, shadow: true } },
  { id: 'ch9-amanuensis', label: 'Witness', texture: 'ch9-amanuensis', kind: 'character', category: 'characters', color: 0x2a2a30, blocks: true,
    character: { body: 0x2f2b2a, skin: 0xdcc49c, clothing: { style: 'robe', secondary: 0x4a4440, accent: 0xc9a55c }, hat: { style: 'turban', color: 0x1a1a1a }, shadow: true } },
  { id: 'ch9-farrash', label: 'Officer', texture: 'ch9-farrash', kind: 'character', category: 'characters', color: 0x8a2a24, blocks: true,
    character: { body: 0x8a2a24, skin: 0xcfb08a, clothing: { style: 'vest', secondary: 0x5a1a16, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x1a1a1a }, hair: 0x1d1610, shadow: true } },
  { id: 'ch9-water-seller', label: 'Water-Carrier', texture: 'ch9-water-seller', kind: 'character', category: 'characters', color: 0x5a6a5a, blocks: true,
    character: { body: 0x5a6a5a, skin: 0xc49a6c, clothing: { style: 'apron', secondary: 0x8a6a44, accent: 0x3a4a5a }, hat: { style: 'cap', color: 0xd8cfb8 }, shadow: true } },
  { id: 'ch9-widow', label: 'Village Woman', texture: 'ch9-widow', kind: 'character', category: 'characters', color: 0x2a2a34, blocks: true,
    character: { body: 0x2a2a34, skin: 0xd6b48a, clothing: { style: 'wrap', secondary: 0x1a1a24, accent: 0x6a5a7a }, hat: { style: 'veil', color: 0x1f1f2a }, shadow: true } },
  { id: 'ch9-student', label: 'Mulla', texture: 'ch9-student', kind: 'character', category: 'characters', color: 0x4a4038, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xe0c8a0, clothing: { style: 'cloak', secondary: 0x3a3028, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xf2ead6 }, shadow: true } },
  { id: 'ch9-coppersmith', label: 'Townsman', texture: 'ch9-coppersmith', kind: 'character', category: 'characters', color: 0x7a4a2a, blocks: true,
    character: { body: 0x4a3a2e, skin: 0xc8a47a, clothing: { style: 'apron', secondary: 0xb8743a, accent: 0xd9a441 }, hat: { style: 'cap', color: 0x3a2a1a }, hair: 0xb8b0a0, shadow: true } },
];
