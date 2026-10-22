import { footprintBox, paintTexture } from '../art/canvasKit';
import { drawDoorWreckage, drawShutteredShop, TEHRAN_HOUSES } from '../art/tehran';
import { paintTehranGate } from '../art/tehranGate';
import { drawSabat, SABAT_TOP } from '../art/tehranSabat';
import { paintHouseSet } from '../art/town/townHouses';
import type { MapObjectId, TextureGenerator, MapObjectDefinition } from '../mapAssetTypes';
import { CH10_PRISON_TEXTURE_GENERATORS } from './chapter10Prison';
import { CH10_ROAD_TEXTURE_GENERATORS } from './chapter10Road';

/**
 * Chapter 10, at true scale: the Ṭihrán prison quarter, the Síyáh-Chál pit,
 * and the snowy western gate where the road to Baghdád begins. This file
 * registers the street buildings, drawn in `art/tehran.ts`,
 * `art/tehranSabat.ts` and `art/tehranGate.ts`; the prison architecture,
 * chains, straw and the shaft of light live in `chapter10Prison.ts`, the
 * snow in `chapter10Road.ts`. The city wall is a connected wall style
 * (`ch10-city-wall`, `ch10-city-wall-snow` in wallStyles.ts), as are the
 * pit's arcade and vault walls (`ch10-low-arch`, `ch10-vault-wall`).
 *
 * Note: `lamp` and `crowd-shadow` are intentionally not redefined here.
 * The shared registry owns them.
 */

const footprint = (def: Parameters<TextureGenerator>[1]): [number, number] => [def.footprint?.w ?? 1, def.footprint?.h ?? 1];

export const CH10_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...CH10_PRISON_TEXTURE_GENERATORS,
  ...CH10_ROAD_TEXTURE_GENERATORS,

  // Houses of the quarter shut against the street: doors barred, shutters closed.
  'ch10-street-house': (scene, def) => paintHouseSet(scene, def.texture, ...footprint(def), TEHRAN_HOUSES),

  // A sābāṭ: rooms over the lane on a vault; the lane runs through its middle two columns.
  'ch10-street-arch': (scene, def) => {
    const { box, texW, texH } = footprintBox(...footprint(def), SABAT_TOP, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawSabat(ctx, box));
  },

  'ch10-shuttered-shop': (scene, def) => {
    const { box, texW, texH } = footprintBox(...footprint(def), 100, 6);
    paintTexture(scene, def.texture, texW, texH, ctx => drawShutteredShop(ctx, box));
  },

  'ch10-door-wreckage': (scene, def) => {
    const { box, texW, texH } = footprintBox(1, 1, 0, 56);
    paintTexture(scene, def.texture, texW, texH, ctx => drawDoorWreckage(ctx, box));
  },

  'ch10-west-gate': (scene, def) => paintTehranGate(scene, def.texture, ...footprint(def)),
};

