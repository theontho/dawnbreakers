import Phaser from 'phaser';
import type { MapCompanion, MapRemark } from '../data/maps/types';
import { applyEffect, getFlags } from '../dialogue/flags';
import type { FlagState } from '../dialogue/types';
import { RemarkCaption } from '../ui/remarkCaption';
import { TILE_H } from './baseMapTypes';

/** Above the world and its ghosts, under the HUD's prompts. */
const CAPTION_DEPTH = 9990;
const DEFAULT_RADIUS = 3;
export const COMPANION_NAME = 'companion';

/** The flag a remark is remembered under once heard. */
export function remarkFlag(mapKey: string, id: string): string {
  return `remark_${mapKey}_${id}`;
}

export interface MapRemarks {
  /** The player has stepped onto `x, y`: the companion follows, and any remark in reach is said. */
  step(x: number, y: number): void;
  /** The story moved on: the companion may have joined or left. */
  refresh(flags: FlagState): void;
}

/**
 * Talk while moving: a map's remarks, said in a caption as the player
 * passes their places without stopping them, and its companion, who walks a
 * step behind (into the cell the player has just left, which is always
 * walkable) and is drawn in the world like anyone else.
 */
export function setupMapRemarks(
  scene: Phaser.Scene,
  mapKey: string,
  remarks: readonly MapRemark[],
  companion: MapCompanion | undefined,
  start: { x: number; y: number },
  gridToScreen: (gx: number, gy: number) => { sx: number; sy: number },
  captionBottom: () => number,
): MapRemarks {
  const caption = remarks.length > 0 ? new RemarkCaption(scene, captionBottom, CAPTION_DEPTH) : undefined;
  let last = { ...start };
  const place = (sprite: Phaser.GameObjects.Image, x: number, y: number, ms: number): void => {
    const pos = gridToScreen(x, y);
    const to = { x: pos.sx, y: pos.sy + TILE_H / 2 };
    if (ms <= 0) {
      sprite.setPosition(to.x, to.y).setDepth(to.y + 1);
      return;
    }
    scene.tweens.add({
      targets: sprite, x: to.x, y: to.y, duration: ms, ease: 'Sine.easeInOut',
      onUpdate: () => sprite.setDepth(sprite.y + 1),
    });
  };
  const follower = companion
    // Named so the smoke test's cover check passes over it, as it does the player.
    ? scene.add.image(0, 0, companion.texture).setOrigin(0.5, 1).setName(COMPANION_NAME)
    : undefined;
  // It starts where the player does and steps off behind them with the first step.
  if (follower) place(follower, start.x, start.y, 0);
  const sayInReach = (x: number, y: number): void => {
    // Said after whatever is being said now, so a remark passed mid-sentence is not lost.
    if (!caption) return;
    const flags = getFlags();
    const remark = remarks.find(r => !flags[remarkFlag(mapKey, r.id)]
      && Math.max(Math.abs(r.gridX - x), Math.abs(r.gridY - y)) <= (r.radius ?? DEFAULT_RADIUS)
      && (!r.requires || r.requires(flags)));
    if (!remark) return;
    applyEffect({ set: { ...remark.effect?.set, [remarkFlag(mapKey, remark.id)]: true } });
    caption.say(remark.lines);
  };
  const handle: MapRemarks = {
    step: (x, y) => {
      if (follower?.visible) place(follower, last.x, last.y, 110);
      last = { x, y };
      sayInReach(x, y);
    },
    refresh: flags => {
      if (!follower || !companion) return;
      const here = !companion.present || companion.present(flags);
      if (here && !follower.visible) place(follower, last.x, last.y, 0);
      follower.setVisible(here);
    },
  };
  handle.refresh(getFlags());
  sayInReach(start.x, start.y);
  return handle;
}
