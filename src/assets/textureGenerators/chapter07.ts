import Phaser from 'phaser';
import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism } from '../../scenes/isoGeometry';
import type { MapObjectId, TextureGenerator } from '../mapAssetTypes';

/**
 * Chapter 7 — the Conference of Badasht. Adds the two encampment tents,
 * the garden canopy, and the rosebush. Carpet, lamp, and standard tree
 * are intentionally not redefined here: they fall through to the shared
 * registry / generic generators.
 */
function makeTent(
  scene: Parameters<TextureGenerator>[0],
  key: string,
  cloth: number,
  trim: number,
): void {
  const geo = createIsoPrism(3, 2, 0, 58);
  const peak = { x: geo.bottom.x, y: geo.top.y - 48 };
  const g = makeTextureGraphics(scene);
  g.fillStyle(0x000000, 0.2);
  g.fillPoints([geo.top, geo.right, geo.bottom, geo.left], true);
  g.fillStyle(cloth, 1);
  g.fillPoints([geo.left, peak, geo.bottom], true);
  g.fillStyle(Phaser.Display.Color.IntegerToColor(cloth).darken(18).color, 1);
  g.fillPoints([geo.right, peak, geo.bottom], true);
  g.fillStyle(0xead8aa, 1);
  g.fillPoints([
    geo.bottom,
    peak,
    {
      x: geo.bottom.x + (geo.right.x - geo.bottom.x) * 0.28,
      y: geo.bottom.y + (geo.right.y - geo.bottom.y) * 0.28,
    },
  ], true);
  g.fillStyle(0x241d1c, 0.65);
  g.fillPoints([
    geo.bottom,
    { x: geo.bottom.x - 12, y: geo.bottom.y - 30 },
    { x: geo.bottom.x + 12, y: geo.bottom.y - 30 },
  ], true);
  g.lineStyle(3, trim, 1);
  g.strokePoints([geo.left, peak, geo.right, geo.bottom], true);
  g.lineBetween(peak.x, peak.y, geo.bottom.x, geo.bottom.y);
  g.generateTexture(key, geo.texW, geo.texH);
  g.destroy();
}

export const CH07_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  'ch7-tent-reconciliation': (scene) => {
    makeTent(scene, 'ch7-tent-reconciliation', 0x3f4f70, 0xd8b56a);
  },

  'ch7-tent-quddus': (scene) => {
    makeTent(scene, 'ch7-tent-quddus', 0x48613e, 0xc9a55c);
  },

  'ch7-garden-canopy': (scene) => {
    const geo = createIsoPrism(3, 2, 0, 60);
    const peak = { x: geo.bottom.x, y: geo.top.y - 34 };
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x000000, 0.18);
    g.fillPoints([geo.top, geo.right, geo.bottom, geo.left], true);
    g.lineStyle(4, 0x7b5a37, 1);
    g.lineBetween(geo.left.x + 10, geo.left.y - 2, geo.left.x + 10, geo.left.y + 46);
    g.lineBetween(geo.right.x - 10, geo.right.y - 2, geo.right.x - 10, geo.right.y + 46);
    g.fillStyle(0x8d3f42, 1);
    g.fillPoints([geo.left, peak, geo.bottom], true);
    g.fillStyle(0x6f3134, 1);
    g.fillPoints([geo.right, peak, geo.bottom], true);
    g.lineStyle(3, 0xc9a55c, 1);
    g.lineBetween(geo.left.x, geo.left.y, peak.x, peak.y);
    g.lineBetween(peak.x, peak.y, geo.right.x, geo.right.y);
    g.fillStyle(0x4f6f46, 1);
    g.fillPoints([
      { x: geo.bottom.x - 26, y: geo.bottom.y - 18 },
      { x: geo.bottom.x + 18, y: geo.bottom.y - 8 },
      { x: geo.bottom.x + 4, y: geo.bottom.y },
      { x: geo.bottom.x - 38, y: geo.bottom.y - 9 },
    ], true);
    g.generateTexture('ch7-garden-canopy', geo.texW, geo.texH);
    g.destroy();
  },

  'ch7-rosebush': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x3d6a3c, 1);
    g.fillCircle(18, 22, 13);
    g.fillCircle(30, 20, 12);
    g.fillCircle(24, 12, 11);
    g.fillStyle(0xc55c71, 1);
    g.fillCircle(18, 14, 3);
    g.fillCircle(30, 16, 3);
    g.fillCircle(24, 25, 3);
    g.generateTexture('ch7-rosebush', 48, 40);
    g.destroy();
  },
};
