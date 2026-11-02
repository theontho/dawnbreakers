import Phaser from 'phaser';
import type { Interactable } from './baseMapTypes';

/**
 * Where a tap reaches a person, story object or door on a map. Each one's
 * zone is what the player sees of it (its sprite, or a doorway on the wall),
 * grown to at least `TAP_POINTS` across on screen, the size a fingertip can
 * hit without aiming. A big thing (a tree, a pulpit) is not one great
 * target over its neighbours: its zone stops at half as much again, at its
 * foot, where it meets the ground the player walks to. Phones open a map at
 * `PHONE_ZOOM`, and maps are laid out so no two zones overlap there (the smoke test checks every map in
 * every set of who is present); zoomed out further, where zones may meet, a
 * tap goes to the nearest. Exits are wide strips of ground, not tap items,
 * and keep their own handling.
 */

/** The smallest a tap zone is on screen, in CSS pixels (iOS points). */
export const TAP_POINTS = 44;
/** The zoom phones open maps at (the smallest a map starts at). */
export const PHONE_ZOOM = 0.7;
/** The largest a zone grows for a big thing, as a multiple of the smallest. */
const MOST = 1.5;

/** The zone, in world pixels, for something showing as `area` at camera `zoom`. */
export function tapZone(area: Phaser.Geom.Rectangle, zoom = PHONE_ZOOM): Phaser.Geom.Rectangle {
  const least = TAP_POINTS / zoom;
  const width = Phaser.Math.Clamp(area.width, least, least * MOST);
  const height = Phaser.Math.Clamp(area.height, least, least * MOST);
  // Centred on something small; a tall thing's zone stands on its foot.
  const top = Math.min(area.centerY - height / 2, area.bottom - height + (least - Math.min(area.height, least)) / 2);
  return new Phaser.Geom.Rectangle(area.centerX - width / 2, top, width, height);
}

/** What a tap at world point (`x`, `y`) lands on, if anything: the nearest whose zone holds it. */
export function tapTarget(items: readonly Interactable[], x: number, y: number, zoom: number): Interactable | undefined {
  let best: Interactable | undefined;
  let bestDistance = Infinity;
  for (const item of items) {
    const zone = tapZone(item.area, zoom);
    if (!zone.contains(x, y)) continue;
    const distance = Phaser.Math.Distance.Squared(x, y, zone.centerX, zone.centerY);
    if (distance < bestDistance) {
      best = item;
      bestDistance = distance;
    }
  }
  return best;
}

/** A doorway's area: a column standing on the ground at (`x`, `footY`). */
export function doorwayArea(x: number, footY: number, height: number): Phaser.Geom.Rectangle {
  const width = 28;
  return new Phaser.Geom.Rectangle(x - width / 2, footY - height, width, height);
}
