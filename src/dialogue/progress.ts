import { reloadFlags, resetFlags, slotFlags } from './flags';
import { activeSlot, setActiveSlot, slotKey } from './saveSlots';
import type { FlagState } from './types';

/**
 * Where the player last stood, so the title screen can offer "Continue".
 * Kept apart from story flags: it is a bookmark, not part of the story.
 * Each save slot has its own (see `saveSlots.ts`).
 */

const KEY = 'dawnbreakers.bookmark.v1';

export interface Bookmark {
  scene: string;
  x: number;
  y: number;
  /** When it was last written, in ms since the epoch. */
  savedAt?: number;
}

export function saveBookmark(bookmark: Bookmark): void {
  try {
    localStorage.setItem(slotKey(KEY), JSON.stringify({ ...bookmark, savedAt: Date.now() }));
  } catch {
    // Storage unavailable (private mode): Continue simply won't be offered.
  }
}

export function loadBookmark(slot: number = activeSlot()): Bookmark | undefined {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(slotKey(KEY, slot)) ?? 'null');
    if (isBookmark(parsed)) return parsed;
  } catch {
    // Corrupt or unavailable: treat as no bookmark.
  }
  return undefined;
}

function clearBookmark(slot: number): void {
  try {
    localStorage.removeItem(slotKey(KEY, slot));
  } catch {
    // Nothing to clear.
  }
}

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.scene === 'string' && typeof v.x === 'number' && typeof v.y === 'number' &&
    (v.savedAt === undefined || typeof v.savedAt === 'number');
}

/** Forget everything in the story being played: its flags and its bookmark. */
export function resetStory(): void {
  resetFlags();
  clearBookmark(activeSlot());
}

/** Plays `slot` from now on: its flags and bookmark become the story's. */
export function selectStory(slot: number): void {
  setActiveSlot(slot);
  reloadFlags();
}

/** Erases `slot`, whether or not it is the one being played. */
export function eraseStory(slot: number): void {
  const playing = activeSlot();
  selectStory(slot);
  resetStory();
  selectStory(playing);
}

/** What a slot holds, for the list of stories. */
export function storyInSlot(slot: number): { bookmark?: Bookmark; flags: FlagState } {
  return { bookmark: loadBookmark(slot), flags: slotFlags(slot) };
}
