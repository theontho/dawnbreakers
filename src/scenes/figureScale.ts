import { MAP_OBJECTS } from '../assets/mapAssetLibrary';

/**
 * People (and the animals and crowds painted at their size) are painted
 * 40 px tall, a true 1.75 m on true-scale maps. Maps not yet rebuilt at true
 * scale (`MapDefinition.trueScale`) have small houses, so there people are
 * drawn at 0.75 to fit their doors. Textures stay crisp either way.
 */
const SMALL_WORLD_SCALE = 0.75;

export function personScale(trueScale: boolean): number {
  return trueScale ? 1 : SMALL_WORLD_SCALE;
}

const PEOPLE_SIZED = new Set(
  MAP_OBJECTS
    .filter(def => def.kind === 'character' || def.category === 'people-crowds' || def.id === 'ch2-camel')
    .map(def => def.texture),
);

/** Display scale for a map texture (variant suffixes ignored). */
export function figureScale(texture: string, trueScale: boolean): number {
  return PEOPLE_SIZED.has(texture.split('~')[0]!) ? personScale(trueScale) : 1;
}
