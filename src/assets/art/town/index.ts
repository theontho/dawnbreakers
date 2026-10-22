import type { MapObjectId, TextureGenerator } from '../../mapAssetTypes';
import { variantKey } from '../canvasKit';
import { LARGE_STALLS, paintBazaarRow, paintLargeStall } from './bazaar';
import { paintCityGateLarge } from './cityGate';
import { COURTYARD_HOUSES } from './courtyardHouse';
import { paintFountainPool } from './fountain';
import { paintMosqueGreat } from './mosqueGreat';
import { paintMosqueLocal } from './mosqueLocal';
import { paintHouseSet, SMALL_HOUSES, TOWN_HOUSES } from './townHouses';
import {
  ORANGE_VARIANTS, paintOrangeTree, paintPlaneTree, paintTallCypress, PLANE_VARIANTS, TALL_CYPRESS_VARIANTS,
} from './trees';

/**
 * Generators for the true-scale town objects (`src/assets/townObjects.ts`).
 * The connected `town-wall` and `compound-wall` are styles in walls.ts and
 * are registered with the other walls.
 */

const footprint = (def: Parameters<TextureGenerator>[1]): [number, number] => [def.footprint?.w ?? 1, def.footprint?.h ?? 1];

/** Variant counts for `variantTexture`, keyed by texture. */
export const TOWN_TEXTURE_VARIANTS: Readonly<Record<string, number>> = {
  'town-house-small': SMALL_HOUSES.length,
  'town-house': TOWN_HOUSES.length,
  'town-house-large': COURTYARD_HOUSES.length,
  'market-stall-large': LARGE_STALLS.length,
  'plane-tree': PLANE_VARIANTS.length,
  'cypress-tall': TALL_CYPRESS_VARIANTS.length,
  'orange-tree': ORANGE_VARIANTS.length,
};

export const TOWN_ART_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'town-house-small': (scene, def) => paintHouseSet(scene, def.texture, ...footprint(def), SMALL_HOUSES),
  'town-house': (scene, def) => paintHouseSet(scene, def.texture, ...footprint(def), TOWN_HOUSES),
  'town-house-large': (scene, def) => paintHouseSet(scene, def.texture, ...footprint(def), COURTYARD_HOUSES),
  'mosque-great': (scene, def) => paintMosqueGreat(scene, def.texture, ...footprint(def)),
  'mosque-local': (scene, def) => paintMosqueLocal(scene, def.texture, ...footprint(def)),
  'bazaar-row': (scene, def) => paintBazaarRow(scene, def.texture, ...footprint(def)),
  'market-stall-large': (scene, def) => LARGE_STALLS.forEach((s, i) => paintLargeStall(scene, variantKey(def.texture, i), s)),
  'city-gate-large': (scene, def) => paintCityGateLarge(scene, def.texture, ...footprint(def)),
  'fountain-pool': (scene, def) => paintFountainPool(scene, def.texture, ...footprint(def)),
  'plane-tree': (scene, def) => PLANE_VARIANTS.forEach((s, i) => paintPlaneTree(scene, variantKey(def.texture, i), s)),
  'cypress-tall': (scene, def) => TALL_CYPRESS_VARIANTS.forEach((s, i) => paintTallCypress(scene, variantKey(def.texture, i), s)),
  'orange-tree': (scene, def) => ORANGE_VARIANTS.forEach((s, i) => paintOrangeTree(scene, variantKey(def.texture, i), s)),
};
