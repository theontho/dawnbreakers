import Phaser from 'phaser';
import { TILE_OPTIONS } from '../assets/mapAssetLibrary';
import { makeTextureGraphics } from './graphicsFactory';
import { gridToIsoScreen } from './isoGeometry';
import { TILE_H, TILE_W, type TileKind } from './baseMapTypes';

/**
 * The ground layer of a map, baked once into a single texture.
 *
 * Drawing one image per tile meant hundreds of display-list entries that
 * Phaser had to depth-sort and batch every frame, and every tile looked the
 * same. Here each cell picks one of a few hand-shaded variants from a stable
 * hash, the south-facing rim gets earthen side faces so the map reads as a
 * diorama slab, and the result is stamped into one RenderTexture.
 */

const VARIANTS = 4;
const SLAB_DEPTH = 18;

interface GroundState {
  mapWidth: number;
  mapHeight: number;
  originX: number;
  originY: number;
  map: TileKind[][];
}

export function renderMapGround(scene: Phaser.Scene, state: GroundState): Phaser.GameObjects.RenderTexture {
  ensureGroundTextures(scene);
  const bounds = groundBounds(state);
  const rt = scene.add.renderTexture(bounds.x, bounds.y, bounds.width, bounds.height)
    .setOrigin(0)
    .setDepth(-1000);

  rt.beginDraw();
  for (let y = 0; y < state.mapHeight; y++) {
    for (let x = 0; x < state.mapWidth; x++) {
      const { sx, sy } = gridToIsoScreen(state.originX, state.originY, x, y);
      const kind = state.map[y]![x]!;
      const lx = sx - bounds.x;
      const ly = sy - bounds.y;
      if (y === state.mapHeight - 1) rt.batchDraw(`ground-side-left-${sideKind(kind)}`, lx - TILE_W / 2, ly);
      if (x === state.mapWidth - 1) rt.batchDraw(`ground-side-right-${sideKind(kind)}`, lx, ly);
      rt.batchDraw(`ground-${kind}-${cellHash(x, y) % VARIANTS}`, lx - TILE_W / 2, ly - TILE_H / 2);
    }
  }
  rt.endDraw();
  return rt;
}

function groundBounds(state: GroundState): Phaser.Geom.Rectangle {
  const left = gridToIsoScreen(state.originX, state.originY, 0, state.mapHeight - 1).sx - TILE_W / 2;
  const right = gridToIsoScreen(state.originX, state.originY, state.mapWidth - 1, 0).sx + TILE_W / 2;
  const top = gridToIsoScreen(state.originX, state.originY, 0, 0).sy - TILE_H / 2;
  const bottom = gridToIsoScreen(state.originX, state.originY, state.mapWidth - 1, state.mapHeight - 1).sy
    + TILE_H / 2 + SLAB_DEPTH;
  return new Phaser.Geom.Rectangle(Math.floor(left), Math.floor(top), Math.ceil(right - left), Math.ceil(bottom - top));
}

/** Side faces only distinguish wet from dry ground. */
function sideKind(kind: TileKind): 'water' | 'earth' {
  return kind === 'water' ? 'water' : 'earth';
}

