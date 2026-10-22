import Phaser from 'phaser';
import type { DoorSpec } from '../data/maps/types';
import type { FlagState } from '../dialogue/types';
import { makeTextureGraphics } from './graphicsFactory';
import { TILE_H, type Interactable } from './baseMapTypes';

/**
 * Doors into other maps. Each becomes an interactable on the building cell
 * where the door is painted, so the player stands in front of it and presses
 * E (or clicks it). A small golden arch floats over every door so they can
 * be found; it dims while the story keeps the door shut.
 */

const MARK = 'fx-door-mark';
/** Above the building it belongs to, below ghosts and HUD. */
const MARK_DEPTH = 8990;
/** Height of the mark above the door's cell, clear of a person in front of it. */
const MARK_LIFT = 46;

export interface MapDoors {
  readonly interactables: Interactable[];
  /** Re-check which doors the story has opened. */
  refresh(flags: FlagState): void;
}

export function placeMapDoors(
  scene: Phaser.Scene,
  specs: readonly DoorSpec[],
  gridToScreen: (gx: number, gy: number) => { sx: number; sy: number },
  onEnter: (spec: DoorSpec) => void,
  onLocked: () => void,
  flags: FlagState,
): MapDoors {
  ensureMarkTexture(scene);
  let current = flags;
  const isOpen = (spec: DoorSpec) => !spec.requires || spec.requires(current);
  const doors = specs.map(spec => {
    const pos = gridToScreen(spec.gridX, spec.gridY);
    const mark = scene.add.image(pos.sx, pos.sy + TILE_H / 2 - MARK_LIFT, MARK).setOrigin(0.5, 1).setDepth(MARK_DEPTH);
    scene.tweens.add({ targets: mark, y: mark.y - 3, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    const interactable: Interactable = {
      gridX: spec.gridX,
      gridY: spec.gridY,
      prompt: spec.prompt,
      texture: MARK,
      action: () => (isOpen(spec) ? onEnter(spec) : onLocked()),
    };
    return { spec, mark, interactable };
  });

  const handle: MapDoors = {
    interactables: doors.map(d => d.interactable),
    refresh: latest => {
      current = latest;
      for (const door of doors) {
        const open = isOpen(door.spec);
        door.interactable.prompt = open ? door.spec.prompt : (door.spec.lockedLabel ?? door.spec.prompt);
        door.mark.setAlpha(open ? 1 : 0.35);
      }
    },
  };
  handle.refresh(flags);
  return handle;
}

function ensureMarkTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(MARK)) return;
  const g = makeTextureGraphics(scene);
  g.fillStyle(0x1a120a, 0.9);
  g.fillRoundedRect(1, 1, 18, 20, 5);
  g.lineStyle(1.5, 0xf3d98a, 1);
  g.strokeRoundedRect(1, 1, 18, 20, 5);
  // A pointed arch with a lit doorway.
  g.fillStyle(0xf3d98a, 1);
  g.beginPath();
  g.moveTo(6, 17);
  g.lineTo(6, 10);
  g.lineTo(10, 5);
  g.lineTo(14, 10);
  g.lineTo(14, 17);
  g.closePath();
  g.fillPath();
  g.fillStyle(0x1a120a, 1);
  g.fillRect(9, 12, 2, 5);
  g.generateTexture(MARK, 20, 22);
  g.destroy();
}
