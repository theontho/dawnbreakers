import { MAP_OBJECTS } from '../assets/mapAssetLibrary';

/**
 * People (and the animals and crowds painted at their size) are drawn at
 * this scale on the maps. A figure then stands about 30 px tall, which puts
 * a cell at roughly 1.9 m: a person fits a 33 px door and a 64 px wall reads
 * as a real storey. Textures are painted larger and scaled down, so they
 * stay crisp.
 */
export const PERSON_SCALE = 0.75;

const PEOPLE_SIZED = new Set(
  MAP_OBJECTS
    .filter(def => def.kind === 'character' || def.category === 'people-crowds' || def.id === 'ch2-camel')
    .map(def => def.texture),
);

/** Display scale for a map texture (variant suffixes ignored). */
export function figureScale(texture: string): number {
  return PEOPLE_SIZED.has(texture.split('~')[0]!) ? PERSON_SCALE : 1;
}
