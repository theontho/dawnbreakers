import { paintCarpet } from './art/props';
import type { MapObjectDefinition, MapObjectId, TextureGenerator } from './mapAssetTypes';
import type { DecorSpec } from '../data/maps/types';

/**
 * Carpets bigger than a cell, for a floor laid with a few large rugs rather
 * than a chequer of small ones: each lies under everyone who stands on it.
 * Lay one with `carpet()`.
 */

export const CARPET_PALETTES = {
  crimson: { field: 0x7f2a2a, border: 0x1f2f5a, color: 0x7a1f1f },
  indigo: { field: 0x2f3f6a, border: 0x7f2a2a, color: 0x2f3f6a },
  madder: { field: 0x9a4a2a, border: 0x2a3a2a, color: 0x9a4a2a },
} as const;

export type CarpetPalette = keyof typeof CARPET_PALETTES;

/** The sizes a carpet comes in, in cells along x and y. */
const SIZES: ReadonlyArray<readonly [number, number]> = [
  [2, 1], [1, 2], [2, 2], [3, 2], [2, 3], [3, 3], [4, 2], [2, 4], [4, 3], [3, 4], [5, 3], [3, 5], [6, 4], [4, 6], [6, 3], [3, 6],
];

const textureFor = (palette: CarpetPalette, w: number, h: number) => `carpet-${palette}-${w}x${h}`;

const ALL = (Object.keys(CARPET_PALETTES) as CarpetPalette[]).flatMap(palette => SIZES.map(([w, h]) => ({ palette, w, h })));

export const CARPET_OBJECTS: MapObjectDefinition[] = ALL.map(({ palette, w, h }) => ({
  id: textureFor(palette, w, h),
  label: 'Rug',
  texture: textureFor(palette, w, h),
  kind: 'prop',
  category: 'furnishings',
  color: CARPET_PALETTES[palette].color,
  blocks: false,
}));

export const CARPET_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = Object.fromEntries(
  ALL.map(({ palette, w, h }): [string, TextureGenerator] => [
    textureFor(palette, w, h),
    (scene, def) => paintCarpet(scene, def.texture, CARPET_PALETTES[palette].field, CARPET_PALETTES[palette].border, w, h),
  ]),
);

/**
 * A carpet covering cells `x`..`x + w - 1` by `y`..`y + h - 1` (one of the
 * sizes above). It is placed on its front cell, as its art hangs from there,
 * and sorts from its back corner, under anyone standing anywhere on it.
 */
export function carpet(x: number, y: number, w: number, h: number, palette: CarpetPalette): DecorSpec {
  if (!SIZES.some(([sw, sh]) => sw === w && sh === h)) throw new Error(`No carpet comes ${w} x ${h}`);
  return { gridX: x + w - 1, gridY: y + h - 1, texture: textureFor(palette, w, h), sortAt: { x: x - 0.5, y: y - 0.5 } };
}
