import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 8 — Mazandaran forest road and Fort Shaykh Ṭabarsí. Adds the
 * shrine glimpse, the larger fort shrine, the wooden palisade, and the
 * truce flag.
 */
export const CH08_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch8-shrine-glimpse': (scene) => {
    const geo = createIsoPrism(2, 2, 44, 24);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x756342,
      left: 0x3b3426,
      top: 0x8d7a57,
      edge: 0x2d261c,
    });
    g.fillStyle(0xb9aa79, 0.9);
    g.fillCircle(geo.bottomR.x, geo.topR.y - 8, 10);
    g.fillStyle(0x1d2d24, 0.8);
    g.fillPoints([
      { x: geo.left.x, y: geo.left.y + 8 },
      { x: geo.right.x, y: geo.right.y + 8 },
      geo.bottom,
      { x: geo.bottom.x, y: geo.bottom.y + 10 },
    ], true);
    g.generateTexture('ch8-shrine-glimpse', geo.texW, geo.texH);
    g.destroy();
  },

  'ch8-shrine': (scene) => {
    const geo = createIsoPrism(3, 3, 56, 24);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x8d7a57,
      left: 0x5b5140,
      top: 0xb8aa78,
      edge: 0x2d261c,
    });
    g.fillStyle(0xb8aa78, 1);
    g.fillCircle(geo.bottomR.x, geo.topR.y - 12, 15);
    const door = wallInsetPoints(geo.right, geo.bottom, 0.42, 0.56, 30);
    g.fillStyle(0x2c251c, 1);
    g.fillPoints(door, true);
    g.lineStyle(3, 0x2d261c, 1);
    g.strokePoints(door, true);
    g.generateTexture('ch8-shrine', geo.texW, geo.texH);
    g.destroy();
  },

  'ch8-palisade': (scene) => {
    const geo = createIsoPrism(1, 1, 20, 4);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x563820,
      left: 0x3a2515,
      top: 0x7a5430,
      edge: 0x2b1c10,
    });
    g.lineStyle(3, 0x2b1c10, 1);
    for (const [start, end] of [[geo.left, geo.bottom], [geo.right, geo.bottom]] as const) {
      g.lineBetween(start.x, start.y - 14, end.x, end.y - 14);
      g.lineBetween(start.x, start.y - 6, end.x, end.y - 6);
      for (const t of [0.18, 0.42, 0.66, 0.9]) {
        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;
        g.lineBetween(x, y + 2, x, y - 26);
      }
    }
    g.generateTexture('ch8-palisade', geo.texW, geo.texH);
    g.destroy();
  },

  'ch8-truce-flag': (scene) => {
    const g = makeTextureGraphics(scene);
    g.lineStyle(4, 0x3b2a16, 1);
    g.lineBetween(22, 8, 22, 58);
    g.fillStyle(0xe8dec1, 1);
    g.fillTriangle(24, 10, 56, 20, 24, 30);
    g.generateTexture('ch8-truce-flag', 64, 64);
    g.destroy();
  },
};
