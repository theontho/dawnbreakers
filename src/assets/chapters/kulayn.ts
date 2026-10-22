import type { TentStyle } from '../art/pavilion';
import { paintTent } from '../art/badasht';
import { paintTexture } from '../art/canvasKit';
import { paintKashanHall } from '../art/kashanHall';
import {
  ALMOND_BLOSSOM, APRICOT_BLOSSOM, BAY_HORSE, blossomTex, drawBlossomTree, drawHorse, drawTentThreshold, GREY_HORSE,
  HORSE_TEX, paintHallThreshold, type BlossomStyle, type HorseStyle,
} from '../art/kulaynProps';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Káshán and Kulayn, spring 1847: the summer hall of Ḥájí Mírzá Jání's
 * house (`art/kashanHall.ts`), the escort's horses, orchards in blossom,
 * the Grand Vizier's tent, and the two thresholds the chapter is told
 * through (`art/kulaynProps.ts`). The town, its gate, the shrine of
 * Shaykh-i-Kulayní and the village houses come from the shared kits.
 * The Báb is never a sprite.
 */

/** The Grand Vizier's own tent, pitched for the Prisoner: madder red, a cream valance, an awning before the door. */
const VIZIER_TENT: TentStyle = { cloth: 0x9a3428, trim: 0xe8d8b0, lining: 0xf0e2c0, seed: 731, awning: true };

const horse = (s: HorseStyle): TextureGenerator => (scene, def) =>
  paintTexture(scene, def.texture, HORSE_TEX.w, HORSE_TEX.h, ctx => drawHorse(ctx, s));

const blossom = (s: BlossomStyle): TextureGenerator => (scene, def) => {
  const { w, h } = blossomTex(s);
  paintTexture(scene, def.texture, w, h, ctx => drawBlossomTree(ctx, s));
};

export const KULAYN_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'kulayn-hall': (scene, def) => paintKashanHall(scene, def.texture, def.footprint?.w ?? 9, def.footprint?.h ?? 4),
  'kulayn-hall-threshold': (scene, def) => paintHallThreshold(scene, def.texture),
  'kulayn-tent-threshold': (scene, def) => paintTexture(scene, def.texture, 64, 48, ctx => drawTentThreshold(ctx, 64, 48)),
  'kulayn-vizier-tent': (scene, def) => paintTent(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 4, VIZIER_TENT),
  'kulayn-horse': horse(BAY_HORSE),
  'kulayn-horse-grey': horse(GREY_HORSE),
  'kulayn-almond': blossom(ALMOND_BLOSSOM),
  'kulayn-apricot': blossom(APRICOT_BLOSSOM),
};

