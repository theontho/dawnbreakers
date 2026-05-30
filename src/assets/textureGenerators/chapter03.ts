import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 3 — Mecca + the ship. Adds the Kaaba, pilgrim cluster, the
 * "courtyard hush" listening floor marker, and the ship's mast and rail.
 */
export const CH03_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch3-kaaba': (scene) => {
    const geo = createIsoPrism(3, 2, 56, 10);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x151515,
      left: 0x0b0b0b,
      top: 0x202020,
      edge: 0x000000,
    });
    g.lineStyle(3, 0xc9a55c, 0.9);
    g.lineBetween(geo.leftR.x + 6, geo.leftR.y + 18, geo.bottomR.x, geo.bottomR.y + 18);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 18, geo.rightR.x - 6, geo.rightR.y + 18);
    g.generateTexture('ch3-kaaba', geo.texW, geo.texH);
    g.destroy();
  },

  'ch3-pilgrim-cluster': (scene) => {
    const g = makeTextureGraphics(scene);
    const figures = [
      { x: 10, robe: 0xd8d0bd, hat: 0xf7f0dc },
      { x: 25, robe: 0xb8aa8d, hat: 0x8a7450 },
      { x: 39, robe: 0xe4dccb, hat: 0xf2ead6 },
    ];
    for (const figure of figures) {
      g.fillStyle(figure.robe, 0.9);
      g.fillRoundedRect(figure.x - 5, 18, 10, 18, 3);
      g.fillStyle(0xd8bd8a, 0.9);
      g.fillCircle(figure.x, 12, 5);
      g.fillStyle(figure.hat, 0.9);
      g.fillEllipse(figure.x, 8, 13, 5);
    }
    g.generateTexture('ch3-pilgrim-cluster', 50, 40);
    g.destroy();
  },

  'ch3-courtyard-hush': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0xf7f0dc, 0.22);
    g.fillEllipse(32, 30, 56, 18);
    g.lineStyle(2, 0xc9a55c, 0.65);
    g.strokeEllipse(32, 30, 46, 12);
    g.lineStyle(1, 0xf7f0dc, 0.5);
    g.lineBetween(32, 6, 32, 28);
    g.lineBetween(22, 12, 30, 28);
    g.lineBetween(42, 12, 34, 28);
    g.generateTexture('ch3-courtyard-hush', 64, 42);
    g.destroy();
  },

  'ch3-mast': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x5c3a1f, 1);
    g.fillRect(29, 10, 6, 86);
    g.fillStyle(0xd8c7a0, 0.9);
    g.fillTriangle(35, 14, 35, 76, 59, 47);
    g.fillStyle(0xc7b48b, 0.9);
    g.fillTriangle(29, 20, 29, 78, 7, 50);
    g.lineStyle(1, 0x2a1a0c, 0.7);
    g.strokeRect(29, 10, 6, 86);
    g.lineBetween(7, 50, 59, 47);
    g.generateTexture('ch3-mast', 64, 104);
    g.destroy();
  },

  'ch3-ship-rail': (scene) => {
    const g = makeTextureGraphics(scene);
    g.lineStyle(3, 0x4b2d18, 1);
    g.lineBetween(5, 24, 43, 24);
    g.lineStyle(2, 0x6a4325, 1);
    g.lineBetween(10, 8, 10, 28);
    g.lineBetween(23, 7, 23, 28);
    g.lineBetween(36, 8, 36, 28);
    g.generateTexture('ch3-ship-rail', 48, 32);
    g.destroy();
  },
};
