import type { GlossaryEntry } from './kinds';
import { PEOPLE } from './people';
import { PLACES } from './places';
import { WORDS } from './words';

export type { GlossaryEntry, GlossaryKind } from './kinds';

/**
 * The glossary behind the hover and tap tooltips: words, people and places a
 * player may not know, as they appear in the story's text.
 */
export const GLOSSARY: readonly GlossaryEntry[] = [...WORDS, ...PEOPLE, ...PLACES];
