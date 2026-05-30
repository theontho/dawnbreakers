import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 4 — return to Shíráz, mosque arrest. Adds the pulpit and the
 * prayer arch over the mosque court.
 */
export const CH04_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch4-pulpit': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x7b5d39, 1);
    g.fillRect(20, 22, 22, 42);
    g.fillStyle(0x4a3320, 1);
    g.fillRect(16, 54, 30, 10);
    g.lineStyle(2, 0x2b1d12, 1);
    g.strokeRect(20, 22, 22, 42);
    g.lineBetween(20, 34, 42, 28);
    g.lineBetween(20, 46, 42, 40);
    g.fillStyle(0xc9a55c, 1);
    g.fillTriangle(31, 8, 47, 24, 15, 24);
    g.generateTexture('ch4-pulpit', 64, 68);
    g.destroy();
  },

  'ch4-prayer-arch': (scene) => {
    const geo = createIsoPrism(4, 2, 58, 18);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0xb89968,
      left: 0x8f7049,
      top: 0xd0b47a,
      edge: 0x4a3320,
    });
    g.lineStyle(1, 0xc9a55c, 0.7);
    g.lineBetween(geo.leftR.x + 10, geo.leftR.y + 14, geo.bottomR.x, geo.bottomR.y + 14);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 14, geo.rightR.x - 10, geo.rightR.y + 14);
    g.lineStyle(2, 0x4a3320, 1);
    g.fillStyle(0x2a2118, 1);
    g.fillPoints(wallInsetPoints(geo.right, geo.bottom, 0.33, 0.58, 42), true);
    g.strokePoints(wallInsetPoints(geo.right, geo.bottom, 0.33, 0.58, 42), true);
    g.generateTexture('ch4-prayer-arch', geo.texW, geo.texH);
    g.destroy();
  },
};
