import type { MapObjectId } from '../mapAssetTypes';
import type { TextureGenerator } from '../mapAssetTypes';
import { CH01_TEXTURE_GENERATORS } from './chapter01';
import { CH02_TEXTURE_GENERATORS } from './chapter02';
import { CH03_TEXTURE_GENERATORS } from './chapter03';
import { CH04_TEXTURE_GENERATORS } from './chapter04';
import { CH05_TEXTURE_GENERATORS } from './chapter05';
import { CH06_TEXTURE_GENERATORS } from './chapter06';
import { CH07_TEXTURE_GENERATORS } from './chapter07';
import { CH08_TEXTURE_GENERATORS } from './chapter08';
import { CH09_TEXTURE_GENERATORS } from './chapter09';
import { CH10_TEXTURE_GENERATORS } from './chapter10';
import { SHARED_TEXTURE_GENERATORS } from './shared';

/**
 * Bespoke texture generators keyed by MapObjectId. The central
 * `ensureMapAssetTexture` consults this registry before falling back to
 * the generic structure / prop / character generators in
 * `mapAssetTextures.ts`. This is the single seam where chapters can ship
 * art that is more specific than the label-driven fallbacks.
 */
export const CUSTOM_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...SHARED_TEXTURE_GENERATORS,
  ...CH01_TEXTURE_GENERATORS,
  ...CH02_TEXTURE_GENERATORS,
  ...CH03_TEXTURE_GENERATORS,
  ...CH04_TEXTURE_GENERATORS,
  ...CH05_TEXTURE_GENERATORS,
  ...CH06_TEXTURE_GENERATORS,
  ...CH07_TEXTURE_GENERATORS,
  ...CH08_TEXTURE_GENERATORS,
  ...CH09_TEXTURE_GENERATORS,
  ...CH10_TEXTURE_GENERATORS,
};
