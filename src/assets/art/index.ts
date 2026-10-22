import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { variantKey } from './canvasKit';
import { paintLamp, paintWell } from './civic';
import { paintCrates, paintRug } from './props';
import { PINE_VARIANTS, ROCK_VARIANTS } from './mountain';
import { ALDER_VARIANTS, IRONWOOD_VARIANTS, OAK_VARIANTS } from './hyrcanianWoods';
import { MOUNTAIN_HOUSES } from './mountainHouse';
import { TEHRAN_HOUSES } from './tehran';
import { TOWN_TEXTURE_VARIANTS } from './town';
import { paintWallBase, WALL_STYLES } from './walls';

/**
 * Painted art for the shared base objects. Objects with variants paint
 * `texture`, `texture~1`, `texture~2`... and maps pick one per placement
 * with `variantTexture`, so a street of houses or a row of cypresses does
 * not repeat itself.
 */

export const TEXTURE_VARIANTS: Readonly<Record<string, number>> = {
  ...TOWN_TEXTURE_VARIANTS,
  'ch6-pine': PINE_VARIANTS.length,
  'ch6-rock': ROCK_VARIANTS.length,
  'ch6-mountain-house': MOUNTAIN_HOUSES.length,
  'ch10-street-house': TEHRAN_HOUSES.length,
  'ch8-oak': OAK_VARIANTS.length,
  'ch8-ironwood': IRONWOOD_VARIANTS.length,
  'ch8-alder': ALDER_VARIANTS.length,
};

export const BASE_ART_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  well: (scene, def) => paintWell(scene, def.texture),
  lamp: (scene, def) => paintLamp(scene, def.texture),
  crates: (scene, def) => paintCrates(scene, def.texture),
  rug: (scene, def) => paintRug(scene, def.texture),
  ...Object.fromEntries(Object.keys(WALL_STYLES).map(id => [id, ((scene, def) => paintWallBase(scene, def.texture)) as TextureGenerator])),
};

/** The variant of `texture` to use at a grid cell; stable for a given placement. */
export function variantTexture(texture: string, gridX: number, gridY: number): string {
  const count = TEXTURE_VARIANTS[texture];
  if (!count) return texture;
  const i = Math.abs((gridX * 73856093) ^ (gridY * 19349663)) % count;
  return variantKey(texture, i);
}
