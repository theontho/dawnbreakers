import type { MapObjectDefinition, MapObjectId, TextureGenerator } from '../mapAssetTypes';
import { FORERUNNERS_OBJECTS, FORERUNNERS_TEXTURE_GENERATORS } from './forerunners';
import { CH01_OBJECTS, CH01_TEXTURE_GENERATORS } from './chapter01';
import { CH02_OBJECTS, CH02_TEXTURE_GENERATORS } from './chapter02';
import { NUR_OBJECTS, NUR_TEXTURE_GENERATORS } from './nur';
import { CH03_OBJECTS, CH03_TEXTURE_GENERATORS } from './chapter03';
import { BAGHDAD_OBJECTS, BAGHDAD_TEXTURE_GENERATORS } from './baghdad';
import { CH04_OBJECTS, CH04_TEXTURE_GENERATORS } from './chapter04';
import { CH05_OBJECTS, CH05_TEXTURE_GENERATORS } from './chapter05';
import { KULAYN_OBJECTS, KULAYN_TEXTURE_GENERATORS } from './kulayn';
import { CH06_OBJECTS, CH06_TEXTURE_GENERATORS } from './chapter06';
import { QAZVIN_OBJECTS } from './qazvin';
import { CH07_OBJECTS, CH07_TEXTURE_GENERATORS } from './chapter07';
import { TRIAL_OBJECTS, TRIAL_TEXTURE_GENERATORS } from './trial';
import { CH08_OBJECTS, CH08_TEXTURE_GENERATORS } from './chapter08';
import { MARTYRS_OBJECTS, MARTYRS_TEXTURE_GENERATORS } from './martyrs';
import { NAYRIZ_OBJECTS, NAYRIZ_TEXTURE_GENERATORS } from './nayriz';
import { CH09_OBJECTS, CH09_TEXTURE_GENERATORS } from './chapter09';
import { ZANJAN_OBJECTS, ZANJAN_TEXTURE_GENERATORS } from './zanjan';
import { KARBILA_OBJECTS, KARBILA_TEXTURE_GENERATORS } from './karbila';
import { CH10_OBJECTS, CH10_TEXTURE_GENERATORS } from './chapter10';
import { SHARED_TEXTURE_GENERATORS } from './shared';
import { CARPET_OBJECTS, CARPET_TEXTURE_GENERATORS } from '../carpetObjects';
import { BASE_ART_GENERATORS } from '../art';
import { TOWN_ART_GENERATORS } from '../art/town';
import { TREE_ART_GENERATORS } from '../art/treeArt';

/**
 * Bespoke texture generators keyed by MapObjectId. The central
 * `ensureMapAssetTexture` consults this registry before falling back to
 * the generic structure / prop / character generators in
 * `mapAssetTextures.ts`. This is the single seam where chapters can ship
 * art that is more specific than the label-driven fallbacks.
 */
export const CUSTOM_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  ...BASE_ART_GENERATORS,
  ...TOWN_ART_GENERATORS,
  ...TREE_ART_GENERATORS,
  ...SHARED_TEXTURE_GENERATORS,
  ...CARPET_TEXTURE_GENERATORS,
  ...FORERUNNERS_TEXTURE_GENERATORS,
  ...CH01_TEXTURE_GENERATORS,
  ...CH02_TEXTURE_GENERATORS,
  ...NUR_TEXTURE_GENERATORS,
  ...CH03_TEXTURE_GENERATORS,
  ...BAGHDAD_TEXTURE_GENERATORS,
  ...CH04_TEXTURE_GENERATORS,
  ...CH05_TEXTURE_GENERATORS,
  ...KULAYN_TEXTURE_GENERATORS,
  ...CH06_TEXTURE_GENERATORS,
  ...CH07_TEXTURE_GENERATORS,
  ...TRIAL_TEXTURE_GENERATORS,
  ...CH08_TEXTURE_GENERATORS,
  ...MARTYRS_TEXTURE_GENERATORS,
  ...NAYRIZ_TEXTURE_GENERATORS,
  ...CH09_TEXTURE_GENERATORS,
  ...ZANJAN_TEXTURE_GENERATORS,
  ...KARBILA_TEXTURE_GENERATORS,
  ...CH10_TEXTURE_GENERATORS,
};

/** Chapter-owned placeable objects, in chapter order. */
export const CHAPTER_OBJECTS: MapObjectDefinition[] = [
  ...CARPET_OBJECTS,
  ...FORERUNNERS_OBJECTS,
  ...CH01_OBJECTS,
  ...CH02_OBJECTS,
  ...NUR_OBJECTS,
  ...CH03_OBJECTS,
  ...BAGHDAD_OBJECTS,
  ...CH04_OBJECTS,
  ...CH05_OBJECTS,
  ...KULAYN_OBJECTS,
  ...CH06_OBJECTS,
  ...QAZVIN_OBJECTS,
  ...CH07_OBJECTS,
  ...TRIAL_OBJECTS,
  ...CH08_OBJECTS,
  ...MARTYRS_OBJECTS,
  ...NAYRIZ_OBJECTS,
  ...CH09_OBJECTS,
  ...ZANJAN_OBJECTS,
  ...KARBILA_OBJECTS,
  ...CH10_OBJECTS,
];
