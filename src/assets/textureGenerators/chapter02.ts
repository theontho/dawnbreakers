import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 2 — the road from Shíráz toward Mecca. Adds caravanserai,
 * roadside shrine, milestone, dry stream wash, and tamarisk shrub.
 */
export const CH02_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch2-caravanserai': (scene) => {
    const geo = createIsoPrism(3, 2, 66, 20);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0xb88b55,
      left: 0x8b653a,
      top: 0xcaa36a,
      edge: 0x2a1a0a,
    });
    g.lineStyle(1, 0x2a1a0a, 0.9);
    g.fillStyle(0x5b3820, 1);
    g.fillPoints(wallInsetPoints(geo.right, geo.bottom, 0.39, 0.57, 34), true);
    g.strokePoints(wallInsetPoints(geo.right, geo.bottom, 0.39, 0.57, 34), true);
    g.fillStyle(0x6b4824, 1);
    g.fillPoints(wallInsetPoints(geo.left, geo.bottom, 0.08, 0.22, 58), true);
    g.fillPoints(wallInsetPoints(geo.right, geo.bottom, 0.78, 0.94, 58), true);
    g.strokePoints(wallInsetPoints(geo.left, geo.bottom, 0.08, 0.22, 58), true);
    g.strokePoints(wallInsetPoints(geo.right, geo.bottom, 0.78, 0.94, 58), true);
    g.fillStyle(0xd8bf7a, 1);
    g.fillCircle(geo.leftR.x + 18, geo.leftR.y - 6, 5);
    g.fillCircle(geo.rightR.x - 18, geo.rightR.y - 6, 5);
    g.generateTexture('ch2-caravanserai', geo.texW, geo.texH);
    g.destroy();
  },

  'ch2-shrine': (scene) => {
    const geo = createIsoPrism(1, 1, 36, 18);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0xd0b47a,
      left: 0xa98c5c,
      top: 0x8b6a3a,
      edge: 0x2a1a0a,
    });
    const cx = geo.bottomR.x;
    const cy = (geo.topR.y + geo.bottomR.y) / 2;
    g.lineStyle(1, 0x2a1a0a, 0.9);
    g.fillStyle(0x4a7a82, 1);
    g.fillEllipse(cx, cy - 18, 36, 24);
    g.strokeEllipse(cx, cy - 18, 36, 24);
    g.fillStyle(0x5a3a24, 1);
    g.fillPoints(wallInsetPoints(geo.right, geo.bottom, 0.42, 0.58, 20), true);
    g.fillStyle(0xc9a55c, 1);
    g.fillRect(cx - 1, cy - 46, 2, 13);
    g.fillCircle(cx, cy - 48, 3);
    g.generateTexture('ch2-shrine', geo.texW, geo.texH);
    g.destroy();
  },

  'ch2-milestone': (scene) => {
    const w = 34;
    const h = 48;
    const g = makeTextureGraphics(scene);
    g.lineStyle(1, 0x2a1a0a, 0.9);
    g.fillStyle(0x7a6a4a, 1);
    g.fillRoundedRect(8, 8, 18, 34, 4);
    g.strokeRoundedRect(8, 8, 18, 34, 4);
    g.fillStyle(0xb89968, 1);
    g.fillRect(8, 26, 18, 5);
    g.lineStyle(1, 0x3a2a1a, 0.8);
    g.beginPath();
    g.moveTo(13, 14);
    g.lineTo(22, 20);
    g.moveTo(11, 34);
    g.lineTo(24, 34);
    g.strokePath();
    g.generateTexture('ch2-milestone', w, h);
    g.destroy();
  },

  'ch2-dry-stream': (scene) => {
    const w = 72;
    const h = 28;
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x5c503d, 0.55);
    g.fillEllipse(w / 2, h - 9, 62, 16);
    g.fillStyle(0x8a7a5a, 1);
    g.fillCircle(18, 16, 5);
    g.fillCircle(36, 12, 4);
    g.fillCircle(51, 17, 6);
    g.fillStyle(0xb89968, 1);
    g.fillEllipse(34, 19, 32, 6);
    g.generateTexture('ch2-dry-stream', w, h);
    g.destroy();
  },

  'ch2-tamarisk': (scene) => {
    const w = 50;
    const h = 68;
    const g = makeTextureGraphics(scene);
    g.lineStyle(2, 0x4a2e18, 1);
    g.beginPath();
    g.moveTo(w / 2, h - 7);
    g.lineTo(w / 2 - 4, h - 30);
    g.moveTo(w / 2, h - 13);
    g.lineTo(w / 2 + 11, h - 34);
    g.moveTo(w / 2 - 2, h - 21);
    g.lineTo(w / 2 - 16, h - 38);
    g.strokePath();
    g.fillStyle(0x6f8a58, 1);
    g.fillCircle(w / 2 - 14, h - 39, 11);
    g.fillCircle(w / 2 + 13, h - 35, 12);
    g.fillCircle(w / 2 - 1, h - 48, 13);
    g.fillStyle(0x8ba36b, 0.9);
    g.fillCircle(w / 2 + 3, h - 43, 7);
    g.generateTexture('ch2-tamarisk', w, h);
    g.destroy();
  },
};
