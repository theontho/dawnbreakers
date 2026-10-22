import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { paintGate, paintLamp, paintMosque, paintWell } from './civic';
import { HOUSE_VARIANTS, paintHouseVariants, paintStall } from './houses';
import { CYPRESS_VARIANTS, paintCypress, paintTree, TREE_VARIANTS } from './nature';
import { paintCrates, paintRug } from './props';

/**
 * Painted art for the shared base objects. Objects with variants paint
 * `texture`, `texture~1`, `texture~2`... and maps pick one per placement
 * with `variantTexture`, so a street of houses or a row of cypresses does
 * not repeat itself.
 */

const STALLS = [
  { cloth: 0xc94f4f, stripe: 0xf0e2c0, goods: [0xd8a23a, 0xb83a2a, 0x8a5a2a] },
  { cloth: 0x2e6c8c, stripe: 0xe8dcc0, goods: [0x6f2236, 0xd8cfb8, 0x2e8c96] },
  { cloth: 0xc98b3a, stripe: 0x6a3020, goods: [0x557a3a, 0xe0c060, 0xa86030] },
];

export const TEXTURE_VARIANTS: Readonly<Record<string, number>> = {
  house: HOUSE_VARIANTS.length,
  tree: TREE_VARIANTS.length,
  cypress: CYPRESS_VARIANTS.length,
  stall: STALLS.length,
};

const variantKey = (texture: string, i: number) => (i === 0 ? texture : `${texture}~${i}`);

export const BASE_ART_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  house: (scene, def) => paintHouseVariants(scene, def.texture, def.footprint?.w ?? 2, def.footprint?.h ?? 2),
  mosque: (scene, def) => paintMosque(scene, def.texture, def.footprint?.w ?? 2, def.footprint?.h ?? 2),
  'market-stall': (scene, def) => STALLS.forEach((s, i) =>
    paintStall(scene, variantKey(def.texture, i), s.cloth, s.stripe, s.goods, 7 + i * 13)),
  gate: (scene, def) => paintGate(scene, def.texture),
  well: (scene, def) => paintWell(scene, def.texture),
  lamp: (scene, def) => paintLamp(scene, def.texture),
  tree: (scene, def) => TREE_VARIANTS.forEach((s, i) => paintTree(scene, variantKey(def.texture, i), s)),
  cypress: (scene, def) => CYPRESS_VARIANTS.forEach((s, i) => paintCypress(scene, variantKey(def.texture, i), s)),
  crates: (scene, def) => paintCrates(scene, def.texture),
  rug: (scene, def) => paintRug(scene, def.texture),
};

/** The variant of `texture` to use at a grid cell; stable for a given placement. */
export function variantTexture(texture: string, gridX: number, gridY: number): string {
  const count = TEXTURE_VARIANTS[texture];
  if (!count) return texture;
  const i = Math.abs((gridX * 73856093) ^ (gridY * 19349663)) % count;
  return variantKey(texture, i);
}
