import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 10 — the Tihrán street and the Síyáh-Chál pit. Adds the street
 * facades, the prison architecture, the chains, the dim lamp, and the
 * shaft of light that descends through the cell roof.
 *
 * Note: `closed-door`, `lamp`, and `crowd-shadow` are intentionally not
 * redefined here. The shared registry owns them. The street scene used
 * to wrap them in `makeWatchLamp` etc., but those locals shadowed the
 * Boot-generated textures and never actually rendered, so deleting them
 * is a no-op visually while clarifying ownership.
 */
export const CH10_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch10-chain-coil': (scene) => {
    const g = makeTextureGraphics(scene);
    g.lineStyle(4, 0x202020, 1);
    g.strokeCircle(18, 25, 9);
    g.strokeCircle(31, 25, 9);
    g.lineBetween(10, 34, 42, 17);
    g.lineStyle(1, 0x8a867d, 0.38);
    g.strokeCircle(18, 25, 9);
    g.strokeCircle(31, 25, 9);
    g.generateTexture('ch10-chain-coil', 52, 44);
    g.destroy();
  },

  'ch10-chain-pillar': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x383838, 1);
    g.fillRoundedRect(18, 12, 20, 58, 4);
    g.lineStyle(4, 0x1f1f1f, 1);
    g.lineBetween(8, 34, 48, 22);
    g.lineBetween(8, 48, 48, 36);
    g.lineStyle(1, 0x8a867d, 0.4);
    g.strokeRoundedRect(18, 12, 20, 58, 4);
    g.generateTexture('ch10-chain-pillar', 56, 76);
    g.destroy();
  },

  'ch10-chain-post': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x292929, 1);
    g.fillRoundedRect(16, 10, 18, 54, 4);
    g.lineStyle(4, 0x111111, 1);
    g.strokeCircle(13, 35, 8);
    g.strokeCircle(36, 35, 8);
    g.lineBetween(20, 35, 29, 35);
    g.lineStyle(1, 0x8a867d, 0.35);
    g.strokeRoundedRect(16, 10, 18, 54, 4);
    g.generateTexture('ch10-chain-post', 50, 70);
    g.destroy();
  },

  'ch10-light-shaft': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0xe7d8a6, 0.18);
    g.fillTriangle(32, 0, 8, 96, 56, 96);
    g.fillStyle(0xf2e6b8, 0.24);
    g.fillEllipse(32, 96, 48, 14);
    g.generateTexture('ch10-light-shaft', 64, 104);
    g.destroy();
  },

  'ch10-low-arch': (scene) => {
    const geo = createIsoPrism(4, 1, 46, 12);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x302f2d,
      left: 0x242322,
      top: 0x393736,
      edge: 0x0b0b0a,
    });
    g.fillStyle(0x151413, 1);
    const arch = wallInsetPoints(geo.right, geo.bottom, 0.28, 0.62, 32);
    g.fillPoints(arch, true);
    g.lineStyle(2, 0x0b0b0a, 0.9);
    g.strokePoints(arch, true);
    g.generateTexture('ch10-low-arch', geo.texW, geo.texH);
    g.destroy();
  },

  'ch10-stone-pillar': (scene) => {
    const geo = createIsoPrism(2, 2, 76, 8);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x363534,
      left: 0x242322,
      top: 0x444240,
      edge: 0x0c0c0b,
    });
    g.lineStyle(2, 0x242322, 0.8);
    g.lineBetween(geo.leftR.x + 6, geo.leftR.y + 12, geo.bottomR.x, geo.bottomR.y + 12);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 12, geo.rightR.x - 6, geo.rightR.y + 12);
    g.lineBetween(geo.left.x + 6, geo.left.y - 10, geo.bottom.x, geo.bottom.y - 10);
    g.lineBetween(geo.bottom.x, geo.bottom.y - 10, geo.right.x - 6, geo.right.y - 10);
    g.generateTexture('ch10-stone-pillar', geo.texW, geo.texH);
    g.destroy();
  },

  'ch10-street-house': (scene) => {
    const geo = createIsoPrism(3, 2, 62, 12);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x6b5b49,
      left: 0x4b3f36,
      top: 0x5b4f45,
      edge: 0x1a1512,
    });
    const winL = wallInsetPoints(geo.left, geo.bottom, 0.2, 0.36, 32);
    const winR = wallInsetPoints(geo.right, geo.bottom, 0.56, 0.72, 32);
    g.fillStyle(0x2c241e, 1);
    g.fillPoints(winL, true);
    g.fillPoints(winR, true);
    g.lineStyle(1, 0x1a1512, 0.85);
    g.strokePoints(winL, true);
    g.strokePoints(winR, true);
    g.generateTexture('ch10-street-house', geo.texW, geo.texH);
    g.destroy();
  },

  'ch10-street-arch': (scene) => {
    const geo = createIsoPrism(4, 2, 72, 14);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x5b5048,
      left: 0x463d36,
      top: 0x4e443d,
      edge: 0x171310,
    });
    const arch = wallInsetPoints(geo.right, geo.bottom, 0.36, 0.58, 40);
    g.fillStyle(0x26221f, 1);
    g.fillPoints(arch, true);
    g.lineStyle(2, 0x171310, 0.85);
    g.strokePoints(arch, true);
    g.lineBetween(geo.leftR.x + 10, geo.leftR.y + 10, geo.bottomR.x, geo.bottomR.y + 10);
    g.lineBetween(geo.bottomR.x, geo.bottomR.y + 10, geo.rightR.x - 10, geo.rightR.y + 10);
    g.generateTexture('ch10-street-arch', geo.texW, geo.texH);
    g.destroy();
  },
};