export const KULAYN_OBJECTS: MapObjectDefinition[] = [
  { id: 'kulayn-hall', label: 'Courtyard House', texture: 'kulayn-hall', kind: 'structure', category: 'buildings', color: 0xdccaa4, blocks: true, footprint: { w: 9, h: 4 }, isometric: true },
  { id: 'kulayn-hall-threshold', label: 'House Threshold', texture: 'kulayn-hall-threshold', kind: 'prop', category: 'furnishings', color: 0xb0a084, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'kulayn-tent-threshold', label: 'Rug', texture: 'kulayn-tent-threshold', kind: 'prop', category: 'furnishings', color: 0x8a3226, blocks: true },
  { id: 'kulayn-vizier-tent', label: 'Pavilion', texture: 'kulayn-vizier-tent', kind: 'structure', category: 'buildings', color: 0x9a3428, blocks: true, footprint: { w: 5, h: 4 }, isometric: true },
  { id: 'kulayn-horse', label: 'Horse', texture: 'kulayn-horse', kind: 'prop', category: 'market-supplies', color: 0x7a4428, blocks: true },
  { id: 'kulayn-horse-grey', label: 'Horse', texture: 'kulayn-horse-grey', kind: 'prop', category: 'market-supplies', color: 0xb4ada2, blocks: true },
  { id: 'kulayn-almond', label: 'Blossom Tree', texture: 'kulayn-almond', kind: 'prop', category: 'plants', color: 0xf2dfe2, blocks: true },
  { id: 'kulayn-apricot', label: 'Blossom Tree', texture: 'kulayn-apricot', kind: 'prop', category: 'plants', color: 0xf6eee6, blocks: true },
  // People.
  { id: 'kulayn-jani', label: 'Merchant', texture: 'kulayn-jani', kind: 'character', category: 'characters', color: 0x4a3a5a, blocks: true,
    character: { body: 0x4a3a5a, skin: 0xd6b48a, clothing: { style: 'sash', secondary: 0x2a2a3a, accent: 0xd8b04a }, hat: { style: 'cap', color: 0x2a2420 }, hair: 0x2a1c12, shadow: true } },
  { id: 'kulayn-muhammad-big', label: 'Officer', texture: 'kulayn-muhammad-big', kind: 'character', category: 'characters', color: 0x5a3a2a, blocks: true,
    character: { body: 0x5a3a2a, skin: 0xcaa47a, clothing: { style: 'uniform', secondary: 0x3a2618, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x1a1414 }, hair: 0x1d1610, shadow: true } },
  { id: 'kulayn-colleague', label: 'Officer', texture: 'kulayn-colleague', kind: 'character', category: 'characters', color: 0x2a3a4a, blocks: true,
    character: { body: 0x2a3a4a, skin: 0xd0b088, clothing: { style: 'uniform', secondary: 0x1a2430, accent: 0xb89a4a }, hat: { style: 'tallHat', color: 0x16161a }, hair: 0x1a120c, shadow: true } },
  { id: 'kulayn-rider', label: 'Soldier', texture: 'kulayn-rider', kind: 'character', category: 'characters', color: 0x4a4436, blocks: true,
    character: { body: 0x4a4436, skin: 0xc8a070, clothing: { style: 'cloak', secondary: 0x2e2a22, accent: 0x8a6a3a }, hat: { style: 'tallHat', color: 0x2a2420 }, hair: 0x1c120a, shadow: true } },
  { id: 'kulayn-abdul-baqi', label: 'Mulla', texture: 'kulayn-abdul-baqi', kind: 'character', category: 'characters', color: 0x2a2a2e, blocks: true,
    character: { body: 0x3a3430, skin: 0xd8bc90, clothing: { style: 'cloak', secondary: 0x22201e, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0x1e1e22, accent: 0x3a3430 }, hair: 0x8a8278, shadow: true } },
  { id: 'kulayn-abdul-karim', label: 'Companion', texture: 'kulayn-abdul-karim', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xd2b088, clothing: { style: 'robe', secondary: 0x3a3024, accent: 0xd8c8a0 }, hat: { style: 'turban', color: 0xece4d0, accent: 0x5a4a3a }, hair: 0x2a1c12, shadow: true } },
  { id: 'kulayn-kandi', label: 'Courier', texture: 'kulayn-kandi', kind: 'character', category: 'characters', color: 0x3a4a3a, blocks: true,
    character: { body: 0x3a4a3a, skin: 0xd0aa80, clothing: { style: 'cloak', secondary: 0x5a4a30, accent: 0xd8c8a0 }, hat: { style: 'turban', color: 0xe8e0cc, accent: 0x3a4a3a }, hair: 0x1c140c, shadow: true } },
  { id: 'kulayn-villager', label: 'Village Woman', texture: 'kulayn-villager', kind: 'character', category: 'characters', color: 0x7a4a2a, blocks: true,
    character: { body: 0x7a4a2a, skin: 0xcca47a, clothing: { style: 'wrap', secondary: 0x3a5a4a, accent: 0xd9a441 }, hat: { style: 'headscarf', color: 0xb83a2a }, shadow: true } },
];
