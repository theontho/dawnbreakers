import Phaser from 'phaser';
import { makeCharacterTexture, type CharacterTextureOptions } from '../scenes/characterTexture';
import { createIsoPrism, drawIsoPrismShape, wallInsetPoints } from '../scenes/isoGeometry';
import type { IsoPoint, IsoPrism } from '../scenes/baseMapTypes';
import type { MapObjectDefinition } from './mapAssetTypes';
import { MAP_OBJECTS, TILE_OPTIONS } from './mapAssetDefinitions';
import { CUSTOM_TEXTURE_GENERATORS } from './chapters';

const TILE_W = 64;
const TILE_H = 32;

export function ensureTileTextures(scene: Phaser.Scene): void {
  for (const tile of TILE_OPTIONS) {
    if (!scene.textures.exists(tile.texture)) makeIsoTile(scene, tile.texture, tile.color, tile.edge);
  }
}

export function ensureMapAssetTextures(scene: Phaser.Scene): void {
  for (const def of MAP_OBJECTS) ensureMapAssetTexture(scene, def);
}

export function ensureMapAssetTexture(scene: Phaser.Scene, def: MapObjectDefinition): void {
  if (scene.textures.exists(def.texture)) return;
  const custom = CUSTOM_TEXTURE_GENERATORS[def.id];
  if (custom) {
    custom(scene, def);
    return;
  }
  if (def.character || def.kind === 'character') {
    makeCharacterTexture(scene, def.texture, def.character ?? genericCharacterOptions(def));
    return;
  }
  if (def.kind === 'structure') {
    makeGenericIsoStructureTexture(scene, def);
    return;
  }
  makeGenericPropTexture(scene, def);
}

function genericCharacterOptions(def: MapObjectDefinition): CharacterTextureOptions {
  const styles = ['robe', 'cloak', 'vest', 'uniform', 'sash', 'wrap'] as const;
  const hats = ['none', 'turban', 'cap', 'veil', 'headscarf', 'hood', 'tallHat'] as const;
  const skin = [0xd9c79a, 0xe6c89a, 0xc8b48d, 0xb8916d];
  const hash = stringHash(def.id);
  return {
    body: def.color,
    skin: skin[hash % skin.length]!,
    clothing: {
      style: styles[hash % styles.length]!,
      secondary: lighten(def.color, 18),
      accent: 0xc9a55c,
    },
    hat: {
      style: hats[hash % hats.length]!,
      color: darken(def.color, 18),
    },
    hair: 0x2d1b10,
    shadow: true,
  };
}

function makeIsoTile(scene: Phaser.Scene, key: string, fill: number, edge: number): void {
  const g = scene.add.graphics();
  g.fillStyle(fill, 1);
  g.lineStyle(1, edge, 1);
  g.beginPath();
  g.moveTo(TILE_W / 2, 0);
  g.lineTo(TILE_W, TILE_H / 2);
  g.lineTo(TILE_W / 2, TILE_H);
  g.lineTo(0, TILE_H / 2);
  g.closePath();
  g.fillPath();
  g.strokePath();
  g.generateTexture(key, TILE_W, TILE_H);
  g.destroy();
}

function makeGenericIsoStructureTexture(scene: Phaser.Scene, def: MapObjectDefinition): void {
  const footprint = def.footprint ?? { w: 1, h: 1 };
  const wallH = Math.max(12, 20 + Math.min(Math.max(footprint.w, footprint.h), 5) * 8);
  const geo = isoPrism(footprint.w, footprint.h, wallH, 12);
  const label = def.label.toLowerCase();
  const g = scene.add.graphics();
  drawIsoPrism(g, geo, {
    right: darken(def.color, 24),
    left: darken(def.color, 10),
    top: lighten(def.color, 16),
  });

  if (label.includes('tent') || label.includes('canopy')) {
    g.fillStyle(0xf2ead6, 0.95);
    g.fillPoints([geo.leftR, geo.topR, geo.rightR, geo.bottomR], true);
    g.lineStyle(2, darken(def.color, 18), 0.85);
    g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
  } else if (label.includes('bridge')) {
    g.lineStyle(3, 0x3f2b1a, 1);
    g.lineBetween(geo.leftR.x + 8, geo.leftR.y - 8, geo.bottomR.x - 8, geo.bottomR.y - 8);
    g.lineBetween(geo.topR.x + 8, geo.topR.y - 8, geo.rightR.x - 8, geo.rightR.y - 8);
  } else if (label.includes('gate') || label.includes('arch')) {
    g.fillStyle(0x1a120a, 1);
    g.fillPoints(wallInset(geo.right, geo.bottom, 0.32, 0.68, Math.min(32, wallH - 4)), true);
  } else {
    g.fillStyle(0x2d1b10, 0.75);
    g.fillPoints(wallInset(geo.left, geo.bottom, 0.42, 0.64, Math.min(18, wallH - 8)), true);
    g.fillStyle(0xf3d98a, 0.9);
    g.fillPoints(wallInset(geo.right, geo.bottom, 0.28, 0.44, 10), true);
  }

  g.generateTexture(def.texture, geo.texW, geo.texH);
  g.destroy();
}

