import { makeTextureGraphics } from '../../scenes/graphicsFactory';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../../scenes/isoGeometry';
import type { TextureGenerator } from '../mapAssetTypes';
import type { MapObjectId } from '../mapAssetTypes';

/**
 * Generators shared across chapters (e.g. an alternative `lamp` look that
 * several scenes used to override). When more than one chapter wants a
 * different look for the same `MapObjectId` we should split the asset id
 * instead of resolving by chapter context here.
 */
export const SHARED_TEXTURE_GENERATORS: Partial<Record<MapObjectId, TextureGenerator>> = {
  // Lamp: warm bazaar lantern — used by Ch1 city, Ch7 camp, Ch9 square.
  // Replaces the default generic-prop "lamp" rendering.
  lamp: (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x3a2818, 1);
    g.fillRect(14, 12, 4, 34);
    g.fillRect(8, 12, 16, 3);
    g.fillStyle(0xc98b3a, 1);
    g.fillCircle(16, 10, 6);
    g.fillStyle(0xf0d890, 0.6);
    g.fillCircle(16, 10, 10);
    g.generateTexture('lamp', 32, 50);
    g.destroy();
  },

  // Rug: bazaar carpet ellipse with gold trim — used by Ch1 city + Ch1 quarter.
  rug: (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x7f3030, 1);
    g.fillEllipse(26, 18, 44, 16);
    g.lineStyle(2, 0xc9a55c, 1);
    g.strokeEllipse(26, 18, 36, 10);
    g.generateTexture('rug', 52, 28);
    g.destroy();
  },

  // Crates: wooden bazaar crates — used by Ch1 city + Ch3 ship.
  crates: (scene) => {
    const g = makeTextureGraphics(scene);
    const points = (cx: number, cy: number) => ({
      topR: { x: cx, y: cy - 8 },
      leftR: { x: cx - 16, y: cy },
      bottomR: { x: cx, y: cy + 8 },
      rightR: { x: cx + 16, y: cy },
    });
    const p = points(24, 24);
    g.fillStyle(0x9b6a3a, 1);
    g.fillPoints([p.topR, p.rightR, p.bottomR, p.leftR], true);
    g.fillStyle(0x7a4f2a, 1);
    g.fillPoints([p.rightR, { x: p.rightR.x, y: p.rightR.y + 14 }, { x: p.bottomR.x, y: p.bottomR.y + 14 }, p.bottomR], true);
    g.fillStyle(0x5f3a20, 1);
    g.fillPoints([p.leftR, { x: p.leftR.x, y: p.leftR.y + 14 }, { x: p.bottomR.x, y: p.bottomR.y + 14 }, p.bottomR], true);
    g.lineStyle(1, 0x3d2414, 0.9);
    g.lineBetween(p.topR.x, p.topR.y, p.bottomR.x, p.bottomR.y);
    g.lineBetween(p.leftR.x, p.leftR.y, p.rightR.x, p.rightR.y);
    g.generateTexture('crates', 48, 38);
    g.destroy();
  },

  // Closed door: arched stone doorway — used by Ch1 quarter, Ch4 return,
  // Ch10 Tehran street. Originally three slightly different per-scene
  // versions; this is Ch4's isoprism look (the most worked).
  'closed-door': (scene) => {
    const geo = createIsoPrism(1, 1, 42, 12);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x6f5636,
      left: 0x534029,
      top: 0x7c6240,
      edge: 0x140d09,
    });
    const door = wallInsetPoints(geo.right, geo.bottom, 0.18, 0.82, 34);
    g.fillStyle(0x2c1d14, 1);
    g.fillPoints(door, true);
    g.lineStyle(2, 0x140d09, 0.8);
    g.strokePoints(door, true);
    g.lineStyle(1, 0xc9a55c, 0.7);
    g.lineBetween(
      (door[0].x + door[1].x) / 2,
      (door[0].y + door[1].y) / 2,
      (door[2].x + door[3].x) / 2,
      (door[2].y + door[3].y) / 2,
    );
    g.fillStyle(0xc9a55c, 1);
    g.fillCircle(door[1].x - 4, door[1].y - 16, 2);
    g.generateTexture('closed-door', geo.texW, geo.texH);
    g.destroy();
  },

  // Crowd: small group of 4 robed listeners — used by Ch4 mosque, Ch4 return.
  crowd: (scene) => {
    const g = makeTextureGraphics(scene);
    const robes = [0x3f3328, 0x6a5030, 0x2f3b44, 0x574027];
    for (let i = 0; i < robes.length; i += 1) {
      const x = 8 + i * 10;
      g.fillStyle(robes[i], 1);
      g.fillRoundedRect(x - 4, 16, 8, 16, 2);
      g.fillStyle(0xd1b37c, 1);
      g.fillCircle(x, 11, 4);
    }
    g.generateTexture('crowd', 48, 34);
    g.destroy();
  },

  // Writing desk: low isoprism with a folded sheet on top — used by
  // Ch5 palace and Ch6 prison.
  'writing-desk': (scene) => {
    const geo = createIsoPrism(1, 1, 12, 4);
    const g = makeTextureGraphics(scene);
    drawIsoPrismShape(g, geo, {
      right: 0x5b4330,
      left: 0x38291d,
      top: 0x7a5a3f,
      edge: 0x2a1a0f,
    });
    const paper = [
      { x: geo.topR.x, y: geo.topR.y + 9 },
      { x: geo.topR.x + 13, y: geo.topR.y + 15 },
      { x: geo.topR.x, y: geo.topR.y + 21 },
      { x: geo.topR.x - 13, y: geo.topR.y + 15 },
    ];
    g.fillStyle(0xd8cfb7, 1);
    g.fillPoints(paper, true);
    g.lineStyle(1, 0x2a1a0f, 1);
    g.strokePoints(paper, true);
    g.lineStyle(1, 0x6f6048, 1);
    g.lineBetween(paper[3].x + 4, paper[3].y + 1, paper[1].x - 4, paper[1].y + 1);
    g.lineBetween(paper[3].x + 6, paper[3].y + 5, paper[1].x - 6, paper[1].y + 5);
    g.generateTexture('writing-desk', geo.texW, geo.texH);
    g.destroy();
  },

  // Cypress: tall conifer — used by Ch2 road, Ch5 palace, Ch9 Tabriz square.
  // Three slightly different versions existed per-scene; this is the fullest
  // (Ch2). If a chapter needs a distinct silhouette later, give it its own id
  // (e.g. `ch9-cypress-burnt`).
  cypress: (scene) => {
    const w = 44;
    const h = 88;
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x4a2e18, 1);
    g.fillRect(w / 2 - 3, h - 30, 6, 24);
    g.fillStyle(0x1f5632, 1);
    g.fillEllipse(w / 2, h - 48, 20, 68);
    g.fillStyle(0x2e7040, 1);
    g.fillEllipse(w / 2 - 4, h - 55, 10, 42);
    g.lineStyle(1, 0x17351f, 0.8);
    g.strokeEllipse(w / 2, h - 48, 20, 68);
    g.generateTexture('cypress', w, h);
    g.destroy();
  },

  // Crowd shadow: pre-rendered shadow blob beneath crowds.
  'crowd-shadow': (scene) => {
    const g = makeTextureGraphics(scene);
    g.fillStyle(0x100d0b, 0.3);
    for (let i = 0; i < 7; i += 1) {
      const x = 8 + (i % 4) * 11;
      const y = 14 + Math.floor(i / 4) * 12;
      g.fillEllipse(x, y, 12, 7);
    }
    g.generateTexture('crowd-shadow', 54, 34);
    g.destroy();
  },
};
