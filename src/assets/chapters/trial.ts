import { paintResidenceGate } from '../art/tabrizResidence';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { paintSlippers } from './trialProps';

/**
 * The trial at Tabríz, summer 1848, at true scale: the gate of the
 * governor's residence (`art/tabrizResidence.ts`), the slippers left at the
 * foot of the hall steps, and the people who wait outside the examination.
 * The Báb is never a sprite; the hall itself is the residence's columned
 * tālār (`ch5-palace-portico`), seen only from the courtyard.
 */

export const TRIAL_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'trial-residence-gate': (scene, def) => paintResidenceGate(scene, def.texture, def.footprint?.w ?? 5, def.footprint?.h ?? 3),
  'trial-slippers': (scene, def) => paintSlippers(scene, def.texture),
};

/** Placeable map objects owned by the trial chapter. */
export const TRIAL_OBJECTS: MapObjectDefinition[] = [
  { id: 'trial-residence-gate', label: 'Residence Gate', texture: 'trial-residence-gate', kind: 'structure', category: 'buildings', color: 0xb08458, blocks: true, footprint: { w: 5, h: 3 }, isometric: true },
  { id: 'trial-slippers', label: 'Slippers', texture: 'trial-slippers', kind: 'prop', category: 'furnishings', color: 0x8a2a22, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  // People
  { id: 'trial-azim', label: 'Mulla', texture: 'trial-azim', kind: 'character', category: 'characters', color: 0x3a3a30, blocks: true,
    character: { body: 0x4a4436, skin: 0xd6b88a, clothing: { style: 'cloak', secondary: 0x2e2a24, accent: 0xd8cfb8 }, hat: { style: 'turban', color: 0xf0e8d4, accent: 0x6a6450 }, hair: 0x5a5048, shadow: true } },
  { id: 'trial-merchant', label: 'Merchant', texture: 'trial-merchant', kind: 'character', category: 'characters', color: 0x6a3a5a, blocks: true,
    character: { body: 0x5a3a52, skin: 0xd2b088, clothing: { style: 'sash', secondary: 0x8a6a2a, accent: 0xd8b04a }, hat: { style: 'cap', color: 0x2a2a2e }, hair: 0x2a1a10, shadow: true } },
  { id: 'trial-gate-farrash', label: 'Officer', texture: 'trial-gate-farrash', kind: 'character', category: 'characters', color: 0x8a2a24, blocks: true,
    character: { body: 0x8a2a24, skin: 0xcaa880, clothing: { style: 'vest', secondary: 0x5a1a16, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x1a1a1a }, hair: 0x1d1610, shadow: true } },
  { id: 'trial-page', label: 'Witness', texture: 'trial-page', kind: 'character', category: 'characters', color: 0x2a4a6a, blocks: true,
    character: { body: 0x2a4a6a, skin: 0xe2c8a0, clothing: { style: 'sash', secondary: 0x1a2a3a, accent: 0xd8b04a }, hat: { style: 'tallHat', color: 0x1a1a1e }, shadow: true } },
  { id: 'trial-secretary', label: 'Calligrapher', texture: 'trial-secretary', kind: 'character', category: 'characters', color: 0x5a4a3a, blocks: true,
    character: { body: 0x5a4a3a, skin: 0xdcc098, clothing: { style: 'robe', secondary: 0x3a3428, accent: 0xd8c7a0 }, hat: { style: 'turban', color: 0xe8e0cc, accent: 0x3a3428 }, hair: 0x2a1a10, shadow: true } },
  { id: 'trial-mamaqani', label: 'Mulla', texture: 'trial-mamaqani', kind: 'character', category: 'characters', color: 0x2a2620, blocks: true,
    character: { body: 0x2a2620, skin: 0xd6b88c, clothing: { style: 'cloak', secondary: 0x5a4a36, accent: 0xe8dcc0 }, hat: { style: 'turban', color: 0xf2ead6, accent: 0x5a4a36 }, hair: 0xa8a29a, shadow: true } },
  { id: 'trial-coffee-maker', label: 'Townsman', texture: 'trial-coffee-maker', kind: 'character', category: 'characters', color: 0x6a5040, blocks: true,
    character: { body: 0x6a5040, skin: 0xc49a6c, clothing: { style: 'apron', secondary: 0x3a5a5a, accent: 0xd8c7a0 }, hat: { style: 'cap', color: 0x8a2a22 }, hair: 0x1c120a, shadow: true } },
  { id: 'trial-cormick', label: 'Witness', texture: 'trial-cormick', kind: 'character', category: 'characters', color: 0x2a2a30, blocks: true,
    character: { body: 0x2a2a30, skin: 0xecd6bc, clothing: { style: 'cloak', secondary: 0x1a1a20, accent: 0xe8e4dc }, hat: { style: 'tallHat', color: 0x16161a }, hair: 0x8a5a3a, shadow: true } },
  { id: 'trial-bodyguard', label: 'Soldier', texture: 'trial-bodyguard', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x3a4a5a, skin: 0xd0b08a, clothing: { style: 'uniform', secondary: 0x22303e, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x1a1a1a }, hair: 0x1d1610, shadow: true } },
  { id: 'trial-house-boy', label: 'Townsman', texture: 'trial-house-boy', kind: 'character', category: 'characters', color: 0x6a6a52, blocks: true,
    character: { body: 0x6a6a52, skin: 0xc8a070, clothing: { style: 'wrap', secondary: 0x4a4a3a, accent: 0xa89878 }, hat: { style: 'cap', color: 0xd8cfb8 }, hair: 0x1c120a, shadow: true } },
];