function makeGenericPropTexture(scene: Phaser.Scene, def: MapObjectDefinition): void {
  const g = scene.add.graphics();
  const label = def.label.toLowerCase();

  if (label.includes('crate') || label.includes('bundle')) {
    const geo = isoPrism(1, 1, 18, 4);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 16),
      left: darken(def.color, 30),
      top: lighten(def.color, 12),
    });
    g.lineStyle(1, 0x3d2414, 0.9);
    g.lineBetween(geo.topR.x, geo.topR.y, geo.bottomR.x, geo.bottomR.y);
    g.lineBetween(geo.leftR.x, geo.leftR.y, geo.rightR.x, geo.rightR.y);
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('well')) {
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(28, 42, 42, 12);
    g.fillStyle(def.color, 1);
    g.fillEllipse(28, 28, 46, 24);
    g.fillStyle(0x263447, 1);
    g.fillEllipse(28, 27, 30, 14);
    g.lineStyle(3, 0x4f463b, 1);
    g.strokeEllipse(28, 28, 46, 24);
    g.generateTexture(def.texture, 56, 48);
  } else if (label.includes('desk')) {
    const geo = isoPrism(1, 1, 12, 4);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 16),
      left: darken(def.color, 28),
      top: lighten(def.color, 10),
    });
    const paper = [
      { x: geo.topR.x, y: geo.topR.y + 9 },
      { x: geo.topR.x + 13, y: geo.topR.y + 15 },
      { x: geo.topR.x, y: geo.topR.y + 21 },
      { x: geo.topR.x - 13, y: geo.topR.y + 15 },
    ];
    g.fillStyle(0xe6d8b0, 1);
    g.fillPoints(paper, true);
    g.lineStyle(1, 0x1a1a1a, 0.75);
    g.strokePoints(paper, true);
    g.lineBetween(paper[3]!.x + 4, paper[3]!.y + 1, paper[1]!.x - 4, paper[1]!.y + 1);
    g.lineBetween(paper[3]!.x + 6, paper[3]!.y + 5, paper[1]!.x - 6, paper[1]!.y + 5);
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('lamp') || label.includes('light')) {
    g.fillStyle(0xf3d98a, label.includes('light') ? 0.35 : 1);
    g.fillEllipse(20, 16, label.includes('light') ? 30 : 14, label.includes('light') ? 46 : 18);
    g.lineStyle(3, 0x3a2a16, 1);
    g.lineBetween(20, 16, 20, 50);
    g.lineBetween(12, 50, 28, 50);
    g.generateTexture(def.texture, 40, 56);
  } else if (label.includes('tree') || label.includes('shrub') || label.includes('reeds') || label.includes('rose') || label.includes('tamarisk') || label.includes('cypress')) {
    g.fillStyle(0x000000, 0.2);
    g.fillEllipse(24, 48, 34, 8);
    g.fillStyle(0x5b3a24, 1);
    g.fillRect(20, 28, 8, 20);
    g.fillStyle(def.color, 1);
    g.fillEllipse(24, 24, 34, 34);
    g.fillStyle(0xf2ead6, label.includes('snow') ? 0.85 : 0.15);
    g.fillEllipse(18, 16, 18, 12);
    g.generateTexture(def.texture, 48, 54);
  } else if (label.includes('flag')) {
    g.lineStyle(3, 0x5b3a24, 1);
    g.lineBetween(12, 6, 12, 50);
    g.fillStyle(def.color, 1);
    g.fillTriangle(14, 8, 40, 18, 14, 28);
    g.lineStyle(1, 0x3a2a16, 1);
    g.strokeTriangle(14, 8, 40, 18, 14, 28);
    g.generateTexture(def.texture, 44, 54);
  } else if (label.includes('pillar') || label.includes('bars') || label.includes('barred') || label.includes('palisade')) {
    const geo = isoPrism(1, 1, 20, 4);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 14),
      left: darken(def.color, 28),
      top: lighten(def.color, 10),
    });
    g.lineStyle(3, 0x3f2b1a, 1);
    for (const [start, end] of [[geo.left, geo.bottom], [geo.right, geo.bottom]] as const) {
      g.lineBetween(start.x, start.y - 14, end.x, end.y - 14);
      g.lineBetween(start.x, start.y - 6, end.x, end.y - 6);
      for (const t of [0.18, 0.42, 0.66, 0.9]) {
        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t;
        g.lineBetween(x, y + 2, x, y - 26);
      }
    }
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('chain') || label.includes('rope')) {
    const points = [{ x: 23, y: 8 }, { x: 46, y: 20 }, { x: 23, y: 32 }, { x: 0, y: 20 }];
    g.fillStyle(darken(def.color, 18), 0.24);
    g.fillPoints(points, true);
    g.lineStyle(4, def.color, 1);
    g.strokeEllipse(16, 20, 20, 10);
    g.strokeEllipse(30, 20, 20, 10);
    g.strokeEllipse(23, 28, 26, 10);
    g.generateTexture(def.texture, 46, 38);
  } else if (label.includes('arch') || label.includes('door')) {
    const geo = isoPrism(1, 1, label.includes('arch') ? 48 : 42, 12);
    drawIsoPrism(g, geo, {
      right: darken(def.color, 8),
      left: darken(def.color, 22),
      top: lighten(def.color, 10),
      edge: 0x140d09,
    });
    const opening = wallInset(geo.right, geo.bottom, 0.18, 0.82, label.includes('arch') ? 38 : 34);
    g.fillStyle(0x1a120a, 1);
    g.fillPoints(opening, true);
    g.lineStyle(2, 0x140d09, 0.85);
    g.strokePoints(opening, true);
    if (label.includes('door')) {
      g.lineStyle(1, 0xc9a55c, 0.75);
      g.lineBetween(
        (opening[0]!.x + opening[1]!.x) / 2,
        (opening[0]!.y + opening[1]!.y) / 2,
        (opening[2]!.x + opening[3]!.x) / 2,
        (opening[2]!.y + opening[3]!.y) / 2,
      );
      g.fillStyle(0xc9a55c, 1);
      g.fillCircle(opening[1]!.x - 4, opening[1]!.y - 16, 2);
    }
    g.generateTexture(def.texture, geo.texW, geo.texH);
  } else if (label.includes('stream') || label.includes('carpet') || label.includes('rug') || label.includes('space')) {
    const points = [{ x: 28, y: 4 }, { x: 56, y: 18 }, { x: 28, y: 32 }, { x: 0, y: 18 }];
    g.fillStyle(def.color, label.includes('space') ? 0.3 : 0.9);
    g.fillPoints(points, true);
    g.lineStyle(2, 0xf2d18a, 0.8);
    g.strokePoints(points, true);
    g.generateTexture(def.texture, 56, 36);
  } else if (label.includes('crowd') && label.includes('shadow')) {
    g.fillStyle(0x100d0b, 0.3);
    for (let i = 0; i < 7; i++) {
      const x = 8 + (i % 4) * 11;
      const y = 14 + Math.floor(i / 4) * 12;
      g.fillEllipse(x, y, 12, 7);
    }
    g.generateTexture(def.texture, 54, 34);
  } else if (label.includes('crowd')) {
    for (let i = 0; i < 7; i++) {
      const x = 8 + (i % 4) * 11;
      const y = 10 + Math.floor(i / 4) * 14;
      g.fillStyle([0x4a3a2a, 0x6f2236, 0x2f4a5f, 0x8a5a2a][i % 4]!, 1);
      g.fillCircle(x, y, 5);
      g.fillRect(x - 4, y + 5, 8, 12);
    }
    g.generateTexture(def.texture, 54, 42);
  } else {
    g.fillStyle(def.color, 1);
    g.fillPoints([{ x: 24, y: 4 }, { x: 48, y: 16 }, { x: 24, y: 30 }, { x: 0, y: 16 }], true);
    g.fillStyle(darken(def.color, 22), 1);
    g.fillPoints([{ x: 0, y: 16 }, { x: 24, y: 30 }, { x: 24, y: 46 }, { x: 0, y: 32 }], true);
    g.lineStyle(1, 0x2d1b10, 0.8);
    g.strokePoints([{ x: 24, y: 4 }, { x: 48, y: 16 }, { x: 24, y: 46 }, { x: 0, y: 32 }, { x: 0, y: 16 }], true);
    g.generateTexture(def.texture, 48, 48);
  }

  g.destroy();
}

function isoPrism(widthCells: number, heightCells: number, wallH: number, topPad = 0): IsoPrism {
  return createIsoPrism(widthCells, heightCells, wallH, topPad);
}

function wallInset(start: IsoPoint, end: IsoPoint, from: number, to: number, height: number): IsoPoint[] {
  return wallInsetPoints(start, end, from, to, height);
}

function drawIsoPrism(
  g: Phaser.GameObjects.Graphics,
  geo: IsoPrism,
  colors: { right: number; left: number; top: number; edge?: number; alpha?: number },
): void {
  drawIsoPrismShape(g, geo, colors);
}

function stringHash(value: string): number {
  return [...value].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function lighten(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).lighten(amount).color;
}

function darken(color: number, amount: number): number {
  return Phaser.Display.Color.IntegerToColor(color).darken(amount).color;
}