function cellHash(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function ensureGroundTextures(scene: Phaser.Scene): void {
  if (scene.textures.exists('ground-side-left-earth')) return;
  for (const tile of TILE_OPTIONS) {
    for (let v = 0; v < VARIANTS; v++) makeGroundTile(scene, tile.kind, tile.color, tile.edge, v);
  }
  makeSideFace(scene, 'left', 'earth', 0x4a3826);
  makeSideFace(scene, 'right', 'earth', 0x3a2b1d);
  makeSideFace(scene, 'left', 'water', 0x1d3550);
  makeSideFace(scene, 'right', 'water', 0x15283e);
}

function makeGroundTile(scene: Phaser.Scene, kind: TileKind, color: number, edge: number, variant: number): void {
  const g = makeTextureGraphics(scene);
  const shade = [0, 6, -5, 3][variant]!;
  const base = shiftColor(color, shade);
  const diamond = [
    new Phaser.Math.Vector2(TILE_W / 2, 0),
    new Phaser.Math.Vector2(TILE_W, TILE_H / 2),
    new Phaser.Math.Vector2(TILE_W / 2, TILE_H),
    new Phaser.Math.Vector2(0, TILE_H / 2),
  ];
  g.fillStyle(base, 1);
  g.fillPoints(diamond, true);
  // Soft top-left light, bottom-right shade: reads as gentle relief.
  g.fillStyle(0xffffff, 0.05);
  g.fillTriangle(TILE_W / 2, 0, 0, TILE_H / 2, TILE_W / 2, TILE_H / 2);
  g.fillStyle(0x000000, 0.06);
  g.fillTriangle(TILE_W / 2, TILE_H, TILE_W, TILE_H / 2, TILE_W / 2, TILE_H / 2);
  drawTileDetail(g, kind, base, variant);
  g.lineStyle(1, edge, 0.55);
  g.strokePoints(diamond, true);
  g.generateTexture(`ground-${kind}-${variant}`, TILE_W, TILE_H);
  g.destroy();
}

function drawTileDetail(g: Phaser.GameObjects.Graphics, kind: TileKind, base: number, variant: number): void {
  const rand = mulberry(variant * 7919 + kind.length * 31);
  const point = (): { x: number; y: number } => {
    // Uniform point inside the diamond, kept away from the rim.
    const u = rand() * 0.8 + 0.1;
    const v = rand() * 0.8 + 0.1;
    return { x: (u - v) * TILE_W / 2 + TILE_W / 2, y: (u + v) * TILE_H / 2 };
  };
  switch (kind) {
    case 'grass':
      for (let i = 0; i < 7; i++) {
        const p = point();
        g.lineStyle(1, shiftColor(base, rand() > 0.5 ? 22 : -18), 0.8);
        g.lineBetween(p.x, p.y, p.x - 1, p.y - 3);
        g.lineBetween(p.x, p.y, p.x + 1.5, p.y - 2.5);
      }
      if (variant === 1) {
        const p = point();
        g.fillStyle(0xe8d27a, 0.8);
        g.fillCircle(p.x, p.y - 1, 1.2);
      }
      break;
    case 'path':
    case 'sand':
      for (let i = 0; i < 6; i++) {
        const p = point();
        g.fillStyle(shiftColor(base, rand() > 0.5 ? 14 : -16), 0.75);
        g.fillEllipse(p.x, p.y, 2 + rand() * 2.5, 1 + rand() * 1.2);
      }
      break;
    case 'stone': {
      g.lineStyle(1, shiftColor(base, -20), 0.6);
      const off = (variant - 1.5) * 3;
      g.lineBetween(TILE_W * 0.25 + off, TILE_H * 0.25, TILE_W * 0.75 + off, TILE_H * 0.75);
      g.lineBetween(TILE_W * 0.75, TILE_H * 0.25 - off / 2, TILE_W * 0.25, TILE_H * 0.75 - off / 2);
      g.fillStyle(shiftColor(base, 12), 0.35);
      const p = point();
      g.fillEllipse(p.x, p.y, 6, 2.5);
      break;
    }
    case 'water':
      g.lineStyle(1, shiftColor(base, 30), 0.45);
      for (let i = 0; i < 2; i++) {
        const p = point();
        g.lineBetween(p.x - 5, p.y, p.x + 5, p.y);
      }
      break;
  }
}

function makeSideFace(scene: Phaser.Scene, side: 'left' | 'right', kind: 'earth' | 'water', color: number): void {
  const g = makeTextureGraphics(scene);
  const w = TILE_W / 2;
  const h = TILE_H / 2 + SLAB_DEPTH;
  const pts = side === 'left'
    ? [{ x: 0, y: 0 }, { x: w, y: TILE_H / 2 }, { x: w, y: TILE_H / 2 + SLAB_DEPTH }, { x: 0, y: SLAB_DEPTH }]
    : [{ x: 0, y: TILE_H / 2 }, { x: w, y: 0 }, { x: w, y: SLAB_DEPTH }, { x: 0, y: TILE_H / 2 + SLAB_DEPTH }];
  g.fillStyle(color, 1);
  g.fillPoints(pts, true);
  // Strata lines give the cut earth some texture.
  g.lineStyle(1, shiftColor(color, -14), 0.7);
  for (const t of [0.4, 0.75]) {
    const y0 = pts[0]!.y + SLAB_DEPTH * t;
    const y1 = pts[1]!.y + SLAB_DEPTH * t;
    g.lineBetween(pts[0]!.x, y0, pts[1]!.x, y1);
  }
  g.lineStyle(1, shiftColor(color, 26), kind === 'water' ? 0.5 : 0.35);
  g.lineBetween(pts[0]!.x, pts[0]!.y, pts[1]!.x, pts[1]!.y);
  g.generateTexture(`ground-side-${side}-${kind}`, w, h);
  g.destroy();
}

function shiftColor(color: number, amount: number): number {
  const c = Phaser.Display.Color.IntegerToColor(color);
  return amount >= 0 ? c.lighten(amount).color : c.darken(-amount).color;
}

function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
