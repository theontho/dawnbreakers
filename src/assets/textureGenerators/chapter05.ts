import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 5 — Iṣfahán's bridge, market awning, river reeds, and the
 * Mu'tamid's palace portico.
 */
export const CH05_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch5-bridge-span': (scene) => {
    const geo = createIsoPrism(5, 2, 18, 16);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x8a7552,
      left: 0x5e4b36,
      top: 0xb9a16e,
      edge: 0x3e2c1c,
    });
    g.lineStyle(3, 0xd0bb82, 1);
    g.lineBetween(geo.leftR.x + 8, geo.leftR.y - 8, geo.bottomR.x, geo.bottomR.y - 8);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y - 8, geo.rightR.x - 8, geo.rightR.y - 8);
    g.lineStyle(2, 0x3e2c1c, 1);
    for (let t = 0.15; t <= 0.85; t += 0.175) {
      const x = geo.leftR.x + (geo.bottomR.x - geo.leftR.x) * t;
      const y = geo.leftR.y + (geo.bottomR.y - geo.leftR.y) * t;
      g.lineBetween(x, y - 14, x, y + 3);
    }
    for (let t = 0.18; t <= 0.82; t += 0.16) {
      const x = geo.right.x + (geo.bottom.x - geo.right.x) * t;
      const y = geo.right.y + (geo.bottom.y - geo.right.y) * t;
      g.strokeEllipse(x, y - 5, 24, 12);
    }
    g.generateTexture('ch5-bridge-span', geo.texW, geo.texH);
    g.destroy();
  },

  'ch5-market-awning': (scene) => {
    const geo = createIsoPrism(1, 1, 24, 22);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x73512e,
      left: 0x5b3f24,
      top: 0x315f68,
      edge: 0x2a1a0a,
    });
    const peak = { x: geo.bottomR.x, y: geo.topR.y - 20 };
    g.fillStyle(0x315f68, 1);
    g.fillPoints([geo.leftR, peak, geo.bottomR], true);
    g.fillStyle(0x2a5159, 1);
    g.fillPoints([geo.bottomR, peak, geo.rightR], true);
    g.lineStyle(1, 0x2a1a0a, 1);
    g.strokePoints([geo.leftR, peak, geo.rightR, geo.bottomR], true);
    g.lineStyle(2, 0xc9a55c, 1);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y, peak.x, peak.y);
    g.generateTexture('ch5-market-awning', geo.texW, geo.texH);
    g.destroy();
  },

  'ch5-river-reeds': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x2c4a6b, 0.8);
    g.fillEllipse(24, 38, 42, 14);
    g.lineStyle(2, 0x516b38, 1);
    for (let x = 10; x <= 38; x += 7) {
      g.lineBetween(x, 38, x + 3, 14);
    }
    g.fillStyle(0x8b6a3a, 1);
    g.fillEllipse(18, 18, 5, 10);
    g.fillEllipse(33, 20, 5, 10);
    g.generateTexture('ch5-river-reeds', 48, 44);
    g.destroy();
  },

  'ch5-palace-portico': (scene) => {
    const geo = createIsoPrism(5, 3, 70, 30);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x9b7a4d,
      left: 0x6f5435,
      top: 0x315f68,
      edge: 0x2a1a0a,
    });
    g.lineStyle(2, 0x2a1a0a, 1);
    g.fillStyle(0xc8b27a, 1);
    for (let t = 0.16; t <= 0.86; t += 0.175) {
      const col = wallInsetPoints(geo.right, geo.bottom, t, t + 0.04, 62);
      g.fillPoints(col, true);
      g.strokePoints(col, true);
    }
    g.fillStyle(0x2a1a0a, 1);
    g.fillPoints(wallInsetPoints(geo.right, geo.bottom, 0.43, 0.58, 46), true);
    g.fillStyle(0xc9a55c, 1);
    g.fillCircle(geo.bottomR.x, geo.topR.y - 8, 10);
    g.generateTexture('ch5-palace-portico', geo.texW, geo.texH);
    g.destroy();
  },
};
