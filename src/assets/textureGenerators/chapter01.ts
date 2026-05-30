import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 1 — Shíráz. Adds the city birds, the threshold tile in front
 * of the Báb's house, and the Quiet Quarter planter.
 *
 * The threshold acts as the lamplit cue that opens the Báb's dialogue
 * without requiring an interactable Báb sprite on the map.
 */
export const CH01_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch1-birds': (scene) => {
    const g = makeTextureGraphics(scene);
    g.lineStyle(2, 0x1f1a14, 1);
    g.beginPath();
    g.moveTo(4, 12);
    g.lineTo(9, 8);
    g.lineTo(14, 12);
    g.moveTo(17, 10);
    g.lineTo(22, 7);
    g.lineTo(28, 10);
    g.strokePath();
    g.generateTexture('ch1-birds', 32, 20);
    g.destroy();
  },

  'ch1-house-threshold': (scene) => {
    const geo = createIsoPrism(1, 1, 34, 12);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x6f4a24,
      left: 0x4f321b,
      top: 0x8c6230,
      edge: 0x1a0f08,
    });
    const door = wallInsetPoints(geo.right, geo.bottom, 0.36, 0.62, 24);
    g.fillStyle(0x26180f, 1);
    g.fillPoints(door, true);
    g.lineStyle(2, 0x1a0f08, 0.85);
    g.strokePoints(door, true);
    g.fillStyle(0xe5c36e, 0.7);
    g.fillCircle(door[1]!.x - 3, door[1]!.y - 10, 4);
    g.generateTexture('ch1-house-threshold', geo.texW, geo.texH);
    g.destroy();
  },

  'ch1-planter': (scene) => {
    const geo = createIsoPrism(1, 1, 10, 16);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x8a5a2a,
      left: 0x5f3a20,
      top: 0x4f3424,
      edge: 0x2a1a0a,
    });
    g.fillStyle(0x3f7a4a, 0.35);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.fillStyle(0x3f7a4a, 1);
    g.fillCircle(geo.bottomR.x - 10, geo.bottomR.y - 15, 7);
    g.fillCircle(geo.bottomR.x, geo.bottomR.y - 20, 8);
    g.fillCircle(geo.bottomR.x + 9, geo.bottomR.y - 14, 6);
    g.generateTexture('ch1-planter', geo.texW, geo.texH);
    g.destroy();
  },
};