/** Placeable map objects owned by chapter 10. */
export const CH10_OBJECTS: MapObjectDefinition[] = [
  { id: 'ch10-street-house', label: 'Tehran House', texture: 'ch10-street-house', kind: 'structure', category: 'buildings', color: 0x8a5a2a, blocks: true, footprint: { w: 6, h: 4 }, isometric: true },
  { id: 'ch10-street-arch', label: 'Street Arch', texture: 'ch10-street-arch', kind: 'structure', category: 'buildings', color: 0x6b6258, blocks: true, footprint: { w: 6, h: 4 }, isometric: true },
  { id: 'ch10-west-gate', label: 'City Gate', texture: 'ch10-west-gate', kind: 'structure', category: 'buildings', color: 0xa88660, blocks: true, footprint: { w: 3, h: 4 }, isometric: true },
  { id: 'ch10-door-wreckage', label: 'Rubble', texture: 'ch10-door-wreckage', kind: 'prop', category: 'barriers-prison', color: 0x4a3424, blocks: false },
  { id: 'ch10-stone-pillar', label: 'Stone Pillar', texture: 'ch10-stone-pillar', kind: 'structure', category: 'barriers-prison', color: 0x8f897c, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch10-chain-pillar', label: 'Chain Pillar', texture: 'ch10-chain-pillar', kind: 'prop', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-chain-post', label: 'Chain Post', texture: 'ch10-chain-post', kind: 'prop', category: 'barriers-prison', color: 0x6b6258, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-chain-coil', label: 'Chain Coil', texture: 'ch10-chain-coil', kind: 'prop', category: 'barriers-prison', color: 0x3f4650, blocks: true, footprint: { w: 1, h: 1 }, isometric: true },
  { id: 'ch10-light-shaft', label: 'Light Shaft', texture: 'ch10-light-shaft', kind: 'prop', category: 'lighting-effects', color: 0xf3d98a, blocks: false },
  { id: 'ch10-guard', label: 'Tehran Guard', texture: 'ch10-guard', kind: 'character', category: 'characters', color: 0x39404a, blocks: true,
    character: { body: 0x39404a, skin: 0xc8b48d, clothing: { style: 'uniform', secondary: 0x6f2222, accent: 0xc9a55c }, hat: { style: 'tallHat', color: 0x242932 }, shadow: true } },
  { id: 'ch10-prisoner', label: 'Prisoner', texture: 'ch10-prisoner', kind: 'character', category: 'characters', color: 0x6b6258, blocks: true,
    character: { body: 0x3a3836, skin: 0xbda982, clothing: { style: 'robe', secondary: 0x5b554e, accent: 0x8a867d }, hat: { style: 'none' }, hair: 0x1f1b18, shadow: true } },
  { id: 'ch10-shuttered-shop', label: 'Market Stall', texture: 'ch10-shuttered-shop', kind: 'structure', category: 'buildings', color: 0x6e5a44, blocks: true, footprint: { w: 2, h: 2 }, isometric: true },
  { id: 'ch10-straw', label: 'Rug', texture: 'ch10-straw', kind: 'prop', category: 'furnishings', color: 0x6f6040, blocks: false },
  // Connected walls, one cell at a time (see WALL_STYLES).
  { id: 'ch10-city-wall', label: 'City Wall', texture: 'ch10-city-wall', kind: 'prop', category: 'barriers-prison', color: 0x9a7a56, blocks: true },
  { id: 'ch10-city-wall-snow', label: 'City Wall', texture: 'ch10-city-wall-snow', kind: 'prop', category: 'barriers-prison', color: 0xd8d4cc, blocks: true },
  { id: 'ch10-low-arch', label: 'Low Arch', texture: 'ch10-low-arch', kind: 'prop', category: 'barriers-prison', color: 0x6b6258, blocks: true },
  { id: 'ch10-vault-wall', label: 'Stone Pillar', texture: 'ch10-vault-wall', kind: 'prop', category: 'barriers-prison', color: 0x2e2c2a, blocks: true },
  { id: 'ch10-snow-drift', label: 'Snow Drift', texture: 'ch10-snow-drift', kind: 'prop', category: 'lighting-effects', color: 0xe8ecf0, blocks: false },
  { id: 'ch10-snow-tracks', label: 'Snow Tracks', texture: 'ch10-snow-tracks', kind: 'prop', category: 'lighting-effects', color: 0xf2f0ea, blocks: false },
  { id: 'ch10-shopkeeper', label: 'Merchant', texture: 'ch10-shopkeeper', kind: 'character', category: 'characters', color: 0x7a5a3a, blocks: true,
    character: { body: 0x7a5a3a, skin: 0xc8a882, clothing: { style: 'vest', secondary: 0x4a3a2a, accent: 0xb08a4a }, hat: { style: 'cap', color: 0x3a2a1e }, hair: 0x2a2018, shadow: true } },
  { id: 'ch10-water-seller', label: 'Water-Carrier', texture: 'ch10-water-seller', kind: 'character', category: 'characters', color: 0x5d6a72, blocks: true,
    character: { body: 0x5d6a72, skin: 0xb89870, clothing: { style: 'apron', secondary: 0x8a7a5a, accent: 0x3f5a6a }, hat: { style: 'turban', color: 0xd8cfb8 }, hair: 0xb8b0a0, shadow: true } },
  { id: 'ch10-waiting-sister', label: 'Witness', texture: 'ch10-waiting-sister', kind: 'character', category: 'characters', color: 0x2a2c3a, blocks: true,
    character: { body: 0x2a2c3a, skin: 0xd0b08a, clothing: { style: 'wrap', secondary: 0x3a3c4e, accent: 0x8a6a8a }, hat: { style: 'veil', color: 0x1e2030 }, shadow: true } },
  { id: 'ch10-jailer', label: 'Warden', texture: 'ch10-jailer', kind: 'character', category: 'characters', color: 0x3a3028, blocks: true,
    character: { body: 0x3a3028, skin: 0xb8a07a, clothing: { style: 'sash', secondary: 0x5a2a1a, accent: 0x8a867d }, hat: { style: 'tallHat', color: 0x1e1a16 }, hair: 0x1a1612, shadow: true } },
  { id: 'ch10-ruined-believer', label: 'Prisoner', texture: 'ch10-ruined-believer', kind: 'character', category: 'characters', color: 0x4a4038, blocks: true,
    character: { body: 0x4a4038, skin: 0xc0a47e, clothing: { style: 'robe', secondary: 0x3a322c, accent: 0x6a5a40 }, hat: { style: 'turban', color: 0x6a6258 }, hair: 0xa8a098, shadow: true } },
  { id: 'ch10-young-prisoner', label: 'Prisoner', texture: 'ch10-young-prisoner', kind: 'character', category: 'characters', color: 0x50463c, blocks: true,
    character: { body: 0x50463c, skin: 0xccb08a, clothing: { style: 'vest', secondary: 0x3a3430, accent: 0x6a5a48 }, hat: { style: 'none' }, hair: 0x241c16, shadow: true } },
  { id: 'ch10-muleteer', label: 'Traveller', texture: 'ch10-muleteer', kind: 'character', category: 'characters', color: 0x6a4a30, blocks: true,
    character: { body: 0x6a4a30, skin: 0xb8936a, clothing: { style: 'cloak', secondary: 0x4a3420, accent: 0xa8783a }, hat: { style: 'hood', color: 0x5a3e28 }, hair: 0x2a2018, shadow: true } },
];
