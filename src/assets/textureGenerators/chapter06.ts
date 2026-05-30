import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 6 — the mountain prisons of Mákú and Chihríq. Adds the two
 * fortresses, the shared mountain rock, the snow shrub, and the barred
 * marker stake.
 *
 * Both fortresses share a base silhouette but use different palettes;
 * the helper below is parameterised to keep them DRY.
 */
function makeFortress(
  scene: Parameters<TextureGenerator>[0],
  key: string,
  wall: number,
  dark: number,
  snow: number,
  variant: 'maku' | 'chihriq',
): void {
  const geo = createIsoPrism(3, 3, variant === 'chihriq' ? 86 : 78, variant === 'chihriq' ? 26 : 24);
  const g = makeTextureGraphics(scene);
  drawIsoPrismShape(g, geo, {
    right: wall,
    left: dark,
    top: variant === 'chihriq' ? 0x1f252d : 0x2d3740,
    edge: variant === 'chihriq' ? 0x11161c : 0x14181c,
  });
  g.lineStyle(2, variant === 'chihriq' ? 0x11161c : 0x14181c, 1);
  g.fillStyle(snow, 1);
  g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
  const snowOffset = variant === 'chihriq' ? 6 : 5;
  g.lineBetween(
    geo.leftR.x + 8,
    geo.leftR.y + snowOffset,
    geo.bottomR.x,
    geo.bottomR.y + snowOffset,
  );
  g.lineBetween(
    geo.bottomR.x,
    geo.bottomR.y + snowOffset,
    geo.rightR.x - 8,
    geo.rightR.y + snowOffset,
  );
  g.fillStyle(dark, 1);
  const towerL = wallInsetPoints(geo.left, geo.bottom,
    variant === 'chihriq' ? 0.1 : 0.12,
    variant === 'chihriq' ? 0.28 : 0.3,
    variant === 'chihriq' ? 94 : 88);
  const towerR = wallInsetPoints(geo.right, geo.bottom,
    variant === 'chihriq' ? 0.66 : 0.68,
    variant === 'chihriq' ? 0.88 : 0.88,
    variant === 'chihriq' ? 98 : 92);
  g.fillPoints(towerL, true);
  g.fillPoints(towerR, true);
  g.strokePoints(towerL, true);
  g.strokePoints(towerR, true);
  g.fillStyle(variant === 'chihriq' ? 0x101418 : 0x13181d, 1);
  g.fillPoints(wallInsetPoints(geo.right, geo.bottom, 0.42, 0.56, variant === 'chihriq' ? 40 : 36), true);
  g.fillPoints(wallInsetPoints(geo.left, geo.bottom,
    variant === 'chihriq' ? 0.43 : 0.44,
    variant === 'chihriq' ? 0.53 : 0.54,
    variant === 'chihriq' ? 18 : 16), true);
  g.fillPoints(wallInsetPoints(geo.right, geo.bottom,
    variant === 'chihriq' ? 0.2 : 0.22,
    variant === 'chihriq' ? 0.3 : 0.32,
    variant === 'chihriq' ? 18 : 16), true);
  if (variant === 'chihriq') {
    g.lineStyle(2, 0xb9c4cc, 0.85);
    const leftBars = wallInsetPoints(geo.left, geo.bottom, 0.43, 0.53, 18);
    g.lineBetween(leftBars[0]!.x + 3, leftBars[0]!.y, leftBars[3]!.x + 3, leftBars[3]!.y);
    g.lineBetween(leftBars[1]!.x - 3, leftBars[1]!.y, leftBars[2]!.x - 3, leftBars[2]!.y);
  }

  g.generateTexture(key, geo.texW, geo.texH);
  g.destroy();
}

export const CH06_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch6-maku-fortress': (scene) => {
    makeFortress(scene, 'ch6-maku-fortress', 0x5d6870, 0x2d3740, 0x9fb0bc, 'maku');
  },

  'ch6-chihriq-fortress': (scene) => {
    makeFortress(scene, 'ch6-chihriq-fortress', 0x4b525b, 0x1f252d, 0xaebbc4, 'chihriq');
  },

  'ch6-rock': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x5b6268, 1);
    g.fillTriangle(6, 34, 18, 8, 31, 34);
    g.fillTriangle(17, 34, 31, 13, 43, 34);
    g.fillStyle(0x9ba9b3, 0.65);
    g.fillEllipse(24, 30, 35, 10);
    g.lineStyle(1, 0x343b42, 1);
    g.strokeTriangle(6, 34, 18, 8, 31, 34);
    g.strokeTriangle(17, 34, 31, 13, 43, 34);
    g.generateTexture('ch6-rock', 48, 38);
    g.destroy();
  },

  'ch6-snow-shrub': (scene) => {
    const g = makeTextureGraphics(scene);
    g.lineStyle(2, 0x3d3328, 1);
    g.lineBetween(24, 34, 16, 18);
    g.lineBetween(24, 34, 25, 14);
    g.lineBetween(24, 34, 34, 20);
    g.fillStyle(0xb8c5cd, 0.9);
    g.fillEllipse(24, 34, 34, 11);
    g.generateTexture('ch6-snow-shrub', 48, 40);
    g.destroy();
  },

  'ch6-barred-marker': (scene) => {
    const geo = createIsoPrism(1, 1, 34, 8);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x2a3038,
      left: 0x1d232a,
      top: 0x3a414a,
      edge: 0x101418,
    });
    const opening = wallInsetPoints(geo.right, geo.bottom, 0.28, 0.62, 22);
    g.fillStyle(0x12161b, 1);
    g.fillPoints(opening, true);
    g.lineStyle(2, 0xb9c4cc, 1);
    g.lineBetween(opening[0]!.x + 4, opening[0]!.y - 1, opening[3]!.x + 4, opening[3]!.y + 1);
    g.lineBetween(opening[1]!.x - 4, opening[1]!.y - 1, opening[2]!.x - 4, opening[2]!.y + 1);
    g.lineStyle(1, 0x101418, 1);
    g.strokePoints(opening, true);
    g.generateTexture('ch6-barred-marker', geo.texW, geo.texH);
    g.destroy();
  },
};
