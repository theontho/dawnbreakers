import Phaser from 'phaser';
import type { MapObjectDefinition } from '../assets/mapAssetLibrary';
import { TILE_H } from './baseMapTypes';
import { editorGridToScreen, objectFrontCell, tileDiamond } from './mapEditorGeometry';
import type { EditorMap, EditorObjectId, ObjectFootprint } from './mapEditorTypes';

export function renderEditorWorld(
  scene: Phaser.Scene,
  map: EditorMap,
  originX: number,
  originY: number,
  objectById: ReadonlyMap<EditorObjectId, MapObjectDefinition>,
): Phaser.GameObjects.Container {
  const world = scene.add.container(0, 0).setDepth(1);

  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const pos = editorGridToScreen(originX, originY, x, y);
      const tile = scene.add.image(pos.sx, pos.sy, 'tile-' + map.tiles[y][x])
        .setOrigin(0.5, 0.5);
      world.add(tile);
    }
  }

  const overlay = scene.add.graphics();
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (!map.blocked[y][x]) continue;
      const pos = editorGridToScreen(originX, originY, x, y);
      const diamond = tileDiamond(pos.sx, pos.sy);
      overlay.fillStyle(0x7a1f1f, 0.38);
      overlay.fillPoints(diamond, true);
      overlay.lineStyle(2, 0x220909, 0.85);
      overlay.lineBetween(pos.sx - 14, pos.sy - 7, pos.sx + 14, pos.sy + 7);
      overlay.lineBetween(pos.sx + 14, pos.sy - 7, pos.sx - 14, pos.sy + 7);
    }
  }
  world.add(overlay);

  const objectOverlay = scene.add.graphics();
  const sortedObjects = [...map.objects].sort((a, b) => {
    const af = objectFrontCell(a, objectById.get(a.id)?.footprint);
    const bf = objectFrontCell(b, objectById.get(b.id)?.footprint);
    return (af.x + af.y) - (bf.x + bf.y);
  });

  for (const obj of sortedObjects) {
    const def = objectById.get(obj.id);
    if (!def) continue;

    if (def.footprint) {
      objectOverlay.lineStyle(1, def.isometric ? 0x76a56d : 0xb83232, 0.8);
      drawEditorFootprintOutline(objectOverlay, originX, originY, map, obj.x, obj.y, def.footprint);
    }

    const front = objectFrontCell(obj, def.footprint);
    const pos = editorGridToScreen(originX, originY, front.x, front.y);
    const sprite = scene.add.image(pos.sx, pos.sy + TILE_H / 2, def.texture)
      .setOrigin(0.5, 1)
      .setDepth(pos.sy + 1);
    world.add(sprite);
  }
  world.add(objectOverlay);

  return world;
}

export function drawEditorFootprintOutline(
  g: Phaser.GameObjects.Graphics,
  originX: number,
  originY: number,
  map: EditorMap,
  x: number,
  y: number,
  footprint: ObjectFootprint = { w: 1, h: 1 },
): void {
  for (let dy = 0; dy < footprint.h; dy++) {
    for (let dx = 0; dx < footprint.w; dx++) {
      if (!inBounds(map, x + dx, y + dy)) continue;
      const pos = editorGridToScreen(originX, originY, x + dx, y + dy);
      g.strokePoints(tileDiamond(pos.sx, pos.sy), true);
    }
  }
}

function inBounds(map: EditorMap, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < map.width && y < map.height;
}
