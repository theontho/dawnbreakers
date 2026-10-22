import { paintEwer, paintSeatOfHonour } from '../art/isfahanFurnishings';
import { paintPalacePortico } from '../art/isfahanPalace';
import { paintBridgeSpan } from '../art/isfahanBridge';
import { paintMarketAwning, paintRiverReeds } from '../art/isfahanRiver';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';

/**
 * Chapter 5: Iṣfahán, 1846 to 1847. The bridge, market awning, river reeds,
 * the Muʿtamid's palace portico, the Imám-Jumʿih's ewer, and the empty seat
 * of honour.
 */
export const CH05_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch5-bridge-span': (scene, def) => paintBridgeSpan(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 2),
  'ch5-market-awning': (scene, def) => paintMarketAwning(scene, def.texture),
  'ch5-river-reeds': (scene, def) => paintRiverReeds(scene, def.texture),
  'ch5-palace-portico': (scene, def) => paintPalacePortico(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 3),
  'ch5-ewer': (scene, def) => paintEwer(scene, def.texture),
  'ch5-seat-of-honour': (scene, def) => paintSeatOfHonour(scene, def.texture),
};

/** Placeable map objects owned by chapter 5. */
export const CH05_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch5-bridge-span', label: 'Bridge Span', texture: 'ch5-bridge-span', kind: 'structure', category: 'bridges-water', color: 0x8a7552, blocks: false, footprint: { w: 5, h: 2 }, isometric: true },
  { id: 'ch5-market-awning', label: 'Market Awning', texture: 'ch5-market-awning', kind: 'structure', category: 'buildings', color: 0x315f68, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch5-river-reeds', label: 'River Reeds', texture: 'ch5-river-reeds', kind: 'prop', category: 'bridges-water', color: 0x637a3a, blocks: true },
  { id: 'ch5-palace-portico', label: 'Palace Portico', texture: 'ch5-palace-portico', kind: 'structure', category: 'buildings', color: 0xc8b174, blocks: true, footprint: { w: 5, h: 3 }, isometric: true },
  { id: 'ch5-ewer', label: 'Ewer', texture: 'ch5-ewer', kind: 'prop', category: 'furnishings', color: 0xcfd3da, blocks: true },
  { id: 'ch5-seat-of-honour', label: 'Seat of Honour', texture: 'ch5-seat-of-honour', kind: 'prop', category: 'furnishings', color: 0x7a1f2a, blocks: true },
  { id: 'ch5-mutamid', label: 'Mutamid', texture: 'ch5-mutamid', kind: 'character', category: 'characters', color: 0x5f4a72, blocks: true,
    character: { body: 0x4a3a5c, skin: 0xe2c9a4, clothing: { style: 'cloak', secondary: 0x2a2236, accent: 0xd8b04a }, hat: { style: 'tallHat', color: 0x1a1a1e, accent: 0xd8b04a }, shadow: true } },
  { id: 'ch5-imam-jumih', label: 'Mulla', texture: 'ch5-imam-jumih', kind: 'character', category: 'characters', color: 0x3a3226, blocks: true,
    character: { body: 0x3a3226, skin: 0xd9bc8c, clothing: { style: 'robe', secondary: 0x7a6a4a, accent: 0xe8dcc0 }, hat: { style: 'turban', color: 0x161616, accent: 0x6a5a3a }, hair: 0x9a948a, shadow: true } },
  { id: 'ch5-philosopher', label: 'Mulla', texture: 'ch5-philosopher', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xd1b07e, clothing: { style: 'cloak', secondary: 0x3a3a44, accent: 0xb8a27a }, hat: { style: 'turban', color: 0xe8e0cc, accent: 0x3a3a44 }, hair: 0x6a6460, shadow: true } },
  { id: 'ch5-gurgin', label: 'Officer', texture: 'ch5-gurgin', kind: 'character', category: 'characters', color: 0x3a2a2a, blocks: true,
    character: { body: 0x3a2a2a, skin: 0xe0c49a, clothing: { style: 'uniform', secondary: 0x1e2a3a, accent: 0xb89a4a }, hat: { style: 'tallHat', color: 0x1a1414 }, hair: 0x1a1008, shadow: true } },
  { id: 'ch5-scribe', label: 'Calligrapher', texture: 'ch5-scribe', kind: 'character', category: 'characters', color: 0x6a5a44, blocks: true,
    character: { body: 0x6a5a44, skin: 0xd8b98a, clothing: { style: 'sash', secondary: 0x2f4a5a, accent: 0xd8c7a0 }, hat: { style: 'cap', color: 0x2f4a5a }, hair: 0x2a1a10, shadow: true } },
  { id: 'ch5-cloth-printer', label: 'Townsman', texture: 'ch5-cloth-printer', kind: 'character', category: 'characters', color: 0x7a3a2a, blocks: true,
    character: { body: 0x6a5040, skin: 0xc49a6c, clothing: { style: 'apron', secondary: 0x8e2a22, accent: 0x24406e }, hat: { style: 'headscarf', color: 0x24406e }, hair: 0x1c120a, shadow: true } },
  { id: 'ch5-student', label: 'Witness', texture: 'ch5-student', kind: 'character', category: 'characters', color: 0x4a4a3a, blocks: true,
    character: { body: 0x4a4a3a, skin: 0xe0c49a, clothing: { style: 'robe', secondary: 0x6a6a52, accent: 0xd8c7a0 }, hat: { style: 'turban', color: 0xf0ead8, accent: 0x6a6a52 }, hair: 0x2a1a10, shadow: true } },
];
