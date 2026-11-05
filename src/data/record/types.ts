import type { FlagState } from '../../dialogue/types';
import type { ChapterId } from '../chapters';

/**
 * The chronicler's record (docs/design/chronicler.md): questions witnesses
 * disagree on, the accounts the player can hear, and what they write down.
 */

/** How the player came by an account. Fixed by the data, shown beside it. */
export type Provenance = 'saw' | 'told' | 'rumour';

/** The player's judgement when writing. */
export type Confidence = 'sure' | 'likely' | 'unsure';

/** A sentence of game text. Kept as `{ text }` so the localization sync finds it. */
export interface Line { text: string }

export interface Account {
  /** Unique within its claim: 'baqir', 'own'. */
  id: string;
  /** Who gave it, as a dialogue speaker string, or 'You'. */
  speaker: string;
  provenance: Provenance;
  /** The sentence the record holds when this account is chosen, first person, past tense. */
  text: string;
  /** Other accounts of the same claim that bear it out (two agreeing witnesses may be written as sure). */
  agrees?: string[];
  /** Where Nabíl, or a translator's note, supports it. For writers; not shown. */
  source: string;
}

export interface Claim {
  /** 'ch8-grave'. */
  id: string;
  chapter: ChapterId;
  /** The question, as the record page asks it. */
  title: string;
  accounts: Account[];
  /** Written when the player records the disagreement itself. */
  both: Line;
  /** Present only where keeping silent is a real choice. */
  withheld?: Line;
  /** Shown when no account was heard. */
  unheard: Line;
}

/** What the player wrote for one claim: an account id, 'both' or 'withheld'. */
export interface Written {
  choice: string;
  confidence?: Confidence;
}

/** One chapter's day of limited time: a few places of several before nightfall. */
export interface ChapterDay {
  id: string;
  opens: (f: FlagState) => boolean;
  /** Set when the day is over (the night watch). */
  closes: string;
  slots: number;
  places: { id: string; flag: string }[];
}
