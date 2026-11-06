/**
 * Which of the player's stories is being played. Each slot keeps its own
 * story flags and bookmark under its own keys; the first slot's keys are
 * the plain ones (`dawnbreakers.flags.v1`), the others add `.slot2` and so
 * on, so a story begun before there were slots is simply the first.
 */

export const SLOT_COUNT = 3;

const ACTIVE_KEY = 'dawnbreakers.slot';

function storage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function activeSlot(): number {
  const value = Number(storage()?.getItem(ACTIVE_KEY));
  return Number.isInteger(value) && value >= 1 && value <= SLOT_COUNT ? value : 1;
}

export function setActiveSlot(slot: number): void {
  try {
    storage()?.setItem(ACTIVE_KEY, String(slot));
  } catch {
    // Storage unavailable: the first slot is played.
  }
}

/** The storage key for `base` in `slot`. */
export function slotKey(base: string, slot: number = activeSlot()): string {
  return slot === 1 ? base : `${base}.slot${slot}`;
}

export const SLOTS: readonly number[] = Array.from({ length: SLOT_COUNT }, (_, i) => i + 1);
