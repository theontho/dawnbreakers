import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, wallInsetPoints } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 9 — Tabríz square and the barrack roof. The square's `cypress`,
 * `lamp`, and `crowd-shadow` keys live in the shared registry; this file
 * only adds Ch9-specific assets: the bundle, the barrack front, the rope
 * coils, the empty space marker, and the parametric roof parapet.
 *
 * The roof parapet is reused at five different sizes (north wall, east
 * wall, two south wall sections, and the central parapet); each is its
 * own MapObjectId so the dimensions and texture key stay paired.
 */
function makeRoofParapet(
  scene: Parameters<TextureGenerator>[0],
  key: string,
  widthCells: number,
  heightCells: number,
  wallH: number,
): void {
  const geo = createIsoPrism(widthCells, heightCells, wallH, 8);
  const g = makeTextureGraphics(scene);
  g.lineStyle(2, 0x1f1a16, 0.85);

  g.fillStyle(0x5e574d, 1);
  g.fillPoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);
  g.strokePoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);

  g.fillStyle(0x484139, 1);
  g.fillPoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);
  g.strokePoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);

  g.fillStyle(0x403a33, 1);
  g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
  g.strokePoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
  g.lineStyle(1, 0x2d2823, 0.7);
  g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
  g.lineBetween(geo.leftR.x, geo.leftR.y, geo.rightR.x, geo.rightR.y);

  g.generateTexture(key, geo.texW, geo.texH);
  g.destroy();
}

export const CH09_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch9-cloth-bundle': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x1d1712, 0.25);
    g.fillEllipse(26, 38, 38, 12);
    g.fillStyle(0x4d3a31, 1);
    g.fillPoints([
      { x: 8, y: 27 }, { x: 26, y: 36 }, { x: 44, y: 27 },
      { x: 44, y: 35 }, { x: 26, y: 44 }, { x: 8, y: 35 },
    ], true);
    g.fillStyle(0x7b604e, 1);
    g.fillPoints([
      { x: 26, y: 14 }, { x: 48, y: 27 }, { x: 26, y: 39 }, { x: 4, y: 27 },
    ], true);
    g.lineStyle(1, 0x2b211b, 0.8);
    g.strokePoints([
      { x: 26, y: 14 }, { x: 48, y: 27 }, { x: 26, y: 39 }, { x: 4, y: 27 },
    ], true);
    g.lineBetween(8, 27, 44, 27);
    g.lineBetween(18, 20, 36, 34);
    g.generateTexture('ch9-cloth-bundle', 52, 46);
    g.destroy();
  },

  'ch9-barrack-front': (scene) => {
    const geo = createIsoPrism(3, 2, 76, 18);
    const g = makeTextureGraphics(scene);
    g.lineStyle(2, 0x1d1712, 0.85);

    g.fillStyle(0x766a5a, 1);
    g.fillPoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);
    g.strokePoints([geo.right, geo.bottom, geo.bottomR, geo.rightR], true);

    g.fillStyle(0x5b5045, 1);
    g.fillPoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.left, geo.bottom, geo.bottomR, geo.leftR], true);

    g.fillStyle(0x4f473d, 1);
    g.fillPoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.strokePoints([geo.topR, geo.rightR, geo.bottomR, geo.leftR], true);
    g.lineStyle(1, 0x2a241f, 0.7);
    g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
    g.lineBetween(geo.leftR.x, geo.leftR.y, geo.rightR.x, geo.rightR.y);

    g.lineStyle(1, 0x1d1712, 0.9);
    const win1 = wallInsetPoints(geo.right, geo.bottom, 0.35, 0.5, 42);
    const win2 = wallInsetPoints(geo.right, geo.bottom, 0.68, 0.82, 30);
    const win3 = wallInsetPoints(geo.left, geo.bottom, 0.2, 0.34, 28);
    g.fillStyle(0x2b2622, 1);
    g.fillPoints(win1, true);
    g.fillPoints(win2, true);
    g.fillStyle(0x24201d, 1);
    g.fillPoints(win3, true);
    g.strokePoints(win1, true);
    g.strokePoints(win2, true);
    g.strokePoints(win3, true);

    g.generateTexture('ch9-barrack-front', geo.texW, geo.texH);
    g.destroy();
  },

  'ch9-rope-coils': (scene) => {
    const g = makeTextureGraphics(scene);
    g.lineStyle(3, 0xbca06d, 1);
    g.strokeEllipse(19, 25, 22, 10);
    g.strokeEllipse(32, 27, 20, 9);
    g.lineBetween(10, 34, 42, 18);
    g.lineBetween(14, 29, 44, 24);
    g.lineStyle(1, 0x5a4630, 0.8);
    g.strokeEllipse(19, 25, 22, 10);
    g.strokeEllipse(32, 27, 20, 9);
    g.generateTexture('ch9-rope-coils', 52, 44);
    g.destroy();
  },

  'ch9-empty-space': (scene) => {
    const g = makeTextureGraphics(scene);
    const diamond = [
      { x: 32, y: 10 }, { x: 58, y: 22 }, { x: 32, y: 34 }, { x: 6, y: 22 },
    ];
    g.fillStyle(0x1b1714, 0.28);
    g.fillPoints(diamond, true);
    g.lineStyle(1, 0x2b2622, 0.45);
    g.strokePoints(diamond, true);
    g.lineBetween(14, 22, 50, 22);
    g.lineBetween(32, 12, 32, 32);
    g.generateTexture('ch9-empty-space', 64, 40);
    g.destroy();
  },

  'ch9-roof-parapet': (scene) => makeRoofParapet(scene, 'ch9-roof-parapet', 4, 1, 30),
  'ch9-roof-north-wall': (scene) => makeRoofParapet(scene, 'ch9-roof-north-wall', 14, 1, 24),
  'ch9-roof-east-wall': (scene) => makeRoofParapet(scene, 'ch9-roof-east-wall', 1, 8, 24),
  'ch9-roof-south-wall-left': (scene) =>
    makeRoofParapet(scene, 'ch9-roof-south-wall-left', 5, 1, 24),
  'ch9-roof-south-wall-right': (scene) =>
    makeRoofParapet(scene, 'ch9-roof-south-wall-right', 7, 1, 24),
};
