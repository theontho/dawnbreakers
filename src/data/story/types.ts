import type { FlagState } from '../../dialogue/types';

/**
 * A step the HUD tracker shows until `done` returns true. The tracker shows
 * the first unfinished objective of the current chapter, so list them in
 * story order. `progress` adds an "(n/total)" suffix.
 */
export interface Objective {
  text: string;
  done: (flags: FlagState) => boolean;
  progress?: (flags: FlagState) => { current: number; total: number };
}

/**
 * A journal entry revealed once `flag` is set. When `equals` is given the
 * entry only shows if the flag holds exactly that value, which lets one flag
 * reveal different entries (for example, how a chapter ended).
 */
export interface JournalEntry {
  flag: string;
  equals?: boolean | number | string;
  title: string;
  body: string;
}

export interface ChapterStory {
  objectives: Objective[];
  journal: JournalEntry[];
}
