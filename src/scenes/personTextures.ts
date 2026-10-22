import { MAP_OBJECTS } from '../assets/mapAssetLibrary';

/**
 * People, and the crowds and animals painted at their size: 40 px tall,
 * a true 1.75 m (see docs/true-scale.md). They sway while idle and show
 * through the buildings that hide them.
 */
const PEOPLE_SIZED = new Set(
  MAP_OBJECTS
    .filter(def => def.kind === 'character' || def.category === 'people-crowds' || def.id === 'ch2-camel')
    .map(def => def.texture),
);

/** Whether a texture is a person (or a crowd or animal painted at their size). */
export function isPersonTexture(texture: string): boolean {
  return PEOPLE_SIZED.has(texture.split('~')[0]!);
}
