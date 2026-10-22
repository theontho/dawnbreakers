import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { variantKey } from './canvasKit';
import { paintLamp, paintWell } from './civic';
import { paintCrates, paintRug } from './props';
import { PINE_VARIANTS, ROCK_VARIANTS } from './mountain';
import { TREE_TEXTURE_VARIANTS } from './treeArt';
import { MOUNTAIN_HOUSES } from './mountainHouse';
import { TEHRAN_HOUSES } from './tehran';
import { TOWN_TEXTURE_VARIANTS } from './town';
import { paintWallBase } from './wallPainter';
import { WALL_STYLES } from './wallStyles';

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
  ...TREE_TEXTURE_VARIANTS,
};

export const BASE_ART_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  well: (scene, def) => paintWell(scene, def.texture),
  lamp: (scene, def) => paintLamp(scene, def.texture),
  crates: (scene, def) => paintCrates(scene, def.texture),
  rug: (scene, def) => paintRug(scene, def.texture),
  ...Object.fromEntries(Object.keys(WALL_STYLES).map(id => [id, ((scene, def) => paintWallBase(scene, def.texture)) as TextureGenerator])),
};

/**
 * The variant of `texture` to use at a grid cell: the `chosen` one when the
 * map names it, otherwise one picked from the placement (stable for a given
 * cell).
 */
export function variantTexture(texture: string, gridX: number, gridY: number, chosen?: number): string {
  const count = TEXTURE_VARIANTS[texture] ?? 1;
  if (chosen !== undefined) {
    if (!Number.isInteger(chosen) || chosen < 0 || chosen >= count) {
      throw new Error(`${texture} has no variant ${chosen} (it has ${count})`);
    }
    return variantKey(texture, chosen);
  }
  if (count === 1) return texture;
  const i = Math.abs((gridX * 73856093) ^ (gridY * 19349663)) % count;
  return variantKey(texture, i);
}
