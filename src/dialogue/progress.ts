import { resetFlags } from './flags';

/**
 * Where the player last stood, so the title screen can offer "Continue".
 * Kept apart from story flags: it is a bookmark, not part of the story.
 */

const KEY = 'dawnbreakers.bookmark.v1';

export interface Bookmark {
  scene: string;
  x: number;
  y: number;
}

export function saveBookmark(bookmark: Bookmark): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(bookmark));
  } catch {
    // Storage unavailable (private mode): Continue simply won't be offered.
  }
}

export function loadBookmark(): Bookmark | undefined {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (isBookmark(parsed)) return parsed;
  } catch {
    // Corrupt or unavailable: treat as no bookmark.
  }
  return undefined;
}

function clearBookmark(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.scene === 'string' && typeof v.x === 'number' && typeof v.y === 'number';
}

/** Forget everything: story flags and the bookmark. */
export function resetStory(): void {
  resetFlags();
  clearBookmark();
}
